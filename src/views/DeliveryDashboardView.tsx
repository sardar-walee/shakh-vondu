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
  AlertCircle
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { StatusBadge } from '../components/common/Badge';

interface DeliveryDashboardViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const DeliveryDashboardView: React.FC<DeliveryDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser } = useAuth();
  const { orders, updateOrderStatus, assignDriverToOrder } = useMarketplace();

  // Orders ready for pickup or on the way
  const availableOrders = orders.filter(o => o.status === 'ready' && !o.driverId);
  const myDeliveries = orders.filter(o => o.driverId === (currentUser?.id || 'rebaz-driver') || ['picked_up', 'on_the_way'].includes(o.status));
  const completedDeliveries = orders.filter(o => o.status === 'delivered' && (o.driverId === currentUser?.id || o.driverName === currentUser?.fullName));

  const totalEarnings = completedDeliveries.length * 3000; // 3,000 IQD per delivery

  const handleAcceptDelivery = (orderId: string) => {
    assignDriverToOrder(
      orderId,
      currentUser?.id || 'rebaz-driver',
      currentUser?.fullName || 'ڕێباز گەیاندن',
      currentUser?.phone || '0750 333 4455'
    );
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-teal-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            <Truck className="w-8 h-8" />
          </div>
          <div>
            <h1 className="text-xl sm:text-2xl font-black text-slate-900">
              داشبۆردی کاپتنی گەیاندن (Shakh Delivery)
            </h1>
            <p className="text-xs text-slate-500 mt-1">
              کاپتن: <span className="font-bold text-slate-800">{currentUser?.fullName || 'ڕێباز کاپتن'}</span> • شار: هەولێر
            </p>
          </div>
        </div>

        <div className="bg-teal-50 border border-teal-200 p-4 rounded-2xl text-right">
          <span className="text-xs text-teal-700 font-bold">داواکاری تەواوکراو:</span>
          <h3 className="text-lg font-black text-teal-800 font-latin">{completedDeliveries.length} گەیاندن</h3>
        </div>
      </div>

      {/* Active Delivery in Progress */}
      {myDeliveries.length > 0 && (
        <div className="bg-gradient-to-r from-teal-900 to-slate-900 text-white p-6 sm:p-8 rounded-3xl space-y-6 shadow-xl">
          <div className="flex items-center justify-between border-b border-teal-800 pb-3">
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
              <h3 className="text-sm font-black">داواکارییە چالاکەکانت لە گەیاندندا ({myDeliveries.length})</h3>
            </div>
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
                    <span>مۆبایلی کڕیار: 0750 xxx xxxx</span>
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
            {availableOrders.map(order => (
              <div key={order.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold font-latin">{order.orderNumber}</span>
                  <span className="text-xs font-black text-orange-600 font-latin">{order.total.toLocaleString()} د.ع</span>
                </div>

                <div className="text-xs text-slate-600 space-y-1">
                  <p><span className="font-bold">فرۆشگا:</span> {order.sellerName}</p>
                  <p><span className="font-bold">ناونیشان:</span> {order.deliveryAddress}</p>
                  <div className="flex justify-between pt-1 font-latin">
                    <span><span className="font-bold font-sans">کرێی شۆفێر:</span> {order.deliveryFee.toLocaleString()} د.ع</span>
                    {order.deliveryDistanceKm && (
                      <span className="font-bold text-orange-600">🛵 {order.deliveryDistanceKm} کم</span>
                    )}
                  </div>
                </div>

                <button
                  onClick={() => handleAcceptDelivery(order.id)}
                  className="w-full py-2.5 bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold rounded-xl transition-colors cursor-pointer"
                >
                  وەرگرتنی ئەم گەیاندنە (Accept Delivery)
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
