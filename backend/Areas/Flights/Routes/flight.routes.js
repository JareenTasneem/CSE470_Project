const express = require("express");
const router = express.Router();
const flightController = require("../Controllers/flight.controller");

// Compare route FIRST
router.get("/compare", flightController.compareFlights);

// Optional legacy route
router.get("/getById/:flightId", flightController.getFlightById);

// Get all flights
router.get("/", flightController.getAllFlights);

// Single flight by ID (keep after '/')
router.get("/:id", flightController.getFlightById);

// Book Flight
router.put("/bookFlight/:flightId", flightController.bookFlight);

module.exports = router;
