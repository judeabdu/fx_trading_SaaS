import React from "react";
import { UserCheck } from "lucide-react";

const Header = ({ stats, handleLogout }) => {
  return (
    <header style={headerStyle}>
      <div>
        <h1 style={pageTitle}>Trading Intelligence</h1>
        <p style={breadcrumb}>System / Live Terminal / {stats.memberId}</p>
      </div>

      <div style={headerRight}>
        <div style={statusBadge(stats.running)}>
          <div style={pulseDot(stats.running)}></div>
          {stats.running ? "ALGO ACTIVE" : "SYSTEM PAUSED"}
        </div>

        <button onClick={handleLogout} style={logoutButton}>
          Logout
        </button>
        
        <div style={userProfile}>
          <div style={avatar}><UserCheck size={18} /></div>
          <div style={userInfo}>
            <span style={userName}>{stats.name}</span>
            <span style={userRole}>Verified Trader</span>
          </div>
        </div>
      </div>
    </header>
  );
};

const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" };
const pageTitle = { fontSize: "26px", fontWeight: "700", margin: 0 };
const breadcrumb = { fontSize: "12px", color: "#64748b", marginTop: "4px" };
const headerRight = { display: "flex", alignItems: "center", gap: "24px" };
const logoutButton = { padding: "10px 18px", background: "#ef4444", border: "none", borderRadius: "10px", color: "white", fontWeight: "700", fontSize: "12px", cursor: "pointer" };
const userProfile = { display: "flex", alignItems: "center", gap: "12px", paddingLeft: "24px", borderLeft: "1px solid #1e293b" };
const avatar = { width: "38px", height: "38px", background: "#1e293b", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", border: "1px solid #334155" };
const userInfo = { display: "flex", flexDirection: "column" };
const userName = { fontSize: "14px", fontWeight: "600" };
const userRole = { fontSize: "11px", color: "#64748b" };

const statusBadge = (active) => ({
  display: "flex", alignItems: "center", gap: "8px", padding: "6px 14px", borderRadius: "30px", 
  background: active ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)", 
  border: `1px solid ${active ? "#10b981" : "#ef4444"}`, color: active ? "#10b981" : "#ef4444", 
  fontSize: "11px", fontWeight: "700", letterSpacing: "0.5px"
});

const pulseDot = (active) => ({
  width: "6px", height: "6px", borderRadius: "50%", background: active ? "#10b981" : "#ef4444", 
  boxShadow: active ? "0 0 10px #10b981" : "none" 
});

export default Header;
