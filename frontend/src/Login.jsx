import React, { useState } from "react";

function Login() {

  const [isRegister, setIsRegister] = useState(false);

  const [formData, setFormData] = useState({
    email: "",
    password: ""
  });

  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {

    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {

    e.preventDefault();

    setLoading(true);

    try {

      const endpoint = isRegister
        ? `${import.meta.env.VITE_API_URL}/register`
        : `${import.meta.env.VITE_API_URL}/login`;

      const response = await fetch(
        endpoint,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify(formData)
        }
      );

      const data = await response.json();

      if (response.ok) {

        if (isRegister) {

          alert("Account created successfully");

          setIsRegister(false);

        } else {

          localStorage.setItem(
            "goldbot_token",
            data.access_token
          );

          localStorage.setItem(
            "user_email",
            data.email
          );

          window.location.href = "/";
        }

      } else {

        alert(
          data.detail ||
          "Authentication failed"
        );
      }

    } catch (error) {

      alert(
        "Server connection failed"
      );

      console.error(error);

    } finally {

      setLoading(false);
    }
  };

  return (

    <div style={containerStyle}>

      <div style={loginCard}>

        <div style={logoBox}>
          G
        </div>

        <h1 style={titleStyle}>
          GOLD BOT
        </h1>

        <p style={subtitleStyle}>
          Institutional AI Trading Platform
        </p>

        <div style={tabContainer}>

          <button
            onClick={() => setIsRegister(false)}
            style={{
              ...tabButton,
              ...(isRegister ? {} : activeTab)
            }}
            type="button"
          >
            Login
          </button>

          <button
            onClick={() => setIsRegister(true)}
            style={{
              ...tabButton,
              ...(isRegister ? activeTab : {})
            }}
            type="button"
          >
            Register
          </button>

        </div>

        <form onSubmit={handleSubmit}>

          <div style={inputGroup}>

            <label style={labelStyle}>
              Email Address
            </label>

            <input
              type="email"
              name="email"
              placeholder="Enter your email"
              value={formData.email}
              onChange={handleChange}
              style={inputStyle}
              required
            />

          </div>

          <div style={inputGroup}>

            <label style={labelStyle}>
              Password
            </label>

            <input
              type="password"
              name="password"
              placeholder="Enter your password"
              value={formData.password}
              onChange={handleChange}
              style={inputStyle}
              required
            />

          </div>

          <button
            type="submit"
            style={buttonStyle}
          >

            {
              loading
                ? "PLEASE WAIT..."
                : isRegister
                  ? "CREATE ACCOUNT"
                  : "ACCESS TERMINAL"
            }

          </button>

        </form>

      </div>

    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  background: "#020617",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontFamily: "Arial"
};

const loginCard = {
  width: "100%",
  maxWidth: "420px",
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "20px",
  padding: "40px"
};

const logoBox = {
  width: "70px",
  height: "70px",
  background: "#fbbf24",
  color: "#000",
  borderRadius: "16px",
  display: "flex",
  alignItems: "center",
  justifyContent: "center",
  fontSize: "32px",
  fontWeight: "900",
  marginBottom: "20px"
};

const titleStyle = {
  color: "white",
  fontSize: "32px",
  marginBottom: "8px"
};

const subtitleStyle = {
  color: "#94a3b8",
  marginBottom: "25px"
};

const tabContainer = {
  display: "flex",
  gap: "10px",
  marginBottom: "25px"
};

const tabButton = {
  flex: 1,
  padding: "14px",
  borderRadius: "10px",
  border: "none",
  background: "#1e293b",
  color: "#94a3b8",
  cursor: "pointer",
  fontWeight: "700"
};

const activeTab = {
  background: "#fbbf24",
  color: "#000"
};

const inputGroup = {
  marginBottom: "20px"
};

const labelStyle = {
  display: "block",
  marginBottom: "8px",
  color: "#cbd5e1",
  fontSize: "14px"
};

const inputStyle = {
  width: "100%",
  padding: "15px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  fontSize: "15px",
  boxSizing: "border-box"
};

const buttonStyle = {
  width: "100%",
  padding: "16px",
  borderRadius: "12px",
  border: "none",
  background: "#fbbf24",
  color: "#000",
  fontWeight: "800",
  cursor: "pointer",
  marginTop: "10px"
};

export default Login;