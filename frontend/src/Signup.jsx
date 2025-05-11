// ./src/Signup.jsx
import React, { useState } from "react";
import axios from "./axiosConfig";
import { useNavigate } from "react-router-dom";

function Signup() {
  const navigate = useNavigate();

  // Form fields
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [address, setAddress] = useState("");
  const [password, setPassword] = useState("");
  const [userType, setUserType] = useState("Customer");

  // For errors or success messages
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
        // Optionally navigate to login page
        setTimeout(() => {
          navigate("/login");
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
    <div style={{ margin: "2rem" }}>
      <h2>Sign Up</h2>

      <form onSubmit={handleSignup} style={{ display: "flex", flexDirection: "column", maxWidth: "300px" }}>
        <label>Name</label>
        <input
          type="text"
          value={name}
          required
          onChange={(e) => setName(e.target.value)}
        />

        <label>Email</label>
        <input
          type="email"
          value={email}
          required
          onChange={(e) => setEmail(e.target.value)}
        />

        <label>Phone</label>
        <input
          type="text"
          value={phone}
          onChange={(e) => setPhone(e.target.value)}
        />

        <label>Address</label>
        <input
          type="text"
          value={address}
          onChange={(e) => setAddress(e.target.value)}
        />

        <label>Password</label>
        <input
          type="password"
          value={password}
          required
          onChange={(e) => setPassword(e.target.value)}
        />

        <label>User Type</label>
        <select
          value={userType}
          onChange={(e) => setUserType(e.target.value)}
          required
        >
          <option value="Customer">Customer</option>
          <option value="Admin">Admin</option>
        </select>

        <button type="submit">Sign Up</button>
      </form>

      {error && <p style={{ color: "red" }}>{error}</p>}
      {success && <p style={{ color: "green" }}>{success}</p>}
    </div>
  );
}

export default Signup;
