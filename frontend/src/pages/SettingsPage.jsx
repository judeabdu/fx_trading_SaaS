import React, { useState } from "react";

import DashboardLayout from "../components/DashboardLayout";

function SettingsPage() {

  const [form, setForm] = useState({
    broker_name: "Deriv",
    api_token: "",
    app_id: "",
    symbols: "R_100",
    risk_per_trade: 1
  });

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  const handleChange = (e) => {

    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  };

  const saveBroker = async () => {

    setLoading(true);

    setMessage("");

    setError("");

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/save-broker`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            broker_name: form.broker_name,
            api_token: form.api_token,
            app_id: form.app_id,
            symbols: form.symbols,
            risk_per_trade: Number(form.risk_per_trade)
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail || "Failed to save broker"
        );
      }

      setMessage(
        "Broker configuration saved successfully"
      );

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);
    }
  };

  return (

    <DashboardLayout>

      <div style={containerStyle}>

        <h1 style={titleStyle}>
          Broker Settings
        </h1>

        <div style={settingsCard}>

          <div style={settingItem}>
            <label>Broker Name</label>

            <input
              type="text"
              name="broker_name"
              value={form.broker_name}
              onChange={handleChange}
              placeholder="Deriv"
              style={inputStyle}
            />
          </div>

          <div style={settingItem}>
            <label>Deriv API Token</label>

            <input
              type="text"
              name="api_token"
              value={form.api_token}
              onChange={handleChange}
              placeholder="Enter Deriv API Token"
              style={inputStyle}
            />
          </div>

          <div style={settingItem}>
            <label>Deriv App ID</label>

            <input
              type="text"
              name="app_id"
              value={form.app_id}
              onChange={handleChange}
              placeholder="Enter Deriv App ID"
              style={inputStyle}
            />
          </div>

          <div style={settingItem}>
            <label>Trading Symbols</label>

            <input
              type="text"
              name="symbols"
              value={form.symbols}
              onChange={handleChange}
              placeholder="R_100"
              style={inputStyle}
            />
          </div>

          <div style={settingItem}>
            <label>Risk Per Trade (%)</label>

            <input
              type="number"
              name="risk_per_trade"
              value={form.risk_per_trade}
              onChange={handleChange}
              placeholder="1"
              style={inputStyle}
            />
          </div>

          {message && (
            <div style={successBox}>
              {message}
            </div>
          )}

          {error && (
            <div style={errorBox}>
              {error}
            </div>
          )}

          <button
            style={saveButton}
            onClick={saveBroker}
            disabled={loading}
          >
            {
              loading
                ? "Saving..."
                : "Save Broker"
            }
          </button>

        </div>

      </div>

    </DashboardLayout>
  );
}

const containerStyle = {
  color: "white"
};

const titleStyle = {
  fontSize: "32px",
  marginBottom: "30px"
};

const settingsCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "20px",
  padding: "40px",
  maxWidth: "600px"
};

const settingItem = {
  display: "flex",
  flexDirection: "column",
  marginBottom: "24px"
};

const inputStyle = {
  marginTop: "10px",
  padding: "14px",
  background: "#020617",
  border: "1px solid #334155",
  borderRadius: "10px",
  color: "white",
  fontSize: "14px"
};

const saveButton = {
  background: "#10b981",
  border: "none",
  padding: "16px 24px",
  borderRadius: "12px",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
  width: "100%"
};

const successBox = {
  background: "#064e3b",
  color: "#6ee7b7",
  padding: "14px",
  borderRadius: "10px",
  marginBottom: "20px",
  fontSize: "14px"
};

const errorBox = {
  background: "#7f1d1d",
  color: "#fca5a5",
  padding: "14px",
  borderRadius: "10px",
  marginBottom: "20px",
  fontSize: "14px"
};

export default SettingsPage;