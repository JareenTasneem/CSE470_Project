import React, { useState } from "react";
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