const router = require("express").Router();
const productController = require("../controllers/product.controllers");
const upload = require("../middleware/upload");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

// Publik: dipakai app member & kasir untuk menampilkan menu
router.get("/", productController.getAll);
router.get("/available", productController.getAvailable);
router.get("/:id", productController.getById);

// Hanya admin yang boleh kelola menu (termasuk upload foto)
router.post("/", verifyToken, checkRole("admin"), upload.single("image"), productController.create);
router.put("/:id", verifyToken, checkRole("admin"), upload.single("image"), productController.update);
router.delete("/:id", verifyToken, checkRole("admin"), productController.remove);

module.exports = router;
