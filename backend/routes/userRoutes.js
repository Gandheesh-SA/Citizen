const express = require("express");
const router = express.Router();
const { getUser, updateUser } = require("../controllers/userController");

// Fetch user details
router.get("/:id", getUser);

// Update user details
router.put("/:id", updateUser);

module.exports = router;
