import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { useNavigate, Link } from "react-router-dom"; // for navigate and Link
import axios from "./axiosConfig";

function MyCustomPackages() {
  const { user, logout } = useContext(AuthContext);
  const [packages, setPackages] = useState([]);
  const navigate = useNavigate(); // Initialize navigate
  const [hovered, setHovered] = useState(null);
  const [notices, setNotices] = useState([]);
  const [showNotices, setShowNotices] = useState(false);

  useEffect(() => {
    if (user?._id) {
      axios.get(`/special-notices/for/${user._id}`).then(res => setNotices(res.data));
    }
  }, [user]);

  useEffect(() => {
    if (!user) return;
    axios
      .get(`http://localhost:5000/api/customPackages/byUser/${user._id}`)
      .then((res) => setPackages(res.data))
      .catch((err) => console.error("Error fetching custom packages:", err));
  }, [user]);

  // Handler to edit a package (navigate to customize package)
  const handleEdit = (pkg) => {
    navigate("/customizePackage", {
      state: { packageToEdit: pkg },
    });
  };

  // Handler to delete a package
  const handleDeletePackage = async (pkgId) => {
    if (!window.confirm("Are you sure you want to delete this package?")) return;
    try {
      await axios.delete(`/customPackages/${pkgId}`);
      // Remove it from local state
      setPackages((prev) => prev.filter((p) => p._id !== pkgId));
    } catch (err) {
      console.error("Error deleting package:", err);
      alert("Failed to delete package.");
    }
  };

  // Handler to book a package
  const handleBook = async (pkg) => {
    try {
      // Book Flights
      for (const flight of pkg.flights) {
        await axios.post("http://localhost:5000/api/bookings/bookFlight", {
          flightId: flight._id, // Pass individual flight ID
        });
      }
  
      // Book Hotels
      for (const hotel of pkg.hotels) {
        await axios.post("http://localhost:5000/api/bookings/bookHotel", {
          hotelId: hotel._id, // Pass individual hotel ID
        });
      }
  
      // Book Entertainments (no check for already booked)
      for (const entertainment of pkg.entertainments) {
        await axios.post("http://localhost:5000/api/bookings/bookEntertainment", {
          entertainmentId: entertainment._id, // Pass individual entertainment ID
        });
      }
  
      // Confirm the entire package booking
      await axios.post("http://localhost:5000/api/bookings/bookPackage", {
        packageId: pkg._id, // Send custom package ID to finalize
      });
  
      alert("Package and items booked successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Booking failed:", err);
      alert(`Failed to book pack: ${err.response ? err.response.data.message : err.message}`);
    }
  };

  if (!user) {
    return <p>Please login to view your custom packages.</p>;
  }

  return (
    <>
      <header className="header">
        <nav className="navbar">
          <h4>Travel Agency || Travel Packs</h4>
          <ul>
            {user ? (
              <>
                <li>
                  <span
                    style={{ cursor: "pointer", fontWeight: 600, color: "#007bff", background: "#181818", borderRadius: 20, padding: "6px 18px", marginRight: 10, display: "inline-block" }}
                    onClick={() => navigate("/profilecustomization")}
                  >
                    {user.name && user.name.trim() !== "" ? user.name : "Profile"}
                  </span>
                </li>
                <li style={{ position: "relative", display: "inline-block", marginRight: 10 }}>
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
                      fontSize: "15px",
                      minWidth: 0,
                      minHeight: 0,
                      lineHeight: 1.2,
                      border: "none",
                      marginRight: 10,
                      cursor: "pointer"
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
                      fontSize: "15px",
                      minWidth: 0,
                      minHeight: 0,
                      lineHeight: 1.2,
                      border: "none",
                      cursor: "pointer"
                    }}
                  >
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" style={{ textDecoration: "none", color: "inherit" }}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" style={{ textDecoration: "none", color: "inherit" }}>
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>
      <div style={{ maxWidth: 900, margin: "0 auto", padding: "0 16px" }}>
        <h1 style={{ textAlign: "center", margin: "0 0 20px 0", fontWeight: 700, fontSize: 32, color: "#232946" }}>My Custom Packages</h1>
        {packages.length === 0 ? (
          <div style={{ textAlign: "center", color: "#888", fontSize: 20, marginTop: 60 }}>No custom packages found.</div>
        ) : (
          packages.map((pkg) => (
            <div
              key={pkg._id}
              onMouseEnter={() => setHovered(pkg._id)}
              onMouseLeave={() => setHovered(null)}
              style={{
                background: hovered === pkg._id ? "#f8faff" : "#fff",
                borderRadius: 16,
                boxShadow: hovered === pkg._id
                  ? "0 8px 32px rgba(35,41,70,0.18)"
                  : "0 4px 24px rgba(35,41,70,0.08)",
                padding: 28,
                marginBottom: 32,
                transition: "box-shadow 0.25s, transform 0.25s, background 0.25s",
                border: "1px solid #f0f0f0",
                transform: hovered === pkg._id ? "translateY(-6px) scale(1.02)" : "none"
              }}
            >
              <div style={{ marginBottom: 18 }}>
                <span style={{ fontWeight: 600, color: "#393e6c", fontSize: 18 }}>Package ID:</span> <span style={{ color: "#393e6c", fontWeight: 500 }}>{pkg._id}</span>
              </div>
              <div style={{ marginBottom: 12 }}>
                <span style={{ fontWeight: 600, color: "#232946" }}>Flights:</span>
                <ul style={{ margin: 0, paddingLeft: 20 }}>
                  {pkg.flights && pkg.flights.length > 0 ? pkg.flights.map((f, idx) => (
                    <li key={f._id || idx} style={{ marginBottom: 4 }}>
                      <span style={{ fontWeight: 500 }}>{f.airline_name}</span> <span style={{ color: "#888" }}>from {f.from} to {f.to} on {f.date ? new Date(f.date).toLocaleDateString() : "-"} (Price: <span style={{ color: "#2563eb", fontWeight: 600 }}>${f.price}</span>)</span>
                    </li>
                  )) : <li style={{ color: "#aaa" }}>None</li>}
                </ul>
              </div>
              {pkg.hotels && pkg.hotels.length > 0 && (
                <div style={{ marginBottom: 12 }}>
                  <span style={{ fontWeight: 600, color: "#232946" }}>Hotels:</span>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {pkg.hotels.map((h, idx) => (
                      <li key={h._id || idx}>
                        <span style={{ fontWeight: 500 }}>{h.hotel_name}</span> <span style={{ color: "#888" }}>in {h.location} (Price per night: <span style={{ color: "#28a745", fontWeight: 600 }}>${h.price_per_night}</span>)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {pkg.entertainments && pkg.entertainments.length > 0 && (
                <div style={{ marginBottom: 18 }}>
                  <span style={{ fontWeight: 600, color: "#232946" }}>Entertainments:</span>
                  <ul style={{ margin: 0, paddingLeft: 20 }}>
                    {pkg.entertainments.map((e, idx) => (
                      <li key={e._id || idx}>
                        <span style={{ fontWeight: 500 }}>{e.entertainmentName || e.name}</span> <span style={{ color: "#888" }}>{e.location ? `in ${e.location}` : ""} (Price: <span style={{ color: "#ff9800", fontWeight: 600 }}>${e.price}</span>)</span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              <div style={{ display: "flex", gap: 12, marginTop: 18, flexWrap: "wrap" }}>
                <button
                  style={{
                    backgroundColor: "#ffc107",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "6px",
                    color: "#232946",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: "0 2px 8px 0 rgba(238,187,195,0.12)",
                    transition: "background 0.2s, color 0.2s"
                  }}
                  onClick={() => handleEdit(pkg)}
                >
                  Edit Package
                </button>
                <button
                  style={{
                    backgroundColor: "#dc3545",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "6px",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: "0 2px 8px 0 rgba(238,187,195,0.12)",
                    transition: "background 0.2s, color 0.2s"
                  }}
                  onClick={() => handleDeletePackage(pkg._id)}
                >
                  Delete
                </button>
                <button
                  style={{
                    backgroundColor: "#28a745",
                    border: "none",
                    padding: "10px 18px",
                    borderRadius: "6px",
                    color: "#fff",
                    cursor: "pointer",
                    fontWeight: 600,
                    fontSize: 16,
                    boxShadow: "0 2px 8px 0 rgba(40,167,69,0.12)",
                    transition: "background 0.2s, color 0.2s"
                  }}
                  onClick={() => navigate(`/book-custom-package/${pkg._id}`)}
                >
                  Book
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </>
  );
}

export default MyCustomPackages;
