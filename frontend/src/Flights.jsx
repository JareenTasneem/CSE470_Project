import React, { useContext, useEffect, useState } from "react";
import { CustomizeContext } from "./CustomizeContext";
import axios from "axios";

function Flights() {
  const [flights, setFlights] = useState([]);
  const { addToCustomizeLog } = useContext(CustomizeContext);

  useEffect(() => {
    // Example: fetch flights from your backend
    // Adjust the endpoint as needed
    axios.get("http://localhost:5000/api/flights")
      .then((res) => setFlights(res.data))
      .catch((err) => console.error("Error fetching flights:", err));
  }, []);

  const handleBookFlight = (flight) => {
    // Add flight to the customize log
    addToCustomizeLog({ type: "flight", data: flight });
  };

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Flights</h2>
      {flights.map((flight) => (
        <div key={flight._id} style={{ border: "1px solid #ccc", margin: "10px 0", padding: "10px" }}>
          <h4>{flight.flight_name}</h4>
          <p>Price: {flight.price}</p>
          <button onClick={() => handleBookFlight(flight)}>Add to Customize Log</button>
        </div>
      ))}
    </div>
  );
}

export default Flights;
