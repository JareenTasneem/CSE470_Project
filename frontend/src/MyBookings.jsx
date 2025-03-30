import React, { useEffect, useState, useContext } from "react";
import axios from "./axiosConfig";
import { AuthContext } from "./contexts/AuthContext";
import { Link } from "react-router-dom";

const MyBookings = ({ setShowModal }) => {
  const { user } = useContext(AuthContext);
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch bookings
  useEffect(() => {
    if (!user) return;

    axios
      .get("/bookings/user")
      .then((res) => {
        console.log("Bookings received:", res.data);
        setBookings(res.data);
        setLoading(false);
      })
      .catch((err) => {
        console.error("Error fetching bookings:", err);
        setLoading(false);
      });
  }, [user]);

  // Cancel a booking
  const cancelBooking = async (id) => {
    try {
      if (window.confirm("Are you sure you want to cancel this booking?")) {
        await axios.delete(`/bookings/${id}`);
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

  // 🔍 Filter out cancelled bookings
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
          const pkg = booking.tour_package;

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
                  src={pkg?.images?.[0] || "/images/temp4.jpeg"}
                  alt="Package"
                  style={{
                    width: "100%",
                    height: "100%",
                    objectFit: "cover",
                  }}
                />
              </div>
              <div style={{ padding: "20px" }}>
                <h3 style={{ marginBottom: "10px", color: "#333" }}>
                  {pkg?.package_title || "Customized Package"}
                </h3>
                <p><strong>Location:</strong> {pkg?.location || "N/A"}</p>
                <p><strong>Start Date:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
                <p><strong>Status:</strong> {booking.status}</p>
                <p><strong>Price:</strong> ${booking.total_price}</p>
                <p><strong>Booked On:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>

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
