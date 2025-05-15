// src/components/Navbar.jsx
import React, { useContext, useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "../contexts/AuthContext";
import axios from "../axiosConfig";
// import "./styles/style.css";

const scrollbarStyles = `
  .custom-scrollbar::-webkit-scrollbar {
    width: 8px;
  }
  .custom-scrollbar::-webkit-scrollbar-track {
    background: #181818;
  }
  .custom-scrollbar::-webkit-scrollbar-thumb {
    background: #333;
    border-radius: 4px;
  }
  .custom-scrollbar {
    scrollbar-width: thin;
    scrollbar-color: #333 #181818;
  }
`;

const Navbar = () => {
  const { user, logout } = useContext(AuthContext);
  const [notices, setNotices] = useState([]);
  const [showNotices, setShowNotices] = useState(false);
  const navigate = useNavigate();
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);
  const [showMenu, setShowMenu] = useState(false);

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1200);
    };

    if (user?._id) {
      axios.get(`/special-notices/for/${user._id}`).then(res => setNotices(res.data));
    }
  }, [user]);

  const renderNavItems = () => {
    const navItems = user ? (
      <>
        <li>
          <span
            style={{ 
              cursor: "pointer", 
              height: "25px",
              fontWeight: 600, 
              color: "#fff",
              background: "#181818", 
              borderRadius: 20, 
              padding: "6px 18px", 
              marginRight: 10, 
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
              border: "1px solid #fff",
              transition: "all 0.3s ease",
              lineHeight: "1.2"
            }}
            onClick={() => navigate("/profilecustomization")}
            onMouseOver={(e) => {
              e.target.style.background = "#fff";
              e.target.style.color = "#181818";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#181818";
              e.target.style.color = "#fff";
            }}
          >
            {user.name && user.name.trim() !== "" ? user.name : "Profile"}
          </span>
        </li>
        <li style={{ position: "relative", display: "inline-block", marginRight: 10 }}>
          <button
            className="notification-bell"
            onClick={() => setShowNotices((v) => !v)}
            style={{ 
              fontSize: "clamp(1rem, 1.5vw, 1.25rem)",
              height: "40px", 
              background: "#181818", 
              border: "1px solid #fff",
              borderRadius: 20,
              color: "#fff",
              cursor: "pointer",
              padding: "6px 18px",
              transition: "all 0.3s ease",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "4px"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#fff";
              e.target.style.color = "#red";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#181818";
              e.target.style.color = "#red";
            }}
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
              position: "absolute", 
              right: 0, 
              top: "100%", 
              background: "#181818", 
              width: "300px",
              border: "1px solid #333", 
              borderRadius: 6, 
              zIndex: 1000, 
              boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
            }}>
              <div style={{ padding: 12, borderBottom: "1px solid #333", fontWeight: "bold", color: "#fff" }}>Notifications</div>
              <ul className="custom-scrollbar" style={{ 
                listStyle: "none", 
                margin: 0, 
                padding: 0, 
                maxHeight: "300px", 
                overflowY: "auto",
                display: "flex",
                flexDirection: "column"
              }}>
                {notices.map((notice) => (
                  <li key={notice._id} style={{ 
                    padding: 12, 
                    borderBottom: "1px solid #333", 
                    color: "#fff",
                    display: "block",
                    width: "100%",
                    marginBottom: "4px"
                  }}>
                    {notice.message}
                  </li>
                ))}
              </ul>
            </div>
          )}
        </li>
        <li>
          <button
            onClick={() => navigate("/confirmedBookings")}
            style={{
              background: "#181818",
              color: "#fff",
              borderRadius: 20,
              padding: "6px 18px",
              fontWeight: 500,
              fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
              minWidth: 0,
              minHeight: 0,
              lineHeight: 1.2,
              border: "1px solid #fff",
              marginRight: 10,
              height: "40px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#fff";
              e.target.style.color = "#181818";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#181818";
              e.target.style.color = "#fff";
            }}
          >
            Confirmed Bookings
          </button>
        </li>
        <li>
          <button
            onClick={logout}
            style={{
              background: "#181818",
              color: "#fff",
              borderRadius: 20,
              padding: "6px 18px",
              fontWeight: 500,
              fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
              minWidth: 0,
              minHeight: 0,
              lineHeight: 1.2,
              border: "1px solid #fff",
              height: "40px",
              cursor: "pointer",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.target.style.background = "#fff";
              e.target.style.color = "#181818";
            }}
            onMouseOut={(e) => {
              e.target.style.background = "#181818";
              e.target.style.color = "#fff";
            }}
          >
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
            fontWeight: 500,
            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
            border: "1px solid #fff",
            transition: "all 0.3s ease",
            display: "inline-block"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#fff";
            e.target.style.color = "#181818";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#181818";
            e.target.style.color = "#fff";
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
            fontWeight: 500,
            fontSize: "clamp(0.875rem, 1.5vw, 1rem)",
            border: "1px solid #fff",
            transition: "all 0.3s ease",
            display: "inline-block"
          }}
          onMouseOver={(e) => {
            e.target.style.background = "#fff";
            e.target.style.color = "#181818";
          }}
          onMouseOut={(e) => {
            e.target.style.background = "#181818";
            e.target.style.color = "#fff";
          }}>
            Sign up
          </Link>
        </li>
      </>
    );

    return navItems;
  };


  return (
    <nav className="navbar" style={{
      background: "#181818",
      padding: "15px 30px",
      display: "flex",
      justifyContent: "space-between",
      alignItems: "center",
      flexWrap: "wrap",
      gap: "10px",
      position: "relative",
      width: "100%",
      height: "90px",
      boxSizing: "border-box"
    }}>
      <h4 style={{ 
        color: "#fff", 
        margin: 0,
        fontSize: "clamp(1rem, 2vw, 1.5rem)"
      }}>Travel Agency</h4>
      <button
        onClick={() => setShowMenu(!showMenu)}
        style={{
          display: isMobile ? "block" : "none",
          background: "none",
          border: "none",
          color: "#fff",
          fontSize: "24px",
          cursor: "pointer",
          padding: "5px"
        }}
      >
        ☰
      </button>

      {/* Desktop Menu */}
      <ul style={{
        display: isMobile ? "none" : "flex",
        listStyle: "none",
        margin: 0,
        padding: 0,
        gap: "10px",
        flexWrap: "wrap",
        justifyContent: "flex-end",
        alignItems: "center"
      }}>
        {renderNavItems()}
      </ul>

      {/* Mobile Menu Dropdown */}
      {isMobile && showMenu && (
        <div style={{
          position: "absolute",
          top: "100%",
          right: 0,
          background: "#181818",
          width: "45%",
          padding: "20px",
          boxShadow: "0 4px 6px rgba(0,0,0,0.1)",
          zIndex: 1000,
          borderTop: "1px solid #333"
        }}>
          <ul style={{
            listStyle: "none",
            margin: 0,
            padding: 0,
            display: "flex",
            flexDirection: "column",
            gap: "15px"
          }}>
            {renderNavItems()}
          </ul>
        </div>
      )}
    </nav>
  );
};

export default Navbar;
