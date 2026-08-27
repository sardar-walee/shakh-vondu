import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import { Smartphone, Apple, Play, Download, QrCode, Copy, Check, X, ShieldCheck, Sparkles, ExternalLink } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useLanguage } from '../../context/LanguageContext';

interface AppDownloadModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AppDownloadModal: React.FC<AppDownloadModalProps> = ({ isOpen, onClose }) => {
  const { appVersion } = useMarketplace();
  const { t } = useLanguage();

  const [activeTab, setActiveTab] = useState<'android' | 'ios'>('android');
  const [androidQr, setAndroidQr] = useState<string>('');
  const [iosQr, setIosQr] = useState<string>('');
  const [copiedLink, setCopiedLink] = useState(false);

  // Download URLs (can be customized via AppVersion or defaults)
  const androidUrl = appVersion.androidDownloadUrl || 'https://daim-post.online/download/android/shakh-app.apk';
  const iosUrl = appVersion.iosDownloadUrl || 'https://apps.apple.com/app/shakh-kurdistan/id640000000';

  useEffect(() => {
    if (isOpen) {
      // Generate QR Code Data URLs
      QRCode.toDataURL(androidUrl, { width: 220, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(url => setAndroidQr(url))
        .catch(err => console.error('Failed to generate Android QR:', err));

      QRCode.toDataURL(iosUrl, { width: 220, margin: 1, color: { dark: '#0f172a', light: '#ffffff' } })
        .then(url => setIosQr(url))
        .catch(err => console.error('Failed to generate iOS QR:', err));
    }
  }, [isOpen, androidUrl, iosUrl]);

  if (!isOpen) return null;

  const currentUrl = activeTab === 'android' ? androidUrl : iosUrl;

  const handleCopyLink = () => {
    navigator.clipboard.writeText(currentUrl);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 text-white relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="relative z-10 flex items-start justify-between">
            <div className="space-y-1.5">
              <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black">
                <QrCode className="w-4 h-4 text-amber-200" />
                <span>دابەزاندنی ئەپلیکەیشنی (شاخ)</span>
                <span className="font-latin bg-white text-orange-600 px-2 py-0.2 rounded-md font-bold text-[11px]">
                  v{appVersion.version}
                </span>
              </div>
              <h2 className="text-xl font-black text-white mt-1">
                ئەپەکەت بە سڕینەوەی QR Code دابەزێنە 📲
              </h2>
              <p className="text-xs text-white/90">
                کامێرای مۆبایلەکەت بکەرەوە و لەسەر کۆدەکان ڕابگرە بۆ دابەزاندنی خێرا.
              </p>
            </div>

            <button
              onClick={onClose}
              className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white cursor-pointer transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          
          {/* OS Platform Tabs */}
          <div className="grid grid-cols-2 gap-3 bg-slate-100 dark:bg-slate-800 p-1.5 rounded-2xl">
            <button
              onClick={() => setActiveTab('android')}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'android'
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Play className="w-4 h-4 fill-white" />
              <span>ئەندرۆید (Android APK)</span>
            </button>

            <button
              onClick={() => setActiveTab('ios')}
              className={`py-3 px-4 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 cursor-pointer ${
                activeTab === 'ios'
                  ? 'bg-slate-900 dark:bg-slate-700 text-white shadow-lg shadow-slate-900/30'
                  : 'text-slate-600 dark:text-slate-300 hover:text-slate-900 dark:hover:text-white'
              }`}
            >
              <Apple className="w-4 h-4 fill-white" />
              <span>ئەپڵ (Apple iOS)</span>
            </button>
          </div>

          {/* QR Code Card */}
          <div className="flex flex-col items-center justify-center bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 rounded-3xl p-6 text-center space-y-4">
            
            <div className="relative group p-3 bg-white rounded-2xl shadow-xl border border-slate-200/80">
              {activeTab === 'android' ? (
                androidQr ? (
                  <img src={androidQr} alt="Android App QR Code" className="w-48 h-48 rounded-lg" />
                ) : (
                  <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center animate-pulse text-xs text-slate-400">
                    خەریکی دروستکردنی QR...
                  </div>
                )
              ) : (
                iosQr ? (
                  <img src={iosQr} alt="iOS App QR Code" className="w-48 h-48 rounded-lg" />
                ) : (
                  <div className="w-48 h-48 bg-slate-100 rounded-lg flex items-center justify-center animate-pulse text-xs text-slate-400">
                    خەریکی دروستکردنی QR...
                  </div>
                )
              )}

              <div className="absolute inset-0 bg-slate-900/5 backdrop-blur-[1px] opacity-0 group-hover:opacity-100 transition-opacity rounded-2xl flex items-center justify-center">
                <span className="text-[10px] font-bold bg-slate-900 text-white px-2 py-1 rounded-md shadow-md">
                  QR Code بۆ دابەزاندنی (شاخ)
                </span>
              </div>
            </div>

            <div className="space-y-1">
              <h3 className="text-sm font-black text-slate-900 dark:text-white">
                {activeTab === 'android' ? 'فایلی فەرمی APK بۆ ئەندرۆید' : 'ئەپلیکەیشنی فەرمی بۆ ئایفۆن و ئایپاد'}
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400 max-w-xs mx-auto">
                {activeTab === 'android'
                  ? 'کۆدەکە بە کامێرای مۆبایلەکەت سکان بکە یان دوگمەی خوارەوە دابگرە بۆ دابەزاندنی دەستبەجێ.'
                  : 'لە ڕێگەی App Store یان TestFlight راستەوخۆ دەتوانیت ئەپەکە دابەزێنیت.'}
              </p>
            </div>

            {/* Direct Action Buttons */}
            <div className="flex flex-wrap items-center justify-center gap-2.5 w-full pt-2">
              <a
                href={currentUrl}
                target="_blank"
                rel="noopener noreferrer"
                className={`flex-1 py-3 px-4 rounded-2xl font-black text-xs text-white shadow-md flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer ${
                  activeTab === 'android' ? 'bg-emerald-600 hover:bg-emerald-700 shadow-emerald-600/20' : 'bg-slate-900 dark:bg-slate-800 hover:bg-slate-800 text-white shadow-slate-900/20'
                }`}
              >
                <Download className="w-4 h-4" />
                <span>{activeTab === 'android' ? 'داگرتنی دەستبەجێی APK' : 'کردنەوە لە App Store'}</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </a>

              <button
                onClick={handleCopyLink}
                className="py-3 px-4 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-2xl font-bold text-xs transition-colors flex items-center gap-1.5 cursor-pointer"
                title="کۆپیکردنی لێنکی دابەزاندن"
              >
                {copiedLink ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
                <span>{copiedLink ? 'کۆپی کرا!' : 'کۆپیکردنی لێنک'}</span>
              </button>
            </div>

          </div>

          {/* Guarantee Badge */}
          <div className="flex items-center gap-2.5 p-3 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-900/40 text-xs text-amber-900 dark:text-amber-200 font-bold">
            <ShieldCheck className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <span>ئەم ئەپلیکەیشنە پشکنینی ئاسایشی بۆ کراوە و پاکە لە ھەر ڤایرۆس یان زیانێک.</span>
          </div>

        </div>

      </div>
    </div>
  );
};
