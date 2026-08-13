const router = require("express").Router();
const financeController = require("../controllers/finance.controllers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

// ?start=2026-07-01&end=2026-07-31 (opsional, default 30 hari terakhir)
router.get("/summary", verifyToken, checkRole("admin"), financeController.getSummary);
router.get("/daily-sales", verifyToken, checkRole("admin"), financeController.getDailySales);
router.get("/monthly-sales", verifyToken, checkRole("admin"), financeController.getMonthlySales);

module.exports = router;
