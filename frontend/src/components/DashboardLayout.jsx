import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);
  const navigate = useNavigate();

  // Robust runtime window tracking safely hooked into React lifecycle events
  useEffect(() => {
    const handleResize = () => {
      const mobileView = window.innerWidth < 1024; // Expanded threshold to safely hold 4 column stats card layouts
      setIsMobile(mobileView);
    };

    // Initial check on viewport registration
    handleResize();

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  const handleLogout = () => {
    localStorage.clear();
    sessionStorage.clear();
    navigate("/login", { replace: true });
    window.location.reload();
  };

  return (
    <div style={layoutWrapper}>
      {/* Dimmed backdrop overlay panel for fluid mobile handling focus drawer actions */}
      {isMobile && sidebarOpen && (
        <div style={overlay} onClick={() => setSidebarOpen(false)} />
      )}

      {/* Persistent / Sliding Navigation Sidebar Container Rack */}
      <div
        style={{
          ...sidebarContainer,
          transform: isMobile 
            ? sidebarOpen 
              ? "translateX(0)" 
              : "translateX(-100%)" 
            : "translateX(0)",
          position: isMobile ? "fixed" : "sticky",
        }}
      >
        <Sidebar handleLogout={handleLogout} />
      </div>

      {/* Main Fluid Execution Dashboard Canvas Zone */}
      <div
        style={{
          ...mainContent,
          padding: isMobile ? "16px" : "40px",
        }}
      >
        {isMobile && (
          <div style={topbar}>
            <button style={menuButton} onClick={() => setSidebarOpen(!sidebarOpen)}>
              ☰
            </button>
            <h2 style={{ margin: 0, fontSize: "22px", fontWeight: "800", color: "#fbbf24", tracking: "wider" }}>
              LIGER FX
            </h2>
          </div>
        )}

        {/* This natively injects your clean DashboardPage.jsx components holding the XAU/USD, EUR/USD & GBP/USD charts */}
        <div style={pageInnerWrapper}>
          {children}
        </div>
      </div>
    </div>
  );
}

// Modern High-Performance Layout Configurations
const layoutWrapper = {
  display: "flex",
  width: "100vw",
  minHeight: "100vh",
  background: "#020617",
  overflowX: "hidden",
};

const sidebarContainer = {
  top: 0,
  left: 0,
  width: "260px",
  minWidth: "260px",
  height: "100vh",
  zIndex: 1000,
  transition: "transform 0.3s cubic-bezier(0.4, 0, 0.2, 1)",
  background: "rgba(15, 23, 42, 0.95)",
  borderRight: "1px solid #1e293b",
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  background: "rgba(2, 6, 23, 0.7)",
  backdropFilter: "blur(4px)",
  zIndex: 999,
};

const mainContent = {
  flex: 1,
  display: "flex",
  flexDirection: "column",
  minHeight: "100vh",
  maxWidth: "100%",
  boxSizing: "border-box",
  overflowY: "auto",
};

const pageInnerWrapper = {
  width: "100%",
  margin: "0 auto",
  flex: 1,
  display: "flex",
  flexDirection: "column",
};

const topbar = {
  display: "flex",
  alignItems: "center",
  gap: "20px",
  marginBottom: "24px",
  background: "rgba(15, 23, 42, 0.6)",
  padding: "12px 20px",
  borderRadius: "16px",
  border: "1px solid #1e293b",
  backdropFilter: "blur(10px)",
};

const menuButton = {
  background: "#fbbf24",
  color: "#020617",
  border: "none",
  padding: "12px 16px",
  borderRadius: "12px",
  fontSize: "20px",
  fontWeight: "bold",
  cursor: "pointer",
  boxShadow: "0 4px 12px rgba(251, 191, 36, 0.2)",
  transition: "transform 0.2s ease",
};

export default DashboardLayout;