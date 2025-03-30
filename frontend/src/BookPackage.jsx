import React, { useState, useContext, useEffect } from "react";
import axios from "./axiosConfig";
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";

function BookPackage() {
  const { id } = useParams(); // package id
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  // Always call hooks unconditionally
  const [formData, setFormData] = useState({
    name: "",
    numberOfPeople: 1,
    startDate: "",
    email: "",
    departureCity: ""
  });

  // Redirect to login if user is not authenticated
  useEffect(() => {
    if (!user) {
      alert("You must be logged in to book a package.");
      navigate("/login");
    }
  }, [user, navigate]);

  // Optionally, render nothing while redirecting
  if (!user) {
    return null;
  }

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      // POST booking data to backend
      await axios.post(`/bookings`, {
        packageId: id,
        ...formData,
      });
      alert("Booking successful!");
      navigate("/myBookings"); // redirect to My Bookings page
    } catch (err) {
      console.error("Error making booking:", err);
      alert("Error processing booking. Please try again.");
    }
  };

  return (
    <div style={{ maxWidth: "500px", margin: "30px auto", padding: "20px", border: "1px solid #ccc", borderRadius: "8px" }}>
      <h2>Book Package</h2>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Name:</label>
          <input
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "5px" }}
          />
        </div>
        <div>
          <label>Number of People:</label>
          <input
            name="numberOfPeople"
            type="number"
            min="1"
            value={formData.numberOfPeople}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "5px" }}
          />
        </div>
        <div>
          <label>Start Date:</label>
          <input
            name="startDate"
            type="date"
            value={formData.startDate}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "5px" }}
          />
        </div>
        <div>
          <label>Email:</label>
          <input
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "5px" }}
          />
        </div>
        <div>
          <label>Departure City:</label>
          <input
            name="departureCity"
            value={formData.departureCity}
            onChange={handleChange}
            required
            style={{ width: "100%", padding: "5px" }}
          />
        </div>
        <button type="submit" style={{ marginTop: "15px", padding: "10px 20px" }}>
          Confirm Booking
        </button>
      </form>
    </div>
  );
}

export default BookPackage;
