const { body, validationResult } = require("express-validator");

const validateResult = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      errors: errors.array().map(err => ({
        field: err.path || err.param,
        message: err.msg
      }))
    });
  }
  next();
};

exports.registerBrokerValidator = [
  body("broker_name")
    .notEmpty()
    .withMessage("Broker name is required"),

  body("email")
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Invalid email address"),

  body("mobile_number")
    .notEmpty()
    .withMessage("Mobile number is required")
    .isMobilePhone()
    .withMessage("Invalid mobile number"),

  body("pan_number")
    .notEmpty()
    .withMessage("PAN number is required")
    .matches(/^[A-Z]{5}[0-9]{4}[A-Z]{1}$/)
    .withMessage("Invalid PAN number format (e.g. ABCDE1234F)"),

  body("city")
    .notEmpty()
    .withMessage("City is required"),

  body("state")
    .notEmpty()
    .withMessage("State is required"),

  body("pincode")
    .notEmpty()
    .withMessage("Pincode is required")
    .isLength({ min: 6, max: 6 })
    .withMessage("Pincode must be a 6 digit number"),

  validateResult
];

exports.requestOtpValidator = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),

  body("mobile_number")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid mobile number"),
  
  validateResult
];

exports.verifyOtpValidator = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),

  body("mobile_number")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid mobile number"),

  body("otp")
    .notEmpty()
    .withMessage("OTP is required")
    .isLength({ min: 4, max: 6 })
    .withMessage("OTP must be 4 to 6 characters long"),

  validateResult
];

exports.loginRequestOtpValidator = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),

  body("mobile_number")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid mobile number"),

  validateResult
];

exports.loginVerifyOtpValidator = [
  body("email")
    .optional()
    .isEmail()
    .withMessage("Invalid email address"),

  body("mobile_number")
    .optional()
    .isMobilePhone()
    .withMessage("Invalid mobile number"),

  body("otp")
    .notEmpty()
    .withMessage("OTP is required"),

  validateResult
];
