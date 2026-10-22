const { body, validationResult } = require("express-validator");

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: errors.array()[0].msg,
      errors: errors.array()
    });
  }
  next();
};

exports.storeLeadValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("mobileNumber")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required"),

  // Optional extended details
  body("occupationCategory").optional({ nullable: true }).isString(),
  body("designation").optional({ nullable: true }).isString(),
  body("organization").optional({ nullable: true }).isString(),
  body("preferredConfiguration").optional({ nullable: true }).isString(),
  body("estimatedBudget").optional({ nullable: true }).isString(),
  body("sourceOfVisit").optional({ nullable: true }).isString(),
  body("referredBy").optional({ nullable: true }).isString(),
  body("houseNo").optional({ nullable: true }).isString(),
  body("buildingOrSocietyName").optional({ nullable: true }).isString(),
  body("locality").optional({ nullable: true }).isString(),
  body("city").optional({ nullable: true }).isString(),
  body("pincode").optional({ nullable: true }).isString(),
  body("state").optional({ nullable: true }).isString(),
  body("country").optional({ nullable: true }).isString(),

  handleValidationErrors
];

exports.listLeadsValidator = [
  body("page")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  body("limit")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100"),
  body("search")
    .optional({ nullable: true })
    .isString()
    .withMessage("Search term must be a string"),
  body("status")
    .optional({ nullable: true })
    .isIn([0, 1])
    .withMessage("Status must be 0 or 1"),
  handleValidationErrors
];

exports.leadDetailsValidator = [
  body("id")
    .notEmpty()
    .withMessage("Lead ID is required")
    .isInt({ min: 1 })
    .withMessage("Lead ID must be a positive integer"),
  handleValidationErrors
];

exports.requestCallbackValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("mobileNumber")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required"),

  handleValidationErrors
];

exports.downloadBrochureValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("mobileNumber")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required"),

  handleValidationErrors
];

