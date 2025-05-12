// src/TravelPack.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "./axiosConfig";
import "./styles/style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import MaintenanceBanner from './components/MaintenanceBanner';

const TravelPack = () => {
  const [packages, setPackages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [personalized, setPersonalized] = useState([]);
  const [notices, setNotices] = useState([]);
  const [showNotices, setShowNotices] = useState(false);

  useEffect(() => {
    if (user && user.token) {
      axios
        .get("http://localhost:5000/api/tourPackages/personalized", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((response) => setPersonalized(response.data))
        .catch((err) => {
          console.error("Error fetching personalized recommendations:", err);
          // fallback to default
          axios
            .get("http://localhost:5000/api/tourPackages")
            .then((response) => setPackages(response.data))
            .catch((err) => console.error("Error fetching packages:", err));
        });
    } else {
      axios
        .get("http://localhost:5000/api/tourPackages")
        .then((response) => setPackages(response.data))
        .catch((err) => console.error("Error fetching packages:", err));
    }
  }, [user]);

  useEffect(() => {
    if (user?._id) {
      axios.get(`/special-notices/for/${user._id}`).then(res => setNotices(res.data));
    }
  }, [user]);

  return (
    <>
      <MaintenanceBanner />
      <div>
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

          <div
            className="content"
            style={{
              backgroundImage: 'url("/images/temp3.jpg")',
              backgroundSize: "cover",
              backgroundPosition: "center",
              backgroundRepeat: "no-repeat",
            }}
          >
            <div className="cont_bx">
              <h1>The right destination for you and your family</h1>
            </div>
            <div className="box">
              <div className="filt_box">
                <nav className="fin_nav">
                  <ul>
                    <li>
                      <Link to="/my-bookings" style={{ color: "white", textDecoration: "none" }}>
                        Payment
                      </Link>
                    </li>
                    <li>
                      <Link to="/hotels" style={{ color: "white", textDecoration: "none" }}>
                        Hotels
                      </Link>
                    </li>
                    <li>
                      <Link to="/flights" style={{ color: "white", textDecoration: "none" }}>
                        Flights
                      </Link>
                    </li>
                    <li>
                      <Link to="/tourPackages" style={{ color: "white", textDecoration: "none" }}>
                        Travel-Packs
                      </Link>
                    </li>
                    <li>
                      <Link to="/customize-package" style={{ color: "white", textDecoration: "none" }}>
                        Customize-Package
                      </Link>
                    </li>
                    <li>
                      <Link to="/my-history" style={{ color: "white", textDecoration: "none" }}>
                        Reviews
                      </Link>
                    </li>
                  </ul>
                </nav>
                <div className="cards">
                  <div className="card">
                    <h4>Country:</h4>
                    <input className="search" type="text" placeholder="Enter name of country" />
                  </div>
                  <div className="card">
                    <h4>City:</h4>
                    <input className="search" type="text" placeholder="Enter name of city" />
                  </div>
                  <div className="card">
                    <h4>Price:</h4>
                    <input className="search" type="text" placeholder="Price range" />
                  </div>
                  <div className="card">
                    <input className="button" type="button" value="Explore Now" />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="offers" style={{ padding: '40px 0', background: '#f8f9fa' }}>
          <h1 style={{ textAlign: 'center', fontWeight: 700, fontSize: '2.2rem', marginBottom: 8, letterSpacing: 0.5 }}>Personalized Recommendations for You</h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: 32, fontSize: '1.1rem' }}>Choose your next destination</p>

          <div className="cards" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '32px',
            justifyContent: 'center',
            alignItems: 'stretch',
            maxWidth: 1400,
            margin: '0 auto',
          }}>
            {(user && personalized.length > 0 ? personalized : packages).map((pkg) => (
              <div
                className="card"
                key={pkg._id}
                style={{
                  background: '#fff',
                  borderRadius: 18,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  minHeight: 420,
                  position: 'relative',
                  marginBottom: 0,
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.13)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'; }}
              >
                <div style={{ height: 180, overflow: 'hidden', position: 'relative', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}>
                  <img
                    src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : "/images/temp4.jpeg"}
                    alt="Tour"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderTopLeftRadius: 18, borderTopRightRadius: 18 }}
                  />
                  <div style={{
                    position: 'absolute',
                    bottom: 0,
                    left: 0,
                    width: '100%',
                    background: 'rgba(0,0,0,0.45)',
                    color: '#fff',
                    fontWeight: 500,
                    fontSize: 14,
                    padding: '8px 16px',
                    textShadow: '0 1px 4px rgba(0,0,0,0.18)',
                    whiteSpace: 'nowrap',
                    overflow: 'hidden',
                    textOverflow: 'ellipsis',
                    borderBottomLeftRadius: 0,
                    borderBottomRightRadius: 0,
                    borderTopLeftRadius: 0,
                    borderTopRightRadius: 0,
                  }}>
                    Included: {pkg.inclusions?.join(', ') || 'No inclusions listed'}
                  </div>
                </div>
                <div style={{ padding: '22px 20px 18px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                      <span style={{ color: '#222', fontWeight: 700, fontSize: 18, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pkg.package_title}</span>
                      <span style={{ color: '#007bff', fontWeight: 600, fontSize: 18 }}>${pkg.price}</span>
                    </div>
                    <div style={{ color: '#444', fontSize: 15, marginBottom: 10, minHeight: 38, maxHeight: 38, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pkg.package_details?.length > 60 ? pkg.package_details.slice(0, 60) + '…' : pkg.package_details}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 10 }}>
                    <button
                      style={{
                        padding: '8px 18px',
                        backgroundColor: '#007bff',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 6,
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: 15,
                        flex: 1,
                        transition: 'background 0.2s',
                      }}
                      onClick={() => navigate(`/tourPackages/${pkg._id}`)}
                    >
                      View More
                    </button>
                    <Link to={`/book-package/${pkg._id}`} style={{ flex: 1, textDecoration: 'none' }}>
                      <button
                        style={{
                          padding: '8px 18px',
                          backgroundColor: '#28a745',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 6,
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: 15,
                          width: '100%',
                          transition: 'background 0.2s',
                        }}
                      >
                        Book Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="also_like">
          <div className="img_box">
            <img src="/images/temp4.jpeg" alt="temp" />
          </div>
          <div className="of_box">
            <h4>Name of offer</h4>
            <p>short description of the offer...</p>
            <h6>Included: Hotel, Tour, Food</h6>
            <button>More Info</button>
          </div>
        </div>

        <footer>
          <h4>We will be putting contact info here</h4>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea dolore beatae ipsum rerum ab
            commodi...
          </p>
        </footer>
      </div>
    </>
  );
};

export default TravelPack;
