// backend/Areas/Bookings/Controllers/booking.controller.js
const { v4: uuidv4 } = require("uuid");
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

exports.getUserBookings = async (req, res) => {
  try {
    const userId = req.user.userId;
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

    for (let flightId of booking.flights) {
      await Flight.incrementSeats(flightId, 1);
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

    for (let entertainmentId of booking.entertainments) {
      await Entertainment.markAsAvailable(entertainmentId);
    }

    // ✅ INCREMENT HOTEL ROOMS FOR CUSTOM PACK HOTELS
    if (booking.custom_package && booking.hotels.length > 0) {
      for (let hotelId of booking.hotels) {
        const hotelDoc = await Hotel.findById(hotelId);
        if (hotelDoc) {
          hotelDoc.rooms_available += 1;
          const defaultRoom = hotelDoc.room_types?.[0];
          if (defaultRoom) {
            defaultRoom.count += 1;
          }
          await hotelDoc.save();
        }
      }
    }

    // ✅ INCREMENT SEATS FOR CUSTOM PACK FLIGHTS
    if (booking.custom_package && booking.flights.length > 0) {
      for (let flightId of booking.flights) {
        await Flight.incrementSeats(flightId, 1);
      }
    }

    await booking.save();
    res.json({ message: "Booking cancelled successfully", booking });
  } catch (error) {
    console.error("Error cancelling booking:", error);
    res.status(500).json({ message: "Server error" });
  }
};