const express = require("express");
const router = express.Router();
const { analyzeCareer } = require("../controllers/careerController");
const { getHistory } = require("../controllers/careerController");

router.post("/analyze", analyzeCareer);
router.get("/history", getHistory);

module.exports = router;