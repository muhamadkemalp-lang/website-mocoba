const router = require("express").Router();
const equipmentController = require("../controllers/equipmet.controllers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

router.get("/", verifyToken, equipmentController.getAll);
router.get("/:id", verifyToken, equipmentController.getById);
router.post("/", verifyToken, checkRole("admin"), equipmentController.create);
router.put("/:id", verifyToken, checkRole("admin"), equipmentController.update);
router.delete("/:id", verifyToken, checkRole("admin"), equipmentController.remove);

module.exports = router;
