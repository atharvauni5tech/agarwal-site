const jwt = require("jsonwebtoken");
const { User } = require("../../models");

exports.authenticateToken = async (req, res, next) => {
  const authHeader = req.headers["authorization"] || req.headers["Authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ")
    ? authHeader.slice(7).trim()
    : (authHeader || req.query.token);

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token is missing or unauthorized"
    });
  }

  try {
    const accessSecret = process.env.JWT_ACCESS_SECRET;
    const decoded = jwt.verify(token, accessSecret);

    const user = await User.findByPk(decoded.id);

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "User not found or account removed"
      });
    }

    if (user.status === 0) {
      return res.status(403).json({
        success: false,
        message: "Access Revoked: Your account has been deactivated."
      });
    }

    if (user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        message: "Access denied. Only administrators are authorized."
      });
    }

    req.user = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status
    };

    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token is invalid or expired"
    });
  }
};

