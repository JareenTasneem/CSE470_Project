import React, { useEffect, useState, useContext } from "react";
import axios from "./axiosConfig";
import { Link, useNavigate, useLocation } from "react-router-dom";
import { AuthContext } from "./contexts/AuthContext";
import CompareModal from "./CompareModal";
import Navbar from './components/Navbar';
import "./styles/style.css";

const FlightList = () => {
  const [flights, setFlights] = useState([]);
  const [searchTo, setSearchTo] = useState("");
  const [searchAirline, setSearchAirline] = useState("");
  const [searchDate, setSearchDate] = useState("");
  const [maxPrice, setMaxPrice] = useState("");
  const { user } = useContext(AuthContext);

  const [isCompareModalOpen, setIsCompareModalOpen] = useState(false);
  const [compareFlight, setCompareFlight] = useState(null);
  const [compareFlights, setCompareFlights] = useState([]);

  const navigate = useNavigate();
  const location = useLocation();

  const [currentPage, setCurrentPage] = useState(1);
  const flightsPerPage = 21;

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

    useEffect(() => {
    setCurrentPage(1); // reset pagination when filters change
    }, [searchTo, searchAirline, searchDate, maxPrice]);

  const filteredFlights = flights.filter(f =>
    (!searchTo || f.to.toLowerCase().includes(searchTo.toLowerCase())) &&
    (!searchAirline || f.airline_name.toLowerCase().includes(searchAirline.toLowerCase())) &&
    (!searchDate || f.date.startsWith(searchDate)) &&
    (!maxPrice || f.price <= parseFloat(maxPrice))
  );

  const indexOfLastFlight = currentPage * flightsPerPage;
  const indexOfFirstFlight = indexOfLastFlight - flightsPerPage;
  const currentFlight = filteredFlights.slice(indexOfFirstFlight, indexOfLastFlight);
  const totalPages = Math.ceil(filteredFlights.length / flightsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

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
    <div>
      <Navbar />
        <div style={{ padding: "30px", backgroundColor: "#f8f8f8", fontFamily: "Poppins, sans-serif" }}>
          <h1 style={{ textAlign: "center", marginBottom: "40px" }}>Browse Flights</h1>
          <div style={{ display: "flex", gap: "30px", justifyContent: "center", marginBottom: "20px" }}>
            <input
              type="text"
              placeholder="Destination"
              value={searchTo}
              onChange={(e) => setSearchTo(e.target.value)}
              className="filter-input"
            />
            <input
              type="text"
              placeholder="Airline"
              value={searchAirline}
              onChange={(e) => setSearchAirline(e.target.value)}
              className="filter-input"
            />
            <input
              type="date"
              value={searchDate}
              onChange={(e) => setSearchDate(e.target.value)}
              className="filter-input"
            />
            <input
              type="number"
              step="any"
              placeholder="Max Price ($)"
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              className="filter-input"
              onWheel={(e) => e.target.blur()}
            />
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

          {/* Flight Cards */}
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
            {currentFlight.map((flight) => (
              <div 
                key={flight._id} 
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
                  src={flight.airline_logo || "/images/default.jpg"}
                  alt="Airline"
                  style={{ width: "100%", height: "180px", objectFit: "cover", borderTopRightRadius: "2px", borderTopLeftRadius: "2px" }}
                />
                <h3 style={{ margin: "5px 15px 5px",
                           whiteSpace: "nowrap",        
                           overflow: "hidden",          
                           textOverflow: "ellipsis" }}>{flight.airline_name}</h3>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: "5px 15px 5px",
                    fontWeight: "normal",
                    whiteSpace: "nowrap"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>From:</strong> {flight.from}
                  </div>
                  <div style={{ flexBasis: "150px" /* or any fixed width that fits your longest label+content */, textAlign: "left" }}>
                    <strong>To:</strong> {flight.to}
                  </div>
                </div>
                <div
                  style={{
                    display: "flex",
                    justifyContent: "space-between",
                    margin: "5px 15px 5px",
                    whiteSpace: "nowrap"
                  }}
                >
                  <div style={{ flex: 1 }}>
                    <strong>Date:</strong> {new Date(flight.date).toLocaleDateString()}
                  </div>
                  <div style={{ flexBasis: "150px", textAlign: "left" }}>
                    <strong>Price:</strong> ${flight.price}
                  </div>
                </div>
                {/* <p style={{margin: "5px 15px 5px"}}><strong>Price:</strong> ${flight.price}</p> */}
                {/* <p style={{margin: "5px 15px 5px"}}><strong>Seats Available:</strong> {flight.total_seats || "N/A"}</p> */}
                {/* <div style={{ marginTop: "5px", fontSize: "0.9em", color: "#666" }}>
                  {flight.seat_types &&
                    flight.seat_types.map(seat => (
                      <p key={seat.type}>
                        <span style={{ textTransform: "capitalize" }}>{seat.type}</span>: {seat.count} seats
                      </p>
                    ))
                  }
                </div> */}
                {/* Buttons */}
                <div style={{ display: "flex", justifyContent: "center", marginTop: "12px" }}>
                  <div style={{ flex: 1 }}>
                    <Link to={`/flight/${flight._id}`} style={{ flex: 1 }}>
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
                    <Link to={`/book-flight/${flight._id}`} style={{ flex: 1 }}>
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
                      onClick={() => handleCompare(flight)}
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

          {filteredFlights.length === 0 && (
            <p style={{ textAlign: "center", marginTop: "30px", color: "#999" }}>
              No flights match your filters.
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
    </div>
  );
};
  

export default FlightList;
