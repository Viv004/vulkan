import pyTigerGraph as tg

# --- NEW: Extract headers directly from local CSV files ---
def get_gsql_header(file_path):
    with open(file_path, 'r', encoding='utf-8') as f:
        columns = f.readline().strip().split(',')
        return ', '.join([f'"{col}"' for col in columns])

txns_head = get_gsql_header("transactions_graph_ready.csv")
id_head = get_gsql_header("identity.csv")
cases_head = get_gsql_header("closed_cases_history.csv")

# 1. Initialize Connection
conn = tg.TigerGraphConnection(
    host="https://tg-78d264e6-41ed-44f4-88c6-0620d5ff6bf9.tg-2635877100.i.tgcloud.io",
    graphname="FraudInvestigationGraph",
    gsqlSecret="of3bh4r5nh1b3k4qapjdqenjd97cku5h"
)
conn.getToken("of3bh4r5nh1b3k4qapjdqenjd97cku5h")

# 2. Create the Loading Job 
loading_job = f"""
USE GRAPH FraudInvestigationGraph
CREATE LOADING JOB load_fraud_data FOR GRAPH FraudInvestigationGraph {{
    
    // Dynamically injected headers satisfy the compiler validation
    DEFINE HEADER txns_hdr = {txns_head};
    DEFINE HEADER id_hdr = {id_head};
    DEFINE HEADER cases_hdr = {cases_head};
    
    DEFINE FILENAME f_txns;
    DEFINE FILENAME f_id;
    DEFINE FILENAME f_cases;
    
    // Load Transactions 
    LOAD f_txns TO VERTEX Customer VALUES ($"customer_id") USING USER_DEFINED_HEADER="txns_hdr", header="true", separator=",";
    LOAD f_txns TO VERTEX Card VALUES ($"card_id") USING USER_DEFINED_HEADER="txns_hdr", header="true", separator=",";
    LOAD f_txns TO VERTEX Transaction VALUES ($"TransactionID", $"card4", $"card6", $"TransactionAmt", $"ts", $"channel", $"risk_score", $"ProductCD", $"addr1", $"addr2", $"P_emaildomain", $"R_emaildomain") USING USER_DEFINED_HEADER="txns_hdr", header="true", separator=",";
    LOAD f_txns TO VERTEX BillingRegion VALUES ($"addr1", $"addr2") USING USER_DEFINED_HEADER="txns_hdr", header="true", separator=",";
    LOAD f_txns TO VERTEX EmailDomain VALUES ($"P_emaildomain") USING USER_DEFINED_HEADER="txns_hdr", header="true", separator=",";
    
    // Transaction Edges
    LOAD f_txns TO EDGE customer_owns_card VALUES ($"customer_id", $"card_id") USING USER_DEFINED_HEADER="txns_hdr", header="true", separator=",";
    LOAD f_txns TO EDGE customer_made_transaction VALUES ($"customer_id", $"TransactionID") USING USER_DEFINED_HEADER="txns_hdr", header="true", separator=",";
    LOAD f_txns TO EDGE card_used_in_transaction VALUES ($"card_id", $"TransactionID") USING USER_DEFINED_HEADER="txns_hdr", header="true", separator=",";
    LOAD f_txns TO EDGE BILLED_IN VALUES ($"TransactionID", $"addr1") USING USER_DEFINED_HEADER="txns_hdr", header="true", separator=",";
    LOAD f_txns TO EDGE PURCHASER_EMAIL VALUES ($"TransactionID", $"P_emaildomain") USING USER_DEFINED_HEADER="txns_hdr", header="true", separator=",";

    // Load Identity Records 
    LOAD f_id TO VERTEX DeviceProfile VALUES ($"DeviceInfo", $"DeviceInfo", $"id_30", $"id_31", $"id_33") USING USER_DEFINED_HEADER="id_hdr", header="true", separator=",";
    LOAD f_id TO EDGE FROM_DEVICE VALUES ($"TransactionID", $"DeviceInfo") USING USER_DEFINED_HEADER="id_hdr", header="true", separator=",";

    // Load Closed Cases
    LOAD f_cases TO VERTEX CaseRecord VALUES ($"case_id", $"opened_at", $"closed_at", $"outcome", $"pattern", $"txn_ids", $"n_txns", $"exposure_usd", $"connected_card_ids", $"actions_taken", $"report_filed", $"analyst_notes") USING USER_DEFINED_HEADER="cases_hdr", header="true", separator=",";
    LOAD f_cases TO EDGE case_of_customer VALUES ($"case_id", $"customer_id") USING USER_DEFINED_HEADER="cases_hdr", header="true", separator=",";
    LOAD f_cases TO EDGE case_of_card VALUES ($"case_id", $"card_id") USING USER_DEFINED_HEADER="cases_hdr", header="true", separator=",";
    LOAD f_cases TO EDGE case_first_fraud_transaction VALUES ($"case_id", $"first_fraud_txn_id") USING USER_DEFINED_HEADER="cases_hdr", header="true", separator=",";
}}
"""

print("Creating loading job...")
print(conn.gsql(loading_job))

# 3. Upload Files and Execute Loading
print("Uploading and loading transactions...")
results_txns = conn.runLoadingJobWithFile(
    filePath="transactions_graph_ready.csv", 
    fileTag="f_txns", 
    jobName="load_fraud_data"
)
print(results_txns)

print("Uploading and loading identity data...")
results_id = conn.runLoadingJobWithFile(
    filePath="identity.csv", 
    fileTag="f_id", 
    jobName="load_fraud_data"
)
print(results_id)

print("Uploading and loading closed cases...")
results_cases = conn.runLoadingJobWithFile(
    filePath="closed_cases_history.csv", 
    fileTag="f_cases", 
    jobName="load_fraud_data"
)
print(results_cases)
print("Data ingestion complete!")