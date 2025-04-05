// src/HotelRoomDetails.jsx
import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import axios from "./axiosConfig";

const HotelRoomDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);

  useEffect(() => {
    axios.get(`/hotels/${id}`).then((res) => setHotel(res.data));
  }, [id]);

  if (!hotel) return <p>Loading hotel details...</p>;

  return (
    <div style={{ padding: "30px", fontFamily: "Poppins, sans-serif", background: "#f5f5f5" }}>
      <h1>{hotel.hotel_name}</h1>
      <img
        src={hotel.images?.[0] || "/images/temp4.jpeg"}
        alt="Hotel"
        style={{ width: "100%", maxWidth: "600px", borderRadius: "10px", marginBottom: "20px" }}
      />

      <p><strong>Location:</strong> {hotel.location}</p>
      <p><strong>Description:</strong> {hotel.description}</p>
      <p><strong>Price per Night:</strong> ${hotel.price_per_night}</p>
      <p><strong>Rooms Available (Total):</strong> {hotel.rooms_available}</p>
      <p><strong>Amenities:</strong> {hotel.amenities?.join(", ")}</p>
      <p><strong>Star Rating:</strong> {hotel.star_rating || "N/A"} ★</p>

      <h3 style={{ marginTop: "30px" }}>Room Types and Availability</h3>
      <ul>
        {hotel.room_types?.map((rt, index) => (
          <li key={index}>
            <strong>{rt.type}:</strong> {rt.count} rooms
          </li>
        ))}
      </ul>

      <div style={{ marginTop: "30px", display: "flex", gap: "10px" }}>
      <Link
        to={`/book-hotel/${hotel._id}`}
        style={{
          padding: "10px 20px",
          backgroundColor: "#007BFF",
          color: "#fff",
          textDecoration: "none",
          borderRadius: "4px"
        }}
      >
        Book Now
      </Link>

        <Link
          to="/hotels"
          style={{
            padding: "10px 20px",
            backgroundColor: "#333",
            color: "#fff",
            textDecoration: "none",
            borderRadius: "4px"
          }}
        >
          ← Back to Hotel List
        </Link>
      </div>
    </div>
  );
};

export default HotelRoomDetails;
