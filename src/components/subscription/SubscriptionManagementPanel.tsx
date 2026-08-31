import React, { useState } from 'react';
import {
  Crown,
  CheckCircle,
  Clock,
  Sparkles,
  ShieldCheck,
  Zap,
  Edit,
  Trash2,
  Plus,
  RefreshCw,
  Search,
  Filter,
  Check,
  X,
  AlertCircle,
  CreditCard,
  Building2,
  Truck,
  DollarSign,
  Calendar,
  Layers,
  ChevronRight,
  Send,
  HelpCircle,
  FileText,
  Star
} from 'lucide-react';
import { SubscriptionPlan, UserSubscription, UserRole, SellerProfile } from '../../types';
import { DEFAULT_SELLER_SUBSCRIPTION_PLANS, DEFAULT_CAPTAIN_SUBSCRIPTION_PLANS } from '../../data/subscriptionPlans';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface SubscriptionManagementPanelProps {
  mode?: 'seller' | 'captain' | 'admin';
  defaultRole?: 'seller' | 'captain' | 'admin';
  seller?: SellerProfile;
  onNavigate?: (view: string, param?: string) => void;
}

export const SubscriptionManagementPanel: React.FC<SubscriptionManagementPanelProps> = ({
  mode: propMode,
  defaultRole,
  seller,
  onNavigate
}) => {
  const { currentUser, isSuperAdmin } = useAuth();
  
  // Resolve effective mode
  const mode: 'seller' | 'captain' | 'admin' = propMode || defaultRole || (isSuperAdmin ? 'admin' : (currentUser?.role === 'delivery_agent' || currentUser?.role === 'store_driver' ? 'captain' : 'seller'));

  const {
    userSubscriptions,
    requestUserSubscription,
    adminUpdateUserSubscription,
    adminCreateCustomSubscription,
    adminDeleteUserSubscription,
    sellers,
    allPlatformCaptains,
    allUsers
  } = useMarketplace();

  const { dir } = useLanguage();
  const isRtl = dir === 'rtl';

  // Local state
  const [selectedBillingCycle, setSelectedBillingCycle] = useState<'monthly' | 'yearly'>('monthly');
  const [showCustomModal, setShowCustomModal] = useState(false);
  const [customTarget, setCustomTarget] = useState<'seller' | 'captain'>('seller');
  const [customUserId, setCustomUserId] = useState('');
  const [customPlanName, setCustomPlanName] = useState('ڕێککەوتنی تایبەتی شاخ');
  const [customPrice, setCustomPrice] = useState(0);
  const [customCycle, setCustomCycle] = useState<'daily' | 'weekly' | 'monthly' | 'yearly' | 'custom'>('monthly');
  const [customCommissionRate, setCustomCommissionRate] = useState<number>(5);
  const [customDaysDuration, setCustomDaysDuration] = useState(30);
  const [customNote, setCustomNote] = useState('');
  const [editingSub, setEditingSub] = useState<UserSubscription | null>(null);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Filter & Search for Admin
  const [adminSearch, setAdminSearch] = useState('');
  const [adminTargetFilter, setAdminTargetFilter] = useState<'all' | 'seller' | 'captain'>('all');
  const [adminStatusFilter, setAdminStatusFilter] = useState<'all' | 'active' | 'pending_approval' | 'custom_agreed' | 'expired'>('all');

  // Identify current user's active subscription
  const currentUserId = mode === 'seller' ? (seller?.userId || currentUser?.id || '') : (currentUser?.id || '');
  const activeSubscription = userSubscriptions.find(
    s => s.userId === currentUserId && (s.status === 'active' || s.status === 'custom_agreed')
  ) || userSubscriptions.find(s => s.userId === currentUserId);

  const plans = mode === 'captain' ? DEFAULT_CAPTAIN_SUBSCRIPTION_PLANS : DEFAULT_SELLER_SUBSCRIPTION_PLANS;

  const handleSubscribePlan = async (plan: SubscriptionPlan) => {
    if (plan.billingCycle === 'custom') {
      setShowCustomModal(true);
      setCustomPlanName(plan.name);
      return;
    }

    setIsSubmitting(true);
    try {
      const price = selectedBillingCycle === 'yearly' ? plan.price * 10 : plan.price;
      const durationDays = selectedBillingCycle === 'yearly' ? 365 : 30;

      const res = await requestUserSubscription({
        userId: currentUserId,
        userName: currentUser?.fullName || seller?.storeName || 'بەشداربوو',
        storeOrVehicleName: seller?.storeName || (mode === 'captain' ? 'کاپتنی شاخ' : 'فرۆشگا'),
        target: mode === 'captain' ? 'captain' : 'seller',
        planId: plan.id,
        planName: plan.name,
        billingCycle: selectedBillingCycle,
        pricePaid: price,
        status: price === 0 ? 'active' : 'pending_approval',
        commissionRateOverride: plan.commissionRateDiscount !== undefined ? (10 - plan.commissionRateDiscount) : undefined,
        durationDays,
        paymentMethod: price === 0 ? 'free' : 'fastpay_or_cash'
      });

      if (res.success) {
        setActionSuccess('داواکاری ئابوونە بە سەرکەوتوویی تۆمار کرا ✓');
        setTimeout(() => setActionSuccess(null), 5000);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleAdminSaveCustom = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      if (editingSub) {
        // Update existing subscription
        await adminUpdateUserSubscription(editingSub.id, {
          planName: customPlanName,
          pricePaid: customPrice,
          billingCycle: customCycle,
          status: 'custom_agreed',
          commissionRateOverride: customCommissionRate,
          customAgreementNote: customNote
        });
        setActionSuccess('ڕێککەوتن و ئابوونەکە نوێکرایەوە ✓');
      } else {
        // Create brand new custom agreement
        const userObj = allUsers.find(u => u.id === customUserId) || sellers.find(s => s.userId === customUserId || s.id === customUserId);
        const userName = (userObj as any)?.fullName || (userObj as any)?.storeName || 'بەشداربوو';
        
        await adminCreateCustomSubscription({
          userId: customUserId || currentUserId,
          userName,
          storeOrVehicleName: (userObj as any)?.storeName || (customTarget === 'captain' ? 'کاپتنی شاخ' : 'فرۆشگا'),
          target: customTarget,
          planId: `custom-${Date.now()}`,
          planName: customPlanName,
          billingCycle: customCycle,
          pricePaid: customPrice,
          status: 'custom_agreed',
          commissionRateOverride: customCommissionRate,
          durationDays: customDaysDuration,
          customAgreementNote: customNote
        });
        setActionSuccess('ڕێککەوتنی تایبەتی شاخ بە سەرکەوتوویی تۆمار کرا ✓');
      }
      setShowCustomModal(false);
      setEditingSub(null);
      setTimeout(() => setActionSuccess(null), 5000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Filtered subscriptions for admin table
  const filteredSubs = userSubscriptions.filter(s => {
    const matchesTarget = adminTargetFilter === 'all' || s.target === adminTargetFilter;
    const matchesStatus = adminStatusFilter === 'all' || s.status === adminStatusFilter;
    const matchesSearch = !adminSearch.trim() || 
      (s.userName && s.userName.toLowerCase().includes(adminSearch.toLowerCase())) ||
      (s.planName && s.planName.toLowerCase().includes(adminSearch.toLowerCase())) ||
      (s.storeOrVehicleName && s.storeOrVehicleName.toLowerCase().includes(adminSearch.toLowerCase())) ||
      s.userId.toLowerCase().includes(adminSearch.toLowerCase());
    return matchesTarget && matchesStatus && matchesSearch;
  });

  return (
    <div className="space-y-8">
      {/* Toast Notification */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/70 border border-emerald-300 dark:border-emerald-800 text-emerald-900 dark:text-emerald-200 text-xs font-black flex items-center justify-between gap-3 shadow-md animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600 dark:text-emerald-400" />
            <span>{actionSuccess}</span>
          </div>
          <button onClick={() => setActionSuccess(null)} className="text-slate-400 hover:text-slate-700">✕</button>
        </div>
      )}

      {/* ADMIN OVERVIEW BANNER & CONTROLS */}
      {mode === 'admin' && (
        <div className="bg-gradient-to-br from-slate-900 via-slate-800 to-indigo-950 text-white p-6 sm:p-8 rounded-3xl border border-slate-700 shadow-xl space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="px-3 py-1 bg-amber-500/20 text-amber-300 text-xs font-black rounded-full border border-amber-500/30 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-amber-400" />
                  دەسەڵاتی بەڕێوەبەرایەتی شاخ
                </span>
                <span className="px-2.5 py-1 bg-indigo-500/20 text-indigo-300 text-xs font-bold rounded-full">
                  کۆی ئابوونەکان: {userSubscriptions.length}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                بەڕێوەبردنی تەواوی ئابوونەکان و ڕێککەوتنی نیسبەی فرۆش و کاپتن
              </h2>
              <p className="text-xs text-slate-300">
                لێرەوە دەتوانیت دەستکاری نیسبە و ئابوونەی هەر دوکاندارێک یان کاپتنێک بکەیت، داشکاندن دابنێیت، یان ڕێککەوتنی جیاوازی دووقۆڵی زیاد بکەیت.
              </p>
            </div>

            <button
              onClick={() => {
                setEditingSub(null);
                setCustomPlanName('ڕێککەوتنی تایبەتی شاخ');
                setCustomPrice(0);
                setCustomCommissionRate(5);
                setCustomDaysDuration(30);
                setCustomNote('');
                setShowCustomModal(true);
              }}
              className="px-5 py-3 bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600 text-slate-950 font-black text-xs rounded-2xl flex items-center gap-2 shadow-lg hover:scale-105 transition-all cursor-pointer self-start md:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>دروستکردنی ڕێککەوتن یان ئابوونەی تایبەت</span>
            </button>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-2">
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-400 block font-bold">ئابوونەی چالاک</span>
              <span className="text-2xl font-black text-emerald-400 font-latin">
                {userSubscriptions.filter(s => s.status === 'active' || s.status === 'custom_agreed').length}
              </span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-400 block font-bold">داواکاری نوێ (چاوەڕوان)</span>
              <span className="text-2xl font-black text-amber-400 font-latin">
                {userSubscriptions.filter(s => s.status === 'pending_approval').length}
              </span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-400 block font-bold">دوکاندارانی بەشداربوو</span>
              <span className="text-2xl font-black text-blue-400 font-latin">
                {userSubscriptions.filter(s => s.target === 'seller').length}
              </span>
            </div>
            <div className="p-4 bg-white/5 rounded-2xl border border-white/10">
              <span className="text-[11px] text-slate-400 block font-bold">کاپتنە بەشداربووەکان</span>
              <span className="text-2xl font-black text-teal-400 font-latin">
                {userSubscriptions.filter(s => s.target === 'captain').length}
              </span>
            </div>
          </div>
        </div>
      )}

      {/* USER ACTIVE SUBSCRIPTION STATUS BADGE & HIGHLIGHT (For Seller & Captain) */}
      {mode !== 'admin' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 border-b border-slate-100 dark:border-slate-800 pb-6">
            <div className="space-y-2">
              <div className="flex items-center gap-2 flex-wrap">
                <span className="px-3 py-1 rounded-full bg-orange-100 dark:bg-orange-950/60 text-orange-700 dark:text-orange-300 text-xs font-black border border-orange-200 dark:border-orange-800 flex items-center gap-1.5">
                  <Crown className="w-4 h-4 text-orange-500" />
                  {mode === 'captain' ? 'ئابوونەی کاپتنی شاخ' : 'ئابوونە و پەیماننامەی فرۆشگا'}
                </span>

                {activeSubscription ? (
                  <span className={`px-3 py-1 rounded-full text-xs font-bold border flex items-center gap-1.5 ${
                    activeSubscription.status === 'active' || activeSubscription.status === 'custom_agreed'
                      ? 'bg-emerald-100 text-emerald-800 border-emerald-300 dark:bg-emerald-950 dark:text-emerald-300'
                      : 'bg-amber-100 text-amber-800 border-amber-300 dark:bg-amber-950 dark:text-amber-300'
                  }`}>
                    <CheckCircle className="w-3.5 h-3.5" />
                    <span>
                      {activeSubscription.status === 'active' ? 'چالاکە ✓' : activeSubscription.status === 'custom_agreed' ? 'ڕێککەوتنی تایبەتی شاخ ✓' : 'لە چاوەڕوانی پەسەندکردندایە'}
                    </span>
                  </span>
                ) : (
                  <span className="px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-400 text-xs font-bold border border-slate-200 dark:border-slate-700">
                    پلانی ستاندارد (بێ ئابوونە)
                  </span>
                )}
              </div>

              <h2 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                {activeSubscription ? activeSubscription.planName : (mode === 'captain' ? 'ڕێککەوتنی کاپتنی ستاندارد (٧٠٪ کاپتن / ٣٠٪ شاخ)' : 'ڕێککەوتنی ستاندارد (پۆستی بێسنوور + نیسبەی فرۆش بەپێی ڕێککەوتن)')}
              </h2>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                {mode === 'captain'
                  ? 'کاپتن نیسبە دەدات بەپێی ڕێککەوتن. بە پلانی زێڕین ١٠٠٪ تەواوی کرێی گەیاندن وەردەگریت یان بەپێی ڕێککەوتنی دووقۆڵی.'
                  : 'پۆستکردنی کاڵا ١٠٠٪ بێبەرامبەرە و بێ لیمیتە (سفر د.ع). دوکاندار تەنها لە کاتی فرۆشتنی سەرکەوتوودا نیسبە دەدات بەپێی ڕێککەوتن لەگەڵ پلاتفۆرمی شاخ.'}
              </p>
            </div>

            {/* Current Benefit Box */}
            <div className="bg-gradient-to-br from-teal-700 to-emerald-600 text-white p-5 rounded-2xl text-center min-w-[200px] shadow-md space-y-1">
              <span className="text-[11px] font-bold text-teal-100 block">
                {mode === 'captain' ? 'پشکی کاپتن لە گەیاندن' : 'نیسبەی شاخ لە فرۆش'}
              </span>
              <span className="text-3xl font-black font-latin block">
                {mode === 'captain' 
                  ? (activeSubscription?.planId === 'captain_pro_monthly' ? '100%' : '70%')
                  : (activeSubscription?.commissionRateOverride !== undefined ? `${activeSubscription.commissionRateOverride}%` : (seller?.commissionRate ? `${seller.commissionRate}%` : '10%'))}
              </span>
              <span className="text-[10px] text-teal-200 block">
                {mode === 'captain' ? (activeSubscription?.planId === 'captain_pro_monthly' ? '٠٪ لێبڕین بۆ شاخ' : '٣٠٪ بۆ پلاتفۆرمی شاخ') : 'تایبەت بە کاڵاکان (جگە لە سەیارە)'}
              </span>
            </div>
          </div>

          {/* If there is an active custom note or dates */}
          {activeSubscription && (
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs">
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold">بەرواری دەستپێکردن:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-latin">
                  {new Date(activeSubscription.startDate).toLocaleDateString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold">بەرواری کۆتایی:</span>
                <span className="font-bold text-slate-800 dark:text-slate-200 font-latin">
                  {new Date(activeSubscription.endDate).toLocaleDateString()}
                </span>
              </div>
              <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-xl border border-slate-200 dark:border-slate-700">
                <span className="text-[10px] text-slate-400 block font-bold">جۆری پارەدان / سوود:</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">
                  {activeSubscription.pricePaid === 0 ? 'خۆڕایی / ڕێککەوتن' : `${activeSubscription.pricePaid.toLocaleString()} د.ع`}
                </span>
              </div>
            </div>
          )}
        </div>
      )}

      {/* BILLING CYCLE TOGGLE (For Store / Captain Subscription Plans) */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h3 className="text-lg font-black text-slate-900 dark:text-white">
            {mode === 'captain' ? 'پلان و ئابوونەکانی کاپتنی شاخ' : 'پلان و ئابوونەکانی فرۆشیارانی شاخ'}
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            پلانێکی گونجاو هەڵبژێرە بۆ بەرزکردنەوەی فرۆش و دەستکەوتی زیاتر
          </p>
        </div>

        <div className="inline-flex items-center p-1 bg-slate-100 dark:bg-slate-800 rounded-2xl border border-slate-200 dark:border-slate-700 self-start sm:self-auto">
          <button
            onClick={() => setSelectedBillingCycle('monthly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
              selectedBillingCycle === 'monthly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            مانگانە (Monthly)
          </button>
          <button
            onClick={() => setSelectedBillingCycle('yearly')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1 ${
              selectedBillingCycle === 'yearly'
                ? 'bg-white dark:bg-slate-900 text-slate-900 dark:text-white shadow-xs'
                : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'
            }`}
          >
            <span>ساڵانە (Yearly)</span>
            <span className="px-1.5 py-0.5 bg-emerald-500 text-white text-[9px] font-black rounded-md">
              ٢ مانگ داشکاندن
            </span>
          </button>
        </div>
      </div>

      {/* PLANS CARDS GRID */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {plans.map((plan) => {
          const isCurrentActive = activeSubscription?.planId === plan.id;
          const displayPrice = selectedBillingCycle === 'yearly' ? plan.price * 10 : plan.price;

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 flex flex-col justify-between transition-all relative border ${
                plan.isPopular
                  ? 'bg-gradient-to-b from-orange-50/80 to-amber-50/50 dark:from-orange-950/20 dark:to-slate-900 border-orange-300 dark:border-orange-700 shadow-lg scale-102'
                  : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-800 shadow-sm'
              }`}
            >
              {plan.isPopular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-3 py-1 bg-gradient-to-r from-orange-500 to-amber-500 text-white text-[10px] font-black rounded-full shadow-md flex items-center gap-1">
                  <Sparkles className="w-3 h-3" />
                  <span>پڕداواکراوترین</span>
                </div>
              )}

              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-black text-slate-900 dark:text-white">
                    {plan.name}
                  </h4>
                  <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">
                    {plan.nameEn}
                  </p>
                </div>

                {/* Price Display */}
                <div className="py-2 border-y border-slate-100 dark:border-slate-800">
                  {plan.billingCycle === 'custom' ? (
                    <div className="space-y-0.5">
                      <span className="text-lg font-black text-slate-900 dark:text-white">بەپێی ڕێککەوتن</span>
                      <span className="text-[10px] text-slate-400 block">دانانی مەرج لەگەڵ شاخ</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-latin">
                        {displayPrice === 0 ? '٠' : displayPrice.toLocaleString()}
                      </span>
                      <span className="text-xs font-bold text-slate-500">
                        {displayPrice === 0 ? 'د.ع (خۆڕایی)' : `د.ع / ${selectedBillingCycle === 'yearly' ? 'ساڵ' : 'مانگ'}`}
                      </span>
                    </div>
                  )}
                </div>

                {/* Features List */}
                <ul className="space-y-2.5 text-xs text-slate-700 dark:text-slate-300">
                  {plan.features.map((feat, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0 mt-0.5" />
                      <span className="leading-tight text-[11px] sm:text-xs">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>

              {/* Subscribe CTA Button */}
              <div className="mt-6 pt-4 border-t border-slate-100 dark:border-slate-800">
                <button
                  onClick={() => handleSubscribePlan(plan)}
                  disabled={isSubmitting || (isCurrentActive && plan.billingCycle !== 'custom')}
                  className={`w-full py-3 px-4 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs ${
                    isCurrentActive
                      ? 'bg-emerald-600 text-white cursor-default'
                      : plan.isPopular
                      ? 'bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white shadow-md hover:scale-102'
                      : 'bg-slate-900 hover:bg-slate-800 text-white dark:bg-slate-800 dark:hover:bg-slate-700'
                  }`}
                >
                  {isCurrentActive ? (
                    <>
                      <CheckCircle className="w-4 h-4" />
                      <span>پلانی ئێستاتە ✓</span>
                    </>
                  ) : plan.billingCycle === 'custom' ? (
                    <>
                      <FileText className="w-4 h-4" />
                      <span>داواکاری ڕێککەوتنی تایبەت</span>
                    </>
                  ) : (
                    <>
                      <Zap className="w-4 h-4" />
                      <span>بەشداریکردن لەم پلانە</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* ADMIN ALL SUBSCRIPTIONS MANAGEMENT TABLE */}
      {mode === 'admin' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h3 className="text-lg font-black text-slate-900 dark:text-white">
                تەواوی ئابوونەکان و ڕێککەوتنەکانی تۆمارکراو ({filteredSubs.length})
              </h3>
              <p className="text-xs text-slate-500 dark:text-slate-400">
                دەستکاریکردنی ڕاستەوخۆ، پەسەندکردن و بەڕێوەبردنی نیسبەکان لەلایەن شاخ
              </p>
            </div>

            {/* Filter controls */}
            <div className="flex items-center gap-2 flex-wrap">
              <div className="relative min-w-[200px]">
                <Search className="w-4 h-4 text-slate-400 absolute right-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="گەڕان بەپێی ناو یان فرۆشگا..."
                  value={adminSearch}
                  onChange={(e) => setAdminSearch(e.target.value)}
                  className="w-full pl-3 pr-9 py-2 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <select
                value={adminTargetFilter}
                onChange={(e) => setAdminTargetFilter(e.target.value as any)}
                className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="all">گشت جۆرەکان</option>
                <option value="seller">فرۆشیاران (Sellers)</option>
                <option value="captain">کاپتنەکان (Captains)</option>
              </select>

              <select
                value={adminStatusFilter}
                onChange={(e) => setAdminStatusFilter(e.target.value as any)}
                className="py-2 px-3 rounded-xl bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-700 dark:text-slate-300"
              >
                <option value="all">گشت دۆخەکان</option>
                <option value="active">چالاکەکان</option>
                <option value="pending_approval">لە چاوەڕوانی</option>
                <option value="custom_agreed">ڕێککەوتنی تایبەت</option>
                <option value="expired">بەسەرچوو</option>
              </select>
            </div>
          </div>

          {/* Subscriptions Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-start text-xs border-collapse">
              <thead>
                <tr className="bg-slate-50 dark:bg-slate-800/80 text-slate-500 border-b border-slate-200 dark:border-slate-700">
                  <th className="p-3 text-start font-bold">بەشداربوو / فرۆشگا</th>
                  <th className="p-3 text-start font-bold">جۆر</th>
                  <th className="p-3 text-start font-bold">پلان / ڕێککەوتن</th>
                  <th className="p-3 text-start font-bold">نیسبەی دیاریکراو</th>
                  <th className="p-3 text-start font-bold">نرخی دراو</th>
                  <th className="p-3 text-start font-bold">بەرواری بەسەرچوون</th>
                  <th className="p-3 text-start font-bold">دۆخ</th>
                  <th className="p-3 text-center font-bold">کردارەکان</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {filteredSubs.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="text-center py-8 text-slate-400">
                      هیچ ئابوونەیەک لەم بەشە نەدۆزرایەوە.
                    </td>
                  </tr>
                ) : (
                  filteredSubs.map((sub) => (
                    <tr key={sub.id} className="hover:bg-slate-50/60 dark:hover:bg-slate-800/40 transition-colors">
                      <td className="p-3 font-bold text-slate-900 dark:text-white">
                        <div className="flex items-center gap-2">
                          <div className="w-8 h-8 rounded-xl bg-orange-100 dark:bg-orange-950 text-orange-600 flex items-center justify-center font-bold">
                            {sub.target === 'captain' ? <Truck className="w-4 h-4" /> : <Building2 className="w-4 h-4" />}
                          </div>
                          <div>
                            <span>{sub.userName || sub.userId}</span>
                            {sub.storeOrVehicleName && (
                              <span className="text-[10px] text-slate-400 block">{sub.storeOrVehicleName}</span>
                            )}
                          </div>
                        </div>
                      </td>

                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-md text-[10px] font-black ${
                          sub.target === 'captain' ? 'bg-teal-100 text-teal-800 dark:bg-teal-950 dark:text-teal-300' : 'bg-purple-100 text-purple-800 dark:bg-purple-950 dark:text-purple-300'
                        }`}>
                          {sub.target === 'captain' ? 'کاپتنی گەیاندن' : 'دوکاندار'}
                        </span>
                      </td>

                      <td className="p-3 font-bold text-slate-800 dark:text-slate-200">
                        {sub.planName}
                      </td>

                      <td className="p-3 font-black text-orange-600 dark:text-orange-400 font-latin">
                        {sub.commissionRateOverride !== undefined ? `${sub.commissionRateOverride}%` : (sub.target === 'captain' ? '70% Captain / 30% Shakh' : '10%')}
                      </td>

                      <td className="p-3 font-bold font-latin">
                        {sub.pricePaid === 0 ? 'خۆڕایی' : `${sub.pricePaid.toLocaleString()} د.ع`}
                      </td>

                      <td className="p-3 font-latin text-slate-500">
                        {new Date(sub.endDate).toLocaleDateString()}
                      </td>

                      <td className="p-3">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-black inline-flex items-center gap-1 ${
                          sub.status === 'active' || sub.status === 'custom_agreed'
                            ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-950 dark:text-emerald-300'
                            : sub.status === 'pending_approval'
                            ? 'bg-amber-100 text-amber-800 dark:bg-amber-950 dark:text-amber-300'
                            : 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-400'
                        }`}>
                          {sub.status === 'active' ? 'چالاکە' : sub.status === 'custom_agreed' ? 'ڕێککەوتنی تایبەت' : sub.status === 'pending_approval' ? 'چاوەڕوانە' : 'بەسەرچوو'}
                        </span>
                      </td>

                      <td className="p-3 text-center">
                        <div className="flex items-center justify-center gap-1.5">
                          {/* Approve if pending */}
                          {sub.status === 'pending_approval' && (
                            <button
                              onClick={() => adminUpdateUserSubscription(sub.id, { status: 'active' })}
                              className="p-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg transition-colors cursor-pointer"
                              title="پەسەندکردنی ئابوونە"
                            >
                              <Check className="w-3.5 h-3.5" />
                            </button>
                          )}

                          {/* Edit Custom Agreement */}
                          <button
                            onClick={() => {
                              setEditingSub(sub);
                              setCustomTarget(sub.target);
                              setCustomUserId(sub.userId);
                              setCustomPlanName(sub.planName);
                              setCustomPrice(sub.pricePaid);
                              setCustomCycle(sub.billingCycle);
                              setCustomCommissionRate(sub.commissionRateOverride ?? 5);
                              setCustomNote(sub.customAgreementNote || '');
                              setShowCustomModal(true);
                            }}
                            className="p-1.5 bg-slate-100 hover:bg-slate-200 dark:bg-slate-800 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-200 rounded-lg transition-colors cursor-pointer"
                            title="دەستکاریکردنی نیسبە و ڕێککەوتن"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          {/* Delete */}
                          <button
                            onClick={() => {
                              if (confirm('دڵنیایت لە سڕینەوەی ئەم ئابوونەیە؟')) {
                                adminDeleteUserSubscription(sub.id);
                              }
                            }}
                            className="p-1.5 bg-rose-50 hover:bg-rose-100 dark:bg-rose-950/40 text-rose-600 rounded-lg transition-colors cursor-pointer"
                            title="سڕینەوە"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CUSTOM AGREEMENT / EDIT MODAL */}
      {showCustomModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl max-w-lg w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <Crown className="w-5 h-5 text-amber-500" />
                <h3 className="font-black text-slate-900 dark:text-white text-base">
                  {editingSub ? 'دەستکاریکردنی ئابوونە و نیسبەی فرۆش' : 'ڕێککەوتنی تایبەتی شاخ (Custom Shakh Agreement)'}
                </h3>
              </div>
              <button
                onClick={() => {
                  setShowCustomModal(false);
                  setEditingSub(null);
                }}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleAdminSaveCustom} className="space-y-4 text-xs">
              {/* Target & User Selector if Super Admin */}
              {isSuperAdmin && !editingSub && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      جۆری بەشداربوو:
                    </label>
                    <select
                      value={customTarget}
                      onChange={(e) => setCustomTarget(e.target.value as any)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                    >
                      <option value="seller">فرۆشیار (Seller)</option>
                      <option value="captain">کاپتنی گەیاندن (Captain)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                      دیاریکردنی بەکارهێنەر:
                    </label>
                    <select
                      value={customUserId}
                      onChange={(e) => setCustomUserId(e.target.value)}
                      className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                    >
                      <option value="">هەڵبژێرە...</option>
                      {customTarget === 'seller'
                        ? sellers.map(s => <option key={s.id} value={s.userId || s.id}>{s.storeName} ({s.category})</option>)
                        : allPlatformCaptains.map(c => <option key={c.id} value={c.id}>{c.name} ({c.city || 'Erbil'})</option>)}
                    </select>
                  </div>
                </div>
              )}

              {/* Plan Title */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ناوی ڕێککەوتن یان پلان:
                </label>
                <input
                  type="text"
                  required
                  value={customPlanName}
                  onChange={(e) => setCustomPlanName(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-bold text-slate-900 dark:text-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Commission Rate Override & Price */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نیسبەی ڕێککەوتوو لەسەر (٪):
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="50"
                    step="0.5"
                    value={customCommissionRate}
                    onChange={(e) => setCustomCommissionRate(parseFloat(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-latin font-bold text-slate-900 dark:text-white"
                  />
                  <span className="text-[10px] text-slate-400 mt-1 block">٠٪ واتە سفر کۆمسیۆن</span>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    نرخی ئابوونە (د.ع):
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1000"
                    value={customPrice}
                    onChange={(e) => setCustomPrice(parseInt(e.target.value) || 0)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 font-latin font-bold text-slate-900 dark:text-white"
                  />
                </div>
              </div>

              {/* Duration / Cycle */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    خولی پارەدان:
                  </label>
                  <select
                    value={customCycle}
                    onChange={(e) => setCustomCycle(e.target.value as any)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-bold"
                  >
                    <option value="monthly">مانگانە (Monthly)</option>
                    <option value="yearly">ساڵانە (Yearly)</option>
                    <option value="weekly">هەفتانە (Weekly)</option>
                    <option value="custom">تایبەت (Custom)</option>
                  </select>
                </div>

                <div>
                  <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                    ماوەی چالاکی (بە ڕۆژ):
                  </label>
                  <input
                    type="number"
                    min="1"
                    max="3650"
                    value={customDaysDuration}
                    onChange={(e) => setCustomDaysDuration(parseInt(e.target.value) || 30)}
                    className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-2.5 font-latin font-bold"
                  />
                </div>
              </div>

              {/* Notes */}
              <div>
                <label className="block font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تێبینی یان مەرجەکانی ڕێککەوتنی شاخ:
                </label>
                <textarea
                  rows={3}
                  placeholder="مەرجەکانی بەڕێوەبەرایەتی شاخ، هۆکاری داشکاندن یان دەسەڵاتی تایبەت..."
                  value={customNote}
                  onChange={(e) => setCustomNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => {
                    setShowCustomModal(false);
                    setEditingSub(null);
                  }}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800 dark:hover:text-white"
                >
                  داخستن
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer flex items-center gap-1.5"
                >
                  <Check className="w-4 h-4" />
                  <span>{editingSub ? 'نوێکردنەوە و پاشەکەوت' : 'تۆمارکردنی ڕێککەوتن'}</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
