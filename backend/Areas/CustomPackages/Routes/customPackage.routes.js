// backend/Areas/CustomPackages/Routes/customPackage.routes.js
console.log("[DEBUG] Loading customPackage.routes.js...");

const express = require("express");
const router = express.Router();
const {
  createCustomPackage,
  getCustomPackagesByUser,
  deleteCustomPackage  // <-- Add this
} = require("../Controllers/customPackage.controller");

// A small middleware to log each request...
router.use((req, res, next) => {
  console.log(`[DEBUG] customPackage.routes: ${req.method} ${req.originalUrl}`);
  next();
});

// POST with advanced validation
router.post("/", (req, res, next) => {
  console.log("[DEBUG] Entered POST /api/customPackages route");
  return createCustomPackage(req, res, next);
});

// GET packages by user
router.get("/byUser/:userId", (req, res, next) => {
  console.log("[DEBUG] Entered GET /api/customPackages/byUser/:userId");
  return getCustomPackagesByUser(req, res, next);
});

// DELETE custom package
router.delete("/:id", deleteCustomPackage); // now recognized
module.exports = router;
