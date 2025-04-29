// src/InstallmentStatus.jsx
import React, { useState, useEffect, useContext } from "react";
import { useParams } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";

export default function InstallmentStatus() {
  const { bookingId } = useParams();
  const { user } = useContext(AuthContext);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    axios
        .get(`payments/plan/${bookingId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => setHistory(res.data))
      .finally(() => setLoading(false));
  }, [bookingId, user]);

  if (loading) return <p>Loading history…</p>;

  return (
    <div>
      <h2>Payment History for Booking #{bookingId}</h2>
      {history.map((p) => (
        <div
          key={p._id}
          style={{
            border: "1px solid #ddd",
            padding: "12px",
            borderRadius: "6px",
            marginBottom: "8px",
          }}
        >
          <p>
            <strong>Installment {p.installmentNumber}</strong>:{" "}
            ${p.amount.toFixed(2)} — {p.status}
          </p>
          {p.status === "Paid" && (
            <a
              href={`/api/payments/invoice/${p._id}`}
              target="_blank"
              rel="noreferrer"
            >
              Download Invoice
            </a>
          )}
        </div>
      ))}
    </div>
  );
}
