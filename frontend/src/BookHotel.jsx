// src/BookHotel.jsx
import React, { useEffect, useState, useContext } from "react";
import axios from "./axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import bookingController from "./controllers/bookingController";
import "./styles/style.css";

const BookHotel = () => {
  const { id } = useParams(); // Hotel ID from URL
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  const [hotel, setHotel] = useState(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    roomType: "",
    numberOfRooms: 1,
    numberOfPeople: 1,
    startDate: "",
    endDate: "",
  });
  
  const [errors, setErrors] = useState({});

  const [loading, setLoading] = useState(false);


  // 🔐 Redirect to login if not authenticated
  useEffect(() => {
    if (!user) {
      alert("Please log in to book a hotel.");
      navigate("/login");
    }
  }, [user, navigate]);

  // 📦 Auto-fill user info & fetch hotel data
  useEffect(() => {
    if (user) {
      setFormData((prev) => ({
        ...prev,
        name: user.name,
        email: user.email,
      }));
    }

    axios.get(`/hotels/${id}`)
      .then((res) => setHotel(res.data))
      .catch((err) => console.error("Failed to fetch hotel details:", err));
  }, [id, user]);
  

  const validateAvailability = (roomType = formData.roomType, numberOfRooms = formData.numberOfRooms) => {
    if (!hotel) return false;
    const selectedRoom = hotel.room_types.find(r => r.type === roomType);
    const roomsRequested = parseInt(numberOfRooms);
  
    if (!selectedRoom || roomsRequested > selectedRoom.count) {
      setErrors(prev => ({ ...prev, roomType: "Not enough rooms available" }));
      return false;
    }
  
    setErrors(prev => ({ ...prev, roomType: "" }));
    return true;
  };  


  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));

    if (name === "roomType" || name === "numberOfRooms") {
      const updatedFormData = { ...formData, [name]: value };
      validateAvailability(updatedFormData.roomType, updatedFormData.numberOfRooms);
    }    
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
  
    if (!validateAvailability()) return;
  
    try {
      setLoading(true);
      await bookingController.createHotelBooking(hotel, formData, user.token);
      alert("Hotel booked successfully!");
      navigate("/confirmedBookings");
    } catch (err) {
      console.error("Error booking hotel:", err);
      if (err.response?.status === 401) {
        alert("Your session has expired. Please log in again.");
        navigate("/login");
      } else {
        alert(err.response?.data?.message || "Booking failed. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };
  

  if (!user || !hotel) return <p>Loading...</p>;

  return (
    <div style={{ maxWidth: "600px", margin: "30px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px", fontFamily: "Poppins, sans-serif", border: "1px solid #ddd", boxShadow: "0 2px 8px rgba(0,0,0,0.2)" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Book Hotel: {hotel.hotel_name}</h2>
      <form onSubmit={handleSubmit} style={{ padding: "15px"}}>
        <div>
          <label>Name:</label>
          <input name="name" value={formData.name} disabled style={{ width: "100%", padding: "8px", marginBottom: "10px" }} className="filter-input"/>
        </div>
        <div>
          <label>Email:</label>
          <input name="email" value={formData.email} disabled style={{ width: "100%", padding: "8px", marginBottom: "10px" }} className="filter-input"/>
        </div>
        <div>
          <label>Room Type:</label>
          <select
            name="roomType"
            value={formData.roomType}
            onChange={handleChange}
            style={{
              width: "100%",
              padding: "8px",
              marginBottom: "10px",
              borderColor: errors.roomType ? "red" : "#ccc"
            }}
            className="filter-input"
            required
          >
            <option value="">Select a room type</option>
            {hotel.room_types?.map((rt, idx) => (
              <option key={idx} value={rt.type}>
                {rt.type} - {rt.count} available
              </option>
            ))}
          </select>
          {errors.roomType && <p style={{ color: "red", marginTop: "-8px" }}>{errors.roomType}</p>}
        </div>

        <div>
          <label>Number of Rooms:</label>
          <input
            type="number"
            name="numberOfRooms"
            value={formData.numberOfRooms}
            min={1}
            onChange={handleChange}
            required
            className="filter-input"
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>

        <div>
          <label>Number of People:</label>
          <input
            type="number"
            name="numberOfPeople"
            value={formData.numberOfPeople}
            min={1}
            onChange={handleChange}
            required
            className="filter-input"
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>

        <div>
          <label>Start Date:</label>
          <input
            type="date"
            name="startDate"
            value={formData.startDate}
            onChange={handleChange}
            required
            className="filter-input"
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>

        <div>
          <label>End Date:</label>
          <input
            type="date"
            name="endDate"
            value={formData.endDate}
            onChange={handleChange}
            required
            className="filter-input"
            style={{ width: "100%", padding: "8px", marginBottom: "10px" }}
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          style={{
            width: "100%",
            padding: "12px",
            backgroundColor: loading ? "#181818" : "#181818",
            color: "white",
            border: "none",
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            marginTop: "20px"
          }}
          className="filter-input"
        >
          {loading ? "Booking..." : "Confirm Booking"}
        </button>

      </form>
    </div>
  );
};

export default BookHotel;
