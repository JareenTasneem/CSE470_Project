// ./src/Login.jsx
import React, { useState, useContext } from "react";
import axios from "./axiosConfig";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";

function Login() {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleLogin = async (e) => {
    e.preventDefault();
    setError("");

    try {
      const response = await axios.post("http://localhost:5000/api/users/login", {
        email,
        password,
      });

      // Store user data and token
      const userData = response.data.user;
      const token = response.data.token;

      console.log("Login response:", response.data); // Debug log
      console.log("User type:", userData.user_type); // Debug log

      // Store in localStorage
      localStorage.setItem("authToken", token);
      localStorage.setItem("user", JSON.stringify(userData));
      
      // Call the login function from AuthContext
      login(userData, token);

      // Redirect based on user type
      if (userData.user_type === "Admin") {
        console.log("Redirecting to admin dashboard"); // Debug log
        navigate("/admin-dashboard", { replace: true });
      } else {
        console.log("Redirecting to home page"); // Debug log
        navigate("/", { replace: true });
      }
    } catch (err) {
      console.error("Login error:", err); // Debug log
      setError(err.response?.data?.message || "Something went wrong!");
    }
  };

  return (
    <div style={{ margin: "2rem" }}>
      <h2>Login</h2>
      <form onSubmit={handleLogin} style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}>
        <label>Email</label>
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <button type="submit">Login</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
    </div>
  );
}

export default Login;
