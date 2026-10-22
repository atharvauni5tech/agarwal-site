const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("./validator");
const { authenticateToken } = require("../middleware/authMiddleware");

// All endpoints strictly use the POST method
router.post("/create", authenticateToken, validator.createBlogValidator, controller.createBlog);
router.post("/list", validator.listBlogsValidator, controller.listBlogs);
router.post("/details", validator.blogDetailsValidator, controller.blogDetails);
router.post("/update", authenticateToken, validator.updateBlogValidator, controller.updateBlog);
router.post("/delete", authenticateToken, validator.deleteBlogValidator, controller.deleteBlog);

module.exports = router;
