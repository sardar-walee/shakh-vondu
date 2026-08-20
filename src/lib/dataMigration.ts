import { Product, Customer } from '../types';
import { db } from './firebase';
import { collection, writeBatch, doc } from 'firebase/firestore';

// UTF-8 BOM for Microsoft Excel Unicode compatibility (Kurdish, Arabic, Turkish)
const UTF8_BOM = '\uFEFF';

// Helper to escape CSV cell fields
function escapeCSVCell(val: any): string {
  if (val === null || val === undefined) return '""';
  const str = String(val).replace(/"/g, '""');
  if (str.includes(',') || str.includes('"') || str.includes('\n') || str.includes('\r')) {
    return `"${str}"`;
  }
  return str;
}

/**
 * Downloads data string as a file in browser
 */
export function downloadFile(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

// ---------------- PRODUCTS EXPORT & SAMPLE TEMPLATE ----------------

export const PRODUCT_CSV_HEADERS = [
  'Name',
  'Brand',
  'Model',
  'Category',
  'Selling Price',
  'Purchase Price',
  'Wholesale Price',
  'Stock',
  'Min Stock',
  'Barcode',
  'SKU',
  'Has IMEI',
  'Warranty Months',
  'Description'
];

export function exportProductsToCSV(products: Product[], filename: string = 'products_catalog.csv') {
  const headerLine = PRODUCT_CSV_HEADERS.map(escapeCSVCell).join(',');
  const rowLines = products.map(p => [
    p.name || '',
    p.brand || '',
    p.model || '',
    p.category || 'General',
    p.sellingPrice ?? 0,
    p.purchasePrice ?? 0,
    p.wholesalePrice ?? 0,
    p.stock ?? 0,
    p.minStock ?? 5,
    p.barcode || '',
    p.sku || '',
    p.hasImei ? 'Yes' : 'No',
    p.warrantyMonths ?? 0,
    p.description || ''
  ].map(escapeCSVCell).join(','));

  const csvContent = UTF8_BOM + [headerLine, ...rowLines].join('\r\n');
  downloadFile(csvContent, filename);
}

export function downloadProductSampleCSV() {
  const sampleRows = [
    ['iPhone 15 Pro Max 256GB', 'Apple', 'A3106', 'Smartphones', '1199', '1050', '1120', '12', '3', '195949000111', 'IP15PM-256-NT', 'Yes', '12', 'Natural Titanium Official Warranty'],
    ['Samsung Galaxy S24 Ultra', 'Samsung', 'SM-S928B', 'Smartphones', '1249', '1100', '1180', '8', '2', '880609500222', 'S24U-512-GY', 'Yes', '12', 'Titanium Gray Dual SIM'],
    ['Anker 20W USB-C Nano Charger', 'Anker', 'A2637', 'Chargers', '18', '8', '12', '45', '10', '848061003333', 'ANK-20W-WHT', 'No', '24', 'PD Fast Charger Foldable Plug'],
    ['JBL Tune 520BT Headphones', 'JBL', 'T520BT', 'Audio & Sound', '49', '28', '38', '20', '5', '692528190444', 'JBL-520BT-BLK', 'No', '12', 'Bluetooth Wireless On-Ear Black']
  ];

  const headerLine = PRODUCT_CSV_HEADERS.map(escapeCSVCell).join(',');
  const rowLines = sampleRows.map(r => r.map(escapeCSVCell).join(','));
  const csvContent = UTF8_BOM + [headerLine, ...rowLines].join('\r\n');
  downloadFile(csvContent, 'sample_products_import_template.csv');
}

// ---------------- CUSTOMERS EXPORT & SAMPLE TEMPLATE ----------------

export const CUSTOMER_CSV_HEADERS = [
  'Name',
  'Phone',
  'Address',
  'Debt Amount',
  'Loyalty Points',
  'Total Spent',
  'Tier'
];

export function exportCustomersToCSV(customers: Customer[], filename: string = 'customers_catalog.csv') {
  const headerLine = CUSTOMER_CSV_HEADERS.map(escapeCSVCell).join(',');
  const rowLines = customers.map(c => [
    c.name || '',
    c.phone || '',
    c.address || '',
    c.debt ?? 0,
    c.loyaltyPoints ?? 0,
    c.totalSpent ?? 0,
    c.tier || 'bronze'
  ].map(escapeCSVCell).join(','));

  const csvContent = UTF8_BOM + [headerLine, ...rowLines].join('\r\n');
  downloadFile(csvContent, filename);
}

export function downloadCustomerSampleCSV() {
  const sampleRows = [
    ['Soran Ali', '+9647501112233', 'Erbil - Dream City', '0', '850', '2450', 'gold'],
    ['Rebin Qadir', '+9647509998877', 'Sulaymaniyah - Salim St.', '150', '240', '680', 'silver'],
    ['Lina Botan', '+9647504445566', 'Duhok - KRO', '0', '1450', '4200', 'platinum'],
    ['Zanyar Rostam', '+9647502221144', 'Erbil - Ankawa', '320', '95', '320', 'bronze']
  ];

  const headerLine = CUSTOMER_CSV_HEADERS.map(escapeCSVCell).join(',');
  const rowLines = sampleRows.map(r => r.map(escapeCSVCell).join(','));
  const csvContent = UTF8_BOM + [headerLine, ...rowLines].join('\r\n');
  downloadFile(csvContent, 'sample_customers_import_template.csv');
}

// ---------------- CSV PARSER ----------------

export function parseCSVText(csvText: string): string[][] {
  // Strip BOM
  let text = csvText;
  if (text.startsWith(UTF8_BOM)) {
    text = text.substring(1);
  }

  // Detect delimiter (, or ; or \t)
  const firstLine = text.split(/\r?\n/)[0] || '';
  let delimiter = ',';
  if (firstLine.includes('\t')) delimiter = '\t';
  else if (firstLine.includes(';') && !firstLine.includes(',')) delimiter = ';';

  const rows: string[][] = [];
  let currentRow: string[] = [];
  let currentCell = '';
  let insideQuotes = false;

  for (let i = 0; i < text.length; i++) {
    const char = text[i];
    const nextChar = text[i + 1];

    if (char === '"') {
      if (insideQuotes && nextChar === '"') {
        currentCell += '"';
        i++; // skip escaped quote
      } else {
        insideQuotes = !insideQuotes;
      }
    } else if (char === delimiter && !insideQuotes) {
      currentRow.push(currentCell.trim());
      currentCell = '';
    } else if ((char === '\r' || char === '\n') && !insideQuotes) {
      if (char === '\r' && nextChar === '\n') {
        i++; // skip \n
      }
      currentRow.push(currentCell.trim());
      if (currentRow.some(cell => cell.length > 0)) {
        rows.push(currentRow);
      }
      currentRow = [];
      currentCell = '';
    } else {
      currentCell += char;
    }
  }

  if (currentCell.length > 0 || currentRow.length > 0) {
    currentRow.push(currentCell.trim());
    if (currentRow.some(cell => cell.length > 0)) {
      rows.push(currentRow);
    }
  }

  return rows;
}

// ---------------- PRODUCT IMPORT PROCESSOR ----------------

export interface ParsedImportProduct {
  name: string;
  brand: string;
  model: string;
  category: string;
  sellingPrice: number;
  purchasePrice: number;
  wholesalePrice: number;
  stock: number;
  minStock: number;
  barcode: string;
  sku: string;
  hasImei: boolean;
  warrantyMonths: number;
  description: string;
  isValid: boolean;
  errors: string[];
}

export function parseProductCSV(csvText: string): ParsedImportProduct[] {
  const rows = parseCSVText(csvText);
  if (rows.length <= 1) return [];

  const headers = rows[0].map(h => h.toLowerCase().trim());
  const dataRows = rows.slice(1);

  // Map header indexes
  const findCol = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

  const idxName = findCol(['name', 'product', 'title', 'ناو', 'اسم']);
  const idxBrand = findCol(['brand', 'manufacturer', 'مارک']);
  const idxModel = findCol(['model', 'مۆدێل']);
  const idxCat = findCol(['category', 'cat', 'پۆل']);
  const idxSellPrice = findCol(['selling', 'price', 'sell', 'نرخی فرۆشتن', 'سعر']);
  const idxBuyPrice = findCol(['purchase', 'cost', 'buy', 'کڕین', 'شراء']);
  const idxWholesalePrice = findCol(['wholesale', 'کۆ']);
  const idxStock = findCol(['stock', 'qty', 'quantity', 'عەمار', 'مخزون']);
  const idxMinStock = findCol(['min', 'low']);
  const idxBarcode = findCol(['barcode', 'bar', 'بارکۆد']);
  const idxSku = findCol(['sku', 'code']);
  const idxImei = findCol(['imei']);
  const idxWarranty = findCol(['warranty', 'گەرەنتی']);
  const idxDesc = findCol(['desc', 'description', 'تێبینی']);

  return dataRows.map((row, rowIdx) => {
    const getVal = (idx: number) => (idx >= 0 && idx < row.length ? row[idx] : '');
    const parseNum = (val: string, defaultVal: number = 0) => {
      const clean = val.replace(/[^0-9.-]/g, '');
      const n = parseFloat(clean);
      return isNaN(n) ? defaultVal : n;
    };

    const name = getVal(idxName) || (idxName === -1 && row[0] ? row[0] : '');
    const brand = getVal(idxBrand) || (idxBrand === -1 && row[1] ? row[1] : 'Generic');
    const model = getVal(idxModel);
    const category = getVal(idxCat) || 'General';
    const sellingPrice = parseNum(getVal(idxSellPrice));
    const purchasePrice = parseNum(getVal(idxBuyPrice));
    const wholesalePrice = parseNum(getVal(idxWholesalePrice), sellingPrice);
    const stock = parseNum(getVal(idxStock));
    const minStock = parseNum(getVal(idxMinStock), 5);
    const barcode = getVal(idxBarcode);
    const sku = getVal(idxSku);
    const imeiStr = getVal(idxImei).toLowerCase();
    const hasImei = imeiStr.includes('yes') || imeiStr.includes('true') || imeiStr.includes('1') || imeiStr.includes('بەڵێ');
    const warrantyMonths = parseNum(getVal(idxWarranty), 0);
    const description = getVal(idxDesc);

    const errors: string[] = [];
    if (!name) errors.push('Product name is required');
    if (sellingPrice < 0) errors.push('Selling price cannot be negative');

    return {
      name,
      brand,
      model,
      category,
      sellingPrice,
      purchasePrice,
      wholesalePrice,
      stock,
      minStock,
      barcode,
      sku,
      hasImei,
      warrantyMonths,
      description,
      isValid: errors.length === 0,
      errors
    };
  });
}

// ---------------- CUSTOMER IMPORT PROCESSOR ----------------

export interface ParsedImportCustomer {
  name: string;
  phone: string;
  address: string;
  debt: number;
  loyaltyPoints: number;
  totalSpent: number;
  tier: 'bronze' | 'silver' | 'gold' | 'platinum';
  isValid: boolean;
  errors: string[];
}

export function parseCustomerCSV(csvText: string): ParsedImportCustomer[] {
  const rows = parseCSVText(csvText);
  if (rows.length <= 1) return [];

  const headers = rows[0].map(h => h.toLowerCase().trim());
  const dataRows = rows.slice(1);

  const findCol = (keys: string[]) => headers.findIndex(h => keys.some(k => h.includes(k)));

  const idxName = findCol(['name', 'customer', 'ناو', 'اسم']);
  const idxPhone = findCol(['phone', 'mobile', 'tel', 'مۆبایل', 'هاتف']);
  const idxAddress = findCol(['address', 'location', 'شار', 'عنوان']);
  const idxDebt = findCol(['debt', 'balance', 'قەرز']);
  const idxPoints = findCol(['points', 'loyalty', 'خاڵ']);
  const idxSpent = findCol(['spent', 'total']);
  const idxTier = findCol(['tier', 'level']);

  return dataRows.map((row) => {
    const getVal = (idx: number) => (idx >= 0 && idx < row.length ? row[idx] : '');
    const parseNum = (val: string, defaultVal: number = 0) => {
      const clean = val.replace(/[^0-9.-]/g, '');
      const n = parseFloat(clean);
      return isNaN(n) ? defaultVal : n;
    };

    const name = getVal(idxName) || row[0] || '';
    const phone = getVal(idxPhone) || (row[1] ? row[1] : '');
    const address = getVal(idxAddress);
    const debt = parseNum(getVal(idxDebt));
    const loyaltyPoints = parseNum(getVal(idxPoints));
    const totalSpent = parseNum(getVal(idxSpent));
    const tierRaw = getVal(idxTier).toLowerCase();
    const tier = (['silver', 'gold', 'platinum'].includes(tierRaw) ? tierRaw : 'bronze') as any;

    const errors: string[] = [];
    if (!name) errors.push('Customer name is required');
    if (!phone) errors.push('Phone number is required');

    return {
      name,
      phone,
      address,
      debt,
      loyaltyPoints,
      totalSpent,
      tier,
      isValid: errors.length === 0,
      errors
    };
  });
}

// ---------------- BATCH FIRESTORE IMPORTERS ----------------

export async function batchImportProductsToFirestore(
  storeId: string, 
  parsedProducts: ParsedImportProduct[], 
  onProgress?: (count: number, total: number) => void
): Promise<{ successCount: number; failCount: number }> {
  const validItems = parsedProducts.filter(p => p.isValid);
  if (validItems.length === 0) return { successCount: 0, failCount: parsedProducts.length - validItems.length };

  const chunkSize = 400; // Firestore batch write limit is 500
  let successCount = 0;

  for (let i = 0; i < validItems.length; i += chunkSize) {
    const chunk = validItems.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    chunk.forEach(item => {
      const docRef = doc(collection(db, `stores/${storeId}/products`));
      batch.set(docRef, {
        name: item.name,
        brand: item.brand,
        model: item.model,
        category: item.category,
        sellingPrice: item.sellingPrice,
        purchasePrice: item.purchasePrice,
        wholesalePrice: item.wholesalePrice,
        stock: item.stock,
        minStock: item.minStock,
        barcode: item.barcode,
        sku: item.sku,
        hasImei: item.hasImei,
        warrantyMonths: item.warrantyMonths,
        description: item.description,
        createdAt: new Date().toISOString()
      });
    });

    await batch.commit();
    successCount += chunk.length;
    if (onProgress) onProgress(successCount, validItems.length);
  }

  return { successCount, failCount: parsedProducts.length - validItems.length };
}

export async function batchImportCustomersToFirestore(
  storeId: string, 
  parsedCustomers: ParsedImportCustomer[], 
  onProgress?: (count: number, total: number) => void
): Promise<{ successCount: number; failCount: number }> {
  const validItems = parsedCustomers.filter(c => c.isValid);
  if (validItems.length === 0) return { successCount: 0, failCount: parsedCustomers.length - validItems.length };

  const chunkSize = 400;
  let successCount = 0;

  for (let i = 0; i < validItems.length; i += chunkSize) {
    const chunk = validItems.slice(i, i + chunkSize);
    const batch = writeBatch(db);

    chunk.forEach(item => {
      const docRef = doc(collection(db, `stores/${storeId}/customers`));
      batch.set(docRef, {
        name: item.name,
        phone: item.phone,
        address: item.address,
        debt: item.debt,
        loyaltyPoints: item.loyaltyPoints,
        totalSpent: item.totalSpent,
        tier: item.tier,
        createdAt: new Date().toISOString()
      });
    });

    await batch.commit();
    successCount += chunk.length;
    if (onProgress) onProgress(successCount, validItems.length);
  }

  return { successCount, failCount: parsedCustomers.length - validItems.length };
}
