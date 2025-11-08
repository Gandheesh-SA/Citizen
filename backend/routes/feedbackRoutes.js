const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createFeedback,
  getAllFeedback,
  getFeedbackByComplaint,
  getFeedbackByUser
} = require("../controllers/feedbackController");

// 🧾 Create feedback (linked to user + complaint)
router.post("/", auth, createFeedback);

// 🧠 Get all feedbacks (Admin or testing)
router.get("/", getAllFeedback);

// 📍 Get feedback for a specific complaint
router.get("/complaint/:complaintId", getFeedbackByComplaint);

// 👤 Get feedbacks for logged-in user
router.get("/my", auth, getFeedbackByUser);

module.exports = router;
