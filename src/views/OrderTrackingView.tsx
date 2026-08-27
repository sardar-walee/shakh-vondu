import React, { useState } from 'react';
import {
  Package,
  Truck,
  CheckCircle,
  Clock,
  Phone,
  MapPin,
  Store,
  Receipt,
  User,
  Star,
  RotateCcw,
  ArrowRight,
  AlertCircle,
  ShieldCheck,
  Award,
  Sparkles,
  MessageSquare
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge } from '../components/common/Badge';
import { OrderStatus } from '../types';
import { OrderRatingModal } from '../components/reviews/OrderRatingModal';
import { LiveOrderTrackingMap } from '../components/delivery/LiveOrderTrackingMap';

interface OrderTrackingViewProps {
  orderId: string;
  onNavigate: (view: string, param?: string) => void;
}

export const OrderTrackingView: React.FC<OrderTrackingViewProps> = ({
  orderId,
  onNavigate
}) => {
  const { orders, sellers, updateOrderStatus } = useMarketplace();
  const { currentUser, isSuperAdmin, isDeliveryAgent } = useAuth();

  const order = orders.find(o => o.id === orderId) || orders[0];
  const seller = sellers.find(s => s.id === order?.sellerId);

  const [ratingModal, setRatingModal] = useState(false);

  if (!order) {
    return (
      <div className="text-center py-20 bg-white rounded-3xl border border-slate-200 p-8">
        <h2 className="text-xl font-bold text-slate-800">داواکارییەکە نەدۆزرایەوە</h2>
        <button
          onClick={() => onNavigate('home')}
          className="mt-4 px-6 py-2.5 bg-orange-500 text-white rounded-xl text-xs font-bold"
        >
          گەڕانەوە بۆ سەرەتا
        </button>
      </div>
    );
  }

  // Steps definition
  const steps: { key: OrderStatus; label: string; desc: string; icon: React.ReactNode }[] = [
    { key: 'pending', label: 'تۆمارکرا', desc: 'چاوەڕوانی پەسەندکردن', icon: <Clock className="w-4 h-4" /> },
    { key: 'accepted', label: 'پەسەندکرا', desc: 'فرۆشیار پەسەندی کرد', icon: <CheckCircle className="w-4 h-4" /> },
    { key: 'preparing', label: 'ئامادەکردن', desc: 'خەریکی ئامادەکردنی کاڵاکانە', icon: <Package className="w-4 h-4" /> },
    { key: 'ready', label: 'ئامادەیە', desc: 'ئامادەیە بۆ ڕادەستکردنی شۆفێر', icon: <Store className="w-4 h-4" /> },
    { key: 'picked_up', label: 'وەرگیرا', desc: 'شۆفێر کاڵاکەی لە فرۆشیار وەرگرت', icon: <Truck className="w-4 h-4" /> },
    { key: 'on_the_way', label: 'لە ڕێگادایە', desc: 'کاپتن بەرەو ناونیشانەکەت دێت', icon: <MapPin className="w-4 h-4" /> },
    { key: 'delivered', label: 'گەیەندرا', desc: 'داواکاری گەیشتە دەستت', icon: <CheckCircle className="w-4 h-4" /> }
  ];

  const statusOrder: OrderStatus[] = ['pending', 'accepted', 'preparing', 'ready', 'picked_up', 'on_the_way', 'delivered'];
  const currentIndex = statusOrder.indexOf(order.status);
  const isDelivered = order.status === 'delivered';
  const isCancelled = order.status === 'cancelled';

  // Demo status advancement button for testing
  const handleAdvanceStatus = () => {
    if (currentIndex < statusOrder.length - 1) {
      const nextStatus = statusOrder[currentIndex + 1];
      updateOrderStatus(order.id, nextStatus);
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-8 pb-16">
      
      {/* Header & Status Card */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-slate-100 pb-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-slate-400">کۆدی داواکاری:</span>
              <span className="text-xs font-black text-slate-900 font-latin">{order.orderNumber}</span>
              <StatusBadge status={order.status} />
            </div>
            <p className="text-xs text-slate-500 mt-1">
              بەروار: {new Date(order.createdAt).toLocaleDateString()} - {new Date(order.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>

          {/* Quick Simulation controls for Reviewer */}
          <div className="flex items-center gap-2">
            {!isDelivered && !isCancelled && (
              <button
                onClick={handleAdvanceStatus}
                className="px-3.5 py-1.5 rounded-xl bg-orange-100 hover:bg-orange-200 text-orange-800 text-xs font-bold transition-colors cursor-pointer"
                title="تاقیکردنەوەی هەنگاوی داهاتوو"
              >
                هەنگاوی داهاتوو (Demo Next Step)
              </button>
            )}
          </div>
        </div>

        {/* Live Visual Timeline */}
        {isCancelled ? (
          <div className="p-6 rounded-2xl bg-rose-50 border border-rose-200 text-center text-rose-700">
            <AlertCircle className="w-8 h-8 mx-auto mb-2 text-rose-600" />
            <h4 className="font-bold text-sm">داواکارییەکە هەڵوەشێنراوەتەوە</h4>
            <p className="text-xs mt-1">ئەم داواکارییە هەڵوەشێنراوەتەوە و هیچ بڕە پارەیەک وەرناگیرێت.</p>
          </div>
        ) : (
          <div className="space-y-4">
            <h3 className="text-xs font-bold text-slate-400">هەنگاوەکانی گەیاندن:</h3>
            
            {/* Horizontal Timeline on Desktop / Vertical on Mobile */}
            <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2">
              {steps.map((step, idx) => {
                const isPassed = idx <= currentIndex;
                const isCurrent = idx === currentIndex;

                return (
                  <div
                    key={step.key}
                    className={`p-3 rounded-2xl border text-center transition-all ${
                      isCurrent
                        ? 'bg-orange-500 text-white border-orange-500 shadow-md ring-2 ring-orange-500/20'
                        : isPassed
                        ? 'bg-emerald-50 text-emerald-800 border-emerald-200'
                        : 'bg-slate-50 text-slate-400 border-slate-100'
                    }`}
                  >
                    <div className={`w-7 h-7 mx-auto rounded-full flex items-center justify-center mb-1.5 ${
                      isCurrent ? 'bg-white text-orange-600' : isPassed ? 'bg-emerald-500 text-white' : 'bg-slate-200 text-slate-500'
                    }`}>
                      {step.icon}
                    </div>
                    <h5 className="text-[11px] font-bold">{step.label}</h5>
                    <p className={`text-[9px] mt-0.5 ${isCurrent ? 'text-orange-100' : isPassed ? 'text-emerald-600' : 'text-slate-400'}`}>
                      {step.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* Real-time Interactive Geolocation Map */}
        {!isCancelled && (
          <div className="pt-2">
            <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>نەخشەی ڕاستەوخۆ و شوێنپێهەڵگرتنی کاپتن (Live GPS Order Map):</span>
            </h3>
            <LiveOrderTrackingMap order={order} seller={seller} />
          </div>
        )}

        {/* Live Delivery Captain Card (if assigned or on the way) */}
        {order.driverName && (
          <div className="p-4 rounded-2xl bg-teal-50/70 border border-teal-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold">
                <Truck className="w-6 h-6" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-teal-600 uppercase">کاپتنی گەیاندن</span>
                <h4 className="text-sm font-bold text-slate-900">{order.driverName}</h4>
                <p className="text-xs text-slate-500">مۆبایل: <span className="font-latin">{order.driverPhone}</span></p>
              </div>
            </div>

            <a
              href={`tel:${order.driverPhone}`}
              className="px-4 py-2 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center gap-1.5 transition-colors"
            >
              <Phone className="w-4 h-4" />
              <span>پەیوەندی بە شۆفێر</span>
            </a>
          </div>
        )}

        {/* Rate Delivery & Seller upon arrival */}
        {isDelivered && (
          <div className="p-5 rounded-3xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-white flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 shadow-lg">
            <div className="flex items-center gap-3.5">
              <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center flex-shrink-0">
                <Sparkles className="w-6 h-6 text-amber-200" />
              </div>
              <div>
                <h4 className="text-sm sm:text-base font-black">
                  {order.isReviewedSeller || order.isReviewedDriver ? 'هەڵسەنگاندنت بۆ ئەم داواکارییە تۆمارکراوە ✓' : 'داواکارییەکەت بە سەرکەوتوویی گەیشت! 🎉'}
                </h4>
                <p className="text-xs text-amber-100 mt-0.5">
                  {order.isReviewedSeller || order.isReviewedDriver 
                    ? `فرۆشگا: ${order.sellerRating || 5}★ • کاپتنی گەیاندن: ${order.driverRating || 5}★ - دەتوانیت دەستکاری بکەیتەوە`
                    : 'ڕای خۆت دەربارەی فرۆشیار و کاپتنی گەیاندن تۆمار بکە و +١٥ پۆینت وەربگرە.'}
                </p>
              </div>
            </div>
            <button
              onClick={() => setRatingModal(true)}
              className="px-5 py-2.5 bg-white text-orange-600 hover:bg-orange-50 font-black text-xs rounded-2xl shadow-md cursor-pointer whitespace-nowrap transition-transform hover:scale-105"
            >
              {order.isReviewedSeller || order.isReviewedDriver ? 'بینین و دەستکاریکردنی هەڵسەنگاندن ⭐' : 'هەڵسەنگاندنی فرۆشیار و گەیاندن ⭐'}
            </button>
          </div>
        )}

      </div>

      {/* Order Details & Receipt Breakdown */}
      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
        
        {/* Ordered Items - 7 cols */}
        <div className="md:col-span-7 bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-100 pb-3">
            <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
              <Receipt className="w-4 h-4 text-orange-500" />
              لیستی کاڵا داواکراوەکان
            </h3>
            <span className="text-xs font-bold text-slate-500">{order.sellerName}</span>
          </div>

          <div className="space-y-3">
            {order.items.map((item, idx) => (
              <div key={idx} className="flex items-center justify-between gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                <div className="flex items-center gap-3">
                  <img src={item.productImage} alt="" className="w-12 h-12 rounded-xl object-cover" />
                  <div>
                    <h5 className="text-xs font-bold text-slate-900">{item.productTitle}</h5>
                    {(item.selectedSize || item.selectedColor) && (
                      <span className="text-[10px] text-slate-500 block">
                        {item.selectedSize && `قەبارە: ${item.selectedSize} `}
                        {item.selectedColor && `ڕەنگ: ${item.selectedColor}`}
                      </span>
                    )}
                    <span className="text-[11px] text-slate-500 font-latin">
                      {item.quantity}x {item.price.toLocaleString()} د.ع
                    </span>
                  </div>
                </div>
                <span className="text-xs font-black text-slate-900 font-latin">
                  {item.total.toLocaleString()} د.ع
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Receipt & Delivery Info - 5 cols */}
        <div className="md:col-span-5 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-900">پسوڵەی پارەدان</h3>

            <div className="space-y-2 text-xs text-slate-600">
              <div className="flex justify-between">
                <span>کۆی کاڵاکان:</span>
                <span className="font-bold text-slate-900 font-latin">{order.subtotal.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between">
                <span>کرێی گەیاندن:</span>
                <span className="font-bold text-slate-900 font-latin">{order.deliveryFee.toLocaleString()} د.ع</span>
              </div>
              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>کۆی گشتی:</span>
                <span className="text-orange-600 font-latin text-base">{order.total.toLocaleString()} د.ع</span>
              </div>
            </div>

            <div className="pt-2 border-t border-slate-100 text-xs text-slate-500 space-y-1">
              <p><span className="font-bold text-slate-700">شێوازی پارەدان:</span> {order.paymentMethod.toUpperCase()}</p>
              <p><span className="font-bold text-slate-700">شار:</span> {order.deliveryCity}</p>
              <p><span className="font-bold text-slate-700">ناونیشان:</span> {order.deliveryAddress}</p>
            </div>
          </div>
        </div>

      </div>

      {/* Dual Order Rating Modal (Seller & Courier) */}
      <OrderRatingModal
        order={order}
        isOpen={ratingModal}
        onClose={() => setRatingModal(false)}
      />

    </div>
  );
};
