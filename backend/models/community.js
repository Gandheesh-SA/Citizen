const mongoose = require("mongoose");

const CommunitySchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },

    description: { type: String, default: "" },

    tagline: { type: String, default: "" },

    category: { type: String, default: "" },

    isPublic: { type: Boolean, default: true },

    // createdBy = main admin
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true
    },

    admins: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
      }
    ],

    members: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
        default:[]
      }
    ]
  },
  { timestamps: true }
);

module.exports = mongoose.model("Community", CommunitySchema);
