import { UserRole, PermissionKey, PermissionDefinition } from '../types';

export const PERMISSION_CATEGORIES = [
  { id: 'pos', label: 'POS & Checkout', labelKu: 'کاشێر و فرۆشتن', labelAr: 'نقطة البيع والصندوق' },
  { id: 'products', label: 'Products & Stock', labelKu: 'بەرهەم و کۆگا', labelAr: 'المنتجات والمخزون' },
  { id: 'returns', label: 'Supplier Returns (RMA)', labelKu: 'گەڕاندنەوە بۆ دابینکەر', labelAr: 'مرتجعات الموردين' },
  { id: 'customers', label: 'Customers & Loyalty', labelKu: 'کڕیار و خاڵەکان', labelAr: 'الزبائن ونقاط الولاء' },
  { id: 'sms', label: 'SMS & Marketing', labelKu: 'نامە و ئاگاداری', labelAr: 'الرسائل والتنبيهات' },
  { id: 'reports', label: 'Financial & Reports', labelKu: 'ڕاپۆرت و ژمێریاری', labelAr: 'التقارير والأرباح' },
  { id: 'settings', label: 'Store Administration', labelKu: 'ڕێکخستن و بەڕێوەبردن', labelAr: 'الإعدادات والصلاحيات' },
] as const;

export const PERMISSION_DEFINITIONS: PermissionDefinition[] = [
  // POS & Sales
  {
    key: 'pos:access',
    label: 'Access POS Terminal',
    labelKu: 'دەستپێکردنی POS / کاشێر',
    labelAr: 'فتح نقطة البيع وتسجيل المبيعات',
    description: 'Open POS register, add items to cart, and process checkout transactions.',
    category: 'pos',
    dangerLevel: 'low'
  },
  {
    key: 'pos:discount',
    label: 'Apply Manual Discounts',
    labelKu: 'داشکاندنی دەستی لە فرۆشتندا',
    labelAr: 'منح خصومات يدوية على المبيعات',
    description: 'Grant line-item or total cart discounts up to configured threshold.',
    category: 'pos',
    dangerLevel: 'medium'
  },
  {
    key: 'pos:custom_price',
    label: 'Override Unit Prices at POS',
    labelKu: 'گۆڕینی نرخی پارچە لە کاتی فرۆشتن',
    labelAr: 'تعديل سعر الوحدة أثناء البيع',
    description: 'Manually adjust the retail selling price of items on the register.',
    category: 'pos',
    dangerLevel: 'high'
  },
  {
    key: 'sales:view_all',
    label: 'View All Staff Sales History',
    labelKu: 'بینینی فرۆشتنی هەموو کارمەندەکان',
    labelAr: 'عرض سجل مبيعات كافة الموظفين',
    description: 'Inspect transactions, receipts, and revenue generated across all staff registers.',
    category: 'pos',
    dangerLevel: 'low'
  },
  {
    key: 'sales:view_own',
    label: 'View Own Sales History Only',
    labelKu: 'تەنها بینینی فرۆشتنی خۆی',
    labelAr: 'عرض مبيعات المستخدم الخاصة فقط',
    description: 'Restricts sales history log to transactions processed by the logged-in user.',
    category: 'pos',
    dangerLevel: 'low'
  },
  {
    key: 'sales:refund_void',
    label: 'Void Sales & Issue Cash Refunds',
    labelKu: 'هەڵوەشاندنەوەی فرۆشتن و گەڕاندنەوەی پارە',
    labelAr: 'إلغاء المبيعات وإصدار استرداد نقدي',
    description: 'Cancel finalized transactions, restore items to stock, and disburse cash refunds.',
    category: 'pos',
    dangerLevel: 'high'
  },

  // Products & Inventory
  {
    key: 'products:view',
    label: 'View Product Catalog & Stock',
    labelKu: 'بینینی لیستی بەرهەم و کۆگا',
    labelAr: 'عرض دليل المنتجات ومستويات المخزون',
    description: 'Browse products, serials/IMEIs, retail prices, and current availability.',
    category: 'products',
    dangerLevel: 'low'
  },
  {
    key: 'products:view_cost_price',
    label: 'View Wholesale Cost & Profit Margins',
    labelKu: 'بینینی نرخی کڕین و قازانجی بەرهەم',
    labelAr: 'عرض سعر الشراء (التكلفة) وهوامش الربح',
    description: 'Reveal sensitive wholesale purchase prices and margin calculations.',
    category: 'products',
    dangerLevel: 'high'
  },
  {
    key: 'products:create',
    label: 'Add New Products & IMEIs',
    labelKu: 'زیادکردنی بەرهەم و ئایمای نوێ',
    labelAr: 'إضافة منتجات وأجهزة جديدة',
    description: 'Register new devices, accessories, barcodes, and serials into inventory.',
    category: 'products',
    dangerLevel: 'medium'
  },
  {
    key: 'products:edit',
    label: 'Edit Product Details & Prices',
    labelKu: 'دەستکاری زانیاری و نرخی بەرهەم',
    labelAr: 'تعديل بيانات المنتجات والأسعار',
    description: 'Update product specifications, retail pricing, warranty, and categories.',
    category: 'products',
    dangerLevel: 'medium'
  },
  {
    key: 'products:delete',
    label: 'Delete Products from Catalog',
    labelKu: 'سڕینەوەی بەرهەم لە کۆگا',
    labelAr: 'حذف المنتجات من النظام نهائياً',
    description: 'Permanently remove products and accessories from store inventory.',
    category: 'products',
    dangerLevel: 'high'
  },
  {
    key: 'inventory:adjust_stock',
    label: 'Manual Stock Adjustments & Counts',
    labelKu: 'دەستکاری ڕاستەوخۆی ژمارەی کۆگا',
    labelAr: 'تعديل كميات المخزون يدوياً والجرد',
    description: 'Perform stock count reconciliations, shrinkage write-offs, or manual count increases.',
    category: 'products',
    dangerLevel: 'medium'
  },

  // Supplier Returns
  {
    key: 'returns:view',
    label: 'View Supplier RMA Claims',
    labelKu: 'بینینی داواکاری گەڕاندنەوە بۆ دابینکەر',
    labelAr: 'عرض طلبات إرجاع البضائع للموردين',
    description: 'Review RMA documents, tracking statuses, and supplier return logs.',
    category: 'returns',
    dangerLevel: 'low'
  },
  {
    key: 'returns:create',
    label: 'Initiate Supplier Returns & Deduct Stock',
    labelKu: 'دروستکردنی گەڕاندنەوە و کەمکردنەوە لە کۆگا',
    labelAr: 'إنشاء طلب إرجاع للمورد وخصم المخزون',
    description: 'Create return vouchers for defective/excess stock with automated inventory adjustments.',
    category: 'returns',
    dangerLevel: 'medium'
  },
  {
    key: 'returns:settle',
    label: 'Authorize Settlement & Restock Items',
    labelKu: 'پەسەندکردنی قەرەبووی کۆمپانیا یان گەڕاندنەوە بۆ کۆگا',
    labelAr: 'اعتماد التسوية المالية أو إعادة القطع للمخزن',
    description: 'Accept supplier store credits, cash refunds, or restock rejected RMA items.',
    category: 'returns',
    dangerLevel: 'high'
  },
  {
    key: 'returns:suppliers_manage',
    label: 'Manage Wholesale Supplier Directory',
    labelKu: 'بەڕێوەبردنی دابینکەران و کۆمپانیاکان',
    labelAr: 'إدارة دليل الموردين وجهات الاتصال',
    description: 'Add and edit wholesale supplier contacts, addresses, and track credit balances.',
    category: 'returns',
    dangerLevel: 'medium'
  },

  // Customers & Loyalty
  {
    key: 'customers:view',
    label: 'View Customer Directory',
    labelKu: 'بینینی لیستی کڕیاران',
    labelAr: 'عرض دليل الزبائن وسجل الشراء',
    description: 'Search customers, contact details, total lifetime spend, and purchase history.',
    category: 'customers',
    dangerLevel: 'low'
  },
  {
    key: 'customers:manage',
    label: 'Add & Edit Customer Profiles',
    labelKu: 'زیادکردن و دەستکاری کڕیار',
    labelAr: 'إضافة وتعديل بيانات الزبائن',
    description: 'Register new customers, phone numbers, addresses, and tier levels.',
    category: 'customers',
    dangerLevel: 'low'
  },
  {
    key: 'customers:give_credit',
    label: 'Manage Customer Debt / Installment Credit',
    labelKu: 'بەڕێوەبردنی قەرز و باڵانسی کڕیار',
    labelAr: 'منح ديون وأقساط وإدارة الحسابات الآجلة',
    description: 'Issue credit sales, set installment schedules, and record debt payments.',
    category: 'customers',
    dangerLevel: 'high'
  },
  {
    key: 'loyalty:manage',
    label: 'Configure Loyalty Rewards Catalog',
    labelKu: 'ڕێکخستنی کەتەلۆگی خەڵاتی خاڵەکان',
    labelAr: 'إدارة كتالوج مكافآت برنامج الولاء',
    description: 'Create rewards, set points redemption exchange rates, and configure bonus campaigns.',
    category: 'customers',
    dangerLevel: 'medium'
  },
  {
    key: 'loyalty:redeem',
    label: 'Redeem Points at POS Checkout',
    labelKu: 'گۆڕینەوەی خاڵی کڕیار بە خەڵات یان داشکاندن',
    labelAr: 'استبدال نقاط الولاء بخصومات للزبون',
    description: 'Apply customer loyalty points to discount purchase invoices.',
    category: 'customers',
    dangerLevel: 'low'
  },

  // SMS Gateway
  {
    key: 'sms:send',
    label: 'Send Customer SMS Notifications',
    labelKu: 'ناردنی نامەی SMS بۆ کڕیاران',
    labelAr: 'إرسال رسائل SMS للزبائن والموظفين',
    description: 'Dispatch instant SMS receipts, repair status notifications, and manual alerts.',
    category: 'sms',
    dangerLevel: 'low'
  },
  {
    key: 'sms:configure',
    label: 'Configure SMS Gateway & Triggers',
    labelKu: 'ڕێکخستنی دەروازەی SMS و شێوازی نامەکان',
    labelAr: 'إعداد بوابة SMS والتنبيهات التلقائية',
    description: 'Update API keys, sender ID, webhook integrations, and automated alert templates.',
    category: 'sms',
    dangerLevel: 'medium'
  },

  // Reports & Analytics
  {
    key: 'reports:view_financial',
    label: 'View Financial Revenue & Net Profit',
    labelKu: 'بینینی قازانج و داهاتی فرۆشگا',
    labelAr: 'عرض الإيرادات المالية وصافي الأرباح',
    description: 'Access executive financial dashboards, profit margins, and daily registers.',
    category: 'reports',
    dangerLevel: 'high'
  },
  {
    key: 'reports:view_inventory',
    label: 'View Stock Valuation & Fast-Moving Items',
    labelKu: 'بینینی ڕاپۆرتی بڕی کۆگا و کەلوپەلی خێرا',
    labelAr: 'عرض تقارير حركة المخزون وتقييم البضاعة',
    description: 'Track low-stock alerts, dead stock valuation, and bestselling item analytics.',
    category: 'reports',
    dangerLevel: 'medium'
  },
  {
    key: 'reports:export',
    label: 'Export Data (CSV / Excel / PDF)',
    labelKu: 'دەرهێنانی داتا بە فایلی ئێکسڵ و CSV',
    labelAr: 'تصدير التقارير والبيانات (CSV / Excel)',
    description: 'Download sales registries, customer databases, and audit logs to spreadsheet files.',
    category: 'reports',
    dangerLevel: 'medium'
  },

  // Settings & Administration
  {
    key: 'settings:store_profile',
    label: 'Edit Store Profile & Branches',
    labelKu: 'دەستکاری ناونیشان و لقی فرۆشگا',
    labelAr: 'تعديل ملف المتجر والفروع ومعلومات الاتصال',
    description: 'Modify store business name, phone, invoice header logo, currency, and branches.',
    category: 'settings',
    dangerLevel: 'medium'
  },
  {
    key: 'settings:permissions',
    label: 'Manage Staff Roles & Access Matrix',
    labelKu: 'بەڕێوەبردنی ڕۆڵ و دەسەڵاتی کارمەندان',
    labelAr: 'إدارة صلاحيات الموظفين ومصفوفة الأدوار',
    description: 'Assign staff roles, customize permission matrices, and audit security.',
    category: 'settings',
    dangerLevel: 'high'
  },
  {
    key: 'settings:audit_logs',
    label: 'View Security Audit Trail',
    labelKu: 'بینینی تۆماری چاودێری و پارێزگاری سیستم',
    labelAr: 'عرض سجل التدقيق الأمني وتتبع العمليات',
    description: 'Inspect chronological system logs of who changed prices, stock, or permissions.',
    category: 'settings',
    dangerLevel: 'medium'
  },
  {
    key: 'subscription:manage',
    label: 'Manage Subscription & Plan Upgrades',
    labelKu: 'بەڕێوەبردنی ئابوونە و نوێکردنەوەی پلانی ساڵانە',
    labelAr: 'إدارة خطة الاشتراك والترقية والفواتير',
    description: 'Upgrade SaaS tier, apply promo discount codes, and view billing invoices.',
    category: 'settings',
    dangerLevel: 'high'
  }
];

// Default Permission Sets per Role
export const DEFAULT_ROLE_PERMISSIONS: Record<UserRole, PermissionKey[]> = {
  superadmin: PERMISSION_DEFINITIONS.map(p => p.key),
  owner: PERMISSION_DEFINITIONS.map(p => p.key),
  manager: [
    'pos:access',
    'pos:discount',
    'pos:custom_price',
    'sales:view_all',
    'sales:view_own',
    'sales:refund_void',
    'products:view',
    'products:view_cost_price',
    'products:create',
    'products:edit',
    'products:delete',
    'inventory:adjust_stock',
    'returns:view',
    'returns:create',
    'returns:settle',
    'returns:suppliers_manage',
    'customers:view',
    'customers:manage',
    'customers:give_credit',
    'loyalty:manage',
    'loyalty:redeem',
    'sms:send',
    'sms:configure',
    'reports:view_financial',
    'reports:view_inventory',
    'reports:export',
    'settings:store_profile',
    'settings:audit_logs'
  ],
  cashier: [
    'pos:access',
    'pos:discount',
    'sales:view_own',
    'products:view',
    'customers:view',
    'customers:manage',
    'loyalty:redeem',
    'sms:send'
  ],
  technician: [
    'products:view',
    'inventory:adjust_stock',
    'returns:view',
    'returns:create',
    'returns:settle',
    'customers:view',
    'sales:view_own',
    'sms:send'
  ],
  inventory_clerk: [
    'products:view',
    'products:view_cost_price',
    'products:create',
    'products:edit',
    'inventory:adjust_stock',
    'returns:view',
    'returns:create',
    'returns:suppliers_manage',
    'reports:view_inventory',
    'reports:export'
  ],
  customer: [
    'sales:view_own',
    'loyalty:redeem'
  ]
};

// Route to Permission Mapping
export const ROUTE_PERMISSION_MAP: Record<string, PermissionKey[]> = {
  '/dashboard': ['sales:view_all', 'sales:view_own', 'reports:view_financial', 'products:view'],
  '/pos': ['pos:access'],
  '/products': ['products:view'],
  '/customers': ['customers:view'],
  '/sales': ['sales:view_all', 'sales:view_own'],
  '/reports': ['reports:view_financial', 'reports:view_inventory'],
  '/loyalty': ['loyalty:manage', 'loyalty:redeem'],
  '/sms': ['sms:send', 'sms:configure'],
  '/supplier-returns': ['returns:view'],
  '/backups': ['reports:export', 'settings:store_profile', 'settings:permissions'],
  '/subscription': ['subscription:manage'],
  '/settings': ['settings:store_profile', 'settings:permissions', 'settings:audit_logs']
};

/**
 * Check if user role or specific custom permissions allows a given permission key
 */
export function hasPermission(
  role: UserRole | string | undefined,
  permission: PermissionKey,
  customMatrix?: Record<string, PermissionKey[]>,
  customUserPermissions?: PermissionKey[]
): boolean {
  if (!role) return false;
  if (role === 'superadmin' || role === 'owner') return true;

  // Check custom individual user overrides first if provided
  if (customUserPermissions && customUserPermissions.length > 0) {
    if (customUserPermissions.includes(permission)) return true;
  }

  // Check store-level role configuration if customized
  if (customMatrix && customMatrix[role]) {
    return customMatrix[role].includes(permission);
  }

  // Fallback to default role permissions
  const defaults = DEFAULT_ROLE_PERMISSIONS[role as UserRole];
  if (!defaults) return false;
  return defaults.includes(permission);
}

/**
 * Determine if a user can access a route path
 */
export function canAccessRoute(
  role: UserRole | string | undefined,
  routePath: string,
  customMatrix?: Record<string, PermissionKey[]>,
  customUserPermissions?: PermissionKey[]
): boolean {
  if (!role) return false;
  if (role === 'superadmin' || role === 'owner') return true;

  // Clean route path (remove trailing slash or params)
  const cleanPath = '/' + routePath.replace(/^\//, '').split('/')[0];
  const requiredPermissions = ROUTE_PERMISSION_MAP[cleanPath];

  // If route is not explicitly mapped or has empty requirements, allow access
  if (!requiredPermissions || requiredPermissions.length === 0) return true;

  // User must have AT LEAST ONE of the matching route permissions
  return requiredPermissions.some(perm => 
    hasPermission(role, perm, customMatrix, customUserPermissions)
  );
}

/**
 * Get default starting landing route based on user's authorized role
 */
export function getDefaultFallbackRoute(
  role: UserRole | string | undefined,
  customMatrix?: Record<string, PermissionKey[]>,
  customUserPermissions?: PermissionKey[]
): string {
  if (!role) return '/login';
  if (role === 'superadmin' || role === 'owner' || role === 'manager') return '/dashboard';
  if (role === 'cashier') return '/pos';
  if (role === 'inventory_clerk') return '/products';
  if (role === 'technician') return '/supplier-returns';

  // Check where the user has permission
  if (canAccessRoute(role, '/dashboard', customMatrix, customUserPermissions)) return '/dashboard';
  if (canAccessRoute(role, '/pos', customMatrix, customUserPermissions)) return '/pos';
  if (canAccessRoute(role, '/products', customMatrix, customUserPermissions)) return '/products';

  return '/pos';
}
