import React, { useEffect, useState, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";

const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

const RefundStatus = () => {
  const { bookingId } = useParams();
  const { user } = useContext(AuthContext);
  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    axios
      .get(`${API_BASE}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => setBooking(res.data))
      .catch((err) => {
        setError("Unable to load refund status.");
      })
      .finally(() => setLoading(false));
  }, [bookingId, user]);

  if (loading) return <div style={{ padding: 40, textAlign: "center" }}>Loading refund status...</div>;
  if (error) return <div style={{ padding: 40, textAlign: "center", color: "red" }}>{error}</div>;
  if (!booking) return <div style={{ padding: 40, textAlign: "center" }}>Booking not found.</div>;

  let statusMsg = "No refund requested.";
  let statusColor = "#888";
  if (booking.refundStatus === "requested") {
    statusMsg = "Your refund request is being processed.";
    statusColor = "#ffc107";
  } else if (booking.refundStatus === "approved") {
    statusMsg = "Your refund has been approved and will be issued soon.";
    statusColor = "#28a745";
  } else if (booking.refundStatus === "processed") {
    statusMsg = "Your refund has been processed.";
    statusColor = "#28a745";
  } else if (booking.refundStatus === "rejected") {
    statusMsg = "Your refund request was rejected.";
    statusColor = "#dc3545";
  }

  return (
    <div style={{ maxWidth: 500, margin: "40px auto", background: "#fff", borderRadius: 8, boxShadow: "0 2px 8px rgba(0,0,0,0.1)", padding: 32 }}>
      <h2 style={{ textAlign: "center", marginBottom: 24 }}>Refund Status</h2>
      <div style={{ textAlign: "center", marginBottom: 20 }}>
        <span style={{ display: "inline-block", padding: "10px 24px", borderRadius: 6, background: statusColor, color: "#fff", fontWeight: 600 }}>
          {statusMsg}
        </span>
      </div>
      <div style={{ marginTop: 24 }}>
        <p><strong>Booking:</strong> {booking.flightMeta?.airline_name || booking.tour_package?.package_title || booking.hotelMeta?.hotel_name || "Booking"}</p>
        <p><strong>Status:</strong> {booking.status}</p>
        <p><strong>Refund Reason:</strong> {booking.refundReason || "-"}</p>
        <p><strong>Refund Amount:</strong> {booking.refundAmount ? `$${booking.refundAmount.toFixed(2)}` : "-"}</p>
        <p><strong>Requested On:</strong> {booking.updatedAt ? new Date(booking.updatedAt).toLocaleDateString() : "-"}</p>
      </div>
    </div>
  );
};

export default RefundStatus; 