import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import axios from "./axiosConfig";
import { useNavigate } from "react-router-dom";
import Navbar from './components/Navbar';
import bookingController from "./controllers/bookingController";
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
          setReviewedIds(res.data.map((rv) => rv.bookingId))
        )
        .catch(() => {});
    }
  }, [user]);

  useEffect(() => {
    const fetchBookings = async () => {
      if (user) {
        try {
          const bookings = await bookingController.getUserBookings(user.token);
          setConfirmedBookings(bookings);
        } catch (err) {
          console.error("Error fetching confirmed bookings:", err);
          if (err.response?.status === 401) {
            alert("Your session has expired. Please log in again.");
            navigate("/login");
          } else {
            setError("Failed to load confirmed bookings.");
          }
        }
      }
    };

    fetchBookings();
  }, [user, navigate]);

  const handleDelete = async (bookingId) => {
    try {
      await bookingController.deleteBooking(bookingId, user.token);
      alert("Booking deleted successfully.");
      setConfirmedBookings((prevBookings) =>
        prevBookings.filter((booking) => booking._id !== bookingId)
      );
    } catch (err) {
      if (err.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
      } else {
        alert("Failed to delete booking.");
      }
    }
  };

  // ✅ render single booking
  const renderBookingItem = (item) => {
    const isCustom = item.custom_package !== null;

    const flights = isCustom
      ? item.custom_package?.flights || []
      : item.flights || [];

    // Prepare hotels array for rendering (avoid mutation)
    let hotelsToRender = [];
    if (isCustom) {
      hotelsToRender = item.custom_package?.hotels || [];
    } else if (item.hotels && item.hotels.length > 0) {
      hotelsToRender = item.hotels;
    } else if (item.hotelMeta && !item.tour_package && !item.flights?.length) {
      hotelsToRender = [{
        _id: item._id,
        hotel_name: item.hotelMeta.hotel_name,
        location: item.hotelMeta.location,
        price_per_night: item.hotelMeta.price_per_night,
        roomType: item.hotel_room_details?.roomType,
        numberOfRooms: item.hotel_room_details?.numberOfRooms
      }];
    }

    const entertainments = isCustom
      ? item.custom_package?.entertainments || []
      : item.entertainments || [];

    // 🧮 Total price calculation
    const customTotal =
      flights.reduce((sum, f) => sum + (f.price || 0), 0) +
      hotelsToRender.reduce((sum, h) => sum + (h.price_per_night || 0), 0) +
      entertainments.reduce((sum, e) => sum + (e.price || 0), 0);

    const totalPrice = isCustom ? customTotal : item.total_price || 0;

    let title;
    let bookingType;

    if (isCustom) {
      title = `Custom Package ID: ${item.custom_package?.custom_id || "N/A"}`;
      bookingType = "Custom Package";
    } else if (item.tour_package) {
      title = item.tour_package.package_title;
      bookingType = "Tour Package";
    } else if (item.flights?.length === 1 && (!item.hotels || item.hotels.length === 0)) {
      title = `Flight Booking: ${item.flights[0].airline_name}`;
      bookingType = "Flight";
    } else if (item.hotelMeta || (item.hotels?.length === 1 && (!item.flights || item.flights.length === 0))) {
      title = `Hotel Booking: ${item.hotelMeta?.hotel_name || item.hotels[0].hotel_name}`;
      bookingType = "Hotel";
    } else {
      title = "Tour Package Booking";
      bookingType = "Package";
    }

    return (
      <div>
      <Navbar />
      <div 
        key={item._id}
        style={{ 
          margin: "20px",
          minWidth: "850px",
        }}>
        <div
          style={{
            display: "grid",
            padding: "15px",
            border: "1px solid #ccc",
            borderRadius: "8px",
            background: "#fff",
            boxShadow: "0 2px 4px rgba(0,0,0,0.3)",
            width: "auto",
            height: "auto",
            transition: "all 0.3s ease-in-out",
            transform: "translateY(0px)" 
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = "translateY(-8px)";
            e.currentTarget.style.boxShadow = "0 8px 20px rgba(0,0,0,0.3)";
            e.currentTarget.style.background = "#f5f5f5";
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = "translateY(0px)";
            e.currentTarget.style.boxShadow = "0 2px 8px rgba(0,0,0,0.2)";
            e.currentTarget.style.background = "#fff";
          }}
        >
          <div style={{ flex: 1 }}>
            <h4>{title}</h4>
            <p>Booking Type: {bookingType}</p>
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

            {hotelsToRender.length > 0 && (
              <div style={{ marginBottom: "10px" }}>
                <h5 style={{ marginBottom: "5px" }}>Hotels:</h5>
                <ul style={{ listStyleType: "disc", paddingLeft: "20px" }}>
                  {hotelsToRender.map((h) => (
                    <li key={h._id}>
                      <strong>{h.hotel_name}</strong> in <em>{h.location}</em>
                      <br />
                      Room Type: {h.roomType || "Standard"}
                      <br />
                      Number of Rooms: {h.numberOfRooms || 1}
                      <br />
                      Price per night: ${h.price_per_night}
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
      </div>
    );
  };

  return (
    <div>
      <h2 style={{textAlign: "center", marginTop: "70px"}}>My Confirmed Bookings</h2>
      {error ? (
        <p>{error}</p>
      ) : confirmedBookings.length > 0 ? (
        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "32px",
            justifyContent: "center",
            alignItems: "flex-start",
            marginTop: "40px",
          }}
        >
          {confirmedBookings.map((booking) => renderBookingItem(booking))}
        </div>
      ) : (
        <p>No confirmed bookings yet.</p>
      )}
    </div>
  );
}

export default ConfirmedBookings;
