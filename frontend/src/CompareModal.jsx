import React from "react";
import { Link } from "react-router-dom";

const CompareModal = ({ 
  isOpen, 
  onClose, 
  items, 
  currentItem, 
  type, 
  onCompareItem  // new function prop
}) => {
  if (!isOpen || !currentItem) return null;

  // For flights, "price"; for hotels, "price_per_night"
  const priceField = type === "flight" ? "price" : "price_per_night";
  const currentItemPrice = currentItem[priceField] || 0;

  // Filter out the current item so we only show "other" items from the same location/destination
  const compareItems = items.filter((i) => i._id !== currentItem._id);

  // Helper to display difference text
  const getDifferenceLabel = (itemPrice) => {
    const diff = itemPrice - currentItemPrice;
    if (diff === 0) {
      return "Same price as selected";
    } else if (diff > 0) {
      return `More expensive by $${diff.toFixed(2)} (${((diff / currentItemPrice) * 100).toFixed(1)}% more)`;
    } else {
      const absDiff = Math.abs(diff);
      return `Cheaper by $${absDiff.toFixed(2)} (${((absDiff / currentItemPrice) * 100).toFixed(1)}% less)`;
    }
  };

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: "100%",
        height: "100%",
        backgroundColor: "rgba(0,0,0,0.5)",
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        zIndex: 1000,
      }}
    >
      <div
        style={{
          background: "#fff",
          borderRadius: "8px",
          width: "90%",
          maxWidth: "1000px",
          padding: "20px",
          position: "relative",
          maxHeight: "90%",
          overflow: "auto",
        }}
      >
        <button
          onClick={onClose}
          style={{
            position: "absolute",
            top: "10px",
            right: "10px",
            background: "transparent",
            border: "none",
            fontSize: "24px",
            cursor: "pointer",
          }}
        >
          ×
        </button>
        <h2 style={{ marginTop: 0 }}>
          Compare {type === "flight" 
            ? `Flights to ${currentItem.to}` 
            : `Hotels in ${currentItem.location}`
          }
        </h2>

        <div style={{ display: "flex", gap: "20px" }}>
          {/* Left Column: The selected flight/hotel */}
          <div style={{ flex: "0 0 40%", borderRight: "1px solid #ccc", paddingRight: "20px" }}>
            <h3>Your Selected {type === "flight" ? "Flight" : "Hotel"}</h3>
            <div 
              style={{ 
                border: "1px solid #ddd", 
                borderRadius: "6px", 
                padding: "10px",
                marginBottom: "20px",
                backgroundColor: "#f9f9f9"
              }}
            >
              {/* Render the same "card" style as in FlightList/HotelList */}
              {type === "flight" ? (
                <>
                  <img
                    src={currentItem.airline_logo || "/images/default.jpg"}
                    alt="Airline"
                    style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "6px" }}
                  />
                  <h3 style={{ margin: "10px 0 5px" }}>{currentItem.airline_name}</h3>
                  <p><strong>From:</strong> {currentItem.from}</p>
                  <p><strong>To:</strong> {currentItem.to}</p>
                  <p><strong>Date:</strong> {new Date(currentItem.date).toLocaleDateString()}</p>
                  <p><strong>Price:</strong> ${currentItemPrice}</p>
                  <p><strong>Seats Available:</strong> {currentItem.total_seats || "N/A"}</p>
                  {/* Could display seat_types if you want */}
                </>
              ) : (
                <>
                  <img
                    src={currentItem.images?.[0] || "/images/temp4.jpeg"}
                    alt="Hotel"
                    style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "6px" }}
                  />
                  <h3 style={{ margin: "10px 0 5px" }}>{currentItem.hotel_name}</h3>
                  <p><strong>Location:</strong> {currentItem.location}</p>
                  <p><strong>Price/Night:</strong> ${currentItemPrice}</p>
                  <p><strong>Stars:</strong> {currentItem.star_rating || "N/A"}★</p>
                </>
              )}
            </div>
          </div>

          {/* Right Column: A scrollable list of other flights/hotels with the same destination/location */}
          <div style={{ flex: "1", maxHeight: "600px", overflowY: "auto" }}>
            <h3>Other {type === "flight" ? "Flights" : "Hotels"} in the Same Area</h3>
            {compareItems.length === 0 && (
              <p>No other {type === "flight" ? "flights" : "hotels"} found.</p>
            )}
            {compareItems.map((item) => {
              const itemPrice = item[priceField] || 0;
              const differenceText = getDifferenceLabel(itemPrice);

              return (
                <div 
                  key={item._id} 
                  style={{ 
                    border: "1px solid #ddd", 
                    borderRadius: "6px", 
                    padding: "10px",
                    marginBottom: "15px",
                    backgroundColor: "#fff",
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
                  {/* FULL card layout for each "other" item */}
                  {type === "flight" ? (
                    <>
                      <img
                        src={item.airline_logo || "/images/default.jpg"}
                        alt="Airline"
                        style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "6px" }}
                      />
                      <h3 style={{ margin: "10px 0 5px" }}>{item.airline_name}</h3>
                      <p><strong>From:</strong> {item.from}</p>
                      <p><strong>To:</strong> {item.to}</p>
                      <p><strong>Date:</strong> {new Date(item.date).toLocaleDateString()}</p>
                      <p><strong>Price:</strong> ${itemPrice}</p>
                      <p style={{ fontStyle: "italic", color: "#555" }}>{differenceText}</p>

                      <div style={{ marginTop: "10px", display: "flex", gap: "10px", flexWrap: "wrap", justifyContent: "space-between" }}>
                        <Link to={`/flights/details/${item._id}`}>
                          <button style={{
                            padding: "6px 12px",
                            backgroundColor: "#181818",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "500",
                            width: "125px",
                          }}>
                            View Details
                          </button>
                        </Link>
                        <Link to={`/book-flight/${item._id}`}>
                          <button style={{
                            padding: "6px 12px",
                            backgroundColor: "#28a745",
                            color: "#fff",
                            border: "none",
                            borderRadius: "4px",
                            cursor: "pointer",
                            fontWeight: "500",
                            width: "125px",
                          }}>
                            Book Now
                          </button>
                        </Link>
                        {onCompareItem && (
                          <button
                            onClick={() => onCompareItem(item)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#ffc107",
                              color: "#000",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "500",
                              width: "125px",
                            }}
                          >
                            Compare
                          </button>
                        )}
                      </div>

                    </>
                  ) : (
                    <>
                      <img
                        src={item.images?.[0] || "/images/temp4.jpeg"}
                        alt="Hotel"
                        style={{ width: "100%", height: "180px", objectFit: "cover", borderRadius: "6px" }}
                      />
                      <h3 style={{ margin: "10px 0 5px" }}>{item.hotel_name}</h3>
                      <p><strong>Location:</strong> {item.location}</p>
                      <p><strong>Price/Night:</strong> ${itemPrice}</p>
                      <p><strong>Stars:</strong> {item.star_rating || "N/A"}★</p>
                      <p style={{ fontStyle: "italic", color: "#555" }}>{differenceText}</p>

                      <div style={{ display: "flex", justifyContent: "space-between", marginTop: "10px" }}>
                        <Link 
                          to={`/hotels/details/${item._id}`} 
                        >
                          <button style={{
                              padding: "6px 12px",
                              backgroundColor: "#181818",
                              color: "#fff",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                              fontWeight: "500",
                              width: "125px",
                          }}
                          onMouseOver={(e) => {
                            e.target.style.background = "#2a2a2a";
                            e.target.style.color = "#fff";
                          }}
                          onMouseOut={(e) => {
                            e.target.style.background = "#181818";
                            e.target.style.color = "#fff";
                          }}>
                            View Details
                          </button>
                        </Link>
                        {onCompareItem && (
                          <button
                            onClick={() => onCompareItem(item)}
                            style={{
                              padding: "6px 12px",
                              backgroundColor: "#ffc107",
                              color: "#000",
                              border: "none",
                              borderRadius: "4px",
                              cursor: "pointer",
                            }}
                            onMouseOver={(e) => {
                              e.target.style.background = "#ffda3b";
                              e.target.style.color = "#fff";
                            }}
                            onMouseOut={(e) => {
                              e.target.style.background = "#ffc107";
                              e.target.style.color = "#fff";
                            }}
                          >
                            Compare
                          </button>
                        )}
                      </div>
                    </>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CompareModal;
