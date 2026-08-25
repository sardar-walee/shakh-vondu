import React, { useState, useEffect, useRef } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Gauge,
  Fuel,
  Calendar,
  Heart,
  Share2,
  Eye,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Info,
  Tag,
  Sparkles,
  ShieldCheck,
  Check
} from 'lucide-react';
import { CarAd } from '../../types';
import { CarPackageBadge } from '../common/Badge';
import { CarCountdownTimer } from '../common/CarCountdownTimer';
import { ShareModal } from '../common/ShareModal';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface CarAdCardProps {
  car: CarAd;
  onClick: () => void;
}

export const CarAdCard: React.FC<CarAdCardProps> = ({ car, onClick }) => {
  const isVip = car.packageType === '1_month';
  const isSold = car.adStatus === 'sold';
  const { favoriteProductIds, toggleFavoriteProduct, updateCarAdStatus } = useMarketplace();
  const { currentUser, isSuperAdmin } = useAuth();
  const { t } = useLanguage();

  const isFav = favoriteProductIds.includes(`car-${car.id}`);
  const isOwnerOrAdmin = Boolean(
    currentUser && (currentUser.id === car.userId || currentUser.phone === car.userPhone || isSuperAdmin)
  );

  const [showShareModal, setShowShareModal] = useState(false);
  const [currentImgIndex, setCurrentImgIndex] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const images = car.images && car.images.length > 0
    ? car.images
    : ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'];

  // Auto-scroll images horizontally every 3.5s if not hovered and multiple images exist
  useEffect(() => {
    if (images.length <= 1 || isHovered) return;

    const timer = setInterval(() => {
      setCurrentImgIndex((prev) => (prev + 1) % images.length);
    }, 3500);

    return () => clearInterval(timer);
  }, [images.length, isHovered]);

  const handlePrevImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1));
  };

  const handleNextImage = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImgIndex((prev) => (prev + 1) % images.length);
  };

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
    const msg = encodeURIComponent(`سڵاو، لەسەر ڕیکلامی ئۆتۆمبێلی (${car.title}) لە شاخی ئۆتۆ (Shakh Auto) پەیوەندیت پێوە دەکەم.`);
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

  const handleToggleSold = (e: React.MouseEvent) => {
    e.stopPropagation();
    const nextStatus = isSold ? 'active' : 'sold';
    updateCarAdStatus(car.id, nextStatus);
  };

  return (
    <>
      <div
        onClick={onClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`group relative bg-white dark:bg-slate-800 rounded-3xl border transition-all duration-300 overflow-hidden flex flex-col cursor-pointer ${
          isVip
            ? 'border-amber-300 dark:border-amber-500/50 shadow-md hover:shadow-xl hover:border-amber-400 dark:hover:border-amber-400'
            : 'border-slate-200 dark:border-slate-700 hover:border-blue-500 dark:hover:border-blue-400 shadow-sm hover:shadow-xl'
        }`}
        dir="rtl"
      >
        {/* Photo Container with Horizontal Auto-Slider */}
        <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-900 select-none">
          {/* Images Sliding Strip */}
          <div
            className="flex w-full h-full transition-transform duration-700 ease-out"
            style={{ transform: `translateX(${currentImgIndex * 100}%)` }}
          >
            {images.map((img, idx) => (
              <div key={idx} className="w-full h-full shrink-0 relative">
                <img
                  src={img}
                  alt={`${car.title} - ${idx + 1}`}
                  loading="lazy"
                  className={`w-full h-full object-cover transition-transform duration-500 group-hover:scale-105 ${
                    isSold ? 'grayscale-40 opacity-75' : ''
                  }`}
                />
              </div>
            ))}
          </div>

          {/* Sold Overlay Banner */}
          {isSold && (
            <div className="absolute inset-0 bg-slate-950/60 backdrop-blur-[2px] flex flex-col items-center justify-center z-20 gap-2 p-4 text-center">
              <span className="bg-gradient-to-r from-rose-600 to-red-600 text-white font-black text-xs sm:text-sm px-4 py-2 rounded-2xl shadow-2xl flex items-center gap-2 border border-rose-400/60 transform -rotate-2 animate-bounce">
                <CheckCircle2 className="w-4 h-4" />
                <span>{t('فرۆشراوە')} (SOLD)</span>
              </span>
              <span className="text-[11px] font-bold text-rose-100 bg-black/40 px-3 py-1 rounded-xl">
                پەیوەندی بەپێی یاساکانی شاخی لابرابوو
              </span>
            </div>
          )}

          {/* Slider Prev / Next Arrows (visible on hover) */}
          {images.length > 1 && (
            <>
              <button
                type="button"
                onClick={handlePrevImage}
                className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer backdrop-blur-xs"
                title="وێنەی پێشوو"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
              <button
                type="button"
                onClick={handleNextImage}
                className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 hover:bg-black/80 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity z-10 cursor-pointer backdrop-blur-xs"
                title="وێنەی داهاتوو"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
            </>
          )}

          {/* Slider Dots Indicator */}
          {images.length > 1 && (
            <div className="absolute bottom-2.5 left-1/2 -translate-x-1/2 flex items-center gap-1.5 z-10 bg-black/40 backdrop-blur-xs px-2 py-1 rounded-full pointer-events-none">
              {images.map((_, idx) => (
                <div
                  key={idx}
                  className={`h-1.5 rounded-full transition-all duration-300 ${
                    currentImgIndex === idx ? 'w-4 bg-amber-400' : 'w-1.5 bg-white/60'
                  }`}
                />
              ))}
            </div>
          )}

          {/* Top Right: Badges & Live Countdown Timer */}
          <div className="absolute top-2.5 right-2.5 flex flex-col gap-1.5 z-10">
            {isSold ? (
              <span className="bg-rose-600 text-white font-black text-[11px] px-2.5 py-0.5 rounded-lg border border-rose-500 shadow-md">
                {t('فرۆشراو')}
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
              type="button"
              onClick={handleFav}
              className={`p-2 rounded-2xl backdrop-blur-md transition-all cursor-pointer shadow-md ${
                isFav
                  ? 'bg-rose-500 text-white scale-105 ring-2 ring-white/50'
                  : 'bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-rose-500 hover:bg-white'
              }`}
              aria-label="Favorite car"
            >
              <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-white' : ''}`} />
            </button>

            <button
              type="button"
              onClick={handleShare}
              className="p-2 rounded-2xl bg-white/90 dark:bg-slate-900/90 text-slate-700 dark:text-slate-200 hover:text-blue-500 hover:bg-white backdrop-blur-md transition-colors cursor-pointer shadow-md"
              title="هاوبەشکردنی ئۆتۆمبێل"
            >
              <Share2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Bottom Bar: Location & Views */}
          <div className="absolute bottom-2 right-2 flex items-center gap-1.5 pointer-events-none z-10">
            <div className="bg-slate-950/80 backdrop-blur-md text-white text-[10px] font-bold px-2.5 py-1 rounded-xl flex items-center gap-1 border border-white/10">
              <MapPin className="w-3 h-3 text-amber-400" />
              <span>{car.city}</span>
            </div>
            {car.licensePlateStatus && (
              <div className="bg-slate-950/80 backdrop-blur-md text-slate-200 text-[10px] font-bold px-2 py-1 rounded-xl hidden sm:inline-flex border border-white/10">
                {car.licensePlateStatus.substring(0, 14)}
              </div>
            )}
          </div>
        </div>

        {/* Car Info & Details Body */}
        <div className="p-4 flex-1 flex flex-col justify-between space-y-3">
          <div className="space-y-2">
            {/* Brand, Model Year & Views */}
            <div className="flex items-center justify-between text-xs font-black">
              <div className="flex items-center gap-1.5">
                <span className="bg-blue-50 dark:bg-blue-950/70 text-blue-700 dark:text-blue-300 px-2 py-0.5 rounded-lg border border-blue-200 dark:border-blue-800">
                  {car.brand}
                </span>
                <span className="text-slate-500 dark:text-slate-400 font-latin font-bold">{car.model}</span>
              </div>

              <div className="flex items-center gap-2 text-slate-500 dark:text-slate-400 text-[11px] font-latin">
                <span className="flex items-center gap-0.5">
                  <Eye className="w-3 h-3 text-slate-400" />
                  <span>{views}</span>
                </span>
                <span className="flex items-center gap-0.5 text-rose-500">
                  <Heart className={`w-3 h-3 ${isFav ? 'fill-rose-500' : ''}`} />
                  <span>{likes}</span>
                </span>
              </div>
            </div>

            {/* Title */}
            <h3 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100 line-clamp-1 group-hover:text-blue-600 dark:group-hover:text-blue-400 transition-colors">
              {car.title}
            </h3>

            {/* Quick Technical Specs Grid */}
            <div className="grid grid-cols-3 gap-1.5 p-2 bg-slate-50 dark:bg-slate-900/60 rounded-2xl border border-slate-100 dark:border-slate-700/60 text-[11px]">
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                <Calendar className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                <span className="font-latin">{car.year}</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                <Gauge className="w-3.5 h-3.5 text-blue-500 shrink-0" />
                <span className="truncate font-latin">{car.mileageKm.toLocaleString()} کم</span>
              </div>
              <div className="flex items-center gap-1 text-slate-700 dark:text-slate-300 font-bold">
                <Fuel className="w-3.5 h-3.5 text-emerald-500 shrink-0" />
                <span className="truncate capitalize">{car.fuelType === 'gasoline' ? 'بەنزین' : car.fuelType}</span>
              </div>
            </div>
          </div>

          {/* Pricing & Actions Section */}
          <div className="pt-2 border-t border-slate-100 dark:border-slate-700/80 space-y-2.5">
            {/* Price Tag */}
            <div className="flex items-baseline justify-between">
              <div>
                <span className="text-base sm:text-lg font-black text-amber-600 dark:text-amber-400 font-latin block leading-none">
                  {car.priceIqd.toLocaleString()} د.ع
                </span>
                {car.priceUsd && (
                  <span className="text-xs font-bold text-slate-500 dark:text-slate-400 font-latin">
                    ≈ ${car.priceUsd.toLocaleString()} USD
                  </span>
                )}
              </div>

              {/* Owner / Admin Sold Toggle Quick Button */}
              {isOwnerOrAdmin && (
                <button
                  type="button"
                  onClick={handleToggleSold}
                  className={`px-3 py-1.5 rounded-xl text-[11px] font-black flex items-center gap-1 transition-all cursor-pointer shadow-xs ${
                    isSold
                      ? 'bg-blue-600 hover:bg-blue-700 text-white'
                      : 'bg-rose-500 hover:bg-rose-600 text-white'
                  }`}
                  title={isSold ? 'چالاککردنەوەی ڕیکلام' : 'دیاریکردنی ئۆتۆمبێل وەک فرۆشراو'}
                >
                  <Tag className="w-3.5 h-3.5" />
                  <span>{isSold ? 'چالاککردنەوە' : 'فرۆشرا'}</span>
                </button>
              )}
            </div>

            {/* Buttons Row: More Info + Contact / Whatsapp */}
            {isSold ? (
              <div className="space-y-1.5">
                <div className="w-full py-2 bg-rose-50 dark:bg-rose-950/60 text-rose-700 dark:text-rose-300 text-xs font-black text-center rounded-2xl border border-rose-200 dark:border-rose-800 flex items-center justify-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-rose-500" />
                  <span>ئەم ئۆتۆمبێلە بە سەرکەوتوویی فرۆشرا</span>
                </div>

                <button
                  type="button"
                  onClick={onClick}
                  className="w-full py-2 bg-slate-100 dark:bg-slate-700 hover:bg-slate-200 dark:hover:bg-slate-600 text-slate-800 dark:text-slate-100 text-xs font-black rounded-2xl transition-colors flex items-center justify-center gap-1.5 cursor-pointer"
                >
                  <Info className="w-4 h-4 text-blue-500" />
                  <span>زانیاری زیاتر (More Details)</span>
                </button>
              </div>
            ) : (
              <div className="space-y-1.5">
                {/* Main Action: More Info Button */}
                <button
                  type="button"
                  onClick={onClick}
                  className="w-full py-2.5 bg-gradient-to-r from-slate-900 to-slate-800 dark:from-slate-700 dark:to-slate-600 hover:from-blue-600 hover:to-blue-700 dark:hover:from-blue-600 dark:hover:to-blue-700 text-white text-xs font-black rounded-2xl shadow-sm transition-all flex items-center justify-center gap-1.5 cursor-pointer active:scale-98"
                >
                  <Eye className="w-4 h-4 text-amber-400" />
                  <span>زانیاری زیاتر و بینینی وردەکاری (Details)</span>
                </button>

                {/* Whatsapp & Call Buttons */}
                <div className="grid grid-cols-2 gap-1.5">
                  <button
                    type="button"
                    onClick={handleWhatsapp}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/50 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 text-emerald-700 dark:text-emerald-300 border border-emerald-200 dark:border-emerald-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <MessageCircle className="w-3.5 h-3.5 text-emerald-500" />
                    <span>{t('واتسئەپ')}</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleCall}
                    className="flex items-center justify-center gap-1 py-2 px-2 rounded-xl bg-blue-50 dark:bg-blue-950/50 hover:bg-blue-100 dark:hover:bg-blue-900/60 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-800 text-xs font-bold transition-colors cursor-pointer"
                  >
                    <Phone className="w-3.5 h-3.5 text-blue-500" />
                    <span>{t('پەیوەندی')}</span>
                  </button>
                </div>
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
        description={`ئۆتۆمبێلی ${car.title} (${car.year}) بە نرخی ${car.priceIqd.toLocaleString()} د.ع لە شاخی ئۆتۆ`}
        url={`${window.location.origin}/#car-${car.id}`}
        image={images[0]}
      />
    </>
  );
};
