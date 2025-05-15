import React, { useState, useEffect, useContext } from "react";
import axios from "./axiosConfig";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import CompareModal from "./CompareModal";
import Navbar from './components/Navbar';
import "./styles/style.css";

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
  const [currentPage, setCurrentPage] = useState(1);
  const hotelsPerPage = 21;

  useEffect(() => {
    axios.get("/hotels")
      .then((res) => setHotels(res.data))
      .catch((err) => console.error("Error fetching hotels:", err));
  }, []);

  useEffect(() => {
  setCurrentPage(1); // reset pagination when filters change
  }, [locationFilter, starFilter, priceSort]);

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

  const indexOfLastHotel = currentPage * hotelsPerPage;
  const indexOfFirstHotel = indexOfLastHotel - hotelsPerPage;
  const currentHotels = filteredHotels.slice(indexOfFirstHotel, indexOfLastHotel);
  const totalPages = Math.ceil(filteredHotels.length / hotelsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    <div>
      <Navbar />
      <div style={{ padding: "30px", backgroundColor: "#f8f8f8", fontFamily: "Poppins, sans-serif" }}>
        <h1 style={{ textAlign: "center", marginBottom: "40px" }}>Browse Hotels</h1>
        <div style={{ display: "flex", gap: "30px", justifyContent: "center", marginBottom: "20px" }}>
          {[ 
            <input
              key="location"
              type="text"
              placeholder="Filter by location"
              value={locationFilter}
              onChange={(e) => setLocationFilter(e.target.value)}
              className="filter-input"
            />,
            <select
              key="star"
              value={starFilter}
              onChange={(e) => setStarFilter(e.target.value)}
              className="filter-input"
            >
              <option value="">Filter by Star Rating</option>
              <option value="1">1★</option>
              <option value="2">2★</option>
              <option value="3">3★</option>
              <option value="4">4★</option>
              <option value="5">5★</option>
            </select>,
            <select
              key="price"
              value={priceSort}
              onChange={(e) => setPriceSort(e.target.value)}
              className="filter-input"
            >
              <option value="">Sort by Price</option>
              <option value="asc">Lowest to Highest</option>
              <option value="desc">Highest to Lowest</option>
            </select>
          ]}
        </div>
        {/* <div style={{ textAlign: "center", margin: "20px 0" }}>
          <Link to="/confirmedBookings">
            <button
              style={{
                padding: "10px 16px",
                backgroundColor: "#000000",
                color: "#ffffff",
                border: "none",
                borderRadius: "6px",
                cursor: "pointer",
                fontWeight: "500"
              }}
            >
              View Confirmed Bookings
            </button>
          </Link>
        </div> */}
        <div style={{ 
          display: "grid", 
          gridTemplateColumns: "repeat(auto-fill, minmax(390px, 1fr))", 
          gap: "40px", 
          marginTop: "50px",
          width: "90%",
          justifyItems: "center",
          alignItems: "start", 
          marginLeft: "auto",        
          marginRight: "auto"
        }}>
          {currentHotels.map((hotel) => (
            <div 
              key={hotel._id} 
              style={{ 
                background: "#fff", 
                borderRadius: "2px", 
                // padding: "15px", 
                boxShadow: "0 2px 8px rgba(0,0,0,0.3)",
                width: "390px",
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
              <img
                src={hotel.images?.[0] || "/images/temp4.jpeg"}
                alt="Hotel"
                style={{ width: "100%", height: "180px", objectFit: "cover", borderTopRightRadius: "2px", borderTopLeftRadius: "2px" }}
              />
              <h3 style={{ margin: "5px 15px 5px",
                           whiteSpace: "nowrap",        
                           overflow: "hidden",          
                           textOverflow: "ellipsis" }}>{hotel.hotel_name}</h3>
              <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 15px" }}>
                <div style={{ flex: 1 }}>
                  <strong>Location:</strong> {hotel.location}
                </div>
              </div>

              <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 15px", whiteSpace: "nowrap" }}>
                <div style={{ flexBasis: "130px", textAlign: "left" }}>
                  <strong>Price/Night:</strong> ${hotel.price_per_night}
                </div>
                <div style={{ flexBasis: "130px", textAlign: "left" }}>
                  <strong>Stars:</strong> {hotel.star_rating || "N/A"}★
                </div>
              </div>
              <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                <div style={{ flex: 1 }}>
                  <Link to={`/hotels/details/${hotel._id}`}>
                    <button
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#181818",
                        color: "#fff",
                        borderRight: "1px solid #333",
                        // borderTopRadius: 0,
                        borderTopLeftRadius: "0",
                        borderTopRightRadius: "0",
                        borderBottomRightRadius: "0",
                        borderBottomLeftRadius: "2px",
                        cursor: "pointer",
                        fontWeight: "500",
                        height: "100%",
                        width: "100%"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = "#2a2a2a";
                        e.target.style.color = "#fff";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "#181818";
                        e.target.style.color = "#fff";
                      }}
                    >
                      View Details
                    </button>
                  </Link>
                </div>
                <div style={{ flex: 1 }}>
                  <Link to={`/book-hotel/${hotel._id}`}>
                    <button 
                      style={{
                        padding: "10px 20px",
                        backgroundColor: "#181818",
                        color: "#fff",
                        border: "none",
                        borderRight: "1px solid #333",
                        borderLeft: "1px solid #333",
                        borderRadius: "0",
                        cursor: "pointer",
                        fontWeight: "500",
                        height: "100%",
                        width: "100%"
                      }}
                      onMouseOver={(e) => {
                        e.target.style.background = "#2a2a2a";
                        e.target.style.color = "#fff";
                      }}
                      onMouseOut={(e) => {
                        e.target.style.background = "#181818";
                        e.target.style.color = "#fff";
                      }}
                    >
                      Book Now
                    </button>
                  </Link>
                </div>
                <div style={{ flex: 1 }}>
                  <button 
                    onClick={() => handleCompare(hotel)}
                    style={{
                      padding: "10px 20px",
                      backgroundColor: "#181818",
                      color: "#fff",
                      border: "none",
                      borderLeft: "1px solid #333",
                      borderTopLeftRadius: "0",
                      borderTopRightRadius: "0",
                      borderBottomLeftRadius: "0",
                      borderBottomRightRadius: "2px",
                      cursor: "pointer",
                      fontWeight: "500",
                      height: "100%",
                      width: "100%"
                    }}
                    onMouseOver={(e) => {
                      e.target.style.background = "#2a2a2a";
                      e.target.style.color = "#fff";
                    }}
                    onMouseOut={(e) => {
                      e.target.style.background = "#181818";
                      e.target.style.color = "#fff";
                    }}
                  >
                    Compare
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
        {filteredHotels.length === 0 && (
          <p style={{ textAlign: "center", marginTop: "30px", color: "#999" }}>
            No hotels match your filters.
          </p>
        )}
        {totalPages > 1 && (
          <div style={{ display: 'flex', justifyContent: 'center', marginTop: 64, gap: 16 }}>
            {/* Previous Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.max(prev - 1, 1))}
              disabled={currentPage === 1}
              style={{
                fontSize: 14,
                padding: '4px 12px',
                cursor: currentPage === 1 ? 'not-allowed' : 'pointer',
                borderRadius: 6,
                border: '2px solid #ccc',
                background: '#fff',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#181818')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ccc')}
            >
              Previous
            </button>

            {/* Dots */}
            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
              {Array.from({ length: totalPages }, (_, i) => (
                <span
                  key={i}
                  onClick={() => setCurrentPage(i + 1)}
                  style={{
                    width: 10,
                    height: 10,
                    borderRadius: '50%',
                    backgroundColor: currentPage === i + 1 ? 'black' : '#ccc',
                    cursor: 'pointer',
                    transition: 'background-color 0.2s',
                  }}
                />
              ))}
            </div>

            {/* Next Button */}
            <button
              onClick={() => setCurrentPage((prev) => Math.min(prev + 1, totalPages))}
              disabled={currentPage === totalPages}
              style={{
                fontSize: 14,
                padding: '0 30px 0 30px',
                cursor: currentPage === totalPages ? 'not-allowed' : 'pointer',
                borderRadius: 6,
                border: '2px solid #ccc',
                background: '#fff',
                transition: 'border-color 0.2s',
              }}
              onMouseEnter={(e) => (e.currentTarget.style.borderColor = '#181818')}
              onMouseLeave={(e) => (e.currentTarget.style.borderColor = '#ccc')}
            >
              Next
            </button>
          </div>
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
    </div>
  );
}

export default HotelList;
