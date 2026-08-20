import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, where, onSnapshot, orderBy } from 'firebase/firestore';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import { SupplierReturn, AuditLog } from '../../types';
import { 
  RETURN_STATUSES, 
  RETURN_REASONS, 
  SETTLEMENT_TYPES, 
  ITEM_CONDITIONS,
  updateReturnStatus, 
  restoreInventoryForReturn 
} from '../../lib/supplierReturnService';
import DebitNotePrintModal from './DebitNotePrintModal';
import { 
  X, 
  Printer, 
  Truck, 
  Package, 
  CheckCircle2, 
  XCircle, 
  RotateCcw, 
  Clock, 
  Building2, 
  Barcode, 
  DollarSign, 
  ShieldAlert,
  ArrowRight,
  Send,
  HelpCircle,
  FileText
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ReturnDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnDoc: SupplierReturn | null;
  onReturnUpdated?: () => void;
}

export default function ReturnDetailsModal({
  isOpen,
  onClose,
  returnDoc,
  onReturnUpdated
}: ReturnDetailsModalProps) {
  const { store } = useStore();
  const { user, profile } = useAuth();

  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [loadingLogs, setLoadingLogs] = useState(true);
  const [isPrintModalOpen, setIsPrintModalOpen] = useState(false);

  // Status Action Modal State
  const [actionType, setActionType] = useState<string | null>(null);
  const [trackingInput, setTrackingInput] = useState('');
  const [courierInput, setCourierInput] = useState('');
  const [settlementAmountInput, setSettlementAmountInput] = useState<number>(0);
  const [rejectionReasonInput, setRejectionReasonInput] = useState('');
  const [actionNotes, setActionNotes] = useState('');
  const [processing, setProcessing] = useState(false);
  const [actionError, setActionError] = useState<string | null>(null);

  // Real-time audit logs for this return record
  useEffect(() => {
    if (!store?.id || !returnDoc?.id) return;

    const q = query(
      collection(db, `stores/${store.id}/audit_logs`),
      where('entityId', '==', returnDoc.id)
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const logs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as AuditLog));
      logs.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setAuditLogs(logs);
      setLoadingLogs(false);
    });

    return () => unsubscribe();
  }, [store?.id, returnDoc?.id]);

  useEffect(() => {
    if (returnDoc) {
      setSettlementAmountInput(returnDoc.settlementAmount || returnDoc.totalCost);
      setTrackingInput(returnDoc.trackingNumber || '');
      setCourierInput(returnDoc.courierName || '');
    }
  }, [returnDoc]);

  if (!isOpen || !returnDoc) return null;

  const currentStatusObj = RETURN_STATUSES.find(s => s.id === returnDoc.status) || RETURN_STATUSES[0];
  const reasonObj = RETURN_REASONS.find(r => r.id === returnDoc.reason);
  const settlementObj = SETTLEMENT_TYPES.find(s => s.id === returnDoc.settlementType);

  const handleStatusTransition = async (newStatus: any) => {
    if (!store?.id) return;
    setProcessing(true);
    setActionError(null);

    try {
      await updateReturnStatus(store.id, returnDoc, newStatus, {
        trackingNumber: trackingInput || undefined,
        courierName: courierInput || undefined,
        settlementAmount: settlementAmountInput,
        rejectionReason: rejectionReasonInput || undefined,
        notes: actionNotes || undefined,
        userProfile: {
          uid: user?.uid || '',
          displayName: profile?.displayName || user?.email || 'Store Staff',
          email: user?.email || '',
          role: profile?.role
        }
      });

      setActionType(null);
      if (onReturnUpdated) onReturnUpdated();
    } catch (err: any) {
      console.error('Failed to update return status:', err);
      setActionError(err.message || 'Failed to update status.');
    } finally {
      setProcessing(false);
    }
  };

  const handleRestockInventory = async () => {
    if (!store?.id) return;
    setProcessing(true);
    setActionError(null);

    try {
      await restoreInventoryForReturn(store.id, returnDoc, {
        uid: user?.uid || '',
        displayName: profile?.displayName || user?.email || 'Store Staff',
        email: user?.email || '',
        role: profile?.role
      });
      setActionType(null);
      if (onReturnUpdated) onReturnUpdated();
    } catch (err: any) {
      console.error('Failed to restore inventory:', err);
      setActionError(err.message || 'Failed to restore stock.');
    } finally {
      setProcessing(false);
    }
  };

  return (
    <>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.96, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: 10 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-4"
        >
          {/* Header */}
          <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 via-indigo-950 to-gray-900 text-white">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
                <Package className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h2 className="text-lg font-black tracking-tight">{returnDoc.returnNumber}</h2>
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${currentStatusObj.bg} ${currentStatusObj.text} ${currentStatusObj.border}`}>
                    {currentStatusObj.defaultLabel}
                  </span>
                </div>
                <p className="text-xs text-gray-300">
                  Return to <span className="font-bold text-white">{returnDoc.supplierName}</span> • Created {new Date(returnDoc.createdAt).toLocaleDateString()}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                onClick={() => setIsPrintModalOpen(true)}
                className="bg-white/10 hover:bg-white/20 text-white px-3.5 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors"
              >
                <Printer className="w-4 h-4" />
                <span className="hidden sm:inline">Debit Note</span>
              </button>
              <button 
                onClick={onClose}
                className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Body Content */}
          <div className="flex-1 overflow-y-auto p-6 space-y-6">
            {actionError && (
              <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 font-medium">
                <ShieldAlert className="w-4 h-4 text-rose-500" />
                <span>{actionError}</span>
              </div>
            )}

            {/* Quick Summary Banner */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <span className="text-[10px] font-black uppercase text-gray-400 block">Total Claim Value</span>
                <span className="text-base font-black text-gray-900">${returnDoc.totalCost.toLocaleString()}</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <span className="text-[10px] font-black uppercase text-gray-400 block">Primary Reason</span>
                <span className="text-xs font-bold text-gray-800 line-clamp-1">{reasonObj?.defaultLabel || returnDoc.reason}</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <span className="text-[10px] font-black uppercase text-gray-400 block">Settlement Type</span>
                <span className="text-xs font-bold text-gray-800 line-clamp-1">{settlementObj?.defaultLabel || returnDoc.settlementType}</span>
              </div>
              <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-200">
                <span className="text-[10px] font-black uppercase text-gray-400 block">Inventory Status</span>
                <span className="text-xs font-bold flex items-center gap-1 text-indigo-700">
                  {returnDoc.autoInventoryDeducted ? 'Deducted from Stock' : 'Stock Intact'}
                </span>
              </div>
            </div>

            {/* Workflow Action Bar */}
            <div className="bg-indigo-50/70 border border-indigo-100 p-4 rounded-2xl">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
                <div className="flex items-center gap-2">
                  <Truck className="w-4 h-4 text-indigo-600" />
                  <span className="text-xs font-black uppercase tracking-wider text-indigo-950">
                    RMA Workflow Transitions
                  </span>
                </div>
                <span className="text-[11px] text-indigo-700 font-medium">
                  Current: <strong className="font-black capitalize">{returnDoc.status.replace(/_/g, ' ')}</strong>
                </span>
              </div>

              {/* Action Buttons Depending on State */}
              <div className="flex flex-wrap gap-2">
                {returnDoc.status === 'draft' && (
                  <button
                    onClick={() => handleStatusTransition('pending_approval')}
                    disabled={processing}
                    className="bg-amber-600 hover:bg-amber-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Submit for Approval
                  </button>
                )}

                {['draft', 'pending_approval'].includes(returnDoc.status) && (
                  <button
                    onClick={() => setActionType('ship')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <Truck className="w-3.5 h-3.5" />
                    Mark as Shipped to Vendor
                  </button>
                )}

                {returnDoc.status === 'shipped_to_supplier' && (
                  <button
                    onClick={() => handleStatusTransition('received_by_supplier')}
                    disabled={processing}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    Vendor Confirmed Receipt
                  </button>
                )}

                {!['resolved_credit', 'resolved_refund', 'resolved_replacement', 'rejected'].includes(returnDoc.status) && (
                  <>
                    <button
                      onClick={() => setActionType('settle_credit')}
                      className="bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Settle as Store Credit
                    </button>
                    <button
                      onClick={() => setActionType('settle_refund')}
                      className="bg-teal-600 hover:bg-teal-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <DollarSign className="w-3.5 h-3.5" />
                      Settle with Cash Refund
                    </button>
                    <button
                      onClick={() => handleStatusTransition('resolved_replacement')}
                      disabled={processing}
                      className="bg-purple-600 hover:bg-purple-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <RotateCcw className="w-3.5 h-3.5" />
                      Settle with Replacement Units
                    </button>
                    <button
                      onClick={() => setActionType('reject')}
                      className="bg-rose-600 hover:bg-rose-700 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Reject Return
                    </button>
                  </>
                )}

                {/* Restock Inventory Button */}
                {returnDoc.autoInventoryDeducted && ['rejected', 'draft'].includes(returnDoc.status) && (
                  <button
                    onClick={handleRestockInventory}
                    disabled={processing}
                    className="bg-gray-900 hover:bg-black text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-sm"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    Restore Stock to Inventory
                  </button>
                )}
              </div>

              {/* Action Form Sub-panel */}
              <AnimatePresence>
                {actionType && (
                  <motion.div 
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="mt-4 pt-4 border-t border-indigo-200 bg-white p-4 rounded-xl space-y-3"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                        {actionType === 'ship' && 'Log Dispatch & Tracking Details'}
                        {actionType === 'settle_credit' && 'Confirm Vendor Account Credit Settlement'}
                        {actionType === 'settle_refund' && 'Confirm Direct Cash Refund Received'}
                        {actionType === 'reject' && 'Vendor Rejection Reason'}
                      </h4>
                      <button 
                        type="button" 
                        onClick={() => setActionType(null)} 
                        className="text-gray-400 hover:text-gray-600 text-xs"
                      >
                        Cancel
                      </button>
                    </div>

                    {actionType === 'ship' && (
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Courier / Carrier</label>
                          <input 
                            type="text"
                            value={courierInput}
                            onChange={(e) => setCourierInput(e.target.value)}
                            placeholder="e.g. DHL, Erbil Express, Local Driver"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs"
                          />
                        </div>
                        <div>
                          <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Tracking Code</label>
                          <input 
                            type="text"
                            value={trackingInput}
                            onChange={(e) => setTrackingInput(e.target.value)}
                            placeholder="e.g. TRK-9921094"
                            className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs"
                          />
                        </div>
                      </div>
                    )}

                    {(actionType === 'settle_credit' || actionType === 'settle_refund') && (
                      <div className="text-xs space-y-2">
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Settled Amount ($)</label>
                        <input 
                          type="number"
                          value={settlementAmountInput}
                          onChange={(e) => setSettlementAmountInput(parseFloat(e.target.value) || 0)}
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs font-bold"
                        />
                        <p className="text-[11px] text-gray-500">
                          {actionType === 'settle_credit' 
                            ? `This will add $${settlementAmountInput.toLocaleString()} to ${returnDoc.supplierName}'s credit balance.`
                            : `Record cash refund of $${settlementAmountInput.toLocaleString()} into store ledger.`}
                        </p>
                      </div>
                    )}

                    {actionType === 'reject' && (
                      <div className="text-xs space-y-2">
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Vendor Rejection Details</label>
                        <input 
                          type="text"
                          value={rejectionReasonInput}
                          onChange={(e) => setRejectionReasonInput(e.target.value)}
                          placeholder="e.g. Warranty void due to liquid damage, warranty expired..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-lg p-2 text-xs"
                        />
                      </div>
                    )}

                    <div className="flex justify-end gap-2 pt-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (actionType === 'ship') handleStatusTransition('shipped_to_supplier');
                          if (actionType === 'settle_credit') handleStatusTransition('resolved_credit');
                          if (actionType === 'settle_refund') handleStatusTransition('resolved_refund');
                          if (actionType === 'reject') handleStatusTransition('rejected');
                        }}
                        disabled={processing}
                        className="bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider"
                      >
                        {processing ? 'Saving...' : 'Confirm & Update'}
                      </button>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Line Items List */}
            <div className="space-y-3">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
                Returned Products ({returnDoc.items.length})
              </h3>
              <div className="divide-y divide-gray-100 border border-gray-200 rounded-2xl overflow-hidden bg-white">
                {returnDoc.items.map((item, idx) => (
                  <div key={item.id || idx} className="p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-sm text-gray-900">{item.productName}</span>
                        <span className="bg-gray-100 text-gray-700 text-[10px] px-2 py-0.5 rounded font-medium">
                          {item.brand}
                        </span>
                        <span className="text-[10px] capitalize bg-amber-50 text-amber-700 border border-amber-200 px-2 py-0.5 rounded font-medium">
                          {item.condition.replace(/_/g, ' ')}
                        </span>
                      </div>
                      {item.faultDescription && (
                        <p className="text-xs text-rose-600 font-medium">{item.faultDescription}</p>
                      )}
                      {item.imeis && item.imeis.length > 0 && item.imeis[0] !== '' && (
                        <div className="flex flex-wrap gap-1 pt-1">
                          {item.imeis.map((imei, iIdx) => (
                            <span key={iIdx} className="bg-gray-50 text-gray-700 text-[10px] font-mono px-2 py-0.5 rounded border border-gray-200">
                              SN: {imei}
                            </span>
                          ))}
                        </div>
                      )}
                    </div>

                    <div className="text-left sm:text-right border-t sm:border-t-0 pt-2 sm:pt-0 border-gray-100">
                      <p className="text-xs text-gray-500">
                        {item.quantity} unit(s) × ${item.unitCost?.toLocaleString() || 0}
                      </p>
                      <p className="text-sm font-black text-indigo-900">${(item.totalCost || 0).toLocaleString()}</p>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audit Log Timeline */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4 text-indigo-600" />
                  <h3 className="text-xs font-black uppercase tracking-wider text-gray-700">
                    Audit Trail & History ({auditLogs.length})
                  </h3>
                </div>
              </div>

              {loadingLogs ? (
                <div className="text-center py-6 text-xs text-gray-400">Loading audit history...</div>
              ) : auditLogs.length === 0 ? (
                <div className="text-center py-4 bg-gray-50 rounded-2xl border border-gray-200 text-xs text-gray-400">
                  No previous audit actions recorded yet.
                </div>
              ) : (
                <div className="space-y-2">
                  {auditLogs.map((log) => (
                    <div key={log.id} className="bg-gray-50 border border-gray-200/80 p-3 rounded-2xl text-xs flex items-start gap-3">
                      <div className="w-6 h-6 rounded-full bg-indigo-100 text-indigo-700 flex items-center justify-center shrink-0 mt-0.5">
                        <FileText className="w-3 h-3" />
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <p className="font-bold text-gray-900">{log.title}</p>
                          <span className="text-[10px] text-gray-400 font-mono">
                            {new Date(log.createdAt).toLocaleString()}
                          </span>
                        </div>
                        {log.details && (
                          <p className="text-gray-600 mt-0.5 text-[11px] leading-relaxed">{log.details}</p>
                        )}
                        <p className="text-[10px] text-gray-400 mt-1">
                          By: <span className="font-semibold text-gray-700">{log.performedByName}</span> {log.role ? `(${log.role})` : ''}
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={() => setIsPrintModalOpen(true)}
              className="text-xs font-bold text-indigo-600 hover:text-indigo-800 flex items-center gap-1.5"
            >
              <Printer className="w-4 h-4" />
              Print RMA Delivery Slip
            </button>
            <button
              onClick={onClose}
              className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-bold"
            >
              Close
            </button>
          </div>
        </motion.div>
      </div>

      {/* Print Modal */}
      <DebitNotePrintModal 
        isOpen={isPrintModalOpen} 
        onClose={() => setIsPrintModalOpen(false)} 
        returnDoc={returnDoc} 
        store={store} 
      />
    </>
  );
}
