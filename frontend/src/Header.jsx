import React, { useContext, useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import { useMaintenance } from "./contexts/MaintenanceContext";
import axios from "./axiosConfig";

export default function Header() {
  const { user, logout } = useContext(AuthContext);
  const { isMaintenanceMode, toggleMaintenanceMode, error } = useMaintenance();
  const navigate = useNavigate();
  const [notices, setNotices] = useState([]);
  const [showNotices, setShowNotices] = useState(false);

  useEffect(() => {
    if (user?._id) {
      axios.get(`/special-notices/for/${user._id}`).then(res => setNotices(res.data));
    }
  }, [user]);

  const handleLogout = () => {
    // Clear any existing state
    window.history.replaceState(null, '', '/');
    // Perform logout
    logout();
    // Navigate to login page
    navigate("/", { replace: true });
  };

  return (
    <header className="dashboard-header">
      <div className="header-title">Admin Dashboard</div>
      <div className="header-actions">
        <span>Welcome, Admin</span>
        <div className="maintenance-toggle">
          <button 
            className={`maintenance-btn ${isMaintenanceMode ? 'active' : ''}`}
            onClick={toggleMaintenanceMode}
          >
            Maintenance mode {isMaintenanceMode ? 'ON' : 'OFF'}
          </button>
          {error && (
            <div className="maintenance-error">
              {error}
            </div>
          )}
        </div>
        {/* Notification bell beside profile icon */}
        <div style={{ position: "relative", display: "inline-block", marginRight: 16 }}>
          <button
            className="notification-bell"
            onClick={() => setShowNotices((v) => !v)}
            style={{ fontSize: 20, background: "none", border: "none", cursor: "pointer" }}
            title="Show Notifications"
          >
            🔔
            {notices.length > 0 && (
              <span style={{ color: "red", fontWeight: "bold", marginLeft: 2 }}>
                {notices.length}
              </span>
            )}
          </button>
          {showNotices && (
            <div style={{
              position: "absolute", right: 0, top: "2.5em", background: "#fff", border: "1px solid #ccc", borderRadius: 6, minWidth: 220, zIndex: 1000, boxShadow: "0 2px 8px rgba(0,0,0,0.15)"
            }}>
              <div style={{ padding: 8, borderBottom: "1px solid #eee", fontWeight: "bold" }}>Notifications</div>
              {notices.length === 0 ? (
                <div style={{ padding: 8 }}>No notifications</div>
              ) : (
                <ul style={{ listStyle: "none", margin: 0, padding: 0 }}>
                  {notices.map((notice) => (
                    <li key={notice._id} style={{ padding: 8, borderBottom: "1px solid #eee" }}>
                      {notice.message}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
        {/* Profile icon (j) */}
        <div className="profile-icon" style={{ display: "inline-block", background: "#222", color: "#fff", borderRadius: "50%", width: 32, height: 32, textAlign: "center", lineHeight: "32px", fontWeight: "bold", marginRight: 12 }}>
          {user?.name ? user.name[0].toUpperCase() : "?"}
        </div>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
} 