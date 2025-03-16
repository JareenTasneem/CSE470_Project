// backend/Areas/Hotels/Routes/hotel.routes.js

const express = require("express");
const router = express.Router();
const Hotel = require("../Models/Hotel");

// GET all hotels
router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

module.exports = router;
