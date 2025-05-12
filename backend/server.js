// server.js
const express = require("express");
const connectDB = require("./config/db");
const path = require('path'); 
const cors = require("cors");
require("dotenv").config();

console.log("MONGO_URI is:", process.env.MONGO_URI);

const app = express();
connectDB();

app.use(cors());
app.use(express.json());

// Load your models first
require("./Areas/Users/Models/User");
require("./Areas/TourPackages/Models/TourPackage");
require("./Areas/Hotels/Models/Hotel");
require("./Areas/Flights/Models/Flight");
require("./Areas/Bookings/Models/Booking");
require("./Areas/Payments/Models/Payment");          // ← payment model
require("./Areas/Reviews/Models/Review");
require("./Areas/Visa/Models/Visa");
require("./Areas/LoyaltyTransactions/Models/LoyaltyTransaction");  // ← loyalty transaction model
require("./Areas/Maintenance/Models/Maintenance");  // Add this line

// Mount routers
const tourPackageRoutes = require("./Areas/TourPackages/Routes/tourPackage.routes");
app.use("/api/tourPackages", tourPackageRoutes);

const userRoutes = require("./Areas/Users/Routes/user.routes");
app.use("/api/users", userRoutes);

const flightRoutes = require("./Areas/Flights/Routes/flight.routes");
app.use("/api/flights", flightRoutes);

const hotelRoutes = require("./Areas/Hotels/Routes/hotel.routes");
app.use("/api/hotels", hotelRoutes);

const entertainmentRoutes = require("./Areas/Entertainments/Routes/entertainment.routes");
app.use("/api/entertainments", entertainmentRoutes);

const customPackagesRouter = require("./Areas/CustomPackages/Routes/customPackage.routes.js");
app.use("/api/customPackages", customPackagesRouter);

const bookingRoutes = require("./Areas/Bookings/Routes/booking.routes");
app.use("/api/bookings", bookingRoutes);

// ← Add these two lines to mount your payments routes:
const paymentRoutes = require("./Areas/Payments/Routes/payment.routes");
app.use("/api/payments", paymentRoutes);

const refundRoutes = require("./Areas/Payments/Routes/refund.routes");
app.use("/api/refunds", refundRoutes);

const reviewRoutes = require("./Areas/Reviews/Routes/reviewRoutes");
app.use("/api/reviews", reviewRoutes);

// Add loyalty routes
const loyaltyRoutes = require("./Areas/LoyaltyTransactions/Routes/loyalty.routes");
app.use("/api/loyalty", loyaltyRoutes);

// Add maintenance routes
const maintenanceRoutes = require('./Areas/Maintenance/Routes/maintenance.routes');
app.use('/api/maintenance', maintenanceRoutes);

// Add promotional email routes
const promotionalEmailRoutes = require('./Areas/Notifications/Routes/promotionalEmailRoutes');
app.use('/api/promotional-emails', promotionalEmailRoutes);

// Start the email scheduler
const { startScheduler } = require('./services/emailScheduler');
startScheduler();

app.get("/", (req, res) => {
  res.send("🌍 Travel Agency API is running!");
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
