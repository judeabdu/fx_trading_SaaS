import React, { useEffect, useState } from "react";
import Sidebar from "./Sidebar";
import Header from "./Header";
import { Wallet, ShieldCheck, TrendingUp } from "lucide-react";

function DashboardLayout({ children }) {
  const [stats, setStats] = useState({
    running: true,
    balance: 0,
    equity: 0,
    profit: 0,
    currency: "USD",
    server: "Live Production",
    name: "Member Account",
    memberId: "FX-772910",
  });

  const [trades, setTrades] = useState([]);

  const handleLogout = () => {
    localStorage.removeItem("goldbot_token");
    localStorage.removeItem("goldbot_user");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
const response = await fetch(
  `${import.meta.env.VITE_API_URL}/status`
);
        const data = await response.json();
        setStats(prev => ({ ...prev, ...data }));
        if (data.active_trades) setTrades(data.active_trades);
      } catch (error) {
        console.error("API Error:", error);
      }
    };

    fetchStatus();
    const interval = setInterval(fetchStatus, 5000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div style={layoutContainer}>
      <Sidebar handleLogout={handleLogout} />

     <main style={mainContent}>

  <Header stats={stats} handleLogout={handleLogout} />

  {children}

  <div style={metricsGrid}>
          <MetricBox 
            icon={<Wallet color="#fbbf24" size={20} />} 
            label="Total Balance" 
            value={stats.balance} 
            currency={stats.currency} 
          />
          <MetricBox 
            icon={<ShieldCheck color="#10b981" size={20} />} 
            label="Current Equity" 
            value={stats.equity} 
            currency={stats.currency} 
          />
          <MetricBox 
            icon={<TrendingUp color={stats.profit >= 0 ? "#10b981" : "#ef4444"} size={20} />} 
            label="Floating P/L" 
            value={stats.profit} 
            currency={stats.currency} 
            highlight={stats.profit >= 0 ? "#10b981" : "#ef4444"} 
          />
        </div>

        {/* Trades and Discipline Grid */}
        <div style={chartsGrid}>
          <section style={tableContainer}>
            <div style={sectionHeader}>
              <h3 style={tableTitle}>Live Positions</h3>
              <button style={refreshBtn}>Real-time Feed</button>
            </div>
            <table style={tradeTable}>
              <thead>
                <tr style={tableHeaderRow}>
                  <th style={thStyle}>Symbol</th>
                  <th style={thStyle}>Type</th>
                  <th style={thStyle}>Lots</th>
                  <th style={thStyle}>Open Price</th>
                  <th style={thStyle}>Net Profit</th>
                </tr>
              </thead>
              <tbody>
                {trades.length > 0 ? trades.map((trade, i) => (
                  <tr key={i} style={tableRow}>
                    <td style={tdStyle}><span style={symbolBadge}>{trade.symbol}</span></td>
                    <td style={{...tdStyle, color: trade.type === 'BUY' ? '#10b981' : '#ef4444', fontWeight: '600'}}>{trade.type}</td>
                    <td style={tdStyle}>{trade.lots}</td>
                    <td style={tdStyle}>{trade.openPrice}</td>
                    <td style={{...tdStyle, fontWeight: '700', color: trade.profit >= 0 ? "#10b981" : "#ef4444"}}>
                      {trade.profit > 0 ? `+${trade.profit}` : trade.profit} <span style={{fontSize: '10px'}}>{stats.currency}</span>
                    </td>
                  </tr>
                )) : (
                  <tr>
                    <td colSpan="5" style={noTradesStyle}>Waiting for market entries...</td>
                  </tr>
                )}
              </tbody>
            </table>
          </section>

          <div style={disciplineCard}>
            <h3 style={tableTitle}>Discipline Rating</h3>
            <div style={scoreCircle}>
              <span style={scoreValue}>94%</span>
              <span style={scoreLabel}>Risk Efficiency</span>
            </div>
            <p style={scoreDesc}>Excellent! Your trade management is within professional risk parameters.</p>
          </div>
        </div>
      </main>
    </div>
  );
}

// --- SHARED UI COMPONENTS (Could also be moved to a /ui folder) ---
const MetricBox = ({ icon, label, value, currency, highlight }) => (
  <div style={metricBoxStyle}>
    <div style={metricTop}>
      <span style={metricLabel}>{label}</span>
      {icon}
    </div>
    <h2 style={{ fontSize: "26px", margin: "14px 0 4px 0", color: highlight || "white", fontWeight: "700" }}>
      {Number(value).toLocaleString()} <span style={currStyle}>{currency}</span>
    </h2>
    <div style={{ fontSize: "11px", color: "#475569", fontWeight: "500" }}>System Verified Stats</div>
  </div>
);

// --- GLOBAL LAYOUT STYLES ---
const layoutContainer = {
  display: "flex",
  width: "100%",
  minHeight: "100vh",
  overflowX: "hidden", width: "100%", maxWidth: "100%",
  background: "#020617",
  color: "white",
  fontFamily: "'Inter', system-ui, sans-serif"
};
const mainContent = {
  flex: 1,
  marginLeft:
    window.innerWidth < 768
      ? "0"
      : "260px",

  padding:
    window.innerWidth < 768
      ? "16px"
      : window.innerWidth < 1024
        ? "24px"
        : "40px",

  width: "100%",
  minWidth: 0,
  overflowX: "hidden", width: "100%", maxWidth: "100%",
  boxSizing: "border-box"
};
const metricsGrid = {
  display: "grid",
  gridTemplateColumns:
    window.innerWidth < 768
      ? "1fr"
      : window.innerWidth < 1024
        ? "repeat(2, 1fr)"
        : "repeat(3, 1fr)",

  gap: "24px",
  marginBottom: "32px"
};
const metricBoxStyle = { background: "#0f172a", padding: "24px", borderRadius: "16px", border: "1px solid #1e293b" };
const metricTop = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const metricLabel = { fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" };
const currStyle = { fontSize: "14px", color: "#475569", marginLeft: "2px" };
const chartsGrid = {
  display: "grid",
  gridTemplateColumns:
    window.innerWidth < 1024
      ? "1fr"
      : "1.6fr 0.4fr",
  gap: "24px"
};
const tableContainer = {
  background: "#0f172a",
  borderRadius: "16px",
  border: "1px solid #1e293b",
  padding: window.innerWidth < 768 ? "14px" : "24px",
  overflowX: "auto", maxWidth: "100%", maxWidth: "100%",
  width: "100%",
  boxSizing: "border-box"
};
const sectionHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" };
const refreshBtn = { background: "#1e293b", border: "none", color: "#fbbf24", padding: "6px 14px", borderRadius: "8px", fontSize: "11px", fontWeight: "600", cursor: "pointer" };
const tableTitle = { margin: 0, fontSize: "16px", fontWeight: "600" };
const symbolBadge = { background: "#1e293b", padding: "4px 10px", borderRadius: "6px", fontSize: "12px", fontWeight: "700", border: "1px solid #334155" };
const tradeTable = { width: "100%", borderCollapse: "collapse" };
const tableHeaderRow = { textAlign: "left", borderBottom: "1px solid #1e293b" };
const thStyle = { padding: "12px", color: "#64748b", fontSize: "11px", textTransform: "uppercase", letterSpacing: "1px" };
const tdStyle = { padding: "16px 12px", borderBottom: "1px solid #0f172a", fontSize: "14px" };
const tableRow = { borderBottom: "1px solid #1e293b" };
const noTradesStyle = { textAlign: "center", padding: "60px", color: "#475569", fontSize: "13px" };
const disciplineCard = { background: "linear-gradient(180deg, #0f172a 0%, #020617 100%)", borderRadius: "16px", border: "1px solid #1e293b", padding: "24px", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" };
const scoreCircle = { width: "130px", height: "130px", borderRadius: "50%", border: "6px solid #1e293b", borderTopColor: "#fbbf24", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", margin: "30px 0" };
const scoreValue = { fontSize: "32px", fontWeight: "800" };
const scoreLabel = { fontSize: "10px", textTransform: "uppercase", color: "#64748b", letterSpacing: "1px" };
const scoreDesc = { fontSize: "13px", color: "#94a3b8", lineHeight: "1.6" };

export default DashboardLayout;
