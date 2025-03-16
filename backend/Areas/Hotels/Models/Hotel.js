// backend/Areas/Hotels/Models/Hotel.js
const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  hotel_id: { type: String, unique: true },
  hotel_name: { type: String, required: true },
  location: String,
  description: String,
  price_per_night: Number,
  room_types: [{ type: String, enum: ["Single", "Double", "Suite"] }],
  amenities: [String],
  images: [String],
  rooms_available: { type: Number, default: 50 }  // New field for available rooms
}, { timestamps: true });

module.exports = mongoose.model("Hotel", hotelSchema);
