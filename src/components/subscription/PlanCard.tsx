import React from 'react';
import { SubscriptionPlan } from '../../types';
import { Check, Zap, Sparkles, Shield, ArrowRight } from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface PlanCardProps {
  plan: SubscriptionPlan;
  billingCycle: 'monthly' | 'yearly';
  isCurrent: boolean;
  onSelect: (plan: SubscriptionPlan) => void;
  isRTL?: boolean;
}

export const PlanCard: React.FC<PlanCardProps> = ({
  plan,
  billingCycle,
  isCurrent,
  onSelect,
  isRTL = false
}) => {
  const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
  const monthlyEquivalent = billingCycle === 'yearly' && plan.priceYearly > 0 
    ? Math.round(plan.priceYearly / 12) 
    : plan.priceMonthly;

  const isFree = plan.id === 'free_trial';

  return (
    <div
      className={cn(
        "relative rounded-3xl p-6 transition-all duration-300 flex flex-col justify-between border bg-white",
        plan.popular 
          ? "border-blue-600 shadow-xl shadow-blue-500/10 ring-2 ring-blue-600/20" 
          : "border-gray-200 shadow-sm hover:shadow-md hover:border-gray-300",
        isCurrent && "ring-2 ring-emerald-500 border-emerald-500"
      )}
    >
      {/* Popular or Current Badge */}
      {isCurrent && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-emerald-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5 z-10">
          <Shield className="w-3 h-3" />
          <span>Active Plan</span>
        </div>
      )}

      {!isCurrent && plan.popular && (
        <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[10px] font-black uppercase tracking-wider px-3.5 py-1 rounded-full shadow-md flex items-center gap-1.5 z-10">
          <Sparkles className="w-3 h-3 fill-white" />
          <span>{plan.badge || 'Most Popular'}</span>
        </div>
      )}

      <div>
        {/* Header */}
        <div className="flex justify-between items-start mb-4 pt-1">
          <div>
            <h3 className="text-lg font-black text-gray-900 tracking-tight">{plan.name}</h3>
            <p className="text-xs text-gray-500 mt-1 line-clamp-2 leading-relaxed">{plan.description}</p>
          </div>
        </div>

        {/* Pricing */}
        <div className="mb-6 pb-6 border-b border-gray-100">
          <div className="flex items-baseline gap-1.5">
            <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
              ${isFree ? '0' : price}
            </span>
            <span className="text-xs text-gray-500 font-bold">
              {isFree ? '/ 6 months' : billingCycle === 'yearly' ? '/ year' : '/ month'}
            </span>
          </div>

          {!isFree && billingCycle === 'yearly' && (
            <p className="text-[11px] font-bold text-emerald-600 mt-1">
              Equivalent to ~${monthlyEquivalent}/mo (Billed annually)
            </p>
          )}

          {isFree && (
            <p className="text-[11px] font-bold text-blue-600 mt-1">
              Zero upfront payment • Instant setup
            </p>
          )}
        </div>

        {/* Plan Feature Limits & Highlights */}
        <div className="space-y-3 mb-6">
          <p className="text-[10px] font-black uppercase tracking-widest text-gray-400">
            Included Capabilities
          </p>

          <ul className="space-y-2.5 text-xs text-gray-700 font-medium">
            {plan.highlightFeatures.map((feature, idx) => (
              <li key={idx} className={cn("flex items-start gap-2.5", isRTL && "flex-row-reverse text-right")}>
                <div className={cn(
                  "w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5",
                  plan.popular ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-700"
                )}>
                  <Check className="w-2.5 h-2.5 stroke-[3]" />
                </div>
                <span className="leading-snug text-xs">{feature}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* Action Button */}
      <div className="pt-2">
        <button
          onClick={() => onSelect(plan)}
          disabled={isCurrent}
          className={cn(
            "w-full py-3 px-4 rounded-2xl font-black text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2",
            isCurrent
              ? "bg-emerald-50 text-emerald-700 border border-emerald-200 cursor-default"
              : plan.popular
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-500/25 active:scale-[0.99]"
              : "bg-gray-900 hover:bg-gray-800 text-white active:scale-[0.99]"
          )}
        >
          <span>
            {isCurrent 
              ? 'Current Active Plan' 
              : isFree 
              ? 'Start 6-Month Trial' 
              : 'Upgrade with Stripe'}
          </span>
          {!isCurrent && <ArrowRight className="w-3.5 h-3.5" />}
        </button>
      </div>
    </div>
  );
};

export default PlanCard;
