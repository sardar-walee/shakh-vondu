export type Language = 'ku' | 'ar' | 'en' | 'tr' | 'fa';

export type UserRole = 'superadmin' | 'owner' | 'manager' | 'cashier' | 'technician' | 'inventory_clerk' | 'customer';

export type BusinessType = 
  | 'mobile_electronics' 
  | 'pharmacy_medical' 
  | 'supermarket_grocery' 
  | 'clothing_fashion' 
  | 'auto_parts' 
  | 'restaurant_cafe' 
  | 'cosmetics_perfumes' 
  | 'general_retail';

export interface BusinessTypeDefinition {
  id: BusinessType;
  name: string;
  nameKu: string;
  nameAr: string;
  icon: string;
  description: string;
  descriptionKu: string;
  defaultCategories: string[];
  features: {
    hasImei: boolean;
    hasExpiryDate: boolean;
    hasBatchNumber: boolean;
    hasSizeColor: boolean;
    hasPartNumber: boolean;
    hasUnits: boolean;
    hasPrescription: boolean;
    hasKitchenTables: boolean;
  };
}

export type PermissionKey =
  // POS & Checkout
  | 'pos:access'
  | 'pos:discount'
  | 'pos:custom_price'
  // Sales History & Refunds
  | 'sales:view_all'
  | 'sales:view_own'
  | 'sales:refund_void'
  // Products & Inventory
  | 'products:view'
  | 'products:view_cost_price'
  | 'products:create'
  | 'products:edit'
  | 'products:delete'
  | 'inventory:adjust_stock'
  // Supplier Returns (RMA)
  | 'returns:view'
  | 'returns:create'
  | 'returns:settle'
  | 'returns:suppliers_manage'
  // Customers & Loyalty
  | 'customers:view'
  | 'customers:manage'
  | 'customers:give_credit'
  | 'loyalty:manage'
  | 'loyalty:redeem'
  // SMS Gateway
  | 'sms:send'
  | 'sms:configure'
  // Reports & Audits
  | 'reports:view_financial'
  | 'reports:view_inventory'
  | 'reports:export'
  // Store Settings & Administration
  | 'settings:store_profile'
  | 'settings:permissions'
  | 'settings:audit_logs'
  | 'subscription:manage';

export interface PermissionDefinition {
  key: PermissionKey;
  label: string;
  labelKu?: string;
  labelAr?: string;
  description: string;
  category: 'pos' | 'products' | 'returns' | 'customers' | 'sms' | 'reports' | 'settings';
  dangerLevel?: 'low' | 'medium' | 'high';
}

export interface RolePermissionsConfig {
  id?: string;
  role: UserRole;
  permissions: PermissionKey[];
  maxDiscountPercent?: number;
  canViewCostPrices?: boolean;
  canVoidSales?: boolean;
  canProcessReturns?: boolean;
  canExportReports?: boolean;
  updatedAt?: string;
  updatedBy?: string;
}

export interface StaffMember {
  id: string;
  userId?: string;
  displayName: string;
  email: string;
  phone?: string;
  role: UserRole;
  branchId?: string;
  branchName?: string;
  isActive: boolean;
  customPermissions?: PermissionKey[];
  createdAt: string;
  lastLoginAt?: string;
}

export interface UserProfile {
  id?: string;
  email: string;
  role: UserRole;
  userType?: 'store_owner' | 'customer' | 'staff';
  storeId?: string;
  customerStoreId?: string;
  customerId?: string;
  branchId?: string;
  displayName?: string;
  phone?: string;
  customPermissions?: PermissionKey[];
}

export interface Store {
  id: string;
  name: string;
  ownerId: string;
  subscriberEmail?: string;
  backupEmail?: string;
  autoBackupGmail?: boolean;
  businessType?: BusinessType;
  phone?: string;
  address?: string;
  currency?: string;
  language?: Language;
  subscriptionStatus: 'trial' | 'active' | 'expiring_soon' | 'expired' | 'suspended' | 'cancelled';
  trialEndDate?: string;
  subscriptionEndDate?: string;
  subscriptionPeriod?: '3_months' | '6_months' | '1_year' | 'monthly' | 'trial';
  licenseKey?: string;
  planId?: 'free_trial' | 'starter' | 'pro' | 'enterprise' | string;
  billingCycle?: 'monthly' | 'yearly';
  paymentMethod?: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  };
  createdAt: string;
  loyaltyConfig?: LoyaltyConfig;
  smsConfig?: SMSConfig;
}

export type SubscriptionTierId = 'free_trial' | 'starter' | 'pro' | 'enterprise';

export interface SubscriptionPlan {
  id: SubscriptionTierId;
  name: string;
  nameKu: string;
  nameAr: string;
  description: string;
  badge?: string;
  priceMonthly: number;
  priceYearly: number; // Discounted annual price
  priceIqd?: number;
  durationMonths?: number;
  limits: {
    branches: number | 'Unlimited';
    staffSeats: number | 'Unlimited';
    smsMonthly: number | 'Unlimited';
    productsMax: number | 'Unlimited';
    aiInsights: boolean;
    customWebhook: boolean;
    dedicatedSmsSender: boolean;
    prioritySupport: boolean;
  };
  highlightFeatures: string[];
  popular?: boolean;
}

export interface BillingInvoice {
  id: string;
  invoiceNumber: string;
  planId: string;
  planName: string;
  amount: number;
  currency: string;
  billingCycle: 'monthly' | 'yearly';
  status: 'paid' | 'pending' | 'failed' | 'refunded';
  paymentMethod: string;
  cardLast4?: string;
  couponCode?: string;
  discountAmount?: number;
  taxAmount?: number;
  subtotal?: number;
  receiptUrl?: string;
  createdAt: string;
}

export interface PromoCoupon {
  code: string;
  discountPercent?: number;
  discountFixed?: number;
  description: string;
  minAmount?: number;
}

// ---------------- Supplier & Returns (RMA) Types ----------------
export type ReturnReason = 
  | 'damaged_on_arrival' 
  | 'screen_hardware_fault' 
  | 'excess_stock' 
  | 'wrong_item_shipped' 
  | 'recall_manufacturer' 
  | 'customer_return_to_vendor';

export type ReturnSettlement = 
  | 'supplier_credit' 
  | 'cash_refund' 
  | 'replacement_stock' 
  | 'pending_inspection';

export type ReturnStatus = 
  | 'draft' 
  | 'pending_approval' 
  | 'shipped_to_supplier' 
  | 'received_by_supplier' 
  | 'resolved_credit' 
  | 'resolved_refund' 
  | 'resolved_replacement' 
  | 'rejected';

export type ItemCondition = 
  | 'new_sealed' 
  | 'open_box' 
  | 'damaged_cracked' 
  | 'defective_hardware' 
  | 'missing_accessories';

export interface Supplier {
  id: string;
  name: string;
  contactPerson?: string;
  phone: string;
  email?: string;
  address?: string;
  companyName?: string;
  creditBalance: number;
  totalReturnsCount?: number;
  notes?: string;
  createdAt?: string;
}

export interface SupplierReturnItem {
  id: string;
  productId: string;
  productName: string;
  brand: string;
  category?: string;
  quantity: number;
  unitCost: number;
  totalCost: number;
  condition: ItemCondition;
  faultDescription?: string;
  imeis?: string[];
  barcode?: string;
}

export interface SupplierReturn {
  id: string;
  returnNumber: string; // e.g. RMA-2026-0012
  supplierId: string;
  supplierName: string;
  supplierPhone?: string;
  supplierEmail?: string;
  supplierAddress?: string;
  reason: ReturnReason;
  reasonDetails?: string;
  items: SupplierReturnItem[];
  totalCost: number;
  settlementType: ReturnSettlement;
  status: ReturnStatus;
  trackingNumber?: string;
  courierName?: string;
  autoInventoryDeducted: boolean;
  notes?: string;
  createdBy: string;
  createdByName: string;
  branchId?: string;
  branchName?: string;
  settlementAmount?: number;
  settledAt?: string;
  rejectionReason?: string;
  createdAt: string;
  updatedAt: string;
}

// ---------------- Audit Trail Types ----------------
export interface AuditLog {
  id: string;
  entityType: 'supplier_return' | 'product' | 'sale' | 'supplier' | 'inventory' | 'user' | 'backup' | 'store';
  entityId: string;
  action: 'created' | 'updated' | 'status_changed' | 'inventory_deducted' | 'inventory_restored' | 'settled' | 'rejected' | 'deleted';
  title: string;
  details?: string;
  performedBy: string;
  performedByName: string;
  role?: string;
  changes?: Record<string, { old: any; new: any }>;
  createdAt: string;
}

export interface Product {
  id: string;
  name: string;
  brand: string;
  model?: string;
  category: string;
  sku?: string;
  barcode?: string;
  purchasePrice: number;
  sellingPrice: number;
  wholesalePrice?: number;
  stock: number;
  minStock?: number;
  hasImei?: boolean;
  imei?: string;
  imeis?: string[];
  warrantyMonths?: number;
  description?: string;
  images?: string[];
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  address?: string;
  debt: number;
  loyaltyPoints?: number;
  totalSpent?: number;
  tier?: 'bronze' | 'silver' | 'gold' | 'platinum';
  createdAt?: string;
}

export interface CartItem {
  id: string;
  name: string;
  price: number;
  purchasePrice?: number;
  quantity: number;
  brand?: string;
  category?: string;
  imei?: string;
  warrantyMonths?: number;
  rewardId?: string;
}

export interface Sale {
  id: string;
  customerId?: string;
  customerName?: string;
  customerPhone?: string;
  items: CartItem[];
  subtotal: number;
  discount: number;
  total: number;
  cost?: number;
  profit?: number;
  paid: number;
  remaining?: number;
  paymentMethod: 'cash' | 'card' | 'debt' | 'points';
  employeeId?: string;
  employeeName?: string;
  branchId?: string;
  branchName?: string;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  smsSent?: boolean;
  createdAt: string;
}

// ---------------- Loyalty Program Types ----------------
export type LoyaltyTier = 'bronze' | 'silver' | 'gold' | 'platinum';

export interface LoyaltyConfig {
  isEnabled: boolean;
  pointsPerSpend: number; // e.g. 1 point per $10 spent => 0.1 pts/dollar
  pointValueInCurrency: number; // e.g. 1 point = $0.05 discount
  minPointsToRedeem: number; // e.g. 50 points
  tierRules: {
    silverMinPoints: number; // e.g. 500
    goldMinPoints: number; // e.g. 1000
    platinumMinPoints: number; // e.g. 2500
    silverBonusMultiplier: number; // e.g. 1.05
    goldBonusMultiplier: number; // e.g. 1.10
    platinumBonusMultiplier: number; // e.g. 1.20
  };
}

export interface LoyaltyReward {
  id: string;
  name: string;
  pointsRequired: number;
  type: 'discount' | 'free_item' | 'service' | 'voucher';
  discountAmount?: number;
  itemCategory?: string;
  description?: string;
  isActive: boolean;
}

export interface LoyaltyHistoryItem {
  id: string;
  customerId: string;
  customerName?: string;
  saleId?: string;
  points: number;
  action: 'earned' | 'redeemed' | 'adjusted' | 'bonus';
  reason?: string;
  createdAt: string;
}

// ---------------- SMS Gateway & Alert Types ----------------
export type SMSProvider = 'twilio' | 'fastsms' | 'asiacell' | 'korek' | 'zain' | 'custom_webhook';

export interface SMSConfig {
  provider: SMSProvider;
  apiKey?: string;
  accountSid?: string;
  senderId: string;
  webhookUrl?: string;
  testPhone?: string;
  isEnabled: boolean;
  autoLowStockAlert: boolean;
  autoSubscriptionAlert: boolean;
  autoWarrantyAlert: boolean;
  autoInstallmentAlert: boolean;
  managerPhone?: string;
}

export type SMSEventType = 
  | 'low_stock' 
  | 'expiring_subscription' 
  | 'expiring_warranty' 
  | 'upcoming_installment' 
  | 'sale_receipt' 
  | 'custom';

export interface SMSTemplate {
  id: string;
  eventType: SMSEventType;
  title: string;
  body: string;
  language: string;
  isActive: boolean;
}

export interface SMSLog {
  id: string;
  recipientPhone: string;
  recipientName?: string;
  eventType: SMSEventType | string;
  message: string;
  status: 'delivered' | 'sent' | 'failed' | 'pending';
  gatewayResponse?: string;
  createdAt: string;
}

export interface InstallmentSchedule {
  id: string;
  customerId: string;
  customerName: string;
  customerPhone: string;
  saleId?: string;
  totalDebt: number;
  installmentAmount: number;
  dueDate: string;
  status: 'pending' | 'paid' | 'overdue';
  remindedAt?: string;
}

// ---------------- Reports & Filtering Types ----------------
export interface ReportFilter {
  dateRange: 'today' | 'yesterday' | 'week' | 'month' | 'last_month' | 'year' | 'all' | 'custom';
  startDate?: string;
  endDate?: string;
  employeeId?: string;
  customerId?: string;
  category?: string;
  branchId?: string;
  paymentMethod?: string;
  searchQuery?: string;
}

export interface ReportSort {
  field: 'createdAt' | 'id' | 'customerName' | 'total' | 'profit' | 'itemsCount' | 'employeeName' | 'branchName';
  direction: 'asc' | 'desc';
}

// ---------------- Database Backup & Automated Snapshot Types ----------------
export type BackupFrequency = 'daily' | 'weekly' | 'monthly' | 'manual';
export type BackupTriggerType = 'automatic_schedule' | 'manual_full' | 'manual_collection';
export type BackupFormat = 'json' | 'csv_bundle' | 'csv_single';

export interface BackupCollectionCounts {
  sales: number;
  products: number;
  customers: number;
  suppliers: number;
  supplierReturns: number;
  staff: number;
  smsLogs?: number;
  auditLogs?: number;
}

export interface BackupConfig {
  isAutoBackupEnabled: boolean;
  frequency: BackupFrequency;
  retentionDays: number;
  includeSales: boolean;
  includeProducts: boolean;
  includeCustomers: boolean;
  includeSuppliers: boolean;
  includeSupplierReturns: boolean;
  lastAutoBackupAt?: string;
  nextScheduledBackupAt?: string;
  updatedAt?: string;
}

export interface BackupSnapshot {
  id: string;
  snapshotNumber: string;
  triggerType: BackupTriggerType;
  status: 'completed' | 'in_progress' | 'failed';
  counts: BackupCollectionCounts;
  totalRecords: number;
  fileSizeBytes: number;
  format: BackupFormat;
  includedCollections: string[];
  checksum: string;
  downloadPayload?: string; // Cache data or summary
  notes?: string;
  createdBy?: string;
  createdByName?: string;
  createdAt: string;
}

export interface FullStoreBackupData {
  version: string;
  storeId: string;
  storeName: string;
  exportedAt: string;
  exportedBy: string;
  checksum: string;
  counts: BackupCollectionCounts;
  data: {
    products: Product[];
    sales: Sale[];
    customers: Customer[];
    suppliers: Supplier[];
    supplierReturns: SupplierReturn[];
    staff: StaffMember[];
    rolePermissions?: Record<string, PermissionKey[]>;
  };
}

export interface ExportFilterOptions {
  collections: ('products' | 'sales' | 'customers' | 'suppliers' | 'supplierReturns')[];
  format: 'json' | 'csv';
  dateRange: 'all' | 'today' | 'last_7_days' | 'last_30_days' | 'this_month' | 'custom';
  startDate?: string;
  endDate?: string;
}

// ---------------- Real-Time Notification System Types ----------------
export type NotificationType = 'low_inventory' | 'subscription_renewal' | 'system_update' | 'sale' | 'general';
export type NotificationSeverity = 'info' | 'warning' | 'urgent' | 'success';

export interface StoreNotification {
  id: string;
  title: string;
  message: string;
  type: NotificationType;
  severity: NotificationSeverity;
  read: boolean;
  link?: string;
  metadata?: {
    productId?: string;
    productName?: string;
    stock?: number;
    minStock?: number;
    planName?: string;
    subscriptionEndDate?: string;
    updateVersion?: string;
    [key: string]: any;
  };
  createdAt: string;
  createdBy?: string;
}

