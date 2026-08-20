import React from 'react';
import { Phone, MessageCircle, MapPin, Gauge, Fuel, Calendar, ShieldCheck } from 'lucide-react';
import { CarAd } from '../../types';
import { CarPackageBadge } from '../common/Badge';

interface CarAdCardProps {
  car: CarAd;
  onClick: () => void;
}

export const CarAdCard: React.FC<CarAdCardProps> = ({ car, onClick }) => {
  const isVip = car.packageType === '1_month';

  const handleCall = (e: React.MouseEvent) => {
    e.stopPropagation();
    window.location.href = `tel:${car.userPhone}`;
  };

  const handleWhatsapp = (e: React.MouseEvent) => {
    e.stopPropagation();
    const cleanPhone = car.userPhone.replace(/^0/, '964').replace(/\D/g, '');
    const msg = encodeURIComponent(`سڵاو، دەمەوێت پەیوەندی بکەم لەسەر ئۆتۆمبێلی (${car.title}) لە پلاتفۆرمی شاخی.`);
    window.open(`https://wa.me/${cleanPhone}?text=${msg}`, '_blank');
  };

  return (
    <div
      onClick={onClick}
      className={`group relative bg-white rounded-2xl border transition-all duration-200 overflow-hidden flex flex-col cursor-pointer ${
        isVip
          ? 'border-amber-300 shadow-xs hover:shadow-sm hover:border-amber-400'
          : 'border-slate-200 hover:border-[#2563EB] shadow-xs hover:shadow-sm'
      }`}
    >
      {/* Photo with Package Badge */}
      <div className="relative aspect-16/10 w-full overflow-hidden bg-slate-100">
        <img
          src={car.images[0]}
          alt={car.title}
          loading="lazy"
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />

        {/* Top Badges */}
        <div className="absolute top-2.5 right-2.5 flex flex-col gap-1 z-10">
          <CarPackageBadge packageType={car.packageType} />
        </div>

        {/* Location Badge */}
        <div className="absolute bottom-2 right-2 bg-slate-900/80 backdrop-blur-xs text-white text-[11px] font-semibold px-2 py-0.5 rounded-lg flex items-center gap-1">
          <MapPin className="w-3 h-3 text-[#F97316]" />
          <span>{car.city}</span>
        </div>

        {/* Photo count indicator */}
        <div className="absolute bottom-2 left-2 bg-slate-900/80 backdrop-blur-xs text-white text-[10px] font-bold px-2 py-0.5 rounded-md font-latin">
          📷 {car.images.length}
        </div>
      </div>

      {/* Car Info */}
      <div className="p-3.5 flex-1 flex flex-col justify-between">
        <div>
          {/* Brand & Model */}
          <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
            <span>{car.brand}</span>
            <span className="font-latin">{car.year}</span>
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
              <span className="truncate">{car.mileageKm.toLocaleString()} کم</span>
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
                  ${car.priceUsd.toLocaleString()} دۆلار
                </span>
              )}
            </div>
          </div>

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
        </div>
      </div>
    </div>
  );
};
