// src/FlightDetails.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "./axiosConfig";

const FlightDetails = () => {
  const { id } = useParams();
  const [flight, setFlight] = useState(null);
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef(null);
  
  // Carousel images for flight views
  const carouselImages = [
    "https://images.unsplash.com/photo-1436491865332-7a61a109cc05?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1544620347-c4fd4a3d5957?q=80&w=2069&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1556388158-158ea5ccacbd?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1540959733332-eab4deabeeaf?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1530521954074-e64f6810b32d?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ];

  /* ───────── fetch single flight ───────── */
  useEffect(() => {
    axios
      .get(`/flights/${id}`)
      .then((res) => setFlight(res.data))
      .catch((err) => {
        console.error("Error fetching flight details:", err);
        alert("Flight not found");
      });
  }, [id]);

  useEffect(() => {
    // Auto-rotation functionality
    autoPlayRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, 5000); // Changes slide every 5 seconds
    
    return () => {
      if (autoPlayRef.current) {
        clearTimeout(autoPlayRef.current);
      }
    };
  }, [currentSlide, carouselImages.length]);

  const nextSlide = () => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
    setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
  };

  const prevSlide = () => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
    setCurrentSlide((prev) => (prev === 0 ? carouselImages.length - 1 : prev - 1));
  };

  const goToSlide = (index) => {
    if (autoPlayRef.current) {
      clearTimeout(autoPlayRef.current);
    }
    setCurrentSlide(index);
  };

  if (!flight) return <p>Loading flight details...</p>;

  return (
    <div style={{ 
      padding: "30px", 
      fontFamily: "Poppins, sans-serif", 
      background: "#f5f5f5",
      maxWidth: "1200px",
      margin: "0 auto"
    }}>
      <h1 style={{ 
        textAlign: "center", 
        color: "#333", 
        margin: "20px 0 30px",
        fontSize: "32px"
      }}>
        {flight.airline_name}
      </h1>
      
      {/* Flex container for primary image and carousel */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        marginBottom: "30px",
        justifyContent: "space-between"
      }}>
        {/* Primary Flight Image */}
        <div style={{
          flex: "1",
          minWidth: "300px",
          maxWidth: "600px"
        }}>
          <div style={{
            position: "relative",
            width: "100%",
            height: "400px",
            overflow: "hidden",
            borderRadius: "10px",
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            <img
              src={flight.airline_logo || "/images/default.jpg"}
              alt="Airline"
              style={{ 
                width: "100%", 
                height: "100%", 
                objectFit: "cover",
                borderRadius: "10px"
              }}
            />
            <div style={{
              position: "absolute",
              bottom: 0,
              left: 0,
              right: 0,
              padding: "15px",
              background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
              color: "white"
            }}>
              <p style={{ margin: 0, fontWeight: "500" }}>Airline View</p>
            </div>
          </div>
        </div>
        
        {/* Flight Carousel - Right Side */}
        <div style={{
          flex: "1",
          minWidth: "300px",
          maxWidth: "600px"
        }}>
          {/* Carousel Container */}
          <div style={{ 
            position: "relative", 
            width: "100%", 
            height: "400px", 
            overflow: "hidden",
            borderRadius: "10px", 
            boxShadow: "0 4px 15px rgba(0,0,0,0.1)"
          }}>
            {/* Slides */}
            {carouselImages.map((img, index) => (
              <div key={index} style={{ 
                position: "absolute", 
                width: "100%", 
                height: "100%", 
                opacity: currentSlide === index ? 1 : 0,
                transition: "opacity 0.8s ease-in-out",
                zIndex: currentSlide === index ? 1 : 0,
              }}>
                <img 
                  src={img} 
                  alt={`Flight View ${index + 1}`} 
                  style={{ 
                    width: "100%", 
                    height: "100%", 
                    objectFit: "cover"
                  }} 
                />
                {/* Caption overlay */}
                <div style={{
                  position: "absolute",
                  bottom: 0,
                  left: 0,
                  right: 0,
                  padding: "15px 20px",
                  background: "linear-gradient(transparent, rgba(0,0,0,0.7))",
                  color: "white",
                  textAlign: "start"
                }}>
                  <p style={{ margin: 0, fontSize: "16px", fontWeight: "500" }}>
                    Flight View {index + 1}
                  </p>
                </div>
              </div>
            ))}
            
            {/* Navigation Arrows */}
            <button 
              onClick={prevSlide}
              style={{ 
                position: "absolute", 
                top: "50%", 
                left: "15px", 
                transform: "translateY(-50%)", 
                zIndex: 2,
                backgroundColor: "rgba(0,0,0,0.4)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                transition: "background-color 0.3s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.6)"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.4)"}
            >
              &#10094;
            </button>
            
            <button 
              onClick={nextSlide}
              style={{ 
                position: "absolute", 
                top: "50%", 
                right: "15px", 
                transform: "translateY(-50%)", 
                zIndex: 2,
                backgroundColor: "rgba(0,0,0,0.4)",
                color: "white",
                border: "none",
                borderRadius: "50%",
                width: "40px",
                height: "40px",
                fontSize: "20px",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                boxShadow: "0 2px 10px rgba(0,0,0,0.2)",
                transition: "background-color 0.3s ease"
              }}
              onMouseOver={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.6)"}
              onMouseOut={(e) => e.currentTarget.style.backgroundColor = "rgba(0,0,0,0.4)"}
            >
              &#10095;
            </button>
            
            {/* Dots/Indicators */}
            <div style={{ 
              position: "absolute", 
              bottom: "15px", 
              left: "50%", 
              transform: "translateX(-50%)", 
              display: "flex", 
              gap: "8px",
              zIndex: 2
            }}>
              {carouselImages.map((_, index) => (
                <span 
                  key={index} 
                  onClick={() => goToSlide(index)}
                  style={{
                    display: "inline-block",
                    width: "10px",
                    height: "10px",
                    backgroundColor: currentSlide === index ? "white" : "rgba(255,255,255,0.5)",
                    borderRadius: "50%",
                    cursor: "pointer",
                    transition: "all 0.3s ease",
                    transform: currentSlide === index ? "scale(1.2)" : "scale(1)"
                  }}
                />
              ))}
            </div>
          </div>
        </div>
      </div>

      <div style={{ 
        padding: "20px", 
        backgroundColor: "white", 
        borderRadius: "8px", 
        boxShadow: "0 2px 8px rgba(0,0,0,0.1)"
      }}>
        <div style={{ display: "flex", justifyContent: "space-between", flexWrap: "wrap", gap: "20px" }}>
          <div style={{ flex: "1", minWidth: "300px" }}>
            <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: "20px" }}>
              <div>
                <h3 style={{ margin: "0", color: "#333" }}>{flight.from}</h3>
                <p style={{ margin: "5px 0", color: "#666" }}>Departure</p>
              </div>
              <div style={{ 
                flex: "1", 
                margin: "0 20px", 
                borderBottom: "2px dashed #ccc",
                position: "relative"
              }}>
                <div style={{ 
                  position: "absolute", 
                  top: "-10px", 
                  left: "50%", 
                  transform: "translateX(-50%)",
                  backgroundColor: "white",
                  padding: "0 10px"
                }}>
                  {flight.flight_duration || "Direct Flight"}
                </div>
              </div>
              <div>
                <h3 style={{ margin: "0", color: "#333" }}>{flight.to}</h3>
                <p style={{ margin: "5px 0", color: "#666" }}>Arrival</p>
              </div>
            </div>
            <p style={{ fontSize: "18px" }}><strong>Flight Number:</strong> {flight.flight_number}</p>
            <p style={{ fontSize: "18px" }}><strong>Date:</strong> {new Date(flight.date).toLocaleDateString()}</p>
            <p style={{ fontSize: "18px" }}><strong>Time:</strong> {flight.time}</p>
            <p style={{ fontSize: "18px", color: "#0066cc" }}><strong>Price:</strong> <span style={{ fontSize: "22px" }}>${flight.price}</span></p>
            <p><strong>Available Seats:</strong> {flight.total_seats || "N/A"}</p>
          </div>
          
          <div style={{ flex: "1", minWidth: "300px" }}>
            <h3 style={{ borderBottom: "2px solid #f0f0f0", paddingBottom: "10px" }}>Seat Types and Availability</h3>
            <ul style={{ listStyleType: "none", padding: "0" }}>
              {flight.seat_types?.map((st, index) => (
                <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <strong>{st.type}:</strong> {st.count} seats
                </li>
              ))}
            </ul>
            {flight.description && (
              <div style={{ marginTop: "20px" }}>
                <h3 style={{ borderBottom: "2px solid #f0f0f0", paddingBottom: "10px" }}>Flight Description</h3>
                <p style={{ lineHeight: "1.6", color: "#444" }}>{flight.description}</p>
              </div>
            )}
          </div>
        </div>
        
        <div style={{ marginTop: "20px", borderBottom: "2px solid #f0f0f0" }}>
          {/* <h3 style={{ borderBottom: "2px solid #f0f0f0", paddingBottom: "10px" }}>Flight Features</h3> */}
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
            {flight.features?.map((feature, index) => (
              <span key={index} style={{ 
                backgroundColor: "#f0f7ff", 
                color: "#0066cc", 
                padding: "6px 12px", 
                borderRadius: "20px",
                fontSize: "14px"
              }}>
                {feature}
              </span>
            ))}
          </div>
        </div>
        
        <div style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "center" }}>
          <Link
            to={`/book-flight/${flight._id}`}
            style={{
              padding: "10px 20px",
              backgroundColor: "#007BFF",
              color: "#fff",
              textDecoration: "none",
              borderRadius: "4px"
            }}
          >
            Book Now
          </Link>

          <button
            onClick={() => navigate(-1)}
            style={{ 
              marginBottom: "10px", 
              padding: "12px 20px", 
              cursor: "pointer",
              backgroundColor: "#f8f9fa",
              border: "1px solid #dee2e6",
              borderRadius: "6px",
              transition: "all 0.3s ease"
            }}
            onMouseOver={(e) => {
              e.currentTarget.style.backgroundColor = "#e2e6ea";
            }}
            onMouseOut={(e) => {
              e.currentTarget.style.backgroundColor = "#f8f9fa";
            }}
          >
            ← Go Back
          </button>
        </div>
      </div>
    </div>
  );
};

export default FlightDetails;
