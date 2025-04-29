import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // <-- Added Link import
import axios from "./axiosConfig";

function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    axios.get(`/hotels/${id}`).then((res) => setHotel(res.data));
  }, [id]);

  if (!hotel) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Poppins, sans-serif" }}>
      <h2>{hotel.hotel_name}</h2>
      <img src={hotel.images?.[0]} style={{ maxWidth: "300px" }} />
      <p><strong>Location:</strong> {hotel.location}</p>
      <p><strong>Description:</strong> {hotel.description}</p>
      <p><strong>Price per Night:</strong> ${hotel.price_per_night}</p>
      <p><strong>Rooms Available:</strong> {hotel.rooms_available}</p>
      <p><strong>Amenities:</strong> {hotel.amenities.join(", ")}</p>
      <p><strong>Room Types:</strong> {hotel.room_types.join(", ")}</p>
      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: "10px", padding: "8px 15px", cursor: "pointer" }}
      >
        ← Go Back
      </button>
    </div>
  );
}

export default HotelDetails;
