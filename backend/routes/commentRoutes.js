// routes/commentRoutes.js
const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const {
  postComment,
  getComments,
  editComment,
  deleteComment,
} = require("../controllers/commentController");

router.post("/:complaintId", auth, postComment);
router.get("/:complaintId", getComments);
router.put("/:commentId", auth, editComment);
router.delete("/:commentId", auth, deleteComment);

module.exports = router;
