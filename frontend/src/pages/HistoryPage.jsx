import React from "react";

import DashboardLayout from "../components/DashboardLayout";

const historyData = [
  {
    symbol: "XAUUSD",
    type: "BUY",
    lots: 0.10,
    entry: 3321.44,
    close: 3340.12,
    profit: 186
  },

  {
    symbol: "EURUSD",
    type: "SELL",
    lots: 0.20,
    entry: 1.1022,
    close: 1.0981,
    profit: 92
  },

  {
    symbol: "GBPUSD",
    type: "BUY",
    lots: 0.15,
    entry: 1.2521,
    close: 1.2480,
    profit: -61
  }
];

function HistoryPage() {

  return (

    <DashboardLayout>

      <div style={containerStyle}>

        <div style={topRow}>

          <div>

            <h1 style={titleStyle}>
              Trade History
            </h1>

            <p style={subStyle}>
              Closed execution records
            </p>

          </div>

          <div style={badgeStyle}>
            HISTORICAL DATA
          </div>

        </div>

        <div style={tableCard}>

          <table style={tableStyle}>

            <thead>

              <tr>

                <th style={thStyle}>Symbol</th>
                <th style={thStyle}>Type</th>
                <th style={thStyle}>Lots</th>
                <th style={thStyle}>Entry</th>
                <th style={thStyle}>Close</th>
                <th style={thStyle}>Profit</th>

              </tr>

            </thead>

            <tbody>

              {
                historyData.map((trade, i) => (

                  <tr
                    key={i}
                    style={rowStyle}
                  >

                    <td style={tdStyle}>
                      {trade.symbol}
                    </td>

                    <td style={{
                      ...tdStyle,
                      color:
                        trade.type === "BUY"
                        ? "#10b981"
                        : "#ef4444",
                      fontWeight: "700"
                    }}>
                      {trade.type}
                    </td>

                    <td style={tdStyle}>
                      {trade.lots}
                    </td>

                    <td style={tdStyle}>
                      {trade.entry}
                    </td>

                    <td style={tdStyle}>
                      {trade.close}
                    </td>

                    <td style={{
                      ...tdStyle,
                      color:
                        trade.profit >= 0
                        ? "#10b981"
                        : "#ef4444",
                      fontWeight: "700"
                    }}>
                      {trade.profit}
                    </td>

                  </tr>
                ))
              }

            </tbody>

          </table>

        </div>

      </div>

    </DashboardLayout>
  );
}

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
