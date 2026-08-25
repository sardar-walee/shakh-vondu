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
import { LanguageSelector } from '../common/LanguageSelector';
import { LanguageSwitcher } from '../common/LanguageSwitcher';
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
  const { currentUser, isSuperAdmin, isSeller, isDeliveryAgent, logout } = useAuth();
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { userNotifications, unreadCount, actionableCount, markAsRead, markAllAsRead } = useNotification();
  const { language, setLanguage, t } = useLanguage();
  const { products, sellers, carAds, appVersion, openUpdateModal } = useMarketplace();

  const { isDarkMode, toggleTheme } = useTheme();

  const [isCityOpen, setIsCityOpen] = useState(false);
  const [isNotifOpen, setIsNotifOpen] = useState(false);
  const [isUserOpen, setIsUserOpen] = useState(false);
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
                title={t('مێنیوی سەرەکی و بەشەکان')}
              >
                <Menu className="w-4 h-4 text-[#FF5500]" />
                <span>{t('مێنیو')}</span>
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
                <span className="truncate max-w-[120px]">{selectedCity ? t(`city.${selectedCity}`) || selectedCity : t('هەموو شارەکان')}</span>
                <ChevronDown className="w-3.5 h-3.5 text-slate-400" />
              </button>

              {isCityOpen && (
                <div className="absolute top-full mt-2 w-52 bg-white rounded-2xl shadow-xl border border-slate-100 py-2 z-50 right-0">
                  <div className="px-3 py-1 text-[11px] font-bold text-slate-400 border-b border-slate-100">
                    {t('شارەکانی کوردستان و عێراق')}
                  </div>
                  <button
                    onClick={() => { onSelectCity(''); setIsCityOpen(false); }}
                    className="w-full text-right px-3 py-2 text-xs text-slate-700 hover:bg-orange-50 hover:text-orange-600 font-medium cursor-pointer"
                  >
                    {t('هەموو شارەکان')}
                  </button>
                  {CITIES.map(city => (
                    <button
                      key={city}
                      onClick={() => { onSelectCity(city); setIsCityOpen(false); }}
                      className={`w-full text-right px-3 py-2 text-xs hover:bg-orange-50 font-medium cursor-pointer ${
                        selectedCity === city ? 'bg-orange-50 text-orange-600 font-bold' : 'text-slate-700'
                      }`}
                    >
                      {t(`city.${city}`) || city}
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
                    {t('فیلتەر:')}
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
                    <span>{t('هەمووی')}</span>
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
                    <span>{t('نرخ: کەم بۆ زۆر')}</span>
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
                    <span>{t('نرخ: زۆر بۆ کەم')}</span>
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
                    <span>{t('بەرزترین هەڵسەنگاندن')}</span>
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
                    <span>{t('گەیاندنی بێبەرامبەر')}</span>
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
                    <span>{t('مەودای نرخ')} {minPrice || maxPrice ? `(${minPrice || '0'} - ${maxPrice || '∞'})` : ''}</span>
                    <ChevronDown className={`w-3 h-3 transition-transform ${isPriceFilterOpen ? 'rotate-180' : ''}`} />
                  </button>
                </div>

                {/* Expandable Price Range Slider and Min/Max Input Controls */}
                {(isPriceFilterOpen || minPrice !== '' || maxPrice !== '') && (
                  <div className="mb-3 p-3 bg-slate-50/80 rounded-xl border border-slate-200 text-xs">
                    <div className="flex items-center justify-between mb-2">
                      <span className="font-bold text-slate-700 flex items-center gap-1">
                        <Tag className="w-3.5 h-3.5 text-[#F97316]" />
                        {t('فیلتەرکردن بەپێی نرخ (د.ع)')}
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
                          {t('پاککردنەوە')}
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
                        {t('کەمتر لە ۱۰,۰۰۰ د.ع')}
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
                        {t('۱۰,۰۰۰ - ۵۰,۰۰۰ د.ع')}
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
                        {t('سەرتر لە ۵۰,۰۰۰ د.ع')}
                      </button>
                    </div>

                    {/* Interactive Price Range Slider */}
                    <div className="mb-3 px-1">
                      <div className="flex justify-between text-[10px] font-bold text-slate-500 mb-1">
                        <span>{t('سەقفی نرخ:')} {priceSliderValue.toLocaleString()} {t('د.ع')}</span>
                        <span>۲۵۰,۰۰۰+ {t('د.ع')}</span>
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
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">{t('کەمترین نرخ (د.ع)')}</label>
                        <input
                          type="number"
                          placeholder="0"
                          value={minPrice}
                          onChange={(e) => setMinPrice(e.target.value)}
                          className="w-full bg-white border border-slate-200 rounded-lg px-2.5 py-1.5 text-xs font-latin text-slate-800 focus:outline-none focus:border-[#F97316]"
                        />
                      </div>
                      <div>
                        <label className="text-[10px] font-bold text-slate-500 block mb-1">{t('زۆرترین نرخ (د.ع)')}</label>
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
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5 px-2">{t('بەشەکان')}</span>
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
                          <span>{t(`cat.${cat.id}`) || cat.name}</span>
                          <span className="text-[10px] text-orange-400">←</span>
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {searchResults.products && searchResults.products.length > 0 && (
                  <div className="mb-3 border-t border-slate-100 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5 px-2">{t('کاڵاکان و خواردن')}</span>
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
                          {(p.discountPrice || p.price).toLocaleString()} {t('د.ع')}
                        </span>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.sellers && searchResults.sellers.length > 0 && (
                  <div className="mb-3 border-t border-slate-100 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5 px-2">{t('فرۆشگاکان و چێشتخانەکان')}</span>
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
                          <p className="text-[10px] text-slate-500">{t(`city.${s.city}`) || s.city}</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}

                {searchResults.cars && searchResults.cars.length > 0 && (
                  <div className="border-t border-slate-100 pt-2">
                    <span className="text-[11px] font-bold text-slate-400 block mb-1.5 px-2">{t('ئۆتۆمبێلەکان')}</span>
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
                          {c.priceIqd.toLocaleString()} {t('د.ع')}
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

            {/* Notifications Bell */}
            <div ref={notifRef} className="relative">
              <button
                onClick={() => setIsNotifOpen(!isNotifOpen)}
                className={`relative p-2.5 rounded-full transition-colors cursor-pointer ${
                  isNotifOpen ? 'bg-blue-100 text-[#2563EB]' : 'bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200'
                }`}
                aria-label="Notifications"
              >
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 w-4 h-4 bg-[#F97316] text-white text-[9px] font-bold rounded-full flex items-center justify-center ring-2 ring-white dark:ring-slate-900 animate-pulse">
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
                  <div className="fixed sm:absolute top-[74px] sm:top-full mt-2 inset-x-3 sm:inset-x-auto left-3 right-3 sm:left-0 sm:right-auto max-w-sm sm:w-92 mx-auto sm:mx-0 bg-white dark:bg-slate-900 rounded-3xl sm:rounded-2xl shadow-2xl sm:shadow-xl border border-slate-200 sm:border-slate-100 dark:border-slate-800 p-3.5 sm:p-4 z-50 animate-in fade-in slide-in-from-top-2">
                    <div className="flex items-center justify-between pb-2.5 border-b border-slate-100 dark:border-slate-800 mb-2">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-slate-900 dark:text-white">{t('ئاگادارییەکان')}</span>
                        {unreadCount > 0 && (
                          <span className="text-[10px] font-bold bg-orange-100 dark:bg-orange-950/60 text-[#F97316] px-2 py-0.5 rounded-full font-latin">
                            {unreadCount} {t('نوێ')}
                          </span>
                        )}
                      </div>
                      {unreadCount > 0 && (
                        <button
                          onClick={markAllAsRead}
                          className="text-[11px] text-[#2563EB] hover:underline font-bold cursor-pointer"
                        >
                          {t('هەمووی وەک خوێندراوە')}
                        </button>
                      )}
                    </div>

                    <div className="max-h-[60vh] sm:max-h-72 overflow-y-auto space-y-2 pr-0.5">
                      {userNotifications.length === 0 ? (
                        <p className="text-xs text-slate-400 text-center py-6">{t('هیچ ئاگادارییەک نییە')}</p>
                      ) : (
                        userNotifications.slice(0, 8).map(n => (
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
                              n.isRead ? 'bg-slate-50/80 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800' : 'bg-blue-50/70 dark:bg-blue-950/50 border border-blue-100/80 dark:border-blue-900/60 hover:bg-blue-100/70'
                            }`}
                          >
                            <div className="flex items-center justify-between gap-1 mb-1">
                              <span className="text-xs font-bold text-slate-900 dark:text-white line-clamp-1">{n.title}</span>
                              <span className="text-[10px] text-slate-400 font-latin whitespace-nowrap">
                                {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </span>
                            </div>
                            <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed line-clamp-2">{n.message}</p>
                          </div>
                        ))
                      )}
                    </div>

                    {/* Open Full Notification Center link */}
                    <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800">
                      <button
                        onClick={() => {
                          setIsNotifOpen(false);
                          onNavigate('notifications');
                        }}
                        className="w-full py-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-blue-50 dark:hover:bg-blue-950/40 text-[#2563EB] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                      >
                        <span>{t('بینینی هەموو ئاگادارییەکان لە ناوەندی ئاگاداری')}</span>
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
              className="relative p-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 transition-colors cursor-pointer"
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
                  className="flex items-center gap-2 p-1.5 pr-2.5 rounded-full bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors cursor-pointer"
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
                  <span className="text-xs font-bold text-slate-800 dark:text-slate-200 hidden md:block max-w-[90px] truncate">
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
                <div className="absolute top-full mt-2 w-64 bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 py-2 z-50 left-0">
                  {currentUser && (
                    <>
                      <div className="px-4 py-3 border-b border-slate-100 dark:border-slate-800 text-right">
                        <p className="text-xs font-bold text-slate-900 dark:text-white">{currentUser.fullName}</p>
                        <p className="text-[11px] text-slate-500 dark:text-slate-400 truncate">{currentUser.email}</p>
                        <div className="mt-1.5 flex items-center gap-1.5">
                          <span className="inline-block text-[10px] font-bold px-2 py-0.5 rounded bg-blue-50 dark:bg-blue-950/60 text-[#2563EB]">
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
                          <>
                            <button
                              onClick={() => { onNavigate('admin-dashboard'); setIsUserOpen(false); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-red-700 dark:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/40 text-right cursor-pointer"
                            >
                              <ShieldCheck className="w-4 h-4 text-red-600" />
                              {t('داشبۆردی سەرپەرشتیار (Admin)')}
                            </button>
                            <button
                              onClick={() => { onNavigate('post-product'); setIsUserOpen(false); }}
                              className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-black text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-right cursor-pointer"
                            >
                              <PlusCircle className="w-4 h-4 text-orange-500" />
                              <span>+ بڵاوکردنەوە لە گشت بەشەکان</span>
                            </button>
                          </>
                        )}

                        {isSeller && (
                          <button
                            onClick={() => { onNavigate('seller-dashboard'); setIsUserOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-orange-600 dark:text-orange-400 hover:bg-orange-50 dark:hover:bg-orange-950/40 text-right cursor-pointer"
                          >
                            <Store className="w-4 h-4 text-orange-500" />
                            {t('داشبۆردی فرۆشیار و قازانج')}
                          </button>
                        )}

                        {isDeliveryAgent && (
                          <button
                            onClick={() => { onNavigate('delivery-dashboard'); setIsUserOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs font-bold text-teal-700 dark:text-teal-400 hover:bg-teal-50 dark:hover:bg-teal-950/40 text-right cursor-pointer"
                          >
                            <Truck className="w-4 h-4 text-teal-600" />
                            {t('داشبۆردی شۆفێری گەیاندن')}
                          </button>
                        )}

                        <button
                          onClick={() => { onNavigate('customer-orders'); setIsUserOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-right cursor-pointer"
                        >
                          <Package className="w-4 h-4 text-slate-400" />
                          {t('داواکارییەکانم')}
                        </button>

                        <button
                          onClick={() => { onNavigate('favorites'); setIsUserOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-right cursor-pointer"
                        >
                          <Heart className="w-4 h-4 text-slate-400" />
                          {t('دڵخوازەکانم')}
                        </button>

                        <button
                          onClick={() => { onNavigate('user-profile'); setIsUserOpen(false); }}
                          className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-slate-700 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-800 text-right cursor-pointer"
                        >
                          <User className="w-4 h-4 text-slate-400" />
                          {t('پڕۆفایل و ناونیشانەکان')}
                        </button>

                        <div className="border-t border-slate-100 dark:border-slate-800 my-1 pt-1">
                          <button
                            onClick={() => { logout(); setIsUserOpen(false); }}
                            className="w-full flex items-center gap-2.5 px-4 py-2 text-xs text-red-600 hover:bg-red-50 dark:hover:bg-red-950/40 text-right cursor-pointer"
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
            <div className="p-4 border-b border-slate-100 dark:border-slate-800/80 flex items-center justify-between bg-slate-50/95 dark:bg-[#131d31]/95 backdrop-blur-md shrink-0">
              <div className="flex items-center gap-3">
                <Logo size="sm" showTagline={false} />
                <span className="text-xs font-black text-slate-500 dark:text-slate-400 border-r border-slate-200 dark:border-slate-700 pr-2.5">
                  {t('مێنیوی سەرەکی')}
                </span>
              </div>
              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-slate-200/90 dark:bg-slate-800 text-slate-700 dark:text-slate-200 hover:bg-orange-100 dark:hover:bg-slate-700 hover:text-[#FF5500] flex items-center justify-center transition-all cursor-pointer active:scale-90 shadow-xs"
                aria-label="Close menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Drawer Scrollable Content */}
            <div className="flex-1 overflow-y-auto overscroll-contain p-4 space-y-4 text-right scrollbar-none pb-24">

              {/* 1. Quick Publishing & Posting Actions (Sleek Compact Bar) */}
              <div className="space-y-2">
                {(isSuperAdmin || isSeller) ? (
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      onClick={() => {
                        onNavigate('post-product');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer active:scale-95"
                    >
                      <PlusCircle className="w-4 h-4 shrink-0" />
                      <span className="truncate">{isSuperAdmin ? '+ بڵاوکردنەوەی کاڵا' : '+ زیادکردنی کاڵا'}</span>
                    </button>
                    <button
                      onClick={() => {
                        onNavigate('post-car-ad');
                        setIsMobileMenuOpen(false);
                      }}
                      className="flex items-center justify-center gap-1.5 p-2.5 rounded-xl bg-gradient-to-r from-[#FF5500] to-amber-500 text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer active:scale-95"
                    >
                      <Car className="w-4 h-4 shrink-0" />
                      <span className="truncate">{t('car.post_ad')}</span>
                    </button>
                  </div>
                ) : (
                  <button
                    onClick={() => {
                      onNavigate('post-car-ad');
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full flex items-center justify-between p-3 rounded-xl bg-gradient-to-r from-[#FF5500] to-amber-500 text-white font-bold text-xs shadow-sm hover:opacity-95 transition-all cursor-pointer active:scale-98"
                  >
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg bg-white/20 flex items-center justify-center shrink-0">
                        <Car className="w-4 h-4" />
                      </div>
                      <span className="leading-tight font-black">{t('car.post_ad')}</span>
                    </div>
                    <ChevronLeft className="w-4 h-4 opacity-80 shrink-0" />
                  </button>
                )}
              </div>

              {/* 2. User Account Card */}
              {currentUser ? (
                <div className="bg-slate-50 dark:bg-slate-800/80 border border-slate-200/80 dark:border-slate-700/80 rounded-2xl p-3.5 space-y-3 shadow-xs">
                  <div className="flex items-center gap-3">
                    {currentUser.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.fullName}
                        className="w-11 h-11 rounded-xl object-cover ring-2 ring-[#FF5500]/30 shadow-xs shrink-0"
                      />
                    ) : (
                      <div className="w-11 h-11 rounded-xl bg-gradient-to-tr from-[#FF5500] to-amber-500 text-white flex items-center justify-center font-black text-base shadow-sm shrink-0">
                        {currentUser.fullName?.charAt(0) || 'U'}
                      </div>
                    )}
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <p className="text-xs sm:text-sm font-black text-slate-900 dark:text-white truncate">
                          {currentUser.fullName}
                        </p>
                        {currentUser.isVerified && (
                          <CheckCircle2 className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                        )}
                      </div>
                      <p className="text-[10px] sm:text-[11px] text-slate-500 dark:text-slate-400 font-latin truncate">
                        {currentUser.email}
                      </p>
                      <div className="flex items-center gap-1 mt-1 flex-wrap">
                        <span className="text-[9px] font-bold px-2 py-0.5 rounded-md bg-blue-100 dark:bg-blue-900/50 text-[#2563EB] dark:text-blue-300">
                          {t(`role.${currentUser.role}`)}
                        </span>
                        {isSuperAdmin && (
                          <span className="text-[9px] font-black px-2 py-0.5 rounded-md bg-red-600 text-white shadow-xs">
                            Super Admin
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* 4 Quick Profile Buttons */}
                  <div className="grid grid-cols-4 gap-1.5 pt-2 border-t border-slate-200/70 dark:border-slate-700/70">
                    <button
                      onClick={() => { onNavigate('customer-orders'); setIsMobileMenuOpen(false); }}
                      className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 hover:border-blue-300 transition-all cursor-pointer active:scale-95"
                    >
                      <Package className="w-4 h-4 text-[#2563EB]" />
                      <span className="text-[10px] font-bold truncate max-w-full">{t('داواکارییەکان')}</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('favorites'); setIsMobileMenuOpen(false); }}
                      className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 hover:border-rose-300 transition-all cursor-pointer active:scale-95"
                    >
                      <Heart className="w-4 h-4 text-rose-500" />
                      <span className="text-[10px] font-bold truncate max-w-full">{t('دڵخوازەکان')}</span>
                    </button>
                    <button
                      onClick={() => { onNavigate('notifications'); setIsMobileMenuOpen(false); }}
                      className="relative flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 hover:border-amber-300 transition-all cursor-pointer active:scale-95"
                    >
                      <Bell className="w-4 h-4 text-amber-500" />
                      <span className="text-[10px] font-bold truncate max-w-full">{t('ئاگادارییەکان')}</span>
                      {unreadCount > 0 && (
                        <span className="absolute top-1 left-1.5 w-2 h-2 bg-[#FF5500] rounded-full ring-2 ring-white dark:ring-slate-900" />
                      )}
                    </button>
                    <button
                      onClick={() => { onNavigate('user-profile'); setIsMobileMenuOpen(false); }}
                      className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-200 border border-slate-100 dark:border-slate-800 hover:border-orange-300 transition-all cursor-pointer active:scale-95"
                    >
                      <User className="w-4 h-4 text-[#FF5500]" />
                      <span className="text-[10px] font-bold truncate max-w-full">{t('پڕۆفایل')}</span>
                    </button>
                  </div>

                  {/* Dashboard Access if Admin / Seller / Driver */}
                  {isSuperAdmin && (
                    <button
                      onClick={() => { onNavigate('admin-dashboard'); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-red-600 hover:bg-red-700 text-white text-xs font-black transition-all cursor-pointer active:scale-98 shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 shrink-0" />
                        <span>{t('داشبۆردی سەرپەرشتیاری گشتی (Admin)')}</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                    </button>
                  )}

                  {isSeller && (
                    <button
                      onClick={() => { onNavigate('seller-dashboard'); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-orange-600 hover:bg-orange-700 text-white text-xs font-black transition-all cursor-pointer active:scale-98 shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Store className="w-4 h-4 shrink-0" />
                        <span>{t('داشبۆردی فرۆشیار و قازانج')}</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                    </button>
                  )}

                  {isDeliveryAgent && (
                    <button
                      onClick={() => { onNavigate('delivery-dashboard'); setIsMobileMenuOpen(false); }}
                      className="w-full flex items-center justify-between p-2 rounded-xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-black transition-all cursor-pointer active:scale-98 shadow-xs"
                    >
                      <div className="flex items-center gap-2">
                        <Truck className="w-4 h-4 shrink-0" />
                        <span>{t('داشبۆردی شۆفێری گەیاندن')}</span>
                      </div>
                      <ChevronLeft className="w-4 h-4 shrink-0" />
                    </button>
                  )}
                </div>
              ) : (
                <div className="bg-gradient-to-r from-orange-500 to-amber-500 rounded-2xl p-3.5 text-white shadow-md space-y-2.5">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-white/20 flex items-center justify-center shrink-0">
                      <User className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-xs font-black">{t('بەخێربێیت بۆ بازاڕی شاخی')}</p>
                      <p className="text-[10px] text-orange-100">{t('چێشتخانە، مارکێت، مۆدە و ئۆتۆمبێل')}</p>
                    </div>
                  </div>
                  <button
                    onClick={() => { onNavigate('auth', 'login'); setIsMobileMenuOpen(false); }}
                    className="w-full py-2 rounded-xl bg-white text-slate-900 text-xs font-black shadow-xs hover:bg-orange-50 transition-all flex items-center justify-center gap-2 cursor-pointer active:scale-98"
                  >
                    <span>{t('چوونە ژوورەوە / دروستکردنی هەژمار')}</span>
                  </button>
                </div>
              )}

              {/* 3. Marketplace Categories - Single Label Selector (بەشە سەرەکییەکانی بازاڕ) */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <Layers className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>{t('بەشە سەرەکییەکانی بازاڕ:')}</span>
                  </label>
                  <button
                    onClick={() => { onNavigate('home'); setIsMobileMenuOpen(false); }}
                    className="text-[10px] text-[#2563EB] dark:text-blue-400 font-bold hover:underline cursor-pointer"
                  >
                    {t('پەڕەی سەرەکی')}
                  </button>
                </div>

                <div className="relative">
                  <select
                    defaultValue=""
                    onChange={(e) => {
                      const val = e.target.value;
                      if (!val) return;
                      if (val === 'home') {
                        onNavigate('home');
                      } else if (val === 'car-marketplace') {
                        onNavigate('car-marketplace');
                      } else {
                        onNavigate('category', val);
                      }
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 pl-8 pr-3 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FF5500] cursor-pointer appearance-none shadow-2xs"
                  >
                    <option value="" disabled>{t('هەڵبژاردنی بەشی بازاڕ... (کلیک بکە)')}</option>
                    <option value="home">🏠 {t('گشت بەشەکان / پەڕەی سەرەکی')}</option>
                    <option value="food">🍽️ {t('cat.food') || 'چێشتخانە و خواردن'}</option>
                    <option value="market">🛒 {t('cat.market') || 'سوپەرمارکێت'}</option>
                    <option value="clothes">👕 {t('cat.clothes') || 'جلوبەرگ و مۆدە'}</option>
                    <option value="fruits_vegetables">🍏 {t('cat.fruits_vegetables') || 'سەوزە و میوە'}</option>
                    <option value="fresh_meat">🥩 {t('cat.fresh_meat') || 'گۆشتی تازەی کوردی'}</option>
                    <option value="dairy">🥛 {t('cat.dairy') || 'شیرەمەنی و ماست'}</option>
                    <option value="electronics">📱 {t('cat.electronics') || 'ئەلیکترۆنیات'}</option>
                    <option value="beauty">✨ {t('cat.beauty') || 'جوانی و مکیاژ'}</option>
                    <option value="car-marketplace">🚗 {t('بازاڕی کڕین و فرۆشتنی ئۆتۆمبێل')}</option>
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 4. Location Selector (شار) */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-1.5">
                <div className="flex items-center justify-between px-1">
                  <label className="text-xs font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                    <MapPin className="w-3.5 h-3.5 text-[#2563EB]" />
                    <span>{t('هەڵبژاردنی شار:')}</span>
                  </label>
                  <span className="text-[10px] font-bold text-[#FF5500] font-latin">
                    {selectedCity ? t(`city.${selectedCity}`) || selectedCity : t('هەموو شارەکان')}
                  </span>
                </div>
                <div className="relative">
                  <select
                    value={selectedCity}
                    onChange={(e) => onSelectCity(e.target.value)}
                    className="w-full text-xs font-bold bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 pl-8 pr-3 text-slate-800 dark:text-slate-200 focus:outline-hidden focus:ring-2 focus:ring-[#FF5500] cursor-pointer appearance-none shadow-2xs"
                  >
                    <option value="">{t('هەموو شارەکانی کوردستان و عێراق')}</option>
                    {CITIES.map(c => (
                      <option key={c} value={c}>{t(`city.${c}`) || c}</option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 left-0 pl-2.5 flex items-center pointer-events-none text-slate-400">
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* 5. Unified Settings Box (ڕێکخستنەکان: زمان و دۆخی تاریک لە ناو یەک بلۆک) */}
              <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-2xl border border-slate-100 dark:border-slate-800 space-y-3">
                <div className="flex items-center justify-between px-1">
                  <span className="text-xs font-black text-slate-900 dark:text-white flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#FF5500]" />
                    <span>{t('ڕێکخستنەکان و زمان')}</span>
                  </span>
                </div>

                {/* Single Label Language Selector */}
                <LanguageSwitcher variant="select" />

                {/* Dark Mode Toggle Bar */}
                <div className="flex items-center justify-between bg-white dark:bg-slate-900 p-2.5 rounded-xl border border-slate-200/80 dark:border-slate-700/80">
                  <div className="flex items-center gap-2">
                    <div className="w-6 h-6 rounded-lg bg-amber-50 dark:bg-slate-800 flex items-center justify-center">
                      {isDarkMode ? (
                        <Moon className="w-3.5 h-3.5 text-amber-400" />
                      ) : (
                        <Sun className="w-3.5 h-3.5 text-amber-500" />
                      )}
                    </div>
                    <div>
                      <p className="text-xs font-bold text-slate-800 dark:text-slate-200">
                        {isDarkMode ? t('دۆخی تاریک (Dark Mode)') : t('دۆخی ڕووناک (Light Mode)')}
                      </p>
                    </div>
                  </div>

                  <button
                    onClick={toggleTheme}
                    className={`relative inline-flex h-5 w-10 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-hidden ${
                      isDarkMode ? 'bg-[#2563EB]' : 'bg-slate-300'
                    }`}
                    role="switch"
                    aria-checked={isDarkMode}
                  >
                    <span
                      className={`pointer-events-none inline-block h-4 w-4 transform rounded-full bg-white shadow-sm ring-0 transition duration-200 ease-in-out ${
                        isDarkMode ? '-translate-x-5' : 'translate-x-0'
                      }`}
                    />
                  </button>
                </div>
              </div>

              {/* 6. App Updates & Changelog Action Button */}
              <button
                onClick={() => {
                  openUpdateModal();
                  setIsMobileMenuOpen(false);
                }}
                className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-orange-50/80 dark:bg-slate-800/80 border border-orange-200 dark:border-slate-700 text-slate-800 dark:text-slate-200 text-xs font-bold hover:border-orange-400 transition-all cursor-pointer shadow-2xs"
              >
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-lg bg-[#FF5500] text-white flex items-center justify-center shrink-0">
                    <Sparkles className="w-3.5 h-3.5" />
                  </div>
                  <div className="text-right">
                    <p className="font-bold text-slate-900 dark:text-white leading-tight">{t('ئەپدەیتی نوێ و گۆڕانکارییەکان')}</p>
                    <p className="text-[9px] text-slate-500 dark:text-slate-400">{t('بینینی نوێکارییەکانی وەشانی ئەپ')}</p>
                  </div>
                </div>
                <span className="text-[10px] font-latin font-bold bg-[#FF5500] text-white px-2 py-0.5 rounded-md shrink-0">
                  v{appVersion.version}
                </span>
              </button>

            </div>

            {/* Drawer Bottom Footer */}
            <div className="p-3.5 border-t border-slate-100 dark:border-slate-800/80 bg-slate-50/95 dark:bg-[#131d31]/95 shrink-0 space-y-2">
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
                SHAKH Multi-Marketplace Platform • {t('وەشانی')} ۲.۵
              </p>
            </div>

          </aside>
        </div>,
        document.body
      )}
    </header>
  );
};
