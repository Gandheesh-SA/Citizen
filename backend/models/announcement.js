const mongoose = require("mongoose");

const announcementSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
      validate: {
        validator: function (value) {
          if (/^\d+$/.test(value.trim())) return false;
          const words = value.trim().split(/\s+/);
          return words.length >= 3;
        },
        message: "Title must contain at least three words and cannot be only numbers.",
      },
    },
    message: { type: String, required: true },
    category: { type: String, required: true },
    location: { type: String, required: true },
    area: { type: String, required: true },
    senderName: { type: String, required: true },
    contactEmail: { type: String, required: true },
    contactPhone: { type: String },
    startDate: { type: Date },
    endDate: { type: Date },
    autoDelete: { type: Boolean, default: false },
    isDeleted: { type: Boolean, default: false },
    deletedAt: { type: Date },
    imageUrl: { type: String },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Announcement", announcementSchema);

