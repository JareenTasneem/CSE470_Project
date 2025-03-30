// backend/Areas/Bookings/Models/Booking.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid'); // Import uuid to generate unique ids

const bookingSchema = new mongoose.Schema({
  booking_id: { type: String, unique: true, required: true }, // Ensure it's required and unique
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tour_package: { type: mongoose.Schema.Types.ObjectId, ref: "TourPackage", default: null },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", default: null },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", default: null },
  name: { type: String },
  numberOfPeople: { type: Number },
  startDate: { type: Date },
  email: { type: String },
  departureCity: { type: String },
  status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
  total_price: Number,
  flights: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flight" }], // Array of flight references
  hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }], // Array of hotel references
  entertainments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entertainment" }] // Array of entertainment references
}, { timestamps: true });

// Automatically generate booking_id if not provided
bookingSchema.pre('save', function(next) {
  if (!this.booking_id) {
    this.booking_id = uuidv4(); // Generate a unique booking ID if not provided
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
