const { Router } = require("express");
const { list, getById, create, update, remove } = require("../controllers/categoryController");
const { categoryRules } = require("../validators/menu");
const validate = require("../middleware/validate");
const { authenticate, authorize, restrictToOwnRestaurant } = require("../middleware/auth");

const router = Router();

router.get("/", list);
router.get("/:id", getById);
router.post("/", authenticate, authorize("ADMIN", "GERANT"), restrictToOwnRestaurant, categoryRules, validate, create);
router.put("/:id", authenticate, authorize("ADMIN", "GERANT"), restrictToOwnRestaurant, categoryRules, validate, update);
router.delete("/:id", authenticate, authorize("ADMIN", "GERANT"), restrictToOwnRestaurant, remove);

module.exports = router;
