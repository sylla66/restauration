const { body } = require("express-validator");

const restaurantRules = [
  body("name").trim().notEmpty().withMessage("Le nom est requis"),
  body("address").trim().notEmpty().withMessage("L'adresse est requise"),
  body("phone").trim().notEmpty().withMessage("Le téléphone est requis"),
];

module.exports = { restaurantRules };
