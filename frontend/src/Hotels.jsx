import React, { useContext, useEffect, useState } from "react";
import { CustomizeContext } from "./CustomizeContext";
import axios from "axios";

function Hotels() {
  const [hotels, setHotels] = useState([]);
  const { addToCustomizeLog } = useContext(CustomizeContext);

  useEffect(() => {
    // Example: fetch hotels from your backend
    axios.get("http://localhost:5000/api/hotels")
      .then((res) => setHotels(res.data))
      .catch((err) => console.error("Error fetching hotels:", err));
  }, []);

  const handleBookHotel = (hotel) => {
    addToCustomizeLog({ type: "hotel", data: hotel });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Hotels</h2>
      {hotels.map((hotel) => (
        <div key={hotel._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
          <h4>{hotel.hotel_name}</h4>
          <p>Price: {hotel.price}</p>
          <button onClick={() => handleBookHotel(hotel)}>Add to Customize Log</button>
        </div>
      ))}
    </div>
  );
}

export default Hotels;
