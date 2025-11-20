const express = require("express");
const router = express.Router();
const auth = require("../middleware/auth");
const controller = require("../controllers/communityController");

router.post("/", auth, controller.createCommunity);

router.get("/", auth, controller.getAllCommunities);

router.get("/:id", auth, controller.getCommunityById);

router.put("/:id", auth, controller.updateCommunity);

router.delete("/:id", auth, controller.deleteCommunity);

router.post("/:id/join", auth, controller.joinCommunity);

router.post("/:id/leave", auth, controller.leaveCommunity);

module.exports = router;
