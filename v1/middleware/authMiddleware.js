const jwt = require("jsonwebtoken");

exports.authenticateToken = (req, res, next) => {
  const token = req.headers["authorization"] || req.query.token;

  if (!token) {
    return res.status(401).json({
      success: false,
      message: "Access token is missing or invalid"
    });
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET
    );
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(403).json({
      success: false,
      message: "Token is invalid or expired"
    });
  }
};

exports.isBroker = (req, res, next) => {
  if (!req.user || req.user.role !== "BROKER") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only brokers are authorized."
    });
  }
  next();
};

exports.isAdmin = (req, res, next) => {
  if (!req.user || req.user.role !== "ADMIN") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only administrators are authorized."
    });
  }
  next();
};

exports.isSales = (req, res, next) => {
  if (!req.user || req.user.role !== "SALES") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only sales executives are authorized."
    });
  }
  next();
};

exports.isCalling = (req, res, next) => {
  if (!req.user || req.user.role !== "CALLING") {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only calling agents are authorized."
    });
  }
  next();
};

exports.isReceptionist = (req, res, next) => {
  if (!req.user || (req.user.role !== "RECEIPTIONIST" && req.user.role !== "RECEPTIONIST")) {
    return res.status(403).json({
      success: false,
      message: "Access denied. Only receptionists are authorized."
    });
  }
  next();
};

exports.validateCronToken = (req, res, next) => {
  const cronSecret = process.env.CRON_SECRET_TOKEN;
  if (!cronSecret) {
    return res.status(500).json({
      success: false,
      message: "Cron secret token is not configured on the server"
    });
  }

  const token = req.headers["x-cron-token"];
  if (!token || token !== cronSecret) {
    return res.status(401).json({
      success: false,
      message: "Unauthorized: Invalid or missing x-cron-token header"
    });
  }
  next();
};

