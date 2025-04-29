import React, { useState, useEffect, useContext } from "react";
import axios from "./axiosConfig";
import { Link, useLocation } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import CompareModal from "./CompareModal";

function HotelList() {
  const [hotels, setHotels] = useState([]);
  const [locationFilter, setLocationFilter] = useState("");
  const [priceSort, setPriceSort] = useState("");
  const [starFilter, setStarFilter] = useState("");
  const { user } = useContext(AuthContext);
  const location = useLocation();

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareHotel, setCompareHotel] = useState(null);
  const [compareHotels, setCompareHotels] = useState([]);

  useEffect(() => {
    axios.get("/hotels")
      .then((res) => setHotels(res.data))
      .catch((err) => console.error("Error fetching hotels:", err));
  }, []);

  let filteredHotels = hotels;
  if (locationFilter) {
    filteredHotels = filteredHotels.filter(h =>
      h.location.toLowerCase().includes(locationFilter.toLowerCase())
    );
  }
  if (starFilter) {
    filteredHotels = filteredHotels.filter(h => h.star_rating === Number(starFilter));
  }
  if (priceSort === "asc") {
    filteredHotels = [...filteredHotels].sort((a, b) => a.price_per_night - b.price_per_night);
  } else if (priceSort === "desc") {
    filteredHotels = [...filteredHotels].sort((a, b) => b.price_per_night - a.price_per_night);
  }

  const handleCompare = (hotel) => {
    axios.get(`/hotels/compare?location=${encodeURIComponent(hotel.location)}`)
      .then((response) => {
        setCompareHotel(hotel);
        setCompareHotels(response.data);
        setIsCompareModalOpen(true);
      })
      .catch((err) => {
        console.error("Error comparing hotels:", err);
        alert("Error comparing hotels. Please try again.");
      });
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "#f8f8f8", fontFamily: "Poppins, sans-serif" }}>
      <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Browse Hotels</h1>
      <div style={{ display: "flex", gap: "10px", justifyContent: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Filter by location"
          value={locationFilter}
          onChange={(e) => setLocationFilter(e.target.value)}
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        />
        <select
          value={starFilter}
          onChange={(e) => setStarFilter(e.target.value)}
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">Filter by Star Rating</option>
          <option value="1">1★</option>
          <option value="2">2★</option>
          <option value="3">3★</option>
          <option value="4">4★</option>
          <option value="5">5★</option>
        </select>
        <select
          value={priceSort}
          onChange={(e) => setPriceSort(e.target.value)}
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc" }}
        >
          <option value="">Sort by Price</option>
          <option value="asc">Lowest to Highest</option>
          <option value="desc">Highest to Lowest</option>
        </select>
      </div>
      <div style={{ textAlign: "center", margin: "20px 0" }}>
        <Link to="/myBookings" state={{ background: location }}>
          <button
            style={{
              background: "#6c63ff",
              color: "#fff",
              padding: "10px 20px",
              border: "none",
              borderRadius: "4px",
              cursor: "pointer",
            }}
          >
            View Confirmed Bookings
          </button>
        </Link>
      </div>
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "20px" 
      }}>
        {filteredHotels.map((hotel) => (
          <div 
            key={hotel._id} 
            style={{ 
              background: "#fff", 
              borderRadius: "8px", 
              padding: "15px", 
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
            }}
          >
            <img
              src={hotel.images?.[0] || "/images/temp4.jpeg"}
              alt="Hotel"
              style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "6px" }}
            />
            <h3 style={{ margin: "10px 0 5px" }}>{hotel.hotel_name}</h3>
            <p><strong>Location:</strong> {hotel.location}</p>
            <p><strong>Price/Night:</strong> ${hotel.price_per_night}</p>
            <p><strong>Stars:</strong> {hotel.star_rating || "N/A"}★</p>
            <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
              <Link to={`/hotels/details/${hotel._id}`} style={{ textDecoration: "none", color: "#007bff" }}>
                View Details
              </Link>
              <button 
                onClick={() => handleCompare(hotel)}
                style={{
                  padding: "6px 12px",
                  backgroundColor: "#ffc107",
                  color: "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                }}
              >
                Compare
              </button>
            </div>
          </div>
        ))}
      </div>
      {filteredHotels.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "30px", color: "#999" }}>
          No hotels match your filters.
        </p>
      )}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        items={compareHotels}
        currentItem={compareHotel}
        type="hotel"
        onCompareItem={handleCompare}
      />
    </div>
  );
}

export default HotelList;
