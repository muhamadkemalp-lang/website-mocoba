const router = require("express").Router();
const tableController = require("../controllers/table.controllers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

// Kasir & admin bisa lihat daftar meja
router.get("/", verifyToken, checkRole("admin", "kasir"), tableController.getAll);
router.get("/:id", verifyToken, checkRole("admin", "kasir"), tableController.getById);

// Admin kelola meja
router.post("/", verifyToken, checkRole("admin"), tableController.create);
router.put("/:id", verifyToken, checkRole("admin"), tableController.update);
router.delete("/:id", verifyToken, checkRole("admin"), tableController.remove);

// Kasir/admin ubah status (occupied / available)
router.patch("/:id/status", verifyToken, checkRole("admin", "kasir"), tableController.setStatus);

module.exports = router;