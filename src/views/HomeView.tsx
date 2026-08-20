import React from 'react';
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
  Truck
} from 'lucide-react';
import { ProductCategory, Product, SellerProfile, CarAd } from '../types';
import { ProductCard } from '../components/cards/ProductCard';
import { CarAdCard } from '../components/cards/CarAdCard';
import { SellerCard } from '../components/cards/SellerCard';
import { useMarketplace } from '../context/MarketplaceContext';
import { useLanguage } from '../context/LanguageContext';

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
  const { dir } = useLanguage();

  // Filter by selected city if applicable
  const filteredSellers = selectedCity
    ? sellers.filter(s => s.city.includes(selectedCity.split(' ')[0]))
    : sellers;

  const filteredCarAds = selectedCity
    ? carAds.filter(c => c.city.includes(selectedCity.split(' ')[0]))
    : carAds;

  const specialOffers = products.filter(p => p.discountPrice && p.discountPrice < p.price).slice(0, 4);
  const featuredRestaurants = sellers.filter(s => s.category === 'food').slice(0, 4);
  const featuredMarkets = sellers.filter(s => s.category === 'market').slice(0, 4);
  const activeCarAds = filteredCarAds.filter(c => c.adStatus === 'active').slice(0, 4);
  const trendingProducts = products.slice(0, 8);

  const mainCategories = [
    { id: 'food' as ProductCategory, name: 'چێشتخانە و خواردن', subtitle: 'خواردنی بەتام و خێرا', icon: <Utensils className="w-6 h-6" />, color: 'from-orange-500 to-amber-500', bg: 'bg-orange-50' },
    { id: 'market' as ProductCategory, name: 'مارکێت و پێداویستی', subtitle: 'هەموو کەلوپەلی ماڵ', icon: <ShoppingBag className="w-6 h-6" />, color: 'from-blue-600 to-indigo-600', bg: 'bg-blue-50' },
    { id: 'clothes' as ProductCategory, name: 'جلوبەرگ و مۆدە', subtitle: 'مۆدێلی پیاوان و ئافرەتان', icon: <Shirt className="w-6 h-6" />, color: 'from-purple-600 to-pink-600', bg: 'bg-purple-50' },
    { id: 'fruits_vegetables' as ProductCategory, name: 'سەوزە و میوە', subtitle: 'فرێش و سروشتی', icon: <Apple className="w-6 h-6" />, color: 'from-emerald-600 to-teal-600', bg: 'bg-emerald-50' },
    { id: 'fresh_meat' as ProductCategory, name: 'گۆشتی تازە', subtitle: 'بەرخ و مریشکی ڕۆژانە', icon: <Beef className="w-6 h-6" />, color: 'from-rose-600 to-red-600', bg: 'bg-rose-50' },
    { id: 'dairy' as ProductCategory, name: 'شیرەمەنی و ماست', subtitle: 'ماستی خۆماڵی و پەنیر', icon: <Milk className="w-6 h-6" />, color: 'from-cyan-600 to-blue-600', bg: 'bg-cyan-50' },
    { id: 'electronics' as ProductCategory, name: 'ئەلیکترۆنیات', subtitle: 'مۆبایل و کۆمپیوتەر', icon: <Smartphone className="w-6 h-6" />, color: 'from-indigo-600 to-blue-700', bg: 'bg-indigo-50' },
    { id: 'beauty' as ProductCategory, name: 'جوانی و مکیاژ', subtitle: 'عەتر و چاودێری پێست', icon: <Sparkles className="w-6 h-6" />, color: 'from-pink-500 to-rose-500', bg: 'bg-pink-50' },
    { id: 'cars' as ProductCategory, name: 'ئۆتۆمبێل و گواستنەوە', subtitle: 'کڕین و فرۆشتنی ئۆتۆمبێل', icon: <Car className="w-6 h-6" />, color: 'from-amber-500 to-orange-600', bg: 'bg-amber-50' }
  ];

  return (
    <div className="space-y-10 pb-16">
      
      {/* Hero Banner Section - Clean Minimalism */}
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-l from-[#F97316] to-[#fb923c] text-white shadow-md">
        <div className="relative max-w-7xl mx-auto px-6 sm:px-12 py-10 sm:py-14 flex flex-col md:flex-row items-center justify-between gap-8">
          <div className="z-10 max-w-2xl space-y-4 text-center md:text-right">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-black leading-tight tracking-tight">
              هەموو شتێک لە یەک شوێن لەگەڵ شاخی
            </h1>

            <p className="text-base sm:text-lg opacity-90 leading-relaxed max-w-xl">
              خێراترین گەیاندن لە کوردستان بۆ خواردن، بازاڕکردن و پێداویستییەکانت.
            </p>

            <div className="pt-2 flex flex-wrap items-center justify-center md:justify-start gap-3">
              <button
                onClick={() => onSelectCategory('food')}
                className="bg-white text-[#F97316] px-8 py-3 rounded-xl font-bold hover:bg-slate-50 shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Utensils className="w-4 h-4" />
                <span>ئێستا داوا بکە</span>
              </button>

              <button
                onClick={() => onNavigate('car-marketplace')}
                className="bg-[#2563EB] hover:bg-blue-700 text-white px-7 py-3 rounded-xl font-bold text-sm shadow-md transition-transform active:scale-95 flex items-center gap-2 cursor-pointer"
              >
                <Car className="w-4 h-4" />
                <span>بازاڕی ئۆتۆمبێل</span>
              </button>

              <button
                onClick={() => onNavigate('post-car-ad')}
                className="bg-white/15 hover:bg-white/25 text-white border border-white/30 px-6 py-3 rounded-xl font-bold text-sm backdrop-blur-xs flex items-center gap-2 cursor-pointer transition-colors"
              >
                <PlusCircle className="w-4 h-4" />
                <span>دانانی پۆستی ئۆتۆمبێل</span>
              </button>
            </div>
          </div>

          <div className="hidden lg:grid grid-cols-2 gap-3.5 w-76 z-10">
            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-sm text-slate-800 space-y-1">
              <div className="w-10 h-10 rounded-xl bg-orange-50 text-[#F97316] flex items-center justify-center font-bold">
                <Truck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold pt-1">گەیاندنی خێرا</h4>
              <p className="text-[11px] text-slate-500">لە کەمتر لە ٣٠ بۆ ٤٥ خولەک</p>
            </div>

            <div className="bg-white/95 backdrop-blur-md p-4 rounded-2xl shadow-sm text-slate-800 space-y-1 mt-4">
              <div className="w-10 h-10 rounded-xl bg-blue-50 text-[#2563EB] flex items-center justify-center font-bold">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <h4 className="text-xs font-bold pt-1">کوالیتی گەرەنتی</h4>
              <p className="text-[11px] text-slate-500">فرۆشیاری پشتڕاستکراو</p>
            </div>
          </div>
        </div>

        {/* Subtle decorative mountain arc */}
        <div className="absolute left-[-50px] bottom-[-40px] opacity-15 pointer-events-none transform -rotate-12">
          <svg width="340" height="340" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M100 0C44.8 0 0 44.8 0 100s44.8 100 100 100 100-44.8 100-100S155.2 0 100 0z" fill="white"/>
          </svg>
        </div>
      </section>

      {/* Clean Minimalism 4-Column Quick Categories */}
      <section className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <div
          onClick={() => onSelectCategory('food')}
          className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-[#2563EB] transition-all cursor-pointer group shadow-xs hover:shadow-sm"
        >
          <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#2563EB] group-hover:text-white transition-colors">
            <Utensils className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">خواردنی خێرا</h3>
          <p className="text-xs text-slate-500 mt-0.5">{sellers.filter(s => s.category === 'food').length || 120} ڕێستۆرانت</p>
        </div>

        <div
          onClick={() => onSelectCategory('market')}
          className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-[#2563EB] transition-all cursor-pointer group shadow-xs hover:shadow-sm"
        >
          <div className="w-12 h-12 bg-orange-50 text-[#F97316] rounded-xl flex items-center justify-center mb-3 group-hover:bg-[#F97316] group-hover:text-white transition-colors">
            <ShoppingBag className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">سووپەرمارکێت</h3>
          <p className="text-xs text-slate-500 mt-0.5">{sellers.filter(s => s.category === 'market').length || 45} بازاڕ</p>
        </div>

        <div
          onClick={() => onSelectCategory('electronics')}
          className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-[#2563EB] transition-all cursor-pointer group shadow-xs hover:shadow-sm"
        >
          <div className="w-12 h-12 bg-purple-50 text-purple-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-purple-600 group-hover:text-white transition-colors">
            <Smartphone className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">ئەلیکترۆنیات</h3>
          <p className="text-xs text-slate-500 mt-0.5">{sellers.filter(s => s.category === 'electronics').length || 12} نوێنەرایەتی</p>
        </div>

        <div
          onClick={() => onNavigate('car-marketplace')}
          className="bg-white p-4.5 rounded-2xl border border-slate-200 hover:border-[#2563EB] transition-all cursor-pointer group shadow-xs hover:shadow-sm"
        >
          <div className="w-12 h-12 bg-emerald-50 text-emerald-600 rounded-xl flex items-center justify-center mb-3 group-hover:bg-emerald-600 group-hover:text-white transition-colors">
            <Car className="h-6 w-6" />
          </div>
          <h3 className="font-bold text-slate-800 text-sm sm:text-base">ئۆتۆمبێل</h3>
          <p className="text-xs text-slate-500 mt-0.5">{carAds.length || 85} پۆستی نوێ</p>
        </div>
      </section>

      {/* Main Grid Content: Left Main Showcase + Right Minimalist Sidebar */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Main Column (8 cols on lg) */}
        <div className="lg:col-span-8 space-y-8">

          {/* Clean Cars Showcase */}
          <section className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100 space-y-4">
            <div className="flex justify-between items-center pb-2 border-b border-slate-100">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 bg-[#2563EB] rounded-full" />
                <h2 className="text-lg sm:text-xl font-black text-slate-800">نوێترین ئۆتۆمبێلەکان</h2>
              </div>
              <button
                onClick={() => onNavigate('car-marketplace')}
                className="text-[#2563EB] text-xs sm:text-sm font-bold hover:underline cursor-pointer"
              >
                بینینی هەمووی ←
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
              {activeCarAds.slice(0, 3).map(car => (
                <CarAdCard
                  key={car.id}
                  car={car}
                  onClick={() => onNavigate('car-detail', car.id)}
                />
              ))}
            </div>
          </section>

          {/* Special Offers / Discounts */}
          {specialOffers.length > 0 && (
            <section className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-6 bg-rose-600 rounded-full" />
                  <div className="flex items-center gap-1.5">
                    <Flame className="w-5 h-5 text-rose-600" />
                    <h2 className="text-lg sm:text-xl font-black text-slate-900">داشکاندن و ئۆفەرە تایبەتەکان</h2>
                  </div>
                </div>
                <button
                  onClick={() => onSelectCategory('food')}
                  className="text-xs font-bold text-[#F97316] hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <span>هەمووی ببینە</span>
                  <ArrowLeft className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
                {specialOffers.map(p => (
                  <ProductCard
                    key={p.id}
                    product={p}
                    onClick={() => onNavigate('product-detail', p.id)}
                    onSellerClick={(sId) => onNavigate('seller-store', sId)}
                  />
                ))}
              </div>
            </section>
          )}

          {/* Trending Products */}
          <section className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2.5 h-6 bg-[#2563EB] rounded-full" />
                <h2 className="text-lg sm:text-xl font-black text-slate-900">کاڵا هەڵبژێردراوەکان لە هەموو بەشەکان</h2>
              </div>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4">
              {trendingProducts.map(product => (
                <ProductCard
                  key={product.id}
                  product={product}
                  onClick={() => onNavigate('product-detail', product.id)}
                  onSellerClick={(sId) => onNavigate('seller-store', sId)}
                />
              ))}
            </div>
          </section>

        </div>

        {/* Sidebar Column (4 cols on lg) - Clean Minimalism Aside */}
        <aside className="lg:col-span-4 space-y-6">
          
          {/* Post Car Promotion Card */}
          <div className="bg-[#2563EB] text-white rounded-3xl p-6 shadow-md">
            <h3 className="text-xl font-black mb-2">ئۆتۆمبێلەکەت بفرۆشە!</h3>
            <p className="text-sm opacity-90 mb-5 leading-relaxed">
              ئێستا دەتوانیت ئۆتۆمبێلەکەت لە شاخ پۆست بکەیت و بە خێراترین کات بیفرۆشیت.
            </p>

            <div className="space-y-2.5 mb-6">
              <div className="flex items-center gap-3 bg-blue-700/50 p-2.5 rounded-xl border border-blue-400/30">
                <div className="bg-white text-[#2563EB] w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
                  ١
                </div>
                <span className="text-xs sm:text-sm font-semibold">زانیارییەکان بنووسە</span>
              </div>

              <div className="flex items-center gap-3 bg-blue-700/50 p-2.5 rounded-xl border border-blue-400/30">
                <div className="bg-white text-[#2563EB] w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
                  ٢
                </div>
                <span className="text-xs sm:text-sm font-semibold">پاکێج هەڵبژێرە</span>
              </div>

              <div className="flex items-center gap-3 bg-blue-700/50 p-2.5 rounded-xl border border-blue-400/30">
                <div className="bg-white text-[#2563EB] w-8 h-8 rounded-lg flex items-center justify-center font-black text-sm flex-shrink-0">
                  ٣
                </div>
                <span className="text-xs sm:text-sm font-semibold">پۆستەکەت چالاک بکە</span>
              </div>
            </div>

            <button
              onClick={() => onNavigate('post-car-ad')}
              className="w-full bg-[#F97316] text-white py-3 rounded-xl font-bold shadow-md hover:bg-orange-600 transition-colors text-sm cursor-pointer"
            >
              دەستپێبکە ئێستا
            </button>
          </div>

          {/* Popular Food Centers List */}
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">ناوەندەکانی خواردن</h3>
              <button
                onClick={() => onSelectCategory('food')}
                className="text-xs text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                هەمووی ←
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
          <div className="bg-white rounded-3xl p-6 shadow-xs border border-slate-100">
            <div className="flex justify-between items-center mb-4 pb-2 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-800">سوپەرمارکێتەکان</h3>
              <button
                onClick={() => onSelectCategory('market')}
                className="text-xs text-[#2563EB] font-bold hover:underline cursor-pointer"
              >
                هەمووی ←
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

      {/* All Categories Showcase Grid */}
      <section className="space-y-4 pt-4">
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-6 bg-[#F97316] rounded-full" />
          <h2 className="text-lg sm:text-xl font-black text-slate-900">هەموو بەشەکانی شاخی</h2>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 sm:gap-4">
          {mainCategories.map(cat => (
            <button
              key={cat.id}
              onClick={() => onSelectCategory(cat.id)}
              className="group relative bg-white p-4 rounded-2xl border border-slate-200 hover:border-[#2563EB] hover:shadow-sm transition-all text-right flex flex-col justify-between h-30 cursor-pointer"
            >
              <div className="w-11 h-11 rounded-xl bg-slate-100 text-slate-700 flex items-center justify-center group-hover:bg-[#F97316] group-hover:text-white transition-colors">
                {cat.icon}
              </div>
              <div>
                <h3 className="text-xs sm:text-sm font-bold text-slate-900 group-hover:text-[#F97316] transition-colors">
                  {cat.name}
                </h3>
                <p className="text-[10px] sm:text-[11px] text-slate-400 line-clamp-1 mt-0.5">
                  {cat.subtitle}
                </p>
              </div>
            </button>
          ))}
        </div>
      </section>

      {/* Seller Callout */}
      <section className="relative overflow-hidden rounded-3xl bg-slate-900 text-white p-8 sm:p-12 shadow-sm">
        <div className="max-w-2xl space-y-3">
          <span className="inline-block px-3 py-1 rounded-full bg-blue-500/20 text-[#2563EB] text-xs font-bold border border-blue-500/30">
            تایبەت بە فرۆشیاران و خاوەن کارەکان
          </span>
          <h2 className="text-2xl sm:text-3xl font-black">
            فرۆشگات هەیە؟ لەگەڵ شاخی فرۆشت زیادبکە!
          </h2>
          <p className="text-xs sm:text-sm text-slate-300 leading-relaxed">
            لە کەمتر لە ٥ خولەک فرۆشگاکەت تۆماربکە، کاڵاکانت دابنێ و بە خێراترین کات بگەرێ بە دەستی هەزاران کڕیار لە شارەکەت.
          </p>
          <div className="pt-2 flex flex-wrap gap-3">
            <button
              onClick={() => onNavigate('auth', 'register')}
              className="px-6 py-3 bg-[#F97316] hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow transition-transform active:scale-95 cursor-pointer"
            >
              تۆمارکردنی فرۆشگای خۆت
            </button>
            <button
              onClick={() => onNavigate('seller-dashboard')}
              className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-bold text-xs rounded-xl border border-white/20 transition-colors cursor-pointer"
            >
              چوونەژوورەوەی فرۆشیاران
            </button>
          </div>
        </div>
      </section>

    </div>
  );
};
