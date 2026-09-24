# VULKAN // AGENTIC GRAPHRAG

**Autonomous Tier 2 Fraud Investigation Agent**

Built for Hacker House Goa 2026 (IEEE-CIS Fraud Detection Benchmark)

### 🔗 Official Submission Links

* **🔴 Live Dashboard & Technical Blog:** `[INSERT VERCEL URL HERE]`
* **▶️ Agent Demo Video:** `[INSERT YOUTUBE/LOOM URL HERE]`
* **📊 Benchmark Artifacts:** The 20 graded JSON case files are located in `public/cases/`.

---

## 01. What We Built

Vulkan is a Tier 2 autonomous fraud investigation system designed to eliminate analyst fatigue and false positives. Instead of relying on traditional vector embeddings—which fail to understand structural fraud patterns like shared device footprints or coordinated card-testing bursts—Vulkan relies on **Zero-Abstraction Agentic GraphRAG**.

The system operates in two modes:

1. **`batch_runner.py`:** A high-throughput pipeline that successfully investigated all 20 exam cases, generated FinCEN-grade SAR narratives, and wrote strictly compliant 3-part JSON artifacts under API rate limits.
2. **`agent.py`:** A live autonomous agent that connects directly to the TigerGraph database via the **Model Context Protocol (MCP)** to traverse entities, dynamically request step-up authentication, and execute policy-driven next best actions.
3. **The Frontend:** A Neo-Brutalist, tactile investigation dashboard built in React Native (Expo) to visualize the agent's real-time decision matrix.

---

## 02. The Architecture

Vulkan avoids heavy multi-agent abstraction frameworks in favor of native MCP tool orchestration and direct graph queries.

* **Data Layer:** TigerGraph Cloud (590k+ Transactions, Cards, Devices, and Case Records).
* **Protocol:** TigerGraph MCP (Zero-Abstraction Local Stdio Tool Interface).
* **Reasoning Core:** Gemini 3 Flash (via Replicate API) for deterministic policy enforcement and regulatory SAR authoring.
* **Client Interface:** React Native & Expo for web deployment, utilizing tactile layout animations and custom SVG probability dials.

---

## 03. How TigerGraph is Used

The dataset contains over 590,000 transactions across 13,500 customers. Vulkan dynamically inspects localized entity neighborhoods while enforcing strict guards:

* **Entity Traversal:** Pivots across `Customer → OWNS → Card → MADE → Transaction` to assess velocity anomalies.
* **Hardware Fingerprinting:** Traverses `FROM_DEVICE → DeviceProfile` to flag newly registered mobile IDs operating under anonymous proxies.
* **The Supernode Defense:** Explicit traversal constraints in the MCP tools prohibit the agent from expanding dense vertices like `BillingRegion` or `EmailDomain`, keeping the LLM context window lean and preventing hallucination.
* **Bi-Directional Case Memory:** Past confirmed fraud cases (`CC-XXXX`) are retrieved via graph edges to verify repeat offenders, and new resolutions are committed back into the graph.

---

## 04. Agentic Capabilities & Handling Uncertainty

Vulkan moves from uncertain signals to defensible actions strictly under Bank Policy (Rules R1–R10).

**Dynamic Uncertainty Progression:**
When fraud probability sits in an ambiguous zone (0.30–0.70), Vulkan refuses to prematurely block legitimate customers. Instead, it utilizes its tools to initiate policy-controlled step-up authentication (`request_customer_validation`). Upon receiving an simulated SMS denial or confirmation, it updates its recommendations dynamically from `VERIFY_WITH_CUSTOMER` to `BLOCK_CARD` or `CLOSE_NO_FRAUD`.

**FinCEN-Grade SAR Generation:**
For confirmed fraud with high exposure or syndicate connections, the agent autonomously authors standalone regulatory filings detailing *who, what, when, where, and how*.

---

## 05. What We Learned

* **Token Debt in Live Agents:** Multi-turn LLM chat loops over live MCP pipes introduce severe token accumulation debt. Optimizing via focused graph context retrieval prevents API context exhaustion.
* **Policy is a Feature:** Real-world fraud detection requires strict policy guardrails. An unconstrained LLM defaults to over-blocking edge cases. Enforcing deterministic approval routing (`auto`, `L1`, `L2`) bridges AI autonomy with strict regulatory compliance.

---

## 06. What We Would Improve With More Time

* **Live Streaming Ingestion:** Direct Kafka / Event Hub integration into TigerGraph for sub-second real-time alert processing.
* **GNN Hybrid Scoring:** Running in-database TigerGraph graph algorithms (e.g., PageRank, Louvain Community Detection) directly alongside LLM reasoning to detect emergent fraud rings before alerts fire.
* **Human-in-the-Loop Consensus:** Webhook dispatching for L1/L2 managerial approvals on high-exposure card blocks directly from the React dashboard.

---

## Repository Structure

```text
vulkan-agent/
├── public/
│   └── cases/                 # The 20 benchmark JSON files (Automated Grading)
├── Screens/                   # React Native Neo-Brutalist UI Components
│   ├── LandingPage.js
│   └── Dashboard.js
├── agent.py                   # Live MCP Autonomous Agent (Demo Video)
├── batch_runner.py            # High-throughput GraphRAG artifact generator
├── ingest.py                  # TigerGraph bulk data loader
├── App.js                     # Frontend entry point
└── package.json               # Expo & React Native dependencies

```

## Local Setup

**Backend (Python):**

```bash
pip install pyTigerGraph replicate mcp python-dotenv
python batch_runner.py

```

**Frontend (React Native / Expo):**

```bash
npm install
npx expo start --web

```

---

*Engineered at Kalinga Institute of Industrial Technology for Hacker House Goa 2026.*
