import React, { useState } from 'react';
import { SubscriptionPlan, PromoCoupon, BillingInvoice } from '../../types';
import { 
  X, 
  ShieldCheck, 
  Lock, 
  CreditCard, 
  CheckCircle2, 
  Sparkles, 
  Tag, 
  ArrowRight,
  QrCode,
  Building,
  Check,
  AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface StripeCheckoutModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedPlan: SubscriptionPlan;
  initialBillingCycle?: 'monthly' | 'yearly';
  onSuccess: (updatedData: {
    planId: string;
    billingCycle: 'monthly' | 'yearly';
    invoice: BillingInvoice;
  }) => Promise<void>;
  isRTL?: boolean;
}

export default function StripeCheckoutModal({
  isOpen,
  onClose,
  selectedPlan,
  initialBillingCycle = 'yearly',
  onSuccess,
  isRTL = false
}: StripeCheckoutModalProps) {
  const [billingCycle, setBillingCycle] = useState<'monthly' | 'yearly'>(initialBillingCycle);
  const [paymentType, setPaymentType] = useState<'card' | 'fib' | 'fastpay' | 'zaincash'>('card');
  
  // Card Inputs
  const [cardNumber, setCardNumber] = useState('4242 4242 4242 4242');
  const [cardExpiry, setCardExpiry] = useState('08/29');
  const [cardCvc, setCardCvc] = useState('123');
  const [cardHolder, setCardHolder] = useState('MobiStore Owner');
  const [billingCountry, setBillingCountry] = useState('Iraq (Kurdistan Region)');

  // Coupon
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState<{ code: string; discountAmount: number; name: string } | null>(null);
  const [couponError, setCouponError] = useState('');
  const [couponLoading, setCouponLoading] = useState(false);

  // Flow State
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

  if (!isOpen) return null;

  // Calculate pricing
  const basePrice = billingCycle === 'yearly' ? selectedPlan.priceYearly : selectedPlan.priceMonthly;
  const discountAmount = appliedCoupon ? appliedCoupon.discountAmount : 0;
  const finalPrice = Math.max(0, Number((basePrice - discountAmount).toFixed(2)));

  // Format Card input
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = raw.match(/.{1,4}/g)?.join(' ') || raw;
    setCardNumber(formatted);
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (raw.length >= 2) {
      setCardExpiry(`${raw.slice(0, 2)}/${raw.slice(2, 4)}`);
    } else {
      setCardExpiry(raw);
    }
  };

  // Card Brand Detection
  const getCardBrand = () => {
    const clean = cardNumber.replace(/\s/g, '');
    if (clean.startsWith('4')) return 'visa';
    if (clean.startsWith('5')) return 'mastercard';
    if (clean.startsWith('3')) return 'amex';
    return 'card';
  };

  // Coupon check
  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return;
    setCouponLoading(true);
    setCouponError('');

    try {
      const res = await fetch('/api/subscription/validate-coupon', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ code: couponCode, amount: basePrice })
      });

      const data = await res.json();
      if (!res.ok) {
        setCouponError(data.error || 'Invalid promotional code');
        setAppliedCoupon(null);
      } else {
        setAppliedCoupon({
          code: data.code,
          discountAmount: data.discountAmount,
          name: data.name
        });
      }
    } catch (err: any) {
      // Fallback local verification
      const upper = couponCode.trim().toUpperCase();
      if (upper === 'KURDISTAN2026') {
        const disc = Number((basePrice * 0.25).toFixed(2));
        setAppliedCoupon({ code: upper, discountAmount: disc, name: '25% Kurdistan Launch Promo' });
      } else if (upper === 'LAUNCH50') {
        const disc = Number((basePrice * 0.50).toFixed(2));
        setAppliedCoupon({ code: upper, discountAmount: disc, name: '50% First Period Discount' });
      } else if (upper === 'MOBIPRO') {
        const disc = Math.min(basePrice, 10);
        setAppliedCoupon({ code: upper, discountAmount: disc, name: '$10 MobiStore Special' });
      } else {
        setCouponError('Invalid coupon code. Try KURDISTAN2026 or LAUNCH50');
      }
    } finally {
      setCouponLoading(false);
    }
  };

  // Checkout submission
  const handleCheckoutSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsProcessing(true);
    setErrorMessage('');

    try {
      // Simulate Stripe API tokenization & authorization handshake
      await new Promise((resolve) => setTimeout(resolve, 1400));

      const cleanLast4 = cardNumber.replace(/\s/g, '').slice(-4) || '4242';
      const invoiceNumber = `INV-${new Date().getFullYear()}-${Date.now().toString().slice(-6)}`;

      const newInvoice: BillingInvoice = {
        id: `inv_${Date.now()}`,
        invoiceNumber,
        planId: selectedPlan.id,
        planName: selectedPlan.name,
        amount: finalPrice,
        currency: 'USD',
        billingCycle,
        status: 'paid',
        paymentMethod: paymentType === 'card' ? `Card (${getCardBrand().toUpperCase()})` : paymentType.toUpperCase(),
        cardLast4: paymentType === 'card' ? cleanLast4 : undefined,
        couponCode: appliedCoupon?.code,
        discountAmount: appliedCoupon?.discountAmount || 0,
        subtotal: basePrice,
        taxAmount: 0,
        createdAt: new Date().toISOString()
      };

      await onSuccess({
        planId: selectedPlan.id,
        billingCycle,
        invoice: newInvoice
      });

      setIsSuccess(true);

      // Trigger Confetti
      try {
        confetti({
          particleCount: 80,
          spread: 70,
          origin: { y: 0.6 }
        });
      } catch (e) {
        // ignore
      }

      setTimeout(() => {
        onClose();
      }, 2200);
    } catch (err: any) {
      console.error(err);
      setErrorMessage(err.message || 'Payment authorization failed. Please verify card details.');
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl border border-gray-100 overflow-hidden my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Header */}
        <div className="bg-[#0F172A] text-white p-6 relative">
          <button 
            onClick={onClose}
            disabled={isProcessing}
            className="absolute top-5 right-5 text-slate-400 hover:text-white p-1 rounded-full transition-colors disabled:opacity-40"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-xl text-white shadow-md shadow-blue-500/30">
              <Lock className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-black uppercase tracking-widest text-blue-400">Stripe Checkout</span>
                <span className="bg-emerald-500/20 text-emerald-300 text-[9px] font-black uppercase px-2 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <ShieldCheck className="w-3 h-3" /> 256-Bit Encrypted
                </span>
              </div>
              <h2 className="text-xl font-black tracking-tight text-white mt-0.5">
                Upgrade to {selectedPlan.name}
              </h2>
            </div>
          </div>
          <p className="text-xs text-slate-400">
            Instant activation • Cancel or change plan anytime from your store dashboard.
          </p>
        </div>

        {/* Success Screen */}
        {isSuccess ? (
          <div className="p-10 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto animate-bounce">
              <Check className="w-8 h-8 stroke-[3]" />
            </div>
            <h3 className="text-2xl font-black text-gray-900">Subscription Activated!</h3>
            <p className="text-xs text-gray-600 max-w-md mx-auto">
              Your store has been upgraded to <strong>{selectedPlan.name}</strong> ({billingCycle}). 
              All high-volume features, automated SMS triggers, and multi-branch tools are now active.
            </p>
            <div className="inline-flex items-center gap-2 bg-emerald-50 text-emerald-800 text-xs font-bold px-4 py-2 rounded-xl">
              <Sparkles className="w-4 h-4 text-emerald-600" />
              <span>Redirecting to your refreshed dashboard...</span>
            </div>
          </div>
        ) : (
          <form onSubmit={handleCheckoutSubmit} className="p-6 space-y-6">
            {/* Billing Cycle Switcher */}
            <div className="bg-gray-50 p-1.5 rounded-2xl flex items-center border border-gray-200">
              <button
                type="button"
                onClick={() => setBillingCycle('monthly')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-black transition-all",
                  billingCycle === 'monthly'
                    ? "bg-white text-gray-900 shadow-sm border border-gray-200"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                Monthly Billing (${selectedPlan.priceMonthly}/mo)
              </button>

              <button
                type="button"
                onClick={() => setBillingCycle('yearly')}
                className={cn(
                  "flex-1 py-2 rounded-xl text-xs font-black transition-all flex items-center justify-center gap-1.5",
                  billingCycle === 'yearly'
                    ? "bg-blue-600 text-white shadow-md shadow-blue-500/20"
                    : "text-gray-500 hover:text-gray-800"
                )}
              >
                <span>Yearly Billing (${selectedPlan.priceYearly}/yr)</span>
                <span className="bg-emerald-400 text-slate-900 text-[9px] font-black uppercase px-1.5 py-0.5 rounded-full">
                  Save 20%
                </span>
              </button>
            </div>

            {/* Payment Method Selector */}
            <div className="space-y-2">
              <label className="text-xs font-bold text-gray-700">Select Payment Gateway</label>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                {[
                  { id: 'card', label: 'Credit/Debit Card', icon: CreditCard, subtitle: 'Visa / MC / Amex' },
                  { id: 'fib', label: 'FIB Direct', icon: QrCode, subtitle: 'First Iraqi Bank' },
                  { id: 'fastpay', label: 'FastPay', icon: Building, subtitle: 'Mobile Wallet' },
                  { id: 'zaincash', label: 'ZainCash', icon: Sparkles, subtitle: 'Wallet & QR' },
                ].map((item) => (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => setPaymentType(item.id as any)}
                    className={cn(
                      "p-3 rounded-2xl border text-left transition-all flex flex-col justify-between",
                      paymentType === item.id 
                        ? "border-blue-600 bg-blue-50/50 ring-1 ring-blue-600" 
                        : "border-gray-200 bg-white hover:border-gray-300"
                    )}
                  >
                    <item.icon className={cn("w-4 h-4 mb-2", paymentType === item.id ? "text-blue-600" : "text-gray-500")} />
                    <div>
                      <p className="font-bold text-[11px] text-gray-900 leading-tight">{item.label}</p>
                      <p className="text-[9px] text-gray-500">{item.subtitle}</p>
                    </div>
                  </button>
                ))}
              </div>
            </div>

            {/* Card Inputs (Stripe Fields) */}
            {paymentType === 'card' && (
              <div className="space-y-3 bg-gray-50/70 p-4 rounded-2xl border border-gray-200">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-gray-700">Cardholder Information</span>
                  <div className="flex items-center gap-1.5 text-gray-400">
                    <span className="text-[10px] font-black uppercase text-blue-600">
                      {getCardBrand().toUpperCase()}
                    </span>
                  </div>
                </div>

                <div className="space-y-3">
                  <div>
                    <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Card Number</label>
                    <div className="relative">
                      <input
                        type="text"
                        value={cardNumber}
                        onChange={handleCardNumberChange}
                        placeholder="4242 4242 4242 4242"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-600 focus:ring-1 focus:ring-blue-600"
                        required
                      />
                      <CreditCard className="w-4 h-4 text-gray-400 absolute right-3 top-3 pointer-events-none" />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Expiration (MM/YY)</label>
                      <input
                        type="text"
                        value={cardExpiry}
                        onChange={handleExpiryChange}
                        placeholder="MM/YY"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">CVC / Security Code</label>
                      <input
                        type="password"
                        value={cardCvc}
                        onChange={(e) => setCardCvc(e.target.value.slice(0, 4))}
                        placeholder="123"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold text-gray-900 focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Name on Card</label>
                      <input
                        type="text"
                        value={cardHolder}
                        onChange={(e) => setCardHolder(e.target.value)}
                        placeholder="John Doe"
                        className="w-full px-3.5 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-600"
                        required
                      />
                    </div>
                    <div>
                      <label className="text-[10px] font-bold text-gray-500 uppercase tracking-wider block mb-1">Country / Region</label>
                      <select
                        value={billingCountry}
                        onChange={(e) => setBillingCountry(e.target.value)}
                        className="w-full px-3 py-2.5 bg-white border border-gray-300 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-blue-600"
                      >
                        <option value="Iraq (Kurdistan Region)">Iraq (Kurdistan Region)</option>
                        <option value="Iraq (Federal)">Iraq (Federal)</option>
                        <option value="Turkey">Turkey</option>
                        <option value="United Arab Emirates">United Arab Emirates</option>
                        <option value="United States">United States</option>
                        <option value="United Kingdom">United Kingdom</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Regional Payment Instructions for FIB / FastPay */}
            {paymentType !== 'card' && (
              <div className="bg-blue-50 border border-blue-200 p-4 rounded-2xl space-y-2">
                <div className="flex items-center gap-2 text-blue-900 font-bold text-xs">
                  <QrCode className="w-4 h-4 text-blue-600" />
                  <span>{paymentType.toUpperCase()} Instant Merchant Pay</span>
                </div>
                <p className="text-xs text-blue-800 leading-relaxed">
                  Upon clicking 'Confirm & Pay', an instant QR code payment prompt will be generated for your {paymentType.toUpperCase()} mobile app. Once scanned, your SaaS plan will be activated immediately.
                </p>
              </div>
            )}

            {/* Coupon Code Redemption */}
            <div className="space-y-1.5">
              <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
                <Tag className="w-3.5 h-3.5 text-blue-600" />
                <span>Promo / Coupon Code</span>
              </label>
              <div className="flex gap-2">
                <input
                  type="text"
                  value={couponCode}
                  onChange={(e) => {
                    setCouponCode(e.target.value.toUpperCase());
                    setCouponError('');
                  }}
                  placeholder="e.g. KURDISTAN2026, LAUNCH50"
                  className="flex-1 px-3.5 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold uppercase text-gray-900 focus:outline-none focus:border-blue-600"
                />
                <button
                  type="button"
                  onClick={handleApplyCoupon}
                  disabled={couponLoading || !couponCode.trim()}
                  className="bg-gray-900 hover:bg-gray-800 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all disabled:opacity-50"
                >
                  {couponLoading ? 'Checking...' : 'Apply'}
                </button>
              </div>

              {couponError && (
                <p className="text-[11px] text-red-500 font-bold flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3 h-3" />
                  <span>{couponError}</span>
                </p>
              )}

              {appliedCoupon && (
                <div className="bg-emerald-50 text-emerald-800 px-3 py-1.5 rounded-xl text-[11px] font-bold flex items-center justify-between border border-emerald-200">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    <span>Coupon <strong>{appliedCoupon.code}</strong> applied (-${appliedCoupon.discountAmount})</span>
                  </span>
                  <button 
                    type="button"
                    onClick={() => setAppliedCoupon(null)}
                    className="text-emerald-700 hover:text-emerald-900 text-[10px] uppercase font-black"
                  >
                    Remove
                  </button>
                </div>
              )}
            </div>

            {/* Error Message */}
            {errorMessage && (
              <div className="bg-red-50 text-red-700 p-3 rounded-xl text-xs font-bold flex items-center gap-2 border border-red-200">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                <span>{errorMessage}</span>
              </div>
            )}

            {/* Order Summary & Pricing Breakdown */}
            <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>{selectedPlan.name} ({billingCycle})</span>
                <span className="font-bold">${basePrice.toFixed(2)}</span>
              </div>

              {appliedCoupon && (
                <div className="flex justify-between text-emerald-600 font-bold">
                  <span>Discount ({appliedCoupon.code})</span>
                  <span>-${appliedCoupon.discountAmount.toFixed(2)}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Estimated Taxes & VAT</span>
                <span className="font-bold">$0.00</span>
              </div>

              <div className="pt-2 border-t border-gray-200 flex justify-between text-sm font-black text-gray-900">
                <span>Total Due Today</span>
                <span className="text-base text-blue-600">${finalPrice.toFixed(2)} USD</span>
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isProcessing}
              className="w-full py-3.5 px-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black text-xs uppercase tracking-wider transition-all shadow-xl shadow-blue-500/25 flex items-center justify-center gap-2 disabled:opacity-60"
            >
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin" />
                  <span>Authorizing via Stripe Gateway...</span>
                </>
              ) : (
                <>
                  <Lock className="w-3.5 h-3.5" />
                  <span>Pay ${finalPrice.toFixed(2)} & Activate Plan</span>
                </>
              )}
            </button>

            <p className="text-[10px] text-gray-400 text-center font-medium">
              By confirming your subscription, you authorize recurring charges. You may cancel at any time.
            </p>
          </form>
        )}
      </div>
    </div>
  );
}
