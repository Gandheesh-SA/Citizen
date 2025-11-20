// controllers/helpSupportController.js
const HelpSupport = require("../models/helpsupport");

// CREATE SUPPORT REQUEST
exports.createSupport = async (req, res) => {
  try {
    const userId = req.user.id;

    const support = await HelpSupport.create({
      user: userId,
      contactPreference: req.body.contactPreference,
      message: req.body.message,
    });

    res.status(201).json({ success: true, support });
  } catch (err) {
    console.error("HelpSupport Error:", err);
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET ALL SUPPORT REQUESTS (ADMIN)
exports.getAllSupport = async (req, res) => {
  try {
    const list = await HelpSupport.find()
      .populate("user", "fullName email phone")
      .sort({ createdAt: -1 });

    res.json({ success: true, list });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET USER’S OWN SUPPORT REQUESTS
exports.getMySupport = async (req, res) => {
  try {
    const userId = req.user.id;

    const myList = await HelpSupport.find({ user: userId }).sort({
      createdAt: -1,
    });

    res.json({ success: true, myList });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE STATUS (ADMIN)
exports.updateStatus = async (req, res) => {
  try {
    const support = await HelpSupport.findById(req.params.id);
    if (!support)
      return res
        .status(404)
        .json({ success: false, message: "Support ticket not found" });

    support.status = req.body.status || support.status;

    await support.save();

    res.json({ success: true, support });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE SUPPORT REQUEST
exports.deleteSupport = async (req, res) => {
  try {
    const support = await HelpSupport.findById(req.params.id);
    if (!support)
      return res
        .status(404)
        .json({ success: false, message: "Support ticket not found" });

    await support.deleteOne();

    res.json({ success: true, message: "Support ticket deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
