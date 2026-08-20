import React from 'react';
import { Heart, Store, Package } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/cards/ProductCard';
import { SellerCard } from '../components/cards/SellerCard';

interface FavoritesViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const FavoritesView: React.FC<FavoritesViewProps> = ({ onNavigate }) => {
  const { products, sellers, favoriteProductIds, favoriteSellerIds } = useMarketplace();

  const favProducts = products.filter(p => favoriteProductIds.includes(p.id));
  const favSellers = sellers.filter(s => favoriteSellerIds.includes(s.id));

  return (
    <div className="space-y-8 pb-16">
      
      <div className="text-right">
        <h1 className="text-2xl font-black text-slate-900 flex items-center gap-2">
          <Heart className="w-6 h-6 text-rose-500 fill-rose-500" />
          کاڵا و فرۆشگە دڵخوازەکانم
        </h1>
        <p className="text-xs text-slate-500 mt-1">ئەو بەرهەم و شوێنانەی نیشانت کردوون بۆ ئەوەی بە خێرایی دەستت پێیان بگات</p>
      </div>

      {/* Favorite Products */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900">کاڵا دڵخوازەکان ({favProducts.length})</h3>
        {favProducts.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <Package className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">هیچ کاڵایەکت لە دڵخوازەکان دانەناوە.</p>
          </div>
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

      {/* Favorite Sellers */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900">فرۆشگە و چێشتخانە دڵخوازەکان ({favSellers.length})</h3>
        {favSellers.length === 0 ? (
          <div className="p-8 text-center bg-white rounded-3xl border border-slate-200">
            <Store className="w-12 h-12 text-slate-300 mx-auto mb-2" />
            <p className="text-xs text-slate-400">هیچ فرۆشگایەکت لە دڵخوازەکان دانەناوە.</p>
          </div>
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

    </div>
  );
};
