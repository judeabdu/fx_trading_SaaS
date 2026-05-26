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

  const isMobile = window.innerWidth < 768;

  return (

    <aside style={sidebarStyle(isMobile)}>

      <div style={logoArea}>

        <div style={judeLogoSmall}>
          J
        </div>

        {
          !isMobile && (
            <h2 style={sidebarBrand}>
              JUDE
              <span style={{ color: "#fbbf24" }}>
                FX
              </span>
            </h2>
          )
        }

      </div>

      <div style={navGroup}>

        <Link
          to="/"
          style={linkStyle}
        >
          <NavItem
            icon={<LayoutDashboard size={20} />}
            label="Dashboard"
            active={location.pathname === "/"}
            mobile={isMobile}
          />
        </Link>

        <Link
          to="/analytics"
          style={linkStyle}
        >
          <NavItem
            icon={<BarChart3 size={20} />}
            label="Analytics"
            active={location.pathname === "/analytics"}
            mobile={isMobile}
          />
        </Link>

        <Link
          to="/trades"
          style={linkStyle}
        >
          <NavItem
            icon={<LineChart size={20} />}
            label="Trades"
            active={location.pathname === "/trades"}
            mobile={isMobile}
          />
        </Link>

        <Link
          to="/history"
          style={linkStyle}
        >
          <NavItem
            icon={<History size={20} />}
            label="History"
            active={location.pathname === "/history"}
            mobile={isMobile}
          />
        </Link>

        <Link
          to="/billing"
          style={linkStyle}
        >
          <NavItem
            icon={<CreditCard size={20} />}
            label="Billing"
            active={location.pathname === "/billing"}
            mobile={isMobile}
          />
        </Link>

        <Link
          to="/settings"
          style={linkStyle}
        >
          <NavItem
            icon={<Settings size={20} />}
            label="Settings"
            active={location.pathname === "/settings"}
            mobile={isMobile}
          />
        </Link>

      </div>

      {/* LOGOUT */}

      <div
        onClick={handleLogout}
        style={logoutContainer}
      >
        <NavItem
          icon={<LogOut size={20} />}
          label="Logout"
          color="#ef4444"
          mobile={isMobile}
        />
      </div>

    </aside>
  );
};

const NavItem = ({
  icon,
  label,
  active,
  color,
  mobile
}) => (

  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: mobile
        ? "center"
        : "flex-start",
      gap: "12px",
      padding: mobile
        ? "14px"
        : "14px 16px",
      borderRadius: "12px",
      cursor: "pointer",
      background: active
        ? "rgba(251, 191, 36, 0.1)"
        : "transparent",
      color:
        color ||
        (
          active
            ? "#fbbf24"
            : "#94a3b8"
        ),
      fontSize: "14px",
      fontWeight: active
        ? "600"
        : "500",
      transition: "0.2s ease"
    }}
  >

    {icon}

    {
      !mobile && label
    }

  </div>
);

const sidebarStyle = (mobile) => ({
  width: mobile
    ? "85px"
    : "260px",

  background: "#020617",

  borderRight: "1px solid #1e293b",

  display: "flex",

  flexDirection: "column",

  justifyContent: "flex-start",

  padding: mobile
    ? "20px 10px"
    : "30px 20px",

  position: "fixed",

  top: 0,

  left: 0,

  height: "100vh",

  overflowY: "auto",

  overflowX: "hidden",

  zIndex: 1000,

  boxSizing: "border-box"
});

const logoArea = {
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  gap: "12px",
  marginBottom: "40px"
};

const judeLogoSmall = {
  background: "#fbbf24",
  color: "#000",
  width: "38px",
  height: "38px",
  borderRadius: "10px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontWeight: "900",
  boxShadow: "0 0 20px rgba(251,191,36,0.25)"
};

const sidebarBrand = {
  fontSize: "20px",
  fontWeight: "800",
  margin: 0,
  letterSpacing: "-0.5px",
  color: "white"
};

const navGroup = {
  display: "flex",
  flexDirection: "column",
  gap: "8px",
  flex: 1
};
const logoutContainer = {
  marginTop: "24px",
  paddingTop: "20px",
  borderTop: "1px solid #1e293b"
};

const linkStyle = {
  textDecoration: "none"
};

export default Sidebar;