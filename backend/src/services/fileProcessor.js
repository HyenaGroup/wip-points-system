import XLSX from 'xlsx';
import fs from 'fs';
import csv from 'csv-parser';

export const processExcelFile = async (filePath) => {
  try {
    const workbook = XLSX.readFile(filePath);
    const sheetName = workbook.SheetNames[0];
    const worksheet = workbook.Sheets[sheetName];
    const data = XLSX.utils.sheet_to_json(worksheet);
    
    return parseSalesData(data);
  } catch (error) {
    console.error('Error processing Excel file:', error);
    throw new Error('Failed to process Excel file');
  }
};

export const processCSVFile = async (filePath) => {
  return new Promise((resolve, reject) => {
    const results = [];
    
    fs.createReadStream(filePath)
      .pipe(csv())
      .on('data', (data) => results.push(data))
      .on('end', () => {
        try {
          const parsedData = parseSalesData(results);
          resolve(parsedData);
        } catch (error) {
          reject(error);
        }
      })
      .on('error', (error) => reject(error));
  });
};

function normalizePhone(phone) {
  if (!phone) return '';
  let p = String(phone).replace(/[^0-9]/g, '');
  if (p.startsWith('66') && p.length === 11) p = '0' + p.slice(2);
  if (p.length === 9 && !p.startsWith('0')) p = '0' + p;
  return p;
}

function parseSalesData(rawData) {
  const salesData = [];
  const errors = [];
  
  rawData.forEach((row, index) => {
    try {
      const phoneNumber = normalizePhone(
        row.phone_number || row.phoneNumber || row.phone || row.Phone || 
        row.PHONE_NUMBER || row.เบอร์โทร || row.เบอร์โทรศัพท์ || row.มือถือ || ''
      );
      const lineUserId = String(row.line_user_id || row.lineUserId || row.LINE_USER_ID || '').trim();
      const customerName = String(
        row.customer_name || row.customerName || row.name || row.Name || 
        row.CUSTOMER_NAME || row.ชื่อลูกค้า || row.ชื่อ || ''
      ).trim();
      const amount = parseFloat(row.amount || row.Amount || row.AMOUNT || row.ยอดขาย || row.จำนวนเงิน || 0);
      const saleDate = parseDateField(
        row.sale_date || row.saleDate || row.date || row.Date || 
        row.SALE_DATE || row.วันที่ || row.วันที่ขาย
      );
      
      if (!phoneNumber && !lineUserId) {
        errors.push({ row: index + 2, error: 'ต้องมีเบอร์โทรศัพท์หรือ LINE User ID' });
        return;
      }
      
      if (!amount || amount <= 0) {
        errors.push({ row: index + 2, error: 'ยอดขายไม่ถูกต้อง' });
        return;
      }
      
      if (!saleDate) {
        errors.push({ row: index + 2, error: 'รูปแบบวันที่ไม่ถูกต้อง' });
        return;
      }
      
      salesData.push({
        phoneNumber,
        lineUserId,
        customerName,
        amount,
        saleDate
      });
    } catch (error) {
      errors.push({ row: index + 2, error: error.message });
    }
  });
  
  return { salesData, errors };
}

function parseDateField(dateValue) {
  if (!dateValue) return null;
  
  if (typeof dateValue === 'number') {
    const date = XLSX.SSF.parse_date_code(dateValue);
    return new Date(date.y, date.m - 1, date.d).toISOString().split('T')[0];
  }
  
  if (typeof dateValue === 'string') {
    const formats = [
      /^(\d{4})-(\d{2})-(\d{2})$/,
      /^(\d{2})\/(\d{2})\/(\d{4})$/,
      /^(\d{2})-(\d{2})-(\d{4})$/
    ];
    
    for (const format of formats) {
      const match = dateValue.match(format);
      if (match) {
        if (format === formats[0]) {
          return dateValue;
        } else {
          const [, day, month, year] = match;
          return `${year}-${month.padStart(2, '0')}-${day.padStart(2, '0')}`;
        }
      }
    }
  }
  
  const date = new Date(dateValue);
  if (!isNaN(date.getTime())) {
    return date.toISOString().split('T')[0];
  }
  
  return null;
}

export const deleteUploadedFile = (filePath) => {
  try {
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
    }
  } catch (error) {
    console.error('Error deleting file:', error);
  }
};
