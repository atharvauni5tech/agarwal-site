require("dotenv").config();

const express = require("express");
const baseRoute = require("./routes");
const jwt = require("jsonwebtoken");
const cors = require("cors");
const UAParser = require("ua-parser-js");
const morgan = require("morgan");
const winston = require("winston");
require("winston-daily-rotate-file");
const path = require("path");
const mongoose = require("mongoose");

// ------------------------------
// Winston Logger Setup
// ------------------------------
const transportAll = new winston.transports.DailyRotateFile({
  filename: path.join("logs", "app-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "info",
});

const transportError = new winston.transports.DailyRotateFile({
  filename: path.join("logs", "error-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "error",
});

const transportRequest = new winston.transports.DailyRotateFile({
  filename: path.join("logs", "request-%DATE%.log"),
  datePattern: "YYYY-MM-DD",
  zippedArchive: true,
  maxSize: "20m",
  maxFiles: "14d",
  level: "info",
});

// ------------------------------
// General Logger
// ------------------------------
const logger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.printf(
      (info) =>
        `${info.timestamp} [${info.level.toUpperCase()}]: ${info.message}`
    )
  ),
  transports: [
    transportAll,
    transportError,
    new winston.transports.Console({
      format: winston.format.simple(),
    }),
  ],
});

// ------------------------------
// Request Logger
// ------------------------------
const requestLogger = winston.createLogger({
  format: winston.format.combine(
    winston.format.timestamp({ format: "YYYY-MM-DD HH:mm:ss" }),
    winston.format.json()
  ),
  transports: [transportRequest],
});

// ------------------------------
// Safe JSON stringify
// ------------------------------
const safeStringify = (obj) => {
  if (obj instanceof Error) {
    return obj.stack || obj.message || String(obj);
  }
  try {
    return JSON.stringify(obj);
  } catch (e) {
    return String(obj);
  }
};

// ------------------------------
// Override console logs
// ------------------------------
console.log = (...args) =>
  logger.info(
    args
      .map((a) => (typeof a === "object" ? safeStringify(a) : a))
      .join(" ")
  );

console.info = console.log;

console.warn = (...args) =>
  logger.warn(
    args
      .map((a) => (typeof a === "object" ? safeStringify(a) : a))
      .join(" ")
  );

console.error = (...args) =>
  logger.error(
    args
      .map((a) => (typeof a === "object" ? safeStringify(a) : a))
      .join(" ")
  );

logger.stream = {
  write: (message) => logger.info(message.trim()),
};

// ------------------------------
// MongoDB Connection
// ------------------------------
/* try {
  mongoose.connect(process.env.MONGODB_URL);

  mongoose.connection.once("open", () => {
    console.log("MongoDB connected");
  });
} catch (err) {
  console.error(err);
}*/

// ------------------------------
// Start Server
// ------------------------------
async function startServer(options) {
  const app = express();
  const port = process.env.PORT || 3000;

  app.use(cors());
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));

  // ------------------------------
  // Request context middleware
  // ------------------------------
  app.use((req, res, next) => {
    const ua = new UAParser(req.headers["user-agent"]).getResult();

    const ip =
      (req.headers["x-forwarded-for"] || "").split(",")[0] ||
      req.socket?.remoteAddress ||
      req.ip ||
      "Unknown";

    res.on("finish", () => {
      const log = {
        timestamp: new Date().toISOString(),

        ip_address: ip,

        browser: ua.browser?.name || "Unknown",
        browser_version: ua.browser?.version || "Unknown",
        os: ua.os?.name || "Unknown",
        mobile: ua.device?.type || "Desktop",

        agent: req.headers["user-agent"] || "Unknown",
        route: req.originalUrl,
        method: req.method,

        request: {
          body: Object.keys(req.body || {}).length ? req.body : null,
          params: Object.keys(req.params || {}).length ? req.params : null,
          query: Object.keys(req.query || {}).length ? req.query : null,
        },

        response: {
          statusCode: res.statusCode,
          headers: res.getHeaders(),
          contentLength: res.getHeader("content-length") || null,
          contentType: res.getHeader("content-type") || null,
        },

        user: req.user || null,
      };

      if (res.statusCode >= 500) {
        requestLogger.error(log);
      } else if (res.statusCode >= 400) {
        requestLogger.warn(log);
      } else {
        requestLogger.info(log);
      }
    });

    next();
  });

  // ------------------------------
  // Morgan HTTP logger
  // ------------------------------
  app.use(
    morgan("combined", {
      stream: {
        write: (message) => requestLogger.info(message.trim()),
      },
    })
  );

  // ------------------------------
  // Routes
  // ------------------------------
  app.use("/", baseRoute);

  // ------------------------------
  // Error Handler
  // ------------------------------
  app.use(function (err, req, res, next) {
    res.contentType("application/json");

    res.status(err.status || 500).send({
      errCode: err.status || 500,
      errMsg: err?.message?.errmsg || err.message,
    });

    console.error(err.message || err);
  });

  // ------------------------------
  // Start App
  // ------------------------------
  await app.listen(port, () => {
    console.log(`App listening on port ${port}`);
  });
}

startServer();
