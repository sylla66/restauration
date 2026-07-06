const { body } = require("express-validator");

const createComplaintRules = [
  body("orderId").notEmpty().withMessage("orderId requis"),
  body("reason").notEmpty().withMessage("Le motif est requis"),
  body("description").optional().trim(),
];

const updateComplaintStatusRules = [
  body("status")
    .isIn(["DISPUTED", "RESOLVED", "DISMISSED"])
    .withMessage("Statut invalide"),
  body("resolution").optional().trim(),
];

module.exports = { createComplaintRules, updateComplaintStatusRules };
