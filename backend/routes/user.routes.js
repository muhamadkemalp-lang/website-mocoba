const router = require("express").Router();
const userController = require("../controllers/user.controllers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

// Semua endpoint di sini khusus admin (mengelola akun staff)
router.get("/", verifyToken, checkRole("admin"), userController.getStaff);
router.post("/", verifyToken, checkRole("admin"), userController.createStaff);
router.put("/:id", verifyToken, checkRole("admin"), userController.updateStaff);
router.delete("/:id", verifyToken, checkRole("admin"), userController.deleteStaff);

module.exports = router;
