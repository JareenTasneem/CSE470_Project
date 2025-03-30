// backend/Areas/Bookings/Routes/booking.routes.js
const express = require("express");
const router = express.Router();
const { createBooking } = require("../Controllers/booking.controller");
const auth = require("../../../middlewares/auth");

const { v4: uuidv4 } = require('uuid');

const Flight = require('../../Flights/Models/Flight');

const Hotel = require('../../Hotels/Models/Hotel');

const Entertainment = require('../../Entertainments/Models/Entertainment');
const TourPackage = require("../../TourPackages/Models/TourPackage");
const CustomPackage = require("../../CustomPackages/Models/CustomPackage");
const Booking = require("../../Bookings/Models/Booking");


// This route is protected and requires a valid token
router.post("/", auth, createBooking);

const { getUserBookings } = require("../Controllers/booking.controller");

router.get("/user", auth, getUserBookings);

const { cancelBooking } = require("../Controllers/booking.controller");
router.delete("/:bookingId", auth, cancelBooking);

// Booking flight
router.post('/bookFlight', async (req, res) => {
  try {
    const { flightId } = req.body;
    const updatedFlight = await Flight.decrementSeats(flightId); // Call the decrement function
    res.status(200).json(updatedFlight);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});
  
  // Booking hotel
router.post('/bookHotel', async (req, res) => {
  try {
    const { hotelId } = req.body;
    const updatedHotel = await Hotel.decrementRooms(hotelId); // Call the decrement function
    res.status(200).json(updatedHotel);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Booking an entertainment
router.post('/bookEntertainment', async (req, res) => {
  try {
    const { entertainmentId } = req.body;
    await Entertainment.bookEntertainment(entertainmentId); // Mark as booked
    res.status(200).json({ message: "Entertainment booked successfully" });
  } catch (error) {
    res.status(500).json({ message: `Error booking entertainment: ${error.message}` });
  }
});

router.post('/bookPackage', auth, async (req, res) => {
  try {
    const { packageId } = req.body; // PackageId for the custom package
    const userId = req.user.userId;

    // Find the custom package by ID
    const customPackage = await CustomPackage.findById(packageId)
      .populate('flights hotels entertainments'); // This will load flights, hotels, entertainments

    if (!customPackage) {
      return res.status(404).json({ message: "Custom package not found" });
    }

    // Book each flight individually
    for (let flight of customPackage.flights) {
      if (flight.seats_available > 0) {
        await Flight.decrementSeats(flight._id); // Decrease available seats
      } else {
        return res.status(400).json({ message: `No seats available for flight ${flight.airline_name}` });
      }
    }

    // Book each hotel individually
    for (let hotel of customPackage.hotels) {
      if (hotel.rooms_available > 0) {
        await Hotel.decrementRooms(hotel._id); // Decrease available rooms
      } else {
        return res.status(400).json({ message: `No rooms available for hotel ${hotel.hotel_name}` });
      }
    }

    // Book each entertainment individually
    for (let entertainment of customPackage.entertainments) {
      try {
        await Entertainment.bookEntertainment(entertainment._id); // Mark entertainment as booked
      } catch (error) {
        return res.status(400).json({ message: `Error booking entertainment ${entertainment.entertainmentName}: ${error.message}` });
      }
    }

    // Create a booking for the user
    const booking = new Booking({
      booking_id: uuidv4(), // Generate a unique booking ID
      user: userId,
      custom_package: packageId,
      status: "Confirmed",
      total_price: customPackage.total_price, // Sum the prices for a total
    });

    await booking.save();

    res.status(201).json({ message: "Package and items booked successfully", booking });
  } catch (error) {
    console.error("Booking package failed:", error);
    res.status(500).json({ message: "Failed to book the package" });
  }
});

module.exports = router;
