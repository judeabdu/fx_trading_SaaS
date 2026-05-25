import React, { useState } from "react";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (

    <div style={layoutWrapper}>

      {/* MOBILE OVERLAY */}

      {
        sidebarOpen && (
          <div
            style={overlay}
            onClick={() => setSidebarOpen(false)}
          />
        )
      }

      {/* SIDEBAR */}

      <div
        style={{
          ...sidebarContainer,

          transform:
            window.innerWidth < 768
              ? sidebarOpen
                ? "translateX(0)"
                : "translateX(-100%)"
              : "translateX(0)"
        }}
      >
        <Sidebar />
      </div>

      {/* MAIN AREA */}

      <div style={mainContent}>

        {/* MOBILE TOPBAR */}

        {
          window.innerWidth < 768 && (
            <div style={topbar}>

              <button
                style={menuButton}
                onClick={() =>
                  setSidebarOpen(!sidebarOpen)
                }
              >
                ☰
              </button>

              <h2 style={{ margin: 0 }}>
                JUDEFX
              </h2>

            </div>
          )
        }

        {children}

      </div>

    </div>
  );
}

const layoutWrapper = {
  display: "flex",
  width: "100%",
  minHeight: "100vh",
  overflowX: "hidden",
  background: "#020617"
};

const sidebarContainer = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "260px",
  height: "100vh",
  zIndex: 1000,
  transition: "0.3s ease"
};

const overlay = {
  position: "fixed",
  top: 0,
  left: 0,
  width: "100%",
  height: "100%",
  background: "rgba(0,0,0,0.5)",
  zIndex: 999
};

const mainContent = {
  flex: 1,
  marginLeft: window.innerWidth < 768 ? "0" : "260px",
  padding: window.innerWidth < 768 ? "16px" : "30px",
  width: "100%",
  minHeight: "100vh",
  overflowX: "hidden",
  boxSizing: "border-box"
};

const topbar = {
  display: "flex",
  alignItems: "center",
  gap: "16px",
  marginBottom: "20px"
};

const menuButton = {
  background: "#fbbf24",
  border: "none",
  padding: "10px 14px",
  borderRadius: "10px",
  fontSize: "20px",
  cursor: "pointer"
};

export default DashboardLayout;