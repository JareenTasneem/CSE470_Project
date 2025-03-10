const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  user_id: { type: String, unique: true },
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  phone: String,
  address: String,
  password: { type: String, required: true },
  user_type: { type: String, enum: ["Customer", "Admin"], default: "Customer" },
  passport_id: String,
  loyaltyPoints: { type: Number, default: 0 },
  membership_tier: { type: String, enum: ["Bronze", "Silver", "Gold"], default: "Bronze" }
}, { timestamps: true });

module.exports = mongoose.model("User", userSchema);
