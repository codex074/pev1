// ===============================================================
//           MED ERROR TRACKER - GOOGLE APPS SCRIPT
//         (เวอร์ชันสร้างชีทอัตโนมัติ / Auto-Create Sheet Version)
// ===============================================================

// --- การตั้งค่าหลัก ---
// ใส่ ID ของ Google Sheet ของคุณที่นี่
const SHEET_ID = '1lhfy2cD4atNqNI2uRYRhI1cGyjObiTKghetRDlpqFtQ'; 

// --- ชื่อชีท (Script จะสร้างชีทเหล่านี้หากยังไม่มี) ---
const DATA_SHEET_NAME = 'Data';
const CLINICS_SHEET_NAME = 'Clinics';

/**
 * ฟังก์ชันตรวจสอบและสร้างชีทที่จำเป็น
 * @param {Spreadsheet} ss - The active spreadsheet object.
 */
function setupSheets(ss) {
  // --- ตรวจสอบและตั้งค่าชีท "Data" ---
  let dataSheet = ss.getSheetByName(DATA_SHEET_NAME);
  if (!dataSheet) {
    dataSheet = ss.insertSheet(DATA_SHEET_NAME);
    // เพิ่มหัวตารางที่จำเป็น
    const headers = ['id', 'hn', 'errorType', 'clinic', 'timestamp', 'date', 'time'];
    dataSheet.appendRow(headers);
    // ตั้งค่าความกว้างคอลัมน์เพื่อให้อ่านง่ายขึ้น
    dataSheet.setColumnWidth(1, 150); // id
    dataSheet.setColumnWidth(5, 200); // timestamp
  }

  // --- ตรวจสอบและตั้งค่าชีท "Clinics" ---
  let clinicsSheet = ss.getSheetByName(CLINICS_SHEET_NAME);
  if (!clinicsSheet) {
    clinicsSheet = ss.insertSheet(CLINICS_SHEET_NAME);
    // เพิ่มข้อมูลคลินิกเริ่มต้น
    const initialClinics = [['อายุรกรรมทั่วไป'], ['ศัลยกรรมกระดูก'], ['สูติ-นรีเวช'], ['ผิวหนัง'], ['เบาหวาน']];
    clinicsSheet.getRange(1, 1, initialClinics.length, 1).setValues(initialClinics);
  }
}


// --- จัดการคำขอแบบ GET (สำหรับดึงข้อมูลเมื่อเปิดหน้าเว็บ) ---
function doGet(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    setupSheets(ss);

    // ดึงข้อมูล Med Error ทั้งหมดก่อน
    const dataSheet = ss.getSheetByName(DATA_SHEET_NAME);
    let medErrorData = sheetDataToObjectArray(dataSheet);

    // กรองตาม startDate / endDate ที่รับมาจาก query string
    // ถ้าไม่มี param ทั้งสอง → คืนเฉพาะเดือนปัจจุบัน (โหลดเร็วขึ้น)
    const startParam = e && e.parameter && e.parameter.startDate;
    const endParam   = e && e.parameter && e.parameter.endDate;

    if (startParam || endParam) {
      const filterStart = startParam ? new Date(startParam) : null;
      const filterEnd   = endParam   ? new Date(endParam + 'T23:59:59.999') : null;
      medErrorData = medErrorData.filter(function(record) {
        var ts = record.timestamp instanceof Date ? record.timestamp : new Date(record.timestamp);
        if (isNaN(ts)) return false;
        if (filterStart && ts < filterStart) return false;
        if (filterEnd   && ts > filterEnd)   return false;
        return true;
      });
    } else {
      // Default: เดือนปัจจุบัน
      var now = new Date();
      var monthStart = new Date(now.getFullYear(), now.getMonth(), 1);
      var monthEnd   = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59, 999);
      medErrorData = medErrorData.filter(function(record) {
        var ts = record.timestamp instanceof Date ? record.timestamp : new Date(record.timestamp);
        return !isNaN(ts) && ts >= monthStart && ts <= monthEnd;
      });
    }

    // ดึงรายชื่อคลินิก
    const clinicsSheet = ss.getSheetByName(CLINICS_SHEET_NAME);
    const clinicsRange = clinicsSheet.getRange('A1:A' + clinicsSheet.getLastRow()).getValues();
    const clinics = clinicsRange.flat().filter(String).sort();

    const responseData = {
      status: 'success',
      data: {
        pe: medErrorData,
        clinics: clinics
      }
    };
    return createJsonResponse(responseData);

  } catch (error) {
    return createJsonResponse({ status: 'error', message: 'doGet Error: ' + error.message });
  }
}

// --- จัดการคำขอแบบ POST (สำหรับ เพิ่ม, แก้ไข, ลบข้อมูล) ---
function doPost(e) {
  try {
    const ss = SpreadsheetApp.openById(SHEET_ID);
    setupSheets(ss); // ตรวจสอบชีททุกครั้งที่มีการ POST เพื่อความแน่นอน

    const action = e.parameter.action;
    const data = JSON.parse(e.parameter.data);
    
    switch(action) {
      case 'addRecord':
        return createJsonResponse(addRecord(data));
      case 'editRecord':
        return createJsonResponse(editRecord(data));
      case 'deleteRecord':
        return createJsonResponse(deleteRecord(data));
      case 'addClinic':
        return createJsonResponse(addClinic(data));
      default:
        return createJsonResponse({ status: 'error', message: 'ไม่รู้จัก Action' });
    }
  } catch (error) {
    return createJsonResponse({ status: 'error', message: 'doPost Error: ' + error.message });
  }
}

// --- ฟังก์ชันสำหรับเพิ่มข้อมูล ---
function addRecord(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(DATA_SHEET_NAME);
  
  const allData = sheet.getDataRange().getValues();
  const todayDate = data.date; // ใช้ date ที่ส่งมาจาก client โดยตรง

  const isDuplicate = allData.some(row => 
    row[1] == data.hn &&          // คอลัมน์ HN
    row[2] == data.errorType &&   // คอลัมน์ ErrorType
    row[5] == todayDate           // คอลัมน์ Date
  );

  if (isDuplicate) {
    return { status: 'duplicate', message: 'ข้อมูลนี้มีอยู่แล้ว' };
  }

  sheet.appendRow([
    data.id, data.hn, data.errorType, data.clinic, 
    data.timestamp, todayDate, data.time
  ]);
  return { status: 'success', message: 'บันทึกข้อมูลสำเร็จ' };
}

// --- ฟังก์ชันสำหรับแก้ไขข้อมูล ---
function editRecord(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(DATA_SHEET_NAME);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();
  
  for (let i = 1; i < values.length; i++) {
    if (values[i][0] == data.id) { // คอลัมน์ A (ID)
      sheet.getRange(i + 1, 2, 1, 3).setValues([[data.hn, data.errorType, data.clinic]]);
      return { status: 'success', message: 'แก้ไขข้อมูลสำเร็จ' };
    }
  }
  return { status: 'error', message: 'ไม่พบข้อมูลที่ต้องการแก้ไข' };
}

// --- ฟังก์ชันสำหรับลบข้อมูล ---
function deleteRecord(data) {
  const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(DATA_SHEET_NAME);
  const dataRange = sheet.getDataRange();
  const values = dataRange.getValues();

  for (let i = values.length - 1; i >= 1; i--) { // วนจากล่างขึ้นบน
    if (values[i][0] == data.id) { // คอลัมน์ A (ID)
      sheet.deleteRow(i + 1);
      return { status: 'success', message: 'ลบข้อมูลสำเร็จ' };
    }
  }
  return { status: 'error', message: 'ไม่พบข้อมูลที่ต้องการลบ' };
}

// --- ฟังก์ชันสำหรับเพิ่มคลินิก ---
function addClinic(data) {
    const sheet = SpreadsheetApp.openById(SHEET_ID).getSheetByName(CLINICS_SHEET_NAME);
    sheet.appendRow([data.clinicName]);
    return { status: 'success', message: 'เพิ่มคลินิกสำเร็จ' };
}


// --- ฟังก์ชันเสริม: แปลงข้อมูลชีทเป็น Array of Objects ---
function sheetDataToObjectArray(sheet) {
  const values = sheet.getDataRange().getValues();
  if (values.length < 2) return [];
  
  const headers = values[0].map(h => h.toString().trim());
  return values.slice(1).map(row => {
    let obj = {};
    headers.forEach((header, index) => {
      obj[header] = row[index];
    });
    return obj;
  });
}

// --- ฟังก์ชันเสริม: สร้าง JSON Response ---
function createJsonResponse(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

