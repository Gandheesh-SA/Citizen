const mongoose = require("mongoose");
const Complaint = require("../models/complaints");
const User = require("../models/user");
const Interaction = require("../models/interaction");
const Comment = require("../models/comment");

/* =========================================================
   BUILD COMMENT TREE
   ========================================================= */
function buildCommentTree(flat) {
  const map = new Map();

  flat.forEach((c) => {
    map.set(c._id.toString(), { ...c.toObject(), replies: [] });
  });

  const roots = [];

  flat.forEach((c) => {
    const id = c._id.toString();
    const parentId = c.parentId ? c.parentId.toString() : null;

    if (!parentId) {
      roots.push(map.get(id));
    } else {
      const parent = map.get(parentId);
      if (parent) parent.replies.push(map.get(id));
      else roots.push(map.get(id));
    }
  });

  return roots;
}

/* =========================================================
   CREATE COMPLAINT (MULTIPLE MEDIA SUPPORTED)
   ========================================================= */
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

    const user = req.user;
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    // Generate ID CMP001 etc.
    const last = await Complaint.findOne().sort({ createdAt: -1 });
    let next = 1;
    if (last?.complaintId) {
      const num = parseInt(last.complaintId.replace("CMP", ""), 10);
      if (!isNaN(num)) next = num + 1;
    }
    const complaintId = `CMP${String(next).padStart(3, "0")}`;

    // NEW: handle multiple uploaded files
    const mediaFiles =
      req.files?.length > 0
        ? req.files.map((f) => f.path.replace(/\\/g, "/"))
        : [];

    const complaint = await Complaint.create({
      complaintId,
      title,
      category,
      complaintType,
      areaType,
      description,
      days,
      media: mediaFiles, // Save multiple media
      location,
      user: user._id,
    });

    res.status(201).json({
      message: "Complaint created successfully",
      complaint,
    });
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(500).json({ message: "Server error while creating complaint" });
  }
};

/* =========================================================
   GET ALL COMPLAINTS
   ========================================================= */
exports.getAllComplaints = async (req, res) => {
  try {
    const { category } = req.query;
    const filter = {};

    if (category) {
      filter.category = { $regex: new RegExp(category, "i") };
    }

    const complaints = await Complaint.find(filter)
      .populate("user", "fullName email role location")
      .sort({ createdAt: -1 });

    res.status(200).json(complaints);
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ message: "Server error fetching complaints" });
  }
};

/* =========================================================
   GET COMPLAINT BY ID
   ========================================================= */
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id).populate(
      "user",
      "fullName email role location"
    );

    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    res.status(200).json(complaint);
  } catch (err) {
    console.error("Error fetching complaint by ID:", err);
    res.status(500).json({ message: "Server error fetching complaint" });
  }
};

/* =========================================================
   GET MY COMPLAINTS
   ========================================================= */
exports.getMyComplaints = async (req, res) => {
  try {
    if (!req.user) return res.status(401).json({ message: "Unauthorized" });

    const complaints = await Complaint.find({ user: req.user._id }).populate(
      "user",
      "fullName email"
    );

    res.status(200).json(complaints);
  } catch (err) {
    console.error("Error fetching user's complaints:", err);
    res.status(500).json({ message: "Server error fetching user complaints" });
  }
};

/* =========================================================
   UPDATE COMPLAINT (MERGE EXISTING + NEW MEDIA)
   ========================================================= */
exports.updateComplaint = async (req, res) => {
  try {
    const id = req.params.id;

    // Parse existing media from JSON string
    let existingMedia = [];
    if (req.body.existingMedia) {
      try {
        existingMedia = JSON.parse(req.body.existingMedia);
      } catch (err) {
        existingMedia = [];
      }
    }

    // New uploaded media
    const newMedia =
      req.files?.length > 0
        ? req.files.map((f) => f.path.replace(/\\/g, "/"))
        : [];

    const finalMedia = [...existingMedia, ...newMedia];

    const updated = await Complaint.findByIdAndUpdate(
      id,
      {
        ...req.body,
        media: finalMedia,
      },
      { new: true }
    );

    if (!updated)
      return res.status(404).json({ message: "Complaint not found" });

    res.status(200).json({
      message: "Complaint updated successfully",
      complaint: updated,
    });
  } catch (err) {
    console.error("Error updating complaint:", err);
    res.status(500).json({ message: "Server error updating complaint" });
  }
};

/* =========================================================
   DELETE COMPLAINT
   ========================================================= */
exports.deleteComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findByIdAndDelete(req.params.id);

    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    await Interaction.deleteOne({ complaintId: complaint._id }).catch(() => {});
    await Comment.deleteMany({ complaintId: complaint._id }).catch(() => {});

    res.status(200).json({ message: "Complaint deleted successfully" });
  } catch (err) {
    console.error("Error deleting complaint:", err);
    res.status(500).json({ message: "Server error deleting complaint" });
  }
};

/* =========================================================
   GET FULL COMPLAINT (COMPLAINT + COMMENTS + INTERACTION)
   ========================================================= */
exports.getFullComplaint = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id))
      return res.status(400).json({ message: "Invalid complaint ID" });

    const complaint = await Complaint.findById(id).populate(
      "user",
      "fullName email role"
    );

    if (!complaint)
      return res.status(404).json({ message: "Complaint not found" });

    const interaction = await Interaction.findOne({ complaintId: id })
      .populate("upvotes", "fullName")
      .lean();

    const commentsFlat = await Comment.find({ complaintId: id })
      .populate("userId", "fullName")
      .sort({ createdAt: 1 });

    const commentsTree = buildCommentTree(commentsFlat);

    res.status(200).json({
      complaint,
      interaction: interaction || { upvoteCount: 0, upvotes: [] },
      comments: commentsTree,
      commentsFlat,
    });
  } catch (err) {
    console.error("Error fetching full complaint:", err);
    res
      .status(500)
      .json({ message: "Server error fetching full complaint" });
  }
};
