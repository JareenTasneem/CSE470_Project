import React, { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom"; // <-- Added Link import
import axios from "./axiosConfig";

function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);

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
      <Link to="/customize-package">
        <button style={{ marginBottom: '10px' }}>← Back to Customize</button>
      </Link>
    </div>
  );
}

export default HotelDetails;
