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

    if (!tourPackage) {
      const customPackage = await CustomPackage.findById(packageId)
        .populate('flights hotels entertainments'); // Populate flights, hotels, and entertainments

      if (!customPackage) {
        return res.status(404).json({ message: "Package not found" });
      }

      // Check availability for flights, hotels, and entertainments
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

      // Proceed with booking flights, hotels, and entertainments
      for (let flight of customPackage.flights) {
        await Flight.decrementSeats(flight._id); // Decrease seat availability by 1
      }

      for (let hotel of customPackage.hotels) {
        await Hotel.decrementRooms(hotel._id); // Decrease room availability by 1
      }

      for (let entertainment of customPackage.entertainments) {
        await Entertainment.bookEntertainment(entertainment._id); // Mark entertainment as booked
      }

      booking = new Booking({
        booking_id: uuidv4(), // Generate unique booking ID
        user: userId,
        custom_package: packageId,
        name,
        numberOfPeople,
        startDate,
        email,
        departureCity,
        status: "Confirmed",
        total_price: customPackage.flights.reduce((sum, f) => sum + f.price, 0) +
                     customPackage.hotels.reduce((sum, h) => sum + h.price_per_night, 0) +
                     customPackage.entertainments.reduce((sum, e) => sum + e.price, 0),
        flights: customPackage.flights.map(f => f._id), // Store flight references
        hotels: customPackage.hotels.map(h => h._id), // Store hotel references
        entertainments: customPackage.entertainments.map(e => e._id), // Store entertainment references
      });

    }else{
    
    // Check if there is availability
      if (tourPackage.availability <= 0) {
        return res.status(400).json({ message: "Package is fully booked" });
      }
      
      // Create a new booking document with a unique booking_id
      booking = new Booking({
        booking_id: uuidv4(), // Generate a unique booking id
        user: userId,  // now coming from the token
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
    
      // Decrement package availability by 1
      tourPackage.availability = tourPackage.availability - 1;
      await tourPackage.save();
    }

    await booking.save();    

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
    const bookings = await Booking.find({ user: userId }).populate("tour_package");
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
