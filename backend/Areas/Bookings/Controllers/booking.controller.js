// backend/Areas/Bookings/Controllers/booking.controller.js
const { v4: uuidv4 } = require("uuid");
const Flight = require("../../Flights/Models/Flight");
const Hotel = require("../../Hotels/Models/Hotel");
const Entertainment = require("../../Entertainments/Models/Entertainment");
const Booking = require("../Models/Booking");
const CustomPackage = require("../../CustomPackages/Models/CustomPackage");
const TourPackage = require("../../TourPackages/Models/TourPackage");

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    const { packageId, name, numberOfPeople, startDate, email, departureCity } = req.body;
    const userId = req.user.userId;

    if (req.body.hotel && req.body.roomType && req.body.numberOfRooms) {
      const { hotel, roomType, numberOfRooms } = req.body;

      const hotelDoc = await Hotel.findById(hotel);
      if (!hotelDoc) {
        return res.status(404).json({ message: "Hotel not found" });
      }

      const selectedRoom = hotelDoc.room_types.find(rt => rt.type === roomType);
      if (!selectedRoom || selectedRoom.count < numberOfRooms) {
        return res.status(400).json({ message: `Not enough rooms available for ${roomType}` });
      }

      selectedRoom.count -= numberOfRooms;
      hotelDoc.rooms_available -= numberOfRooms;
      await hotelDoc.save();

      const booking = new Booking({
        booking_id: uuidv4(),
        user: userId,
        hotel: hotelDoc._id,
        name,
        numberOfPeople,
        startDate,
        email,
        departureCity,
        status: "Pending",
        total_price: hotelDoc.price_per_night * numberOfRooms,
        hotelMeta: {
          hotel_name: hotelDoc.hotel_name,
          location: hotelDoc.location,
          image: hotelDoc.images?.[0] || "/default.jpg",
          price_per_night: hotelDoc.price_per_night,
        },
        hotel_room_details: {
          roomType,
          numberOfRooms,
        },
      });

      await booking.save();
      return res.status(201).json({ message: "Hotel booking successful", booking });
    }

    const tourPackage = await TourPackage.findById(packageId);
    let booking;
    const customPackage = await CustomPackage.findById(packageId)
      .populate("flights")
      .populate("hotels")
      .populate("entertainments");

    if (customPackage) {
      for (let flight of customPackage.flights) {
        if (flight.seats_available <= 0) {
          return res.status(400).json({ message: `No seats available for flight ${flight.airline_name}` });
        }
      }
      for (let hotel of customPackage.hotels) {
        if (hotel.rooms_available <= 0) {
          return res.status(400).json({ message: `No rooms available for hotel ${hotel.hotel_name}` });
        }
      }

      for (let flight of customPackage.flights) {
        await Flight.decrementSeats(flight._id);
      }
      for (let hotel of customPackage.hotels) {
        await Hotel.decrementRooms(hotel._id);
      }
      for (let entertainment of customPackage.entertainments) {
        await Entertainment.bookEntertainment(entertainment._id);
      }

      booking = new Booking({
        booking_id: uuidv4(),
        user: userId,
        custom_package: packageId,
        name,
        numberOfPeople,
        startDate,
        email,
        departureCity,
        status: "Pending",
        total_price:
          customPackage.flights.reduce((sum, f) => sum + f.price, 0) +
          customPackage.hotels.reduce((sum, h) => sum + h.price_per_night, 0) +
          customPackage.entertainments.reduce((sum, e) => sum + e.price, 0),
        flights: customPackage.flights.map(f => f._id),
        hotels: customPackage.hotels.map(h => h._id),
        entertainments: customPackage.entertainments.map(e => e._id),
      });

      await booking.save();
      console.log("✅ Custom booking saved with:", booking);

    } else {
      if (!tourPackage) {
        return res.status(404).json({ message: "Package not found" });
      }

      if (tourPackage.availability <= 0) {
        return res.status(400).json({ message: "Package is fully booked" });
      }

      booking = new Booking({
        booking_id: uuidv4(),
        user: userId,
        tour_package: packageId,
        name,
        numberOfPeople,
        startDate,
        email,
        departureCity,
        status: "Pending",
        total_price: tourPackage.price,
      });

      await booking.save();
      tourPackage.availability = tourPackage.availability - 1;
      await tourPackage.save();
    }

    res.status(201).json({ message: "Booking successful", booking });
  } catch (error) {
    console.error("Error creating booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Placeholder: Get User Bookings function (replace with your actual logic)
exports.getUserBookings = async (req, res) => {
  try {
    const bookings = await Booking.find({ user: req.user.userId })
      .populate("flights")
      .populate("hotels")
      .populate("entertainments")
      .populate("tour_package")
      .populate({
        path: "custom_package",
        populate: [
          { path: "flights" },
          { path: "hotels" },
          { path: "entertainments" },
        ],
      });
      
    // Log the first booking to check if flight_details exists
    if (bookings.length > 0) {
      console.log("Sample booking:", JSON.stringify({
        _id: bookings[0]._id,
        flight_details: bookings[0].flight_details,
        total_price: bookings[0].total_price
      }, null, 2));
    }
    
    res.status(200).json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    let booking;
    try {
      booking = await Booking.findById(bookingId)
        .populate("flights")
        .populate("hotels")
        .populate("entertainments");
      if (!booking) {
        console.log("❌ Booking not found with ID:", bookingId);
        return res.status(404).json({ message: "Booking not found" });
      }
    } catch (err) {
      console.error("❌ Error finding booking:", err);
      return res.status(500).json({ message: "Failed to fetch booking" });
    }

    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    booking.status = "Cancelled";

    const tourPackage = await TourPackage.findById(booking.tour_package);
    if (tourPackage) {
      tourPackage.availability += 1;
      await tourPackage.save();
    }

    if (booking.flights.length > 0 && booking.flight_details) {
      const seatClass = booking.flight_details.seatClass || "economy";  // fallback
      const qty = booking.flight_details.qty || 1;                      // fallback
      
      for (let flightId of booking.flights) {
        await Flight.incrementSeats(flightId, seatClass, qty);
      }
    }    

    if (booking.hotel && booking.hotel_room_details && typeof booking.hotel_room_details.numberOfRooms === "number") {
      const hotelDoc = await Hotel.findById(booking.hotel);
      if (hotelDoc) {
        const { roomType, numberOfRooms } = booking.hotel_room_details;
        const room = hotelDoc.room_types.find(r => r.type === roomType);
        if (room) {
          room.count += numberOfRooms;
        }
        hotelDoc.rooms_available += numberOfRooms;
        await hotelDoc.save();
      }
    }

    // ✅ INCREMENT HOTEL ROOMS FOR CUSTOM PACK HOTELS
    if (booking.custom_package && booking.hotels.length > 0) {
      for (let hotelId of booking.hotels) {
        if (booking.custom_hotel_details && booking.custom_hotel_details[hotelId]) {
          const { roomType, numberOfRooms } = booking.custom_hotel_details[hotelId];
          await Hotel.incrementRoomType(hotelId, roomType, numberOfRooms);
        } else {
          await Hotel.incrementRooms(hotelId, 1);  // fallback
        }
      }
    }
    
    
    
    

    // ✅ INCREMENT SEATS FOR CUSTOM PACK FLIGHTS
    if (booking.custom_package && booking.flights.length > 0) {
      for (let flightId of booking.flights) {
        if (booking.custom_flight_details && booking.custom_flight_details[flightId]) {
          const { seatClass, qty } = booking.custom_flight_details[flightId];
          await Flight.incrementSeats(flightId, seatClass, qty);
        } else {
          await Flight.incrementSeats(flightId, "economy", 1); // fallback
        }
      }
    }
       
    

    await booking.save();
    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};

exports.bookFlightDirect = async (req, res) => {
  try {
    const {
      flightId,
      name,
      email,
      passportNumber,
      nationality,
      seatPreference,
      seatClass = "economy",
      qty = 1,
    } = req.body;

    const userId = req.user.userId;

    // First, check seat availability without modifying database
    const flight = await Flight.findById(flightId);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

    // Find the specific seat type requested
    const seatTypeRequested = flight.seat_types.find(s => s.type === seatClass);
    
    // Check if seat type exists
    if (!seatTypeRequested) {
      return res.status(400).json({ 
        message: `${seatClass.charAt(0).toUpperCase() + seatClass.slice(1)} class is not available on this flight.`
      });
    }
    
    // Check if enough seats are available
    if (seatTypeRequested.count < qty) {
      return res.status(400).json({ 
        message: `Not enough ${seatClass} seats available. Only ${seatTypeRequested.count} seat(s) remaining. Please select a smaller number of seats.`
      });
    }

    // Now proceed with booking since we've verified seats are available
    await Flight.decrementSeats(flightId, seatClass, qty);

    // Apply price multiplier for business class (2.5x economy price)
    const seatMultiplier = seatClass === "business" ? 2.5 : 1;
    const totalPrice = flight.price * qty * seatMultiplier;

    const booking = new Booking({
      booking_id: uuidv4(),
      user: userId,
      flights: [flightId],
      name,
      email,
      status: "Pending",
      total_price: totalPrice,
      flightMeta: {
        airline_name: flight.airline_name,
        from: flight.from,
        to: flight.to,
        date: flight.date,
        airline_logo: flight.airline_logo,
      },
      flight_details: {
        passportNumber,
        nationality,
        seatPreference,
        seatClass,
        qty,
      },
    });

    await booking.save();
    res.status(201).json({ message: "Flight booked successfully", booking });
  } catch (error) {
    console.error("Flight booking error:", error);
    res.status(500).json({ message: "Server error. Please try again later." });
  }
};

exports.bookCustomPackageDirect = async (req, res) => {
  try {
    const { packageId, name, email, numberOfPeople, startDate, endDate, hotelSelections, flightSelections } = req.body;
    const userId = req.user.userId;

    const customPackage = await CustomPackage.findById(packageId)
      .populate("flights")
      .populate("hotels")
      .populate("entertainments");

    if (!customPackage) {
      return res.status(404).json({ message: "Custom package not found" });
    }

    // Handle Hotels Decrement
    for (const hotel of customPackage.hotels) {
      const selected = hotelSelections.find(h => h.hotelId === String(hotel._id));
      if (selected) {
        const { roomType, numberOfRooms } = selected;
        await Hotel.decrementRoomType(hotel._id, roomType, numberOfRooms);
      }
    }

    // Handle Flights Decrement
    for (const flight of customPackage.flights) {
      const selected = flightSelections.find(f => f.flightId === String(flight._id));
      if (selected) {
        const { seatClass, qty } = selected;
        await Flight.decrementSeats(flight._id, seatClass, qty);
      }
    }

    // Prepare Mappings for Hotel & Flight Details
    const hotelRoomDetailsMap = {};
    hotelSelections.forEach(h => {
      hotelRoomDetailsMap[h.hotelId] = {
        roomType: h.roomType,
        numberOfRooms: parseInt(h.numberOfRooms),
      };
    });

    const flightDetailsMap = {};
    flightSelections.forEach(f => {
      flightDetailsMap[f.flightId] = {
        seatClass: f.seatClass,
        qty: parseInt(f.qty),
      };
    });

    const booking = new Booking({
      booking_id: uuidv4(),
      user: userId,
      custom_package: packageId,
      name,
      email,
      numberOfPeople,
      startDate,
      endDate,
      status: "Pending",
      hotels: customPackage.hotels.map((h) => h._id),
      flights: customPackage.flights.map((f) => f._id),
      entertainments: customPackage.entertainments.map((e) => e._id),
      total_price: 0, // Will calculate later if needed
      // hotel_room_details: hotelRoomDetails,   // Add this
      // flight_details: flightDetails, 
    });

    await booking.save();
    res.status(201).json({ message: "Custom Package Booked Successfully!", booking });
  } catch (error) {
    console.error("Error booking custom package:", error);
    res.status(500).json({ message: error.message });
  }
};

exports.getBookingById = async (req, res) => {
  try {
    const booking = await Booking.findById(req.params.bookingId)
      .populate("flights")
      .populate("hotels")
      .populate("entertainments")
      .populate("tour_package")
      .populate({
        path: "custom_package",
        populate: [
          { path: "flights" },
          { path: "hotels" },
          { path: "entertainments" },
        ]
      });

    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    res.json(booking);
  } catch (err) {
    console.error("Error fetching booking by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// ────────────── ANALYTICS ENDPOINT ──────────────
exports.getAnalytics = async (req, res) => {
  try {
    // 1. Total sales (confirmed bookings only)
    const totalSalesAgg = await Booking.aggregate([
      { $match: { status: "Confirmed" } },
      { $group: { _id: null, total: { $sum: "$total_price" }, count: { $sum: 1 } } }
    ]);
    const totalSales = totalSalesAgg[0]?.total || 0;
    const totalBookings = totalSalesAgg[0]?.count || 0;

    // 2. Bookings by type
    const bookingsByType = await Booking.aggregate([
      { $match: { status: "Confirmed" } },
      { $facet: {
        tour: [ { $match: { tour_package: { $ne: null } } }, { $count: "count" } ],
        hotel: [ { $match: { hotel: { $ne: null } } }, { $count: "count" } ],
        flight: [ { $match: { flight: { $ne: null } } }, { $count: "count" } ],
        custom: [ { $match: { custom_package: { $ne: null } } }, { $count: "count" } ]
      }}
    ]);
    const byType = bookingsByType[0] || {};

    // 3. Most booked destinations (tour packages)
    const topDestAgg = await Booking.aggregate([
      { $match: { status: "Confirmed", tour_package: { $ne: null } } },
      { $lookup: {
        from: "tourpackages",
        localField: "tour_package",
        foreignField: "_id",
        as: "package"
      }},
      { $unwind: "$package" },
      { $group: { _id: "$package.location", count: { $sum: 1 }, revenue: { $sum: "$total_price" } } },
      { $sort: { count: -1 } },
      { $limit: 5 }
    ]);

    // 4. Active users (users with confirmed bookings in last 30 days)
    const lastMonth = new Date();
    lastMonth.setDate(lastMonth.getDate() - 30);
    const activeUsers = await Booking.distinct("user", { status: "Confirmed", createdAt: { $gte: lastMonth } });

    // 5. Monthly sales trend (last 12 months)
    const monthlyTrend = await Booking.aggregate([
      { $match: { status: "Confirmed", createdAt: { $gte: new Date(new Date().setMonth(new Date().getMonth() - 11)) } } },
      { $group: {
        _id: { year: { $year: "$createdAt" }, month: { $month: "$createdAt" } },
        total: { $sum: "$total_price" },
        count: { $sum: 1 }
      }},
      { $sort: { "_id.year": 1, "_id.month": 1 } }
    ]);

    // 6. Peak travel months (by booking count)
    const peakMonths = await Booking.aggregate([
      { $match: { status: "Confirmed" } },
      { $group: {
        _id: { month: { $month: "$startDate" } },
        count: { $sum: 1 }
      }},
      { $sort: { count: -1 } },
      { $limit: 3 }
    ]);

    // 7. Bookings by membership tier
    const bookingsByTier = await Booking.aggregate([
      { $match: { status: "Confirmed" } },
      { $lookup: {
        from: "users",
        localField: "user",
        foreignField: "_id",
        as: "user"
      }},
      { $unwind: "$user" },
      { $group: { _id: "$user.membership_tier", count: { $sum: 1 } } },
      { $sort: { count: -1 } }
    ]);

    // 8. Cancellation rate
    const totalCancelled = await Booking.countDocuments({ status: "Cancelled" });
    const cancellationRate = totalBookings > 0 ? (totalCancelled / (totalBookings + totalCancelled)) * 100 : 0;

    // 9. Average booking value
    const avgBookingValue = totalBookings > 0 ? totalSales / totalBookings : 0;

    // 10. Booking lead time (days between booking and startDate)
    const leadTimes = await Booking.aggregate([
      { $match: { status: "Confirmed", startDate: { $ne: null } } },
      { $project: {
        diffDays: { $divide: [ { $subtract: [ "$startDate", "$createdAt" ] }, 1000 * 60 * 60 * 24 ] }
      }}
    ]);
    const avgLeadTime = leadTimes.length > 0 ? (leadTimes.reduce((sum, l) => sum + l.diffDays, 0) / leadTimes.length) : 0;

    // 11. Bookings by day of week
    const bookingsByDayOfWeek = await Booking.aggregate([
      { $match: { status: "Confirmed" } },
      { $project: { dayOfWeek: { $dayOfWeek: "$createdAt" } } },
      { $group: { _id: "$dayOfWeek", count: { $sum: 1 } } },
      { $sort: { _id: 1 } }
    ]);

    // 12. Refund rate and total refunded
    const totalRefunded = await Booking.aggregate([
      { $match: { refundStatus: { $in: ["processed", "approved"] } } },
      { $group: { _id: null, total: { $sum: "$refundAmount" }, count: { $sum: 1 } } }
    ]);
    const refundRate = totalBookings > 0 ? (totalRefunded[0]?.count || 0) / totalBookings * 100 : 0;
    const totalRefundAmount = totalRefunded[0]?.total || 0;

    // 13. Average rating and review count (all types)
    const Review = require("../../Reviews/Models/Review");
    const avgRatingAgg = await Review.aggregate([
      { $group: { _id: null, avg: { $avg: "$rating" }, count: { $sum: 1 } } }
    ]);
    const avgRating = avgRatingAgg[0]?.avg || 0;
    const reviewCount = avgRatingAgg[0]?.count || 0;

    // 14. Hotel occupancy rate (average rooms booked / total rooms)
    const hotels = await Hotel.find();
    let totalRooms = 0, totalRoomsAvailable = 0;
    hotels.forEach(h => {
      const roomSum = h.room_types.reduce((sum, rt) => sum + (rt.count || 0), 0);
      totalRooms += roomSum;
      totalRoomsAvailable += h.rooms_available || 0;
    });
    const occupancyRate = totalRooms > 0 ? ((totalRooms - totalRoomsAvailable) / totalRooms) * 100 : 0;

    // 15. Flight seat utilization (average seats booked / total seats)
    const flights = await Flight.find();
    let totalSeats = 0, totalSeatsAvailable = 0;
    flights.forEach(f => {
      const seatSum = f.seat_types.reduce((sum, st) => sum + (st.count || 0), 0);
      totalSeats += f.total_seats || 0;
      totalSeatsAvailable += seatSum;
    });
    const seatUtilization = totalSeats > 0 ? ((totalSeats - totalSeatsAvailable) / totalSeats) * 100 : 0;

    res.json({
      totalSales,
      totalBookings,
      bookingsByType: {
        tour: byType.tour?.[0]?.count || 0,
        hotel: byType.hotel?.[0]?.count || 0,
        flight: byType.flight?.[0]?.count || 0,
        custom: byType.custom?.[0]?.count || 0,
      },
      topDestinations: topDestAgg,
      activeUsers: activeUsers.length,
      monthlyTrend,
      peakMonths,
      bookingsByTier,
      cancellationRate,
      avgBookingValue,
      avgLeadTime,
      bookingsByDayOfWeek,
      refundRate,
      totalRefundAmount,
      avgRating,
      reviewCount,
      occupancyRate,
      seatUtilization
    });
  } catch (err) {
    console.error("Error in getAnalytics:", err);
    res.status(500).json({ message: "Failed to fetch analytics" });
  }
};

// Get all bookings for admin with filtering
exports.getAllBookings = async (req, res) => {
  try {
    const { status, customerName, bookingId, details } = req.query;
    const query = {};

    // Status filter
    if (status) {
      query.status = status;
    }

    // Customer name filter
    if (customerName) {
      query.$or = [
        { 'user.name': { $regex: customerName, $options: 'i' } },
        { name: { $regex: customerName, $options: 'i' } }
      ];
    }

    // Booking ID filter
    if (bookingId) {
      query.booking_id = { $regex: bookingId, $options: 'i' };
    }

    // Details filter
    if (details) {
      query.$or = [
        { 'tour_package.package_title': { $regex: details, $options: 'i' } },
        { 'flightMeta.airline_name': { $regex: details, $options: 'i' } },
        { 'hotelMeta.hotel_name': { $regex: details, $options: 'i' } },
        { 'custom_package.title': { $regex: details, $options: 'i' } }
      ];
    }

    // Debug log
    console.log('Query:', JSON.stringify(query, null, 2));

    const bookings = await Booking.find(query)
      .populate('user', 'name email')
      .populate('tour_package', 'package_title')
      .populate('flight', 'airline_name')
      .populate('hotel', 'hotel_name')
      .populate('custom_package', 'title')
      .sort({ createdAt: -1 });

    // Debug log
    console.log('Found bookings:', bookings.length);

    res.json(bookings);
  } catch (error) {
    console.error('Error in getAllBookings:', error);
    res.status(500).json({ message: error.message });
  }
};

// Update booking status (admin only)
exports.updateBookingStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { status, reason } = req.body;

    console.log('updateBookingStatus called with:', {
      bookingId,
      status,
      reason,
      user: req.user
    });

    if (!["Pending", "Confirmed", "Cancelled"].includes(status)) {
      console.log('Invalid status provided:', status);
      return res.status(400).json({ message: "Invalid status" });
    }

    console.log('Finding booking with ID:', bookingId);
    const booking = await Booking.findById(bookingId)
      .populate("flights")
      .populate("hotels")
      .populate("tour_package");

    if (!booking) {
      console.log('Booking not found with ID:', bookingId);
      return res.status(404).json({ message: "Booking not found" });
    }

    console.log('Found booking:', {
      id: booking._id,
      currentStatus: booking.status,
      newStatus: status,
      hasTourPackage: !!booking.tour_package,
      hasFlights: booking.flights?.length > 0,
      hasHotels: booking.hotels?.length > 0
    });

    const oldStatus = booking.status;
    booking.status = status;

    // Handle status change logic
    if (oldStatus === "Confirmed" && status === "Cancelled") {
      console.log('Handling cancellation of confirmed booking');
      
      if (booking.tour_package) {
        console.log('Updating tour package availability');
        booking.tour_package.availability += 1;
        await booking.tour_package.save();
      }
      
      if (booking.flights?.length > 0) {
        console.log('Restoring flight seats');
        for (const flight of booking.flights) {
          await Flight.incrementSeats(flight._id);
        }
      }

      if (booking.hotels?.length > 0) {
        console.log('Restoring hotel rooms');
        for (const hotel of booking.hotels) {
          await Hotel.incrementRooms(hotel._id);
        }
      }

      if (reason) {
        console.log('Adding cancellation reason:', reason);
        booking.cancellationReason = reason;
      }
    }

    console.log('Saving updated booking');
    await booking.save();
    
    console.log('Booking status updated successfully');
    res.status(200).json({ 
      message: "Booking status updated successfully", 
      booking: {
        _id: booking._id,
        status: booking.status,
        cancellationReason: booking.cancellationReason
      }
    });
  } catch (error) {
    console.error("Error updating booking status:", error);
    console.error("Error stack:", error.stack);
    res.status(500).json({ 
      message: "Server error",
      error: error.message 
    });
  }
};

// Admin: Update refund status and amount
exports.updateRefundStatus = async (req, res) => {
  try {
    const { bookingId } = req.params;
    const { refundStatus, refundAmount } = req.body;

    if (!['none', 'requested', 'approved', 'rejected', 'processed'].includes(refundStatus)) {
      return res.status(400).json({ message: 'Invalid refund status' });
    }

    const booking = await Booking.findById(bookingId);
    if (!booking) {
      return res.status(404).json({ message: 'Booking not found' });
    }

    booking.refundStatus = refundStatus;
    if (refundAmount !== undefined) {
      booking.refundAmount = refundAmount;
    }
    if (refundStatus === 'processed') {
      booking.refundedAt = new Date();
    }
    await booking.save();
    console.log('[ADMIN REFUND UPDATE] Booking', booking._id, 'refundStatus:', booking.refundStatus, 'refundAmount:', booking.refundAmount);

    res.json({ message: 'Refund status updated', booking });
  } catch (error) {
    console.error('Error updating refund status:', error);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  createBooking: exports.createBooking,
  getUserBookings: exports.getUserBookings,
  cancelBooking: exports.cancelBooking,
  bookFlightDirect: exports.bookFlightDirect,
  bookCustomPackageDirect: exports.bookCustomPackageDirect,
  getBookingById: exports.getBookingById,
  getAnalytics: exports.getAnalytics,
  getAllBookings: exports.getAllBookings,
  updateBookingStatus: exports.updateBookingStatus,
  updateRefundStatus: exports.updateRefundStatus
};
