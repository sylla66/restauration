const { Router } = require("express");
const { list, getById, create, update, toggleAvailability, remove } = require("../controllers/menuItemController");
const { menuItemRules } = require("../validators/menu");
const validate = require("../middleware/validate");
const { authenticate, authorize, restrictToOwnRestaurant } = require("../middleware/auth");

const router = Router();

router.get("/", list);
router.get("/:id", getById);
router.post("/", authenticate, authorize("ADMIN", "GERANT"), restrictToOwnRestaurant, menuItemRules, validate, create);
router.put("/:id", authenticate, authorize("ADMIN", "GERANT"), restrictToOwnRestaurant, menuItemRules, validate, update);
router.patch("/:id/toggle", authenticate, authorize("ADMIN", "GERANT"), restrictToOwnRestaurant, toggleAvailability);
router.delete("/:id", authenticate, authorize("ADMIN", "GERANT"), restrictToOwnRestaurant, remove);

module.exports = router;
