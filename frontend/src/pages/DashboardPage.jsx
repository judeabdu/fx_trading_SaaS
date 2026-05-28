import React, { useEffect, useState } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useSocket } from "../context/SocketContext"; // Consume our unified global stream
import { Activity, Bot, Cpu, ShieldCheck, Wifi, LineChart } from "lucide-react";

function DashboardPage() {
  const [botRunning, setBotRunning] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");

  // Destructure real-time streaming data directly from global context
  const { balance, currency, marketPrices } = useSocket();

  const fetchBotStatus = async () => {
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/status`);
      const data = await response.json();
      setBotRunning(data.running);
    } catch (err) {
      console.error("Failed to fetch bot status:", err);
    }
  };

  const startBot = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/start-bot`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to start bot");
      }

      setMessage(data.message);
      setBotRunning(true);
    } catch (err) {
      setError(err.message);
    } finaly {
      setLoading(false);
    }
  };

  const stopBot = async () => {
    setLoading(true);
    setMessage("");
    setError("");
    try {
      const response = await fetch(`${import.meta.env.VITE_API_URL}/stop-bot`, {
        method: "POST",
      });
      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.detail || "Failed to stop bot");
      }

      setMessage(data.message);
      setBotRunning(false);
    } catch (err) {
      setError(err.message);
    } finaly {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchBotStatus();
    const interval = setInterval(fetchBotStatus, 3000);

    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <DashboardLayout>
      <div style={backgroundGlow}></div>
      <div style={containerStyle}>
        
        {/* HEADER */}
        <div style={topSection}>
          <div>
            <h1 style={titleStyle}>AI Trading Command Center</h1>
            <p style={subStyle}>Institutional cloud execution engine</p>
          </div>

          <div
            style={{
              ...statusBadge,
              background: botRunning ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
              color: botRunning ? "#10b981" : "#ef4444",
            }}
          >
            <div
              style={{
                ...pulseDot,
                background: botRunning ? "#10b981" : "#ef4444",
              }}
            />
            {botRunning ? "BOT ACTIVE" : "BOT OFFLINE"}
          </div>
        </div>

        {/* STATS */}
        <div style={statsGrid}>
          <StatCard
            icon={<Activity size={24} />}
            title="Account Balance"
            value={balance === "Loading..." ? balance : `${currency} ${balance}`}
          />
          {/* ✅ RENDER TARGET FIX: Consuming Forex/Gold properties directly from stream arrays */}
          <StatCard icon={<LineChart size={24} />} title="Gold Spot (XAU/USD)" value={marketPrices?.frxXAUUSD || "--"} />
          <StatCard icon={<LineChart size={24} />} title="Euro / US Dollar" value={marketPrices?.frxEURUSD || "--"} />
          <StatCard icon={<LineChart size={24} />} title="Pound / US Dollar" value={marketPrices?.frxGBPUSD || "--"} />
          <StatCard
            icon={<Bot size={24} />}
            title="AI Engine"
            value={botRunning ? "ONLINE" : "OFFLINE"}
          />
          <StatCard icon={<Cpu size={24} />} title="Strategy Confidence" value="92%" />
          <StatCard icon={<ShieldCheck size={24} />} title="Risk Management" value="ACTIVE" />
          <StatCard icon={<Wifi size={24} />} title="Server Latency" value="18ms" />
        </div>

        {/* MAIN GRID */}
        <div style={mainGrid}>
          {/* BOT CONTROL */}
          <div style={controlCard}>
            <h2 style={cardTitle}>Automated Trading Engine</h2>
            <p style={cardDesc}>Control your cloud-native AI asset execution system.</p>

            {message && <div style={successBox}>{message}</div>}
            {error && <div style={errorBox}>{error}</div>}

            <div style={buttonRow}>
              <button
                onClick={startBot}
                disabled={loading || botRunning}
                style={{
                  ...startButton,
                  opacity: loading || botRunning ? 0.6 : 1,
                }}
              >
                {loading ? "Processing..." : "Start Bot"}
              </button>

              <button
                onClick={stopBot}
                disabled={loading || !botRunning}
                style={{
                  ...stopButton,
                  opacity: loading || !botRunning ? 0.6 : 1,
                }}
              >
                Stop Bot
              </button>
            </div>
          </div>

          {/* LIVE ACTIVITY */}
          <div style={activityCard}>
            <h2 style={cardTitle}>Live Activity</h2>
            <div style={activityList}>
              <ActivityItem color="#10b981" text="AI macro liquidity scan completed" />
              <ActivityItem color="#fbbf24" text="XAU/USD spread imbalance flagged" />
              <ActivityItem color="#38bdf8" text="Cloud synchronization stable" />
              <ActivityItem color="#ef4444" text="Awaiting target trade confirmation" />
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Subcomponents
const StatCard = ({ icon, title, value }) => (
  <div style={statCard}>
    <div style={statIcon}>{icon}</div>
    <div>
      <div style={statTitle}>{title}</div>
      <div style={statValue}>{value}</div>
    </div>
  </div>
);

const ActivityItem = ({ color, text }) => (
  <div style={activityItem}>
    <div style={{ ...activityDot, background: color }} />
    {text}
  </div>
);

// Styles
const containerStyle = { color: "white", position: "relative", zIndex: 2 };
const backgroundGlow = { position: "fixed", top: "-200px", right: "-200px", width: "500px", height: "500px", background: "rgba(251,191,36,0.08)", filter: "blur(120px)", borderRadius: "50%", zIndex: 0 };
const topSection = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "20px" };
const titleStyle = { fontSize: "42px", marginBottom: "10px" };
const subStyle = { color: "#94a3b8", fontSize: "16px" };
const statusBadge = { display: "flex", alignItems: "center", gap: "10px", padding: "14px 22px", borderRadius: "30px", fontWeight: "700" };
const pulseDot = { width: "10px", height: "10px", borderRadius: "50%" };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(220px,1fr))", gap: "20px", marginBottom: "30px" };
const statCard = { background: "rgba(15,23,42,0.85)", border: "1px solid #1e293b", borderRadius: "20px", padding: "24px", display: "flex", alignItems: "center", gap: "18px", backdropFilter: "blur(14px)" };
const statIcon = { width: "52px", height: "52px", borderRadius: "16px", background: "rgba(251,191,36,0.1)", display: "flex", alignItems: "center", justifyContent: "center", color: "#fbbf24" };
const statTitle = { color: "#94a3b8", fontSize: "14px", marginBottom: "6px" };
const statValue = { fontSize: "20px", fontWeight: "700" };
const mainGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit,minmax(340px,1fr))", gap: "24px" };
const controlCard = { background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b", borderRadius: "24px", padding: "40px", backdropFilter: "blur(18px)" };
const activityCard = { background: "rgba(15,23,42,0.9)", border: "1px solid #1e293b", borderRadius: "24px", padding: "40px", backdropFilter: "blur(18px)" };
const cardTitle = { fontSize: "30px", marginBottom: "14px" };
const cardDesc = { color: "#94a3b8", marginBottom: "30px", lineHeight: "1.7" };
const buttonRow = { display: "flex", gap: "18px", flexWrap: "wrap" };
const startButton = { background: "#10b981", border: "none", padding: "16px 30px", borderRadius: "14px", color: "white", fontWeight: "700", cursor: "pointer", fontSize: "15px" };
const stopButton = { background: "#ef4444", border: "none", padding: "16px 30px", borderRadius: "14px", color: "white", fontWeight: "700", cursor: "pointer", fontSize: "15px" };
const activityList = { display: "flex", flexDirection: "column", gap: "18px" };
const activityItem = { display: "flex", alignItems: "center", gap: "14px", padding: "16px", background: "#020617", borderRadius: "14px", color: "#cbd5e1" };
const activityDot = { width: "12px", height: "12px", borderRadius: "50%" };
const successBox = { background: "#064e3b", color: "#6ee7b7", padding: "14px", borderRadius: "12px", marginBottom: "20px" };
const errorBox = { background: "#7f1d1d", color: "#fca5a5", padding: "14px", borderRadius: "12px", marginBottom: "20px" };

export default DashboardPage;