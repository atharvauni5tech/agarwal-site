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

exports.createBlogValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Title is required"),
  body("blogCategory")
    .trim()
    .notEmpty()
    .withMessage("Blog category is required"),
  body("blogDescription")
    .trim()
    .notEmpty()
    .withMessage("Blog description is required"),
  body("blogSummary")
    .optional({ nullable: true })
    .isString()
    .withMessage("Blog summary must be a string"),
  body("blogImageFileName")
    .optional({ nullable: true })
    .isString()
    .withMessage("Image file name must be a string"),
  body("blogImageURL")
    .optional({ nullable: true })
    .isString()
    .withMessage("Image URL must be a string"),
  handleValidationErrors
];

exports.listBlogsValidator = [
  body("page")
    .optional({ nullable: true })
    .isInt({ min: 1 })
    .withMessage("Page must be a positive integer"),
  body("limit")
    .optional({ nullable: true })
    .isInt({ min: 1, max: 100 })
    .withMessage("Limit must be an integer between 1 and 100"),
  body("category")
    .optional({ nullable: true })
    .isString()
    .withMessage("Category must be a string"),
  body("search")
    .optional({ nullable: true })
    .isString()
    .withMessage("Search term must be a string"),
  handleValidationErrors
];

exports.blogDetailsValidator = [
  body("id")
    .notEmpty()
    .withMessage("Blog ID is required")
    .isInt({ min: 1 })
    .withMessage("Blog ID must be a positive integer"),
  handleValidationErrors
];

exports.updateBlogValidator = [
  body("id")
    .notEmpty()
    .withMessage("Blog ID is required")
    .isInt({ min: 1 })
    .withMessage("Blog ID must be a positive integer"),
  body("title")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage("Title cannot be empty"),
  body("blogCategory")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage("Blog category cannot be empty"),
  body("blogDescription")
    .optional({ nullable: true })
    .trim()
    .notEmpty()
    .withMessage("Blog description cannot be empty"),
  body("blogSummary")
    .optional({ nullable: true })
    .isString()
    .withMessage("Blog summary must be a string"),
  body("blogImageFileName")
    .optional({ nullable: true })
    .isString()
    .withMessage("Image file name must be a string"),
  body("blogImageURL")
    .optional({ nullable: true })
    .isString()
    .withMessage("Image URL must be a string"),
  body("status")
    .optional({ nullable: true })
    .isIn([0, 1])
    .withMessage("Status must be 1 (active) or 0 (deleted)"),
  handleValidationErrors
];

exports.deleteBlogValidator = [
  body("id")
    .notEmpty()
    .withMessage("Blog ID is required")
    .isInt({ min: 1 })
    .withMessage("Blog ID must be a positive integer"),
  handleValidationErrors
];
