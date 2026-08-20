import React, { useState } from 'react';
import { Store, BillingInvoice } from '../../types';
import { db } from '../../lib/firebase';
import { doc, updateDoc, setDoc } from 'firebase/firestore';
import { 
  X, 
  Smartphone, 
  ShieldCheck, 
  CheckCircle2, 
  QrCode, 
  Sparkles, 
  ArrowRight,
  Lock,
  Clock,
  AlertCircle,
  Receipt
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface FastPayModalProps {
  isOpen: boolean;
  onClose: () => void;
  store: Store | null;
  onSuccess?: (details: any) => void;
  isRTL?: boolean;
}

export const FastPayModal: React.FC<FastPayModalProps> = ({
  isOpen,
  onClose,
  store,
  onSuccess,
  isRTL = true
}) => {
  const [selectedMonths, setSelectedMonths] = useState<3 | 6 | 12>(6);
  const [paymentMode, setPaymentMode] = useState<'otp' | 'qr'>('otp');
  const [phone, setPhone] = useState(store?.phone || '0750 123 4567');
  const [pin, setPin] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  const [successReceipt, setSuccessReceipt] = useState<any>(null);

  if (!isOpen) return null;

  const planAmountIQD = selectedMonths === 3 ? 25000 : selectedMonths === 6 ? 45000 : 60000;
  const planTitle = selectedMonths === 3 ? 'پۆستی 3 مانگە' : selectedMonths === 6 ? 'پۆستی 6 مانگە' : 'پۆستی 1 ساڵە VIP';

  const handlePay = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (paymentMode === 'otp') {
      if (!phone || phone.length < 8) {
        setErrorMsg('تکایە ژمارەی مۆبایلی فاست پەي بە دروستی بنووسە');
        return;
      }
      if (!pin || pin.length < 4) {
        setErrorMsg('تکایە کۆدی نهێنی (PIN) بنووسە (4 ژمارە)');
        return;
      }
    }

    setIsProcessing(true);

    try {
      const res = await fetch('/api/subscription/fastpay-checkout', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store?.id,
          storeName: store?.name,
          subscriberEmail: store?.subscriberEmail || 'itlobbybardarash@gmail.com',
          phone,
          planDurationMonths: selectedMonths,
          amountIQD: planAmountIQD
        })
      });

      const data = await res.json();

      if (!res.ok || !data.success) {
        throw new Error(data.error || 'پارەدان لە ڕێگەی فاست پەي سەرکەوتوو نەبوو');
      }

      // Update Firestore Store Subscription
      if (store?.id) {
        const storeRef = doc(db, 'stores', store.id);
        await updateDoc(storeRef, {
          subscriptionStatus: 'active',
          planId: selectedMonths === 12 ? 'enterprise' : selectedMonths === 6 ? 'pro' : 'starter',
          subscriptionEndDate: data.subscriptionEndDate
        });

        // Save Invoice Record in Firestore
        const invoiceData: BillingInvoice = {
          id: data.invoiceNumber,
          invoiceNumber: data.invoiceNumber,
          planId: selectedMonths === 12 ? 'enterprise' : selectedMonths === 6 ? 'pro' : 'starter',
          planName: planTitle,
          amount: Math.round(planAmountIQD / 1500), // USD equivalent
          currency: 'USD',
          billingCycle: selectedMonths === 12 ? 'yearly' : 'monthly',
          status: 'paid',
          paymentMethod: `FastPay Wallet (${phone}) - ID: ${data.transactionId}`,
          createdAt: new Date().toISOString()
        };

        const invoiceRef = doc(db, 'stores', store.id, 'invoices', invoiceData.id);
        await setDoc(invoiceRef, invoiceData);
      }

      setSuccessReceipt(data);
      if (onSuccess) onSuccess(data);
    } catch (err: any) {
      console.error('FastPay payment error:', err);
      setErrorMsg(err.message || 'خەتایەک ڕوویدا لە کاتی پەیوەندیکردن بە سستەمی فاست پەي');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="bg-slate-900 border border-slate-800 text-white w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden relative">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-900 via-indigo-900 to-purple-950 p-5 border-b border-slate-800 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-blue-500/20 text-blue-300 rounded-2xl border border-blue-400/30">
              <Smartphone className="w-6 h-6" />
            </div>
            <div>
              <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 text-[10px] font-black rounded-full border border-blue-400/30">
                FastPay Gateway Integration
              </span>
              <h3 className="text-base font-black text-white mt-0.5">دروازەی پارەدانی فاست پەي (FastPay)</h3>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 text-slate-400 hover:text-white bg-slate-800/80 rounded-full transition cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-6">
          {successReceipt ? (
            /* Success Receipt Screen */
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-center space-y-4 py-2"
            >
              <div className="w-16 h-16 bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 rounded-full flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 className="w-10 h-10" />
              </div>

              <div>
                <h4 className="text-xl font-black text-emerald-400">پارەدانەکەت سەرکەوتوو بوو!</h4>
                <p className="text-xs text-slate-300 mt-1">پۆستەکەت بۆ ماوەی {successReceipt.durationMonths} مانگی تر ئەکتیڤ کرا.</p>
              </div>

              <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800 space-y-2 text-xs text-right font-mono">
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-sans">کۆدی مامەڵە (Tx ID):</span>
                  <span className="font-bold text-amber-400">{successReceipt.transactionId}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-sans">بڕی دراو:</span>
                  <span className="font-bold text-white">{successReceipt.amountIQD?.toLocaleString()} IQD</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-2">
                  <span className="text-slate-400 font-sans">ژمارەی مۆبایل:</span>
                  <span className="font-bold text-blue-300">{phone}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400 font-sans">کاتی بەسەرچوون:</span>
                  <span className="font-bold text-emerald-400">
                    {new Date(successReceipt.subscriptionEndDate).toLocaleDateString()}
                  </span>
                </div>
              </div>

              <button
                onClick={() => {
                  onClose();
                  window.location.reload();
                }}
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs rounded-2xl shadow-lg transition cursor-pointer"
              >
                تەواو • گەڕانەوە بۆ لاپەڕەی سەرەکی
              </button>
            </motion.div>
          ) : (
            /* FastPay Checkout Form */
            <form onSubmit={handlePay} className="space-y-5">
              {/* Plan Duration Selector */}
              <div>
                <label className="text-xs font-bold text-slate-300 block mb-2">ماوەی پۆست و نرخ (Select Duration):</label>
                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setSelectedMonths(3)}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      selectedMonths === 3
                        ? 'bg-blue-600/30 border-blue-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-[10px] font-bold uppercase text-blue-400">۳ مانگ</span>
                    <span className="text-sm font-black block mt-0.5">25,000 IQD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMonths(6)}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer relative ${
                      selectedMonths === 6
                        ? 'bg-indigo-600/30 border-indigo-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="absolute -top-2 left-1/2 -translate-x-1/2 px-2 py-0.2 bg-amber-500 text-slate-950 font-black text-[9px] rounded-full">
                      پێشنیاز
                    </span>
                    <span className="block text-[10px] font-bold uppercase text-indigo-400">٦ مانگ</span>
                    <span className="text-sm font-black block mt-0.5">45,000 IQD</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setSelectedMonths(12)}
                    className={`p-3 rounded-2xl border text-center transition cursor-pointer ${
                      selectedMonths === 12
                        ? 'bg-purple-600/30 border-purple-500 text-white shadow-md'
                        : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-white'
                    }`}
                  >
                    <span className="block text-[10px] font-bold uppercase text-purple-400">۱ ساڵ VIP</span>
                    <span className="text-sm font-black block mt-0.5">60,000 IQD</span>
                  </button>
                </div>
              </div>

              {/* Mode Toggle */}
              <div className="bg-slate-950 p-1 rounded-2xl border border-slate-800 flex items-center justify-between">
                <button
                  type="button"
                  onClick={() => setPaymentMode('otp')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMode === 'otp' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <Smartphone className="w-3.5 h-3.5" />
                  ژمارەی مۆبایل و PIN
                </button>

                <button
                  type="button"
                  onClick={() => setPaymentMode('qr')}
                  className={`flex-1 py-2 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer ${
                    paymentMode === 'qr' ? 'bg-blue-600 text-white shadow-sm' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  <QrCode className="w-3.5 h-3.5" />
                  ئۆفەری فاست پەي (QR Scan)
                </button>
              </div>

              {/* OTP Mode Fields */}
              {paymentMode === 'otp' ? (
                <div className="space-y-3 bg-slate-950 p-4 rounded-2xl border border-slate-800">
                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      ژمارەی ئەکاونتی فاست پەي (FastPay Mobile):
                    </label>
                    <input
                      type="text"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      placeholder="0750 XXX XXXX"
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-bold text-slate-300 block mb-1">
                      کۆدی نهێنی مۆبایل و واڵێت (FastPay Wallet PIN):
                    </label>
                    <div className="relative">
                      <input
                        type="password"
                        maxLength={6}
                        value={pin}
                        onChange={(e) => setPin(e.target.value)}
                        placeholder="••••"
                        className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-xs font-mono font-bold text-white focus:outline-none focus:border-blue-500"
                      />
                      <Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                    </div>
                  </div>
                </div>
              ) : (
                /* QR Code Mode */
                <div className="bg-slate-950 p-5 rounded-2xl border border-slate-800 text-center space-y-3">
                  <p className="text-xs text-slate-300">
                    ئەپڵیکەیشنی **FastPay** بکەرەوە و لە بەشی **Scan QR** ئەم بارکۆدە سکان بکە:
                  </p>
                  <div className="w-40 h-40 bg-white p-3 rounded-2xl mx-auto flex items-center justify-center border-4 border-blue-500 shadow-xl">
                    <img
                      src={`https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=FASTPAY_MERCHANT_MOBI_${planAmountIQD}`}
                      alt="FastPay QR"
                      className="w-full h-full object-contain"
                    />
                  </div>
                  <p className="text-[10px] font-mono text-amber-300">FastPay Merchant ID: MOBI-7729-IQD</p>
                </div>
              )}

              {errorMsg && (
                <div className="p-3 bg-rose-500/10 border border-rose-500/30 rounded-xl text-rose-300 text-xs font-bold flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  <span>{errorMsg}</span>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isProcessing}
                className="w-full py-3 bg-gradient-to-r from-blue-600 via-indigo-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-black text-xs rounded-2xl shadow-xl transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isProcessing ? (
                  <>
                    <div className="w-4 h-4 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
                    <span>لە پەیوەندیدایە لەگەڵ فاست پەي...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>پارەدان و ئەکتیڤکردن ({planAmountIQD.toLocaleString()} IQD)</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
