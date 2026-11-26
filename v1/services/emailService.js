const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// ================= EMAIL CONFIG =================
const EMAIL_HOST = process.env.EMAIL_HOST || "smtp.hostinger.com";
const EMAIL_PORT = Number(process.env.EMAIL_PORT) || 465;
const EMAIL_SECURE = process.env.EMAIL_SECURE !== undefined
  ? process.env.EMAIL_SECURE === "true"
  : EMAIL_PORT === 465;
const EMAIL_FROM = process.env.EMAIL_FROM || '"Agarwal Group" <no-reply@agarwalgroup.in>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL;
const SALES_BCC_EMAIL = (process.env.DISABLE_SALES_BCC === "true" || process.env.SALES_BCC_EMAIL === "none")
  ? undefined
  : (process.env.SALES_BCC_EMAIL || "sales@agarwalgroup.in");

// Optional Public Phone Numbers (Omitted if not provided, per template instructions)
const SALES_PHONE = (process.env.SALES_PHONE || "").trim();
const PARTNER_PHONE = (process.env.PARTNER_PHONE || "").trim();
const PROCUREMENT_PHONE = (process.env.PROCUREMENT_PHONE || "").trim();

// ================= SECURITY & SANITIZATION HELPERS =================
const escapeHtml = (str) => {
  if (str === null || str === undefined) return "";
  return String(str)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#39;");
};

const cleanSubject = (str) => {
  if (!str) return "";
  return String(str).replace(/[\r\n]+/g, " ").trim();
};

const sanitizeUrl = (url) => {
  if (!url) return "";
  const trimmed = String(url).trim();
  if (/^https?:\/\//i.test(trimmed)) {
    return trimmed;
  }
  return "";
};

const formatSubmissionDate = (date = new Date()) => {
  try {
    return (
      new Intl.DateTimeFormat("en-IN", {
        timeZone: "Asia/Kolkata",
        day: "numeric",
        month: "long",
        year: "numeric",
        hour: "numeric",
        minute: "2-digit",
        hour12: true,
      }).format(new Date(date)) + " IST"
    );
  } catch (err) {
    return new Date(date).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
  }
};

// ================= INLINE BRANDED ATTACHMENTS =================
// Attach assets/agarwal-group.png as <ag-brand>, assets/agarwal-group-white.png as <ag-brand-white>, and assets/elevation.png as <ag-elevation>
const BRAND_LOGO_PATH = path.join(__dirname, "../../assets/agarwal-group.png");
const BRAND_LOGO_WHITE_PATH = path.join(__dirname, "../../assets/agarwal-group-white.png");
const ELEVATION_PATH = path.join(__dirname, "../../assets/elevation.png");

const getBrandedAttachments = () => {
  const attachments = [];
  if (fs.existsSync(BRAND_LOGO_PATH)) {
    attachments.push({
      filename: "agarwal-group.png",
      path: BRAND_LOGO_PATH,
      cid: "ag-brand",
    });
  }
  if (fs.existsSync(BRAND_LOGO_WHITE_PATH)) {
    attachments.push({
      filename: "agarwal-group-white.png",
      path: BRAND_LOGO_WHITE_PATH,
      cid: "ag-brand-white",
    });
  }
  if (fs.existsSync(ELEVATION_PATH)) {
    attachments.push({
      filename: "elevation.png",
      path: ELEVATION_PATH,
      cid: "ag-elevation",
    });
  }
  return attachments;
};

// ================= HTML TEMPLATE SHELL =================
// Mirrors the exact Agarwal Group branded template markup
const renderEmailShell = ({ title, department, heading, contentHtml, footerText }) => `
<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${escapeHtml(title)}</title></head><body style="margin:0"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" bgcolor="#f4f3ee"><tr><td align="center" style="padding:22px 10px"><table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="max-width:584px;border:1px solid #d4dcd4;background:#fff"><tr><td bgcolor="#ffffff" style="padding:18px 24px;border-bottom:3px solid #bc9871"><table role="presentation" width="100%" cellspacing="0" cellpadding="0"><tr><td style="background-color:#ffffff"><img src="cid:ag-brand" alt="Agarwal Group" width="192" height="36" style="display:block;width:192px;max-width:100%;height:auto;border:0"></td><td align="right"><img src="cid:ag-elevation" width="108" height="50" alt="" style="display:block"></td></tr></table></td></tr><tr><td style="padding:29px 26px 10px"><p style="margin:0 0 10px;color:#54685d;font:bold 11px Arial;letter-spacing:1.6px">${escapeHtml(department)}</p><h1 style="margin:0;color:#173b36;font:normal 34px/1.14 Georgia,serif">${escapeHtml(heading)}</h1></td></tr><tr><td style="padding:14px 26px 28px">${contentHtml}</td></tr><tr><td bgcolor="#e9eee7" style="padding:12px 26px;font:12px Arial;color:#45584c">${footerText}</td></tr></table></td></tr></table></body></html>
`.trim();

// ================= NODEMAILER TRANSPORTER =================
const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: EMAIL_SECURE,
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
  tls: {
    rejectUnauthorized: false,
  },
});

exports.verifyEmailConnection = async () => {
  try {
    await transporter.verify();
    console.log("✅ SMTP connection established successfully with Hostinger");
    return { success: true };
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err.message || err);
    return { success: false, error: err.message };
  }
};
exports.transporter = transporter;

// ================= SEND LOGIN OTP EMAIL =================
exports.sendOtpEmail = async (toEmail, otp) => {
  try {
    if (!toEmail) {
      console.log("[EMAIL] Skipped sending OTP email: recipient email is empty.");
      return { success: false, error: "Recipient email is empty" };
    }

    const cleanOtp = escapeHtml(String(otp));
    const title = "Your Login Verification Code";
    const department = "SECURITY & AUTHENTICATION";
    const heading = "Verify Your Login";
    const footerText = "Agarwal Group &nbsp;·&nbsp; Security & Accounts";

    const contentHtml = `
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Dear User,</p>
      <p style="margin:0 0 20px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">We received a request to sign in to your Agarwal Group account. Use the verification code below to complete your sign-in:</p>
      <div style="margin:24px 0;text-align:center">
        <div style="display:inline-block;padding:14px 32px;background:#f4f3ee;border:2px dashed #bc9871;border-radius:8px">
          <span style="font:bold 32px 'Courier New',Courier,monospace;letter-spacing:8px;color:#173b36">${cleanOtp}</span>
        </div>
      </div>
      <p style="margin:20px 0 0;font:14px/1.6 Arial,sans-serif;color:#6b7280">This code is valid for <strong>5 minutes</strong>. If you did not request this login code, you can safely ignore this email.</p>
      <p style="margin:24px 0 0;font:15px/1.6 Arial;color:#53665e">Regards,<br><strong style="color:#173b36">Agarwal Group IT Security Team</strong></p>
    `.trim();

    const textContent = `Dear User,\n\nWe received a request to sign in to your Agarwal Group account. Use the verification code below to complete your sign-in:\n\nOTP: ${otp}\n\nThis code is valid for 5 minutes. If you did not request this login code, you can safely ignore this email.\n\nRegards,\nAgarwal Group IT Security Team`;

    const mailOptions = {
      from: EMAIL_FROM,
      to: toEmail,
      subject: "Your Login Verification Code - Agarwal Group",
      text: textContent,
      html: renderEmailShell({
        title,
        department,
        heading,
        contentHtml,
        footerText,
      }),
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] OTP sent to ${toEmail}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending OTP to ${toEmail}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= 1. LEAD REGISTRATION THANK YOU EMAIL =================
// Supports templates: "general-enquiry" and "project-enquiry"
exports.sendLeadThankYouEmail = async (lead, leadDetail = {}) => {
  try {
    if (!lead || !lead.email) {
      console.log("[EMAIL] Skipped sending lead inquiry email: recipient email field is empty.");
      return { success: false, error: "Recipient email is empty" };
    }

    const rawFullName = lead.fullName || "Valued Client";
    const fullName = escapeHtml(rawFullName);
    const rawProject = lead.project || leadDetail.project || leadDetail.buildingOrSocietyName;
    const project = escapeHtml(rawProject || "");

    const isProjectEnquiry = Boolean(rawProject);

    let subject, department, heading, title, footerText;
    let contentHtml, textContent;

    if (isProjectEnquiry) {
      // Template: project-enquiry
      subject = cleanSubject(`Thank you for your enquiry about ${rawProject}`);
      department = "SALES";
      heading = "Your project enquiry";
      title = "Your project enquiry";
      footerText = "Agarwal Group &nbsp;·&nbsp; Website enquiries";

      const phoneClauseHtml = SALES_PHONE
        ? ` You can also reach us on <a href="tel:${escapeHtml(SALES_PHONE)}" style="color:#173b36;text-decoration:underline">${escapeHtml(SALES_PHONE)}</a>.`
        : "";
      const phoneClauseText = SALES_PHONE ? ` You can also reach us on ${SALES_PHONE}.` : "";

      contentHtml = `
        <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Dear ${fullName},</p>
        <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">We received your enquiry about ${project}. Our sales team will get in touch to discuss the project and answer your questions.${phoneClauseHtml}</p>
        <p style="margin:24px 0 0;font:15px/1.6 Arial;color:#53665e">Regards,<br><strong style="color:#173b36">Agarwal Group Sales Team</strong></p>
      `.trim();

      textContent = `Dear ${rawFullName},\n\nWe received your enquiry about ${rawProject}. Our sales team will get in touch to discuss the project and answer your questions.${phoneClauseText}\n\nRegards,\nAgarwal Group Sales Team`;
    } else {
      // Template: general-enquiry
      subject = cleanSubject("We received your enquiry at Agarwal Group");
      department = "SALES";
      heading = "Thank you for your enquiry";
      title = "Thank you for your enquiry";
      footerText = "Agarwal Group &nbsp;·&nbsp; Website enquiries";

      const phoneClauseHtml = SALES_PHONE
        ? ` If you would like to speak with us sooner, call <a href="tel:${escapeHtml(SALES_PHONE)}" style="color:#173b36;text-decoration:underline">${escapeHtml(SALES_PHONE)}</a>.`
        : "";
      const phoneClauseText = SALES_PHONE ? ` If you would like to speak with us sooner, call ${SALES_PHONE}.` : "";

      contentHtml = `
        <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Dear ${fullName},</p>
        <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Thank you for getting in touch. Our sales team will call you on the number you shared to discuss what you are looking for.${phoneClauseHtml}</p>
        <p style="margin:24px 0 0;font:15px/1.6 Arial;color:#53665e">Regards,<br><strong style="color:#173b36">Agarwal Group Sales Team</strong></p>
      `.trim();

      textContent = `Dear ${rawFullName},\n\nThank you for getting in touch. Our sales team will call you on the number you shared to discuss what you are looking for.${phoneClauseText}\n\nRegards,\nAgarwal Group Sales Team`;
    }

    const html = renderEmailShell({
      title,
      department,
      heading,
      contentHtml,
      footerText,
    });

    const mailOptions = {
      from: EMAIL_FROM,
      to: lead.email,
      bcc: SALES_BCC_EMAIL,
      subject,
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Inquiry confirmation sent to ${lead.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending inquiry email to ${lead.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= 2. CALLBACK CONFIRMATION TO CUSTOMER =================
// Supports template: "project-callback"
exports.sendCallbackRequestEmail = async (lead, project = "") => {
  try {
    if (!lead || !lead.email) {
      console.log("[EMAIL] Skipped sending callback confirmation: recipient email field is empty.");
      return { success: false, error: "Recipient email is empty" };
    }

    const rawFullName = lead.fullName || "Valued Client";
    const fullName = escapeHtml(rawFullName);
    const rawProject = project || lead.project || "";
    const escapedProject = escapeHtml(rawProject || "our projects");

    const subject = rawProject
      ? cleanSubject(`Your callback request for ${rawProject}`)
      : cleanSubject("Your callback request - Agarwal Group");

    const bodyParagraphHtml = rawProject
      ? `Thank you for requesting a call about ${escapedProject}. A member of our sales team will call the number you provided. You can use that call to ask about pricing, availability or a site visit.`
      : "Thank you for requesting a call. A member of our sales team will call the number you provided. You can use that call to ask about pricing, availability or a site visit.";

    const bodyParagraphText = rawProject
      ? `Thank you for requesting a call about ${rawProject}. A member of our sales team will call the number you provided. You can use that call to ask about pricing, availability or a site visit.`
      : "Thank you for requesting a call. A member of our sales team will call the number you provided. You can use that call to ask about pricing, availability or a site visit.";

    const contentHtml = `
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Dear ${fullName},</p>
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">${bodyParagraphHtml}</p>
      <p style="margin:24px 0 0;font:15px/1.6 Arial;color:#53665e">Regards,<br><strong style="color:#173b36">Agarwal Group Sales Team</strong></p>
    `.trim();

    const textContent = `Dear ${rawFullName},\n\n${bodyParagraphText}\n\nRegards,\nAgarwal Group Sales Team`;

    const html = renderEmailShell({
      title: "Your callback is confirmed",
      department: "SALES",
      heading: "Your callback is confirmed",
      contentHtml,
      footerText: "Agarwal Group &nbsp;·&nbsp; Website enquiries",
    });

    const mailOptions = {
      from: EMAIL_FROM,
      to: lead.email,
      bcc: SALES_BCC_EMAIL,
      subject,
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Customer callback email sent to ${lead.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending callback email to ${lead.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= 3. CUSTOMER BROCHURE EMAIL =================
// Supports template: "brochure-request"
exports.sendCustomerBrochureEmail = async (lead, project = "", brochureLink = "") => {
  try {
    if (!lead || !lead.email) {
      console.log("[EMAIL] Skipped sending customer brochure email: recipient email field is empty.");
      return { success: false, error: "Recipient email is empty" };
    }

    const rawFullName = lead.fullName || "Valued Client";
    const fullName = escapeHtml(rawFullName);
    const rawProject = project || lead.project || "our projects";
    const escapedProject = escapeHtml(rawProject);
    const safeBrochureLink = sanitizeUrl(brochureLink || lead.brochureLink || "");

    const subject = rawProject && rawProject !== "our projects"
      ? cleanSubject(`Your brochure for ${rawProject}`)
      : cleanSubject("Your brochure - Agarwal Group");

    const buttonHtml = safeBrochureLink
      ? `<table role="presentation" cellpadding="0" cellspacing="0" style="margin:5px 0 18px"><tr><td bgcolor="#173b36" style="padding:12px 21px"><a style="font:bold 14px Arial;color:#ffffff;text-decoration:underline" href="${escapeHtml(safeBrochureLink)}">Download the brochure</a></td></tr></table>`
      : "";

    const phoneClauseHtml = SALES_PHONE
      ? `<p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">If you have questions after reading it, call our sales team on <a href="tel:${escapeHtml(SALES_PHONE)}" style="color:#173b36;text-decoration:underline">${escapeHtml(SALES_PHONE)}</a>.</p>`
      : "";
    const phoneClauseText = SALES_PHONE
      ? ` If you have questions after reading it, call our sales team on ${SALES_PHONE}.`
      : "";

    const contentHtml = `
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Dear ${fullName},</p>
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Thank you for your interest in ${escapedProject}. You can download the project brochure here:</p>
      ${buttonHtml}
      ${phoneClauseHtml}
      <p style="margin:24px 0 0;font:15px/1.6 Arial;color:#53665e">Regards,<br><strong style="color:#173b36">Agarwal Group Sales Team</strong></p>
    `.trim();

    const textContent = `Dear ${rawFullName},\n\nThank you for your interest in ${rawProject}. You can download the project brochure here: ${safeBrochureLink || "Contact sales for brochure"}${phoneClauseText}\n\nRegards,\nAgarwal Group Sales Team`;

    const html = renderEmailShell({
      title: "Your project brochure",
      department: "SALES",
      heading: "Your project brochure",
      contentHtml,
      footerText: "Agarwal Group &nbsp;·&nbsp; Website enquiries",
    });

    const mailOptions = {
      from: EMAIL_FROM,
      to: lead.email,
      bcc: SALES_BCC_EMAIL,
      subject,
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Customer brochure email sent to ${lead.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending customer brochure email to ${lead.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};
exports.sendBrochureEmail = exports.sendCustomerBrochureEmail;

// ================= 4. CHANNEL PARTNER CONFIRMATION EMAIL =================
// Supports template: "channel-partner-registration"
exports.sendChannelPartnerConfirmationEmail = async (partner) => {
  try {
    if (!partner || !partner.email) {
      console.log("[EMAIL] Skipped sending channel partner confirmation: recipient email field is empty.");
      return { success: false, error: "Recipient email is empty" };
    }

    const rawFullName = partner.fullName || "Partner";
    const fullName = escapeHtml(rawFullName);

    const phoneClauseHtml = PARTNER_PHONE
      ? ` For questions about your registration, call <a href="tel:${escapeHtml(PARTNER_PHONE)}" style="color:#173b36;text-decoration:underline">${escapeHtml(PARTNER_PHONE)}</a>.`
      : "";
    const phoneClauseText = PARTNER_PHONE
      ? ` For questions about your registration, call ${PARTNER_PHONE}.`
      : "";

    const contentHtml = `
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Dear ${fullName},</p>
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Thank you for registering your interest in working with Agarwal Group. Our partnerships team will review the details you shared and contact you about the next steps.${phoneClauseHtml}</p>
      <p style="margin:24px 0 0;font:15px/1.6 Arial;color:#53665e">Regards,<br><strong style="color:#173b36">Agarwal Group Partnerships Team</strong></p>
    `.trim();

    const textContent = `Dear ${rawFullName},\n\nThank you for registering your interest in working with Agarwal Group. Our partnerships team will review the details you shared and contact you about the next steps.${phoneClauseText}\n\nRegards,\nAgarwal Group Partnerships Team`;

    const html = renderEmailShell({
      title: "Partner registration received",
      department: "PARTNERSHIPS",
      heading: "Partner registration received",
      contentHtml,
      footerText: "Agarwal Group &nbsp;·&nbsp; Channel partner",
    });

    const mailOptions = {
      from: EMAIL_FROM,
      to: partner.email,
      bcc: SALES_BCC_EMAIL,
      subject: cleanSubject("We received your channel partner registration"),
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Channel Partner confirmation sent to ${partner.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Channel Partner confirmation to ${partner.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= 5. SUPPLIER CONFIRMATION EMAIL =================
// Supports template: "supplier-registration"
exports.sendSupplierConfirmationEmail = async (supplier) => {
  try {
    if (!supplier || !supplier.email) {
      console.log("[EMAIL] Skipped sending supplier confirmation: recipient email field is empty.");
      return { success: false, error: "Recipient email is empty" };
    }

    const rawFullName = supplier.supplierName || supplier.fullName || "Vendor Partner";
    const fullName = escapeHtml(rawFullName);

    const phoneClauseHtml = PROCUREMENT_PHONE
      ? ` For registration queries, call <a href="tel:${escapeHtml(PROCUREMENT_PHONE)}" style="color:#173b36;text-decoration:underline">${escapeHtml(PROCUREMENT_PHONE)}</a>.`
      : "";
    const phoneClauseText = PROCUREMENT_PHONE
      ? ` For registration queries, call ${PROCUREMENT_PHONE}.`
      : "";

    const contentHtml = `
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Dear ${fullName},</p>
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Thank you for introducing your business to Agarwal Group. Our procurement team will review your registration and contact you if we need more information or supporting documents.${phoneClauseHtml}</p>
      <p style="margin:24px 0 0;font:15px/1.6 Arial;color:#53665e">Regards,<br><strong style="color:#173b36">Agarwal Group Procurement Team</strong></p>
    `.trim();

    const textContent = `Dear ${rawFullName},\n\nThank you for introducing your business to Agarwal Group. Our procurement team will review your registration and contact you if we need more information or supporting documents.${phoneClauseText}\n\nRegards,\nAgarwal Group Procurement Team`;

    const html = renderEmailShell({
      title: "Supplier registration received",
      department: "PROCUREMENT",
      heading: "Supplier registration received",
      contentHtml,
      footerText: "Agarwal Group &nbsp;·&nbsp; Supplier registration",
    });

    const mailOptions = {
      from: EMAIL_FROM,
      to: supplier.email,
      bcc: SALES_BCC_EMAIL,
      subject: cleanSubject("We received your supplier registration"),
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Supplier confirmation sent to ${supplier.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Supplier confirmation to ${supplier.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= 6. CAREER CONFIRMATION TO CANDIDATE =================
// Supports template: "job-application"
exports.sendCareerConfirmationEmail = async (candidate) => {
  try {
    if (!candidate || !candidate.email) {
      console.log("[EMAIL] Skipped sending career confirmation: recipient email field is empty.");
      return { success: false, error: "Recipient email is empty" };
    }

    const rawFullName = candidate.fullName || "Candidate";
    const fullName = escapeHtml(rawFullName);
    const rawJobTitle = candidate.appliedForPosition || "selected";
    const jobTitle = escapeHtml(rawJobTitle);

    const contentHtml = `
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Dear ${fullName},</p>
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Thank you for applying for the ${jobTitle} role at Agarwal Group. Our HR team has received your application and will review it. If you are shortlisted, we will contact you using the details you provided.</p>
      <p style="margin:24px 0 0;font:15px/1.6 Arial;color:#53665e">Regards,<br><strong style="color:#173b36">Agarwal Group HR Team</strong></p>
    `.trim();

    const textContent = `Dear ${rawFullName},\n\nThank you for applying for the ${rawJobTitle} role at Agarwal Group. Our HR team has received your application and will review it. If you are shortlisted, we will contact you using the details you provided.\n\nRegards,\nAgarwal Group HR Team`;

    const html = renderEmailShell({
      title: "Application received",
      department: "CAREERS",
      heading: "Application received",
      contentHtml,
      footerText: "Agarwal Group &nbsp;·&nbsp; Job application",
    });

    const mailOptions = {
      from: EMAIL_FROM,
      to: candidate.email,
      // BCC strictly excluded for applicant emails as instructed
      subject: cleanSubject(`Application received for ${rawJobTitle}`),
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Career confirmation sent to ${candidate.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Career confirmation to ${candidate.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= 7. INTERNAL HR NOTIFICATION =================
// Supports template: "hr-internal"
exports.sendAdminCareerAlert = async (candidate, targetEmail = ADMIN_EMAIL) => {
  try {
    const rawJobTitle = candidate.appliedForPosition || "General Position";
    const jobTitle = escapeHtml(rawJobTitle);
    const rawFullName = candidate.fullName || "N/A";
    const fullName = escapeHtml(rawFullName);
    const rawEmail = candidate.email || "N/A";
    const email = escapeHtml(rawEmail);
    const rawMobile = candidate.mobileNumber || "N/A";
    const mobile = escapeHtml(rawMobile);
    const applicationId = candidate.applicationId || `AG-${candidate.id || Date.now()}`;
    const submittedAt = formatSubmissionDate(candidate.createdAt || new Date());
    const safeResumeLink = sanitizeUrl(candidate.resumeUploadLink || "");

    const resumeButtonHtml = safeResumeLink
      ? `<br><table role="presentation" cellpadding="0" cellspacing="0" style="margin:5px 0 18px"><tr><td bgcolor="#173b36" style="padding:12px 21px"><a style="font:bold 14px Arial;color:#ffffff;text-decoration:underline" href="${escapeHtml(safeResumeLink)}">View candidate résumé</a></td></tr></table>`
      : "";

    const contentHtml = `
      <p style="margin:0 0 6px;font:bold 12px Arial;color:#52675e">POSITION APPLIED FOR</p>
      <p style="margin:0 0 20px;font:24px/1.3 Georgia;color:#173b36">${jobTitle}</p>
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Candidate</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${fullName}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Email</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${email}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Mobile</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${mobile}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Application ID</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${escapeHtml(applicationId)}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Submitted</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${escapeHtml(submittedAt)}</td></tr>
      </table>
      ${resumeButtonHtml}
    `.trim();

    const textContent = `Applicant ID: ${applicationId}\nPosition applied for: ${rawJobTitle}\nCandidate name: ${rawFullName}\nMobile number: ${rawMobile}\nEmail: ${rawEmail}\n${safeResumeLink ? `Résumé: ${safeResumeLink}\n` : ""}Applied at: ${submittedAt}`;

    const html = renderEmailShell({
      title: "New candidate application",
      department: "HUMAN RESOURCES",
      heading: "New candidate application",
      contentHtml,
      footerText: "Internal HR notification &nbsp;·&nbsp; Website applications",
    });

    const recipient = targetEmail || ADMIN_EMAIL;
    const mailOptions = {
      from: EMAIL_FROM,
      to: recipient,
      // Exclusively to HR mailbox - no sales BCC
      subject: cleanSubject(`New application for ${rawJobTitle} | ${applicationId}`),
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin Career alert sent to ${recipient}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Admin Career alert to ${targetEmail || ADMIN_EMAIL}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= 8. IMMEDIATE CALLBACK ALERT TO ADMIN =================
exports.sendAdminCallbackAlertEmail = async (lead, targetEmail = ADMIN_EMAIL) => {
  try {
    const rawFullName = lead.fullName || "Valued Client";
    const fullName = escapeHtml(rawFullName);
    const rawMobile = lead.mobileNumber || "N/A";
    const mobile = escapeHtml(rawMobile);
    const rawEmail = lead.email || "N/A";
    const email = escapeHtml(rawEmail);
    const leadId = lead.id ? `#CB-${lead.id}` : "N/A";
    const submittedAt = formatSubmissionDate(lead.createdAt || new Date());

    const contentHtml = `
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">A visitor has requested an immediate callback. Please assign a sales representative to connect with the lead promptly.</p>
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Lead ID</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${escapeHtml(leadId)}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Full Name</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${fullName}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Mobile Number</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere"><a href="tel:${escapeHtml(rawMobile)}" style="color:#173b36;text-decoration:underline">${mobile}</a></td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Email Address</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere"><a href="mailto:${escapeHtml(rawEmail)}" style="color:#173b36;text-decoration:underline">${email}</a></td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Received At</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${escapeHtml(submittedAt)}</td></tr>
      </table>
      <br>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:5px 0 18px"><tr><td bgcolor="#173b36" style="padding:12px 21px"><a style="font:bold 14px Arial;color:#ffffff;text-decoration:underline" href="tel:${escapeHtml(rawMobile)}">Call Lead Now (${mobile})</a></td></tr></table>
    `.trim();

    const textContent = `Lead ID: ${leadId}\nFull Name: ${rawFullName}\nMobile: ${rawMobile}\nEmail: ${rawEmail}\nReceived At: ${submittedAt}`;

    const html = renderEmailShell({
      title: "Immediate callback request",
      department: "SALES",
      heading: "New callback request",
      contentHtml,
      footerText: "Internal Sales notification &nbsp;·&nbsp; Website callback requests",
    });

    const recipient = targetEmail || ADMIN_EMAIL;
    const mailOptions = {
      from: EMAIL_FROM,
      to: recipient,
      bcc: SALES_BCC_EMAIL,
      subject: cleanSubject(`New Callback Request: ${rawFullName} (${rawMobile})`),
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin callback alert sent to ${recipient}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending admin callback alert to ${targetEmail || ADMIN_EMAIL}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= 9. BROCHURE DOWNLOAD ALERT TO ADMIN =================
exports.sendAdminBrochureAlertEmail = async (lead, targetEmail = ADMIN_EMAIL) => {
  try {
    const rawFullName = lead.fullName || "Valued Client";
    const fullName = escapeHtml(rawFullName);
    const rawMobile = lead.mobileNumber || "N/A";
    const mobile = escapeHtml(rawMobile);
    const rawEmail = lead.email || "N/A";
    const email = escapeHtml(rawEmail);
    const leadId = lead.id ? `#BR-${lead.id}` : "N/A";
    const submittedAt = formatSubmissionDate(lead.createdAt || new Date());

    const contentHtml = `
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">A visitor has requested/downloaded the project brochure. Customer details have been logged in the Sales Data Excel under <strong>Brochure Download Request</strong>.</p>
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Lead ID</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${escapeHtml(leadId)}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Full Name</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${fullName}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Mobile Number</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere"><a href="tel:${escapeHtml(rawMobile)}" style="color:#173b36;text-decoration:underline">${mobile}</a></td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Email Address</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere"><a href="mailto:${escapeHtml(rawEmail)}" style="color:#173b36;text-decoration:underline">${email}</a></td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Registered At</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${escapeHtml(submittedAt)}</td></tr>
      </table>
      <br>
      <table role="presentation" cellpadding="0" cellspacing="0" style="margin:5px 0 18px"><tr><td bgcolor="#173b36" style="padding:12px 21px"><a style="font:bold 14px Arial;color:#ffffff;text-decoration:underline" href="tel:${escapeHtml(rawMobile)}">Follow Up with Lead (${mobile})</a></td></tr></table>
    `.trim();

    const textContent = `Lead ID: ${leadId}\nFull Name: ${rawFullName}\nMobile: ${rawMobile}\nEmail: ${rawEmail}\nRegistered At: ${submittedAt}`;

    const html = renderEmailShell({
      title: "New brochure download",
      department: "SALES",
      heading: "New brochure request",
      contentHtml,
      footerText: "Internal Sales notification &nbsp;·&nbsp; Website brochure requests",
    });

    const recipient = targetEmail || ADMIN_EMAIL;
    const mailOptions = {
      from: EMAIL_FROM,
      to: recipient,
      bcc: SALES_BCC_EMAIL,
      subject: cleanSubject(`New Brochure Download Lead: ${rawFullName} (${rawMobile})`),
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin brochure download alert sent to ${recipient}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending admin brochure alert to ${targetEmail || ADMIN_EMAIL}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= 10. CHANNEL PARTNER ALERT TO ADMIN =================
exports.sendAdminChannelPartnerAlert = async (partner, targetEmail = ADMIN_EMAIL) => {
  try {
    const rawFullName = partner.fullName || "N/A";
    const fullName = escapeHtml(rawFullName);
    const rawFirm = partner.firmOrCompanyName || "N/A";
    const firm = escapeHtml(rawFirm);
    const rawRera = partner.reraRegNo || "N/A";
    const rera = escapeHtml(rawRera);
    const rawMobile = partner.mobileNumber || "N/A";
    const mobile = escapeHtml(rawMobile);
    const rawEmail = partner.email || "N/A";
    const email = escapeHtml(rawEmail);
    const rawCity = partner.cityOfOperation || "N/A";
    const city = escapeHtml(rawCity);
    const partnerId = partner.id ? `#CP-${partner.id}` : "N/A";
    const submittedAt = formatSubmissionDate(partner.createdAt || new Date());

    const contentHtml = `
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Partner ID</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${escapeHtml(partnerId)}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Full Name</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${fullName}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Firm / Company</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${firm}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">RERA Reg. No</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere"><strong>${rera}</strong></td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Mobile Number</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere"><a href="tel:${escapeHtml(rawMobile)}" style="color:#173b36;text-decoration:underline">${mobile}</a></td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Email</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere"><a href="mailto:${escapeHtml(rawEmail)}" style="color:#173b36;text-decoration:underline">${email}</a></td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">City of Operation</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${city}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Submitted At</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${escapeHtml(submittedAt)}</td></tr>
      </table>
    `.trim();

    const textContent = `Partner ID: ${partnerId}\nFull Name: ${rawFullName}\nFirm: ${rawFirm}\nRERA Reg No: ${rawRera}\nMobile: ${rawMobile}\nEmail: ${rawEmail}\nCity: ${rawCity}\nSubmitted At: ${submittedAt}`;

    const html = renderEmailShell({
      title: "New channel partner registration",
      department: "PARTNERSHIPS",
      heading: "New partner registration",
      contentHtml,
      footerText: "Internal Partnerships notification &nbsp;·&nbsp; Channel partner registrations",
    });

    const recipient = targetEmail || ADMIN_EMAIL;
    const mailOptions = {
      from: EMAIL_FROM,
      to: recipient,
      bcc: SALES_BCC_EMAIL,
      subject: cleanSubject(`New Channel Partner Registration: ${rawFirm} (${rawFullName})`),
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin Channel Partner alert sent to ${recipient}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Admin Channel Partner alert to ${targetEmail || ADMIN_EMAIL}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= 11. SUPPLIER ALERT TO ADMIN =================
exports.sendAdminSupplierAlert = async (supplier, targetEmail = ADMIN_EMAIL) => {
  try {
    const rawCompany = supplier.companyName || "N/A";
    const company = escapeHtml(rawCompany);
    const rawPerson = supplier.supplierName || "N/A";
    const person = escapeHtml(rawPerson);
    const rawMobile = supplier.mobileNumber || "N/A";
    const mobile = escapeHtml(rawMobile);
    const rawEmail = supplier.email || "N/A";
    const email = escapeHtml(rawEmail);
    const supplierId = supplier.id ? `#SUP-${supplier.id}` : "N/A";
    const submittedAt = formatSubmissionDate(supplier.createdAt || new Date());
    const rawCategories = Array.isArray(supplier.serviceCategories)
      ? supplier.serviceCategories.join(", ")
      : (supplier.serviceCategories || "N/A");
    const categories = escapeHtml(rawCategories);
    const exp = escapeHtml(supplier.yearsOfExperience || "N/A");
    const area = escapeHtml(supplier.areaOfOperation || "N/A");

    const contentHtml = `
      <table width="100%" cellspacing="0" cellpadding="0">
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Supplier ID</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${escapeHtml(supplierId)}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Company Name</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${company}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Contact Person</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${person}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Mobile Number</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere"><a href="tel:${escapeHtml(rawMobile)}" style="color:#173b36;text-decoration:underline">${mobile}</a></td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Email</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere"><a href="mailto:${escapeHtml(rawEmail)}" style="color:#173b36;text-decoration:underline">${email}</a></td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Service Categories</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${categories}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Experience</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${exp}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Operation Area</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${area}</td></tr>
        <tr><th scope="row" align="left" valign="top" style="padding:10px 6px 10px 0;width:38%;border-top:1px solid #d7ded7;color:#53665e;font:14px Arial">Submitted At</th><td style="padding:10px 0;border-top:1px solid #d7ded7;font:15px Arial;color:#192e27;overflow-wrap:anywhere">${escapeHtml(submittedAt)}</td></tr>
      </table>
    `.trim();

    const textContent = `Supplier ID: ${supplierId}\nCompany Name: ${rawCompany}\nContact Person: ${rawPerson}\nMobile: ${rawMobile}\nEmail: ${rawEmail}\nCategories: ${rawCategories}\nExperience: ${supplier.yearsOfExperience || "N/A"}\nOperation Area: ${supplier.areaOfOperation || "N/A"}\nSubmitted At: ${submittedAt}`;

    const html = renderEmailShell({
      title: "New supplier registration",
      department: "PROCUREMENT",
      heading: "New supplier registration",
      contentHtml,
      footerText: "Internal Procurement notification &nbsp;·&nbsp; Supplier registrations",
    });

    const recipient = targetEmail || ADMIN_EMAIL;
    const mailOptions = {
      from: EMAIL_FROM,
      to: recipient,
      bcc: SALES_BCC_EMAIL,
      subject: cleanSubject(`New Supplier / Vendor Registration: ${rawCompany}`),
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin Supplier alert sent to ${recipient}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Admin Supplier alert to ${targetEmail || ADMIN_EMAIL}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

exports.sendNewsletterWelcomeEmail = async (subscriber) => {
  try {
    if (!subscriber || !subscriber.email) {
      console.log("[EMAIL] Skipped sending newsletter welcome email: recipient email field is empty.");
      return { success: false, error: "Recipient email is empty" };
    }

    const rawEmail = subscriber.email;
    const email = escapeHtml(rawEmail);

    const contentHtml = `
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Dear Subscriber,</p>
      <p style="margin:0 0 16px;font:16px/1.65 Arial,Helvetica,sans-serif;color:#283a35">Thank you for subscribing to the Agarwal Group newsletter. You will be the first to receive updates on our latest luxury residential developments, architectural insights, and exclusive pre-launch announcements.</p>
      <p style="margin:24px 0 0;font:15px/1.6 Arial;color:#53665e">Regards,<br><strong style="color:#173b36">Agarwal Group Team</strong></p>
    `.trim();

    const textContent = `Dear Subscriber,\n\nThank you for subscribing to the Agarwal Group newsletter. You will be the first to receive updates on our latest luxury residential developments, architectural insights, and exclusive pre-launch announcements.\n\nRegards,\nAgarwal Group Team`;

    const html = renderEmailShell({
      title: "Welcome to our newsletter",
      department: "NEWSLETTER",
      heading: "Thank you for subscribing",
      contentHtml,
      footerText: "Agarwal Group &nbsp;·&nbsp; Newsletter subscriptions",
    });

    const mailOptions = {
      from: EMAIL_FROM,
      to: subscriber.email,
      bcc: SALES_BCC_EMAIL,
      subject: cleanSubject("Welcome to the Agarwal Group Newsletter"),
      text: textContent,
      html,
      attachments: getBrandedAttachments(),
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Newsletter welcome email sent to ${subscriber.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending newsletter welcome email to ${subscriber.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= 13. NEWSLETTER ISSUE BROADCAST =================
exports.sendNewsletterIssueEmail = async (subscriber, newsletter) => {
  try {
    if (!subscriber || !subscriber.email) {
      return { success: false, error: "Recipient email is empty" };
    }

    const rawTitle = newsletter.title || "Agarwal Group Newsletter";
    const rawSubtitle = newsletter.subtitle || "";
    const rawDesc = newsletter.description || "";
    const clientBaseUrl = (process.env.CLIENT_BASE_URL || "https://www.agarwalgroup.in").replace(/\/+$/, "");
    const blogUrl = `${clientBaseUrl}/blogs`;
    const unsubscribeUrl = `${clientBaseUrl}/unsubscribe?email=${encodeURIComponent(subscriber.email)}`;

    // Resolve featured image
    let featuredImageSrc = "";
    let featuredAttachment = null;

    if (newsletter.image && newsletter.image.trim()) {
      const rawImage = newsletter.image.trim();
      let localPath = null;
      if (rawImage.startsWith("/uploads/") || rawImage.startsWith("uploads/")) {
        const cleanPath = rawImage.replace(/^\/+/, "");
        localPath = path.join(__dirname, "../../", cleanPath);
      } else if (rawImage.includes("/uploads/")) {
        const idx = rawImage.indexOf("/uploads/");
        const cleanPath = rawImage.substring(idx + 1);
        localPath = path.join(__dirname, "../../", cleanPath);
      }

      if (localPath && fs.existsSync(localPath)) {
        featuredImageSrc = "cid:newsletter-featured";
        featuredAttachment = {
          filename: path.basename(localPath),
          path: localPath,
          cid: "newsletter-featured",
        };
      } else if (/^https?:\/\//i.test(rawImage)) {
        featuredImageSrc = rawImage;
      } else if (process.env.APP_BASE_URL && rawImage.startsWith("/")) {
        featuredImageSrc = `${process.env.APP_BASE_URL.replace(/\/+$/, "")}${rawImage}`;
      }
    }

    // Check if htmlContent is a complete standalone HTML document
    const isFullHtmlDocument = (content) => {
      if (!content || typeof content !== "string") return false;
      const lower = content.trim().toLowerCase();
      return (
        lower.startsWith("<!doctype") ||
        lower.startsWith("<html") ||
        lower.includes("<body") ||
        lower.includes("<head")
      );
    };

    let html;

    if (newsletter.htmlContent && isFullHtmlDocument(newsletter.htmlContent)) {
      // Use the full custom HTML document directly to avoid nesting inside another template
      let customHtml = newsletter.htmlContent;

      // Replace placeholders
      customHtml = customHtml.replace(/\{\{UNSUBSCRIBE_URL\}\}/g, unsubscribeUrl);
      customHtml = customHtml.replace(/\{\{SUBSCRIBER_EMAIL\}\}/g, encodeURIComponent(subscriber.email));
      customHtml = customHtml.replace(/\{\{NEWSLETTER_TITLE\}\}/g, escapeHtml(rawTitle));
      customHtml = customHtml.replace(/\{\{NEWSLETTER_BODY\}\}/g, escapeHtml(newsletter.description || ""));

      // Replace data:image base64 or empty logo with reliable cid:ag-brand so it doesn't show broken in Gmail
      customHtml = customHtml.replace(/<img([^>]*src=["'])(data:image\/[^"']+|)("[^>]*alt=["']Agarwal Group["'][^>]*)>/gi, (match, p1, p2, p3) => {
        return `<img${p1}cid:ag-brand${p3}>`;
      });

      // Ensure the bottom links (Visit our Blog | Unsubscribe) are present
      if (!customHtml.includes("Visit our Blog")) {
        const bottomLinksBar = `
        <!-- Bottom Links matching user requirement (Visit our Blog | Unsubscribe) -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin: 18px auto 0;">
          <tr>
            <td align="center" style="padding: 10px 16px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 20px;">
              <a href="${escapeHtml(blogUrl)}" target="_blank" style="color: #1a56db; text-decoration: underline; font-weight: 500;">Visit our Blog</a>
              <span style="color: #64748b; margin: 0 10px;">|</span>
              <a href="${escapeHtml(unsubscribeUrl)}" target="_blank" style="color: #1a56db; text-decoration: underline; font-weight: 500;">Unsubscribe</a>
            </td>
          </tr>
        </table>`;

        if (customHtml.includes("</body>")) {
          customHtml = customHtml.replace("</body>", `${bottomLinksBar}\n</body>`);
        } else {
          customHtml += bottomLinksBar;
        }
      }

      html = customHtml;
    } else {
      // Format body paragraphs (supports custom snippet if provided)
      const rawContent = (newsletter.htmlContent && newsletter.htmlContent.trim())
        ? newsletter.htmlContent.trim()
        : rawDesc;

      const formattedDesc = rawContent.includes("<") && rawContent.includes(">")
        ? rawContent
        : rawContent
            .split(/\n\s*\n/)
            .map((para) => `<p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #43443C;">${escapeHtml(para.trim()).replace(/\n/g, "<br>")}</p>`)
            .join("");

      const subtitleHtml = rawSubtitle
        ? `<p style="margin: 0 0 16px 0; font-size: 16px; line-height: 24px; color: #785D20; font-weight: 600;">${escapeHtml(rawSubtitle)}</p>`
        : "";

      const imageLink = sanitizeUrl(newsletter.imageRedirectUrl) || "https://www.agarwalgroup.in/";

      const featuredImageRow = featuredImageSrc
        ? `
            <!-- 2. FEATURED IMAGE -->
            <tr>
              <td style="padding: 0; background-color: #FFFFFF;">
                <a href="${escapeHtml(imageLink)}" target="_blank" style="display: block; text-decoration: none;">
                  <img
                    src="${escapeHtml(featuredImageSrc)}"
                    alt="${escapeHtml(rawTitle)}"
                    width="600"
                    style="width: 100%; max-width: 600px; height: auto;"
                  />
                </a>
              </td>
            </tr>`
        : "";

      html = `
<!DOCTYPE html>
<html lang="en" xmlns="http://www.w3.org/1999/xhtml">
<head>
  <meta charset="utf-8" />
  <meta name="viewport" content="width=device-width, initial-scale=1.0" />
  <meta http-equiv="X-UA-Compatible" content="IE=edge" />
  <meta name="x-apple-disable-message-reformatting" />
  <title>${escapeHtml(rawTitle)}</title>
  <style type="text/css">
    html, body {
      margin: 0 !important;
      padding: 0 !important;
      width: 100% !important;
      background-color: #F6F4EE !important;
    }
    table, td {
      border-collapse: collapse !important;
      mso-table-lspace: 0pt !important;
      mso-table-rspace: 0pt !important;
    }
    img {
      border: 0;
      height: auto;
      line-height: 100%;
      outline: none;
      text-decoration: none;
      display: block;
    }
    @media only screen and (max-width: 620px) {
      .container {
        width: 100% !important;
        max-width: 100% !important;
      }
      .pad {
        padding-left: 20px !important;
        padding-right: 20px !important;
      }
      .title {
        font-size: 24px !important;
        line-height: 30px !important;
      }
    }
  </style>
</head>
<body style="margin: 0; padding: 0; background-color: #F6F4EE; font-family: Arial, Helvetica, sans-serif;">

  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background-color: #F6F4EE;">
    <tr>
      <td align="center" style="padding: 24px 12px;">

        <!-- Main Email Container -->
        <table role="presentation" width="600" cellspacing="0" cellpadding="0" border="0" class="container" style="width: 100%; max-width: 600px; background-color: #FFFFFF; border: 1px solid #E3DED3; border-radius: 8px; overflow: hidden;">

          <!-- 1. LOGO HEADER -->
          <tr>
            <td align="center" class="pad" style="padding: 24px 32px; background-color: #FFFFFF; border-bottom: 1px solid #E3DED3;">
              <a href="https://www.agarwalgroup.in/" target="_blank" style="display: inline-block; text-decoration: none;">
                <img
                  src="cid:ag-brand"
                  alt="Agarwal Group"
                  width="212"
                  height="40"
                  style="width: 212px; max-width: 100%; height: auto;"
                />
              </a>
            </td>
          </tr>

          ${featuredImageRow}

          <!-- 3. TITLE & 4. BODY -->
          <tr>
            <td class="pad" style="padding: 32px; background-color: #FFFFFF;">
              <p style="margin: 0 0 8px 0; font-size: 12px; line-height: 16px; letter-spacing: 1.5px; text-transform: uppercase; color: #785D20; font-weight: bold;">
                Newsletter Update
              </p>

              <!-- TITLE -->
              <h1 class="title" style="margin: 0 0 16px 0; font-family: Georgia, 'Times New Roman', serif; font-size: 28px; line-height: 34px; font-weight: normal; color: #1E1F1A;">
                ${escapeHtml(rawTitle)}
              </h1>

              <!-- BODY -->
              <p style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #43443C;">
                Hello Subscriber,
              </p>
              ${subtitleHtml}
              <div style="margin: 0 0 16px 0; font-size: 15px; line-height: 24px; color: #43443C;">
                ${formattedDesc}
              </div>
              <p style="margin: 0 0 24px 0; font-size: 15px; line-height: 24px; color: #43443C;">
                Stay informed about our latest project launches, construction milestones, and exclusive offers across Vasai–Virar and Mumbai.
              </p>

              <!-- CTA BUTTON -->
              <table role="presentation" cellspacing="0" cellpadding="0" border="0">
                <tr>
                  <td align="center" style="border-radius: 4px; background-color: #183C2F;">
                    <a href="https://www.agarwalgroup.in/" target="_blank" style="display: inline-block; padding: 13px 24px; font-size: 13px; line-height: 16px; font-weight: bold; letter-spacing: 1px; text-transform: uppercase; color: #FFFFFF; text-decoration: none;">
                      Explore Projects &rarr;
                    </a>
                  </td>
                </tr>
              </table>
            </td>
          </tr>

          <!-- 5. FOOTER -->
          <tr>
            <td align="center" class="pad" style="padding: 28px 32px; background-color: #1E1F1A; color: #D4CFC4;">
              <a href="https://www.agarwalgroup.in/" target="_blank" style="display: inline-block; margin-bottom: 16px; text-decoration: none;">
                <img
                  src="cid:ag-brand-white"
                  alt="Agarwal Group"
                  width="170"
                  height="32"
                  style="width: 170px; max-width: 100%; height: auto;"
                />
              </a>

              <p style="margin: 0 0 10px 0; font-size: 12px; line-height: 19px; color: #B8B2A6;">
                9, Gokul Annexe, Agarwal Gardens, Opp. Muljibhai Mehta School,<br />
                Gokul Township, Virar (W), Maharashtra - 401303, India
              </p>

              <p style="margin: 0 0 16px 0; font-size: 12px; line-height: 18px; color: #DCBC7C;">
                <a href="tel:+918408008001" style="color: #DCBC7C; text-decoration: none;">+91 84080 08001</a>
                &nbsp;&middot;&nbsp;
                <a href="mailto:sales@agarwalrealties.com" style="color: #DCBC7C; text-decoration: none;">sales@agarwalrealties.com</a>
              </p>

              <p style="margin: 0; font-size: 11px; line-height: 18px; color: #8F897D;">
                &copy; 2026 Agarwal Group. All rights reserved. &middot;
                <a href="${escapeHtml(unsubscribeUrl)}" style="color: #DCBC7C; text-decoration: underline;">Unsubscribe</a>
              </p>
            </td>
          </tr>

        </table>
        <!-- /Main Email Container -->

        <!-- Bottom Links matching user requirement (Visit our Blog | Unsubscribe) -->
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width: 600px; margin-top: 18px;">
          <tr>
            <td align="center" style="padding: 10px 16px; font-family: Arial, Helvetica, sans-serif; font-size: 14px; line-height: 20px;">
              <a href="${escapeHtml(blogUrl)}" target="_blank" style="color: #1a56db; text-decoration: underline; font-weight: 500;">Visit our Blog</a>
              <span style="color: #64748b; margin: 0 10px;">|</span>
              <a href="${escapeHtml(unsubscribeUrl)}" target="_blank" style="color: #1a56db; text-decoration: underline; font-weight: 500;">Unsubscribe</a>
            </td>
          </tr>
        </table>

      </td>
    </tr>
  </table>

</body>
</html>
      `.trim();
    }

    const plainDesc = rawDesc.replace(/<[^>]*>/g, "").trim();
    const textContent = `${rawTitle}\n${rawSubtitle ? rawSubtitle + "\n" : ""}\nHello Subscriber,\n\n${plainDesc}\n\nStay informed about our latest project launches, construction milestones, and exclusive offers across Vasai–Virar and Mumbai.\n\nExplore Projects: https://www.agarwalgroup.in/\n\nUnsubscribe: ${unsubscribeUrl}`;

    const attachments = getBrandedAttachments();
    if (featuredAttachment) {
      attachments.push(featuredAttachment);
    }

    const mailOptions = {
      from: EMAIL_FROM,
      to: subscriber.email,
      subject: cleanSubject(rawTitle),
      text: textContent,
      html,
      attachments,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[NEWSLETTER BROADCAST] Sent to ${subscriber.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[NEWSLETTER BROADCAST] Error sending to ${subscriber.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

exports.sendNewsletterBroadcast = async (newsletter, subscribers = []) => {
  if (!Array.isArray(subscribers) || subscribers.length === 0) {
    console.log("[NEWSLETTER BROADCAST] No active subscribers to broadcast to.");
    return { total: 0, sent: 0, failed: 0 };
  }

  console.log(`[NEWSLETTER BROADCAST] Broadcasting issue #${newsletter.id} ("${newsletter.title}") to ${subscribers.length} subscriber(s)...`);

  let sent = 0;
  let failed = 0;

  for (const subscriber of subscribers) {
    try {
      const res = await exports.sendNewsletterIssueEmail(subscriber, newsletter);
      if (res && res.success) sent++;
      else failed++;
    } catch (err) {
      failed++;
    }
  }

  console.log(`[NEWSLETTER BROADCAST] Broadcast complete: ${sent} sent, ${failed} failed out of ${subscribers.length} total.`);
  return { total: subscribers.length, sent, failed };
};

