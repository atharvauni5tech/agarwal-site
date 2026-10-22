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

exports.channelPartnerValidator = [
  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Full name is required"),

  body("firmOrCompanyName")
    .trim()
    .notEmpty()
    .withMessage("Firm / Company name is required"),

  body("reraRegNo")
    .trim()
    .notEmpty()
    .withMessage("RERA registration number is required"),

  body("mobileNumber")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("cityOfOperation")
    .trim()
    .notEmpty()
    .withMessage("City of operation is required"),

  handleValidationErrors
];

exports.supplierValidator = [
  body("supplierName")
    .trim()
    .notEmpty()
    .withMessage("Supplier / Contact person name is required"),

  body("companyName")
    .trim()
    .notEmpty()
    .withMessage("Company name is required"),

  body("mobileNumber")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("address").optional({ nullable: true }).isString(),
  body("website").optional({ nullable: true }).isString(),
  body("serviceCategories").optional({ nullable: true }),
  body("yearsOfExperience").optional({ nullable: true }).isString(),
  body("areaOfOperation").optional({ nullable: true }).isString(),
  body("majorClientServed").optional({ nullable: true }).isString(),
  body("companyProfileAttachment").optional({ nullable: true }).isString(),
  body("productCatalogueAttachment").optional({ nullable: true }).isString(),
  body("rateListAttachment").optional({ nullable: true }).isString(),
  body("projectPortfolioAttachment").optional({ nullable: true }).isString(),
  body("relevantLicencesAttachment").optional({ nullable: true }).isString(),
  body("otherSupportingAttachment").optional({ nullable: true }).isString(),

  handleValidationErrors
];

exports.careerValidator = [
  body("appliedForPosition")
    .trim()
    .notEmpty()
    .withMessage("Applied for position is required"),

  body("fullName")
    .trim()
    .notEmpty()
    .withMessage("Candidate full name is required"),

  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email address is required")
    .isEmail()
    .withMessage("Must be a valid email address"),

  body("mobileNumber")
    .trim()
    .notEmpty()
    .withMessage("Mobile number is required"),

  body("resumeUploadLink")
    .trim()
    .notEmpty()
    .withMessage("Resume upload link is required"),

  handleValidationErrors
];

exports.listValidator = [
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
