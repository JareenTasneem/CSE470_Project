const express = require("express");
const router = express.Router();

// Import controller functions
const {
  getAllPackages,
  getPackageById,
} = require("../Controllers/TourPackageController");

// GET all packages
router.get("/", getAllPackages);

// GET single package by ID
router.get("/:id", getPackageById);

module.exports = router;
