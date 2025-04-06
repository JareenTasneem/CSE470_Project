const mongoose = require("mongoose");

const entertainmentSchema = new mongoose.Schema({
  ent_id: { type: String, unique: true },
  entertainmentName: { type: String, required: true },
  location: String,
  price: Number,
  description: String,
  images: [String],
  // Optionally, add a field to track availability:
  isAvailable: { type: Boolean, default: true },
});

// Static method to book entertainment
entertainmentSchema.statics.bookEntertainment = async function (entertainmentId) {
  const entertainment = await this.findById(entertainmentId);
  if (!entertainment) throw new Error("Entertainment not found");
  // Optionally mark it as booked:
  entertainment.isAvailable = false;
  await entertainment.save();
  return entertainment;
};

// Add a static method to mark as available (restore)
entertainmentSchema.statics.markAsAvailable = async function (entertainmentId) {
  const entertainment = await this.findById(entertainmentId);
  if (!entertainment) throw new Error("Entertainment not found");
  // Mark it as available (restore)
  entertainment.isAvailable = true;
  await entertainment.save();
  return entertainment;
};

module.exports = mongoose.model("Entertainment", entertainmentSchema);
