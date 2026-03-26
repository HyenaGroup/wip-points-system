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

function parseSalesData(rawData) {
  const salesData = [];
  const errors = [];
  
  rawData.forEach((row, index) => {
    try {
      const lineUserId = String(row.line_user_id || row.lineUserId || row.LINE_USER_ID || '').trim();
      const amount = parseFloat(row.amount || row.Amount || row.AMOUNT || 0);
      const saleDate = parseDateField(row.sale_date || row.saleDate || row.date || row.Date || row.SALE_DATE);
      
      if (!lineUserId) {
        errors.push({ row: index + 1, error: 'Missing LINE User ID' });
        return;
      }
      
      if (!amount || amount <= 0) {
        errors.push({ row: index + 1, error: 'Invalid amount' });
        return;
      }
      
      if (!saleDate) {
        errors.push({ row: index + 1, error: 'Invalid date format' });
        return;
      }
      
      salesData.push({
        lineUserId,
        amount,
        saleDate
      });
    } catch (error) {
      errors.push({ row: index + 1, error: error.message });
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
