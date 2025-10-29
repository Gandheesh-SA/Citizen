const mongoose = require("mongoose");

const complaintSchema = new mongoose.Schema(
  {
    complaintId: {
      type: String,
      required: true,
      unique: true,
    },
    title: {
      type: String,
      required: true,
    },
    category: {
      type: [String],
      required: true,
    },
    complaintType: {
      type: String,
      required: true,
    },
    areaType: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    days: {
      type: Number,
      required: true,
    },
    image: {
      type: String,
    },
    location: {
      type: String,
    },
    status: {
      type: String,
      enum: ["Pending", "In Progress", "Resolved"],
      default: "Pending",
    },
    // user field removed
  },
  { timestamps: true }
);

module.exports = mongoose.model("Complaint", complaintSchema);
