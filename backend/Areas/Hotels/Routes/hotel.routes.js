const express = require("express");
const router = express.Router();
const hotelController = require("../Controllers/hotel.controller");
const Hotel = require("../Models/Hotel");

// Compare route first
router.get("/compare", hotelController.compareHotels);

// GET all hotels
router.get("/", async (req, res) => {
  try {
    const hotels = await Hotel.find();
    res.json(hotels);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single hotel by ID
router.get("/:id", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.id);
    if (!hotel) {
      return res.status(404).json({ error: "Hotel not found" });
    }
    res.json(hotel);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// Book hotel
router.put("/bookHotel/:hotelId", async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }
    if (hotel.rooms_available > 0) {
      hotel.rooms_available -= 1;
      await hotel.save();
      res.status(200).json({ message: "Hotel booked successfully!" });
    } else {
      res.status(400).json({ message: "No rooms available!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error booking hotel.", error: err });
  }
});

module.exports = router;
