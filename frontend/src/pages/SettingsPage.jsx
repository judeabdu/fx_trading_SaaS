import React, { useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { ShieldCheck, PlugZap } from "lucide-react";

function SettingsPage() {
  const [apiToken, setApiToken] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  const connectBroker = async () => {
    // 1. Basic Client-Side Validation
    if (!apiToken.trim()) {
      setError("Please paste a valid Deriv API token first.");
      return;
    }

    const userEmail = localStorage.getItem("user_email");
    if (!userEmail) {
      setError("User email not found. Please log out and log back in.");
      return;
    }

    setLoading(true);
    setMessage("");
    setError("");

    try {
      // 2. Fetch Request sending exact keys expected by FastAPI BrokerConnectRequest schema
      // Change line 29 to this:
const response = await fetch(
  `${import.meta.env.VITE_API_URL}/api/save-broker`, 
  {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            email: userEmail.trim(),
            broker_name: "Deriv", // Fixed: Added mandatory schema property
            api_token: apiToken.trim(),
            app_id: "1089" // Sent as string (Backend will safely process it)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {
        // Fallback for structured array errors vs standard detail objects
        const backendError = typeof data.detail === "object" 
          ? JSON.stringify(data.detail) 
          : data.detail;
          
        throw new Error(backendError || "Connection failed");
      }

      localStorage.setItem("deriv_api_token", apiToken);
      setMessage("Deriv account connected successfully");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <DashboardLayout>
      <div style={pageStyle}>
        <div style={heroCard}>
          <div style={iconWrapper}>
            <PlugZap size={38} />
          </div>
          <h1 style={titleStyle}>Connect Trading Account</h1>
          <p style={subtitleStyle}>
            Securely connect your Deriv account and activate automated trading.
          </p>
        </div>

        <div style={settingsCard}>
          <div style={settingItem}>
            <label style={labelStyle}>Deriv API Token</label>
            <input
              type="text"
              value={apiToken}
              onChange={(e) => setApiToken(e.target.value)}
              placeholder="Paste your Deriv API token"
              style={inputStyle}
            />
          </div>

          <div style={pairBox}>
            <div style={pairHeader}>
              <ShieldCheck size={18} />
              Active Trading Pairs
            </div>
            <div style={pairList}>
              <span style={pairBadge}>R_100</span>
              <span style={pairBadge}>R_75</span>
              <span style={pairBadge}>R_50</span>
            </div>
          </div>

          {message && <div style={successBox}>{message}</div>}
          {error && <div style={errorBox}>{error}</div>}

          <button
            style={connectButton}
            onClick={connectBroker}
            disabled={loading}
          >
            {loading ? "Connecting..." : "Connect Account"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}

// =========================
// STYLES OBJECTS
// =========================
const pageStyle = {
  color: "white",
  maxWidth: "700px"
};

const heroCard = {
  marginBottom: "30px"
};

const iconWrapper = {
  width: "70px",
  height: "70px",
  borderRadius: "20px",
  background: "rgba(251,191,36,0.1)",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  color: "#fbbf24",
  marginBottom: "20px"
};

const titleStyle = {
  fontSize: "42px",
  marginBottom: "10px"
};

const subtitleStyle = {
  color: "#94a3b8",
  fontSize: "16px",
  lineHeight: "1.6"
};

const settingsCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "24px",
  padding: "40px"
};

const settingItem = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "24px"
};

const labelStyle = {
  marginBottom: "12px",
  fontWeight: "600"
};

const inputStyle = {
  padding: "16px",
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "14px",
  color: "white",
  fontSize: "15px"
};

const pairBox = {
  background: "rgba(15,23,42,0.7)",
  border: "1px solid #1e293b",
  borderRadius: "18px",
  padding: "20px",
  marginBottom: "24px"
};

const pairHeader = {
  display: "flex",
  alignItems: "center",
  gap: "10px",
  marginBottom: "16px",
  color: "#fbbf24",
  fontWeight: "700"
};

const pairList = {
  display: "flex",
  gap: "12px",
  flexWrap: "wrap"
};

const pairBadge = {
  background: "#020617",
  border: "1px solid #334155",
  padding: "10px 16px",
  borderRadius: "12px",
  fontSize: "14px"
};

const connectButton = {
  width: "100%",
  padding: "18px",
  border: "none",
  borderRadius: "16px",
  background: "#10b981",
  color: "white",
  fontWeight: "700",
  fontSize: "15px",
  cursor: "pointer"
};

const successBox = {
  background: "#064e3b",
  color: "#6ee7b7",
  padding: "14px",
  borderRadius: "12px",
  marginBottom: "20px"
};

const errorBox = {
  background: "#7f1d1d",
  color: "#fca5a5",
  padding: "14px",
  borderRadius: "12px",
  marginBottom: "20px"
};

export default SettingsPage;
