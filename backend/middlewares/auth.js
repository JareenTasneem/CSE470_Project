// middlewares/auth.js
const jwt = require("jsonwebtoken");

module.exports = (req, res, next) => {
  // The header should be in the format: "Bearer <token>"
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1]; // Extract token after "Bearer"
  try {
    // Verify token using your JWT_SECRET from the .env file
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = decoded; // Attach decoded payload (e.g., userId, email) to the request
    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};
