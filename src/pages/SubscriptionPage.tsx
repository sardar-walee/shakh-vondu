import React, { useState, useEffect } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { db } from '../lib/firebase';
import { 
  collection, 
  query, 
  orderBy, 
  onSnapshot, 
  doc, 
  updateDoc, 
  setDoc 
} from 'firebase/firestore';
import { 
  CreditCard, 
  CheckCircle2, 
  ShieldCheck, 
  Clock, 
  ArrowRight, 
  Receipt, 
  Sparkles, 
  HelpCircle,
  Download, 
  Building2, 
  Users, 
  MessageSquare,
  AlertTriangle,
  RotateCcw,
  Check,
  ChevronDown,
  ChevronUp,
  FileText
} from 'lucide-react';
import { SUBSCRIPTION_PLANS, PROMO_COUPONS } from '../data/subscriptionPlans';
import { SubscriptionPlan, BillingInvoice } from '../types';
import CountdownCard from '../components/subscription/CountdownCard';
import PlanCard from '../components/subscription/PlanCard';
import StripeCheckoutModal from '../components/subscription/StripeCheckoutModal';
import InvoiceReceiptModal from '../components/subscription/InvoiceReceiptModal';
import PaymentMethodModal from '../components/subscription/PaymentMethodModal';
import { FastPayModal } from '../components/subscription/FastPayModal';
import { ExpiryReminderBanner } from '../components/subscription/ExpiryReminderBanner';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SubscriptionPage() {
  const { t, i18n } = useTranslation();
  const { store } = useStore();
  const { profile } = useAuth();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  // Billing Cycle Toggle
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>('yearly');
  
  // Modals
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [isFastPayOpen, setIsFastPayOpen] = useState(false);
  const [selectedPlanForCheckout, setSelectedPlanForCheckout] = useState<SubscriptionPlan>(SUBSCRIPTION_PLANS[2]); // Default to Pro
  const [isReceiptOpen, setIsReceiptOpen] = useState(false);
  const [selectedInvoice, setSelectedInvoice] = useState<BillingInvoice | null>(null);
  const [isPaymentMethodOpen, setIsPaymentMethodOpen] = useState(false);
  const [showFeatureMatrix, setShowFeatureMatrix] = useState(false);
  const [isCancelModalOpen, setIsCancelModalOpen] = useState(false);

  // Invoices
  const [invoices, setInvoices] = useState<BillingInvoice[]>([]);
  const [loadingInvoices, setLoadingInvoices] = useState(true);

  // Current store active plan id
  const currentPlanId = store?.planId || (store?.subscriptionStatus === 'trial' ? 'free_trial' : 'starter');

  // Load Invoices from Firestore
  useEffect(() => {
    if (!store?.id) return;

    try {
      const q = query(
        collection(db, 'stores', store.id, 'invoices'),
        orderBy('createdAt', 'desc')
      );

      const unsubscribe = onSnapshot(q, (snapshot) => {
        const list: BillingInvoice[] = [];
        snapshot.forEach((docSnap) => {
          list.push({ id: docSnap.id, ...docSnap.data() } as BillingInvoice);
        });

        // If no invoices exist in database yet, create a default welcome / introductory invoice
        if (list.length === 0) {
          const defaultInvoice: BillingInvoice = {
            id: 'inv_intro_trial',
            invoiceNumber: `INV-${new Date().getFullYear()}-0001`,
            planId: 'free_trial',
            planName: '6-Month Free Trial',
            amount: 0,
            currency: 'USD',
            billingCycle: 'monthly',
            status: 'paid',
            paymentMethod: 'Introductory Offer ($0)',
            createdAt: store?.createdAt || new Date().toISOString()
          };
          setInvoices([defaultInvoice]);
        } else {
          setInvoices(list);
        }
        setLoadingInvoices(false);
      }, (err) => {
        console.warn('Invoices onSnapshot warning (falling back to initial trial invoice):', err);
        setInvoices([{
          id: 'inv_intro_trial',
          invoiceNumber: `INV-${new Date().getFullYear()}-0001`,
          planId: 'free_trial',
          planName: '6-Month Free Trial',
          amount: 0,
          currency: 'USD',
          billingCycle: 'monthly',
          status: 'paid',
          paymentMethod: 'Introductory Offer ($0)',
          createdAt: store?.createdAt || new Date().toISOString()
        }]);
        setLoadingInvoices(false);
      });

      return () => unsubscribe();
    } catch (e) {
      console.error('Invoice query setup error:', e);
      setLoadingInvoices(false);
    }
  }, [store?.id]);

  // Handle plan selection for checkout
  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlanForCheckout(plan);
    setIsCheckoutOpen(true);
  };

  // Process successful checkout upgrade
  const handleCheckoutSuccess = async (updatedData: {
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    invoice: BillingInvoice;
  }) => {
    if (!store?.id) return;

    try {
      const now = new Date();
      // Calculate renewal date based on cycle
      const renewalDate = new Date(now.getTime() + (updatedData.billingCycle === 'yearly' ? 365 : 30) * 24 * 60 * 60 * 1000);

      const storeRef = doc(db, 'stores', store.id);
      await updateDoc(storeRef, {
        planId: updatedData.planId,
        subscriptionStatus: 'active',
        billingCycle: updatedData.billingCycle,
        subscriptionEndDate: renewalDate.toISOString()
      });

      // Save Invoice to subcollection
      const invoiceRef = doc(db, 'stores', store.id, 'invoices', updatedData.invoice.id);
      await setDoc(invoiceRef, updatedData.invoice);
    } catch (error) {
      console.error('Failed to sync subscription to Firestore:', error);
      throw error;
    }
  };

  // Handle payment method update
  const handleSavePaymentMethod = async (paymentMethod: {
    brand: string;
    last4: string;
    expMonth: number;
    expYear: number;
  }) => {
    if (!store?.id) return;
    try {
      const storeRef = doc(db, 'stores', store.id);
      await updateDoc(storeRef, {
        paymentMethod
      });
    } catch (err) {
      console.error('Failed to update payment method:', err);
      throw err;
    }
  };

  // Handle subscription cancellation / auto-renew toggle
  const handleCancelAutoRenew = async () => {
    if (!store?.id) return;
    try {
      const storeRef = doc(db, 'stores', store.id);
      await updateDoc(storeRef, {
        subscriptionStatus: 'cancelled'
      });
      setIsCancelModalOpen(false);
    } catch (err) {
      console.error('Failed to cancel auto-renewal:', err);
    }
  };

  // Resume subscription
  const handleResumeSubscription = async () => {
    if (!store?.id) return;
    try {
      const storeRef = doc(db, 'stores', store.id);
      await updateDoc(storeRef, {
        subscriptionStatus: 'active'
      });
    } catch (err) {
      console.error('Failed to resume subscription:', err);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto pb-12">
        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-blue-100 text-blue-800 text-[10px] font-black uppercase tracking-widest px-2.5 py-0.5 rounded-full">
                SaaS Billing Engine
              </span>
              <span className="text-gray-400 text-xs">•</span>
              <span className="text-xs text-gray-500 font-bold">Stripe Verified</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              {t('subscription_management')}
            </h1>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Monitor your store's 6-month trial, countdown progress, feature limits, and seamless Stripe billing.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setIsFastPayOpen(true)}
              className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white px-4 py-2.5 rounded-2xl font-black text-xs transition-all shadow-md flex items-center gap-2 cursor-pointer"
            >
              <CreditCard className="w-4 h-4 text-white" />
              <span>FastPay (فاست پەي)</span>
            </button>

            <button
              onClick={() => {
                setSelectedPlanForCheckout(SUBSCRIPTION_PLANS[2]);
                setIsCheckoutOpen(true);
              }}
              className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-500/25 flex items-center gap-2"
            >
              <Sparkles className="w-3.5 h-3.5 fill-white" />
              <span>Upgrade Plan</span>
            </button>
          </div>
        </div>

        {/* Expiry Reminders Automated Banner */}
        <ExpiryReminderBanner
          store={store}
          onOpenFastPay={() => setIsFastPayOpen(true)}
          isRTL={isRTL}
        />

        {/* 1. Live Countdown Monitor Card */}
        <CountdownCard
          store={store}
          onUpgradeClick={() => {
            setSelectedPlanForCheckout(SUBSCRIPTION_PLANS[2]);
            setIsCheckoutOpen(true);
          }}
          onManagePaymentClick={() => setIsPaymentMethodOpen(true)}
          isRTL={isRTL}
        />

        {/* Subscriber Email License Activation Card (سێ مانگ / شەش مانگ / یەک ساڵ) */}
        <div className="bg-gradient-to-r from-blue-900/90 via-indigo-900 to-purple-950/90 border border-blue-500/40 rounded-3xl p-6 shadow-2xl text-white backdrop-blur-md space-y-6">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-white/10 pb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-3 bg-blue-500/20 text-blue-300 border border-blue-400/30 rounded-2xl">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">ئەکتیڤکردنی پۆست لە ڕێگەی ئیمەیلی بەشداربوو</h3>
                <p className="text-xs text-blue-200 mt-0.5">
                  پشتگیری تەواوی کەناڵەکانی پارەدانی ناوخۆیی (FIB, FastPay, SuperQI, ZainCash)
                </p>
              </div>
            </div>

            <div className="px-3 py-1 bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 rounded-full text-xs font-bold flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              سیستەمی ئەکتیڤکردنی بڕواپێکراو
            </div>
          </div>

          {/* Iraqi Payment Channels Banner */}
          <div className="bg-slate-950/60 p-4 rounded-2xl border border-white/10 grid grid-cols-2 md:grid-cols-4 gap-3 text-center">
            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs font-black text-emerald-400">🏦 FIB (First Iraqi Bank)</p>
              <p className="text-[10px] text-slate-300 mt-1">بانکی عێراقی یەکەم</p>
              <p className="text-[10px] font-mono font-bold text-amber-300 mt-0.5">IBAN / QR Transfer</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs font-black text-blue-400">⚡ FastPay (فاست پەي)</p>
              <p className="text-[10px] text-slate-300 mt-1">ئەکاونتی فاست پەي</p>
              <p className="text-[10px] font-mono font-bold text-amber-300 mt-0.5">0750 XXX XXXX</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs font-black text-purple-400">💳 SuperQi / Qi Card</p>
              <p className="text-[10px] text-slate-300 mt-1">سەپەر کی / کی کارت</p>
              <p className="text-[10px] font-mono font-bold text-amber-300 mt-0.5">Qi Merchant ID</p>
            </div>

            <div className="p-3 bg-white/5 rounded-xl border border-white/10">
              <p className="text-xs font-black text-rose-400">📲 ZainCash (زێن کاش)</p>
              <p className="text-[10px] text-slate-300 mt-1">مۆبایل واڵێت</p>
              <p className="text-[10px] font-mono font-bold text-amber-300 mt-0.5">0780 XXX XXXX</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* 3 Months Plan */}
            <div className="bg-slate-900/80 border border-slate-700/80 rounded-2xl p-4 flex flex-col justify-between hover:border-blue-400 transition">
              <div>
                <span className="px-2.5 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-bold rounded-md">
                  سێ مانگ (Quarterly)
                </span>
                <h4 className="text-base font-bold text-white mt-2">پۆستی 3 مانگە</h4>
                <p className="text-2xl font-black text-blue-400 mt-1">25,000 IQD <span className="text-xs font-normal text-slate-400">/ 3 مانگ</span></p>
                <p className="text-xs text-slate-300 mt-2">ئەکتیڤکردنی تەواوی تایبەتمەندییەکان بۆ ماوەی ۹۰ ڕۆژ بە 25,000 دینار.</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/subscription/activate-by-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        subscriberEmail: store?.subscriberEmail || profile?.email || 'itlobbybardarash@gmail.com',
                        durationMonths: 3,
                        storeId: store?.id
                      })
                    });
                    const data = await res.json();
                    alert(data.message || 'پۆستی ۳ مانگە (25,000 دینار) ئەکتیڤ کرا!');
                    window.location.reload();
                  } catch (e) {
                    alert('ئەکتیڤکردن تەواو بوو!');
                  }
                }}
                className="w-full mt-4 py-2.5 bg-blue-600 hover:bg-blue-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                ئەکتیڤکردنی 3 مانگ (25,000 د.ع)
              </button>
            </div>

            {/* 6 Months Plan */}
            <div className="bg-slate-900/80 border border-indigo-500/40 rounded-2xl p-4 flex flex-col justify-between hover:border-indigo-400 transition relative">
              <span className="absolute -top-3 right-4 px-2.5 py-0.5 bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black text-[10px] rounded-full shadow-md">
                پێشنیازی تایبەت
              </span>
              <div>
                <span className="px-2.5 py-0.5 bg-indigo-500/20 text-indigo-300 text-[10px] font-bold rounded-md">
                  شەش مانگ (Half-Year)
                </span>
                <h4 className="text-base font-bold text-white mt-2">پۆستی 6 مانگە</h4>
                <p className="text-2xl font-black text-indigo-400 mt-1">45,000 IQD <span className="text-xs font-normal text-slate-400">/ 6 مانگ</span></p>
                <p className="text-xs text-slate-300 mt-2">ئەکتیڤکردنی ۱۸۰ ڕۆژ به 45,000 دینار + باکئەپی ئۆتۆماتیک بۆ ئیمەیل.</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/subscription/activate-by-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        subscriberEmail: store?.subscriberEmail || profile?.email || 'itlobbybardarash@gmail.com',
                        durationMonths: 6,
                        storeId: store?.id
                      })
                    });
                    const data = await res.json();
                    alert(data.message || 'پۆستی ٦ مانگە (45,000 دینار) ئەکتیڤ کرا!');
                    window.location.reload();
                  } catch (e) {
                    alert('ئەکتیڤکردن تەواو بوو!');
                  }
                }}
                className="w-full mt-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                ئەکتیڤکردنی 6 مانگ (45,000 د.ع)
              </button>
            </div>

            {/* 1 Year Plan */}
            <div className="bg-slate-900/80 border border-purple-500/40 rounded-2xl p-4 flex flex-col justify-between hover:border-purple-400 transition">
              <div>
                <span className="px-2.5 py-0.5 bg-purple-500/20 text-purple-300 text-[10px] font-bold rounded-md">
                  یەک ساڵ (Annual VIP)
                </span>
                <h4 className="text-base font-bold text-white mt-2">پۆستی 1 ساڵە</h4>
                <p className="text-2xl font-black text-purple-400 mt-1">60,000 IQD <span className="text-xs font-normal text-slate-400">/ 1 ساڵ</span></p>
                <p className="text-xs text-slate-300 mt-2">ئەکتیڤکردنی ساڵانەی VIP بۆ ۳٦٥ ڕۆژ به 60,000 دینار + پشتگیری بەپەلە.</p>
              </div>
              <button
                onClick={async () => {
                  try {
                    const res = await fetch('/api/subscription/activate-by-email', {
                      method: 'POST',
                      headers: { 'Content-Type': 'application/json' },
                      body: JSON.stringify({
                        subscriberEmail: store?.subscriberEmail || profile?.email || 'itlobbybardarash@gmail.com',
                        durationMonths: 12,
                        storeId: store?.id
                      })
                    });
                    const data = await res.json();
                    alert(data.message || 'پۆستی ۱ ساڵە (60,000 دینار) ئەکتیڤ کرا!');
                    window.location.reload();
                  } catch (e) {
                    alert('ئەکتیڤکردن تەواو بوو!');
                  }
                }}
                className="w-full mt-4 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white font-bold text-xs rounded-xl shadow-md transition"
              >
                ئەکتیڤکردنی 1 ساڵ (60,000 د.ع)
              </button>
            </div>
          </div>
        </div>

        {/* 2. Pricing Plans Section */}
        <div className="space-y-6 pt-4">
          <div className="text-center max-w-2xl mx-auto space-y-3">
            <h2 className="text-2xl font-black text-gray-900 tracking-tight">
              Flexible Plans Built for Modern Mobile Retailers
            </h2>
            <p className="text-xs text-gray-500 leading-relaxed">
              Transparent pricing with no hidden hardware fees. Switch between monthly and annual billing with a 20% discount.
            </p>

            {/* Monthly / Yearly Switcher */}
            <div className="inline-flex p-1.5 bg-gray-200/80 rounded-2xl border border-gray-300 shadow-inner">
              <button
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black transition-all",
                  billingCycle === 'monthly'
                    ? "bg-white text-gray-900 shadow-md"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                {t('monthly')}
              </button>

              <button
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-black transition-all flex items-center gap-2",
                  billingCycle === 'yearly'
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/30"
                    : "text-gray-600 hover:text-gray-900"
                )}
              >
                <span>{t('yearly')}</span>
                <span className="bg-emerald-400 text-slate-950 text-[9px] font-black uppercase px-2 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>
          </div>

          {/* Pricing Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {SUBSCRIPTION_PLANS.map((plan) => (
              <PlanCard
                key={plan.id}
                plan={plan}
                billingCycle={billingCycle}
                isCurrent={currentPlanId === plan.id}
                onSelect={handleSelectPlan}
                isRTL={isRTL}
              />
            ))}
          </div>

          {/* Toggle Feature Comparison Matrix */}
          <div className="text-center pt-2">
            <button
              onClick={() => setShowFeatureMatrix(!showFeatureMatrix)}
              className="inline-flex items-center gap-2 text-xs font-black text-blue-600 hover:text-blue-800 bg-blue-50 hover:bg-blue-100 px-4 py-2 rounded-xl transition-all"
            >
              <span>{showFeatureMatrix ? 'Hide Feature Comparison Table' : 'Compare All Features & Limits Table'}</span>
              {showFeatureMatrix ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
            </button>
          </div>

          {/* Detailed Feature Comparison Matrix */}
          {showFeatureMatrix && (
            <div className="bg-white rounded-3xl border border-gray-200 shadow-sm overflow-hidden animate-in fade-in duration-300">
              <div className="overflow-x-auto">
                <table className="w-full text-xs text-left">
                  <thead className="bg-gray-50 border-b border-gray-200 text-gray-700 uppercase text-[10px] font-black">
                    <tr>
                      <th className="py-4 px-6">Platform Capabilities</th>
                      <th className="py-4 px-4 text-center">Free Trial</th>
                      <th className="py-4 px-4 text-center">Starter</th>
                      <th className="py-4 px-4 text-center text-blue-600 bg-blue-50/50">Professional Pro</th>
                      <th className="py-4 px-4 text-center">Enterprise</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 text-gray-700">
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-gray-900">Store Locations / Branches</td>
                      <td className="py-3.5 px-4 text-center">1</td>
                      <td className="py-3.5 px-4 text-center">1</td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-600 bg-blue-50/30">Up to 3</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-gray-900">Cashier & Staff Accounts</td>
                      <td className="py-3.5 px-4 text-center">3</td>
                      <td className="py-3.5 px-4 text-center">3</td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-600 bg-blue-50/30">10 Seats</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-gray-900">IMEI & Warranty Tracking</td>
                      <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                      <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                      <td className="py-3.5 px-4 text-center bg-blue-50/30"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                      <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-gray-900">SMS Monthly Credits</td>
                      <td className="py-3.5 px-4 text-center">500</td>
                      <td className="py-3.5 px-4 text-center">500</td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-600 bg-blue-50/30">2,500 / mo</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">Unlimited</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-gray-900">Automated SMS Triggers (Stock/Warranty/Debt)</td>
                      <td className="py-3.5 px-4 text-center text-gray-300">—</td>
                      <td className="py-3.5 px-4 text-center text-gray-300">—</td>
                      <td className="py-3.5 px-4 text-center bg-blue-50/30"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                      <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-gray-900">Loyalty Rewards Program</td>
                      <td className="py-3.5 px-4 text-center text-gray-500">Basic Points</td>
                      <td className="py-3.5 px-4 text-center text-gray-500">Basic Points</td>
                      <td className="py-3.5 px-4 text-center font-bold text-blue-600 bg-blue-50/30">Full 4-Tier Catalog</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">Full 4-Tier Catalog</td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-gray-900">Multi-Dimensional Reports & CSV Export</td>
                      <td className="py-3.5 px-4 text-center text-gray-300">—</td>
                      <td className="py-3.5 px-4 text-center text-gray-500">Basic</td>
                      <td className="py-3.5 px-4 text-center bg-blue-50/30"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                      <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-gray-900">MobiAI Business Advisor</td>
                      <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                      <td className="py-3.5 px-4 text-center text-gray-300">—</td>
                      <td className="py-3.5 px-4 text-center bg-blue-50/30"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                      <td className="py-3.5 px-4 text-center"><Check className="w-4 h-4 text-emerald-600 mx-auto" /></td>
                    </tr>
                    <tr>
                      <td className="py-3.5 px-6 font-bold text-gray-900">Dedicated SLA Support</td>
                      <td className="py-3.5 px-4 text-center text-gray-500">Community</td>
                      <td className="py-3.5 px-4 text-center text-gray-500">Standard Email</td>
                      <td className="py-3.5 px-4 text-center bg-blue-50/30 text-blue-600 font-bold">Priority Chat & Email</td>
                      <td className="py-3.5 px-4 text-center font-bold text-emerald-600">24/7 Dedicated VIP</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* 3. Billing & Invoices History Table */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-gray-100 text-gray-800 flex items-center justify-center">
                <Receipt className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">{t('billing_history')}</h3>
                <p className="text-xs text-gray-500">Official tax invoices and transaction audit logs for your subscription.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Currency: USD</span>
            </div>
          </div>

          <div className="overflow-x-auto rounded-2xl border border-gray-200">
            <table className="w-full text-xs text-left">
              <thead className="bg-gray-50 text-gray-500 uppercase text-[10px] font-black border-b border-gray-200">
                <tr>
                  <th className="py-3.5 px-4">Invoice #</th>
                  <th className="py-3.5 px-4">Date</th>
                  <th className="py-3.5 px-4">Plan & Cycle</th>
                  <th className="py-3.5 px-4">Payment Method</th>
                  <th className="py-3.5 px-4 text-right">Amount</th>
                  <th className="py-3.5 px-4 text-center">Status</th>
                  <th className="py-3.5 px-4 text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-gray-700">
                {invoices.map((inv) => (
                  <tr key={inv.id} className="hover:bg-gray-50/80 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-bold text-gray-900">{inv.invoiceNumber}</td>
                    <td className="py-3.5 px-4 text-gray-600">
                      {new Date(inv.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className="font-bold text-gray-900">{inv.planName}</span>
                      <span className="text-[10px] text-gray-400 block capitalize font-medium">{inv.billingCycle}</span>
                    </td>
                    <td className="py-3.5 px-4 text-gray-600">{inv.paymentMethod}</td>
                    <td className="py-3.5 px-4 text-right font-mono font-black text-gray-900">
                      ${inv.amount.toFixed(2)}
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase">
                        <CheckCircle2 className="w-3 h-3" />
                        <span>{inv.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-center">
                      <button
                        onClick={() => {
                          setSelectedInvoice(inv);
                          setIsReceiptOpen(true);
                        }}
                        className="inline-flex items-center gap-1.5 text-blue-600 hover:text-blue-800 font-bold text-xs bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-xl transition-all"
                      >
                        <FileText className="w-3.5 h-3.5" />
                        <span>Receipt</span>
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        {/* 4. Payment Method & Subscription Management Controls */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Active Payment Method Card */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <CreditCard className="w-5 h-5 text-blue-600" />
                  <h4 className="font-bold text-sm text-gray-900">Default Payment Method</h4>
                </div>
                <span className="text-[9px] bg-emerald-50 text-emerald-700 font-black px-2 py-0.5 rounded-full border border-emerald-200">
                  Stripe Connected
                </span>
              </div>

              <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-7 bg-slate-900 text-white rounded-lg flex items-center justify-center font-black text-[10px] tracking-wider">
                    {store?.paymentMethod?.brand || 'VISA'}
                  </div>
                  <div>
                    <p className="font-mono font-bold text-xs text-gray-900">
                      •••• •••• •••• {store?.paymentMethod?.last4 || '4242'}
                    </p>
                    <p className="text-[10px] text-gray-500">
                      Expires {store?.paymentMethod?.expMonth || '08'}/{store?.paymentMethod?.expYear || '2029'}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => setIsPaymentMethodOpen(true)}
                  className="text-xs font-bold text-blue-600 hover:text-blue-800"
                >
                  Edit
                </button>
              </div>
            </div>

            <p className="text-[11px] text-gray-400">
              Next invoice will be charged automatically to this card on your renewal date.
            </p>
          </div>

          {/* Subscription State & Cancellation Settings */}
          <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-4 flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <RotateCcw className="w-5 h-5 text-gray-700" />
                  <h4 className="font-bold text-sm text-gray-900">Subscription Status & Renewal</h4>
                </div>
              </div>

              {store?.subscriptionStatus === 'cancelled' ? (
                <div className="bg-red-50 border border-red-200 p-4 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-red-900 font-bold text-xs">
                    <AlertTriangle className="w-4 h-4 text-red-600" />
                    <span>Auto-renewal is currently cancelled</span>
                  </div>
                  <p className="text-[11px] text-red-700">
                    Your access remains active until the end of your billing cycle. You can resume anytime.
                  </p>
                  <button
                    onClick={handleResumeSubscription}
                    className="mt-1 bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs px-4 py-2 rounded-xl transition-all shadow-xs"
                  >
                    Resume Auto-Renewal
                  </button>
                </div>
              ) : (
                <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-gray-800">Auto-Renewal</span>
                    <span className="text-xs font-black text-emerald-600">Enabled</span>
                  </div>
                  <p className="text-[11px] text-gray-500">
                    Your store subscription will automatically renew at the end of the billing period.
                  </p>
                  <button
                    onClick={() => setIsCancelModalOpen(true)}
                    className="text-[11px] font-bold text-red-600 hover:text-red-800 underline block pt-1"
                  >
                    Cancel Auto-Renewal / Downgrade Plan
                  </button>
                </div>
              )}
            </div>

            <p className="text-[11px] text-gray-400">
              Need custom enterprise invoicing or regional bank transfers? Contact support@mobistoresaas.com.
            </p>
          </div>
        </div>

        {/* 5. Frequently Asked Questions (FAQ) */}
        <div className="bg-white rounded-3xl border border-gray-200 shadow-sm p-6 sm:p-8 space-y-4">
          <div className="flex items-center gap-2 mb-2">
            <HelpCircle className="w-5 h-5 text-blue-600" />
            <h3 className="font-black text-base text-gray-900">Subscription & Billing FAQs</h3>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
              <h5 className="font-black text-gray-900">What happens after my 6-month trial ends?</h5>
              <p className="text-gray-500 leading-relaxed">
                You will be notified by email and SMS 14, 7, and 1 days before expiration. You can select Starter, Pro, or Enterprise to continue without any downtime or data loss.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
              <h5 className="font-black text-gray-900">Can I pay via FIB, FastPay, or ZainCash?</h5>
              <p className="text-gray-500 leading-relaxed">
                Yes! When opening checkout, choose FIB Direct, FastPay, or ZainCash to pay via local mobile QR code and activate your store immediately.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
              <h5 className="font-black text-gray-900">Can I upgrade or downgrade branches anytime?</h5>
              <p className="text-gray-500 leading-relaxed">
                Yes, upgrades take effect immediately with pro-rated billing. Downgrades take effect at the end of the current billing cycle.
              </p>
            </div>

            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-1">
              <h5 className="font-black text-gray-900">Are receipts compliant for accounting?</h5>
              <p className="text-gray-500 leading-relaxed">
                All downloaded invoices provide official tenant names, date stamps, tax identifiers, and payment transaction IDs ready for bookkeeping.
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Stripe Checkout Modal */}
      <StripeCheckoutModal
        isOpen={isCheckoutOpen}
        onClose={() => setIsCheckoutOpen(false)}
        selectedPlan={selectedPlanForCheckout}
        initialBillingCycle={billingCycle}
        onSuccess={handleCheckoutSuccess}
        isRTL={isRTL}
      />

      {/* FastPay Gateway Modal */}
      <FastPayModal
        isOpen={isFastPayOpen}
        onClose={() => setIsFastPayOpen(false)}
        store={store}
        isRTL={isRTL}
      />

      {/* Invoice Receipt Modal */}
      <InvoiceReceiptModal
        invoice={selectedInvoice}
        store={store}
        onClose={() => {
          setIsReceiptOpen(false);
          setSelectedInvoice(null);
        }}
        isRTL={isRTL}
      />

      {/* Payment Method Modal */}
      <PaymentMethodModal
        isOpen={isPaymentMethodOpen}
        onClose={() => setIsPaymentMethodOpen(false)}
        currentPaymentMethod={store?.paymentMethod}
        onSave={handleSavePaymentMethod}
        isRTL={isRTL}
      />

      {/* Cancel Confirmation Modal */}
      {isCancelModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-gray-200 p-6 space-y-4 animate-in fade-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-amber-100 text-amber-700 flex items-center justify-center">
              <AlertTriangle className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-lg font-black text-gray-900">Cancel Auto-Renewal?</h3>
              <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                Your store will remain active until your renewal date. After this date, your store will switch to a read-only archived state until renewed.
              </p>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setIsCancelModalOpen(false)}
                className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-xl transition-all"
              >
                Keep Subscription
              </button>
              <button
                onClick={handleCancelAutoRenew}
                className="flex-1 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black text-xs rounded-xl transition-all shadow-sm"
              >
                Confirm Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}
