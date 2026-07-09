const { Router } = require("express");
const { assign, updateStatus, list, getMyDeliveries, getByOrder, getById } = require("../controllers/deliveryController");
const { assignRules, updateDeliveryStatusRules } = require("../validators/delivery");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.get("/", authenticate, authorize("ADMIN", "GERANT"), list);
router.get("/my", authenticate, authorize("LIVREUR"), getMyDeliveries);
router.get("/:id", authenticate, getById);
router.get("/order/:orderId", authenticate, getByOrder);
router.post("/assign", authenticate, authorize("ADMIN", "GERANT"), assignRules, validate, assign);
router.patch("/:id/status", authenticate, authorize("LIVREUR", "ADMIN"), updateDeliveryStatusRules, validate, updateStatus);

module.exports = router;
