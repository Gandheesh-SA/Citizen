const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const Complaint = require("../models/complaints");
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getComplaintsByUser,
} = require("../controllers/complaintController");
const auth = require("../middleware/auth");

// 🖼️ Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, "CMP-" + Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

// 🧾 CREATE new complaint
router.post("/", upload.single("image"), createComplaint);

// ✅ GET all complaints OR filter by category (case-insensitive)
router.get("/", async (req, res) => {
  try {
    const { category } = req.query;
    let complaints;

    if (category) {
      // case-insensitive partial match
      complaints = await Complaint.find({
        category: { $regex: new RegExp(category, "i") },
      });
    } else {
      complaints = await Complaint.find();
    }

    res.status(200).json(complaints);
  } catch (error) {
    console.error("Error fetching complaints:", error);
    res.status(500).json({ message: "Server error" });
  }
});

// 🗑️ DELETE complaint by ID
router.delete("/:id", async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (error) {
    console.error("Error deleting complaint:", error);
    res.status(500).json({ message: "Server error deleting complaint" });
  }
});

// ✏️ UPDATE complaint by ID
router.put("/:id", upload.single("image"), async (req, res) => {
  try {
    const updated = await Complaint.findByIdAndUpdate(
      req.params.id,
      { ...req.body, image: req.file ? req.file.filename : req.body.image },
      { new: true }
    );

    if (!updated) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json(updated);
  } catch (error) {
    console.error("Error updating complaint:", error);
    res.status(500).json({ message: "Server error updating complaint" });
  }
});

// 🧩 GET complaint by ID
router.get("/:id", getComplaintById);

module.exports = router;
