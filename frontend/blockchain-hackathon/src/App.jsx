import React, { useEffect, useState } from "react";
import "./App.css";

export default function App() {
  const [address, setAddress] = useState("");
  const [pubKey, setPubKey] = useState("");
  const [balance, setBalance] = useState("");
  const [network, setNetwork] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [toAddress, setToAddress] = useState("");
  const [showPubKey, setShowPubKey] = useState(false);
  const [amount, setAmount] = useState("");
  const [verdict, setVerdict] = useState("");
  const [verifying, setVerifying] = useState(false);
  const [explain, setExplain] = useState([]);

  // Helper to mask the public key
  function getMaskedPubKey(pubKey) {
    if (!pubKey) return "";
    if (showPubKey) return pubKey;
    if (pubKey.length <= 8) return pubKey;
    return pubKey.slice(0, 4) + "••••••••" + pubKey.slice(-4);
  }

  useEffect(() => {
    async function fetchWallet() {
      setLoading(true);
      setError("");
      try {
        const walletRes = await fetch("http://127.0.0.1:5001/api/wallet");
        const walletData = await walletRes.json();
        setAddress(walletData.address);
        setPubKey(walletData.pub_key);

        const balanceRes = await fetch("http://127.0.0.1:5001/api/balance");
        const balanceData = await balanceRes.json();
        // Extract only the numeric value and token from the returned string
        // Example: "Balance on address 0x... is: 0ETH"
        let balanceStr = balanceData.balance;
        let balanceValue = balanceStr;
        let match = balanceStr.match(/is: ([^\s]+)([A-Z]*)/);
        if (match) {
          balanceValue = match[1] + (match[2] ? " " + match[2] : "");
        }
        setBalance(balanceValue);

        const networkRes = await fetch("http://127.0.0.1:5001/api/network");
        const networkData = await networkRes.json();
        setNetwork(networkData.network);
      } catch (err) {
        setError("Failed to fetch wallet info.");
      }
      setLoading(false);
    }
    fetchWallet();
  }, []);

  async function handleSend(e) {
    e.preventDefault();
    setVerdict("");
    setError("");
    setExplain([]);
    setVerifying(true);
    try {
      const res = await fetch("http://127.0.0.1:5001/api/predict", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ address: toAddress }),
      });
      const data = await res.json();
      if (data.verdict) {
        setVerdict(data.verdict);
        setExplain(data.explain || []);
      } else if (data.error) {
        setError(data.error);
      } else {
        setError("Unknown error during verification.");
      }
    } catch (err) {
      setError("Failed to verify address.");
    }
    setVerifying(false);
  }

  return (
    <div
      style={{
        minHeight: "100vh",
        minWidth: "100vw",
        width: "100vw",
        height: "100vh",
        background: "#0a2342",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        fontFamily: "Inter, Segoe UI, Arial, sans-serif",
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "18px",
          boxShadow: "0 4px 24px rgba(0,0,0,0.12)",
          padding: "2.5rem 2rem",
          minWidth: 700,
          minHeight: 340,
          display: "flex",
          flexDirection: "row",
          gap: "2.5rem",
          fontFamily: "Inter, Segoe UI, Arial, sans-serif",
          margin: "auto",
        }}
      >
        {/* Left: Wallet Info */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            fontFamily: "Inter, Segoe UI, Arial, sans-serif",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              marginBottom: "1.5rem",
              width: "100%",
            }}
          >
            <img
              src="/logo.png"
              alt="Ethereum Logo"
              style={{ width: 42, height: 42, marginRight: 16 }} // 30% larger than before
            />
            <span
              style={{
                color: "#0a2342",
                fontWeight: 700,
                fontSize: 28,
                fontFamily: "Inter, Segoe UI, Arial, sans-serif",
                textAlign: "center",
                width: "100%",
              }}
            >
              My Wallet
            </span>
          </div>
          {loading ? (
            <div>Loading...</div>
          ) : error ? (
            <div style={{ color: "#e74c3c" }}>{error}</div>
          ) : (
            <>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Address:</strong>
                <div
                  style={{
                    wordBreak: "break-all",
                    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
                    color: "#555",
                    marginTop: "0.3rem",
                  }}
                >
                  {address}
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Private Key:</strong>
                <div
                  style={{
                    wordBreak: "break-all",
                    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
                    color: "#555",
                    marginTop: "0.3rem",
                    display: "flex",
                    alignItems: "center",
                  }}
                >
                  {getMaskedPubKey(pubKey)}
                  <button
                    onClick={() => setShowPubKey((v) => !v)}
                    style={{
                      marginLeft: 8,
                      background: "none",
                      border: "none",
                      cursor: "pointer",
                      padding: 0,
                      outline: "none",
                    }}
                    title={showPubKey ? "Hide" : "Show"}
                  >
                    {showPubKey ? (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 10C2 10 5.5 4 10 4C14.5 4 18 10 18 10C18 10 14.5 16 10 16C5.5 16 2 10 2 10Z"
                          stroke="#0a2342"
                          strokeWidth="2"
                        />
                        <circle
                          cx="10"
                          cy="10"
                          r="3"
                          stroke="#0a2342"
                          strokeWidth="2"
                        />
                      </svg>
                    ) : (
                      <svg
                        width="20"
                        height="20"
                        viewBox="0 0 20 20"
                        fill="none"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          d="M2 10C2 10 5.5 4 10 4C14.5 4 18 10 18 10C18 10 14.5 16 10 16C5.5 16 2 10 2 10Z"
                          stroke="#0a2342"
                          strokeWidth="2"
                        />
                        <path d="M4 4L16 16" stroke="#0a2342" strokeWidth="2" />
                      </svg>
                    )}
                  </button>
                </div>
              </div>
              <div style={{ marginBottom: "1rem" }}>
                <strong>Balance:</strong>
                <div
                  style={{
                    fontSize: 24,
                    color: "#27ae60",
                    marginTop: "0.3rem",
                    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
                    fontWeight: 600,
                  }}
                >
                  {balance}
                </div>
              </div>
              <div>
                <strong>Network:</strong>
                <div
                  style={{
                    color: "#2980b9",
                    marginTop: "0.3rem",
                    fontFamily: "Inter, Segoe UI, Arial, sans-serif",
                  }}
                >
                  {network}
                </div>
              </div>
            </>
          )}
        </div>
        {/* Right: Send ETH */}
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "center",
            borderLeft: "1px solid #e6e6e6",
            paddingLeft: "2rem",
            fontFamily: "Inter, Segoe UI, Arial, sans-serif",
          }}
        >
          <h3
            style={{
              color: "#0a2342",
              marginBottom: "1.2rem",
              fontSize: "1.5rem",
              fontFamily: "Inter, Segoe UI, Arial, sans-serif",
              textAlign: "center",
            }}
          >
            Send ETH
          </h3>
          <label
            htmlFor="toAddress"
            style={{
              fontWeight: 600,
              marginBottom: 8,
              color: "#222",
              display: "block",
              fontFamily: "Inter, Segoe UI, Arial, sans-serif",
            }}
          >
            To (address):
          </label>
          <input
            id="toAddress"
            type="text"
            value={toAddress}
            onChange={(e) => setToAddress(e.target.value)}
            placeholder="0x..."
            style={{
              padding: "0.7rem 1rem",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              marginBottom: 20,
              marginTop: 4,
              fontFamily: "Inter, Segoe UI, Arial, sans-serif",
              background: "#f8fafd",
              color: "#222",
            }}
          />
          <label
            htmlFor="amount"
            style={{
              fontWeight: 600,
              marginBottom: 8,
              color: "#222",
              display: "block",
              fontFamily: "Inter, Segoe UI, Arial, sans-serif",
            }}
          >
            Amount (ETH):
          </label>
          <input
            id="amount"
            type="number"
            min="0"
            step="any"
            value={amount}
            onChange={(e) => setAmount(e.target.value)}
            placeholder="0.00"
            style={{
              padding: "0.7rem 1rem",
              borderRadius: 8,
              border: "1px solid #ccc",
              fontSize: 16,
              marginBottom: 24,
              marginTop: 4,
              fontFamily: "Inter, Segoe UI, Arial, sans-serif",
              background: "#f8fafd",
              color: "#222",
            }}
          />
          <button
            style={{
              background: "#0a2342",
              color: "#fff",
              border: "none",
              borderRadius: 8,
              padding: "0.8rem 2.2rem",
              fontSize: 18,
              fontWeight: 600,
              cursor: "pointer",
              fontFamily: "Inter, Segoe UI, Arial, sans-serif",
              transition: "background 0.2s",
              marginTop: 8,
              boxShadow: "0 2px 8px rgba(10,35,66,0.08)",
            }}
            onClick={handleSend}
            disabled={verifying || !toAddress}
          >
            {verifying ? "Verifying..." : "Send"}
          </button>
          {verdict && (
            <div
              style={{
                marginTop: 18,
                fontWeight: 600,
                color: verdict === "flagged" ? "#e74c3c" : "#27ae60",
              }}
            >
              Scam Check:{" "}
              {verdict === "flagged" ? "Flagged as Scam" : "Not Flagged"}
              {explain.length > 0 && (
                <div
                  style={{
                    marginTop: 10,
                    fontWeight: 400,
                    color: "#222",
                    fontSize: 15,
                  }}
                >
                  Top contributing features:
                  <ul style={{ margin: 0, paddingLeft: 18 }}>
                    {explain.map((item, i) => (
                      <li key={i}>
                        <b>{item.feature}</b>: {item.contribution.toFixed(3)}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}
          {error && (
            <div
              style={{
                marginTop: 18,
                color: "#e74c3c",
                fontWeight: 600,
              }}
            >
              {error}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
