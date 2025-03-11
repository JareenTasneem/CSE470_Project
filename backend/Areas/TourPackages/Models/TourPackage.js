// backend/Areas/TourPackages/Models/tourPackage.js

const mongoose = require('mongoose');

const tourPackageSchema = new mongoose.Schema({
  package_id: { type: String, unique: true },
  package_title: { type: String, required: true },
  package_details: String,
  location: String,
  duration: String,
  price: Number,
  availability: Number,

  // Add these if you want them:
  itinerary: [String],
  inclusions: [String],
  exclusions: [String],

  hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Hotel' }],
  flights: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Flight' }],
  bookings: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Booking' }],
  images: [String],
  created_by: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}, 
{ timestamps: true }
);

module.exports = mongoose.model('TourPackage', tourPackageSchema);
