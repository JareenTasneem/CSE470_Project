const express = require("express");
const router = express.Router();
const loyaltyController = require("../Controllers/loyalty.controller");
const auth = require("../../../middlewares/auth");

// Get user's loyalty status
router.get("/status", auth, async (req, res) => {
  try {
    const status = await loyaltyController.getLoyaltyStatus(req.user.userId);
    res.json(status);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Get user's loyalty history
router.get("/history", auth, async (req, res) => {
  try {
    const history = await loyaltyController.getLoyaltyHistory(req.user.userId);
    res.json(history);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

// Redeem points
router.post("/redeem", auth, async (req, res) => {
  try {
    const { points, description } = req.body;
    if (!points || !description) {
      return res.status(400).json({ message: "Points and description are required" });
    }

    const transaction = await loyaltyController.redeemPoints(
      req.user.userId,
      points,
      description
    );
    res.json(transaction);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router; 