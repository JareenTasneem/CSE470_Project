const express = require("express");
const router = express.Router();
const auth = require("../../../middlewares/auth");
const { v4: uuidv4 } = require("uuid");

// Models (quick helpers)
const Flight = require("../../Flights/Models/Flight");
const Hotel = require("../../Hotels/Models/Hotel");
const Entertainment = require("../../Entertainments/Models/Entertainment");
const TourPackage = require("../../TourPackages/Models/TourPackage");
const CustomPackage = require("../../CustomPackages/Models/CustomPackage");
const Booking = require("../../Bookings/Models/Booking");

// Controllers
const {
  createBooking,
  getUserBookings,
  cancelBooking,
  bookFlightDirect,
} = require("../Controllers/booking.controller");

/* ─────────────────── ROUTES ─────────────────── */

// 1️⃣ Create booking (hotel / package / custom)
router.post("/", auth, createBooking);

// 2️⃣ Direct flight booking
router.post("/flight", auth, bookFlightDirect);

// 3️⃣ Get bookings for logged‑in user
router.get("/user", auth, getUserBookings);

// 4️⃣ Cancel booking
router.delete("/:bookingId", auth, cancelBooking);

// 5️⃣ Quick seat/room helpers (unchanged)
router.post("/bookFlight", async (req, res) => {
  try {
    const { flightId } = req.body;
    const updated = await Flight.decrementSeats(flightId, "economy", 1);
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/bookHotel", async (req, res) => {
  try {
    const { hotelId } = req.body;
    const updated = await Hotel.decrementRooms(hotelId);
    res.status(200).json(updated);
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
});

router.post("/bookEntertainment", async (req, res) => {
  try {
    const { entertainmentId } = req.body;
    await Entertainment.bookEntertainment(entertainmentId);
    res.status(200).json({ message: "Entertainment booked successfully" });
  } catch (e) {
    res.status(500).json({ message: `Error booking entertainment: ${e.message}` });
  }
});

// 6️⃣ Book full custom package (unchanged)
router.post("/bookPackage", auth, async (req, res) => {
  /* … existing custom‑package logic … */
});

module.exports = router;   // ✅ export the router, not the controller functions
