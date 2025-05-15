// src/CustomizePackage.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { Link, useLocation } from "react-router-dom"; // <-- note useLocation import
import axios from "./axiosConfig";
import Navbar from './components/Navbar';

function CustomizePackage() {
  const { user, logout } = useContext(AuthContext);

  // ---------- REACT ROUTER: LOCATION ----------
  // This hook allows us to read location.state.packageToEdit if coming from "Edit" in MyCustomPackages
  const location = useLocation();

  // ---------- STATE: DATA ARRAYS ----------
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [entertainments, setEntertainments] = useState([]);

  // ---------- STATE: FILTERS ----------
  const [flightFilter, setFlightFilter] = useState({ from: "", to: "", date: "", priceOrder: "" });
  const [hotelFilter, setHotelFilter] = useState({ location: "", roomType: "", priceOrder: "" });
  const [entFilter, setEntFilter] = useState({ location: "", priceOrder: "" });

  // ---------- STATE: BOOKED ITEMS (the ones user chooses) ----------
  const [bookedFlights, setBookedFlights] = useState([]);
  const [bookedHotels, setBookedHotels] = useState([]);
  const [bookedEntertainments, setBookedEntertainments] = useState([]);

  // ---------- STATE: ACTIVE PANEL (flights/hotels/entertainments) ----------
  const [activeCategory, setActiveCategory] = useState("flights");

  // ------------------------------------------------------------------
  // 1) Fetch the lists of flights/hotels/entertainments from the server
  // ------------------------------------------------------------------
  useEffect(() => {
    axios
      .get("http://localhost:5000/api/flights")
      .then((res) => setFlights(res.data))
      .catch((err) => console.error("Error fetching flights:", err));

    axios
      .get("http://localhost:5000/api/hotels")
      .then((res) => setHotels(res.data))
      .catch((err) => console.error("Error fetching hotels:", err));

    axios
      .get("http://localhost:5000/api/entertainments")
      .then((res) => setEntertainments(res.data))
      .catch((err) => console.error("Error fetching entertainments:", err));
  }, []);

  useEffect(() => {
    if (location.state && location.state.packageToEdit) {
      const pkg = location.state.packageToEdit;
      console.log("Editing existing package:", pkg);

      setBookedFlights(pkg.flights || []);
      setBookedHotels(pkg.hotels || []);
      setBookedEntertainments(pkg.entertainments || []);
    }
  }, [location.state]);

  // ---------- SORT HELPER ----------
  const sortByPrice = (items, order) => {
    if (order === "asc") return [...items].sort((a, b) => a.price - b.price);
    if (order === "desc") return [...items].sort((a, b) => b.price - a.price);
    return items;
  };

  // ---------- FILTER + SORT: FLIGHTS ----------
  const filteredFlights = sortByPrice(
    flights.filter((f) => {
      const fromMatch = f.from?.toLowerCase().includes(flightFilter.from.toLowerCase());
      const toMatch = f.to?.toLowerCase().includes(flightFilter.to.toLowerCase());
      const dateMatch = flightFilter.date
        ? new Date(f.date).toISOString().slice(0, 10) === flightFilter.date
        : true;
      return fromMatch && toMatch && dateMatch;
    }),
    flightFilter.priceOrder
  );
  

  // ---------- FILTER + SORT: HOTELS ----------
  const filteredHotels = sortByPrice(
    hotels.filter((h) => {
      const locationMatch = h.location?.toLowerCase().includes(hotelFilter.location.toLowerCase());
      const roomMatch =
        hotelFilter.roomType === "" ||
        h.room_types?.map((r) => r.toLowerCase()).includes(hotelFilter.roomType.toLowerCase());
      return locationMatch && roomMatch;
    }),
    hotelFilter.priceOrder
  );
  

  // ---------- FILTER + SORT: ENTERTAINMENTS ----------
  const filteredEntertainments = sortByPrice(
    entertainments.filter((e) =>
      e.location?.toLowerCase().includes(entFilter.location.toLowerCase())
    ),
    entFilter.priceOrder
  );

  // ---------- BOOKING HANDLERS (add to booked items) ----------
  const handleBookFlight = (flight) =>
    setBookedFlights((prev) => [...prev, flight]);

  const handleBookHotel = (hotel) =>
    setBookedHotels((prev) => [...prev, hotel]);

  const handleBookEntertainment = (ent) =>
    setBookedEntertainments((prev) => [...prev, ent]);

  // ---------- REMOVAL HANDLERS (remove from booked items) ----------
  const handleRemoveFlight = (id) => {
    setBookedFlights((prev) => prev.filter((f) => f._id !== id));
  };
  const handleRemoveHotel = (id) => {
    setBookedHotels((prev) => prev.filter((h) => h._id !== id));
  };
  const handleRemoveEntertainment = (id) => {
    setBookedEntertainments((prev) => prev.filter((e) => e._id !== id));
  };

  // ---------- SAVE CUSTOM PACKAGE ----------
  const handleSaveCustomPackage = async () => {
    if (!user) {
      alert("Please log in first.");
      return;
    }
    try {
      const payload = {
        userId: user._id,
        flights: bookedFlights.map((f) => f._id),
        hotels: bookedHotels.map((h) => h._id),
        entertainments: bookedEntertainments.map((e) => e._id),
      };
      const response = await axios.post("/customPackages", payload);

      setBookedFlights([]);
      setBookedHotels([]);
      setBookedEntertainments([]);
      
      // If your controller returns { customPackage, warnings } with 200:
      const { customPackage, warnings } = response.data;
      if (warnings && warnings.length > 0) {
        alert(
          `Custom Package Saved\n` +
          `Warnings:\n- ${warnings.join("\n- ")}\n\n` +
          `Package ID: ${customPackage.custom_id}`
        );
      } else {
        alert(`Custom Package Saved!\nID: ${customPackage.custom_id}`);
      }
    } catch (err) {
      console.error("Error saving custom package:", err);
      alert("Failed to save custom package.");
    }
  };

  // ---------- RENDER: FLIGHT CARD ----------
  const renderFlightCard = (flight) => (
    
      <div
        key={flight._id}
        style={{
          background: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          width: "calc(95% - 10px)",  // Change this line to adjust width
          marginBottom: "10px",
        }}
      >
        <Link to={`/flight/${flight._id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <img
            src={flight.airline_logo || "https://via.placeholder.com/300"}
            alt={flight.airline_name || "Flight"}
            style={{
              width: "100%",
              height: "140px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
          <h4 style={{ margin: "10px 0 5px" }}>{flight.airline_name}</h4>
          <p style={{ margin: "0 0 4px" }}>Price: ${flight.price}</p>
          <p style={{ margin: "0 0 4px" }}>From: {flight.from}</p>
          <p style={{ margin: "0 0 4px" }}>To: {flight.to}</p>
          <p style={{ margin: "0 0 4px" }}>
            Date: {new Date(flight.date).toLocaleDateString()}
          </p>
          <p style={{ margin: "0 0 8px" }}>
            Seats Available: {flight.total_seats}
          </p>
        </Link>
        <button
          onClick={() => handleBookFlight(flight)}
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
            Add Flight
          </button>
        </div>
  );

  // ---------- RENDER: HOTEL CARD ----------
  const renderHotelCard = (hotel) => (
    
      <div
        key={hotel._id}
        style={{
          background: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          width: "calc(95% - 10px)",  // Change this line to adjust width
          marginBottom: "10px"
        }}
      >
        <Link to={`/hotels/details/${hotel._id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <img
            src={hotel.images?.[0] || "https://via.placeholder.com/300"}
            alt={hotel.hotel_name || "Hotel"}
            style={{
              width: "100%",
              height: "140px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
          <h4 style={{ margin: "10px 0 5px" }}>{hotel.hotel_name}</h4>
          <p style={{ margin: "0 0 4px" }}>Price: ${hotel.price_per_night}</p>
          <p style={{ margin: "0 0 8px" }}>Location: {hotel.location}</p>
          <p style={{ margin: "0 0 4px" }}>Rooms Available: {hotel.rooms_available}</p>
        </Link>
        <button
          onClick={() => handleBookHotel(hotel)}
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Add Hotel
        </button>
      </div>
    
  );

  // ---------- RENDER: ENTERTAINMENT CARD ----------
  const renderEntertainmentCard = (ent) => (
    
      <div
        key={ent._id}
        style={{
          background: "#fff",
          padding: "10px",
          border: "1px solid #ccc",
          borderRadius: "6px",
          width: "calc(95% - 10px)",  // Change this line to adjust width
          marginBottom: "10px"
        }}
      >
        <Link to={`/entertainment/${ent._id}`} style={{ textDecoration: "none", color: "inherit" }}>
          <img
            src={ent.images?.[0] || "https://via.placeholder.com/300"}
            alt={ent.entertainmentName || "Entertainment"}
            style={{
              width: "100%",
              height: "140px",
              objectFit: "cover",
              borderRadius: "4px",
            }}
          />
          <h4 style={{ margin: "10px 0 5px" }}>{ent.entertainmentName}</h4>
          <p style={{ margin: "0 0 4px" }}>Price: ${ent.price}</p>
          <p style={{ margin: "0 0 8px" }}>Location: {ent.location}</p>
        </Link>
        <button
          onClick={() => handleBookEntertainment(ent)}
          style={{
            background: "#007bff",
            color: "#fff",
            border: "none",
            padding: "6px 12px",
            cursor: "pointer",
            borderRadius: "4px",
          }}
        >
          Add Entertainment
        </button>

      </div>
    
  );

  // ---------- MAIN RENDER ----------
  return (
    <div>
      <Navbar />
      <div style={{ padding: "30px", backgroundColor: "#f8f8f8", fontFamily: "Poppins, sans-serif" }}>
        <h1 style={{ textAlign: "center", marginBottom: "30px" }}>Customize Your Package</h1>
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
        {/* ========== BODY LAYOUT ========== */}
        <div style={{ display: "flex" }}>
          {/* LEFT PANEL: FILTERS & BOOKED ITEMS */}
          <div style={{ width: "300px", background: "#f5f5f5", padding: "20px" }}>
            <h2 style={{ marginTop: 0 }}>Filters</h2>
            {/* FLIGHTS FILTER */}
            <div style={{ marginBottom: "30px" }} onClick={() => setActiveCategory("flights")}>
              <h4>Flights</h4>
              <input
                placeholder="From"
                value={flightFilter.from}
                onChange={(e) => setFlightFilter({ ...flightFilter, from: e.target.value })}
              />
              <input
                placeholder="To"
                value={flightFilter.to}
                onChange={(e) => setFlightFilter({ ...flightFilter, to: e.target.value })}
              />
              <input
                type="date"
                value={flightFilter.date}
                onChange={(e) => setFlightFilter({ ...flightFilter, date: e.target.value })}
              />
              <select
                value={flightFilter.priceOrder}
                onChange={(e) => setFlightFilter({ ...flightFilter, priceOrder: e.target.value })}>
                <option value="">Sort by Price</option>
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
            </div>

            {/* HOTELS FILTER */}
            <div style={{ marginBottom: "30px" }} onClick={() => setActiveCategory("hotels")}>
              <h4>Hotels</h4>
              <input
                placeholder="Location"
                value={hotelFilter.location}
                onChange={(e) => setHotelFilter({ ...hotelFilter, location: e.target.value })}
              />
              <select
                value={hotelFilter.roomType}
                onChange={(e) => setHotelFilter({ ...hotelFilter, roomType: e.target.value })}>
                <option value="">All Room Types</option>
                <option value="Single">Single</option>
                <option value="Double">Double</option>
                <option value="Suite">Suite</option>
              </select>
              <select
                value={hotelFilter.priceOrder}
                onChange={(e) => setHotelFilter({ ...hotelFilter, priceOrder: e.target.value })}>
                <option value="">Sort by Price</option>
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
            </div>

            {/* ENTERTAINMENTS FILTER */}
            <div style={{ marginBottom: "30px" }} onClick={() => setActiveCategory("entertainments")}>
              <h4>Entertainments</h4>
              <input
                placeholder="Search location"
                value={entFilter.location}
                onChange={(e) => setEntFilter({ ...entFilter, location: e.target.value })}
                style={{ width: "100%", marginBottom: "8px", padding: "6px" }}
              />
              <select
                value={entFilter.priceOrder}
                onChange={(e) => setEntFilter({ ...entFilter, priceOrder: e.target.value })}
                style={{ width: "100%", padding: "6px" }}
              >
                <option value="">Sort by Price</option>
                <option value="asc">Low to High</option>
                <option value="desc">High to Low</option>
              </select>
            </div>

            {/* BOOKED ITEMS */}
            <h3 style={{ marginTop: "30px" }}>Booked Items</h3>

            {/* Booked Flights */}
            <div style={{ marginBottom: "20px" }}>
              <h5 style={{ marginBottom: "8px" }}>Flights</h5>
              {bookedFlights.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#666" }}>No flights booked yet.</p>
              ) : (
                bookedFlights.map((f) => (
                  <div
                    key={f._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#fff",
                      marginBottom: "5px",
                      padding: "8px 10px",
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#333" }}>
                      {f.airline_name} ({f.from} → {f.to})
                    </span>
                    <button
                      onClick={() => handleRemoveFlight(f._id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "red",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      X
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Booked Hotels */}
            <div style={{ marginBottom: "20px" }}>
              <h5 style={{ marginBottom: "8px" }}>Hotels</h5>
              {bookedHotels.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#666" }}>No hotels booked yet.</p>
              ) : (
                bookedHotels.map((h) => (
                  <div
                    key={h._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#fff",
                      marginBottom: "5px",
                      padding: "8px 10px",
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#333" }}>
                      {h.hotel_name} in {h.location}
                    </span>
                    <button
                      onClick={() => handleRemoveHotel(h._id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "red",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      X
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* Booked Entertainments */}
            <div style={{ marginBottom: "20px" }}>
              <h5 style={{ marginBottom: "8px" }}>Entertainments</h5>
              {bookedEntertainments.length === 0 ? (
                <p style={{ fontSize: "14px", color: "#666" }}>No events booked yet.</p>
              ) : (
                bookedEntertainments.map((e) => (
                  <div
                    key={e._id}
                    style={{
                      display: "flex",
                      alignItems: "center",
                      justifyContent: "space-between",
                      background: "#fff",
                      marginBottom: "5px",
                      padding: "8px 10px",
                      borderRadius: "4px",
                    }}
                  >
                    <span style={{ fontSize: "14px", color: "#333" }}>
                      {e.entertainmentName} in {e.location}
                    </span>
                    <button
                      onClick={() => handleRemoveEntertainment(e._id)}
                      style={{
                        background: "transparent",
                        border: "none",
                        color: "red",
                        fontWeight: "bold",
                        cursor: "pointer",
                      }}
                    >
                      X
                    </button>
                  </div>
                ))
              )}
            </div>

            {/* SAVE & VIEW BUTTONS */}
            {user && (
              <div style={{ marginTop: "20px", textAlign: "center" }}>
                <button
                  onClick={handleSaveCustomPackage}
                  style={{
                    background: "#28a745",
                    color: "#fff",
                    padding: "10px 20px",
                    border: "none",
                    borderRadius: "4px",
                    marginBottom: "10px",
                    cursor: "pointer",
                  }}
                >
                  Save My Custom Package
                </button>
                <div style={{ marginTop: "10px" }}>
                  <Link to="/myPackages">
                    <button
                      style={{
                        background: "#007bff",
                        color: "#fff",
                        padding: "10px 20px",
                        border: "none",
                        borderRadius: "4px",
                        cursor: "pointer",
                        marginBottom: "10px",
                      }}
                    >
                      View My Saved Packages
                    </button>
                  </Link>
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
                      Confirmed Bookings
                    </button>
                  </Link>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT PANEL: TABS & RESULTS */}
          <div style={{ flex: 1, padding: "20px" }}>
            <div style={{ display: "flex", justifyContent: "space-around", marginBottom: "20px", background: "#181818", padding: "10px" }}>
              <button
                onClick={() => setActiveCategory("flights")}
                style={{
                  background: activeCategory === "flights" ? "#fff" : "#181818",
                  color: activeCategory === "flights" ? "#181818" : "#fff",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Flights
              </button>
              <button
                onClick={() => setActiveCategory("hotels")}
                style={{
                  background: activeCategory === "hotels" ? "#fff" : "#181818",
                  color: activeCategory === "hotels" ? "#181818" : "#fff",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Hotels
              </button>
              <button
                onClick={() => setActiveCategory("entertainments")}
                style={{
                  background: activeCategory === "entertainments" ? "#fff" : "#181818",
                  color: activeCategory === "entertainments" ? "#181818" : "#fff",
                  padding: "8px 16px",
                  border: "none",
                  borderRadius: "4px",
                }}
              >
                Entertainments
              </button>
            </div>

            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {/* FLIGHTS */}
              {activeCategory === "flights" &&
                (filteredFlights.length > 0 ? (
                  filteredFlights.map((flight) => renderFlightCard(flight))
                ) : (
                  <p>No flights found.</p>
                ))}

              {/* HOTELS */}
              {activeCategory === "hotels" &&
                (filteredHotels.length > 0 ? (
                  filteredHotels.map((hotel) => renderHotelCard(hotel))
                ) : (
                  <p>No hotels found.</p>
                ))}

              {/* ENTERTAINMENTS */}
              {activeCategory === "entertainments" &&
                (filteredEntertainments.length > 0 ? (
                  filteredEntertainments.map((ent) => renderEntertainmentCard(ent))
                ) : (
                  <p>No entertainments found.</p>
                ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default CustomizePackage;
