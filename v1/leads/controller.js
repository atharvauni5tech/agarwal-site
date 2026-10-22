const { Op } = require("sequelize");
const { Lead, LeadDetail, sequelize } = require("../../models");
const { appendLeadToExcel } = require("../services/excelService");
const {
  sendLeadThankYouEmail,
  sendCallbackRequestEmail,
  sendAdminCallbackAlertEmail,
  sendAdminBrochureAlertEmail
} = require("../services/emailService");
const { appendLeadToGoogleSheet } = require("../services/googleSheetService");

// -------------------------------------------------------------
// POST /v1/leads/store (Customer Registration)
// -------------------------------------------------------------
exports.storeLead = async (req, res) => {
  const transaction = await sequelize.transaction();
  try {
    const {
      fullName,
      email,
      mobileNumber,
      // Optional LeadDetails fields
      occupationCategory,
      designation,
      organization,
      preferredConfiguration,
      estimatedBudget,
      sourceOfVisit,
      referredBy,
      houseNo,
      buildingOrSocietyName,
      locality,
      city,
      pincode,
      state,
      country
    } = req.body;

    const normalizedEmail = email.toLowerCase().trim();

    // 1. Create primary Lead record
    const lead = await Lead.create(
      {
        fullName: fullName.trim(),
        email: normalizedEmail,
        mobileNumber: mobileNumber.trim(),
        status: 1
      },
      { transaction }
    );

    // 2. Check and store extended LeadDetails if provided
    const detailPayload = {
      occupationCategory,
      designation,
      organization,
      preferredConfiguration,
      estimatedBudget,
      sourceOfVisit,
      referredBy,
      houseNo,
      buildingOrSocietyName,
      locality,
      city,
      pincode,
      state,
      country
    };

    const hasExtendedDetails = Object.values(detailPayload).some(
      (val) => val !== undefined && val !== null && String(val).trim() !== ""
    );

    let leadDetail = null;
    if (hasExtendedDetails) {
      leadDetail = await LeadDetail.create(
        {
          leadId: lead.id,
          ...detailPayload
        },
        { transaction }
      );
    }

    // Commit database transaction
    await transaction.commit();

    console.log(`[LEADS] Customer Registration Lead #${lead.id} (${lead.fullName}) saved to database.`);

    // 3. Concurrently dispatch Excel append, Thank-You Email, and Google Sheet sync to "Customer Registration"
    const [excelSettled, emailSettled, sheetSettled] = await Promise.allSettled([
      appendLeadToExcel(lead, leadDetail || {}, "Customer Registration"),
      sendLeadThankYouEmail(lead, leadDetail || {}),
      appendLeadToGoogleSheet(lead, leadDetail || {}, "Customer Registration")
    ]);

    const excelResult = excelSettled.status === "fulfilled" ? excelSettled.value : { success: false };
    const emailResult = emailSettled.status === "fulfilled" ? emailSettled.value : { success: false };
    const googleSheetResult = sheetSettled.status === "fulfilled" ? sheetSettled.value : { success: false };

    return res.status(201).json({
      success: true,
      message: "Lead stored successfully. A representative will get in touch shortly.",
      data: {
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        mobileNumber: lead.mobileNumber,
        leadDetails: leadDetail,
        details: leadDetail,
        sheet: "Customer Registration",
        excelAppended: excelResult.success,
        googleSheetSynced: googleSheetResult.success,
        emailDispatched: emailResult.success
      }
    });
  } catch (error) {
    if (transaction && !transaction.finished) {
      await transaction.rollback();
    }
    console.error("Error in storeLead:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to store lead"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/leads/request-callback (Immediate Callback Request)
// -------------------------------------------------------------
exports.requestCallback = async (req, res) => {
  try {
    const { fullName, email, mobileNumber } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Create Lead in Lead model only
    const lead = await Lead.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobileNumber: mobileNumber.trim(),
      status: 1
    });

    console.log(`[LEADS] Callback Request Lead #${lead.id} (${lead.fullName}) saved to database.`);

    // 2. Concurrently dispatch:
    //    - Excel append ("Immediate Callback Request")
    //    - Customer callback confirmation email
    //    - Admin callback alert email (to atharva.pandharikar@uni5.tech)
    //    - Google Sheet sync ("Immediate Callback Request")
    const [excelSettled, customerEmailSettled, adminEmailSettled, sheetSettled] = await Promise.allSettled([
      appendLeadToExcel(lead, {}, "Immediate Callback Request"),
      sendCallbackRequestEmail(lead),
      sendAdminCallbackAlertEmail(lead),
      appendLeadToGoogleSheet(lead, {}, "Immediate Callback Request")
    ]);

    const excelResult = excelSettled.status === "fulfilled" ? excelSettled.value : { success: false };
    const customerEmailResult = customerEmailSettled.status === "fulfilled" ? customerEmailSettled.value : { success: false };
    const adminEmailResult = adminEmailSettled.status === "fulfilled" ? adminEmailSettled.value : { success: false };
    const googleSheetResult = sheetSettled.status === "fulfilled" ? sheetSettled.value : { success: false };

    return res.status(201).json({
      success: true,
      message: "Callback request received successfully. Our customer executive will call you back shortly.",
      data: {
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        mobileNumber: lead.mobileNumber,
        sheet: "Immediate Callback Request",
        excelAppended: excelResult.success,
        googleSheetSynced: googleSheetResult.success,
        customerEmailDispatched: customerEmailResult.success,
        adminEmailDispatched: adminEmailResult.success
      }
    });
  } catch (error) {
    console.error("Error in requestCallback:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process callback request"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/leads/download-brochure (Brocedure Download Request)
// -------------------------------------------------------------
exports.downloadBrochure = async (req, res) => {
  try {
    const { fullName, email, mobileNumber } = req.body;
    const normalizedEmail = email.toLowerCase().trim();

    // 1. Create Lead in Lead model only
    const lead = await Lead.create({
      fullName: fullName.trim(),
      email: normalizedEmail,
      mobileNumber: mobileNumber.trim(),
      status: 1
    });

    console.log(`[LEADS] Brochure Download Lead #${lead.id} (${lead.fullName}) saved to database.`);

    // 2. Concurrently dispatch:
    //    - Excel append ("Brocedure Download Request")
    //    - Admin brochure alert email ONLY (NO email sent to the lead as instructed)
    //    - Google Sheet sync ("Brocedure Download Request")
    const [excelSettled, adminEmailSettled, sheetSettled] = await Promise.allSettled([
      appendLeadToExcel(lead, {}, "Brocedure Download Request"),
      sendAdminBrochureAlertEmail(lead),
      appendLeadToGoogleSheet(lead, {}, "Brocedure Download Request")
    ]);

    const excelResult = excelSettled.status === "fulfilled" ? excelSettled.value : { success: false };
    const adminEmailResult = adminEmailSettled.status === "fulfilled" ? adminEmailSettled.value : { success: false };
    const googleSheetResult = sheetSettled.status === "fulfilled" ? sheetSettled.value : { success: false };

    return res.status(201).json({
      success: true,
      message: "Brochure request received successfully.",
      data: {
        id: lead.id,
        fullName: lead.fullName,
        email: lead.email,
        mobileNumber: lead.mobileNumber,
        sheet: "Brocedure Download Request",
        excelAppended: excelResult.success,
        googleSheetSynced: googleSheetResult.success,
        adminEmailDispatched: adminEmailResult.success
      }
    });
  } catch (error) {
    console.error("Error in downloadBrochure:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to process brochure request"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/leads/list (Admin Authenticated)
// -------------------------------------------------------------
exports.listLeads = async (req, res) => {
  try {
    const page = parseInt(req.body.page, 10) || 1;
    const limit = parseInt(req.body.limit, 10) || 10;
    const offset = (page - 1) * limit;

    const { search, status } = req.body;

    const whereClause = {};
    if (status !== undefined && status !== null) {
      whereClause.status = status;
    }

    if (search && search.trim() !== "") {
      const q = search.trim();
      whereClause[Op.or] = [
        { fullName: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { mobileNumber: { [Op.like]: `%${q}%` } }
      ];
    }

    const { count, rows: leads } = await Lead.findAndCountAll({
      where: whereClause,
      limit,
      offset,
      distinct: true,
      order: [["createdAt", "DESC"]],
      include: [
        {
          model: LeadDetail,
          as: "leadDetails"
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
        leads
      }
    });
  } catch (error) {
    console.error("Error in listLeads:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch leads"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/leads/details (Admin Authenticated)
// -------------------------------------------------------------
exports.leadDetails = async (req, res) => {
  try {
    const { id } = req.body;

    const lead = await Lead.findByPk(id, {
      include: [
        {
          model: LeadDetail,
          as: "leadDetails"
        }
      ]
    });

    if (!lead) {
      return res.status(404).json({
        success: false,
        message: "Lead not found"
      });
    }

    return res.status(200).json({
      success: true,
      data: lead
    });
  } catch (error) {
    console.error("Error in leadDetails:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch lead details"
    });
  }
};