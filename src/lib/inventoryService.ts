import { Product, Sale } from '../types';

export interface LowStockAlert {
  id: string;
  productId: string;
  productName: string;
  category: string;
  currentStock: number;
  minStock: number;
  severity: 'critical' | 'warning';
  message: string;
  messageKu: string;
  messageAr: string;
  suggestedReorderQty: number;
  createdAt: string;
}

export interface TopSellingItem {
  productId: string;
  productName: string;
  category: string;
  brand: string;
  totalQuantitySold: number;
  totalRevenue: number;
  totalProfit: number;
  averageSalesPerDay: number;
  currentStock: number;
}

export interface SlowMovingItem {
  productId: string;
  productName: string;
  category: string;
  brand: string;
  currentStock: number;
  purchasePrice: number;
  sellingPrice: number;
  capitalLocked: number;
  daysWithoutSale: number;
  suggestedDiscountPercent: number;
}

export interface SmartForecastItem {
  productId: string;
  productName: string;
  category: string;
  brand: string;
  currentStock: number;
  dailyVelocity: number; // units sold per day over 30 days
  daysOfStockLeft: number;
  reorderPoint: number;
  suggestedReorderQty: number;
  confidenceScore: number; // e.g. 94%
  stockoutRisk: 'high' | 'medium' | 'low';
  trend: 'surging' | 'stable' | 'declining';
  estimatedOutDate: string;
  recommendedOrderDate: string;
}

/**
 * Service Layer: Checks product inventory levels against custom or minStock thresholds
 */
export function checkLowStockThresholds(
  products: Product[],
  globalThresholdOverride?: number
): LowStockAlert[] {
  const alerts: LowStockAlert[] = [];

  products.forEach((product) => {
    const threshold = globalThresholdOverride ?? (product.minStock || 5);
    if (product.stock <= threshold) {
      const isCritical = product.stock <= Math.max(1, Math.floor(threshold / 2));
      const needed = Math.max(10, threshold * 3 - product.stock);

      alerts.push({
        id: `alert_${product.id}_${Date.now()}`,
        productId: product.id,
        productName: product.name,
        category: product.category || 'General',
        currentStock: product.stock,
        minStock: threshold,
        severity: isCritical ? 'critical' : 'warning',
        message: isCritical 
          ? `Stock critically low (${product.stock} items left). Immediate reorder required.`
          : `Stock below threshold (${product.stock}/${threshold} items).`,
        messageKu: isCritical
          ? `عەمبار زۆر کەم بووەتەوە (${product.stock} دانە ماوە). پێویستی بە داواکردنەوەی خێرایە.`
          : `عەمبار لە خوار ئاستی دیاریکراوەوەیە (${product.stock}/${threshold} دانە).`,
        messageAr: isCritical
          ? `المخزون منخفض جداً (${product.stock} متبقية). يرجى 재إعادة الطلب فوراً.`
          : `المخزون أقل من الحد الأدنى (${product.stock}/${threshold}).`,
        suggestedReorderQty: needed,
        createdAt: new Date().toISOString()
      });
    }
  });

  return alerts.sort((a, b) => (a.severity === 'critical' ? -1 : 1));
}

/**
 * Calculates Top Selling Items based on sales history
 */
export function calculateTopSellingProducts(
  sales: Sale[],
  products: Product[],
  topN = 5
): TopSellingItem[] {
  const productSalesMap: Record<string, { qty: number; revenue: number; profit: number }> = {};

  sales.forEach((sale) => {
    sale.items?.forEach((item) => {
      const pId = item.id;
      if (!productSalesMap[pId]) {
        productSalesMap[pId] = { qty: 0, revenue: 0, profit: 0 };
      }
      const qty = item.quantity || 1;
      const rev = (item.price || 0) * qty;
      const profit = rev - ((item.purchasePrice || item.price * 0.7) * qty);

      productSalesMap[pId].qty += qty;
      productSalesMap[pId].revenue += rev;
      productSalesMap[pId].profit += profit;
    });
  });

  const result: TopSellingItem[] = [];

  products.forEach((p) => {
    const stats = productSalesMap[p.id] || { qty: 0, revenue: 0, profit: 0 };
    if (stats.qty > 0) {
      result.push({
        productId: p.id,
        productName: p.name,
        category: p.category || 'General',
        brand: p.brand || 'Generic',
        totalQuantitySold: stats.qty,
        totalRevenue: stats.revenue,
        totalProfit: stats.profit,
        averageSalesPerDay: Number((stats.qty / 30).toFixed(1)),
        currentStock: p.stock
      });
    }
  });

  // Sort by quantity sold descending
  return result
    .sort((a, b) => b.totalQuantitySold - a.totalQuantitySold)
    .slice(0, topN);
}

/**
 * Identifies Slow-Moving stock (> 30 days without sale or low turnover)
 */
export function calculateSlowMovingProducts(
  sales: Sale[],
  products: Product[],
  maxDaysWithoutSale = 30
): SlowMovingItem[] {
  const lastSoldDateMap: Record<string, Date> = {};

  sales.forEach((sale) => {
    const saleDate = new Date(sale.createdAt);
    sale.items?.forEach((item) => {
      const pId = item.id;
      if (!lastSoldDateMap[pId] || saleDate > lastSoldDateMap[pId]) {
        lastSoldDateMap[pId] = saleDate;
      }
    });
  });

  const now = new Date();
  const slowMovers: SlowMovingItem[] = [];

  products.forEach((p) => {
    // Only check items with stock > 0
    if (p.stock > 0) {
      const lastSold = lastSoldDateMap[p.id];
      let daysWithout = 45; // Default if never sold in recorded sales

      if (lastSold) {
        const diffMs = now.getTime() - lastSold.getTime();
        daysWithout = Math.floor(diffMs / (1000 * 60 * 60 * 24));
      }

      if (daysWithout >= maxDaysWithoutSale) {
        const locked = p.stock * (p.purchasePrice || p.sellingPrice * 0.7);
        let suggestedDiscount = 10;
        if (daysWithout > 60) suggestedDiscount = 20;
        if (daysWithout > 90) suggestedDiscount = 35;

        slowMovers.push({
          productId: p.id,
          productName: p.name,
          category: p.category || 'General',
          brand: p.brand || 'Generic',
          currentStock: p.stock,
          purchasePrice: p.purchasePrice || 0,
          sellingPrice: p.sellingPrice || 0,
          capitalLocked: Number(locked.toFixed(2)),
          daysWithoutSale: daysWithout,
          suggestedDiscountPercent: suggestedDiscount
        });
      }
    }
  });

  return slowMovers.sort((a, b) => b.capitalLocked - a.capitalLocked);
}

/**
 * Smart AI Inventory Velocity & Stock Replenishment Forecast
 */
export function calculateSmartForecasting(
  sales: Sale[],
  products: Product[],
  categoryFilter?: string
): SmartForecastItem[] {
  const filteredProducts = categoryFilter 
    ? products.filter(p => p.category?.toLowerCase() === categoryFilter.toLowerCase())
    : products;

  // Calculate 30-day sales volume for each product
  const thirtyDaysAgo = new Date();
  thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

  const productSales30Days: Record<string, number> = {};
  const productSales10Days: Record<string, number> = {};

  sales.forEach((s) => {
    const sDate = new Date(s.createdAt);
    if (sDate >= thirtyDaysAgo) {
      s.items?.forEach((item) => {
        const pId = item.id;
        const qty = item.quantity || 1;
        productSales30Days[pId] = (productSales30Days[pId] || 0) + qty;

        const tenDaysAgo = new Date();
        tenDaysAgo.setDate(tenDaysAgo.getDate() - 10);
        if (sDate >= tenDaysAgo) {
          productSales10Days[pId] = (productSales10Days[pId] || 0) + qty;
        }
      });
    }
  });

  const now = new Date();

  return filteredProducts.map((p) => {
    const sold30 = productSales30Days[p.id] || 0;
    const sold10 = productSales10Days[p.id] || 0;

    // Daily velocity calculation
    let dailyVelocity = sold30 / 30;
    if (dailyVelocity === 0 && p.stock > 0) {
      // Fallback estimate for active catalog items
      dailyVelocity = 0.2; // 1 unit every 5 days
    }

    const tenDayVelocity = sold10 / 10;
    let trend: 'surging' | 'stable' | 'declining' = 'stable';
    if (tenDayVelocity > dailyVelocity * 1.3) trend = 'surging';
    else if (tenDayVelocity < dailyVelocity * 0.7) trend = 'declining';

    // Velocity multiplier for surging trends
    const effectiveVelocity = trend === 'surging' ? dailyVelocity * 1.25 : dailyVelocity;

    const daysOfStockLeft = effectiveVelocity > 0 
      ? Math.floor(p.stock / effectiveVelocity) 
      : 999;

    const supplierLeadTimeDays = 5; // Standard delivery time from suppliers
    const reorderPoint = Math.ceil(effectiveVelocity * supplierLeadTimeDays + (p.minStock || 3));
    const targetStockBufferDays = 21; // 3 weeks of stock
    const suggestedReorderQty = Math.max(10, Math.ceil(effectiveVelocity * targetStockBufferDays - p.stock));

    let stockoutRisk: 'high' | 'medium' | 'low' = 'low';
    if (daysOfStockLeft <= 7) stockoutRisk = 'high';
    else if (daysOfStockLeft <= 14) stockoutRisk = 'medium';

    const outDate = new Date(now);
    outDate.setDate(outDate.getDate() + Math.min(daysOfStockLeft, 365));

    const orderDate = new Date(now);
    const daysToOrder = Math.max(0, daysOfStockLeft - supplierLeadTimeDays);
    orderDate.setDate(orderDate.getDate() + daysToOrder);

    // Confidence score calculation based on sales history consistency
    const confidenceScore = sold30 > 10 ? 94 : sold30 > 3 ? 82 : 70;

    return {
      productId: p.id,
      productName: p.name,
      category: p.category || 'Accessories',
      brand: p.brand || 'Generic',
      currentStock: p.stock,
      dailyVelocity: Number(effectiveVelocity.toFixed(2)),
      daysOfStockLeft,
      reorderPoint,
      suggestedReorderQty,
      confidenceScore,
      stockoutRisk,
      trend,
      estimatedOutDate: outDate.toISOString().split('T')[0],
      recommendedOrderDate: orderDate.toISOString().split('T')[0]
    };
  }).sort((a, b) => a.daysOfStockLeft - b.daysOfStockLeft);
}
