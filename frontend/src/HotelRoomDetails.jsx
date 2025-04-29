import React, { useEffect, useState, useRef } from "react";
import { useParams, Link, useNavigate } from "react-router-dom";
import axios from "./axiosConfig";

const HotelRoomDetails = () => {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const navigate = useNavigate();
  const [currentSlide, setCurrentSlide] = useState(0);
  const autoPlayRef = useRef(null);
  
  // Carousel images for room views
  const carouselImages = [
    "https://images.unsplash.com/photo-1611892440504-42a792e24d32?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1587985064135-0366536eab42?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1648383228240-6ed939727ad6?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1549638441-b787d2e11f14?q=80&w=2070&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/photo-1566665797739-1674de7a421a?q=80&w=1974&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D",
    "https://images.unsplash.com/flagged/photo-1556438758-8d49568ce18e?q=80&w=2074&auto=format&fit=crop&ixlib=rb-4.0.3&ixid=M3wxMjA3fDB8MHxwaG90by1wYWdlfHx8fGVufDB8fHx8fA%3D%3D"
  ];

  useEffect(() => {
    axios.get(`/hotels/${id}`).then((res) => setHotel(res.data));
  }, [id]);

  useEffect(() => {
    // Auto-rotation functionality
    autoPlayRef.current = setTimeout(() => {
      setCurrentSlide((prev) => (prev === carouselImages.length - 1 ? 0 : prev + 1));
    }, 5000); // Changes slide every 3 seconds; timer is set at ns
    
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

  if (!hotel) return <p>Loading hotel details...</p>;

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
        {hotel.hotel_name}
      </h1>
      
      {/* Flex container for primary image and carousel */}
      <div style={{
        display: "flex",
        flexWrap: "wrap",
        gap: "20px",
        marginBottom: "30px",
        justifyContent: "space-between"
      }}>
        {/* Primary Hotel Image - Getting the image from the database */}
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
              src={hotel.images?.[0] || "/images/temp4.jpeg"}
              alt="Hotel"
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
              <p style={{ margin: 0, fontWeight: "500" }}>Main View</p>
            </div>
          </div>
        </div>
        
        {/* Room Carousel - Right Side */}
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
                  alt={`Room View ${index + 1}`} 
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
                    Room View {index + 1}
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
            <p style={{ fontSize: "18px" }}><strong>Location:</strong> {hotel.location}</p>
            <p style={{ fontSize: "16px", lineHeight: "1.6" }}><strong>Description:</strong> {hotel.description}</p>
            <p style={{ fontSize: "18px", color: "#0066cc" }}><strong>Price per Night:</strong> <span style={{ fontSize: "22px" }}>${hotel.price_per_night}</span></p>
            <p><strong>Rooms Available (Total):</strong> {hotel.rooms_available}</p>
            <p><strong>Star Rating:</strong> <span style={{ color: "#ff9900" }}>{hotel.star_rating || "N/A"} ★</span></p>
          </div>
          
          <div style={{ flex: "1", minWidth: "300px" }}>
            <h3 style={{ borderBottom: "2px solid #f0f0f0", paddingBottom: "10px" }}>Room Types and Availability</h3>
            <ul style={{ listStyleType: "none", padding: "0" }}>
              {hotel.room_types?.map((rt, index) => (
                <li key={index} style={{ padding: "8px 0", borderBottom: "1px solid #f0f0f0" }}>
                  <strong>{rt.type}:</strong> {rt.count} rooms
                </li>
              ))}
            </ul>
          </div>
        </div>
        
        <div style={{ marginTop: "20px" }}>
          <h3 style={{ borderBottom: "2px solid #f0f0f0", paddingBottom: "10px" }}>Amenities</h3>
          <div style={{ display: "flex", flexWrap: "wrap", gap: "10px", marginTop: "15px" }}>
            {hotel.amenities?.map((amenity, index) => (
              <span key={index} style={{ 
                backgroundColor: "#f0f7ff", 
                color: "#0066cc", 
                padding: "6px 12px", 
                borderRadius: "20px",
                fontSize: "14px"
              }}>
                {amenity}
              </span>
            ))}
          </div>
        </div>
        
        <div style={{ marginTop: "30px", display: "flex", gap: "15px", justifyContent: "center" }}>
        <Link
        to={`/book-hotel/${hotel._id}`}
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

export default HotelRoomDetails;
