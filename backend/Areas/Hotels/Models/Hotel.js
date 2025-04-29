// backend/Areas/Hotels/Models/Hotel.js
const mongoose = require("mongoose");

const hotelSchema = new mongoose.Schema({
  hotel_id: { type: String, unique: true },
  hotel_name: { type: String, required: true },
  location: String,
  description: String,
  price_per_night: Number,
  star_rating: Number,
  room_types: [
    {
      type: { type: String },   // e.g. 'Single'
      count: { type: Number } 
    }
  ],
  amenities: [String],
  images: [String],
  rooms_available: { type: Number, default: 50 }  // Track available rooms
});

// Static method to decrement rooms
// Decrement specific room type count and total rooms_available
hotelSchema.statics.decrementRoomType = async function(hotelId, roomType, count) {
  const hotel = await this.findById(hotelId);
  if (!hotel) throw new Error("Hotel not found");

  const selectedRoom = hotel.room_types.find(rt => rt.type === roomType);
  if (!selectedRoom) throw new Error(`${roomType} room type not found`);
  if (selectedRoom.count < count) throw new Error(`Not enough ${roomType} rooms available`);

  selectedRoom.count -= count;
  hotel.rooms_available -= count;
  return hotel.save();
};


hotelSchema.statics.decrementRooms = async function (hotelId, count = 0.5) {
  const hotel = await this.findById(hotelId);
  if (!hotel) throw new Error("Hotel not found");

  hotel.rooms_available = Math.max(0, hotel.rooms_available - count); // Avoid negatives
  await hotel.save();
};



// Hotel Model Method
hotelSchema.statics.incrementRoomType = async function(hotelId, roomType, count) {
  const hotel = await this.findById(hotelId);
  if (!hotel) throw new Error("Hotel not found");

  const selectedRoom = hotel.room_types.find(rt => rt.type === roomType);
  if (!selectedRoom) throw new Error(`${roomType} room type not found`);

  selectedRoom.count += count;
  hotel.rooms_available += count;
  await hotel.save();
};


module.exports = mongoose.model("Hotel", hotelSchema);
