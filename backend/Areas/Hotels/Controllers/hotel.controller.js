const Hotel = require("../Models/Hotel");

// Helper function to escape user input for use in a regex
const escapeRegex = (text) => {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
};

// PUT: Book a hotel by decrementing available rooms
const bookHotel = async (req, res) => {
  try {
    const hotel = await Hotel.findById(req.params.hotelId);
    if (!hotel) return res.status(404).json({ message: "Hotel not found" });

    if (hotel.rooms_available > 0) {
      hotel.rooms_available -= 1;
      await hotel.save();
      res.status(200).json({ message: "Hotel booked successfully!" });
    } else {
      res.status(400).json({ message: "No rooms available!" });
    }
  } catch (err) {
    console.error("Error booking hotel:", err);
    res.status(500).json({ message: "Error booking hotel.", error: err });
  }
};

// GET: Compare hotels by location (query parameter "location")
const compareHotels = async (req, res) => {
  try {
    console.log("compareHotels req.query:", req.query);
    const { location } = req.query;
    if (!location) {
      return res.status(400).json({ message: "Please provide a location query parameter" });
    }
    const safeLocation = escapeRegex(location);
    const regex = new RegExp(safeLocation, "i");
    console.log("compareHotels using regex:", regex);
    const hotels = await Hotel.find({ location: { $regex: regex } });
    console.log("compareHotels found", hotels.length, "hotels");
    res.status(200).json(hotels);
  } catch (err) {
    console.error("Error comparing hotels:", err);
    res.status(500).json({ message: "Error comparing hotels", error: err.message });
  }
};

module.exports = {
  bookHotel,
  compareHotels,
};
