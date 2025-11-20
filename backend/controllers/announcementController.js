const Announcement = require("../models/announcement");
const fs = require("fs/promises");
const path = require("path");

// Create announcement
exports.createAnnouncement = async (req, res) => {
  try {
    const {
      title,
      message,
      category,
      location,
      area,
      senderName,
      contactEmail,
      contactPhone,
      startDate,
      endDate,
      autoDelete,
    } = req.body;

    if (startDate && endDate) {
      const start = new Date(startDate);
      const end = new Date(endDate);
      if (end <= start) {
        return res.status(400).json({ message: "End date must be after start date" });
      }
    }

    const imageUrl = req.file ? req.file.path : null;

    const announcement = new Announcement({
      title,
      message,
      category,
      location,
      area,
      senderName,
      contactEmail,
      contactPhone,
      startDate: startDate || null,
      endDate: endDate || null,
      autoDelete: autoDelete || false,
      imageUrl,
    });

    await announcement.save();
    res.status(201).json(announcement);
  } catch (error) {
    if (error.name === "ValidationError") {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: "Server error" });
  }
};

// Get announcements
exports.getAnnouncements = async (req, res) => {
  try {
    const { search, category, location } = req.query;
    let query = { isDeleted: false };

    if (search) {
      query.$or = [
        { title: { $regex: search, $options: "i" } },
        { message: { $regex: search, $options: "i" } },
      ];
    }
    if (category) query.category = category;
    if (location) query.location = { $regex: location, $options: "i" };

    const announcements = await Announcement.find(query).sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Deleted announcements
exports.getDeletedAnnouncements = async (req, res) => {
  try {
    const deletedAnnouncements = await Announcement.find({ isDeleted: true }).sort({ deletedAt: -1 });
    res.json(deletedAnnouncements);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Update announcement
exports.updateAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    if (req.body.startDate && req.body.endDate) {
      const start = new Date(req.body.startDate);
      const end = new Date(req.body.endDate);
      if (end <= start) {
        return res.status(400).json({ message: "End date must be after start date" });
      }
    }

    const imageUrl = req.file ? req.file.path : undefined;
    const updateData = { ...req.body };
    if (imageUrl) updateData.imageUrl = imageUrl;

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(id, updateData, {
      new: true,
      runValidators: true,
    });

    if (!updatedAnnouncement) return res.status(404).json({ message: "Announcement not found" });

    res.json(updatedAnnouncement);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

// Soft delete
exports.deleteAnnouncement = async (req, res) => {
  try {
    const { id } = req.params;

    const deletedAnnouncement = await Announcement.findByIdAndUpdate(
      id,
      { isDeleted: true, deletedAt: new Date() },
      { new: true }
    );

    if (!deletedAnnouncement) return res.status(404).json({ message: "Announcement not found" });

    res.json({ message: "Announcement deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};
