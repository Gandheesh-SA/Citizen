const express = require("express");
const router = express.Router();
const { getUser, updateUser } = require("../controllers/userController");
const auth = require("../middleware/auth");

// 👤 Get logged-in user
router.get("/me", auth, async (req, res) => {
  try {
    res.status(200).json(req.user); // populated by auth middleware
  } catch (err) {
    console.error("Error fetching user profile:", err);
    res.status(500).json({ message: "Error fetching user profile" });
  }
});

// 🔍 Get user by ID (for admin or self)
router.get("/:id", auth, getUser);

// ✏️ Update user
router.put("/:id", auth, updateUser);

module.exports = router;
