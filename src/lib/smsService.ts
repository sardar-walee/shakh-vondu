import { db } from './firebase';
import { 
  collection, 
  addDoc, 
  getDocs, 
  query, 
  where, 
  doc, 
  updateDoc 
} from 'firebase/firestore';
import { 
  SMSConfig, 
  SMSEventType, 
  SMSTemplate, 
  SMSLog, 
  Product, 
  Store, 
  InstallmentSchedule 
} from '../types';

export const DEFAULT_SMS_TEMPLATES: Record<SMSEventType, { title: string; body: string }> = {
  low_stock: {
    title: 'Low Stock Alert',
    body: '⚠️ [{{store_name}}] Low Stock Alert: Product "{{product_name}}" is down to {{stock_qty}} units! Minimum threshold is {{min_stock}}. Please reorder soon.'
  },
  expiring_subscription: {
    title: 'Subscription Expiry Alert',
    body: '🔔 [{{store_name}}] SaaS Notice: Your store subscription expires in {{days_left}} days on {{expiry_date}}. Renew today to keep uninterrupted service.'
  },
  expiring_warranty: {
    title: 'Warranty Expiry Reminder',
    body: '🛡️ [{{store_name}}] Warranty Notice: Dear {{customer_name}}, warranty for {{product_name}} (IMEI: {{imei}}) expires on {{warranty_date}}. Contact us for warranty service.'
  },
  upcoming_installment: {
    title: 'Upcoming Installment / Debt Reminder',
    body: '💳 [{{store_name}}] Payment Reminder: Dear {{customer_name}}, upcoming installment of ${{amount_due}} is due on {{due_date}}. Please visit us to settle.'
  },
  sale_receipt: {
    title: 'Purchase Receipt & Points',
    body: '🧾 [{{store_name}}] Thank you {{customer_name}}! Total: ${{total}}. Points earned: {{points_earned}} (Balance: {{new_balance}}). Invoice #{{invoice_id}}.'
  },
  custom: {
    title: 'Custom Announcement',
    body: '📢 [{{store_name}}] Hello {{customer_name}}, we have exciting new arrivals and special discounts waiting for you today!'
  }
};

export const DEFAULT_SMS_CONFIG: SMSConfig = {
  provider: 'twilio',
  senderId: 'MobiStore',
  isEnabled: true,
  autoLowStockAlert: true,
  autoSubscriptionAlert: true,
  autoWarrantyAlert: true,
  autoInstallmentAlert: true,
  managerPhone: '+9647501234567'
};

export function renderTemplate(template: string, variables: Record<string, string | number | undefined>): string {
  let result = template;
  for (const [key, value] of Object.entries(variables)) {
    const regex = new RegExp(`{{\\s*${key}\\s*}}`, 'g');
    result = result.replace(regex, String(value ?? ''));
  }
  return result;
}

export async function sendSMS(
  storeId: string,
  recipientPhone: string,
  message: string,
  eventType: SMSEventType | string,
  recipientName?: string,
  config?: SMSConfig
): Promise<{ success: boolean; messageId?: string; status: 'delivered' | 'sent' | 'failed' }> {
  try {
    const response = await fetch('/api/sms/send', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        storeId,
        recipientPhone,
        recipientName,
        message,
        eventType,
        config
      })
    });

    let data: any = {};
    try {
      const text = await response.text();
      data = text ? JSON.parse(text) : {};
    } catch (e) {
      console.warn("Non-JSON SMS endpoint response:", e);
    }

    const isSuccess = response.ok && (data.success !== false);
    const status = isSuccess ? 'delivered' : 'failed';

    // Store in Firestore logs
    await addDoc(collection(db, `stores/${storeId}/sms_logs`), {
      recipientPhone,
      recipientName: recipientName || 'Customer',
      eventType,
      message,
      status,
      gatewayResponse: data.gatewayResponse || (isSuccess ? 'Gateway accepted (200 OK)' : 'Failed: ' + (data.error || 'Server error')),
      createdAt: new Date().toISOString()
    });

    return {
      success: isSuccess,
      messageId: data.messageId || `sms_${Date.now()}`,
      status
    };
  } catch (error) {
    console.error('Error dispatching SMS:', error);
    
    // Save failed log
    try {
      await addDoc(collection(db, `stores/${storeId}/sms_logs`), {
        recipientPhone,
        recipientName: recipientName || 'Customer',
        eventType,
        message,
        status: 'failed',
        gatewayResponse: error instanceof Error ? error.message : 'Network error',
        createdAt: new Date().toISOString()
      });
    } catch (_) {}

    return { success: false, status: 'failed' };
  }
}

// ---------------- Automatic Key Event Trigger Scanners ----------------

// 1. Low Stock Scanner
export async function triggerLowStockCheck(store: Store, products: Product[], config?: SMSConfig) {
  const effectiveConfig = config || store.smsConfig || DEFAULT_SMS_CONFIG;
  if (!effectiveConfig.isEnabled || !effectiveConfig.autoLowStockAlert) return { triggered: 0 };

  const lowStockItems = products.filter(p => p.stock <= (p.minStock ?? 5));
  let count = 0;

  for (const product of lowStockItems) {
    const msg = renderTemplate(DEFAULT_SMS_TEMPLATES.low_stock.body, {
      store_name: store.name,
      product_name: product.name,
      stock_qty: product.stock,
      min_stock: product.minStock ?? 5
    });

    const targetPhone = effectiveConfig.managerPhone || store.phone || '+9647500000000';
    await sendSMS(store.id, targetPhone, msg, 'low_stock', `${store.name} Manager`, effectiveConfig);
    count++;
  }

  return { triggered: count };
}

// 2. Expiring Subscription Scanner
export async function triggerSubscriptionExpiryCheck(store: Store, config?: SMSConfig) {
  const effectiveConfig = config || store.smsConfig || DEFAULT_SMS_CONFIG;
  if (!effectiveConfig.isEnabled || !effectiveConfig.autoSubscriptionAlert) return { triggered: false };

  const targetDateStr = store.subscriptionEndDate || store.trialEndDate;
  if (!targetDateStr) return { triggered: false };

  const targetDate = new Date(targetDateStr);
  const now = new Date();
  const diffDays = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

  if (diffDays <= 7 && diffDays >= 0) {
    const msg = renderTemplate(DEFAULT_SMS_TEMPLATES.expiring_subscription.body, {
      store_name: store.name,
      days_left: diffDays,
      expiry_date: targetDate.toLocaleDateString()
    });

    const targetPhone = effectiveConfig.managerPhone || store.phone || '+9647500000000';
    await sendSMS(store.id, targetPhone, msg, 'expiring_subscription', store.name, effectiveConfig);
    return { triggered: true, daysLeft: diffDays };
  }

  return { triggered: false };
}

// 3. Expiring Warranties Scanner
export async function triggerWarrantyExpiryAlert(
  storeId: string, 
  storeName: string, 
  customerName: string, 
  customerPhone: string, 
  productName: string, 
  imei: string, 
  warrantyDate: string,
  config?: SMSConfig
) {
  const msg = renderTemplate(DEFAULT_SMS_TEMPLATES.expiring_warranty.body, {
    store_name: storeName,
    customer_name: customerName,
    product_name: productName,
    imei,
    warranty_date: warrantyDate
  });

  return await sendSMS(storeId, customerPhone, msg, 'expiring_warranty', customerName, config);
}

// 4. Upcoming Installment Payment Scanner
export async function triggerInstallmentAlert(
  storeId: string,
  storeName: string,
  customerName: string,
  customerPhone: string,
  amountDue: number,
  dueDate: string,
  config?: SMSConfig
) {
  const msg = renderTemplate(DEFAULT_SMS_TEMPLATES.upcoming_installment.body, {
    store_name: storeName,
    customer_name: customerName,
    amount_due: amountDue,
    due_date: dueDate
  });

  return await sendSMS(storeId, customerPhone, msg, 'upcoming_installment', customerName, config);
}
