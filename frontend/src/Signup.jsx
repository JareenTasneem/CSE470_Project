// ./src/Signup.jsx
import React, { useState } from "react";
import axios from "./axiosConfig";
import { useNavigate } from "react-router-dom";
import "./styles/style.css";

function Signup() {
  const navigate = useNavigate();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Customer");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSignup = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    try {
      const response = await axios.post("http://localhost:5000/api/users/register", {
        name,
        email,
        phone,
        address,
        password,
        user_type: userType,
      });

      if (response.status === 201) {
        setSuccess("User registered successfully!");
        setTimeout(() => {
          navigate("/");
        }, 1500);
      }
    } catch (err) {
      if (err.response && err.response.data) {
        setError(err.response.data.message);
      } else {
        setError("Something went wrong!");
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

      {/* Signup Box */}
      <div
        style={{
          maxWidth: "400px",
          width: "100%",
          padding: "2rem",
          boxShadow: "0 0 15px rgba(0,0,0,0.2)",
          borderRadius: "8px",
          backgroundColor: "white",
          position: "relative",
          zIndex: 1,
          // justifyItems: "center",
          // alignItems: "center"
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "1.5rem" }}>Sign Up</h2>

        <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", gap: "0.5rem" }}>
          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Name</label>
            <input
              type="text"
              value={name}
              required
              onChange={(e) => setName(e.target.value)}
              style={{ width: "100%" }}
              className="filter-input"
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Email</label>
            <input
              type="email"
              value={email}
              required
              className="filter-input"
              onChange={(e) => setEmail(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Phone</label>
            <input
              type="text"
              value={phone}
              className="filter-input"
              onChange={(e) => setPhone(e.target.value)}
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>Address</label>
            <input
              type="text"
              value={address}
              className="filter-input"
              onChange={(e) => setAddress(e.target.value)}
              style={{ width: "100%" }}
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
              style={{ width: "100%" }}
            />
          </div>

          <div>
            <label style={{ display: "block", marginBottom: "0.5rem" }}>User Type</label>
            <select
              value={userType}
              onChange={(e) => setUserType(e.target.value)}
              required
              className="filter-input"
              style={{ width: "100%" }}
            >
              <option value="Customer">Customer</option>
              <option value="Admin">Admin</option>
            </select>
          </div>

          <button
            type="submit"
            style={{
              padding: "0.75rem",
              backgroundColor: "#232946",
              color: "white",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
              fontSize: "1rem",
            }}
          >
            Sign Up
          </button>
        </form>

        {error && <p style={{ color: "red", marginTop: "1rem", textAlign: "center" }}>{error}</p>}
        {success && <p style={{ color: "green", marginTop: "1rem", textAlign: "center" }}>{success}</p>}
      </div>
    </div>
  );
}

export default Signup;
