// server.js
const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();

// Just to confirm the URI loads
console.log("MONGO_URI is:", process.env.MONGO_URI);

const app = express();
connectDB();

// Enable CORS for requests from React (localhost:3000)
app.use(cors());
// Parse JSON bodies
app.use(express.json());

// Load your models first
require("./Areas/Users/Models/User");
require("./Areas/TourPackages/Models/TourPackage");
require("./Areas/Hotels/Models/Hotel");
require("./Areas/Flights/Models/Flight");
require("./Areas/Bookings/Models/Booking");
require("./Areas/Payments/Models/Payment");
require("./Areas/Reviews/Models/Review");
require("./Areas/Visa/Models/Visa");

// 1) Import the router from tourPackage.routes.js
const tourPackageRoutes = require("./Areas/TourPackages/Routes/tourPackage.routes");
// 2) Mount the router at /api/tourPackages
app.use("/api/tourPackages", tourPackageRoutes);

// Simple test route to confirm server is up
app.get("/", (req, res) => {
  res.send("🌍 Travel Agency API is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
