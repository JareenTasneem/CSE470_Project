const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  hotel_id: { type: String, unique: true },
  hotel_name: { type: String, required: true },
  location: String,
  description: String,
  price_per_night: Number,
  room_types: [{ type: String, enum: ["Single", "Double", "Suite"] }],
  amenities: [String]
}, { timestamps: true });

module.exports = mongoose.model("Hotel", hotelSchema);
