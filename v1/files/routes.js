const express = require("express");
const router = express.Router();
const controller = require("./controller");
const { uploadSingle, uploadMultiple } = require("../middleware/uploadMiddleware");

router.post("/upload/:module", uploadSingle, controller.uploadSingleFile);

router.post("/upload-multiple/:module", uploadMultiple, controller.uploadMultipleFiles);

router.get("/:module/:filename", controller.getFile);

module.exports = router;

