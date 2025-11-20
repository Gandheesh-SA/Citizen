const mongoose = require("mongoose");

const FeedbackSchema = new mongoose.Schema(
  {
    complaint: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Complaint",
      required: true,
    },

    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // How many days the resolution took
    daysTaken: {
      type: Number,
      required: true,
      min: 0,
    },

    // Rating 1–5
    rating: {
      type: Number,
      min: 1,
      max: 5,
      required: true,
    },

    // Emoji mood
    satisfaction: {
      type: String,
      enum: ["happy", "neutral", "sad"],
      required: true,
    },

    // Fully resolved or not
    resolved: {
      type: Boolean,
      required: true,
    },

    // Only required when resolved == false
    pendingIssue: {
      type: String,
      default: "",
    },

    // Detailed feedback text
    detailedFeedback: {
      type: String,
      required: true,
      minlength: 20,
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Feedback", FeedbackSchema);
