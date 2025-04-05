// backend/seed/seed.js
const mongoose = require("mongoose");
require("dotenv").config({ path: "../.env" });
const { faker } = require("@faker-js/faker");
const { LoremIpsum } = require("lorem-ipsum");

// Import Models
const User = require("../Areas/Users/Models/User");
const Hotel = require("../Areas/Hotels/Models/Hotel");
const Flight = require("../Areas/Flights/Models/Flight");
const Entertainment = require("../Areas/Entertainments/Models/Entertainment");
const TourPackage = require("../Areas/TourPackages/Models/TourPackage");
const Booking = require("../Areas/Bookings/Models/Booking");
const Payment = require("../Areas/Payments/Models/Payment");
const Review = require("../Areas/Reviews/Models/Review");
const CustomPackage = require("../Areas/CustomPackages/Models/CustomPackage");

// Configure lorem-ipsum for realistic text generation
const lorem = new LoremIpsum({
  sentencesPerParagraph: { max: 5, min: 3 },
  wordsPerSentence: { max: 16, min: 4 },
});

// A smaller city pool to increase overlap
const cityPool = [
  "New York",
  "Los Angeles",
  "Chicago",
  "Houston",
  "Phoenix",
  "Paris",
  "London",
  "Tokyo",
  "Sydney",
  "Dubai",
];

// Helper arrays for dynamic text
const packageAdjectives = [
  "Spectacular",
  "Enchanting",
  "Unforgettable",
  "Adventurous",
  "Exotic",
];
const itineraryActivities = [
  "city tour",
  "beach relaxation",
  "museum visits",
  "local cuisine tasting",
  "nature hike",
  "cultural performance",
  "guided adventure",
  "boat cruise",
  "historic site exploration",
];
const possibleInclusions = [
  "Hotel Accommodation",
  "Daily Breakfast",
  "Airport Transfer",
  "Guided Tours",
  "Welcome Drink",
  "Sightseeing Tickets",
  "Complimentary WiFi",
];
const possibleExclusions = [
  "Visa Fees",
  "Lunch and Dinner",
  "Personal Expenses",
  "Travel Insurance",
  "Tips & Gratuities",
  "Laundry Service",
  "Activities not mentioned",
];

// Helper Functions
function generateItinerary(city) {
  const dayCount = faker.number.int({ min: 3, max: 7 });
  const itinerary = [];
  for (let i = 1; i <= dayCount; i++) {
    const activity = faker.helpers.arrayElement(itineraryActivities);
    itinerary.push(
      `Day ${i}: Enjoy a ${activity} in ${city}. ${faker.lorem.sentence()}`
    );
  }
  return itinerary;
}

function generateInclusions() {
  return faker.helpers.arrayElements(
    possibleInclusions,
    faker.number.int({ min: 2, max: 5 })
  );
}

function generateExclusions() {
  return faker.helpers.arrayElements(
    possibleExclusions,
    faker.number.int({ min: 2, max: 4 })
  );
}

function generateAdditionalInfo() {
  const tips = [
    "Recommended to bring sunscreen and comfortable shoes.",
    "Carry your passport and valid ID at all times.",
    "Local currency may be needed for small vendors.",
    "Travel insurance is highly recommended.",
    "Avoid traveling alone at night in unfamiliar areas.",
    "Airport transfers are included; tipping is customary.",
  ];
  const selected = faker.helpers.arrayElements(
    tips,
    faker.number.int({ min: 2, max: 3 })
  );
  return selected.join(" ");
}

// Connect and seed
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB for seeding...");
    seedData();
  })
  .catch((err) => console.error("❌ MongoDB error:", err));

async function seedData() {
  try {
    // 0) Clear existing data
    await User.deleteMany();
    await Hotel.deleteMany();
    await Flight.deleteMany();
    await Entertainment.deleteMany();
    await TourPackage.deleteMany();
    await Booking.deleteMany();
    await Payment.deleteMany();
    await Review.deleteMany();
    await CustomPackage.deleteMany();
    console.log("🧹 Cleared existing data...");

    // 1) Seed Users
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
        profile_picture: faker.image.avatar(),
      });
    }
    const insertedUsers = await User.insertMany(users);
    console.log("✅ 1000 users seeded");

    // 2) Seed Hotels
    const hotels = [];
    for (let i = 0; i < 300; i++) {
      const city = faker.helpers.arrayElement(cityPool);
      const hotelName = faker.company.name() + " Hotel";

      // ✅ First: generate roomTypes and calculate total
      const roomTypes = faker.helpers.arrayElements(["Single", "Double", "Suite"], 2).map(type => ({
        type,
        count: faker.number.int({ min: 3, max: 80 })
      }));
      const totalRooms = roomTypes.reduce((sum, rt) => sum + rt.count, 0);

      hotels.push({
        hotel_id: faker.string.uuid(),
        hotel_name: hotelName,
        location: city,
        description: `Stay at ${hotelName} in ${city}. ${lorem.generateSentences(2)}`,
        price_per_night: faker.number.int({ min: 50, max: 500 }),
        room_types: roomTypes,           // ✅ now correctly defined
        rooms_available: totalRooms,     // ✅ now accurately reflects the room types
        amenities: faker.helpers.arrayElements(
          ["WiFi", "Pool", "Gym", "Spa", "AC", "Breakfast"],
          3
        ),
        images: [
          `https://picsum.photos/640/480?random=${faker.number.int({ min: 1, max: 99999 })}`,
          `https://picsum.photos/640/480?random=${faker.number.int({ min: 1, max: 99999 })}`,
        ],
        star_rating: faker.number.int({ min: 1, max: 5 })
      });
    }

    const insertedHotels = await Hotel.insertMany(hotels);
    console.log("✅ 300 hotels seeded");

    // 3) Seed Flights
    const flights = [];
    for (let i = 0; i < 300; i++) {
      const fromCity = faker.helpers.arrayElement(cityPool);
      let toCity = faker.helpers.arrayElement(cityPool);
      // ensure from != to
      while (toCity === fromCity) {
        toCity = faker.helpers.arrayElement(cityPool);
      }
      flights.push({
        flight_id: faker.string.uuid(),
        airline_name: faker.company.name(),
        from: fromCity,
        to: toCity,
        date: faker.date.future(),
        price: faker.number.int({ min: 100, max: 1500 }),
        seats_available: faker.number.int({ min: 50, max: 300 }),
        airline_logo: `https://picsum.photos/640/480?random=${faker.number.int({ min: 1, max: 99999 })}`,
      });
    }
    const insertedFlights = await Flight.insertMany(flights);
    console.log("✅ 300 flights seeded");

    // 4) Seed Entertainments
    const entertainments = [];
    for (let i = 0; i < 300; i++) {
      const city = faker.helpers.arrayElement(cityPool);
      entertainments.push({
        ent_id: faker.string.uuid(),
        entertainmentName: faker.lorem.words(2) + " Event",
        location: city,
        price: faker.number.int({ min: 20, max: 200 }),
        description: faker.lorem.sentence(),
        images: [
          `https://picsum.photos/640/480?random=${faker.number.int()}`,
          `https://picsum.photos/640/480?random=${faker.number.int()}`,
        ],
      });
    }
    const insertedEntertainments = await Entertainment.insertMany(entertainments);
    console.log("✅ 300 entertainments seeded");

    // 5) Seed Tour Packages
    const packages = [];
    for (let i = 0; i < 300; i++) {
      const randomUser = faker.helpers.arrayElement(insertedUsers);
      const randomHotels = faker.helpers.arrayElements(
        insertedHotels,
        faker.number.int({ min: 1, max: 3 })
      );
      const randomFlights = faker.helpers.arrayElements(
        insertedFlights,
        faker.number.int({ min: 1, max: 2 })
      );
      const city = faker.helpers.arrayElement(cityPool);

      packages.push({
        package_id: faker.string.uuid(),
        package_title: `${faker.helpers.arrayElement(packageAdjectives)} Journey to ${city}`,
        package_details: `Explore the wonders of ${city}. ${lorem.generateSentences(2)}`,
        location: city,
        duration: `${faker.number.int({ min: 2, max: 10 })} days`,
        price: faker.number.int({ min: 300, max: 3000 }),
        availability: faker.number.int({ min: 5, max: 50 }),
        itinerary: generateItinerary(city),
        inclusions: generateInclusions(),
        exclusions: generateExclusions(),
        additionalInfo: generateAdditionalInfo(),
        hotels: randomHotels.map((h) => h._id),
        flights: randomFlights.map((f) => f._id),
        created_by: randomUser._id,
        images: [
          `https://picsum.photos/640/480?random=${faker.number.int({ min: 1, max: 99999 })}`,
          `https://picsum.photos/640/480?random=${faker.number.int({ min: 1, max: 99999 })}`,
        ],
        maxCapacity: faker.number.int({ min: 1, max: 30 }) // NEW field added
      });
    }
    const insertedPackages = await TourPackage.insertMany(packages);
    console.log("✅ 300 tour packages seeded");

    // 6) Seed Bookings
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
        total_price: pkg.price,
      });
    }
    const insertedBookings = await Booking.insertMany(bookings);
    console.log("✅ 300 bookings seeded");

    // 7) Seed Payments
    const payments = insertedBookings.map((booking) => ({
      payment_id: faker.string.uuid(),
      user: booking.user,
      amount: booking.total_price,
      method: faker.helpers.arrayElement(["Card", "PayPal", "bKash", "Nagad", "Bank"]),
      status: faker.helpers.arrayElement(["Completed", "Pending", "Refunded"]),
      transaction_date: faker.date.recent(),
    }));
    await Payment.insertMany(payments);
    console.log("✅ 300 payments seeded");

    // 8) Seed Reviews
    const reviews = [];
    for (let i = 0; i < 300; i++) {
      const user = faker.helpers.arrayElement(insertedUsers);
      const type = faker.helpers.arrayElement(["Hotel", "Flight", "TourPackage"]);
      let item;
      if (type === "Hotel") {
        item = faker.helpers.arrayElement(insertedHotels);
      } else if (type === "Flight") {
        item = faker.helpers.arrayElement(insertedFlights);
      } else {
        item = faker.helpers.arrayElement(insertedPackages);
      }

      reviews.push({
        review_id: faker.string.uuid(),
        user: user._id,
        item: item._id,
        item_type: type,
        rating: faker.number.int({ min: 1, max: 5 }),
        comment: lorem.generateSentences(1),
      });
    }
    await Review.insertMany(reviews);
    console.log("✅ 300 reviews seeded");

    // 9) Seed Some Custom Packages (Optional)
    const customPackages = [];
    for (let i = 0; i < 100; i++) {
      const randomUser = faker.helpers.arrayElement(insertedUsers);
      const randomFs = faker.helpers.arrayElements(
        insertedFlights,
        faker.number.int({ min: 0, max: 4 })
      );
      const randomHs = faker.helpers.arrayElements(
        insertedHotels,
        faker.number.int({ min: 0, max: 4 })
      );
      const randomEnts = faker.helpers.arrayElements(
        insertedEntertainments,
        faker.number.int({ min: 0, max: 4 })
      );

      // No manual _id => Mongoose will create ObjectId automatically
      customPackages.push({
        custom_id: faker.string.uuid(),
        user: randomUser._id,
        flights: randomFs.map((f) => f._id),
        hotels: randomHs.map((h) => h._id),
        entertainments: randomEnts.map((e) => e._id),
      });
    }
    await CustomPackage.insertMany(customPackages);
    console.log("✅ 100 custom packages seeded");

    mongoose.connection.close();
    console.log("🎉 All data seeded and MongoDB connection closed.");
  } catch (err) {
    console.error("❌ Seeding error:", err);
  }
}
