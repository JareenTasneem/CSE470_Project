const TourPackage = require("../Models/TourPackage");

// Get all tour packages
exports.getAllPackages = async (req, res) => {
  try {
    const packages = await TourPackage.find();
    res.json(packages);
  } catch (err) {
    console.error("Error fetching tour packages:", err);
    res.status(500).json({ error: "Server error" });
  }
};

// Get a single tour package by ID
exports.getPackageById = async (req, res) => {
  try {
    const singlePackage = await TourPackage.findById(req.params.id);
    if (!singlePackage) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json(singlePackage);
  } catch (err) {
    console.error("Error fetching tour package by ID:", err);
    res.status(500).json({ error: "Server error" });
  }
};
