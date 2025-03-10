const express = require("express");
const connectDB = require("./config/db");
const cors = require("cors");
require("dotenv").config();

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
  res.send("🌍 Travel Agency API is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
require("./Areas/Users/Models/User");
require("./Areas/TourPackages/Models/TourPackage");
require("./Areas/Hotels/Models/Hotel");
require("./Areas/Flights/Models/Flight");
require("./Areas/Bookings/Models/Booking");
require("./Areas/Payments/Models/Payment");
require("./Areas/Reviews/Models/Review");
require("./Areas/Visa/Models/Visa");
