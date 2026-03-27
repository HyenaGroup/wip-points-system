import { createRequire } from 'module';
const require = createRequire(import.meta.url);
const XLSX = require('../backend/node_modules/xlsx');
const path = require('path');
const { fileURLToPath } = require('url');

const data = [
  { phone_number: '0812345678', customer_name: 'สมชาย ใจดี', amount: 1500.00, sale_date: '2026-03-27' },
  { phone_number: '0891234567', customer_name: 'สมหญิง รักดี', amount: 2300.50, sale_date: '2026-03-27' },
  { phone_number: '0901234567', customer_name: 'วิชัย สุขใจ', amount: 850.00, sale_date: '2026-03-26' },
];

const ws = XLSX.utils.json_to_sheet(data);

ws['!cols'] = [
  { wch: 15 },
  { wch: 20 },
  { wch: 12 },
  { wch: 12 },
];

const wb = XLSX.utils.book_new();
XLSX.utils.book_append_sheet(wb, ws, 'Sales');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
XLSX.writeFile(wb, path.join(__dirname, 'sales_template.xlsx'));

console.log('✅ Template XLSX created: templates/sales_template.xlsx');
