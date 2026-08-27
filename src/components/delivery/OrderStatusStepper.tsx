import React from 'react';
import {
  Clock,
  CheckCircle2,
  PackageCheck,
  Truck,
  MapPin,
  Check,
  AlertCircle,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  Radio
} from 'lucide-react';
import { Order, OrderStatus } from '../../types';

interface OrderStatusStepperProps {
  order: Order;
  onAdvanceStatus?: () => void;
  showDemoControls?: boolean;
}

export interface StepperStep {
  id: string;
  titleKurdish: string;
  titleEnglish: string;
  description: string;
  icon: React.ReactNode;
  matchingStatuses: OrderStatus[];
}

export const OrderStatusStepper: React.FC<OrderStatusStepperProps> = ({
  order,
  onAdvanceStatus,
  showDemoControls = true
}) => {
  const isCancelled = order.status === 'cancelled';

  // Core 4-Stage Stepper configuration with detailed mapping
  const stepperSteps: StepperStep[] = [
    {
      id: 'step_placed',
      titleKurdish: 'تۆمارکردنی داواکاری',
      titleEnglish: 'Order Placed',
      description: 'داواکارییەکە وەرگیرا و ڕەوانەی فرۆشیار کرا',
      icon: <Clock className="w-5 h-5" />,
      matchingStatuses: ['pending']
    },
    {
      id: 'step_preparing',
      titleKurdish: 'ئامادەکردنی کاڵا',
      titleEnglish: 'Preparing Order',
      description: 'فرۆشیار خەریکی ئامادەکردن و پێچانەوەی کاڵایە',
      icon: <PackageCheck className="w-5 h-5" />,
      matchingStatuses: ['accepted', 'preparing', 'ready']
    },
    {
      id: 'step_delivery',
      titleKurdish: 'لە ڕێگای گەیاندندا',
      titleEnglish: 'Out for Delivery',
      description: 'کاپتنی گەیاندن کاڵاکەی هەڵگرت و لە ڕێگادایە',
      icon: <Truck className="w-5 h-5" />,
      matchingStatuses: ['picked_up', 'on_the_way']
    },
    {
      id: 'step_delivered',
      titleKurdish: 'گەیەندرا بە سەرکەوتوویی',
      titleEnglish: 'Delivered',
      description: 'داواکاری گەیشتە ناونیشانی داواکراو',
      icon: <ShieldCheck className="w-5 h-5" />,
      matchingStatuses: ['delivered']
    }
  ];

  // Map order status to progress percentage & active step index
  const getProgressDetails = (status: OrderStatus) => {
    switch (status) {
      case 'pending':
        return { activeStepIndex: 0, progressPercent: 15, currentLabel: 'تۆمارکراوە (Order Placed)' };
      case 'accepted':
        return { activeStepIndex: 1, progressPercent: 35, currentLabel: 'پەسەندکرا (Accepted)' };
      case 'preparing':
        return { activeStepIndex: 1, progressPercent: 50, currentLabel: 'لە ئامادەکردندایە (Preparing)' };
      case 'ready':
        return { activeStepIndex: 1, progressPercent: 65, currentLabel: 'ئامادەیە بۆ شۆفێر (Ready)' };
      case 'picked_up':
        return { activeStepIndex: 2, progressPercent: 78, currentLabel: 'وەرگیرا لەلایەن کاپتن (Picked Up)' };
      case 'on_the_way':
        return { activeStepIndex: 2, progressPercent: 90, currentLabel: 'لە ڕێگادایە بۆ لات (Out for Delivery)' };
      case 'delivered':
        return { activeStepIndex: 3, progressPercent: 100, currentLabel: 'گەیەندرا (Delivered)' };
      case 'cancelled':
        return { activeStepIndex: -1, progressPercent: 0, currentLabel: 'هەڵوەشێنراوەتەوە (Cancelled)' };
      default:
        return { activeStepIndex: 0, progressPercent: 10, currentLabel: 'لە ڕێگادایە' };
    }
  };

  const { activeStepIndex, progressPercent, currentLabel } = getProgressDetails(order.status);

  // Helper to find recorded timestamp for a specific status from statusTimeline
  const getTimelineTimestamp = (matchingStatuses: OrderStatus[]) => {
    if (!order.statusTimeline || order.statusTimeline.length === 0) return null;
    const match = order.statusTimeline.find(t => matchingStatuses.includes(t.status));
    if (match) {
      return new Date(match.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    }
    return null;
  };

  return (
    <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-sm space-y-6">
      
      {/* Top Header & Real-time Live Status Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 dark:border-slate-800 pb-4">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/50 text-emerald-700 dark:text-emerald-400 border border-emerald-200 dark:border-emerald-800 text-xs font-bold">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <Radio className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
              <span>بارودۆخی ڕاستەوخۆ (Real-time Status)</span>
            </span>

            <span className="text-xs font-black text-slate-800 dark:text-slate-200 bg-slate-100 dark:bg-slate-800 px-3 py-1 rounded-full font-latin">
              #{order.orderNumber}
            </span>
          </div>
          <h2 className="text-lg sm:text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
            دواداچوونی ڕاستەوخۆی داواکاری
          </h2>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            دۆخی دەستبەجێ: <span className="font-bold text-orange-600 dark:text-orange-400">{currentLabel}</span>
          </p>
        </div>

        {/* Demo Advance Control Button */}
        {showDemoControls && onAdvanceStatus && order.status !== 'delivered' && order.status !== 'cancelled' && (
          <button
            onClick={onAdvanceStatus}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-bold rounded-xl shadow-md transition-all cursor-pointer flex items-center gap-2 self-start sm:self-auto hover:scale-105"
            title="گۆڕینی هەنگاو لە کاتی ڕاستەقینەدا بۆ تاقیکردنەوە"
          >
            <Sparkles className="w-4 h-4 text-amber-200" />
            <span>هەنگاوی داهاتوو (Demo Step)</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        )}
      </div>

      {/* Cancelled Alert Box */}
      {isCancelled ? (
        <div className="p-6 rounded-2xl bg-rose-50 dark:bg-rose-950/40 border border-rose-200 dark:border-rose-800 text-center text-rose-700 dark:text-rose-300 space-y-2">
          <AlertCircle className="w-10 h-10 mx-auto text-rose-600 dark:text-rose-400" />
          <h4 className="font-black text-base">داواکارییەکە هەڵوەشێنراوەتەوە (Order Cancelled)</h4>
          <p className="text-xs max-w-md mx-auto leading-relaxed">
            ئەم داواکارییە هەڵوەشێنراوەتەوە. ئەگەر بە هەڵە بووبێت یان پێویستت بە یارمەتییە، تکایە پەیوەندی بە پشتگیری شاخ بکه.
          </p>
        </div>
      ) : (
        <div className="space-y-8 py-2">
          
          {/* Stepper Progress Bar & Icons Container */}
          <div className="relative">
            
            {/* Background Track Line */}
            <div className="hidden sm:block absolute top-6 left-8 right-8 h-1 bg-slate-100 dark:bg-slate-800 rounded-full z-0" />

            {/* Filled Animated Active Progress Line */}
            <div
              className="hidden sm:block absolute top-6 right-8 h-1 bg-gradient-to-l from-orange-500 via-amber-500 to-emerald-500 rounded-full transition-all duration-700 ease-out z-0"
              style={{ width: `${progressPercent}%` }}
            />

            {/* Stepper Nodes Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-6 relative z-10">
              {stepperSteps.map((step, idx) => {
                const isCompleted = idx < activeStepIndex || order.status === 'delivered';
                const isActive = idx === activeStepIndex && order.status !== 'delivered';
                const timestamp = getTimelineTimestamp(step.matchingStatuses) || (idx === 0 ? new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : null);

                return (
                  <div
                    key={step.id}
                    className={`flex sm:flex-col items-center gap-4 sm:gap-3 text-right sm:text-center transition-all ${
                      isActive ? 'scale-105' : ''
                    }`}
                  >
                    {/* Circle Node Icon */}
                    <div
                      className={`relative w-12 h-12 rounded-2xl flex items-center justify-center font-bold transition-all duration-300 ${
                        isCompleted
                          ? 'bg-emerald-500 text-white shadow-md shadow-emerald-500/20 ring-4 ring-emerald-50 dark:ring-emerald-950'
                          : isActive
                          ? 'bg-gradient-to-br from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/30 ring-4 ring-orange-100 dark:ring-orange-950/80 animate-pulse'
                          : 'bg-slate-100 dark:bg-slate-800 text-slate-400 border border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      {isCompleted ? (
                        <Check className="w-6 h-6 stroke-[3]" />
                      ) : (
                        step.icon
                      )}

                      {/* Active Live Pulse Ping Dot */}
                      {isActive && (
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-orange-500 rounded-full ring-2 ring-white dark:ring-slate-900 animate-ping" />
                      )}
                    </div>

                    {/* Step Labels */}
                    <div className="space-y-0.5 flex-1 sm:flex-initial">
                      <div className="flex items-center sm:justify-center gap-1.5">
                        <h4 className={`text-xs font-black ${
                          isActive
                            ? 'text-orange-600 dark:text-orange-400 text-sm'
                            : isCompleted
                            ? 'text-slate-900 dark:text-slate-100'
                            : 'text-slate-400 dark:text-slate-500'
                        }`}>
                          {step.titleKurdish}
                        </h4>
                      </div>

                      <span className="text-[10px] text-slate-400 dark:text-slate-500 block font-latin font-medium">
                        {step.titleEnglish}
                      </span>

                      <p className={`text-[11px] leading-tight ${
                        isActive
                          ? 'text-slate-700 dark:text-slate-300 font-bold'
                          : 'text-slate-400 dark:text-slate-500'
                      }`}>
                        {step.description}
                      </p>

                      {timestamp && (
                        <span className="inline-block mt-1 text-[10px] font-latin font-bold px-2 py-0.5 rounded-md bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                          {timestamp}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Detailed Real-time Active Progress Details Banner */}
          <div className="p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-orange-50 via-amber-50 to-orange-50 dark:from-slate-800/80 dark:via-slate-800 dark:to-slate-800/80 border border-orange-200 dark:border-slate-700 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold flex-shrink-0 shadow-sm">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-black text-orange-600 dark:text-orange-400 uppercase tracking-wider block">
                  دۆخی ئامادەگی و دابەشکردن
                </span>
                <h4 className="text-xs sm:text-sm font-black text-slate-900 dark:text-slate-100">
                  {order.status === 'delivered'
                    ? 'داواکارییەکەت بە سەرکەوتوویی گەیشتە دەستت!'
                    : order.status === 'on_the_way'
                    ? `کاپتن ${order.driverName || 'شاخ'} لە ڕێگادایە بەرەو ناونیشانەکەت`
                    : order.status === 'preparing' || order.status === 'accepted'
                    ? `فرۆشگای ${order.sellerName} خەریکی بەستەبەندیکردنی کاڵاکانە`
                    : 'داواکارییەکەت تۆمارکراوە و ئاراستەی فرۆشیار کراوە'}
                </h4>
              </div>
            </div>

            {/* Estimated Remaining Time & Progress Bar Badge */}
            <div className="bg-white dark:bg-slate-900 px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-right sm:text-left min-w-[170px] self-stretch sm:self-auto">
              <div className="flex items-center justify-between gap-3 text-xs mb-1">
                <span className="font-bold text-slate-500 dark:text-slate-400 text-[11px]">پێشکەوتن:</span>
                <span className="font-black text-orange-600 dark:text-orange-400 font-latin">{progressPercent}%</span>
              </div>
              <div className="w-full h-2 bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-orange-500 to-amber-500 rounded-full transition-all duration-500"
                  style={{ width: `${progressPercent}%` }}
                />
              </div>
              <span className="text-[10px] text-slate-400 dark:text-slate-500 block mt-1 font-bold">
                {order.status === 'delivered' ? 'گەیاندن کۆتایی هات ✓' : 'کاتی خەمڵێنراو: ١٥-٢٥ خولەک'}
              </span>
            </div>
          </div>

        </div>
      )}

    </div>
  );
};
