import React, { useState, useMemo } from 'react';
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
  FileClock,
  X,
  RotateCcw,
  Calendar,
  DollarSign,
  ChevronDown,
  ChevronUp,
  Fuel,
  ShieldCheck,
  Check
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

const DEFAULT_BRANDS = [
  'Toyota',
  'Mercedes-Benz',
  'Hyundai',
  'BMW',
  'Kia',
  'Nissan',
  'Ford',
  'Chevrolet',
  'Lexus',
  'Land Rover',
  'Audi',
  'Jeep',
  'Dodge',
  'Porsche',
  'Volkswagen',
  'Honda',
  'Mitsubishi',
  'GMC'
];

export const CarMarketplaceView: React.FC<CarMarketplaceViewProps> = ({
  onNavigate,
  selectedCity
}) => {
  const { carAds } = useMarketplace();
  const { currentUser, isSuperAdmin } = useAuth();

  // Basic search & filter states
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [minYear, setMinYear] = useState<number | ''>('');
  const [maxYear, setMaxYear] = useState<number | ''>('');
  const [minPriceIqd, setMinPriceIqd] = useState<number | ''>('');
  const [maxPriceIqd, setMaxPriceIqd] = useState<number | ''>('');
  
  // Advanced filter states
  const [selectedTransmission, setSelectedTransmission] = useState('all');
  const [selectedFuelType, setSelectedFuelType] = useState('all');
  const [selectedBodyType, setSelectedBodyType] = useState('all');
  const [selectedCondition, setSelectedCondition] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<'all' | 'active' | 'sold'>('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState(selectedCity || 'all');
  const [sortOption, setSortOption] = useState<'default' | 'price_low' | 'price_high' | 'year_new' | 'year_old' | 'mileage_low'>('default');
  
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  // Extract all unique brands dynamically from existing car ads merged with defaults
  const availableBrands = useMemo(() => {
    const set = new Set(DEFAULT_BRANDS);
    carAds.forEach((c) => {
      if (c.brand && c.brand.trim()) {
        set.add(c.brand.trim());
      }
    });
    return Array.from(set);
  }, [carAds]);

  // User's own pending ads
  const userPendingAds = carAds.filter(
    (c) =>
      (c.adStatus === 'pending_approval' ||
        c.adStatus === 'pending_payment' ||
        c.adminApprovalStatus === 'pending') &&
      currentUser &&
      (c.userId === currentUser.id || c.userPhone === currentUser.phone)
  );

  // Filter ads logic
  const filtered = useMemo(() => {
    let result = carAds.filter(c => c.adStatus !== 'rejected' && c.adStatus !== 'hidden' && c.adStatus !== 'deleted');

    if (selectedStatusFilter !== 'all') {
      result = result.filter(c => c.adStatus === selectedStatusFilter);
    }

    if (selectedBrand !== 'all') {
      result = result.filter(c => c.brand.toLowerCase() === selectedBrand.toLowerCase());
    }

    if (selectedTransmission !== 'all') {
      result = result.filter(c => c.transmission === selectedTransmission);
    }

    if (selectedFuelType !== 'all') {
      result = result.filter(c => c.fuelType === selectedFuelType);
    }

    if (selectedBodyType !== 'all') {
      result = result.filter(c => c.bodyType?.toLowerCase() === selectedBodyType.toLowerCase());
    }

    if (selectedCondition !== 'all') {
      result = result.filter(c => c.carCondition === selectedCondition);
    }

    if (selectedCityFilter !== 'all' && selectedCityFilter !== '') {
      const cityPrefix = selectedCityFilter.split(' ')[0];
      result = result.filter(c => c.city.includes(cityPrefix));
    }

    // Filter by Year range
    if (minYear !== '') {
      result = result.filter(c => c.year >= Number(minYear));
    }
    if (maxYear !== '') {
      result = result.filter(c => c.year <= Number(maxYear));
    }

    // Filter by Price range (IQD)
    if (minPriceIqd !== '') {
      result = result.filter(c => c.priceIqd >= Number(minPriceIqd));
    }
    if (maxPriceIqd !== '') {
      result = result.filter(c => c.priceIqd <= Number(maxPriceIqd));
    }

    // Search query
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase().trim();
      result = result.filter(
        c =>
          c.title.toLowerCase().includes(q) ||
          c.model.toLowerCase().includes(q) ||
          c.brand.toLowerCase().includes(q) ||
          (c.city && c.city.toLowerCase().includes(q))
      );
    }

    // Sorting
    if (sortOption === 'price_low') {
      result.sort((a, b) => a.priceIqd - b.priceIqd);
    } else if (sortOption === 'price_high') {
      result.sort((a, b) => b.priceIqd - a.priceIqd);
    } else if (sortOption === 'year_new') {
      result.sort((a, b) => b.year - a.year);
    } else if (sortOption === 'year_old') {
      result.sort((a, b) => a.year - b.year);
    } else if (sortOption === 'mileage_low') {
      result.sort((a, b) => (a.mileageKm || 0) - (b.mileageKm || 0));
    }

    return result;
  }, [
    carAds,
    selectedStatusFilter,
    selectedBrand,
    selectedTransmission,
    selectedFuelType,
    selectedBodyType,
    selectedCondition,
    selectedCityFilter,
    minYear,
    maxYear,
    minPriceIqd,
    maxPriceIqd,
    searchQuery,
    sortOption
  ]);

  // Count active filters
  const activeFiltersCount = useMemo(() => {
    let count = 0;
    if (selectedBrand !== 'all') count++;
    if (minYear !== '') count++;
    if (maxYear !== '') count++;
    if (minPriceIqd !== '') count++;
    if (maxPriceIqd !== '') count++;
    if (selectedTransmission !== 'all') count++;
    if (selectedFuelType !== 'all') count++;
    if (selectedBodyType !== 'all') count++;
    if (selectedCondition !== 'all') count++;
    if (selectedCityFilter !== 'all' && selectedCityFilter !== '') count++;
    if (selectedStatusFilter !== 'all') count++;
    if (searchQuery.trim() !== '') count++;
    return count;
  }, [
    selectedBrand,
    minYear,
    maxYear,
    minPriceIqd,
    maxPriceIqd,
    selectedTransmission,
    selectedFuelType,
    selectedBodyType,
    selectedCondition,
    selectedCityFilter,
    selectedStatusFilter,
    searchQuery
  ]);

  const handleResetFilters = () => {
    setSelectedBrand('all');
    setMinYear('');
    setMaxYear('');
    setMinPriceIqd('');
    setMaxPriceIqd('');
    setSelectedTransmission('all');
    setSelectedFuelType('all');
    setSelectedBodyType('all');
    setSelectedCondition('all');
    setSelectedCityFilter('all');
    setSelectedStatusFilter('all');
    setSearchQuery('');
    setSortOption('default');
  };

  // Year quick presets
  const applyYearPreset = (min: number | '', max: number | '') => {
    setMinYear(min);
    setMaxYear(max);
  };

  // Price quick presets (values in IQD)
  const applyPricePreset = (min: number | '', max: number | '') => {
    setMinPriceIqd(min);
    setMaxPriceIqd(max);
  };

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

      {/* Main Filtering Panel */}
      <div className="bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm space-y-6">
        
        {/* Top Search Bar & Action Buttons */}
        <div className="flex flex-col lg:flex-row gap-3 items-stretch lg:items-center justify-between">
          
          {/* Search Box */}
          <div className="relative flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="گەڕان بەپێی ناوی ئۆتۆمبێل، مۆدێل، براند یان شار (وەک: کامری، لاند کرۆزەر، مێرسیدس، هەولێر)..."
              className="w-full bg-slate-50 dark:bg-slate-900/80 border border-slate-300 dark:border-slate-600 rounded-2xl py-3 pr-10 pl-10 text-xs sm:text-sm text-slate-900 dark:text-slate-100 placeholder-slate-400 dark:placeholder-slate-500 font-bold focus:bg-white dark:focus:bg-slate-900 focus:outline-none focus:border-amber-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3.5 pointer-events-none" />
            {searchQuery && (
              <button
                type="button"
                onClick={() => setSearchQuery('')}
                className="absolute left-3.5 top-3.5 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          {/* Quick Dropdowns & Advanced Toggle */}
          <div className="flex flex-wrap items-center gap-2">
            {/* Status Filter */}
            <select
              value={selectedStatusFilter}
              onChange={(e) => setSelectedStatusFilter(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl px-3.5 py-3 text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="all" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">هەموو دۆخەکان</option>
              <option value="active" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">تەنها بەردەستەکان</option>
              <option value="sold" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">فرۆشراوەکان (Sold)</option>
            </select>

            {/* City Filter */}
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

            {/* Sorting */}
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl px-3.5 py-3 text-xs font-black text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500 cursor-pointer"
            >
              <option value="default" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">ڕیزبەندی: داهاتووترین</option>
              <option value="price_low" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">کەمترین نرخ</option>
              <option value="price_high" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">بەرزترین نرخ</option>
              <option value="year_new" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">نوێترین مۆدێل</option>
              <option value="year_old" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">کۆنترین مۆدێل</option>
              <option value="mileage_low" className="bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100">کەمترین ڕۆیشتن (کم)</option>
            </select>

            {/* Toggle Advanced Filters */}
            <button
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              className={`px-4 py-3 rounded-2xl text-xs font-black flex items-center gap-2 cursor-pointer border transition-colors ${
                showAdvancedFilters || activeFiltersCount > 0
                  ? 'bg-amber-500 text-white border-amber-600 shadow-sm'
                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 border-slate-200 dark:border-slate-600 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              <SlidersHorizontal className="w-4 h-4" />
              <span>فلتەری ورد</span>
              {activeFiltersCount > 0 && (
                <span className="w-5 h-5 rounded-full bg-white text-amber-600 text-[10px] font-black flex items-center justify-center shadow-xs">
                  {activeFiltersCount}
                </span>
              )}
              {showAdvancedFilters ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Brand Selector Bar */}
        <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
              <Car className="w-3.5 h-3.5 text-amber-500" />
              <span>فلتەرکردن بەپێی کۆمپانیا / براند (Make):</span>
            </span>
            {selectedBrand !== 'all' && (
              <button
                type="button"
                onClick={() => setSelectedBrand('all')}
                className="text-[11px] text-amber-600 dark:text-amber-400 font-bold hover:underline"
              >
                پیشاندانی هەموو براندەکان
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
            <button
              type="button"
              onClick={() => setSelectedBrand('all')}
              className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                selectedBrand === 'all'
                  ? 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md ring-2 ring-slate-900/20'
                  : 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
              }`}
            >
              هەموو براندەکان
            </button>
            {availableBrands.map(b => (
              <button
                key={b}
                type="button"
                onClick={() => setSelectedBrand(b)}
                className={`px-4 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer ${
                  selectedBrand.toLowerCase() === b.toLowerCase()
                    ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-white shadow-md ring-2 ring-amber-500/30'
                    : 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                }`}
              >
                {b}
              </button>
            ))}
          </div>
        </div>

        {/* Primary Quick Filters: Year & Price Ranges */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 pt-2 border-t border-slate-100 dark:border-slate-700/60">
          
          {/* Year Range Filter Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-amber-500" />
                <span>ساڵی دروستکردن (مۆدێل / Year):</span>
              </span>
              {(minYear !== '' || maxYear !== '') && (
                <button
                  type="button"
                  onClick={() => applyYearPreset('', '')}
                  className="text-[11px] text-red-500 hover:underline font-bold"
                >
                  سڕینەوە
                </button>
              )}
            </div>

            {/* Inputs Min/Max */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  لە ساڵی (لە):
                </label>
                <input
                  type="number"
                  placeholder="وەک: 2015"
                  value={minYear}
                  onChange={(e) => setMinYear(e.target.value ? Number(e.target.value) : '')}
                  min={1980}
                  max={2026}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black font-latin text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  تا ساڵی (تا):
                </label>
                <input
                  type="number"
                  placeholder="وەک: 2026"
                  value={maxYear}
                  onChange={(e) => setMaxYear(e.target.value ? Number(e.target.value) : '')}
                  min={1980}
                  max={2026}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black font-latin text-slate-900 dark:text-slate-100 focus:outline-none focus:border-amber-500"
                />
              </div>
            </div>

            {/* Quick Year Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => applyYearPreset(2022, 2026)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  minYear === 2022 && maxYear === 2026
                    ? 'bg-amber-500 text-white font-black'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                ٢٠٢٢ - ٢٠٢٦ (زۆر نوێ)
              </button>
              <button
                type="button"
                onClick={() => applyYearPreset(2018, 2021)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  minYear === 2018 && maxYear === 2021
                    ? 'bg-amber-500 text-white font-black'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                ٢٠١٨ - ٢٠٢١
              </button>
              <button
                type="button"
                onClick={() => applyYearPreset(2012, 2017)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  minYear === 2012 && maxYear === 2017
                    ? 'bg-amber-500 text-white font-black'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                ٢٠١٢ - ٢٠١٧
              </button>
              <button
                type="button"
                onClick={() => applyYearPreset('', 2011)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  minYear === '' && maxYear === 2011
                    ? 'bg-amber-500 text-white font-black'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                خوار ٢٠١٢
              </button>
            </div>
          </div>

          {/* Price Range Filter Box */}
          <div className="p-4 rounded-2xl bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black text-slate-800 dark:text-slate-200 flex items-center gap-1.5">
                <DollarSign className="w-4 h-4 text-emerald-500" />
                <span>مەودای نرخ بە دیناری عێراقی (IQD Price Range):</span>
              </span>
              {(minPriceIqd !== '' || maxPriceIqd !== '') && (
                <button
                  type="button"
                  onClick={() => applyPricePreset('', '')}
                  className="text-[11px] text-red-500 hover:underline font-bold"
                >
                  سڕینەوە
                </button>
              )}
            </div>

            {/* Inputs Min/Max */}
            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  کەمترین نرخ (د.ع):
                </label>
                <input
                  type="number"
                  placeholder="وەک: 10,000,000"
                  value={minPriceIqd}
                  onChange={(e) => setMinPriceIqd(e.target.value ? Number(e.target.value) : '')}
                  step={500000}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black font-latin text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>

              <div>
                <label className="block text-[10px] font-bold text-slate-500 dark:text-slate-400 mb-1">
                  بەرزترین نرخ (د.ع):
                </label>
                <input
                  type="number"
                  placeholder="وەک: 50,000,000"
                  value={maxPriceIqd}
                  onChange={(e) => setMaxPriceIqd(e.target.value ? Number(e.target.value) : '')}
                  step={500000}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-black font-latin text-slate-900 dark:text-slate-100 focus:outline-none focus:border-emerald-500"
                />
              </div>
            </div>

            {/* Quick Price Presets */}
            <div className="flex flex-wrap gap-1.5 pt-1">
              <button
                type="button"
                onClick={() => applyPricePreset('', 15000000)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  minPriceIqd === '' && maxPriceIqd === 15000000
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                ژێر ١٥ ملیۆن (~$10k)
              </button>
              <button
                type="button"
                onClick={() => applyPricePreset(15000000, 30000000)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  minPriceIqd === 15000000 && maxPriceIqd === 30000000
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                ١٥ بۆ ٣٠ ملیۆن ($10k-$20k)
              </button>
              <button
                type="button"
                onClick={() => applyPricePreset(30000000, 60000000)}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  minPriceIqd === 30000000 && maxPriceIqd === 60000000
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                ٣٠ بۆ ٦٠ ملیۆن ($20k-$40k)
              </button>
              <button
                type="button"
                onClick={() => applyPricePreset(60000000, '')}
                className={`px-2.5 py-1 rounded-xl text-[11px] font-bold transition-colors cursor-pointer ${
                  minPriceIqd === 60000000 && maxPriceIqd === ''
                    ? 'bg-emerald-600 text-white font-black'
                    : 'bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-200 dark:border-slate-700 hover:bg-slate-100 dark:hover:bg-slate-700'
                }`}
              >
                سەرتر لە ٦٠ ملیۆن (+$40k)
              </button>
            </div>
          </div>

        </div>

        {/* Collapsible Advanced Options Panel */}
        {showAdvancedFilters && (
          <div className="p-5 rounded-2xl bg-amber-50/50 dark:bg-slate-900/90 border border-amber-200 dark:border-slate-700 space-y-4 animate-fade-in">
            <h4 className="text-xs font-black text-amber-900 dark:text-amber-300 flex items-center gap-2 border-b border-amber-200/60 dark:border-slate-800 pb-2">
              <SlidersHorizontal className="w-4 h-4 text-amber-500" />
              <span>تایبەتمەندییە وردەکانی ئۆتۆمبێل (Advanced Vehicle Specifications)</span>
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              
              {/* Transmission */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  جۆری گێڕ (Transmission):
                </label>
                <select
                  value={selectedTransmission}
                  onChange={(e) => setSelectedTransmission(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">هەموو جۆرەکان</option>
                  <option value="automatic">ئۆتۆماتیک (Automatic)</option>
                  <option value="manual">عادی / دەستی (Manual)</option>
                  <option value="cvt">CVT</option>
                  <option value="dct">Dual Clutch (DCT)</option>
                </select>
              </div>

              {/* Fuel Type */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  سووتەمەنی (Fuel Type):
                </label>
                <select
                  value={selectedFuelType}
                  onChange={(e) => setSelectedFuelType(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">هەموو جۆرەکان</option>
                  <option value="gasoline">بەنزین (Gasoline)</option>
                  <option value="hybrid">هایبرید (Hybrid)</option>
                  <option value="electric">کارەبایی (Electric)</option>
                  <option value="diesel">دیزل (Diesel)</option>
                  <option value="plug_in_hybrid">Plug-in Hybrid</option>
                </select>
              </div>

              {/* Body Type */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  جۆری هەیکەل (Body Type):
                </label>
                <select
                  value={selectedBodyType}
                  onChange={(e) => setSelectedBodyType(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">هەموو جۆرەکان</option>
                  <option value="suv">SUV / فورویل (دەبڵ ئەکسل)</option>
                  <option value="sedan">سێدان (Sedan)</option>
                  <option value="pickup">پیکاب / بارکێش (Pickup)</option>
                  <option value="hatchback">هاچبێک (Hatchback)</option>
                  <option value="coupe">کوپێ / وەرزشی (Coupe)</option>
                </select>
              </div>

              {/* Car Condition */}
              <div className="space-y-1">
                <label className="block text-[11px] font-bold text-slate-700 dark:text-slate-300">
                  دۆخی ئۆتۆمبێل (Condition):
                </label>
                <select
                  value={selectedCondition}
                  onChange={(e) => setSelectedCondition(e.target.value)}
                  className="w-full bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-xs font-bold text-slate-800 dark:text-slate-200 focus:outline-none focus:border-amber-500"
                >
                  <option value="all">هەموو دۆخەکان</option>
                  <option value="new">زێرۆ / بەکارنەهاتوو (New)</option>
                  <option value="used">بەکارهاتوو (Used)</option>
                </select>
              </div>

            </div>
          </div>
        )}

        {/* Active Applied Filter Badges & Summary Bar */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-slate-100 dark:border-slate-700/60">
          
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-slate-700 dark:text-slate-300">
              دۆزرایەوە: <span className="text-amber-600 dark:text-amber-400 font-latin text-sm font-black">{filtered.length}</span> ئۆتۆمبێل
            </span>

            {/* Active Badges */}
            {selectedBrand !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-amber-800">
                <span>براند: {selectedBrand}</span>
                <button type="button" onClick={() => setSelectedBrand('all')} className="hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {(minYear !== '' || maxYear !== '') && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-amber-100 dark:bg-amber-950/60 text-amber-900 dark:text-amber-200 text-xs font-bold border border-amber-300 dark:border-amber-800">
                <span>ساڵ: {minYear || 'سەرەتایی'} - {maxYear || 'ئێستا'}</span>
                <button type="button" onClick={() => applyYearPreset('', '')} className="hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {(minPriceIqd !== '' || maxPriceIqd !== '') && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-900 dark:text-emerald-200 text-xs font-bold border border-emerald-300 dark:border-emerald-800">
                <span>
                  نرخ: {minPriceIqd ? `${(Number(minPriceIqd) / 1000000).toFixed(1)}M` : '0'} - {maxPriceIqd ? `${(Number(maxPriceIqd) / 1000000).toFixed(1)}M` : 'بێ‌سنوور'} د.ع
                </span>
                <button type="button" onClick={() => applyPricePreset('', '')} className="hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedTransmission !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-blue-100 dark:bg-blue-950/60 text-blue-900 dark:text-blue-200 text-xs font-bold border border-blue-300 dark:border-blue-800">
                <span>گێڕ: {selectedTransmission === 'automatic' ? 'ئۆتۆماتیک' : 'عادی'}</span>
                <button type="button" onClick={() => setSelectedTransmission('all')} className="hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedFuelType !== 'all' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-purple-100 dark:bg-purple-950/60 text-purple-900 dark:text-purple-200 text-xs font-bold border border-purple-300 dark:border-purple-800">
                <span>سووتەمەنی: {selectedFuelType}</span>
                <button type="button" onClick={() => setSelectedFuelType('all')} className="hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {selectedCityFilter !== 'all' && selectedCityFilter !== '' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-600">
                <span>شار: {selectedCityFilter}</span>
                <button type="button" onClick={() => setSelectedCityFilter('all')} className="hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}

            {searchQuery.trim() !== '' && (
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-xl bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold border border-slate-300 dark:border-slate-600">
                <span>گەڕان: "{searchQuery}"</span>
                <button type="button" onClick={() => setSearchQuery('')} className="hover:text-red-500">
                  <X className="w-3.5 h-3.5" />
                </button>
              </span>
            )}
          </div>

          {/* Reset All Button */}
          {activeFiltersCount > 0 && (
            <button
              type="button"
              onClick={handleResetFilters}
              className="px-3.5 py-1.5 bg-red-50 dark:bg-red-950/40 hover:bg-red-100 dark:hover:bg-red-900/60 text-red-600 dark:text-red-400 text-xs font-black rounded-xl border border-red-200 dark:border-red-800 flex items-center gap-1.5 cursor-pointer transition-colors"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              <span>پاککردنەوەی هەموو فلتەرەکان</span>
            </button>
          )}

        </div>

      </div>

      {/* Car Grid */}
      {filtered.length === 0 ? (
        <EmptyState
          type="cars"
          title="هیچ ئۆتۆمبێلێک بەم فلتەرانە نەدۆزرایەوە"
          description="تکایە مەودای نرخ یان ساڵ یان براندەکەت بگۆڕە بۆ ئەوەی ئەنجامی زیاتر دەربکەوێت."
          actionLabel="سڕینەوەی هەموو فلتەرەکان"
          onAction={handleResetFilters}
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
