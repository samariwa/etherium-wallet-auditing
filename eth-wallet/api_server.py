from flask import Flask, jsonify, request
from flask_cors import CORS
from wallet_test import get_wallet_info, get_wallet_balance, list_tokens, get_network
from participant_verification import extract_features_from_etherscan, predict_scam, fetch_wallet_transactions

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
        txs = fetch_wallet_transactions(address)
        features = extract_features_from_etherscan(txs, address)
        verdict, top_features = predict_scam(features)
        explain = [
            {"feature": f, "contribution": float(c)} for f, c in top_features
        ]
        return jsonify({"verdict": verdict, "explain": explain})
    except Exception as e:
        return jsonify({"error": str(e)}), 500

if __name__ == "__main__":
    app.run(port=5001, debug=True)
