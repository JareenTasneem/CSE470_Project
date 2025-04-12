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

    // for (let entertainmentId of booking.entertainments) {
    //   await Entertainment.markAsAvailable(entertainmentId);
    // }

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
      status: "Confirmed",
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



module.exports = {
  createBooking: exports.createBooking,
  getUserBookings: exports.getUserBookings,
  cancelBooking: exports.cancelBooking,
  bookFlightDirect: exports.bookFlightDirect,
  bookCustomPackageDirect: exports.bookCustomPackageDirect,
};
