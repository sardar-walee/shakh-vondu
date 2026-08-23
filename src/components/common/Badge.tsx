import React from 'react';
import { OrderStatus, UserRole, ProductCategory, CarPackageType } from '../../types';
import { useLanguage } from '../../context/LanguageContext';

interface StatusBadgeProps {
  status: OrderStatus;
  size?: 'sm' | 'md' | 'lg';
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ status, size = 'md' }) => {
  const { t } = useLanguage();
  const sizeClasses = {
    sm: 'text-[11px] px-2 py-0.5',
    md: 'text-xs px-2.5 py-1',
    lg: 'text-sm px-3.5 py-1.5'
  };

  const statusConfig: Record<OrderStatus, { label: string; bg: string; text: string; dot: string }> = {
    pending: { label: 'لە چاوەڕوانیدا', bg: 'bg-amber-50 border-amber-200', text: 'text-amber-700', dot: 'bg-amber-500' },
    accepted: { label: 'پەسەندکرا', bg: 'bg-blue-50 border-blue-200', text: 'text-blue-700', dot: 'bg-blue-500' },
    preparing: { label: 'لە ئامادەکردندا', bg: 'bg-orange-50 border-orange-200', text: 'text-orange-700', dot: 'bg-orange-500' },
    ready: { label: 'ئامادەیە بۆ بردن', bg: 'bg-purple-50 border-purple-200', text: 'text-purple-700', dot: 'bg-purple-500' },
    picked_up: { label: 'شۆفێر وەریگرت', bg: 'bg-indigo-50 border-indigo-200', text: 'text-indigo-700', dot: 'bg-indigo-500' },
    on_the_way: { label: 'لە ڕێگادایە', bg: 'bg-sky-50 border-sky-200', text: 'text-sky-700', dot: 'bg-sky-500' },
    delivered: { label: 'گەیەندرا', bg: 'bg-emerald-50 border-emerald-200', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    cancelled: { label: 'هەڵوەشێنرایەوە', bg: 'bg-rose-50 border-rose-200', text: 'text-rose-700', dot: 'bg-rose-500' }
  };

  const cfg = statusConfig[status] || statusConfig.pending;

  return (
    <span className={`inline-flex items-center gap-1.5 font-medium rounded-full border ${cfg.bg} ${cfg.text} ${sizeClasses[size]}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${cfg.dot} animate-pulse`}></span>
      {t(cfg.label)}
    </span>
  );
};

export const RoleBadge: React.FC<{ role: UserRole }> = ({ role }) => {
  const { t } = useLanguage();
  const roleMap: Record<UserRole, { label: string; color: string }> = {
    admin: { label: 'Super Admin', color: 'bg-red-600 text-white' },
    super_admin: { label: 'Super Admin', color: 'bg-red-600 text-white' },
    seller: { label: 'خاوەن کار / فرۆشیار', color: 'bg-amber-100 text-amber-800' },
    restaurant_owner: { label: 'خاوەن چێشتخانە', color: 'bg-orange-100 text-orange-800' },
    market_owner: { label: 'خاوەن مارکێت', color: 'bg-blue-100 text-blue-800' },
    clothes_seller: { label: 'فرۆشیاری جلوبەرگ', color: 'bg-purple-100 text-purple-800' },
    fruits_vegetables_seller: { label: 'سەوزە و میوە', color: 'bg-emerald-100 text-emerald-800' },
    fresh_meat_seller: { label: 'گۆشتی تازە', color: 'bg-rose-100 text-rose-800' },
    dairy_seller: { label: 'شیرەمەنی', color: 'bg-cyan-100 text-cyan-800' },
    electronics_seller: { label: 'ئەلیکترۆنیات', color: 'bg-indigo-100 text-indigo-800' },
    beauty_seller: { label: 'جوانی و مکیاژ', color: 'bg-pink-100 text-pink-800' },
    car_seller: { label: 'فرۆشیاری ئۆتۆمبێل', color: 'bg-amber-100 text-amber-800' },
    delivery_agent: { label: 'کاپتنی گەیاندنی شاخ', color: 'bg-teal-100 text-teal-800' },
    store_driver: { label: 'شۆفێری تایبەتی دوکان', color: 'bg-orange-100 text-orange-800' },
    customer: { label: 'کڕیار', color: 'bg-slate-100 text-slate-800' }
  };

  const item = roleMap[role] || { label: role, color: 'bg-slate-100 text-slate-700' };

  return (
    <span className={`inline-flex items-center text-xs font-semibold px-2.5 py-0.5 rounded-full ${item.color}`}>
      {t(item.label)}
    </span>
  );
};

export const CategoryBadge: React.FC<{ category: ProductCategory }> = ({ category }) => {
  const { t } = useLanguage();
  const catNames: Record<ProductCategory, { name: string; bg: string; text: string }> = {
    food: { name: 'خواردن', bg: 'bg-orange-50', text: 'text-orange-600' },
    market: { name: 'مارکێت', bg: 'bg-blue-50', text: 'text-blue-600' },
    clothes: { name: 'جلوبەرگ', bg: 'bg-purple-50', text: 'text-purple-600' },
    fruits_vegetables: { name: 'میوە و سەوزە', bg: 'bg-emerald-50', text: 'text-emerald-600' },
    fresh_meat: { name: 'گۆشت', bg: 'bg-red-50', text: 'text-red-600' },
    dairy: { name: 'شیرەمەنی', bg: 'bg-cyan-50', text: 'text-cyan-600' },
    electronics: { name: 'ئەلیکترۆنیات', bg: 'bg-indigo-50', text: 'text-indigo-600' },
    beauty: { name: 'جوانی', bg: 'bg-pink-50', text: 'text-pink-600' },
    cars: { name: 'ئۆتۆمبێل', bg: 'bg-amber-50', text: 'text-amber-600' }
  };

  const item = catNames[category] || { name: category, bg: 'bg-slate-50', text: 'text-slate-600' };

  return (
    <span className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-md ${item.bg} ${item.text}`}>
      {t(item.name)}
    </span>
  );
};

export const CarPackageBadge: React.FC<{ packageType: CarPackageType }> = ({ packageType }) => {
  const { t } = useLanguage();
  if (packageType === '1_month') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-white px-2.5 py-0.5 rounded-full shadow-sm">
        ★ VIP {t('٣٠ ڕۆژ')}
      </span>
    );
  }
  if (packageType === '15_days') {
    return (
      <span className="inline-flex items-center gap-1 text-[11px] font-bold bg-blue-600 text-white px-2 py-0.5 rounded-full">
        {t('پێشنیارکراو')} {t('١٥ ڕۆژ')}
      </span>
    );
  }
  return (
    <span className="inline-flex items-center text-[11px] font-medium bg-slate-100 text-slate-700 px-2 py-0.5 rounded-full">
      {t('٧ ڕۆژ')}
    </span>
  );
};
