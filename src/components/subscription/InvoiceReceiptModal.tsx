import React from 'react';
import { BillingInvoice, Store } from '../../types';
import { 
  X, 
  Download, 
  Printer, 
  ShieldCheck, 
  Receipt, 
  CheckCircle2, 
  Building2,
  Calendar,
  CreditCard
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface InvoiceReceiptModalProps {
  invoice: BillingInvoice | null;
  store: Store | null;
  onClose: () => void;
  isRTL?: boolean;
}

export default function InvoiceReceiptModal({
  invoice,
  store,
  onClose,
  isRTL = false
}: InvoiceReceiptModalProps) {
  if (!invoice) return null;

  const handlePrint = () => {
    window.print();
  };

  const handleDownloadCSV = () => {
    const csvContent = "data:text/csv;charset=utf-8," + 
      "Invoice Number,Date,Plan,Billing Cycle,Subtotal,Discount,Total,Status,Payment Method\n" +
      `"${invoice.invoiceNumber}","${invoice.createdAt}","${invoice.planName}","${invoice.billingCycle}","$${invoice.subtotal || invoice.amount}","$${invoice.discountAmount || 0}","$${invoice.amount}","${invoice.status}","${invoice.paymentMethod}"`;

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `${invoice.invoiceNumber}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header Actions */}
        <div className="bg-gray-900 text-white p-6 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="bg-blue-600 p-2 rounded-xl text-white">
              <Receipt className="w-5 h-5" />
            </div>
            <div>
              <span className="text-[10px] font-black uppercase tracking-widest text-blue-400">Official Tax Receipt</span>
              <h2 className="text-lg font-black text-white">{invoice.invoiceNumber}</h2>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={handlePrint}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Print Receipt"
            >
              <Printer className="w-4 h-4" />
            </button>
            <button
              onClick={handleDownloadCSV}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
              title="Download CSV"
            >
              <Download className="w-4 h-4" />
            </button>
            <button
              onClick={onClose}
              className="p-2 text-slate-300 hover:text-white hover:bg-white/10 rounded-xl transition-all"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Receipt Content */}
        <div className="p-6 sm:p-8 space-y-6">
          {/* Status Badge */}
          <div className="flex justify-between items-center pb-6 border-b border-gray-100">
            <div>
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Payment Status</p>
              <div className="flex items-center gap-1.5 text-emerald-600 font-black text-sm mt-0.5">
                <CheckCircle2 className="w-4 h-4" />
                <span className="uppercase">{invoice.status}</span>
              </div>
            </div>

            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Date Issued</p>
              <p className="text-xs font-bold text-gray-900 mt-0.5">
                {new Date(invoice.createdAt).toLocaleDateString(undefined, {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </p>
            </div>
          </div>

          {/* Parties Info */}
          <div className="grid grid-cols-2 gap-4 text-xs">
            <div className="space-y-1">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Billed To (Tenant)</p>
              <p className="font-black text-gray-900">{store?.name || 'MobiStore HQ'}</p>
              <p className="text-gray-500">{store?.address || 'Erbil, Kurdistan Region, Iraq'}</p>
              <p className="text-gray-500 font-mono">{store?.phone || '+964 750 123 4567'}</p>
            </div>

            <div className="space-y-1 text-right">
              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Service Provider</p>
              <p className="font-black text-gray-900">MobiStore Pro SaaS Inc.</p>
              <p className="text-gray-500">Cloud Retail Infrastructure</p>
              <p className="text-gray-500">support@mobistoresaas.com</p>
            </div>
          </div>

          {/* Line Item Table */}
          <div className="border border-gray-200 rounded-2xl overflow-hidden">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black border-b border-gray-200">
                <tr>
                  <th className="py-3 px-4">Description</th>
                  <th className="py-3 px-4 text-center">Cycle</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                <tr>
                  <td className="py-3.5 px-4">
                    <p className="font-black text-gray-900">{invoice.planName}</p>
                    <p className="text-[11px] text-gray-500">MobiStore Pro SaaS Platform Access</p>
                  </td>
                  <td className="py-3.5 px-4 text-center capitalize font-bold text-gray-600">
                    {invoice.billingCycle}
                  </td>
                  <td className="py-3.5 px-4 text-right font-black text-gray-900">
                    ${(invoice.subtotal || invoice.amount).toFixed(2)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Summary Breakdown */}
          <div className="space-y-2 bg-gray-50 p-4 rounded-2xl border border-gray-200 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Subtotal</span>
              <span className="font-bold">${(invoice.subtotal || invoice.amount).toFixed(2)}</span>
            </div>

            {invoice.discountAmount && invoice.discountAmount > 0 ? (
              <div className="flex justify-between text-emerald-600 font-bold">
                <span>Discount ({invoice.couponCode || 'Promo'})</span>
                <span>-${invoice.discountAmount.toFixed(2)}</span>
              </div>
            ) : null}

            <div className="flex justify-between text-gray-600">
              <span>VAT / Tax (0%)</span>
              <span className="font-bold">$0.00</span>
            </div>

            <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-gray-900">
              <span>Total Paid</span>
              <span className="text-blue-600">${invoice.amount.toFixed(2)} USD</span>
            </div>
          </div>

          {/* Payment Method Used */}
          <div className="flex items-center justify-between text-xs text-gray-500 pt-2 border-t border-gray-100">
            <div className="flex items-center gap-2">
              <CreditCard className="w-4 h-4 text-gray-400" />
              <span>
                Paid via <strong>{invoice.paymentMethod}</strong> {invoice.cardLast4 && `(ending in ${invoice.cardLast4})`}
              </span>
            </div>
            <span className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Processed by Stripe</span>
          </div>
        </div>

        {/* Footer */}
        <div className="bg-gray-50 p-4 px-6 border-t border-gray-200 flex items-center justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 bg-gray-900 text-white rounded-xl text-xs font-black hover:bg-gray-800 transition-all"
          >
            Close Receipt
          </button>
        </div>
      </div>
    </div>
  );
}
