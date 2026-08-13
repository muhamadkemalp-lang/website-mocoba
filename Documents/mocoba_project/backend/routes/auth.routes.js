const router = require("express").Router();

const authController = require("../controllers/auth.controllers");
const authMiddleware = require("../middleware/auth");

router.post("/register", authController.register);

router.post("/login", authController.login);

router.get("/profile", authMiddleware.verifyToken, authController.profile);

module.exports = router;