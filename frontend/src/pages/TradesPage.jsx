import React, {
  useEffect,
  useState
} from "react";

import DashboardLayout from "../components/DashboardLayout";

function TradesPage() {

  const [trades, setTrades] = useState([]);

  const [loading, setLoading] = useState(true);

  useEffect(() => {

    const fetchTrades = async () => {

      try {

        const response = await fetch(
          `${import.meta.env.VITE_API_URL}/status`
        );

        const data = await response.json();

        if (data.active_trades) {

          setTrades(data.active_trades);
        }

      } catch (error) {

        console.error(error);

      } finally {

        setLoading(false);
      }
    };

    fetchTrades();

    const interval = setInterval(
      fetchTrades,
      4000
    );

    return () => clearInterval(interval);

  }, []);

  return (

    <DashboardLayout>

      <div style={containerStyle}>

        <div style={topRow}>

          <div>

            <h1 style={titleStyle}>
              Live Trade Terminal
            </h1>

            <p style={subStyle}>
              Real-time MT5 execution feed
            </p>

          </div>

          <div style={liveBadge}>
            LIVE MARKET
          </div>

        </div>

        <div style={tableCard}>

          <table style={tableStyle}>

            <thead>

              <tr>

                <th style={thStyle}>
                  Symbol
                </th>

                <th style={thStyle}>
                  Direction
                </th>

                <th style={thStyle}>
                  Lots
                </th>

                <th style={thStyle}>
                  Open Price
                </th>

                <th style={thStyle}>
                  Profit
                </th>

              </tr>

            </thead>

            <tbody>

              {
                loading
                ? (
                  <tr>

                    <td
                      colSpan="5"
                      style={loadingStyle}
                    >
                      Loading trades...
                    </td>

                  </tr>
                )

                : trades.length > 0
                ? (
                    trades.map((trade, i) => (

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
                          {trade.openPrice}
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
                  )

                : (
                  <tr>

                    <td
                      colSpan="5"
                      style={loadingStyle}
                    >
                      No active trades
                    </td>

                  </tr>
                )
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

const liveBadge = {
  background: "rgba(16,185,129,0.1)",
  border: "1px solid #10b981",
  color: "#10b981",
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

const loadingStyle = {
  padding: "40px",
  textAlign: "center",
  color: "#64748b"
};

export default TradesPage;
