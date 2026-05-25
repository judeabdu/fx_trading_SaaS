import React from "react";
import Sidebar from "./Sidebar";

function DashboardLayout({ children }) {

  const handleLogout = () => {
    localStorage.removeItem("goldbot_token");
    localStorage.removeItem("goldbot_user");
    window.location.href = "/login";
  };

  return (
    <div style={layoutContainer}>

      <Sidebar handleLogout={handleLogout} />

      <main style={mainContent}>
        {children}
      </main>

    </div>
  );
}

const layoutContainer = {
  display: "flex",
  minHeight: "100vh",
  background: "#020617",
  color: "white",
  overflowX: "hidden"
};

const mainContent = {
  flex: 1,
  marginLeft: "260px",
  padding: "30px",
  width: "100%",
  boxSizing: "border-box"
};

export default DashboardLayout;
