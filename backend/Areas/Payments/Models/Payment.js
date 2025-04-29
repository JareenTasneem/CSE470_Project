const mongoose = require("mongoose");
const { v4: uuidv4 } = require("uuid");

const paymentSchema = new mongoose.Schema({
  payment_id: {
    type: String,
    unique: true,
    required: true,
    default: uuidv4,
  },
  booking: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Booking",
    required: true,
  },
  installmentNumber: { type: Number, required: true },
  amount: { type: Number, required: true },
  dueDate: { type: Date, required: true },
  status: {
    type: String,
    enum: ["Paid", "Unpaid"],
    default: "Unpaid",
  },
  paidAt: Date,
  invoiceId: {
    type: String,
    default: () => uuidv4(),
  },
}, { timestamps: true });

// ✅ Add this line to prevent duplicate installment numbers per booking
paymentSchema.index({ booking: 1, installmentNumber: 1 }, { unique: true });

module.exports = mongoose.models.Payment || mongoose.model("Payment", paymentSchema);
