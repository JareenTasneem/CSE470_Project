const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flight_id: { type: String, unique: true },
  airline_name: { type: String, required: true },
  from: String,
  to: String,
  date: Date,
  price: Number,
  seats_available: Number
}, { timestamps: true });

module.exports = mongoose.model("Flight", flightSchema);
