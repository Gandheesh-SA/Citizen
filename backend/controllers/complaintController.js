const Complaint = require("../models/complaints");
const User = require("../models/user");

/**
 * 🆕 Create a new complaint (linked to logged-in user)
 */
exports.createComplaint = async (req, res) => {
  try {
    const {
      title,
      category,
      complaintType,
      areaType,
      description,
      days,
      location,
    } = req.body;

    const image = req.file ? req.file.path : "";

    // ✅ Get user from auth middleware
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized user" });
    }

  const lastComplaint = await Complaint.findOne().sort({ createdAt: -1 });
let nextNumber = 1;

if (lastComplaint && lastComplaint.complaintId) {
  const lastNum = parseInt(lastComplaint.complaintId.replace("CMP", ""), 10);
  if (!isNaN(lastNum)) nextNumber = lastNum + 1;
}

const complaintId = `CMP${String(nextNumber).padStart(3, "0")}`;
    // 📝 Create new complaint linked to user
    const complaint = new Complaint({
      complaintId,
      title,
      category,
      complaintType,
      areaType,
      description,
      days,
      image,
      location,
      user: user._id, // Link logged-in user's ObjectId
    });

    await complaint.save();

    res.status(201).json({
      message: "Complaint created successfully",
      complaint,
    });
  } catch (err) {
    console.error("❌ Error creating complaint:", err);
    res.status(500).json({ message: "Server error while creating complaint" });
  }
};

/**
 * 📋 Get all complaints (with user details)
 */
exports.getAllComplaints = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = { $regex: new RegExp(category, "i") };
    }

    const complaints = await Complaint.find(filter)
      .populate("user", "userId fullName email role location") // Join user info
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (err) {
    console.error("❌ Error fetching complaints:", err);
    res.status(500).json({ message: "Server error fetching complaints" });
  }
};

/**
 * 🔍 Get a single complaint by ID (with user info)
 */
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate("user", "userId fullName email role location");

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json(complaint);
  } catch (err) {
    console.error("❌ Error fetching complaint by ID:", err);
    res.status(500).json({ message: "Server error fetching complaint" });
  }
};

/**
 * 👤 Get complaints submitted by the logged-in user
 */
exports.getMyComplaints = async (req, res) => {
  try {
    const user = req.user;
    if (!user) {
      return res.status(401).json({ message: "Unauthorized" });
    }

    const complaints = await Complaint.find({ user: user._id })
      .populate("user", "userId fullName email");

    res.status(200).json(complaints);
  } catch (err) {
    console.error("❌ Error fetching user's complaints:", err);
    res.status(500).json({ message: "Server error fetching user complaints" });
  }
};

/**
 * ✏️ Update complaint by ID
 */
exports.updateComplaint = async (req, res) => {
  try {
    const updatedComplaint = await Complaint.findByIdAndUpdate(
      req.params.id,
      {
        ...req.body,
        image: req.file ? req.file.path : req.body.image,
      },
      { new: true }
    ).populate("user", "userId fullName email");

    if (!updatedComplaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint: updatedComplaint,
    });
  } catch (err) {
    console.error("❌ Error updating complaint:", err);
    res.status(500).json({ message: "Server error updating complaint" });
  }
};

/**
 * 🗑️ Delete complaint by ID
 */
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("❌ Error deleting complaint:", err);
    res.status(500).json({ message: "Server error deleting complaint" });
  }
};
