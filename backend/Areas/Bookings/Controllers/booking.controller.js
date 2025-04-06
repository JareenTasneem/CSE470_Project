// backend/Areas/Bookings/Controllers/booking.controller.js
const { v4: uuidv4 } = require("uuid");
const Flight = require("../../Flights/Models/Flight");
const Hotel = require("../../Hotels/Models/Hotel");
const Entertainment = require("../../Entertainments/Models/Entertainment");
const Booking = require("../Models/Booking");
const CustomPackage = require("../../CustomPackages/Models/CustomPackage");
const TourPackage = require("../../TourPackages/Models/TourPackage");

// Placeholder: Create Booking function (replace with your actual logic)
exports.createBooking = async (req, res) => {
  try {
    // Example placeholder implementation
    const newBooking = new Booking({
      booking_id: uuidv4(),
      user: req.user.userId,
      status: "Confirmed",
      total_price: 0, // Adjust as per your business logic
    });
    await newBooking.save();
    res.status(201).json({ message: "Booking created successfully", booking: newBooking });
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
      .populate("custom_package");
      
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
    const booking = await Booking.findById(req.params.bookingId)
      .populate("flights")
      .populate("hotels")
      .populate("entertainments");

    if (!booking) return res.status(404).json({ message: "Booking not found" });
    if (booking.status === "Cancelled")
      return res.status(400).json({ message: "Booking is already cancelled" });

    booking.status = "Cancelled";

    // Restore tour‑package availability
    const tourPackage = await TourPackage.findById(booking.tour_package);
    if (tourPackage) {
      tourPackage.availability += 1;
      await tourPackage.save();
    }

    // Restore flight seats if this booking has flight_details
    let restoredSeats = 0;
    if (booking.flights.length && booking.flight_details) {
      const { seatClass = "economy", qty = 1 } = booking.flight_details;
      for (let flightId of booking.flights) {
        await Flight.incrementSeats(flightId, seatClass, qty);
        restoredSeats += qty;
      }
    }

    // Restore hotel rooms
    if (
      booking.hotel &&
      booking.hotel_room_details &&
      typeof booking.hotel_room_details.numberOfRooms === "number"
    ) {
      const hotelDoc = await Hotel.findById(booking.hotel);
      if (hotelDoc) {
        const { roomType, numberOfRooms } = booking.hotel_room_details;
        const room = hotelDoc.room_types.find((r) => r.type === roomType);
        if (room) room.count += numberOfRooms;
        hotelDoc.rooms_available += numberOfRooms;
        await hotelDoc.save();
      }
    }

    // Restore entertainments
    for (let entertainmentId of booking.entertainments) {
      await Entertainment.markAsAvailable(entertainmentId);
    }

    await booking.save();
    res.json({ 
      message: `Booking cancelled successfully. ${restoredSeats > 0 ? 
        `${restoredSeats} ${booking.flight_details.seatClass} seat(s) restored.` : 
        ''}`, 
      booking 
    });
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
      status: "Confirmed",
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

module.exports = {
  createBooking: exports.createBooking,
  getUserBookings: exports.getUserBookings,
  cancelBooking: exports.cancelBooking,
  bookFlightDirect: exports.bookFlightDirect,
};
