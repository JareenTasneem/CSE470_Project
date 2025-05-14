import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import UserManagement from "./UserManagement";
import BookingOversight from "./BookingOversight";
import Analytics from "./Analytics";
import Notifications from "./Notifications";
import "./styles/dashboard.css";
import { AuthContext } from "./contexts/AuthContext";

const PAGES = {
  users: <UserManagement />,
  bookings: <BookingOversight />,
  analytics: <Analytics />,
  notifications: <Notifications />,
};

export default function AdminDashboard() {
  const [page, setPage] = useState("users");
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = React.useContext(AuthContext);

  useEffect(() => {
    // If user is not admin, force logout and redirect
    if (!user || user.user_type !== "Admin") {
      logout();
      navigate("/", { replace: true });
      return;
    }

    // Only trap history if we're still logged in as admin
    if (user && user.user_type === "Admin") {
      window.history.pushState(null, '', window.location.pathname);
      const handlePopState = (event) => {
        if (
          location.pathname === "/admin-dashboard" ||
          location.pathname === "/admin-profilecustomization"
        ) {
          window.history.pushState(null, '', window.location.pathname);
        } else {
          navigate("/admin-dashboard", { replace: true });
        }
      };
      window.addEventListener("popstate", handlePopState);
      return () => window.removeEventListener("popstate", handlePopState);
    }
  }, [location, navigate, user, logout]);

  return (
    <div className="dashboard">
      <Sidebar setPage={setPage} page={page} />
      <div style={{ flex: 1, display: "flex", flexDirection: "column" }}>
        <Header />
        <div className="dashboard-content">
          {PAGES[page]}
        </div>
      </div>
    </div>
  );
} 