const Booking = require("../../Bookings/Models/Booking");
const Refund = require("../Models/Refund");

// Calculate refund amount based on policy (example: 90% if within 7 days, etc.)
function calculateRefundAmount(booking) {
  const bookingDate = new Date(booking.createdAt);
  const currentDate = new Date();
  const daysDifference = Math.floor((currentDate - bookingDate) / (1000 * 60 * 60 * 24));
  const price = booking.total_price || 0;
  if (daysDifference <= 7) return price * 0.9;
  if (daysDifference <= 14) return price * 0.75;
  if (daysDifference <= 30) return price * 0.5;
  return price * 0.2;
}

exports.requestRefund = async (req, res) => {
  try {
    const { bookingId, reason } = req.body;
    const userId = req.user?.userId;
    console.log('Refund request received:', { userId, bookingId, reason });
    if (!userId) {
      console.log('No userId in token');
      return res.status(401).json({ message: "Unauthorized: No user ID found in token." });
    }
    const booking = await Booking.findById(bookingId);
    console.log('Booking found:', booking);
    if (!booking) {
      console.log('Booking not found for ID:', bookingId);
      return res.status(404).json({ message: `Booking not found for ID: ${bookingId}` });
    }
    if (String(booking.user) !== String(userId)) {
      console.log('Booking does not belong to user:', { bookingUser: booking.user, userId });
      return res.status(403).json({ message: "Forbidden: You do not own this booking." });
    }
    if (booking.refundRequested || booking.refundStatus !== "none") {
      console.log('Refund already requested or processed:', { refundRequested: booking.refundRequested, refundStatus: booking.refundStatus });
      return res.status(400).json({ message: "Refund already requested or processed for this booking." });
    }
    // Calculate refund amount
    const refundAmount = calculateRefundAmount(booking);
    // Update booking
    booking.refundRequested = true;
    booking.refundStatus = "requested";
    booking.refundReason = reason;
    booking.refundAmount = refundAmount;
    await booking.save();
    // Create refund record
    const refund = await Refund.create({
      booking: booking._id,
      user: userId,
      amount: refundAmount,
      reason,
      status: "requested"
    });
    console.log('Refund created:', refund);
    res.status(201).json({ message: "Refund requested successfully", refund });
  } catch (err) {
    console.error("requestRefund error:", err);
    res.status(500).json({ message: `Server error requesting refund: ${err.message}`, error: err });
  }
}; 