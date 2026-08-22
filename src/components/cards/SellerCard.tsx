import React from 'react';
import { Star, MapPin, CheckCircle, Clock } from 'lucide-react';
import { SellerProfile } from '../../types';
import { CategoryBadge } from '../common/Badge';

interface SellerCardProps {
  seller: SellerProfile;
  onClick: () => void;
}

export const SellerCard: React.FC<SellerCardProps> = ({ seller, onClick }) => {
  return (
    <div
      onClick={onClick}
      className="group relative bg-white dark:bg-[#1e293b] rounded-2xl border border-slate-200 dark:border-slate-800 hover:border-[#2563EB] dark:hover:border-blue-500 shadow-xs hover:shadow-sm transition-all duration-200 overflow-hidden flex flex-col cursor-pointer"
    >
      {/* Cover Image */}
      <div className="relative h-28 w-full bg-slate-100 overflow-hidden">
        {seller.coverUrl ? (
          <img
            src={seller.coverUrl}
            alt={seller.storeName}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
          />
        ) : (
          <div className="w-full h-full bg-gradient-to-r from-orange-400 to-amber-500 opacity-80" />
        )}

        <div className="absolute top-2.5 right-2.5">
          <CategoryBadge category={seller.category} />
        </div>

        {seller.isOpen ? (
          <span className="absolute bottom-2 left-2 bg-emerald-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            کراوەیە
          </span>
        ) : (
          <span className="absolute bottom-2 left-2 bg-slate-800 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
            داخراوە
          </span>
        )}
      </div>

      {/* Profile & Info */}
      <div className="p-3.5 pt-0 relative flex-1 flex flex-col justify-between">
        {/* Logo Avatar */}
        <div className="-mt-8 mb-2 flex items-end justify-between">
          <img
            src={seller.logoUrl || 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=200'}
            alt={seller.storeName}
            className="w-15 h-15 rounded-2xl object-cover border-3 border-white shadow-sm bg-white"
          />
          <div className="flex items-center gap-1 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-lg">
            <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
            <span className="text-xs font-bold text-slate-800 font-latin">{seller.rating}</span>
            <span className="text-[10px] text-slate-400 font-latin">({seller.totalReviews})</span>
          </div>
        </div>

        <div>
          <div className="flex items-center gap-1.5 mb-1">
            <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#2563EB] transition-colors">
              {seller.storeName}
            </h3>
            {seller.isVerified && (
              <CheckCircle className="w-3.5 h-3.5 text-[#2563EB] fill-blue-50 flex-shrink-0" />
            )}
          </div>

          <p className="text-xs text-slate-500 line-clamp-2 leading-relaxed mb-3">
            {seller.description}
          </p>
        </div>

        <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
          <div className="flex items-center gap-1.5 truncate">
            <MapPin className="w-3 h-3 text-[#2563EB] flex-shrink-0" />
            <span className="truncate text-xs">{seller.city}</span>
            {seller.category !== 'cars' && seller.deliveryZone && (
              <span className="text-[10px] bg-orange-50 text-orange-700 font-bold px-1.5 py-0.5 rounded font-latin">
                ٠-{seller.deliveryZone.maxDistanceKm} کم
              </span>
            )}
          </div>
          <span className="text-[#F97316] font-bold text-xs hover:underline flex-shrink-0">
            سەردانی فرۆشگا ←
          </span>
        </div>
      </div>
    </div>
  );
};
