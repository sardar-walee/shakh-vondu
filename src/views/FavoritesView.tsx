import React from 'react';
import { Heart, Store, Package } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { ProductCard } from '../components/cards/ProductCard';
import { SellerCard } from '../components/cards/SellerCard';
import { EmptyState } from '../components/common/EmptyState';

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
          <EmptyState
            type="favorites"
            title="هیچ کاڵایەکت لە دڵخوازەکان دانەناوە"
            description="دەتوانیت بە داگرتنی ئایکۆنی دڵ کاڵاکان بخەیتە لیستی دڵخوازەکانتەوە."
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

      {/* Favorite Sellers */}
      <div className="space-y-4">
        <h3 className="text-sm font-black text-slate-900">فرۆشگە و چێشتخانە دڵخوازەکان ({favSellers.length})</h3>
        {favSellers.length === 0 ? (
          <EmptyState
            type="sellers"
            title="هیچ فرۆشگایەکت لە دڵخوازەکان دانەناوە"
            description="دەتوانیت فرۆشگە و چێشتخانەکان هەڵبژێریت تا بە خێرایی دەستت پێیان بگات."
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

    </div>
  );
};
