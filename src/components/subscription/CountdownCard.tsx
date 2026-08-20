import React, { useState, useEffect } from 'react';
import { Store } from '../../types';
import { 
  Clock, 
  ShieldCheck, 
  AlertTriangle, 
  Sparkles, 
  Calendar, 
  CreditCard, 
  Zap, 
  Users, 
  Package, 
  MessageSquare,
  Building2,
  RefreshCw
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface CountdownCardProps {
  store: Store | null;
  onUpgradeClick: () => void;
  onManagePaymentClick?: () => void;
  isRTL?: boolean;
}

export const CountdownCard: React.FC<CountdownCardProps> = ({
  store,
  onUpgradeClick,
  onManagePaymentClick,
  isRTL = false
}) => {
  const [timeLeft, setTimeLeft] = useState({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    percentage: 100,
    isExpired: false,
    isExpiringSoon: false
  });

  const isTrial = store?.subscriptionStatus === 'trial' || !store?.subscriptionStatus;
  const planId = store?.planId || (isTrial ? 'free_trial' : 'pro');
  const targetDateStr = store?.subscriptionEndDate || store?.trialEndDate;

  useEffect(() => {
    const calculateTime = () => {
      // Default to 180 days from store creation or fallback to 150 days from now
      const fallbackEnd = new Date(Date.now() + 154 * 24 * 60 * 60 * 1000);
      const targetDate = targetDateStr ? new Date(targetDateStr) : fallbackEnd;
      const now = new Date();
      const difference = targetDate.getTime() - now.getTime();

      if (difference <= 0) {
        setTimeLeft({
          days: 0,
          hours: 0,
          minutes: 0,
          seconds: 0,
          percentage: 0,
          isExpired: true,
          isExpiringSoon: false
        });
        return;
      }

      const days = Math.floor(difference / (1000 * 60 * 60 * 24));
      const hours = Math.floor((difference / (1000 * 60 * 60)) % 24);
      const minutes = Math.floor((difference / 1000 / 60) % 60);
      const seconds = Math.floor((difference / 1000) % 60);

      // Estimate total duration: 180 days for trial, 365 for yearly, 30 for monthly
      const totalDurationDays = isTrial ? 180 : store?.billingCycle === 'yearly' ? 365 : 30;
      const percentRemaining = Math.min(100, Math.max(0, Math.round((days / totalDurationDays) * 100)));

      setTimeLeft({
        days,
        hours,
        minutes,
        seconds,
        percentage: percentRemaining,
        isExpired: false,
        isExpiringSoon: days <= 14
      });
    };

    calculateTime();
    const interval = setInterval(calculateTime, 1000);
    return () => clearInterval(interval);
  }, [targetDateStr, isTrial, store?.billingCycle]);

  // Plan name helper
  const getPlanDisplayName = () => {
    if (isTrial) return '6-Month Free Trial (Full Pro Access)';
    if (planId === 'starter') return 'Starter Plan';
    if (planId === 'pro') return 'Professional Pro Plan';
    if (planId === 'enterprise') return 'Enterprise Multi-Branch Suite';
    return 'Active Subscription';
  };

  const getRenewalDateFormatted = () => {
    if (targetDateStr) {
      return new Date(targetDateStr).toLocaleDateString(undefined, {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    }
    return new Date(Date.now() + 154 * 24 * 60 * 60 * 1000).toLocaleDateString(undefined, {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className="space-y-6">
      {/* Warning Banner if expiring soon */}
      {timeLeft.isExpiringSoon && !timeLeft.isExpired && (
        <div className="bg-amber-50 border border-amber-200 p-4 rounded-2xl flex items-center justify-between shadow-xs">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-amber-100 flex items-center justify-center text-amber-700 flex-shrink-0">
              <AlertTriangle className="w-5 h-5" />
            </div>
            <div>
              <p className="text-xs font-black text-amber-900">
                Subscription Renewal Approaching
              </p>
              <p className="text-[11px] text-amber-700 font-medium">
                Your store has {timeLeft.days} days remaining. Renew now to avoid any interruption in POS & SMS services.
              </p>
            </div>
          </div>
          <button
            onClick={onUpgradeClick}
            className="bg-amber-600 hover:bg-amber-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-sm"
          >
            Extend Now
          </button>
        </div>
      )}

      {/* Main Countdown Hero Card */}
      <div className="relative rounded-3xl bg-[#0F172A] text-white p-6 sm:p-8 shadow-2xl overflow-hidden border border-slate-800">
        {/* Glow decorative effects */}
        <div className="absolute top-0 right-0 w-80 h-80 bg-blue-600 rounded-full blur-[100px] opacity-20 pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-64 h-64 bg-indigo-600 rounded-full blur-[90px] opacity-15 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
          {/* Plan Info & State */}
          <div className="space-y-4 max-w-xl">
            <div className="flex items-center gap-2">
              <div className="bg-blue-500/20 text-blue-400 border border-blue-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{isTrial ? 'Trial Period' : 'Subscribed'}</span>
              </div>

              <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest flex items-center gap-1.5">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                <span>Active & Secured</span>
              </div>
            </div>

            <div>
              <h2 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
                {getPlanDisplayName()}
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Multi-tenant isolated instance for <span className="text-white font-bold">{store?.name || 'MobiStore HQ'}</span>. 
                Full access to POS, Barcode & IMEI management, Loyalty program, and SMS Gateways.
              </p>
            </div>

            {/* Next Billing / Expiration Details */}
            <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300 pt-2 border-t border-white/10">
              <div className="flex items-center gap-2">
                <Calendar className="w-4 h-4 text-blue-400" />
                <span>
                  {isTrial ? 'Trial Concludes:' : 'Next Renewal:'}{' '}
                  <strong className="text-white font-black">{getRenewalDateFormatted()}</strong>
                </span>
              </div>

              <div className="flex items-center gap-2">
                <CreditCard className="w-4 h-4 text-emerald-400" />
                <span>
                  Cycle:{' '}
                  <strong className="text-white font-black uppercase">
                    {store?.billingCycle || (isTrial ? '180-Day Trial' : 'Monthly')}
                  </strong>
                </span>
              </div>
            </div>
          </div>

          {/* Live Countdown Clock Widget */}
          <div className="bg-white/5 border border-white/10 rounded-2xl p-5 backdrop-blur-md flex flex-col items-center justify-center text-center min-w-[280px]">
            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-blue-400" />
              <span>Time Remaining</span>
            </p>

            <div className="grid grid-cols-4 gap-2.5 w-full mb-4">
              <div className="bg-slate-900/80 border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.days}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Days</span>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.hours}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Hours</span>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-black text-white">{timeLeft.minutes}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Mins</span>
              </div>

              <div className="bg-slate-900/80 border border-white/10 rounded-xl p-2.5 flex flex-col items-center">
                <span className="text-xl sm:text-2xl font-black text-blue-400 font-mono">{timeLeft.seconds}</span>
                <span className="text-[9px] text-slate-400 uppercase font-bold">Secs</span>
              </div>
            </div>

            {/* Progress Bar */}
            <div className="w-full space-y-1.5">
              <div className="flex justify-between text-[10px] text-slate-400 font-bold">
                <span>Period Progress</span>
                <span>{timeLeft.percentage}% remaining</span>
              </div>
              <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={cn(
                    "h-full rounded-full transition-all duration-500",
                    timeLeft.isExpiringSoon ? "bg-amber-500" : "bg-gradient-to-r from-blue-500 to-indigo-400"
                  )}
                  style={{ width: `${timeLeft.percentage}%` }}
                />
              </div>
            </div>

            {/* CTAs inside Countdown card */}
            <div className="w-full mt-4 flex gap-2">
              <button
                onClick={onUpgradeClick}
                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white py-2 px-3 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-md shadow-blue-900/40"
              >
                Upgrade Plan
              </button>
              {onManagePaymentClick && (
                <button
                  onClick={onManagePaymentClick}
                  className="bg-white/10 hover:bg-white/20 text-slate-200 py-2 px-3 rounded-xl font-bold text-xs transition-all border border-white/10"
                  title="Manage Payment Method"
                >
                  <CreditCard className="w-3.5 h-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Resource Entitlements & Utilization Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {/* Branches */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center flex-shrink-0">
            <Building2 className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Store Branches</p>
            <p className="text-sm font-black text-gray-900">
              1 <span className="text-xs text-gray-400 font-medium">/ {planId === 'enterprise' ? 'Unlimited' : planId === 'pro' ? '3 Included' : '1 Included'}</span>
            </p>
          </div>
        </div>

        {/* Staff Seats */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center flex-shrink-0">
            <Users className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">Cashier Seats</p>
            <p className="text-sm font-black text-gray-900">
              2 <span className="text-xs text-gray-400 font-medium">/ {planId === 'enterprise' ? 'Unlimited' : planId === 'pro' ? '10 Seats' : '3 Seats'}</span>
            </p>
          </div>
        </div>

        {/* SMS Credits */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center flex-shrink-0">
            <MessageSquare className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">SMS Monthly</p>
            <p className="text-sm font-black text-gray-900">
              140 <span className="text-xs text-gray-400 font-medium">/ {planId === 'enterprise' ? 'Unlimited' : planId === 'pro' ? '2,500' : '500'}</span>
            </p>
          </div>
        </div>

        {/* AI Business Advisor */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-xs flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center flex-shrink-0">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <p className="text-[10px] uppercase font-bold text-gray-400 tracking-wider">MobiAI Advisor</p>
            <p className="text-sm font-black text-emerald-600 flex items-center gap-1">
              <span>Enabled</span>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CountdownCard;
