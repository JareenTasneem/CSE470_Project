// src/Areas/Flights/Controllers/flight.controller.js
const Flight = require("../Models/Flight"); // Adjust the path if needed

// Book a flight and reduce availability by 1
const bookFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.flightId);
    if (!flight) {
      return res.status(404).json({ message: "Flight not found" });
    }

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
};

module.exports = { bookFlight };
