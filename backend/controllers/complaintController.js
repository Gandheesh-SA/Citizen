const Complaint = require("../models/complaints");

// 🆕 CREATE complaint
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

    // Generate unique complaint ID
    const count = await Complaint.countDocuments();
    const complaintId = `CMP${String(count + 1).padStart(3, "0")}`;

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
    });

    await complaint.save();

    res.status(201).json({
      message: "Complaint submitted successfully",
      complaint,
    });
  } catch (err) {
    console.error("Error creating complaint:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 📋 GET all complaints (this is still used in routes if needed)
exports.getAllComplaints = async (req, res) => {
  try {
    const { category } = req.query;
    let filter = {};

    if (category) {
      filter.category = { $regex: new RegExp(category, "i") };
    }

    const complaints = await Complaint.find(filter).sort({ createdAt: -1 });
    res.status(200).json(complaints);
  } catch (err) {
    console.error("Error fetching complaints:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 🔍 GET complaint by ID
exports.getComplaintById = async (req, res) => {
  try {
    const complaint = await Complaint.findById(req.params.id);
    if (!complaint) {
      return res.status(404).json({ message: "Complaint not found" });
    }
    res.status(200).json(complaint);
  } catch (err) {
    console.error("Error fetching complaint by ID:", err);
    res.status(500).json({ message: "Server error" });
  }
};

// 👤 OPTIONAL: Get complaints by user ID (if needed)
exports.getComplaintsByUser = async (req, res) => {
  try {
    const complaints = await Complaint.find({ user: req.user.id });
    res.status(200).json(complaints);
  } catch (err) {
    console.error("Error fetching user complaints:", err);
    res.status(500).json({ message: "Server error" });
  }
};
