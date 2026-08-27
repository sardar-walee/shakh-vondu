import React, { useState } from 'react';
import {
  Star,
  Store,
  Truck,
  CheckCircle,
  Gift,
  Sparkles,
  Award,
  Edit3,
  ChevronDown,
  ChevronUp,
  MessageSquare,
  ThumbsUp,
  AlertCircle
} from 'lucide-react';
import { Order } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';

interface InlineOrderRatingCardProps {
  order: Order;
  onReviewSubmitted?: () => void;
  initiallyOpen?: boolean;
}

const SELLER_TAGS = [
  'کوالیتی بەرز ⭐',
  'پاکەتکردنی پارێزراو 📦',
  'کاڵای فرێش و گەرم 🍲',
  'مامەڵەی شایستە 🤝',
  'ئامادەکردنی خێرا ⏱️',
  'ڕێک وەک وەسفەکە 💯'
];

const DRIVER_TAGS = [
  'گەیاندنی زۆر خێرا ⚡',
  'بەڕێز و زمانشیرین 🤝',
  'پاراستنی پاکەتەکان 🛡️',
  'پابەندبوون بە کات ⏰',
  'پەیوەندی ڕوون و خێرا 📞',
  'کاپتنی لێهاتوو 🏆'
];

const RATING_LABELS: Record<number, string> = {
  1: 'زۆر ناڕازی (١ لە ٥)',
  2: 'پێویستی بە باشترکردنە (٢ لە ٥)',
  3: 'ئاسایی و باشە (٣ لە ٥)',
  4: 'زۆر باش و پەسەندە (٤ لە ٥)',
  5: 'ناوازە و بێ وێنەیە (٥ لە ٥) ⭐'
};

export const InlineOrderRatingCard: React.FC<InlineOrderRatingCardProps> = ({
  order,
  onReviewSubmitted,
  initiallyOpen = false
}) => {
  const { submitOrderReview } = useMarketplace();
  const { currentUser } = useAuth();

  const isAlreadyReviewed = !!(order.isReviewedSeller || order.isReviewedDriver);

  const [isOpen, setIsOpen] = useState<boolean>(initiallyOpen || !isAlreadyReviewed);
  const [isEditing, setIsEditing] = useState<boolean>(false);

  // Seller Rating State
  const [sellerRating, setSellerRating] = useState<number>(order.sellerRating || 5);
  const [sellerHover, setSellerHover] = useState<number>(0);
  const [sellerComment, setSellerComment] = useState<string>(order.sellerReviewComment || '');
  const [sellerTags, setSellerTags] = useState<string[]>(['کوالیتی بەرز ⭐', 'پاکەتکردنی پارێزراو 📦']);

  // Driver Rating State
  const [driverRating, setDriverRating] = useState<number>(order.driverRating || 5);
  const [driverHover, setDriverHover] = useState<number>(0);
  const [driverComment, setDriverComment] = useState<string>(order.driverReviewComment || '');
  const [driverTags, setDriverTags] = useState<string[]>(['گەیاندنی زۆر خێرا ⚡', 'بەڕێز و زمانشیرین 🤝']);

  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean>(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const toggleSellerTag = (tag: string) => {
    setSellerTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const toggleDriverTag = (tag: string) => {
    setDriverTags(prev =>
      prev.includes(tag) ? prev.filter(t => t !== tag) : [...prev, tag]
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentUser) {
      setErrorMsg('تکایە سەرەتا بچۆ ژوورەوە بۆ ناردنی هەڵسەنگاندن.');
      return;
    }

    setIsSubmitting(true);
    setErrorMsg(null);

    try {
      const driverName = order.driverName || order.deliveryAgentName || 'کاپتنی گەیاندن';
      const driverId = order.driverId || order.deliveryAgentId || 'rebaz-driver';

      const res = await submitOrderReview({
        orderId: order.id,
        orderNumber: order.orderNumber,
        sellerReview: {
          sellerId: order.sellerId,
          sellerName: order.sellerName,
          rating: sellerRating,
          comment: sellerComment.trim() || 'فرۆشگایەکی زۆر باش و بەکوالیتی.',
          tags: sellerTags
        },
        driverReview: {
          driverId: driverId,
          driverName: driverName,
          rating: driverRating,
          comment: driverComment.trim() || 'گەیاندنێکی خێرا و کاتی گونجاو.',
          tags: driverTags
        }
      });

      if (res.success) {
        setSubmitSuccess(true);
        setIsEditing(false);
        if (onReviewSubmitted) onReviewSubmitted();
        setTimeout(() => {
          setSubmitSuccess(false);
        }, 3000);
      } else {
        setErrorMsg('هەڵەیەک ڕوویدا لە ناردنی هەڵسەنگاندنەکە.');
      }
    } catch (err) {
      console.error('Submit review error:', err);
      setErrorMsg('تێکچوون لە پەیوەندی بە ڕاژەکار.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="bg-gradient-to-br from-amber-50/60 via-orange-50/40 to-slate-50 p-4 sm:p-5 rounded-3xl border border-amber-200/80 shadow-xs space-y-4 text-right transition-all">
      
      {/* Header Bar */}
      <div className="flex items-center justify-between gap-2 border-b border-amber-200/60 pb-3">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-2xl bg-amber-500 text-white flex items-center justify-center font-bold shadow-xs">
            <Star className="w-5 h-5 fill-white text-white" />
          </div>
          <div>
            <h4 className="text-xs sm:text-sm font-black text-amber-950 flex items-center gap-2">
              <span>ڕا و هەڵسەنگاندنی کڕیار</span>
              {isAlreadyReviewed && !isEditing && (
                <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                  <CheckCircle className="w-3 h-3 text-emerald-600" />
                  <span>تۆمارکراوە</span>
                </span>
              )}
            </h4>
            <p className="text-[11px] text-amber-800/80 mt-0.5">
              ڕاکانت پۆینتی دیاری شاخت پێدەبەخشێت و بڕیار لە کوالیتی دەدات.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {isAlreadyReviewed && !isEditing && (
            <button
              type="button"
              onClick={() => {
                setIsEditing(true);
                setIsOpen(true);
              }}
              className="px-3 py-1.5 bg-amber-100 hover:bg-amber-200 text-amber-900 text-xs font-bold rounded-xl flex items-center gap-1 transition-colors cursor-pointer"
            >
              <Edit3 className="w-3.5 h-3.5" />
              <span>دەستکاری هەڵسەنگاندن</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setIsOpen(!isOpen)}
            className="p-1.5 bg-white/80 hover:bg-white text-amber-900 rounded-xl border border-amber-200/80 shadow-2xs transition-colors cursor-pointer"
          >
            {isOpen ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* Success Notification Alert */}
      {submitSuccess && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl text-emerald-900 text-xs font-bold flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0" />
          <span>هەڵسەنگاندنەکەت بە سەرکەوتوویی تۆمارکرا! (+١٥ پۆینتی دیاری شاخ وەرگیرا) ⭐</span>
        </div>
      )}

      {/* READ-ONLY VIEW (When already reviewed and not editing) */}
      {isAlreadyReviewed && !isEditing && !isOpen && (
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1">
          {/* Seller Review Display */}
          <div className="bg-white/90 p-3.5 rounded-2xl border border-amber-200/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-orange-900 flex items-center gap-1.5">
                <Store className="w-4 h-4 text-orange-500" />
                <span>{order.sellerName}</span>
              </span>
              <span className="text-amber-500 font-latin font-black flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{order.sellerRating || 5}/5</span>
              </span>
            </div>
            {order.sellerReviewComment && (
              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-xl">
                "{order.sellerReviewComment}"
              </p>
            )}
          </div>

          {/* Driver Review Display */}
          <div className="bg-white/90 p-3.5 rounded-2xl border border-teal-200/60 space-y-1.5">
            <div className="flex items-center justify-between text-xs font-bold">
              <span className="text-teal-900 flex items-center gap-1.5">
                <Truck className="w-4 h-4 text-teal-600" />
                <span>{order.driverName || 'کاپتنی گەیاندن'}</span>
              </span>
              <span className="text-amber-500 font-latin font-black flex items-center gap-1">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                <span>{order.driverRating || 5}/5</span>
              </span>
            </div>
            {order.driverReviewComment && (
              <p className="text-[11px] text-slate-600 italic bg-slate-50 p-2 rounded-xl">
                "{order.driverReviewComment}"
              </p>
            )}
          </div>
        </div>
      )}

      {/* FORM INPUT SECTION (When open or editing) */}
      {isOpen && (
        <form onSubmit={handleSubmit} className="space-y-5 pt-1">
          
          {/* Reward Points Promo Tag */}
          <div className="p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-2xl border border-amber-200 flex items-center gap-2.5">
            <Gift className="w-5 h-5 text-amber-600 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-amber-950 block">پاداشتی شایستە (+١٥ پۆینت)</span>
              <span className="text-slate-600 text-[11px]">بە پڕکردنەوەی ئەستێرە و ڕاکانت، پۆینتی داشکاندنی نوێ وەردەگریت.</span>
            </div>
          </div>

          {/* SECTION 1: SELLER STAR RATING */}
          <div className="bg-white/90 p-4 rounded-2xl border border-orange-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                  <Store className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-orange-600 font-bold block">هەڵسەنگاندنی فرۆشگا</span>
                  <h5 className="text-xs font-black text-slate-900">{order.sellerName}</h5>
                </div>
              </div>

              <span className="text-xs font-bold text-orange-700 bg-orange-50 px-2.5 py-1 rounded-lg border border-orange-100 font-latin">
                {RATING_LABELS[sellerHover || sellerRating]}
              </span>
            </div>

            {/* Interactive Stars Picker */}
            <div className="flex items-center justify-center gap-1.5 py-1.5 bg-orange-50/40 rounded-xl border border-orange-100">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setSellerHover(star)}
                  onMouseLeave={() => setSellerHover(0)}
                  onClick={() => setSellerRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-120 focus:outline-hidden"
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                      star <= (sellerHover || sellerRating)
                        ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Quick Tag Buttons */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600 block">چیت بەدڵ بوو لە فرۆشگا؟ (هەڵبژاردنی خێرا)</span>
              <div className="flex flex-wrap gap-1.5">
                {SELLER_TAGS.map((tag) => {
                  const isSelected = sellerTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleSellerTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-orange-500 text-white border-orange-500 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-orange-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Area */}
            <textarea
              value={sellerComment}
              onChange={(e) => setSellerComment(e.target.value)}
              placeholder="سەرنج و تێبینیت لەسەر کوالیتی، پێکهاتە یان پاکەتکردنی فرۆشگا بنووسە..."
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
              rows={2}
            />
          </div>

          {/* SECTION 2: DRIVER STAR RATING */}
          <div className="bg-white/90 p-4 rounded-2xl border border-teal-200/80 space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                  <Truck className="w-4 h-4" />
                </div>
                <div>
                  <span className="text-[10px] text-teal-600 font-bold block">کاپتنی گەیاندن</span>
                  <h5 className="text-xs font-black text-slate-900">{order.driverName || 'کاپتنی شەریکەی شاخ'}</h5>
                </div>
              </div>

              <span className="text-xs font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-100 font-latin">
                {RATING_LABELS[driverHover || driverRating]}
              </span>
            </div>

            {/* Interactive Stars Picker */}
            <div className="flex items-center justify-center gap-1.5 py-1.5 bg-teal-50/40 rounded-xl border border-teal-100">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  key={star}
                  type="button"
                  onMouseEnter={() => setDriverHover(star)}
                  onMouseLeave={() => setDriverHover(0)}
                  onClick={() => setDriverRating(star)}
                  className="p-1 cursor-pointer transition-transform hover:scale-120 focus:outline-hidden"
                >
                  <Star
                    className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                      star <= (driverHover || driverRating)
                        ? 'fill-amber-400 text-amber-400 drop-shadow-xs'
                        : 'text-slate-200'
                    }`}
                  />
                </button>
              ))}
            </div>

            {/* Quick Driver Tags */}
            <div className="space-y-1">
              <span className="text-[11px] font-bold text-slate-600 block">ڕات لەسەر گەیاندنی کاپتن چی بوو؟</span>
              <div className="flex flex-wrap gap-1.5">
                {DRIVER_TAGS.map((tag) => {
                  const isSelected = driverTags.includes(tag);
                  return (
                    <button
                      key={tag}
                      type="button"
                      onClick={() => toggleDriverTag(tag)}
                      className={`px-2.5 py-1 rounded-xl text-[11px] font-bold border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-teal-600 text-white border-teal-600 shadow-2xs'
                          : 'bg-white text-slate-700 border-slate-200 hover:border-teal-200'
                      }`}
                    >
                      {tag}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Comment Area */}
            <textarea
              value={driverComment}
              onChange={(e) => setDriverComment(e.target.value)}
              placeholder="سەرنج و تێبینیت لەسەر خێرایی و ڕەفتاری کاپتنی گەیاندن بنووسە..."
              className="w-full bg-white border border-slate-200 rounded-xl p-2.5 text-xs focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden"
              rows={2}
            />
          </div>

          {errorMsg && (
            <div className="p-3 bg-rose-50 border border-rose-200 text-rose-700 text-xs font-bold rounded-xl flex items-center gap-2">
              <AlertCircle className="w-4 h-4 text-rose-600" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Action Footer */}
          <div className="flex items-center justify-end gap-2 pt-1">
            {isEditing && (
              <button
                type="button"
                onClick={() => setIsEditing(false)}
                className="px-4 py-2 bg-slate-200 hover:bg-slate-300 text-slate-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
              >
                پاشگەزبوونەوە
              </button>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className="px-5 py-2.5 bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 hover:from-amber-600 hover:to-orange-600 text-white text-xs font-black rounded-xl shadow-md transition-all active:scale-95 cursor-pointer flex items-center gap-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <span>تۆمارکردنی هەڵسەنگاندن...</span>
              ) : (
                <>
                  <Sparkles className="w-4 h-4 text-amber-100 animate-pulse" />
                  <span>{isAlreadyReviewed ? 'نوێکردنەوەی هەڵسەنگاندن' : 'ناردنی هەڵسەنگاندن و تۆمارکردنی پۆینت'}</span>
                </>
              )}
            </button>
          </div>

        </form>
      )}

    </div>
  );
};
