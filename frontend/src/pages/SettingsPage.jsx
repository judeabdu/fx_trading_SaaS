import React, { useState } from "react";

import DashboardLayout from "../components/DashboardLayout";

function SettingsPage() {

  const [form, setForm] = useState({
    login: "",
    password: "",
    server: ""
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

  const connectMT5 = async () => {

    setLoading(true);

    setMessage("");

    setError("");

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/connect-mt5`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            login: form.login,
            password: form.password,
            server: form.server
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail || "Connection failed"
        );
      }

      setMessage(
        "MT5 account connected successfully"
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
          Account Settings
        </h1>

        <div style={settingsCard}>

          <div style={settingItem}>
            <label>MT5 Login</label>

            <input
              type="text"
              name="login"
              value={form.login}
              onChange={handleChange}
              placeholder="Enter MT5 Login"
              style={inputStyle}
            />
          </div>

          <div style={settingItem}>
            <label>MT5 Password</label>

            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="Enter MT5 Password"
              style={inputStyle}
            />
          </div>

          <div style={settingItem}>
            <label>Trading Server</label>

            <input
              type="text"
              name="server"
              value={form.server}
              onChange={handleChange}
              placeholder="Exness-MT5Trial9"
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
            onClick={connectMT5}
            disabled={loading}
          >
            {
              loading
                ? "Connecting..."
                : "Connect MT5"
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
