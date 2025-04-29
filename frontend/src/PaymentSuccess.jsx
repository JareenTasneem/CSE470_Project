import React, { useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";

export default function PaymentSuccess() {
  const { bookingId } = useParams();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    const confirmBooking = async () => {
      try {
        await axios.post(`/payments/confirm-full-payment/${bookingId}`, {}, {
          headers: { Authorization: `Bearer ${user.token}` }
        });
        console.log("✅ Booking confirmed successfully after full payment");
      } catch (error) {
        console.error("❌ Error confirming booking:", error);
      }
    };

    if (bookingId && user) {
      confirmBooking();
    }
  }, [bookingId, user]);

  return (
    <div style={{ padding: 50, textAlign: "center" }}>
      <h1>🎉 Payment Successful!</h1>
      <p>Thank you for your payment. Your booking is now confirmed!</p>
    </div>
  );
}
