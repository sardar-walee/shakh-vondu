import React from 'react';
import {
  Package,
  Store,
  Users,
  Car,
  Truck,
  MessageSquare,
  Heart,
  ShoppingBag,
  Search,
  RotateCcw,
  Plus,
  ArrowLeft,
  ArrowRight,
  FilterX,
  LucideIcon
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

export type EmptyStateType =
  | 'orders'
  | 'products'
  | 'users'
  | 'cars'
  | 'sellers'
  | 'drivers'
  | 'feedbacks'
  | 'favorites'
  | 'cart'
  | 'search'
  | 'general';

interface EmptyStateProps {
  type?: EmptyStateType;
  title?: string;
  description?: string;
  actionLabel?: string;
  onAction?: () => void;
  secondaryActionLabel?: string;
  onSecondaryAction?: () => void;
  icon?: LucideIcon;
  className?: string;
  compact?: boolean;
}

export const EmptyState: React.FC<EmptyStateProps> = ({
  type = 'general',
  title,
  description,
  actionLabel,
  onAction,
  secondaryActionLabel,
  onSecondaryAction,
  icon: CustomIcon,
  className = '',
  compact = false
}) => {
  const { dir, t } = useLanguage();

  // Icon & Style configuration for each type
  const getConfig = () => {
    switch (type) {
      case 'orders':
        return {
          icon: CustomIcon || Package,
          bgGlow: 'from-orange-500/10 via-amber-500/5 to-transparent',
          iconBg: 'bg-orange-50 text-orange-600 border-orange-100',
          defaultTitle: t('هیچ داواکارییەک نەدۆزرایەوە'),
          defaultDesc: t('هیچ داواکارییەک لەم فلتەرە یان بڕگەیەدا بوونی نییە.'),
          defaultAction: t('دەستپێکردنی کڕین')
        };
      case 'products':
        return {
          icon: CustomIcon || Store,
          bgGlow: 'from-cyan-500/10 via-blue-500/5 to-transparent',
          iconBg: 'bg-cyan-50 text-cyan-600 border-cyan-100',
          defaultTitle: t('هیچ کاڵایەک نەدۆزرایەوە'),
          defaultDesc: t('هیچ بەرهەم یان کاڵایەک گونجاو لەگەڵ ئەم گەڕانە یان فلتەرەدا نییە.'),
          defaultAction: t('گەڕانەوە بۆ هەموو کاڵاکان')
        };
      case 'users':
        return {
          icon: CustomIcon || Users,
          bgGlow: 'from-purple-500/10 via-indigo-500/5 to-transparent',
          iconBg: 'bg-purple-50 text-purple-600 border-purple-100',
          defaultTitle: t('هیچ بەکارهێنەرێک نەدۆزرایەوە'),
          defaultDesc: t('هیچ بەکارهێنەرێک بەپێی ئەم ڕۆڵە یان ناوی گەڕان تۆمار نەکراوە.'),
          defaultAction: t('سڕینەوەی فلتەرەکان')
        };
      case 'cars':
        return {
          icon: CustomIcon || Car,
          bgGlow: 'from-rose-500/10 via-red-500/5 to-transparent',
          iconBg: 'bg-rose-50 text-rose-600 border-rose-100',
          defaultTitle: t('هیچ ئۆتۆمبێلێک نەدۆزرایەوە'),
          defaultDesc: t('هیچ ڕیکلامێکی ئۆتۆمبێل بەم تایبەتمەندییانە بەردەست نییە.'),
          defaultAction: t('زیادکردنی ڕیکلامی نوێ')
        };
      case 'sellers':
        return {
          icon: CustomIcon || Store,
          bgGlow: 'from-emerald-500/10 via-teal-500/5 to-transparent',
          iconBg: 'bg-emerald-50 text-emerald-600 border-emerald-100',
          defaultTitle: t('هیچ فرۆشگایەک نەدۆزرایەوە'),
          defaultDesc: t('هیچ فرۆشیاڕێک لەم بەشە یان شارەدا تۆمار نەکراوە.'),
          defaultAction: t('سڕینەوەی گەڕان')
        };
      case 'drivers':
        return {
          icon: CustomIcon || Truck,
          bgGlow: 'from-blue-500/10 via-indigo-500/5 to-transparent',
          iconBg: 'bg-blue-50 text-blue-600 border-blue-100',
          defaultTitle: t('هیچ کابتنێکی گەیاندن نییە'),
          defaultDesc: t('هیچ کابتن یان شۆفێرێک لەم دۆخەدا بەردەست نییە.'),
          defaultAction: t('سڕینەوەی فلتەرەکان')
        };
      case 'feedbacks':
        return {
          icon: CustomIcon || MessageSquare,
          bgGlow: 'from-amber-500/10 via-yellow-500/5 to-transparent',
          iconBg: 'bg-amber-50 text-amber-600 border-amber-100',
          defaultTitle: t('هیچ پۆست یان فیدباکێک نییە'),
          defaultDesc: t('هیچ پەیام یان سۆشیال فیدباکێک نەدۆزرایەوە.'),
          defaultAction: t('نووسینی پۆستی نوێ')
        };
      case 'favorites':
        return {
          icon: CustomIcon || Heart,
          bgGlow: 'from-pink-500/10 via-rose-500/5 to-transparent',
          iconBg: 'bg-pink-50 text-pink-600 border-pink-100',
          defaultTitle: t('لیستی دڵخوازەکانت بەتاڵە'),
          defaultDesc: t('هیچ کاڵایەکت نەخستۆتە لیستی دڵخوازەکانتەوە.'),
          defaultAction: t('گەڕان لە بەشەکان')
        };
      case 'cart':
        return {
          icon: CustomIcon || ShoppingBag,
          bgGlow: 'from-orange-500/10 via-amber-500/5 to-transparent',
          iconBg: 'bg-orange-50 text-orange-600 border-orange-100',
          defaultTitle: t('سەبەتەکەت بەتاڵە'),
          defaultDesc: t('هیچ کاڵایەکت نەخستۆتە ناو سەبەتەی کڕینەوە.'),
          defaultAction: t('دەستپێکردنی کڕین')
        };
      case 'search':
        return {
          icon: CustomIcon || Search,
          bgGlow: 'from-slate-500/10 via-gray-500/5 to-transparent',
          iconBg: 'bg-slate-100 text-slate-600 border-slate-200',
          defaultTitle: t('هیچ ئەنجامێک نەدۆزرایەوە'),
          defaultDesc: t('تکایە وشەی تر یان فلتەری جیاواز تاقیبکەرەوە.'),
          defaultAction: t('پاککردنەوەی گەڕان')
        };
      default:
        return {
          icon: CustomIcon || FilterX,
          bgGlow: 'from-slate-500/10 via-slate-500/5 to-transparent',
          iconBg: 'bg-slate-100 text-slate-600 border-slate-200',
          defaultTitle: t('هیچ بڕگەیەک نەدۆزرایەوە'),
          defaultDesc: t('تکایە دووبارە تاقیبکەرەوە یان فلتەرەکان لادە.'),
          defaultAction: t('گواستنەوە بۆ سەرەکی')
        };
    }
  };

  const config = getConfig();
  const IconComponent = config.icon;
  const displayTitle = title || config.defaultTitle;
  const displayDesc = description || config.defaultDesc;
  const displayActionLabel = actionLabel || config.defaultAction;

  if (compact) {
    return (
      <div className={`p-6 text-center bg-slate-50/70 rounded-2xl border border-slate-200/80 space-y-3 ${className}`}>
        <div className={`w-10 h-10 mx-auto rounded-xl flex items-center justify-center border shadow-xs ${config.iconBg}`}>
          <IconComponent className="w-5 h-5" />
        </div>
        <div>
          <h4 className="text-xs font-bold text-slate-800">{displayTitle}</h4>
          {displayDesc && <p className="text-[11px] text-slate-400 mt-0.5">{displayDesc}</p>}
        </div>
        {onAction && (
          <button
            type="button"
            onClick={onAction}
            className="px-3.5 py-1.5 bg-slate-900 hover:bg-black text-white text-[11px] font-bold rounded-xl shadow-xs transition-all cursor-pointer inline-flex items-center gap-1.5"
          >
            <RotateCcw className="w-3 h-3" />
            <span>{displayActionLabel}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div
      className={`relative overflow-hidden text-center p-8 sm:p-12 bg-white rounded-3xl border border-slate-200/90 shadow-xs space-y-4 ${className}`}
      dir={dir}
    >
      {/* Background Gradient Glow */}
      <div className={`absolute -top-24 left-1/2 -translate-x-1/2 w-72 h-72 bg-gradient-to-b ${config.bgGlow} rounded-full blur-3xl pointer-events-none`} />

      {/* Decorative Icon Bag */}
      <div className="relative inline-block">
        <div className={`w-20 h-20 mx-auto rounded-3xl flex items-center justify-center border-2 shadow-sm transition-transform hover:scale-105 duration-300 ${config.iconBg}`}>
          <IconComponent className="w-10 h-10 stroke-[1.6]" />
        </div>
        <div className="absolute -bottom-1 -right-1 w-6 h-6 rounded-full bg-white border border-slate-200 shadow-xs flex items-center justify-center">
          <span className="w-2 h-2 rounded-full bg-slate-400 animate-ping" />
        </div>
      </div>

      {/* Text Context */}
      <div className="max-w-md mx-auto space-y-1.5 relative z-10">
        <h3 className="text-base sm:text-lg font-black text-slate-800 tracking-tight">
          {displayTitle}
        </h3>
        {displayDesc && (
          <p className="text-xs text-slate-500 leading-relaxed font-medium">
            {displayDesc}
          </p>
        )}
      </div>

      {/* Action Buttons */}
      {(onAction || onSecondaryAction) && (
        <div className="pt-2 flex flex-wrap items-center justify-center gap-2.5 relative z-10">
          {onAction && (
            <button
              type="button"
              onClick={onAction}
              className="px-5 py-2.5 bg-slate-900 hover:bg-black text-white text-xs font-bold rounded-2xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2"
            >
              <span>{displayActionLabel}</span>
              {dir === 'rtl' ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
            </button>
          )}

          {onSecondaryAction && secondaryActionLabel && (
            <button
              type="button"
              onClick={onSecondaryAction}
              className="px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold rounded-2xl transition-all cursor-pointer flex items-center gap-1.5"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>{secondaryActionLabel}</span>
            </button>
          )}
        </div>
      )}
    </div>
  );
};
