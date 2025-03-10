const mongoose = require("mongoose");
require("dotenv").config();
const { faker } = require("@faker-js/faker");

const User = require("../Areas/Users/Models/User");
const Hotel = require("../Areas/Hotels/Models/Hotel");
const Flight = require("../Areas/Flights/Models/Flight");
const TourPackage = require("../Areas/TourPackages/Models/TourPackage");
const Booking = require("../Areas/Bookings/Models/Booking");
const Payment = require("../Areas/Payments/Models/Payment");
const Review = require("../Areas/Reviews/Models/Review");

mongoose.connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB for seeding...");
    seedData();
  })
  .catch(err => console.error("❌ MongoDB error:", err));

async function seedData() {
  try {
    // Clear collections
    await User.deleteMany();
    await Hotel.deleteMany();
    await Flight.deleteMany();
    await TourPackage.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();

    console.log("🧹 Cleared existing data...");

    // Users
    const users = [];
    for (let i = 0; i < 1000; i++) {
      users.push({
        user_id: faker.string.uuid(),
        name: faker.person.fullName(),
        email: faker.internet.email(),
        phone: faker.phone.number(),
        address: faker.location.streetAddress(),
        password: faker.internet.password(),
        user_type: i < 950 ? "Customer" : "Admin",
        passport_id: faker.string.alphanumeric(9).toUpperCase(),
        loyaltyPoints: faker.number.int({ min: 0, max: 1000 }),
        membership_tier: faker.helpers.arrayElement(["Bronze", "Silver", "Gold"]),
        profile_picture: faker.image.avatar() // Dummy profile picture
      });
    }
    const insertedUsers = await User.insertMany(users);
    console.log("✅ 1000 users seeded");

    // Hotels
    const hotels = [];
    for (let i = 0; i < 300; i++) {
      hotels.push({
        hotel_id: faker.string.uuid(),
        hotel_name: faker.company.name() + " Hotel",
        location: faker.location.city(),
        description: faker.lorem.paragraph(),
        price_per_night: faker.number.int({ min: 50, max: 500 }),
        room_types: faker.helpers.arrayElements(["Single", "Double", "Suite"], 2),
        amenities: faker.helpers.arrayElements(["WiFi", "Pool", "Gym", "Spa", "AC", "Breakfast"], 3),
        images: [
          faker.image.urlLoremFlickr({ category: 'hotel' }), 
          faker.image.urlLoremFlickr({ category: 'resort' })
        ]
      });
    }
    const insertedHotels = await Hotel.insertMany(hotels);
    console.log("✅ 300 hotels seeded");

    // Flights
    const flights = [];
    for (let i = 0; i < 300; i++) {
      flights.push({
        flight_id: faker.string.uuid(),
        airline_name: faker.company.name(),
        from: faker.location.city(),
        to: faker.location.city(),
        date: faker.date.future(),
        price: faker.number.int({ min: 100, max: 1500 }),
        seats_available: faker.number.int({ min: 50, max: 300 }),
        airline_logo: faker.image.urlLoremFlickr({ category: 'plane' }) // Dummy airline logo
      });
    }
    const insertedFlights = await Flight.insertMany(flights);
    console.log("✅ 300 flights seeded");

    // Tour Packages
    const packages = [];
    for (let i = 0; i < 300; i++) {
      const randomUser = faker.helpers.arrayElement(insertedUsers);
      const randomHotels = faker.helpers.arrayElements(insertedHotels, faker.number.int({ min: 1, max: 3 }));
      const randomFlights = faker.helpers.arrayElements(insertedFlights, faker.number.int({ min: 1, max: 2 }));

      packages.push({
        package_id: faker.string.uuid(),
        package_title: faker.lorem.words(3) + " Tour",
        package_details: faker.lorem.sentences(2),
        location: faker.location.country(),
        duration: `${faker.number.int({ min: 3, max: 10 })} days`,
        price: faker.number.int({ min: 300, max: 3000 }),
        availability: faker.number.int({ min: 5, max: 50 }),
        hotels: randomHotels.map(h => h._id),
        flights: randomFlights.map(f => f._id),
        created_by: randomUser._id,
        images: [
          faker.image.urlLoremFlickr({ category: 'travel' }),
          faker.image.urlLoremFlickr({ category: 'beach' })
        ]
      });
    }
    const insertedPackages = await TourPackage.insertMany(packages);
    console.log("✅ 300 tour packages seeded");

    // Bookings
    const bookings = [];
    for (let i = 0; i < 300; i++) {
      const user = faker.helpers.arrayElement(insertedUsers);
      const pkg = faker.helpers.arrayElement(insertedPackages);
      const hotel = faker.helpers.arrayElement(insertedHotels);
      const flight = faker.helpers.arrayElement(insertedFlights);

      bookings.push({
        booking_id: faker.string.uuid(),
        user: user._id,
        tour_package: pkg._id,
        hotel: hotel._id,
        flight: flight._id,
        status: faker.helpers.arrayElement(["Pending", "Confirmed", "Cancelled"]),
        total_price: pkg.price
      });
    }
    const insertedBookings = await Booking.insertMany(bookings);
    console.log("✅ 300 bookings seeded");

    // Payments
    const payments = insertedBookings.map(booking => ({
      payment_id: faker.string.uuid(),
      user: booking.user,
      amount: booking.total_price,
      method: faker.helpers.arrayElement(["Card", "PayPal", "bKash", "Nagad", "Bank"]),
      status: faker.helpers.arrayElement(["Completed", "Pending", "Refunded"]),
      transaction_date: faker.date.recent()
    }));
    await Payment.insertMany(payments);
    console.log("✅ 300 payments seeded");

    // Reviews
    const reviews = [];
    for (let i = 0; i < 300; i++) {
      const user = faker.helpers.arrayElement(insertedUsers);
      const type = faker.helpers.arrayElement(["Hotel", "Flight", "TourPackage"]);
      const item =
        type === "Hotel"
          ? faker.helpers.arrayElement(insertedHotels)
          : type === "Flight"
          ? faker.helpers.arrayElement(insertedFlights)
          : faker.helpers.arrayElement(insertedPackages);

      reviews.push({
        review_id: faker.string.uuid(),
        user: user._id,
        item: item._id,
        item_type: type,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: faker.lorem.sentence()
      });
    }
    await Review.insertMany(reviews);
    console.log("✅ 300 reviews seeded");

    mongoose.connection.close();
    console.log("🎉 All data seeded and MongoDB connection closed.");

  } catch (err) {
    console.error("❌ Seeding error:", err);
  }
}
