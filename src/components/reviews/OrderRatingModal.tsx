import React, { useState } from 'react';
import {
  Star,
  Store,
  Truck,
  CheckCircle,
  X,
  Gift,
  Sparkles,
  MessageSquare,
  ThumbsUp,
  Award
} from 'lucide-react';
import { Order } from '../../types';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';

interface OrderRatingModalProps {
  order: Order;
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
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

export const OrderRatingModal: React.FC<OrderRatingModalProps> = ({
  order,
  isOpen,
  onClose,
  onSuccess
}) => {
  const { currentUser } = useMarketplace ? useMarketplace() as any : { currentUser: null };
  const { submitOrderReview } = useMarketplace();
  const { currentUser: authUser } = useAuth();

  const user = authUser || currentUser;

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

  const [activeTab, setActiveTab] = useState<'both' | 'seller' | 'driver'>('both');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isDone, setIsDone] = useState(false);

  if (!isOpen) return null;

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
    if (!user) return;
    setIsSubmitting(true);

    try {
      const driverName = order.driverName || order.deliveryAgentName || 'کاپتنی گەیاندن';
      const driverId = order.driverId || order.deliveryAgentId || 'rebaz-driver';

      await submitOrderReview({
        orderId: order.id,
        orderNumber: order.orderNumber,
        sellerReview: {
          sellerId: order.sellerId,
          sellerName: order.sellerName,
          rating: sellerRating,
          comment: sellerComment.trim() || 'فرۆشگایەکی نایاب و کاڵای بەکوالیتی.',
          tags: sellerTags
        },
        driverReview: {
          driverId: driverId,
          driverName: driverName,
          rating: driverRating,
          comment: driverComment.trim() || 'گەیاندنێکی زۆر خێرا و کاپتنی بەڕێز.',
          tags: driverTags
        }
      });

      setIsDone(true);
      setTimeout(() => {
        setIsDone(false);
        onClose();
        if (onSuccess) onSuccess();
      }, 1500);
    } catch (err) {
      console.error('Rating submit error:', err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs overflow-y-auto">
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-xl w-full border border-slate-100 shadow-2xl space-y-6 text-right relative my-8 animate-in fade-in zoom-in-95 duration-200">
        
        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-5 left-5 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
        >
          <X className="w-5 h-5" />
        </button>

        {isDone ? (
          <div className="py-12 text-center space-y-4">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-inner">
              <CheckCircle className="w-10 h-10" />
            </div>
            <h3 className="text-xl font-black text-slate-900">سوپاس بۆ هەڵسەنگاندنەکەت! 🎉</h3>
            <p className="text-xs text-slate-600 max-w-sm mx-auto">
              ڕاکانی تۆ یارمەتیدەری فرۆشیار و کاپتنانە بۆ پێشکەشکردنی خزمەتگوزارییەکی باشتر.
            </p>
            <div className="inline-flex items-center gap-2 px-4 py-2 bg-amber-50 border border-amber-200 text-amber-900 rounded-xl text-xs font-bold font-latin">
              <Award className="w-4 h-4 text-amber-600" />
              <span>+١٥ پۆینتی دیاری شاخ بۆ هەژمارەکەت زیادکرا! ⭐</span>
            </div>
          </div>
        ) : (
          <>
            {/* Header */}
            <div className="border-b border-slate-100 pb-4 pr-1">
              <div className="flex items-center gap-2 mb-1">
                <span className="px-2.5 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-black rounded-md font-latin">
                  {order.orderNumber}
                </span>
                <span className="text-xs text-slate-400">داواکاری گەیەندراو</span>
              </div>
              <h2 className="text-lg sm:text-xl font-black text-slate-900">
                هەڵسەنگاندنی فرۆشیار و کاپتنی گەیاندن
              </h2>
              <p className="text-xs text-slate-500 mt-1">
                تکایە ڕای خۆت دەربارەی کوالیتی کاڵاکان و خێرایی گەیاندن تۆمار بکە.
              </p>
            </div>

            {/* Quick Reward Banner */}
            <div className="p-3 bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/5 rounded-2xl border border-amber-200/80 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs">
                <Gift className="w-5 h-5" />
              </div>
              <div className="text-xs">
                <span className="font-black text-amber-900 block">پاداشتی پۆینتی شاخ (+١٥ پۆینت)</span>
                <span className="text-slate-600 text-[11px]">بە نووسینی هەڵسەنگاندن، پۆینتی شڕینی شاخ بۆ هەژمارەکەت زیاد دەبێت.</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              
              {/* SECTION 1: SELLER REVIEW */}
              <div className="p-4 sm:p-5 rounded-2xl bg-orange-50/40 border border-orange-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-orange-600 font-bold uppercase block">هەڵسەنگاندنی فرۆشگا</span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">{order.sellerName}</h4>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-orange-700 font-latin">
                    {RATING_LABELS[sellerHover || sellerRating]}
                  </span>
                </div>

                {/* Star Picker */}
                <div className="flex items-center justify-center gap-2 py-1 bg-white p-3 rounded-xl border border-orange-100 shadow-2xs">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setSellerHover(star)}
                      onMouseLeave={() => setSellerHover(0)}
                      onClick={() => setSellerRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          star <= (sellerHover || sellerRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Seller Quick Tags */}
                <div className="space-y-1.5">
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

                {/* Seller Comment */}
                <div>
                  <textarea
                    value={sellerComment}
                    onChange={(e) => setSellerComment(e.target.value)}
                    placeholder="سەرنج و تێبینیت لەسەر کوالیتی، پێکهاتە یان پاکەتکردنی فرۆشگا بنووسە..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-orange-500/20 focus:outline-hidden"
                    rows={2}
                  />
                </div>
              </div>

              {/* SECTION 2: DRIVER REVIEW */}
              <div className="p-4 sm:p-5 rounded-2xl bg-teal-50/40 border border-teal-100 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                      <Truck className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-[10px] text-teal-600 font-bold uppercase block">کاپتنی گەیاندن</span>
                      <h4 className="text-xs sm:text-sm font-black text-slate-900">
                        {order.driverName || order.deliveryAgentName || 'کاپتن ڕێباز'}
                      </h4>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-teal-700 font-latin">
                    {RATING_LABELS[driverHover || driverRating]}
                  </span>
                </div>

                {/* Star Picker */}
                <div className="flex items-center justify-center gap-2 py-1 bg-white p-3 rounded-xl border border-teal-100 shadow-2xs">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setDriverHover(star)}
                      onMouseLeave={() => setDriverHover(0)}
                      onClick={() => setDriverRating(star)}
                      className="p-1 cursor-pointer transition-transform hover:scale-115 focus:outline-hidden"
                    >
                      <Star
                        className={`w-7 h-7 sm:w-8 sm:h-8 transition-colors ${
                          star <= (driverHover || driverRating)
                            ? 'fill-amber-400 text-amber-400'
                            : 'text-slate-200'
                        }`}
                      />
                    </button>
                  ))}
                </div>

                {/* Driver Quick Tags */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-bold text-slate-600 block">ڕات لەسەر گەیاندن چی بوو؟</span>
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

                {/* Driver Comment */}
                <div>
                  <textarea
                    value={driverComment}
                    onChange={(e) => setDriverComment(e.target.value)}
                    placeholder="سەرنج و تێبینیت لەسەر خێرایی و ڕەفتاری کاپتنی گەیاندن بنووسە..."
                    className="w-full bg-white border border-slate-200 rounded-xl p-3 text-xs focus:ring-2 focus:ring-teal-500/20 focus:outline-hidden"
                    rows={2}
                  />
                </div>
              </div>

              {/* Actions */}
              <div className="flex items-center justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-5 py-2.5 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors cursor-pointer"
                >
                  داخستن
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-3 bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white text-xs font-black rounded-xl shadow-md cursor-pointer transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  {isSubmitting ? (
                    <span>خەریکی ناردنە...</span>
                  ) : (
                    <>
                      <Sparkles className="w-4 h-4" />
                      <span>ناردنی هەڵسەنگاندن و وەرگرتنی پۆینت</span>
                    </>
                  )}
                </button>
              </div>

            </form>
          </>
        )}

      </div>
    </div>
  );
};
