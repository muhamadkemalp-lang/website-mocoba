const router = require("express").Router();
const settingController = require("../controllers/setting.controllers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

router.get("/", verifyToken, settingController.get); // admin & kasir boleh baca (misal nama toko di struk)
router.put("/", verifyToken, checkRole("admin"), settingController.update);

module.exports = router;
