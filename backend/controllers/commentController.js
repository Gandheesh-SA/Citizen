// controllers/commentController.js
const Comment = require("../models/comment");
const mongoose = require("mongoose");

/**
 * Build nested comment tree from flat array (server-side)
 * @param {Array} flatComments - Mongoose docs (populated with userId)
 * @returns {Array} tree
 */
function buildCommentTree(flatComments) {
  if (!flatComments || flatComments.length === 0) {
    return [];
  }

  const map = new Map();

  // First pass: Create a map of all comments with empty replies arrays
  flatComments.forEach((c) => {
    const id = c._id.toString();
    // Make sure to spread all properties including populated userId
    map.set(id, { 
      ...c,
      _id: c._id,
      userId: c.userId,
      text: c.text,
      parentId: c.parentId,
      createdAt: c.createdAt,
      updatedAt: c.updatedAt,
      replies: [] 
    });
  });

  const roots = [];
  
  // Second pass: Build the tree structure
  flatComments.forEach((c) => {
    const id = c._id.toString();
    const parentId = c.parentId ? c.parentId.toString() : null;
    const node = map.get(id);

    if (!parentId) {
      // This is a root comment
      roots.push(node);
    } else {
      // This is a reply
      const parent = map.get(parentId);
      if (parent) {
        parent.replies.push(node);
      } else {
        // If parent not found, treat as root (fallback)
        console.log(`Warning: Parent ${parentId} not found for comment ${id}`);
        roots.push(node);
      }
    }
  });

  console.log(`Built comment tree: ${flatComments.length} comments -> ${roots.length} roots`);
  return roots;
}

// POST comment (or reply)
exports.postComment = async (req, res) => {
  try {
    const { complaintId } = req.params;
    const { text, parentId } = req.body;

    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Comment text is required" });
    }

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint id" });
    }

    // Validate parentId if provided
    if (parentId) {
      if (!mongoose.Types.ObjectId.isValid(parentId)) {
        return res.status(400).json({ message: "Invalid parent comment id" });
      }
      
      // Check if parent comment exists
      const parentExists = await Comment.findById(parentId);
      if (!parentExists) {
        return res.status(400).json({ message: "Parent comment not found" });
      }
    }

    const comment = await Comment.create({
      complaintId: new mongoose.Types.ObjectId(complaintId),
      userId: new mongoose.Types.ObjectId(req.user._id),
      text: text.trim(),
      parentId: parentId ? new mongoose.Types.ObjectId(parentId) : null,
    });

    const populated = await Comment.findById(comment._id).populate(
      "userId",
      "fullName"
    );
    
    return res.status(201).json({ message: "Comment added", comment: populated });
  } catch (err) {
    console.error("postComment error:", err);
    return res
      .status(500)
      .json({ message: "Server error while posting comment" });
  }
};

// GET comments for a complaint (returns flat array + comment tree)
exports.getComments = async (req, res) => {
  try {
    const { complaintId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(complaintId)) {
      return res.status(400).json({ message: "Invalid complaint id" });
    }

    // Get all comments for this complaint, sorted by creation time
    const flat = await Comment.find({
      complaintId: new mongoose.Types.ObjectId(complaintId),
    })
      .populate("userId", "fullName")
      .sort({ createdAt: 1 })
      .lean();

    // Build the tree structure
    const tree = buildCommentTree(flat);

    // Return both flat array and tree structure
    return res.json({ 
      flat, 
      commentsTree: tree,
      count: flat.length 
    });
  } catch (err) {
    console.error("getComments error:", err);
    return res.status(500).json({ message: "Server error fetching comments" });
  }
};

// PUT edit comment
exports.editComment = async (req, res) => {
  try {
    const { commentId } = req.params;
    const { text } = req.body;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }
    if (!text || !text.trim()) {
      return res.status(400).json({ message: "Text is required" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user._id.toString()) {
      return res.status(403).json({ message: "Forbidden — only owner can edit" });
    }

    comment.text = text.trim();
    await comment.save();

    const populated = await Comment.findById(comment._id).populate("userId", "fullName");
    return res.json({ message: "Comment updated", comment: populated });
  } catch (err) {
    console.error("editComment error:", err);
    return res.status(500).json({ message: "Server error editing comment" });
  }
};

// DELETE comment and its replies (cascade)
exports.deleteComment = async (req, res) => {
  try {
    const { commentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(commentId)) {
      return res.status(400).json({ message: "Invalid comment id" });
    }

    const comment = await Comment.findById(commentId);
    if (!comment) {
      return res.status(404).json({ message: "Comment not found" });
    }

    if (comment.userId.toString() !== req.user._id.toString() && req.user.role !== "admin") {
      return res.status(403).json({ message: "Forbidden — only owner or admin can delete" });
    }

    // Collect all descendants and delete them
    const complaintId = comment.complaintId;
    const all = await Comment.find({ complaintId }).select("_id parentId").lean();

    const childrenMap = new Map();
    all.forEach((c) => {
      const pid = c.parentId ? c.parentId.toString() : null;
      if (!childrenMap.has(pid)) childrenMap.set(pid, []);
      childrenMap.get(pid).push(c._id.toString());
    });

    const toDelete = [];
    const queue = [comment._id.toString()];
    while (queue.length) {
      const cur = queue.shift();
      toDelete.push(cur);
      const kids = childrenMap.get(cur) || [];
      kids.forEach((k) => queue.push(k));
    }

    await Comment.deleteMany({ _id: { $in: toDelete } });
    return res.json({ 
      message: "Comment and its replies deleted", 
      deletedCount: toDelete.length 
    });
  } catch (err) {
    console.error("deleteComment error:", err);
    return res.status(500).json({ message: "Server error deleting comment" });
  }
};

module.exports = {
  postComment: exports.postComment,
  getComments: exports.getComments,
  editComment: exports.editComment,
  deleteComment: exports.deleteComment
};