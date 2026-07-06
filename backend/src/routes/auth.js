const { Router } = require("express");
const { register, login, getMe, registerStaff } = require("../controllers/authController");
const { registerRules, loginRules, registerStaffRules } = require("../validators/auth");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.get("/me", authenticate, getMe);
router.post("/register-staff", authenticate, authorize("ADMIN"), registerStaffRules, validate, registerStaff);

module.exports = router;
