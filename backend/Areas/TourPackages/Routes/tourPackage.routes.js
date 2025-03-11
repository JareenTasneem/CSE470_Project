// backend/Areas/TourPackages/Routes/tourPackage.routes.js
const express = require("express");
const router = express.Router();
const TourPackage = require("../Models/TourPackage");

// GET all packages
router.get("/", async (req, res) => {
  try {
    const packages = await TourPackage.find();
    res.json(packages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

// GET single package by ID
router.get("/:id", async (req, res) => {
  try {
    const singlePackage = await TourPackage.findById(req.params.id);
    if (!singlePackage) {
      return res.status(404).json({ error: "Package not found" });
    }
    res.json(singlePackage);
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Server error" });
  }
});

module.exports = router;
