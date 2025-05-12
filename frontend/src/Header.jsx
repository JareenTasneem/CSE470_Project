import React, { useContext } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import { useMaintenance } from "./contexts/MaintenanceContext";

export default function Header() {
  const { logout } = useContext(AuthContext);
  const { isMaintenanceMode, toggleMaintenanceMode, error } = useMaintenance();
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
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    </header>
  );
} 