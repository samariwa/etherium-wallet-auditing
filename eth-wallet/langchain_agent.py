import os
os.environ["OPENAI_API_KEY"] = "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"

from langchain.tools import tool
from langchain_openai import ChatOpenAI
from participant_verification import predict_address_scam

# Feature explanations for plain English output
FEATURE_EXPLANATIONS = {
    "Avg min between sent tnx": "A very short average time between sent transactions can indicate automated or bot-like behavior.",
    "Avg min between received tnx": "A very short average time between received transactions may suggest the account is being used to quickly collect funds from many sources.",
    "Time Diff between first and last (Mins)": "A short time between the first and last transaction can indicate a throwaway or temporary account.",
    "Sent tnx": "A high number of outgoing transactions is often seen in scam accounts distributing funds.",
    "Received Tnx": "A high number of incoming transactions may indicate the account is collecting funds from many victims.",
    "Number of Created Contracts": "Creating many contracts can be a sign of scam operations deploying malicious contracts.",
    "Unique Received From Addresses": "Receiving funds from many unique addresses is a common scam pattern.",
    "Unique Sent To Addresses": "Sending funds to many unique addresses can indicate money laundering or scam distribution.",
    "min value received": "Receiving very small amounts can be a sign of dusting attacks or scam collection.",
    "max value received ": "Receiving unusually large amounts may be suspicious if inconsistent with normal activity.",
    "avg val received": "A low average received value can indicate many small, possibly scam-related, transactions.",
    "min val sent": "Sending very small amounts can be a sign of testing or dusting, often seen in scams.",
    "max val sent": "Sending unusually large amounts may be suspicious if inconsistent with normal activity.",
    "avg val sent": "A low average sent value can indicate many small, possibly scam-related, transactions.",
    "min value sent to contract": "Sending very small amounts to contracts can be a sign of probing or scam contract interaction.",
    "max val sent to contract": "Sending large amounts to contracts may be risky if the contracts are malicious.",
    "avg value sent to contract": "A low average value sent to contracts can indicate many small, possibly scam-related, contract interactions.",
    "total transactions (including tnx to create contract": "A very high number of transactions is often seen in scam or bot accounts.",
    "total Ether sent": "Sending large amounts of Ether can be suspicious if inconsistent with normal activity.",
    "total ether received": "Receiving large amounts of Ether can be suspicious if inconsistent with normal activity.",
    "total ether balance": "A very low or zero balance after many transactions can indicate funds have been quickly moved out, as in scams."
}

def explain_feature(feature, shap_value):
    desc = FEATURE_EXPLANATIONS.get(feature, f"The feature '{feature}' may indicate suspicious activity.")
    direction = "high" if shap_value > 0 else "low"
    # Tailor the explanation based on direction
    if direction == "high":
        return f"- {desc} (This account has a high value for this feature.)"
    else:
        return f"- {desc} (This account has a low value for this feature.)"

# Tool for scam prediction
@tool("predict_address_scam", return_direct=True)
def predict_address_scam_tool(address: str) -> str:
    """
    Given an Ethereum address, predicts if it is flagged as a scam and provides a plain-English explanation.
    """
    verdict, top_features = predict_address_scam(address)
    if verdict == 'not flagged' or not top_features:
        return "Recipient Verified"
    explanations = [explain_feature(feat, contrib) for feat, contrib in top_features]
    explain_text = "\n".join(explanations)
    return (
        f"Transacting with {address} is a high risk due to the following reasons:\n"
        f"{explain_text}"
    )

# System prompt for the OpenAI agent
PREFIX = (
    "You are an Ethereum wallet scam analysis assistant. "
    "You use a machine learning model to flag scam wallets based on transaction features. "
    "When a wallet is flagged, you will explain the top contributing features in simple English. "
    "Here is what the output means: "
    "- 'flagged': The address is likely a scam based on its transaction patterns. "
    "- 'not flagged': The address appears normal. "
    "- The 'top contributing features' are the most important reasons the model flagged the address. "
    "For each feature, explain what it means in the context of Ethereum transactions, using the following descriptions: "
    "Avg min between sent tnx: Average time between sent transactions for account in minutes. "
    "Avg min between received tnx: Average time between received transactions for account in minutes. "
    "Time Diff between first and last (Mins): Time difference between the first and last transaction. "
    "Sent tnx: Total number of sent normal transactions. "
    "Received Tnx: Total number of received normal transactions. "
    "Number of Created Contracts: Total number of created contract transactions. "
    "Unique Received From Addresses: Total unique addresses from which account received transactions. "
    "Unique Sent To Addresses: Total unique addresses to which account sent transactions. "
    "min value received: Minimum value in Ether ever received. "
    "max value received : Maximum value in Ether ever received. "
    "avg val received: Average value in Ether ever received. "
    "min val sent: Minimum value of Ether ever sent. "
    "max val sent: Maximum value of Ether ever sent. "
    "avg val sent: Average value of Ether ever sent. "
    "min value sent to contract: Minimum value of Ether sent to a contract. "
    "max val sent to contract: Maximum value of Ether sent to a contract. "
    "avg value sent to contract: Average value of Ether sent to contracts. "
    "total transactions (including tnx to create contract: Total number of transactions. "
    "total Ether sent: Total Ether sent for account address. "
    "total ether received: Total Ether received for account address. "
    "total ether balance: Total Ether balance following enacted transactions. "
    "If a feature is not listed, do your best to explain it based on its name. "
    "Be clear and concise."
)

# Set up the OpenAI agent
llm = ChatOpenAI(model="gpt-4-1106-preview", temperature=0)

from langchain.agents import initialize_agent

tools = [predict_address_scam_tool]

agent = initialize_agent(
    tools,
    llm,
    agent="chat-zero-shot-react-description",
    verbose=True,
    system_message=PREFIX,
)


def run_scam_agent(address: str) -> str:
    """
    Runs the scam analysis agent and returns the agent's output string for the given address, prefixed with SuspETHious.
    """
    prompt = f"Check if {address} is a scam and explain why. Please use line breaks after each reason for readability."
    result = agent.run(prompt)
    return f"SuspETHious: {result}" if not result.startswith("SuspETHious:") else result
