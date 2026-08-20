import React, { useState } from 'react';
import {
  Star,
  MapPin,
  Phone,
  Clock,
  ShieldCheck,
  Search,
  Heart,
  Share2,
  Store,
  Layers,
  Truck,
  Navigation,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { SellerProfile, Product } from '../types';
import { ProductCard } from '../components/cards/ProductCard';
import { CategoryBadge } from '../components/common/Badge';
import { useMarketplace } from '../context/MarketplaceContext';
import { calculateDeliveryFee } from '../utils/deliveryUtils';

interface SellerStoreViewProps {
  sellerId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const SellerStoreView: React.FC<SellerStoreViewProps> = ({
  sellerId,
  onNavigate
}) => {
  const { sellers, products, favoriteSellerIds, toggleFavoriteSeller } = useMarketplace();

  const seller = sellers.find(s => s.id === sellerId) || sellers[0];
  const storeProducts = products.filter(p => p.sellerId === seller?.id);
  const isFav = favoriteSellerIds.includes(seller?.id || '');

  const [search, setSearch] = useState('');
  const [selectedSub, setSelectedSub] = useState<string>('all');
  const [checkDistance, setCheckDistance] = useState<number>(4.0);

  if (!seller) {
    return (
      <div className="text-center py-20">
        <h2 className="text-xl font-bold text-slate-800">فرۆشگاکە نەدۆزرایەوە</h2>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold cursor-pointer"
        >
          گەڕانەوە بۆ سەرەتا
        </button>
      </div>
    );
  }

  // Get unique subcategories for this seller
  const subcategories = Array.from(new Set(storeProducts.map(p => p.subcategory).filter(Boolean))) as string[];

  let filtered = storeProducts;
  if (selectedSub !== 'all') {
    filtered = filtered.filter(p => p.subcategory === selectedSub);
  }
  if (search.trim()) {
    filtered = filtered.filter(p => p.title.toLowerCase().includes(search.toLowerCase()));
  }

  const deliveryZone = seller.deliveryZone;
  const isCar = seller.category === 'cars';

  const checkResult = !isCar ? calculateDeliveryFee({
    seller,
    distanceKm: checkDistance,
    subtotal: 20000
  }) : null;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Cover and Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
        {/* Cover Photo */}
        <div className="relative h-48 sm:h-64 w-full bg-gradient-to-r from-orange-600 to-amber-600 overflow-hidden">
          {seller.coverUrl && (
            <img
              src={seller.coverUrl}
              alt={seller.storeName}
              className="w-full h-full object-cover opacity-85"
            />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-slate-950/90 via-slate-950/40 to-transparent" />
        </div>

        {/* Store Profile Info Overlay */}
        <div className="relative px-6 sm:px-8 pb-6 -mt-16 flex flex-col sm:flex-row items-start sm:items-end justify-between gap-4 text-white">
          <div className="flex items-end gap-4">
            <img
              src={seller.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'}
              alt={seller.storeName}
              className="w-24 h-24 sm:w-28 sm:h-28 rounded-2xl object-cover border-4 border-white shadow-xl bg-white flex-shrink-0"
            />
            <div className="space-y-1.5">
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-black text-white">{seller.storeName}</h1>
                {seller.isVerified && (
                  <ShieldCheck className="w-5 h-5 text-blue-400" />
                )}
              </div>
              <div className="flex flex-wrap items-center gap-2 text-xs text-slate-300">
                <CategoryBadge category={seller.category} />
                <span className="flex items-center gap-1">
                  <MapPin className="w-3.5 h-3.5 text-orange-400" />
                  {seller.city} - {seller.address}
                </span>
                <span>•</span>
                <span className="flex items-center gap-1">
                  <Clock className="w-3.5 h-3.5 text-blue-400" />
                  {seller.openingHours || '09:00 AM - 11:00 PM'}
                </span>
                {!isCar && deliveryZone && (
                  <>
                    <span>•</span>
                    <span className="flex items-center gap-1 text-amber-300 font-bold bg-white/10 px-2 py-0.5 rounded-md">
                      <Truck className="w-3.5 h-3.5" />
                      گەیاندن: ٠ تا {deliveryZone.maxDistanceKm} کم
                    </span>
                  </>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => toggleFavoriteSeller(seller.id)}
              className={`p-2.5 rounded-xl border transition-colors cursor-pointer ${
                isFav
                  ? 'bg-rose-600 border-rose-600 text-white'
                  : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
              }`}
            >
              <Heart className={`w-4 h-4 ${isFav ? 'fill-white' : ''}`} />
            </button>
            <a
              href={`tel:${seller.phone}`}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>پەیوەندی بە فرۆشگا</span>
            </a>
          </div>
        </div>
      </div>

      {/* Description, Store Stats & Delivery Radius Checker */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-4">
        <div className="md:col-span-8 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-3">
          <div>
            <h3 className="text-xs font-bold text-slate-400 mb-1">دەربارەی فرۆشگا</h3>
            <p className="text-xs sm:text-sm text-slate-700 leading-relaxed">
              {seller.description || 'بەخێربێن بۆ فرۆشگاکەمان لە پلاتفۆرمی شاخی. هەموو کاڵاکان بە کوالیتی بەرز و پاکوخاوێنی دابین دەکرێن.'}
            </p>
          </div>

          {/* Delivery Zone Information Banner for non-car stores */}
          {!isCar && deliveryZone && (
            <div className="bg-orange-50/70 border border-orange-200/80 rounded-2xl p-4 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-black text-orange-950 flex items-center gap-1.5">
                  <Navigation className="w-4 h-4 text-orange-600" />
                  سنوری دوری گەیاندنی فرۆشگا:
                </span>
                <span className="text-xs font-black text-orange-700 font-latin bg-white px-2.5 py-0.5 rounded-lg border border-orange-200">
                  لە ٠ کم تا {deliveryZone.maxDistanceKm} کم
                </span>
              </div>
              <p className="text-xs text-orange-900 leading-relaxed">
                {deliveryZone.deliveryAvailabilityNote || `ئەم فرۆشگایە خزمەتگوزاری گەیاندنی خێرا لە ٠ کم تا ${deliveryZone.maxDistanceKm} کم پێشکەش دەکات بە نرخی سەرەتایی ${deliveryZone.baseFee.toLocaleString()} د.ع.`}
              </p>
              {deliveryZone.coveredNeighborhoods && deliveryZone.coveredNeighborhoods.length > 0 && (
                <div className="flex flex-wrap gap-1 pt-1">
                  <span className="text-[11px] font-bold text-orange-800 ml-1">گەڕەکە سەرەکییەکان:</span>
                  {deliveryZone.coveredNeighborhoods.slice(0, 8).map((n, i) => (
                    <span key={i} className="text-[10px] bg-white text-orange-800 px-2 py-0.5 rounded-md border border-orange-200">
                      {n}
                    </span>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>

        <div className="md:col-span-4 bg-white p-5 rounded-2xl border border-slate-200 shadow-xs flex flex-col justify-center space-y-3 text-center">
          <div className="flex items-center justify-center gap-1 text-amber-500">
            <Star className="w-5 h-5 fill-amber-400 text-amber-400" />
            <span className="text-lg font-black text-slate-900 font-latin">{seller.rating}</span>
          </div>
          <span className="text-xs text-slate-500">{seller.totalReviews} هەڵسەنگاندن • {seller.totalSales} داواکاری سەرکەوتوو</span>
          
          {!isCar && deliveryZone && (
            <div className="border-t border-slate-100 pt-2 text-xs space-y-1">
              <div className="flex justify-between text-slate-600">
                <span>نرخی بنەڕەت:</span>
                <span className="font-bold font-latin text-slate-900">{deliveryZone.baseFee.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between text-slate-600">
                <span>کاتی خەمڵێنراو:</span>
                <span className="font-bold font-latin text-slate-900">~{deliveryZone.estimatedMinutesBase} خولەک</span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Product Catalog inside Store */}
      <div className="space-y-4">
        <div className="flex flex-col sm:flex-row gap-3 items-center justify-between">
          <div className="flex items-center gap-2 overflow-x-auto w-full pb-1 scrollbar-none">
            <button
              onClick={() => setSelectedSub('all')}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                selectedSub === 'all'
                  ? 'bg-slate-900 text-white'
                  : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
              }`}
            >
              هەمووی ({storeProducts.length})
            </button>
            {subcategories.map(sub => (
              <button
                key={sub}
                onClick={() => setSelectedSub(sub)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-colors cursor-pointer ${
                  selectedSub === sub
                    ? 'bg-orange-500 text-white'
                    : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
                }`}
              >
                {sub}
              </button>
            ))}
          </div>

          <div className="relative w-full sm:w-64 flex-shrink-0">
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="گەڕان لەم فرۆشگایەدا..."
              className="w-full bg-white border border-slate-200 rounded-xl py-2 pr-8 pl-3 text-xs focus:outline-hidden focus:border-orange-500"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute right-2.5 top-3 pointer-events-none" />
          </div>
        </div>

        {/* Store Products Grid */}
        {filtered.length === 0 ? (
          <div className="p-12 text-center bg-white rounded-3xl border border-slate-200">
            <p className="text-xs text-slate-400">هیچ کاڵایەک لەم بەشەدا نییە.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-4">
            {filtered.map(product => (
              <ProductCard
                key={product.id}
                product={product}
                onNavigate={onNavigate}
              />
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
