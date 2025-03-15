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

module.exports = router;
