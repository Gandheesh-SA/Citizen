const express = require("express");
const router = express.Router();

// Correct middleware path
const announcementUpload = require("../middleware/upload");

const {
  createAnnouncement,
  getAnnouncements,
  getDeletedAnnouncements,
  updateAnnouncement,
  deleteAnnouncement,
} = require("../controllers/announcementController");

// GET all + CREATE announcement
router
  .route("/")
  .get(getAnnouncements)
  .post(announcementUpload.single("image"), createAnnouncement);

// GET deleted announcements
router.route("/deleted").get(getDeletedAnnouncements);

// UPDATE + DELETE announcement
router
  .route("/:id")
  .put(announcementUpload.single("image"), updateAnnouncement)
  .delete(deleteAnnouncement);

module.exports = router;
