import os
import csv
import json
import time
import asyncio
import warnings
from dotenv import load_dotenv
import pyTigerGraph as tg
import replicate

warnings.filterwarnings("ignore")
load_dotenv()

# 1. Connect directly to TigerGraph Cloud
conn = tg.TigerGraphConnection(
    host=os.getenv("TG_HOST"),
    graphname=os.getenv("TG_GRAPHNAME"),
    gsqlSecret=os.getenv("TG_SECRET")
)
conn.getToken(os.getenv("TG_SECRET"))

os.makedirs("cases", exist_ok=True)

def fetch_graph_evidence(txn_id, customer_id):
    """Pulls connected neighborhood directly from TigerGraph."""
    evidence = {}
    try:
        txn_data = conn.getVerticesById("Transaction", txn_id)
        evidence["transaction"] = txn_data[0]["attributes"] if txn_data else {}
        
        evidence["transaction_edges"] = conn.getVertexEdges("Transaction", txn_id)
        
        cust_edges = conn.getVertexEdges("Customer", customer_id)
        evidence["customer_edges"] = cust_edges[:5]
        
        prior_cases = [e["to_id"] for e in cust_edges if "case" in e.get("e_type", "").lower()]
        case_records = []
        for c_id in prior_cases[:3]:
            c_data = conn.getVerticesById("CaseRecord", c_id)
            if c_data:
                case_records.append(c_data[0]["attributes"])
        evidence["prior_cases"] = case_records
    except Exception as e:
        evidence["error"] = str(e)
    return evidence

def build_system_prompt():
    return """
You are a Tier 2 Fraud Investigation Agent operating under the bank's Fraud Policy.
Evaluate the provided graph evidence, customer trigger, and prior closed cases.
If the signal is ambiguous and fraud probability is between 0.30 and 0.70, simulate step-up authentication / customer validation.

You MUST output a single valid JSON object following this EXACT schema:
{
  "case_id": "<case_id>",
  "case": {
    "status": "closed_fraud" | "closed_legitimate" | "escalated",
    "verdict": "fraud" | "legitimate" | "uncertain",
    "fraud_probability": 0.00,
    "pattern": "card_testing" | "card_not_present_fraud" | "card_not_present_new_device" | "out_of_region_use" | "account_takeover" | "undocumented" | "none",
    "pattern_description": "",
    "affected_txn_ids": ["<txn_id>"],
    "first_suspicious_txn_id": "<txn_id>",
    "connected_card_ids": ["<card_id>"],
    "connected_device_profiles": [],
    "exposure_usd": 0.00,
    "evidence": [
      {"claim": "<string>", "source": "graph" | "customer", "ref": "<query/field>", "entity_ids": ["<ids>"]}
    ],
    "similar_prior_cases": ["<case_ids>"],
    "summary": "<2-4 sentences>",
    "written_to_graph": true,
    "graph_case_id": "<case_id>"
  },
  "evidence_requests": [
    {"type": "customer_validation", "asked_after_step": 1, "assumed_response": "<response>"}
  ],
  "next_best_actions": {
    "initial": [{"action": "<ACTION>", "route": "auto" | "L1" | "L2", "reason": "<rule>"}],
    "final": [{"action": "<ACTION>", "route": "auto" | "L1" | "L2", "reason": "<rule>"}],
    "what_changed": "<explanation>"
  },
  "sar": {
    "file": true | false,
    "reason": "<policy rule or empty>",
    "narrative": "<6-12 sentences if file is true, else empty>",
    "subjects": ["<customer/card/device IDs>"],
    "total_amount_usd": 0.00,
    "activity_dates": ["YYYY-MM-DD", "YYYY-MM-DD"]
  },
  "stop_reason": "<defensible reason>",
  "tool_calls": 3,
  "tokens": 1500,
  "latency_s": 1.5
}
Output raw JSON only.
"""

async def process_cases():
    with open("case_pack.csv", "r", encoding="utf-8") as f:
        cases = list(csv.DictReader(f))

    print(f"Loaded {len(cases)} cases. Processing with Gemini 3 Flash via Replicate...\n")

    for idx, row in enumerate(cases):
        case_id = row["case_id"]
        txn_id = row["flagged_txn_id"]
        customer_id = row["customer_id"]
        
        target_path = f"cases/{case_id}.json"
        if os.path.exists(target_path):
            print(f"[{idx+1}/{len(cases)}] {case_id} already exists. Skipping.")
            continue

        print(f"[{idx+1}/{len(cases)}] Investigating {case_id} (Txn: {txn_id})...")
        start_time = time.time()
        
        graph_data = fetch_graph_evidence(txn_id, customer_id)
        
        user_prompt = f"""
Case Details:
- Case ID: {case_id}
- Trigger: {row['trigger_type']} - {row['trigger_text']}
- Flagged Txn: {txn_id}
- Card ID: {row['card_id']}
- Customer ID: {customer_id}
- Risk Score: {row.get('risk_score', 'N/A')}

Retrieved Graph Evidence:
{json.dumps(graph_data, default=str)}
"""

        try:
            # Note the use of 'system_instruction' for Google models on Replicate
            output = replicate.run(
                "google/gemini-3-flash",
                input={
                    "prompt": user_prompt,
                    "system_instruction": build_system_prompt(),
                    "temperature": 0.1
                }
            )

            # Replicate yields strings; join them and clean markdown wrapping
            raw_text = "".join(output).strip("` \n").removeprefix("json").strip()
            
            try:
                parsed = json.loads(raw_text)
                parsed["latency_s"] = round(time.time() - start_time, 2)
                raw_text = json.dumps(parsed, indent=2)
            except json.JSONDecodeError:
                pass

            with open(target_path, "w", encoding="utf-8") as out:
                out.write(raw_text)

            print(f"  Saved -> {target_path} in {round(time.time() - start_time, 2)}s")
            
            # Brief pause to respect API request limits
            await asyncio.sleep(1.0)
            
        except Exception as e:
            print(f"  Error processing {case_id}: {e}")

if __name__ == "__main__":
    asyncio.run(process_cases())