// src/InstallmentPlan.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";

export default function InstallmentPlan() {
  const { bookingId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [plan, setPlan] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!user) return;

    const loadPlan = async () => {
      setLoading(true);
      try {
        // Single POST: returns existing or newly created installments
        const res = await axios.post(`payments/create/${bookingId}`);
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
      await axios.post(`payments/pay/${paymentId}`);
      // After payment, refresh the plan
      const res = await axios.post(`payments/create/${bookingId}`);
      setPlan(res.data);
      navigate(`/installment-status/${bookingId}`);
    } catch (err) {
      console.error("Payment error:", err);
      alert("Payment failed. Try again.");
    }
  };

  if (loading) return <p>Loading…</p>;
  if (error) return <p>{error}</p>;

  return (
    <div>
      <h2>Installment Plan for Booking #{bookingId}</h2>
      {plan.map((inst) => (
        <div key={inst._id} style={{ marginBottom: 12 }}>
          <strong>#{inst.installmentNumber}</strong>{" "}
          ${inst.amount.toFixed(2)} — {inst.status}
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
