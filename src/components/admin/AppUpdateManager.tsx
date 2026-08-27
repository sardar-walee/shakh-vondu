import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Plus,
  Trash2,
  Layers,
  History,
  ShieldCheck,
  Smartphone,
  Eye,
  Sliders,
  Check
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { AppVersionInfo } from '../../types';

export const AppUpdateManager: React.FC = () => {
  const {
    appVersion,
    publishAppUpdate,
    openUpdateModal,
    setIsUpdateModalOpen
  } = useMarketplace();

  const [version, setVersion] = useState(appVersion.version || '2.5.0');
  const [buildNumber, setBuildNumber] = useState(appVersion.buildNumber || 250);
  const [title, setTitle] = useState(appVersion.title || 'وەشانی نوێی (شاخ) بەردەستە');
  const [description, setDescription] = useState(appVersion.description || 'سیستەمی تەواوی بەڕێوەبردنی کاپتنەکان بۆ هەموو ڕۆڵەکان و دروستکردنی QR Code ی دابەزاندنی ئەپ');
  const [changelog, setChangelog] = useState<string[]>(appVersion.changelog || [
    'دروستکردنی QR Code بۆ دابەزاندنی خێرای ئەپ بۆ ئەندرۆید و ئەپڵ',
    'سیستەمی نوێی ئاگاداری ڕاستەوخۆ و ناچاری بۆ بەردەستبوونی هەر ئەپدەیتێکی نوێ',
    'گۆڕینی ناوی فەرمی پلاتفۆرم بۆ (شاخ)',
    'زیادکردنی بەڕێوەبردنی تەواوی کاپتنانی گەیاندن لە داشبۆردی هەموو ڕۆڵەکان'
  ]);
  const [newLogItem, setNewLogItem] = useState('');
  const [isMandatory, setIsMandatory] = useState<boolean>(appVersion.isMandatory || true);
  const [actionUrl, setActionUrl] = useState(appVersion.actionUrl || '');
  const [androidDownloadUrl, setAndroidDownloadUrl] = useState(appVersion.androidDownloadUrl || 'https://daim-post.online/download/android/shakh-app.apk');
  const [iosDownloadUrl, setIosDownloadUrl] = useState(appVersion.iosDownloadUrl || 'https://apps.apple.com/app/shakh-kurdistan/id640000000');
  const [isPublishing, setIsPublishing] = useState(false);
  const [publishSuccess, setPublishSuccess] = useState<string | null>(null);

  const handleAddLogItem = () => {
    if (!newLogItem.trim()) return;
    setChangelog(prev => [...prev, newLogItem.trim()]);
    setNewLogItem('');
  };

  const handleRemoveLogItem = (index: number) => {
    setChangelog(prev => prev.filter((_, i) => i !== index));
  };

  const handlePublish = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!version.trim() || !title.trim()) {
      alert('تکایە ژمارەی وەشان و ناونیشانی ئەپدەیت بنووسە.');
      return;
    }

    setIsPublishing(true);
    setPublishSuccess(null);

    const updateInfo: Partial<AppVersionInfo> = {
      version: version.trim(),
      buildNumber: Number(buildNumber) || 1,
      releaseDate: new Date().toISOString().split('T')[0],
      title: title.trim(),
      description: description.trim(),
      changelog: changelog.filter(l => l.trim().length > 0),
      isMandatory,
      actionUrl: actionUrl.trim() || undefined,
      androidDownloadUrl: androidDownloadUrl.trim() || undefined,
      iosDownloadUrl: iosDownloadUrl.trim() || undefined,
      publishedBy: 'سوپەر ئەدمین'
    };

    const res = await publishAppUpdate(updateInfo);
    setIsPublishing(false);
    if (res.success) {
      setPublishSuccess(res.message || 'وەشانی نوێ بە سەرکەوتوویی بۆ هەموو بەکارهێنەران بڵاوکرایەوە.');
      setTimeout(() => setPublishSuccess(null), 5000);
    }
  };

  return (
    <div className="space-y-6">
      
      {/* Top Banner */}
      <div className="bg-gradient-to-r from-slate-950 via-slate-900 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-indigo-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/10 backdrop-blur-md rounded-full text-xs font-black">
            <Sparkles className="w-4 h-4 text-amber-300" />
            <span>سیستەمی بڵاوکردنەوەی ئەپدەیت و وەشانەکان (Live App Update Broadcast)</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white">
            ئاگاداری بەکارهێنەران لە ئەپدەیتە نوێیەکان
          </h2>
          <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
            لە ڕێگەی ئەم بەشەوە، دەتوانیت هەر وەشانێکی نوێی ئەپلیکەیشن بۆ هەموو بەکارهێنەران بڵاوبکەیتەوە. لەسەر مۆبایل و کۆمپیوتەری هەمووان دەستبەجێ ئاگاداری دەردەکەوێت.
          </p>
        </div>

        {/* Current Active Live Version Badge */}
        <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/15 text-center min-w-[160px] space-y-1">
          <span className="text-[10px] text-slate-300 font-bold block">وەشانی کارای ئێستا:</span>
          <span className="text-2xl font-black text-amber-400 font-latin block">
            {appVersion.version}
          </span>
          <span className="text-[10px] text-emerald-400 font-bold block">
            بەروار: {appVersion.releaseDate || 'ئەمڕۆ'}
          </span>
        </div>
      </div>

      {publishSuccess && (
        <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl flex items-center gap-3 text-emerald-900 text-xs font-bold animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>{publishSuccess}</span>
        </div>
      )}

      {/* Main Grid: Form + Live Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Form to Publish New Version */}
        <div className="lg:col-span-7 bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-5">
          <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Sliders className="w-4 h-4 text-orange-500" />
              <span>فۆڕمی بڵاوکردنەوەی وەشانی نوێ</span>
            </h3>
            <span className="text-[11px] text-slate-400">ڕاستەوخۆ دەگاتە هەموو بەکارهێنەران</span>
          </div>

          <form onSubmit={handlePublish} className="space-y-4 text-xs">
            
            {/* Version & Build */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ژمارەی وەشان (Version String) *
                </label>
                <input
                  type="text"
                  required
                  value={version}
                  onChange={(e) => setVersion(e.target.value)}
                  placeholder="وەک: 2.5.0"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-latin font-bold text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                  ژمارەی بونیادنان (Build Number)
                </label>
                <input
                  type="number"
                  value={buildNumber}
                  onChange={(e) => setBuildNumber(Number(e.target.value))}
                  placeholder="250"
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-latin text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
                />
              </div>
            </div>

            {/* Title */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                ناونیشانی کورت بۆ بەکارهێنەران *
              </label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="وەک: وەشانی نوێی (شاخ) ٢.٥.٠ بەردەستە!"
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500 font-bold"
              />
            </div>

            {/* Description */}
            <div>
              <label className="font-bold text-slate-700 dark:text-slate-300 block mb-1">
                ڕوونکردنەوەی سەرەکی
              </label>
              <textarea
                rows={2}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="پوختەی تایبەتمەندییە سەرەکییەکان..."
                className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
              />
            </div>

            {/* Changelog Bullets Manager */}
            <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-800">
              <label className="font-bold text-slate-700 dark:text-slate-300 block">
                لیستی نوێکاری و تایبەتمەندییەکان (Changelog Bullets):
              </label>

              <div className="flex gap-2">
                <input
                  type="text"
                  value={newLogItem}
                  onChange={(e) => setNewLogItem(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault();
                      handleAddLogItem();
                    }
                  }}
                  placeholder="نوێکاری نوێ بنووسە و ئینتەر دابگرە..."
                  className="flex-1 bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:border-orange-500"
                />
                <button
                  type="button"
                  onClick={handleAddLogItem}
                  className="px-4 py-2.5 bg-slate-800 dark:bg-slate-700 text-white font-bold rounded-xl cursor-pointer"
                >
                  زیادکردن
                </button>
              </div>

              <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
                {changelog.map((item, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2.5 rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 text-xs"
                  >
                    <span className="text-slate-800 dark:text-slate-200 flex-1 pl-2">
                      • {item}
                    </span>
                    <button
                      type="button"
                      onClick={() => handleRemoveLogItem(index)}
                      className="text-rose-500 hover:text-rose-700 p-1 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>

            {/* Mandatory Checkbox */}
            <div className="p-3.5 rounded-2xl bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/50 flex items-center justify-between">
              <div>
                <label className="font-bold text-amber-950 dark:text-amber-200 block">
                  ئەپدەیتی ناچاری (Mandatory Update)
                </label>
                <p className="text-[11px] text-amber-800 dark:text-amber-300">
                  ئەگەر چالاک بێت، بەکارهێنەر پێویستە دەستبەجێ ئەپەکە نوێ بکاتەوە بۆ بەردەوامبوون.
                </p>
              </div>
              <input
                type="checkbox"
                checked={isMandatory}
                onChange={(e) => setIsMandatory(e.target.checked)}
                className="w-5 h-5 rounded text-orange-500 accent-orange-500 cursor-pointer"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-3">
              <button
                type="button"
                onClick={openUpdateModal}
                className="px-4 py-3 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl font-bold flex items-center gap-1.5 cursor-pointer"
              >
                <Eye className="w-4 h-4" />
                <span>تاقیکردنەوە و بینینی دیالۆگ</span>
              </button>

              <button
                type="submit"
                disabled={isPublishing}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white rounded-xl font-black shadow-lg shadow-orange-500/25 flex items-center gap-2 cursor-pointer disabled:opacity-50 transition-transform active:scale-95"
              >
                <Send className="w-4 h-4" />
                <span>{isPublishing ? 'خەریکی بڵاوکردنەوەیە...' : 'بڵاوکردنەوەی ئەپدەیت بۆ هەمووان'}</span>
              </button>
            </div>

          </form>
        </div>

        {/* Live Preview Card */}
        <div className="lg:col-span-5 space-y-5">
          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs space-y-4">
            <h4 className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-2">
              <Smartphone className="w-4 h-4 text-orange-500" />
              <span>پێشبینینی شێوازی دەرکەوتن لای بەکارهێنەر</span>
            </h4>

            {/* Toast Mockup */}
            <div className="bg-slate-950 text-white p-4 rounded-2xl border border-orange-500/40 shadow-xl space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-orange-400" />
                  <span className="text-xs font-black">ئەپدەیتی نوێی (شاخ)</span>
                </div>
                <span className="text-[10px] font-latin font-bold bg-orange-500 text-white px-2 py-0.5 rounded-md">
                  v{version}
                </span>
              </div>
              <p className="text-xs font-bold text-white line-clamp-1">{title}</p>
              <p className="text-[11px] text-slate-400 line-clamp-2">{description}</p>
            </div>

            {/* Feature Checklist */}
            <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700 space-y-2">
              <span className="text-[11px] font-bold text-slate-500 block">گۆڕانکارییە دیاریکراوەکان:</span>
              <div className="space-y-1.5">
                {changelog.map((c, i) => (
                  <div key={i} className="flex items-start gap-2 text-xs text-slate-700 dark:text-slate-300">
                    <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0 mt-0.5" />
                    <span>{c}</span>
                  </div>
                ))}
              </div>
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};
