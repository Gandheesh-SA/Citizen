const Feedback = require("../models/feedback");
const Complaint = require("../models/complaints");
const User = require("../models/user");

// 🆕 Create Feedback
exports.createFeedback = async (req, res) => {
  try {
    const {
      complaintId,
      feedback_type,
      rating,
      experience_rating,
      detailed_feedback,
      feedback_categories,
      experience_date,
      location,
      follow_up,
      suggestions
    } = req.body;

    const userId = req.user._id; // from JWT
    let complaint = null;

    if (complaintId) {
      complaint = await Complaint.findOne({ complaintId });
      if (!complaint) return res.status(404).json({ message: "Complaint not found" });
    }

    const newFeedback = new Feedback({
      user: userId,
      complaint: complaint ? complaint._id : null,
      feedback_type,
      rating,
      experience_rating,
      detailed_feedback,
      feedback_categories,
      experience_date,
      location,
      follow_up,
      suggestions
    });

    await newFeedback.save();
    res.status(201).json({ message: "Feedback submitted successfully", feedback: newFeedback });
  } catch (err) {
    console.error("Error creating feedback:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📋 Get all feedbacks with JOIN
exports.getAllFeedback = async (req, res) => {
  try {
    const feedbacks = await Feedback.find()
      .populate("user", "userId fullName email location")
      .populate("complaint", "complaintId title category status")
      .sort({ createdAt: -1 });

    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedbacks:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 Get feedbacks by complaint ID
exports.getFeedbackByComplaint = async (req, res) => {
  try {
    const complaint = await Complaint.findOne({ complaintId: req.params.complaintId });
    if (!complaint) return res.status(404).json({ message: "Complaint not found" });

    const feedbacks = await Feedback.find({ complaint: complaint._id })
      .populate("user", "userId fullName email")
      .populate("complaint", "complaintId title category status");

    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("Error fetching feedback by complaint:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 👤 Get feedbacks by user
exports.getFeedbackByUser = async (req, res) => {
  try {
    const userId = req.user._id;

    const feedbacks = await Feedback.find({ user: userId })
      .populate("user", "userId fullName email")
      .populate("complaint", "complaintId title category status");

    res.status(200).json(feedbacks);
  } catch (err) {
    console.error("Error fetching user feedback:", err);
    res.status(500).json({ message: "Server error" });
  }
};
