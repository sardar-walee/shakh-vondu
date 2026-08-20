import React, { useState, useRef, useEffect } from 'react';
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
  ArrowRight
} from 'lucide-react';
import { Logo } from '../common/Logo';
import { useAuth } from '../../context/AuthContext';
import { useCart } from '../../context/CartContext';
import { useNotification } from '../../context/NotificationContext';
import { useLanguage } from '../../context/LanguageContext';
import { useMarketplace } from '../../context/MarketplaceContext';
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

  // Filter search results preview
  const searchResults = searchQuery.trim() === '' ? { products: [], sellers: [], cars: [] } : {
    products: products.filter(p => p.title.toLowerCase().includes(searchQuery.toLowerCase()) || p.description.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 4),
    sellers: sellers.filter(s => s.storeName.toLowerCase().includes(searchQuery.toLowerCase()) || s.description.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 2),
    cars: carAds.filter(c => c.title.toLowerCase().includes(searchQuery.toLowerCase()) || c.brand.toLowerCase().includes(searchQuery.toLowerCase())).slice(0, 2)
  };

  const hasSearchResults = searchQuery.trim() !== '' && (
    (searchResults.products && searchResults.products.length > 0) ||
    (searchResults.sellers && searchResults.sellers.length > 0) ||
    (searchResults.cars && searchResults.cars.length > 0)
  );

  return (
    <header className="sticky top-0 z-40 bg-white border-b border-slate-200 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-[72px] gap-3 md:gap-6">
          
          {/* Logo & City Picker */}
          <div className="flex items-center gap-4 sm:gap-6">
            <button
              onClick={() => onNavigate('home')}
              className="text-right focus:outline-hidden cursor-pointer flex-shrink-0"
            >
              <Logo size="md" showTagline={false} />
            </button>

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
                {searchResults.products && searchResults.products.length > 0 && (
                  <div className="mb-3">
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
                <div className="absolute top-full mt-2 w-80 sm:w-92 bg-white rounded-2xl shadow-xl border border-slate-100 p-3 z-50 left-0 sm:right-auto sm:left-0 animate-in fade-in">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 mb-2">
                    <div className="flex items-center gap-1.5">
                      <span className="text-xs font-bold text-slate-900">ئاگادارییەکان</span>
                      {unreadCount > 0 && (
                        <span className="text-[10px] font-bold bg-orange-100 text-[#F97316] px-1.5 py-0.2 rounded-full font-latin">
                          {unreadCount} نوێ
                        </span>
                      )}
                    </div>
                    {unreadCount > 0 && (
                      <button
                        onClick={markAllAsRead}
                        className="text-[11px] text-[#2563EB] hover:underline font-semibold cursor-pointer"
                      >
                        هەمووی وەک خوێندراوە
                      </button>
                    )}
                  </div>

                  <div className="max-h-72 overflow-y-auto space-y-2">
                    {notifications.length === 0 ? (
                      <p className="text-xs text-slate-400 text-center py-6">هیچ ئاگادارییەک نییە</p>
                    ) : (
                      notifications.slice(0, 6).map(n => (
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
                          className={`p-2.5 rounded-xl transition-colors cursor-pointer text-start ${
                            n.isRead ? 'bg-slate-50/60 hover:bg-slate-100' : 'bg-blue-50/60 border border-blue-100 hover:bg-blue-100/60'
                          }`}
                        >
                          <div className="flex items-center justify-between gap-1 mb-1">
                            <span className="text-xs font-bold text-slate-900 line-clamp-1">{n.title}</span>
                            <span className="text-[10px] text-slate-400 font-latin whitespace-nowrap">
                              {new Date(n.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-600 leading-relaxed line-clamp-2">{n.message}</p>
                        </div>
                      ))
                    )}
                  </div>

                  {/* Open Full Notification Center link */}
                  <div className="mt-2.5 pt-2 border-t border-slate-100">
                    <button
                      onClick={() => {
                        setIsNotifOpen(false);
                        onNavigate('notifications');
                      }}
                      className="w-full py-1.5 rounded-xl bg-slate-50 hover:bg-blue-50 text-[#2563EB] text-xs font-bold transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                    >
                      <span>بینینی هەموو ئاگادارییەکان لە ناوەندی ئاگاداری</span>
                      <ArrowLeft className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
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

            {/* User Profile / Dashboard Menu */}
            <div ref={userRef} className="relative">
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

            {/* Mobile Menu Trigger */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="p-2.5 rounded-full bg-slate-100 text-slate-700 md:hidden cursor-pointer"
              aria-label="Menu"
            >
              {isMobileMenuOpen ? <X className="w-4 h-4" /> : <Menu className="w-4 h-4" />}
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

      {/* Mobile Menu Drawer */}
      {isMobileMenuOpen && (
        <div className="md:hidden border-t border-slate-200 bg-white px-4 py-3 space-y-2 shadow-lg">
          <div className="flex items-center justify-between py-2 border-b border-slate-100">
            <span className="text-xs font-bold text-slate-500">شار:</span>
            <select
              value={selectedCity}
              onChange={(e) => onSelectCity(e.target.value)}
              className="text-xs bg-slate-100 rounded-lg p-1 text-slate-700 font-semibold"
            >
              <option value="">هەموو شارەکان</option>
              {CITIES.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <button
            onClick={() => { onNavigate('post-car-ad'); setIsMobileMenuOpen(false); }}
            className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-orange-500 text-white text-xs font-bold shadow"
          >
            <Car className="w-4 h-4" />
            {t('car.post_ad')}
          </button>

          <div className="grid grid-cols-3 gap-2 pt-2">
            <button
              onClick={() => { onNavigate('notifications'); setIsMobileMenuOpen(false); }}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-blue-50 text-[#2563EB] text-xs font-bold"
            >
              <div className="relative">
                <Bell className="w-4 h-4" />
                {unreadCount > 0 && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 bg-[#F97316] rounded-full" />
                )}
              </div>
              <span>ئاگادارییەکان</span>
            </button>
            <button
              onClick={() => { onNavigate('customer-orders'); setIsMobileMenuOpen(false); }}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              <Package className="w-4 h-4" />
              <span>داواکارییەکانم</span>
            </button>
            <button
              onClick={() => { onNavigate('favorites'); setIsMobileMenuOpen(false); }}
              className="flex flex-col items-center justify-center gap-1 p-2 rounded-xl bg-slate-100 text-slate-700 text-xs font-semibold"
            >
              <Heart className="w-4 h-4 text-rose-500" />
              <span>دڵخوازەکان</span>
            </button>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between">
            <span className="text-xs font-semibold text-slate-500">زمان:</span>
            <div className="flex gap-1.5">
              {(['ku', 'en', 'ar'] as const).map(l => (
                <button
                  key={l}
                  onClick={() => setLanguage(l)}
                  className={`px-2.5 py-1 text-xs rounded-lg font-bold uppercase ${
                    language === l ? 'bg-orange-500 text-white' : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {l}
                </button>
              ))}
            </div>
          </div>
        </div>
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
                      <span className="text-[10px] bg-orange-500 text-white px-1.5 py-0.2 rounded font-bold">چالاکە</span>
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
