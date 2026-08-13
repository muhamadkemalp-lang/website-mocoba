const router = require("express").Router();
const recipeController = require("../controllers/recipe.controllers");
const { verifyToken } = require("../middleware/auth");
const { checkRole } = require("../middleware/role");

router.get("/:productID", verifyToken, recipeController.getByProduct);
router.post("/", verifyToken, checkRole("admin"), recipeController.create);
router.put("/:productID", verifyToken, checkRole("admin"), recipeController.update);
router.delete("/:productID", verifyToken, checkRole("admin"), recipeController.remove);

module.exports = router;
