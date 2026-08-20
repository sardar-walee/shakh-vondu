import React, { useState } from 'react';
import { validateBackupJSON } from '../../lib/backupService';
import { FullStoreBackupData } from '../../types';
import { 
  FileCheck, 
  UploadCloud, 
  X, 
  CheckCircle2, 
  AlertTriangle, 
  ShieldCheck, 
  Package, 
  ShoppingCart, 
  Users, 
  Truck, 
  Database,
  Building2
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface BackupIntegrityModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BackupIntegrityModal({ isOpen, onClose }: BackupIntegrityModalProps) {
  const [dragOver, setDragOver] = useState(false);
  const [analyzing, setAnalyzing] = useState(false);
  const [validationResult, setValidationResult] = useState<{
    isValid: boolean;
    error?: string;
    parsed?: FullStoreBackupData;
    recordSummary?: { [key: string]: number };
  } | null>(null);

  if (!isOpen) return null;

  const handleFileProcess = (file: File) => {
    if (!file.name.endsWith('.json')) {
      setValidationResult({
        isValid: false,
        error: 'Please upload a valid MobiStore JSON backup file (.json).'
      });
      return;
    }

    setAnalyzing(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      const content = e.target?.result as string;
      const result = validateBackupJSON(content);
      setValidationResult(result);
      setAnalyzing(false);
    };
    reader.onerror = () => {
      setValidationResult({
        isValid: false,
        error: 'Could not read file content.'
      });
      setAnalyzing(false);
    };
    reader.readAsText(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragOver(false);
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileProcess(e.dataTransfer.files[0]);
    }
  };

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      handleFileProcess(e.target.files[0]);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-xl w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
      >
        <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
              <FileCheck className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-black text-sm text-gray-900">Backup File Integrity Inspector</h3>
              <p className="text-[10px] text-gray-500 font-medium">Verify checksums and inspect records inside a downloaded backup</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="p-6 space-y-4 overflow-y-auto">
          {/* File Dropzone */}
          <div
            onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
            onDragLeave={() => setDragOver(false)}
            onDrop={handleDrop}
            className={`border-2 border-dashed rounded-3xl p-8 text-center transition-all cursor-pointer ${
              dragOver ? 'border-indigo-500 bg-indigo-50/50' : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
            }`}
            onClick={() => document.getElementById('backup-inspector-input')?.click()}
          >
            <input 
              id="backup-inspector-input"
              type="file" 
              accept=".json" 
              className="hidden" 
              onChange={handleFileInput}
            />
            <div className="w-12 h-12 rounded-2xl bg-indigo-100 text-indigo-600 mx-auto flex items-center justify-center mb-3">
              <UploadCloud className="w-6 h-6" />
            </div>
            <p className="text-xs font-bold text-gray-800">
              Drag & Drop your <code className="font-mono text-indigo-600">.json</code> backup file here
            </p>
            <p className="text-[10px] text-gray-400 mt-1">Or click to select from your computer</p>
          </div>

          {/* Validation Result Box */}
          {analyzing && (
            <div className="text-center py-6 text-xs text-gray-500 font-bold">
              <div className="w-5 h-5 border-2 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-2" />
              Parsing backup JSON and verifying integrity checksum...
            </div>
          )}

          {validationResult && !analyzing && (
            <div className={`p-4 rounded-2xl border text-xs space-y-3 ${
              validationResult.isValid 
                ? 'bg-emerald-50/80 border-emerald-200 text-emerald-900' 
                : 'bg-rose-50 border-rose-200 text-rose-900'
            }`}>
              <div className="flex items-center gap-2 font-bold">
                {validationResult.isValid ? (
                  <>
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
                    <span>Valid MobiStore Backup Archive (Version {validationResult.parsed?.version})</span>
                  </>
                ) : (
                  <>
                    <AlertTriangle className="w-5 h-5 text-rose-600 shrink-0" />
                    <span>{validationResult.error}</span>
                  </>
                )}
              </div>

              {validationResult.isValid && validationResult.parsed && (
                <div className="space-y-3 pt-2 border-t border-emerald-200/60">
                  <div className="grid grid-cols-2 gap-2 text-[11px]">
                    <div>
                      <span className="text-emerald-700 font-medium block">Store Name:</span>
                      <strong className="text-emerald-950">{validationResult.parsed.storeName}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-medium block">Export Timestamp:</span>
                      <strong className="text-emerald-950">{new Date(validationResult.parsed.exportedAt).toLocaleString()}</strong>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-medium block">Integrity Checksum:</span>
                      <code className="font-mono bg-white/80 px-1.5 py-0.5 rounded border border-emerald-300 font-bold">
                        {validationResult.parsed.checksum}
                      </code>
                    </div>
                    <div>
                      <span className="text-emerald-700 font-medium block">Exported By:</span>
                      <strong className="text-emerald-950">{validationResult.parsed.exportedBy}</strong>
                    </div>
                  </div>

                  {/* Record Count Breakdown */}
                  <div className="bg-white/80 p-3 rounded-xl border border-emerald-200/80 space-y-1.5">
                    <p className="text-[10px] font-black uppercase text-emerald-800 tracking-wider">Archived Entities</p>
                    <div className="grid grid-cols-3 gap-2 text-[11px]">
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Package className="w-3.5 h-3.5 text-blue-600" />
                        <span>{validationResult.recordSummary?.products} Products</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <ShoppingCart className="w-3.5 h-3.5 text-emerald-600" />
                        <span>{validationResult.recordSummary?.sales} Sales</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Users className="w-3.5 h-3.5 text-purple-600" />
                        <span>{validationResult.recordSummary?.customers} Customers</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Building2 className="w-3.5 h-3.5 text-amber-600" />
                        <span>{validationResult.recordSummary?.suppliers} Suppliers</span>
                      </div>
                      <div className="flex items-center gap-1.5 text-gray-700">
                        <Truck className="w-3.5 h-3.5 text-rose-600" />
                        <span>{validationResult.recordSummary?.supplierReturns} Returns</span>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>

        <div className="px-6 py-4 bg-gray-50/50 border-t border-gray-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-gray-900 hover:bg-gray-800 text-white text-xs font-bold"
          >
            Close Inspector
          </button>
        </div>
      </motion.div>
    </div>
  );
}
