const { body } = require("express-validator");

const createOnSiteRules = [
  body("restaurantId").notEmpty().withMessage("L'ID du restaurant est requis"),
  body("items").isArray({ min: 1 }).withMessage("Au moins un plat est requis"),
  body("items.*.menuItemId").notEmpty().withMessage("menuItemId requis pour chaque plat"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("La quantité doit être ≥ 1"),
  body("notes").optional().trim(),
];

const createRemoteRules = [
  body("restaurantId").notEmpty().withMessage("L'ID du restaurant est requis"),
  body("subType").isIn(["DELIVERY", "PICKUP"]).withMessage("subType doit être DELIVERY ou PICKUP"),
  body("items").isArray({ min: 1 }).withMessage("Au moins un plat est requis"),
  body("items.*.menuItemId").notEmpty().withMessage("menuItemId requis pour chaque plat"),
  body("items.*.quantity").isInt({ min: 1 }).withMessage("La quantité doit être ≥ 1"),
  body("deliveryAddress")
    .if(body("subType").equals("DELIVERY"))
    .notEmpty().withMessage("L'adresse de livraison est requise"),
  body("deliveryNeighborhood")
    .if(body("subType").equals("DELIVERY"))
    .optional().trim(),
  body("scheduledAt")
    .optional()
    .isISO8601().withMessage("Format de date invalide (ISO8601)"),
  body("notes").optional().trim(),
];

const updateStatusRules = [
  body("status").isIn([
    "CONFIRMED", "PREPARING", "READY",
    "OUT_FOR_DELIVERY", "DELIVERED", "READY_FOR_PICKUP",
  ]).withMessage("Statut invalide"),
];

module.exports = { createOnSiteRules, createRemoteRules, updateStatusRules };
