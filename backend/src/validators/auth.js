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
    .isIn(["LIVREUR", "GERANT", "ADMIN"])
    .withMessage("Rôle doit être LIVREUR, GERANT ou ADMIN"),
];

const updateProfileRules = [
  body("name").optional().trim().notEmpty().withMessage("Le nom ne peut pas être vide"),
  body("email").optional().isEmail().withMessage("Email invalide"),
  body("phone").optional().trim().notEmpty().withMessage("Le téléphone ne peut pas être vide"),
  body("currentPassword").optional().notEmpty().withMessage("Mot de passe actuel requis"),
  body("newPassword").optional().isLength({ min: 6 }).withMessage("Le nouveau mot de passe doit contenir au moins 6 caractères"),
  body().custom((body) => {
    if (body.newPassword && !body.currentPassword) throw new Error("Mot de passe actuel requis pour changer le mot de passe");
    return true;
  }),
];

module.exports = { registerRules, loginRules, registerStaffRules, updateProfileRules };
