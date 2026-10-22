const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("./validator");
const { authenticateToken } = require("../middleware/authMiddleware");

// Optional auth helper for logout: permits logout with either Authorization header or refreshToken in body
const optionalAuth = (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  if (authHeader) {
    return authenticateToken(req, res, next);
  }
  next();
};

router.post("/send-otp", validator.sendOtpValidator, controller.sendOtp);
router.post("/verify-otp", validator.verifyOtpValidator, controller.verifyOtp);
router.post("/refresh", validator.refreshValidator, controller.refreshToken);
router.post("/logout", optionalAuth, controller.logout);

module.exports = router;
