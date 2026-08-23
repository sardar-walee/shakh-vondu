import React, { useState } from 'react';
import {
  Sparkles,
  Heart,
  ChevronDown,
  ChevronUp,
  Share2,
  Copy,
  Check,
  Edit3,
  Volume2,
  VolumeX,
  X
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';
import { OccasionThemeStyle } from '../../types';
import { OccasionBannerAdminPanel } from './OccasionBannerAdminPanel';

interface OccasionHeaderBannerProps {
  onOpenAdminManager?: () => void;
}

export const OccasionHeaderBanner: React.FC<OccasionHeaderBannerProps> = ({ onOpenAdminManager }) => {
  const { occasionBanner, incrementSalawatCount } = useMarketplace();
  const { isSuperAdmin } = useAuth();
  const { t } = useLanguage();

  const [isExpanded, setIsExpanded] = useState(false);
  const [isDismissed, setIsDismissed] = useState(false);
  const [copied, setCopied] = useState(false);
  const [salawatAnimated, setSalawatAnimated] = useState(false);
  const [isAdminPanelOpen, setIsAdminPanelOpen] = useState(false);

  const now = new Date();
  const isScheduledInFuture = occasionBanner?.startDate ? new Date(occasionBanner.startDate) > now : false;
  const isScheduledExpired = occasionBanner?.endDate ? new Date(occasionBanner.endDate) < now : false;
  const isTimeValid = !isScheduledInFuture && !isScheduledExpired;

  if (!occasionBanner || isDismissed) {
    return null;
  }

  // Non-admins do not see inactive or out-of-schedule banners
  if (!isSuperAdmin && (!occasionBanner.isActive || !isTimeValid)) {
    return null;
  }

  const handleSalawatClick = () => {
    incrementSalawatCount();
    setSalawatAnimated(true);
    setTimeout(() => setSalawatAnimated(false), 800);
  };

  const handleCopyPoem = () => {
    const textToCopy = `${occasionBanner.title}\n\n${occasionBanner.subtitle}\n\n${occasionBanner.praisePoem || occasionBanner.description || ''}\n\n― پێشنیار کراوە لەلایەن پلاتفۆرمی شاخ (SHAKH)`;
    navigator.clipboard.writeText(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // Dynamic Theme Backgrounds & Text Styles
  const getThemeClasses = (style: OccasionThemeStyle) => {
    switch (style) {
      case 'royal_midnight':
        return {
          bg: 'bg-gradient-to-r from-slate-950 via-indigo-950 to-slate-900 border-indigo-500/30 text-indigo-100',
          badge: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
          accentText: 'text-amber-300 font-serif',
          buttonBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950'
        };
      case 'rose_amber':
        return {
          bg: 'bg-gradient-to-r from-rose-950 via-amber-950 to-rose-900 border-rose-500/30 text-rose-100',
          badge: 'bg-rose-400/20 text-rose-200 border-rose-400/30',
          accentText: 'text-amber-200 font-serif',
          buttonBg: 'bg-rose-500 hover:bg-rose-400 text-white'
        };
      case 'warm_sunset':
        return {
          bg: 'bg-gradient-to-r from-amber-950 via-orange-950 to-red-950 border-amber-500/30 text-amber-100',
          badge: 'bg-amber-400/20 text-amber-200 border-amber-400/30',
          accentText: 'text-amber-300 font-serif',
          buttonBg: 'bg-amber-500 hover:bg-amber-400 text-slate-950'
        };
      case 'pure_green':
        return {
          bg: 'bg-gradient-to-r from-green-950 via-emerald-900 to-green-900 border-green-500/30 text-emerald-100',
          badge: 'bg-emerald-400/20 text-emerald-200 border-emerald-400/30',
          accentText: 'text-amber-300 font-serif',
          buttonBg: 'bg-emerald-500 hover:bg-emerald-400 text-slate-950'
        };
      case 'emerald_gold':
      default:
        return {
          bg: 'bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-900 border-amber-500/30 text-emerald-50',
          badge: 'bg-amber-400/20 text-amber-300 border-amber-400/30',
          accentText: 'text-amber-300 font-serif',
          buttonBg: 'bg-amber-400 hover:bg-amber-300 text-slate-950 font-black'
        };
    }
  };

  const theme = getThemeClasses(occasionBanner.themeStyle || 'emerald_gold');

  return (
    <div className={`relative border-b shadow-lg transition-all duration-300 overflow-hidden ${theme.bg}`}>
      {/* Decorative Islamic Background Pattern Elements */}
      <div className="absolute inset-0 opacity-10 bg-[radial-gradient(#f59e0b_1px,transparent_1px)] [background-size:16px_16px] pointer-events-none" />
      
      {!occasionBanner.isActive && isSuperAdmin && (
        <div className="bg-rose-600/90 text-white text-[11px] font-bold py-1 px-4 text-center">
          ⚠️ تێبینی سوپەر ئەدمین: ئەم بۆنەیە لە ئێستادا ناچالاکە لەلای بەکارهێنەرانی ئاسایی، تەنها ئەدمین دەینەوێنێت.
        </div>
      )}

      <div className="max-w-7xl mx-auto px-4 py-3 sm:py-4">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          
          {/* Main Title & Subtitle Info */}
          <div className="flex items-start gap-3 flex-1">
            {/* Image or Icon Thumbnail */}
            {occasionBanner.imageUrl ? (
              <img
                src={occasionBanner.imageUrl}
                alt={occasionBanner.badge}
                className="w-12 h-12 sm:w-16 sm:h-16 rounded-2xl object-cover border-2 border-amber-400/40 shadow-md shrink-0 mt-0.5"
              />
            ) : (
              <div className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-amber-400/20 border border-amber-400/40 flex items-center justify-center text-2xl shrink-0">
                ✨
              </div>
            )}

            <div className="space-y-1.5 flex-1">
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-xs font-bold border backdrop-blur-md ${theme.badge}`}>
                  <Sparkles className="w-3.5 h-3.5 text-amber-300 animate-pulse" />
                  <span>{occasionBanner.badge}</span>
                </span>

                {isSuperAdmin && (
                  <>
                    <button
                      type="button"
                      onClick={() => {
                        if (onOpenAdminManager) onOpenAdminManager();
                        setIsAdminPanelOpen(true);
                      }}
                      className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                    >
                      <Edit3 className="w-3 h-3 text-amber-300" />
                      <span>{t('دەستکاری (سوپەر ئەدمین)')}</span>
                    </button>

                    {!occasionBanner.isActive && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/80 text-white">
                        {t('🔴 ناچالاکە')}
                      </span>
                    )}

                    {isScheduledInFuture && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-amber-500/80 text-slate-950">
                        {t('⏳ چاوەڕوانی کاتە')} ({new Date(occasionBanner.startDate!).toLocaleString('ku-IQ', { dateStyle: 'short', timeStyle: 'short' })})
                      </span>
                    )}

                    {isScheduledExpired && (
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-slate-700 text-slate-200">
                        {t('⌛ کاتی بەسەرچوو')} ({new Date(occasionBanner.endDate!).toLocaleString('ku-IQ', { dateStyle: 'short', timeStyle: 'short' })})
                      </span>
                    )}
                  </>
                )}
              </div>

              <h2 className="text-sm sm:text-base font-black text-white leading-snug tracking-wide">
                {occasionBanner.title}
              </h2>

              <p className={`text-xs sm:text-sm font-arabic font-bold ${theme.accentText} leading-relaxed dir-rtl`}>
                {occasionBanner.subtitle}
              </p>
            </div>
          </div>

          {/* Actions & Salawat Counter */}
          <div className="flex items-center gap-2 sm:gap-3 shrink-0 self-end md:self-center flex-wrap">
            {/* Interactive Salawat Button */}
            {occasionBanner.showSalawatCounter && (
              <button
                type="button"
                onClick={handleSalawatClick}
                className={`relative px-4 py-2.5 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer ${theme.buttonBg} ${
                  salawatAnimated ? 'scale-105 ring-4 ring-amber-300/50' : ''
                }`}
              >
                <Heart className={`w-4 h-4 fill-current ${salawatAnimated ? 'animate-ping' : ''}`} />
                <span>{t('ناردنی درود و سڵاو')}</span>
                <span className="bg-slate-950/20 px-2 py-0.5 rounded-lg text-[11px] font-latin font-black">
                  {(occasionBanner.salawatCount || 0).toLocaleString()}
                </span>

                {salawatAnimated && (
                  <span className="absolute -top-6 left-1/2 -translate-x-1/2 bg-amber-300 text-slate-950 text-[10px] font-black px-2 py-0.5 rounded-full shadow-lg animate-bounce">
                    +١ صَلَوَات 🌹
                  </span>
                )}
              </button>
            )}

            {/* Expand / Read Poem Button */}
            {(occasionBanner.praisePoem || occasionBanner.description) && (
              <button
                type="button"
                onClick={() => setIsExpanded(!isExpanded)}
                className="px-3 py-2.5 bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold text-xs flex items-center gap-1.5 backdrop-blur-md transition-colors cursor-pointer"
              >
                <span>{t('مەدح و شیعری مەولود')}</span>
                {isExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
              </button>
            )}

            {/* Dismiss button */}
            <button
              type="button"
              onClick={() => setIsDismissed(true)}
              className="p-2 text-white/60 hover:text-white hover:bg-white/10 rounded-xl transition-colors cursor-pointer"
              title={t('داخستنی بۆنە')}
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Expandable Poem & Praise Details */}
        {isExpanded && (occasionBanner.praisePoem || occasionBanner.description) && (
          <div className="mt-4 pt-4 border-t border-white/10 space-y-4 animate-fadeIn">
            {occasionBanner.description && (
              <p className="text-xs sm:text-sm text-slate-200 leading-relaxed font-medium bg-black/20 p-4 rounded-2xl backdrop-blur-md">
                {occasionBanner.description}
              </p>
            )}

            {occasionBanner.praisePoem && (
              <div className="bg-black/30 border border-amber-400/20 p-5 rounded-2xl text-center space-y-3 relative overflow-hidden">
                <div className="text-amber-300 text-xs font-bold flex items-center justify-center gap-2">
                  <Sparkles className="w-4 h-4" />
                  <span>{t('مەدح و دێڕە شێعری پیرۆز')}</span>
                  <Sparkles className="w-4 h-4" />
                </div>

                <pre className="text-xs sm:text-sm md:text-base font-serif font-bold text-amber-100 whitespace-pre-wrap leading-loose tracking-wide dir-rtl">
                  {occasionBanner.praisePoem}
                </pre>

                <div className="pt-2 flex items-center justify-center gap-3">
                  <button
                    type="button"
                    onClick={handleCopyPoem}
                    className="px-4 py-2 bg-amber-400/20 hover:bg-amber-400/30 text-amber-200 border border-amber-400/40 rounded-xl font-bold text-xs flex items-center gap-2 transition-colors cursor-pointer"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    <span>{copied ? t('کۆپی کرا!') : t('کۆپیکردنی مەدح و پیرۆزبایی')}</span>
                  </button>
                </div>
              </div>
            )}
          </div>
        )}

      </div>

      {/* Super Admin Edit Panel Modal */}
      {isSuperAdmin && isAdminPanelOpen && (
        <OccasionBannerAdminPanel
          isModal={true}
          isOpen={isAdminPanelOpen}
          onClose={() => setIsAdminPanelOpen(false)}
        />
      )}
    </div>
  );
};
