const jwt = require("jsonwebtoken");

const isAdmin = (req, res, next) => {
  console.log("[isAdmin] Checking admin authentication...");
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    console.log("[isAdmin] No Authorization header found.");
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  console.log("[isAdmin] Token received:", token);
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    console.log("[isAdmin] Decoded token:", decoded);
    
    if (decoded.user_type !== 'Admin') {
      console.log(`[isAdmin] User type is not Admin: ${decoded.user_type}`);
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      user_type: decoded.user_type,
    };
    console.log("[isAdmin] Admin authenticated:", req.user);
    next();
  } catch (error) {
    console.log("[isAdmin] Token verification failed:", error.message);
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { isAdmin }; 