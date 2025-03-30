// backend/Areas/Flights/Routes/flight.routes.js
const express = require("express");
const router = express.Router();
const Flight = require("../Models/Flight");

// GET all flights
router.get("/", async (req, res) => {
  try {
    const flights = await Flight.find();
    res.json(flights);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single flight by ID
router.get("/:id", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ error: "Flight not found" });
    res.json(flight);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT route to book a flight and reduce seat availability by 1
router.put("/bookFlight/:flightId", async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.flightId);
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    if (flight.seats_available > 0) {
      flight.seats_available -= 1; // Decrease seat availability
      await flight.save();
      res.status(200).json({ message: "Flight booked successfully!" });
    } else {
      res.status(400).json({ message: "No seats available!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error booking flight.", error: err });
  }
});

module.exports = router;
