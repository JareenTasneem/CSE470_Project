// src/components/Navbar.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import axios from "../axiosConfig";

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [showNotices, setShowNotices] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    if (user?._id) {
      axios.get(`/special-notices/for/${user._id}`).then(res => setNotices(res.data));
    }
  }, [user]);

  return (
    <nav className="navbar">
      <ul style={{ display: "flex", listStyle: "none", padding: 0 }}>
        {user ? (
          <>
            <li>
              <span
                onClick={() => navigate("/profilecustomization")}
                style={{
                  cursor: "pointer",
                  color: "#fff",
                  background: "#181818",
                  border: "1px solid #fff",
                  borderRadius: 20,
                  padding: "6px 18px",
                  marginRight: 10
                }}
              >
                {user.name || "Profile"}
              </span>
            </li>
            <li style={{ position: "relative", marginRight: 10 }}>
              <button
                onClick={() => setShowNotices(!showNotices)}
                style={{
                  color: "#fff",
                  background: "#181818",
                  border: "1px solid #fff",
                  borderRadius: 20,
                  padding: "6px 18px",
                }}
              >
                🔔 {notices.length > 0 && <span style={{ color: "red" }}>{notices.length}</span>}
              </button>
              {showNotices && (
                <div style={{
                  position: "absolute",
                  right: 0,
                  background: "#181818",
                  color: "#fff",
                  border: "1px solid #333",
                  borderRadius: 6,
                  marginTop: 4,
                  width: 300,
                  zIndex: 100
                }}>
                  <div style={{ padding: 12, borderBottom: "1px solid #333", fontWeight: "bold" }}>
                    Notifications
                  </div>
                  <ul style={{ maxHeight: 200, overflowY: "auto", padding: 0, listStyle: "none" }}>
                    {notices.map((n) => (
                      <li key={n._id} style={{ padding: 12, borderBottom: "1px solid #333" }}>{n.message}</li>
                    ))}
                  </ul>
                </div>
              )}
            </li>
            <li>
              <button onClick={() => navigate("/confirmedBookings")} style={{
                background: "#181818",
                color: "#fff",
                borderRadius: 20,
                padding: "6px 18px",
                border: "1px solid #fff",
                marginRight: 10
              }}>
                Confirmed Bookings
              </button>
            </li>
            <li>
              <button onClick={logout} style={{
                background: "#181818",
                color: "#fff",
                borderRadius: 20,
                padding: "6px 18px",
                border: "1px solid #fff"
              }}>
                Logout
              </button>
            </li>
          </>
        ) : (
          <>
            <li>
              <Link to="/login" style={{
                textDecoration: "none",
                color: "#fff",
                background: "#181818",
                borderRadius: 20,
                padding: "6px 18px",
                border: "1px solid #fff",
                marginRight: 10
              }}>
                Login
              </Link>
            </li>
            <li>
              <Link to="/signup" style={{
                textDecoration: "none",
                color: "#fff",
                background: "#181818",
                borderRadius: 20,
                padding: "6px 18px",
                border: "1px solid #fff"
              }}>
                Sign up
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
};

export default Navbar;
