const express = require("express");
const router = express.Router();

const auth = require("../../../middlewares/auth");

// Import controller functions
const {
  getAllPackages,
  getPackageById,
  getPersonalizedRecommendations,
} = require("../Controllers/TourPackageController");

// GET all packages
router.get("/", getAllPackages);

// GET single package by ID
router.get("/:id", getPackageById);

// GET personalized recommendations
router.get("/personalized", auth, getPersonalizedRecommendations);

router.get("/protected", auth, (req, res) => {
  // Only accessible if the token is valid
  res.json({ message: "This is a protected route", user: req.user });
});

module.exports = router;
