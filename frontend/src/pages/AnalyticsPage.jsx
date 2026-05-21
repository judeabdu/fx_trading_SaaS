import React from "react";

import DashboardLayout from "../components/DashboardLayout";

import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from "recharts";

const performanceData = [
  { month: "Jan", equity: 1200 },
  { month: "Feb", equity: 2100 },
  { month: "Mar", equity: 1800 },
  { month: "Apr", equity: 3200 },
  { month: "May", equity: 4700 },
  { month: "Jun", equity: 6100 }
];

function AnalyticsPage() {

  return (

    <DashboardLayout>

      <div style={containerStyle}>

        <div style={headerRow}>

          <div>

            <h1 style={pageTitle}>
              Trading Analytics
            </h1>

            <p style={pageSub}>
              Institutional performance intelligence
            </p>

          </div>

          <div style={aiBadge}>
            AI ANALYSIS ACTIVE
          </div>

        </div>

        <div style={statsGrid}>

          <AnalyticsCard
            title="Win Rate"
            value="78%"
            color="#10b981"
          />

          <AnalyticsCard
            title="Risk / Reward"
            value="1 : 3.4"
            color="#fbbf24"
          />

          <AnalyticsCard
            title="Monthly Growth"
            value="+42%"
            color="#3b82f6"
          />

          <AnalyticsCard
            title="Trades Closed"
            value="148"
            color="#ef4444"
          />

        </div>

        <div style={chartCard}>

          <div style={chartHeader}>
            <h2 style={chartTitle}>
              Equity Curve
            </h2>

            <span style={growthBadge}>
              +408%
            </span>
          </div>

          <ResponsiveContainer
            width="100%"
            height={350}
          >

            <LineChart data={performanceData}>

              <CartesianGrid
                strokeDasharray="3 3"
                stroke="#1e293b"
              />

              <XAxis
                dataKey="month"
                stroke="#64748b"
              />

              <YAxis
                stroke="#64748b"
              />

              <Tooltip />

              <Line
                type="monotone"
                dataKey="equity"
                stroke="#fbbf24"
                strokeWidth={3}
              />

            </LineChart>

          </ResponsiveContainer>

        </div>

        <div style={insightCard}>

          <h2 style={insightTitle}>
            AI Performance Insight
          </h2>

          <p style={insightText}>

            Your strategy demonstrates
            strong trend-following behavior
            with excellent drawdown control.

            Current analytics indicate:
            high institutional-grade
            risk discipline and stable
            profit extraction efficiency.

          </p>

        </div>

      </div>

    </DashboardLayout>
  );
}

function AnalyticsCard({
  title,
  value,
  color
}) {

  return (

    <div style={cardStyle}>

      <span style={cardTitle}>
        {title}
      </span>

      <h2 style={{
        color,
        marginTop: "12px",
        fontSize: "32px"
      }}>
        {value}
      </h2>

    </div>
  );
}

const containerStyle = {
  color: "white"
};

const headerRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px"
};

const pageTitle = {
  fontSize: "32px",
  marginBottom: "6px"
};

const pageSub = {
  color: "#64748b"
};

const aiBadge = {
  background: "rgba(16,185,129,0.1)",
  color: "#10b981",
  border: "1px solid #10b981",
  padding: "10px 18px",
  borderRadius: "30px",
  fontSize: "12px",
  fontWeight: "700"
};

const statsGrid = {
  display: "grid",
  gridTemplateColumns: "repeat(4, 1fr)",
  gap: "20px",
  marginBottom: "30px"
};

const cardStyle = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "16px",
  padding: "24px"
};

const cardTitle = {
  color: "#64748b",
  fontSize: "13px",
  textTransform: "uppercase"
};

const chartCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "18px",
  padding: "30px",
  marginBottom: "30px"
};

const chartHeader = {
  display: "flex",
  justifyContent: "space-between",
  marginBottom: "20px"
};

const chartTitle = {
  fontSize: "20px"
};

const growthBadge = {
  color: "#10b981",
  fontWeight: "700"
};

const insightCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "18px",
  padding: "30px"
};

const insightTitle = {
  marginBottom: "18px"
};

const insightText = {
  color: "#94a3b8",
  lineHeight: "1.8",
  fontSize: "15px"
};

export default AnalyticsPage;
