import React, { useState } from 'react';
import { 
  X, 
  Upload, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowRight, 
  Package, 
  Sparkles,
  RefreshCw,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  parseProductCSV, 
  downloadProductSampleCSV, 
  batchImportProductsToFirestore, 
  ParsedImportProduct 
} from '../../lib/dataMigration';

interface ProductCsvImportModalProps {
  isOpen: boolean;
  onClose: () => void;
  storeId: string;
  onSuccess: () => void;
}

export default function ProductCsvImportModal({ isOpen, onClose, storeId, onSuccess }: ProductCsvImportModalProps) {
  const [file, setFile] = useState<File | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedImportProduct[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isImporting, setIsImporting] = useState(false);
  const [importProgress, setImportProgress] = useState({ current: 0, total: 0 });
  const [importResult, setImportResult] = useState<{ successCount: number; failCount: number } | null>(null);

  if (!isOpen) return null;

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (!selected) return;
    setFile(selected);
    setIsProcessing(true);
    setImportResult(null);

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const items = parseProductCSV(text);
      setParsedItems(items);
      setIsProcessing(false);
    };
    reader.readAsText(selected);
  };

  const handleStartImport = async () => {
    if (!storeId || parsedItems.length === 0) return;
    setIsImporting(true);
    const validItems = parsedItems.filter(i => i.isValid);
    setImportProgress({ current: 0, total: validItems.length });

    try {
      const result = await batchImportProductsToFirestore(storeId, parsedItems, (count, total) => {
        setImportProgress({ current: count, total });
      });
      setImportResult(result);
      onSuccess();
    } catch (err) {
      console.error(err);
    } finally {
      setIsImporting(false);
    }
  };

  const validCount = parsedItems.filter(i => i.isValid).length;
  const invalidCount = parsedItems.length - validCount;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="bg-white rounded-3xl max-w-3xl w-full shadow-2xl border border-gray-100 overflow-hidden flex flex-col my-8 max-h-[90vh]"
      >
        {/* Header */}
        <div className="p-6 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 border border-blue-400/30 rounded-2xl">
              <FileSpreadsheet className="w-6 h-6 text-blue-400" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white leading-tight">Import Products Catalog (CSV / Excel)</h3>
              <p className="text-xs text-blue-200 font-medium mt-0.5">Bulk upload products, stock levels, and barcodes from external platforms.</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-white/10 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 overflow-y-auto space-y-6 custom-scrollbar flex-1">
          {/* Top Info & Download Template Banner */}
          <div className="bg-blue-50/80 border border-blue-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-start gap-3">
              <Info className="w-5 h-5 text-blue-600 flex-shrink-0 mt-0.5" />
              <div>
                <h4 className="text-xs font-black text-blue-900 uppercase tracking-wider">Download Standard Import Format</h4>
                <p className="text-xs text-blue-800 mt-0.5">Use our pre-configured CSV template with sample data columns (Name, Price, Stock, Barcode, etc.).</p>
              </div>
            </div>
            <button
              onClick={downloadProductSampleCSV}
              className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer whitespace-nowrap"
            >
              <Download className="w-4 h-4" />
              <span>Download Template</span>
            </button>
          </div>

          {/* Upload Area */}
          {!importResult && (
            <div className="border-2 border-dashed border-gray-300 hover:border-blue-500 rounded-3xl p-8 text-center transition-all bg-gray-50/50 hover:bg-blue-50/30">
              <input
                type="file"
                accept=".csv, .txt, .tsv"
                onChange={handleFileChange}
                className="hidden"
                id="product-csv-upload-input"
              />
              <label 
                htmlFor="product-csv-upload-input"
                className="cursor-pointer flex flex-col items-center justify-center space-y-3"
              >
                <div className="w-14 h-14 bg-blue-100 text-blue-600 rounded-2xl flex items-center justify-center shadow-md">
                  <Upload className="w-7 h-7" />
                </div>
                <div>
                  <p className="text-sm font-black text-gray-900">
                    {file ? file.name : 'Click to upload or drag & drop CSV file'}
                  </p>
                  <p className="text-xs text-gray-500 mt-1">Supports CSV, TSV, or Excel CSV Exports (UTF-8)</p>
                </div>
              </label>
            </div>
          )}

          {/* Parsed Preview Table */}
          {parsedItems.length > 0 && !importResult && (
            <div className="space-y-4">
              {/* Summary Stats */}
              <div className="grid grid-cols-3 gap-3">
                <div className="bg-gray-50 border border-gray-200 p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-gray-500 font-bold uppercase">Total Rows</span>
                  <p className="text-base font-black text-gray-900">{parsedItems.length}</p>
                </div>
                <div className="bg-emerald-50 border border-emerald-200 p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-emerald-700 font-bold uppercase">Ready to Import</span>
                  <p className="text-base font-black text-emerald-700">{validCount}</p>
                </div>
                <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-center">
                  <span className="text-[10px] text-amber-800 font-bold uppercase">Invalid Rows</span>
                  <p className="text-base font-black text-amber-800">{invalidCount}</p>
                </div>
              </div>

              {/* Table Preview */}
              <div className="border border-gray-200 rounded-2xl overflow-hidden max-h-60 overflow-y-auto custom-scrollbar">
                <table className="w-full text-left text-xs">
                  <thead className="bg-gray-100 font-bold text-gray-700 uppercase text-[10px] sticky top-0">
                    <tr>
                      <th className="p-3">Status</th>
                      <th className="p-3">Product Name</th>
                      <th className="p-3">Brand</th>
                      <th className="p-3">Category</th>
                      <th className="p-3">Selling Price</th>
                      <th className="p-3">Stock</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {parsedItems.map((item, idx) => (
                      <tr key={idx} className={item.isValid ? 'hover:bg-gray-50' : 'bg-amber-50/50'}>
                        <td className="p-3">
                          {item.isValid ? (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded-full">
                              <CheckCircle2 className="w-3 h-3" /> Valid
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-[10px] font-bold text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full" title={item.errors.join(', ')}>
                              <AlertTriangle className="w-3 h-3" /> {item.errors[0]}
                            </span>
                          )}
                        </td>
                        <td className="p-3 font-bold text-gray-900">{item.name || '—'}</td>
                        <td className="p-3">{item.brand}</td>
                        <td className="p-3">{item.category}</td>
                        <td className="p-3 font-bold text-indigo-600">${item.sellingPrice}</td>
                        <td className="p-3 font-mono">{item.stock}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Import Progress Bar */}
          {isImporting && (
            <div className="space-y-2 bg-indigo-50 border border-indigo-200 p-4 rounded-2xl">
              <div className="flex justify-between text-xs font-bold text-indigo-900">
                <span className="flex items-center gap-2">
                  <RefreshCw className="w-4 h-4 animate-spin text-indigo-600" />
                  Importing Catalog to Database...
                </span>
                <span>{importProgress.current} / {importProgress.total}</span>
              </div>
              <div className="w-full bg-indigo-200 h-2.5 rounded-full overflow-hidden">
                <div 
                  className="bg-indigo-600 h-full transition-all duration-300"
                  style={{ width: `${importProgress.total > 0 ? (importProgress.current / importProgress.total) * 100 : 0}%` }}
                />
              </div>
            </div>
          )}

          {/* Result Confirmation Banner */}
          {importResult && (
            <div className="bg-emerald-50 border border-emerald-200 rounded-3xl p-6 text-center space-y-3">
              <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-emerald-900">Products Catalog Imported Successfully!</h4>
              <p className="text-xs text-emerald-800">
                Added <span className="font-bold">{importResult.successCount}</span> new products to your store.
                {importResult.failCount > 0 && ` (${importResult.failCount} skipped due to validation)`}
              </p>
              <button
                onClick={onClose}
                className="mt-2 px-6 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs rounded-xl shadow-md transition-all cursor-pointer"
              >
                Close & View Products
              </button>
            </div>
          )}
        </div>

        {/* Footer */}
        {!importResult && (
          <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
            <button
              onClick={onClose}
              disabled={isImporting}
              className="px-5 py-2.5 text-xs font-bold text-gray-600 hover:text-gray-900"
            >
              Cancel
            </button>
            <button
              onClick={handleStartImport}
              disabled={isImporting || validCount === 0 || isProcessing}
              className="px-6 py-2.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-50 text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg transition-all flex items-center gap-2 cursor-pointer"
            >
              <Package className="w-4 h-4" />
              <span>{isImporting ? 'Importing...' : `Import ${validCount} Products`}</span>
            </button>
          </div>
        )}
      </motion.div>
    </div>
  );
}
