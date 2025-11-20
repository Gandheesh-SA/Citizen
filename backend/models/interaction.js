// models/interaction.js
const mongoose = require("mongoose");

const interactionSchema = new mongoose.Schema(
  {
    complaintId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
      unique: true,
      index: true,
    },
    upvotes: [
      { type: mongoose.Schema.Types.ObjectId, ref: "User" }
    ],
    upvoteCount: {
      type: Number,
      default: 0,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Interaction", interactionSchema);
