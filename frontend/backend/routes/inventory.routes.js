const router = require("express").Router();
const ingredientController = require("../controllers/ingredient.controllers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

// Semua staff (admin & kasir) boleh lihat stok
router.get("/", verifyToken, ingredientController.getAll);
router.get("/low-stock", verifyToken, ingredientController.getLowStock);
router.get("/logs", verifyToken, ingredientController.getStockLogs);
router.get("/:id", verifyToken, ingredientController.getById);

// Hanya admin yang boleh ubah data bahan baku & stok
router.post("/", verifyToken, checkRole("admin"), ingredientController.create);
router.put("/:id", verifyToken, checkRole("admin"), ingredientController.update);
router.delete("/:id", verifyToken, checkRole("admin"), ingredientController.remove);
router.post("/:id/adjust", verifyToken, checkRole("admin"), ingredientController.adjustStock);

module.exports = router;
