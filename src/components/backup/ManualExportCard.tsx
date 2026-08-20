import React, { useState } from 'react';
import { useBackup } from '../../contexts/BackupContext';
import { 
  Download, 
  FileText, 
  Database, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  Check, 
  Sparkles, 
  FileJson, 
  FileSpreadsheet,
  Layers,
  ArrowDownToLine,
  ShieldCheck,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function ManualExportCard() {
  const { 
    createManualSnapshot, 
    exportCollection, 
    isExporting, 
    exportProgress 
  } = useBackup();

  const [selectedFormat, setSelectedFormat] = useState<'json' | 'csv_bundle'>('json');
  const [activeDownloadType, setActiveDownloadType] = useState<string | null>(null);

  const handleFullBackup = async (format: 'json' | 'csv_bundle') => {
    setActiveDownloadType(`full_${format}`);
    try {
      await createManualSnapshot(format);
    } catch (err) {
      console.error('Manual snapshot failed:', err);
    } finally {
      setActiveDownloadType(null);
    }
  };

  const handleSingleExport = async (
    collection: 'products' | 'sales' | 'customers' | 'suppliers' | 'supplierReturns',
    format: 'csv' | 'json'
  ) => {
    setActiveDownloadType(`${collection}_${format}`);
    try {
      await exportCollection(collection, format);
    } catch (err) {
      console.error('Export failed:', err);
    } finally {
      setActiveDownloadType(null);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold">
            <ArrowDownToLine className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 tracking-tight">Manual Instant Export & Snapshots</h3>
            <p className="text-xs text-gray-500 font-medium">Download complete full-database archives or modular CSV spreadsheets.</p>
          </div>
        </div>
      </div>

      {/* Full Database Archive Primary Hero Card */}
      <div className="bg-gradient-to-br from-gray-900 via-slate-800 to-indigo-950 rounded-3xl p-6 text-white shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500 rounded-full blur-[100px] opacity-25" />
        
        <div className="relative z-10 space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 text-indigo-300">
              <Database className="w-4 h-4" />
              <span className="text-[10px] font-black uppercase tracking-widest">Full Tenant Snapshot</span>
            </div>
            <span className="bg-white/10 px-2.5 py-0.5 rounded-full text-[10px] font-mono font-bold text-indigo-200 border border-white/10">
              Complete Store State
            </span>
          </div>

          <div>
            <h4 className="text-xl font-black tracking-tight text-white">Create Full Store Backup Archive</h4>
            <p className="text-xs text-gray-300 font-medium max-w-lg mt-1">
              Exports all products, sales transactions, customer debt/loyalty profiles, suppliers, RMA returns, and staff rosters with an integrity checksum hash.
            </p>
          </div>

          {/* Format selector and action button */}
          <div className="pt-2 flex flex-col sm:flex-row sm:items-center gap-3">
            <div className="flex items-center bg-white/10 p-1 rounded-2xl border border-white/10 text-xs font-bold">
              <button
                type="button"
                onClick={() => setSelectedFormat('json')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                  selectedFormat === 'json' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-300 hover:text-white'
                }`}
              >
                <FileJson className="w-3.5 h-3.5" />
                <span>JSON (Raw DB Schema)</span>
              </button>
              <button
                type="button"
                onClick={() => setSelectedFormat('csv_bundle')}
                className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl transition-all ${
                  selectedFormat === 'csv_bundle' ? 'bg-indigo-600 text-white shadow-sm' : 'text-gray-300 hover:text-white'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" />
                <span>CSV (Excel Bundle)</span>
              </button>
            </div>

            <button
              onClick={() => handleFullBackup(selectedFormat)}
              disabled={isExporting}
              className="flex items-center justify-center gap-2 bg-white hover:bg-indigo-50 text-gray-900 px-6 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-black/30 disabled:opacity-50"
            >
              {isExporting && activeDownloadType?.startsWith('full') ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
                  <span>{exportProgress || 'Exporting...'}</span>
                </>
              ) : (
                <>
                  <Download className="w-3.5 h-3.5 text-indigo-700" />
                  <span>Download Full Store Backup</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Modular Collection Quick-Export Section */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between">
          <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">Modular Collection Exports</h4>
          <span className="text-[10px] text-gray-400 font-medium">Export specific dataset tables for accounting or analytics</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {[
            {
              id: 'products' as const,
              title: 'Products & Inventory',
              subtitle: 'Catalog, barcodes, costs & stock',
              icon: Package,
              iconBg: 'bg-blue-50 text-blue-600'
            },
            {
              id: 'sales' as const,
              title: 'Sales & Receipts',
              subtitle: 'Transactions, profit & payment methods',
              icon: ShoppingCart,
              iconBg: 'bg-emerald-50 text-emerald-600'
            },
            {
              id: 'customers' as const,
              title: 'Customers & Loyalty',
              subtitle: 'Balances, points & contact directory',
              icon: Users,
              iconBg: 'bg-purple-50 text-purple-600'
            },
            {
              id: 'suppliers' as const,
              title: 'Suppliers & Vendors',
              subtitle: 'Contact records & supplier ledger',
              icon: Building2,
              iconBg: 'bg-amber-50 text-amber-700'
            },
            {
              id: 'supplierReturns' as const,
              title: 'Supplier Returns (RMA)',
              subtitle: 'Defective units, tracking & settlements',
              icon: Truck,
              iconBg: 'bg-rose-50 text-rose-600'
            },
          ].map((item) => (
            <div 
              key={item.id}
              className="bg-gray-50/70 rounded-2xl p-4 border border-gray-200/70 hover:border-gray-300 transition-all flex flex-col justify-between space-y-3"
            >
              <div className="flex items-start gap-3">
                <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold ${item.iconBg}`}>
                  <item.icon className="w-4 h-4" />
                </div>
                <div>
                  <h5 className="font-black text-xs text-gray-900 leading-tight">{item.title}</h5>
                  <p className="text-[10px] text-gray-500 mt-0.5">{item.subtitle}</p>
                </div>
              </div>

              <div className="flex items-center gap-2 pt-1">
                <button
                  onClick={() => handleSingleExport(item.id, 'csv')}
                  disabled={isExporting}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <FileSpreadsheet className="w-3 h-3 text-emerald-600" />
                  <span>.CSV</span>
                </button>
                <button
                  onClick={() => handleSingleExport(item.id, 'json')}
                  disabled={isExporting}
                  className="flex-1 bg-white hover:bg-gray-100 text-gray-800 border border-gray-200 py-1.5 px-2.5 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1.5 transition-colors shadow-xs"
                >
                  <FileJson className="w-3 h-3 text-indigo-600" />
                  <span>.JSON</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
