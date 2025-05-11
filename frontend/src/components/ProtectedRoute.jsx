import React, { useContext } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';

export const ProtectedRoute = ({ children, requireAdmin = false }) => {
  const { user } = useContext(AuthContext);
  const location = useLocation();

  if (!user) {
    // Redirect to login if not authenticated
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  if (requireAdmin && user.user_type !== 'Admin') {
    // Redirect to home if not admin but admin access is required
    return <Navigate to="/" replace />;
  }

  if (user && user.user_type === 'Admin' && location.pathname !== '/admin-dashboard') {
    return <Navigate to="/admin-dashboard" replace />;
  }

  return children;
}; 