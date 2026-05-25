import React, { useEffect, useState } from "react";
// Professional icons for a high-trust financial UI
import { 
  LayoutDashboard, 
  LineChart, 
  History, 
  Settings, 
  LogOut, 
  ShieldCheck, 
  TrendingUp, 
  Wallet, 
  BarChart3,
  CreditCard,
  UserCheck
} from "lucide-react";

function App() {
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

  // --- LOGOUT FUNCTION ---
  const handleLogout = () => {
    localStorage.removeItem("goldbot_token");
    localStorage.removeItem("goldbot_user");
    window.location.href = "/login";
  };

  useEffect(() => {
    const fetchStatus = async () => {
      try {
<<<<<<< HEAD
        const response = await fetch(`${import.meta.env.VITE_API_URL}/status`);
=======
        const response = await fetch(`${import.meta.env.VITE_API_URL}/status`);
>>>>>>> 9499211bcc2de4e7d74d646cab329c832a9300c2
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
      {/* --- SIDEBAR --- */}
      <aside style={sidebarStyle}>
        <div style={logoArea}>
          <div style={judeLogoSmall}>J</div>
          <h2 style={sidebarBrand}>JUDE<span style={{ color: "#fbbf24" }}>FX</span></h2>
        </div>
        
        <div style={navGroup}>
          <NavItem icon={<LayoutDashboard size={18} />} label="Dashboard" active />
          <NavItem icon={<BarChart3 size={18} />} label="Analytics" />
          <NavItem icon={<LineChart size={18} />} label="Live Trades" />
          <NavItem icon={<History size={18} />} label="History" />
        </div>

        <div style={{ ...navGroup, marginTop: "auto", borderTop: "1px solid #1e293b", paddingTop: "20px" }}>
          <NavItem icon={<CreditCard size={18} />} label="Billing" />
          <NavItem icon={<Settings size={18} />} label="Settings" />
          {/* Linked the sidebar logout too for consistency */}
          <div onClick={handleLogout}>
            <NavItem icon={<LogOut size={18} />} label="Logout" color="#ef4444" />
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main style={mainContent}>
        {/* Header Section */}
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

            {/* --- ADDED LOGOUT BUTTON --- */}
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

        {/* Financial Metrics Row */}
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

// --- SUB-COMPONENTS ---

const NavItem = ({ icon, label, active, color }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    background: active ? "rgba(251, 191, 36, 0.08)" : "transparent",
    color: color || (active ? "#fbbf24" : "#94a3b8"),
    fontSize: "14px",
    fontWeight: active ? "600" : "500",
    transition: "all 0.2s ease"
  }}>
    {icon}
    {label}
  </div>
);

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

// --- STYLES ---

const layoutContainer = { display: "flex", minHeight: "100vh", background: "#020617", color: "white", fontFamily: "'Inter', system-ui, sans-serif" };

const sidebarStyle = {
  width: "260px",
  background: "#020617",
  borderRight: "1px solid #1e293b",
  display: "flex",
  flexDirection: "column",
  padding: "30px 20px",
  position: "fixed",
  height: "100vh"
};

const logoArea = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" };
const judeLogoSmall = { background: "#fbbf24", color: "#000", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", boxShadow: "0 0 20px rgba(251, 191, 36, 0.2)" };
const sidebarBrand = { fontSize: "20px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" };
const navGroup = { display: "flex", flexDirection: "column", gap: "6px" };

const mainContent = { flex: 1, marginLeft: window.innerWidth < 768 ? "0" : "260px", padding: "40px" };

const headerStyle = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "40px" };
const pageTitle = { fontSize: "26px", fontWeight: "700", margin: 0 };
const breadcrumb = { fontSize: "12px", color: "#64748b", marginTop: "4px" };

const headerRight = { display: "flex", alignItems: "center", gap: "24px" };
const userProfile = { display: "flex", alignItems: "center", gap: "12px", paddingLeft: "24px", borderLeft: "1px solid #1e293b" };
const avatar = { width: "38px", height: "38px", background: "#1e293b", borderRadius: "10px", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24", border: "1px solid #334155" };
const userInfo = { display: "flex", flexDirection: "column" };
const userName = { fontSize: "14px", fontWeight: "600" };
const userRole = { fontSize: "11px", color: "#64748b" };

const metricsGrid = { display: "grid", gridTemplateColumns: "repeat(3, 1fr)", gap: "24px", marginBottom: "32px" };
const metricBoxStyle = { background: "#0f172a", padding: "24px", borderRadius: "16px", border: "1px solid #1e293b" };
const metricTop = { display: "flex", justifyContent: "space-between", alignItems: "center" };
const metricLabel = { fontSize: "12px", color: "#64748b", textTransform: "uppercase", letterSpacing: "0.5px", fontWeight: "600" };
const currStyle = { fontSize: "14px", color: "#475569", marginLeft: "2px" };

const chartsGrid = { display: "grid", gridTemplateColumns: "1.6fr 0.4fr", gap: "24px" };
const tableContainer = { background: "#0f172a", borderRadius: "16px", border: "1px solid #1e293b", padding: "24px" };
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

const statusBadge = (active) => ({
  display: "flex", 
  alignItems: "center", 
  gap: "8px", 
  padding: "6px 14px", 
  borderRadius: "30px", 
  background: active ? "rgba(16, 185, 129, 0.08)" : "rgba(239, 68, 68, 0.08)", 
  border: `1px solid ${active ? "#10b981" : "#ef4444"}`, 
  color: active ? "#10b981" : "#ef4444", 
  fontSize: "11px", 
  fontWeight: "700",
  letterSpacing: "0.5px"
});

const pulseDot = (active) => ({
  width: "6px", 
  height: "6px", 
  borderRadius: "50%", 
  background: active ? "#10b981" : "#ef4444", 
  boxShadow: active ? "0 0 10px #10b981" : "none" 
});

// --- LOGOUT BUTTON STYLE ---
const logoutButton = {
  padding: "10px 18px",
  background: "#ef4444",
  border: "none",
  borderRadius: "10px",
  color: "white",
  fontWeight: "700",
  fontSize: "12px",
  cursor: "pointer",
  transition: "opacity 0.2s"
};

export default App;
