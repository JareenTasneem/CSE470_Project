const TourPackage = require("../Models/TourPackage");
const Booking = require("../../Bookings/Models/Booking");

// Get all tour packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await TourPackage.find();
    res.json(packages);
  } catch (err) {
    console.error("Error fetching tour packages:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single tour package by ID
exports.getPackageById = async (req, res) => {
  try {
    const singlePackage = await TourPackage.findById(req.params.id);
    if (!singlePackage) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json(singlePackage);
  } catch (err) {
    console.error("Error fetching tour package by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// AI-based personalized recommendations
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.userId;
    const bookings = await Booking.find({ user: userId, status: "Confirmed" }).populate("tour_package");
    const allBookings = await Booking.find({ status: "Confirmed" });

    // 1. User preferences
    const locationCount = {};
    const priceRange = [];
    const durations = [];
    bookings.forEach(b => {
      if (b.tour_package) {
        const loc = b.tour_package.location;
        locationCount[loc] = (locationCount[loc] || 0) + 1;
        priceRange.push(b.tour_package.price);
        if (b.tour_package.duration) {
          const d = parseInt(b.tour_package.duration);
          if (!isNaN(d)) durations.push(d);
        }
      }
    });
    const topLocations = Object.entries(locationCount)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 2)
      .map(([loc]) => loc);
    const avgPrice = priceRange.length ? priceRange.reduce((a, b) => a + b, 0) / priceRange.length : 0;
    const avgDuration = durations.length ? durations.reduce((a, b) => a + b, 0) / durations.length : 0;

    // 2. Hot packages (most booked by all users)
    const packagePopularity = {};
    allBookings.forEach(b => {
      if (b.tour_package) {
        const id = b.tour_package.toString();
        packagePopularity[id] = (packagePopularity[id] || 0) + 1;
      }
    });
    const hotPackageIds = Object.entries(packagePopularity)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([id]) => id);

    // 3. Recent packages
    const recentPackages = await TourPackage.find().sort({ createdAt: -1 }).limit(5);

    // 4. Build a complex query for personalized packages
    const personalizedQuery = {
      ...(topLocations.length && { location: { $in: topLocations } }),
      ...(avgPrice && { price: { $lte: avgPrice * 1.3 } }),
      ...(avgDuration && { duration: { $regex: Math.round(avgDuration) } }),
    };
    let personalized = await TourPackage.find(personalizedQuery).limit(5);

    // 5. Add hot packages and recent packages, ensuring diversity
    const hotPackages = await TourPackage.find({ _id: { $in: hotPackageIds } });
    const allRecs = [
      ...personalized,
      ...hotPackages,
      ...recentPackages
    ];

    // Remove duplicates and limit to 8
    const seen = new Set();
    const recommendations = [];
    for (const pkg of allRecs) {
      if (!seen.has(pkg._id.toString())) {
        recommendations.push(pkg);
        seen.add(pkg._id.toString());
      }
      if (recommendations.length >= 8) break;
    }

    // Fallback: if not enough, fill with random
    if (recommendations.length < 8) {
      const extra = await TourPackage.find().limit(8 - recommendations.length);
      for (const pkg of extra) {
        if (!seen.has(pkg._id.toString())) {
          recommendations.push(pkg);
          seen.add(pkg._id.toString());
        }
      }
    }

    res.json(recommendations);
  } catch (err) {
    console.error("Error in personalized recommendations:", err);
    res.status(500).json({ error: "Server error" });
  }
};
