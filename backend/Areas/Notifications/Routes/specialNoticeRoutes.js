const express = require("express");
const router = express.Router();
const SpecialNotice = require("../Models/SpecialNotice");
const { isAdmin } = require("../../../middlewares/adminAuth");

// Create a new notice (admin only)
router.post("/", isAdmin, async (req, res) => {
  const { message, targetUsers } = req.body;
  if (!message) return res.status(400).json({ message: "Message required" });
  const notice = new SpecialNotice({
    message,
    createdBy: req.user.userId,
    targetUsers: targetUsers || []
  });
  await notice.save();
  res.json(notice);
});

// Get notices for a specific user (or all)
router.get("/for/:userId", async (req, res) => {
  const userId = req.params.userId;
  const notices = await SpecialNotice.find({
    $or: [
      { targetUsers: { $size: 0 } }, // for all users
      { targetUsers: userId }        // or specifically for this user
    ]
  }).sort({ createdAt: -1 });
  res.json(notices);
});

// Delete a notice (admin only)
router.delete("/:id", isAdmin, async (req, res) => {
  const { id } = req.params;
  const notice = await SpecialNotice.findById(id);
  if (!notice) return res.status(404).json({ message: "Notice not found" });
  await notice.deleteOne();
  res.json({ message: "Notice deleted" });
});

// Get all notices (admin only)
router.get("/all", isAdmin, async (req, res) => {
  const notices = await SpecialNotice.find().sort({ createdAt: -1 });
  res.json(notices);
});

module.exports = router; 