// src/MyBookings.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "./axiosConfig";
import { AuthContext } from "./contexts/AuthContext";
import { Link, useLocation } from "react-router-dom";

const MyBookings = ({ setShowModal }) => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;

    axios
      .get("/bookings/user", {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setBookings(res.data);
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

  const activeBookings = bookings.filter((booking) => booking.status !== "Cancelled");

  if (activeBookings.length === 0) {
    return (
      <div style={{ textAlign: "center", padding: "20px" }}>
        <p>You have no active bookings.</p>
        <Link to="/tourPackages">Browse Tour Packages</Link>
      </div>
    );
  }

  return (
    <div style={{ padding: "30px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "30px" }}>My Booked Packages</h2>

      <div
        style={{
          display: "grid",
          gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))",
          gap: "20px",
        }}
      >
        {activeBookings.map((booking) => {
          const isCustom = booking.custom_package !== null;
          const tour = booking.tour_package;
          const custom = booking.custom_package;

          const flights = isCustom ? custom?.flights || [] : booking.flights || [];
          const hotels = isCustom ? custom?.hotels || [] : booking.hotels || [];
          const entertainments = isCustom ? custom?.entertainments || [] : booking.entertainments || [];

          const totalCustomPrice =
            flights.reduce((sum, f) => sum + (f.price || 0), 0) +
            hotels.reduce((sum, h) => sum + (h.price_per_night || 0), 0) +
            entertainments.reduce((sum, e) => sum + (e.price || 0), 0);

          const price = isCustom ? totalCustomPrice : booking.total_price || 0;

          const location =
            isCustom
              ? hotels[0]?.location || flights[0]?.to || entertainments[0]?.location || "N/A"
              : tour?.location || booking.hotelMeta?.location || "N/A";

          const title = isCustom ? "Customized Package" : tour?.package_title  || booking.hotelMeta?.hotel_name || "Hotel Booking";
          const image = isCustom
            ? hotels[0]?.images?.[0] || flights[0]?.airline_logo || entertainments[0]?.images?.[0] || "/default.jpg"
            : tour?.images?.[0] || booking.hotelMeta?.image || "";

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
              {/* Header image */}
              <div style={{ height: "180px", overflow: "hidden" }}>
                <img
                  src={image}
                  alt="Package"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>

              {/* Details */}
              <div style={{ padding: "20px" }}>
                <h3 style={{ marginBottom: "10px", color: "#333" }}>{title}</h3>
                <p><strong>Location:</strong> {location}</p>
                {!isCustom && (
                  <p><strong>Start Date:</strong> {booking.startDate ? new Date(booking.startDate).toLocaleDateString() : "N/A"}</p>
                )}

                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Price:</strong> ${price}</p>
                <p><strong>Booked On:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
                
                {booking.hotel && !booking.tour_package && !booking.custom_package && booking.hotel_room_details && (
                  <p>
                    <strong>Room Type:</strong> {booking.hotel_room_details.roomType} <br />
                    <strong>Rooms Booked:</strong> {booking.hotel_room_details.numberOfRooms}
                  </p>
                )}

                {/* If custom, show details */}
                {isCustom && (
                  <>
                    {flights.length > 0 && (
                      <div style={{ marginTop: "10px" }}>
                        <h5>Flights</h5>
                        <ul>
                          {flights.map(f => (
                            <li key={f._id}>
                              <strong>{f.airline_name}</strong> from <em>{f.from}</em> to <em>{f.to}</em> on {new Date(f.date).toLocaleDateString()} (${f.price})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {hotels.length > 0 && (
                      <div>
                        <h5>Hotels</h5>
                        <ul>
                          {hotels.map(h => (
                            <li key={h._id}>
                              <strong>{h.hotel_name}</strong> in <em>{h.location}</em> (${h.price_per_night} per night)
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {entertainments.length > 0 && (
                      <div>
                        <h5>Entertainments</h5>
                        <ul>
                          {entertainments.map(e => (
                            <li key={e._id}>
                              <strong>{e.entertainmentName}</strong> in <em>{e.location}</em> (${e.price})
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                  </>
                )}

                <button
                  onClick={() => cancelBooking(booking._id)}
                  style={{
                    marginTop: "10px",
                    padding: "8px 16px",
                    backgroundColor: "#d9534f",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                  }}
                >
                  Cancel Booking
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyBookings;
