import React, { useState } from 'react';
import {
  Truck,
  Package,
  MapPin,
  Phone,
  CheckCircle,
  Clock,
  ArrowRight,
  ShieldCheck,
  AlertCircle,
  Star,
  Award,
  Percent,
  Coins,
  FileText,
  X,
  Gift,
  HelpCircle,
  MessageSquare,
  Sparkles,
  Send,
  ThumbsUp,
  User
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { StatusBadge } from '../components/common/Badge';

interface DeliveryDashboardViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const DeliveryDashboardView: React.FC<DeliveryDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const {
    orders,
    updateOrderStatus,
    assignDriverToOrder,
    getDriverStats,
    getDriverReviews,
    replyToReview
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'deliveries' | 'reviews' | 'history'>('deliveries');
  const [showShakhRulesModal, setShowShakhRulesModal] = useState(false);
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  const driverId = currentUser?.id || 'rebaz-driver';

  // Orders ready for pickup or on the way
  const availableOrders = orders.filter(o => o.status === 'ready' && !o.driverId);
  const myDeliveries = orders.filter(o => (o.driverId === driverId || o.deliveryAgentId === driverId) && ['picked_up', 'on_the_way', 'ready'].includes(o.status));
  const completedDeliveries = orders.filter(o => o.status === 'delivered' && (o.driverId === driverId || o.deliveryAgentId === driverId));

  const driverStats = getDriverStats(driverId);
  const driverReviews = getDriverReviews(driverId);

  const handleAcceptDelivery = (orderId: string) => {
    assignDriverToOrder(
      orderId,
      driverId,
      currentUser?.fullName || 'ڕێباز گەیاندن (کاپتن ڕێباز)',
      currentUser?.phone || '0750 333 4455'
    );
  };

  const handleSendDriverReply = async (reviewId: string) => {
    if (!replyText.trim()) return;
    await replyToReview(reviewId, replyText.trim(), 'driver');
    setReplyingReviewId(null);
    setReplyText('');
  };

  // Star breakdown calculation
  const fiveStars = driverReviews.filter(r => r.rating === 5).length;
  const fourStars = driverReviews.filter(r => r.rating === 4).length;
  const threeStars = driverReviews.filter(r => r.rating === 3).length;
  const twoStars = driverReviews.filter(r => r.rating === 2).length;
  const oneStars = driverReviews.filter(r => r.rating === 1).length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-teal-700 to-emerald-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                داشبۆردی کاپتنی گەیاندن (Shakh Delivery)
              </h1>
              <span className="px-2.5 py-0.5 bg-amber-100 text-amber-800 text-[11px] font-extrabold rounded-full flex items-center gap-1 border border-amber-300">
                <Star className="w-3 h-3 fill-amber-500 text-amber-500" />
                کاپتنی زێڕین ({driverStats.rating || 4.9} ★)
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              کاپتن: <span className="font-bold text-slate-800">{currentUser?.fullName || 'ڕێباز کاپتن'}</span> • شار: {currentUser?.city || 'هەولێر'}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 flex-wrap">
          <button
            onClick={() => setShowShakhRulesModal(true)}
            className="px-4 py-3 bg-teal-50 hover:bg-teal-100 border border-teal-200 text-teal-800 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer"
          >
            <ShieldCheck className="w-4 h-4 text-teal-600" />
            <span>یاسای شاخ (Shakh Courier Rules)</span>
          </button>
        </div>
      </div>

      {/* Driver Financial & Points Analytics Banner */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Rating Card */}
        <div className="bg-gradient-to-br from-amber-500 to-orange-600 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-20 h-20 bg-white/10 rounded-full blur-xs"></div>
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-amber-100">هەڵسەنگاندنی کڕیاران</span>
            <Star className="w-5 h-5 text-amber-200 fill-amber-200" />
          </div>
          <div className="mt-3">
            <h2 className="text-3xl font-black font-latin tracking-tight flex items-baseline gap-1">
              {driverStats.rating || 4.9} <span className="text-sm font-sans font-bold text-amber-100">لە ٥.٠</span>
            </h2>
            <p className="text-[11px] text-amber-100/90 mt-1 flex items-center gap-1">
              <MessageSquare className="w-3.5 h-3.5" />
              <span>{driverReviews.length || driverStats.totalReviews || 2} هەڵسەنگاندنی تۆمارکراو</span>
            </p>
          </div>
        </div>

        {/* Points Card */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">پۆینتەکانی کاپتن</span>
            <Award className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-slate-900 font-latin">
              {driverStats.points.toLocaleString()} <span className="text-xs font-sans text-slate-500">پۆینت</span>
            </h2>
            <p className="text-[11px] text-emerald-600 font-medium mt-1">
              ئامادەیە بۆ بەنزین و دیاری
            </p>
          </div>
        </div>

        {/* Total Deliveries Fee */}
        <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-slate-500">کۆی کرێی گەیاندن</span>
            <Coins className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-slate-900 font-latin">
              {driverStats.totalDeliveryFees.toLocaleString()} <span className="text-xs font-sans text-slate-500">د.ع</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">
              ژمارەی گەیاندن: <span className="font-bold text-slate-800 font-latin">{driverStats.totalDeliveries}</span>
            </p>
          </div>
        </div>

        {/* Net Driver Earnings (80%) */}
        <div className="bg-white p-5 rounded-3xl border border-emerald-200 bg-emerald-50/40 shadow-xs">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-emerald-800">قازانجی خاوێن (٨٠٪)</span>
            <CheckCircle className="w-5 h-5 text-emerald-600" />
          </div>
          <div className="mt-3">
            <h2 className="text-2xl font-black text-emerald-700 font-latin">
              {driverStats.totalNetEarnings.toLocaleString()} <span className="text-xs font-sans text-emerald-600">د.ع</span>
            </h2>
            <p className="text-[11px] text-emerald-700 font-medium mt-1">
              بڕڕاوی شاخ (٢٠٪): {driverStats.totalShakhCommission.toLocaleString()} د.ع
            </p>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-200 pb-3">
        <button
          onClick={() => setActiveTab('deliveries')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'deliveries'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>داواکارییەکانی گەیاندن ({myDeliveries.length + availableOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('reviews')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'reviews'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
          <span>ڕا و هەڵسەنگاندنی کڕیاران ({driverReviews.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('history')}
          className={`px-5 py-2.5 rounded-2xl text-xs font-black transition-all cursor-pointer flex items-center gap-2 ${
            activeTab === 'history'
              ? 'bg-teal-600 text-white shadow-md'
              : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
          }`}
        >
          <Clock className="w-4 h-4" />
          <span>مێژووی تەواوکراوەکان ({completedDeliveries.length})</span>
        </button>
      </div>

      {/* TAB 1: DELIVERIES */}
      {activeTab === 'deliveries' && (
        <div className="space-y-8">
          {/* Active Delivery in Progress */}
          {myDeliveries.length > 0 && (
            <div className="bg-gradient-to-r from-teal-900 via-slate-900 to-teal-950 text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
              <div className="flex items-center justify-between border-b border-teal-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                  <h3 className="text-sm font-black">داواکارییە چالاکەکانت لە گەیاندندا ({myDeliveries.length})</h3>
                </div>
                <span className="text-xs text-teal-300 font-medium">پۆینت بۆ ئەم داواکارییە: +31 پۆینت</span>
              </div>

              <div className="space-y-4">
                {myDeliveries.map(order => (
                  <div key={order.id} className="bg-white/10 backdrop-blur-md p-5 rounded-2xl border border-white/10 space-y-4">
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div>
                        <span className="text-xs font-bold font-latin">{order.orderNumber}</span>
                        <h4 className="text-base font-bold text-white mt-0.5">{order.sellerName}</h4>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs text-teal-100">
                      <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl">
                        <MapPin className="w-4 h-4 text-orange-400 flex-shrink-0" />
                        <span>گەیاندن بۆ: {order.deliveryAddress}</span>
                      </div>
                      <div className="flex items-center gap-2 bg-white/5 p-3 rounded-xl">
                        <Phone className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                        <span>مۆبایلی کڕیار: {order.customerPhone || '0750 111 2233'}</span>
                      </div>
                    </div>

                    {/* Progress Buttons */}
                    <div className="flex flex-wrap gap-2 pt-2 border-t border-white/10">
                      {order.status === 'ready' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'picked_up')}
                          className="px-5 py-2.5 bg-blue-500 hover:bg-blue-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          وەمگرت لە فرۆشیار (Mark Picked Up)
                        </button>
                      )}
                      {order.status === 'picked_up' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'on_the_way')}
                          className="px-5 py-2.5 bg-sky-500 hover:bg-sky-600 text-white text-xs font-bold rounded-xl cursor-pointer"
                        >
                          لە ڕێگام بۆ لای کڕیار (On The Way)
                        </button>
                      )}
                      {order.status === 'on_the_way' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'delivered')}
                          className="px-6 py-2.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-black rounded-xl shadow-lg cursor-pointer"
                        >
                          گەیەندرا بە سەرکەوتوویی (Mark Delivered) ✓
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Available Orders for Pickup */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-900">
              داواکارییە ئامادەکان بۆ وەرگرتن ({availableOrders.length})
            </h3>

            {availableOrders.length === 0 ? (
              <p className="text-xs text-slate-400 py-6 text-center">هیچ داواکارییەکی نوێ ئامادە نییە لە ئێستادا.</p>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {availableOrders.map(order => {
                  const orderFee = order.deliveryFee || 3000;
                  const netEarn = Math.round(orderFee * 0.80);
                  const shakhCut = Math.round(orderFee * 0.20);
                  const estPoints = 25 + Math.round(orderFee / 500);

                  return (
                    <div key={order.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3 hover:border-teal-300 transition-colors">
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold font-latin">{order.orderNumber}</span>
                        <span className="text-xs font-black text-orange-600 font-latin">{order.total.toLocaleString()} د.ع</span>
                      </div>

                      <div className="text-xs text-slate-600 space-y-1">
                        <p><span className="font-bold">فرۆشگا:</span> {order.sellerName}</p>
                        <p><span className="font-bold">ناونیشان:</span> {order.deliveryAddress}</p>
                        
                        <div className="p-2 bg-teal-50/70 border border-teal-100 rounded-xl space-y-1 my-2">
                          <div className="flex justify-between font-latin text-[11px]">
                            <span><span className="font-bold text-slate-700">کرێی گەیاندن:</span> {orderFee.toLocaleString()} د.ع</span>
                            <span className="font-bold text-emerald-700">قازانجی تۆ (٨٠٪): {netEarn.toLocaleString()} د.ع</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-latin">
                            <span>بڕڕاوی شاخ (٢٠٪): {shakhCut.toLocaleString()} د.ع</span>
                            <span className="font-bold text-amber-600">⭐ +{estPoints} پۆینت</span>
                          </div>
                        </div>
                      </div>

                      <button
                        onClick={() => handleAcceptDelivery(order.id)}
                        className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                      >
                        وەرگرتنی ئەم گەیاندنە (Accept Delivery)
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 2: REVIEWS & RATINGS */}
      {activeTab === 'reviews' && (
        <div className="space-y-6">
          
          {/* Reviews Score Card */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
            <div className="md:col-span-4 text-center md:border-l md:border-slate-100 md:pl-6 space-y-2">
              <span className="text-xs font-bold text-slate-400">تێکڕای هەڵسەنگاندنی تۆ</span>
              <div className="flex items-center justify-center gap-2">
                <span className="text-5xl font-black font-latin text-slate-900">{driverStats.rating || 4.9}</span>
                <div className="text-right">
                  <div className="flex text-amber-400">
                    {[1, 2, 3, 4, 5].map(s => (
                      <Star key={s} className="w-4 h-4 fill-amber-400" />
                    ))}
                  </div>
                  <span className="text-xs text-slate-400 font-latin">{driverReviews.length} هەڵسەنگاندن</span>
                </div>
              </div>
              <p className="text-xs text-emerald-600 font-bold bg-emerald-50 py-1 px-3 rounded-full inline-block">
                ٩٩٪ لە کڕیاران ڕازین لە خێرایی تۆ 🚀
              </p>
            </div>

            {/* Stars Breakdown */}
            <div className="md:col-span-8 space-y-2">
              {[5, 4, 3, 2, 1].map(starsCount => {
                const count = driverReviews.filter(r => r.rating === starsCount).length;
                const percent = driverReviews.length > 0 ? (count / driverReviews.length) * 100 : starsCount === 5 ? 100 : 0;
                return (
                  <div key={starsCount} className="flex items-center gap-3 text-xs">
                    <span className="w-12 text-slate-500 font-latin font-bold flex items-center gap-1">
                      <span>{starsCount}</span>
                      <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${percent}%` }}
                      ></div>
                    </div>
                    <span className="w-8 text-slate-400 font-latin text-left">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews List */}
          <div className="space-y-4">
            <h3 className="text-base font-black text-slate-900">
              سەرنج و تێبینیەکانی کڕیاران دەربارەی گەیاندن ({driverReviews.length})
            </h3>

            {driverReviews.length === 0 ? (
              <div className="bg-white p-12 rounded-3xl border border-slate-200 text-center space-y-2">
                <Star className="w-10 h-10 text-slate-300 mx-auto" />
                <h4 className="text-sm font-bold text-slate-700">هێشتا هیچ هەڵسەنگاندنێک تۆمار نەکراوە</h4>
                <p className="text-xs text-slate-400">دوای تەواوکردنی داواکاری، کڕیاران ڕای خۆیان لێرە تۆمار دەکەن.</p>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-4">
                {driverReviews.map(rev => (
                  <div
                    key={rev.id}
                    className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 hover:border-teal-300 transition-colors shadow-2xs"
                  >
                    {/* Header */}
                    <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                      <div className="flex items-center gap-3">
                        <img
                          src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                          alt=""
                          className="w-10 h-10 rounded-full object-cover border border-slate-200"
                        />
                        <div>
                          <h4 className="text-xs sm:text-sm font-black text-slate-900">{rev.userName}</h4>
                          <p className="text-[11px] text-slate-400">
                            {rev.orderNumber && <span className="font-latin font-bold text-teal-700 ml-2">داواکاری: {rev.orderNumber}</span>}
                            <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                          </p>
                        </div>
                      </div>

                      {/* Stars */}
                      <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                        {[1, 2, 3, 4, 5].map(s => (
                          <Star
                            key={s}
                            className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                          />
                        ))}
                        <span className="text-xs font-black font-latin text-amber-900 mr-1">{rev.rating}.0</span>
                      </div>
                    </div>

                    {/* Tags */}
                    {rev.tags && rev.tags.length > 0 && (
                      <div className="flex flex-wrap gap-1.5">
                        {rev.tags.map((tag, i) => (
                          <span
                            key={i}
                            className="px-2.5 py-0.5 rounded-lg bg-teal-50 text-teal-800 text-[11px] font-bold border border-teal-100"
                          >
                            {tag}
                          </span>
                        ))}
                      </div>
                    )}

                    {/* Comment Body */}
                    <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                      "{rev.comment}"
                    </p>

                    {/* Driver Reply Section */}
                    {rev.driverReply ? (
                      <div className="p-3 bg-teal-50/90 border border-teal-200 rounded-2xl space-y-1 mr-4">
                        <div className="flex items-center justify-between text-[11px] font-black text-teal-900">
                          <span>وەڵامی کاپتن ({currentUser?.fullName || 'ڕێباز کاپتن'}):</span>
                          <span className="text-[10px] text-teal-600 font-normal">
                            {new Date(rev.driverReply.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                        <p className="text-xs text-teal-800">{rev.driverReply.comment}</p>
                      </div>
                    ) : (
                      <div>
                        {replyingReviewId === rev.id ? (
                          <div className="space-y-2 pt-2 border-t border-slate-100">
                            <textarea
                              value={replyText}
                              onChange={(e) => setReplyText(e.target.value)}
                              placeholder="سوپاسی کڕیار بکە یان وەڵامی سەرنجەکەی بدەرەوە..."
                              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                              rows={2}
                            />
                            <div className="flex justify-end gap-2">
                              <button
                                onClick={() => setReplyingReviewId(null)}
                                className="px-3 py-1.5 text-xs text-slate-500 font-bold"
                              >
                                پاشگەزبوونەوە
                              </button>
                              <button
                                onClick={() => handleSendDriverReply(rev.id)}
                                className="px-4 py-1.5 bg-teal-600 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                              >
                                <Send className="w-3.5 h-3.5" />
                                <span>ناردنی وەڵام</span>
                              </button>
                            </div>
                          </div>
                        ) : (
                          <button
                            onClick={() => {
                              setReplyingReviewId(rev.id);
                              setReplyText('');
                            }}
                            className="text-xs font-bold text-teal-700 hover:text-teal-900 flex items-center gap-1.5 cursor-pointer pt-1"
                          >
                            <MessageSquare className="w-3.5 h-3.5" />
                            <span>وەڵامدانەوەی ئەم کڕیارە</span>
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}

      {/* TAB 3: COMPLETED DELIVERIES HISTORY */}
      {activeTab === 'history' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
          <h3 className="text-sm font-black text-slate-900">
            مێژووی داواکارییە گەیەندراوەکان ({completedDeliveries.length})
          </h3>

          {completedDeliveries.length === 0 ? (
            <p className="text-xs text-slate-400 py-6 text-center">هیچ داواکارییەکی گەیەندراو تۆمار نەکراوە لە ئێستادا.</p>
          ) : (
            <div className="space-y-3">
              {completedDeliveries.map(order => (
                <div key={order.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-wrap items-center justify-between gap-3">
                  <div>
                    <span className="text-xs font-bold font-latin">{order.orderNumber}</span>
                    <h4 className="text-xs font-bold text-slate-800">{order.sellerName}</h4>
                    <p className="text-[11px] text-slate-500">گەیاندن بۆ: {order.deliveryAddress}</p>
                  </div>

                  <div className="text-left">
                    <span className="text-xs font-black text-emerald-600 font-latin block">
                      +{(Math.round((order.deliveryFee || 3000) * 0.80)).toLocaleString()} د.ع قازانج
                    </span>
                    <span className="text-[10px] text-amber-600 font-bold">
                      ⭐ +{25 + Math.round((order.deliveryFee || 3000) / 500)} پۆینت
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Modal for "یاسای شاخ" */}
      {showShakhRulesModal && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white w-full max-w-2xl rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl relative my-8">
            <button
              onClick={() => setShowShakhRulesModal(false)}
              className="absolute top-6 left-6 p-2 bg-slate-100 hover:bg-slate-200 text-slate-600 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-3 border-b border-slate-100 pb-4">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-xl font-black text-slate-900">
                  یاسا و ڕێنماییەکانی کاپتنی شاخ (یاسای شاخ)
                </h2>
                <p className="text-xs text-slate-500">پەیماننامەی ڕێکخستنی گەیاندن و پاداشتەکان لە ئەپڵیکەیشنی شاخ</p>
              </div>
            </div>

            <div className="space-y-4 max-h-96 overflow-y-auto pr-2 text-xs text-slate-700 leading-relaxed">
              
              {/* Rule 1 */}
              <div className="p-4 bg-teal-50/60 border border-teal-200 rounded-2xl space-y-2">
                <h3 className="text-sm font-black text-teal-900 flex items-center gap-2">
                  <Percent className="w-4 h-4 text-teal-600" />
                  یاسای ١: بڕینی ڕێژەی ٢٠٪ی گەیاندن و ٨٠٪ی قازانجی کاپتن
                </h3>
                <p className="text-slate-600">
                  لە هەر داواکارییەکی گەیاندندا لەسەر سیستەمی شاخ، ۲۰٪ لە کرێی دیاریکراوی گەیاندن دەبڕدرێت و دەچێت بۆ خەرجەکانی پشتیوانی تەکنیکی و سێرڤەرەکانی شاخ. ٨٠٪ی کرێی گەیاندنەکە ڕاستەوخۆ بە نێت دەبێتە قازانجی کاپتنی گەیاندن.
                </p>
              </div>

              {/* Rule 2 */}
              <div className="p-4 bg-amber-50/60 border border-amber-200 rounded-2xl space-y-2">
                <h3 className="text-sm font-black text-amber-900 flex items-center gap-2">
                  <Award className="w-4 h-4 text-amber-600" />
                  یاسای ٢: سیستەمی پۆینت و پاداشتی کاپتنان
                </h3>
                <p className="text-slate-600">
                  لە بەرامبەر هەر گەیاندنێکی سەرکەوتوودا، کاپتن پۆینت کۆدەکاتەوە (۲٥ پۆینتی بنەڕەتی + ۱ پۆینت بۆ هەر ۵۰۰ د.ع کرێی گەیاندن). پۆینتەکان بەکارژمێردرێن بۆ گۆڕینەوە بۆ:
                </p>
                <ul className="list-disc list-inside text-slate-600 space-y-1 pr-2">
                  <li>کارت و ڤاوچەری بەنزینی خۆڕایی</li>
                  <li>پاداشتی دارایی مانگانە بۆ کاپتنە یەکەمەکان</li>
                  <li>بەرزکردنەوەی ئاستی کاپتن بۆ "کاپتنی زێڕین" و هەڵبژاردنی لە پێشینەی داواکارییەکان</li>
                </ul>
              </div>

              {/* Rule 3 */}
              <div className="p-4 bg-blue-50/60 border border-blue-200 rounded-2xl space-y-2">
                <h3 className="text-sm font-black text-blue-900 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-blue-600" />
                  یاسای ٣: خێرایی، ئەمانەت و پاراستنی کاڵاکان
                </h3>
                <p className="text-slate-600">
                  کاپتن بەرپرسە لە پاراستنی خواردن و بەرهەمەکان لە کاتی وەرگرتن تا گەیاندن. بەکاربهێنانی پاراستنی گەرمی بۆ خواردن و ڕێزگرتن لە کاتی گەیاندن (زۆرتر لە ۳۰ خولەک دەرباز نەبێت).
                </p>
              </div>

              {/* Rule 4 */}
              <div className="p-4 bg-slate-50 border border-slate-200 rounded-2xl space-y-2">
                <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                  <Coins className="w-4 h-4 text-slate-600" />
                  یاسای ٤: پاکتاوی دارایی نەقد (Cash on Delivery)
                </h3>
                <p className="text-slate-600">
                  لە کاتی وەرگرتنی پارەی نەقد لە کڕیار، کاپتن ئامانەتدارە و پێویستە پارەی فرۆشیار لە کاتی دیاریکراودا یان دوای تەواوبوونی شفت پاکتاو بکات.
                </p>
              </div>

            </div>

            <div className="pt-2 border-t border-slate-100 flex justify-end">
              <button
                onClick={() => setShowShakhRulesModal(false)}
                className="px-6 py-3 bg-teal-600 hover:bg-teal-700 text-white font-bold text-xs rounded-xl shadow-md cursor-pointer"
              >
                تێگەشتم و یاساکانی شاخ قبوڵ دەکەم ✓
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};
