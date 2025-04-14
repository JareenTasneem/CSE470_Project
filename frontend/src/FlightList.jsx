import React, { useEffect, useState } from "react";
import axios from "./axiosConfig";
import { Link, useNavigate, useLocation } from "react-router-dom";
import CompareModal from "./CompareModal";

const FlightList = () => {
  const [flights, setFlights] = useState([]);
  const [searchTo, setSearchTo] = useState("");
  const [searchAirline, setSearchAirline] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [maxPrice, setMaxPrice] = useState("");

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareFlight, setCompareFlight] = useState(null);
  const [compareFlights, setCompareFlights] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    axios.get("/flights")
      .then((res) => {
        console.log("Flights fetched:", res.data);
        setFlights(res.data);
      })
      .catch((err) => {
        console.error("Error fetching flights:", err);
        alert("Error fetching flights. See console for details.");
      });
  }, []);

  const filteredFlights = flights.filter(f =>
    (!searchTo || f.to.toLowerCase().includes(searchTo.toLowerCase())) &&
    (!searchAirline || f.airline_name.toLowerCase().includes(searchAirline.toLowerCase())) &&
    (!searchDate || f.date.startsWith(searchDate)) &&
    (!maxPrice || f.price <= parseFloat(maxPrice))
  );

  // This is the same handleCompare function you already had,
  // but we will also pass it down to CompareModal so that, if
  // you want, you can "re-Compare" from within the modal.
  const handleCompare = (flight) => {
    axios.get(`/flights/compare?destination=${encodeURIComponent(flight.to)}`)
      .then((response) => {
        setCompareFlight(flight);
        setCompareFlights(response.data);
        setIsCompareModalOpen(true);
      })
      .catch((err) => {
        console.error("Error comparing flights:", err);
        alert("Error comparing flights. Please try again.");
      });
  };

  return (
    <div style={{ padding: "30px", backgroundColor: "#f8f8f8", fontFamily: "Poppins, sans-serif" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "30px" }}>
        <h1 style={{ margin: 0 }}>Browse Flights</h1>
        <Link to="/myBookings" state={{ background: location }}>
          <button
            style={{
              padding: "10px 16px",
              backgroundColor: "#6f42c1",
              color: "#fff",
              border: "none",
              borderRadius: "6px",
              cursor: "pointer",
              fontWeight: "500"
            }}
          >
            View Confirmed Bookings
          </button>
        </Link>
      </div>

      {/* Filters */}
      <div style={{ display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "center", marginBottom: "20px" }}>
        <input
          type="text"
          placeholder="Destination"
          value={searchTo}
          onChange={(e) => setSearchTo(e.target.value)}
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc", width: "200px" }}
        />
        <input
          type="text"
          placeholder="Airline"
          value={searchAirline}
          onChange={(e) => setSearchAirline(e.target.value)}
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc", width: "200px" }}
        />
        <input
          type="date"
          value={searchDate}
          onChange={(e) => setSearchDate(e.target.value)}
          style={{ padding: "10px", borderRadius: "4px", border: "1px solid #ccc", width: "180px" }}
        />
        <input
          type="number"
          step="any"
          placeholder="Max Price ($)"
          value={maxPrice}
          onChange={(e) => setMaxPrice(e.target.value)}
          style={{
            padding: "10px",
            borderRadius: "4px",
            border: "1px solid #ccc",
            width: "160px",
            MozAppearance: "textfield"
          }}
          onWheel={(e) => e.target.blur()}
        />
      </div>

      {/* Flight Cards */}
      <div style={{ 
        display: "grid", 
        gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", 
        gap: "20px" 
      }}>
        {filteredFlights.map((flight) => (
          <div 
            key={flight._id} 
            style={{ 
              background: "#fff", 
              borderRadius: "8px", 
              padding: "15px", 
              boxShadow: "0 2px 8px rgba(0,0,0,0.1)" 
            }}
          >
            <img
              src={flight.airline_logo || "/images/default.jpg"}
              alt="Airline"
              style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "6px" }}
            />
            <h3 style={{ margin: "10px 0 5px" }}>{flight.airline_name}</h3>
            <p><strong>From:</strong> {flight.from}</p>
            <p><strong>To:</strong> {flight.to}</p>
            <p><strong>Date:</strong> {new Date(flight.date).toLocaleDateString()}</p>
            <p><strong>Price:</strong> ${flight.price}</p>
            <p><strong>Seats Available:</strong> {flight.total_seats || "N/A"}</p>
            <div style={{ marginTop: "5px", fontSize: "0.9em", color: "#666" }}>
              {flight.seat_types &&
                flight.seat_types.map(seat => (
                  <p key={seat.type}>
                    <span style={{ textTransform: "capitalize" }}>{seat.type}</span>: {seat.count} seats
                  </p>
                ))
              }
            </div>
            {/* Buttons */}
            <div style={{ marginTop: "15px", display: "flex", gap: "10px", justifyContent: "center" }}>
              <Link
                to={`/flights/details/${flight._id}`}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "#fff",
                  borderRadius: "4px",
                  textDecoration: "none",
                  fontWeight: "500",
                  flex: 1,
                  textAlign: "center"
                }}
              >
                View Details
              </Link>
              <Link to={`/book-flight/${flight._id}`} style={{ flex: 1 }}>
                <button 
                  style={{
                    padding: "10px 20px",
                    backgroundColor: "#28a745",
                    color: "#fff",
                    border: "none",
                    borderRadius: "4px",
                    cursor: "pointer",
                    fontWeight: "500",
                    width: "100%"
                  }}
                >
                  Book Now
                </button>
              </Link>
              <button 
                onClick={() => handleCompare(flight)}
                style={{
                  padding: "10px 20px",
                  backgroundColor: "#ffc107",
                  color: "#000",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer",
                  fontWeight: "500",
                  width: "100%"
                }}
              >
                Compare
              </button>
            </div>
          </div>
        ))}
      </div>

      {filteredFlights.length === 0 && (
        <p style={{ textAlign: "center", marginTop: "30px", color: "#999" }}>
          No flights match your filters.
        </p>
      )}

      {/* Updated CompareModal: now we pass onCompareItem={handleCompare} */}
      <CompareModal
        isOpen={isCompareModalOpen}
        onClose={() => setIsCompareModalOpen(false)}
        items={compareFlights}
        currentItem={compareFlight}
        type="flight"
        onCompareItem={handleCompare}
      />
    </div>
  );
};

export default FlightList;
