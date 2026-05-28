import React, { useState, useEffect } from "react";
import { Bell, ArrowUpRight, ArrowDownRight, Flame } from "lucide-react";

export function SignalFeedCard({ userTier }) {
  const [signals, setSignals] = useState([]);

  useEffect(() => {
    // Dynamically build the Server-Sent Events stream URL from your VITE env variable
    const sseUrl = `${import.meta.env.VITE_API_URL.replace('/api', '')}/api/signals/stream`;
    console.log("🔗 Connecting live signal stream to endpoint:", sseUrl);
    
    const eventSource = new EventSource(sseUrl);

    eventSource.onmessage = (event) => {
      try {
        const incomingSignal = JSON.parse(event.data);
        console.log("🚨 Fresh setup added to state collection:", incomingSignal);
        
        // Keeps up to 5 of the newest incoming signals visible in a clean stack list
        setSignals((prev) => [incomingSignal, ...prev.slice(0, 4)]);
      } catch (err) {
        console.error("Error unpacking streaming network event payload:", err);
      }
    };

    eventSource.onerror = (err) => {
      console.warn("⚠️ Signal stream connection dropped. Reconnecting automatically...");
    };

    return () => {
      eventSource.close(); // Clean up connections to prevent network memory leaks
    };
  }, []);

  return (
    <div style={cardWrapper}>
      <div style={cardHeader}>
        <div style={{ display: "flex", alignItems: "center", gap: "12px" }}>
          <div style={bellRing}>
            <Bell color="#fbbf24" size={20} />
          </div>
          <div>
            <h2 style={{ margin: 0, fontSize: "20px", fontWeight: "700" }}>Live Institutional Signal Feed</h2>
            <p style={{ margin: 0, fontSize: "12px", color: "#64748b" }}>Real-time Fair Value Gap structural scanner</p>
          </div>
        </div>
        <span style={{
          ...badgeStyle,
          background: userTier === "AUTOMATED_EXECUTION" ? "rgba(16,185,129,0.1)" : "rgba(251,191,36,0.1)",
          color: userTier === "AUTOMATED_EXECUTION" ? "#10b981" : "#fbbf24"
        }}>
          {userTier === "AUTOMATED_EXECUTION" ? "PRO AUTOMATED" : "BASIC SIGNALS"}
        </span>
      </div>

      <div style={listContainer}>
        {signals.length === 0 ? (
          <div style={emptyContainer}>
            <Flame size={20} color="#334155" style={{ marginBottom: "8px" }} />
            <p style={{ color: "#475569", margin: 0, fontSize: "14px" }}>
              Scanning Forex & Gold spot markets for order blocks...
            </p>
          </div>
        ) : (
          signals.map((sig, i) => (
            <div key={i} style={signalItem}>
              <div>
                <div style={{ fontWeight: "800", fontSize: "16px", color: "#f8fafc" }}>{sig.symbol}</div>
                <div style={{ color: "#94a3b8", fontSize: "13px", marginTop: "2px" }}>
                  Order Entry Point: <span style={{ color: "#f1f5f9", fontWeight: "600" }}>{sig.entry}</span>
                </div>
              </div>
              
              <div style={{
                ...dirBadge,
                background: sig.direction === "BUY" ? "rgba(16,185,129,0.15)" : "rgba(239,68,68,0.15)",
                color: sig.direction === "BUY" ? "#10b981" : "#ef4444"
              }}>
                {sig.direction === "BUY" ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                <span style={{ fontSize: "13px", fontWeight: "800" }}>{sig.direction}</span>
              </div>
            </div>
          ))
        )}
      </div>

      {userTier === "SIGNALS_ONLY" && (
        <div style={upgradeBanner}>
          💡 <span style={{ color: "#cbd5e1" }}>Want the Liger FX bot to place these setups automatically?</span> 
          <span style={{ color: "#fbbf24", cursor: "pointer", marginLeft: "6px", fontWeight: "700", textDecoration: "underline" }}>
            Upgrade to Pro Automation Tier →
          </span>
        </div>
      )}
    </div>
  );
}

// Visual layout styles matching your dark dashboard theme
const cardWrapper = { background: "rgba(15,23,42,0.85)", border: "1px solid #1e293b", borderRadius: "24px", padding: "30px", backdropFilter: "blur(14px)" };
const cardHeader = { display: "flex", justifyContent: "space-between", alignItems: "flex-start", marginBottom: "24px" };
const bellRing = { width: "40px", height: "40px", borderRadius: "12px", background: "rgba(251,191,36,0.06)", display: "flex", alignItems: "center", justifyContent: "center" };
const badgeStyle = { padding: "6px 12px", borderRadius: "10px", fontSize: "11px", fontWeight: "800", tracking: "wider" };
const listContainer = { display: "flex", flexDirection: "column", gap: "14px" };
const signalItem = { display: "flex", justifyContent: "space-between", alignItems: "center", padding: "18px", background: "#020617", borderRadius: "16px", border: "1px solid #0f172a" };
const dirBadge = { display: "flex", alignItems: "center", gap: "6px", padding: "8px 14px", borderRadius: "12px" };
const emptyContainer = { padding: "40px 20px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", background: "rgba(2,6,23,0.3)", borderRadius: "16px", border: "1px dashed #0f172a" };
const upgradeBanner = { marginTop: "24px", padding: "16px", background: "rgba(251,191,36,0.03)", border: "1px dashed rgba(251,191,36,0.2)", borderRadius: "16px", fontSize: "13px", textAlign: "center" };