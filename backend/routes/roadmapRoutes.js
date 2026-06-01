const express = require("express");
const router = express.Router();
const { getGenericDSARoadmap, getPersonalizedDSARoadmap } = require("../controllers/roadmapController");
const protect = require("../middleware/authMiddleware");

router.get("/generic", protect, getGenericDSARoadmap);
router.get("/personalized/:userId", protect, getPersonalizedDSARoadmap);

module.exports = router;
