import React from "react";
import DashboardLayout from "../components/DashboardLayout";
import { useSocket } from "../context/SocketContext";
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
  // Grab live, processed transaction calculations directly from context hook
  const { 
    balance, currency, winRate, riskReward, 
    totalTrades, equityCurve, growthPercentage, 
    disciplineAssessment 
  } = useSocket();

  return (
    <DashboardLayout>
      <div style={containerStyle}>
        
        {/* ACCOUNT STATUS METADATA OVERVIEW */}
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

        {/* METRICS SUMMARY GRID */}
        <div style={statsGrid}>
          <AnalyticsCard
            title="Live Broker Balance"
            value={balance === "Loading..." ? balance : `${currency} ${balance}`}
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

        {/* ACCOUNT GRAPH TIMELINE */}
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

        {/* RULE ADHERENCE EVALUATION */}
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

// Layout Configuration Objects
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