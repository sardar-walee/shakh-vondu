import React, { useState, useEffect } from 'react';
import QRCode from 'qrcode';
import {
  Sparkles,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  X,
  Layers,
  Download,
  QrCode,
  Smartphone,
  Apple,
  Play,
  ShieldAlert,
  Truck,
  Bike,
  Building2,
  Home,
  Flag,
  Radio
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { Bug } from 'lucide-react';

interface AppUpdateAlertProps {
  onNavigateHome?: () => void;
}

export const AppUpdateAlert: React.FC<AppUpdateAlertProps> = ({ onNavigateHome }) => {
  const {
    appVersion,
    isAppUpdateAvailable,
    dismissUpdateNotification,
    isUpdateModalOpen,
    setIsUpdateModalOpen,
    openGlitchModal
  } = useMarketplace();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateProgress, setUpdateProgress] = useState(0);
  const [updateSuccess, setUpdateSuccess] = useState(false);
  const [showQrOptions, setShowQrOptions] = useState(false);
  const [androidQr, setAndroidQr] = useState<string>('');
  const [iosQr, setIosQr] = useState<string>('');

  const androidUrl = appVersion.androidDownloadUrl || 'https://daim-post.online/download/android/shakh-app.apk';
  const iosUrl = appVersion.iosDownloadUrl || 'https://apps.apple.com/app/shakh-kurdistan/id640000000';

  // Force open update modal when update is available
  useEffect(() => {
    if (isAppUpdateAvailable && !isUpdateModalOpen) {
      setIsUpdateModalOpen(true);
    }
  }, [isAppUpdateAvailable, isUpdateModalOpen, setIsUpdateModalOpen]);

  useEffect(() => {
    if (showQrOptions) {
      QRCode.toDataURL(androidUrl, { width: 160, margin: 1 }).then(url => setAndroidQr(url)).catch(err => console.warn(err));
      QRCode.toDataURL(iosUrl, { width: 160, margin: 1 }).then(url => setIosQr(url)).catch(err => console.warn(err));
    }
  }, [showQrOptions, androidUrl, iosUrl]);

  // If no update is available and modal is closed, render nothing
  if (!isAppUpdateAvailable && !isUpdateModalOpen) {
    return null;
  }

  const isMandatory = appVersion.isMandatory || isAppUpdateAvailable;

  const handleApplyUpdate = () => {
    setIsUpdating(true);
    setUpdateProgress(0);
    setUpdateSuccess(false);

    let current = 0;
    const interval = setInterval(() => {
      // Step increment from 3% to 8%
      current += Math.floor(Math.random() * 6) + 3;

      if (current >= 100) {
        current = 100;
        setUpdateProgress(100);
        clearInterval(interval);

        // Progress reached 100%, show success then dismiss & go to Home page
        setTimeout(() => {
          setUpdateSuccess(true);
          dismissUpdateNotification(appVersion.version);

          setTimeout(() => {
            setIsUpdating(false);
            setIsUpdateModalOpen(false);
            setUpdateSuccess(false);
            setUpdateProgress(0);

            // Return immediately to main home page
            if (onNavigateHome) {
              onNavigateHome();
            }
          }, 800);
        }, 500);
      } else {
        setUpdateProgress(current);
      }
    }, 80);
  };

  // Get dynamic status message based on road progress percentage
  const getProgressStatusMessage = (progress: number) => {
    if (progress < 25) {
      return `📡 بەستنەوە بە سێرڤەری (شاخ)... جێبەجێکردنی داتاکان (${progress}%)`;
    }
    if (progress < 60) {
      return `🛵 کاپتنی گەیاندن لەسەر جادەیە... ڕەوانەکردنی فایل و وەشانی نوێ (${progress}%)`;
    }
    if (progress < 95) {
      return `⚡ نوێکردنەوەی شاشە و گۆڕانکارییەکانی وەشانی v${appVersion.version} (${progress}%)`;
    }
    return `🎉 نوێکردنەوە گەیشتە ١٠٠٪! چوونه‌ ژووره‌وه‌ بۆ لاپەڕەی سەرەکی...`;
  };

  return (
    <>
      {/* Forced / Blocking Update Modal */}
      {(isUpdateModalOpen || isAppUpdateAvailable) && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 text-slate-900 dark:text-white">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 text-white relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{t('ئەپدەیت و وەشانی فەرمی (شاخ)')}</span>
                    <span className="font-latin bg-white text-orange-600 px-2 py-0.2 rounded-md font-bold text-[11px]">
                      v{appVersion.version}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    {appVersion.title || t('وەشانی نوێی (شاخ) بەردەستە!')}
                  </h2>
                  <p className="text-xs text-white/90">
                    {t('بەرواری دەرچوون:')} {appVersion.releaseDate || '2026-08-27'}
                  </p>
                </div>

                {!isMandatory && !isUpdating && (
                  <button
                    onClick={() => setIsUpdateModalOpen(false)}
                    className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white cursor-pointer transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                )}
              </div>
            </div>

            {/* Content Body */}
            <div className="p-6 space-y-5">
              
              {/* Mandatory Notice Banner */}
              {!isUpdating && (
                <div className="p-3.5 bg-amber-50 dark:bg-amber-950/50 border border-amber-300 dark:border-amber-800 rounded-2xl flex items-start gap-3 text-xs text-amber-900 dark:text-amber-200 font-bold leading-relaxed">
                  <ShieldAlert className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <span className="block font-black text-sm mb-0.5">ئاگاداری ئەپدەیتی نوێ 🚀</span>
                    <span>ئەم وەشانه پێویستە بۆ بەردەوامبوونی کارکردنی سیستم. تکایە ئەپدەیتی بکەرەوە بۆ ئەوەی بتوانیت بەردەوام بیت لە بەکارهێنانی پلاتفۆرمی (شاخ).</span>
                  </div>
                </div>
              )}

              {/* Dynamic Animated Delivery Captain Road Progress Bar */}
              {isUpdating ? (
                <div className="space-y-6 py-4 animate-in fade-in duration-300">
                  
                  {/* Status Indicator Banner */}
                  <div className="text-center space-y-2">
                    <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-black">
                      <Radio className="w-3.5 h-3.5 animate-ping text-orange-500" />
                      <span>ڕەوانەکردنی لایڤی وەشانی نوێ</span>
                    </span>

                    <h3 className="text-2xl font-black font-latin text-orange-500">
                      {updateProgress}%
                    </h3>

                    <p className="text-xs font-bold text-slate-700 dark:text-slate-200">
                      {getProgressStatusMessage(updateProgress)}
                    </p>
                  </div>

                  {/* Delivery Captain Asphalt Road Track ("جادەی نوێکردنەوە") */}
                  <div className="relative bg-slate-950 rounded-3xl p-5 border-2 border-slate-800 overflow-hidden shadow-2xl space-y-3">
                    
                    {/* Top Curb Edge */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-slate-800 to-amber-400 rounded-full opacity-80" />

                    {/* Road Container */}
                    <div className="relative h-20 w-full bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden flex items-center px-4">
                      
                      {/* Center Dashed Lane Markings */}
                      <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 border-t-2 border-dashed border-slate-600/60 z-0" />

                      {/* Road Progress Filled Bar (Neon Gradient) */}
                      <div
                        className="absolute left-0 top-0 bottom-0 bg-gradient-to-r from-orange-600 via-amber-500 to-emerald-500 opacity-25 transition-all duration-150 ease-out z-0"
                        style={{ width: `${updateProgress}%` }}
                      />

                      {/* Start Landmark (Left): Server */}
                      <div className="relative z-10 flex flex-col items-center text-amber-400 text-[10px] font-bold">
                        <Building2 className="w-5 h-5 text-amber-400" />
                        <span className="text-[9px] mt-0.5 text-slate-400">سێرڤەر</span>
                      </div>

                      {/* Moving Delivery Captain Bike on Road Track */}
                      <div
                        className="absolute top-1/2 -translate-y-1/2 transition-all duration-150 ease-out z-20 flex flex-col items-center"
                        style={{
                          left: `calc(${Math.min(Math.max(updateProgress, 6), 88)}% - 20px)`
                        }}
                      >
                        {/* Captain Floating Percentage Tag */}
                        <div className="bg-orange-500 text-white text-[9px] font-black px-2 py-0.5 rounded-full shadow-lg font-latin whitespace-nowrap mb-1 animate-bounce">
                          {updateProgress}% 🛵
                        </div>

                        {/* Delivery Captain Motorbike Icon */}
                        <div className="p-2 rounded-xl bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/40 ring-2 ring-white/30">
                          <Bike className="w-5 h-5 animate-pulse" />
                        </div>
                      </div>

                      {/* Finish Landmark (Right): Home Page */}
                      <div className="absolute right-4 relative z-10 flex flex-col items-center text-emerald-400 text-[10px] font-bold">
                        <Home className="w-5 h-5 text-emerald-400" />
                        <span className="text-[9px] mt-0.5 text-slate-400">سەرەکی</span>
                      </div>

                    </div>

                    {/* Bottom Curb Edge */}
                    <div className="h-1.5 w-full bg-gradient-to-r from-amber-400 via-slate-800 to-amber-400 rounded-full opacity-80" />

                    {/* Percentage Progress Bar */}
                    <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800 p-0.5">
                      <div
                        className="bg-gradient-to-r from-orange-500 via-amber-500 to-emerald-500 h-full rounded-full transition-all duration-200"
                        style={{ width: `${updateProgress}%` }}
                      />
                    </div>

                  </div>

                  {/* Completion Message */}
                  {updateSuccess && (
                    <div className="p-4 rounded-2xl bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-center font-bold text-xs animate-bounce flex items-center justify-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span>نوێکردنەوە گەیشتە ١٠٠٪! چوونه‌ ژووره‌وه‌ بۆ لاپەڕەی سەرەکی (شاخ) ✓</span>
                    </div>
                  )}

                </div>
              ) : (
                <>
                  {/* Overview Description */}
                  {appVersion.description && (
                    <div className="p-4 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900/40 rounded-2xl text-xs text-orange-900 dark:text-orange-200 leading-relaxed font-medium">
                      {appVersion.description}
                    </div>
                  )}

                  {/* Changelog Bullet Points */}
                  <div className="space-y-2.5">
                    <h4 className="text-xs font-black text-slate-700 dark:text-slate-300 flex items-center gap-2">
                      <Layers className="w-4 h-4 text-orange-500" />
                      <span>{t('تایبەتمەندی و گۆڕانکارییە نوێیەکان لەم وەشانەدا:')}</span>
                    </h4>

                    <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                      {(appVersion.changelog && appVersion.changelog.length > 0 ? appVersion.changelog : [
                        'دروستکردنی QR Code بۆ دابەزاندنی ئەپ بۆ ئەندرۆید و ئەپڵ',
                        'سیستەمی زیرەکی ئاگاداری ڕاستەوخۆ و ناچاری بۆ بەردەستبوونی هەر ئەپدەیتێکی نوێ',
                        'گۆڕینی ناوی فەرمی پلاتفۆرم بۆ (شاخ)',
                        'نوێکردنەوەی تەواوی داتابەیسی کلاود فایەربەیس و خێرایی سیستم'
                      ]).map((item, idx) => (
                        <div
                          key={idx}
                          className="flex items-start gap-2.5 p-3 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700/60 text-xs text-slate-800 dark:text-slate-200"
                        >
                          <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0 mt-0.5" />
                          <span className="leading-relaxed font-medium">{item}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Toggle QR Code Download Panel */}
                  <div className="pt-1">
                    <button
                      type="button"
                      onClick={() => setShowQrOptions(!showQrOptions)}
                      className="w-full py-2.5 px-4 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <QrCode className="w-4 h-4 text-orange-500" />
                      <span>{showQrOptions ? 'شاردنەوەی QR Code ی دابەزاندن' : 'دابەزاندنی ئەپ بۆ مۆبایل لە ڕێگەی QR Code'}</span>
                    </button>

                    {showQrOptions && (
                      <div className="mt-3 grid grid-cols-2 gap-3 p-3 bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-2xl animate-in fade-in duration-200">
                        <div className="flex flex-col items-center text-center p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[11px] font-black text-emerald-600 flex items-center gap-1 mb-2">
                            <Play className="w-3 h-3 fill-emerald-600" /> ئەندرۆید
                          </span>
                          {androidQr ? (
                            <img src={androidQr} alt="Android QR" className="w-28 h-28 rounded-lg" />
                          ) : (
                            <div className="w-28 h-28 bg-slate-100 animate-pulse rounded-lg" />
                          )}
                          <a
                            href={androidUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-[10px] font-bold text-emerald-600 hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> داگرتنی APK
                          </a>
                        </div>

                        <div className="flex flex-col items-center text-center p-2 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800">
                          <span className="text-[11px] font-black text-slate-900 dark:text-white flex items-center gap-1 mb-2">
                            <Apple className="w-3 h-3 fill-current" /> ئەپڵ (iOS)
                          </span>
                          {iosQr ? (
                            <img src={iosQr} alt="iOS QR" className="w-28 h-28 rounded-lg" />
                          ) : (
                            <div className="w-28 h-28 bg-slate-100 animate-pulse rounded-lg" />
                          )}
                          <a
                            href={iosUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="mt-2 text-[10px] font-bold text-blue-500 hover:underline flex items-center gap-1"
                          >
                            <Download className="w-3 h-3" /> App Store
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-3 pt-2">
                    <button
                      onClick={handleApplyUpdate}
                      disabled={isUpdating || updateSuccess}
                      className="flex-1 py-4 bg-[#FF5500] hover:bg-orange-600 text-white rounded-2xl font-black text-xs shadow-xl shadow-orange-500/30 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <RefreshCw className="w-4 h-4" />
                      <span>{t('نوێکردنەوە و ڕیفرێشی ئەپ دەستبەجێ')}</span>
                    </button>

                    {!isMandatory && (
                      <button
                        onClick={() => {
                          dismissUpdateNotification(appVersion.version);
                          setIsUpdateModalOpen(false);
                        }}
                        className="px-5 py-4 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
                      >
                        {t('دواتر')}
                      </button>
                    )}
                  </div>

                  {/* Report Glitch Button */}
                  <div className="pt-1 text-center">
                    <button
                      type="button"
                      onClick={() => {
                        setIsUpdateModalOpen(false);
                        openGlitchModal();
                      }}
                      className="inline-flex items-center gap-1.5 text-[11px] font-bold text-red-600 dark:text-red-400 hover:underline cursor-pointer"
                    >
                      <Bug className="w-3.5 h-3.5 text-red-500" />
                      <span>ڕاپۆرتکردنی هەر گلیچ یان ئیرۆرێک بۆ سوپەر ئەدمین (WhatsApp) 💬</span>
                    </button>
                  </div>
                </>
              )}

            </div>

          </div>
        </div>
      )}
    </>
  );
};

