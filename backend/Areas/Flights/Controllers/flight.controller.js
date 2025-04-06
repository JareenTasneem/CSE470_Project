// backend/Areas/Flights/Controllers/flight.controller.js

const Flight = require("../Models/Flight");

// GET a single flight by ID (based on MongoDB _id)
const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id); // make sure your route matches this
    if (!flight) return res.status(404).json({ message: "Flight not found" });
    res.json(flight);
  } catch (err) {
    console.error("Error fetching flight:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// GET all flights
const getAllFlights = async (req, res) => {
  try {
    const flights = await Flight.find();
    res.status(200).json(flights);
  } catch (err) {
    res.status(500).json({ message: "Error fetching flights", error: err });
  }
};

// PUT to book a flight (decrement seat count)
const bookFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    if (flight.seats_available > 0) {
      flight.seats_available -= 1;
      await flight.save();
      res.status(200).json({ message: "Flight booked successfully!" });
    } else {
      res.status(400).json({ message: "No seats available!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error booking flight.", error: err });
  }
};

module.exports = {
  getAllFlights,
  getFlightById,
  bookFlight,
};
