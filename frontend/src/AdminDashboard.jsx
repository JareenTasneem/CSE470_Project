import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import Header from "./Header";
import UserManagement from "./UserManagement";
import BookingOversight from "./BookingOversight";
import Analytics from "./Analytics";
import Notifications from "./Notifications";
import "./dashboard.css";

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

  useEffect(() => {
    const handlePopState = (event) => {
      if (location.pathname !== "/admin-dashboard") {
        navigate("/admin-dashboard", { replace: true });
      }
    };
    window.addEventListener("popstate", handlePopState);
    return () => window.removeEventListener("popstate", handlePopState);
  }, [location, navigate]);

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