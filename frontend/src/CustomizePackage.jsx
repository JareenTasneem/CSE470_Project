// src/CustomizePackage.jsx
import React, { useState, useEffect, useContext } from "react";
import { AuthContext } from "./contexts/AuthContext";
import { Link } from "react-router-dom";
import axios from "./axiosConfig";

function CustomizePackage() {
  const { user, logout } = useContext(AuthContext);

  // State for raw data
  const [flights, setFlights] = useState([]);
  const [hotels, setHotels] = useState([]);
  const [entertainments, setEntertainments] = useState([]);

  // State for filters
  const [flightFilter, setFlightFilter] = useState({ location: "", priceOrder: "" });
  const [hotelFilter, setHotelFilter] = useState({ location: "", priceOrder: "" });
  const [entFilter, setEntFilter] = useState({ location: "", priceOrder: "" });

  // State for "booked" items
  const [bookedFlights, setBookedFlights] = useState([]);
  const [bookedHotels, setBookedHotels] = useState([]);
  const [bookedEntertainments, setBookedEntertainments] = useState([]);

  // New state for active category in the right panel
  const [activeCategory, setActiveCategory] = useState("flights");

  // Fetch data on mount
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

  // Filter logic for each category
  const filteredFlights = flights
    .filter((flight) =>
      flight.location?.toLowerCase().includes(flightFilter.location.toLowerCase())
    )
    .sort((a, b) => {
      if (flightFilter.priceOrder === "asc") return a.price - b.price;
      if (flightFilter.priceOrder === "desc") return b.price - a.price;
      return 0;
    });

  const filteredHotels = hotels
    .filter((hotel) =>
      hotel.location?.toLowerCase().includes(hotelFilter.location.toLowerCase())
    )
    .sort((a, b) => {
      if (hotelFilter.priceOrder === "asc") return a.price - b.price;
      if (hotelFilter.priceOrder === "desc") return b.price - a.price;
      return 0;
    });

  const filteredEntertainments = entertainments
    .filter((ent) =>
      ent.location?.toLowerCase().includes(entFilter.location.toLowerCase())
    )
    .sort((a, b) => {
      if (entFilter.priceOrder === "asc") return a.price - b.price;
      if (entFilter.priceOrder === "desc") return b.price - a.price;
      return 0;
    });

  // Handlers for booking items
  const handleBookFlight = (flight) => {
    setBookedFlights((prev) => [...prev, flight]);
  };

  const handleBookHotel = (hotel) => {
    setBookedHotels((prev) => [...prev, hotel]);
  };

  const handleBookEntertainment = (ent) => {
    setBookedEntertainments((prev) => [...prev, ent]);
  };

  // Handlers for removing booked items
  const handleRemoveFlight = (flightId) => {
    setBookedFlights((prev) => prev.filter((f) => f._id !== flightId));
  };

  const handleRemoveHotel = (hotelId) => {
    setBookedHotels((prev) => prev.filter((h) => h._id !== hotelId));
  };

  const handleRemoveEntertainment = (entId) => {
    setBookedEntertainments((prev) => prev.filter((e) => e._id !== entId));
  };

  return (
    <div style={{ fontFamily: "Poppins, sans-serif", maxHeight: "100vh" }}>
      {/* Header with login/logout */}
      <header style={{ background: "#333", color: "#fff", padding: "20px", width: "100%", maxHeight: "25px" }}>
        <nav style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginTop: "10px" }}>
          <h4 style={{ margin: 0 }}>Customize Package</h4>
          <ul style={{ listStyle: "none", display: "flex", gap: "10px" }}>
            {user ? (
              <>
                <li>{user.name}</li>
                <li>
                  <button onClick={logout} style={{ cursor: "pointer" }}>
                    Logout
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <Link to="/login" style={{ textDecoration: "none", color: "#fff" }}>
                    Login
                  </Link>
                </li>
                <li>
                  <Link to="/signup" style={{ textDecoration: "none", color: "#fff" }}>
                    Sign up
                  </Link>
                </li>
              </>
            )}
          </ul>
        </nav>
      </header>

      {/* Main content area */}
      <div style={{ display: "flex" }}>
        {/* Left sidebar with filters and booked items */}
        <div style={{ width: "300px", background: "#f5f5f5", padding: "20px" }}>
          <h2>Filters</h2>
          {/* Flights Filter */}
          <div style={{ marginBottom: "20px" }}>
            <h3>Flights</h3>
            <input
              type="text"
              placeholder="Location"
              value={flightFilter.location}
              onChange={(e) =>
                setFlightFilter({ ...flightFilter, location: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <select
              value={flightFilter.priceOrder}
              onChange={(e) =>
                setFlightFilter({ ...flightFilter, priceOrder: e.target.value })
              }
              style={{ width: "100%", padding: "5px" }}
            >
              <option value="">Sort by Price</option>
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>
          </div>

          {/* Hotels Filter */}
          <div style={{ marginBottom: "20px" }}>
            <h3>Hotels</h3>
            <input
              type="text"
              placeholder="Location"
              value={hotelFilter.location}
              onChange={(e) =>
                setHotelFilter({ ...hotelFilter, location: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <select
              value={hotelFilter.priceOrder}
              onChange={(e) =>
                setHotelFilter({ ...hotelFilter, priceOrder: e.target.value })
              }
              style={{ width: "100%", padding: "5px" }}
            >
              <option value="">Sort by Price</option>
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>
          </div>

          {/* Entertainments Filter */}
          <div style={{ marginBottom: "20px" }}>
            <h3>Entertainments</h3>
            <input
              type="text"
              placeholder="Location"
              value={entFilter.location}
              onChange={(e) =>
                setEntFilter({ ...entFilter, location: e.target.value })
              }
              style={{ width: "100%", marginBottom: "10px", padding: "5px" }}
            />
            <select
              value={entFilter.priceOrder}
              onChange={(e) =>
                setEntFilter({ ...entFilter, priceOrder: e.target.value })
              }
              style={{ width: "100%", padding: "5px" }}
            >
              <option value="">Sort by Price</option>
              <option value="asc">Low to High</option>
              <option value="desc">High to Low</option>
            </select>
          </div>

          {/* Booked items display */}
          <div style={{ marginTop: "30px" }}>
            <h2>Booked Items</h2>
            <div>
              <h4>Flights</h4>
              {bookedFlights.map((f) => (
                <div key={f._id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{f.title || f.flightName}</span>
                  <button onClick={() => handleRemoveFlight(f._id)} style={{ cursor: "pointer" }}>
                    X
                  </button>
                </div>
              ))}
            </div>
            <div>
              <h4>Hotels</h4>
              {bookedHotels.map((h) => (
                <div key={h._id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{h.title || h.hotelName}</span>
                  <button onClick={() => handleRemoveHotel(h._id)} style={{ cursor: "pointer" }}>
                    X
                  </button>
                </div>
              ))}
            </div>
            <div>
              <h4>Entertainments</h4>
              {bookedEntertainments.map((e) => (
                <div key={e._id} style={{ display: "flex", justifyContent: "space-between" }}>
                  <span>{e.title || e.entertainmentName}</span>
                  <button onClick={() => handleRemoveEntertainment(e._id)} style={{ cursor: "pointer" }}>
                    X
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right side: mini nav bar and results list for selected category */}
        <div style={{ flex: 1, padding: "20px" }}>
          {/* Mini Navigation Bar */}
          <div
            style={{
              display: "flex",
              justifyContent: "space-around",
              marginBottom: "20px",
              borderBottom: "1px solid #ccc",
              paddingBottom: "10px",
            }}
          >
            <button
              onClick={() => setActiveCategory("flights")}
              style={{
                background: activeCategory === "flights" ? "#333" : "#fff",
                color: activeCategory === "flights" ? "#fff" : "#333",
                padding: "10px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Flights
            </button>
            <button
              onClick={() => setActiveCategory("hotels")}
              style={{
                background: activeCategory === "hotels" ? "#333" : "#fff",
                color: activeCategory === "hotels" ? "#fff" : "#333",
                padding: "10px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Hotels
            </button>
            <button
              onClick={() => setActiveCategory("entertainments")}
              style={{
                background: activeCategory === "entertainments" ? "#333" : "#fff",
                color: activeCategory === "entertainments" ? "#fff" : "#333",
                padding: "10px",
                border: "none",
                cursor: "pointer",
              }}
            >
              Entertainments
            </button>
          </div>

          {/* Conditionally render the items based on activeCategory */}
          {activeCategory === "flights" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {filteredFlights.map((flight) => (
                <div
                  key={flight._id}
                  style={{
                    background: "#fff",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    width: "calc(33.33% - 20px)",
                  }}
                >
                  <h4>{flight.title || flight.flightName}</h4>
                  <p>Price: ${flight.price}</p>
                  <p>Location: {flight.location}</p>
                  <button onClick={() => handleBookFlight(flight)} style={{ cursor: "pointer" }}>
                    Book Flight
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeCategory === "hotels" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {filteredHotels.map((hotel) => (
                <div
                  key={hotel._id}
                  style={{
                    background: "#fff",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    width: "calc(33.33% - 20px)",
                  }}
                >
                  <h4>{hotel.title || hotel.hotelName}</h4>
                  <p>Price: ${hotel.price}</p>
                  <p>Location: {hotel.location}</p>
                  <button onClick={() => handleBookHotel(hotel)} style={{ cursor: "pointer" }}>
                    Book Hotel
                  </button>
                </div>
              ))}
            </div>
          )}

          {activeCategory === "entertainments" && (
            <div style={{ display: "flex", flexWrap: "wrap", gap: "10px" }}>
              {filteredEntertainments.map((ent) => (
                <div
                  key={ent._id}
                  style={{
                    background: "#fff",
                    padding: "10px",
                    border: "1px solid #ccc",
                    borderRadius: "4px",
                    width: "calc(33.33% - 20px)",
                  }}
                >
                  <h4>{ent.title || ent.entertainmentName}</h4>
                  <p>Price: ${ent.price}</p>
                  <p>Location: {ent.location}</p>
                  <button onClick={() => handleBookEntertainment(ent)} style={{ cursor: "pointer" }}>
                    Book Entertainment
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CustomizePackage;
