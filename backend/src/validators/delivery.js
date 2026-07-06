const { body } = require("express-validator");

const assignRules = [
  body("orderId").notEmpty().withMessage("orderId requis"),
  body("deliveryPersonId").notEmpty().withMessage("deliveryPersonId requis"),
  body("estimatedTime").optional().isInt({ min: 1 }).withMessage("estimatedTime en minutes"),
];

const updateDeliveryStatusRules = [
  body("status").isIn(["picked_up", "in_transit", "delivered"]).withMessage("Statut invalide"),
];

module.exports = { assignRules, updateDeliveryStatusRules };
