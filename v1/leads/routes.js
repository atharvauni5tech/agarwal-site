const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("./validator");
const { authenticateToken } = require("../middleware/authMiddleware");

router.post("/store", authenticateToken, validator.storeLeadValidator, controller.storeLead);
router.post("/request-callback", validator.requestCallbackValidator, controller.requestCallback);
router.post("/download-brochure", validator.downloadBrochureValidator, controller.downloadBrochure);
router.post("/list", authenticateToken, validator.listLeadsValidator, controller.listLeads);
router.post("/details", authenticateToken, validator.leadDetailsValidator, controller.leadDetails);

module.exports = router;
