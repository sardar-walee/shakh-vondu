import React, { useState, useEffect } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  ShieldCheck,
  CheckCircle,
  CheckCircle2,
  Share2,
  Clock,
  Sparkles,
  Car,
  Check,
  AlertCircle,
  Heart,
  Eye,
  Tag,
  Trash2,
  ChevronLeft,
  ChevronRight,
  FileCheck2,
  FileClock,
  ArrowRight
} from 'lucide-react';
import { CarPackageBadge } from '../components/common/Badge';
import { CarCountdownTimer } from '../components/common/CarCountdownTimer';
import { ShareModal, SocialShareBar } from '../components/common/ShareModal';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { CarAd } from '../types';

interface CarDetailViewProps {
  carId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const CarDetailView: React.FC<CarDetailViewProps> = ({ carId, onNavigate }) => {
  const { carAds, favoriteProductIds, toggleFavoriteProduct, updateCarAdStatus, deleteCarAd, approveCarAd } = useMarketplace();
  const { currentUser, isSuperAdmin } = useAuth();
  const car = carAds.find(c => c.id === carId) || carAds[0];

  const isFav = favoriteProductIds.includes(`car-${car?.id}`);
  const isSold = car?.adStatus === 'sold';
  const isPending = car?.adStatus === 'pending_payment' || car?.adminApprovalStatus === 'pending';
  const isOwnerOrAdmin = Boolean(
    currentUser && (currentUser.id === car?.userId || currentUser.phone === car?.userPhone || isSuperAdmin)
  );

  const [activeImage, setActiveImage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);
  const [isAutoPlaying, setIsAutoPlaying] = useState(true);

  const images = car?.images && car.images.length > 0
    ? car.images
    : ['https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'];

  // Auto slideshow for gallery
  useEffect(() => {
    if (images.length <= 1 || !isAutoPlaying) return;
    const timer = setInterval(() => {
      setActiveImage((prev) => (prev + 1) % images.length);
    }, 4000);
    return () => clearInterval(timer);
  }, [images.length, isAutoPlaying]);

  const handleDelete = async () => {
    if (!car) return;
    if (window.confirm(`ئایا دڵنیایت لە سڕینەوەی بەردەوامی ڕیکلامی ئۆتۆمبێلی "${car.title}"؟`)) {
      await deleteCarAd(car.id);
      onNavigate('car-marketplace');
    }
  };

  if (!car) {
    return (
      <div className="text-center py-20 bg-white dark:bg-slate-800 rounded-3xl border border-slate-200 dark:border-slate-700 p-8 space-y-4" dir="rtl">
        <Car className="w-12 h-12 text-slate-400 mx-auto" />
        <h2 className="text-xl font-black text-slate-800 dark:text-slate-100">ئۆتۆمبێلەکە نەدۆزرایەوە</h2>
        <button
          type="button"
          onClick={() => onNavigate('car-marketplace')}
          className="mt-4 px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white rounded-2xl text-xs font-black cursor-pointer shadow-md"
        >
          گەڕانەوە بۆ بازاڕی ئۆتۆمبێل
        </button>
      </div>
    );
  }

  const views = (car.viewsCount || 340) + 1;
  const likes = (car.likesCount || 24) + (isFav ? 1 : 0);

  const handleCall = () => {
    if (isSold) return;
    window.location.href = `tel:${car.userPhone}`;
  };

  const handleWhatsapp = () => {
    if (isSold) return;
    const cleanPhone = car.userPhone.replace(/^0/, '964').replace(/\D/g, '');
    const msg = encodeURIComponent(`سڵاو، لەسەر ڕیکلامی ئۆتۆمبێلی (${car.title}) پەیوەندیت پێوە دەکەم لە (شاخ) ئۆتۆ.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleFav = () => {
    toggleFavoriteProduct(`car-${car.id}`);
  };

  const handleToggleSold = () => {
    const nextStatus = isSold ? 'active' : 'sold';
    updateCarAdStatus(car.id, nextStatus);
  };

  const handleQuickApprove = async () => {
    await approveCarAd(car.id);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20 text-right" dir="rtl">
      
      {/* Back button */}
      <div>
        <button
          type="button"
          onClick={() => onNavigate('car-marketplace')}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-2xl bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 text-xs font-black hover:bg-slate-50 dark:hover:bg-slate-700 cursor-pointer shadow-xs transition-colors"
        >
          <ArrowRight className="w-4 h-4" />
          <span>گەڕانەوە بۆ پێشانگای ئۆتۆمبێل (Shakh Auto)</span>
        </button>
      </div>

      {/* Pending Approval Top Banner */}
      {isPending && (
        <div className="bg-gradient-to-r from-amber-500 to-orange-500 text-white p-4 sm:p-5 rounded-3xl shadow-lg flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <FileClock className="w-6 h-6 text-white animate-pulse" />
            </div>
            <div>
              <h3 className="text-sm sm:text-base font-black">ئەم ڕیکلامە لە چاوەڕوانی تەسدیقکردنی پارەدانە ⏳</h3>
              <p className="text-xs text-amber-100 mt-0.5">
                بەڵگەی وەسڵی پارەدان نێردراوە بۆ سوپەر ئەدمین. دوای پێداچوونەوە و پەسەندکردن دەستبەجێ بە گشتی بڵاودەبێتەوە.
              </p>
            </div>
          </div>

          {isSuperAdmin && (
            <button
              type="button"
              onClick={handleQuickApprove}
              className="px-4 py-2 bg-slate-900 hover:bg-black text-white rounded-xl text-xs font-black shadow-md cursor-pointer whitespace-nowrap flex items-center gap-1.5"
            >
              <FileCheck2 className="w-4 h-4 text-emerald-400" />
              <span>پەسەندکردنی دەستبەجێ لەلایەن سوپەر ئەدمین</span>
            </button>
          )}
        </div>
      )}

      {/* Sold Status Top Alert Banner */}
      {isSold && (
        <div className="bg-gradient-to-r from-rose-600 to-rose-700 text-white p-4 sm:p-5 rounded-3xl shadow-lg border border-rose-500 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-white/20 rounded-2xl">
              <CheckCircle2 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h3 className="text-base font-black">ئەم ئۆتۆمبێلە فرۆشراوە (SOLD)</h3>
              <p className="text-xs text-rose-100 mt-0.5">
                زانیاری پەیوەندی و تەلەفۆنی فرۆشیار بەپێی یاساکانی (شاخ) لابرابوو تاوەکو ناڕەحەتی بۆ فرۆشیار دروست نەبێت.
              </p>
            </div>
          </div>

          {isOwnerOrAdmin && (
            <button
              type="button"
              onClick={handleToggleSold}
              className="px-4 py-2 bg-white text-rose-700 rounded-xl text-xs font-black hover:bg-rose-50 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              چالاککردنەوەی دووبارەی ڕیکلام
            </button>
          )}
        </div>
      )}

      {/* Owner / Admin Quick Toggle if active */}
      {isOwnerOrAdmin && !isPending && (
        <div className="bg-amber-50 dark:bg-amber-950/50 border border-amber-200 dark:border-amber-800 p-4 rounded-2xl flex flex-wrap items-center justify-between gap-3 text-xs">
          <span className="font-black text-amber-900 dark:text-amber-200">
            تۆ خاوەنی ئەم ڕیکلامەی (خاوەن / ئەدمین). دەتوانیت دۆخەکەی بگۆڕیت یان ڕیکلامەکە بسڕیتەوە:
          </span>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleToggleSold}
              className={`px-4 py-2 font-black rounded-xl cursor-pointer shadow-xs transition-transform active:scale-95 flex items-center gap-1.5 ${
                isSold
                  ? 'bg-blue-600 hover:bg-blue-700 text-white'
                  : 'bg-emerald-600 hover:bg-emerald-700 text-white'
              }`}
            >
              <Tag className="w-4 h-4" />
              <span>{isSold ? 'چالاککردنەوە وەک بەردەست' : 'دیاریکردن وەک (فرۆشرا)'}</span>
            </button>

            <button
              type="button"
              onClick={handleDelete}
              className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white font-black rounded-xl cursor-pointer shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
            >
              <Trash2 className="w-4 h-4" />
              <span>سڕینەوەی ڕیکلام</span>
            </button>
          </div>
        </div>
      )}
      
      {/* Top Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white dark:bg-slate-800 p-5 sm:p-6 rounded-3xl border border-slate-200 dark:border-slate-700 shadow-sm">
        <div className="space-y-1.5">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-xs font-black text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-950/70 border border-blue-200 dark:border-blue-800 px-2.5 py-1 rounded-xl">
              {car.brand}
            </span>
            <span className="text-xs font-black text-slate-700 dark:text-slate-300 bg-slate-100 dark:bg-slate-700 px-2.5 py-1 rounded-xl font-latin">
              {car.year}
            </span>
            <CarPackageBadge packageType={car.packageType} />
            <div className="flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400 font-latin pr-2">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-400" />
                <span>{views} بینراو</span>
              </span>
              <span className="flex items-center gap-1 text-rose-500">
                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500' : ''}`} />
                <span>{likes} لایک</span>
              </span>
            </div>
          </div>

          <h1 className="text-lg sm:text-2xl font-black text-slate-900 dark:text-slate-100">{car.title}</h1>
          
          <p className="text-xs font-bold text-slate-500 dark:text-slate-400 flex items-center gap-1">
            <MapPin className="w-3.5 h-3.5 text-amber-500" />
            <span>{car.city} - {car.locationDetails || 'کوردستان'}</span>
          </p>
        </div>

        {/* Pricing & Share/Like Buttons */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={handleFav}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isFav
                  ? 'bg-rose-50 dark:bg-rose-950/60 border-rose-200 dark:border-rose-800 text-rose-600 shadow-xs'
                  : 'bg-slate-50 dark:bg-slate-700 border-slate-200 dark:border-slate-600 text-slate-600 dark:text-slate-300 hover:text-rose-600'
              }`}
              title="زیادکردن بۆ دڵخوازەکان"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              type="button"
              onClick={() => setShowShareModal(true)}
              className="flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-50 dark:bg-slate-700 border border-slate-200 dark:border-slate-600 text-slate-800 dark:text-slate-200 hover:text-blue-500 transition-colors cursor-pointer text-xs font-black shadow-xs"
              title="هاوبەشکردنی ڕیکلام لە سۆشیاڵ میدیا"
            >
              <Share2 className="w-4 h-4 text-blue-500" />
              <span className="hidden sm:inline">هاوبەشکردن</span>
            </button>
          </div>

          <div className="bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 p-3.5 rounded-2xl text-left flex flex-col items-end">
            <span className="text-[11px] text-slate-500 dark:text-slate-400 font-bold">نرخی داواکراو:</span>
            <span className="text-xl sm:text-2xl font-black text-amber-600 dark:text-amber-400 font-latin">
              {car.priceIqd.toLocaleString()} د.ع
            </span>
            {car.priceUsd && (
              <span className="text-xs font-bold text-slate-600 dark:text-slate-300 font-latin">
                ≈ ${car.priceUsd.toLocaleString()} USD
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Countdown Timer Banner */}
      <CarCountdownTimer car={car} />

      {/* Photo Gallery & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Photos - 8 cols */}
        <div
          className="lg:col-span-8 space-y-4"
          onMouseEnter={() => setIsAutoPlaying(false)}
          onMouseLeave={() => setIsAutoPlaying(true)}
        >
          <div className="relative aspect-16/10 w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 dark:border-slate-700 shadow-md">
            <img
              src={images[activeImage] || images[0]}
              alt={car.title}
              className="w-full h-full object-cover transition-all duration-300"
            />

            {/* Next / Prev Buttons */}
            {images.length > 1 && (
              <>
                <button
                  type="button"
                  onClick={() => setActiveImage((prev) => (prev === 0 ? images.length - 1 : prev - 1))}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer backdrop-blur-xs transition-colors shadow-lg z-10"
                >
                  <ChevronRight className="w-5 h-5" />
                </button>
                <button
                  type="button"
                  onClick={() => setActiveImage((prev) => (prev + 1) % images.length)}
                  className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/60 hover:bg-black/90 text-white flex items-center justify-center cursor-pointer backdrop-blur-xs transition-colors shadow-lg z-10"
                >
                  <ChevronLeft className="w-5 h-5" />
                </button>
              </>
            )}

            <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-xl border border-white/10">
              وێنەی {activeImage + 1} لە {images.length}
            </div>
          </div>

          {/* Thumbnails */}
          {images.length > 1 && (
            <div className="flex gap-2.5 overflow-x-auto pb-1">
              {images.map((img, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => setActiveImage(idx)}
                  className={`w-20 h-14 sm:w-24 sm:h-16 rounded-2xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                    activeImage === idx
                      ? 'border-amber-500 ring-2 ring-amber-500/30 scale-105'
                      : 'border-slate-200 dark:border-slate-700 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 space-y-3 shadow-xs">
            <h3 className="text-base font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
              <Sparkles className="w-4 h-4 text-amber-500" />
              <span>وەسف و تێبینییەکانی فرۆشیار:</span>
            </h3>
            <p className="text-xs sm:text-sm text-slate-700 dark:text-slate-300 leading-relaxed whitespace-pre-line font-bold">
              {car.description || 'ئەم ئۆتۆمبێلە بە تەواوی مواسەفاتەوە بەردەستە و بە بێ کێشە دەفرۆشرێت.'}
            </p>
          </div>
        </div>

        {/* Specifications & Seller Contact - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Specs Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100 border-b border-slate-100 dark:border-slate-700 pb-2 flex items-center gap-2">
              <Car className="w-4 h-4 text-amber-500" />
              <span>تایبەتمەندییە تەکنیکییەکان</span>
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-bold">کۆمپانیا / براند:</span>
                <span className="font-black text-slate-900 dark:text-slate-100">{car.brand}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-bold">مۆدێل:</span>
                <span className="font-black text-slate-900 dark:text-slate-100">{car.model}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-bold">ساڵی دروستکردن:</span>
                <span className="font-black text-slate-900 dark:text-slate-100 font-latin">{car.year}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-bold">ڕۆیشتن (کیلۆمەتر):</span>
                <span className="font-black text-slate-900 dark:text-slate-100 font-latin">{car.mileageKm.toLocaleString()} کم</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-bold">گێڕ:</span>
                <span className="font-black text-slate-900 dark:text-slate-100">
                  {car.transmission === 'automatic' ? 'ئۆتۆماتیک' : 'عادی (مانوێل)'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-bold">جۆری سوتەمەنی:</span>
                <span className="font-black text-slate-900 dark:text-slate-100 capitalize">
                  {car.fuelType === 'gasoline' ? 'بەنزین' : car.fuelType}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-bold">ڕەنگ:</span>
                <span className="font-black text-slate-900 dark:text-slate-100">{car.color}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-100 dark:border-slate-700/60">
                <span className="text-slate-500 dark:text-slate-400 font-bold">دۆخی تەقەڵ / لێدران:</span>
                <span className="font-black text-slate-900 dark:text-slate-100">{car.damageStatus || 'بێ لێدران و بۆیاخ'}</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500 dark:text-slate-400 font-bold">تابلۆ:</span>
                <span className="font-black text-slate-900 dark:text-slate-100">{car.licensePlateStatus || 'تەواوە و نوێکراوەتەوە'}</span>
              </div>
            </div>
          </div>

          {/* Seller Contact Box */}
          <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md space-y-4 border border-slate-700">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black text-lg">
                {car.userName.charAt(0)}
              </div>
              <div>
                <h4 className="font-black text-sm text-white">{car.userName}</h4>
                <p dir="ltr" style={{ unicodeBidi: 'isolate', direction: 'ltr' }} className="text-xs text-slate-300 font-latin inline-block text-left font-bold">
                  {isSold ? '******** (فرۆشراوە)' : car.userPhone}
                </p>
              </div>
            </div>

            {isSold ? (
              <div className="bg-rose-950/80 border border-rose-500/40 p-4 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-rose-400 mx-auto" />
                <h4 className="font-black text-sm text-white">ئەم ئۆتۆمبێلە فرۆشراوە (SOLD)</h4>
                <p className="text-xs text-rose-200 leading-relaxed font-bold">
                  زانیاری پەیوەندی و تەلەفۆنی فرۆشیار بەپێی یاساکانی پلاتفۆرمی شاخ لابرابوو.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                <button
                  type="button"
                  onClick={handleWhatsapp}
                  className="w-full py-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>نامە ناردن لە واتسئەپ</span>
                </button>

                <button
                  type="button"
                  onClick={handleCall}
                  className="w-full py-3 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white font-black text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>پەیوەندی ڕاستەوخۆ بە تەلەفۆن</span>
                </button>
              </div>
            )}

            <div className="pt-2 text-[11px] text-slate-400 text-center font-bold">
              (شاخ) بەرپرس نییە لە گرێبەستی کڕین و فرۆشتنی نێوان کڕیار و فرۆشیار.
            </div>
          </div>

          {/* Social Share Card */}
          <div className="bg-white dark:bg-slate-800 rounded-3xl p-5 border border-slate-200 dark:border-slate-700 shadow-xs space-y-3">
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5 border-b border-slate-100 dark:border-slate-700 pb-2">
              <Share2 className="w-3.5 h-3.5 text-blue-500" />
              <span>هاوبەشکردنی ئەم ئۆتۆمبێلە (Social Share)</span>
            </h4>
            <SocialShareBar
              title={car.title}
              description={`ئۆتۆمبێلی ${car.title} (${car.year}) بە نرخی ${car.priceIqd.toLocaleString()} د.ع لە (شاخ) ئۆتۆ`}
              url={`${window.location.origin}/#car-${car.id}`}
              onOpenModal={() => setShowShareModal(true)}
            />
          </div>

        </div>

      </div>

      {/* Share Modal */}
      <ShareModal
        isOpen={showShareModal}
        onClose={() => setShowShareModal(false)}
        title={car.title}
        description={`ئۆتۆمبێلی ${car.title} (${car.year}) بە نرخی ${car.priceIqd.toLocaleString()} د.ع لە (شاخ) ئۆتۆ`}
        url={`${window.location.origin}/#car-${car.id}`}
        image={images[0]}
      />

    </div>
  );
};
