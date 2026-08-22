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
  Sparkles
} from 'lucide-react';
import { CarAdCard } from '../components/cards/CarAdCard';
import { useMarketplace } from '../context/MarketplaceContext';
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

  const [searchQuery, setSearchQuery] = useState('');
  const [selectedBrand, setSelectedBrand] = useState('all');
  const [selectedTransmission, setSelectedTransmission] = useState('all');
  const [selectedCityFilter, setSelectedCityFilter] = useState(selectedCity || 'all');
  const [sortOption, setSortOption] = useState<'default' | 'price_low' | 'price_high' | 'year_new'>('default');

  const brands = ['Toyota', 'Mercedes-Benz', 'Hyundai', 'BMW', 'Kia', 'Nissan', 'Ford', 'Chevrolet'];

  // Filter ads
  let filtered = carAds.filter(c => c.adStatus === 'active' || c.adStatus === 'sold');

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
    <div className="space-y-8 pb-16">
      
      {/* Hero Banner */}
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-white p-8 sm:p-12 shadow-xl border border-slate-800">
        <div className="max-w-2xl space-y-3 text-right">
          <div className="inline-flex items-center gap-2 bg-blue-500/20 text-blue-300 text-xs font-bold px-3 py-1 rounded-full border border-blue-500/30">
            <Car className="w-4 h-4 text-blue-400" />
            <span>بازاڕی سەرەکی ئۆتۆمبێلی کوردستان</span>
          </div>

          <h1 className="text-2xl sm:text-4xl font-black">
            کڕین و فرۆشتنی ئۆتۆمبێل بە سەلامەتی و ڕاستەوخۆ
          </h1>

          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed font-medium">
            هەزاران کڕیار و فرۆشیار ڕۆژانە لە شاخی ئۆتۆمبێل دەفرۆشن. تۆش ڕیکلامەکەت دابنێ بە پاکێجی ٧ ڕۆژ، ١٥ ڕۆژ یان ٣٠ ڕۆژ بە تایبەتمەندی VIP.
          </p>

          <div className="pt-2">
            <button
              onClick={() => onNavigate('post-car-ad')}
              className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs sm:text-sm font-black rounded-2xl shadow-lg shadow-orange-500/30 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
            >
              <PlusCircle className="w-5 h-5" />
              <span>دانانی ڕیکلامی ئۆتۆمبێلی خۆت ئێستا</span>
            </button>
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-4">
        
        {/* Search & Sort */}
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="relative w-full sm:flex-1">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="گەڕان بەپێی ناوی ئۆتۆمبێل، مۆدێل یان کۆمپانیا (وەک: کامری، تۆیۆتا)..."
              className="w-full bg-slate-50 border border-slate-200 rounded-2xl py-2.5 pr-10 pl-4 text-xs sm:text-sm text-slate-800 focus:bg-white focus:outline-hidden focus:border-blue-500"
            />
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-3 pointer-events-none" />
          </div>

          <div className="flex items-center gap-2 w-full sm:w-auto">
            <select
              value={sortOption}
              onChange={(e) => setSortOption(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="default">ڕیزبەندی: نوێترین</option>
              <option value="price_low">کەمترین نرخ</option>
              <option value="price_high">بەرزترین نرخ</option>
              <option value="year_new">نوێترین مۆدێل</option>
            </select>

            <select
              value={selectedCityFilter}
              onChange={(e) => setSelectedCityFilter(e.target.value)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-semibold text-slate-700 focus:outline-hidden"
            >
              <option value="all">هەموو شارەکان</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Brand Chips */}
        <div className="flex items-center gap-2 overflow-x-auto pb-1 scrollbar-none">
          <button
            onClick={() => setSelectedBrand('all')}
            className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
              selectedBrand === 'all' ? 'bg-slate-900 text-white' : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
            }`}
          >
            هەموو براندەکان
          </button>
          {brands.map(b => (
            <button
              key={b}
              onClick={() => setSelectedBrand(b)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedBrand.toLowerCase() === b.toLowerCase()
                  ? 'bg-blue-600 text-white'
                  : 'bg-slate-100 text-slate-700 hover:bg-slate-200'
              }`}
            >
              {b}
            </button>
          ))}
        </div>

      </div>

      {/* Car Grid */}
      {filtered.length === 0 ? (
        <div className="p-16 text-center bg-white rounded-3xl border border-slate-200">
          <Car className="w-16 h-16 text-slate-300 mx-auto mb-3" />
          <h3 className="text-base font-bold text-slate-700">هیچ ئۆتۆمبێلێک نەدۆزرایەوە</h3>
          <p className="text-xs text-slate-400 mt-1">تکایە گۆڕانکاری لە فلتەرەکاندا بکە.</p>
        </div>
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
