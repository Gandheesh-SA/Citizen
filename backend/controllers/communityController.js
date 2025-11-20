const Community = require("../models/community");

// CREATE COMMUNITY
exports.createCommunity = async (req, res) => {
  try {
    const userId = req.user.id;

    const community = await Community.create({
      ...req.body,
      createdBy: userId,
      admins: [userId], // creator = admin
      members: []       // admin should NOT be a member
    });

    res.status(201).json({ success: true, community });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET ALL COMMUNITIES
exports.getAllCommunities = async (req, res) => {
  try {
    const communities = await Community.find()
  .populate("createdBy", "fullName phone email")
  .populate("admins", "fullName phone email")
  .sort({ createdAt: -1 });
    res.json({ success: true, communities });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// GET ONE COMMUNITY
exports.getCommunityById = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id)
      .populate("admins", "fullName email")
      .populate("members", "fullName email");

    if (!community)
      return res.status(404).json({ success: false, message: "Community not found" });

    res.json({ success: true, community });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// UPDATE COMMUNITY
exports.updateCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community)
      return res.status(404).json({ success: false, message: "Community not found" });

    if (community.createdBy.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Only creator can update community" });

    const updated = await Community.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.json({ success: true, community: updated });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// DELETE COMMUNITY
exports.deleteCommunity = async (req, res) => {
  try {
    const community = await Community.findById(req.params.id);

    if (!community)
      return res.status(404).json({ success: false, message: "Community not found" });

    if (community.createdBy.toString() !== req.user.id)
      return res.status(403).json({ success: false, message: "Only creator can delete community" });

    await community.deleteOne();

    res.json({ success: true, message: "Community deleted" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// JOIN COMMUNITY
exports.joinCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const community = await Community.findById(req.params.id);

    if (!community)
      return res.status(404).json({ success: false, message: "Community not found" });

    // prevent admin from joining as member
    if (community.admins.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot join their own community"
      });
    }

    // prevent existing member from joining again
    if (community.members.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Already a member of this community"
      });
    }

    community.members.push(userId);
    await community.save();

    res.json({ success: true, message: "Joined successfully" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};

// LEAVE COMMUNITY
exports.leaveCommunity = async (req, res) => {
  try {
    const userId = req.user.id;
    const community = await Community.findById(req.params.id);

    if (!community)
      return res.status(404).json({ success: false, message: "Community not found" });

    // prevent admin from leaving their own community
    if (community.admins.includes(userId)) {
      return res.status(400).json({
        success: false,
        message: "Admin cannot leave their own community"
      });
    }

    // remove user if member
    community.members = community.members.filter(
      (m) => m.toString() !== userId
    );

    await community.save();

    res.json({ success: true, message: "Left community" });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
};
