const { Router } = require("express");
const { create, list, updateStatus } = require("../controllers/complaintController");
const { createComplaintRules, updateComplaintStatusRules } = require("../validators/complaint");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.post("/", authenticate, createComplaintRules, validate, create);
router.get("/", authenticate, list);
router.patch("/:id/status", authenticate, authorize("ADMIN", "GERANT"), updateComplaintStatusRules, validate, updateStatus);

module.exports = router;
