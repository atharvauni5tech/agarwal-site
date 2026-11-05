const path = require("path");
const fs = require("fs");
const { ALLOWED_MODULES } = require("../middleware/uploadMiddleware");

// Helper to determine active base URL
const getBaseUrl = (req) => {
  if (process.env.APP_BASE_URL) {
    return process.env.APP_BASE_URL.replace(/\/+$/, "");
  }
  const protocol = req.protocol || "http";
  const host = req.get("host") || `localhost:${process.env.PORT || 3010}`;
  return `${protocol}://${host}`;
};

// -------------------------------------------------------------
// POST /v1/files/upload/:module (Single File Upload)
// -------------------------------------------------------------
exports.uploadSingleFile = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file was uploaded. Please provide a file under the 'file' field.",
      });
    }

    const moduleName = req.params.module.toLowerCase().trim();
    const baseUrl = getBaseUrl(req);
    const relativePath = `/uploads/${moduleName}/${req.file.filename}`;
    const fileURL = `${baseUrl}${relativePath}`;

    return res.status(201).json({
      success: true,
      message: "File uploaded successfully",
      data: {
        fileName: req.file.filename,
        originalName: req.file.originalname,
        fileURL,
        relativePath,
        mimetype: req.file.mimetype,
        size: req.file.size,
      },
    });
  } catch (error) {
    console.error("Error in uploadSingleFile:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload file.",
    });
  }
};

// -------------------------------------------------------------
// POST /v1/files/upload-multiple/:module (Multiple Files Upload)
// -------------------------------------------------------------
exports.uploadMultipleFiles = async (req, res) => {
  try {
    if (!req.files || req.files.length === 0) {
      return res.status(400).json({
        success: false,
        message: "No files were uploaded. Please provide files under the 'files' field.",
      });
    }

    const moduleName = req.params.module.toLowerCase().trim();
    const baseUrl = getBaseUrl(req);

    const uploadedFiles = req.files.map((file) => {
      const relativePath = `/uploads/${moduleName}/${file.filename}`;
      return {
        fileName: file.filename,
        originalName: file.originalname,
        fileURL: `${baseUrl}${relativePath}`,
        relativePath,
        mimetype: file.mimetype,
        size: file.size,
      };
    });

    return res.status(201).json({
      success: true,
      message: `${uploadedFiles.length} file(s) uploaded successfully`,
      data: uploadedFiles,
    });
  } catch (error) {
    console.error("Error in uploadMultipleFiles:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to upload files.",
    });
  }
};

// -------------------------------------------------------------
// GET /v1/files/:module/:filename (View inline or Force Download)
// -------------------------------------------------------------
exports.getFile = async (req, res) => {
  try {
    const moduleName = req.params.module.toLowerCase().trim();
    const rawFilename = req.params.filename;

    if (!ALLOWED_MODULES.includes(moduleName)) {
      return res.status(400).json({
        success: false,
        message: `Invalid module '${moduleName}'.`,
      });
    }

    // Neutralize directory traversal (e.g., ../../etc/passwd)
    const sanitizedFilename = path.basename(rawFilename);
    const filePath = path.join(__dirname, "../../uploads", moduleName, sanitizedFilename);

    if (!fs.existsSync(filePath)) {
      return res.status(404).json({
        success: false,
        message: "File not found.",
      });
    }

    // If query ?download=true is passed, force browser attachment download
    if (req.query.download === "true") {
      return res.download(filePath, sanitizedFilename);
    }

    // Default: Render/stream inline in browser (opens PDFs & images in browser tab)
    return res.sendFile(filePath);
  } catch (error) {
    console.error("Error in getFile:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to retrieve file.",
    });
  }
};

