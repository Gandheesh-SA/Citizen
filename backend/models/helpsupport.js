// models/helpSupport.js
const mongoose = require("mongoose");

const helpSupportSchema = new mongoose.Schema(
  {
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    contactPreference: {
      type: String,
      enum: ["phone", "email", "both"],
      required: true,
    },

    message: {
      type: String,
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "resolved"],
      default: "pending",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("HelpSupport", helpSupportSchema);
