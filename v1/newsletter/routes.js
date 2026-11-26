const express = require("express");
const router = express.Router();
const controller = require("./controller");
const validator = require("./validator");
const { authenticateToken } = require("../middleware/authMiddleware");

// ================= SUBSCRIBER ENDPOINTS =================
router.post("/subscribe", validator.subscribeValidator, controller.subscribe);
router.post("/unsubscribe", validator.unsubscribeValidator, controller.unsubscribe);
router.get("/unsubscribe", controller.unsubscribeGet);
router.post("/subscribers/list", authenticateToken, validator.listSubscribersValidator, controller.listSubscribers);
router.post("/admin/unsubscribe", authenticateToken, validator.adminUnsubscribeValidator, controller.adminUnsubscribe);

// ================= NEWSLETTER CRUD ENDPOINTS =================
// Public
router.post("/list", validator.listNewslettersValidator, controller.listNewsletters);
router.post("/details", validator.newsletterDetailsValidator, controller.newsletterDetails);

// Admin Authenticated
router.post("/create", authenticateToken, validator.createNewsletterValidator, controller.createNewsletter);
router.post("/update", authenticateToken, validator.updateNewsletterValidator, controller.updateNewsletter);
router.post("/delete", authenticateToken, validator.deleteNewsletterValidator, controller.deleteNewsletter);

module.exports = router;
