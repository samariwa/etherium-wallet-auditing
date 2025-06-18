from flask import Flask, jsonify, request
from flask_cors import CORS
from wallet_test import get_wallet_info, get_wallet_balance, list_tokens, get_network, send_transaction
from participant_verification import extract_features_from_etherscan, predict_scam, fetch_wallet_transactions
from langchain_agent import run_scam_agent

app = Flask(__name__)
CORS(app)

@app.route("/api/wallet")
def wallet():
    info = get_wallet_info()
    lines = info.splitlines()
    address = lines[0].split(": ", 1)[1] if len(lines) > 0 else ""
    pub_key = lines[1].split(": ", 1)[1] if len(lines) > 1 else ""
    return jsonify({"address": address, "pub_key": pub_key})

@app.route("/api/balance")
def balance():
    bal = get_wallet_balance()
    return jsonify({"balance": bal})

@app.route("/api/tokens")
def tokens():
    return jsonify({"tokens": list_tokens()})

@app.route("/api/network")
def network():
    return jsonify({"network": get_network()})

@app.route("/api/predict", methods=["POST"])
def predict():
    data = request.get_json()
    address = data.get("address")
    if not address:
        return jsonify({"error": "Missing address"}), 400
    try:
        agent_output = run_scam_agent(address)
        return jsonify({"result": agent_output})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

@app.route("/api/send", methods=["POST"])
def api_send():
    data = request.get_json()
    to_address = data.get("to_address")
    amount = data.get("amount")
    passphrase = data.get("passphrase")
    if not to_address or not amount or not passphrase:
        return jsonify({"error": "Missing to_address, amount, or passphrase"}), 400
    try:
        result = send_transaction(to_address, amount, passphrase)
        if "Error" in result or "error" in result.lower():
            return jsonify({"error": result}), 400
        return jsonify({"result": result})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
