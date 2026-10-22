const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("./validator");
const { authenticateToken } = require("../middleware/authMiddleware");

// Customer Registration (Full Lead + Lead Details)
router.post("/store", authenticateToken, validator.storeLeadValidator, controller.storeLead);

// Immediate Callback Request (Lead Model only: fullName, email, mobileNumber)
router.post("/request-callback", validator.requestCallbackValidator, controller.requestCallback);

// Brochure Download Request (Lead Model only: fullName, email, mobileNumber)
router.post("/download-brochure", validator.downloadBrochureValidator, controller.downloadBrochure);

// Admin APIs
router.post("/list", authenticateToken, validator.listLeadsValidator, controller.listLeads);
router.post("/details", authenticateToken, validator.leadDetailsValidator, controller.leadDetails);

module.exports = router;
