const express = require("express");
const router = express.Router();
const upload = require("../middleware/upload"); 
const auth = require("../middleware/auth");

const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getMyComplaints,
  updateComplaint,
  deleteComplaint,
  getFullComplaint,
} = require("../controllers/complaintController");

// Create complaint (CLOUDINARY)
router.post("/", auth, upload.array("media", 4), createComplaint);

// Get all complaints
router.get("/", auth, getAllComplaints);

// My complaints
router.get("/my", auth, getMyComplaints);

// Full complaint
router.get("/:id/full", auth, getFullComplaint);

// Single complaint
router.get("/:id", auth, getComplaintById);

// Update
router.put("/:id", auth, upload.array("media", 4), updateComplaint);

// Delete
router.delete("/:id", auth, deleteComplaint);

module.exports = router;
