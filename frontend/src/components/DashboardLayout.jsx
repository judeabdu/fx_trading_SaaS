import React, { useState } from "react";

import { useNavigate } from "react-router-dom";

import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {

  const [sidebarOpen, setSidebarOpen] = useState(false);

  const navigate = useNavigate();

  const handleLogout = () => {

    localStorage.clear();

    sessionStorage.clear();

    navigate("/login", { replace: true });

    window.location.reload();
  };

  return (

    <div style={layoutWrapper}>

      {
        sidebarOpen && (
          <div
            style={overlay}
            onClick={() => setSidebarOpen(false)}
          />
        )
      }

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

        <Sidebar handleLogout={handleLogout} />

      </div>

      <div style={mainContent}>

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
                LIGER FX
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
  marginLeft: window.innerWidth < 768
    ? "20px"
    : "260px",

  padding:
    window.innerWidth < 768
      ? "16px"
      : "30px",

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