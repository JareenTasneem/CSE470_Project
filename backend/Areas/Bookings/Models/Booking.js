// backend/Areas/Bookings/Models/Booking.js
const mongoose = require("mongoose");
const { v4: uuidv4 } = require('uuid'); // Import uuid to generate unique ids

const bookingSchema = new mongoose.Schema({
  booking_id: { type: String, unique: true, required: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },

  tour_package: { type: mongoose.Schema.Types.ObjectId, ref: "TourPackage", default: null },
  custom_package: { type: mongoose.Schema.Types.ObjectId, ref: "CustomPackage", default: null },
  hotel: { type: mongoose.Schema.Types.ObjectId, ref: "Hotel", default: null },
  flight: { type: mongoose.Schema.Types.ObjectId, ref: "Flight", default: null },

  name: { type: String },
  numberOfPeople: { type: Number },
  startDate: { type: Date },
  email: { type: String },
  departureCity: { type: String },

  status: { type: String, enum: ["Pending", "Confirmed", "Cancelled"], default: "Pending" },
  total_price: Number,

  flights: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flight" }],
  hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],
  entertainments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entertainment" }],

  hotelMeta: {
    hotel_name: String,
    location: String,
    image: String,
    price_per_night: Number,
  },
  
  flightMeta: {
    airline_name: String,
    from: String,
    to: String,
    date: Date,
    airline_logo: String,
  },

  flight_details: {
    passportNumber: String,
    nationality: String,
    seatPreference: String,
    seatClass: { type: String, enum: ["business", "economy"], default: "economy" },
    qty: { type: Number, default: 1 }
  },

  hotel_room_details: {
    roomType: String,
    numberOfRooms: Number,
  }

}, { timestamps: true });

// Auto-generate booking_id if not already set
bookingSchema.pre('save', function (next) {
  if (!this.booking_id) {
    this.booking_id = uuidv4();
  }
  next();
});

module.exports = mongoose.model("Booking", bookingSchema);
