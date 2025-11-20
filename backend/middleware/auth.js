// middleware/auth.js
const jwt = require("jsonwebtoken");
const User = require("../models/user");

const auth = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET);

    const userId = decoded.userId;
    if (!userId) return res.status(401).json({ message: "Invalid token payload" });

    const user = await User.findById(userId).select("-password");
    if (!user) return res.status(401).json({ message: "User not found" });

    req.user = user; // mongoose doc, use req.user._id where needed
    next();
  } catch (err) {
    console.error("Auth error:", err.message);
    return res.status(401).json({ message: "Unauthorized or token expired" });
  }
};

module.exports = auth;
