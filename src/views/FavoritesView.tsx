import React, { useState } from 'react';
import { Heart, Store, ShoppingBag, Lock, LogIn, ArrowRight, Trash2, Sparkles } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { useCart } from '../context/CartContext';
import { ProductCard } from '../components/cards/ProductCard';
import { SellerCard } from '../components/cards/SellerCard';
import { EmptyState } from '../components/common/EmptyState';

interface FavoritesViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onNavigate }) => {
  const { products, sellers, favoriteProductIds, favoriteSellerIds, toggleFavoriteProduct, toggleFavoriteSeller } = useMarketplace();
  const { currentUser } = useAuth();
  const { addToCart, setIsOpen: setCartOpen } = useCart();
  const [activeTab, setActiveTab] = useState<'all' | 'products' | 'sellers'>('all');

  const favProducts = products.filter(p => favoriteProductIds.includes(p.id));
  const favSellers = sellers.filter(s => favoriteSellerIds.includes(s.id));

  const totalValue = favProducts.reduce((sum, p) => sum + (p.discountPrice || p.price), 0);

  const handleAddAllToCart = () => {
    favProducts.forEach(p => addToCart(p, 1));
    setCartOpen(true);
  };

  // If user is not logged in, prompt them to log in
  if (!currentUser) {
    return (
      <div className="max-w-2xl mx-auto py-12 px-4 text-center space-y-6">
        <div className="w-20 h-20 bg-gradient-to-tr from-rose-500 to-orange-500 rounded-3xl text-white flex items-center justify-center mx-auto shadow-xl shadow-rose-500/20 animate-pulse">
          <Lock className="w-10 h-10" />
        </div>

        <div className="space-y-2">
          <h1 className="text-2xl font-black text-slate-900 dark:text-white">
            لیستی دڵخوازەکانم (Wishlist) 🔒
          </h1>
          <p className="text-sm text-slate-500 dark:text-slate-400 max-w-md mx-auto leading-relaxed">
            تکایە سەرەتا بچۆ ژوورەوە بۆ ئەوەی بتوانیت کاڵا و فرۆشگەکان بخەیتە لیستی دڵخوازەکانتەوە و لە هەموو ئامێرەکانتدا بەردەوام دەستت پێیان بگات.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-3 pt-4">
          <button
            onClick={() => onNavigate('auth', 'login')}
            className="w-full sm:w-auto px-8 py-3.5 bg-[#FF5500] hover:bg-orange-600 text-white rounded-2xl font-black text-sm shadow-lg shadow-orange-500/30 transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <LogIn className="w-4 h-4" />
            <span>چوونەژوورەوە یان تۆماربوون</span>
          </button>
          <button
            onClick={() => onNavigate('home')}
            className="w-full sm:w-auto px-6 py-3.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 text-slate-700 dark:text-slate-300 rounded-2xl font-bold text-sm transition-all flex items-center justify-center gap-2 cursor-pointer"
          >
            <span>گەڕان لە بازاڕ</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-8 pb-20">
      
      {/* Header & Stats */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white dark:bg-[#1e293b] p-6 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
        <div className="text-right space-y-1">
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-50 dark:bg-rose-950/60 text-rose-500 rounded-xl">
              <Heart className="w-6 h-6 fill-rose-500" />
            </div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
              لیستی دڵخوازەکانم (Wishlist)
            </h1>
          </div>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            ئەو کاڵا و فرۆشگایانەی پاشەکەوتت کردوون لە بنکەدراوەدا sync بون و ڕاستەوخۆ دەستت پێیان دەگات.
          </p>
        </div>

        {favProducts.length > 0 && (
          <div className="flex flex-wrap items-center gap-3 border-t md:border-t-0 md:border-r border-slate-100 dark:border-slate-800 pt-4 md:pt-0 md:pr-6">
            <div className="text-right">
              <span className="text-[10px] text-slate-400 block font-bold">کۆی گشتی بەهای کاڵاکان</span>
              <span className="text-lg font-black text-[#FF5500] font-latin">
                {totalValue.toLocaleString()} <span className="text-xs font-sans">د.ع</span>
              </span>
            </div>

            <button
              onClick={handleAddAllToCart}
              className="px-5 py-2.5 bg-[#FF5500] hover:bg-orange-600 text-white rounded-2xl text-xs font-black shadow-md shadow-orange-500/20 transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>زیادکردنی هەمووی بۆ سەبەتە</span>
            </button>
          </div>
        )}
      </div>

      {/* Tabs Filter */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2">
        <button
          onClick={() => setActiveTab('all')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'all'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          هەمووی ({favProducts.length + favSellers.length})
        </button>
        <button
          onClick={() => setActiveTab('products')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'products'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          کاڵاکان ({favProducts.length})
        </button>
        <button
          onClick={() => setActiveTab('sellers')}
          className={`px-4 py-2 rounded-xl text-xs font-black transition-all cursor-pointer ${
            activeTab === 'sellers'
              ? 'bg-slate-900 dark:bg-white text-white dark:text-slate-900 shadow-sm'
              : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200'
          }`}
        >
          فرۆشگە و چێشتخانەکان ({favSellers.length})
        </button>
      </div>

      {/* Favorite Products Section */}
      {(activeTab === 'all' || activeTab === 'products') && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <ShoppingBag className="w-4 h-4 text-orange-500" />
              <span>کاڵا دڵخوازەکان ({favProducts.length})</span>
            </h3>
          </div>

          {favProducts.length === 0 ? (
            <EmptyState
              type="favorites"
              title="هیچ کاڵایەکت لە دڵخوازەکان دانەناوە"
              description="دەتوانیت بە داگرتنی ئایکۆنی دڵ لەسەر هەر کاڵایەک، بپاشەکەوتی بکەیت لە لیستی دڵخوازەکانتدا."
              actionLabel="گەڕان لە کاڵاکان"
              onAction={() => onNavigate('home')}
              compact
            />
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
              {favProducts.map(p => (
                <ProductCard
                  key={p.id}
                  product={p}
                  onClick={() => onNavigate('product-detail', p.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

      {/* Favorite Sellers Section */}
      {(activeTab === 'all' || activeTab === 'sellers') && (
        <div className="space-y-4 pt-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900 dark:text-white flex items-center gap-2">
              <Store className="w-4 h-4 text-blue-500" />
              <span>فرۆشگە و چێشتخانە دڵخوازەکان ({favSellers.length})</span>
            </h3>
          </div>

          {favSellers.length === 0 ? (
            <EmptyState
              type="sellers"
              title="هیچ فرۆشگایەکت لە دڵخوازەکان دانەناوە"
              description="دەتوانیت سەردانی فرۆشگەکان بکەیت و بیانهێنیتە لیستی دڵخوازەکانت بۆ ئەوەی بە خێرایی بەردەستت ببن."
              actionLabel="بینینی فرۆشگەکان"
              onAction={() => onNavigate('home')}
              compact
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {favSellers.map(s => (
                <SellerCard
                  key={s.id}
                  seller={s}
                  onClick={() => onNavigate('seller-store', s.id)}
                />
              ))}
            </div>
          )}
        </div>
      )}

    </div>
  );
};
