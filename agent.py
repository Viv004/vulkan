import os
import sys
import shutil
import asyncio
import csv
import json
import warnings
from dotenv import load_dotenv
import replicate
from mcp import ClientSession, StdioServerParameters
from mcp.client.stdio import stdio_client

warnings.filterwarnings("ignore")
load_dotenv()

os.makedirs("cases", exist_ok=True)

tools_schema = [
    {
        "type": "function",
        "function": {
            "name": "get_node",
            "description": "Retrieves properties of a vertex (Transaction, Customer, Card, DeviceProfile, CaseRecord).",
            "parameters": {
                "type": "object",
                "properties": {
                    "vertex_type": {"type": "string"},
                    "vertex_id": {"type": "string"}
                },
                "required": ["vertex_type", "vertex_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "get_node_edges",
            "description": "Retrieves connected edges and neighboring vertices. Do not call on supernodes like BillingRegion.",
            "parameters": {
                "type": "object",
                "properties": {
                    "vertex_type": {"type": "string"},
                    "vertex_id": {"type": "string"}
                },
                "required": ["vertex_type", "vertex_id"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "request_customer_validation",
            "description": "Sends SMS authentication to customer to confirm suspicious transaction.",
            "parameters": {
                "type": "object",
                "properties": {
                    "customer_id": {"type": "string"},
                    "amount": {"type": "number"}
                },
                "required": ["customer_id", "amount"]
            }
        }
    },
    {
        "type": "function",
        "function": {
            "name": "update_case_memory",
            "description": "Commits investigation verdict and action into graph case memory.",
            "parameters": {
                "type": "object",
                "properties": {
                    "case_id": {"type": "string"},
                    "verdict": {"type": "string"},
                    "recommended_action": {"type": "string"}
                },
                "required": ["case_id", "verdict", "recommended_action"]
            }
        }
    }
]

async def run_fraud_agent():
    mcp_path = shutil.which("tigergraph-mcp")
    if not mcp_path:
        mcp_path = os.path.join(os.path.dirname(sys.executable), "Scripts", "tigergraph-mcp.exe")

    server_params = StdioServerParameters(command=mcp_path, args=[], env=os.environ.copy())

    async with stdio_client(server_params) as (read, write):
        async with ClientSession(read, write) as session:
            await session.initialize()
            print("Connected to TigerGraph MCP. Initializing Autonomous Agent (Gemini 3 Flash via Replicate)...\n")

            async def execute_tool(name, args):
                if name == "get_node":
                    print(f"  [Tool Call: Graph Read] {args['vertex_type']} {args['vertex_id']}")
                    res = await session.call_tool("tigergraph__get_node", arguments=args)
                    return res.content[0].text
                elif name == "get_node_edges":
                    print(f"  [Tool Call: Graph Traversal] Edges for {args['vertex_type']} {args['vertex_id']}")
                    res = await session.call_tool("tigergraph__get_node_edges", arguments=args)
                    return res.content[0].text
                elif name == "request_customer_validation":
                    print(f"  [Tool Call: Step-Up Auth] SMS to {args['customer_id']} for ${args['amount']}")
                    return "Customer responded: NO, I did not make this purchase. My card was stolen."
                elif name == "update_case_memory":
                    print(f"  [Tool Call: Memory Write] Committing {args['case_id']} to graph memory")
                    return "Success: Record stored in graph memory."
                return "Unknown tool"

            with open("case_pack.csv", "r", encoding="utf-8") as f:
                cases = list(csv.DictReader(f))

            system_instruction = f"""You are a Tier 2 Fraud Investigation Agent. 
Investigate alerts by querying the graph. Check the flagged Transaction, Customer, and prior CaseRecords.
If evidence is ambiguous, request customer validation. Always update case memory before finalizing.

You have access to the following tools:
{json.dumps(tools_schema, indent=2)}

To use a tool, output ONLY a valid JSON object in this exact format (no markdown formatting, no other text):
{{"tool_call": {{"name": "tool_name", "arguments": {{"arg1": "value"}}}}}}

If no more tools are needed, evaluate the evidence and output the final valid raw JSON following the official 3-part schema (case, next_best_actions, sar)."""

            target_case = cases[0]
            case_id = target_case["case_id"]
            txn_id = target_case["flagged_txn_id"]
            
            print(f"========================================")
            print(f"Investigating Case: {case_id} (Txn: {txn_id})")
            print(f"========================================")

            conversation_history = f"Investigate Case {case_id} for flagged transaction {txn_id}. Trigger: {target_case['trigger_text']}"

            while True:
                # Replicate requires 'system_instruction' for Google models
                output = replicate.run(
                    "google/gemini-3-flash",
                    input={
                        "prompt": conversation_history,
                        "system_instruction": system_instruction,
                        "temperature": 0.1
                    }
                )
                
                # Replicate returns an iterator for streaming text
                response_text = "".join(output).strip("` \n").removeprefix("json").strip()
                
                is_tool_call = False
                if response_text.startswith("{") and "tool_call" in response_text:
                    try:
                        parsed_response = json.loads(response_text)
                        if "tool_call" in parsed_response:
                            is_tool_call = True
                            tool_name = parsed_response["tool_call"]["name"]
                            tool_args = parsed_response["tool_call"]["arguments"]
                            
                            tool_result = await execute_tool(tool_name, tool_args)
                            
                            conversation_history += f"\n\nAgent Action: Called {tool_name} with {tool_args}\nTool Result: {tool_result}\n\nWhat is your next step?"
                    except json.JSONDecodeError:
                        pass
                
                if not is_tool_call:
                    with open(f"cases/{case_id}.json", "w", encoding="utf-8") as out:
                        out.write(response_text)
                    print(f"\nFinal Verdict Recorded -> cases/{case_id}.json")
                    break

if __name__ == "__main__":
    asyncio.run(run_fraud_agent())