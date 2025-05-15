import React, { useEffect, useState } from "react";
import { useParams, Link, useNavigate } from "react-router-dom"; // <-- Added Link import
import axios from "./axiosConfig";

function HotelDetails() {
  const { id } = useParams();
  const [hotel, setHotel] = useState(null);
  const [reviews, setReviews] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    // Fetch hotel details
    axios.get(`/hotels/${id}`).then((res) => setHotel(res.data));

    // Fetch reviews
    axios
      .get(`http://localhost:5000/api/reviews/item/${id}/Hotel`)
      .then((res) => {
        setReviews(res.data);
      })
      .catch((err) => {
        console.error("Error fetching reviews:", err);
      });
  }, [id]);

  if (!hotel) return <p>Loading...</p>;

  return (
    <div style={{ padding: "20px", fontFamily: "Poppins, sans-serif" }}>
      <h2>{hotel.hotel_name}</h2>
      <img src={hotel.images?.[0]} style={{ maxWidth: "300px" }} />
      <p><strong>Location:</strong> {hotel.location}</p>
      <p><strong>Description:</strong> {hotel.description}</p>
      <p><strong>Price per Night:</strong> ${hotel.price_per_night}</p>
      <p><strong>Rooms Available:</strong> {hotel.rooms_available}</p>
      <p><strong>Amenities:</strong> {hotel.amenities.join(", ")}</p>
      <p><strong>Room Types:</strong> {hotel.room_types.join(", ")}</p>

      {/* Reviews Section */}
      <div style={{ marginTop: "40px" }}>
        <h3 style={{ color: "#333", marginBottom: "20px" }}>Customer Reviews</h3>
        {reviews.length > 0 ? (
          reviews.map((review) => (
            <div
              key={review._id}
              style={{
                padding: "20px",
                marginBottom: "20px",
                border: "1px solid #ddd",
                borderRadius: "8px",
                backgroundColor: "#fff"
              }}
            >
              <div style={{ display: "flex", justifyContent: "space-between", marginBottom: "10px" }}>
                <h4 style={{ margin: 0, color: "#333" }}>{review.title}</h4>
                <div style={{ color: "#666" }}>
                  Rating: {review.rating}/5
                </div>
              </div>
              <p style={{ color: "#666", marginBottom: "10px" }}>{review.comment}</p>
              <div style={{ color: "#999", fontSize: "0.9em" }}>
                By {review.user?.name || "Anonymous"} • {new Date(review.createdAt).toLocaleDateString()}
              </div>
            </div>
          ))
        ) : (
          <p style={{ color: "#666", textAlign: "center" }}>No reviews yet. Be the first to review this hotel!</p>
        )}
      </div>

      <button
        onClick={() => navigate(-1)}
        style={{ marginBottom: "10px", padding: "8px 15px", cursor: "pointer" }}
      >
        ← Go Back
      </button>
    </div>
  );
}

export default HotelDetails;
