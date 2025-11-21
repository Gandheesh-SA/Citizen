
const Interaction = require("../models/interaction");
const mongoose = require("mongoose");

exports.toggleUpvote = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const userId = new mongoose.Types.ObjectId(req.user._id);

    let interaction = await Interaction.findOne({
  complaintId: new mongoose.Types.ObjectId(complaintId)
});

    if (!interaction) {
      interaction = await Interaction.create({
        complaintId: new mongoose.Types.ObjectId(complaintId),
        upvotes: [userId],
        upvoteCount: 1,
      });
      return res.json({ message: "Upvoted", interaction });
    }

    const hasUpvoted = interaction.upvotes.some((id) => id.toString() === userId.toString());

    if (hasUpvoted) {
      interaction.upvotes = interaction.upvotes.filter((id) => id.toString() !== userId.toString());
    } else {
      interaction.upvotes.push(userId);
    }

    interaction.upvoteCount = interaction.upvotes.length;
    await interaction.save();

    return res.json({
      message: hasUpvoted ? "Upvote removed" : "Upvoted",
      interaction,
    });
  } catch (err) {
    console.error("toggleUpvote error:", err);
    return res.status(500).json({ message: "Server error toggling upvote" });
  }
};

exports.getInteractionSummary = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const interaction = await Interaction.findOne({ complaintId: new mongoose.Types.ObjectId(complaintId) })
      .populate("upvotes", "fullName");

    if (!interaction) {
      return res.json({ upvoteCount: 0, upvotes: [] });
    }

    return res.json({
      upvoteCount: interaction.upvoteCount,
      upvotes: interaction.upvotes,
    });
  } catch (err) {
    console.error("getInteractionSummary error:", err);
    return res.status(500).json({ message: "Server error fetching interaction summary" });
  }
};
