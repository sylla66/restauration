const { Router } = require("express");
const { create, listByRestaurant, listPending, moderate } = require("../controllers/reviewController");
const { createReviewRules, moderateReviewRules } = require("../validators/review");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.post("/", authenticate, createReviewRules, validate, create);
router.get("/restaurant/:restaurantId", listByRestaurant);
router.get("/pending", authenticate, authorize("ADMIN", "GERANT"), listPending);
router.patch("/:id/moderate", authenticate, authorize("ADMIN", "GERANT"), moderateReviewRules, validate, moderate);

module.exports = router;
