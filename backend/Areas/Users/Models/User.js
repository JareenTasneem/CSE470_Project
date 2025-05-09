// const mongoose = require("mongoose");

// const userSchema = new mongoose.Schema({
//   user_id: { type: String, unique: true },
//   name: { type: String, required: true },
//   email: { type: String, required: true, unique: true },
//   phone: String,
//   address: String,
//   password: { type: String, required: true },
//   user_type: { type: String, enum: ["Customer", "Admin"], default: "Customer" },
//   passport_id: String,
//   images: [String],
//   loyaltyPoints: { type: Number, default: 0 },
//   membership_tier: { type: String, enum: ["Bronze", "Silver", "Gold"], default: "Bronze" }
// }, { timestamps: true });

// module.exports = mongoose.model("User", userSchema);
const mongoose = require("mongoose");

// Extended user schema with profile customization fields - Done by Ritu
const userSchema = new mongoose.Schema(
  {
    user_id: { type: String, unique: true },
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    phone: String,
    address: String,
    password: { type: String, required: true },
    user_type: {
      type: String,
      enum: ["Customer", "Admin"],
      default: "Customer",
    },
    passport_id: String,
    images: [String],
    loyaltyPoints: { type: Number, default: 0 },
    membership_tier: {
      type: String,
      enum: ["Bronze", "Silver", "Gold"],
      default: "Bronze",
    },

    // New profile customization fields - Done by Ritu
    profile_photo: {
      type: String,
      default: "",
    },
    bio: {
      type: String,
      default: "",
    },
    birthdate: {
      type: Date,
      default: null,
    },
    gender: {
      type: String,
      enum: ["", "male", "female", "other", "prefer_not_to_say"],
      default: "",
    },
    social_links: {
      facebook: {
        type: String,
        default: "",
      },
      twitter: {
        type: String,
        default: "",
      },
      instagram: {
        type: String,
        default: "",
      },
      linkedin: {
        type: String,
        default: "",
      },
    },
    preferences: {
      theme: {
        type: String,
        enum: ["light", "dark", "system"],
        default: "light",
      },
      notifications: {
        type: Boolean,
        default: true,
      },
      language: {
        type: String,
        default: "en",
      },
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("User", userSchema);