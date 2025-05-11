import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";

export default function Header() {
  const { logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login", { replace: true });
  };

  return (
    <header className="dashboard-header">
      <div className="header-title">Admin Dashboard</div>
      <div className="header-actions">
        <span>Welcome, Admin</span>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
} 