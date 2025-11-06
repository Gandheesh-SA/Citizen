// middleware/authMiddleware.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    // Extract token
    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    // 🧠 Check payload consistency — use `decoded.id` or `decoded.userId`
    // depending on how you created the token in your login/signup controller
    const userId = decoded.id || decoded.userId;

    if (!userId) {
      return res.status(401).json({ message: "Invalid token payload" });
    }

    // Fetch user from DB
    const user = await User.findById(userId).select("-password"); // exclude password

    if (!user) {
      return res.status(401).json({ message: "User not found or invalid token" });
    }

    // Attach user to request
    req.user = user;

    // Continue
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Unauthorized or token expired" });
  }
};

module.exports = auth;
