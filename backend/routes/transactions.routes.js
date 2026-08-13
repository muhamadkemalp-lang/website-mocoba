const router = require("express").Router();
const transactionController = require("../controllers/transactons.controllers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

// Kasir yang melakukan checkout, admin bisa lihat semua riwayat
router.post("/checkout", verifyToken, checkRole("kasir", "admin"), transactionController.checkout);
router.get("/", verifyToken, checkRole("admin", "kasir"), transactionController.getAll);
router.get("/:id", verifyToken, checkRole("admin", "kasir"), transactionController.getById);

module.exports = router;
