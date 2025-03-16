// backend/Areas/Flights/Models/Flight.js
const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flight_id: { type: String, unique: true },
  airline_name: { type: String, required: true },
  from: String,
  to: String,
  date: Date, // you may choose to separate departure and arrival times if needed
  // Optionally add an arrivalTime field:
  // arrivalTime: Date,
  price: Number,
  airline_logo: String,
  seats_available: Number
}, { timestamps: true });

module.exports = mongoose.model("Flight", flightSchema);
