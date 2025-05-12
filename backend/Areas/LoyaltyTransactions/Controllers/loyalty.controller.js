const User = require("../../Users/Models/User");
const LoyaltyTransaction = require("../Models/LoyaltyTransaction");
const Booking = require("../../Bookings/Models/Booking");

// Calculate points based on booking type
const calculatePoints = (booking) => {
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
};

// Helper function to determine tier based on total points
const determineTier = (totalPoints) => {
  if (totalPoints >= 50000) return "Platinum";
  if (totalPoints >= 15000) return "Gold";
  if (totalPoints >= 5000) return "Silver";
  return "Bronze";
};

// Helper function to get next tier
const getNextTier = (currentTier) => {
  const tiers = ["Bronze", "Silver", "Gold", "Platinum"];
  const currentIndex = tiers.indexOf(currentTier);
  return currentIndex < tiers.length - 1 ? tiers[currentIndex + 1] : null;
};

// Helper function to calculate points needed for next tier
const getPointsToNextTier = (currentPoints, currentTier) => {
  const tierThresholds = {
    "Bronze": 5000,    // Need 5000 points to reach Silver
    "Silver": 15000,   // Need 15000 points to reach Gold
    "Gold": 50000,     // Need 50000 points to reach Platinum
    "Platinum": null   // No higher tier
  };
  
  const nextTier = getNextTier(currentTier);
  if (!nextTier) return 0;
  
  return Math.max(0, tierThresholds[currentTier] - currentPoints);
};

// Add points for a booking
const addPointsForBooking = async (bookingId) => {
  try {
    const booking = await Booking.findById(bookingId).populate('user');
    if (!booking) throw new Error("Booking not found");

    const points = calculatePoints(booking);
    const expiryDate = new Date();
    expiryDate.setFullYear(expiryDate.getFullYear() + 1); // Points expire after 1 year

    // Create transaction record
    const transaction = new LoyaltyTransaction({
      user: booking.user._id,
      booking: bookingId,
      points: points,
      type: "EARNED",
      description: `Points earned for booking #${booking.booking_id}`,
      expiryDate: expiryDate
    });

    await transaction.save();

    // Calculate new total points
    const newTotalPoints = booking.user.loyaltyPoints + points;
    
    // Determine new tier based on total points
    const newTier = determineTier(newTotalPoints);

    // Update user's points and tier
    await User.findByIdAndUpdate(booking.user._id, {
      $inc: { loyaltyPoints: points },
      membership_tier: newTier
    });

    return transaction;
  } catch (error) {
    console.error("Error adding points:", error);
    throw error;
  }
};

// Redeem points for a discount
const redeemPoints = async (userId, pointsToRedeem, description) => {
  try {
    const user = await User.findById(userId);
    if (!user) throw new Error("User not found");
    if (user.loyaltyPoints < pointsToRedeem) throw new Error("Insufficient points");

    // Create redemption transaction
    const transaction = new LoyaltyTransaction({
      user: userId,
      points: -pointsToRedeem,
      type: "REDEEMED",
      description: description,
      status: "REDEEMED"
    });

    await transaction.save();

    // Update user's points
    await User.findByIdAndUpdate(userId, {
      $inc: { loyaltyPoints: -pointsToRedeem }
    });

    return transaction;
  } catch (error) {
    console.error("Error redeeming points:", error);
    throw error;
  }
};

// Get user's loyalty points history
const getLoyaltyHistory = async (userId) => {
  try {
    const transactions = await LoyaltyTransaction.find({ user: userId })
      .sort({ createdAt: -1 })
      .populate('booking', 'booking_id total_price');
    
    return transactions;
  } catch (error) {
    console.error("Error getting loyalty history:", error);
    throw error;
  }
};

// Get user's current points and tier
const getLoyaltyStatus = async (userId) => {
  try {
    const user = await User.findById(userId)
      .select('loyaltyPoints membership_tier');
    
    if (!user) throw new Error("User not found");

    return {
      points: user.loyaltyPoints,
      tier: user.membership_tier,
      nextTier: getNextTier(user.membership_tier),
      pointsToNextTier: getPointsToNextTier(user.loyaltyPoints, user.membership_tier)
    };
  } catch (error) {
    console.error("Error getting loyalty status:", error);
    throw error;
  }
};

module.exports = {
  addPointsForBooking,
  redeemPoints,
  getLoyaltyHistory,
  getLoyaltyStatus
}; 