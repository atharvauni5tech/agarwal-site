const { Op } = require("sequelize");
const { Blog, User } = require("../../models");

// -------------------------------------------------------------
// POST /v1/blogs/create
// -------------------------------------------------------------
exports.createBlog = async (req, res) => {
  try {
    const {
      title,
      blogCategory,
      blogSummary,
      blogDescription,
      blogImageFileName,
      blogImageURL
    } = req.body;

    const userId = req.user ? req.user.id : null;

    const newBlog = await Blog.create({
      title,
      blogCategory,
      blogSummary: blogSummary || null,
      blogDescription,
      blogImageFileName: blogImageFileName || null,
      blogImageURL: blogImageURL || null,
      status: 1,
      createdBy: userId,
      updatedBy: userId
    });

    const populatedBlog = await Blog.findByPk(newBlog.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "role"]
        }
      ]
    });

    return res.status(201).json({
      success: true,
      message: "Blog created successfully",
      data: populatedBlog
    });
  } catch (error) {
    console.error("Error in createBlog:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create blog"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/blogs/list
// -------------------------------------------------------------
exports.listBlogs = async (req, res) => {
  try {
    const page = parseInt(req.body.page, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { category, search } = req.body;

    const whereClause = {
      status: 1
    };

    if (category) {
      whereClause.blogCategory = category;
    }

    if (search && search.trim() !== "") {
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${search.trim()}%` } },
        { blogSummary: { [Op.like]: `%${search.trim()}%` } },
        { blogCategory: { [Op.like]: `%${search.trim()}%` } }
      ];
    }

    const { count, rows: blogs } = await Blog.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "role"]
        }
      ]
    });

    return res.status(200).json({
      success: true,
      data: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit) || 1,
        currentPage: page,
        pageSize: limit,
        blogs
      }
    });
  } catch (error) {
    console.error("Error in listBlogs:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blogs"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/blogs/details
// -------------------------------------------------------------
exports.blogDetails = async (req, res) => {
  try {
    const { id } = req.body;

    const blog = await Blog.findOne({
      where: { id, status: 1 },
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "role"]
        },
        {
          model: User,
          as: "updater",
          attributes: ["id", "name", "email", "role"]
        }
      ]
    });

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: blog
    });
  } catch (error) {
    console.error("Error in blogDetails:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch blog details"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/blogs/update
// -------------------------------------------------------------
exports.updateBlog = async (req, res) => {
  try {
    const {
      id,
      title,
      blogCategory,
      blogSummary,
      blogDescription,
      blogImageFileName,
      blogImageURL,
      status
    } = req.body;

    const blog = await Blog.findByPk(id);

    if (!blog) {
      return res.status(404).json({
        success: false,
        message: "Blog not found"
      });
    }

    const userId = req.user ? req.user.id : null;

    if (title !== undefined) blog.title = title;
    if (blogCategory !== undefined) blog.blogCategory = blogCategory;
    if (blogSummary !== undefined) blog.blogSummary = blogSummary;
    if (blogDescription !== undefined) blog.blogDescription = blogDescription;
    if (blogImageFileName !== undefined) blog.blogImageFileName = blogImageFileName;
    if (blogImageURL !== undefined) blog.blogImageURL = blogImageURL;
    if (status !== undefined) blog.status = status;
    blog.updatedBy = userId;

    await blog.save();

    const updatedBlog = await Blog.findByPk(id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "role"]
        },
        {
          model: User,
          as: "updater",
          attributes: ["id", "name", "email", "role"]
        }
      ]
    });

    return res.status(200).json({
      success: true,
      message: "Blog updated successfully",
      data: updatedBlog
    });
  } catch (error) {
    console.error("Error in updateBlog:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update blog"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/blogs/delete (Soft Delete)
// -------------------------------------------------------------
exports.deleteBlog = async (req, res) => {
  try {
    const { id } = req.body;

    const blog = await Blog.findByPk(id);

    if (!blog || blog.status === 0) {
      return res.status(404).json({
        success: false,
        message: "Blog not found or already deleted"
      });
    }

    const userId = req.user ? req.user.id : null;

    blog.status = 0; // Soft delete
    blog.updatedBy = userId;
    await blog.save();

    return res.status(200).json({
      success: true,
      message: "Blog deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteBlog:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete blog"
    });
  }
};
