import React from 'react';
import { Home, Layers, PlusCircle, ShoppingBag, User, Car, Clock } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

interface MobileBottomNavProps {
  currentView: string;
  onNavigate: (view: string, param?: string) => void;
  onOpenCategoriesDrawer?: () => void;
  onOpenAppDownload?: () => void;
}

export const MobileBottomNav: React.FC<MobileBottomNavProps> = ({
  currentView,
  onNavigate,
  onOpenCategoriesDrawer
}) => {
  const { totalItems, setIsOpen: setCartOpen } = useCart();
  const { currentUser, isAuthenticated } = useAuth();

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-white/95 dark:bg-[#0f172a]/95 backdrop-blur-lg border-t border-slate-200/80 dark:border-slate-800 shadow-lg safe-area-bottom pb-1 transition-colors duration-300">
      <div className="grid grid-cols-5 items-center h-16 max-w-lg mx-auto px-2 text-center" dir="rtl">
        
        {/* 1. Home */}
        <button
          onClick={() => onNavigate('home')}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative ${
            currentView === 'home' ? 'text-[#FF5500]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Home className={`w-5 h-5 ${currentView === 'home' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-bold mt-1">سەرەکی</span>
          {currentView === 'home' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#FF5500] absolute -bottom-0.5" />
          )}
        </button>

        {/* 2. Categories / Market */}
        <button
          onClick={() => {
            if (onOpenCategoriesDrawer) {
              onOpenCategoriesDrawer();
            } else {
              onNavigate('category', 'food');
            }
          }}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative ${
            currentView === 'category' ? 'text-[#2563EB] dark:text-blue-400' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <Layers className={`w-5 h-5 ${currentView === 'category' ? 'stroke-[2.5]' : 'stroke-2'}`} />
          <span className="text-[10px] font-bold mt-1">بەشەکان</span>
          {currentView === 'category' && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-blue-400 absolute -bottom-0.5" />
          )}
        </button>

        {/* 3. Center Highlight: Post Car / Sell */}
        <button
          onClick={() => onNavigate('post-car-ad')}
          className="flex flex-col items-center justify-center -mt-5 transition-transform active:scale-90 cursor-pointer group"
        >
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-[#FF5500] to-amber-500 text-white flex items-center justify-center shadow-lg shadow-orange-500/40 group-hover:scale-105 transition-all">
            <PlusCircle className="w-6 h-6 stroke-[2.5]" />
          </div>
          <span className="text-[10px] font-black text-slate-800 dark:text-slate-200 mt-0.5">پۆست بکە</span>
        </button>

        {/* 4. Cart */}
        <button
          onClick={() => setCartOpen(true)}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative ${
            currentView === 'checkout' ? 'text-[#FF5500]' : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          <div className="relative">
            <ShoppingBag className="w-5 h-5 stroke-2" />
            {totalItems > 0 && (
              <span className="absolute -top-1.5 -right-2 bg-[#FF5500] text-white text-[9px] font-black w-4.5 h-4.5 rounded-full flex items-center justify-center border-2 border-white dark:border-slate-900 animate-scaleUp font-latin">
                {totalItems}
              </span>
            )}
          </div>
          <span className="text-[10px] font-bold mt-1">سەبەتە</span>
        </button>

        {/* 5. Account / Profile or Login */}
        <button
          onClick={() => {
            if (isAuthenticated) {
              onNavigate('user-profile');
            } else {
              onNavigate('auth', 'login');
            }
          }}
          className={`flex flex-col items-center justify-center py-1 transition-all cursor-pointer relative ${
            ['user-profile', 'customer-orders', 'auth'].includes(currentView)
              ? 'text-[#2563EB] dark:text-blue-400'
              : 'text-slate-500 dark:text-slate-400 hover:text-slate-800 dark:hover:text-slate-200'
          }`}
        >
          {isAuthenticated && currentUser ? (
            <div className="w-5 h-5 rounded-full bg-gradient-to-tr from-[#FF5500] to-amber-500 text-white text-[10px] font-black flex items-center justify-center shadow-xs">
              {currentUser.fullName ? currentUser.fullName.charAt(0) : 'U'}
            </div>
          ) : (
            <User className={`w-5 h-5 ${['user-profile', 'customer-orders', 'auth'].includes(currentView) ? 'stroke-[2.5]' : 'stroke-2'}`} />
          )}
          <span className="text-[10px] font-bold mt-1">
            {isAuthenticated ? 'پڕۆفایل' : 'چوونە ژوورەوە'}
          </span>
          {['user-profile', 'customer-orders', 'auth'].includes(currentView) && (
            <span className="w-1.5 h-1.5 rounded-full bg-[#2563EB] dark:bg-blue-400 absolute -bottom-0.5" />
          )}
        </button>

      </div>
    </div>
  );
};
