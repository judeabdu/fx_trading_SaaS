import React from "react";

import DashboardLayout from "../components/DashboardLayout";

function SettingsPage() {

  return (

    <DashboardLayout>

      <div style={containerStyle}>

        <h1 style={titleStyle}>
          Account Settings
        </h1>

        <div style={settingsCard}>

          <div style={settingItem}>
            <label>Email Address</label>

            <input
              type="text"
              value="admin@goldbot.com"
              style={inputStyle}
              readOnly
            />
          </div>

          <div style={settingItem}>
            <label>Broker</label>

            <input
              type="text"
              value="Exness MT5"
              style={inputStyle}
            />
          </div>

          <div style={settingItem}>
            <label>Trading Server</label>

            <input
              type="text"
              value="Live Server"
              style={inputStyle}
            />
          </div>

          <button style={saveButton}>
            Save Changes
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
  color: "white"
};

const saveButton = {
  background: "#10b981",
  border: "none",
  padding: "16px 24px",
  borderRadius: "12px",
  color: "white",
  fontWeight: "700",
  cursor: "pointer"
};

export default SettingsPage;