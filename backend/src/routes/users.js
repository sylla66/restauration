const { Router } = require("express");
const { list, toggleActive } = require("../controllers/userController");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.get("/", authenticate, authorize("ADMIN"), list);
router.patch("/:id/toggle", authenticate, authorize("ADMIN"), toggleActive);

module.exports = router;
