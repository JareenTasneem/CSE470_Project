// backend/Areas/CustomPackages/Models/CustomPackage.js
const mongoose = require("mongoose");

const customPackageSchema = new mongoose.Schema({
  // A separate field for your custom UUID
  custom_id: { type: String, unique: true },

  // Link to the User
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User" },

  // Arrays of flight/hotel/ent ObjectIds
  flights: [{ type: mongoose.Schema.Types.ObjectId, ref: "Flight" }],
  hotels: [{ type: mongoose.Schema.Types.ObjectId, ref: "Hotel" }],
  entertainments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Entertainment" }],

  // Timestamps
  createdAt: { type: Date, default: Date.now },
});

// Note: We do NOT define `_id` ourselves. Mongoose automatically creates `_id: ObjectId`.
module.exports = mongoose.model("CustomPackage", customPackageSchema);
