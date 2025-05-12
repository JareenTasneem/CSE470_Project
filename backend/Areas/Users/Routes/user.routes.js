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

module.exports = router;
