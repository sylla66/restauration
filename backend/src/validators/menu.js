const { body } = require("express-validator");

const categoryRules = [
  body("name").trim().notEmpty().withMessage("Le nom de la catégorie est requis"),
  body("restaurantId").notEmpty().withMessage("L'ID du restaurant est requis"),
  body("sortOrder").optional().isInt({ min: 0 }).withMessage("sortOrder doit être un entier positif"),
];

const menuItemRules = [
  body("name").trim().notEmpty().withMessage("Le nom du plat est requis"),
  body("price").isFloat({ min: 0 }).withMessage("Le prix doit être un nombre positif"),
  body("categoryId").notEmpty().withMessage("La catégorie est requise"),
  body("restaurantId").notEmpty().withMessage("L'ID du restaurant est requis"),
  body("description").optional().trim(),
  body("image").optional().isString(),
  body("stock").optional().isInt({ min: 0 }),
];

module.exports = { categoryRules, menuItemRules };
