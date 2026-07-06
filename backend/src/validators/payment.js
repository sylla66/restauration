const { body } = require("express-validator");

const initiatePaymentRules = [
  body("orderId").notEmpty().withMessage("orderId requis"),
  body("method").isIn(["WAVE", "ORANGE_MONEY", "CASH", "MOBILE_MONEY"]).withMessage("Méthode invalide"),
];

const confirmDeliveryRules = [
  body("orderId").notEmpty().withMessage("orderId requis"),
];

module.exports = { initiatePaymentRules, confirmDeliveryRules };
