const express = require("express");
const router = express.Router();
const flightController = require("../Controllers/flight.controller");

//  GET all flights
router.get("/", flightController.getAllFlights);

//  GET flight by MongoDB ID
router.get("/:id", flightController.getFlightById);

// Optional legacy route (can remove if not used)
router.get("/getById/:flightId", flightController.getFlightById);

// PUT to book a flight
router.put("/bookFlight/:flightId", flightController.bookFlight);

module.exports = router;
