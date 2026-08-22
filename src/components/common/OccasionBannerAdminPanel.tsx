import React, { useState, useEffect } from 'react';
import {
  Sparkles,
  Save,
  Image as ImageIcon,
  CheckCircle2,
  X,
  Eye,
  EyeOff,
  ShieldAlert,
  Heart,
  Edit3,
  RotateCcw,
  Copy,
  Check,
  ChevronDown,
  ChevronUp,
  Calendar,
  Clock,
  AlertCircle,
  Trash2
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { OccasionBanner, OccasionType, OccasionThemeStyle } from '../../types';
import { OCCASION_PRESETS } from '../../data/occasionPresets';

interface OccasionBannerAdminPanelProps {
  isOpen?: boolean;
  onClose?: () => void;
  isModal?: boolean;
}

export const OccasionBannerAdminPanel: React.FC<OccasionBannerAdminPanelProps> = ({
  isOpen = true,
  onClose,
  isModal = false
}) => {
  const { occasionBanner, updateOccasionBanner } = useMarketplace();
  const { currentUser, isSuperAdmin } = useAuth();

  // Security Check: Only admin or super_admin
  const hasAccess = isSuperAdmin || currentUser?.role === 'admin';

  // Draft state for real-time live preview before saving to Firestore
  const [draftBanner, setDraftBanner] = useState<OccasionBanner>(() => ({
    id: occasionBanner?.id || 'occasion-current',
    isActive: occasionBanner?.isActive ?? true,
    type: occasionBanner?.type || 'mawlid',
    badge: occasionBanner?.badge || '🌹 یادی لەدایکبوونی پێغەمبەر ﷺ',
    title: occasionBanner?.title || 'بەخێر بێتەوە یادی لەدایکبوونی فەخری کائینات و پێغەمبەری مەزن (محمد ﷺ)',
    subtitle: occasionBanner?.subtitle || 'اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ وَعَلَىٰ آلِهِ وَصَحْبِهِ أَجْمَعِينَ',
    description: occasionBanner?.description || '',
    praisePoem: occasionBanner?.praisePoem || '',
    imageUrl: occasionBanner?.imageUrl || '',
    themeStyle: occasionBanner?.themeStyle || 'emerald_gold',
    showSalawatCounter: occasionBanner?.showSalawatCounter ?? true,
    salawatCount: occasionBanner?.salawatCount || 1000,
    startDate: occasionBanner?.startDate || '',
    endDate: occasionBanner?.endDate || '',
    updatedAt: occasionBanner?.updatedAt || new Date().toISOString()
  }));

  // Real-Time Live Preview Toggle
  const [isPreviewActive, setIsPreviewActive] = useState<boolean>(true);
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [saveSuccess, setSaveSuccess] = useState<boolean>(false);
  const [previewExpanded, setPreviewExpanded] = useState<boolean>(false);
  const [copied, setCopied] = useState<boolean>(false);

  // Sync draft state if external banner updates
  useEffect(() => {
    if (occasionBanner) {
      setDraftBanner({ ...occasionBanner });
    }
  }, [occasionBanner]);

  // Schedule status evaluation
  const now = new Date();
  const startDateObj = draftBanner.startDate ? new Date(draftBanner.startDate) : null;
  const endDateObj = draftBanner.endDate ? new Date(draftBanner.endDate) : null;

  const isFutureSchedule = startDateObj && !isNaN(startDateObj.getTime()) ? startDateObj > now : false;
  const isExpiredSchedule = endDateObj && !isNaN(endDateObj.getTime()) ? endDateObj < now : false;
  const isWithinSchedule = !isFutureSchedule && !isExpiredSchedule;

  const handleQuickSchedule = (action: 'now' | '7days' | '30days' | 'clear') => {
    const currentDate = new Date();
    const pad = (n: number) => n.toString().padStart(2, '0');
    const toLocalISO = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;

    if (action === 'now') {
      setDraftBanner((prev) => ({
        ...prev,
        startDate: toLocalISO(currentDate)
      }));
    } else if (action === '7days') {
      const end7 = new Date(currentDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      setDraftBanner((prev) => ({
        ...prev,
        startDate: prev.startDate || toLocalISO(currentDate),
        endDate: toLocalISO(end7)
      }));
    } else if (action === '30days') {
      const end30 = new Date(currentDate.getTime() + 30 * 24 * 60 * 60 * 1000);
      setDraftBanner((prev) => ({
        ...prev,
        startDate: prev.startDate || toLocalISO(currentDate),
        endDate: toLocalISO(end30)
      }));
    } else if (action === 'clear') {
      setDraftBanner((prev) => ({
        ...prev,
        startDate: '',
        endDate: ''
      }));
    }
  };

  if (isModal && !isOpen) return null;

  // Access Denied State for Unauthorized Users
  if (!hasAccess) {
    const accessDeniedContent = (
      <div className="bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-900/60 p-6 rounded-3xl text-center space-y-3">
        <ShieldAlert className="w-12 h-12 text-rose-500 mx-auto" />
        <h3 className="text-base font-black text-rose-800 dark:text-rose-200">
          ڕێگەپێدان نییە (دەسەڵاتی ئەدمین)
        </h3>
        <p className="text-xs text-rose-600 dark:text-rose-300 max-w-md mx-auto">
          تەنها بەکارهێنەرانی خاوەن دەسەڵاتی سوپەر ئەدمین دەتوانن دەستکاری زانیارییەکانی بۆنە و یادەکان لە Firestore بکەن.
        </p>
        {isModal && onClose && (
          <button
            type="button"
            onClick={onClose}
            className="px-5 py-2 bg-rose-600 text-white font-bold text-xs rounded-xl hover:bg-rose-700 transition-colors cursor-pointer mt-2"
          >
            داخستن
          </button>
        )}
      </div>
    );

    if (isModal) {
      return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm">
          <div className="bg-white dark:bg-slate-900 rounded-3xl p-6 max-w-lg w-full shadow-2xl">
            {accessDeniedContent}
          </div>
        </div>
      );
    }
    return accessDeniedContent;
  }

  // Handle Preset Selection
  const handleApplyPreset = (type: OccasionType) => {
    const preset = OCCASION_PRESETS.find((p) => p.type === type);
    if (!preset) return;
    setDraftBanner((prev) => ({
      ...prev,
      type: preset.type,
      badge: preset.badge,
      title: preset.title,
      subtitle: preset.subtitle,
      description: preset.description,
      praisePoem: preset.praisePoem,
      imageUrl: preset.imageUrl,
      themeStyle: preset.themeStyle
    }));
  };

  // Save to Firestore
  const handleSaveToFirestore = async () => {
    setIsSaving(true);
    setSaveSuccess(false);
    const updated: OccasionBanner = {
      ...draftBanner,
      salawatCount: Number(draftBanner.salawatCount) || 0,
      updatedAt: new Date().toISOString()
    };
    await updateOccasionBanner(updated);
    setIsSaving(false);
    setSaveSuccess(true);
    setTimeout(() => setSaveSuccess(false), 4000);
  };

  // Dynamic Theme Generator for Preview
  const getThemeClasses = (style: OccasionThemeStyle) => {
    switch (style) {
      case 'royal_midnight':
        return {
          bg: 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-indigo-500/30 text-indigo-100',
          badge: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
          accentText: 'text-amber-300 font-serif',
          buttonBg: 'bg-amber-500 text-slate-950'
        };
      case 'rose_amber':
        return {
          bg: 'bg-gradient-to-r from-rose-950 via-amber-950 to-rose-900 border-rose-500/30 text-rose-100',
          badge: 'bg-rose-400/20 text-rose-200 border-rose-400/30',
          accentText: 'text-amber-200 font-serif',
          buttonBg: 'bg-rose-500 text-white'
        };
      case 'warm_sunset':
        return {
          bg: 'bg-gradient-to-r from-amber-950 via-orange-950 to-red-950 border-amber-500/30 text-amber-100',
          badge: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
          accentText: 'text-amber-300 font-serif',
          buttonBg: 'bg-amber-500 text-slate-950'
        };
      case 'pure_green':
        return {
          bg: 'bg-gradient-to-r from-green-950 via-emerald-900 to-green-900 border-green-500/30 text-emerald-100',
          badge: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
          accentText: 'text-amber-300 font-serif',
          buttonBg: 'bg-emerald-500 text-slate-950'
        };
      case 'emerald_gold':
      default:
        return {
          bg: 'bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border-amber-500/30 text-emerald-50',
          badge: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
          accentText: 'text-amber-300 font-serif',
          buttonBg: 'bg-amber-400 text-slate-950 font-black'
        };
    }
  };

  const currentTheme = getThemeClasses(draftBanner.themeStyle);

  const panelContent = (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="bg-gradient-to-r from-emerald-900 via-teal-900 to-slate-900 text-white p-5 sm:p-6 rounded-3xl border border-emerald-500/30 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="space-y-1">
          <div className="flex items-center gap-2">
            <Sparkles className="w-6 h-6 text-amber-400 animate-spin-slow" />
            <h2 className="text-lg sm:text-xl font-black">
              کۆنتڕۆڵپەنەڵی بۆنە و یادەکان (Occasion Header Panel)
            </h2>
          </div>
          <p className="text-xs text-emerald-200">
            گۆڕینی ڕاستەوخۆی بەیاننامە، مەدحی پێغەمبەر ﷺ، وێنە و ڕەنگی هێدەر بۆ گشت کڕیاران لە ڕێگەی Firestore.
          </p>
        </div>

        <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
          {/* Real-time Preview Toggle Switch */}
          <button
            type="button"
            onClick={() => setIsPreviewActive(!isPreviewActive)}
            className={`px-3.5 py-2 rounded-2xl text-xs font-bold border flex items-center gap-2 transition-all cursor-pointer ${
              isPreviewActive
                ? 'bg-amber-400 text-slate-950 border-amber-300 font-black shadow-md'
                : 'bg-white/10 text-white border-white/20 hover:bg-white/20'
            }`}
          >
            {isPreviewActive ? <Eye className="w-4 h-4 text-slate-950" /> : <EyeOff className="w-4 h-4" />}
            <span>{isPreviewActive ? 'پێشبینین چالاکە' : 'پێشبینین ناچالاکە'}</span>
          </button>

          {/* Save Button */}
          <button
            type="button"
            onClick={handleSaveToFirestore}
            disabled={isSaving}
            className="px-5 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-black rounded-2xl text-xs flex items-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
          >
            <Save className="w-4 h-4" />
            <span>{isSaving ? 'پاشەکەوت دەکرێت...' : 'پاشەکەوتکردن لە Firestore'}</span>
          </button>

          {isModal && onClose && (
            <button
              type="button"
              onClick={onClose}
              className="p-2 text-white/70 hover:text-white bg-white/10 rounded-xl transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>
          )}
        </div>
      </div>

      {saveSuccess && (
        <div className="bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 p-4 rounded-2xl font-bold text-xs flex items-center gap-2 animate-fadeIn">
          <CheckCircle2 className="w-5 h-5 text-emerald-500 shrink-0" />
          <span>زانیارییەکان بە سەرکەوتوویی لە دۆکیومێنتی Firestore پاشەکەوت کران و لەسەر تەواوی پلاتفۆرمەکە نوێبوونەوە.</span>
        </div>
      )}

      {/* REAL-TIME PREVIEW BANNER CONTAINER */}
      {isPreviewActive && (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 px-1">
            <span className="flex items-center gap-1.5 text-amber-500">
              <Eye className="w-4 h-4" />
              <span>پێشبینینی ڕاستەوخۆ (Real-time Preview - Unsaved Draft):</span>
            </span>
            <span className="text-[10px] bg-amber-400/20 text-amber-600 dark:text-amber-300 px-2.5 py-0.5 rounded-full">
              تەنها هەرتەپێک لەم خوارەوە بگۆڕیت ڕاستەوخۆ لێرە دەردەکەوێت
            </span>
          </div>

          <div className="rounded-3xl overflow-hidden border-2 border-amber-400/40 shadow-xl transition-all">
            <div className={`relative border-b p-4 sm:p-5 overflow-hidden ${currentTheme.bg}`}>
              <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />

              {!draftBanner.isActive && (
                <div className="bg-rose-600 text-white text-[10px] font-bold py-1 px-3 rounded-lg mb-3 text-center">
                  ⚠️ تێبینی: ئەم بۆنەیە لە ئێستادا ناچالاکە (Inactive)؛ کڕیاران لای خۆیان ناینەوێنن.
                </div>
              )}

              <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="flex items-start gap-3 flex-1">
                  {draftBanner.imageUrl ? (
                    <img
                      src={draftBanner.imageUrl}
                      alt={draftBanner.badge}
                      className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-400/40 shadow-md shrink-0 mt-0.5"
                    />
                  ) : (
                    <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
                      ✨
                    </div>
                  )}

                  <div className="space-y-1.5 flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border ${currentTheme.badge}`}>
                        <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                        <span>{draftBanner.badge || 'نیشانەی بۆنە'}</span>
                      </span>
                    </div>

                    <h2 className="text-sm sm:text-base font-black text-white leading-snug">
                      {draftBanner.title || 'سەردێڕی بۆنەکە دەستکاری بکە...'}
                    </h2>

                    <p className={`text-xs sm:text-sm font-arabic font-bold ${currentTheme.accentText} leading-relaxed dir-rtl`}>
                      {draftBanner.subtitle || 'دەقی درود و سڵاو...'}
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2 sm:gap-3 shrink-0 flex-wrap">
                  {draftBanner.showSalawatCounter && (
                    <div className={`px-4 py-2 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md ${currentTheme.buttonBg}`}>
                      <Heart className="w-4 h-4 fill-current" />
                      <span>ناردنی درود و سڵاو</span>
                      <span className="bg-slate-950/20 px-2 py-0.5 rounded-lg text-[11px] font-latin font-black">
                        {(draftBanner.salawatCount || 0).toLocaleString()}
                      </span>
                    </div>
                  )}

                  {(draftBanner.praisePoem || draftBanner.description) && (
                    <button
                      type="button"
                      onClick={() => setPreviewExpanded(!previewExpanded)}
                      className="px-3 py-2 bg-white/10 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 hover:bg-white/20 transition-colors cursor-pointer"
                    >
                      <span>مەدح و شیعری مەولود</span>
                      {previewExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                    </button>
                  )}
                </div>
              </div>

              {/* Expandable Poem Preview */}
              {previewExpanded && (draftBanner.praisePoem || draftBanner.description) && (
                <div className="mt-4 pt-4 border-t border-white/10 space-y-3">
                  {draftBanner.description && (
                    <p className="text-xs text-slate-200 leading-relaxed font-medium bg-black/20 p-3 rounded-2xl">
                      {draftBanner.description}
                    </p>
                  )}

                  {draftBanner.praisePoem && (
                    <div className="bg-black/30 border border-amber-400/20 p-4 rounded-2xl text-center space-y-2">
                      <div className="text-amber-300 text-xs font-bold flex items-center justify-center gap-2">
                        <Sparkles className="w-4 h-4" />
                        <span>مەدح و دێڕە شێعری پیرۆز</span>
                      </div>
                      <pre className="text-xs sm:text-sm font-serif font-bold text-amber-100 whitespace-pre-wrap leading-loose dir-rtl">
                        {draftBanner.praisePoem}
                      </pre>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Preset Buttons */}
      <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400">
            قالبی ئامادەکراوی بۆنەکان (Presets):
          </h3>
          <span className="text-[11px] text-amber-600 dark:text-amber-400 font-bold">
            دابگرە بۆ پڕکردنەوەی خێرا
          </span>
        </div>

        <div className="flex flex-wrap gap-2">
          {OCCASION_PRESETS.map((p) => (
            <button
              key={p.type}
              type="button"
              onClick={() => handleApplyPreset(p.type)}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold border transition-all cursor-pointer ${
                draftBanner.type === p.type
                  ? 'bg-amber-500 text-slate-950 border-amber-400 font-black shadow-xs'
                  : 'bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border-slate-200 dark:border-slate-700 hover:bg-slate-200'
              }`}
            >
              {p.name}
            </button>
          ))}
        </div>
      </div>

      {/* EDIT FORM INPUTS */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        
        {/* Left Column: Text & Content Inputs */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <Edit3 className="w-4 h-4 text-amber-500" />
            <span>دەستکاریکردنی نوسین و بەیاننامە</span>
          </h3>

          {/* Active Switch */}
          <div className="flex items-center justify-between p-3.5 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700">
            <div>
              <span className="text-xs font-bold text-slate-800 dark:text-slate-200">پیشاندانی بۆنەکە بۆ بەکارهێنەران</span>
              <p className="text-[11px] text-slate-400">ئەگەر کوژاوە بێت، هێدەرەکە دەشاردرێتەوە.</p>
            </div>
            <button
              type="button"
              onClick={() => setDraftBanner((prev) => ({ ...prev, isActive: !prev.isActive }))}
              className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                draftBanner.isActive ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
              }`}
            >
              <span
                className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                  draftBanner.isActive ? 'right-7' : 'right-1'
                }`}
              />
            </button>
          </div>

          {/* SCHEDULE & TIMINGS BOX (START DATE & END DATE) */}
          <div className="p-4 bg-amber-500/10 dark:bg-slate-800/80 rounded-2xl border border-amber-500/30 space-y-3">
            <div className="flex items-center justify-between border-b border-amber-500/20 pb-2.5">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span className="text-xs font-bold text-slate-900 dark:text-slate-100">
                  خشتەی کاتی بڵاوکردنەوە (Scheduling & Timings)
                </span>
              </div>

              {/* Status Indicator Badge */}
              <div className="flex items-center gap-1.5">
                {!draftBanner.isActive ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/20 text-rose-600 dark:text-rose-400 border border-rose-500/30">
                    🔴 ناچالاکە
                  </span>
                ) : isFutureSchedule ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 border border-amber-500/30">
                    ⏳ چاوەڕوانی دەستپێکردن
                  </span>
                ) : isExpiredSchedule ? (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-500/20 text-slate-600 dark:text-slate-400 border border-slate-500/30">
                    ⌛ کاتی بەسەرچوو
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 border border-emerald-500/30">
                    🟢 بڵاوکراوەتەوە (Active)
                  </span>
                )}
              </div>
            </div>

            <p className="text-[11px] text-slate-500 dark:text-slate-400">
              بە دیاریکردنی کاتی دەستپێکردن و کۆتایی، هێدەرەکە بە شێوەیەکی ئۆتۆماتیکی لە کاتی دیاریکراودا دەردەکەوێت و دەشاردرێتەوە.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Start Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-amber-500" />
                  <span>کاتی دەستپێکردن (Start Date):</span>
                </label>
                <input
                  type="datetime-local"
                  value={draftBanner.startDate || ''}
                  onChange={(e) => setDraftBanner((prev) => ({ ...prev, startDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold font-latin focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>

              {/* End Date */}
              <div className="space-y-1">
                <label className="text-[11px] font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-rose-500" />
                  <span>کاتی کۆتایی (End Date):</span>
                </label>
                <input
                  type="datetime-local"
                  value={draftBanner.endDate || ''}
                  onChange={(e) => setDraftBanner((prev) => ({ ...prev, endDate: e.target.value }))}
                  className="w-full px-3 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold font-latin focus:ring-2 focus:ring-amber-500 outline-none"
                />
              </div>
            </div>

            {/* Quick Actions Shortcuts */}
            <div className="flex flex-wrap items-center justify-between gap-2 pt-1">
              <span className="text-[10px] font-bold text-slate-400">کرداری بەپەلە:</span>
              <div className="flex items-center gap-1.5 flex-wrap">
                <button
                  type="button"
                  onClick={() => handleQuickSchedule('now')}
                  className="px-2.5 py-1 bg-amber-400/20 hover:bg-amber-400/30 text-amber-800 dark:text-amber-300 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  ⚡ دەستپێکردن لە ئێستاوە
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSchedule('7days')}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  📅 تا ٧ ڕۆژی تر
                </button>
                <button
                  type="button"
                  onClick={() => handleQuickSchedule('30days')}
                  className="px-2.5 py-1 bg-slate-200 dark:bg-slate-700 hover:bg-slate-300 text-slate-700 dark:text-slate-200 rounded-lg text-[10px] font-bold transition-colors cursor-pointer"
                >
                  🗓️ تا ٣٠ ڕۆژی تر
                </button>
                {(draftBanner.startDate || draftBanner.endDate) && (
                  <button
                    type="button"
                    onClick={() => handleQuickSchedule('clear')}
                    className="px-2 py-1 bg-rose-500/10 hover:bg-rose-500/20 text-rose-600 dark:text-rose-400 rounded-lg text-[10px] font-bold transition-colors cursor-pointer flex items-center gap-1"
                  >
                    <Trash2 className="w-3 h-3" />
                    <span>پاککردنەوە</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Badge */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">نیشانەی خێرا (Badge):</label>
            <input
              type="text"
              value={draftBanner.badge}
              onChange={(e) => setDraftBanner((prev) => ({ ...prev, badge: e.target.value }))}
              placeholder="نموونە: 🌹 یادی مەولودی پیرۆزی پێغەمبەر ﷺ"
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Main Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">سەردێڕی پەیامەکە (Main Message / Title):</label>
            <input
              type="text"
              value={draftBanner.title}
              onChange={(e) => setDraftBanner((prev) => ({ ...prev, title: e.target.value }))}
              placeholder="بەخێر بێتەوە یادی لەدایکبوونی فەخری کائینات..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Subtitle / Salawat */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ژێرپێڕ و درودەکان (Subtitle / Verse):</label>
            <input
              type="text"
              value={draftBanner.subtitle}
              onChange={(e) => setDraftBanner((prev) => ({ ...prev, subtitle: e.target.value }))}
              placeholder="اللَّهُمَّ صَلِّ وَسَلِّمْ وَبَارِكْ عَلَىٰ نَبِيِّنَا مُحَمَّدٍ..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none font-arabic"
            />
          </div>

          {/* Detailed Description */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">پیرۆزبایی و شیکردنەوەی گشتی (Description):</label>
            <textarea
              rows={3}
              value={draftBanner.description || ''}
              onChange={(e) => setDraftBanner((prev) => ({ ...prev, description: e.target.value }))}
              placeholder="پیرۆزبایی گەرم لە تەواوی موسڵمانان دەکەین..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Praise Poem (مەدحی پێغەمبەر ﷺ) */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-amber-600 dark:text-amber-400">مەدح و دێڕە شێعری پیرۆز (Praise / Poem):</label>
              <span className="text-[10px] text-slate-400">کوردی یان عەرەبی</span>
            </div>
            <textarea
              rows={5}
              value={draftBanner.praisePoem || ''}
              onChange={(e) => setDraftBanner((prev) => ({ ...prev, praisePoem: e.target.value }))}
              placeholder="مەولودی شەریفە ئەمڕۆ شادمانە دڵی هەمووان..."
              className="w-full px-4 py-2.5 rounded-xl border border-amber-300 dark:border-amber-900/60 bg-amber-50/50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none font-serif leading-relaxed"
            />
          </div>

        </div>

        {/* Right Column: Theme, Image & Interactive Counter */}
        <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-4">
          <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 flex items-center gap-2 border-b border-slate-100 dark:border-slate-800 pb-3">
            <ImageIcon className="w-4 h-4 text-emerald-500" />
            <span>وێنەی هێدەر و ڕەنگی بەکگراوەند</span>
          </h3>

          {/* Image URL */}
          <div className="space-y-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">لینکی وێنە (Banner Image URL):</label>
            <input
              type="text"
              value={draftBanner.imageUrl || ''}
              onChange={(e) => setDraftBanner((prev) => ({ ...prev, imageUrl: e.target.value }))}
              placeholder="https://images.unsplash.com/..."
              className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-xs font-bold focus:ring-2 focus:ring-amber-500 outline-none font-latin"
            />

            {/* Quick Image Pickers */}
            <div className="space-y-1 pt-1">
              <span className="text-[11px] text-slate-400 font-bold">هەڵبژاردنی وێنەی ئامادەکراو:</span>
              <div className="flex items-center gap-2 overflow-x-auto pb-1">
                {[
                  'https://images.unsplash.com/photo-1564769625905-50e93615e769?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1534447677768-be436bb09401?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1584551246679-0daf3d275d0f?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1591604129939-f1efa4d9f7fa?auto=format&fit=crop&w=400&q=80',
                  'https://images.unsplash.com/photo-1542838132-92c53300491e?auto=format&fit=crop&w=400&q=80'
                ].map((imgUrl, i) => (
                  <button
                    key={i}
                    type="button"
                    onClick={() => setDraftBanner((prev) => ({ ...prev, imageUrl: imgUrl }))}
                    className={`w-12 h-12 rounded-xl overflow-hidden border-2 transition-all shrink-0 cursor-pointer ${
                      draftBanner.imageUrl === imgUrl
                        ? 'border-amber-500 scale-105 shadow-md'
                        : 'border-slate-200 dark:border-slate-700 hover:border-amber-300'
                    }`}
                  >
                    <img src={imgUrl} alt="Preset" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Theme Color Picker */}
          <div className="space-y-1 pt-2">
            <label className="text-xs font-bold text-slate-700 dark:text-slate-300">دیزاین و ڕەنگی هێدەر (Background Theme):</label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
              {[
                { id: 'emerald_gold', name: 'زمردی و زێڕین', color: 'bg-emerald-900 border-amber-400' },
                { id: 'royal_midnight', name: 'شینی شاهانە', color: 'bg-indigo-950 border-amber-400' },
                { id: 'rose_amber', name: 'گوڵاوی و ئەنبار', color: 'bg-rose-950 border-rose-300' },
                { id: 'warm_sunset', name: 'گەرمی پاییز', color: 'bg-amber-950 border-amber-400' },
                { id: 'pure_green', name: 'سەوزی تەواو', color: 'bg-green-900 border-emerald-400' }
              ].map((t) => (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setDraftBanner((prev) => ({ ...prev, themeStyle: t.id as OccasionThemeStyle }))}
                  className={`p-2.5 rounded-xl text-xs font-bold text-white border flex items-center gap-2 cursor-pointer transition-all ${t.color} ${
                    draftBanner.themeStyle === t.id ? 'ring-2 ring-amber-400 scale-102 shadow-md' : 'opacity-80 hover:opacity-100'
                  }`}
                >
                  <span className="w-3 h-3 rounded-full bg-amber-400 shrink-0" />
                  <span className="truncate">{t.name}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Salawat Counter Settings */}
          <div className="p-4 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200/80 dark:border-slate-700 space-y-3 mt-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Heart className="w-4 h-4 text-rose-500" />
                <span className="text-xs font-bold text-slate-800 dark:text-slate-200">کاونتەری درود ناردن</span>
              </div>
              <button
                type="button"
                onClick={() => setDraftBanner((prev) => ({ ...prev, showSalawatCounter: !prev.showSalawatCounter }))}
                className={`w-12 h-6 rounded-full transition-colors relative cursor-pointer ${
                  draftBanner.showSalawatCounter ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-700'
                }`}
              >
                <span
                  className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-transform ${
                    draftBanner.showSalawatCounter ? 'right-7' : 'right-1'
                  }`}
                />
              </button>
            </div>

            {draftBanner.showSalawatCounter && (
              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-700 dark:text-slate-300">ژمارەی دەستپێکی درودەکان:</label>
                <input
                  type="number"
                  value={draftBanner.salawatCount}
                  onChange={(e) => setDraftBanner((prev) => ({ ...prev, salawatCount: Number(e.target.value) }))}
                  className="w-full px-4 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs font-bold font-latin outline-none"
                />
              </div>
            )}
          </div>

          {/* Action Save Button */}
          <div className="pt-4">
            <button
              type="button"
              onClick={handleSaveToFirestore}
              disabled={isSaving}
              className="w-full py-3.5 bg-amber-400 hover:bg-amber-300 text-slate-950 font-black rounded-2xl text-sm flex items-center justify-center gap-2 shadow-lg transition-all cursor-pointer disabled:opacity-50"
            >
              <Save className="w-5 h-5" />
              <span>{isSaving ? 'پاشەکەوت دەکرێت...' : 'پاشەکەوتکردن لە Firestore'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );

  if (isModal) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm overflow-y-auto">
        <div className="bg-slate-50 dark:bg-slate-950 rounded-3xl p-6 max-w-5xl w-full shadow-2xl max-h-[90vh] overflow-y-auto my-auto border border-slate-200 dark:border-slate-800">
          {panelContent}
        </div>
      </div>
    );
  }

  return panelContent;
};
