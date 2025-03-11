const mongoose = require("mongoose");

const paymentSchema = new mongoose.Schema({
  payment_id: { type: String, unique: true },
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  amount: Number,
  method: { type: String, enum: ["Card", "PayPal", "bKash", "Nagad", "Bank"] },
  status: { type: String, enum: ["Pending", "Completed", "Failed", "Refunded"], default: "Pending" },
  transaction_date: { type: Date, default: Date.now }
}, { timestamps: true });

module.exports = mongoose.model("Payment", paymentSchema);
