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
  Tag
} from 'lucide-react';
import { CarPackageBadge } from '../components/common/Badge';
import { CarCountdownTimer } from '../components/common/CarCountdownTimer';
import { ShareModal } from '../components/common/ShareModal';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { CarAd } from '../types';

interface CarDetailViewProps {
  carId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const CarDetailView: React.FC<CarDetailViewProps> = ({ carId, onNavigate }) => {
  const { carAds, favoriteProductIds, toggleFavoriteProduct, updateCarAdStatus } = useMarketplace();
  const { currentUser, isSuperAdmin } = useAuth();
  const car = carAds.find(c => c.id === carId) || carAds[0];

  const isFav = favoriteProductIds.includes(`car-${car?.id}`);
  const isSold = car?.adStatus === 'sold';
  const isOwnerOrAdmin = currentUser && (currentUser.id === car?.userId || isSuperAdmin);

  const [activeImage, setActiveImage] = useState(0);
  const [showShareModal, setShowShareModal] = useState(false);

  if (!car) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8" dir="rtl">
        <h2 className="text-xl font-bold text-slate-800">ئۆتۆمبێلەکە نەدۆزرایەوە</h2>
        <button
          onClick={() => onNavigate('car-marketplace')}
          className="mt-4 px-6 py-2.5 bg-[#2563EB] text-white rounded-xl text-xs font-bold cursor-pointer"
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
    const msg = encodeURIComponent(`سڵاو، لەسەر ڕیکلامی ئۆتۆمبێلی (${car.title}) پەیوەندیت پێوە دەکەم لە پلاتفۆرمی شاخ.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  const handleFav = () => {
    toggleFavoriteProduct(`car-${car.id}`);
  };

  const handleToggleSold = () => {
    const nextStatus = isSold ? 'active' : 'sold';
    updateCarAdStatus(car.id, nextStatus);
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-20" dir="rtl">
      
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
                زانیاری پەیوەندی و تەلەفۆنی فرۆشیار بەپێی یاساکانی شاخ لابرابوو تاوەکو ناڕەحەتی بۆ فرۆشیار دروست نەبێت.
              </p>
            </div>
          </div>

          {isOwnerOrAdmin && (
            <button
              onClick={handleToggleSold}
              className="px-4 py-2 bg-white text-rose-700 rounded-xl text-xs font-black hover:bg-rose-50 transition-colors shadow-xs cursor-pointer whitespace-nowrap"
            >
              چالاککردنەوەی دووبارەی ڕیکلام
            </button>
          )}
        </div>
      )}

      {/* Owner / Admin Quick Toggle if active */}
      {isOwnerOrAdmin && !isSold && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between text-xs">
          <span className="font-bold text-amber-900">تۆ بەکارهێنەری ئەم ڕیکلامەی، ئایا ئۆتۆمبێلەکەت فرۆشتووە؟</span>
          <button
            onClick={handleToggleSold}
            className="px-4 py-2 bg-rose-600 hover:bg-rose-700 text-white font-black rounded-xl cursor-pointer shadow-xs transition-transform active:scale-95 flex items-center gap-1.5"
          >
            <Tag className="w-4 h-4" />
            <span>دیاریکردن وەک (فرۆشرا)</span>
          </button>
        </div>
      )}
      
      {/* Top Header with Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 text-right bg-white p-5 rounded-3xl border border-slate-200/80 shadow-xs">
        <div>
          <div className="flex flex-wrap items-center gap-2 mb-1.5">
            <span className="text-xs font-black text-[#2563EB] bg-blue-50 px-2.5 py-1 rounded-lg">
              {car.brand}
            </span>
            <span className="text-xs font-bold text-slate-500 font-latin">{car.year}</span>
            <CarPackageBadge packageType={car.packageType} />
            <div className="flex items-center gap-3 text-xs text-slate-400 font-latin pr-2">
              <span className="flex items-center gap-1">
                <Eye className="w-3.5 h-3.5 text-slate-500" />
                <span>{views} بینراو</span>
              </span>
              <span className="flex items-center gap-1">
                <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-rose-500 text-rose-500' : 'text-slate-400'}`} />
                <span>{likes} لایک</span>
              </span>
            </div>
          </div>

          <h1 className="text-xl sm:text-2xl font-black text-slate-900">{car.title}</h1>
          
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1.5">
            <MapPin className="w-3.5 h-3.5 text-[#F97316]" />
            <span>{car.city} - {car.locationDetails || 'کوردستان'}</span>
          </p>
        </div>

        {/* Pricing & Share/Like Buttons */}
        <div className="flex items-center gap-3 justify-between sm:justify-end">
          <div className="flex items-center gap-2">
            <button
              onClick={handleFav}
              className={`p-3 rounded-2xl border transition-all cursor-pointer ${
                isFav
                  ? 'bg-rose-50 border-rose-200 text-rose-600 shadow-xs'
                  : 'bg-slate-50 border-slate-200 text-slate-600 hover:text-rose-600'
              }`}
              title="زیادکردن بۆ دڵخوازەکان"
            >
              <Heart className={`w-5 h-5 ${isFav ? 'fill-rose-500' : ''}`} />
            </button>

            <button
              onClick={() => setShowShareModal(true)}
              className="p-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 hover:text-[#2563EB] hover:bg-slate-100 transition-colors cursor-pointer"
              title="هاوبەشکردنی ڕیکلام"
            >
              <Share2 className="w-5 h-5" />
            </button>
          </div>

          <div className="bg-blue-50 border border-blue-200 p-3.5 rounded-2xl text-left flex flex-col items-end">
            <span className="text-[11px] text-slate-500 font-bold">نرخی داواکراو:</span>
            <span className="text-xl sm:text-2xl font-black text-[#2563EB] font-latin">
              {car.priceIqd.toLocaleString()} د.ع
            </span>
            {car.priceUsd && (
              <span className="text-xs font-bold text-slate-600 font-latin">
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
        <div className="lg:col-span-8 space-y-4">
          <div className="relative aspect-16/10 w-full rounded-3xl overflow-hidden bg-slate-900 border border-slate-200 shadow-md">
            <img
              src={car.images[activeImage] || car.images[0]}
              alt={car.title}
              className="w-full h-full object-cover"
            />
            <div className="absolute bottom-4 right-4 bg-slate-950/80 backdrop-blur-xs text-white text-xs font-bold px-3 py-1 rounded-xl">
              وێنەی {activeImage + 1} لە {car.images.length}
            </div>
          </div>

          {/* Thumbnails */}
          {car.images.length > 1 && (
            <div className="flex gap-3 overflow-x-auto pb-1">
              {car.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(idx)}
                  className={`w-24 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all cursor-pointer ${
                    activeImage === idx ? 'border-[#2563EB] ring-2 ring-blue-600/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Description */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 space-y-3">
            <h3 className="text-base font-black text-slate-900">وەسف و تێبینییەکانی فرۆشیار:</h3>
            <p className="text-sm text-slate-700 leading-relaxed whitespace-pre-line">
              {car.description || 'ئەم ئۆتۆمبێلە بێ کێشەیە و بە دۆخی زۆر پاک دەفرۆشرێت.'}
            </p>
          </div>
        </div>

        {/* Specifications & Seller Contact - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Quick Specs Card */}
          <div className="bg-white rounded-3xl p-6 border border-slate-200 shadow-xs space-y-4">
            <h3 className="text-sm font-black text-slate-900 border-b border-slate-100 pb-2">
              تایبەتمەندییە سەرەکییەکان
            </h3>

            <div className="space-y-3 text-xs">
              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-500">کۆمپانیا / براند:</span>
                <span className="font-bold text-slate-800">{car.brand}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-500">مۆدێل:</span>
                <span className="font-bold text-slate-800">{car.model}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-500">ساڵی دروستکردن:</span>
                <span className="font-bold text-slate-800 font-latin">{car.year}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-500">ڕۆیشتن (کیلۆمەتر):</span>
                <span className="font-bold text-slate-800 font-latin">{car.mileageKm.toLocaleString()} کم</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-500">گێڕ:</span>
                <span className="font-bold text-slate-800">
                  {car.transmission === 'automatic' ? 'ئۆتۆماتیک' : 'عادی (مانوێل)'}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-500">جۆری سوتەمەنی:</span>
                <span className="font-bold text-slate-800 capitalize">
                  {car.fuelType === 'gasoline' ? 'بەنزین' : car.fuelType}
                </span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-500">ڕەنگ:</span>
                <span className="font-bold text-slate-800">{car.color}</span>
              </div>

              <div className="flex justify-between items-center py-1.5 border-b border-slate-50">
                <span className="text-slate-500">دۆخی تەقەڵ / لێدران:</span>
                <span className="font-bold text-slate-800">{car.damageStatus || 'بێ لێدران و بۆیاخ'}</span>
              </div>

              <div className="flex justify-between items-center py-1.5">
                <span className="text-slate-500">تابلۆ:</span>
                <span className="font-bold text-slate-800">{car.licensePlateStatus || 'تەواوە و نوێکراوەتەوە'}</span>
              </div>
            </div>
          </div>

          {/* Seller Contact Box */}
          <div className="bg-gradient-to-tr from-slate-900 to-slate-800 text-white rounded-3xl p-6 shadow-md space-y-4">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg">
                {car.userName.charAt(0)}
              </div>
              <div>
                <h4 className="font-bold text-sm text-white">{car.userName}</h4>
                <p dir="ltr" style={{ unicodeBidi: 'isolate', direction: 'ltr' }} className="text-xs text-slate-400 font-latin inline-block text-left">
                  {isSold ? '******** (پەیوەندی لابرابوو)' : car.userPhone}
                </p>
              </div>
            </div>

            {isSold ? (
              <div className="bg-rose-950/80 border border-rose-500/40 p-4 rounded-2xl text-center space-y-2">
                <CheckCircle2 className="w-8 h-8 text-rose-400 mx-auto" />
                <h4 className="font-black text-sm text-white">ئەم ئۆتۆمبێلە فرۆشراوە (SOLD)</h4>
                <p className="text-xs text-rose-200 leading-relaxed">
                  زانیاری پەیوەندی و تەلەفۆنی فرۆشیار بەپێی یاساکانی پلاتفۆرمی شاخ لابرابوو.
                </p>
              </div>
            ) : (
              <div className="space-y-2.5 pt-2">
                <button
                  onClick={handleWhatsapp}
                  className="w-full py-3 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <MessageCircle className="w-4 h-4" />
                  <span>نامە ناردن لە واتسئەپ</span>
                </button>

                <button
                  onClick={handleCall}
                  className="w-full py-3 rounded-xl bg-[#2563EB] hover:bg-blue-700 text-white font-bold text-xs flex items-center justify-center gap-2 shadow-sm transition-transform active:scale-95 cursor-pointer"
                >
                  <Phone className="w-4 h-4" />
                  <span>پەیوەندی ڕاستەوخۆ بە تەلەفۆن</span>
                </button>
              </div>
            )}

            <div className="pt-2 text-[11px] text-slate-400 text-center">
              شاخی بەرپرس نییە لە گرێبەستی کڕین و فرۆشتنی نێوان کڕیار و فرۆشیار.
            </div>
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

    </div>
  );
};
