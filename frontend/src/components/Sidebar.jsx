import { Link, useLocation } from "react-router-dom";
import React from "react";
import { 
  LayoutDashboard, 
  BarChart3, 
  LineChart, 
  History, 
  CreditCard, 
  Settings, 
  LogOut 
} from "lucide-react";

const Sidebar = ({ handleLogout }) => {

  const location = useLocation();
  return (
    <aside style={sidebarStyle}>
      <div style={logoArea}>
        <div style={judeLogoSmall}>J</div>
        <h2 style={sidebarBrand}>JUDE<span style={{ color: "#fbbf24" }}>FX</span></h2>
      </div>
      
      <div style={navGroup}>

  <Link
    to="/"
    style={{ textDecoration: "none" }}
  >
    <NavItem
      icon={<LayoutDashboard size={18} />}
      label="Dashboard"
      active={location.pathname === "/"}
    />
  </Link>

  <Link
    to="/analytics"
    style={{ textDecoration: "none" }}
  >
    <NavItem
      icon={<BarChart3 size={18} />}
      label="Analytics"
      active={location.pathname === "/analytics"}
    />
  </Link>

  <Link
  to="/trades"
  style={{ textDecoration: "none" }}
>
  <NavItem
    icon={<LineChart size={18} />}
    label="Live Trades"
    active={location.pathname === "/trades"}
  />
</Link>

  <Link
  to="/history"
  style={{ textDecoration: "none" }}
>
  <NavItem
    icon={<History size={18} />}
    label="History"
    active={location.pathname === "/history"}
  />
</Link>

</div>
      <div style={{ ...navGroup, marginTop: "auto", borderTop: "1px solid #1e293b", paddingTop: "20px" }}>
        <Link
  to="/billing"
  style={{ textDecoration: "none" }}
>
  <NavItem
    icon={<CreditCard size={18} />}
    label="Billing"
    active={location.pathname === "/billing"}
  />
</Link>
        <Link
  to="/settings"
  style={{ textDecoration: "none" }}
>
  <NavItem
    icon={<Settings size={18} />}
    label="Settings"
    active={location.pathname === "/settings"}
  />
</Link>
        <div onClick={handleLogout}>
          <NavItem icon={<LogOut size={18} />} label="Logout" color="#ef4444" />
        </div>
      </div>
    </aside>
  );
};

const NavItem = ({ icon, label, active, color }) => (
  <div style={{
    display: "flex",
    alignItems: "center",
    gap: "12px",
    padding: "12px 16px",
    borderRadius: "10px",
    cursor: "pointer",
    background: active ? "rgba(251, 191, 36, 0.08)" : "transparent",
    color: color || (active ? "#fbbf24" : "#94a3b8"),
    fontSize: "14px",
    fontWeight: active ? "600" : "500",
    transition: "all 0.2s ease"
  }}>
    {icon}
    {label}
  </div>
);

const sidebarStyle = {
  width: "260px",
  background: "#020617",
  borderRight: "1px solid #1e293b",
  display: "flex",
  flexDirection: "column",
  padding: "30px 20px",
  position: "fixed",
  top: 0,
  left: 0,
  height: "100vh",
  overflowY: "auto",
  overflowX: "hidden", width: "100%", maxWidth: "100%",
  zIndex: 1000,
  transition: "0.3s ease",
  boxSizing: "border-box"
};
const logoArea = { display: "flex", alignItems: "center", gap: "12px", marginBottom: "40px" };
const judeLogoSmall = { background: "#fbbf24", color: "#000", width: "32px", height: "32px", borderRadius: "8px", display: "flex", alignItems: "center", justifyContent: "center", fontWeight: "900", boxShadow: "0 0 20px rgba(251, 191, 36, 0.2)" };
const sidebarBrand = { fontSize: "20px", fontWeight: "800", margin: 0, letterSpacing: "-0.5px" };
const navGroup = { display: "flex", flexDirection: "column", gap: "6px" };

export default Sidebar;
