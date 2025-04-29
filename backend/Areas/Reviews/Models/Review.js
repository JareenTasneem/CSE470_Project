const mongoose = require("mongoose");

const reviewSchema = new mongoose.Schema({
  review_id: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  item: { type: mongoose.Schema.Types.ObjectId, required: true },
  item_type: { type: String, enum: ["Flight", "Hotel", "TourPackage"] },
  rating: { type: Number, min: 1, max: 5, required: true },
  comment: String
}, { timestamps: true });

module.exports = mongoose.model("Review", reviewSchema);
