import React, { useEffect, useState, useRef } from 'react';
import { Html5QrcodeScanner, Html5QrcodeScanType } from 'html5-qrcode';
import { Product } from '../../types';
import { Scan, X, Check, AlertCircle, Volume2, Camera, Barcode } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface QrScannerModalProps {
  isOpen: boolean;
  onClose: () => void;
  products: Product[];
  onScanSuccess: (product: Product) => void;
  isRTL?: boolean;
}

export default function QrScannerModal({
  isOpen,
  onClose,
  products,
  onScanSuccess,
  isRTL = false
}: QrScannerModalProps) {
  const [manualCode, setManualCode] = useState('');
  const [lastScannedProduct, setLastScannedProduct] = useState<Product | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const scannerRef = useRef<Html5QrcodeScanner | null>(null);

  useEffect(() => {
    if (!isOpen) {
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.warn('Scanner clear err:', err));
        scannerRef.current = null;
      }
      return;
    }

    // Delay initialization slightly to ensure element exists in DOM
    const timeout = setTimeout(() => {
      const config = {
        fps: 10,
        qrbox: { width: 250, height: 250 },
        supportedScanTypes: [
          Html5QrcodeScanType.SCAN_TYPE_CAMERA,
          Html5QrcodeScanType.SCAN_TYPE_FILE
        ]
      };

      const scanner = new Html5QrcodeScanner("reader", config, /* verbose= */ false);
      scannerRef.current = scanner;

      scanner.render(
        (decodedText) => {
          handleScannedCode(decodedText);
        },
        (errorMessage) => {
          // Ignore frequent frame-by-frame scanner errors
        }
      );
    }, 200);

    return () => {
      clearTimeout(timeout);
      if (scannerRef.current) {
        scannerRef.current.clear().catch(err => console.warn('Scanner clear err:', err));
        scannerRef.current = null;
      }
    };
  }, [isOpen]);

  const handleScannedCode = (code: string) => {
    const trimmed = code.trim().toLowerCase();
    if (!trimmed) return;

    // Search product by barcode, SKU, ID, or IMEI
    const found = products.find(p => 
      p.barcode?.toLowerCase() === trimmed ||
      p.id.toLowerCase() === trimmed ||
      p.sku?.toLowerCase() === trimmed ||
      p.imeis?.some(imei => imei.toLowerCase() === trimmed)
    );

    if (found) {
      // Audio beep feedback
      playBeep();
      setLastScannedProduct(found);
      setScanError(null);
      onScanSuccess(found);

      // Auto-hide last scanned notification after 3 seconds
      setTimeout(() => {
        setLastScannedProduct(null);
      }, 3000);
    } else {
      setScanError(`هیچ بەرهەمێک نەدۆزرایەوە بۆ کۆدی: ${code}`);
      setTimeout(() => setScanError(null), 3500);
    }
  };

  const playBeep = () => {
    try {
      const ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = 'sine';
      osc.frequency.value = 880; // A5 note
      gain.gain.setValueAtTime(0.1, ctx.currentTime);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + 0.15);
    } catch (e) {
      console.warn("Audio Context not supported:", e);
    }
  };

  const handleManualSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (manualCode.trim()) {
      handleScannedCode(manualCode.trim());
      setManualCode('');
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/80 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="bg-slate-900 text-slate-100 border border-slate-800 rounded-3xl shadow-2xl w-full max-w-md overflow-hidden relative"
          dir={isRTL ? 'rtl' : 'ltr'}
        >
          {/* Header */}
          <div className="p-5 border-b border-slate-800 flex items-center justify-between bg-slate-950">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-2xl">
                <Camera className="w-5 h-5 animate-pulse" />
              </div>
              <div>
                <h3 className="font-black text-sm text-slate-100">سکێنەری ڕاستەوخۆ (QR & Barcode Scanner)</h3>
                <p className="text-[11px] text-slate-400">کامێرای ئامێرەکەت بۆ سکێنکردنی کۆد یان بارکۆد ببه‌کاربهێنە</p>
              </div>
            </div>

            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white rounded-xl hover:bg-slate-800 transition"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          <div className="p-5 space-y-4">
            {/* HTML5 Live Camera Video Container */}
            <div className="bg-slate-950 rounded-2xl border border-slate-800 overflow-hidden relative min-h-[260px] flex items-center justify-center">
              <div id="reader" className="w-full text-slate-300 text-xs text-center font-bold"></div>
            </div>

            {/* Notification Toast for Scanned Product */}
            {lastScannedProduct && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-emerald-500/10 border border-emerald-500/30 p-3 rounded-2xl flex items-center justify-between text-emerald-300 text-xs font-bold"
              >
                <div className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-400" />
                  <span>زیادکرا بۆ سەبەتە: {lastScannedProduct.name}</span>
                </div>
                <span className="text-emerald-400 font-black">${lastScannedProduct.sellingPrice}</span>
              </motion.div>
            )}

            {scanError && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="bg-rose-500/10 border border-rose-500/30 p-3 rounded-2xl flex items-center gap-2 text-rose-300 text-xs font-bold"
              >
                <AlertCircle className="w-4 h-4 text-rose-400" />
                <span>{scanError}</span>
              </motion.div>
            )}

            {/* USB Barcode / Manual Input Option */}
            <form onSubmit={handleManualSubmit} className="pt-2">
              <label className="text-[11px] font-bold text-slate-400 block mb-1">
                تایپکردنی دەستی یان سکێنەری لێزەری USB:
              </label>
              <div className="flex gap-2">
                <div className="relative flex-1">
                  <Barcode className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="کۆد / بارکۆد لێرە بنووسە..."
                    value={manualCode}
                    onChange={(e) => setManualCode(e.target.value)}
                    className="w-full pl-9 pr-3 py-2.5 rounded-xl bg-slate-800 border border-slate-700 text-xs font-bold text-slate-100 outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <button
                  type="submit"
                  className="px-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-xl transition shadow-md"
                >
                  زیادکردن
                </button>
              </div>
            </form>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
}
