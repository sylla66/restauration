const { Router } = require("express");
const { sales, topItems, channelDistribution, cancellationRate, deliveryTimes, exportCSV } = require("../controllers/dashboardController");
const { authenticate, authorize } = require("../middleware/auth");

const router = Router();

router.get("/sales", authenticate, authorize("ADMIN", "GERANT"), sales);
router.get("/top-items", authenticate, authorize("ADMIN", "GERANT"), topItems);
router.get("/channels", authenticate, authorize("ADMIN", "GERANT"), channelDistribution);
router.get("/cancellations", authenticate, authorize("ADMIN", "GERANT"), cancellationRate);
router.get("/delivery-times", authenticate, authorize("ADMIN", "GERANT"), deliveryTimes);
router.get("/export", authenticate, authorize("ADMIN", "GERANT"), exportCSV);

module.exports = router;
