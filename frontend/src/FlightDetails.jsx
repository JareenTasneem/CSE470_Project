import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // <-- Added Link import
import axios from "./axiosConfig";

function FlightDetails() {
  const { id } = useParams();
  const [flight, setFlight] = useState(null);

  useEffect(() => {
    axios.get(`/flights/${id}`).then((res) => setFlight(res.data));
  }, [id]);

  if (!flight) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Poppins, sans-serif" }}>
      <h2>{flight.airline_name}</h2>
      <img src={flight.airline_logo} style={{ maxWidth: "300px" }} />
      <p><strong>From:</strong> {flight.from}</p>
      <p><strong>To:</strong> {flight.to}</p>
      <p><strong>Date:</strong> {new Date(flight.date).toLocaleString()}</p>
      <p><strong>Price:</strong> ${flight.price}</p>
      <p><strong>Seats Available:</strong> {flight.seats_available}</p>
      <Link to="/customize-package">
        <button style={{ marginBottom: '10px' }}>← Back to Customize</button>
      </Link>
    </div>
  );
}

export default FlightDetails;
