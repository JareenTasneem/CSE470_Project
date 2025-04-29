// src/Areas/Entertainments/Controllers/entertainment.controller.js
const Entertainment = require("../Models/Entertainment"); // Adjust the path if needed

// Book an entertainment
const bookEntertainment = async (req, res) => {
  try {
    const entertainment = await Entertainment.findById(req.params.entertainmentId);
    if (!entertainment) {
      return res.status(404).json({ message: "Entertainment not found" });
    }

    entertainment.booked = true; // Assuming there's a "booked" field
    await entertainment.save();
    res.status(200).json({ message: "Entertainment booked successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error booking entertainment.", error: err });
  }
};

module.exports = { bookEntertainment };
