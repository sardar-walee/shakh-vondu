import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import {
  Search,
  MapPin,
  ShoppingCart,
  Bell,
  User,
  PlusCircle,
  Menu,
  X,
  ChevronDown,
  Globe,
  Heart,
  Package,
  Store,
  ShieldCheck,
  Truck,
  LogOut,
  Sparkles,
  Car,
  ArrowLeft,
  ArrowRight,
  Star,
  ArrowUp,
  ArrowDown,
  SlidersHorizontal,
  Tag,
  RotateCcw,
  Sun,
  Moon,
  Utensils,
  ShoppingBag,
  Shirt,
  Apple,
  Beef,
  Milk,
  Smartphone,
  Sparkle,
  Phone,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Layers,
  HelpCircle,
  ExternalLink
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useTheme } from '../../context/ThemeContext';
import { CITIES } from '../../data/seedData';
import { UserRole } from '../../types';

interface NavbarProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  selectedCity: string;
  onSelectCity: (city: string) => void;
  searchQuery: string;
  onSearchChange: (query: string) => void;
}

export const Navbar: React.FC<NavbarProps> = ({
  currentView,
  onNavigate,
  selectedCity,
  onSelectCity,
  searchQuery,
  onSearchChange
}) => {
  const { currentUser, isSuperAdmin, isSeller, isDeliveryAgent, logout, switchUserRole } = useAuth();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { notifications, unreadCount, markAsRead, markAllAsRead } = useNotification();
  const { language, setLanguage, t } = useLanguage();
  const { products, sellers, carAds } = useMarketplace();

  const { isDarkMode, toggleTheme } = useTheme();

  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
  const [isRoleModalOpen, setIsRoleModalOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);

  const notifRef = useRef<HTMLDivElement>(null);
  const userRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLDivElement>(null);

  // Close dropdowns on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (notifRef.current && !notifRef.current.contains(event.target as Node)) {
        setIsNotifOpen(false);
      }
      if (userRef.current && !userRef.current.contains(event.target as Node)) {
        setIsUserOpen(false);
      }
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setIsSearchFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Lock body scroll and listen for Escape key when Side Drawer is open
  useEffect(() => {
    if (isMobileMenuOpen) {
      document.body.style.overflow = 'hidden';
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape') {
          setIsMobileMenuOpen(false);
        }
      };
      window.addEventListener('keydown', handleKeyDown);
      return () => {
        document.body.style.overflow = '';
        window.removeEventListener('keydown', handleKeyDown);
      };
    } else {
      document.body.style.overflow = '';
    }
  }, [isMobileMenuOpen]);

  const [searchFilter, setSearchFilter] = useState<'all' | 'price_low_high' | 'price_high_low' | 'top_rated' | 'free_delivery'>('all');
  const [minPrice, setMinPrice] = useState<string>('');
  const [maxPrice, setMaxPrice] = useState<string>('');
  const [isPriceFilterOpen, setIsPriceFilterOpen] = useState<boolean>(false);
  const [priceSliderValue, setPriceSliderValue] = useState<number>(200000);

  // Filter search results preview
  const categoriesList = [
    { id: 'food', name: 'چێشتخانە و خواردن', keywords: ['خواردن', 'food', 'چێشتخانە', 'ڕێستۆرانت', 'کەباب', 'پیتزا'] },
    { id: 'market', name: 'سوپەرمارکێت و مارکێت', keywords: ['مارکێت', 'market', 'سوپەرمارکێت', 'پێداویستی'] },
    { id: 'clothes', name: 'جلوبەرگ و مۆدە', keywords: ['جل', 'جلوبەرگ', 'clothes', 'مۆدە', 'پێڵاو'] },
    { id: 'fruits_vegetables', name: 'سەوزە و میوە', keywords: ['سەوزە', 'میوە', 'fruits', 'vegetables', 'فرێش'] },
    { id: 'fresh_meat', name: 'گۆشتی تازەی کوردی', keywords: ['گۆشت', 'meat', 'مریشک'] },
    { id: 'dairy', name: 'شیرەمەنی و ماست', keywords: ['شیر', 'ماست', 'پەنیر', 'dairy'] },
    { id: 'electronics', name: 'ئەلیکترۆنیات و مۆبایل', keywords: ['مۆبایل', 'ئەلیکترۆنیات', 'phone', 'mobile', 'لاپتۆپ'] },
    { id: 'beauty', name: 'جوانی و مکیاژ', keywords: ['مکیاژ', 'عەتر', 'جوانی', 'beauty', 'perfume'] },
    { id: 'cars', name: 'بازاڕی ئۆتۆمبێل', keywords: ['ئۆتۆمبێل', 'سەیارە', 'car', 'cars', 'تۆیۆتا', 'مرسیدس'] }
  ];

  const q = searchQuery.trim().toLowerCase();

  const matchedCategories = q === '' ? [] : categoriesList.filter(c =>
    c.name.toLowerCase().includes(q) || c.keywords.some(k => k.toLowerCase().includes(q))
  );

  let rawProducts = q === '' ? [] : products.filter(p =>
    p.title.toLowerCase().includes(q) ||
    (p.description && p.description.toLowerCase().includes(q)) ||
    (p.sellerName && p.sellerName.toLowerCase().includes(q)) ||
    (p.category && p.category.toLowerCase().includes(q))
  );

  // Apply Min and Max Price filters if defined
  const numMinPrice = minPrice !== '' ? parseFloat(minPrice) : null;
  const numMaxPrice = maxPrice !== '' ? parseFloat(maxPrice) : null;

  if (numMinPrice !== null && !isNaN(numMinPrice)) {
    rawProducts = rawProducts.filter(p => (p.discountPrice || p.price) >= numMinPrice);
  }

  if (numMaxPrice !== null && !isNaN(numMaxPrice)) {
    rawProducts = rawProducts.filter(p => (p.discountPrice || p.price) <= numMaxPrice);
  }

  if (searchFilter === 'price_low_high') {
    rawProducts = [...rawProducts].sort((a, b) => (a.discountPrice || a.price) - (b.discountPrice || b.price));
  } else if (searchFilter === 'price_high_low') {
    rawProducts = [...rawProducts].sort((a, b) => (b.discountPrice || b.price) - (a.discountPrice || a.price));
  } else if (searchFilter === 'top_rated') {
    const rated = rawProducts.filter(p => (p.rating || 0) >= 4.0).sort((a, b) => (b.rating || 0) - (a.rating || 0));
    rawProducts = rated.length > 0 ? rated : [...rawProducts].sort((a, b) => (b.rating || 0) - (a.rating || 0));
  } else if (searchFilter === 'free_delivery') {
    const freeDel = rawProducts.filter(p => (p as any).isFreeDelivery || (p as any).freeShipping || (p.discountPrice && p.discountPrice < p.price) || (p.price >= 10000));
    rawProducts = freeDel.length > 0 ? freeDel : rawProducts;
  }

  const searchResults = q === '' ? { categories: [], products: [], sellers: [], cars: [] } : {
    categories: matchedCategories,
    products: rawProducts.slice(0, 5),
    sellers: sellers.filter(s =>
      s.storeName.toLowerCase().includes(q) ||
      (s.description && s.description.toLowerCase().includes(q)) ||
      (s.city && s.city.toLowerCase().includes(q))
    ).slice(0, 3),
    cars: carAds.filter(c =>
      c.title.toLowerCase().includes(q) ||
      c.brand.toLowerCase().includes(q) ||
      c.model.toLowerCase().includes(q) ||
      (c.city && c.city.toLowerCase().includes(q))
    ).slice(0, 3)
  };

  const hasSearchResults = q !== '' && (
    (searchResults.categories && searchResults.categories.length > 0) ||
    (searchResults.products && searchResults.products.length > 0) ||
    (searchResults.sellers && searchResults.sellers.length > 0) ||
    (searchResults.cars && searchResults.cars.length > 0)
  );

  return (
    <header className="sticky top-0 z-40 bg-white dark:bg-[#0f172a]/95 backdrop-blur-md border-b border-slate-200 dark:border-slate-800 shadow-xs transition-colors duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] gap-3 md:gap-6">
          
          {/* Logo & City Picker */}
          <div className="flex items-center gap-4 sm:gap-6">
            {/* Logo & Desktop Hamburger / Menu */}
            <div className="flex items-center gap-2 sm:gap-4">
              <button
                onClick={() => setIsMobileMenuOpen(true)}
                className="hidden md:flex items-center gap-2 px-3.5 py-2 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-orange-50 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 hover:text-[#FF5500] text-xs font-bold transition-all cursor-pointer shadow-xs active:scale-95"
                title="مێنیوی سەرەکی و بەشەکان"
              >
                <Menu className="w-4 h-4 text-[#FF5500]" />
                <span>مێنیو</span>
              </button>

              <button
                onClick={() => onNavigate('home')}
                className="text-right focus:outline-hidden cursor-pointer flex-shrink-0"
              >
                <Logo size="md" showTagline={false} />
              </button>
            </div>

            {/* City Selector */}
            <div className="relative hidden md:block">
              <button
                onClick={() => setIsCityOpen(!isCityOpen)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-full bg-slate-100 hover:bg-slate-200 text-xs font-semibold text-slate-700 transition-colors cursor-pointer"
              >
                <MapPin className="w-4 h-4 text-[#2563EB]" />
                <span className="truncate max-w-[120px]">{selectedCity || 'هەموو شارەکان'}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isCityOpen && (
                <div className="absolute top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 right-0">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                    شارەکانی کوردستان و عێراق
                  </div>
                  <button
                    onClick={() => { onSelectCity(''); setIsCityOpen(false); }}
                    className="w-full text-right px-3 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 font-medium cursor-pointer"
                  >
                    هەموو شارەکان
                  </button>
                  {CITIES.map(city => (
                    <button
                      key={city}
                      onClick={() => { onSelectCity(city); setIsCityOpen(false); }}
                      className={`w-full text-right px-3 py-2 text-xs hover:bg-orange-50 font-medium cursor-pointer ${
                        selectedCity === city ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {city}
                    </button>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Search Bar - Clean Minimalism Rounded-Full Pill */}
          <div ref={searchRef} className="relative flex-1 max-w-lg hidden sm:block">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                onFocus={() => setIsSearchFocused(true)}
                placeholder={t('search.placeholder')}
                className="w-full bg-slate-100 border-none rounded-full py-2.5 pr-11 pl-4 text-xs sm:text-sm text-slate-800 placeholder-slate-400 focus:outline-hidden focus:ring-2 focus:ring-[#F97316] transition-all"
              />
              <div className="absolute right-3.5 text-slate-400 pointer-events-none">
                <Search className="w-4 h-4" />
              </div>
              {searchQuery && (
                <button
                  onClick={() => onSearchChange('')}
                  className="absolute left-3.5 p-1 text-slate-400 hover:text-slate-600 text-xs cursor-pointer"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Instant Search Dropdown Preview */}
            {isSearchFocused && hasSearchResults && (
              <div className="absolute top-full mt-2 w-full bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 max-h-96 overflow-y-auto">
                {/* Clickable Horizontal Filter Chips Row */}
                <div className="mb-3 pb-2.5 border-b border-slate-100 flex items-center gap-1.5 overflow-x-auto scrollbar-none px-1">
                  <span className="text-[11px] font-bold text-slate-400 flex items-center gap-1 flex-shrink-0 ml-1">
                    <SlidersHorizontal className="w-3 h-3 text-slate-400" />
                    فیلتەر:
                  </span>
                  <button
                    type="button"
                    onClick={() => setSearchFilter('all')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                      searchFilter === 'all'
                        ? 'bg-[#F97316] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Sparkles className="w-3.5 h-3.5" />
                    <span>هەمووی</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchFilter('price_low_high')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                      searchFilter === 'price_low_high'
                        ? 'bg-[#F97316] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowUp className="w-3.5 h-3.5" />
                    <span>Price Low-High</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchFilter('price_high_low')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                      searchFilter === 'price_high_low'
                        ? 'bg-[#F97316] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <ArrowDown className="w-3.5 h-3.5" />
                    <span>Price High-Low</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchFilter('top_rated')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                      searchFilter === 'top_rated'
                        ? 'bg-[#F97316] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <span>Top Rated</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setSearchFilter('free_delivery')}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                      searchFilter === 'free_delivery'
                        ? 'bg-[#F97316] text-white shadow-xs'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Truck className="w-3.5 h-3.5" />
                    <span>Free Delivery</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setIsPriceFilterOpen(!isPriceFilterOpen)}
                    className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1 whitespace-nowrap transition-all cursor-pointer ${
                      isPriceFilterOpen || minPrice !== '' || maxPrice !== ''
                        ? 'bg-orange-100 text-[#F97316] border border-orange-300'
                        : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                    }`}
                  >
                    <Tag className="w-3.5 h-3.5" />
                    <span>مەودای نرخ {minPrice || maxPrice ? `(${minPrice || '0'} - ${maxPrice || '∞'})` : ''}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isPriceFilterOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Expandable Price Range Slider and Min/Max Input Controls */}
                {(isPriceFilterOpen || minPrice !== '' || maxPrice !== '') && (
                  <div className="mb-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-[#F97316]" />
                        فیلتەرکردن بەپێی نرخ (د.ع)
                      </span>
                      {(minPrice !== '' || maxPrice !== '') && (
                        <button
                          type="button"
                          onClick={() => {
                            setMinPrice('');
                            setMaxPrice('');
                            setPriceSliderValue(200000);
                          }}
                          className="text-[11px] text-orange-600 hover:text-orange-700 font-bold flex items-center gap-1 cursor-pointer"
                        >
                          <RotateCcw className="w-3 h-3" />
                          پاککردنەوە
                        </button>
                      )}
                    </div>

                    {/* Quick Preset Buttons */}
                    <div className="flex items-center gap-1.5 mb-2.5 overflow-x-auto scrollbar-none">
                      <button
                        type="button"
                        onClick={() => {
                          setMinPrice('0');
                          setMaxPrice('10000');
                          setPriceSliderValue(10000);
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-orange-300 text-[11px] text-slate-600 font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                      >
                        کەمتر لە ۱۰,۰۰۰ د.ع
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMinPrice('10000');
                          setMaxPrice('50000');
                          setPriceSliderValue(50000);
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-orange-300 text-[11px] text-slate-600 font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                      >
                        ۱۰,۰۰۰ - ۵۰,۰۰۰ د.ع
                      </button>
                      <button
                        type="button"
                        onClick={() => {
                          setMinPrice('50000');
                          setMaxPrice('');
                          setPriceSliderValue(200000);
                        }}
                        className="px-2.5 py-1 bg-white border border-slate-200 hover:border-orange-300 text-[11px] text-slate-600 font-bold rounded-lg whitespace-nowrap transition-colors cursor-pointer"
                      >
                        سەرتر لە ۵۰,۰۰۰ د.ع
                      </button>
                    </div>

                    {/* Interactive Price Range Slider */}
                    <div className="mb-3 px-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>سەقفی نرخ: {priceSliderValue.toLocaleString()} د.ع</span>
                        <span>۲۵۰,۰۰۰+ د.ع</span>
                      </div>
                      <input
                        type="range"
                        min="2000"
                        max="250000"
                        step="2000"
                        value={priceSliderValue}
                        onChange={(e) => {
                          const val = Number(e.target.value);
                          setPriceSliderValue(val);
                          setMaxPrice(val.toString());
                        }}
                        className="w-full accent-[#F97316] cursor-pointer h-1.5 bg-slate-200 rounded-lg appearance-none"
                      />
                    </div>

                    {/* Min & Max Inputs */}
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">کەمترین نرخ (د.ع)</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-latin text-slate-800 focus:outline-none focus:border-[#F97316]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">زۆرترین نرخ (د.ع)</label>
                        <input
                          type="number"
                          placeholder="250000"
                          value={maxPrice}
                          onChange={(e) => {
                            setMaxPrice(e.target.value);
                            if (e.target.value) {
                              setPriceSliderValue(Number(e.target.value));
                            }
                          }}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-latin text-slate-800 focus:outline-none focus:border-[#F97316]"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {searchResults.categories && searchResults.categories.length > 0 && (
                  <div className="mb-3">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5 px-2">بەشەکان</span>
                    <div className="flex flex-wrap gap-1.5 px-1">
                      {searchResults.categories.map(cat => (
                        <button
                          key={cat.id}
                          onClick={() => {
                            if (cat.id === 'cars') {
                              onNavigate('car-marketplace');
                            } else {
                              onNavigate('category', cat.id);
                            }
                            setIsSearchFocused(false);
                          }}
                          className="px-3 py-1.5 bg-orange-50 hover:bg-orange-100 text-[#F97316] text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
                        >
                          <span>{cat.name}</span>
                          <span className="text-[10px] text-orange-400">←</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.products && searchResults.products.length > 0 && (
                  <div className="mb-3 border-t border-slate-100 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5 px-2">کاڵاکان و خواردن</span>
                    {searchResults.products.map(p => (
                      <button
                        key={p.id}
                        onClick={() => {
                          onNavigate('product-detail', p.id);
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-right cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={p.images[0]} alt={p.title} className="w-9 h-9 rounded-lg object-cover" />
                          <div>
                            <p className="text-xs font-bold text-slate-800 line-clamp-1">{p.title}</p>
                            <p className="text-[10px] text-slate-400">{p.sellerName}</p>
                          </div>
                        </div>
                        <span className="text-xs font-black text-[#F97316] font-latin whitespace-nowrap">
                          {(p.discountPrice || p.price).toLocaleString()} د.ع
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.sellers && searchResults.sellers.length > 0 && (
                  <div className="mb-3 border-t border-slate-100 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5 px-2">فرۆشگاکان و چێشتخانەکان</span>
                    {searchResults.sellers.map(s => (
                      <button
                        key={s.id}
                        onClick={() => {
                          onNavigate('seller-store', s.id);
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center gap-2.5 p-2 rounded-xl hover:bg-slate-50 text-right cursor-pointer"
                      >
                        <img src={s.logoUrl} alt={s.storeName} className="w-8 h-8 rounded-full object-cover" />
                        <div>
                          <p className="text-xs font-bold text-slate-800">{s.storeName}</p>
                          <p className="text-[10px] text-slate-500">{s.city}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.cars && searchResults.cars.length > 0 && (
                  <div className="border-t border-slate-100 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5 px-2">ئۆتۆمبێلەکان</span>
                    {searchResults.cars.map(c => (
                      <button
                        key={c.id}
                        onClick={() => {
                          onNavigate('car-detail', c.id);
                          setIsSearchFocused(false);
                        }}
                        className="w-full flex items-center justify-between p-2 rounded-xl hover:bg-slate-50 text-right cursor-pointer"
                      >
                        <div className="flex items-center gap-2.5">
                          <img src={c.images[0]} alt={c.title} className="w-10 h-7 rounded-md object-cover" />
                          <p className="text-xs font-bold text-slate-800 line-clamp-1">{c.title}</p>
                        </div>
                        <span className="text-xs font-bold text-[#2563EB] font-latin whitespace-nowrap">
                          {c.priceIqd.toLocaleString()} د.ع
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Action Icons & Navigation Buttons */}
          <div className="flex items-center gap-2 sm:gap-3">

            {/* Post Car Ad Button */}
            <button
              onClick={() => onNavigate('post-car-ad')}
              className="hidden lg:inline-flex items-center gap-1.5 px-4 py-2 rounded-full bg-[#F97316] hover:bg-orange-600 text-white text-xs font-bold shadow-sm hover:shadow transition-all active:scale-95 cursor-pointer"
            >
              <PlusCircle className="w-4 h-4" />
              <span>{t('car.post_ad')}</span>
            </button>

            {/* Dark Mode Toggle Button */}
            <button
              onClick={toggleTheme}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-amber-400 transition-all cursor-pointer shadow-xs active:scale-90"
              title={isDarkMode ? 'گۆڕین بۆ دۆخی ڕووناک (Light Mode)' : 'گۆڕین بۆ دۆخی تاریک (Dark Mode)'}
              aria-label="Toggle dark mode"
            >
              {isDarkMode ? (
                <Sun className="w-4 h-4 text-amber-400 animate-spin-slow" />
              ) : (
                <Moon className="w-4 h-4 text-slate-700" />
              )}
            </button>

            {/* Language Switcher */}
            <div className="relative hidden sm:block">
              <div className="flex items-center bg-slate-100 p-0.5 rounded-full text-xs font-bold">
                <button
                  onClick={() => setLanguage('ku')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    language === 'ku' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="کوردی سۆرانی (RTL)"
                >
                  کوردی
                </button>
                <button
                  onClick={() => setLanguage('ar')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    language === 'ar' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="العربية (RTL)"
                >
                  عربي
                </button>
                <button
                  onClick={() => setLanguage('en')}
                  className={`px-2.5 py-1 rounded-full transition-all cursor-pointer ${
                    language === 'en' ? 'bg-[#2563EB] text-white shadow-xs' : 'text-slate-600 hover:text-slate-900'
                  }`}
                  title="English (LTR)"
                >
                  EN
                </button>
              </div>
            </div>

            {/* Notifications Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 rounded-full transition-colors cursor-pointer ${
                  isNotifOpen ? 'bg-blue-100 text-[#2563EB]' : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#F97316] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white animate-pulse">
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotifOpen && (
                <>
                  {/* Backdrop for mobile */}
                  <div
                    className="fixed inset-0 bg-black/20 backdrop-blur-[1px] z-40 sm:hidden"
                    onClick={() => setIsNotifOpen(false)}
                  />
                  <div className="fixed sm:absolute top-[74px] sm:top-full mt-2 inset-x-3 sm:inset-x-auto left-3 right-3 sm:left-0 sm:right-auto max-w-sm sm:w-92 mx-auto sm:mx-0 bg-white rounded-3xl sm:rounded-2xl shadow-2xl sm:shadow-xl border border-slate-200 sm:border-slate-100 p-3.5 sm:p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900">ئاگادارییەکان</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-orange-100 text-[#F97316] px-2 py-0.5 rounded-full font-latin">
                            {unreadCount} نوێ
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-[#2563EB] hover:underline font-bold cursor-pointer"
                        >
                          هەمووی وەک خوێندراوە
                        </button>
                      )}
                    </div>

                    <div className="max-h-[60vh] sm:max-h-72 overflow-y-auto space-y-2 pr-0.5">
                      {notifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">هیچ ئاگادارییەک نییە</p>
                      ) : (
                        notifications.slice(0, 8).map(n => (
                          <div
                            key={n.id}
                            onClick={() => {
                              markAsRead(n.id);
                              setIsNotifOpen(false);
                              if (n.linkUrl) {
                                onNavigate(n.linkUrl.replace('/', ''), n.metadata?.orderId || n.metadata?.carAdId);
                              } else {
                                onNavigate('notifications');
                              }
                            }}
                            className={`p-3 rounded-2xl transition-all cursor-pointer text-start ${
                              n.isRead ? 'bg-slate-50/80 hover:bg-slate-100' : 'bg-blue-50/70 border border-blue-100/80 hover:bg-blue-100/70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-xs font-bold text-slate-900 line-clamp-1">{n.title}</span>
                              <span className="text-[10px] text-slate-400 font-latin whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Open Full Notification Center link */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100">
                      <button
                        onClick={() => {
                          setIsNotifOpen(false);
                          onNavigate('notifications');
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-100 hover:bg-blue-50 text-[#2563EB] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>بینینی هەموو ئاگادارییەکان لە ناوەندی ئاگاداری</span>
                        <ArrowLeft className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Cart Drawer Trigger */}
            <button
              onClick={() => setCartOpen(true)}
              className="relative p-2.5 rounded-full bg-slate-100 hover:bg-slate-200 text-slate-700 hover:text-slate-900 transition-colors cursor-pointer"
              aria-label="Cart"
            >
              <ShoppingCart className="w-4 h-4" />
              {totalItems > 0 && (
                <span className="absolute -top-1 -right-1 bg-[#2563EB] text-white text-[10px] w-4 h-4 rounded-full flex items-center justify-center font-bold">
                  {totalItems}
                </span>
              )}
            </button>

            {/* User Profile / Dashboard Menu - Hidden on mobile since mobile has bottom nav & drawer */}
            <div ref={userRef} className="relative hidden md:block">
              {currentUser ? (
                <button
                  onClick={() => setIsUserOpen(!isUserOpen)}
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-slate-100 hover:bg-slate-200 transition-colors cursor-pointer"
                >
                  {currentUser?.avatarUrl ? (
                    <img
                      src={currentUser.avatarUrl}
                      alt={currentUser.fullName}
                      className="w-7 h-7 rounded-full object-cover"
                    />
                  ) : (
                    <div className="w-7 h-7 rounded-full bg-[#F97316] text-white flex items-center justify-center font-bold text-xs">
                      {currentUser?.fullName?.charAt(0) || <User className="w-4 h-4" />}
                    </div>
                  )}
                  <span className="text-xs font-bold text-slate-800 hidden md:block max-w-[90px] truncate">
                    {currentUser.fullName}
                  </span>
                  <ChevronDown className="w-3.5 h-3.5 text-slate-400 hidden md:block" />
                </button>
              ) : (
                <button
                  onClick={() => onNavigate('auth', 'login')}
                  className="bg-[#F97316] text-white px-5 py-2 rounded-full text-xs sm:text-sm font-bold shadow-sm hover:bg-orange-600 transition-colors cursor-pointer"
                >
                  {t('login')}
                </button>
              )}

              {isUserOpen && (
                <div className="absolute top-full mt-2 w-64 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 left-0">
                  {currentUser && (
                    <>
                      <div className="px-4 py-3 border-b border-slate-100 text-right">
                        <p className="text-xs font-bold text-slate-900">{currentUser.fullName}</p>
                        <p className="text-[11px] text-slate-500 truncate">{currentUser.email}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 text-[#2563EB]">
                            {t(`role.${currentUser.role}`)}
                          </span>
                          {isSuperAdmin && (
                            <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-red-600 text-white">
                              Super Admin
                            </span>
                          )}
                        </div>
                      </div>

                      {/* Role Specific Actions */}
                      <div className="py-1">
                        {isSuperAdmin && (
                          <button
                            onClick={() => { onNavigate('admin-dashboard'); setIsUserOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-700 hover:bg-red-50 text-right cursor-pointer"
                          >
                            <ShieldCheck className="w-4 h-4 text-red-600" />
                            داشبۆردی سەرپەرشتیار (Admin)
                          </button>
                        )}

                        {isSeller && (
                          <button
                            onClick={() => { onNavigate('seller-dashboard'); setIsUserOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-orange-600 hover:bg-orange-50 text-right cursor-pointer"
                          >
                            <Store className="w-4 h-4 text-orange-500" />
                            داشبۆردی فرۆشیار و قازانج
                          </button>
                        )}

                        {isDeliveryAgent && (
                          <button
                            onClick={() => { onNavigate('delivery-dashboard'); setIsUserOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-teal-700 hover:bg-teal-50 text-right cursor-pointer"
                          >
                            <Truck className="w-4 h-4 text-teal-600" />
                            داشبۆردی شۆفێری گەیاندن
                          </button>
                        )}

                        <button
                          onClick={() => { onNavigate('customer-orders'); setIsUserOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-right cursor-pointer"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          داواکارییەکانم
                        </button>

                        <button
                          onClick={() => { onNavigate('favorites'); setIsUserOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-right cursor-pointer"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          دڵخوازەکانم
                        </button>

                        <button
                          onClick={() => { onNavigate('user-profile'); setIsUserOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 hover:bg-slate-50 text-right cursor-pointer"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          پڕۆفایل و ناونیشانەکان
                        </button>

                        {/* Fast Demo Role Switcher */}
                        <div className="border-t border-slate-100 my-1 pt-1">
                          <button
                            onClick={() => { setIsRoleModalOpen(true); setIsUserOpen(false); }}
                            className="w-full flex items-center justify-between px-4 py-2 text-xs text-[#2563EB] font-bold hover:bg-blue-50 text-right cursor-pointer"
                          >
                            <span className="flex items-center gap-2">
                              <Sparkles className="w-4 h-4 text-amber-500" />
                              گۆڕینی ڕۆڵ (Demo Persona)
                            </span>
                            <span className="text-[10px] bg-blue-100 text-[#2563EB] px-1.5 py-0.5 rounded">تاقیبکەرەوە</span>
                          </button>
                        </div>

                        <div className="border-t border-slate-100 my-1 pt-1">
                          <button
                            onClick={() => { logout(); setIsUserOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 text-right cursor-pointer"
                          >
                            <LogOut className="w-4 h-4" />
                            {t('logout')}
                          </button>
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>

            {/* Mobile Menu Trigger (Hamburger) */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 md:hidden cursor-pointer shadow-xs transition-all active:scale-90"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4 text-[#FF5500]" /> : <Menu className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Mobile Search Bar in Header */}
        <div className="sm:hidden pb-3">
          <div className="relative flex items-center">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder={t('search.placeholder')}
              className="w-full bg-slate-100 border border-slate-200 rounded-xl py-2 pr-9 pl-4 text-xs text-slate-800 focus:outline-hidden"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-3 pointer-events-none" />
          </div>
        </div>
      </div>

      {/* Slide-Over Side Navigation Drawer (لا سلاید) with React Portal */}
      {typeof document !== 'undefined' && createPortal(
        <div
          className={`fixed inset-0 z-[999999] isolate transition-all duration-300 ${
            isMobileMenuOpen ? 'visible opacity-100 pointer-events-auto' : 'invisible opacity-0 pointer-events-none'
          }`}
          role="dialog"
          aria-modal="true"
          aria-label="Main Navigation Menu"
        >
          {/* Backdrop Blur Overlay */}
          <div
            className={`fixed inset-0 bg-slate-950/70 backdrop-blur-sm transition-opacity duration-300 ease-out ${
              isMobileMenuOpen ? 'opacity-100' : 'opacity-0'
            }`}
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Slide-over Side Panel (RTL: Slides smoothly from the Right Side) */}
          <aside
            className={`fixed inset-y-0 right-0 w-[88vw] max-w-sm sm:max-w-md h-[100dvh] bg-white dark:bg-[#0f172a] shadow-2xl flex flex-col z-[1000000] border-l border-slate-200 dark:border-slate-800 transform transition-transform duration-300 ease-out ${
              isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
            }`}
          >
            {/* Drawer Top Header */}
            <div className="p-4 sm:p-5 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/95 dark:bg-[#131d31]/95 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <Logo size="sm" showTagline={false} />
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 pr-2.5">
                  مێنیوی سەرەکی
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-9 h-9 rounded-full bg-slate-200/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-orange-100 dark:hover:bg-slate-700 hover:text-[#FF5500] flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-xs"
                aria-label="Close menu"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 sm:p-5 space-y-5 text-right scrollbar-none pb-28">

              {/* 1. User Identity / Authentication Card */}
              {currentUser ? (
                <div className="bg-gradient-to-br from-slate-50 to-orange-50/40 dark:from-slate-800/90 dark:to-slate-850 border border-slate-200 dark:border-slate-700 rounded-2xl p-4 shadow-xs space-y-3">
                  <div className="flex items-center gap-3">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.fullName}
                        className="w-12 h-12 rounded-2xl object-cover ring-2 ring-[#FF5500]/30 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5500] to-amber-500 text-white flex items-center justify-center font-black text-lg shadow-md shadow-orange-500/20 shrink-0">
                        {currentUser.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-sm font-black text-slate-900 dark:text-white truncate">
                          {currentUser.fullName}
                        </p>
                        {currentUser.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 font-latin truncate">
                        {currentUser.email}
                      </p>
                      <div className="flex items-center gap-1.5 mt-1 flex-wrap">
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-blue-100 text-[#2563EB] dark:bg-blue-900/50 dark:text-blue-300">
                          {t(`role.${currentUser.role}`)}
                        </span>
                        {isSuperAdmin && (
                          <span className="text-[10px] font-black px-2 py-0.5 rounded-full bg-red-600 text-white shadow-xs">
                            Super Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Fast Profile Action Links */}
                  <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-200/60 dark:border-slate-700/60">
                    <button
                      onClick={() => { onNavigate('user-profile'); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-100 dark:border-slate-800 hover:border-orange-200 transition-all cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-[#FF5500] shrink-0" />
                      <span className="truncate">پڕۆفایلەکەم</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('customer-orders'); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-100 dark:border-slate-800 hover:border-blue-200 transition-all cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-[#2563EB] shrink-0" />
                      <span className="truncate">داواکارییەکانم</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('favorites'); setIsMobileMenuOpen(false); }}
                      className="flex items-center gap-2 p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-100 dark:border-slate-800 hover:border-rose-200 transition-all cursor-pointer"
                    >
                      <Heart className="w-3.5 h-3.5 text-rose-500 shrink-0" />
                      <span className="truncate">دڵخوازەکان</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('notifications'); setIsMobileMenuOpen(false); }}
                      className="flex items-center justify-between p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 text-xs font-bold border border-slate-100 dark:border-slate-800 hover:border-amber-200 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2 truncate">
                        <Bell className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                        <span className="truncate">ئاگادارییەکان</span>
                      </div>
                      {unreadCount > 0 && (
                        <span className="text-[9px] font-bold bg-[#FF5500] text-white px-1.5 py-0.5 rounded-full font-latin shrink-0">
                          {unreadCount}
                        </span>
                      )}
                    </button>
                  </div>

                  {/* Role Specific Direct Dashboards */}
                  {isSuperAdmin && (
                    <button
                      onClick={() => { onNavigate('admin-dashboard'); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-red-600 text-white text-xs font-black shadow-sm hover:bg-red-700 transition-all cursor-pointer active:scale-98"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>داشبۆردی سەرپەرشتیاری گشتی (Super Admin)</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                    </button>
                  )}

                  {isSeller && (
                    <button
                      onClick={() => { onNavigate('seller-dashboard'); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-orange-600 text-white text-xs font-black shadow-sm hover:bg-orange-700 transition-all cursor-pointer active:scale-98"
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 shrink-0" />
                        <span>داشبۆردی فرۆشیار و بەڕێوەبردن</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                    </button>
                  )}

                  {isDeliveryAgent && (
                    <button
                      onClick={() => { onNavigate('delivery-dashboard'); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2.5 rounded-xl bg-teal-600 text-white text-xs font-black shadow-sm hover:bg-teal-700 transition-all cursor-pointer active:scale-98"
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 shrink-0" />
                        <span>داشبۆردی شۆفێری گەیاندن</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-br from-orange-500 via-[#FF5500] to-amber-600 rounded-2xl p-4 text-white shadow-lg shadow-orange-500/20 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-11 h-11 rounded-xl bg-white/20 backdrop-blur-sm flex items-center justify-center font-bold shrink-0">
                      <User className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-black">بەخێربێیت بۆ بازاڕی شاخی</p>
                      <p className="text-[11px] text-orange-100 mt-0.5">خواردن، مارکێت، جلوبەرگ و ئۆتۆمبێل</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onNavigate('auth', 'login'); setIsMobileMenuOpen(false); }}
                    className="w-full py-2.5 rounded-xl bg-white text-slate-900 text-xs font-black shadow-sm hover:bg-orange-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <User className="w-4 h-4 text-[#FF5500]" />
                    <span>چوونە ژوورەوە / دروستکردنی هەژمار</span>
                  </button>
                </div>
              )}

              {/* 2. Primary Highlight: Post Car Ad Action */}
              <button
                onClick={() => { onNavigate('post-car-ad'); setIsMobileMenuOpen(false); }}
                className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#FF5500] to-amber-500 text-white font-black text-xs sm:text-sm shadow-md shadow-orange-500/25 hover:opacity-95 transition-all cursor-pointer active:scale-98"
              >
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                    <PlusCircle className="w-5 h-5 stroke-[2.5]" />
                  </div>
                  <div className="text-right">
                    <p className="leading-tight">{t('car.post_ad')}</p>
                    <p className="text-[10px] font-medium text-orange-100">ڕیکلامی ئۆتۆمبێلەکەت بڵاوبکەرەوە</p>
                  </div>
                </div>
                <ChevronLeft className="w-4 h-4 opacity-80 shrink-0" />
              </button>

              {/* 3. Location / City Selector */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3.5 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-700 dark:text-slate-300">
                    <MapPin className="w-4 h-4 text-[#2563EB]" />
                    <span>هەڵبژاردنی شار:</span>
                  </div>
                  <span className="text-[11px] font-bold text-[#FF5500] font-latin">
                    {selectedCity || 'هەموو شارەکان'}
                  </span>
                </div>
                <select
                  value={selectedCity}
                  onChange={(e) => onSelectCity(e.target.value)}
                  className="w-full text-xs bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 text-slate-800 dark:text-slate-200 font-bold focus:outline-hidden focus:ring-2 focus:ring-[#FF5500]"
                >
                  <option value="">هەموو شارەکانی کوردستان و عێراق</option>
                  {CITIES.map(c => (
                    <option key={c} value={c}>{c}</option>
                  ))}
                </select>
              </div>

              {/* 4. All Marketplace Categories (بەشەکانی بازاڕی شاخی) */}
              <div className="space-y-2.5">
                <div className="flex items-center justify-between pb-1">
                  <div className="flex items-center gap-1.5">
                    <Layers className="w-4 h-4 text-[#FF5500]" />
                    <h4 className="text-xs font-black text-slate-900 dark:text-white">بەشە سەرەکییەکانی بازاڕ</h4>
                  </div>
                  <button
                    onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
                    className="text-[11px] text-[#2563EB] font-bold hover:underline cursor-pointer"
                  >
                    پەڕەی سەرەکی
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {[
                    { id: 'food', name: 'چێشتخانە و خواردن', icon: Utensils, color: 'text-amber-600 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-900/50' },
                    { id: 'market', name: 'سوپەرمارکێت', icon: ShoppingBag, color: 'text-blue-600 bg-blue-50 dark:bg-blue-950/40 border-blue-200 dark:border-blue-900/50' },
                    { id: 'clothes', name: 'جلوبەرگ و مۆدە', icon: Shirt, color: 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-900/50' },
                    { id: 'fruits_vegetables', name: 'سەوزە و میوە', icon: Apple, color: 'text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-900/50' },
                    { id: 'fresh_meat', name: 'گۆشتی تازەی کوردی', icon: Beef, color: 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-900/50' },
                    { id: 'dairy', name: 'شیرەمەنی و ماست', icon: Milk, color: 'text-cyan-600 bg-cyan-50 dark:bg-cyan-950/40 border-cyan-200 dark:border-cyan-900/50' },
                    { id: 'electronics', name: 'ئەلیکترۆنیات', icon: Smartphone, color: 'text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 border-indigo-200 dark:border-indigo-900/50' },
                    { id: 'beauty', name: 'جوانی و مکیاژ', icon: Sparkles, color: 'text-pink-600 bg-pink-50 dark:bg-pink-950/40 border-pink-200 dark:border-pink-900/50' },
                  ].map(cat => {
                    const IconComp = cat.icon;
                    return (
                      <button
                        key={cat.id}
                        onClick={() => {
                          onNavigate('category', cat.id);
                          setIsMobileMenuOpen(false);
                        }}
                        className={`p-2.5 rounded-xl border text-right transition-all hover:scale-[1.02] active:scale-95 flex items-center gap-2 cursor-pointer ${cat.color}`}
                      >
                        <IconComp className="w-4 h-4 shrink-0" />
                        <span className="text-[11px] font-bold text-slate-800 dark:text-slate-200 truncate">{cat.name}</span>
                      </button>
                    );
                  })}

                  {/* Cars Full Card */}
                  <button
                    onClick={() => {
                      onNavigate('car-marketplace');
                      setIsMobileMenuOpen(false);
                    }}
                    className="col-span-2 p-3 rounded-xl border border-blue-200 dark:border-blue-800 bg-gradient-to-r from-blue-50 to-indigo-50/60 dark:from-blue-950/40 dark:to-slate-900 text-blue-900 dark:text-blue-100 flex items-center justify-between transition-all hover:scale-[1.01] active:scale-95 cursor-pointer"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="w-8 h-8 rounded-lg bg-[#2563EB] text-white flex items-center justify-center shrink-0">
                        <Car className="w-4 h-4" />
                      </div>
                      <div className="text-right">
                        <p className="text-xs font-black text-slate-900 dark:text-white">بازاڕی کڕین و فرۆشتنی ئۆتۆمبێل</p>
                        <p className="text-[10px] text-slate-500 dark:text-slate-400">پاکێجی VIP، سیستەمی کات و هەڵبژێردراو</p>
                      </div>
                    </div>
                    <ChevronLeft className="w-4 h-4 text-[#2563EB] shrink-0" />
                  </button>
                </div>
              </div>

              {/* 5. Demo Persona / Fast Role Switcher */}
              <div className="bg-slate-50 dark:bg-slate-800/40 p-3 rounded-2xl border border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => {
                    setIsRoleModalOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full flex items-center justify-between text-xs font-bold text-[#2563EB] dark:text-blue-400 cursor-pointer"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-4 h-4 text-amber-500 shrink-0" />
                    <span>گۆڕینی ڕۆڵ (Demo Persona Switcher)</span>
                  </span>
                  <span className="text-[10px] bg-blue-100 dark:bg-blue-900/50 text-[#2563EB] dark:text-blue-300 px-2 py-0.5 rounded-full font-latin">
                    تاقیبکەرەوە
                  </span>
                </button>
              </div>

              {/* 6. Preferences: Language & Theme */}
              <div className="space-y-3 pt-2 border-t border-slate-100 dark:border-slate-800">
                {/* Language Switcher */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    <Globe className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span>زمانی سیستەم:</span>
                  </div>
                  <div className="flex gap-1 bg-slate-100 dark:bg-slate-800 p-1 rounded-xl">
                    {(['ku', 'ar', 'en'] as const).map(l => (
                      <button
                        key={l}
                        onClick={() => setLanguage(l)}
                        className={`px-3 py-1 text-xs rounded-lg font-bold transition-all cursor-pointer ${
                          language === l
                            ? 'bg-[#2563EB] text-white shadow-xs'
                            : 'text-slate-600 dark:text-slate-400 hover:text-slate-900'
                        }`}
                      >
                        {l === 'ku' ? 'کوردی' : l === 'ar' ? 'عربي' : 'EN'}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Dark Mode Toggle */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5 text-xs font-bold text-slate-600 dark:text-slate-400">
                    {isDarkMode ? <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" /> : <Moon className="w-3.5 h-3.5 text-slate-400 shrink-0" />}
                    <span>دۆخی ڕووناک / تاریک:</span>
                  </div>
                  <button
                    onClick={toggleTheme}
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-slate-100 dark:bg-slate-800 text-xs font-bold text-slate-700 dark:text-slate-200 hover:bg-slate-200 dark:hover:bg-slate-700 transition-all cursor-pointer"
                  >
                    {isDarkMode ? (
                      <>
                        <Sun className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>دۆخی ڕووناک</span>
                      </>
                    ) : (
                      <>
                        <Moon className="w-3.5 h-3.5 text-slate-600 shrink-0" />
                        <span>دۆخی تاریک</span>
                      </>
                    )}
                  </button>
                </div>
              </div>

            </div>

            {/* Drawer Bottom Footer */}
            <div className="p-4 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/95 dark:bg-[#131d31]/95 shrink-0 space-y-2">
              {currentUser && (
                <button
                  onClick={() => {
                    logout();
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full py-2.5 rounded-xl bg-red-50 dark:bg-red-950/40 text-red-600 dark:text-red-400 text-xs font-bold border border-red-100 dark:border-red-900/50 hover:bg-red-100 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                >
                  <LogOut className="w-4 h-4" />
                  <span>{t('logout')}</span>
                </button>
              )}
              <p className="text-[10px] text-slate-400 dark:text-slate-500 text-center font-latin">
                SHAKH Multi-Marketplace Platform • وەشانی ٢.٥
              </p>
            </div>

          </aside>
        </div>,
        document.body
      )}

      {/* Role Switcher Modal (Demo Switcher) */}
      {isRoleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="relative w-full max-w-lg bg-white rounded-2xl shadow-2xl p-6 border border-slate-100 text-right">
            <div className="flex items-center justify-between pb-3 border-b border-slate-100">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-orange-500" />
                هەڵبژاردنی کەسایەتی بەکارهێنەر (Role Switcher)
              </h3>
              <button
                onClick={() => setIsRoleModalOpen(false)}
                className="p-1 text-slate-400 hover:text-slate-600 rounded-full"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <p className="text-xs text-slate-500 my-3">
              بۆ تاقیکردنەوەی خێرای تەواوی بەشەکان، داشبۆردی سووپەر ئەدمین، فرۆشیارانی جیاواز، شۆفێر و کڕیار، یەکێک لەم ڕۆڵانە دیاریبکە:
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 max-h-96 overflow-y-auto pr-1">
              {[
                { role: 'admin' as UserRole, name: 'سووپەر ئەدمین (Super Admin)', email: 'shakh8002@gmail.com', color: 'border-red-500 bg-red-50/60 text-red-900' },
                { role: 'restaurant_owner' as UserRole, name: 'هاکار (خاوەن چێشتخانەی دیلان)', email: 'hakar.rest@shakh.com', color: 'border-orange-500 bg-orange-50/60 text-orange-900' },
                { role: 'market_owner' as UserRole, name: 'شاناز (سوپەرمارکێتی کاروان)', email: 'shanaz.market@shakh.com', color: 'border-blue-500 bg-blue-50/60 text-blue-900' },
                { role: 'clothes_seller' as UserRole, name: 'ئالان (ئالان فاشیۆن پریمێم)', email: 'alan.fashion@shakh.com', color: 'border-purple-500 bg-purple-50/60 text-purple-900' },
                { role: 'fruits_vegetables_seller' as UserRole, name: 'کۆسار (میوە و سەوزەی بەهەشت)', email: 'kamaran.fruits@shakh.com', color: 'border-emerald-500 bg-emerald-50/60 text-emerald-900' },
                { role: 'fresh_meat_seller' as UserRole, name: 'سەردار قەساب (گۆشتفرۆشی مێرگەپان)', email: 'garmian.meat@shakh.com', color: 'border-rose-500 bg-rose-50/60 text-rose-900' },
                { role: 'dairy_seller' as UserRole, name: 'دەریا (شیرەمەنی گوڵان)', email: 'darya.dairy@shakh.com', color: 'border-cyan-500 bg-cyan-50/60 text-cyan-900' },
                { role: 'electronics_seller' as UserRole, name: 'دانا (دانا ئەلیکترۆنیکس)', email: 'dana.tech@shakh.com', color: 'border-indigo-500 bg-indigo-50/60 text-indigo-900' },
                { role: 'beauty_seller' as UserRole, name: 'لوما (لوما کۆزمەتیک)', email: 'luma.beauty@shakh.com', color: 'border-pink-500 bg-pink-50/60 text-pink-900' },
                { role: 'delivery_agent' as UserRole, name: 'ڕێباز (کاپتنی گەیاندن)', email: 'rebaz.delivery@shakh.com', color: 'border-teal-500 bg-teal-50/60 text-teal-900' },
                { role: 'customer' as UserRole, name: 'شوان محەممەد (کڕیاری ئاسایی)', email: 'customer@shakh.com', color: 'border-slate-400 bg-slate-50 text-slate-900' }
              ].map(item => (
                <button
                  key={item.role}
                  onClick={() => {
                    switchUserRole(item.role);
                    setIsRoleModalOpen(false);
                  }}
                  className={`p-3 rounded-xl border text-right transition-all hover:scale-[1.02] cursor-pointer ${item.color} ${
                    currentUser?.role === item.role ? 'ring-2 ring-orange-500 font-bold' : ''
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold">{item.name}</span>
                    {currentUser?.role === item.role && (
                      <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.5 rounded font-bold">چالاکە</span>
                    )}
                  </div>
                  <span className="text-[10px] opacity-75 font-latin block mt-0.5">{item.email}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </header>
  );
};
