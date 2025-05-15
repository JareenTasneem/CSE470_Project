import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";
import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify"; //Added extra
// import "react-toastify/dist/ReactToastify.css"; //Added extra

function ConfirmedBookings() {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();
  const [confirmedBookings, setConfirmedBookings] = useState([]);
  const [error, setError] = useState(null);
  const [reviewedIds, setReviewedIds] = useState([]);

  useEffect(() => {
    if (user) {
      axios
        .get('/reviews/my-reviews', {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) =>
          setReviewedIds(res.data.map((rv) => rv.bookingId)) // ← we added bookingId in the API
        )
        .catch(() => {});
    }
  }, [user]);

  // ✅ fetch bookings
  useEffect(() => {
    if (user) {
      axios
        .get("http://localhost:5000/api/bookings/user", {
          headers: { Authorization: `Bearer ${user.token}` },
        })
        .then((res) => {
          const filteredBookings = res.data.filter(
            (booking) => booking.status !== "Cancelled"
          );
          setConfirmedBookings(filteredBookings);
        })
        .catch((err) => {
          console.error("Error fetching confirmed bookings:", err);
          setError("Failed to load confirmed bookings.");
        });
    }
  }, [user]);

  // ✅ delete booking
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

  // ✅ render single booking
  const renderBookingItem = (item) => {
    const isCustom = item.custom_package !== null;

    const flights = isCustom
      ? item.custom_package?.flights || []
      : item.flights || [];

    const hotels = isCustom
      ? item.custom_package?.hotels || []
      : item.hotels || [];

    const entertainments = isCustom
      ? item.custom_package?.entertainments || []
      : item.entertainments || [];

    // 🧮 Total price calculation
    const customTotal =
      flights.reduce((sum, f) => sum + (f.price || 0), 0) +
      hotels.reduce((sum, h) => sum + (h.price_per_night || 0), 0) +
      entertainments.reduce((sum, e) => sum + (e.price || 0), 0);

    const totalPrice = isCustom ? customTotal : item.total_price || 0;

    let title;

    if (isCustom) {
      title = `Custom Package ID: ${item.custom_package?.custom_id || "N/A"}`;
    } else if (item.tour_package) {
      title = item.tour_package.package_title;
    } else if (item.flights?.length === 1 && (!item.hotels || item.hotels.length === 0)) {
      title = `Flight Booking: ${item.flights[0].airline_name}`;
    } else if (item.hotels?.length === 1 && (!item.flights || item.flights.length === 0)) {
      title = `Hotel Booking: ${item.hotels[0].hotel_name}`;
    } else {
      title = "Tour Package Booking";
    }

    return (
      <div 
        key={item._id}
        style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(550px, 1fr))", 
          gap: "40px", 
          marginTop: "50px",
          width: "90%",
          justifyItems: "center",
          alignItems: "start", 
          marginLeft: "auto",        
          marginRight: "auto"
        }}>
        <div
          style={{
            display: "grid",
            // flexDirection: "column",
            // justifyContent: "space-between",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            margin: "20px",
            background: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            width: "330px",
            height: "550px",
            transition: "all 0.3s ease-in-out",
            transform: "translateY(0px)" 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
            e.currentTarget.style.background = "#f5f5f5"; // slightly lighter grey
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
            e.currentTarget.style.background = "#fff";
          }}
        >
          <div style={{ flex: 1 }}>
            <h4>{title}</h4>
            <p>Status: {item.status}</p>
            <p>Total Price: ${totalPrice}</p>
            <p>Booking Date: {new Date(item.createdAt).toLocaleDateString()}</p>

            {!isCustom && item.tour_package && (
              <div>
                <h5>Tour Package Details</h5>
                <p>Location: {item.tour_package.location}</p>
                <p>Duration: {item.tour_package.duration}</p>
                <p>Price: ${item.tour_package.price}</p>
              </div>
            )}

            {flights.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <h5 style={{ marginBottom: "5px" }}>Flights:</h5>
                <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                  {flights.map((f) => (
                    <li key={f._id}>
                      <strong>{f.airline_name}</strong> from{" "}
                      <em>{f.from}</em> to <em>{f.to}</em> on{" "}
                      {new Date(f.date).toLocaleDateString()} (Price: ${f.price})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {hotels.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <h5 style={{ marginBottom: "5px" }}>Hotels:</h5>
                <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                  {hotels.map((h) => (
                    <li key={h._id}>
                      <strong>{h.hotel_name}</strong> in <em>{h.location}</em> (Price per night: ${h.price_per_night})
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
                      <strong>{e.entertainmentName}</strong> in <em>{e.location}</em> (Price: ${e.price})
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <div style={{ display: "flex", justifyContent: "space-between", gap: "5px", marginTop: "auto" }}>
              <div style={{ flex: 1 }}>
                <button
                  onClick={() => handleDelete(item._id)}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "red",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                    height: "100%",
                    width: "95%"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#f28b82";
                    e.target.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "red";
                    e.target.style.color = "#fff";
                  }}
                >
                  Delete Booking
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <button
                  onClick={() => navigate(`/write-review?bookingId=${item._id}`)}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#ffc107",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                    height: "100%",
                    width: "95%"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#ffda3b";
                    e.target.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "#ffc107";
                    e.target.style.color = "#fff";
                  }}
                >
                  Write Review
                </button>
              </div>
              <div style={{ flex: 1 }}>
                <button
                  onClick={() => {
                    if (!item._id) {
                      console.error('Booking ID missing for Pay Now:', item);
                      alert('Booking ID missing. Please try again.');
                      return;
                    }
                    console.log('Navigating to payment options for booking:', item._id);
                    navigate(`/payment-options/${item._id}`);
                  }}
                  style={{
                    padding: "10px 15px",
                    backgroundColor: "#0066ff",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                    height: "100%",
                    width: "95%"
                  }}
                  onMouseOver={(e) => {
                    e.target.style.background = "#3385ff";
                    e.target.style.color = "#fff";
                  }}
                  onMouseOut={(e) => {
                    e.target.style.background = "#0066ff";
                    e.target.style.color = "#fff";
                  }}
                >
                  Pay Now
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div>
      <h2>Your Confirmed Bookings</h2>
      {error ? (
        <p>{error}</p>
      ) : confirmedBookings.length > 0 ? (
        confirmedBookings.map((booking) => renderBookingItem(booking))
      ) : (
        <p>No confirmed bookings yet.</p>
      )}
    </div>
  );
}

export default ConfirmedBookings;
