import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";

/* 1️⃣ backend base */
const API_BASE = process.env.REACT_APP_API_URL || "http://localhost:5000/api";

export default function PaymentOptions() {
  const { bookingId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate  = useNavigate();

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error,   setError]   = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  /* load booking */
  useEffect(() => {
    if (!user) return;
    axios
      .get(`${API_BASE}/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => setBooking(res.data))
      .catch((err) => {
        console.error("Error loading booking:", err);
        setError("Unable to load booking details.");
      })
      .finally(() => setLoading(false));
  }, [bookingId, user]);

  /* pay full (unchanged) */
  const handlePayFull = async () => {
    try {
      const { data } = await axios.post(
        `/payments/fullpayment/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      const w = window.open(data.url, "_blank");
      if (!w) { alert("Pop-up blocked!"); return; }

      await axios.post(
        `/payments/confirm-full-payment/${bookingId}`,
        {},
        { headers: { Authorization: `Bearer ${user.token}` } }
      );
      setBooking((b) => ({ ...b, status: "Confirmed" }));
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 4000);
    } catch (err) {
      console.error("Full-payment error:", err);
      alert("Failed to process payment.");
    }
  };

  if (loading) return <p>Loading booking…</p>;
  if (error)   return <p>{error}</p>;
  if (!booking) return <p>Booking not found.</p>;

  /* ----- card data (unchanged) ----- */
  const isCustom = booking.custom_package !== null;
  const flights = isCustom ? booking.custom_package.flights || [] : booking.flights || [];
  const hotels  = isCustom ? booking.custom_package.hotels  || [] : booking.hotels  || [];
  const entert  = isCustom ? booking.custom_package.entertainments || [] : booking.entertainments || [];
  const flight  = flights[0];

  const totalCustomPrice =
    flights.reduce((s, f) => s + (f.price || 0), 0) +
    hotels.reduce((s, h) => s + (h.price_per_night || 0), 0) +
    entert.reduce((s, e) => s + (e.price || 0), 0);
  const price = isCustom ? totalCustomPrice : booking.total_price || 0;

  const location =
    (isCustom
      ? hotels[0]?.location || flight?.to || entert[0]?.location
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
        flight?.airline_logo ||
        entert[0]?.images?.[0] ||
        "/default.jpg"
      : booking.tour_package?.images?.[0] ||
        booking.hotelMeta?.image ||
        flight?.airline_logo ||
        "/default.jpg";

  return (
    <div style={{ padding: 30, maxWidth: 800, margin: "auto" }}>
      {paymentSuccess && (
        <div style={{
          backgroundColor: "#d4edda",
          color: "#155724",
          padding: 10,
          borderRadius: 6,
          marginBottom: 16,
          border: "1px solid #c3e6cb",
        }}>
          ✅ Payment Successful!
        </div>
      )}

      {/* booking card */}
      <div style={{
        display: "flex",
        gap: 20,
        background: "#fff",
        borderRadius: 8,
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)",
        overflow: "hidden",
      }}>
        <img src={image} alt="Booking" style={{ width: 200, objectFit: "cover" }} />
        <div style={{ padding: 20, flexGrow: 1 }}>
          <h3 style={{ marginBottom: 8 }}>{title}</h3>
          <p><strong>Location:</strong> {location}</p>
          {booking.startDate && (
            <p><strong>Start Date:</strong> {new Date(booking.startDate).toLocaleDateString()}</p>
          )}
          <p><strong>Status:</strong> {booking.status}</p>
          <p><strong>Price:</strong> ${price.toFixed(2)}</p>
          <p><strong>Booked On:</strong> {new Date(booking.createdAt).toLocaleDateString()}</p>
        </div>
      </div>

      {/* actions */}
      <div style={{ textAlign: "center", marginTop: 30 }}>
        {booking.status !== "Confirmed" ? (
          <>
            <button
              onClick={handlePayFull}
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
                color: "#fff",
                padding: "10px 20px",
                border: "none",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Pay by Installments
            </button>
          </>
        ) : (
          <a
            href={`${API_BASE}/payments/invoice/booking/${bookingId}`}
            target="_blank"
            rel="noopener noreferrer"
            style={{
              backgroundColor: "#007bff",
              color: "#fff",
              padding: "10px 20px",
              borderRadius: 4,
              textDecoration: "none",
            }}
          >
            Download Invoice
          </a>
        )}
      </div>
    </div>
  );
}
