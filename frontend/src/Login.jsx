// ./src/Login.jsx
import React, { useState, useContext } from "react";
import axios from "./axiosConfig";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import { toast } from "react-toastify";
import "./styles/style.css";

function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [isBanned, setIsBanned] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");
    setIsBanned(false);

    try {
      const response = await axios.post("/users/login", {
        email,
        password,
      });

      // Store user data and token
      const userData = response.data.user;
      const token = response.data.token;

      // Store in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Call the login function from AuthContext
      login(userData, token);

      // Redirect based on user type and previous location
      const from = location.state?.from?.pathname || "/home";
      if (userData.user_type === "Admin") {
        navigate("/admin-dashboard", { replace: true });
      } else {
        navigate(from, { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err);
      if (err.response?.status === 403 && err.response?.data?.isBanned) {
        setIsBanned(true);
        setError("YOU ARE BANNED!!!!");
        toast.error("YOU ARE BANNED!!!!", {
          position: "top-center",
          autoClose: false,
          hideProgressBar: false,
          closeOnClick: false,
          pauseOnHover: true,
          draggable: true,
          progress: undefined,
          style: {
            backgroundColor: "#dc3545",
            color: "white",
            fontSize: "1.2rem",
            fontWeight: "bold",
            textAlign: "center",
          },
        });
      } else {
        setError(err.response?.data?.message || "Something went wrong!");
      }
    }
  };

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e')",
        backgroundSize: "cover",
        backgroundPosition: "center",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        position: "relative",
      }}
    >
      {/* Blurred overlay */}
      <div
        style={{
          position: "absolute",
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backdropFilter: "blur(5px)",
          backgroundColor: "rgba(0, 0, 0, 0.4)",
          zIndex: 0,
        }}
      />
      <div style={{ 
        maxWidth: "400px", 
        width: "100%",
        margin: "2rem", 
        padding: "2rem",
        boxShadow: "0 0 15px rgba(0,0,0,0.2)",
        borderRadius: "8px",
        backgroundColor: isBanned ? "#fff5f5" : "white",
        position: "relative",
        zIndex: 1,
      }}>
        <h2 style={{ 
          textAlign: "center", 
          marginBottom: "1.5rem",
          color: isBanned ? "#dc3545" : "inherit"
        }}>
          {isBanned ? "ACCOUNT BANNED" : "Login"}
        </h2>
        <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", gap: "1rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
            <input
              type="email"
              value={email}
              required
              onChange={(e) => setEmail(e.target.value)}
              className="filter-input"
              style={{ 
                width: "100%",
              }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
            <input
              type="password"
              value={password}
              required
              className="filter-input"
              onChange={(e) => setPassword(e.target.value)}
              style={{ 
                width: "100%",
              }}
            />
          </div>

          <button 
            type="submit"
            style={{
              padding: "0.75rem",
              backgroundColor: isBanned ? "#dc3545" : "#232946",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: isBanned ? "not-allowed" : "pointer",
              fontSize: "1rem",
              opacity: isBanned ? 0.7 : 1
            }}
            disabled={isBanned}
          >
            {isBanned ? "BANNED" : "Login"}
          </button>
        </form>

        {error && (
          <p style={{ 
            color: isBanned ? "#dc3545" : "#d32f2f", 
            marginTop: "1rem", 
            textAlign: "center",
            fontWeight: isBanned ? "bold" : "normal",
            fontSize: isBanned ? "1.2rem" : "1rem"
          }}>
            {error}
          </p>
        )}

        {!isBanned && (
          <p style={{ textAlign: "center", marginTop: "1rem" }}>
            Don't have an account?{" "}
            <Link to="/signup" style={{ color: "#232946", textDecoration: "none", fontWeight: "bold" }}>
              Sign up here
            </Link>
          </p>
        )}
      </div>
    </div>
  );
}

export default Login;
