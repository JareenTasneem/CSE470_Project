import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";

function ConfirmedBookings() {
  const { user } = useContext(AuthContext);
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [error, setError] = useState(null);

  // ✅ fetch bookings
  useEffect(() => {
    if (user) {
      axios
        .get("/bookings/user", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => {
          const data = res.data;
          console.log("Raw booking data:", data);

          const bookingsArray = Array.isArray(data)
            ? data
            : Array.isArray(data.bookings)
            ? data.bookings
            : [];

          const filtered = bookingsArray.filter((b) => b.status !== "Cancelled");
          setConfirmedBookings(filtered);
        })
        .catch((err) => {
          console.error("Error fetching confirmed bookings:", err);
          setError("Failed to load confirmed bookings.");
        });
    }
  }, [user]);

  // ✅ delete booking
  const handleDelete = (id) => {
    if (window.confirm("Are you sure you want to cancel this booking? This action cannot be undone.")) {
      axios
        .delete(`/bookings/${id}`, {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then(() => {
          setConfirmedBookings((prev) => prev.filter((b) => b._id !== id));
          alert("Booking cancelled successfully.");
        })
        .catch(() => alert("Failed to cancel booking."));
    }
  };

  // ✅ render single booking
  const renderBookingItem = (item) => {
    console.log("Full booking item:", item);
    console.log("Flight details:", item.flight_details);

    const isCustom = !!item.custom_package && typeof item.custom_package === "object";

    const flights = isCustom && Array.isArray(item.custom_package?.flights)
      ? item.custom_package.flights
      : Array.isArray(item.flights)
      ? item.flights
      : [];

    const hotels = isCustom && Array.isArray(item.custom_package?.hotels)
      ? item.custom_package.hotels
      : Array.isArray(item.hotels)
      ? item.hotels
      : [];

    const entertainments = isCustom && Array.isArray(item.custom_package?.entertainments)
      ? item.custom_package.entertainments
      : Array.isArray(item.entertainments)
      ? item.entertainments
      : [];

    const customTotal =
      flights.reduce((s, f) => s + (f.price || 0), 0) +
      hotels.reduce((s, h) => s + (h.price_per_night || 0), 0) +
      entertainments.reduce((s, e) => s + (e.price || 0), 0);

    const totalPrice = isCustom ? customTotal : item.total_price || 0;

    const title = isCustom
      ? `Custom Package ID: ${item.custom_package?.custom_id || "N/A"}`
      : item.tour_package?.package_title || "Tour Package Booking";

    return (
      <div
        key={item._id}
        style={{
          padding: "15px",
          border: "1px solid #ccc",
          borderRadius: "8px",
          marginBottom: "15px",
          background: "#fff",
          boxShadow: "0 2px 4px rgba(0,0,0,0.1)",
        }}
      >
        <h4>{title}</h4>
        <p>Status: {item.status}</p>
        <p>Total Price: ${totalPrice}</p>
        <p>Booking Date: {new Date(item.createdAt).toLocaleDateString()}</p>

        {flights.length > 0 && (
          <div style={{ marginBottom: "10px" }}>
            <h5 style={{ marginBottom: "5px" }}>Flights:</h5>
            <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
              {flights.map((f) => {
                // Calculate seat info from the booking data
                const basePrice = f.price || 157;
                const totalPrice = item.total_price || 0;
                
                // Try to get seat info directly, or calculate
                const seatClass = item.flight_details?.seatClass || 'economy';
                const qty = item.flight_details?.qty || 1;
                
                return (
                  <li key={f._id} style={{ marginBottom: "15px" }}>
                    <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
                      <img
                        src={f.airline_logo || (item.flightMeta && item.flightMeta.airline_logo) || "/images/default.jpg"}
                        alt="Airline"
                        style={{ width: "50px", height: "50px", objectFit: "cover", borderRadius: "5px" }}
                      />
                      <div>
                        <div style={{ fontWeight: "bold", fontSize: "16px" }}>
                          {f.airline_name || (item.flightMeta && item.flightMeta.airline_name)} - {new Date(f.date || (item.flightMeta && item.flightMeta.date)).toLocaleDateString()}
                        </div>
                        <div>
                          {qty} × {seatClass === "business" ? "Business" : "Economy"} Class(${totalPrice})
                        </div>
                      </div>
                    </div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {hotels.length > 0 && (
          <div style={{ marginBottom: "10px" }}>
            <h5 style={{ marginBottom: "5px" }}>Hotels:</h5>
            <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
              {hotels.map((h) => (
                <li key={h._id}>
                  <strong>{h.hotel_name}</strong> in <em>{h.location}</em> ($
                  {h.price_per_night}/night)
                </li>
              ))}
            </ul>
          </div>
        )}

        {entertainments.length > 0 && (
          <div style={{ marginBottom: "10px" }}>
            <h5 style={{ marginBottom: "5px" }}>Entertainments:</h5>
            <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
              {entertainments.map((e) => (
                <li key={e._id}>
                  <strong>{e.entertainmentName}</strong> in{" "}
                  <em>{e.location}</em> (${e.price})
                </li>
              ))}
            </ul>
          </div>
        )}

        <button
          onClick={() => handleDelete(item._id)}
          style={{
            backgroundColor: "red",
            color: "white",
            padding: "8px 12px",
            border: "none",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Delete Booking
        </button>
      </div>
    );
  };

  return (
    <div style={{ padding: "20px" }}>
      <h2>Your Confirmed Bookings</h2>
      {error ? (
        <p>{error}</p>
      ) : confirmedBookings.length ? (
        confirmedBookings.map(renderBookingItem)
      ) : (
        <p>No confirmed bookings yet.</p>
      )}
    </div>
  );
}

export default ConfirmedBookings;
