const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const feedbackController = require("../controllers/feedbackController");

// Create
router.post("/", auth, feedbackController.createFeedback);

// Update
router.put("/:id", auth, feedbackController.updateFeedback);

// Delete
router.delete("/:id", auth, feedbackController.deleteFeedback);

// My feedbacks
router.get("/my", auth, feedbackController.getMyFeedbacks);

// Feedback for specific complaint
router.get("/complaint/:complaintId", auth, feedbackController.getFeedbackForComplaint);

module.exports = router;
