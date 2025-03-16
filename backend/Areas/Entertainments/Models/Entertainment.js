const mongoose = require("mongoose");

const entertainmentSchema = new mongoose.Schema({
  ent_id: { type: String, unique: true },
  entertainmentName: { type: String, required: true },
  location: String,
  price: Number,
  description: String,
  images: [String]
});

module.exports = mongoose.model("Entertainment", entertainmentSchema);
