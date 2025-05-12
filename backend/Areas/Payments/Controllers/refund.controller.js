const Booking = require("../../Bookings/Models/Booking");
const Refund = require("../Models/Refund");
const User = require("../../Users/Models/User");
const LoyaltyTransaction = require("../../LoyaltyTransactions/Models/LoyaltyTransaction");
const loyaltyController = require("../../LoyaltyTransactions/Controllers/loyalty.controller");

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

// Calculate points to deduct based on booking type
function calculatePointsToDeduct(booking) {
  // Check if it's a custom package
  if (booking.custom_package) {
    return 900; // 900 points for customized pack
  }
  
  // Check if it's a tour package
  if (booking.tour_package) {
    return 1000; // 1000 points for tour pack
  }
  
  // For individual hotel or flight bookings
  return 300; // 300 points for hotel or flight only
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
    
    // Calculate points to deduct
    const pointsToDeduct = calculatePointsToDeduct(booking);

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

    // Deduct loyalty points
    try {
      // Create transaction record for points deduction
      const transaction = new LoyaltyTransaction({
        user: userId,
        booking: bookingId,
        points: -pointsToDeduct, // Negative points for deduction
        type: "ADJUSTMENT",
        description: `Points deducted for refund of booking #${booking.booking_id}`,
        status: "ACTIVE"
      });

      await transaction.save();

      // Update user's points
      await User.findByIdAndUpdate(userId, {
        $inc: { loyaltyPoints: -pointsToDeduct }
      });

      console.log(`Deducted ${pointsToDeduct} points for refund of booking ${bookingId}`);
    } catch (error) {
      console.error("Error deducting loyalty points:", error);
      // Don't fail the refund request if points deduction fails
    }

    console.log('Refund created:', refund);
    res.status(201).json({ message: "Refund requested successfully", refund });
  } catch (err) {
    console.error("Error processing refund request:", err);
    res.status(500).json({ message: "Server error processing refund request", error: err.message });
  }
}; 