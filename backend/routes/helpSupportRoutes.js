// routes/helpSupportRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createSupport,
  getAllSupport,
  getMySupport,
  updateStatus,
  deleteSupport,
} = require("../controllers/helpSupportController");

// USER: Create a support ticket
router.post("/", auth, createSupport);

// USER: Get my tickets
router.get("/my", auth, getMySupport);

// ADMIN: Get all tickets
router.get("/", auth, getAllSupport);

// ADMIN: Update ticket status
router.put("/:id", auth, updateStatus);

// ADMIN: Delete ticket
router.delete("/:id", auth, deleteSupport);

module.exports = router;
