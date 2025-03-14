// ./Areas/Users/Routes/user.routes.js
const express = require("express");
const router = express.Router();
const { registerUser, loginUser } = require("../Controllers/user.controller");

// @route   POST /api/users/register
router.post("/register", registerUser);

// @route   POST /api/users/login
router.post("/login", loginUser);

module.exports = router;
