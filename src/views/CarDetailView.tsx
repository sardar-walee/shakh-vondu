import React, { useState } from 'react';
import {
  Phone,
  MessageCircle,
  MapPin,
  Calendar,
  Gauge,
  Fuel,
  ShieldCheck,
  CheckCircle,
  Share2,
  Clock,
  Sparkles,
  Car,
  Check,
  AlertCircle
} from 'lucide-react';
import { CarPackageBadge } from '../components/common/Badge';
import { useMarketplace } from '../context/MarketplaceContext';
import { CarAd } from '../types';

interface CarDetailViewProps {
  carId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const CarDetailView: React.FC<CarDetailViewProps> = ({ carId, onNavigate }) => {
  const { carAds } = useMarketplace();
  const car = carAds.find(c => c.id === carId) || carAds[0];

  const [activeImage, setActiveImage] = useState(0);

  if (!car) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800">ئۆتۆمبێلەکە نەدۆزرایەوە</h2>
        <button
          onClick={() => onNavigate('car-marketplace')}
          className="mt-4 px-6 py-2.5 bg-blue-600 text-white rounded-xl text-xs font-bold"
        >
          گەڕانەوە بۆ بازاڕی ئۆتۆمبێل
        </button>
      </div>
    );
  }

  const handleCall = () => {
    window.location.href = `tel:${car.userPhone}`;
  };

  const handleWhatsapp = () => {
    const cleanPhone = car.userPhone.replace(/^0/, '964').replace(/\D/g, '');
    const msg = encodeURIComponent(`سڵاو، لەسەر ڕیکلامی ئۆتۆمبێلی (${car.title}) پەیوەندیت پێوە دەکەم لە پلاتفۆرمی شاخی.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div className="max-w-5xl mx-auto space-y-8 pb-16">
      
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-right">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-xs font-bold text-blue-600">{car.brand}</span>
            <span>•</span>
            <span className="text-xs font-bold text-slate-500 font-latin">{car.year}</span>
            <CarPackageBadge packageType={car.packageType} />
          </div>
          <h1 className="text-2xl sm:text-3xl font-black text-slate-900">{car.title}</h1>
          <p className="text-xs text-slate-500 flex items-center gap-1 mt-1">
            <MapPin className="w-3.5 h-3.5 text-orange-500" />
            <span>{car.city} - {car.locationDetails || 'کوردستان'}</span>
          </p>
        </div>

        {/* Pricing Box */}
        <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl text-left flex flex-col items-end">
          <span className="text-xs text-slate-500">نرخی داواکراو:</span>
          <span className="text-2xl font-black text-blue-700 font-latin">
            {car.priceIqd.toLocaleString()} د.ع
          </span>
          {car.priceUsd && (
            <span className="text-sm font-bold text-slate-600 font-latin">
              ≈ ${car.priceUsd.toLocaleString()} USD
            </span>
          )}
        </div>
      </div>

      {/* Photo Gallery & Specs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
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
                  className={`w-24 h-16 rounded-xl overflow-hidden border-2 flex-shrink-0 transition-all ${
                    activeImage === idx ? 'border-blue-600 ring-2 ring-blue-600/30' : 'border-slate-200 opacity-70 hover:opacity-100'
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Specifications Table */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-900">تایبەتمەندییە تەکنیکییەکان</h3>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">کۆمپانیا (Brand)</span>
                <p className="font-bold text-slate-900">{car.brand}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">مۆدێل (Model)</span>
                <p className="font-bold text-slate-900">{car.model}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">ساڵی دروستکردن</span>
                <p className="font-bold text-slate-900 font-latin">{car.year}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">ڕۆیشتوو (کیلۆمەتر)</span>
                <p className="font-bold text-slate-900 font-latin">{car.mileageKm.toLocaleString()} KM</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">گێڕ (Transmission)</span>
                <p className="font-bold text-slate-900">{car.transmission === 'automatic' ? 'ئۆتۆماتیک' : 'عادی'}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">جۆری سووتەمەنی</span>
                <p className="font-bold text-slate-900">{car.fuelType === 'gasoline' ? 'بەنزین' : car.fuelType}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">ڕەنگ</span>
                <p className="font-bold text-slate-900">{car.color}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">بۆیاخ و لێدراوی</span>
                <p className="font-bold text-slate-900">{car.damageStatus}</p>
              </div>

              <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100 space-y-1">
                <span className="text-slate-400">تابلۆ (سەنەوی)</span>
                <p className="font-bold text-slate-900">{car.licensePlateStatus}</p>
              </div>
            </div>

            {/* Description */}
            <div className="pt-4 border-t border-slate-100 space-y-2">
              <h4 className="text-xs font-bold text-slate-700">ڕوونکردنەوە و تێبینی فرۆشیار:</h4>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-2xl border border-slate-100">
                {car.description}
              </p>
            </div>
          </div>
        </div>

        {/* Contact Sidebar - 4 cols */}
        <div className="lg:col-span-4 space-y-6">
          
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-sm space-y-5 sticky top-28">
            <h3 className="text-sm font-black text-slate-900">پەیوەندی بە فرۆشیارەوە</h3>

            <div className="flex items-center gap-3 p-3.5 rounded-2xl bg-slate-50 border border-slate-100">
              <div className="w-12 h-12 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold text-lg">
                {car.userName.charAt(0)}
              </div>
              <div>
                <h4 className="text-xs font-bold text-slate-900">{car.userName}</h4>
                <p className="text-[11px] text-slate-500 font-latin">{car.userPhone}</p>
                <span className="inline-flex items-center gap-1 text-[10px] text-blue-600 font-bold mt-0.5">
                  <ShieldCheck className="w-3 h-3" />
                  خاوەن ڕیکلامی پشتڕاستکراو
                </span>
              </div>
            </div>

            <div className="space-y-3">
              <button
                onClick={handleWhatsapp}
                className="w-full py-3.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-xs shadow-md shadow-emerald-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4" />
                <span>نامەناردن لە ڕێگەی واتسئەپ (WhatsApp)</span>
              </button>

              <button
                onClick={handleCall}
                className="w-full py-3.5 px-4 rounded-xl bg-blue-600 hover:bg-blue-700 text-white font-bold text-xs shadow-md shadow-blue-600/20 flex items-center justify-center gap-2 transition-transform active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>پەیوەندی تەلەفۆنی ڕاستەوخۆ</span>
              </button>
            </div>

            {/* Buyer Safety Tips */}
            <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 text-amber-900 text-xs space-y-2">
              <div className="flex items-center gap-1.5 font-bold text-amber-800">
                <AlertCircle className="w-4 h-4" />
                <span>ڕێنمایی بۆ کڕیاران:</span>
              </div>
              <ul className="text-[11px] space-y-1 list-disc list-inside text-amber-800/90 leading-relaxed">
                <li>پێش بینینی ئۆتۆمبێل و پشکنینی سەنەوی هیچ پارەیەک بە عەربون مەدە.</li>
                <li>ئۆتۆمبێلەکە لە کۆمپیوتەر و فەحسی باوەڕپێکراو بپشکنە.</li>
              </ul>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
};
