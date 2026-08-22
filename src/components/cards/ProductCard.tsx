import React, { useState } from 'react';
import { Heart, Plus, Star, Store, Eye, Share2, Flame, Check } from 'lucide-react';
import { Product } from '../../types';
import { CategoryBadge } from '../common/Badge';
import { useCart } from '../../context/CartContext';
import { useMarketplace } from '../../context/MarketplaceContext';
import { ShareModal } from '../common/ShareModal';

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
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAdded, setIsAdded] = useState(false);

  const price = product.price;
  const discountPrice = product.discountPrice;
  const discountPercent = discountPrice ? Math.round(((price - discountPrice) / price) * 100) : 0;

  // Best seller logic
  const isBestSeller = product.isBestSeller || (product.salesCount && product.salesCount > 30) || (product.rating && product.rating >= 4.8);
  const views = product.viewsCount || Math.floor(100 + (product.title.length * 37) % 850);
  const likes = (product.likesCount || Math.floor(10 + (product.title.length * 7) % 90)) + (isFav ? 1 : 0);

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    addToCart(product, 1);
    setIsAdded(true);
    setTimeout(() => setIsAdded(false), 1500);
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteProduct(product.id);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  return (
    <>
      <div
        onClick={onClick}
        className="group relative bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#2563EB] dark:hover:border-blue-500 shadow-xs hover:shadow-md transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
        dir="rtl"
      >
        {/* Image Container */}
        <div className="relative aspect-square w-full overflow-hidden bg-slate-100">
          <img
            src={product.images[0]}
            alt={product.title}
            loading="lazy"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />

          {/* Badges Overlay (Top Right) */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
            <CategoryBadge category={product.category} />
            {isBestSeller && (
              <span className="inline-flex items-center gap-1 text-[10px] font-black bg-rose-500 text-white px-2 py-0.5 rounded-md shadow-xs animate-pulse">
                <Flame className="w-3 h-3 fill-white" />
                <span>پرفرۆشترین</span>
              </span>
            )}
            {discountPercent > 0 && (
              <span className="inline-block text-[10px] font-black bg-[#F97316] text-white px-2 py-0.5 rounded-md shadow-xs font-latin">
                {discountPercent}% داشکاندن
              </span>
            )}
          </div>

          {/* Actions Overlay (Top Left) */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            <button
              onClick={handleFav}
              className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                isFav
                  ? 'bg-rose-500 text-white shadow-md scale-110'
                  : 'bg-white/85 text-slate-600 hover:text-rose-500 hover:bg-white'
              }`}
              aria-label="Add to favorites"
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/85 text-slate-600 hover:text-[#2563EB] hover:bg-white backdrop-blur-md transition-colors cursor-pointer"
              title="هاوبەشکردن"
              aria-label="Share product"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Overlay: Views & Likes */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-300" />
              <span className="font-latin">{views}</span>
            </div>

            {(product.prepTimeMinutes || product.unit) && (
              <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                {product.prepTimeMinutes ? `⏱ ${product.prepTimeMinutes} خولەک` : `یەکە: ${product.unit}`}
              </div>
            )}
          </div>
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
                className="flex items-center gap-1 text-[11px] font-semibold text-slate-500 dark:text-slate-400 hover:text-[#2563EB] mb-1 transition-colors"
              >
                <Store className="w-3 h-3 text-slate-400" />
                <span className="truncate">{product.sellerName}</span>
              </div>
            )}

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 dark:text-slate-100 line-clamp-2 leading-snug group-hover:text-[#2563EB] dark:group-hover:text-blue-400 transition-colors">
              {product.title}
            </h3>

            {/* Dynamic Category Mini Snippet */}
            <div className="flex flex-wrap gap-1 mt-1 text-[10px]">
              {product.category === 'clothes' && product.sizes && product.sizes.length > 0 && (
                <span className="bg-purple-50 text-purple-700 font-bold px-1.5 py-0.5 rounded">
                  قەبارە: {product.sizes.slice(0, 3).join(', ')}{product.sizes.length > 3 ? '...' : ''}
                </span>
              )}
              {product.category === 'electronics' && (product.brand || product.model) && (
                <span className="bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded font-latin truncate max-w-[150px]">
                  {[product.brand, product.model].filter(Boolean).join(' ')}
                </span>
              )}
              {product.category === 'cars' && (product.year || product.mileageKm !== undefined) && (
                <span className="bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded font-latin">
                  {[product.year ? `مۆدێل ${product.year}` : '', product.mileageKm !== undefined ? `${product.mileageKm.toLocaleString()} کم` : ''].filter(Boolean).join(' • ')}
                </span>
              )}
              {product.category === 'fresh_meat' && (product.meatType || product.cutType) && (
                <span className="bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded">
                  {[product.meatType, product.cutType].filter(Boolean).join(' • ')}
                </span>
              )}
              {product.category === 'fruits_vegetables' && product.isOrganic && (
                <span className="bg-emerald-50 text-emerald-700 font-bold px-1.5 py-0.5 rounded">
                  🌿 ئۆرگانیک
                </span>
              )}
              {product.category === 'beauty' && product.brand && (
                <span className="bg-pink-50 text-pink-700 font-bold px-1.5 py-0.5 rounded font-latin">
                  {product.brand}
                </span>
              )}
            </div>

            {/* Rating & Social Metrics */}
            <div className="flex items-center justify-between mt-1.5 text-xs">
              <div className="flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span className="font-bold text-slate-800 font-latin">{product.rating || 4.9}</span>
                <span className="text-[10px] text-slate-400 font-latin">({product.reviewCount || 18})</span>
              </div>

              <div className="flex items-center gap-1 text-[11px] text-slate-400">
                <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span className="font-latin">{likes}</span>
              </div>
            </div>
          </div>

          {/* Price & Add to Cart Button */}
          <div className="mt-3 pt-2.5 border-t border-slate-100 dark:border-slate-800 flex items-center justify-between gap-2">
            <div className="flex flex-col">
              {discountPrice ? (
                <div className="flex items-baseline gap-1.5">
                  <span className="text-sm sm:text-base font-black text-[#FF5500] font-latin">
                    {discountPrice.toLocaleString()} د.ع
                  </span>
                  <span className="text-[11px] text-slate-400 line-through font-latin">
                    {price.toLocaleString()}
                  </span>
                </div>
              ) : (
                <span className="text-sm sm:text-base font-black text-slate-900 dark:text-slate-100 font-latin">
                  {price.toLocaleString()} د.ع
                </span>
              )}
            </div>

            <button
              onClick={handleAdd}
              className={`p-2 rounded-xl text-white shadow-xs active:scale-95 transition-all cursor-pointer ${
                isAdded ? 'bg-emerald-600' : 'bg-[#FF5500] hover:bg-orange-600'
              }`}
              title="زیادکردن بۆ سەبەتە"
            >
              {isAdded ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
            </button>
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={product.title}
        description={`کاڵای ${product.title} بە نرخی ${effectivePrice(product).toLocaleString()} د.ع لە شاخ`}
        url={`${window.location.origin}/#product-${product.id}`}
        image={product.images[0]}
      />
    </>
  );
};

const effectivePrice = (p: Product) => p.discountPrice || p.price;
