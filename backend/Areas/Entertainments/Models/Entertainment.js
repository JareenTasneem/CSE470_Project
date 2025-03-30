const mongoose = require("mongoose");

const entertainmentSchema = new mongoose.Schema({
  ent_id: { type: String, unique: true },
  entertainmentName: { type: String, required: true },
  location: String,
  price: Number,
  description: String,
  images: [String],
  // booked: { type: Boolean, default: false }, // Optional: Could be used if you want to track bookings
});

// Static method to book entertainment
entertainmentSchema.statics.bookEntertainment = async function (entertainmentId) {
  const entertainment = await this.findById(entertainmentId);
  if (!entertainment) throw new Error("Entertainment not found");

  // No check if it is booked, just allow booking
  // Optionally update the 'booked' field if you want
  // entertainment.booked = true; // If you want to mark it as booked
  await entertainment.save();
  return entertainment;
};

module.exports = mongoose.model("Entertainment", entertainmentSchema);
