const mongoose = require("mongoose");

const visaSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  country: String,
  passport_copy_url: String,
  visa_status: { type: String, enum: ["Submitted", "Processing", "Approved", "Rejected"], default: "Submitted" },
  last_updated: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Visa", visaSchema);
