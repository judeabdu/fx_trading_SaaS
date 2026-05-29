import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleRegister = async (e) => {

    e.preventDefault();

    setLoading(true);
    setError("");

    try {

      const response = await fetch(
        `${import.meta.env.VITE_API_URL}/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            username,
            email,
            password
          })
        }
      );

      const data = await response.json();

      if (!response.ok) {

        throw new Error(
          data.detail || "Registration failed"
        );
      }

      alert("Registration successful");

      navigate("/login");

    } catch (err) {

      setError(err.message);

    } finally {

      setLoading(false);
    }
  };

  return (

    <div style={containerStyle}>

      <form
        onSubmit={handleRegister}
        style={cardStyle}
      >

        <h1 style={titleStyle}>
          Create Account
        </h1>

        <p style={subStyle}>
          Institutional Trading SaaS
        </p>

        {
          error && (
            <div style={errorStyle}>
              {error}
            </div>
          )
        }

        <input
          type="text"
          placeholder="Username"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
          style={inputStyle}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          style={inputStyle}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          style={inputStyle}
          required
        />

        <button
          type="submit"
          style={buttonStyle}
          disabled={loading}
        >
          {
            loading
              ? "Creating Account..."
              : "Register"
          }
        </button>

        <div style={footerStyle}>

          Already have an account?

          <Link
            to="/login"
            style={linkStyle}
          >
            Login
          </Link>

        </div>

      </form>

    </div>
  );
}

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background: "#020617"
};

const cardStyle = {
  width: "100%",
  maxWidth: "420px",
  background: "#0f172a",
  border: "1px solid #1e293b",
  borderRadius: "20px",
  padding: "40px",
  display: "flex",
  flexDirection: "column",
  gap: "18px"
};

const titleStyle = {
  color: "white",
  fontSize: "32px",
  marginBottom: "4px"
};

const subStyle = {
  color: "#64748b",
  marginBottom: "18px"
};

const inputStyle = {
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  fontSize: "15px"
};

const buttonStyle = {
  background: "#fbbf24",
  border: "none",
  padding: "16px",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer"
};

const footerStyle = {
  color: "#94a3b8",
  fontSize: "14px",
  textAlign: "center"
};

const linkStyle = {
  color: "#fbbf24",
  marginLeft: "6px",
  textDecoration: "none"
};

const errorStyle = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid #ef4444",
  color: "#ef4444",
  padding: "12px",
  borderRadius: "10px",
  fontSize: "14px"
};

export default RegisterPage;
