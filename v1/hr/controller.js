const { Op } = require("sequelize");
const { ChannelPartner, Supplier, CareerApplication } = require("../../models");
const { appendHrDataToExcel } = require("../services/excelService");
const { appendHrDataToGoogleSheet } = require("../services/googleSheetService");
const {
  sendChannelPartnerConfirmationEmail,
  sendAdminChannelPartnerAlert,
  sendSupplierConfirmationEmail,
  sendAdminSupplierAlert,
  sendCareerConfirmationEmail,
  sendAdminCareerAlert
} = require("../services/emailService");

// -------------------------------------------------------------
// POST /v1/hr/channel-partner/register
// -------------------------------------------------------------
exports.registerChannelPartner = async (req, res) => {
  try {
    const {
      fullName,
      firmOrCompanyName,
      reraRegNo,
      mobileNumber,
      email,
      cityOfOperation
    } = req.body;

    const partner = await ChannelPartner.create({
      fullName: fullName.trim(),
      firmOrCompanyName: firmOrCompanyName.trim(),
      reraRegNo: reraRegNo.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email.toLowerCase().trim(),
      cityOfOperation: cityOfOperation.trim(),
      status: 1
    });

    console.log(`[HR] Channel Partner #${partner.id} (${partner.firmOrCompanyName}) saved.`);

    const sheetPayload = {
      id: partner.id,
      fullName: partner.fullName,
      firmOrCompanyName: partner.firmOrCompanyName,
      reraRegNo: partner.reraRegNo,
      mobileNumber: partner.mobileNumber,
      email: partner.email,
      cityOfOperation: partner.cityOfOperation
    };

    const [excelSettled, emailSettled, adminAlertSettled, sheetSettled] = await Promise.allSettled([
      appendHrDataToExcel("Channel Partner Data", partner),
      sendChannelPartnerConfirmationEmail(partner),
      sendAdminChannelPartnerAlert(partner),
      appendHrDataToGoogleSheet("Channel Partner Data", sheetPayload)
    ]);

    return res.status(201).json({
      success: true,
      message: "Channel Partner registered successfully. Empanelment details will be shared shortly.",
      data: {
        id: partner.id,
        fullName: partner.fullName,
        firmOrCompanyName: partner.firmOrCompanyName,
        reraRegNo: partner.reraRegNo,
        mobileNumber: partner.mobileNumber,
        email: partner.email,
        cityOfOperation: partner.cityOfOperation,
        sheet: "Channel Partner Data",
        excelAppended: excelSettled.status === "fulfilled" && excelSettled.value.success,
        googleSheetSynced: sheetSettled.status === "fulfilled" && sheetSettled.value.success,
        confirmationEmailDispatched: emailSettled.status === "fulfilled" && emailSettled.value.success,
        adminAlertDispatched: adminAlertSettled.status === "fulfilled" && adminAlertSettled.value.success
      }
    });
  } catch (error) {
    console.error("Error in registerChannelPartner:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register Channel Partner"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/hr/supplier/register
// -------------------------------------------------------------
exports.registerSupplier = async (req, res) => {
  try {
    const {
      supplierName,
      companyName,
      mobileNumber,
      email,
      address,
      website,
      serviceCategories,
      yearsOfExperience,
      areaOfOperation,
      majorClientServed,
      companyProfileAttachment,
      productCatalogueAttachment,
      rateListAttachment,
      projectPortfolioAttachment,
      relevantLicencesAttachment,
      otherSupportingAttachment
    } = req.body;

    const supplier = await Supplier.create({
      supplierName: supplierName.trim(),
      companyName: companyName.trim(),
      mobileNumber: mobileNumber.trim(),
      email: email.toLowerCase().trim(),
      address: address ? address.trim() : null,
      website: website ? website.trim() : null,
      serviceCategories: serviceCategories || null,
      yearsOfExperience: yearsOfExperience ? String(yearsOfExperience).trim() : null,
      areaOfOperation: areaOfOperation ? areaOfOperation.trim() : null,
      majorClientServed: majorClientServed ? majorClientServed.trim() : null,
      companyProfileAttachment: companyProfileAttachment || null,
      productCatalogueAttachment: productCatalogueAttachment || null,
      rateListAttachment: rateListAttachment || null,
      projectPortfolioAttachment: projectPortfolioAttachment || null,
      relevantLicencesAttachment: relevantLicencesAttachment || null,
      otherSupportingAttachment: otherSupportingAttachment || null,
      status: 1
    });

    console.log(`[HR] Supplier #${supplier.id} (${supplier.companyName}) saved.`);

    const sheetPayload = {
      id: supplier.id,
      supplierName: supplier.supplierName,
      companyName: supplier.companyName,
      mobileNumber: supplier.mobileNumber,
      email: supplier.email,
      address: supplier.address || "",
      website: supplier.website || "",
      serviceCategories: supplier.serviceCategories || "",
      yearsOfExperience: supplier.yearsOfExperience || "",
      areaOfOperation: supplier.areaOfOperation || "",
      majorClientServed: supplier.majorClientServed || "",
      companyProfileAttachment: supplier.companyProfileAttachment || "",
      productCatalogueAttachment: supplier.productCatalogueAttachment || "",
      rateListAttachment: supplier.rateListAttachment || "",
      projectPortfolioAttachment: supplier.projectPortfolioAttachment || "",
      relevantLicencesAttachment: supplier.relevantLicencesAttachment || "",
      otherSupportingAttachment: supplier.otherSupportingAttachment || ""
    };

    const [excelSettled, emailSettled, adminAlertSettled, sheetSettled] = await Promise.allSettled([
      appendHrDataToExcel("Supplier Data", supplier),
      sendSupplierConfirmationEmail(supplier),
      sendAdminSupplierAlert(supplier),
      appendHrDataToGoogleSheet("Supplier Data", sheetPayload)
    ]);

    return res.status(201).json({
      success: true,
      message: "Supplier profile registered successfully.",
      data: {
        id: supplier.id,
        supplierName: supplier.supplierName,
        companyName: supplier.companyName,
        mobileNumber: supplier.mobileNumber,
        email: supplier.email,
        serviceCategories: supplier.serviceCategories,
        sheet: "Supplier Data",
        excelAppended: excelSettled.status === "fulfilled" && excelSettled.value.success,
        googleSheetSynced: sheetSettled.status === "fulfilled" && sheetSettled.value.success,
        confirmationEmailDispatched: emailSettled.status === "fulfilled" && emailSettled.value.success,
        adminAlertDispatched: adminAlertSettled.status === "fulfilled" && adminAlertSettled.value.success
      }
    });
  } catch (error) {
    console.error("Error in registerSupplier:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to register Supplier"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/hr/career/apply
// -------------------------------------------------------------
exports.applyCareer = async (req, res) => {
  try {
    const {
      appliedForPosition,
      fullName,
      email,
      mobileNumber,
      resumeUploadLink
    } = req.body;

    const candidate = await CareerApplication.create({
      appliedForPosition: appliedForPosition.trim(),
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      mobileNumber: mobileNumber.trim(),
      resumeUploadLink: resumeUploadLink.trim(),
      status: 1
    });

    console.log(`[HR] Career Application #${candidate.id} (${candidate.fullName} - ${candidate.appliedForPosition}) saved.`);

    const sheetPayload = {
      id: candidate.id,
      appliedForPosition: candidate.appliedForPosition,
      fullName: candidate.fullName,
      email: candidate.email,
      mobileNumber: candidate.mobileNumber,
      resumeUploadLink: candidate.resumeUploadLink
    };

    const [excelSettled, emailSettled, adminAlertSettled, sheetSettled] = await Promise.allSettled([
      appendHrDataToExcel("Career Data", candidate),
      sendCareerConfirmationEmail(candidate),
      sendAdminCareerAlert(candidate),
      appendHrDataToGoogleSheet("Career Data", sheetPayload)
    ]);

    return res.status(201).json({
      success: true,
      message: "Career application submitted successfully. Our talent team will review your profile.",
      data: {
        id: candidate.id,
        appliedForPosition: candidate.appliedForPosition,
        fullName: candidate.fullName,
        email: candidate.email,
        mobileNumber: candidate.mobileNumber,
        resumeUploadLink: candidate.resumeUploadLink,
        sheet: "Career Data",
        excelAppended: excelSettled.status === "fulfilled" && excelSettled.value.success,
        googleSheetSynced: sheetSettled.status === "fulfilled" && sheetSettled.value.success,
        confirmationEmailDispatched: emailSettled.status === "fulfilled" && emailSettled.value.success,
        adminAlertDispatched: adminAlertSettled.status === "fulfilled" && adminAlertSettled.value.success
      }
    });
  } catch (error) {
    console.error("Error in applyCareer:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to submit career application"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/hr/channel-partner/list (Admin Authenticated)
// -------------------------------------------------------------
exports.listChannelPartners = async (req, res) => {
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
        { firmOrCompanyName: { [Op.like]: `%${q}%` } },
        { reraRegNo: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { mobileNumber: { [Op.like]: `%${q}%` } },
        { cityOfOperation: { [Op.like]: `%${q}%` } }
      ];
    }

    const { count, rows } = await ChannelPartner.findAndCountAll({
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
        channelPartners: rows
      }
    });
  } catch (error) {
    console.error("Error in listChannelPartners:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch Channel Partners"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/hr/supplier/list (Admin Authenticated)
// -------------------------------------------------------------
exports.listSuppliers = async (req, res) => {
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
        { supplierName: { [Op.like]: `%${q}%` } },
        { companyName: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { mobileNumber: { [Op.like]: `%${q}%` } },
        { areaOfOperation: { [Op.like]: `%${q}%` } }
      ];
    }

    const { count, rows } = await Supplier.findAndCountAll({
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
        suppliers: rows
      }
    });
  } catch (error) {
    console.error("Error in listSuppliers:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch suppliers"
    });
  }
};

// -------------------------------------------------------------
// POST /v1/hr/career/list (Admin Authenticated)
// -------------------------------------------------------------
exports.listCareerApplications = async (req, res) => {
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
        { appliedForPosition: { [Op.like]: `%${q}%` } },
        { fullName: { [Op.like]: `%${q}%` } },
        { email: { [Op.like]: `%${q}%` } },
        { mobileNumber: { [Op.like]: `%${q}%` } }
      ];
    }

    const { count, rows } = await CareerApplication.findAndCountAll({
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
        careerApplications: rows
      }
    });
  } catch (error) {
    console.error("Error in listCareerApplications:", error);
    return res.status(500).json({
      success: false,
      message: error.message || "Failed to fetch career applications"
    });
  }
};
