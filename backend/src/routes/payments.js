const { Router } = require("express");
const { initiate, confirmOnDelivery, webhook, listByOrder } = require("../controllers/paymentController");
const { initiatePaymentRules, confirmDeliveryRules } = require("../validators/payment");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.post("/init", authenticate, initiatePaymentRules, validate, initiate);
router.post("/confirm-delivery", authenticate, authorize("LIVREUR", "ADMIN", "GERANT"), confirmDeliveryRules, validate, confirmOnDelivery);
router.post("/webhook", webhook);
router.get("/order/:orderId", authenticate, listByOrder);

module.exports = router;
