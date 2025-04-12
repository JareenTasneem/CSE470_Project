// src/BookFlight.jsx
import React, { useEffect, useState, useContext } from "react";
import { useParams, useNavigate } from "react-router-dom";
import axios from "./axiosConfig";
import { AuthContext } from "./contexts/AuthContext";

const BookFlight = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [flight, setFlight] = useState(null);
  const [qty, setQty] = useState(1);
  const [departureCity, setDepartureCity] = useState("");
  const [seatClass, setSeatClass] = useState("economy"); // NEW
  const [totalPrice, setTotalPrice] = useState(0);

  /* fetch flight */
  useEffect(() => {
    if (!user) return navigate("/login");

    axios
      .get(`/flights/${id}`)
      .then((res) => setFlight(res.data))
      .catch((err) => {
        console.error("Failed to fetch flight:", err);
        alert("Error loading flight.");
      });
  }, [id, user, navigate]);

  useEffect(() => {
    if (flight) {
      const multiplier = seatClass === "business" ? 2.5 : 1;
      setTotalPrice(flight.price * qty * multiplier);
    }
  }, [flight, qty, seatClass]);

  /* submit booking */
  const handleBooking = async (e) => {
    e.preventDefault();

    try {
      await axios.post("/bookings/flight", {
        flightId: id,
        seatClass,
        qty,
        name: user.name,
        email: user.email,
        passportNumber: "DEMO123456",
        nationality: "Bangladeshi",
        seatPreference: "Window",
        departureCity,
      });

      alert("Flight booked successfully!");
      navigate(-1);
    } catch (error) {
      console.error("Booking failed:", error);
      
      // Display the specific error message from the API
      if (error.response && error.response.data && error.response.data.message) {
        alert(error.response.data.message);
      } else {
        alert("Could not book flight. Please try again later.");
      }
    }
  };

  if (!flight) return <p style={{ textAlign: "center" }}>Loading flight details…</p>;

  const inputStyle = {
    width: "100%",
    padding: "10px",
    margin: "5px 0 15px",
    borderRadius: "4px",
    border: "1px solid #ccc",
  };

  return (
    <div
      style={{
        display: "flex",
        justifyContent: "center",
        padding: "40px",
        background: "#f4f4f4",
        minHeight: "100vh",
      }}
    >
      <form
        onSubmit={handleBooking}
        style={{
          background: "#fff",
          padding: "30px",
          borderRadius: "10px",
          width: "100%",
          maxWidth: "500px",
          boxShadow: "0 4px 12px rgba(0,0,0,0.1)",
          fontFamily: "Poppins, sans-serif",
        }}
      >
        <h2 style={{ textAlign: "center", marginBottom: "20px" }}>
          Book Flight: {flight.airline_name}
        </h2>

        <label>Name:</label>
        <input type="text" value={user.name} disabled style={inputStyle} />

        <label>Email:</label>
        <input type="email" value={user.email} disabled style={inputStyle} />

        <label>From:</label>
        <input type="text" value={flight.from} disabled style={inputStyle} />

        <label>To:</label>
        <input type="text" value={flight.to} disabled style={inputStyle} />

        <label>Date:</label>
        <input
          type="text"
          value={new Date(flight.date).toLocaleDateString()}
          disabled
          style={inputStyle}
        />

        <label>Price:</label>
        <input type="text" value={`$${flight.price}`} disabled style={inputStyle} />

        {/* NEW seat class selector */}
        <label>Class:</label>
        <select value={seatClass} onChange={(e) => setSeatClass(e.target.value)} style={inputStyle}>
          <option value="economy">Economy</option>
          <option value="business">Business</option>
        </select>

        <label>Number of People:</label>
        <input
          type="number"
          min={1}
          value={qty}
          onChange={(e) => setQty(Number(e.target.value))}
          required
          style={inputStyle}
        />

        {/* <label>Departure City:</label>
        <input
          type="text"
          value={departureCity}
          onChange={(e) => setDepartureCity(e.target.value)}
          required
          placeholder="Enter departure city"
          style={inputStyle}
        /> */}

        <p style={{ fontWeight: "bold", fontSize: "18px", marginTop: "15px" }}>
          Total Price: ${totalPrice}
        </p>

        <button
          type="submit"
          style={{
            marginTop: "20px",
            backgroundColor: "#007bff",
            color: "#fff",
            padding: "12px",
            border: "none",
            borderRadius: "5px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
          }}
        >
          Confirm Booking
        </button>
      </form>
    </div>
  );
};

export default BookFlight;
