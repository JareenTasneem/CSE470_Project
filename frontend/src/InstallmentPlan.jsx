import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";

export default function InstallmentPlan() {
  const { bookingId } = useParams();
  const { user } = useContext(AuthContext);

  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [paymentSuccess, setPaymentSuccess] = useState(false);

  useEffect(() => {
    if (!user) return;

    const loadPlan = async () => {
      setLoading(true);
      try {
        const res = await axios.post(`/payments/create/${bookingId}`);
        setPlan(res.data);
      } catch (err) {
        console.error("Error loading or creating plan:", err);
        setError("Unable to load payment plan.");
      } finally {
        setLoading(false);
      }
    };

    loadPlan();
  }, [bookingId, user]);

  const handlePay = async (paymentId) => {
    try {
      // 1️⃣ Open Stripe checkout page
      const res = await axios.post(`/payments/installment-payment/${paymentId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
  
      const stripeWindow = window.open(res.data.url, "_blank");
  
      if (!stripeWindow) {
        alert("❌ Failed to open payment page. Please allow popups!");
        return;
      }
  
      // 2️⃣ Immediately mark payment as Paid in DB
      await axios.post(`/payments/pay/${paymentId}`, {}, {
        headers: { Authorization: `Bearer ${user.token}` }
      });
  
      // 3️⃣ Update frontend UI
      setPlan(prevPlan => {
        const updatedPlan = prevPlan.map(inst =>
          inst._id === paymentId ? { ...inst, status: "Paid" } : inst
        );
  
        const allPaid = updatedPlan.every(inst => inst.status === "Paid");
  
        if (allPaid) {
          axios.post(`/payments/confirm-full-payment/${bookingId}`, {}, {
            headers: { Authorization: `Bearer ${user.token}` }
          }).then(() => {
            console.log("✅ Booking confirmed after all installments paid.");
          }).catch(err => {
            console.error("❌ Error confirming booking:", err);
          });
        }
  
        return updatedPlan;
      });
  
      setPaymentSuccess(true);
      setTimeout(() => setPaymentSuccess(false), 4000);
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Try again.");
    }
  };
  
  
  

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      {paymentSuccess && (
        <div style={{
          backgroundColor: "#d4edda",
          color: "#155724",
          padding: "10px",
          borderRadius: "6px",
          marginBottom: "16px",
          border: "1px solid #c3e6cb"
        }}>
          ✅ Payment Successful!
        </div>
      )}

      <h2>Installment Plan for Booking #{bookingId}</h2>

      {plan.map((inst) => (
        <div key={inst._id} style={{ marginBottom: 12 }}>
          <strong>#{inst.installmentNumber}</strong>{" "}
          ${inst.amount.toFixed(2)} — {inst.status}

          {inst.status === "Paid" && (
            <a
              href={`/api/payments/invoice/${inst._id}`}
              target="_blank"
              rel="noopener noreferrer"
              style={{
                marginLeft: 10,
                backgroundColor: "#007bff",
                color: "#fff",
                padding: "4px 10px",
                borderRadius: 4,
                textDecoration: "none",
              }}
            >
              Download Invoice
            </a>
          )}

          {inst.status === "Unpaid" && (
            <button
              onClick={() => handlePay(inst._id)}
              style={{
                marginLeft: 10,
                backgroundColor: "#28a745",
                color: "#fff",
                border: "none",
                padding: "4px 10px",
                borderRadius: 4,
                cursor: "pointer",
              }}
            >
              Pay Now
            </button>
          )}
        </div>
      ))}
    </div>
  );
}
