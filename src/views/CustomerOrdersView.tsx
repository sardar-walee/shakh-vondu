import React, { useState } from 'react';
import { Package, Clock, Eye, RotateCcw, AlertCircle, CheckCircle, Star, Sparkles, Award, MessageSquare, ChevronDown, ChevronUp } from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { OrderRatingModal } from '../components/reviews/OrderRatingModal';
import { InlineOrderRatingCard } from '../components/reviews/InlineOrderRatingCard';
import { EmptyState } from '../components/common/EmptyState';
import { Order } from '../types';

interface CustomerOrdersViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const CustomerOrdersView: React.FC<CustomerOrdersViewProps> = ({ onNavigate }) => {
  const { orders } = useMarketplace();
  const { currentUser } = useAuth();
  const [filter, setFilter] = useState<'all' | 'active' | 'delivered' | 'cancelled'>('all');
  const [selectedOrderForRating, setSelectedOrderForRating] = useState<Order | null>(null);
  const [expandedRatingOrderId, setExpandedRatingOrderId] = useState<string | null>(null);

  // Filter orders for the current customer
  let userOrders = orders;
  if (currentUser) {
    userOrders = orders.filter(o => o.customerId === currentUser.id);
  }

  // Calculate customer rating stats
  const deliveredOrders = userOrders.filter(o => o.status === 'delivered');
  const reviewedOrders = deliveredOrders.filter(o => o.isReviewedSeller || o.isReviewedDriver);
  const totalReviewPointsEarned = reviewedOrders.length * 15;
  const avgSellerRatingGiven = reviewedOrders.length > 0
    ? (reviewedOrders.reduce((acc, curr) => acc + (curr.sellerRating || 5), 0) / reviewedOrders.length).toFixed(1)
    : '5.0';

  if (filter === 'active') {
    userOrders = userOrders.filter(o => ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way'].includes(o.status));
  } else if (filter === 'delivered') {
    userOrders = userOrders.filter(o => o.status === 'delivered');
  } else if (filter === 'cancelled') {
    userOrders = userOrders.filter(o => o.status === 'cancelled');
  }

  const toggleInlineRating = (orderId: string) => {
    setExpandedRatingOrderId(prev => (prev === orderId ? null : orderId));
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6 pb-16 text-right">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-slate-900">داواکارییەکانم</h1>
          <p className="text-xs text-slate-500 mt-1">بەدواداچوون بۆ داواکارییە کاراکان، هەڵسەنگاندن و مێژووی کڕینەکانت</p>
        </div>

        {/* Filters */}
        <div className="flex items-center gap-1.5 bg-white p-1 rounded-2xl border border-slate-200 shadow-xs">
          <button
            onClick={() => setFilter('all')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'all' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            هەمووی
          </button>
          <button
            onClick={() => setFilter('active')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'active' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            چالاکەکان
          </button>
          <button
            onClick={() => setFilter('delivered')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'delivered' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            گەیەندراوەکان
          </button>
          <button
            onClick={() => setFilter('cancelled')}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
              filter === 'cancelled' ? 'bg-orange-500 text-white' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            هەڵوەشێنراوە
          </button>
        </div>
      </div>

      {/* Customer Rating & Reviews Summary Stats Banner */}
      {deliveredOrders.length > 0 && (
        <div className="p-4 sm:p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white shadow-lg space-y-3">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center font-bold text-white shadow-inner">
                <Star className="w-6 h-6 fill-white text-white animate-pulse" />
              </div>
              <div>
                <span className="text-[10px] font-black uppercase tracking-wider bg-white/20 px-2.5 py-0.5 rounded-full inline-block mb-1">
                  سیتمی پۆینت و هەڵسەنگاندن
                </span>
                <h3 className="text-sm font-black">ڕاکانت یارمەتیدەری باشترکردنی خزمەتگوزارییەکانن ⭐</h3>
              </div>
            </div>

            <div className="flex items-center gap-2 bg-white/10 backdrop-blur-md px-3 py-1.5 rounded-2xl border border-white/20 font-latin text-xs font-bold">
              <Award className="w-4 h-4 text-amber-200" />
              <span>+{totalReviewPointsEarned} پۆینتی دیاری شاخ</span>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-2 sm:gap-4 pt-2 border-t border-white/20 text-center text-xs">
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
              <span className="text-[10px] text-amber-100 block mb-0.5">داواکاری گەیەندراو</span>
              <span className="text-base font-black font-latin">{deliveredOrders.length} داواکاری</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
              <span className="text-[10px] text-amber-100 block mb-0.5">هەڵسەنگێنراو</span>
              <span className="text-base font-black font-latin">{reviewedOrders.length} هەڵسەنگاندن</span>
            </div>
            <div className="bg-white/10 p-2.5 rounded-2xl backdrop-blur-xs">
              <span className="text-[10px] text-amber-100 block mb-0.5">تێکڕای ئەستێرەکانت</span>
              <span className="text-base font-black font-latin flex items-center justify-center gap-1">
                <Star className="w-4 h-4 fill-amber-200 text-amber-200" />
                <span>{avgSellerRatingGiven} ★</span>
              </span>
            </div>
          </div>
        </div>
      )}

      {/* Orders List */}
      {userOrders.length === 0 ? (
        <EmptyState
          type="orders"
          title="هیچ داواکارییەک نییە"
          description="تۆ هێشتا هیچ داواکارییەکت لەم بەشەدا تۆمار نەکردووە."
          actionLabel="دەستپێکردنی کڕین"
          onAction={() => onNavigate('home')}
        />
      ) : (
        <div className="space-y-4">
          {userOrders.map(order => {
            const isDelivered = order.status === 'delivered';
            const isReviewed = order.isReviewedSeller || order.isReviewedDriver;
            const isInlineExpanded = expandedRatingOrderId === order.id;

            return (
              <div
                key={order.id}
                className="bg-white p-5 rounded-3xl border border-slate-200 hover:border-orange-300 hover:shadow-md transition-all space-y-4"
              >
                {/* Top Row */}
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                      <Package className="w-5 h-5" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold text-slate-900 font-latin">{order.orderNumber}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-[11px] text-slate-400">
                        فرۆشگا: <span className="font-bold text-slate-700">{order.sellerName}</span> • {new Date(order.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>

                  <div className="text-left">
                    <span className="text-xs text-slate-400 block">کۆی پارە:</span>
                    <span className="text-sm font-black text-orange-600 font-latin">
                      {order.total.toLocaleString()} د.ع
                    </span>
                    {order.pointsDiscount ? (
                      <span className="text-[10px] text-emerald-600 dark:text-emerald-400 font-bold block">
                        (داشکاندنی پۆینت: -{order.pointsDiscount.toLocaleString()} د.ع)
                      </span>
                    ) : null}
                  </div>
                </div>

                {/* Shakh Loyalty Points Badge */}
                {(order.pointsEarned || order.pointsUsed) && (
                  <div className="flex items-center gap-2 flex-wrap">
                    {order.pointsEarned ? (
                      <span className="text-[11px] font-bold text-amber-700 dark:text-amber-300 bg-amber-500/10 px-2.5 py-1 rounded-xl border border-amber-500/20 flex items-center gap-1">
                        🪙 <span>+{order.pointsEarned} پۆینتی شاخ بەدەستهاتوو</span>
                      </span>
                    ) : null}
                    {order.pointsUsed ? (
                      <span className="text-[11px] font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-500/10 px-2.5 py-1 rounded-xl border border-emerald-500/20 flex items-center gap-1 font-latin">
                        🎁 <span>{order.pointsUsed} پۆینتی بەکارهاتوو</span>
                      </span>
                    ) : null}
                  </div>
                )}

                {/* Items Preview */}
                <div className="flex items-center gap-3 overflow-x-auto pb-1">
                  {order.items.map((item, idx) => (
                    <div key={idx} className="flex items-center gap-2 bg-slate-50 p-2 rounded-xl border border-slate-100 flex-shrink-0">
                      <img src={item.productImage} alt="" className="w-9 h-9 rounded-lg object-cover" />
                      <div className="text-right">
                        <p className="text-xs font-bold text-slate-800 line-clamp-1 max-w-[140px]">{item.productTitle}</p>
                        <span className="text-[10px] text-slate-400 font-latin">{item.quantity} دانە</span>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Review summary preview if already rated */}
                {isDelivered && isReviewed && !isInlineExpanded && (
                  <div className="p-3 bg-amber-50/70 border border-amber-200/80 rounded-2xl flex flex-wrap items-center justify-between gap-2 text-xs">
                    <div className="flex items-center gap-4">
                      <span className="text-amber-900 font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-amber-500 text-amber-500" />
                        <span>فرۆشگا: {order.sellerRating || 5}★</span>
                      </span>
                      <span className="text-teal-900 font-bold flex items-center gap-1">
                        <Star className="w-3.5 h-3.5 fill-teal-600 text-teal-600" />
                        <span>گەیاندن: {order.driverRating || 5}★</span>
                      </span>
                      {(order.sellerReviewComment || order.driverReviewComment) && (
                        <span className="text-[11px] text-slate-600 hidden sm:inline line-clamp-1 max-w-xs">
                          "{order.sellerReviewComment || order.driverReviewComment}"
                        </span>
                      )}
                    </div>
                    <span className="text-[11px] text-amber-800 font-bold flex items-center gap-1">
                      <CheckCircle className="w-3.5 h-3.5 text-emerald-600" />
                      <span>هەڵسەنگێنراوە</span>
                    </span>
                  </div>
                )}

                {/* Expanded Inline Rating Component */}
                {isDelivered && isInlineExpanded && (
                  <div className="pt-2 animate-in fade-in duration-200">
                    <InlineOrderRatingCard
                      order={order}
                      initiallyOpen={true}
                      onReviewSubmitted={() => {
                        // Keep open for feedback view
                      }}
                    />
                  </div>
                )}

                {/* Bottom Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-2 border-t border-slate-100">
                  <span className="text-xs text-slate-500 font-medium">
                    گەیاندن بۆ: {order.deliveryCity}
                  </span>

                  <div className="flex items-center gap-2">
                    {/* Rate Button for Delivered Orders */}
                    {isDelivered && (
                      <>
                        <button
                          onClick={() => toggleInlineRating(order.id)}
                          className={`px-3.5 py-2 text-xs font-bold rounded-xl flex items-center gap-1.5 transition-colors cursor-pointer ${
                            isReviewed
                              ? 'bg-amber-100 hover:bg-amber-200 text-amber-900'
                              : 'bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:from-amber-600 hover:to-orange-600 shadow-xs'
                          }`}
                        >
                          <Star className={`w-3.5 h-3.5 ${isReviewed ? 'fill-amber-600 text-amber-600' : 'fill-white text-white'}`} />
                          <span>{isReviewed ? 'دەستکاری هەڵسەنگاندن' : 'هەڵسەنگاندن بنووسە (+١٥ پۆینت)'}</span>
                          {isInlineExpanded ? <ChevronUp className="w-3.5 h-3.5 mr-0.5" /> : <ChevronDown className="w-3.5 h-3.5 mr-0.5" />}
                        </button>

                        <button
                          onClick={() => setSelectedOrderForRating(order)}
                          title="هەڵسەنگاندن لە پەنجەرەی گەورە (Modal)"
                          className="p-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold transition-colors cursor-pointer"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => onNavigate('order-tracking', order.id)}
                      className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-xl shadow flex items-center gap-1.5 cursor-pointer transition-colors"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>بەدواداچوون</span>
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Modal Option */}
      {selectedOrderForRating && (
        <OrderRatingModal
          order={selectedOrderForRating}
          isOpen={!!selectedOrderForRating}
          onClose={() => setSelectedOrderForRating(null)}
        />
      )}

    </div>
  );
};

