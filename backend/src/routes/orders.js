const { Router } = require("express");
const { createOnSite, createRemote, list, getById, updateStatus, cancel } = require("../controllers/orderController");
const { createOnSiteRules, createRemoteRules, updateStatusRules } = require("../validators/order");
const validate = require("../middleware/validate");
const { authenticate, optionalAuth, authorize } = require("../middleware/auth");

const router = Router();

router.get("/", authenticate, list);
router.get("/:id", authenticate, getById);
router.post("/on-site", optionalAuth, createOnSiteRules, validate, createOnSite);
router.post("/remote", optionalAuth, createRemoteRules, validate, createRemote);
router.patch("/:id/status", authenticate, authorize("ADMIN", "GERANT"), updateStatusRules, validate, updateStatus);
router.patch("/:id/cancel", authenticate, cancel);

module.exports = router;
