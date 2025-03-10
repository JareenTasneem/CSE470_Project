const mongoose = require("mongoose");

const bookingSchema = new mongoose.Schema({
  booking_id: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  tour_package: { type: mongoose.Schema.Types.ObjectId, ref: "TourPackage", default: null },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", default: null },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", default: null },
  status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
  total_price: Number
}, { timestamps: true });

module.exports = mongoose.model("Booking", bookingSchema);
