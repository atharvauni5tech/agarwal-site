const axios = require("axios");

/**
 * Appends lead data to Sales Google Sheet via Google Apps Script Webhook.
 */
exports.appendLeadToGoogleSheet = async (
  lead,
  leadDetail = {},
  sheetName = "Customer Registration",
  targetWorkbook = "SALES"
) => {
  const webhookUrl =
    targetWorkbook === "HR"
      ? process.env.GOOGLE_SHEET_HR_WEBHOOK_URL
      : process.env.GOOGLE_SHEET_SALES_WEBHOOK_URL || process.env.GOOGLE_SHEET_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(`[GOOGLE SHEET] Webhook URL for ${targetWorkbook} not configured in .env, skipping.`);
    return { success: false, message: "Webhook URL not configured" };
  }

  try {
    const payload = {
      sheetName,
      id: lead.id,
      fullName: lead.fullName || "",
      email: lead.email || "",
      mobileNumber: lead.mobileNumber || "",
      occupationCategory: leadDetail.occupationCategory || "",
      designation: leadDetail.designation || "",
      organization: leadDetail.organization || "",
      preferredConfiguration: leadDetail.preferredConfiguration || "",
      estimatedBudget: leadDetail.estimatedBudget || "",
      sourceOfVisit: leadDetail.sourceOfVisit || "",
      referredBy: leadDetail.referredBy || "",
      houseNo: leadDetail.houseNo || "",
      buildingOrSocietyName: leadDetail.buildingOrSocietyName || "",
      locality: leadDetail.locality || "",
      city: leadDetail.city || "",
      pincode: leadDetail.pincode || "",
      state: leadDetail.state || "",
      country: leadDetail.country || ""
    };

    const response = await axios.post(webhookUrl, payload, {
      maxRedirects: 5,
      timeout: 30000
    });

    console.log(`[GOOGLE SHEET] Lead #${lead.id} successfully synced to "${sheetName}".`);
    return { success: true, data: response.data, sheet: sheetName };
  } catch (error) {
    console.error(`[GOOGLE SHEET] Failed to sync lead to "${sheetName}":`, error.message || error);
    return { success: false, error: error.message };
  }
};

/**
 * Appends HR Data (Channel Partner, Supplier, Career) to HR Google Sheet via Webhook.
 */
exports.appendHrDataToGoogleSheet = async (sheetName, payload = {}) => {
  const webhookUrl = process.env.GOOGLE_SHEET_HR_WEBHOOK_URL;

  if (!webhookUrl) {
    console.warn(`[GOOGLE SHEET] GOOGLE_SHEET_HR_WEBHOOK_URL not configured in .env, skipping live sync.`);
    return { success: false, message: "HR Webhook URL not configured" };
  }

  try {
    const dataToSend = {
      sheetName,
      ...payload
    };

    const response = await axios.post(webhookUrl, dataToSend, {
      maxRedirects: 5,
      timeout: 30000
    });

    console.log(`[GOOGLE SHEET] HR Record #${payload.id || ""} successfully synced to "${sheetName}".`);
    return { success: true, data: response.data, sheet: sheetName };
  } catch (error) {
    console.error(`[GOOGLE SHEET] Failed to sync HR record to "${sheetName}":`, error.message || error);
    return { success: false, error: error.message };
  }
};
