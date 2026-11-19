const { google } = require("googleapis");
const ExcelJS = require("exceljs");
const path = require("path");
const fs = require("fs");

const EXCEL_FILE_PATH = path.join(process.cwd(), "contact_submissions.xlsx");
const WORKSHEET_NAME = "Submissions";
const HEADERS = ["Name", "Email", "Mobile", "Subject", "Message", "Timestamp"];

const SPREADSHEET_ID = process.env.GOOGLE_SHEET_ID; // from your sheet URL
const SHEET_TAB_NAME = process.env.GOOGLE_SHEET_TAB || "Sheet1";

// Reuse the same service-account credentials already used for Analytics —
// no need to re-read the file from disk separately.
const sheetsAuth = new google.auth.GoogleAuth({
  credentials: {
    type: "service_account",
    project_id: process.env.GOOGLE_PROJECT_ID,
    private_key: process.env.GOOGLE_PRIVATE_KEY.replace(/\\n/g, "\n"),
    client_email: process.env.GOOGLE_CLIENT_EMAIL,
    client_id: process.env.GOOGLE_CLIENT_ID,
    token_uri: process.env.GOOGLE_TOKEN_URI,
  },
  scopes: ["https://www.googleapis.com/auth/spreadsheets"],
});

async function appendToGoogleSheet(row) {
  if (!SPREADSHEET_ID) {
    console.warn("GOOGLE_SHEET_ID not set — skipping sheet sync.");
    return;
  }

  const client = await sheetsAuth.getClient();
  const sheets = google.sheets({ version: "v4", auth: client });

  // If the sheet is empty, write the header row first.
  const existing = await sheets.spreadsheets.values.get({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_TAB_NAME}!A1:F1`,
  });

  if (!existing.data.values || existing.data.values.length === 0) {
    await sheets.spreadsheets.values.update({
      spreadsheetId: SPREADSHEET_ID,
      range: `${SHEET_TAB_NAME}!A1:F1`,
      valueInputOption: "USER_ENTERED",
      requestBody: { values: [HEADERS] },
    });
  }

  await sheets.spreadsheets.values.append({
    spreadsheetId: SPREADSHEET_ID,
    range: `${SHEET_TAB_NAME}!A:F`,
    valueInputOption: "USER_ENTERED",
    insertDataOption: "INSERT_ROWS",
    requestBody: { values: [row] },
  });
}

async function appendToExcel(row) {
  const workbook = new ExcelJS.Workbook();
  let worksheet;

  if (fs.existsSync(EXCEL_FILE_PATH)) {
    await workbook.xlsx.readFile(EXCEL_FILE_PATH);
    worksheet = workbook.getWorksheet(WORKSHEET_NAME);
  }

  if (!worksheet) {
    worksheet = workbook.addWorksheet(WORKSHEET_NAME);
    worksheet.addRow(HEADERS);
    worksheet.getRow(1).font = { bold: true };
  }

  worksheet.addRow(row);
  await workbook.xlsx.writeFile(EXCEL_FILE_PATH);
}

// ==========================
// SUBMIT CONTACT FORM
// ==========================
exports.submitContactForm = async (req, res) => {
  try {
    const { name, email, mobile, subject, message } = req.body;

    if (!name || !email || !mobile || !subject || !message) {
      return res.status(400).json({ error: "All fields are required." });
    }

    const timestamp = new Date().toLocaleString();
    const row = [name, email, mobile, subject, message, timestamp];

    await appendToExcel(row);
    await appendToGoogleSheet(row);

    res.status(200).json({ message: "Submission saved successfully." });
  } catch (err) {
    console.error("Error saving submission:", err);
    res.status(500).json({ error: "Failed to save submission." });
  }
};
