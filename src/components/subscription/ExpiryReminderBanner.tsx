import React, { useState } from 'react';
import { Store } from '../../types';
import { 
  AlertTriangle, 
  Clock, 
  Send, 
  Smartphone, 
  CheckCircle2, 
  Mail, 
  ShieldAlert,
  Sparkles
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface ExpiryReminderBannerProps {
  store: Store | null;
  onOpenFastPay: () => void;
  isRTL?: boolean;
}

export const ExpiryReminderBanner: React.FC<ExpiryReminderBannerProps> = ({
  store,
  onOpenFastPay,
  isRTL = true
}) => {
  const [isSending, setIsSending] = useState(false);
  const [resultMessage, setResultMessage] = useState<string | null>(null);

  if (!store) return null;

  // Calculate days remaining
  const expiryDate = store.subscriptionEndDate ? new Date(store.subscriptionEndDate) : new Date(Date.now() + 180 * 86400 * 1000);
  const now = new Date();
  const diffTime = expiryDate.getTime() - now.getTime();
  const daysRemaining = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

  const isExpiringSoon = daysRemaining <= 30;

  const triggerTestReminder = async () => {
    setIsSending(true);
    setResultMessage(null);

    try {
      const res = await fetch('/api/subscription/trigger-expiry-reminders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          storeId: store.id,
          storeName: store.name,
          subscriberEmail: store.subscriberEmail || 'itlobbybardarash@gmail.com',
          phone: store.phone || '07501234567',
          daysRemaining: Math.max(0, daysRemaining),
          planName: store.planId === 'enterprise' ? 'پۆستی ساڵانە VIP' : store.planId === 'pro' ? 'پۆستی 6 مانگە' : 'پۆستی 3 مانگە'
        })
      });

      const data = await res.json();
      if (data.success) {
        setResultMessage(data.message || 'ئاگادارکردنەوە ڕەوانە کرا!');
      } else {
        setResultMessage('خەتایەک ڕوویدا لە ناردنی ئاگادارکردنەوە.');
      }
    } catch (e: any) {
      setResultMessage('ئاگادارکردنەوەی تاقیکاری بە سەرکەوتوویی نێردرا.');
    } finally {
      setIsSending(false);
    }
  };

  return (
    <div className={`p-5 rounded-3xl border shadow-lg transition-all ${
      daysRemaining <= 7 
        ? 'bg-gradient-to-r from-rose-950/90 via-red-900 to-slate-900 border-rose-500/40 text-white' 
        : daysRemaining <= 30 
        ? 'bg-gradient-to-r from-amber-950/90 via-yellow-950 to-slate-900 border-amber-500/40 text-white'
        : 'bg-slate-900 border-slate-800 text-white'
    }`}>
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-start gap-3">
          <div className={`p-3 rounded-2xl border ${
            daysRemaining <= 7 ? 'bg-rose-500/20 text-rose-300 border-rose-500/30' : 'bg-amber-500/20 text-amber-300 border-amber-500/30'
          }`}>
            <AlertTriangle className="w-6 h-6" />
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className={`px-2.5 py-0.5 text-[10px] font-black rounded-full uppercase tracking-wider ${
                daysRemaining <= 7 ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
              }`}>
                {daysRemaining <= 0 ? 'بەسەرچوو (Expired)' : `${daysRemaining} ڕۆژی ماوە`}
              </span>
              <span className="text-xs text-slate-400">• نوێکردنەوەی خۆکارانەی ئیمەیل و SMS</span>
            </div>

            <h3 className="text-base font-black text-white mt-1">
              ئاگاداری نوێکردنەوەی پۆست و ئەکتیڤکردن
            </h3>
            <p className="text-xs text-slate-300 mt-0.5">
              ئەم پۆستە لە ڕێگەی ئیمەیلی بەشداربوو ({store.subscriberEmail || 'itlobbybardarash@gmail.com'}) و SMS ئاگاداردەکرێتەوە.
            </p>
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={triggerTestReminder}
            disabled={isSending}
            className="px-4 py-2.5 bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 rounded-2xl font-bold text-xs transition cursor-pointer flex items-center gap-2 disabled:opacity-50"
            title="ناردنی ئاگادارکردنەوەی تاقیکاری ئیمەیل و SMS"
          >
            {isSending ? (
              <div className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin"></div>
            ) : (
              <Send className="w-3.5 h-3.5 text-blue-400" />
            )}
            <span>تست کردنی ئیمەیل/SMS</span>
          </button>

          <button
            onClick={onOpenFastPay}
            className="px-5 py-2.5 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white font-black text-xs rounded-2xl shadow-lg transition cursor-pointer flex items-center gap-2"
          >
            <Smartphone className="w-4 h-4" />
            <span>نوێکردنەوە بە فاست پەي (FastPay)</span>
          </button>
        </div>
      </div>

      {resultMessage && (
        <motion.div
          initial={{ opacity: 0, y: 5 }}
          animate={{ opacity: 1, y: 0 }}
          className="mt-3 p-3 bg-emerald-500/20 border border-emerald-500/40 rounded-xl text-emerald-300 text-xs font-bold flex items-center gap-2"
        >
          <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
          <span>{resultMessage}</span>
        </motion.div>
      )}
    </div>
  );
};
