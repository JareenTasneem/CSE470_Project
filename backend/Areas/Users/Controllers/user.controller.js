// // ./Areas/Users/Controllers/user.controller.js
// const bcrypt = require("bcrypt");
// const jwt = require("jsonwebtoken");
// const User = require("../Models/User");

// const registerUser = async (req, res) => {
//   try {
//     const { name, email, phone, address, password } = req.body;

//     // Check if user with that email already exists
//     const existingUser = await User.findOne({ email });
//     if (existingUser) {
//       return res.status(400).json({ message: "User with this email already exists." });
//     }

//     // Hash the password
//     const salt = await bcrypt.genSalt(10);
//     const hashedPassword = await bcrypt.hash(password, salt);

//     // Create new user
//     const newUser = new User({
//       user_id: Date.now().toString(), // Or you can use faker.uuid()
//       name,
//       email,
//       phone,
//       address,
//       password: hashedPassword,
//     });

//     await newUser.save();

//     res.status(201).json({ message: "User registered successfully" });
//   } catch (error) {
//     console.error("Error in registerUser:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// const loginUser = async (req, res) => {
//   try {
//     const { email, password } = req.body;

//     // Check if user with that email exists
//     const user = await User.findOne({ email });
//     if (!user) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Compare passwords
//     const isMatch = await bcrypt.compare(password, user.password);
//     if (!isMatch) {
//       return res.status(400).json({ message: "Invalid credentials" });
//     }

//     // Generate JWT
//     // Make sure you have JWT_SECRET in your .env
//     const token = jwt.sign(
//       {
//         userId: user._id,
//         email: user.email,
//         user_type: user.user_type,
//       },
//       process.env.JWT_SECRET, // e.g. "SOME_SUPER_SECRET_KEY"
//       { expiresIn: "1d" } // token validity
//     );

//     res.json({
//       message: "Login successful",
//       token,
//       user: {
//         _id: user._id,
//         name: user.name,
//         email: user.email,
//         user_type: user.user_type,
//       },
//     });
//   } catch (error) {
//     console.error("Error in loginUser:", error);
//     res.status(500).json({ message: "Server error" });
//   }
// };

// module.exports = {
//   registerUser,
//   loginUser,
// };

const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const User = require("../Models/User");
const multer = require("multer"); // For file uploads - Done by Ritu
const path = require("path"); // For file path manipulation - Done by Ritu
const fs = require("fs"); // For file system operations - Done by Ritu

// Set up storage for user profile photos - Done by Ritu
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    const uploadDir = "uploads/profile";
    // Create directory if it doesn't exist
    if (!fs.existsSync(uploadDir)) {
      fs.mkdirSync(uploadDir, { recursive: true });
    }
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    cb(null, `user-${Date.now()}${path.extname(file.originalname)}`);
  },
});

// Set up file filter for images only - Done by Ritu
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/")) {
    cb(null, true);
  } else {
    cb(new Error("Not an image! Please upload only images."), false);
  }
};

// Configure the multer upload - Done by Ritu
const upload = multer({
  storage: storage,
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB max file size
  },
  fileFilter: fileFilter,
});

const registerUser = async (req, res) => {
  try {
    const { name, email, phone, address, password, user_type } = req.body;
    console.log("Registering user with type:", user_type); // Debug log

    // Check if user with that email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "User with this email already exists." });
    }

    // Hash the password
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    // Create new user with user_type
    const newUser = new User({
      user_id: Date.now().toString(),
      name,
      email,
      phone,
      address,
      password: hashedPassword,
      user_type: user_type || "Customer", // Use provided user_type or default to Customer
    });

    await newUser.save();

    res.status(201).json({ message: "User registered successfully" });
  } catch (error) {
    console.error("Error in registerUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;

    // Check if user with that email exists
    const user = await User.findOne({ email });
    if (!user) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Compare passwords
    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Invalid credentials" });
    }

    // Log user type for debugging
    console.log("User type from database:", user.user_type);

    // Generate JWT
    const token = jwt.sign(
      {
        userId: user._id,
        email: user.email,
        user_type: user.user_type,
        membership_tier: user.membership_tier,
        loyaltyPoints: user.loyaltyPoints,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1d" }
    );

    // Send response with user data
    res.json({
      message: "Login successful",
      token,
      user: {
        _id: user._id,
        name: user.name,
        email: user.email,
        user_type: user.user_type,
        membership_tier: user.membership_tier,
        loyaltyPoints: user.loyaltyPoints,
      },
      isAdmin: user.user_type === "Admin" // Add explicit admin flag
    });
  } catch (error) {
    console.error("Error in loginUser:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Get user profile - Done by Ritu
const getUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming req.user is set by auth middleware

    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json(user);
  } catch (error) {
    console.error("Error in getUserProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Update user profile details - Done by Ritu
const updateUserProfile = async (req, res) => {
  try {
    const userId = req.user.userId; // Assuming req.user is set by auth middleware
    const {
      name,
      phone,
      address,
      bio,
      birthdate,
      gender,
      social_links,
      preferences,
    } = req.body;

    // Find and update user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        $set: {
          name,
          phone,
          address,
          bio,
          birthdate,
          gender,
          social_links,
          preferences,
        },
      },
      { new: true, runValidators: true }
    ).select("-password");

    if (!updatedUser) {
      return res.status(404).json({ message: "User not found" });
    }

    res.json({
      message: "Profile updated successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in updateUserProfile:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Upload profile photo - Done by Ritu
const uploadProfilePhoto = async (req, res) => {
  try {
    // This middleware handles the file upload
    upload.single("profile_photo")(req, res, async function (err) {
      if (err instanceof multer.MulterError) {
        // A Multer error occurred when uploading
        return res
          .status(400)
          .json({ message: `Upload error: ${err.message}` });
      } else if (err) {
        // An unknown error occurred
        return res.status(400).json({ message: err.message });
      }

      // File upload was successful
      if (!req.file) {
        return res.status(400).json({ message: "Please upload a file" });
      }

      const userId = req.user.userId;
      const filePath = req.file.path;

      // Get user to check if there's an existing profile photo to delete
      const user = await User.findById(userId);
      if (!user) {
        // Delete the newly uploaded file
        if (fs.existsSync(filePath)) {
          fs.unlinkSync(filePath);
        }
        return res.status(404).json({ message: "User not found" });
      }

      // Delete old profile photo if exists
      if (user.profile_photo && fs.existsSync(user.profile_photo)) {
        fs.unlinkSync(user.profile_photo);
      }

      // Update user with new profile photo path
      const updatedUser = await User.findByIdAndUpdate(
        userId,
        { $set: { profile_photo: filePath } },
        { new: true }
      ).select("-password");

      res.json({
        message: "Profile photo uploaded successfully",
        user: updatedUser,
      });
    });
  } catch (error) {
    console.error("Error in uploadProfilePhoto:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Delete profile photo - Done by Ritu
const deleteProfilePhoto = async (req, res) => {
  try {
    const userId = req.user.userId;

    // Get user
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // If user has a profile photo, delete the file
    if (user.profile_photo && fs.existsSync(user.profile_photo)) {
      fs.unlinkSync(user.profile_photo);
    }

    // Update user to remove profile photo reference
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      { $set: { profile_photo: "" } },
      { new: true }
    ).select("-password");

    res.json({
      message: "Profile photo deleted successfully",
      user: updatedUser,
    });
  } catch (error) {
    console.error("Error in deleteProfilePhoto:", error);
    res.status(500).json({ message: "Server error" });
  }
};

// Add getAllUsers controller
const getAllUsers = async (req, res) => {
  try {
    const users = await User.find({}, '_id name email');
    res.json(users);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching users' });
  }
};

module.exports = {
  registerUser,
  loginUser,
  getUserProfile, // Done by Ritu
  updateUserProfile, // Done by Ritu
  uploadProfilePhoto, // Done by Ritu
  deleteProfilePhoto, // Done by Ritu
  getAllUsers, // Added for admin selection
};