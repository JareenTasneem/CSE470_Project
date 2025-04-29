const mongoose = require("mongoose");

/* Flight Schema with class‑specific seats */
const flightSchema = new mongoose.Schema(
  {
    flight_id:    { type: String, unique: true },
    airline_name: { type: String, required: true },
    from:         String,
    to:           String,
    date:         Date,
    price:        Number,
    airline_logo: String,

    /* seat_types mirrors hotel room_types */
    seat_types: [
      {
        type:  { type: String, enum: ["business", "economy"] },
        count: { type: Number, default: 0 },
      },
    ],

    /* derived convenience total */
    total_seats: { type: Number, default: 0 },
  },
  { timestamps: true }
);

/* Helpers */
flightSchema.statics.changeSeatCount = async function (flightId, seatType, qty) {
  const flight = await this.findById(flightId);
  if (!flight) throw new Error("Flight not found");

  const seat = flight.seat_types.find((s) => s.type === seatType);
  if (!seat) throw new Error("Seat type not found");
  if (seat.count + qty < 0) throw new Error("Not enough seats");

  seat.count += qty;              // qty can be + or –
  flight.total_seats += qty;
  await flight.save();
  return flight;
};

flightSchema.statics.incrementSeats = async function (flightId, seatType, qty) {
  return this.changeSeatCount(flightId, seatType, Math.abs(qty));
};

flightSchema.statics.decrementSeats = async function (flightId, seatType, qty) {
  return this.changeSeatCount(flightId, seatType, -Math.abs(qty));
};

module.exports = mongoose.model("Flight", flightSchema);
