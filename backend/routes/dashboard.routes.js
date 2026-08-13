const express = require("express");
const router = express.Router();
const dashboardController = require("../controllers/dashboard.conrollers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

// Dashboard hanya untuk admin
router.get("/summary", verifyToken, checkRole("admin"), dashboardController.getSummary);
router.get("/low-stock", verifyToken, checkRole("admin"), dashboardController.getLowStock);
router.get("/top-products", verifyToken, checkRole("admin"), dashboardController.getTopProducts);
router.get("/recent-orders", verifyToken, checkRole("admin"), dashboardController.getRecentOrders);

module.exports = router;
