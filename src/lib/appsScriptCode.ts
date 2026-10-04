export const googleAppsScriptTemplate = `/**
 * BANI MARHABAN - GOOGLE APPS SCRIPT BACKEND
 * Layanan Sinkronisasi Google Drive dan Google Sheets
 */

// PENGATURAN AWAL
var CONFIG = {
  TOKEN: "BM_SECURE_TOKEN_2026", // Ganti dengan token yang Anda masukkan di aplikasi
  DRIVE_FOLDER_ID: "",           // ID folder Google Drive untuk foto dan arsip
  SPREADSHEET_ID: ""             // ID Google Spreadsheet untuk cadangan data
};

function doGet(e) {
  var action = e.parameter.action;
  var token = e.parameter.token;

  if (token !== CONFIG.TOKEN) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Akses ditolak" }))
      .setMimeType(ContentService.MimeType.JSON);
  }

  var result = { status: "success" };

  if (action === "ping") {
    result.data = { status: "connected", timestamp: new Date().toISOString() };
  } else if (action === "read_sheet") {
    var sheetName = e.parameter.sheetName || "Anggota";
    result.data = readSheetData(sheetName);
  } else if (action === "get_file") {
    var fileId = e.parameter.fileId;
    result.data = getDriveFileBase64(fileId);
  } else {
    result.status = "error";
    result.message = "Aksi tidak dikenal";
  }

  return ContentService.createTextOutput(JSON.stringify(result))
    .setMimeType(ContentService.MimeType.JSON);
}

function doPost(e) {
  try {
    var data = JSON.parse(e.postData.contents);
    if (data.token !== CONFIG.TOKEN) {
      return ContentService.createTextOutput(JSON.stringify({ status: "error", message: "Akses ditolak" }))
        .setMimeType(ContentService.MimeType.JSON);
    }

    var action = data.action;
    var result = { status: "success" };

    if (action === "upload_file") {
      result.data = uploadToDrive(data.fileName, data.base64Data, data.mimeType);
    } else if (action === "delete_file") {
      result.data = deleteFromDrive(data.fileId);
    } else if (action === "backup_collection") {
      result.data = backupCollectionToSheet(data.sheetName, data.records);
    } else {
      result.status = "error";
      result.message = "Aksi tidak dikenal";
    }

    return ContentService.createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
  } catch (err) {
    return ContentService.createTextOutput(JSON.stringify({ status: "error", message: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function uploadToDrive(fileName, base64Data, mimeType) {
  var folder = CONFIG.DRIVE_FOLDER_ID ? DriveApp.getFolderById(CONFIG.DRIVE_FOLDER_ID) : DriveApp.getRootFolder();
  var decoded = Utilities.base64Decode(base64Data.split(",")[1] || base64Data);
  var blob = Utilities.newBlob(decoded, mimeType || "image/jpeg", fileName);
  var file = folder.createFile(blob);
  file.setSharing(DriveApp.Access.ANYONE_WITH_LINK, DriveApp.Permission.VIEW);
  return {
    fileId: file.getId(),
    url: file.getUrl(),
    downloadUrl: file.getDownloadUrl()
  };
}

function getDriveFileBase64(fileId) {
  var file = DriveApp.getFileById(fileId);
  var blob = file.getBlob();
  return {
    base64: Utilities.base64Encode(blob.getBytes()),
    mimeType: blob.getContentType(),
    name: file.getName()
  };
}

function deleteFromDrive(fileId) {
  var file = DriveApp.getFileById(fileId);
  file.setTrashed(true);
  return { trashed: true };
}

function backupCollectionToSheet(sheetName, records) {
  var ss = CONFIG.SPREADSHEET_ID ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) {
    sheet = ss.insertSheet(sheetName);
  } else {
    sheet.clear();
  }

  if (!records || records.length === 0) {
    return { count: 0 };
  }

  var keys = Object.keys(records[0]);
  var rows = [keys];

  records.forEach(function(rec) {
    var row = keys.map(function(k) {
      var val = rec[k];
      if (typeof val === 'object' && val !== null) {
        return JSON.stringify(val);
      }
      return val === undefined || val === null ? "" : val;
    });
    rows.push(row);
  });

  sheet.getRange(1, 1, rows.length, keys.length).setValues(rows);
  return { count: records.length, updated: new Date().toISOString() };
}

function readSheetData(sheetName) {
  var ss = CONFIG.SPREADSHEET_ID ? SpreadsheetApp.openById(CONFIG.SPREADSHEET_ID) : SpreadsheetApp.getActiveSpreadsheet();
  var sheet = ss.getSheetByName(sheetName);
  if (!sheet) return [];
  var data = sheet.getDataRange().getValues();
  if (data.length < 2) return [];

  var headers = data[0];
  var records = [];
  for (var i = 1; i < data.length; i++) {
    var obj = {};
    for (var j = 0; j < headers.length; j++) {
      obj[headers[j]] = data[i][j];
    }
    records.push(obj);
  }
  return records;
}
`;
