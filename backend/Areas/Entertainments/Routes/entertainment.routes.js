// backend/Areas/Entertainments/Routes/entertainment.routes.js
const express = require("express");
const router = express.Router();
const Entertainment = require("../Models/Entertainment");

// GET all entertainments
router.get("/", async (req, res) => {
  try {
    const ents = await Entertainment.find();
    res.json(ents);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET a single entertainment by ID
router.get("/:id", async (req, res) => {
  try {
    const ent = await Entertainment.findById(req.params.id);
    if (!ent) return res.status(404).json({ error: "Entertainment not found" });
    res.json(ent);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// PUT route to book entertainment
router.put("/bookEntertainment/:entertainmentId", async (req, res) => {
  try {
    const entertainment = await Entertainment.findById(req.params.entertainmentId);
    if (!entertainment) return res.status(404).json({ message: "Entertainment not found" });

    entertainment.booked = true; // Assuming a "booked" field that marks the entertainment as booked
    await entertainment.save();
    res.status(200).json({ message: "Entertainment booked successfully!" });
  } catch (err) {
    res.status(500).json({ message: "Error booking entertainment.", error: err });
  }
});

module.exports = router;
