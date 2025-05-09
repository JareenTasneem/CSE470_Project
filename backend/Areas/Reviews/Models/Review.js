const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review_id: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking", required: true },
  item: { type: mongoose.Schema.Types.ObjectId, required: true, refPath: 'item_type' },
  item_type: { type: String, enum: ["Flight", "Hotel", "TourPackage"] },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: { type: String, required: true, minlength: 10, maxlength: 500 },
  title: { type: String, required: true, minlength: 5, maxlength: 100 },
  helpful_votes: { type: Number, default: 0 },
  is_verified: { type: Boolean, default: false }
}, { timestamps: true });

// Add index for faster queries
reviewSchema.index({ user: 1, item: 1 }, { unique: true });
reviewSchema.index({ item: 1, item_type: 1 });

module.exports = mongoose.model("Review", reviewSchema);
