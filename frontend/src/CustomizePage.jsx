import React from "react";
import { Link, Outlet } from "react-router-dom";

function CustomizePage() {
  return (
    <div>
      {/* Navbar or sub-menu */}
      <nav style={{ background: "#333", color: "#fff", padding: "1rem" }}>
        <Link to="/customize/flights" style={{ marginRight: "20px", color: "#fff", textDecoration: "none"}}>Flights</Link>
        <Link to="/customize/hotels" style={{ marginRight: "20px", color: "#fff", textDecoration: "none"}}>Hotels</Link>
        <Link to="/customize/entertainments" style={{ marginRight: "20px", color: "#fff", textDecoration: "none"}}>Entertainments</Link>
        <Link to="/customize/log" style={{ color: "#fff", textDecoration: "none"}}>Customize Log</Link>
      </nav>

      {/* The <Outlet> is where nested routes will render their content */}
      <Outlet />
    </div>
  );
}

export default CustomizePage;
