// src/TravelPack.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "./axiosConfig";
import "./styles/style.css";
import "bootstrap-icons/font/bootstrap-icons.css";
import { Link, useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import MaintenanceBanner from './components/MaintenanceBanner';

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

const styleSheet = document.createElement("style");
styleSheet.innerText = scrollbarStyles;
document.head.appendChild(styleSheet);

const TravelPack = () => {
  const [packages, setPackages] = useState([]);
  const [userProfile, setUserProfile] = useState(null);
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const [personalized, setPersonalized] = useState([]);
  const [notices, setNotices] = useState([]);
  const [showNotices, setShowNotices] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 1200);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 15;

  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 1200);
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (user && user.token) {
          try {
            const response = await axios.get("/tourPackages/personalized", {
              headers: { Authorization: `Bearer ${user.token}` },
            });
            setPersonalized(response.data);
          } catch (err) {
            console.error("Error fetching personalized recommendations:", err);
            // fallback to default
            const response = await axios.get("/tourPackages");
            setPackages(response.data);
          }
        } else {
          const response = await axios.get("/tourPackages");
          setPackages(response.data);
        }
      } catch (err) {
        console.error("Error fetching packages:", err);
        setError(err.message || "Failed to fetch packages. Please try again later.");
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [user]);

  useEffect(() => {
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

  const allRecommendations = user && personalized.length > 0 ? personalized : packages;
  const totalPages = Math.ceil(allRecommendations.length / itemsPerPage);
  const paginatedRecommendations = allRecommendations.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <>
      <MaintenanceBanner />
      <div>
        <header className="header">
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
            }}>Travel Agency || Home Page</h4>
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
              <h1>The right destination for you and your family.</h1>
            </div>
            <div className="box">
              <div className="filt_box" style={{
                display: "flex",
                flexDirection: "column",
                height: 450,
              }}>
                <nav className="fin_nav" style={{
                  background: "#181818",
                  padding: "15px 30px",
                  display: "flex",
                  justifyContent: "center",
                  alignItems: "center",
                  flexWrap: "wrap",
                  gap: "10px",
                  position: "relative",
                  width: "100%",
                  height: "auto",
                  boxSizing: "border-box",
                  borderRadius: "4px 4px 0 0"
                }}>
                  <h2 style={{ color: "#fff" }}>Home Page</h2>
                </nav>
                <div className="cards" style={{
                  flex: 1,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                }}>
                  <ul style={{
                    listStyle: "none",
                    margin: 0,
                    padding: 0,
                    display: "flex",
                    gap: "40px",
                    flexWrap: "wrap",
                    alignItems: "center",
                    justifyContent: "center"
                  }}>
                    <li>
                      <Link to="/my-bookings" 
                        className="menu-btn"
                        style={{ 
                          color: "#333", 
                          textDecoration: "none",
                          padding: "12px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          gap: "8px",
                          width: "100px",
                          height: "100px",
                          transition: "all 0.3s ease",
                          border: "2px solid #888",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
                        }}>
                        <i className="bi bi-credit-card" style={{ fontSize: "32px", color: "#333", background: "transparent" }}></i>
                        <span style={{ background: "transparent", color: "#333", fontWeight: 700, fontSize: "15px", padding: 0, margin: 0, boxShadow: "none", backgroundClip: "text", WebkitBackgroundClip: "text" }}>Payment</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/hotels" 
                        className="menu-btn"
                        style={{ 
                          color: "#333", 
                          textDecoration: "none",
                          padding: "12px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          gap: "8px",
                          width: "100px",
                          height: "100px",
                          transition: "all 0.3s ease",
                          border: "2px solid #888",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
                        }}>
                        <i className="bi bi-building" style={{ fontSize: "32px", color: "#333", background: "transparent" }}></i>
                        <span style={{ background: "transparent", color: "#333", fontWeight: 700, fontSize: "15px", padding: 0, margin: 0, boxShadow: "none", backgroundClip: "text", WebkitBackgroundClip: "text" }}>Hotels</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/flights" 
                        className="menu-btn"
                        style={{ 
                          color: "#333", 
                          textDecoration: "none",
                          padding: "12px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          gap: "8px",
                          width: "100px",
                          height: "100px",
                          transition: "all 0.3s ease",
                          border: "2px solid #888",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
                        }}>
                        <i className="bi bi-airplane" style={{ fontSize: "32px", color: "#333", background: "transparent" }}></i>
                        <span style={{ background: "transparent", color: "#333", fontWeight: 700, fontSize: "15px", padding: 0, margin: 0, boxShadow: "none", backgroundClip: "text", WebkitBackgroundClip: "text" }}>Flights</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/tourPackages" 
                        className="menu-btn"
                        style={{ 
                          color: "#333", 
                          textDecoration: "none",
                          padding: "12px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          gap: "8px",
                          width: "100px",
                          height: "100px",
                          transition: "all 0.3s ease",
                          border: "2px solid #888",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
                        }}>
                        <i className="bi bi-briefcase" style={{ fontSize: "32px", color: "#333", background: "transparent" }}></i>
                        <span style={{ background: "transparent", color: "#333", fontWeight: 700, fontSize: "15px", padding: 0, margin: 0, boxShadow: "none", backgroundClip: "text", WebkitBackgroundClip: "text" }}>Travel</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/customize-package" 
                        className="menu-btn"
                        style={{ 
                          color: "#333", 
                          textDecoration: "none",
                          padding: "12px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          gap: "8px",
                          width: "100px",
                          height: "100px",
                          transition: "all 0.3s ease",
                          border: "2px solid #888",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
                        }}>
                        <i className="bi bi-gear-wide" style={{ fontSize: "32px", color: "#333", background: "transparent" }}></i>
                        <span style={{ background: "transparent", color: "#333", fontWeight: 700, fontSize: "15px", padding: 0, margin: 0, boxShadow: "none", backgroundClip: "text", WebkitBackgroundClip: "text" }}>Customize</span>
                      </Link>
                    </li>
                    <li>
                      <Link to="/my-history" 
                        className="menu-btn"
                        style={{ 
                          color: "#333", 
                          textDecoration: "none",
                          padding: "12px",
                          borderRadius: "8px",
                          fontSize: "14px",
                          display: "flex",
                          flexDirection: "column",
                          alignItems: "center",
                          justifyContent: "center",
                          textAlign: "center",
                          gap: "8px",
                          width: "100px",
                          height: "100px",
                          transition: "all 0.3s ease",
                          border: "2px solid #888",
                          boxShadow: "0 4px 16px rgba(0,0,0,0.13)",
                        }}>
                        <i className="bi bi-star" style={{ fontSize: "32px", color: "#333", background: "transparent" }}></i>
                        <span style={{ background: "transparent", color: "#333", fontWeight: 700, fontSize: "15px", padding: 0, margin: 0, boxShadow: "none", backgroundClip: "text", WebkitBackgroundClip: "text" }}>Reviews</span>
                      </Link>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </div>
        </header>

        <div className="offers" style={{ padding: '220px 0', background: '#f8f9fa' }}>
          <h1 style={{ textAlign: 'center', fontWeight: 700, fontSize: '2.2rem', marginBottom: 8, letterSpacing: 0.5 }}>Personalized Recommendations For You</h1>
          <p style={{ textAlign: 'center', color: '#666', marginBottom: 32, fontSize: '1.1rem' }}>Choose your next destination</p>

          <div className="cards" style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))',
            gap: '23px',
            justifyItems: 'center',
            alignItems: 'center',
            maxWidth: 1400,
            margin: '0 auto',
          }}>
            {paginatedRecommendations.map((pkg) => (
              <div
                className="card"
                key={pkg._id}
                style={{
                  background: '#fff',
                  borderRadius: 5,
                  boxShadow: '0 4px 24px rgba(0,0,0,0.08)',
                  overflow: 'hidden',
                  display: 'flex',
                  flexDirection: 'column',
                  transition: 'transform 0.2s, box-shadow 0.2s',
                  cursor: 'pointer',
                  height: 300,
                  width: 355,
                  position: 'relative',
                  marginBottom: 0,
                }}
                onMouseOver={e => { e.currentTarget.style.transform = 'translateY(-6px) scale(1.03)'; e.currentTarget.style.boxShadow = '0 8px 32px rgba(0,0,0,0.13)'; }}
                onMouseOut={e => { e.currentTarget.style.transform = 'none'; e.currentTarget.style.boxShadow = '0 4px 24px rgba(0,0,0,0.08)'; }}
              >
                <div style={{ minHeight: 120, overflow: 'hidden', position: 'relative', borderTopLeftRadius: 5, borderTopRightRadius: 5 }}>
                  <img
                    src={pkg.images && pkg.images.length > 0 ? pkg.images[0] : "/images/temp4.jpeg"}
                    alt="Tour"
                    style={{ width: '100%', height: '100%', objectFit: 'cover', display: 'block', borderTopLeftRadius: 5, borderTopRightRadius: 5 }}
                  />
                  {/* <div style={{
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
                  </div> */}
                </div>
                <div style={{ padding: '22px 20px 18px 20px', flexGrow: 1, display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                  <div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 8 }}>
                      <span style={{ color: '#222', fontWeight: 700, fontSize: 18, flex: 1, whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{pkg.package_title}</span>
                      <span style={{ color: '#fff', fontWeight: 600, fontSize: 15, borderRadius: 20, background: "#181818", paddingRight: 5, paddingLeft: 5, paddingTop: 3, paddingBottom: 3 }}>${pkg.price}</span>
                    </div>
                    <div style={{ color: '#444', fontSize: 15, marginBottom: 10, minHeight: 38, maxHeight: 38, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {pkg.package_details?.length > 60 ? pkg.package_details.slice(0, 60) + '…' : pkg.package_details}
                    </div>
                  </div>
                  <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 1 }}>
                    <button
                      style={{
                        padding: '8px 3px',
                        backgroundColor: '#181818',
                        color: '#fff',
                        border: 'none',
                        borderRadius: 5,
                        cursor: 'pointer',
                        fontWeight: 500,
                        fontSize: 15,
                        flex: 1,
                        transition: 'background 0.2s',
                      }}
                      onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                      onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181818'}
                      onClick={() => navigate(`/tourPackages/${pkg._id}`)}
                    >
                      View More
                    </button>
                    <Link to={`/book-package/${pkg._id}`} style={{ flex: 1, textDecoration: 'none' }}>
                      <button
                        style={{
                          padding: '8px 10px',
                          backgroundColor: '#181818',
                          color: '#fff',
                          border: 'none',
                          borderRadius: 5,
                          cursor: 'pointer',
                          fontWeight: 500,
                          fontSize: 15,
                          width: '100%',
                          transition: 'background 0.2s',
                        }}
                        onMouseEnter={(e) => e.currentTarget.style.backgroundColor = '#333'}
                        onMouseLeave={(e) => e.currentTarget.style.backgroundColor = '#181818'}
                      >
                        Book Now
                      </button>
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div style={{ display: 'flex', justifyContent: 'center', marginTop: 64, gap: 16 }}>
              <button
                onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                style={{
                  fontSize: 14,
                  padding: '4px 12px',
                  cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                  borderRadius: 6,
                  border: '2px solid #ccc',
                  background: '#fff',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#181818')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ccc')}
              >
                Previous
              </button>

              <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                {Array.from({ length: totalPages }, (_, i) => (
                  <span
                    key={i}
                    onClick={() => setCurrentPage(i + 1)}
                    style={{
                      width: 10,
                      height: 10,
                      borderRadius: '50%',
                      backgroundColor: currentPage === i + 1 ? 'black' : '#ccc',
                      cursor: 'pointer',
                      transition: 'background-color 0.2s',
                    }}
                  />
                ))}
              </div>

              <button
                onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                style={{
                  fontSize: 14,
                  padding: "0 30px 0 30px",
                  cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                  borderRadius: 6,
                  border: '2px solid #ccc',
                  background: '#fff',
                  transition: 'border-color 0.2s',
                }}
                onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#181818')}
                onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ccc')}
              >
                Next
              </button>
            </div>
          )}
        </div>

        {/* <div className="also_like">
          <div className="img_box">
            <img src="/images/temp4.jpeg" alt="temp" />
          </div>
          <div className="of_box">
            <h4>Name of offer</h4>
            <p>short description of the offer...</p>
            <h6>Included: Hotel, Tour, Food</h6>
            <button>More Info</button>
          </div>
        </div> */}

        <footer>
          <h3>Contact Info:</h3>
          <p>
            Lorem ipsum dolor sit amet consectetur adipisicing elit. Ea dolore beatae ipsum rerum ab
            commodi...
          </p>
          <p><b>Email:</b> travelagency@gmail.com</p>
          <p><b>Whatsapp No:</b> XXXXXXXXXXXX</p>
        </footer>
      </div>
    </>
  );
};

export default TravelPack;
