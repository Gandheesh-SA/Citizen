
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const { toggleUpvote, getInteractionSummary } = require("../controllers/interactionController");

router.post("/:complaintId/upvote", auth, toggleUpvote);
router.get("/:complaintId", getInteractionSummary);

module.exports = router;
