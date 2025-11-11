const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  createFeedback,
  getAllFeedback,
  getFeedbackByComplaint,
  getFeedbackByUser,
  updateFeedback,
  deleteFeedback,
} = require("../controllers/feedbackController");


router.post("/", auth, createFeedback);


router.get("/", getAllFeedback);


router.get("/complaint/:complaintId", getFeedbackByComplaint);


router.get("/my", auth, getFeedbackByUser);

router.put("/:id", auth, updateFeedback)

router.delete("/:id", auth, deleteFeedback);


module.exports = router;
