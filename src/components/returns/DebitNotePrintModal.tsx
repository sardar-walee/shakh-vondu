import React from 'react';
import { SupplierReturn, Store } from '../../types';
import { 
  X, 
  Printer, 
  Download, 
  Building2, 
  Truck, 
  Barcode, 
  Calendar, 
  CheckCircle2, 
  ShieldAlert 
} from 'lucide-react';
import { motion } from 'motion/react';
import { RETURN_REASONS, SETTLEMENT_TYPES } from '../../lib/supplierReturnService';

interface DebitNotePrintModalProps {
  isOpen: boolean;
  onClose: () => void;
  returnDoc: SupplierReturn;
  store: Store | null;
}

export default function DebitNotePrintModal({
  isOpen,
  onClose,
  returnDoc,
  store
}: DebitNotePrintModalProps) {
  if (!isOpen || !returnDoc) return null;

  const handlePrint = () => {
    window.print();
  };

  const reasonInfo = RETURN_REASONS.find(r => r.id === returnDoc.reason);
  const settlementInfo = SETTLEMENT_TYPES.find(s => s.id === returnDoc.settlementType);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto print:p-0 print:bg-white">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-200 max-w-3xl w-full max-h-[95vh] flex flex-col overflow-hidden my-4 print:max-h-none print:shadow-none print:border-none print:rounded-none"
      >
        {/* Modal Action Bar (Hidden when printing) */}
        <div className="px-6 py-4 bg-gray-900 text-white flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <Printer className="w-5 h-5 text-indigo-400" />
            <span className="font-bold text-sm">Supplier Debit Note / RMA Delivery Voucher</span>
          </div>
          <div className="flex items-center gap-3">
            <button
              onClick={handlePrint}
              className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider flex items-center gap-2 transition-all shadow-md"
            >
              <Printer className="w-4 h-4" />
              Print Voucher
            </button>
            <button
              onClick={onClose}
              className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Printable Document Content */}
        <div className="flex-1 overflow-y-auto p-8 space-y-6 text-gray-900 bg-white print:p-0">
          {/* Header Banner */}
          <div className="flex flex-col sm:flex-row justify-between items-start border-b-2 border-gray-900 pb-6 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="text-xl font-black tracking-tight text-gray-900">{store?.name || 'MobiStore Pro'}</span>
                <span className="bg-gray-100 text-gray-800 text-[10px] uppercase font-mono font-black px-2 py-0.5 rounded">
                  POS & RMA Hub
                </span>
              </div>
              <p className="text-xs text-gray-500">{store?.address || 'Kurdistan Region & Iraq'}</p>
              <p className="text-xs text-gray-500">Phone: {store?.phone || '+964 750 000 0000'}</p>
            </div>

            <div className="text-left sm:text-right">
              <span className="inline-block bg-indigo-900 text-white text-xs font-black px-3 py-1 rounded-md uppercase tracking-wider mb-2">
                DEBIT NOTE / RMA VOUCHER
              </span>
              <p className="text-sm font-mono font-black text-gray-900">{returnDoc.returnNumber}</p>
              <p className="text-xs text-gray-500">Issue Date: {new Date(returnDoc.createdAt).toLocaleDateString()}</p>
              <p className="text-xs text-gray-500">Status: <span className="uppercase font-bold text-gray-800">{returnDoc.status.replace(/_/g, ' ')}</span></p>
            </div>
          </div>

          {/* Supplier and Logistics Grid */}
          <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Returned To (Supplier / Vendor):</p>
              <p className="font-bold text-gray-900 text-sm">{returnDoc.supplierName}</p>
              {returnDoc.supplierPhone && <p className="text-gray-600 mt-0.5">Tel: {returnDoc.supplierPhone}</p>}
              {returnDoc.supplierEmail && <p className="text-gray-600">Email: {returnDoc.supplierEmail}</p>}
              {returnDoc.supplierAddress && <p className="text-gray-600">{returnDoc.supplierAddress}</p>}
            </div>

            <div className="border-l border-gray-200 pl-4">
              <p className="text-[10px] font-black uppercase text-gray-400 mb-1">Logistics & Settlement Terms:</p>
              <p className="text-gray-700">
                <span className="font-bold">Reason:</span> {reasonInfo?.defaultLabel || returnDoc.reason}
              </p>
              <p className="text-gray-700 mt-0.5">
                <span className="font-bold">Settlement:</span> {settlementInfo?.defaultLabel || returnDoc.settlementType}
              </p>
              {returnDoc.trackingNumber && (
                <p className="text-gray-700 mt-0.5">
                  <span className="font-bold">Tracking / Courier:</span> {returnDoc.trackingNumber} ({returnDoc.courierName || 'Standard'})
                </p>
              )}
              <p className="text-gray-700 mt-0.5">
                <span className="font-bold">Authorized By:</span> {returnDoc.createdByName || 'Store Staff'}
              </p>
            </div>
          </div>

          {/* Line Items Table */}
          <div>
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-700 mb-2">Itemized Stock Breakdown</h3>
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b-2 border-gray-200 text-[11px] font-black uppercase text-gray-500">
                  <th className="py-2.5 px-2">#</th>
                  <th className="py-2.5 px-2">Product & Model</th>
                  <th className="py-2.5 px-2">Condition & Defect</th>
                  <th className="py-2.5 px-2 text-center">Qty</th>
                  <th className="py-2.5 px-2 text-right">Unit Cost</th>
                  <th className="py-2.5 px-2 text-right">Total Debit</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 font-medium">
                {returnDoc.items.map((item, idx) => (
                  <tr key={item.id || idx}>
                    <td className="py-3 px-2 font-mono text-gray-400">{idx + 1}</td>
                    <td className="py-3 px-2">
                      <p className="font-bold text-gray-900">{item.productName}</p>
                      <p className="text-[10px] text-gray-500">{item.brand} {item.category ? `• ${item.category}` : ''}</p>
                      {item.imeis && item.imeis.length > 0 && item.imeis[0] !== '' && (
                        <div className="mt-1 flex flex-wrap gap-1">
                          {item.imeis.map((imei, iIdx) => (
                            <span key={iIdx} className="bg-gray-100 text-gray-700 font-mono text-[9px] px-1.5 py-0.5 rounded border border-gray-200">
                              IMEI: {imei}
                            </span>
                          ))}
                        </div>
                      )}
                    </td>
                    <td className="py-3 px-2">
                      <span className="capitalize text-gray-800 text-[11px]">{item.condition.replace(/_/g, ' ')}</span>
                      {item.faultDescription && (
                        <p className="text-[10px] text-rose-600 font-medium">{item.faultDescription}</p>
                      )}
                    </td>
                    <td className="py-3 px-2 text-center font-bold">{item.quantity}</td>
                    <td className="py-3 px-2 text-right font-mono">${(item.unitCost || 0).toLocaleString()}</td>
                    <td className="py-3 px-2 text-right font-mono font-bold text-gray-900">
                      ${(item.totalCost || 0).toLocaleString()}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot>
                <tr className="border-t-2 border-gray-900 font-black text-sm">
                  <td colSpan={4} className="py-3 px-2 text-right uppercase text-xs">Total Return Claim:</td>
                  <td colSpan={2} className="py-3 px-2 text-right font-mono text-base text-indigo-900">
                    ${returnDoc.totalCost.toLocaleString()}
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>

          {/* Notes and Disclaimers */}
          {returnDoc.notes && (
            <div className="bg-amber-50/60 border border-amber-200/80 p-3.5 rounded-xl text-xs text-amber-900">
              <p className="font-bold mb-0.5 uppercase text-[10px]">Special Instructions / Remarks:</p>
              <p>{returnDoc.notes}</p>
            </div>
          )}

          {/* Signature & Barcode Footer */}
          <div className="pt-6 border-t border-gray-200 grid grid-cols-2 gap-8 text-xs">
            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-6">Dispatched by Store Representative:</p>
              <div className="border-b border-gray-400 w-48 mb-1"></div>
              <p className="font-bold text-gray-800">{returnDoc.createdByName || 'Store Manager'}</p>
              <p className="text-[10px] text-gray-400">Date: {new Date().toLocaleDateString()}</p>
            </div>

            <div>
              <p className="text-[10px] uppercase font-bold text-gray-400 mb-6">Supplier Received & Verified By:</p>
              <div className="border-b border-gray-400 w-48 mb-1"></div>
              <p className="font-bold text-gray-800">Authorized Receiver Signature</p>
              <p className="text-[10px] text-gray-400">Stamp & RMA Confirmation</p>
            </div>
          </div>

          {/* Barcode Simulation */}
          <div className="text-center pt-4">
            <div className="font-mono text-2xl tracking-widest text-gray-800 font-bold">
              ||| | |||| | ||| ||||| || ||| | |||
            </div>
            <p className="text-[10px] font-mono text-gray-500 mt-1">{returnDoc.returnNumber}</p>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
