import React, { useState, useEffect } from 'react';
import { Clock, AlertTriangle, CheckCircle, Flame } from 'lucide-react';
import { CarAd, CarPackageType } from '../../types';

interface CarCountdownTimerProps {
  car: CarAd;
  compact?: boolean;
  className?: string;
}

export const CarCountdownTimer: React.FC<CarCountdownTimerProps> = ({
  car,
  compact = false,
  className = ''
}) => {
  const getExpirationTime = () => {
    if (car.expirationDate) {
      return new Date(car.expirationDate).getTime();
    }
    
    // Default duration calculation based on package
    const start = car.startDate ? new Date(car.startDate).getTime() : new Date(car.createdAt).getTime();
    const durationDays = car.packageType === '1_month' ? 30 : car.packageType === '15_days' ? 15 : 7;
    return start + durationDays * 24 * 60 * 60 * 1000;
  };

  const [timeLeft, setTimeLeft] = useState<{
    days: number;
    hours: number;
    minutes: number;
    seconds: number;
    isExpired: boolean;
    isEndingSoon: boolean;
  }>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
    isEndingSoon: false
  });

  useEffect(() => {
    const calculateTime = () => {
      const targetTime = getExpirationTime();
      const now = Date.now();
      const diff = targetTime - now;

      if (diff <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          isExpired: true,
          isEndingSoon: false
        });
        return;
      }

      const days = Math.floor(diff / (1000 * 60 * 60 * 24));
      const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
      const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
      const seconds = Math.floor((diff % (1000 * 60)) / 1000);
      const isEndingSoon = diff < 24 * 60 * 60 * 1000; // less than 24 hours

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        isExpired: false,
        isEndingSoon
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [car.expirationDate, car.startDate, car.createdAt, car.packageType]);

  if (timeLeft.isExpired) {
    return (
      <div className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-red-100 text-red-700 text-xs font-bold ${className}`}>
        <AlertTriangle className="w-3.5 h-3.5" />
        <span>ماوەکەی بەسەرچووە</span>
      </div>
    );
  }

  if (compact) {
    return (
      <div
        className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded-md text-[11px] font-bold shadow-xs backdrop-blur-md transition-all ${
          timeLeft.isEndingSoon
            ? 'bg-red-500/90 text-white animate-pulse'
            : car.packageType === '1_month'
            ? 'bg-amber-500/90 text-white'
            : 'bg-slate-900/80 text-white'
        } ${className}`}
        title="کاتی ماوە بۆ بەسەرچوونی پۆست"
      >
        <Clock className="w-3 h-3 text-orange-300" />
        <span className="font-latin font-bold">
          {timeLeft.days > 0 ? `${timeLeft.days} ڕۆژ` : ''} {String(timeLeft.hours).padStart(2, '0')}:{String(timeLeft.minutes).padStart(2, '0')}:{String(timeLeft.seconds).padStart(2, '0')}
        </span>
      </div>
    );
  }

  return (
    <div
      className={`rounded-2xl p-4 border transition-all ${
        timeLeft.isEndingSoon
          ? 'bg-red-50 border-red-200 text-red-900'
          : car.packageType === '1_month'
          ? 'bg-gradient-to-l from-amber-50 to-orange-50 border-amber-200 text-amber-950'
          : 'bg-slate-50 border-slate-200 text-slate-800'
      } ${className}`}
    >
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          {timeLeft.isEndingSoon ? (
            <Flame className="w-4 h-4 text-red-600 animate-bounce" />
          ) : (
            <Clock className="w-4 h-4 text-orange-500" />
          )}
          <span className="text-xs font-bold">
            {timeLeft.isEndingSoon
              ? 'ئاگاداری: کەمتر لە ٢٤ کاتژمێری ماوە!'
              : 'کاتی ماوە بۆ بەسەرچوونی پۆست لە شاخ:'}
          </span>
        </div>
        <span className="text-[11px] font-semibold opacity-75">
          پاکێج: {car.packageType === '1_month' ? '٣٠ ڕۆژ' : car.packageType === '15_days' ? '١٥ ڕۆژ' : '٧ ڕۆژ'}
        </span>
      </div>

      {/* Modern Flip/Box Countdown */}
      <div className="grid grid-cols-4 gap-2 text-center" dir="ltr">
        <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-200/80">
          <span className="block text-lg sm:text-xl font-black text-slate-900 font-latin">
            {String(timeLeft.days).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">ڕۆژ (Days)</span>
        </div>

        <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-200/80">
          <span className="block text-lg sm:text-xl font-black text-slate-900 font-latin">
            {String(timeLeft.hours).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">کاتژمێر (Hrs)</span>
        </div>

        <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-200/80">
          <span className="block text-lg sm:text-xl font-black text-slate-900 font-latin">
            {String(timeLeft.minutes).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">خولەک (Min)</span>
        </div>

        <div className="bg-white p-2.5 rounded-xl shadow-xs border border-slate-200/80">
          <span className="block text-lg sm:text-xl font-black text-orange-600 font-latin animate-pulse">
            {String(timeLeft.seconds).padStart(2, '0')}
          </span>
          <span className="text-[10px] text-slate-500 font-bold">چرکە (Sec)</span>
        </div>
      </div>
    </div>
  );
};
