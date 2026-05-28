import React, { useState, useEffect } from "react";
import DashboardLayout from "../components/DashboardLayout";

function HistoryPage() {
  const [historyData, setHistoryData] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch data from your backend
  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Change this URL to your actual backend endpoint
        const response = await fetch("/api/trades/history");
        const data = await response.json();
        setHistoryData(data);
      } catch (error) {
        console.error("Failed to fetch Deriv history:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchHistory();
  }, []);

  return (
    <DashboardLayout>
      <div style={containerStyle}>
        <div style={topRow}>
          <div>
            <h1 style={titleStyle}>Trade History</h1>
            <p style={subStyle}>Real-time Deriv execution records</p>
          </div>
          <div style={badgeStyle}>LIVE DERIV DATA</div>
        </div>

        <div style={tableCard}>
          <table style={tableStyle}>
            <thead>
              <tr>
                <th style={thStyle}>Symbol</th>
                <th style={thStyle}>Side</th>
                <th style={thStyle}>Entry Price</th>
                <th style={thStyle}>Profit/Loss</th>
                <th style={thStyle}>Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={tdStyle}>Loading...</td></tr>
              ) : (
                historyData.map((trade, i) => (
                  <tr key={i} style={rowStyle}>
                    <td style={tdStyle}>{trade.symbol.replace('frx', '')}</td>
                    <td style={{ ...tdStyle, color: trade.side === "BUY" ? "#10b981" : "#ef4444", fontWeight: "700" }}>
                      {trade.side}
                    </td>
                    <td style={tdStyle}>{trade.entry_price}</td>
                    <td style={{ ...tdStyle, color: trade.profit_loss >= 0 ? "#10b981" : "#ef4444", fontWeight: "700" }}>
                      {trade.profit_loss}
                    </td>
                    <td style={tdStyle}>{trade.status}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </DashboardLayout>
  );
}

// Keep your existing styles below this line...

const containerStyle = {
  color: "white"
};

const topRow = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px"
};

const titleStyle = {
  fontSize: "30px",
  marginBottom: "8px"
};

const subStyle = {
  color: "#64748b"
};

const badgeStyle = {
  background: "rgba(59,130,246,0.1)",
  border: "1px solid #3b82f6",
  color: "#3b82f6",
  padding: "10px 18px",
  borderRadius: "30px",
  fontWeight: "700",
  fontSize: "12px"
};

const tableCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "18px",
  overflow: "hidden"
};

const tableStyle = {
  width: "100%",
  borderCollapse: "collapse"
};

const thStyle = {
  padding: "18px",
  textAlign: "left",
  color: "#64748b",
  borderBottom: "1px solid #1e293b",
  fontSize: "12px",
  textTransform: "uppercase"
};

const tdStyle = {
  padding: "18px",
  borderBottom: "1px solid #1e293b"
};

const rowStyle = {
  background: "#0f172a"
};

export default HistoryPage;
