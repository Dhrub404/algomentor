const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboardController");
const protect = require("../middleware/authMiddleware");

router.get("/decay-alert", protect, dashboardController.getDecayAlert);
router.get("/weakness", protect, dashboardController.getWeaknessDiagnostics);
router.get("/weakness/:userId", protect, dashboardController.getWeaknessDiagnostics);

module.exports = router;
