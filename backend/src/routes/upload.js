const { Router } = require("express");
const upload = require("../config/upload");
const { upload: uploadHandler } = require("../controllers/uploadController");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.post("/", authenticate, authorize("ADMIN", "GERANT"), upload.single("file"), uploadHandler);

module.exports = router;
