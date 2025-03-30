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
  rooms_available: { type: Number, default: 50 }  // Track available rooms
});

// Static method to decrement rooms
hotelSchema.statics.decrementRooms = async function (hotelId) {
  try {
    const hotel = await this.findById(hotelId);
    if (!hotel) throw new Error("Hotel not found");

    if (hotel.rooms_available <= 0) {
      throw new Error("No rooms available");
    }

    hotel.rooms_available -= 0.5;  // Decrease room count by 1
    await hotel.save();
    return hotel;
  } catch (error) {
    throw new Error(error.message);
  }
};

// Hotel Model Method
hotelSchema.statics.incrementRooms = async function(hotelId, count) {
  return this.findByIdAndUpdate(
    hotelId,
    { $inc: { rooms_available: count } },
    { new: true }
  );
};


module.exports = mongoose.model("Hotel", hotelSchema);
