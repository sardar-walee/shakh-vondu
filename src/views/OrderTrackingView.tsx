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
import { OrderStatusStepper } from '../components/delivery/OrderStatusStepper';

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
      
      {/* Real-time Order Status Stepper */}
      <OrderStatusStepper
        order={order}
        onAdvanceStatus={handleAdvanceStatus}
        showDemoControls={true}
      />

      {/* Real-time Interactive Geolocation Map & Delivery Captain Info */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-sm space-y-6">
        {!isCancelled && (
          <div>
            <h3 className="text-xs font-bold text-slate-400 mb-3 flex items-center gap-1.5">
              <MapPin className="w-4 h-4 text-teal-600" />
              <span>نەخشەی ڕاستەوخۆ و شوێنپێهەڵگرتنی کاپتن (Live GPS Order Map):</span>
            </h3>
            <LiveOrderTrackingMap order={order} seller={seller} />
          </div>
        )}

        {/* Live Delivery Captain Card (if assigned or on the way) */}
        {order.driverName && (
          <div className="p-4 rounded-3xl bg-teal-50/80 dark:bg-teal-950/40 border border-teal-200 dark:border-teal-800 space-y-3 shadow-xs">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                {order.driverPhotoUrl ? (
                  <img
                    src={order.driverPhotoUrl}
                    alt={order.driverName}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-teal-500 shadow-xs"
                  />
                ) : (
                  <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold shadow-xs">
                    <Truck className="w-7 h-7" />
                  </div>
                )}
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-black text-teal-700 dark:text-teal-300 bg-teal-100 dark:bg-teal-900/60 px-2 py-0.5 rounded-md uppercase">
                      کاپتنی گەیاندن
                    </span>
                    {(order.driverDistanceKm || order.deliveryDistanceKm) && (
                      <span className="text-[10px] font-bold text-orange-600 bg-orange-100 dark:bg-orange-950/60 px-2 py-0.5 rounded-md font-latin">
                        📍 دووری: {order.driverDistanceKm || order.deliveryDistanceKm || 1.8} ک.م
                      </span>
                    )}
                  </div>
                  <h4 className="text-sm sm:text-base font-black text-slate-900 dark:text-white mt-1">{order.driverName}</h4>
                  <p className="text-xs text-slate-500 dark:text-slate-400 font-latin">مۆبایل: <span className="font-bold">{order.driverPhone}</span></p>
                </div>
              </div>

              <a
                href={`tel:${order.driverPhone}`}
                className="w-full sm:w-auto px-4 py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl shadow-xs flex items-center justify-center gap-2 transition-colors cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>پەیوەندی تەلەفۆنی بە کاپتن</span>
              </a>
            </div>

            {/* Vehicle & Plate Info */}
            <div className="p-3 bg-white dark:bg-slate-900 rounded-2xl border border-teal-200/70 dark:border-teal-800/60 flex flex-wrap items-center justify-between gap-3 text-xs">
              <div className="flex items-center gap-3">
                {order.driverVehiclePhotoUrl ? (
                  <img
                    src={order.driverVehiclePhotoUrl}
                    alt="Vehicle"
                    className="w-14 h-10 rounded-xl object-cover border border-slate-200 dark:border-slate-700"
                  />
                ) : (
                  <div className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 flex items-center justify-center text-lg font-bold">
                    🚗
                  </div>
                )}
                <div>
                  <span className="text-[10px] text-slate-400 block">زانیاری ئۆتۆمبێل / ماتۆڕسکیل:</span>
                  <span className="font-extrabold text-slate-800 dark:text-slate-200">
                    {order.driverVehicleModel || order.driverVehicleType || 'ئۆتۆمبێلی گەیاندن'}
                  </span>
                </div>
              </div>

              {order.driverPlateNumber && (
                <div className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 font-latin font-bold text-slate-800 dark:text-slate-200 text-xs">
                  <span className="text-[10px] text-slate-400 block">ژمارەی تابلۆ:</span>
                  <span>{order.driverPlateNumber}</span>
                </div>
              )}
            </div>
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
              <div className="flex justify-between">
                <span>کرێی سەکۆ و پلاتفۆرم:</span>
                <span className="font-bold text-slate-900 font-latin">{(order.platformFee ?? 250).toLocaleString()} د.ع</span>
              </div>

              {Boolean(order.pointsDiscount && order.pointsDiscount > 0) && (
                <div className="flex justify-between text-amber-700 dark:text-amber-400 font-bold bg-amber-50 dark:bg-amber-950/40 p-1.5 rounded-lg border border-amber-200 dark:border-amber-800">
                  <span>داشکاندنی پۆینتی شاخ ({order.pointsUsed || 0} Pts):</span>
                  <span className="font-latin">-{order.pointsDiscount?.toLocaleString()} د.ع</span>
                </div>
              )}

              <div className="flex justify-between text-sm font-black text-slate-900 pt-2 border-t border-slate-200">
                <span>کۆی گشتی:</span>
                <span className="text-orange-600 font-latin text-base">{order.total.toLocaleString()} د.ع</span>
              </div>

              {Boolean(order.pointsEarned && order.pointsEarned > 0) && (
                <div className="mt-2 text-[11px] font-bold text-amber-800 dark:text-amber-300 bg-amber-500/10 p-2 rounded-xl border border-amber-500/20 flex items-center justify-between">
                  <span>🪙 پۆینتی بەدەستهاتووی لەم داواکارییە:</span>
                  <span className="font-black font-latin text-xs">+{order.pointsEarned} Pts</span>
                </div>
              )}
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
