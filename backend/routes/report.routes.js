const router = require("express").Router();
const reportController = require("../controllers/report.controllers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

router.get("/sales-by-product", verifyToken, checkRole("admin"), reportController.salesByProduct);
router.get("/finance-summary", verifyToken, checkRole("admin"), reportController.financeSummary);

module.exports = router;
