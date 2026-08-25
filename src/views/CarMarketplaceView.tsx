import React, { useState } from 'react';
import {
  Car,
  Search,
  PlusCircle,
  Filter,
  SlidersHorizontal,
  MapPin,
  CheckCircle,
  Gauge,
  Sparkles,
  Clock,
  Tag,
  CheckCircle2,
  FileClock
} from 'lucide-react';
import { CarAdCard } from '../components/cards/CarAdCard';
import { EmptyState } from '../components/common/EmptyState';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { CITIES } from '../data/seedData';
import { CarAd } from '../types';

interface CarMarketplaceViewProps {
  onNavigate: (view: string, param?: string) => void;
  selectedCity: string;
}

export const CarMarketplaceView: React.FC<CarMarketplaceViewProps> = ({
  onNavigate,
  selectedCity
}) => {
  const { carAds } = useMarketplace();
  const { currentUser, isSuperAdmin } = useAuth();

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedTransmission, setSelectedTransmission] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState(selectedCity || 'all');
  const [sortOption, setSortOption] = useState<'default' | 'price_low' | 'price_high' | 'year_new'>('default');

  const brands = ['Toyota', 'Mercedes-Benz', 'Hyundai', 'BMW', 'Kia', 'Nissan', 'Ford', 'Chevrolet'];

  // User's own pending ads
  const userPendingAds = carAds.filter(
    (c) => (c.adStatus === 'pending_payment' || c.adminApprovalStatus === 'pending') &&
           currentUser && (c.userId === currentUser.id || c.userPhone === currentUser.phone)
  );

  // Filter ads for public display
  let filtered = carAds.filter(c => c.adStatus === 'active' || c.adStatus === 'sold');

  if (selectedStatusFilter !== 'all') {
    filtered = filtered.filter(c => c.adStatus === selectedStatusFilter);
  }

  if (selectedBrand !== 'all') {
    filtered = filtered.filter(c => c.brand.toLowerCase() === selectedBrand.toLowerCase());
  }

  if (selectedTransmission !== 'all') {
    filtered = filtered.filter(c => c.transmission === selectedTransmission);
  }

  if (selectedCityFilter !== 'all' && selectedCityFilter !== '') {
    const cityPrefix = selectedCityFilter.split(' ')[0];
    filtered = filtered.filter(c => c.city.includes(cityPrefix));
  }

  if (searchQuery.trim()) {
    filtered = filtered.filter(c =>
      c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.model.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.brand.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }

  // Sort
  if (sortOption === 'price_low') {
    filtered.sort((a, b) => a.priceIqd - b.priceIqd);
  } else if (sortOption === 'price_high') {
    filtered.sort((a, b) => b.priceIqd - a.priceIqd);
  } else if (sortOption === 'year_new') {
    filtered.sort((a, b) => b.year - a.year);
  }

  return (
    <div className="space-y-8 pb-16 text-right" dir="rtl">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-slate-900 to-blue-950 text-white p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-2xl space-y-4">
          <div className="inline-flex items-center gap-2 bg-amber-500/20 text-amber-300 text-xs font-black px-3.5 py-1.5 rounded-2xl border border-amber-500/30">
            <Car className="w-4 h-4 text-amber-400" />
            <span>شاخی ئۆتۆ (Shakh Auto) • گەورەترین پێشانگای کوردستان</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black leading-tight">
            کڕین و فرۆشتنی ئۆتۆمبێل بە سەلامەتی و ڕاستەوخۆ
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-bold">
            هەزاران کڕیار و فرۆشیار ڕۆژانە لە شاخی ئۆتۆمبێل دەفرۆشن. ڕیکلامەکەت دابنێ بە پاکێجی ٧ ڕۆژ، ١٥ ڕۆژ یان ٣٠ ڕۆژی VIP لەگەڵ تەسدیقی خێرای پارەدان.
          </p>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <button
              type="button"
              onClick={() => onNavigate('post-car-ad')}
              className="px-6 py-3.5 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-amber-500/30 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>دانانی ڕیکلامی ئۆتۆمبێل ئێستا</span>
            </button>

            {isSuperAdmin && (
              <button
                type="button"
                onClick={() => onNavigate('admin-dashboard', 'cars')}
                className="px-5 py-3.5 bg-white/10 hover:bg-white/20 text-white text-xs font-black rounded-2xl border border-white/20 transition-colors flex items-center gap-2 cursor-pointer"
              >
                <FileClock className="w-4 h-4 text-amber-400" />
                <span>داشبۆردی تەسدیقی ڕیکلامەکان</span>
              </button>
            )}
          </div>
        </div>
      </div>

      {/* User's Pending Approval Notice */}
      {userPendingAds.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-amber-50 dark:bg-amber-950/60 border border-amber-300 dark:border-amber-700 shadow-sm flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-2xl bg-amber-500 text-white shadow-md">
              <Clock className="w-5 h-5 animate-pulse" />
            </div>
            <div>
              <h4 className="text-xs sm:text-sm font-black text-amber-900 dark:text-amber-100">
                تۆ ({userPendingAds.length}) ڕیکلامت لە چاوەڕوانی تەسدیقکردنی پارەداندایە
              </h4>
              <p className="text-[11px] font-bold text-amber-700 dark:text-amber-300">
                وەسڵی پارەدان لەلایەن سوپەر ئەدمین وردبینی دەکرێت و بەزووترین کات چالاک دەبێت.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {userPendingAds.map(pad => (
              <button
                key={pad.id}
                type="button"
                onClick={() => onNavigate('car-detail', pad.id)}
                className="px-3.5 py-1.5 bg-amber-500 hover:bg-amber-600 text-white text-xs font-black rounded-xl cursor-pointer shadow-xs transition-transform active:scale-95"
              >
                بینینی ({pad.title.substring(0, 18)}...)
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Filter Toolbar */}
      <div className="bg-white dark:bg-slate-800 p-5 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-4">
        
        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="گەڕان بەپێی ناوی ئۆتۆمبێل، مۆدێل، براند (وەک: کامری، لاند کرۆزەر، مێرسیدس)..."
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 rounded-2xl py-3 pr-10 pl-4 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl px-3.5 py-3 text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">هەموو دۆخەکان</option>
              <option value="active" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">تەنها بەردەستەکان</option>
              <option value="sold" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">فرۆشراوەکان (Sold)</option>
            </select>

            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl px-3.5 py-3 text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="default" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">ڕیزبەندی: نوێترین</option>
              <option value="price_low" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">کەمترین نرخ</option>
              <option value="price_high" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">بەرزترین نرخ</option>
              <option value="year_new" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">نوێترین مۆدێل</option>
            </select>

            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl px-3.5 py-3 text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">هەموو شارەکان</option>
              {CITIES.map(c => (
                <option key={c} value={c} className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold">{c}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Brand Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            type="button"
            onClick={() => setSelectedBrand('all')}
            className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-colors cursor-pointer ${
              selectedBrand === 'all'
                ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md'
                : 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
            }`}
          >
            هەموو براندەکان
          </button>
          {brands.map(b => (
            <button
              key={b}
              type="button"
              onClick={() => setSelectedBrand(b)}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-colors cursor-pointer ${
                selectedBrand.toLowerCase() === b.toLowerCase()
                  ? 'bg-amber-500 text-white shadow-md'
                  : 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

      </div>

      {/* Car Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          type="cars"
          title="هیچ ئۆتۆمبێلێک نەدۆزرایەوە"
          description="تکایە گۆڕانکاری لە فلتەرەکاندا بکە یان وشەی گەڕانەکەت پاکبکەرەوە."
          actionLabel="سڕینەوەی فلتەرەکان"
          onAction={() => {
            setSelectedBrand('all');
            setSelectedCityFilter('all');
            setSelectedTransmission('all');
            setSelectedStatusFilter('all');
            setSearchQuery('');
          }}
          secondaryActionLabel="دانانی ڕیکلامی ئۆتۆمبێل"
          onSecondaryAction={() => onNavigate('post-car-ad')}
        />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {filtered.map(car => (
            <CarAdCard
              key={car.id}
              car={car}
              onClick={() => onNavigate('car-detail', car.id)}
            />
          ))}
        </div>
      )}

    </div>
  );
};
