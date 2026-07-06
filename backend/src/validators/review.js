const { body } = require("express-validator");

const createReviewRules = [
  body("orderId").notEmpty().withMessage("orderId requis"),
  body("rating").isInt({ min: 1, max: 5 }).withMessage("La note doit être entre 1 et 5"),
  body("comment").optional().trim(),
];

const moderateReviewRules = [
  body("moderationStatus")
    .isIn(["APPROVED", "REJECTED"])
    .withMessage("Statut doit être APPROVED ou REJECTED"),
];

module.exports = { createReviewRules, moderateReviewRules };
