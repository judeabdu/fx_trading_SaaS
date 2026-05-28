import React, { useEffect, useState, useRef } from "react";
import DashboardLayout from "../components/DashboardLayout";
import { connectDerivSocket, disconnectDerivSocket } from "../services/derivSocket";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

function AnalyticsPage() {
  const [balance, setBalance] = useState("Loading...");
  const [currency, setCurrency] = useState("");
  
  // Real dynamic analytical metrics hooks
  const [winRate, setWinRate] = useState("Calculating...");
  const [riskReward, setRiskReward] = useState("Calculating...");
  const [totalTrades, setTotalTrades] = useState("0");
  const [equityCurve, setEquityCurve] = useState([]);
  const [growthPercentage, setGrowthPercentage] = useState("0%");
  const [disciplineAssessment, setDisciplineAssessment] = useState("Evaluating cloud execution data stream...");

  const socketInitialized = useRef(false);

  useEffect(() => {
    const token = localStorage.getItem("deriv_api_token");

    if (token && !socketInitialized.current) {
      socketInitialized.current = true;
      
      connectDerivSocket(token, (data) => {
        // 1. DYNAMIC ACCOUNT BALANCE HANDLER
        if (data.msg_type === "balance" && data.balance) {
          setBalance(Number(data.balance.balance).toFixed(2));
          setCurrency(data.balance.currency);
        }

        // 2. HISTORICAL PROFIT TABLE HANDLER (Calculates metrics from real closed contracts)
        if (data.msg_type === "profit" && data.profit) {
          const trades = data.profit.transactions || [];
          
          if (trades.length === 0) {
            setWinRate("0%");
            setRiskReward("N/A");
            setTotalTrades("0");
            setGrowthPercentage("0%");
            setDisciplineAssessment("No trade execution history found on this asset account yet.");
            return;
          }

          let wins = 0;
          let totalProfit = 0;
          let totalLoss = 0;
          let winCount = 0;
          let lossCount = 0;
          let runningEquity = 0;
          
          // Generate chronological metrics array
          const historicalPoints = trades.reverse().map((tx, index) => {
            const profitValue = parseFloat(tx.profit);
            runningEquity += profitValue;

            if (profitValue > 0) {
              wins++;
              totalProfit += profitValue;
              winCount++;
            } else if (profitValue < 0) {
              totalLoss += Math.abs(profitValue);
              lossCount++;
            }

            return {
              tradeIndex: `T-${index + 1}`,
              equity: runningEquity.toFixed(2)
            };
          });

          // Math Execution
          const computedWinRate = ((wins / trades.length) * 100).toFixed(1);
          const avgWin = winCount > 0 ? totalProfit / winCount : 0;
          const avgLoss = lossCount > 0 ? totalLoss / lossCount : 1;
          const computedRR = avgLoss > 0 ? `1 : ${(avgWin / avgLoss).toFixed(1)}` : "1 : 0.0";

          // Calculate approximate profile growth trend
          const finalGrowth = runningEquity > 0 ? `+${runningEquity.toFixed(1)}` : runningEquity.toFixed(1);

          // Update metrics UI state hooks
          setTotalTrades(trades.length.toString());
          setWinRate(`${computedWinRate}%`);
          setRiskReward(computedRR);
          setEquityCurve(historicalPoints);
          setGrowthPercentage(`${finalGrowth} ${data.profit.currency || ''}`);

          // DYNAMIC FINANCIAL DISCIPLINE FEEDBACK ENGINE
          if (parseFloat(computedWinRate) >= 60 && (avgWin / avgLoss) >= 1.5) {
            setDisciplineAssessment("Excellent institutional grade risk management. Consistent target ratios detected, with well-structured trade placement and tight systemic drawdown control.");
          } else if (parseFloat(computedWinRate) < 45) {
            setDisciplineAssessment("Caution: High volatility exposure noted. Strategy indicators show over-leverage risks or impulsive entries. Tighten your trailing stops to protect current asset pools.");
          } else {
            setDisciplineAssessment("Stable distribution model. Strategy maintains normal operating compliance boundaries. Risk profiles show structured compound tracking parameters across recent execution history.");
          }
        }
      });
    }

    return () => {
      disconnectDerivSocket();
      socketInitialized.current = false;
    };
  }, []);

  return (
    <DashboardLayout>
      <div style={containerStyle}>
        
        {/* REPORTING & ACCOUNT HEADER */}
        <div style={reportHeader}>
          <div style={tenantMeta}>
            <span style={tenantName}>FX-TRADING SaaS Engine</span>
            <div style={accountInfo}>
              <span>Account Holder: <strong>System Operator</strong></span>
              <span style={divider}>|</span>
              <span>Member ID: <strong>DX-10892026</strong></span>
            </div>
          </div>
          <div style={periodBadge}>
            Reporting Period: H1 2026
          </div>
        </div>

        <div style={headerRow}>
          <div>
            <h1 style={pageTitle}>Trading Analytics</h1>
            <p style={pageSub}>Institutional performance intelligence</p>
          </div>
          <div style={aiBadge}>AI ANALYSIS ACTIVE</div>
        </div>

        {/* STATS GRID */}
        <div style={statsGrid}>
          <AnalyticsCard
            title="Live Broker Balance"
            value={currency ? `${currency} ${balance}` : balance}
            color="#fbbf24"
          />
          <AnalyticsCard
            title="Win Rate"
            value={winRate}
            color="#10b981"
          />
          <AnalyticsCard
            title="Risk / Reward Ratio"
            value={riskReward}
            color="#3b82f6"
          />
          <AnalyticsCard
            title="Trades Closed"
            value={totalTrades}
            color="#ef4444"
          />
        </div>

        {/* EQUITY GRAPH CARD */}
        <div style={chartCard}>
          <div style={chartHeader}>
            <h2 style={chartTitle}>Equity Curve (Real-Time Growth Timeline)</h2>
            <span style={growthBadge}>{growthPercentage}</span>
          </div>

          <div style={{ width: "100%", height: 350 }}>
            {equityCurve.length === 0 ? (
              <div style={loadingChartContainer}>Awaiting Broker Trade History Stream...</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={equityCurve} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="tradeIndex" stroke="#64748b" tickLine={false} />
                  <YAxis stroke="#64748b" tickLine={false} domain={['auto', 'auto']} />
                  <Tooltip 
                    contentStyle={{ background: "#020617", border: "1px solid #1e293b", borderRadius: "8px", color: "#fff" }}
                  />
                  <Line
                    type="monotone"
                    dataKey="equity"
                    stroke="#fbbf24"
                    strokeWidth={3}
                    dot={{ r: 3, stroke: "#0f172a", strokeWidth: 1 }}
                    activeDot={{ r: 6 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* FINANCIAL DISCIPLINE FEEDBACK */}
        <div style={insightCard}>
          <h2 style={insightTitle}>AI Financial Discipline Assessment</h2>
          <p style={insightText}>{disciplineAssessment}</p>
        </div>

      </div>
    </DashboardLayout>
  );
}

function AnalyticsCard({ title, value, color }) {
  return (
    <div style={cardStyle}>
      <span style={cardTitle}>{title}</span>
      <h2 style={{ color, marginTop: "12px", fontSize: "28px", fontWeight: "700" }}>
        {value}
      </h2>
    </div>
  );
}

// Styles Rules Objects
const containerStyle = { color: "white", padding: "10px 0" };
const headerRow = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px", flexWrap: "wrap", gap: "15px" };
const pageTitle = { fontSize: "32px", fontWeight: "700" };
const pageSub = { color: "#64748b", marginTop: "4px" };
const aiBadge = { background: "rgba(16,185,129,0.1)", color: "#10b981", border: "1px solid rgba(16,185,129,0.3)", padding: "10px 18px", borderRadius: "30px", fontSize: "12px", fontWeight: "700" };
const statsGrid = { display: "grid", gridTemplateColumns: "repeat(auto-fit, minmax(220px, 1fr))", gap: "20px", marginBottom: "30px" };
const cardStyle = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: "16px", padding: "24px", backdropFilter: "blur(10px)" };
const cardTitle = { color: "#64748b", fontSize: "12px", fontWeight: "600", textTransform: "uppercase", letterSpacing: "0.5px" };
const chartCard = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: "18px", padding: "30px", marginBottom: "30px" };
const chartHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "25px" };
const chartTitle = { fontSize: "20px", fontWeight: "600" };
const growthBadge = { color: "#10b981", fontWeight: "700", background: "rgba(16,185,129,0.1)", padding: "6px 12px", borderRadius: "8px", fontSize: "14px" };
const insightCard = { background: "#0f172a", border: "1px solid #1e293b", borderRadius: "18px", padding: "30px" };
const insightTitle = { marginBottom: "14px", fontSize: "18px", fontWeight: "600" };
const insightText = { color: "#94a3b8", lineHeight: "1.8", fontSize: "15px" };
const reportHeader = { display: "flex", justifyContent: "space-between", alignItems: "center", borderBottom: "1px solid #1e293b", paddingBottom: "20px", marginBottom: "25px", flexWrap: "wrap", gap: "15px" };
const tenantMeta = { display: "flex", flexDirection: "column", gap: "6px" };
const tenantName = { fontSize: "14px", fontWeight: "800", color: "#fbbf24", letterSpacing: "1px" };
const accountInfo = { fontSize: "13px", color: "#94a3b8", display: "flex", gap: "10px" };
const divider = { color: "#334155" };
const periodBadge = { fontSize: "12px", color: "#64748b", background: "#1e293b", padding: "6px 14px", borderRadius: "6px", border: "1px solid #334155" };
const loadingChartContainer = { height: "100%", display: "flex", alignItems: "center", justifyContent: "center", color: "#64748b", fontSize: "14px", border: "1px dashed #1e293b", borderRadius: "12px" };

export default AnalyticsPage;