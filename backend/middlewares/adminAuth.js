const jwt = require("jsonwebtoken");

const isAdmin = (req, res, next) => {
  const authHeader = req.headers.authorization;
  if (!authHeader) {
    return res.status(401).json({ message: "No token, authorization denied" });
  }

  const token = authHeader.split(" ")[1];
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    if (decoded.user_type !== 'Admin') {
      return res.status(403).json({ message: "Access denied. Admin privileges required." });
    }

    req.user = {
      userId: decoded.userId,
      email: decoded.email,
      user_type: decoded.user_type,
    };

    next();
  } catch (error) {
    return res.status(401).json({ message: "Token is not valid" });
  }
};

module.exports = { isAdmin }; 