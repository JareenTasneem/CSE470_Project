// src/FlightDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "./axiosConfig";

const FlightDetails = () => {
  const { id } = useParams();
  const [flight, setFlight] = useState(null);

  /* ───────── fetch single flight ───────── */
  useEffect(() => {
    axios
      .get(`/flights/${id}`)
      .then((res) => setFlight(res.data))
      .catch((err) => {
        console.error("Error fetching flight details:", err);
        alert("Flight not found");
      });
  }, [id]);

  if (!flight) return <p style={{ textAlign: "center" }}>Loading flight details…</p>;

  return (
    <div style={{ padding: "30px", fontFamily: "Poppins, sans-serif", background: "#f5f5f5", minHeight: "100vh" }}>
      <h1>{flight.airline_name}</h1>

      <img
        src={flight.airline_logo || "/images/default.jpg"}
        alt="Airline Logo"
        style={{ width: "400px", maxWidth: "100%", borderRadius: "8px", marginBottom: "20px" }}
      />

      <p><strong>From:</strong> {flight.from}</p>
      <p><strong>To:</strong> {flight.to}</p>
      <p><strong>Date:</strong> {new Date(flight.date).toLocaleString()}</p>
      <p><strong>Price:</strong> ${flight.price}</p>
      <p><strong>Total Seats Available:</strong> {flight.total_seats || "N/A"}</p>

      <div style={{ marginBottom: "20px" }}>
        <p><strong>Available Seat Types:</strong></p>
        {flight.seat_types && flight.seat_types.map(seat => (
          <div key={seat.type} style={{ marginLeft: "15px" }}>
            <p style={{ margin: "5px 0" }}>
              <span style={{ textTransform: "capitalize" }}>{seat.type} Class:</span> {seat.count} seats
            </p>
          </div>
        ))}
      </div>

      <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
        <Link
          to="/flights"
          style={{
            padding: "10px 20px",
            backgroundColor: "#333",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          ← Back to Flights
        </Link>

        {/* ✅ Functional Book‑Now button */}
        <Link
          to={`/book-flight/${flight._id}`}
          style={{
            padding: "10px 20px",
            backgroundColor: "#28a745",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px",
          }}
        >
          Book Now
        </Link>
      </div>
    </div>
  );
};

export default FlightDetails;
