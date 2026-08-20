import React, { useState } from 'react';
import {
  Star,
  Plus,
  Minus,
  ShoppingCart,
  Heart,
  Store,
  ShieldCheck,
  Truck,
  RotateCcw,
  Check,
  MessageSquare,
  ArrowRight,
  Share2,
  Clock,
  Sparkles
} from 'lucide-react';
import { Product } from '../types';
import { CategoryBadge } from '../components/common/Badge';
import { ProductCard } from '../components/cards/ProductCard';
import { useCart } from '../context/CartContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';

interface ProductDetailViewProps {
  productId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const ProductDetailView: React.FC<ProductDetailViewProps> = ({
  productId,
  onNavigate
}) => {
  const { products, sellers, reviews, addReview, favoriteProductIds, toggleFavoriteProduct } = useMarketplace();
  const { addToCart, setIsOpen: setCartOpen } = useCart();
  const { currentUser } = useAuth();

  const product = products.find(p => p.id === productId) || products[0];
  const seller = sellers.find(s => s.id === product?.sellerId);
  const productReviews = reviews.filter(r => r.targetId === product?.id);

  const isFav = favoriteProductIds.includes(product?.id || '');

  const [selectedImage, setSelectedImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [selectedSize, setSelectedSize] = useState<string | undefined>(product?.sizes?.[0]);
  const [selectedColor, setSelectedColor] = useState<string | undefined>(product?.colors?.[0]);
  const [specialInstructions, setSpecialInstructions] = useState('');
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [newRating, setNewRating] = useState(5);
  const [newComment, setNewComment] = useState('');
  const [addedToast, setAddedToast] = useState(false);

  if (!product) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">کاڵاکە نەدۆزرایەوە</h2>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold"
        >
          گەڕانەوە بۆ پەڕەی سەرەکی
        </button>
      </div>
    );
  }

  const effectivePrice = product.discountPrice || product.price;
  const discountPercent = product.discountPrice
    ? Math.round(((product.price - product.discountPrice) / product.price) * 100)
    : 0;

  const handleAddToCart = () => {
    addToCart(product, quantity, selectedSize, selectedColor, specialInstructions);
    setAddedToast(true);
    setTimeout(() => setAddedToast(false), 3000);
  };

  const handleInstantBuy = () => {
    addToCart(product, quantity, selectedSize, selectedColor, specialInstructions);
    onNavigate('checkout');
  };

  const handleSubmitReview = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      alert('تکایە سەرەتا بچۆ ژوورەوە بۆ ناردنی هەڵسەنگاندن.');
      return;
    }
    if (!newComment.trim()) return;

    await addReview({
      userId: currentUser.id,
      userName: currentUser.fullName || 'کڕیار',
      userAvatar: currentUser.avatarUrl,
      targetId: product.id,
      targetType: 'product',
      rating: newRating,
      comment: newComment
    });

    setNewComment('');
    setShowReviewModal(false);
  };

  const relatedProducts = products
    .filter(p => p.category === product.category && p.id !== product.id)
    .slice(0, 4);

  return (
    <div className="space-y-12 pb-16">
      
      {/* Toast Notification */}
      {addedToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-slate-900 text-white px-5 py-3 rounded-2xl shadow-2xl flex items-center gap-3 border border-slate-700 animate-bounce">
          <div className="w-7 h-7 rounded-full bg-emerald-500 text-white flex items-center justify-center font-bold">
            <Check className="w-4 h-4" />
          </div>
          <div>
            <p className="text-xs font-bold">زیادکرا بۆ سەبەتە!</p>
            <p className="text-[11px] text-slate-400">{quantity}x {product.title}</p>
          </div>
          <button
            onClick={() => setCartOpen(true)}
            className="text-xs text-orange-400 font-bold hover:underline pr-2"
          >
            سەبەتە ببینە
          </button>
        </div>
      )}

      {/* Main Product Showcase */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs">
        
        {/* Gallery - Left in LTR / Right in RTL */}
        <div className="lg:col-span-6 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl overflow-hidden bg-slate-100 border border-slate-100">
            <img
              src={product.images[selectedImage] || product.images[0]}
              alt={product.title}
              className="w-full h-full object-cover"
            />
            {discountPercent > 0 && (
              <span className="absolute top-4 right-4 bg-rose-600 text-white text-xs font-black px-3 py-1 rounded-xl shadow-md font-latin">
                {discountPercent}% داشکاندن
              </span>
            )}
            <button
              onClick={() => toggleFavoriteProduct(product.id)}
              className={`absolute top-4 left-4 p-2.5 rounded-full backdrop-blur-md transition-colors ${
                isFav ? 'bg-rose-500 text-white shadow-md' : 'bg-white/80 text-slate-700 hover:text-rose-500'
              }`}
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-white' : ''}`} />
            </button>
          </div>

          {/* Thumbnails */}
          {product.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {product.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedImage(idx)}
                  className={`w-20 h-20 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    selectedImage === idx ? 'border-orange-500 ring-2 ring-orange-500/20' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Product Details - Right in LTR / Left in RTL */}
        <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            
            {/* Header info & Category */}
            <div className="flex items-center justify-between gap-2">
              <CategoryBadge category={product.category} />
              {product.stock > 0 ? (
                <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-full">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                  لە کۆگادا ماوە ({product.stock})
                </span>
              ) : (
                <span className="text-xs font-bold text-rose-600 bg-rose-50 px-2.5 py-1 rounded-full">
                  تەواو بووە
                </span>
              )}
            </div>

            <h1 className="text-xl sm:text-2xl font-black text-slate-900 leading-tight">
              {product.title}
            </h1>

            {/* Rating and Reviews Counter */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl">
                <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                <span className="text-xs font-black text-slate-800 font-latin">{product.rating || 4.9}</span>
              </div>
              <span className="text-xs text-slate-500">
                (بەپێی {productReviews.length + (product.reviewCount || 10)} هەڵسەنگاندن)
              </span>
            </div>

            {/* Price Box */}
            <div className="p-4 rounded-2xl bg-orange-50/50 border border-orange-100 flex items-baseline gap-3">
              <span className="text-2xl sm:text-3xl font-black text-orange-600 font-latin">
                {effectivePrice.toLocaleString()} د.ع
              </span>
              {product.discountPrice && (
                <span className="text-sm font-bold text-slate-400 line-through font-latin">
                  {product.price.toLocaleString()} د.ع
                </span>
              )}
            </div>

            {/* Description */}
            <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
              {product.description}
            </p>

            {/* Category Specific Configs */}
            {/* Clothes Sizes */}
            {product.sizes && product.sizes.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">قەبارە هەڵبژێرە:</label>
                <div className="flex flex-wrap gap-2">
                  {product.sizes.map(s => (
                    <button
                      key={s}
                      onClick={() => setSelectedSize(s)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedSize === s
                          ? 'border-orange-500 bg-orange-500 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Clothes Colors */}
            {product.colors && product.colors.length > 0 && (
              <div className="space-y-2 pt-2">
                <label className="text-xs font-bold text-slate-700">ڕەنگ هەڵبژێرە:</label>
                <div className="flex flex-wrap gap-2">
                  {product.colors.map(c => (
                    <button
                      key={c}
                      onClick={() => setSelectedColor(c)}
                      className={`px-3.5 py-1.5 rounded-xl text-xs font-bold border transition-all ${
                        selectedColor === c
                          ? 'border-blue-600 bg-blue-600 text-white shadow-xs'
                          : 'border-slate-200 bg-white text-slate-700 hover:border-slate-300'
                      }`}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Food Ingredients */}
            {product.ingredients && product.ingredients.length > 0 && (
              <div className="space-y-1.5 pt-2">
                <label className="text-xs font-bold text-slate-700">پێکهاتەکان:</label>
                <div className="flex flex-wrap gap-1.5">
                  {product.ingredients.map(ing => (
                    <span key={ing} className="bg-slate-100 text-slate-700 text-[11px] font-semibold px-2.5 py-1 rounded-lg">
                      {ing}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* Electronics Specs */}
            {product.specs && Object.keys(product.specs).length > 0 && (
              <div className="space-y-1.5 pt-2 bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <span className="text-xs font-bold text-slate-800 block mb-1">تایبەتمەندییەکان:</span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  {Object.entries(product.specs).map(([key, val]) => (
                    <div key={key} className="flex justify-between border-b border-slate-200 pb-1">
                      <span className="text-slate-500">{key}:</span>
                      <span className="font-bold text-slate-800 font-latin">{val}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Seller Information Card */}
            {seller && (
              <div
                onClick={() => onNavigate('seller-store', seller.id)}
                className="p-3.5 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/80 flex items-center justify-between transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-3">
                  <img src={seller.logoUrl} alt={seller.storeName} className="w-11 h-11 rounded-xl object-cover" />
                  <div>
                    <h4 className="text-xs font-bold text-slate-900 flex items-center gap-1">
                      <span>{seller.storeName}</span>
                      <ShieldCheck className="w-3.5 h-3.5 text-blue-600" />
                    </h4>
                    <p className="text-[11px] text-slate-500">
                      {seller.city} • {seller.isOpen ? 'کراوەیە ئێستا' : 'داخراوە'}
                      {seller.deliveryZone && (
                        <span className="font-bold text-orange-600 mr-1">
                          (گەیاندن: ٠ - {seller.deliveryZone.maxDistanceKm} کم)
                        </span>
                      )}
                    </p>
                  </div>
                </div>
                <span className="text-xs font-bold text-orange-600">
                  سەردانی فرۆشگا ←
                </span>
              </div>
            )}

          </div>

          {/* Action Bar: Quantity & Buttons */}
          <div className="pt-4 border-t border-slate-100 space-y-3">
            <div className="flex items-center gap-4">
              <span className="text-xs font-bold text-slate-700">ژمارە:</span>
              <div className="flex items-center border border-slate-200 rounded-xl bg-slate-50 overflow-hidden">
                <button
                  onClick={() => setQuantity(Math.max(1, quantity - 1))}
                  className="p-2 text-slate-600 hover:bg-slate-200"
                >
                  <Minus className="w-4 h-4" />
                </button>
                <span className="px-4 text-xs font-bold text-slate-900 font-latin">
                  {quantity}
                </span>
                <button
                  onClick={() => setQuantity(quantity + 1)}
                  className="p-2 text-slate-600 hover:bg-slate-200"
                >
                  <Plus className="w-4 h-4" />
                </button>
              </div>

              <div className="text-right flex-1">
                <span className="text-[11px] text-slate-400 block">کۆی ئەم کاڵایە:</span>
                <span className="text-base font-black text-slate-900 font-latin">
                  {(effectivePrice * quantity).toLocaleString()} د.ع
                </span>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <button
                onClick={handleAddToCart}
                className="py-3.5 px-4 rounded-xl bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <ShoppingCart className="w-4 h-4" />
                <span>زیادکردن بۆ سەبەتە</span>
              </button>

              <button
                onClick={handleInstantBuy}
                className="py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <span>داواکردنی دەستبەجێ</span>
              </button>
            </div>
          </div>

        </div>
      </div>

      {/* Reviews Section */}
      <section className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-bold text-slate-900">هەڵسەنگاندنەکانی کڕیاران ({productReviews.length})</h3>
            <p className="text-xs text-slate-500">ڕای ڕاستەقینەی ئەو بەکارهێنەرانەی کاڵاکەیان کڕیوە</p>
          </div>
          <button
            onClick={() => setShowReviewModal(true)}
            className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-800 text-xs font-bold rounded-xl transition-colors cursor-pointer"
          >
            نووسینی هەڵسەنگاندن
          </button>
        </div>

        {/* Review Form Modal */}
        {showReviewModal && (
          <form onSubmit={handleSubmitReview} className="bg-slate-50 p-4 rounded-2xl border border-slate-200 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-700">ئەستێرە:</span>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(star => (
                  <button
                    type="button"
                    key={star}
                    onClick={() => setNewRating(star)}
                    className="p-1"
                  >
                    <Star className={`w-5 h-5 ${star <= newRating ? 'fill-amber-400 text-amber-400' : 'text-slate-300'}`} />
                  </button>
                ))}
              </div>
            </div>

            <textarea
              value={newComment}
              onChange={(e) => setNewComment(e.target.value)}
              placeholder="ڕا و سەرنجت لەسەر کوالیتی، گەیشتن و خزمەتگوزاری بنووسە..."
              className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:outline-hidden focus:border-orange-500"
              rows={3}
              required
            />

            <div className="flex justify-end gap-2">
              <button
                type="button"
                onClick={() => setShowReviewModal(false)}
                className="px-3.5 py-1.5 text-xs text-slate-600 font-bold"
              >
                پاشگەزبوونەوە
              </button>
              <button
                type="submit"
                className="px-4 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold shadow"
              >
                بڵاوکردنەوەی هەڵسەنگاندن
              </button>
            </div>
          </form>
        )}

        {/* Reviews List */}
        <div className="space-y-3">
          {productReviews.length === 0 ? (
            <p className="text-xs text-slate-400 py-4 text-center">هیچ هەڵسەنگاندنێک بۆ ئەم کاڵایە نییە، یەکەم کەس بە بۆچوونت بنووسیت!</p>
          ) : (
            productReviews.map(rev => (
              <div key={rev.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-100 space-y-1.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-orange-100 text-orange-700 flex items-center justify-center font-bold text-xs">
                      {rev.userName.charAt(0)}
                    </div>
                    <div>
                      <h5 className="text-xs font-bold text-slate-800">{rev.userName}</h5>
                      <span className="text-[10px] text-slate-400">
                        {new Date(rev.createdAt).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                  <div className="flex gap-0.5">
                    {[...Array(rev.rating)].map((_, i) => (
                      <Star key={i} className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    ))}
                  </div>
                </div>
                <p className="text-xs text-slate-600 leading-relaxed">{rev.comment}</p>
              </div>
            ))
          )}
        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-black text-slate-900">کاڵا هاوشێوەکان لەم بەشەدا</h3>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {relatedProducts.map(p => (
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

    </div>
  );
};
