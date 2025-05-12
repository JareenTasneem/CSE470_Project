const mongoose = require("mongoose");

const loyaltyTransactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  booking: { type: mongoose.Schema.Types.ObjectId, ref: "Booking" },
  points: { type: Number, required: true }, // Positive for earning, negative for redemption
  type: { 
    type: String, 
    enum: ["EARNED", "REDEEMED", "EXPIRED", "ADJUSTMENT"],
    required: true 
  },
  description: { type: String, required: true },
  expiryDate: { type: Date }, // Points expiry date
  status: { 
    type: String, 
    enum: ["ACTIVE", "EXPIRED", "REDEEMED"],
    default: "ACTIVE"
  }
}, { timestamps: true });

// Index for faster queries
loyaltyTransactionSchema.index({ user: 1, createdAt: -1 });
loyaltyTransactionSchema.index({ status: 1, expiryDate: 1 });

module.exports = mongoose.model("LoyaltyTransaction", loyaltyTransactionSchema); 