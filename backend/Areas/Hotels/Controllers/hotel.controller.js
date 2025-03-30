// src/Areas/Hotels/Controllers/hotel.controller.js
const Hotel = require("../Models/Hotel"); // Adjust the path if needed

// Book a hotel and reduce room availability by 1
const bookHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) {
      return res.status(404).json({ message: "Hotel not found" });
    }

    if (hotel.rooms_available > 0) {
      hotel.rooms_available -= 1; // Decrease room availability
      await hotel.save();
      res.status(200).json({ message: "Hotel booked successfully!" });
    } else {
      res.status(400).json({ message: "No rooms available!" });
    }
  } catch (err) {
    res.status(500).json({ message: "Error booking hotel.", error: err });
  }
};

module.exports = { bookHotel };
