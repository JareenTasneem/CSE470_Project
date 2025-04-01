// backend/Areas/Bookings/Controllers/booking.controller.js
const { v4: uuidv4 } = require("uuid");  // Import uuid for generating unique IDs
const Flight = require("../../Flights/Models/Flight");
const Hotel = require("../../Hotels/Models/Hotel");
const Entertainment = require("../../Entertainments/Models/Entertainment");
const Booking = require("../Models/Booking");
console.log("DEBUG: Booking import is:", Booking);
const CustomPackage = require("../../CustomPackages/Models/CustomPackage");

const TourPackage = require("../../TourPackages/Models/TourPackage");

// Create a new booking
exports.createBooking = async (req, res) => {
  try {
    // Remove userId from req.body and get it from the token
    const { packageId, name, numberOfPeople, startDate, email, departureCity } = req.body;
    const userId = req.user.userId; // or req.user._id if that's how you set it in your JWT

    // Find the tour package by its ID
    const tourPackage = await TourPackage.findById(packageId);
    let booking;
    const customPackage = await CustomPackage.findById(packageId)
      .populate("flights")
      .populate("hotels")
      .populate("entertainments");

    if (customPackage) {
      // 🔁 BOOK CUSTOM PACKAGE (CURRENT CODE)
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
        status: "Confirmed",
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
      // 🧭 FALLBACK TO TOUR PACKAGE BOOKING
      const tourPackage = await TourPackage.findById(packageId);
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
        status: "Confirmed",
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

// Get bookings for the logged-in user
exports.getUserBookings = async (req, res) => {
  try {
    // req.user should be set by the auth middleware
    const userId = req.user.userId;
    // Populate tour_package field to include package details
    const bookings = await Booking.find({ user: userId })
      .populate({
        path: "custom_package",
        populate: ["flights", "hotels", "entertainments"]
      })
      .populate("tour_package")
      .populate("flights")
      .populate("hotels")
      .populate("entertainments");

    
    console.log("Bookings:", JSON.stringify(bookings[0], null, 2));
    res.json(bookings);
  } catch (error) {
    console.error("Error fetching user bookings:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Cancel a booking and update tour package availability
exports.cancelBooking = async (req, res) => {
  try {
    const bookingId = req.params.bookingId;
    const booking = await Booking.findById(bookingId);
    
    if (!booking) {
      return res.status(404).json({ message: "Booking not found" });
    }
    
    // Check if booking is already cancelled
    if (booking.status === "Cancelled") {
      return res.status(400).json({ message: "Booking is already cancelled" });
    }

    // Update booking status to 'Cancelled'
    booking.status = "Cancelled";

    // Increment the tour package's availability by 1
    const tourPackage = await TourPackage.findById(booking.tour_package);
    if (tourPackage) {
      tourPackage.availability = tourPackage.availability + 1;
      await tourPackage.save();
    }

    for (let flightId of booking.flights) {
      await Flight.incrementSeats(flightId, 1); // Restore 1 seat for each flight
      await booking.flights.save();
    }

    // Restore availability of hotels
    for (let hotelId of booking.hotels) {
      await Hotel.incrementRooms(hotelId, 1); // Restore 1 room for each hotel
      await booking.hotels.save();
    }

    // Mark entertainments as available again (reset booked status)
    for (let entertainmentId of booking.entertainments) {
      await Entertainment.markAsAvailable(entertainmentId); // Mark entertainment as available again
    }

    await booking.save();

    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};
