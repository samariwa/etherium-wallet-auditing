# suspETHious: AI-Powered Ethereum Wallet Audit Agent

## The Problem

Decentralized wallets today are powerful, but they lack built-in mechanisms to help users **evaluate the trustworthiness** of past trgitansactions or counterparties. Many users fall victim to fraudulent transactions or scams without even realizing the red flags.

## The Idea: **suspETHious**

**suspETHious** is a smart Ethereum-based crypto wallet enhanced with an **AI-powered audit agent**. Before executing any outgoing transaction, the agent scans and analyzes the **historical transaction patterns** of the target wallet.

The AI agent determines:

- If the wallet has a history of **interacting with known scam addresses**
- Transaction frequencies and amounts that look **anomalous**
- Gas fees or token behavior that **deviates from norms**

## The Tech Stack

- **Machine Learning**: Trained a fraud detection model on a dataset of real Ethereum transactions containing scam flags.
- **Explainability**: Used **SHAP (SHapley Additive exPlanations)** to make the model decisions interpretable. Users can understand _why_ a transaction was flagged.
- **LLM Integration**: Integrates with **OpenAI's GPT-4o-mini** via **LangChain**, transforming ML insights into human-readable alerts.
- **Frontend**: Built with **React.js**, providing users with an intuitive interface and dynamic transaction alerts.
- **Backend**: A **Flask** server connects the React frontend, ML model, and Ethereum APIs.
- **Blockchain**: Uses Ethereum testnets to simulate transactions and trigger wallet audits.

## Project Structure & Interconnections

```
root/
├── eth-wallet/           # Python backend, ML, and wallet logic
│   ├── api_server.py     # Flask API server (main entrypoint)
│   ├── eth_wallet/       # Core wallet, transaction, and Infura logic
│   ├── participant_verification.py  # ML model, SHAP explainability, scam prediction
│   ├── langchain_agent.py # LangChain/OpenAI agent for scam explanations
│   ├── requirements.txt  # Python dependencies
│   └── ...
├── frontend/             # React.js frontend
│   └── blockchain-hackathon/
│       ├── src/
│       ├── public/
│       └── ...
└── README.md             # This file
```

### How the Pieces Work Together

- **User interacts with the React frontend** to check wallet info, send ETH, or check if a counterparty is suspicious.
- **Frontend calls Flask API endpoints** (e.g., `/api/balance`, `/api/send`, `/api/predict`) exposed by `api_server.py`.
- **Flask backend**:
  - Handles wallet creation, transaction signing, and balance queries using the `eth_wallet` package.
  - For scam checks, it calls `participant_verification.py` to fetch transaction history (via Etherscan), extract features, and run the ML model.
  - If a wallet is flagged, the backend uses `langchain_agent.py` to generate a human-readable explanation using OpenAI's GPT-4o-mini.
- **ML Model**:
  - Trained on real Ethereum transaction data, saved as `scam_model.pkl` and `scam_normalizer.pkl`.
  - Uses SHAP to explain which features most contributed to a scam verdict.
- **All results and explanations** are returned to the frontend, where users see verdicts and plain-English reasons before confirming any transaction.

## Example: Scam Check Flow

1. **User enters a recipient address** in the frontend.
2. **Frontend calls** `/api/predict` with the address.
3. **Backend fetches transaction history** from Etherscan, extracts features, and runs the ML model.
4. **If flagged**, the backend uses LangChain + OpenAI to generate a natural language explanation.
5. **Frontend displays** the verdict and explanation in a modal, letting the user decide to proceed or cancel.

## How to Run

1. **Backend**: Activate your Python 3.9 venv and run:
   ```sh
   cd eth-wallet
   python api_server.py
   ```
2. **Frontend**: In a new terminal:
   ```sh
   cd frontend/blockchain-hackathon
   npm install
   npm run dev
   ```
3. **Visit** the app in your browser (usually at http://localhost:5173 or similar).

## Security & Limitations

- This is a research/demonstration project. Do not use with real funds.
- The ML model is only as good as the data it was trained on.
- Always verify the Infura/Etherscan API keys and never commit secrets to public repos.

## Credits

- Built by Samuel Mariwa for the BU Blockchain Hackathon 2025.
- Powered by OpenAI, SHAP, XGBoost, Flask, React, and the Ethereum ecosystem.

## Project Overview (Narrative)

Imagine a crypto wallet that doesn't just store your ETH, but actively protects you from scams. **suspETHious** is an Ethereum wallet enhanced with an AI-powered audit agent. Before you send funds, the system quietly analyzes the recipient's transaction history, looking for red flags using machine learning and explainable AI.
