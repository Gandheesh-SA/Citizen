const express = require("express");
const router = express.Router();
const multer = require("multer");
const path = require("path");
const {
  createComplaint,
  getAllComplaints,
  getComplaintById,
  getMyComplaints,       // 👈 NEW controller for logged-in user's complaints
  updateComplaint,
  deleteComplaint
} = require("../controllers/complaintController");
const auth = require("../middleware/auth"); // 👈 Use correct auth middleware file name

// 🖼️ Multer storage configuration
const storage = multer.diskStorage({
  destination: (req, file, cb) => cb(null, "uploads/"),
  filename: (req, file, cb) =>
    cb(null, "CMP-" + Date.now() + path.extname(file.originalname)),
});

const upload = multer({ storage });

/* ============================================================
   📤 CREATE complaint (linked to logged-in user)
   ============================================================ */
router.post("/", auth, upload.single("image"), createComplaint);

/* ============================================================
   📋 GET all complaints (with user info)
   ============================================================ */
router.get("/", auth, getAllComplaints); // 👈 protect route (optional)

/* ============================================================
   👤 GET complaints of logged-in user
   ============================================================ */
router.get("/my", auth, getMyComplaints); // 👈 NEW endpoint

/* ============================================================
   🔍 GET a single complaint by ID (includes user info)
   ============================================================ */
router.get("/:id", auth, getComplaintById);

/* ============================================================
   ✏️ UPDATE complaint
   ============================================================ */
router.put("/:id", auth, upload.single("image"), updateComplaint);

/* ============================================================
   🗑️ DELETE complaint
   ============================================================ */
router.delete("/:id", auth, deleteComplaint);

module.exports = router;
