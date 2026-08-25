import React, { useState } from 'react';
import { Sparkles, RefreshCw, CheckCircle2, AlertTriangle, ArrowRight, X, Layers, BellRing, Smartphone, ShieldCheck } from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useLanguage } from '../../context/LanguageContext';

export const AppUpdateAlert: React.FC = () => {
  const {
    appVersion,
    isAppUpdateAvailable,
    dismissUpdateNotification,
    isUpdateModalOpen,
    setIsUpdateModalOpen
  } = useMarketplace();
  const { t } = useLanguage();

  const [isUpdating, setIsUpdating] = useState(false);
  const [updateSuccess, setUpdateSuccess] = useState(false);

  // If no update is available and modal is closed, render nothing
  if (!isAppUpdateAvailable && !isUpdateModalOpen) {
    return null;
  }

  const handleApplyUpdate = () => {
    setIsUpdating(true);
    // Simulate cache clear and refresh
    dismissUpdateNotification(appVersion.version);
    setTimeout(() => {
      setIsUpdating(false);
      setUpdateSuccess(true);
      setTimeout(() => {
        setIsUpdateModalOpen(false);
        setUpdateSuccess(false);
        window.location.reload();
      }, 1000);
    }, 1200);
  };

  return (
    <>
      {/* 1. Floating Animated Update Pill / Banner (when modal is closed but update is available) */}
      {isAppUpdateAvailable && !isUpdateModalOpen && (
        <div className="fixed bottom-20 md:bottom-6 right-4 left-4 md:left-auto md:right-6 z-50 max-w-md animate-bounce-subtle">
          <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 text-white p-4 rounded-2xl shadow-2xl border border-orange-500/40 backdrop-blur-lg flex items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="relative">
                <div className="w-10 h-10 rounded-xl bg-orange-500/20 text-orange-400 border border-orange-500/30 flex items-center justify-center font-black">
                  <Sparkles className="w-5 h-5 text-orange-400 animate-spin" style={{ animationDuration: '6s' }} />
                </div>
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-900 animate-ping" />
                <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-rose-500 rounded-full border-2 border-slate-900" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-white">{t('ئەپدەیتی نوێی شاخی')}</span>
                  <span className="text-[10px] font-latin font-bold bg-orange-500 text-white px-2 py-0.5 rounded-md">
                    v{appVersion.version}
                  </span>
                </div>
                <p className="text-[11px] text-slate-300 line-clamp-1 mt-0.5">
                  {appVersion.title || t('نوێکاری و تایبەتمەندی نوێ بەردەستە')}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 flex-shrink-0">
              <button
                onClick={() => setIsUpdateModalOpen(true)}
                className="px-3 py-1.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md transition-transform active:scale-95 cursor-pointer flex items-center gap-1"
              >
                <span>{t('نوێکردنەوە')}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
              {!appVersion.isMandatory && (
                <button
                  onClick={() => dismissUpdateNotification(appVersion.version)}
                  className="p-1 text-slate-400 hover:text-white rounded-lg cursor-pointer"
                  title={t('دواتر')}
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* 2. Full Update Modal */}
      {isUpdateModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 text-slate-900 dark:text-white">
            
            {/* Header Banner */}
            <div className="bg-gradient-to-r from-orange-600 via-amber-600 to-orange-700 p-6 text-white relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
              <div className="relative z-10 flex items-start justify-between">
                <div className="space-y-1.5">
                  <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3 py-1 rounded-full text-xs font-black">
                    <Sparkles className="w-4 h-4 text-amber-200" />
                    <span>{t('ئەپدەیت و وەشانی فەرمی')}</span>
                    <span className="font-latin bg-white text-orange-600 px-2 py-0.2 rounded-md font-bold text-[11px]">
                      v{appVersion.version}
                    </span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">
                    {appVersion.title || t('وەشانی نوێی شاخی بەردەستە!')}
                  </h2>
                  <p className="text-xs text-white/90">
                    {t('بەرواری دەرچوون:')} {appVersion.releaseDate || '2026-08-25'}
                  </p>
                </div>

                {!appVersion.isMandatory && (
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

                <div className="space-y-2 max-h-60 overflow-y-auto pr-1">
                  {(appVersion.changelog && appVersion.changelog.length > 0 ? appVersion.changelog : [
                    'ڕێکخستن و دیزاینی مۆدێرنی مێنیو و کۆکردنەوەی بەشەکان لە ناو یەک لێبل',
                    'چاککردنی تەواوی دۆخی تاریک (Dark Mode) لە هەموو بەشەکانی پلاتفۆرم',
                    'پشتیوانی زانیارییە وردەکانی کاپتن و چاودێری ئەرکەکان',
                    'سیستەمی زیرەکی ئاگاداری ڕاستەوخۆ بۆ بەردەستبوونی هەر ئەپدەیتێکی نوێ',
                    'بەرزکردنەوەی خێرایی و پاراستنی داتاکان بە کلاود فایەربەیس'
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

              {/* Mandatory warning if applicable */}
              {appVersion.isMandatory && (
                <div className="p-3 bg-amber-50 dark:bg-amber-950/40 border border-amber-300 dark:border-amber-800 rounded-xl flex items-center gap-2.5 text-xs text-amber-900 dark:text-amber-200 font-bold">
                  <AlertTriangle className="w-4 h-4 text-amber-600 flex-shrink-0" />
                  <span>{t('ئەم ئەپدەیتە ناچارییە بۆ پاراستنی ئەمنییەت و دروستی کارکردنی ئەپ.')}</span>
                </div>
              )}

              {/* Actions */}
              <div className="flex items-center gap-3 pt-2">
                <button
                  onClick={handleApplyUpdate}
                  disabled={isUpdating || updateSuccess}
                  className="flex-1 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-black text-xs shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer disabled:opacity-50"
                >
                  {isUpdating ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      <span>{t('خەریکی نوێکردنەوە و ڕیفرێشە...')}</span>
                    </>
                  ) : updateSuccess ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-300" />
                      <span>{t('بە سەرکەوتوویی نوێکرایەوە!')}</span>
                    </>
                  ) : (
                    <>
                      <RefreshCw className="w-4 h-4" />
                      <span>{t('نوێکردنەوە و ڕیفرێشی ئەپ دەستبەجێ')}</span>
                    </>
                  )}
                </button>

                {!appVersion.isMandatory && (
                  <button
                    onClick={() => {
                      dismissUpdateNotification(appVersion.version);
                      setIsUpdateModalOpen(false);
                    }}
                    className="px-5 py-3.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-2xl text-xs font-bold cursor-pointer transition-colors"
                  >
                    {t('دواتر')}
                  </button>
                )}
              </div>

            </div>

          </div>
        </div>
      )}
    </>
  );
};
