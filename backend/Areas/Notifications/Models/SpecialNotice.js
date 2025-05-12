const mongoose = require("mongoose");

const specialNoticeSchema = new mongoose.Schema({
  message: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
  createdBy: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  // Targeting: if empty, it's for all users; otherwise, only for these users
  targetUsers: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }]
});

module.exports = mongoose.model("SpecialNotice", specialNoticeSchema); 