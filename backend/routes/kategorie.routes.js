const router = require("express").Router();
const categoryController = require("../controllers/kategorie.controllers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

router.get("/", categoryController.getAll); // publik, dipakai app member untuk lihat menu
router.get("/:id", categoryController.getById);

router.post("/", verifyToken, checkRole("admin"), categoryController.create);
router.put("/:id", verifyToken, checkRole("admin"), categoryController.update);
router.delete("/:id", verifyToken, checkRole("admin"), categoryController.remove);

module.exports = router;
