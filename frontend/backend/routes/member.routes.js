const router = require("express").Router();
const memberController = require("../controllers/member.controllers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

router.get("/", verifyToken, checkRole("admin", "kasir"), memberController.getAll);
router.get("/:id", verifyToken, checkRole("admin", "kasir"), memberController.getById);
router.post("/:id/points", verifyToken, checkRole("admin"), memberController.adjustPoints);

module.exports = router;
