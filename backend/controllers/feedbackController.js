const Feedback = require("../models/feedback");
const Complaint = require("../models/complaints");

exports.createFeedback = async (req, res) => {
  try {
    const userId = req.user.id;

    const {
      complaint,
      daysTaken,
      rating,
      satisfaction,
      resolved,
      pendingIssue,
      detailedFeedback
    } = req.body;

    if (!complaint)
      return res.status(400).json({ message: "Complaint ID required" });

    const c = await Complaint.findById(complaint);

    if (!c)
      return res.status(404).json({ message: "Complaint not found" });

    // ---- FIXED: SAFE OWNER CHECK ----
    const owner = c.userId || c.user || c.createdBy;
    if (!owner || owner.toString() !== userId) {
      return res.status(403).json({
        message: "Unauthorized: You do not own this complaint"
      });
    }

    // Check existing feedback
    const exists = await Feedback.findOne({ complaint });
    if (exists)
      return res.status(400).json({ message: "Feedback already submitted" });

    const fb = await Feedback.create({
      complaint,
      user: userId,
      daysTaken,
      rating,
      satisfaction,
      resolved,
      pendingIssue: resolved ? "" : pendingIssue,
      detailedFeedback
    });

    res.status(201).json({ success: true, feedback: fb });

  } catch (err) {
    console.error("Feedback error:", err);
    res.status(500).json({ message: err.message });
  }
};


// UPDATE FEEDBACK
exports.updateFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const fbId = req.params.id;

    const fb = await Feedback.findById(fbId);
    if (!fb) return res.status(404).json({ message: "Feedback not found" });

    if (fb.user.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    const updated = await Feedback.findByIdAndUpdate(
      fbId,
      {
        ...req.body,
        pendingIssue: req.body.resolved ? "" : req.body.pendingIssue,
      },
      { new: true }
    );

    res.json({ success: true, feedback: updated });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// DELETE FEEDBACK
exports.deleteFeedback = async (req, res) => {
  try {
    const userId = req.user.id;
    const fb = await Feedback.findById(req.params.id);

    if (!fb) return res.status(404).json({ message: "Feedback not found" });

    if (fb.user.toString() !== userId)
      return res.status(403).json({ message: "Unauthorized" });

    await fb.deleteOne();

    res.json({ success: true, message: "Feedback removed" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET MY FEEDBACKS
exports.getMyFeedbacks = async (req, res) => {
  try {
    const userId = req.user.id;
    const list = await Feedback.find({ user: userId })
      .populate("complaint", "complaintId title");

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// GET FEEDBACK FOR A COMPLAINT
exports.getFeedbackForComplaint = async (req, res) => {
  try {
    const list = await Feedback.find({ complaint: req.params.complaintId })
      .populate("user", "fullName email");

    res.json(list);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
