import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useMaintenance } from '../contexts/MaintenanceContext';
import { useAuth } from '../contexts/AuthContext';

export default function MaintenanceBanner() {
  const { isMaintenanceMode } = useMaintenance();
  const { user } = useAuth();
  const navigate = useNavigate();

  // Only show banner to non-admin users when maintenance mode is on
  if (!isMaintenanceMode || (user && user.user_type === 'Admin')) {
    return null;
  }

  return (
    <div className="maintenance-banner">
      <div className="maintenance-content">
        <h2>Undergoing Maintenance. Please Return Later.</h2>
        {user && (
          <button 
            className="login-redirect-btn"
            onClick={() => navigate('/login')}
          >
            Go to Login
          </button>
        )}
      </div>
    </div>
  );
} 