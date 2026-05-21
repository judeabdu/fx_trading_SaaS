import React, {
  useEffect,
  useState
} from "react";

import DashboardLayout from "../components/DashboardLayout";

function DashboardPage() {

  const [botRunning, setBotRunning] = useState(false);

  const [loading, setLoading] = useState(false);

  const [message, setMessage] = useState("");

  const [error, setError] = useState("");

  // =========================
  // FETCH BOT STATUS
  // =========================
  const fetchBotStatus = async () => {

    try {

      const response = await fetch(
      );

      const data = await response.json();

      setBotRunning(data.running);

    } catch (err) {

      console.error(err);
    }
  };

  // =========================
  // START BOT
  // =========================
  const startBot = async () => {

    setLoading(true);

    setMessage("");

    setError("");

    try {

      const response = await fetch(
`${import.meta.env.VITE_API_URL}/start-bot`,
        {
          method: "POST"
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail || "Failed to start bot"
        );
      }

      setMessage(data.message);

      setBotRunning(true);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // STOP BOT
  // =========================
  const stopBot = async () => {

    setLoading(true);

    setMessage("");

    setError("");

    try {

      const response = await fetch(
`${import.meta.env.VITE_API_URL}/stop-bot`,
        {
          method: "POST"
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail || "Failed to stop bot"
        );
      }

      setMessage(data.message);

      setBotRunning(false);

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);
    }
  };

  // =========================
  // LIVE STATUS POLLING
  // =========================
  useEffect(() => {

    fetchBotStatus();

    const interval = setInterval(
      fetchBotStatus,
      3000
    );

    return () => clearInterval(interval);

  }, []);

  return (

    <DashboardLayout>

      <div style={containerStyle}>

        <div style={topSection}>

          <div>

            <h1 style={titleStyle}>
              Trading Bot Control
            </h1>

            <p style={subStyle}>
              Institutional automated execution engine
            </p>

          </div>

          <div style={{
            ...statusBadge,
            background: botRunning
              ? "rgba(16,185,129,0.1)"
              : "rgba(239,68,68,0.1)",

            borderColor: botRunning
              ? "#10b981"
              : "#ef4444",

            color: botRunning
              ? "#10b981"
              : "#ef4444"
          }}>

            {
              botRunning
                ? "BOT RUNNING"
                : "BOT STOPPED"
            }

          </div>

        </div>

        <div style={controlCard}>

          <h2 style={cardTitle}>
            Automated Trading Engine
          </h2>

          <p style={cardDesc}>

            Start or stop your
            AI-powered MT5 trading engine.

          </p>

          {message && (
            <div style={successBox}>
              {message}
            </div>
          )}

          {error && (
            <div style={errorBox}>
              {error}
            </div>
          )}

          <div style={buttonRow}>

            <button
              onClick={startBot}
              disabled={loading || botRunning}
              style={{
                ...startButton,
                opacity:
                  loading || botRunning
                    ? 0.6
                    : 1
              }}
            >
              {
                loading
                  ? "Processing..."
                  : "Start Bot"
              }
            </button>

            <button
              onClick={stopBot}
              disabled={loading || !botRunning}
              style={{
                ...stopButton,
                opacity:
                  loading || !botRunning
                    ? 0.6
                    : 1
              }}
            >
              Stop Bot
            </button>

          </div>

        </div>

      </div>

    </DashboardLayout>
  );
}

const containerStyle = {
  color: "white"
};

const topSection = {
  display: "flex",
  justifyContent: "space-between",
  alignItems: "center",
  marginBottom: "30px"
};

const titleStyle = {
  fontSize: "34px",
  marginBottom: "8px"
};

const subStyle = {
  color: "#64748b"
};

const statusBadge = {
  padding: "12px 20px",
  borderRadius: "30px",
  border: "1px solid",
  fontWeight: "700",
  fontSize: "12px"
};

const controlCard = {
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "20px",
  padding: "40px",
  maxWidth: "700px"
};

const cardTitle = {
  fontSize: "28px",
  marginBottom: "12px"
};

const cardDesc = {
  color: "#94a3b8",
  marginBottom: "30px",
  lineHeight: "1.8"
};

const buttonRow = {
  display: "flex",
  gap: "20px"
};

const startButton = {
  background: "#10b981",
  border: "none",
  padding: "16px 28px",
  borderRadius: "12px",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "15px"
};

const stopButton = {
  background: "#ef4444",
  border: "none",
  padding: "16px 28px",
  borderRadius: "12px",
  color: "white",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "15px"
};

const successBox = {
  background: "#064e3b",
  color: "#6ee7b7",
  padding: "14px",
  borderRadius: "10px",
  marginBottom: "20px"
};

const errorBox = {
  background: "#7f1d1d",
  color: "#fca5a5",
  padding: "14px",
  borderRadius: "10px",
  marginBottom: "20px"
};

export default DashboardPage;
