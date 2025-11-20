const express = require("express");
const router = express.Router();
const { getCitizenNews } = require("../controllers/newsController");

router.get("/coimbatore", getCitizenNews);

module.exports = router;
