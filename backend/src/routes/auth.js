const { Router } = require("express");
const { register, login, getMe, registerStaff, updateProfile } = require("../controllers/authController");
const { registerRules, loginRules, registerStaffRules, updateProfileRules } = require("../validators/auth");
const validate = require("../middleware/validate");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.post("/register", registerRules, validate, register);
router.post("/login", loginRules, validate, login);
router.get("/me", authenticate, getMe);
router.post("/register-staff", authenticate, authorize("ADMIN"), registerStaffRules, validate, registerStaff);
router.patch("/me", authenticate, updateProfileRules, validate, updateProfile);

module.exports = router;
