import React from "react";
import { useNavigate } from "react-router-dom";

const navItems = [
  { key: "users", label: "User Management" },
  { key: "bookings", label: "Booking Oversight" },
  { key: "analytics", label: "Analytics & Reports" },
  { key: "notifications", label: "Notifications" },
];

export default function Sidebar({ setPage, page }) {
  const navigate = useNavigate();
  return (
    <nav className="dashboard-sidebar">
      <div className="sidebar-title">Admin Panel</div>
      <div className="sidebar-nav">
        {navItems.map(item => (
          <button
            key={item.key}
            className={page === item.key ? "active" : ""}
            onClick={() => setPage(item.key)}
          >
            {item.label}
          </button>
        ))}
      </div>
      <div style={{ marginTop: "auto", padding: 16 }}>
        <button
          onClick={() => navigate("/admin-profilecustomization")}
          style={{ width: "100%", padding: 10, background: "#007bff", color: "#fff", border: "none", borderRadius: 4 }}
        >
          Edit My Profile
        </button>
      </div>
    </nav>
  );
} 