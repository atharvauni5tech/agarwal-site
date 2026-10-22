const fs = require("fs");
const path = require("path");
const XLSX = require("xlsx");

const EXPORTS_DIR = path.join(__dirname, "../../exports");
const SALES_EXCEL_PATH = path.join(EXPORTS_DIR, "sales_data.xlsx");
const LEADS_EXCEL_PATH = path.join(EXPORTS_DIR, "leads.xlsx");
const HR_EXCEL_PATH = path.join(EXPORTS_DIR, "hr_data.xlsx");

/**
 * Appends lead data into the specified worksheet of sales_data.xlsx
 * @param {Object} lead - Lead instance
 * @param {Object} leadDetail - Extended lead details (optional)
 * @param {string} sheetName - "Customer Registration" | "Immediate Callback Request" | "Brocedure Download Request"
 */
exports.appendLeadToExcel = async (lead, leadDetail = {}, sheetName = "Customer Registration") => {
  try {
    if (!fs.existsSync(EXPORTS_DIR)) {
      fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    }

    const dateFormatted = lead.createdAt
      ? new Date(lead.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    let rowData;
    if (sheetName === "Immediate Callback Request" || sheetName === "Brocedure Download Request") {
      rowData = {
        "Lead ID": lead.id,
        "Date": dateFormatted,
        "Full Name": lead.fullName || "",
        "Email": lead.email || "",
        "Mobile Number": lead.mobileNumber || ""
      };
    } else {
      rowData = {
        "Lead ID": lead.id,
        "Date": dateFormatted,
        "Full Name": lead.fullName || "",
        "Email": lead.email || "",
        "Mobile Number": lead.mobileNumber || "",
        "Occupation Category": leadDetail.occupationCategory || "",
        "Designation": leadDetail.designation || "",
        "Organization": leadDetail.organization || "",
        "Preferred Configuration": leadDetail.preferredConfiguration || "",
        "Estimated Budget": leadDetail.estimatedBudget || "",
        "Source of Visit": leadDetail.sourceOfVisit || "",
        "Referred By": leadDetail.referredBy || "",
        "House No": leadDetail.houseNo || "",
        "Building / Society Name": leadDetail.buildingOrSocietyName || "",
        "Locality": leadDetail.locality || "",
        "City": leadDetail.city || "",
        "Pincode": leadDetail.pincode || "",
        "State": leadDetail.state || "",
        "Country": leadDetail.country || ""
      };
    }

    const appendToWorkbook = (filePath) => {
      let workbook;
      let existingRows = [];

      if (fs.existsSync(filePath)) {
        workbook = XLSX.readFile(filePath);
        const worksheet = workbook.Sheets[sheetName];
        if (worksheet) {
          existingRows = XLSX.utils.sheet_to_json(worksheet);
        }
      } else {
        workbook = XLSX.utils.book_new();
      }

      existingRows.push(rowData);
      const updatedWorksheet = XLSX.utils.json_to_sheet(existingRows);

      const colKeys = Object.keys(rowData);
      updatedWorksheet["!cols"] = colKeys.map((key) => ({
        wch: Math.max(key.length, 16)
      }));

      workbook.Sheets[sheetName] = updatedWorksheet;
      if (!workbook.SheetNames.includes(sheetName)) {
        workbook.SheetNames.push(sheetName);
      }

      XLSX.writeFile(workbook, filePath);
    };

    appendToWorkbook(SALES_EXCEL_PATH);
    appendToWorkbook(LEADS_EXCEL_PATH);

    console.log(`[EXCEL] Successfully appended Lead ID #${lead.id} to sheet "${sheetName}".`);
    return { success: true, sheet: sheetName, filePath: SALES_EXCEL_PATH };
  } catch (error) {
    console.error(`[EXCEL] Error appending lead to sheet "${sheetName}":`, error.message || error);
    return { success: false, error: error.message };
  }
};

/**
 * Appends HR Data into hr_data.xlsx in the specified worksheet
 * @param {string} sheetName - "Channel Partner Data" | "Supplier Data" | "Career Data"
 * @param {Object} record - Model instance or payload
 */
exports.appendHrDataToExcel = async (sheetName, record) => {
  try {
    if (!fs.existsSync(EXPORTS_DIR)) {
      fs.mkdirSync(EXPORTS_DIR, { recursive: true });
    }

    const dateFormatted = record.createdAt
      ? new Date(record.createdAt).toLocaleString("en-IN", { timeZone: "Asia/Kolkata" })
      : new Date().toLocaleString("en-IN", { timeZone: "Asia/Kolkata" });

    let rowData;
    if (sheetName === "Channel Partner Data") {
      rowData = {
        "ID": record.id,
        "Date": dateFormatted,
        "Full Name": record.fullName || "",
        "Firm / Company Name": record.firmOrCompanyName || "",
        "RERA Reg. No": record.reraRegNo || "",
        "Mobile Number": record.mobileNumber || "",
        "Email Address": record.email || "",
        "City of Operation": record.cityOfOperation || ""
      };
    } else if (sheetName === "Supplier Data") {
      const categoriesStr = Array.isArray(record.serviceCategories)
        ? record.serviceCategories.join(", ")
        : (record.serviceCategories || "");

      rowData = {
        "ID": record.id,
        "Date": dateFormatted,
        "Supplier Name": record.supplierName || "",
        "Company Name": record.companyName || "",
        "Mobile Number": record.mobileNumber || "",
        "Email": record.email || "",
        "Address": record.address || "",
        "Website": record.website || "",
        "Service Categories": categoriesStr,
        "Years of Experience": record.yearsOfExperience || "",
        "Area of Operation": record.areaOfOperation || "",
        "Major Client Served": record.majorClientServed || "",
        "Company Profile Attachment": record.companyProfileAttachment || "",
        "Product Catalogue Attachment": record.productCatalogueAttachment || "",
        "Rate List Attachment": record.rateListAttachment || "",
        "Project Portfolio Attachment": record.projectPortfolioAttachment || "",
        "Relevant Licences Attachment": record.relevantLicencesAttachment || "",
        "Other Supporting Attachment": record.otherSupportingAttachment || ""
      };
    } else if (sheetName === "Career Data") {
      rowData = {
        "ID": record.id,
        "Date": dateFormatted,
        "Applied For Position": record.appliedForPosition || "",
        "Full Name": record.fullName || "",
        "Email": record.email || "",
        "Mobile Number": record.mobileNumber || "",
        "Resume Upload Link": record.resumeUploadLink || ""
      };
    } else {
      rowData = {
        "ID": record.id,
        "Date": dateFormatted,
        ...record
      };
    }

    let workbook;
    let existingRows = [];

    if (fs.existsSync(HR_EXCEL_PATH)) {
      workbook = XLSX.readFile(HR_EXCEL_PATH);
      const worksheet = workbook.Sheets[sheetName];
      if (worksheet) {
        existingRows = XLSX.utils.sheet_to_json(worksheet);
      }
    } else {
      workbook = XLSX.utils.book_new();
    }

    existingRows.push(rowData);
    const updatedWorksheet = XLSX.utils.json_to_sheet(existingRows);

    const colKeys = Object.keys(rowData);
    updatedWorksheet["!cols"] = colKeys.map((key) => ({
      wch: Math.max(key.length, 16)
    }));

    workbook.Sheets[sheetName] = updatedWorksheet;
    if (!workbook.SheetNames.includes(sheetName)) {
      workbook.SheetNames.push(sheetName);
    }

    XLSX.writeFile(workbook, HR_EXCEL_PATH);
    console.log(`[EXCEL] Successfully appended record #${record.id} to HR sheet "${sheetName}".`);
    return { success: true, sheet: sheetName, filePath: HR_EXCEL_PATH };
  } catch (error) {
    console.error(`[EXCEL] Error appending to HR sheet "${sheetName}":`, error.message || error);
    return { success: false, error: error.message };
  }
};
