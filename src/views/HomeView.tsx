import React, { useState, useRef } from 'react';
import {
  Utensils,
  ShoppingBag,
  Shirt,
  Apple,
  Beef,
  Milk,
  Smartphone,
  Sparkles,
  Car,
  ChevronLeft,
  ChevronRight,
  TrendingUp,
  Award,
  Clock,
  ShieldCheck,
  Flame,
  ArrowLeft,
  PlusCircle,
  Truck,
  Download,
  Star,
  Zap,
  Filter
} from 'lucide-react';
import { ProductCategory, Product, SellerProfile, CarAd } from '../types';
import { ProductCard } from '../components/cards/ProductCard';
import { CarAdCard } from '../components/cards/CarAdCard';
import { SellerCard } from '../components/cards/SellerCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { useLanguage } from '../context/LanguageContext';
import { AppDownloadModal } from '../components/common/AppDownloadModal';

interface HomeViewProps {
  onNavigate: (view: string, param?: string) => void;
  onSelectCategory: (category: ProductCategory) => void;
  selectedCity: string;
}

export const HomeView: React.FC<HomeViewProps> = ({
  onNavigate,
  onSelectCategory,
  selectedCity
}) => {
  const { products, sellers, carAds } = useMarketplace();
  const { dir, t } = useLanguage();
  const [showAppModal, setShowAppModal] = useState(false);
  const [bestSellerCategory, setBestSellerCategory] = useState<string>('all');
  const categoriesScrollRef = useRef<HTMLDivElement>(null);
  const bestSellersScrollRef = useRef<HTMLDivElement>(null);
  const carsScrollRef = useRef<HTMLDivElement>(null);
  const specialOffersScrollRef = useRef<HTMLDivElement>(null);
  const trendingScrollRef = useRef<HTMLDivElement>(null);

  const handleScrollSection = (ref: React.RefObject<HTMLDivElement | null>, direction: 'left' | 'right') => {
    if (ref.current) {
      const scrollDist = 300;
      ref.current.scrollBy({
        left: direction === 'right' ? -scrollDist : scrollDist,
        behavior: 'smooth'
      });
    }
  };

  // Filter by selected city if applicable
  const filteredSellers = selectedCity
    ? sellers.filter(s => s.city.includes(selectedCity.split(' ')[0]))
    : sellers;

  const filteredCarAds = selectedCity
    ? carAds.filter(c => c.city.includes(selectedCity.split(' ')[0]))
    : carAds;

  const specialOffers = products.filter(p => p.isAvailable !== false && p.productStatus !== 'hidden' && p.discountPrice && p.discountPrice < p.price).slice(0, 8);
  const featuredRestaurants = sellers.filter(s => s.category === 'food').slice(0, 8);
  const featuredMarkets = sellers.filter(s => s.category === 'market').slice(0, 8);
  const activeCarAds = filteredCarAds.filter(c => (c.adStatus as string) !== 'rejected' && (c.adStatus as string) !== 'hidden' && (c.adStatus as string) !== 'deleted').slice(0, 8);
  const trendingProducts = products.filter(p => p.isAvailable !== false && p.productStatus !== 'hidden').slice(0, 12);

  // Best sellers computation (filtered by category if selected)
  const bestSellers = products
    .filter(p => (bestSellerCategory === 'all' || p.category === bestSellerCategory) && p.isAvailable !== false && p.productStatus !== 'hidden')
    .slice(0, 12);

  const mainCategories = [
    { id: 'food' as ProductCategory, name: t('چێشتخانە و خواردن'), subtitle: t('خواردنی بەتام و خێرا'), icon: <Utensils className="w-5 h-5" />, count: '١٢٠+' },
    { id: 'market' as ProductCategory, name: t('مارکێت و پێداویستی'), subtitle: t('هەموو کەلوپەلی ماڵ'), icon: <ShoppingBag className="w-5 h-5" />, count: '٤٥+' },
    { id: 'clothes' as ProductCategory, name: t('جلوبەرگ و مۆدە'), subtitle: t('مۆدێلی پیاوان و ئافرەتان'), icon: <Shirt className="w-5 h-5" />, count: '٣٠+' },
    { id: 'fruits_vegetables' as ProductCategory, name: t('سەوزە و میوە'), subtitle: t('فرێش و سروشتی'), icon: <Apple className="w-5 h-5" />, count: t('فرێش') },
    { id: 'fresh_meat' as ProductCategory, name: t('گۆشتی تازە'), subtitle: t('بەرخ و مریشکی ڕۆژانە'), icon: <Beef className="w-5 h-5" />, count: t('گۆشت') },
    { id: 'dairy' as ProductCategory, name: t('شیرەمەنی و ماست'), subtitle: t('ماستی خۆماڵی و پەنیر'), icon: <Milk className="w-5 h-5" />, count: t('شیرەمەنی') },
    { id: 'electronics' as ProductCategory, name: t('ئەلیکترۆنیات'), subtitle: t('مۆبایل و کۆمپیوتەر'), icon: <Smartphone className="w-5 h-5" />, count: '١٥+' },
    { id: 'beauty' as ProductCategory, name: t('جوانی و مکیاژ'), subtitle: t('عەتر و چاودێری پێست'), icon: <Sparkles className="w-5 h-5" />, count: t('جوانی') },
    { id: 'cars' as ProductCategory, name: t('ئۆتۆمبێل و گواستنەوە'), subtitle: t('کڕین و فرۆشتنی ئۆتۆمبێل'), icon: <Car className="w-5 h-5" />, count: '٨٥+' }
  ];

  const handleScrollCategories = (direction: 'left' | 'right') => {
    if (categoriesScrollRef.current) {
      const scrollDist = 280;
      categoriesScrollRef.current.scrollBy({
        left: direction === 'right' ? -scrollDist : scrollDist,
        behavior: 'smooth'
      });
    }
  };

  return (
    <div className="space-y-10 pb-20" dir={dir}>
      
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-tr from-[#FF3300] via-[#FF5500] to-[#FF7700] text-white shadow-xl shadow-orange-500/25 border border-orange-400/30">
        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-10 sm:py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="z-10 max-w-2xl space-y-4 text-center md:text-start">
            <div className="inline-flex items-center gap-2 bg-white/20 backdrop-blur-md px-3.5 py-1 rounded-full text-xs font-bold border border-white/30">
              <Sparkles className="w-3.5 h-3.5 text-amber-200 animate-spin-slow" />
              <span>{t('پلاتفۆرمی یەکەمی بازاڕکردن و ئۆتۆمبێل لە کوردستان')}</span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight drop-shadow-md">
              {t('هەموو شتێک لە یەک شوێن لەگەڵ شاخ (SHAKH)')}
            </h1>

            <p className="text-base sm:text-lg opacity-95 leading-relaxed max-w-xl font-medium">
              {t('خێراترین گەیاندن بۆ خواردن، سوپەرمارکێت، جلوبەرگ و کڕین و فرۆشتنی ئۆتۆمبێل بە بەرزترین کوالیتی.')}
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => onSelectCategory('food')}
                className="bg-white text-[#FF5500] px-7 py-3 rounded-xl font-black hover:bg-slate-50 shadow-lg shadow-black/10 transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Utensils className="w-4 h-4" />
                <span>{t('ئێستا داوا بکە')}</span>
              </button>

              <button
                onClick={() => onNavigate('car-marketplace')}
                className="bg-[#2563EB] hover:bg-blue-700 text-white px-6 py-3 rounded-xl font-bold text-sm shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer border border-blue-400/40"
              >
                <Car className="w-4 h-4" />
                <span>{t('بازاڕی ئۆتۆمبێل')}</span>
              </button>

              <button
                onClick={() => setShowAppModal(true)}
                className="bg-slate-900/80 hover:bg-slate-900 text-white border border-white/20 px-5 py-3 rounded-xl font-bold text-sm backdrop-blur-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <Download className="w-4 h-4 text-orange-400" />
                <span>{t('داگرتنی ئەپ')}</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-3.5 w-76 z-10">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-sm text-slate-800 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold pt-1">{t('گەیاندنی خێرا')}</h4>
              <p className="text-[11px] text-slate-500">{t('لە کەمتر لە ٣٠ بۆ ٤٥ خولەک')}</p>
            </div>

            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-sm text-slate-800 space-y-1 mt-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold pt-1">{t('دڵنیایی و کواڵیتی')}</h4>
              <p className="text-[11px] text-slate-500">{t('فرۆشیاری پشتڕاستکراو')}</p>
            </div>
          </div>
        </div>

        {/* Decorative mountain graphic */}
        <div className="absolute left-[-50px] bottom-[-40px] opacity-15 pointer-events-none transform -rotate-12">
          <svg width="340" height="340" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 0C44.8 0 0 44.8 0 100s44.8 100 100 100 100-44.8 100-100S155.2 0 100 0z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Horizontal Scrollable Categories Carousel with Smooth Left/Right Buttons */}
      <section className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-2.5 h-6 bg-[#F97316] rounded-full" />
            <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">{t('بەشەکانی شاخ')}</h2>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => handleScrollCategories('right')}
              className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all cursor-pointer"
            >
              <ChevronRight className="w-4 h-4" />
            </button>
            <button
              onClick={() => handleScrollCategories('left')}
              className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all cursor-pointer"
            >
              <ChevronLeft className="w-4 h-4" />
            </button>
          </div>
        </div>

        <div
          ref={categoriesScrollRef}
          className="flex gap-3 overflow-x-auto pb-2 scrollbar-none no-scrollbar scroll-smooth snap-x"
        >
          {mainCategories.map(cat => (
            <div
              key={cat.id}
              onClick={() => cat.id === 'cars' ? onNavigate('car-marketplace') : onSelectCategory(cat.id)}
              className="bg-white dark:bg-[#1e293b] p-4 rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#2563EB] dark:hover:border-blue-500 transition-all cursor-pointer group shadow-xs hover:shadow-md flex-shrink-0 w-44 sm:w-52 snap-start flex flex-col justify-between"
            >
              <div className="flex items-center justify-between mb-3">
                <div className="w-11 h-11 bg-orange-50 dark:bg-orange-950/60 text-[#FF5500] rounded-xl flex items-center justify-center group-hover:bg-[#FF5500] group-hover:text-white transition-colors">
                  {cat.icon}
                </div>
                <span className="text-[10px] font-bold text-slate-400 dark:text-slate-400 bg-slate-50 dark:bg-slate-800 px-2 py-0.5 rounded-md">
                  {cat.count}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-slate-900 dark:text-slate-100 text-xs sm:text-sm group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5 line-clamp-1">{cat.subtitle}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* BEST SELLERS SECTION (پرفرۆشترین کاڵاکان - لا سلاید) */}
      <section className="bg-gradient-to-br from-rose-50/50 via-white to-orange-50/40 dark:from-[#1e293b] dark:via-[#1e293b] dark:to-orange-950/20 rounded-3xl p-6 sm:p-8 border border-rose-100 dark:border-slate-800 shadow-xs space-y-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-rose-500 text-white flex items-center justify-center shadow-md shadow-rose-500/30 animate-pulse">
              <Flame className="w-6 h-6 fill-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-slate-100">{t('پرفرۆشترین کاڵاکان (Best Sellers)')}</h2>
                <span className="bg-rose-500 text-white text-[10px] font-black px-2 py-0.5 rounded-md uppercase tracking-wider">
                  TOP HOT
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Filter Chips */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
              {[
                { id: 'all', name: t('هەموو') },
                { id: 'food', name: t('خواردن') },
                { id: 'market', name: t('مارکێت') },
                { id: 'clothes', name: t('جلوبەرگ') },
                { id: 'electronics', name: t('ئەلیکترۆنیات') }
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setBestSellerCategory(tab.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
                    bestSellerCategory === tab.id
                      ? 'bg-rose-600 text-white shadow-sm'
                      : 'bg-white text-slate-700 hover:bg-slate-100 border border-slate-200'
                  }`}
                >
                  {tab.name}
                </button>
              ))}
            </div>

            {/* Side Slider Controls */}
            {bestSellers.length > 0 && (
              <div className="flex items-center gap-1.5 flex-shrink-0">
                <button
                  onClick={() => handleScrollSection(bestSellersScrollRef, 'right')}
                  className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all cursor-pointer"
                  title="ڕاست"
                >
                  <ChevronRight className="w-4 h-4" />
                </button>
                <button
                  onClick={() => handleScrollSection(bestSellersScrollRef, 'left')}
                  className="w-8 h-8 rounded-full bg-white dark:bg-slate-800 shadow-xs border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-50 dark:hover:bg-slate-700 active:scale-90 transition-all cursor-pointer"
                  title="چەپ"
                >
                  <ChevronLeft className="w-4 h-4" />
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Best Sellers Horizontal Side Slider */}
        {bestSellers.length > 0 ? (
          <div
            ref={bestSellersScrollRef}
            className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x scroll-smooth"
          >
            {bestSellers.map(product => (
              <div key={product.id} className="flex-shrink-0 w-60 sm:w-64 snap-start">
                <ProductCard
                  product={product}
                  onClick={() => onNavigate('product-detail', product.id)}
                  onSellerClick={(sId) => onNavigate('seller-store', sId)}
                />
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8 bg-white/50 dark:bg-slate-800/50 rounded-2xl border border-dashed border-slate-300 dark:border-slate-700">
            <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
            <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('هیچ کاڵایەک لەم بەشەدا بەردەست نییە')}</p>
            <p className="text-xs text-slate-400 mt-1">{t('تۆ وەک فرۆشیار دەتوانیت کاڵای نوێ زیاد بکەیت')}</p>
          </div>
        )}
      </section>

      {/* Main Grid Content: Left Main Showcase + Right Minimalist Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Column (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Cars Showcase Side Slider */}
          <section className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-slate-800">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 bg-[#2563EB] rounded-full" />
                <div className="flex items-center gap-1.5">
                  <Car className="w-5 h-5 text-[#2563EB]" />
                  <h2 className="text-lg sm:text-xl font-black text-slate-800 dark:text-slate-100">{t('نوێترین ئۆتۆمبێلەکان (لا سلاید)')}</h2>
                </div>
              </div>
              <div className="flex items-center gap-3">
                {activeCarAds.length > 0 && (
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleScrollSection(carsScrollRef, 'right')}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleScrollSection(carsScrollRef, 'left')}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                )}
                <button
                  onClick={() => onNavigate('car-marketplace')}
                  className="text-[#2563EB] text-xs sm:text-sm font-bold hover:underline cursor-pointer"
                >
                  {t('بینینی هەمووی ←')}
                </button>
              </div>
            </div>

            {activeCarAds.length > 0 ? (
              <div
                ref={carsScrollRef}
                className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x scroll-smooth"
              >
                {activeCarAds.map(car => (
                  <div key={car.id} className="flex-shrink-0 w-72 sm:w-80 snap-start">
                    <CarAdCard
                      car={car}
                      onClick={() => onNavigate('car-detail', car.id)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-slate-50 dark:bg-slate-800/40 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <Car className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('هیچ ئۆتۆمبێلێک بڵاونەکراوەتەوە')}</p>
                <p className="text-xs text-slate-400 mt-1">{t('ئێستا دەتوانیت یەکەم ڕیکلامی ئۆتۆمبێل بڵاوبکەیتەوە')}</p>
              </div>
            )}
          </section>

          {/* Special Offers / Discounts Side Slider */}
          {specialOffers.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-6 bg-rose-600 rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-5 h-5 text-rose-600" />
                    <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">{t('داشکاندن و ئۆفەرە تایبەتەکان')}</h2>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <div className="flex items-center gap-1.5">
                    <button
                      onClick={() => handleScrollSection(specialOffersScrollRef, 'right')}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition-all cursor-pointer"
                    >
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleScrollSection(specialOffersScrollRef, 'left')}
                      className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition-all cursor-pointer"
                    >
                      <ChevronLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                  <button
                    onClick={() => onSelectCategory('food')}
                    className="text-xs font-bold text-[#FF5500] hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <span>{t('هەمووی ببینە')}</span>
                    <ArrowLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              <div
                ref={specialOffersScrollRef}
                className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x scroll-smooth"
              >
                {specialOffers.map(p => (
                  <div key={p.id} className="flex-shrink-0 w-60 sm:w-64 snap-start">
                    <ProductCard
                      product={p}
                      onClick={() => onNavigate('product-detail', p.id)}
                      onSellerClick={(sId) => onNavigate('seller-store', sId)}
                    />
                  </div>
                ))}
              </div>
            </section>
          )}

          {/* Trending Products Side Slider */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 bg-[#2563EB] rounded-full" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100">{t('کاڵا هەڵبژێردراوەکان لە هەموو بەشەکان')}</h2>
              </div>
              {trendingProducts.length > 0 && (
                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleScrollSection(trendingScrollRef, 'right')}
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition-all cursor-pointer"
                  >
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={() => handleScrollSection(trendingScrollRef, 'left')}
                    className="w-7 h-7 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 flex items-center justify-center hover:bg-slate-200 active:scale-90 transition-all cursor-pointer"
                  >
                    <ChevronLeft className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            {trendingProducts.length > 0 ? (
              <div
                ref={trendingScrollRef}
                className="flex gap-4 overflow-x-auto pb-2 scrollbar-none snap-x scroll-smooth"
              >
                {trendingProducts.map(product => (
                  <div key={product.id} className="flex-shrink-0 w-60 sm:w-64 snap-start">
                    <ProductCard
                      product={product}
                      onClick={() => onNavigate('product-detail', product.id)}
                      onSellerClick={(sId) => onNavigate('seller-store', sId)}
                    />
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 bg-white dark:bg-slate-800 rounded-2xl border border-dashed border-slate-200 dark:border-slate-700">
                <ShoppingBag className="w-8 h-8 text-slate-400 mx-auto mb-2" />
                <p className="text-sm font-bold text-slate-600 dark:text-slate-300">{t('هیچ کاڵایەک نەدۆزرایەوە')}</p>
              </div>
            )}
          </section>

        </div>

        {/* Sidebar Column (4 cols on lg) */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* App Download Banner in Sidebar */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-[#F97316] text-white flex items-center justify-center font-black text-xl shadow-md">
                {t('شاخ')}
              </div>
              <div>
                <h3 className="font-bold text-base text-white">{t('ئەپی مۆبایلی شاخ')}</h3>
                <p className="text-xs text-slate-400">{t('بۆ ئەندرۆید و ئایفۆن')}</p>
              </div>
            </div>

            <p className="text-xs text-slate-300 leading-relaxed">
              {t('ئەپەکە دابەزێنە بۆ خێراترین کڕین، ئاگاداری ڕاستەوخۆ و داشکاندنی تایبەت.')}
            </p>

            <button
              onClick={() => setShowAppModal(true)}
              className="w-full py-3 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-md transition-transform active:scale-95 cursor-pointer"
            >
              <Download className="w-4 h-4" />
              <span>{t('دابەزاندنی ئەپ بۆ مۆبایل')}</span>
            </button>
          </div>

          {/* Post Car Promotion Card */}
          <div className="bg-[#2563EB] text-white rounded-3xl p-6 shadow-md">
            <h3 className="text-xl font-black mb-2">{t('ئۆتۆمبێلەکەت بفرۆشە!')}</h3>
            <p className="text-sm opacity-90 mb-5 leading-relaxed">
              {t('ئێستا دەتوانیت ئۆتۆمبێلەکەت لە شاخ پۆست بکەیت بە کاتی دیاریکراو و بە خێراترین کات بیفرۆشیت.')}
            </p>

            <div className="space-y-2.5 mb-6">
              <div className="flex items-center gap-3 bg-blue-700/50 p-2.5 rounded-xl border border-blue-400/30">
                <div className="bg-white text-[#2563EB] w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
                  ١
                </div>
                <span className="text-xs sm:text-sm font-semibold">{t('١ زانیارییەکان بنووسە')}</span>
              </div>

              <div className="flex items-center gap-3 bg-blue-700/50 p-2.5 rounded-xl border border-blue-400/30">
                <div className="bg-white text-[#2563EB] w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
                  ٢
                </div>
                <span className="text-xs sm:text-sm font-semibold">{t('٢ پاکێج و کات هەڵبژێرە')}</span>
              </div>

              <div className="flex items-center gap-3 bg-blue-700/50 p-2.5 rounded-xl border border-blue-400/30">
                <div className="bg-white text-[#2563EB] w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
                  ٣
                </div>
                <span className="text-xs sm:text-sm font-semibold">{t('٣ پۆستەکەت چالاک بکە')}</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('post-car-ad')}
              className="w-full bg-[#F97316] text-white py-3 rounded-xl font-bold shadow-md hover:bg-orange-600 transition-colors text-sm cursor-pointer"
            >
              {t('دەستپێبکە ئێستا')}
            </button>
          </div>

          {/* Popular Food Centers List */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{t('ناوەندەکانی خواردن')}</h3>
              <button
                onClick={() => onSelectCategory('food')}
                className="text-xs text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                {t('هەمووی ←')}
              </button>
            </div>

            <div className="space-y-3.5">
              {featuredRestaurants.slice(0, 4).map(seller => (
                <div
                  key={seller.id}
                  onClick={() => onNavigate('seller-store', seller.id)}
                  className="flex items-center gap-3.5 group cursor-pointer"
                >
                  <img
                    src={seller.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'}
                    alt={seller.storeName}
                    className="w-13 h-13 rounded-2xl object-cover bg-slate-100 flex-shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-[#F97316] transition-colors line-clamp-1">
                      {seller.storeName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-amber-500 font-bold font-latin">★ {seller.rating}</span>
                      <span className="text-[10px] text-slate-400 font-latin">({seller.totalReviews})</span>
                      <span className="text-[10px] text-slate-400">• {seller.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Supermarkets Sidebar List */}
          <div className="bg-white dark:bg-[#1e293b] rounded-3xl p-6 shadow-xs border border-slate-100 dark:border-slate-800">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100 dark:border-slate-800">
              <h3 className="text-base font-black text-slate-800 dark:text-slate-100">{t('سوپەرمارکێتەکان')}</h3>
              <button
                onClick={() => onSelectCategory('market')}
                className="text-xs text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                {t('هەمووی ←')}
              </button>
            </div>

            <div className="space-y-3.5">
              {featuredMarkets.slice(0, 3).map(seller => (
                <div
                  key={seller.id}
                  onClick={() => onNavigate('seller-store', seller.id)}
                  className="flex items-center gap-3.5 group cursor-pointer"
                >
                  <img
                    src={seller.logoUrl || 'https://images.unsplash.com/photo-1542838132-92c53300491e?w=200'}
                    alt={seller.storeName}
                    className="w-13 h-13 rounded-2xl object-cover bg-slate-100 flex-shrink-0 border border-slate-100"
                  />
                  <div className="flex-1 border-b border-slate-100 pb-2">
                    <h4 className="font-bold text-slate-800 text-xs sm:text-sm group-hover:text-[#2563EB] transition-colors line-clamp-1">
                      {seller.storeName}
                    </h4>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-xs text-amber-500 font-bold font-latin">★ {seller.rating}</span>
                      <span className="text-[10px] text-slate-400">• {seller.city}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </aside>

      </div>

      {/* Seller Callout Banner */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-[#2563EB] text-xs font-bold border border-blue-500/30">
            {t('تایبەت بە فرۆشیاران و خاوەن کارەکان')}
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            {t('فرۆشگات هەیە؟ لەگەڵ شاخ فرۆشت زیادبکە!')}
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            {t('لە کەمتر لە ٥ خولەک فرۆشگاکەت تۆماربکە، کاڵاکانت دابنێ و بە خێراترین کات بگەرێ بە دەستی هەزاران کڕیار لە شارەکەت.')}
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('auth', 'register')}
              className="px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
            >
              {t('تۆمارکردنی فرۆشگای خۆت')}
            </button>
            <button
              onClick={() => onNavigate('seller-dashboard')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors cursor-pointer"
            >
              {t('چوونەژوورەوەی فرۆشیاران')}
            </button>
          </div>
        </div>
      </section>

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={showAppModal}
        onClose={() => setShowAppModal(false)}
      />

    </div>
  );
};
