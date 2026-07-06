const { Router } = require("express");
const { list, getById, create, update, seed, remove } = require("../controllers/restaurantController");
const { restaurantRules } = require("../validators/restaurant");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.get("/", list);
router.get("/:id", getById);
router.post("/", authenticate, authorize("ADMIN"), restaurantRules, validate, create);
router.post("/seed", seed);
router.put("/:id", authenticate, authorize("ADMIN"), restaurantRules, validate, update);
router.delete("/:id", authenticate, authorize("ADMIN"), remove);

module.exports = router;
