import React, { useContext } from "react";
import { CustomizeContext } from "./CustomizeContext";

function CustomizeLog() {
  const {
    customizeLog,
    removeFromCustomizeLog,
    toggleCrossOutItem
  } = useContext(CustomizeContext);

  // Separate items by type
  const flights = customizeLog.filter((item) => item.type === "flight");
  const hotels = customizeLog.filter((item) => item.type === "hotel");
  const entertainments = customizeLog.filter((item) => item.type === "entertainment");

  return (
    <div style={{ padding: "1rem" }}>
      <h2>Customize Log</h2>

      {/* Flights Section */}
      <section style={{ marginBottom: "20px" }}>
        <h3>Flights</h3>
        {flights.length === 0 ? (
          <p>No flights selected.</p>
        ) : (
          flights.map((flightItem, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                margin: "10px 0",
                padding: "10px",
                textDecoration: flightItem.crossedOut ? "line-through" : "none"
              }}
            >
              <p>Flight Name: {flightItem.data.flight_name}</p>
              <p>Price: ${flightItem.data.price}</p>

              <button
                onClick={() => toggleCrossOutItem(flightItem.data._id, flightItem.type)}
              >
                {flightItem.crossedOut ? "Uncross" : "Cross Out"}
              </button>

              <button
                onClick={() => removeFromCustomizeLog(flightItem.data._id, flightItem.type)}
                style={{ marginLeft: "10px" }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </section>

      {/* Hotels Section */}
      <section style={{ marginBottom: "20px" }}>
        <h3>Hotels</h3>
        {hotels.length === 0 ? (
          <p>No hotels selected.</p>
        ) : (
          hotels.map((hotelItem, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                margin: "10px 0",
                padding: "10px",
                textDecoration: hotelItem.crossedOut ? "line-through" : "none"
              }}
            >
              <p>Hotel Name: {hotelItem.data.hotel_name}</p>
              <p>Price: ${hotelItem.data.price}</p>

              <button
                onClick={() => toggleCrossOutItem(hotelItem.data._id, hotelItem.type)}
              >
                {hotelItem.crossedOut ? "Uncross" : "Cross Out"}
              </button>

              <button
                onClick={() => removeFromCustomizeLog(hotelItem.data._id, hotelItem.type)}
                style={{ marginLeft: "10px" }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </section>

      {/* Entertainments Section */}
      <section>
        <h3>Entertainments</h3>
        {entertainments.length === 0 ? (
          <p>No entertainments selected.</p>
        ) : (
          entertainments.map((entItem, index) => (
            <div
              key={index}
              style={{
                border: "1px solid #ccc",
                margin: "10px 0",
                padding: "10px",
                textDecoration: entItem.crossedOut ? "line-through" : "none"
              }}
            >
              <p>Title: {entItem.data.title}</p>
              <p>Price: ${entItem.data.price}</p>

              <button
                onClick={() => toggleCrossOutItem(entItem.data._id, entItem.type)}
              >
                {entItem.crossedOut ? "Uncross" : "Cross Out"}
              </button>

              <button
                onClick={() => removeFromCustomizeLog(entItem.data._id, entItem.type)}
                style={{ marginLeft: "10px" }}
              >
                Remove
              </button>
            </div>
          ))
        )}
      </section>
    </div>
  );
}

export default CustomizeLog;
