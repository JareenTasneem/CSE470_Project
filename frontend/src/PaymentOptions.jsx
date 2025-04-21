// src/PaymentOptions.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";

export default function PaymentOptions() {
  const { bookingId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;
    axios
        .get(`http://localhost:5000/api/bookings/${bookingId}`, {
           headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        setBooking(res.data);
      })
      .catch((err) => {
        console.error("Error loading booking:", err);
        setError("Unable to load booking details.");
      })
      .finally(() => setLoading(false));
  }, [bookingId, user]);

  if (loading) return <p>Loading booking…</p>;
  if (error) return <p>{error}</p>;
  if (!booking) return <p>Booking not found.</p>;

  // Re‑use your MyBookings logic to build title, image, price…
  const isCustom = booking.custom_package !== null;
  const flights = isCustom
    ? booking.custom_package.flights || []
    : booking.flights || [];
  const hotels = isCustom
    ? booking.custom_package.hotels || []
    : booking.hotels || [];
  const entert = isCustom
    ? booking.custom_package.entertainments || []
    : booking.entertainments || [];

  const flight = flights[0];
  const totalCustomPrice =
    flights.reduce((s, f) => s + (f.price || 0), 0) +
    hotels.reduce((s, h) => s + (h.price_per_night || 0), 0) +
    entert.reduce((s, e) => s + (e.price || 0), 0);
  const price = isCustom ? totalCustomPrice : booking.total_price || 0;

  const location =
    (isCustom
      ? hotels[0]?.location || flights[0]?.to || entert[0]?.location
      : booking.tour_package?.location ||
        booking.hotelMeta?.location ||
        flight?.to) || "N/A";

  const title =
    isCustom
      ? "Customized Package"
      : booking.tour_package?.package_title ||
        booking.hotelMeta?.hotel_name ||
        (flight?.airline_name + " Flight") ||
        "Booking";

  const image =
    isCustom
      ? hotels[0]?.images?.[0] ||
        flights[0]?.airline_logo ||
        entert[0]?.images?.[0] ||
        "/default.jpg"
      : booking.tour_package?.images?.[0] ||
        booking.hotelMeta?.image ||
        flight?.airline_logo ||
        "/default.jpg";

  return (
    <div style={{ padding: 30, maxWidth: 800, margin: "auto" }}>
      <div
        style={{
          display: "flex",
          gap: 20,
          background: "#fff",
          borderRadius: 8,
          boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
          overflow: "hidden",
        }}
      >
        <img
          src={image}
          alt="Booking"
          style={{ width: 200, objectFit: "cover" }}
        />
        <div style={{ padding: 20, flexGrow: 1 }}>
          <h3 style={{ marginBottom: 8 }}>{title}</h3>
          <p><strong>Location:</strong> {location}</p>
          {booking.startDate && (
            <p>
              <strong>Start Date:</strong>{" "}
              {new Date(booking.startDate).toLocaleDateString()}
            </p>
          )}
          <p><strong>Status:</strong> {booking.status}</p>
          <p><strong>Price:</strong> ${price.toFixed(2)}</p>
          <p>
            <strong>Booked On:</strong>{" "}
            {new Date(booking.createdAt).toLocaleDateString()}
          </p>
        </div>
      </div>

      <div style={{ textAlign: "center", marginTop: 30 }}>
        <button
          onClick={() => alert("Full‑payment coming soon!")}
          style={{
            backgroundColor: "#ffc107",
            color: "#333",
            padding: "10px 20px",
            marginRight: 16,
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Pay Full Amount
        </button>
        <button
          onClick={() => navigate(`/installment-plan/${bookingId}`)}
          style={{
            backgroundColor: "#28a745",
            color: "white",
            padding: "10px 20px",
            border: "none",
            borderRadius: 4,
            cursor: "pointer",
          }}
        >
          Pay by Installments
        </button>
      </div>
    </div>
  );
}
