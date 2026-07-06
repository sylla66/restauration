const { body } = require("express-validator");

const registerRules = [
  body("name").trim().notEmpty().withMessage("Le nom est requis"),
  body("email").optional().isEmail().withMessage("Email invalide"),
  body("phone").trim().notEmpty().withMessage("Le téléphone est requis"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
];

const loginRules = [
  body("password").notEmpty().withMessage("Le mot de passe est requis"),
  body("phone").optional().trim().notEmpty(),
  body("email").optional().isEmail(),
  body().custom((body) => {
    if (!body.email && !body.phone) {
      throw new Error("Email ou téléphone requis");
    }
    return true;
  }),
];

const registerStaffRules = [
  body("name").trim().notEmpty().withMessage("Le nom est requis"),
  body("phone").trim().notEmpty().withMessage("Le téléphone est requis"),
  body("password")
    .isLength({ min: 6 })
    .withMessage("Le mot de passe doit contenir au moins 6 caractères"),
  body("role")
    .isIn(["LIVREUR", "GERANT"])
    .withMessage("Rôle doit être LIVREUR ou GERANT"),
];

module.exports = { registerRules, loginRules, registerStaffRules };
