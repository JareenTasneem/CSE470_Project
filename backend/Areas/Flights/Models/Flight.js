const mongoose = require("mongoose");

const flightSchema = new mongoose.Schema({
  flight_id: { type: String, unique: true },
  airline_name: { type: String, required: true },
  from: String,
  to: String,
  date: Date, // you may choose to separate departure and arrival times if needed
  // Optionally add an arrivalTime field:
  // arrivalTime: Date,
  price: Number,
  airline_logo: String,
  seats_available: { type: Number, default: 0 }
}, { timestamps: true });

// Static method to decrement available seats
flightSchema.statics.decrementSeats = async function(flightId) {
  try {
    const flight = await this.findById(flightId); // Find the flight by its ID
    if (!flight) {
      throw new Error("Flight not found");
    }
    if (flight.seats_available > 0) {
      flight.seats_available -= 0.5; // Decrease the number of available seats by 1
      await flight.save(); // Save the updated flight data
      return flight;
    } else {
      throw new Error("No seats available");
    }
  } catch (error) {
    console.error("Error decrementing seats:", error);
    throw error; // Pass the error to be handled by the route
  }
};

flightSchema.statics.incrementSeats = async function(flightId, count) {
  const flight = await this.findById(id);
  if (flight) {
    flight.seats_available += count;
    await flight.save();
  }
};

module.exports = mongoose.model("Flight", flightSchema);
