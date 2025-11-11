const Feedback = require("../models/feedback");
const Complaint = require("../models/complaints");
const User = require("../models/user");
const mongoose = require("mongoose");


// 🆕 Create Feedback
exports.createFeedback = async (req, res) => {
  try {
    const {
      feedback_type,
      rating,
      experience_rating,
      detailed_feedback,
      feedback_categories,
      feedback_category, // ✅ include dropdown field
      experience_date,
      location,
      follow_up,
      suggestions,
      complaint
    } = req.body;

    const userId = req.user._id;
    let linkedComplaint = null;

    if (complaint) {
      linkedComplaint = await Complaint.findById(complaint);
      if (!linkedComplaint) return res.status(404).json({ message: "Complaint not found" });
    }

    const newFeedback = new Feedback({
      user: userId,
      complaint: linkedComplaint ? linkedComplaint._id : null,
      feedback_type,
      rating,
      experience_rating,
      detailed_feedback,
      feedback_categories,
      feedback_category,
      experience_date,
      location,
      follow_up,
      suggestions,
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


exports.deleteFeedback = async (req, res) => {
  try {
    if (!mongoose.Types.ObjectId.isValid(req.params.id)) {
      return res.status(400).json({ message: "Invalid feedback ID format" });
    }

    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) {
      return res.status(404).json({ message: "Feedback not found" });
    }

    if (feedback.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: Cannot delete this feedback" });
    }

    await Feedback.findByIdAndDelete(req.params.id);

    res.status(200).json({ message: "Feedback deleted successfully" });
  } catch (err) {
    console.error("Error deleting feedback:", err);
    res.status(500).json({ message: "Server error deleting feedback" });
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

// ✏️ Update feedback (editable only within 1 hour)
exports.updateFeedback = async (req, res) => {
  try {
    const feedback = await Feedback.findById(req.params.id);
    if (!feedback) return res.status(404).json({ message: "Feedback not found" });

    // ✅ Ensure only feedback owner can edit
    if (feedback.user.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Unauthorized: You cannot edit this feedback" });
    }

   
    const timeElapsedMinutes = (Date.now() - new Date(feedback.createdAt)) / (1000 * 60);
    if (timeElapsedMinutes > 30) {
      return res.status(400).json({ message: "Feedback can only be edited within 1 hour of submission." });
    }

    // 📝 Update editable fields
    const allowedUpdates = [
      "rating",
      "experience_rating",
      "detailed_feedback",
      "feedback_categories",
      "feedback_category", // ✅ newly added dropdown field
      "location",
      "follow_up",
      "suggestions",
      "experience_date",
    ];
    allowedUpdates.forEach((key) => {
      if (req.body[key] !== undefined) {
        feedback[key] = req.body[key];
      }
    });

    await feedback.save();
    res.status(200).json({ message: "Feedback updated successfully", feedback });
  } catch (err) {
    console.error("Error updating feedback:", err);
    res.status(500).json({ message: "Server error" });
  }
};


