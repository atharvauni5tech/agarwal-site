const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("./validator");
const { authenticateToken, isBroker } = require("../middleware/authMiddleware");

router.post("/request-otp", validator.requestOtpValidator, controller.requestOtp);
router.post("/verify-otp", validator.verifyOtpValidator, controller.verifyOtp);

router.post("/register", validator.registerBrokerValidator, controller.registerBroker);

router.post("/login/request-otp", validator.loginRequestOtpValidator, controller.loginRequestOtp);
router.post("/login/verify-otp", validator.loginVerifyOtpValidator, controller.loginVerifyOtp);
router.post("/logout", authenticateToken, controller.logout);

router.get("/profile", authenticateToken, isBroker, controller.getBrokerProfile);

module.exports = router;
