import React from 'react';
import { Heart, Plus, Star, Store, ShieldCheck } from 'lucide-react';
import { Product } from '../../types';
import { CategoryBadge } from '../common/Badge';
import { useCart } from '../../context/CartContext';
import { useMarketplace } from '../../context/MarketplaceContext';

interface ProductCardProps {
  product: Product;
  onClick: () => void;
  onSellerClick?: (sellerId: string) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({
  product,
  onClick,
  onSellerClick
}) => {
  const { addToCart } = useCart();
  const { favoriteProductIds, toggleFavoriteProduct } = useMarketplace();
  const isFav = favoriteProductIds.includes(product.id);

  const price = product.price;
  const discountPrice = product.discountPrice;
  const discountPercent = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteProduct(product.id);
  };

  return (
    <div
      onClick={onClick}
      className="group relative bg-white rounded-2xl border border-slate-200 hover:border-[#2563EB] shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Image Container */}
      <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
        <img
          src={product.images[0]}
          alt={product.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Badges Overlay */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
          <CategoryBadge category={product.category} />
          {discountPercent > 0 && (
            <span className="inline-block text-[10px] font-black bg-[#F97316] text-white px-2 py-0.5 rounded-md shadow-xs font-latin">
              {discountPercent}% داشکاندن
            </span>
          )}
        </div>

        {/* Favorite Button */}
        <button
          onClick={handleFav}
          className={`absolute top-2.5 left-2.5 p-2 rounded-full backdrop-blur-md transition-colors z-10 cursor-pointer ${
            isFav
              ? 'bg-rose-500 text-white shadow-xs'
              : 'bg-white/85 text-slate-600 hover:text-rose-500 hover:bg-white'
          }`}
          aria-label="Add to favorites"
        >
          <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
        </button>

        {/* Prep Time or Unit Overlay */}
        {(product.prepTimeMinutes || product.unit) && (
          <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            {product.prepTimeMinutes ? `⏱ ${product.prepTimeMinutes} خولەک` : `یەکە: ${product.unit}`}
          </div>
        )}
      </div>

      {/* Content */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Seller / Store Link */}
          {product.sellerName && (
            <div
              onClick={(e) => {
                if (onSellerClick) {
                  e.stopPropagation();
                  onSellerClick(product.sellerId);
                }
              }}
              className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 hover:text-[#2563EB] mb-1 transition-colors"
            >
              <Store className="w-3 h-3 text-slate-400" />
              <span className="truncate">{product.sellerName}</span>
            </div>
          )}

          {/* Title */}
          <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-2 leading-snug group-hover:text-[#2563EB] transition-colors">
            {product.title}
          </h3>

          {/* Rating */}
          <div className="flex items-center gap-1 mt-1.5">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-800 font-latin">{product.rating || 4.9}</span>
            <span className="text-[10px] text-slate-400 font-latin">({product.reviewCount || 12})</span>
          </div>
        </div>

        {/* Price & Add to Cart Button */}
        <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between gap-2">
          <div className="flex flex-col">
            {discountPrice ? (
              <div className="flex items-baseline gap-1.5">
                <span className="text-sm sm:text-base font-black text-[#F97316] font-latin">
                  {discountPrice.toLocaleString()} د.ع
                </span>
                <span className="text-[11px] text-slate-400 line-through font-latin">
                  {price.toLocaleString()}
                </span>
              </div>
            ) : (
              <span className="text-sm sm:text-base font-black text-slate-900 font-latin">
                {price.toLocaleString()} د.ع
              </span>
            )}
          </div>

          <button
            onClick={handleAdd}
            className="p-2 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white shadow-xs active:scale-95 transition-all cursor-pointer"
            title="زیادکردن بۆ سەبەتە"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
