import React, { useState } from 'react';
import {
  Percent,
  CheckCircle,
  FileText,
  MessageSquare,
  Sparkles,
  AlertCircle,
  Clock,
  Send,
  HelpCircle,
  ArrowUpRight,
  ShieldCheck,
  Calculator,
  Building2,
  DollarSign
} from 'lucide-react';
import { SellerProfile } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';

interface CommissionAgreementCardProps {
  seller: SellerProfile;
}

export const CommissionAgreementCard: React.FC<CommissionAgreementCardProps> = ({ seller }) => {
  const { confirmCommissionAgreement, requestCommissionNegotiation } = useMarketplace();

  const [sampleAmount, setSampleAmount] = useState<number>(50000);
  const [showNegotiateModal, setShowNegotiateModal] = useState<boolean>(false);
  const [proposedRate, setProposedRate] = useState<number>(seller.commissionRate || 10);
  const [negotiateNote, setNegotiateNote] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [actionSuccess, setActionSuccess] = useState<string | null>(null);

  const rate = seller.commissionRate || 10;
  const commissionAmount = Math.round((sampleAmount * rate) / 100);
  const sellerNet = sampleAmount - commissionAmount;

  const status = seller.commissionAgreementStatus || 'pending_agreement';

  const handleConfirm = async () => {
    setIsSubmitting(true);
    const res = await confirmCommissionAgreement(seller.id);
    setIsSubmitting(false);
    if (res.success) {
      setActionSuccess('ڕێککەوتنی کۆمسیۆن بە سەرکەوتوویی پەسەند کراو واژۆ کرا ✓');
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  const handleSendNegotiation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (proposedRate < 0 || proposedRate > 30) {
      alert('تکایە ڕێژەیەکی گونجاو لە نێوان ٠٪ بۆ ٣٠٪ هەڵبژێرە');
      return;
    }
    setIsSubmitting(true);
    const res = await requestCommissionNegotiation(seller.id, proposedRate, negotiateNote);
    setIsSubmitting(false);
    setShowNegotiateModal(false);
    if (res.success) {
      setActionSuccess('داواکارییەکە بۆ ئەدمینی شاخ نێردرا. بەم زووانە وەڵام دەدرێیتەوە.');
      setTimeout(() => setActionSuccess(null), 5000);
    }
  };

  return (
    <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 sm:p-8 shadow-sm space-y-6">
      
      {/* Top Banner & Agreement Status */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-800 pb-6">
        <div className="space-y-1">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 dark:bg-orange-950/50 text-orange-700 dark:text-orange-400 border border-orange-200 dark:border-orange-800 text-xs font-black">
              <Percent className="w-3.5 h-3.5" />
              <span>ڕێژەی کۆمسیۆن و پەیماننامەی شاخ</span>
            </span>

            {/* Status Badge */}
            {status === 'agreed' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950 text-emerald-800 dark:text-emerald-300 border border-emerald-300 dark:border-emerald-800 text-xs font-bold">
                <CheckCircle className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                <span>پەسەندکراوە و چالاکە ✓</span>
              </span>
            ) : status === 'requested_negotiation' ? (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-amber-100 dark:bg-amber-950 text-amber-800 dark:text-amber-300 border border-amber-300 dark:border-amber-800 text-xs font-bold">
                <Clock className="w-3.5 h-3.5 text-amber-600 dark:text-amber-400 animate-pulse" />
                <span>داوای پێداچوونەوە نێردراوە 💬</span>
              </span>
            ) : (
              <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 border border-slate-300 dark:border-slate-700 text-xs font-bold">
                <AlertCircle className="w-3.5 h-3.5 text-slate-500" />
                <span>لە چاوەڕوانی پەسەندکردندایە</span>
              </span>
            )}
          </div>

          <h3 className="text-xl font-black text-slate-900 dark:text-slate-100 mt-2">
            ڕێژەی فەرمی کۆمسیۆن و بەرژەوەندییەکانی دوکاندار
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400">
            تایبەت بە فرۆشگای: <span className="font-bold text-slate-800 dark:text-slate-200">{seller.storeName}</span>
          </p>
        </div>

        {/* Current Commission Percentage Highlight */}
        <div className="bg-gradient-to-br from-orange-500 to-amber-600 text-white p-4 rounded-2xl text-center min-w-[160px] shadow-md">
          <span className="text-[11px] font-bold text-orange-100 block">ڕێژەی کۆمسیۆنی فەرمی</span>
          <span className="text-3xl font-black font-latin my-0.5 block">{rate}%</span>
          <span className="text-[10px] text-amber-100 block">لە کۆی هەر داواکارییەک</span>
        </div>
      </div>

      {/* Success Notification Alert */}
      {actionSuccess && (
        <div className="p-4 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-emerald-800 dark:text-emerald-300 text-xs font-bold flex items-center justify-between gap-3 animate-fade-in">
          <div className="flex items-center gap-2">
            <CheckCircle className="w-5 h-5 text-emerald-600" />
            <span>{actionSuccess}</span>
          </div>
        </div>
      )}

      {/* Negotiation Pending Info Box */}
      {status === 'requested_negotiation' && seller.commissionNegotiationProposedRate && (
        <div className="p-4 rounded-2xl bg-amber-50 dark:bg-amber-950/40 border border-amber-200 dark:border-amber-800 text-amber-900 dark:text-amber-200 text-xs space-y-1">
          <div className="flex items-center gap-2 font-bold">
            <MessageSquare className="w-4 h-4 text-amber-600" />
            <span>داواکاری پێداچوونەوە لە چاوەڕوانی تێبینی سوپەر ئەدمیندایە:</span>
          </div>
          <p className="text-[11px] text-amber-700 dark:text-amber-300">
            داوای ڕێژەی <span className="font-bold font-latin">{seller.commissionNegotiationProposedRate}%</span>ت کردووە.
            {seller.commissionNegotiationNote && ` (تێبینی: "${seller.commissionNegotiationNote}")`}
          </p>
        </div>
      )}

      {/* Interactive Sale Calculation Simulator */}
      <div className="p-5 sm:p-6 rounded-2xl bg-slate-50 dark:bg-slate-800/60 border border-slate-200 dark:border-slate-700 space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-200 dark:border-slate-700 pb-3">
          <div className="flex items-center gap-2">
            <Calculator className="w-4 h-4 text-orange-500" />
            <h4 className="text-xs font-black text-slate-900 dark:text-slate-100">
              ئاگاداری لە پارەی پوختەی دوکاندار (Sale Earnings Simulator):
            </h4>
          </div>
          
          {/* Preset Buttons */}
          <div className="flex items-center gap-1.5">
            {[25000, 50000, 100000, 250000].map(amt => (
              <button
                key={amt}
                onClick={() => setSampleAmount(amt)}
                className={`px-2.5 py-1 rounded-lg text-[10px] font-latin font-bold transition-all cursor-pointer ${
                  sampleAmount === amt
                    ? 'bg-slate-900 text-white dark:bg-orange-500'
                    : 'bg-white dark:bg-slate-700 text-slate-600 dark:text-slate-300 border border-slate-200 dark:border-slate-600 hover:bg-slate-100'
                }`}
              >
                {(amt / 1000).toLocaleString()}k د.ع
              </button>
            ))}
          </div>
        </div>

        {/* Calculation Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          
          {/* Total Order Amount */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-slate-200 dark:border-slate-700 space-y-1">
            <span className="text-[10px] font-bold text-slate-400">کۆی بڕی داواکاری:</span>
            <h5 className="text-lg font-black text-slate-900 dark:text-slate-100 font-latin">
              {sampleAmount.toLocaleString()} د.ع
            </h5>
            <span className="text-[10px] text-slate-400">بڕی دراو لەلایەن کڕیار</span>
          </div>

          {/* Platform Commission Amount */}
          <div className="bg-white dark:bg-slate-900 p-4 rounded-xl border border-orange-200 dark:border-orange-950 space-y-1">
            <span className="text-[10px] font-bold text-orange-600 dark:text-orange-400">کۆمسیۆنی شاخ ({rate}%):</span>
            <h5 className="text-lg font-black text-orange-600 dark:text-orange-400 font-latin">
              {commissionAmount.toLocaleString()} د.ع
            </h5>
            <span className="text-[10px] text-slate-400">خزمەتگوزاری پلاتفۆرم و دلیڤەری</span>
          </div>

          {/* Net Seller Amount */}
          <div className="bg-emerald-500 text-white p-4 rounded-xl shadow-sm space-y-1">
            <span className="text-[10px] font-bold text-emerald-100">قازانجی پوختەی دوکاندار:</span>
            <h5 className="text-lg font-black font-latin">
              {sellerNet.toLocaleString()} د.ع
            </h5>
            <span className="text-[10px] text-emerald-100">ڕاستەوخۆ دەچێتە جزدانت</span>
          </div>

        </div>
      </div>

      {/* What Commission Covers */}
      <div className="space-y-3">
        <h4 className="text-xs font-black text-slate-900 dark:text-slate-100 flex items-center gap-1.5">
          <ShieldCheck className="w-4 h-4 text-emerald-600" />
          <span>کۆمسیۆنی شاخ چ خزمەتگوزارییەک لەخۆدەگرێت؟</span>
        </h4>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
            <Building2 className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-slate-900 dark:text-slate-200">سیستەم و سێرڤەری ته‌کنیکی ۲٤ کاتژمێری</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">سێرڤەری پرسیار و وەڵام، ڕێکخستنی داواکاری و ئاگادارکردنەوەی خێرا.</p>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-800/40 border border-slate-100 dark:border-slate-800 flex items-start gap-2.5">
            <Sparkles className="w-4 h-4 text-amber-500 flex-shrink-0 mt-0.5" />
            <div>
              <h5 className="font-bold text-slate-900 dark:text-slate-200">مارکێتینگ و ڕیکلامی بەردەوام</h5>
              <p className="text-[11px] text-slate-500 dark:text-slate-400 mt-0.5">پیشاندانی فرۆشگا لە سێرچ و هێنانی بەردەوامی کڕیارانی نوێ.</p>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons: Confirm Agreement or Request Negotiation */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-100 dark:border-slate-800">
        <div>
          {seller.commissionAgreedAt && (
            <p className="text-[11px] text-slate-400 font-latin">
              بەرواری پەسەندکردنی فەرمی: {new Date(seller.commissionAgreedAt).toLocaleDateString()}
            </p>
          )}
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          {/* Negotiate Button */}
          <button
            onClick={() => setShowNegotiateModal(true)}
            className="px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-700 text-slate-700 dark:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all cursor-pointer w-full sm:w-auto"
          >
            <MessageSquare className="w-4 h-4 text-orange-500" />
            <span>داواکاری ڕێککەوتنەوە / گۆڕینی کۆمسیۆن</span>
          </button>

          {/* Confirm Button */}
          <button
            onClick={handleConfirm}
            disabled={isSubmitting || status === 'agreed'}
            className={`px-6 py-2.5 rounded-xl font-black text-xs flex items-center justify-center gap-2 shadow-md transition-all cursor-pointer w-full sm:w-auto ${
              status === 'agreed'
                ? 'bg-emerald-600 text-white cursor-default'
                : 'bg-orange-500 hover:bg-orange-600 text-white hover:scale-105'
            }`}
          >
            <CheckCircle className="w-4 h-4" />
            <span>{status === 'agreed' ? 'ڕێککەوتننامە پەسەندکراوە ✓' : 'پەسەندکردن و واژۆکردنی فەرمی'}</span>
          </button>
        </div>
      </div>

      {/* Negotiation Modal */}
      {showNegotiateModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4 z-50 animate-fade-in">
          <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl max-w-md w-full border border-slate-200 dark:border-slate-800 shadow-2xl space-y-6">
            
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-3">
              <div className="flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-orange-500" />
                <h3 className="font-black text-slate-900 dark:text-slate-100 text-base">
                  داواکاری ڕێککەوتنەوە لەسەر کۆمسیۆن
                </h3>
              </div>
              <button
                onClick={() => setShowNegotiateModal(false)}
                className="text-slate-400 hover:text-slate-600 font-bold text-sm"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleSendNegotiation} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  ڕێژەی کۆمسیۆنی پێشنیارکراو (٪):
                </label>
                <input
                  type="number"
                  min="0"
                  max="30"
                  step="0.5"
                  required
                  value={proposedRate}
                  onChange={(e) => setProposedRate(parseFloat(e.target.value) || 0)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-slate-900 dark:text-slate-100 font-latin font-bold focus:outline-hidden focus:border-orange-500"
                />
                <span className="text-[10px] text-slate-400 mt-1 block">
                  ڕێژەی فەرمی ئێستا: <span className="font-bold font-latin">{rate}%</span>
                </span>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 dark:text-slate-300 mb-1">
                  تێبینی یان هۆکاری داواکاری بۆ سوپەر ئەدمین:
                </label>
                <textarea
                  rows={3}
                  required
                  placeholder="وەک: ئێمە بەرهەمی زۆر دەفڕۆشین یان کاڵاکانمان مارجینی قازانجیان کەمە..."
                  value={negotiateNote}
                  onChange={(e) => setNegotiateNote(e.target.value)}
                  className="w-full bg-slate-50 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNegotiateModal(false)}
                  className="px-4 py-2 text-xs font-bold text-slate-500 hover:text-slate-800"
                >
                  پاشگەزبوونەوە
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow flex items-center gap-1.5 cursor-pointer"
                >
                  <Send className="w-4 h-4" />
                  <span>ناردن بۆ ئەدمین</span>
                </button>
              </div>
            </form>

          </div>
        </div>
      )}

    </div>
  );
};
