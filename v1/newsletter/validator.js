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

// ================= SUBSCRIBER VALIDATORS =================
exports.subscribeValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("source")
    .optional({ nullable: true })
    .trim()
    .isString()
    .isLength({ max: 100 })
    .withMessage("Source must not exceed 100 characters"),

  handleValidationErrors
];

exports.unsubscribeValidator = [
  body("email")
    .trim()
    .notEmpty()
    .withMessage("Email is required")
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  handleValidationErrors
];

exports.listSubscribersValidator = [
  body("page")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  body("limit")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  body("search")
    .optional({ nullable: true })
    .isString(),

  body("status")
    .optional({ nullable: true })
    .isIn([0, 1, "0", "1"])
    .withMessage("Status must be 0 (unsubscribed) or 1 (subscribed)"),

  handleValidationErrors
];

exports.adminUnsubscribeValidator = [
  body("id")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("ID must be a positive integer"),

  body("email")
    .optional({ nullable: true })
    .trim()
    .isEmail()
    .withMessage("Must be a valid email address")
    .normalizeEmail(),

  body("status")
    .optional({ nullable: true })
    .isIn([0, 1, "0", "1"])
    .withMessage("Status must be 0 (unsubscribed) or 1 (subscribed)"),

  body().custom((value, { req }) => {
    if (!req.body.id && !req.body.email) {
      throw new Error("Either subscriber 'id' or 'email' must be provided");
    }
    return true;
  }),

  handleValidationErrors
];

// ================= NEWSLETTER CRUD VALIDATORS =================
exports.createNewsletterValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required")
    .isLength({ max: 255 })
    .withMessage("Title must not exceed 255 characters"),

  body("subtitle")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Subtitle must not exceed 255 characters"),

  body("image")
    .optional({ nullable: true })
    .trim(),

  body("imageRedirectUrl")
    .optional({ nullable: true })
    .trim(),

  body("description")
    .trim()
    .notEmpty()
    .withMessage("Description is required"),

  body("htmlContent")
    .optional({ nullable: true })
    .trim(),

  handleValidationErrors
];

exports.updateNewsletterValidator = [
  body("id")
    .notEmpty()
    .withMessage("Newsletter ID is required")
    .isInt({ min: 1 })
    .withMessage("Newsletter ID must be a positive integer"),

  body("title")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty")
    .isLength({ max: 255 })
    .withMessage("Title must not exceed 255 characters"),

  body("subtitle")
    .optional({ nullable: true })
    .trim()
    .isLength({ max: 255 })
    .withMessage("Subtitle must not exceed 255 characters"),

  body("image")
    .optional({ nullable: true })
    .trim(),

  body("imageRedirectUrl")
    .optional({ nullable: true })
    .trim(),

  body("description")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage("Description cannot be empty"),

  body("htmlContent")
    .optional({ nullable: true })
    .trim(),

  body("status")
    .optional({ nullable: true })
    .isIn([0, 1, "0", "1"])
    .withMessage("Status must be 0 (inactive/draft) or 1 (published)"),

  handleValidationErrors
];

exports.newsletterDetailsValidator = [
  body("id")
    .notEmpty()
    .withMessage("Newsletter ID is required")
    .isInt({ min: 1 })
    .withMessage("Newsletter ID must be a positive integer"),

  handleValidationErrors
];

exports.deleteNewsletterValidator = [
  body("id")
    .notEmpty()
    .withMessage("Newsletter ID is required")
    .isInt({ min: 1 })
    .withMessage("Newsletter ID must be a positive integer"),

  handleValidationErrors
];

exports.listNewslettersValidator = [
  body("page")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),

  body("limit")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be between 1 and 100"),

  body("search")
    .optional({ nullable: true })
    .isString(),

  body("status")
    .optional({ nullable: true })
    .isIn([0, 1, "0", "1"])
    .withMessage("Status must be 0 or 1"),

  handleValidationErrors
];
