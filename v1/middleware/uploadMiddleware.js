const multer = require("multer");
const path = require("path");
const fs = require("fs");
const crypto = require("crypto");

const ALLOWED_MODULES = ["blogs", "resumes", "suppliers", "documents", "newsletter"];

const MODULE_CONFIG = {
  newsletter: {
    maxSize: 20 * 1024 * 1024,
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    allowedMimes: ["image/jpeg", "image/png", "image/webp"],
  },
  blogs: {
    maxSize: 20 * 1024 * 1024, // 5MB
    allowedExtensions: [".jpg", ".jpeg", ".png", ".webp"],
    allowedMimes: ["image/jpeg", "image/png", "image/webp"],
  },
  resumes: {
    maxSize: 15 * 1024 * 1024, // 15MB
    allowedExtensions: [".pdf", ".doc", ".docx"],
    allowedMimes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ],
  },
  suppliers: {
    maxSize: 30 * 1024 * 1024, // 30MB
    allowedExtensions: [
      ".pdf",
      ".doc",
      ".docx",
      ".xls",
      ".xlsx",
      ".csv",
      ".zip",
      ".jpg",
      ".jpeg",
      ".png",
      ".webp",
    ],
    allowedMimes: [
      "application/pdf",
      "application/msword",
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
      "application/vnd.ms-excel",
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "text/csv",
      "application/zip",
      "application/x-zip-compressed",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
  },
  documents: {
    maxSize: 20 * 1024 * 1024, // 15MB
    allowedExtensions: [".pdf", ".jpg", ".jpeg", ".png", ".webp"],
    allowedMimes: [
      "application/pdf",
      "image/jpeg",
      "image/png",
      "image/webp",
    ],
  },
};

// Storage configuration generator
const getStorage = (moduleName) => {
  const uploadDir = path.join(__dirname, "../../uploads", moduleName);
  if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
  }

  return multer.diskStorage({
    destination: (req, file, cb) => {
      cb(null, uploadDir);
    },
    filename: (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const uniqueSuffix = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}`;
      cb(null, `${moduleName}-${uniqueSuffix}${ext}`);
    },
  });
};

// Middleware factory for single or multiple uploads
const createUploadMiddleware = (isMultiple = false) => {
  return (req, res, next) => {
    const moduleName = (req.params.module || "documents").toLowerCase().trim();

    if (!ALLOWED_MODULES.includes(moduleName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid module '${moduleName}'. Allowed modules: ${ALLOWED_MODULES.join(", ")}`,
      });
    }

    const config = MODULE_CONFIG[moduleName] || MODULE_CONFIG.documents;
    const storage = getStorage(moduleName);

    const fileFilter = (req, file, cb) => {
      const ext = path.extname(file.originalname).toLowerCase();
      const mime = file.mimetype.toLowerCase();

      const isValidExt = config.allowedExtensions.includes(ext);
      const isValidMime = config.allowedMimes.includes(mime);

      if (isValidExt && isValidMime) {
        cb(null, true);
      } else {
        cb(
          new Error(
            `File type not allowed for ${moduleName}. Allowed extensions: ${config.allowedExtensions.join(", ")}`
          )
        );
      }
    };

    const upload = multer({
      storage,
      limits: { fileSize: config.maxSize },
      fileFilter,
    });

    const handler = isMultiple
      ? upload.array("files", 10)
      : upload.single("file");

    handler(req, res, (err) => {
      if (err instanceof multer.MulterError) {
        if (err.code === "LIMIT_FILE_SIZE") {
          return res.status(400).json({
            success: false,
            message: `File exceeds maximum allowed size of ${Math.round(config.maxSize / (1024 * 1024))}MB.`,
          });
        }
        return res.status(400).json({
          success: false,
          message: `Upload error: ${err.message}`,
        });
      } else if (err) {
        return res.status(400).json({
          success: false,
          message: err.message,
        });
      }
      next();
    });
  };
};

module.exports = {
  ALLOWED_MODULES,
  uploadSingle: createUploadMiddleware(false),
  uploadMultiple: createUploadMiddleware(true),
};
