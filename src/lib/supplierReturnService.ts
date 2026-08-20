import { 
  collection, 
  doc, 
  getDoc, 
  addDoc, 
  updateDoc, 
  increment, 
  writeBatch,
  getDocs,
  query,
  where
} from 'firebase/firestore';
import { db, auth } from './firebase';
import { 
  Supplier, 
  SupplierReturn, 
  SupplierReturnItem, 
  ReturnReason, 
  ReturnSettlement, 
  ReturnStatus, 
  ItemCondition 
} from '../types';
import { logAuditEvent, handleFirestoreError, OperationType } from './auditService';

export const DEFAULT_SUPPLIERS: Omit<Supplier, 'id'>[] = [
  {
    name: 'Dubai GSM International LLC',
    contactPerson: 'Farhan Al-Hashemi',
    phone: '+971 50 123 4567',
    email: 'returns@dubaigsm.ae',
    address: 'Deira Wholesale Electronics Market, Dubai, UAE',
    companyName: 'Dubai GSM Trading LLC',
    creditBalance: 0,
    totalReturnsCount: 0,
    notes: 'Official distributor for Apple, Samsung, and Xiaomi flagship devices.'
  },
  {
    name: 'Erbil Tech Global Distribution',
    contactPerson: 'Sardar Rostam',
    phone: '+964 750 445 8899',
    email: 'rma@erbiltechglobal.com',
    address: 'Sultan Muthafar St, Erbil, Kurdistan Region, Iraq',
    companyName: 'Erbil Tech Distribution Co.',
    creditBalance: 0,
    totalReturnsCount: 0,
    notes: 'Local regional warehouse with 48-hour RMA replacement policy.'
  },
  {
    name: 'Baghdad Smart Telecom Supply',
    contactPerson: 'Ali Al-Khafaji',
    phone: '+964 770 982 1100',
    email: 'support@baghdadtelecom.iq',
    address: 'Al-Sinaa Street, Baghdad, Iraq',
    companyName: 'Smart Telecom Wholesale',
    creditBalance: 0,
    totalReturnsCount: 0,
    notes: 'Accessories, screen protectors, OEM batteries, and repair components.'
  },
  {
    name: 'Ankara Mobile & Parts Hub',
    contactPerson: 'Emre Yılmaz',
    phone: '+90 532 991 2233',
    email: 'returns@ankaraparts.com.tr',
    address: 'Kızılay Electronics Arcade, Ankara, Turkey',
    companyName: 'Yılmazlar Teknoloji A.Ş.',
    creditBalance: 0,
    totalReturnsCount: 0,
    notes: 'Direct supplier for spare parts, displays, motherboards and cases.'
  }
];

export function generateRMANumber(): string {
  const date = new Date();
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  const randomSuffix = Math.floor(1000 + Math.random() * 9000);
  return `RMA-${year}${month}${day}-${randomSuffix}`;
}

export const RETURN_REASONS: { id: ReturnReason; labelKey: string; defaultLabel: string; color: string }[] = [
  { id: 'damaged_on_arrival', labelKey: 'reason_damaged_arrival', defaultLabel: 'Damaged on Arrival (DOA)', color: 'red' },
  { id: 'screen_hardware_fault', labelKey: 'reason_hardware_fault', defaultLabel: 'Hardware / Screen Defect', color: 'amber' },
  { id: 'excess_stock', labelKey: 'reason_excess_stock', defaultLabel: 'Excess / Overstock Return', color: 'blue' },
  { id: 'wrong_item_shipped', labelKey: 'reason_wrong_item', defaultLabel: 'Wrong Item Supplied', color: 'purple' },
  { id: 'recall_manufacturer', labelKey: 'reason_recall', defaultLabel: 'Manufacturer Recall', color: 'orange' },
  { id: 'customer_return_to_vendor', labelKey: 'reason_customer_return', defaultLabel: 'Customer Warranty Return (RTV)', color: 'emerald' },
];

export const SETTLEMENT_TYPES: { id: ReturnSettlement; labelKey: string; defaultLabel: string }[] = [
  { id: 'supplier_credit', labelKey: 'settlement_credit', defaultLabel: 'Supplier Account Credit Balance' },
  { id: 'cash_refund', labelKey: 'settlement_cash', defaultLabel: 'Direct Cash / Wire Refund' },
  { id: 'replacement_stock', labelKey: 'settlement_replacement', defaultLabel: 'New Replacement Units' },
  { id: 'pending_inspection', labelKey: 'settlement_inspection', defaultLabel: 'Awaiting Vendor Inspection' },
];

export const RETURN_STATUSES: { id: ReturnStatus; labelKey: string; defaultLabel: string; bg: string; text: string; border: string }[] = [
  { id: 'draft', labelKey: 'status_draft', defaultLabel: 'Draft', bg: 'bg-gray-100', text: 'text-gray-700', border: 'border-gray-300' },
  { id: 'pending_approval', labelKey: 'status_pending_approval', defaultLabel: 'Pending Approval', bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  { id: 'shipped_to_supplier', labelKey: 'status_shipped', defaultLabel: 'Shipped to Vendor', bg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200' },
  { id: 'received_by_supplier', labelKey: 'status_received', defaultLabel: 'Received by Vendor', bg: 'bg-indigo-50', text: 'text-indigo-700', border: 'border-indigo-200' },
  { id: 'resolved_credit', labelKey: 'status_resolved_credit', defaultLabel: 'Settled (Store Credit)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'resolved_refund', labelKey: 'status_resolved_refund', defaultLabel: 'Settled (Cash Refunded)', bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  { id: 'resolved_replacement', labelKey: 'status_resolved_replacement', defaultLabel: 'Settled (Replaced)', bg: 'bg-teal-50', text: 'text-teal-700', border: 'border-teal-200' },
  { id: 'rejected', labelKey: 'status_rejected', defaultLabel: 'Rejected by Vendor', bg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200' },
];

export const ITEM_CONDITIONS: { id: ItemCondition; labelKey: string; defaultLabel: string }[] = [
  { id: 'new_sealed', labelKey: 'condition_sealed', defaultLabel: 'Brand New (Factory Sealed)' },
  { id: 'open_box', labelKey: 'condition_open_box', defaultLabel: 'Open Box / Unused' },
  { id: 'damaged_cracked', labelKey: 'condition_damaged', defaultLabel: 'Physically Damaged / Broken' },
  { id: 'defective_hardware', labelKey: 'condition_defective', defaultLabel: 'Defective Internal Hardware' },
  { id: 'missing_accessories', labelKey: 'condition_missing', defaultLabel: 'Incomplete / Missing Parts' },
];

/**
 * Seed initial sample suppliers if store doesn't have any yet
 */
export async function seedSampleSuppliersIfEmpty(storeId: string): Promise<void> {
  if (!storeId) return;
  const path = `stores/${storeId}/suppliers`;
  try {
    const snap = await getDocs(collection(db, path));
    if (snap.empty) {
      const batch = writeBatch(db);
      for (const s of DEFAULT_SUPPLIERS) {
        const newRef = doc(collection(db, path));
        batch.set(newRef, {
          ...s,
          createdAt: new Date().toISOString()
        });
      }
      await batch.commit();
      
      await logAuditEvent(storeId, {
        entityType: 'supplier',
        entityId: 'seed',
        action: 'created',
        title: 'Initialized default supplier directory',
        details: `Created ${DEFAULT_SUPPLIERS.length} default regional wholesale supplier contacts.`
      });
    }
  } catch (error) {
    console.error('Error seeding suppliers:', error);
  }
}

/**
 * Create a new Supplier Return record and adjust product inventory & IMEIs
 */
export async function createSupplierReturn(
  storeId: string,
  returnData: Omit<SupplierReturn, 'id' | 'createdAt' | 'updatedAt'>,
  userProfile?: { uid: string; displayName?: string; email?: string; role?: string }
): Promise<string> {
  const returnPath = `stores/${storeId}/supplier_returns`;
  
  try {
    const returnNumber = returnData.returnNumber || generateRMANumber();
    const now = new Date().toISOString();

    const newReturn: Omit<SupplierReturn, 'id'> = {
      ...returnData,
      returnNumber,
      createdAt: now,
      updatedAt: now,
      createdBy: userProfile?.uid || auth.currentUser?.uid || 'unknown',
      createdByName: userProfile?.displayName || userProfile?.email || auth.currentUser?.displayName || auth.currentUser?.email || 'Store Staff',
    };

    // Use a batch to write return doc and adjust inventory atomically
    const batch = writeBatch(db);
    const returnDocRef = doc(collection(db, returnPath));
    batch.set(returnDocRef, newReturn);

    // If autoInventoryDeducted is true, decrement stock from products
    if (returnData.autoInventoryDeducted && returnData.items && returnData.items.length > 0) {
      for (const item of returnData.items) {
        if (item.productId && item.quantity > 0) {
          const productRef = doc(db, `stores/${storeId}/products/${item.productId}`);
          batch.update(productRef, {
            stock: increment(-item.quantity)
          });
        }
      }
    }

    // Increment supplier returns counter
    if (returnData.supplierId) {
      const supplierRef = doc(db, `stores/${storeId}/suppliers/${returnData.supplierId}`);
      batch.update(supplierRef, {
        totalReturnsCount: increment(1)
      });
    }

    await batch.commit();

    // Log comprehensive audit trail
    await logAuditEvent(storeId, {
      entityType: 'supplier_return',
      entityId: returnDocRef.id,
      action: 'created',
      title: `Created Supplier Return ${returnNumber}`,
      details: `Initiated return to "${returnData.supplierName}" for ${returnData.items.length} product(s) valued at $${returnData.totalCost.toLocaleString()} (${returnData.reason}). ${returnData.autoInventoryDeducted ? 'Stock automatically deducted from inventory.' : 'Stock not deducted yet.'}`,
      performedBy: userProfile?.uid,
      performedByName: userProfile?.displayName || userProfile?.email,
      role: userProfile?.role,
      changes: {
        status: { old: null, new: returnData.status },
        totalCost: { old: null, new: returnData.totalCost },
        itemsCount: { old: null, new: returnData.items.length },
        inventoryDeducted: { old: null, new: returnData.autoInventoryDeducted }
      }
    });

    return returnDocRef.id;
  } catch (error) {
    handleFirestoreError(error, OperationType.CREATE, returnPath);
    throw error;
  }
}

/**
 * Update Return status, handle settlement balances, and log audit trail
 */
export async function updateReturnStatus(
  storeId: string,
  returnDoc: SupplierReturn,
  newStatus: ReturnStatus,
  options?: {
    trackingNumber?: string;
    courierName?: string;
    settlementAmount?: number;
    rejectionReason?: string;
    notes?: string;
    userProfile?: { uid: string; displayName?: string; email?: string; role?: string };
  }
): Promise<void> {
  const returnPath = `stores/${storeId}/supplier_returns/${returnDoc.id}`;
  const now = new Date().toISOString();

  try {
    const batch = writeBatch(db);
    const returnRef = doc(db, returnPath);

    const updatePayload: Partial<SupplierReturn> = {
      status: newStatus,
      updatedAt: now,
    };

    if (options?.trackingNumber !== undefined) updatePayload.trackingNumber = options.trackingNumber;
    if (options?.courierName !== undefined) updatePayload.courierName = options.courierName;
    if (options?.rejectionReason !== undefined) updatePayload.rejectionReason = options.rejectionReason;
    if (options?.notes !== undefined) updatePayload.notes = options.notes;

    // Handle settlement
    const settlementAmount = options?.settlementAmount !== undefined ? options.settlementAmount : returnDoc.totalCost;
    if (['resolved_credit', 'resolved_refund', 'resolved_replacement'].includes(newStatus)) {
      updatePayload.settledAt = now;
      updatePayload.settlementAmount = settlementAmount;

      // If settled as store credit, increment supplier's creditBalance
      if (newStatus === 'resolved_credit' && returnDoc.supplierId) {
        const supplierRef = doc(db, `stores/${storeId}/suppliers/${returnDoc.supplierId}`);
        batch.update(supplierRef, {
          creditBalance: increment(settlementAmount)
        });
      }
    }

    batch.update(returnRef, updatePayload);
    await batch.commit();

    // Log audit event
    await logAuditEvent(storeId, {
      entityType: 'supplier_return',
      entityId: returnDoc.id,
      action: 'status_changed',
      title: `Return ${returnDoc.returnNumber} status updated to ${newStatus.toUpperCase()}`,
      details: `Status transitioned from ${returnDoc.status} to ${newStatus}.${options?.notes ? ` Note: ${options.notes}` : ''}${options?.rejectionReason ? ` Reason: ${options.rejectionReason}` : ''}${options?.trackingNumber ? ` Tracking: ${options.trackingNumber} (${options.courierName || 'Courier'})` : ''}`,
      performedBy: options?.userProfile?.uid,
      performedByName: options?.userProfile?.displayName || options?.userProfile?.email,
      role: options?.userProfile?.role,
      changes: {
        status: { old: returnDoc.status, new: newStatus },
        settlementAmount: { old: returnDoc.settlementAmount || 0, new: settlementAmount }
      }
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, returnPath);
    throw error;
  }
}

/**
 * Restores product inventory in case a return is rejected or cancelled by supplier
 */
export async function restoreInventoryForReturn(
  storeId: string,
  returnDoc: SupplierReturn,
  userProfile?: { uid: string; displayName?: string; email?: string; role?: string }
): Promise<void> {
  const returnPath = `stores/${storeId}/supplier_returns/${returnDoc.id}`;

  try {
    if (!returnDoc.autoInventoryDeducted) {
      throw new Error('Inventory was not deducted for this return record.');
    }

    const batch = writeBatch(db);

    // Restore stock to all products in the return
    for (const item of returnDoc.items) {
      if (item.productId && item.quantity > 0) {
        const productRef = doc(db, `stores/${storeId}/products/${item.productId}`);
        batch.update(productRef, {
          stock: increment(item.quantity)
        });
      }
    }

    // Mark return document as having inventory restored (set autoInventoryDeducted to false)
    const returnRef = doc(db, returnPath);
    batch.update(returnRef, {
      autoInventoryDeducted: false,
      updatedAt: new Date().toISOString(),
      notes: (returnDoc.notes ? returnDoc.notes + '\n' : '') + `[Restocked]: Stock quantities restored to inventory on ${new Date().toLocaleDateString()}`
    });

    await batch.commit();

    await logAuditEvent(storeId, {
      entityType: 'inventory',
      entityId: returnDoc.id,
      action: 'inventory_restored',
      title: `Restored inventory from RMA ${returnDoc.returnNumber}`,
      details: `Restocked ${returnDoc.items.length} items back to product inventory following rejection or cancellation.`,
      performedBy: userProfile?.uid,
      performedByName: userProfile?.displayName || userProfile?.email,
      role: userProfile?.role
    });
  } catch (error) {
    handleFirestoreError(error, OperationType.UPDATE, returnPath);
    throw error;
  }
}
