// src/ConfirmedBookings.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";

function ConfirmedBookings() {
  const { user } = useContext(AuthContext);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (user) {
      axios
        .get("http://localhost:5000/api/bookings/user", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => {
          console.log("Confirmed bookings data:", res.data); // Log the response to check the data
          setConfirmedBookings(res.data);

          const filteredBookings = res.data.filter(
            (booking) => booking.status !== "Cancelled"
          );
  
          setConfirmedBookings(filteredBookings);
        })
        .catch((err) => {
          console.error("Error fetching confirmed bookings:", err);
          alert("Failed to load confirmed bookings.");
        });
    }
  }, [user]);

  const handleDelete = (bookingId) => {
    axios
      .delete(`http://localhost:5000/api/bookings/${bookingId}`, {
        headers: { Authorization: `Bearer ${user.token}` },
      })
      .then((res) => {
        alert("Booking deleted successfully.");
        setConfirmedBookings((prevBookings) =>
          prevBookings.filter((booking) => booking._id !== bookingId)
        );
      })
      .catch((err) => {
        alert("Failed to delete booking.");
      });
  };

  const renderBookingItem = (item) => (
    <div
      key={item._id}
      style={{
        padding: "10px",
        border: "1px solid #ccc",
        borderRadius: "6px",
        marginBottom: "10px",
        background: "#fff",
      }}
    >
      <h4>{item.name}</h4>
      <p>Status: {item.status}</p>
      <p>Total Price: ${item.total_price}</p>
      <p>Booking Date: {new Date(item.createdAt).toLocaleDateString()}</p>

      <div>
        <h5>Flights</h5>
        {item.flights && item.flights.length > 0 ? (
          item.flights.map((f) => (
            <div key={f._id}>
              <p>{f.airline_name} from {f.from} to {f.to}</p>
              <p>Price: ${f.price}</p>
            </div>
          ))
        ) : (
          <p>No flights booked.</p>
        )}
      </div>

      <div>
        <h5>Hotels</h5>
        {item.hotels && item.hotels.length > 0 ? (
          item.hotels.map((h) => (
            <div key={h._id}>
              <p>{h.hotel_name} in {h.location}</p>
              <p>Price: ${h.price_per_night}</p>
            </div>
          ))
        ) : (
          <p>No hotels booked.</p>
        )}
      </div>

      <div>
        <h5>Entertainments</h5>
        {item.entertainments && item.entertainments.length > 0 ? (
          item.entertainments.map((e) => (
            <div key={e._id}>
              <p>{e.entertainmentName} in {e.location}</p>
              <p>Price: ${e.price}</p>
            </div>
          ))
        ) : (
          <p>No entertainments booked.</p>
        )}
      </div>
      <button
        onClick={() => handleDelete(item._id)}
        style={{
          backgroundColor: "red",
          color: "white",
          padding: "5px 10px",
          border: "none",
          cursor: "pointer",
          borderRadius: "4px",
        }}
      >
        Delete Booking
      </button>
    </div>
  );
  

  return (
    <div>
      <h2>Your Confirmed Bookings</h2>
      {error ? (
        <p>{error}</p> // Display error message if fetching failed
      ) : confirmedBookings.length > 0 ? (
        confirmedBookings.map((booking) => renderBookingItem(booking))
      ) : (
        <p>No confirmed bookings yet.</p>
      )}
    </div>
  );
}

export default ConfirmedBookings;
