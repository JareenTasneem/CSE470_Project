import React from "react";

const navItems = [
  { key: "users", label: "User Management" },
  { key: "bookings", label: "Booking Oversight" },
  { key: "analytics", label: "Analytics & Reports" },
  { key: "notifications", label: "Notifications" },
];

export default function Sidebar({ setPage, page }) {
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
    </nav>
  );
} 