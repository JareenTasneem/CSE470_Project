// src/MyBookings.jsx
import React, { useEffect, useState, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";
import { Link, useNavigate } from "react-router-dom";

const MyBookings = ({ setShowModal }) => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    axios
      .get("/bookings/user", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        const paidBookings = res.data.filter(booking => booking.status === "Confirmed");
        setBookings(paidBookings);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  }, [user]);

  const cancelBooking = async (id) => {
    try {
      if (window.confirm("Are you sure you want to cancel this booking?")) {
        await axios.delete(`/bookings/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        });
        setBookings((prev) => prev.filter((b) => b._id !== id));
        if (setShowModal) setShowModal(false);
      }
    } catch (error) {
      console.error("Error cancelling booking:", error);
      alert("Failed to cancel booking. Please try again.");
    }
  };

  if (!user) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <p>
          Please <Link to="/login">log in</Link> to view your bookings.
        </p>
      </div>
    );
  }

  if (loading) {
    return <p style={{ textAlign: "center" }}>Loading bookings...</p>;
  }

  if (bookings.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <p>You have no paid bookings.</p>
        <Link to="/tourPackages">Browse Tour Packages</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>
        My Paid Bookings
      </h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {bookings.map((booking) => {
          const isCustom = booking.custom_package !== null;
          const tour = booking.tour_package;
          const flights = isCustom
            ? booking.custom_package?.flights || []
            : booking.flights || [];
          const hotels = isCustom
            ? booking.custom_package?.hotels || []
            : booking.hotels || [];
          const entertainments = isCustom
            ? booking.custom_package?.entertainments || []
            : booking.entertainments || [];

          const flight = flights[0]; // for flight-only booking

          const totalCustomPrice =
            flights.reduce((sum, f) => sum + (f.price || 0), 0) +
            hotels.reduce((sum, h) => sum + (h.price_per_night || 0), 0) +
            entertainments.reduce((sum, e) => sum + (e.price || 0), 0);

          const price = isCustom
            ? totalCustomPrice
            : booking.total_price || 0;

          const location = isCustom
            ? hotels[0]?.location ||
              flights[0]?.to ||
              entertainments[0]?.location ||
              "N/A"
            : tour?.location ||
              booking.hotelMeta?.location ||
              flight?.to ||
              "N/A";

          const title =
            isCustom
              ? "Customized Package"
              : tour?.package_title ||
                booking.hotelMeta?.hotel_name ||
                (flight?.airline_name + " Flight") ||
                "Booking";

          const image =
            isCustom
              ? hotels[0]?.images?.[0] ||
                flights[0]?.airline_logo ||
                entertainments[0]?.images?.[0] ||
                "/default.jpg"
              : tour?.images?.[0] ||
                booking.hotelMeta?.image ||
                flight?.airline_logo ||
                "/default.jpg";

          return (
            <div
              key={booking._id}
              style={{
                background: "#fff",
                borderRadius: "8px",
                boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
                overflow: "hidden",
                display: "flex",
                flexDirection: "column",
              }}
            >
              <div style={{ height: "180px", overflow: "hidden" }}>
                <img
                  src={image}
                  alt="Booking"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              <div style={{ padding: "20px", flexGrow: 1 }}>
                <h3 style={{ marginBottom: "10px", color: "#333" }}>
                  {title}
                </h3>
                {!booking.flights && (
                  <p>
                    <strong>Location:</strong> {location}
                  </p>
                )}
                {!isCustom && booking.startDate && (
                  <p>
                    <strong>Start Date:</strong>{" "}
                    {new Date(booking.startDate).toLocaleDateString()}
                  </p>
                )}

                <p>
                  <strong>Status:</strong> {booking.status}
                </p>
                <p>
                  <strong>Price:</strong> ${price}
                </p>
                <p>
                  <strong>Booked On:</strong>{" "}
                  {new Date(booking.createdAt).toLocaleDateString()}
                </p>

                {/* … any other details you had … */}

                <div style={{ marginTop: "20px" }}>
                  {(booking.refundStatus === "processed" || booking.refundRequested) ? (
                    <>
                      <span style={{
                        display: 'inline-block',
                        backgroundColor: booking.refundStatus === "processed" ? '#28a745' : '#ffe066',
                        color: booking.refundStatus === "processed" ? '#fff' : '#856404',
                        padding: '8px 16px',
                        borderRadius: '4px',
                        fontWeight: 600,
                        marginRight: '10px',
                      }}>
                        {booking.refundStatus === "processed" ? 'Refunded' : 'Refund Requested'}
                      </span>
                      <button
                        onClick={() => navigate(`/refund-status/${booking._id}`)}
                        style={{
                          padding: '8px 16px',
                          backgroundColor: '#007bff',
                          color: '#fff',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: 'pointer',
                        }}
                      >
                        Show Refund Status
                      </button>
                    </>
                  ) : (
                    <button
                      onClick={() => navigate(`/refund/${booking._id}`)}
                      style={{
                        padding: "8px 16px",
                        backgroundColor: "#ffc107",
                        color: "#333",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginRight: "10px",
                      }}
                    >
                      Refund
                    </button>
                  )}

                  {/* Download Invoice Button */}
                  <a
                    href={`http://localhost:5000/api/payments/invoice/booking/${booking._id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      padding: "8px 16px",
                      backgroundColor: "#28a745",
                      color: "#fff",
                      border: "none",
                      borderRadius: "4px",
                      cursor: "pointer",
                      textDecoration: "none",
                      display: "inline-block"
                    }}
                  >
                    Download Invoice
                  </a>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyBookings;
