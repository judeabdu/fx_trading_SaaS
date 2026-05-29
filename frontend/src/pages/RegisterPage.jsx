import React, { useState } from "react";
import { useNavigate, Link } from "react-router-dom";

function RegisterPage() {

  const navigate = useNavigate();

  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const API_URL =
    import.meta.env.VITE_API_URL ||
    "https://fx-trading-saas-1.onrender.com";

  const handleRegister = async (e) => {

    e.preventDefault();

    setError("");

    // =========================
    // BASIC VALIDATION
    // =========================

    if (
      !username.trim() ||
      !email.trim() ||
      !password.trim()
    ) {
      setError("All fields are required");
      return;
    }

    if (password.length < 6) {
      setError(
        "Password must be at least 6 characters"
      );
      return;
    }

    try {

      setLoading(true);

      const response = await fetch(
        `${API_URL}/register`,
        {
          method: "POST",

          headers: {
            "Content-Type": "application/json"
          },

          body: JSON.stringify({
            username: username.trim(),
            email: email.trim(),
            password: password.trim()
          })
        }
      );

      // =========================
      // SAFE JSON PARSE
      // =========================

      let data = {};

      try {

        data = await response.json();

      } catch {

        data = {};
      }

      console.log("REGISTER RESPONSE:", data);

      // =========================
      // HANDLE FASTAPI ERRORS
      // =========================

      if (!response.ok) {

        // FastAPI validation errors
        if (Array.isArray(data.detail)) {

          const messages = data.detail
            .map((err) => err.msg)
            .join(", ");

          throw new Error(messages);
        }

        throw new Error(
          data.detail ||
          "Registration failed"
        );
      }

      // =========================
      // SUCCESS
      // =========================

      alert("Registration successful!");

      navigate("/login");

    } catch (err) {

      console.error(err);

      setError(
        err.message ||
        "Something went wrong"
      );

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
          onChange={(e) =>
            setUsername(e.target.value)
          }
          style={inputStyle}
          required
        />

        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={(e) =>
            setEmail(e.target.value)
          }
          style={inputStyle}
          required
        />

        <input
          type="password"
          placeholder="Password"
          value={password}
          onChange={(e) =>
            setPassword(e.target.value)
          }
          style={inputStyle}
          required
        />

        <button
          type="submit"
          style={
            loading
              ? disabledButtonStyle
              : buttonStyle
          }
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

// ======================================================
// STYLES
// ======================================================

const containerStyle = {
  minHeight: "100vh",
  display: "flex",
  justifyContent: "center",
  alignItems: "center",
  background:
    "linear-gradient(to bottom right, #020617, #0f172a)",
  padding: "20px"
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
  gap: "18px",
  boxShadow:
    "0 0 40px rgba(0,0,0,0.45)"
};

const titleStyle = {
  color: "white",
  fontSize: "32px",
  fontWeight: "700",
  marginBottom: "4px",
  textAlign: "center"
};

const subStyle = {
  color: "#64748b",
  marginBottom: "18px",
  textAlign: "center"
};

const inputStyle = {
  padding: "16px",
  borderRadius: "12px",
  border: "1px solid #334155",
  background: "#020617",
  color: "white",
  fontSize: "15px",
  outline: "none"
};

const buttonStyle = {
  background: "#fbbf24",
  border: "none",
  padding: "16px",
  borderRadius: "12px",
  fontWeight: "700",
  cursor: "pointer",
  fontSize: "15px",
  transition: "0.3s"
};

const disabledButtonStyle = {
  ...buttonStyle,
  opacity: 0.6,
  cursor: "not-allowed"
};

const footerStyle = {
  color: "#94a3b8",
  fontSize: "14px",
  textAlign: "center"
};

const linkStyle = {
  color: "#fbbf24",
  marginLeft: "6px",
  textDecoration: "none",
  fontWeight: "600"
};

const errorStyle = {
  background: "rgba(239,68,68,0.1)",
  border: "1px solid #ef4444",
  color: "#ef4444",
  padding: "12px",
  borderRadius: "10px",
  fontSize: "14px",
  textAlign: "center"
};

export default RegisterPage;
