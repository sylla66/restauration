const { Router } = require("express");
const { list, getById, create, update, remove } = require("../controllers/categoryController");
const { categoryRules } = require("../validators/menu");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.get("/", list);
router.get("/:id", getById);
router.post("/", authenticate, authorize("ADMIN", "GERANT"), categoryRules, validate, create);
router.put("/:id", authenticate, authorize("ADMIN", "GERANT"), categoryRules, validate, update);
router.delete("/:id", authenticate, authorize("ADMIN", "GERANT"), remove);

module.exports = router;
