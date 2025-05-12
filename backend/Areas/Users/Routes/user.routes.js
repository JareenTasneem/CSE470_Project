// // ./Areas/Users/Routes/user.routes.js
// const express = require("express");
// const router = express.Router();
// const { registerUser, loginUser } = require("../Controllers/user.controller");

// // @route   POST /api/users/register
// router.post("/register", registerUser);

// // @route   POST /api/users/login
// router.post("/login", loginUser);

// module.exports = router;
const express = require("express");
const router = express.Router();
const userController = require("../Controllers/user.controller");
const auth = require("../../../middlewares/auth"); // Authentication middleware - path adjusted
const User = require("../Models/User");
const { isAdmin } = require("../../../middlewares/adminAuth");

// Public routes
router.post("/register", userController.registerUser);
router.post("/login", userController.loginUser);

// Protected routes - Done by Ritu
router.get("/profile", auth, userController.getUserProfile);
router.put("/profile", auth, userController.updateUserProfile);
router.post("/profile/photo", auth, userController.uploadProfilePhoto);
router.delete("/profile/photo", auth, userController.deleteProfilePhoto);

// Add a public route to get all users
router.get('/', userController.getAllUsers);

// Search users by name or email (case-insensitive)
router.get("/search", async (req, res) => {
  const { q } = req.query;
  if (!q) return res.status(400).json({ message: "Query required" });

  try {
    const users = await User.find({
      $or: [
        { name: { $regex: q, $options: "i" } },
        { email: { $regex: q, $options: "i" } }
      ]
    }).select("name email");
    res.json(users);
  } catch (err) {
    res.status(500).json({ message: "Search failed", error: err.message });
  }
});

// Admin user management routes
router.get('/admin/all', isAdmin, userController.getAllUsersAdmin);
router.get('/admin/:id', isAdmin, userController.getUserByIdAdmin);
router.put('/admin/:id', isAdmin, userController.updateUserAdmin);
router.put('/admin/:id/ban', isAdmin, userController.banUserAdmin);
router.delete('/admin/:id', isAdmin, userController.deleteUserAdmin);

module.exports = router;
