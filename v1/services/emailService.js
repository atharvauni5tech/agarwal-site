const nodemailer = require("nodemailer");
const path = require("path");
const fs = require("fs");
require("dotenv").config();

// ================= STATIC EMAIL CONFIG =================
const EMAIL_HOST = "email-smtp.ap-south-1.amazonaws.com";
const EMAIL_PORT = 587;
const EMAIL_FROM = '"Agarwal Reality" <noreply@teradoengineering.com>';
const ADMIN_EMAIL = process.env.ADMIN_EMAIL || "atharva.pandharikar@uni5.tech";

const LOGO_PATH = path.join(__dirname, "../../assets/agarwal-logo.png");

const getLogoAttachment = () => {
  if (fs.existsSync(LOGO_PATH)) {
    return [
      {
        filename: "agarwal-logo.png",
        path: LOGO_PATH,
        cid: "agarwalLogo",
      },
    ];
  }
  return [];
};

const logoHeaderHtml = `
  <div style="background:#ffffff; padding:22px 20px; text-align:center; border-bottom:3px solid #1e3a8a;">
    <img src="cid:agarwalLogo" alt="Agarwal Reality" style="max-height:52px; max-width:240px; height:auto; display:inline-block;" />
  </div>
`;

const transporter = nodemailer.createTransport({
  host: EMAIL_HOST,
  port: EMAIL_PORT,
  secure: false, // true for port 465, false for 587/25
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});

// ================= SEND OTP EMAIL =================
exports.sendOtpEmail = async (toEmail, otp) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: toEmail,
      subject: "Your Login OTP - Agarwal Reality",
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family: Arial, sans-serif; background:#f3f4f6; padding:30px;">
          <div style="max-width:600px; margin:auto; background:#ffffff; border:1px solid #e5e7eb; border-radius:10px; overflow:hidden; box-shadow:0 4px 15px rgba(0,0,0,0.06);">
            ${logoHeaderHtml}

            <!-- Body -->
            <div style="padding:28px 25px;">
              <h2 style="color:#111827; margin-top:0;">Verify Your Login</h2>

              <p style="color:#374151; font-size:14px; line-height:1.6;">
                Dear User,<br><br>
                We received a request to sign in to your Agarwal Reality account.  
                Please use the One-Time Password (OTP) below to complete your login verification.
              </p>

              <!-- OTP Box -->
              <div style="text-align:center; margin:30px 0;">
                <div style="display:inline-block; padding:15px 30px; border:2px dashed #2563eb; border-radius:8px; background:#f0f6ff;">
                  <span style="font-size:34px; font-weight:bold; letter-spacing:5px; color:#1e40af;">
                    ${otp}
                  </span>
                </div>
              </div>

              <p style="color:#374151; font-size:14px; line-height:1.6;">
                This OTP is valid for <strong>5 minutes</strong>.  
                If you did not request this login, please ignore this email or contact support immediately.
              </p>
            </div>

            <!-- Footer -->
            <div style="border-top:1px solid #e5e7eb; padding:15px 25px; background:#fafafa; text-align:center;">
              <p style="font-size:12px; color:#6b7280; margin:0; line-height:1.5;">
                Regards, <strong>Agarwal Reality IT Team</strong><br>
                <span style="color:#9ca3af;">This is an automated security verification email. Please do not reply.</span>
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log("📧 OTP Email Sent:", info.messageId);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error("❌ EMAIL ERROR:", err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= SEND LEAD REGISTRATION THANK YOU EMAIL =================
exports.sendLeadThankYouEmail = async (lead, leadDetail = {}) => {
  try {
    const configLine = leadDetail.preferredConfiguration ? `<li><strong>Preferred Configuration:</strong> ${leadDetail.preferredConfiguration}</li>` : "";
    const budgetLine = leadDetail.estimatedBudget ? `<li><strong>Estimated Budget:</strong> ${leadDetail.estimatedBudget}</li>` : "";
    const cityLine = leadDetail.city ? `<li><strong>Preferred Location:</strong> ${leadDetail.city}</li>` : "";
    const inquiryDetailsHtml = (configLine || budgetLine || cityLine) ? `
      <div style="background:#f8fafc; border-left:4px solid #1e3a8a; padding:12px 18px; margin:20px 0; border-radius:4px;">
        <h4 style="margin:0 0 8px 0; color:#0f172a; font-size:14px; text-transform:uppercase; letter-spacing:0.5px;">Summary of Your Preferences</h4>
        <ul style="margin:0; padding-left:18px; color:#475569; font-size:14px; line-height:1.7;">
          ${configLine}
          ${budgetLine}
          ${cityLine}
        </ul>
      </div>
    ` : "";

    const mailOptions = {
      from: EMAIL_FROM,
      to: lead.email,
      subject: "Thank You for Inquiring with Agarwal Reality",
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#f8fafc; padding:40px 15px;">
          <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
            ${logoHeaderHtml}

            <!-- Body -->
            <div style="padding:30px 25px;">
              <h2 style="color:#0f172a; font-size:18px; margin-top:0;">Dear ${lead.fullName},</h2>

              <p style="color:#334155; font-size:15px; line-height:1.7;">
                Thank you for your interest in <strong>Agarwal Reality</strong>. We have successfully registered your inquiry (Reference ID: <strong>#AR-${lead.id}</strong>).
              </p>

              <p style="color:#334155; font-size:15px; line-height:1.7;">
                Our dedicated <strong>Customer Relationship Representative</strong> will get in touch with you shortly to understand your requirements in detail and provide handpicked, prime property options tailored to your lifestyle and investment goals.
              </p>

              ${inquiryDetailsHtml}

              <p style="color:#334155; font-size:15px; line-height:1.7;">
                Should you have any immediate questions or need priority assistance, please feel free to reach out to our advisory desk.
              </p>

              <div style="margin-top:25px; padding-top:20px; border-top:1px solid #e2e8f0;">
                <p style="color:#0f172a; font-size:14px; margin:0; font-weight:600;">Warm regards,</p>
                <p style="color:#64748b; font-size:14px; margin:4px 0 0 0;">Customer Relations Team</p>
                <p style="color:#0f172a; font-size:14px; margin:2px 0 0 0; font-weight:700;">Agarwal Reality</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:15px 25px; text-align:center;">
              <p style="color:#94a3b8; font-size:12px; margin:0; line-height:1.5;">
                This is an automated acknowledgment message. You are receiving this because an inquiry was submitted with this email address.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Thank-you email sent to ${lead.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending thank-you email to ${lead.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= SEND CALLBACK CONFIRMATION TO CUSTOMER =================
exports.sendCallbackRequestEmail = async (lead) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: lead.email,
      subject: "We Have Received Your Call Back Request - Agarwal Reality",
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#f8fafc; padding:40px 15px;">
          <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
            ${logoHeaderHtml}

            <!-- Body -->
            <div style="padding:30px 25px;">
              <h2 style="color:#0f172a; font-size:18px; margin-top:0;">Dear ${lead.fullName},</h2>

              <p style="color:#334155; font-size:15px; line-height:1.7;">
                Thank you for reaching out to <strong>Agarwal Reality</strong>. We have successfully logged your callback request (Reference ID: <strong>#CB-${lead.id}</strong>).
              </p>

              <div style="background:#eff6ff; border-left:4px solid #1e3a8a; padding:16px; border-radius:6px; margin:20px 0;">
                <p style="margin:0; color:#1e40af; font-size:14px; line-height:1.6; font-weight:500;">
                  Our customer executive will get in touch with you shortly on your provided contact number <strong>${lead.mobileNumber}</strong> to assist you with complete project details and personalized consultation.
                </p>
              </div>

              <p style="color:#334155; font-size:15px; line-height:1.7;">
                Our advisory team operates between <strong>9:30 AM to 7:00 PM IST</strong>, Monday through Sunday. If you submitted this request outside these hours, we will connect with you first thing the next morning.
              </p>

              <div style="margin-top:25px; padding-top:20px; border-top:1px solid #e2e8f0;">
                <p style="color:#0f172a; font-size:14px; margin:0; font-weight:600;">Warm regards,</p>
                <p style="color:#64748b; font-size:14px; margin:4px 0 0 0;">Customer Relations Team</p>
                <p style="color:#0f172a; font-size:14px; margin:2px 0 0 0; font-weight:700;">Agarwal Reality</p>
              </div>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:15px 25px; text-align:center;">
              <p style="color:#94a3b8; font-size:12px; margin:0; line-height:1.5;">
                This is an automated acknowledgment message. You are receiving this because a callback was requested using this email address.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Customer callback email sent to ${lead.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending callback email to ${lead.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= SEND IMMEDIATE CALLBACK ALERT TO ADMIN =================
exports.sendAdminCallbackAlertEmail = async (lead) => {
  try {
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const mailOptions = {
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `🚨 New Callback Request: ${lead.fullName} (${lead.mobileNumber})`,
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#f1f5f9; padding:40px 15px;">
          <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
            ${logoHeaderHtml}

            <!-- Alert Header -->
            <div style="background:#dc2626; padding:12px 25px; text-align:center;">
              <h3 style="color:#ffffff; margin:0; font-size:15px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase;">
                ⚡ Urgent: Immediate Callback Requested
              </h3>
            </div>

            <!-- Body -->
            <div style="padding:28px 25px;">
              <p style="color:#334155; font-size:15px; margin-top:0;">
                A new immediate callback request has been submitted on the website. Please assign a representative to call the lead as soon as possible.
              </p>

              <table style="width:100%; border-collapse:collapse; margin:20px 0; background:#f8fafc; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:12px 16px; font-weight:600; color:#475569; border-bottom:1px solid #e2e8f0; width:35%;">Lead ID</td>
                  <td style="padding:12px 16px; color:#0f172a; font-weight:700; border-bottom:1px solid #e2e8f0;">#CB-${lead.id}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-weight:600; color:#475569; border-bottom:1px solid #e2e8f0;">Full Name</td>
                  <td style="padding:12px 16px; color:#0f172a; font-weight:600; border-bottom:1px solid #e2e8f0;">${lead.fullName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-weight:600; color:#475569; border-bottom:1px solid #e2e8f0;">Mobile Number</td>
                  <td style="padding:12px 16px; color:#1d4ed8; font-weight:700; border-bottom:1px solid #e2e8f0;">
                    <a href="tel:${lead.mobileNumber}" style="color:#1d4ed8; text-decoration:none;">${lead.mobileNumber}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-weight:600; color:#475569; border-bottom:1px solid #e2e8f0;">Email Address</td>
                  <td style="padding:12px 16px; color:#0f172a; border-bottom:1px solid #e2e8f0;">
                    <a href="mailto:${lead.email}" style="color:#1d4ed8; text-decoration:none;">${lead.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-weight:600; color:#475569;">Received At</td>
                  <td style="padding:12px 16px; color:#64748b;">${timestamp}</td>
                </tr>
              </table>

              <!-- Call Now Action Button -->
              <div style="text-align:center; margin:25px 0;">
                <a href="tel:${lead.mobileNumber}" style="display:inline-block; background:#1e3a8a; color:#ffffff; font-weight:700; font-size:15px; padding:12px 30px; border-radius:6px; text-decoration:none; box-shadow:0 4px 10px rgba(30,58,138,0.3);">
                  📞 Call Lead Now (${lead.mobileNumber})
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:12px 25px; text-align:center;">
              <p style="color:#94a3b8; font-size:12px; margin:0;">
                Agarwal Reality CRM Notification System • Logged in Sales Data Excel (Immediate Callback Request)
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin callback alert sent to ${ADMIN_EMAIL}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending admin callback alert to ${ADMIN_EMAIL}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= SEND BROCHURE DOWNLOAD ALERT TO ADMIN ONLY =================
exports.sendAdminBrochureAlertEmail = async (lead) => {
  try {
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const mailOptions = {
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `📥 New Brochure Download Lead: ${lead.fullName} (${lead.mobileNumber})`,
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#f1f5f9; padding:40px 15px;">
          <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
            ${logoHeaderHtml}

            <!-- Header -->
            <div style="background:#0f172a; padding:12px 25px; text-align:center;">
              <h3 style="color:#ffffff; margin:0; font-size:15px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase;">
                📄 Brochure Download Lead Registered
              </h3>
            </div>

            <!-- Body -->
            <div style="padding:28px 25px;">
              <p style="color:#334155; font-size:15px; margin-top:0;">
                A visitor has requested/downloaded the project brochure. Customer details have been logged in the Sales Data Excel under <strong>Brocedure Download Request</strong>.
              </p>

              <table style="width:100%; border-collapse:collapse; margin:20px 0; background:#f8fafc; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0;">
                <tr>
                  <td style="padding:12px 16px; font-weight:600; color:#475569; border-bottom:1px solid #e2e8f0; width:35%;">Lead ID</td>
                  <td style="padding:12px 16px; color:#0f172a; font-weight:700; border-bottom:1px solid #e2e8f0;">#BR-${lead.id}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-weight:600; color:#475569; border-bottom:1px solid #e2e8f0;">Full Name</td>
                  <td style="padding:12px 16px; color:#0f172a; font-weight:600; border-bottom:1px solid #e2e8f0;">${lead.fullName}</td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-weight:600; color:#475569; border-bottom:1px solid #e2e8f0;">Mobile Number</td>
                  <td style="padding:12px 16px; color:#1d4ed8; font-weight:700; border-bottom:1px solid #e2e8f0;">
                    <a href="tel:${lead.mobileNumber}" style="color:#1d4ed8; text-decoration:none;">${lead.mobileNumber}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-weight:600; color:#475569; border-bottom:1px solid #e2e8f0;">Email Address</td>
                  <td style="padding:12px 16px; color:#0f172a; border-bottom:1px solid #e2e8f0;">
                    <a href="mailto:${lead.email}" style="color:#1d4ed8; text-decoration:none;">${lead.email}</a>
                  </td>
                </tr>
                <tr>
                  <td style="padding:12px 16px; font-weight:600; color:#475569;">Registered At</td>
                  <td style="padding:12px 16px; color:#64748b;">${timestamp}</td>
                </tr>
              </table>

              <!-- Call Now Action Button -->
              <div style="text-align:center; margin:25px 0;">
                <a href="tel:${lead.mobileNumber}" style="display:inline-block; background:#0f172a; color:#ffffff; font-weight:700; font-size:15px; padding:12px 30px; border-radius:6px; text-decoration:none; box-shadow:0 4px 10px rgba(15,23,42,0.3);">
                  📞 Follow Up with Lead (${lead.mobileNumber})
                </a>
              </div>
            </div>

            <!-- Footer -->
            <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:12px 25px; text-align:center;">
              <p style="color:#94a3b8; font-size:12px; margin:0;">
                Agarwal Reality CRM Notification System • Logged in Sales Data Excel (Brocedure Download Request)
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin brochure download alert sent to ${ADMIN_EMAIL}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending admin brochure alert to ${ADMIN_EMAIL}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= CHANNEL PARTNER EMAILS =================
exports.sendChannelPartnerConfirmationEmail = async (partner) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: partner.email,
      subject: "Channel Partner Registration Received - Agarwal Reality",
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#f8fafc; padding:40px 15px;">
          <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
            ${logoHeaderHtml}

            <div style="padding:30px 25px;">
              <h2 style="color:#0f172a; font-size:18px; margin-top:0;">Dear ${partner.fullName},</h2>

              <p style="color:#334155; font-size:15px; line-height:1.7;">
                Thank you for applying to partner with <strong>Agarwal Reality</strong>. We have successfully registered your Channel Partner application (Reference ID: <strong>#CP-${partner.id}</strong>).
              </p>

              <div style="background:#eff6ff; border-left:4px solid #1e3a8a; padding:16px; border-radius:6px; margin:20px 0;">
                <p style="margin:0; color:#1e40af; font-size:14px; line-height:1.6; font-weight:500;">
                  Firm / Company: <strong>${partner.firmOrCompanyName}</strong><br>
                  RERA Reg. No: <strong>${partner.reraRegNo}</strong><br>
                  City of Operation: <strong>${partner.cityOfOperation}</strong>
                </p>
              </div>

              <p style="color:#334155; font-size:15px; line-height:1.7;">
                Our Channel Partner Relations Desk is reviewing your registration credentials and will reach out with our partner empanelment kit, commission structure, and active project inventories shortly.
              </p>

              <div style="margin-top:25px; padding-top:20px; border-top:1px solid #e2e8f0;">
                <p style="color:#0f172a; font-size:14px; margin:0; font-weight:600;">Warm regards,</p>
                <p style="color:#64748b; font-size:14px; margin:4px 0 0 0;">Channel Partner Relations Team</p>
                <p style="color:#0f172a; font-size:14px; margin:2px 0 0 0; font-weight:700;">Agarwal Reality</p>
              </div>
            </div>

            <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:15px 25px; text-align:center;">
              <p style="color:#94a3b8; font-size:12px; margin:0;">
                This is an automated acknowledgment message from Agarwal Reality.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Channel Partner confirmation sent to ${partner.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Channel Partner confirmation to ${partner.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

exports.sendAdminChannelPartnerAlert = async (partner) => {
  try {
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const mailOptions = {
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `🤝 New Channel Partner Registration: ${partner.firmOrCompanyName} (${partner.fullName})`,
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#f1f5f9; padding:40px 15px;">
          <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
            ${logoHeaderHtml}

            <div style="background:#1e3a8a; padding:12px 25px; text-align:center;">
              <h3 style="color:#ffffff; margin:0; font-size:15px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase;">
                New Channel Partner Registration
              </h3>
            </div>

            <div style="padding:28px 25px;">
              <table style="width:100%; border-collapse:collapse; margin:20px 0; background:#f8fafc; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0;">
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569; width:35%;">Partner ID</td><td style="padding:10px 16px; font-weight:700;">#CP-${partner.id}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Full Name</td><td style="padding:10px 16px; font-weight:600;">${partner.fullName}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Firm / Company</td><td style="padding:10px 16px; font-weight:600;">${partner.firmOrCompanyName}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">RERA Reg. No</td><td style="padding:10px 16px; font-weight:700; color:#1e40af;">${partner.reraRegNo}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Mobile Number</td><td style="padding:10px 16px;"><a href="tel:${partner.mobileNumber}">${partner.mobileNumber}</a></td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Email</td><td style="padding:10px 16px;"><a href="mailto:${partner.email}">${partner.email}</a></td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">City of Operation</td><td style="padding:10px 16px;">${partner.cityOfOperation}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Submitted At</td><td style="padding:10px 16px; color:#64748b;">${timestamp}</td></tr>
              </table>
            </div>

            <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:12px 25px; text-align:center;">
              <p style="color:#94a3b8; font-size:12px; margin:0;">Logged in HR Data Excel (Channel Partner Data)</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin Channel Partner alert sent to ${ADMIN_EMAIL}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Admin Channel Partner alert to ${ADMIN_EMAIL}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= SUPPLIER EMAILS =================
exports.sendSupplierConfirmationEmail = async (supplier) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: supplier.email,
      subject: "Supplier Registration Received - Agarwal Reality",
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#f8fafc; padding:40px 15px;">
          <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
            ${logoHeaderHtml}

            <div style="padding:30px 25px;">
              <h2 style="color:#0f172a; font-size:18px; margin-top:0;">Dear ${supplier.supplierName},</h2>

              <p style="color:#334155; font-size:15px; line-height:1.7;">
                Thank you for submitting your vendor / supplier profile for <strong>${supplier.companyName}</strong> to <strong>Agarwal Reality</strong> (Reference ID: <strong>#SUP-${supplier.id}</strong>).
              </p>

              <p style="color:#334155; font-size:15px; line-height:1.7;">
                Our Procurement & Contracts Team is reviewing your company profile, service categories, and catalogues. As project procurement cycles initiate, our sourcing managers will connect with you for RFQs and tender invitations.
              </p>

              <div style="margin-top:25px; padding-top:20px; border-top:1px solid #e2e8f0;">
                <p style="color:#0f172a; font-size:14px; margin:0; font-weight:600;">Warm regards,</p>
                <p style="color:#64748b; font-size:14px; margin:4px 0 0 0;">Procurement & Vendor Desk</p>
                <p style="color:#0f172a; font-size:14px; margin:2px 0 0 0; font-weight:700;">Agarwal Reality</p>
              </div>
            </div>

            <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:15px 25px; text-align:center;">
              <p style="color:#94a3b8; font-size:12px; margin:0;">
                This is an automated acknowledgment message from Agarwal Reality.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Supplier confirmation sent to ${supplier.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Supplier confirmation to ${supplier.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

exports.sendAdminSupplierAlert = async (supplier) => {
  try {
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });
    const categoriesStr = Array.isArray(supplier.serviceCategories)
      ? supplier.serviceCategories.join(", ")
      : (supplier.serviceCategories || "N/A");

    const mailOptions = {
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `🏭 New Supplier / Vendor Registration: ${supplier.companyName}`,
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#f1f5f9; padding:40px 15px;">
          <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
            ${logoHeaderHtml}

            <div style="background:#0f172a; padding:12px 25px; text-align:center;">
              <h3 style="color:#ffffff; margin:0; font-size:15px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase;">
                New Supplier Registration
              </h3>
            </div>

            <div style="padding:28px 25px;">
              <table style="width:100%; border-collapse:collapse; margin:20px 0; background:#f8fafc; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0;">
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569; width:35%;">Supplier ID</td><td style="padding:10px 16px; font-weight:700;">#SUP-${supplier.id}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Company Name</td><td style="padding:10px 16px; font-weight:600;">${supplier.companyName}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Contact Person</td><td style="padding:10px 16px;">${supplier.supplierName}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Mobile Number</td><td style="padding:10px 16px;"><a href="tel:${supplier.mobileNumber}">${supplier.mobileNumber}</a></td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Email</td><td style="padding:10px 16px;"><a href="mailto:${supplier.email}">${supplier.email}</a></td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Service Categories</td><td style="padding:10px 16px;">${categoriesStr}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Experience</td><td style="padding:10px 16px;">${supplier.yearsOfExperience || "N/A"}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Operation Area</td><td style="padding:10px 16px;">${supplier.areaOfOperation || "N/A"}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Submitted At</td><td style="padding:10px 16px; color:#64748b;">${timestamp}</td></tr>
              </table>
            </div>

            <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:12px 25px; text-align:center;">
              <p style="color:#94a3b8; font-size:12px; margin:0;">Logged in HR Data Excel (Supplier Data)</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin Supplier alert sent to ${ADMIN_EMAIL}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Admin Supplier alert to ${ADMIN_EMAIL}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

// ================= CAREER APPLICATION EMAILS =================
exports.sendCareerConfirmationEmail = async (candidate) => {
  try {
    const mailOptions = {
      from: EMAIL_FROM,
      to: candidate.email,
      subject: `Application Received: ${candidate.appliedForPosition} - Agarwal Reality`,
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#f8fafc; padding:40px 15px;">
          <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.06); border:1px solid #e2e8f0;">
            ${logoHeaderHtml}

            <div style="padding:30px 25px;">
              <h2 style="color:#0f172a; font-size:18px; margin-top:0;">Dear ${candidate.fullName},</h2>

              <p style="color:#334155; font-size:15px; line-height:1.7;">
                Thank you for applying for the position of <strong>${candidate.appliedForPosition}</strong> at <strong>Agarwal Reality</strong> (Application Ref: <strong>#JOB-${candidate.id}</strong>).
              </p>

              <p style="color:#334155; font-size:15px; line-height:1.7;">
                Our Talent Acquisition team is reviewing your profile and uploaded resume. If your qualifications match our current openings, a member of our HR team will contact you to discuss next steps.
              </p>

              <div style="margin-top:25px; padding-top:20px; border-top:1px solid #e2e8f0;">
                <p style="color:#0f172a; font-size:14px; margin:0; font-weight:600;">Warm regards,</p>
                <p style="color:#64748b; font-size:14px; margin:4px 0 0 0;">Human Resources & Talent Acquisition</p>
                <p style="color:#0f172a; font-size:14px; margin:2px 0 0 0; font-weight:700;">Agarwal Reality</p>
              </div>
            </div>

            <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:15px 25px; text-align:center;">
              <p style="color:#94a3b8; font-size:12px; margin:0;">
                This is an automated acknowledgment message from Agarwal Reality Careers.
              </p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Career confirmation sent to ${candidate.email}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Career confirmation to ${candidate.email}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

exports.sendAdminCareerAlert = async (candidate) => {
  try {
    const timestamp = new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    const mailOptions = {
      from: EMAIL_FROM,
      to: ADMIN_EMAIL,
      subject: `💼 New Job Application: ${candidate.appliedForPosition} - ${candidate.fullName}`,
      attachments: getLogoAttachment(),
      html: `
        <div style="font-family:'Segoe UI',Roboto,Helvetica,Arial,sans-serif; background-color:#f1f5f9; padding:40px 15px;">
          <div style="max-width:580px; margin:0 auto; background:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 10px 25px rgba(0,0,0,0.08); border:1px solid #e2e8f0;">
            ${logoHeaderHtml}

            <div style="background:#0f172a; padding:12px 25px; text-align:center;">
              <h3 style="color:#ffffff; margin:0; font-size:15px; font-weight:700; letter-spacing:0.5px; text-transform:uppercase;">
                New Candidate Application
              </h3>
            </div>

            <div style="padding:28px 25px;">
              <table style="width:100%; border-collapse:collapse; margin:20px 0; background:#f8fafc; border-radius:8px; overflow:hidden; border:1px solid #e2e8f0;">
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569; width:35%;">Applicant ID</td><td style="padding:10px 16px; font-weight:700;">#JOB-${candidate.id}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Position Applied</td><td style="padding:10px 16px; font-weight:700; color:#1e40af;">${candidate.appliedForPosition}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Candidate Name</td><td style="padding:10px 16px; font-weight:600;">${candidate.fullName}</td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Mobile Number</td><td style="padding:10px 16px;"><a href="tel:${candidate.mobileNumber}">${candidate.mobileNumber}</a></td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Email</td><td style="padding:10px 16px;"><a href="mailto:${candidate.email}">${candidate.email}</a></td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Resume Link</td><td style="padding:10px 16px;"><a href="${candidate.resumeUploadLink}" target="_blank" style="color:#1d4ed8; font-weight:600;">📄 View / Download Resume</a></td></tr>
                <tr><td style="padding:10px 16px; font-weight:600; color:#475569;">Applied At</td><td style="padding:10px 16px; color:#64748b;">${timestamp}</td></tr>
              </table>
            </div>

            <div style="background:#f8fafc; border-top:1px solid #e2e8f0; padding:12px 25px; text-align:center;">
              <p style="color:#94a3b8; font-size:12px; margin:0;">Logged in HR Data Excel (Career Data)</p>
            </div>
          </div>
        </div>
      `,
    };

    const info = await transporter.sendMail(mailOptions);
    console.log(`[EMAIL] Admin Career alert sent to ${ADMIN_EMAIL}: ${info.messageId}`);
    return { success: true, messageId: info.messageId };
  } catch (err) {
    console.error(`[EMAIL] Error sending Admin Career alert to ${ADMIN_EMAIL}:`, err.message || err);
    return { success: false, error: err.message };
  }
};

