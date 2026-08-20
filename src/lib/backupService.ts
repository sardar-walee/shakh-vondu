import { db } from './firebase';
import { 
  collection, 
  getDocs, 
  doc, 
  setDoc, 
  getDoc, 
  query, 
  orderBy, 
  limit, 
  where,
  deleteDoc
} from 'firebase/firestore';
import { 
  BackupConfig, 
  BackupSnapshot, 
  FullStoreBackupData, 
  ExportFilterOptions, 
  Product, 
  Sale, 
  Customer, 
  Supplier, 
  SupplierReturn, 
  StaffMember,
  BackupFrequency
} from '../types';
import { logAuditEvent } from './auditService';

export const DEFAULT_BACKUP_CONFIG: BackupConfig = {
  isAutoBackupEnabled: true,
  frequency: 'daily',
  retentionDays: 30,
  includeSales: true,
  includeProducts: true,
  includeCustomers: true,
  includeSuppliers: true,
  includeSupplierReturns: true,
  lastAutoBackupAt: '',
  nextScheduledBackupAt: new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString()
};

/**
 * Calculates the next backup timestamp based on frequency.
 */
export function calculateNextBackupDate(frequency: BackupFrequency, fromDate: Date = new Date()): string {
  const next = new Date(fromDate);
  if (frequency === 'daily') {
    next.setDate(next.getDate() + 1);
    next.setHours(2, 0, 0, 0); // 2:00 AM off-peak
  } else if (frequency === 'weekly') {
    next.setDate(next.getDate() + 7);
    next.setHours(2, 0, 0, 0);
  } else if (frequency === 'monthly') {
    next.setMonth(next.getMonth() + 1);
    next.setHours(2, 0, 0, 0);
  } else {
    // Manual
    next.setFullYear(next.getFullYear() + 10);
  }
  return next.toISOString();
}

/**
 * Generates a simple checksum hash for data integrity validation.
 */
export function generateChecksum(dataString: string): string {
  let hash = 0;
  for (let i = 0; i < dataString.length; i++) {
    const char = dataString.charCodeAt(i);
    hash = ((hash << 5) - hash) + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash).toString(16).padStart(8, '0').toUpperCase();
}

/**
 * Helper to escape and format a CSV cell value safely.
 */
function escapeCSV(val: any): string {
  if (val === null || val === undefined) return '""';
  if (typeof val === 'object') {
    return `"${JSON.stringify(val).replace(/"/g, '""')}"`;
  }
  const str = String(val);
  return `"${str.replace(/"/g, '""')}"`;
}

/**
 * Converts Products array to clean CSV with Kurdish/Arabic UTF-8 BOM.
 */
export function convertProductsToCSV(products: Product[]): string {
  const headers = [
    'ID', 'Name', 'Brand', 'Model', 'Category', 'SKU', 'Barcode', 
    'Selling Price ($)', 'Cost Price ($)', 'Stock Level', 'Min Stock', 
    'Has IMEI', 'Warranty (Months)', 'Description'
  ];

  const rows = products.map(p => [
    p.id || '',
    p.name || '',
    p.brand || '',
    p.model || '',
    p.category || '',
    p.sku || '',
    p.barcode || '',
    p.sellingPrice || 0,
    p.purchasePrice || 0,
    p.stock || 0,
    p.minStock || 0,
    p.hasImei ? 'Yes' : 'No',
    p.warrantyMonths || 0,
    p.description || ''
  ].map(escapeCSV).join(','));

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Converts Sales transactions array to clean CSV.
 */
export function convertSalesToCSV(sales: Sale[]): string {
  const headers = [
    'Sale ID', 'Date Time', 'Customer Name', 'Customer Phone', 
    'Items Count', 'Subtotal ($)', 'Discount ($)', 'Total ($)', 
    'Cost ($)', 'Profit Margin ($)', 'Amount Paid ($)', 'Remaining Debt ($)', 
    'Payment Method', 'Cashier / Staff', 'Branch', 'Loyalty Points Earned', 'SMS Receipt Sent'
  ];

  const rows = sales.map(s => [
    s.id || '',
    s.createdAt || '',
    s.customerName || 'Walk-in Customer',
    s.customerPhone || '',
    s.items ? s.items.length : 0,
    s.subtotal || 0,
    s.discount || 0,
    s.total || 0,
    s.cost || 0,
    s.profit || 0,
    s.paid || 0,
    s.remaining || 0,
    s.paymentMethod || 'cash',
    s.employeeName || 'Staff',
    s.branchName || 'Main Store',
    s.loyaltyPointsEarned || 0,
    s.smsSent ? 'Yes' : 'No'
  ].map(escapeCSV).join(','));

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Converts Customers array to clean CSV.
 */
export function convertCustomersToCSV(customers: Customer[]): string {
  const headers = [
    'Customer ID', 'Full Name', 'Phone Number', 'Address / City', 
    'Current Debt ($)', 'Loyalty Points', 'Tier', 'Total Lifetime Spent ($)', 'Created Date'
  ];

  const rows = customers.map(c => [
    c.id || '',
    c.name || '',
    c.phone || '',
    c.address || '',
    c.debt || 0,
    c.loyaltyPoints || 0,
    c.tier || 'bronze',
    c.totalSpent || 0,
    c.createdAt || ''
  ].map(escapeCSV).join(','));

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Converts Suppliers array to clean CSV.
 */
export function convertSuppliersToCSV(suppliers: Supplier[]): string {
  const headers = [
    'Supplier ID', 'Supplier Name', 'Company Name', 'Contact Person', 
    'Phone', 'Email', 'Address', 'Credit Balance ($)', 'Total Returns Count', 'Notes', 'Created Date'
  ];

  const rows = suppliers.map(s => [
    s.id || '',
    s.name || '',
    s.companyName || '',
    s.contactPerson || '',
    s.phone || '',
    s.email || '',
    s.address || '',
    s.creditBalance || 0,
    s.totalReturnsCount || 0,
    s.notes || '',
    s.createdAt || ''
  ].map(escapeCSV).join(','));

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Converts Supplier Returns (RMA) array to clean CSV.
 */
export function convertSupplierReturnsToCSV(returns: SupplierReturn[]): string {
  const headers = [
    'RMA Number', 'Date', 'Supplier Name', 'Supplier Phone', 
    'Return Reason', 'Status', 'Items Count', 'Total Cost ($)', 
    'Settlement Type', 'Tracking / Courier', 'Created By', 'Branch', 'Settled At'
  ];

  const rows = returns.map(r => [
    r.returnNumber || '',
    r.createdAt || '',
    r.supplierName || '',
    r.supplierPhone || '',
    r.reason || '',
    r.status || 'draft',
    r.items ? r.items.length : 0,
    r.totalCost || 0,
    r.settlementType || 'pending_inspection',
    r.courierName ? `${r.courierName} (${r.trackingNumber || ''})` : (r.trackingNumber || ''),
    r.createdByName || '',
    r.branchName || '',
    r.settledAt || 'Pending'
  ].map(escapeCSV).join(','));

  return '\uFEFF' + [headers.join(','), ...rows].join('\r\n');
}

/**
 * Triggers an instant download in the user's browser without external dependencies.
 */
export function triggerBrowserDownload(content: string, filename: string, mimeType: string = 'text/csv;charset=utf-8;') {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  link.setAttribute('download', filename);
  link.style.visibility = 'hidden';
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

/**
 * Fetches all critical store data collections from Firestore.
 */
export async function fetchFullStoreData(storeId: string, storeName: string = 'MobiStore', userEmail: string = 'admin'): Promise<FullStoreBackupData> {
  const [
    productsSnap,
    salesSnap,
    customersSnap,
    suppliersSnap,
    returnsSnap,
    staffSnap
  ] = await Promise.all([
    getDocs(collection(db, `stores/${storeId}/products`)),
    getDocs(collection(db, `stores/${storeId}/sales`)),
    getDocs(collection(db, `stores/${storeId}/customers`)),
    getDocs(collection(db, `stores/${storeId}/suppliers`)),
    getDocs(collection(db, `stores/${storeId}/supplier_returns`)),
    getDocs(collection(db, `stores/${storeId}/staff`))
  ]);

  const products = productsSnap.docs.map(d => ({ id: d.id, ...d.data() } as Product));
  const sales = salesSnap.docs.map(d => ({ id: d.id, ...d.data() } as Sale));
  const customers = customersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
  const suppliers = suppliersSnap.docs.map(d => ({ id: d.id, ...d.data() } as Supplier));
  const supplierReturns = returnsSnap.docs.map(d => ({ id: d.id, ...d.data() } as SupplierReturn));
  const staff = staffSnap.docs.map(d => ({ id: d.id, ...d.data() } as StaffMember));

  const counts = {
    products: products.length,
    sales: sales.length,
    customers: customers.length,
    suppliers: suppliers.length,
    supplierReturns: supplierReturns.length,
    staff: staff.length
  };

  const payloadString = JSON.stringify({ products, sales, customers, suppliers, supplierReturns, staff });
  const checksum = generateChecksum(payloadString);

  return {
    version: '1.0.0',
    storeId,
    storeName,
    exportedAt: new Date().toISOString(),
    exportedBy: userEmail,
    checksum,
    counts,
    data: {
      products,
      sales,
      customers,
      suppliers,
      supplierReturns,
      staff
    }
  };
}

/**
 * Creates and logs a snapshot record into Firestore.
 */
export async function createAndSaveSnapshot(
  storeId: string, 
  triggerType: 'automatic_schedule' | 'manual_full' | 'manual_collection',
  options?: {
    storeName?: string;
    userId?: string;
    userName?: string;
    format?: 'json' | 'csv_bundle' | 'csv_single';
    notes?: string;
  }
): Promise<{ snapshot: BackupSnapshot; backupData: FullStoreBackupData }> {
  const storeName = options?.storeName || 'MobiStore';
  const userName = options?.userName || 'Store Owner';
  const format = options?.format || 'json';

  const backupData = await fetchFullStoreData(storeId, storeName, userName);
  const jsonContent = JSON.stringify(backupData, null, 2);
  const fileSizeBytes = new Blob([jsonContent]).size;
  const totalRecords = Object.values(backupData.counts).reduce((a, b) => a + b, 0);

  const snapshotRef = doc(collection(db, `stores/${storeId}/backup_snapshots`));
  const dateStr = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randSuffix = Math.floor(1000 + Math.random() * 9000);
  const snapshotNumber = `SNP-${dateStr}-${randSuffix}`;

  const snapshot: BackupSnapshot = {
    id: snapshotRef.id,
    snapshotNumber,
    triggerType,
    status: 'completed',
    counts: backupData.counts,
    totalRecords,
    fileSizeBytes,
    format,
    includedCollections: ['products', 'sales', 'customers', 'suppliers', 'supplier_returns', 'staff'],
    checksum: backupData.checksum,
    notes: options?.notes || (triggerType === 'automatic_schedule' ? 'Scheduled automated daily snapshot' : 'Manual full store backup export'),
    createdBy: options?.userId || '',
    createdByName: userName,
    createdAt: new Date().toISOString()
  };

  const cleanSnapshot: Record<string, any> = {};
  Object.entries(snapshot).forEach(([k, v]) => {
    if (v !== undefined) cleanSnapshot[k] = v;
  });

  await setDoc(snapshotRef, cleanSnapshot);

  // Update backup config last auto backup if applicable
  if (triggerType === 'automatic_schedule') {
    const configRef = doc(db, `stores/${storeId}/backup_config/current`);
    const nextDate = calculateNextBackupDate('daily');
    await setDoc(configRef, {
      lastAutoBackupAt: snapshot.createdAt,
      nextScheduledBackupAt: nextDate
    }, { merge: true });
  }

  // Record audit log
  await logAuditEvent(storeId, {
    entityType: 'store',
    entityId: snapshot.id,
    action: 'created',
    title: `Generated Database Backup Snapshot (${snapshotNumber})`,
    details: `Trigger: ${triggerType}, Format: ${format}, Total Records: ${totalRecords}, Checksum: ${snapshot.checksum}`,
    performedBy: options?.userId,
    performedByName: userName,
    role: 'owner'
  });

  return { snapshot, backupData };
}

/**
 * Validates an uploaded/imported JSON backup file string.
 */
export function validateBackupJSON(jsonStr: string): { 
  isValid: boolean; 
  error?: string; 
  parsed?: FullStoreBackupData;
  recordSummary?: { [key: string]: number };
} {
  try {
    const parsed = JSON.parse(jsonStr) as FullStoreBackupData;
    if (!parsed.version || !parsed.data) {
      return { isValid: false, error: 'Invalid backup file structure: missing version or data payload.' };
    }

    const { products, sales, customers, suppliers, supplierReturns } = parsed.data;
    if (!Array.isArray(products) || !Array.isArray(sales) || !Array.isArray(customers)) {
      return { isValid: false, error: 'Backup data is missing core entity arrays.' };
    }

    const recordSummary = {
      products: products?.length || 0,
      sales: sales?.length || 0,
      customers: customers?.length || 0,
      suppliers: suppliers?.length || 0,
      supplierReturns: supplierReturns?.length || 0
    };

    return {
      isValid: true,
      parsed,
      recordSummary
    };
  } catch (err: any) {
    return {
      isValid: false,
      error: `JSON Parse error: ${err?.message || 'Malformed JSON file'}`
    };
  }
}
