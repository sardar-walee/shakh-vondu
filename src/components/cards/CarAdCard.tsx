import React, { useState } from 'react';
import { Phone, MessageCircle, MapPin, Gauge, Fuel, Calendar, Heart, Share2, Eye, CheckCircle2 } from 'lucide-react';
import { CarAd } from '../../types';
import { CarPackageBadge } from '../common/Badge';
import { CarCountdownTimer } from '../common/CarCountdownTimer';
import { ShareModal } from '../common/ShareModal';
import { useMarketplace } from '../../context/MarketplaceContext';

interface CarAdCardProps {
  car: CarAd;
  onClick: () => void;
}

export const CarAdCard: React.FC<CarAdCardProps> = ({ car, onClick }) => {
  const isVip = car.packageType === '1_month';
  const isSold = car.adStatus === 'sold';
  const { favoriteProductIds, toggleFavoriteProduct } = useMarketplace();
  const isFav = favoriteProductIds.includes(`car-${car.id}`);
  const [showShareModal, setShowShareModal] = useState(false);

  const views = car.viewsCount || Math.floor(250 + (car.title.length * 43) % 1200);
  const likes = (car.likesCount || Math.floor(15 + (car.title.length * 8) % 80)) + (isFav ? 1 : 0);

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSold) return;
    window.location.href = `tel:${car.userPhone}`;
  };

  const handleWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (isSold) return;
    const cleanPhone = car.userPhone.replace(/^0/, '964').replace(/\D/g, '');
    const msg = encodeURIComponent(`سڵاو، دەمەوێت پەیوەندی بکەم لەسەر ئۆتۆمبێلی (${car.title}) لە پلاتفۆرمی شاخ.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleFav = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavoriteProduct(`car-${car.id}`);
  };

  const handleShare = (e: React.MouseEvent) => {
    e.stopPropagation();
    setShowShareModal(true);
  };

  return (
    <>
      <div
        onClick={onClick}
        className={`group relative bg-white dark:bg-[#1e293b] rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col cursor-pointer ${
          isVip
            ? 'border-amber-300 dark:border-amber-500/50 shadow-xs hover:shadow-md hover:border-amber-400'
            : 'border-slate-200 dark:border-slate-800 hover:border-[#2563EB] dark:hover:border-blue-500 shadow-xs hover:shadow-md'
        }`}
        dir="rtl"
      >
        {/* Photo Container */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
          <img
            src={car.images[0]}
            alt={car.title}
            loading="lazy"
            className={`w-full h-full object-cover group-hover:scale-105 transition-transform duration-300 ${isSold ? 'grayscale-30 opacity-80' : ''}`}
          />

          {/* Sold Overlay Banner */}
          {isSold && (
            <div className="absolute inset-0 bg-slate-950/40 backdrop-blur-[2px] flex items-center justify-center z-20">
              <span className="bg-rose-600 text-white font-black text-xs sm:text-sm px-4 py-1.5 rounded-2xl shadow-xl flex items-center gap-1.5 border border-rose-400/50 transform -rotate-3 animate-pulse">
                <CheckCircle2 className="w-4 h-4" />
                <span>فرۆشرا (SOLD)</span>
              </span>
            </div>
          )}

          {/* Top Right: Badges & Live Countdown Timer */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            {isSold ? (
              <span className="bg-rose-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-lg border border-rose-500 shadow-xs">
                فرۆشرا
              </span>
            ) : (
              <>
                <CarPackageBadge packageType={car.packageType} />
                <CarCountdownTimer car={car} compact={true} />
              </>
            )}
          </div>

          {/* Top Left: Like and Share buttons */}
          <div className="absolute top-2.5 left-2.5 flex flex-col gap-1.5 z-10">
            <button
              onClick={handleFav}
              className={`p-2 rounded-full backdrop-blur-md transition-all cursor-pointer ${
                isFav
                  ? 'bg-rose-500 text-white shadow-md scale-110'
                  : 'bg-white/85 text-slate-600 hover:text-rose-500 hover:bg-white'
              }`}
              aria-label="Favorite car"
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
            </button>

            <button
              onClick={handleShare}
              className="p-2 rounded-full bg-white/85 text-slate-600 hover:text-[#2563EB] hover:bg-white backdrop-blur-md transition-colors cursor-pointer"
              title="هاوبەشکردنی ئۆتۆمبێل"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Bar: Location & Views */}
          <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between pointer-events-none">
            <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
              <MapPin className="w-3 h-3 text-[#F97316]" />
              <span>{car.city}</span>
            </div>

            <div className="bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md flex items-center gap-1">
              <Eye className="w-3 h-3 text-slate-300" />
              <span className="font-latin">{views}</span>
            </div>
          </div>
        </div>

        {/* Car Info */}
        <div className="p-3.5 flex-1 flex flex-col justify-between">
          <div>
            {/* Brand & Model & Likes */}
            <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
              <span>{car.brand}</span>
              <div className="flex items-center gap-1 text-slate-400">
                <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500 text-rose-500' : ''}`} />
                <span className="font-latin">{likes}</span>
              </div>
            </div>

            <h3 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1 group-hover:text-[#2563EB] transition-colors">
              {car.title}
            </h3>

            {/* Quick Specs Pill Row */}
            <div className="grid grid-cols-3 gap-1 my-2 py-1.5 border-y border-slate-100 text-[10px] sm:text-[11px] text-slate-600">
              <div className="flex items-center gap-1">
                <Calendar className="w-3 h-3 text-slate-400" />
                <span>{car.year}</span>
              </div>
              <div className="flex items-center gap-1">
                <Gauge className="w-3 h-3 text-slate-400" />
                <span className="truncate font-latin">{car.mileageKm.toLocaleString()} کم</span>
              </div>
              <div className="flex items-center gap-1">
                <Fuel className="w-3 h-3 text-slate-400" />
                <span className="capitalize">{car.fuelType === 'gasoline' ? 'بەنزین' : car.fuelType}</span>
              </div>
            </div>
          </div>

          {/* Price & Contact Buttons */}
          <div className="pt-1">
            <div className="flex items-baseline justify-between mb-2.5">
              <div className="flex flex-col">
                <span className="text-sm sm:text-base font-black text-[#F97316] font-latin">
                  {car.priceIqd.toLocaleString()} د.ع
                </span>
                {car.priceUsd && (
                  <span className="text-[11px] font-bold text-slate-500 font-latin">
                    ${car.priceUsd.toLocaleString()} USD
                  </span>
                )}
              </div>
            </div>

            {isSold ? (
              <div className="w-full py-2 bg-rose-50 text-rose-700 text-[11px] font-black text-center rounded-xl border border-rose-200">
                فرۆشراوە (زانیاری پەیوەندی لابرابوو)
              </div>
            ) : (
              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={handleWhatsapp}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition-colors cursor-pointer"
                >
                  <MessageCircle className="w-3.5 h-3.5" />
                  <span>واتسئەپ</span>
                </button>

                <button
                  onClick={handleCall}
                  className="flex items-center justify-center gap-1 py-1.5 px-2 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-colors cursor-pointer"
                >
                  <Phone className="w-3.5 h-3.5" />
                  <span>پەیوەندی</span>
                </button>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={car.title}
        description={`ئۆتۆمبێلی ${car.title} (${car.year}) بە نرخی ${car.priceIqd.toLocaleString()} د.ع لە شاخ`}
        url={`${window.location.origin}/#car-${car.id}`}
        image={car.images[0]}
      />
    </>
  );
};
