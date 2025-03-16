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

module.exports = router;
