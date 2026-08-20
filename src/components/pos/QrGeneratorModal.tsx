import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { Product } from '../../types';
import { QrCode, Printer, X, Download, Tag, Store } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { useStore } from '../../contexts/StoreContext';

interface QrGeneratorModalProps {
  product: Product | null;
  onClose: () => void;
  isRTL?: boolean;
}

export default function QrGeneratorModal({
  product,
  onClose,
  isRTL = false
}: QrGeneratorModalProps) {
  const { store } = useStore();
  const [qrDataUrl, setQrDataUrl] = useState<string>('');

  useEffect(() => {
    if (!product) return;

    const qrContent = JSON.stringify({
      id: product.id,
      name: product.name,
      price: product.sellingPrice,
      barcode: product.barcode || product.id,
      store: store?.name || 'MobiStore'
    });

    QRCode.toDataURL(qrContent, { width: 300, margin: 2 }, (err, url) => {
      if (!err && url) {
        setQrDataUrl(url);
      }
    });
  }, [product, store?.name]);

  if (!product) return null;

  const handlePrint = () => {
    window.print();
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-white rounded-3xl shadow-2xl border border-gray-200 w-full max-w-sm overflow-hidden"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
            <div className="flex items-center gap-2">
              <div className="p-2 bg-blue-50 text-blue-600 rounded-xl">
                <QrCode className="w-5 h-5" />
              </div>
              <h3 className="font-black text-sm text-gray-900">ستیكەری QR کۆدی بەرهەم</h3>
            </div>
            <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
          </div>

          <div className="p-6 space-y-6 text-center">
            {/* Printable Label Badge */}
            <div id="qr-printable-badge" className="p-5 border-2 border-dashed border-gray-300 rounded-2xl bg-gradient-to-b from-gray-50 to-white shadow-inner space-y-3">
              <div className="flex items-center justify-between border-b border-gray-200 pb-2 text-[10px] text-gray-500 font-bold">
                <span className="flex items-center gap-1"><Store className="w-3 h-3 text-blue-600" /> {store?.name || 'MobiStore'}</span>
                <span>{product.category || 'کۆگا'}</span>
              </div>

              <h4 className="font-black text-sm text-gray-900 leading-snug">{product.name}</h4>
              
              {product.brand && (
                <p className="text-xs font-bold text-gray-500">{product.brand} {product.model ? `• ${product.model}` : ''}</p>
              )}

              {/* QR Image */}
              {qrDataUrl && (
                <div className="flex justify-center my-2">
                  <img src={qrDataUrl} alt="Product QR Code" className="w-40 h-40 rounded-xl border border-gray-200 shadow-xs" />
                </div>
              )}

              <div className="pt-2 border-t border-gray-200 flex items-center justify-between">
                <span className="font-mono text-[11px] text-gray-400 font-bold">{product.barcode || product.sku || product.id}</span>
                <span className="text-base font-black text-emerald-600">${product.sellingPrice}</span>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handlePrint}
                className="flex-1 py-3 bg-blue-600 hover:bg-blue-700 text-white font-black text-xs rounded-xl shadow-lg shadow-blue-500/20 flex items-center justify-center gap-2 transition"
              >
                <Printer className="w-4 h-4" />
                <span>پرینتکردنی ستیكەر</span>
              </button>

              <a
                href={qrDataUrl}
                download={`QR_${product.name.replace(/\s+/g, '_')}.png`}
                className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl font-bold text-xs flex items-center justify-center transition"
                title="داونلۆدکردنی وێنە"
              >
                <Download className="w-4 h-4" />
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
