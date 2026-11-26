const { Op } = require("sequelize");
const { NewsletterSubscription, Newsletter, User } = require("../../models");
const { sendNewsletterWelcomeEmail, sendNewsletterBroadcast } = require("../services/emailService");

const escapeHtml = (str) => {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

// =============================================================
// NEWSLETTER SUBSCRIBERS
// =============================================================

// -------------------------------------------------------------
// POST /v1/newsletter/subscribe (Public)
// -------------------------------------------------------------
exports.subscribe = async (req, res) => {
  try {
    const { email, source } = req.body;
    const normalizedEmail = email.toLowerCase().trim();
    const signupSource = (source && source.trim()) || "website_footer";

    let subscription = await NewsletterSubscription.findOne({
      where: { email: normalizedEmail }
    });

    if (subscription) {
      if (subscription.status === 1) {
        return res.status(200).json({
          success: true,
          message: "You are already subscribed to our newsletter.",
          data: {
            id: subscription.id,
            email: subscription.email,
            status: subscription.status,
            subscribedAt: subscription.createdAt
          }
        });
      }

      subscription.status = 1;
      subscription.unsubscribedAt = null;
      subscription.source = signupSource;
      await subscription.save();

      sendNewsletterWelcomeEmail(subscription).catch((err) =>
        console.error("[NEWSLETTER] Error sending reactivation welcome email:", err.message)
      );

      return res.status(200).json({
        success: true,
        message: "Welcome back! Your newsletter subscription has been reactivated.",
        data: {
          id: subscription.id,
          email: subscription.email,
          status: subscription.status,
          resubscribedAt: subscription.updatedAt
        }
      });
    }

    subscription = await NewsletterSubscription.create({
      email: normalizedEmail,
      source: signupSource,
      status: 1
    });

    console.log(`[NEWSLETTER] New subscription registered: ${subscription.email} (#${subscription.id})`);

    sendNewsletterWelcomeEmail(subscription).catch((err) =>
      console.error("[NEWSLETTER] Error sending welcome email:", err.message)
    );

    return res.status(201).json({
      success: true,
      message: "Thank you for subscribing to our newsletter!",
      data: {
        id: subscription.id,
        email: subscription.email,
        source: subscription.source,
        status: subscription.status,
        subscribedAt: subscription.createdAt
      }
    });
  } catch (error) {
    console.error("Error in newsletter subscribe:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process newsletter subscription"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/newsletter/unsubscribe (Public)
// -------------------------------------------------------------
exports.unsubscribe = async (req, res) => {
  try {
    const { email } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    const subscription = await NewsletterSubscription.findOne({
      where: { email: normalizedEmail }
    });

    if (!subscription || subscription.status === 0) {
      return res.status(200).json({
        success: true,
        message: "This email is not currently active on our subscriber list."
      });
    }

    subscription.status = 0;
    subscription.unsubscribedAt = new Date();
    await subscription.save();

    console.log(`[NEWSLETTER] Subscription cancelled for: ${subscription.email}`);

    return res.status(200).json({
      success: true,
      message: "You have been successfully unsubscribed from our newsletter.",
      data: {
        email: subscription.email,
        status: subscription.status,
        unsubscribedAt: subscription.unsubscribedAt
      }
    });
  } catch (error) {
    console.error("Error in newsletter unsubscribe:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process newsletter unsubscription"
    });
  }
};

// -------------------------------------------------------------
// GET /v1/newsletter/unsubscribe?email=user@example.com (Public 1-Click from Email)
// -------------------------------------------------------------
exports.unsubscribeGet = async (req, res) => {
  try {
    const email = req.query.email;
    if (!email || !email.trim()) {
      return res.status(400).send(`
        <!DOCTYPE html><html><head><meta charset="utf-8"/><title>Unsubscribe - Agarwal Group</title><meta name="viewport" content="width=device-width, initial-scale=1"></head>
        <body style="font-family:Arial,sans-serif;background:#F6F4EE;margin:0;padding:40px 16px;display:flex;justify-content:center;align-items:center;min-height:80vh;">
          <div style="max-width:480px;width:100%;background:#ffffff;border:1px solid #E3DED3;border-radius:8px;padding:40px 30px;text-align:center;">
            <h2 style="color:#b91c1c;margin-top:0;">Missing Email Parameter</h2>
            <p style="color:#555;font-size:15px;line-height:1.6;">No email address was provided in the unsubscribe link.</p>
            <a href="https://www.agarwalgroup.in/" style="display:inline-block;margin-top:16px;padding:12px 24px;background:#183C2F;color:#fff;text-decoration:none;border-radius:4px;font-weight:bold;font-size:13px;text-transform:uppercase;">Return to Website</a>
          </div>
        </body></html>
      `);
    }

    const normalizedEmail = email.toLowerCase().trim();
    const subscription = await NewsletterSubscription.findOne({
      where: { email: normalizedEmail }
    });

    if (subscription && subscription.status !== 0) {
      subscription.status = 0;
      subscription.unsubscribedAt = new Date();
      await subscription.save();
      console.log(`[NEWSLETTER] 1-Click unsubscribe processed for: ${subscription.email}`);
    }

    if (req.headers.accept && req.headers.accept.includes("application/json")) {
      return res.status(200).json({
        success: true,
        message: "You have been successfully unsubscribed from our newsletter.",
        data: {
          email: normalizedEmail,
          status: 0,
          unsubscribedAt: subscription ? subscription.unsubscribedAt : new Date()
        }
      });
    }

    return res.status(200).send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <title>Unsubscribed - Agarwal Group Newsletter</title>
        <style>
          body { font-family: Arial, Helvetica, sans-serif; background-color: #F6F4EE; margin: 0; padding: 40px 16px; display: flex; justify-content: center; align-items: center; min-height: 80vh; }
          .card { max-width: 520px; width: 100%; background: #ffffff; border: 1px solid #E3DED3; border-radius: 8px; padding: 44px 32px; text-align: center; box-shadow: 0 4px 18px rgba(0,0,0,0.06); }
          .badge { display: inline-block; padding: 5px 14px; background: #E9EEE7; color: #183C2F; border-radius: 20px; font-size: 12px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; margin-bottom: 16px; }
          h1 { font-family: Georgia, serif; font-size: 26px; color: #1E1F1A; margin: 0 0 14px 0; font-weight: normal; }
          p { color: #43443C; font-size: 15px; line-height: 24px; margin: 0 0 20px 0; }
          .btn { display: inline-block; padding: 13px 26px; background-color: #183C2F; color: #FFFFFF; text-decoration: none; border-radius: 4px; font-size: 13px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; }
          .btn:hover { background-color: #132f25; }
        </style>
      </head>
      <body>
        <div class="card">
          <span class="badge">Newsletter Subscription</span>
          <h1>You have been unsubscribed</h1>
          <p>The email <strong>${escapeHtml(normalizedEmail)}</strong> has been removed from our active subscriber list. You will no longer receive newsletter broadcasts.</p>
          <a href="https://www.agarwalgroup.in/" class="btn">Return to Agarwal Group &rarr;</a>
        </div>
      </body>
      </html>
    `.trim());
  } catch (error) {
    console.error("Error in unsubscribeGet:", error);
    return res.status(500).send(`
      <!DOCTYPE html><html><head><meta charset="utf-8"/><title>Error</title></head>
      <body style="font-family:Arial,sans-serif;padding:40px;text-align:center;">
        <h2>Something went wrong</h2>
        <p>Could not process unsubscribe request. Please try again later.</p>
      </body></html>
    `);
  }
};

// -------------------------------------------------------------
// POST /v1/newsletter/subscribers/unsubscribe (Admin Authenticated)
// -------------------------------------------------------------
exports.adminUnsubscribe = async (req, res) => {
  try {
    const { id, email, status } = req.body;
    const targetStatus = status !== undefined && status !== null ? parseInt(status, 10) : 0;

    let subscription;
    if (id) {
      subscription = await NewsletterSubscription.findByPk(id);
    } else if (email) {
      subscription = await NewsletterSubscription.findOne({
        where: { email: email.toLowerCase().trim() }
      });
    }

    if (!subscription) {
      return res.status(404).json({
        success: false,
        message: "Subscriber not found with the provided identifier."
      });
    }

    subscription.status = targetStatus;
    subscription.unsubscribedAt = targetStatus === 0 ? new Date() : null;
    await subscription.save();

    const adminUser = req.user ? `Admin #${req.user.id} (${req.user.email})` : "Admin";
    const actionName = targetStatus === 0 ? "unsubscribed" : "resubscribed";
    console.log(`[NEWSLETTER ADMIN] ${adminUser} ${actionName} subscriber #${subscription.id} (${subscription.email})`);

    return res.status(200).json({
      success: true,
      message: `Subscriber ${actionName} successfully by admin`,
      data: {
        id: subscription.id,
        email: subscription.email,
        source: subscription.source,
        status: subscription.status,
        unsubscribedAt: subscription.unsubscribedAt,
        updatedAt: subscription.updatedAt
      }
    });
  } catch (error) {
    console.error("Error in adminUnsubscribe:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update subscriber status"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/newsletter/subscribers/list (Admin Authenticated)
// -------------------------------------------------------------
exports.listSubscribers = async (req, res) => {
  try {
    const page = parseInt(req.body.page, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 20;
    const offset = (page - 1) * limit;
    const { search, status } = req.body;

    const whereClause = {};
    if (status !== undefined && status !== null && status !== "") {
      whereClause.status = parseInt(status, 10);
    }

    if (search && search.trim() !== "") {
      whereClause.email = { [Op.like]: `%${search.trim().toLowerCase()}%` };
    }

    const { count, rows } = await NewsletterSubscription.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      order: [["createdAt", "DESC"]]
    });

    return res.status(200).json({
      success: true,
      data: {
        totalRecords: count,
        totalPages: Math.ceil(count / limit) || 1,
        currentPage: page,
        pageSize: limit,
        subscribers: rows
      }
    });
  } catch (error) {
    console.error("Error in listSubscribers:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch newsletter subscribers"
    });
  }
};

// =============================================================
// NEWSLETTER POSTS / ARTICLES CRUD
// =============================================================

// -------------------------------------------------------------
// POST /v1/newsletter/create (Admin Authenticated)
// -------------------------------------------------------------
exports.createNewsletter = async (req, res) => {
  try {
    const { title, subtitle, image, imageRedirectUrl, description, htmlContent } = req.body;
    const userId = req.user && req.user.id ? req.user.id : null;

    const newNewsletter = await Newsletter.create({
      title: title.trim(),
      subtitle: subtitle ? subtitle.trim() : null,
      image: image ? image.trim() : null,
      imageRedirectUrl: imageRedirectUrl ? imageRedirectUrl.trim() : null,
      description,
      htmlContent: htmlContent !== undefined && htmlContent !== null ? htmlContent.trim() : null,
      status: 1,
      createdBy: userId,
      updatedBy: userId
    });

    const populatedNewsletter = await Newsletter.findByPk(newNewsletter.id, {
      include: [
        {
          model: User,
          as: "creator",
          attributes: ["id", "name", "email", "role"]
        }
      ]
    });

    console.log(`[NEWSLETTER] Created newsletter #${newNewsletter.id}: "${newNewsletter.title}"`);

    // Auto-broadcast newsletter to all active subscribers in the background
    NewsletterSubscription.findAll({
      where: { status: 1 },
      attributes: ["id", "email"]
    })
      .then((subscribers) => {
        if (subscribers && subscribers.length > 0) {
          sendNewsletterBroadcast(newNewsletter, subscribers).catch((err) =>
            console.error("[NEWSLETTER] Background broadcast error:", err.message || err)
          );
        } else {
          console.log("[NEWSLETTER] No active subscribers found for auto-broadcast.");
        }
      })
      .catch((err) => {
        console.error("[NEWSLETTER] Failed to fetch subscribers for auto-broadcast:", err.message || err);
      });

    return res.status(201).json({
      success: true,
      message: "Newsletter created successfully",
      data: populatedNewsletter
    });
  } catch (error) {
    console.error("Error in createNewsletter:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to create newsletter"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/newsletter/details (Public)
// -------------------------------------------------------------
exports.newsletterDetails = async (req, res) => {
  try {
    const { id } = req.body;

    const newsletter = await Newsletter.findOne({
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

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: "Newsletter not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: newsletter
    });
  } catch (error) {
    console.error("Error in newsletterDetails:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch newsletter details"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/newsletter/list (Public - Paginated & Search)
// -------------------------------------------------------------
exports.listNewsletters = async (req, res) => {
  try {
    const page = parseInt(req.body.page, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const offset = (page - 1) * limit;
    const { search, status } = req.body;

    const whereClause = {
      status: status !== undefined && status !== null && status !== "" ? parseInt(status, 10) : 1
    };

    if (search && search.trim() !== "") {
      const q = search.trim();
      whereClause[Op.or] = [
        { title: { [Op.like]: `%${q}%` } },
        { subtitle: { [Op.like]: `%${q}%` } },
        { description: { [Op.like]: `%${q}%` } }
      ];
    }

    const { count, rows } = await Newsletter.findAndCountAll({
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
        newsletters: rows
      }
    });
  } catch (error) {
    console.error("Error in listNewsletters:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch newsletters"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/newsletter/update (Admin Authenticated)
// -------------------------------------------------------------
exports.updateNewsletter = async (req, res) => {
  try {
    const { id, title, subtitle, image, imageRedirectUrl, description, htmlContent, status } = req.body;
    const userId = req.user ? req.user.id : null;

    const newsletter = await Newsletter.findByPk(id);

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: "Newsletter not found"
      });
    }

    if (title !== undefined) newsletter.title = title.trim();
    if (subtitle !== undefined) newsletter.subtitle = subtitle ? subtitle.trim() : null;
    if (image !== undefined) newsletter.image = image ? image.trim() : null;
    if (imageRedirectUrl !== undefined) newsletter.imageRedirectUrl = imageRedirectUrl ? imageRedirectUrl.trim() : null;
    if (description !== undefined) newsletter.description = description;
    if (htmlContent !== undefined) newsletter.htmlContent = htmlContent ? htmlContent.trim() : null;
    if (status !== undefined) newsletter.status = parseInt(status, 10);
    newsletter.updatedBy = userId;

    await newsletter.save();

    const updatedNewsletter = await Newsletter.findByPk(id, {
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

    console.log(`[NEWSLETTER] Updated newsletter #${id}: "${newsletter.title}"`);

    return res.status(200).json({
      success: true,
      message: "Newsletter updated successfully",
      data: updatedNewsletter
    });
  } catch (error) {
    console.error("Error in updateNewsletter:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to update newsletter"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/newsletter/delete (Admin Authenticated - Soft Delete)
// -------------------------------------------------------------
exports.deleteNewsletter = async (req, res) => {
  try {
    const { id } = req.body;

    const newsletter = await Newsletter.findByPk(id);

    if (!newsletter) {
      return res.status(404).json({
        success: false,
        message: "Newsletter not found"
      });
    }

    newsletter.status = 0;
    if (req.user) newsletter.updatedBy = req.user.id;
    await newsletter.save();

    console.log(`[NEWSLETTER] Soft-deleted newsletter #${id}`);

    return res.status(200).json({
      success: true,
      message: "Newsletter deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteNewsletter:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to delete newsletter"
    });
  }
};
