// ./src/Login.jsx
import React, { useState, useContext } from "react";
import axios from "./axiosConfig";
import { useNavigate, Link, useLocation } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import { toast } from "react-toastify";

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
      const from = location.state?.from?.pathname || "/";
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
    <div style={{ 
      maxWidth: "400px", 
      margin: "2rem auto", 
      padding: "2rem",
      boxShadow: "0 0 10px rgba(0,0,0,0.1)",
      borderRadius: "8px",
      backgroundColor: isBanned ? "#fff5f5" : "white"
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
            style={{ 
              width: "100%", 
              padding: "0.5rem", 
              borderRadius: "4px", 
              border: isBanned ? "2px solid #dc3545" : "1px solid #ccc",
              backgroundColor: isBanned ? "#fff5f5" : "white"
            }}
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "0.5rem" }}>Password</label>
          <input
            type="password"
            value={password}
            required
            onChange={(e) => setPassword(e.target.value)}
            style={{ 
              width: "100%", 
              padding: "0.5rem", 
              borderRadius: "4px", 
              border: isBanned ? "2px solid #dc3545" : "1px solid #ccc",
              backgroundColor: isBanned ? "#fff5f5" : "white"
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
  );
}

export default Login;
