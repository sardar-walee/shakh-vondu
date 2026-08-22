import React, { useState, useEffect } from 'react';
import {
  X,
  Download,
  Smartphone,
  CheckCircle,
  Apple,
  Share,
  PlusSquare,
  Sparkles,
  QrCode,
  ShieldCheck,
  Zap
} from 'lucide-react';
import { Logo } from './Logo';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const [activeTab, setActiveTab] = useState<'android' | 'ios' | 'qr'>('android');
  const [downloadProgress, setDownloadProgress] = useState(0);
  const [isDownloading, setIsDownloading] = useState(false);
  const [downloadComplete, setDownloadComplete] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
    };
    window.addEventListener('beforeinstallprompt', handleBeforeInstall);
    return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstall);
  }, []);

  if (!isOpen) return null;

  const handleInstallPwa = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === 'accepted') {
        setDeferredPrompt(null);
        onClose();
      }
    } else {
      // Direct APK download simulation
      setIsDownloading(true);
      setDownloadProgress(10);
      const interval = setInterval(() => {
        setDownloadProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setIsDownloading(false);
            setDownloadComplete(true);
            return 100;
          }
          return prev + 25;
        });
      }, 350);
    }
  };

  const handleSimulateApkDownload = () => {
    setIsDownloading(true);
    setDownloadProgress(15);
    const interval = setInterval(() => {
      setDownloadProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsDownloading(false);
          setDownloadComplete(true);
          return 100;
        }
        return prev + 20;
      });
    }, 300);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/70 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-slate-100 space-y-6 relative animate-scaleUp max-h-[90vh] overflow-y-auto">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Header with App Branding */}
        <div className="text-center space-y-2 pt-2">
          <div className="mx-auto w-16 h-16 rounded-2xl bg-gradient-to-tr from-orange-500 to-amber-400 p-0.5 shadow-lg shadow-orange-500/20 flex items-center justify-center">
            <div className="w-full h-full bg-slate-900 rounded-[14px] flex items-center justify-center">
              <span className="text-white font-black text-2xl tracking-tighter">شاخ</span>
            </div>
          </div>

          <h2 className="text-xl sm:text-2xl font-black text-slate-900">
            دابەزاندنی ئەپی فەرمی شاخ
          </h2>
          <p className="text-xs text-slate-500 max-w-xs mx-auto">
            خێراترین ئەزموونی کڕین، فرۆشتن، داواکردنی خواردن و ئۆتۆمبێل لە کوردستان
          </p>
        </div>

        {/* Tabs: Android vs iOS vs QR */}
        <div className="flex bg-slate-100 p-1 rounded-2xl">
          <button
            onClick={() => setActiveTab('android')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'android' ? 'bg-white text-[#F97316] shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Smartphone className="w-4 h-4" />
            <span>ئەندرۆید (Android)</span>
          </button>

          <button
            onClick={() => setActiveTab('ios')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'ios' ? 'bg-white text-blue-600 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <Apple className="w-4 h-4" />
            <span>ئایفۆن (iOS / PWA)</span>
          </button>

          <button
            onClick={() => setActiveTab('qr')}
            className={`flex-1 py-2 text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-1.5 cursor-pointer ${
              activeTab === 'qr' ? 'bg-white text-slate-900 shadow-xs' : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <QrCode className="w-4 h-4" />
            <span>کۆدی QR</span>
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === 'android' && (
          <div className="space-y-4 text-center">
            <div className="bg-orange-50 border border-orange-200/80 p-4 rounded-2xl text-right space-y-2">
              <div className="flex items-center gap-2 text-[#F97316] font-bold text-xs">
                <Zap className="w-4 h-4" />
                <span>تایبەتمەندیەکانی ئەپی ئەندرۆید:</span>
              </div>
              <ul className="text-xs text-slate-700 space-y-1.5 pr-4 list-disc">
                <li>ئاگادارکردنەوەی خێرا بۆ گەیشتنی داواکاری و فرۆش</li>
                <li>داگرتنی ڕاستەوخۆی وەشانی نوێ بەبێ پێویستی بە گووگڵ پلەی</li>
                <li>خێرایی باڵا لە بارکردنی کاڵا و ئۆتۆمبێلەکان</li>
              </ul>
            </div>

            {isDownloading ? (
              <div className="space-y-2 py-3">
                <div className="flex justify-between text-xs font-bold text-slate-700">
                  <span>داگرتنی فایلی APK...</span>
                  <span className="font-latin">{downloadProgress}%</span>
                </div>
                <div className="w-full bg-slate-100 rounded-full h-3 overflow-hidden">
                  <div
                    className="bg-[#F97316] h-full transition-all duration-300 rounded-full"
                    style={{ width: `${downloadProgress}%` }}
                  />
                </div>
              </div>
            ) : downloadComplete ? (
              <div className="p-4 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-center gap-2 text-emerald-700 font-bold text-xs">
                <CheckCircle className="w-5 h-5" />
                <span>فایلەکە دابەزی! کرتە لە Install بکە لەسەر مۆبایلەکەت.</span>
              </div>
            ) : (
              <div className="space-y-2.5">
                <button
                  onClick={handleSimulateApkDownload}
                  className="w-full py-3.5 px-6 rounded-2xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-sm shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <Download className="w-4 h-4" />
                  <span>داگرتنی ڕاستەوخۆ (Download APK v2.4)</span>
                </button>

                {deferredPrompt && (
                  <button
                    onClick={handleInstallPwa}
                    className="w-full py-3 px-6 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white font-bold text-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
                  >
                    <Smartphone className="w-4 h-4 text-orange-400" />
                    <span>دامەزراندن لەسەر شاشەی مۆبایل (PWA Install)</span>
                  </button>
                )}
              </div>
            )}
          </div>
        )}

        {activeTab === 'ios' && (
          <div className="space-y-4 text-right">
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-3">
              <h4 className="text-xs font-bold text-blue-900 flex items-center gap-1.5">
                <Apple className="w-4 h-4" />
                <span>چۆنیەتی دابەزاندن بۆ ئایفۆن و ئایپاد (iOS):</span>
              </h4>
              <ol className="text-xs text-slate-700 space-y-2.5 pr-4 list-decimal leading-relaxed">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">١.</span>
                  <span>ماڵپەڕەکە لە براوسەری <strong>Safari</strong> بکەرەوە.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">٢.</span>
                  <span>کرتە لەسەر دوگمەی هاوبەشکردن (<Share className="w-3.5 h-3.5 inline text-blue-500 mx-1" /> Share) لە خوارەوە بکە.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">٣.</span>
                  <span>هەڵبژاردەی (<PlusSquare className="w-3.5 h-3.5 inline text-slate-700 mx-1" /> Add to Home Screen) هەڵبژێرە.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-600">٤.</span>
                  <span>ئایکۆنی شاخ دەچێتە سەر شاشەی مۆبایلەکەت هاوشێوەی ئەپ!</span>
                </li>
              </ol>
            </div>
          </div>
        )}

        {activeTab === 'qr' && (
          <div className="text-center space-y-4">
            <p className="text-xs text-slate-600">
              کامێرای مۆبایلەکەت ڕابگرە لەسەر ئەم کۆدە بۆ کردنەوەی ئەپ و داگرتن:
            </p>
            <div className="inline-block p-4 bg-white rounded-3xl border-2 border-slate-200 shadow-md">
              <img
                src="https://api.qrserver.com/v1/create-qr-code/?size=180x180&data=https://daim-post.online"
                alt="Shakh QR Code"
                className="w-44 h-44 rounded-xl mx-auto"
              />
            </div>
            <p className="text-[11px] font-bold text-orange-600 font-latin">
              daim-post.online
            </p>
          </div>
        )}

        {/* Footer Trust Guarantee */}
        <div className="pt-2 border-t border-slate-100 flex items-center justify-center gap-2 text-[11px] text-slate-500 font-semibold">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>ئەپی پشکنراو، سەلامەت و بێ ڤایرۆس بۆ هەموو مۆبایلەکان</span>
        </div>

      </div>
    </div>
  );
};
