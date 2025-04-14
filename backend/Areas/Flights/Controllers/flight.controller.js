const Flight = require("../Models/Flight");

// Helper function to escape user input for use in a regex
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// GET a single flight by ID
const getFlightById = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.id);
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

// PUT: Book a flight by decrementing available seats
const bookFlight = async (req, res) => {
  try {
    const flight = await Flight.findById(req.params.flightId);
    if (!flight) return res.status(404).json({ message: "Flight not found" });

    if (flight.seats_available > 0) {
      flight.seats_available -= 1;
      await flight.save();
      res.status(200).json({ message: "Flight booked successfully!" });
    } else {
      res.status(400).json({ message: "No seats available!" });
    }
  } catch (err) {
    console.error("Error booking flight:", err);
    res.status(500).json({ message: "Error booking flight.", error: err });
  }
};

// GET: Compare flights by destination (query parameter "destination")
const compareFlights = async (req, res) => {
  try {
    console.log("compareFlights req.query:", req.query);
    const { destination } = req.query;
    if (!destination) {
      return res.status(400).json({ message: "Please provide a destination query parameter" });
    }
    const safeDestination = escapeRegex(destination);
    const regex = new RegExp(safeDestination, "i");
    console.log("compareFlights using regex:", regex);
    const flights = await Flight.find({ to: { $regex: regex } });
    console.log("compareFlights found", flights.length, "flights");
    res.status(200).json(flights);
  } catch (err) {
    console.error("Error comparing flights:", err);
    res.status(500).json({ message: "Error comparing flights", error: err.message });
  }
};

module.exports = {
  getFlightById,
  getAllFlights,
  bookFlight,
  compareFlights,
};
