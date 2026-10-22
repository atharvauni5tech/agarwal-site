const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("./validator");
const { authenticateToken } = require("../middleware/authMiddleware");

// Public Registration / Application APIs
router.post(
  "/channel-partner/register",
  validator.channelPartnerValidator,
  controller.registerChannelPartner
);

router.post(
  "/supplier/register",
  validator.supplierValidator,
  controller.registerSupplier
);

router.post(
  "/career/apply",
  validator.careerValidator,
  controller.applyCareer
);

// Admin Listing APIs
router.post(
  "/channel-partner/list",
  authenticateToken,
  validator.listValidator,
  controller.listChannelPartners
);

router.post(
  "/supplier/list",
  authenticateToken,
  validator.listValidator,
  controller.listSuppliers
);

router.post(
  "/career/list",
  authenticateToken,
  validator.listValidator,
  controller.listCareerApplications
);

module.exports = router;
