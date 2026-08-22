import React, { useState } from 'react';
import {
  Store,
  Truck,
  Package,
  MapPin,
  Phone,
  CheckCircle2,
  Clock,
  Navigation,
  DollarSign,
  UserCheck,
  AlertCircle,
  Bike,
  Car,
  ChevronLeft,
  ChevronRight,
  Sparkles,
  Search,
  Check,
  ArrowRight,
  ShieldCheck,
  Calendar,
  ExternalLink
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { StatusBadge } from '../components/common/Badge';
import { Order, StoreDriver, OrderStatus } from '../types';

interface StoreDeliveryDashboardViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const StoreDeliveryDashboardView: React.FC<StoreDeliveryDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, sellerProfile, isSeller } = useAuth();
  const {
    orders,
    sellers,
    updateOrderStatus,
    assignStoreDriverToOrder
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'pending_dispatch' | 'my_active' | 'completed' | 'drivers'>('my_active');
  const [selectedDriverFilter, setSelectedDriverFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState('');

  // Identify current store
  const currentSeller = sellerProfile || sellers.find(s => s.userId === currentUser?.id || s.id === 'store-rest-1') || sellers[0];
  const storeDrivers: StoreDriver[] = currentSeller?.ownDrivers || [
    {
      id: 'sdrv-1',
      sellerId: currentSeller?.id || 'store-rest-1',
      name: 'هێمن ئەحمەد (شۆفێری ماتۆڕ)',
      phone: '0750 444 8899',
      vehicleType: 'motorcycle',
      plateNumber: 'هەولێر 4321 B',
      isActive: true,
      totalDeliveries: 42,
      rating: 4.9
    },
    {
      id: 'sdrv-2',
      sellerId: currentSeller?.id || 'store-rest-1',
      name: 'سەردار مەحموود (شۆفێری سەیارە)',
      phone: '0770 123 9988',
      vehicleType: 'car',
      plateNumber: 'هەولێر 8877 A',
      isActive: true,
      totalDeliveries: 28,
      rating: 4.8
    }
  ];

  // Store's Orders
  const storeOrders = orders.filter(o => o.sellerId === currentSeller?.id || o.isStoreDelivery);

  // Filter orders according to store in-house delivery
  const pendingDispatchOrders = storeOrders.filter(o => ['accepted', 'preparing', 'ready'].includes(o.status) && !o.storeDriverId && !o.driverId);
  const activeDeliveries = storeOrders.filter(o => ['picked_up', 'on_the_way', 'ready'].includes(o.status) && (o.isStoreDelivery || o.storeDriverId));
  const completedDeliveries = storeOrders.filter(o => o.status === 'delivered' && (o.isStoreDelivery || o.storeDriverId));

  // Financial Stats for Store In-house Delivery
  const totalStoreDeliveryRevenue = completedDeliveries.reduce((sum, o) => sum + (o.deliveryFee || 0), 0);
  const totalCashCollectedToday = completedDeliveries
    .filter(o => o.paymentMethod === 'cash_on_delivery')
    .reduce((sum, o) => sum + o.total, 0);

  const handleUpdateStatus = async (orderId: string, newStatus: OrderStatus) => {
    await updateOrderStatus(orderId, newStatus);
  };

  const handleQuickAssignDriver = async (orderId: string, driver: StoreDriver) => {
    await assignStoreDriverToOrder(
      orderId,
      driver.id,
      driver.name,
      driver.phone,
      driver.vehicleType
    );
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Top Header with Delivery Mode Channel Switcher */}
      <div className="bg-white dark:bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-orange-500/20">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900 dark:text-white">
                دلیڤەری تایبەتی دوکان (Store In-House Delivery)
              </h1>
              <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-extrabold rounded-full flex items-center gap-1 border border-emerald-300 dark:border-emerald-700">
                <Check className="w-3 h-3" />
                ١٠٠٪ داهات بۆ دوکان (٠٪ کۆمسیۆن)
              </span>
            </div>
            <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
              فرۆشگا: <span className="font-bold text-slate-800 dark:text-slate-200">{currentSeller?.storeName || 'چێشتخانە و مارکێت'}</span> • بەڕێوەبردنی شۆفێرە تایبەتەکانی دوکان
            </p>
          </div>
        </div>

        {/* Switcher button to Shakh Delivery */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('delivery-dashboard')}
            className="px-4 py-3 bg-teal-50 dark:bg-teal-950/40 hover:bg-teal-100 text-teal-800 dark:text-teal-300 border border-teal-200 dark:border-teal-800 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer shadow-xs"
          >
            <Truck className="w-4 h-4 text-teal-600" />
            <span>چوون بۆ بەشی کاپتنی شاخ (Shakh Express)</span>
            <ArrowRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>
        </div>
      </div>

      {/* Metric Cards for Store Delivery */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Total Deliveries */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">داواکارییە چالاکەکان</span>
            <Clock className="w-5 h-5 text-amber-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-latin">
              {activeDeliveries.length}
            </h2>
            <p className="text-[11px] text-amber-600 font-medium mt-1">لە دۆخی ئامادەکردن یان لە ڕێگادان</p>
          </div>
        </div>

        {/* Store Delivery Fee Revenue */}
        <div className="bg-gradient-to-br from-emerald-600 to-teal-700 text-white p-5 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="absolute top-0 right-0 transform translate-x-3 -translate-y-3 w-20 h-20 bg-white/10 rounded-full blur-xs"></div>
          <div className="flex items-center justify-between text-emerald-100">
            <span className="text-xs font-bold">قازانجی دلیڤەری دوکان</span>
            <DollarSign className="w-5 h-5 text-emerald-200" />
          </div>
          <div className="mt-3">
            <h2 className="text-2xl sm:text-3xl font-black font-latin">
              {totalStoreDeliveryRevenue.toLocaleString()} <span className="text-xs font-sans font-bold text-emerald-100">د.ع</span>
            </h2>
            <p className="text-[11px] text-emerald-100/90 mt-1">١٠٠٪ پارەی گەیاندن بۆ دوکان دەمێنێتەوە</p>
          </div>
        </div>

        {/* Cash Collected on Delivery */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">کاشی کۆکراوەی ئەمڕۆ</span>
            <CheckCircle2 className="w-5 h-5 text-emerald-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-latin">
              {totalCashCollectedToday.toLocaleString()} <span className="text-xs font-sans text-slate-400">د.ع</span>
            </h2>
            <p className="text-[11px] text-slate-500 mt-1">کاش لەلایەن شۆفێرانی دوکانەوە وەرگیراوە</p>
          </div>
        </div>

        {/* Store Drivers Count */}
        <div className="bg-white dark:bg-slate-900 p-5 rounded-3xl border border-slate-200 dark:border-slate-800 shadow-xs">
          <div className="flex items-center justify-between text-slate-500">
            <span className="text-xs font-bold">شۆفێرە تایبەتەکانی دوکان</span>
            <UserCheck className="w-5 h-5 text-blue-500" />
          </div>
          <div className="mt-3">
            <h2 className="text-2xl sm:text-3xl font-black text-slate-900 dark:text-white font-latin">
              {storeDrivers.length} <span className="text-xs font-sans text-slate-500">شۆفێر</span>
            </h2>
            <p className="text-[11px] text-blue-600 font-medium mt-1">تیمی دلیڤەری ناوخۆیی فرۆشگا</p>
          </div>
        </div>
      </div>

      {/* Tabs Navigation */}
      <div className="flex items-center gap-2 border-b border-slate-200 dark:border-slate-800 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('my_active')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'my_active'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Truck className="w-4 h-4" />
          <span>داواکارییە لە ڕێگاکان ({activeDeliveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('pending_dispatch')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'pending_dispatch'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <Package className="w-4 h-4" />
          <span>پێویستی بە دیاریکردنی شۆفێرە ({pendingDispatchOrders.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('completed')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'completed'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <CheckCircle2 className="w-4 h-4" />
          <span>گەیەندراوەکانی دوکان ({completedDeliveries.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('drivers')}
          className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer whitespace-nowrap ${
            activeTab === 'drivers'
              ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
              : 'bg-white dark:bg-slate-900 text-slate-600 dark:text-slate-400 hover:bg-slate-100 border border-slate-200 dark:border-slate-800'
          }`}
        >
          <UserCheck className="w-4 h-4" />
          <span>لیستی شۆفێرانی دوکان ({storeDrivers.length})</span>
        </button>
      </div>

      {/* TAB 1: ACTIVE IN-HOUSE DELIVERIES */}
      {activeTab === 'my_active' && (
        <div className="space-y-4">
          {activeDeliveries.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800">
              <Truck className="w-12 h-12 text-slate-300 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">هیچ داواکارییەکی لە ڕێگادان نییە</h3>
              <p className="text-xs text-slate-500 mt-1">کاتێک داواکارییەک دەدەیتە دەست شۆفێری دوکان، لێرە بە ڕاستەوخۆ دەردەکەوێت.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {activeDeliveries.map(order => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs flex flex-col justify-between gap-4"
                >
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <span className="font-black text-sm text-slate-900 dark:text-white font-latin">{order.orderNumber}</span>
                        <span className="px-2 py-0.5 bg-orange-100 dark:bg-orange-950/60 text-orange-800 dark:text-orange-300 text-[10px] font-bold rounded-md">
                          دلیڤەری تایبەتی دوکان
                        </span>
                      </div>
                      <StatusBadge status={order.status} />
                    </div>

                    {/* Customer & Location Info */}
                    <div className="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-2xl space-y-2 text-xs">
                      <div className="flex items-center justify-between font-bold text-slate-800 dark:text-slate-200">
                        <span>کڕیار: {order.customerName}</span>
                        <a
                          href={`tel:${order.customerPhone}`}
                          className="flex items-center gap-1 text-orange-600 dark:text-orange-400 hover:underline"
                        >
                          <Phone className="w-3.5 h-3.5" />
                          <span>{order.customerPhone}</span>
                        </a>
                      </div>

                      <div className="flex items-start gap-2 text-slate-600 dark:text-slate-400">
                        <MapPin className="w-4 h-4 text-orange-500 flex-shrink-0 mt-0.5" />
                        <div>
                          <p>{order.deliveryAddress || order.customerAddress}</p>
                          <p className="text-[10px] text-slate-500 font-latin">شار: {order.deliveryCity || order.customerCity}</p>
                        </div>
                      </div>

                      {order.deliveryGeoLocation?.mapUrl && (
                        <a
                          href={order.deliveryGeoLocation.mapUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-[11px] text-blue-600 dark:text-blue-400 font-bold hover:underline pt-1"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>کردنەوەی نەخشەی GPS ی ماڵی کڕیار</span>
                          <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </div>

                    {/* Assigned Driver Info */}
                    <div className="p-3 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900/40 rounded-xl flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-amber-500 text-white flex items-center justify-center font-bold">
                          🛵
                        </div>
                        <div>
                          <p className="font-bold text-slate-800 dark:text-slate-200">
                            شۆفێر: {order.storeDriverName || order.driverName || 'شۆفێری دوکان'}
                          </p>
                          <p className="text-[10px] text-slate-500 font-latin">
                            تەلەفۆن: {order.storeDriverPhone || order.driverPhone || '0750 000 0000'}
                          </p>
                        </div>
                      </div>

                      <a
                        href={`tel:${order.storeDriverPhone || order.driverPhone}`}
                        className="px-2.5 py-1.5 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 text-slate-700 dark:text-slate-300 font-bold rounded-lg hover:bg-slate-100 flex items-center gap-1 text-[11px]"
                      >
                        <Phone className="w-3 h-3 text-emerald-600" />
                        <span>پەیوەندی بە شۆفێر</span>
                      </a>
                    </div>

                    {/* Items Summary */}
                    <div className="text-xs text-slate-600 dark:text-slate-400 border-t border-slate-100 dark:border-slate-800 pt-3">
                      <p className="font-bold text-slate-800 dark:text-slate-200 mb-1">کاڵاکان ({order.items.length}):</p>
                      <ul className="space-y-1">
                        {order.items.map(item => (
                          <li key={item.id} className="flex justify-between">
                            <span>{item.quantity}x {item.productTitle}</span>
                            <span className="font-latin">{item.total.toLocaleString()} د.ع</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Financial & Status Action Buttons */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-4 space-y-3">
                    <div className="flex items-center justify-between text-xs">
                      <span className="text-slate-500">کۆی گشتی داواکاری:</span>
                      <span className="text-base font-black text-slate-900 dark:text-white font-latin">
                        {order.total.toLocaleString()} د.ع
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      {order.status === 'ready' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'picked_up')}
                          className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        >
                          شۆفێر کاڵای وەرگرت
                        </button>
                      )}

                      {order.status === 'picked_up' && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'on_the_way')}
                          className="w-full py-2.5 bg-amber-500 hover:bg-amber-600 text-white rounded-xl font-bold text-xs transition-colors cursor-pointer"
                        >
                          شۆفێر لە ڕێگادایە
                        </button>
                      )}

                      {['picked_up', 'on_the_way'].includes(order.status) && (
                        <button
                          onClick={() => handleUpdateStatus(order.id, 'delivered')}
                          className="w-full col-span-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs transition-colors flex items-center justify-center gap-1.5 cursor-pointer shadow-md shadow-emerald-600/20"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          <span>تەواوبوو (بە سەرکەوتوویی گەیەندرا)</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 2: PENDING DISPATCH ORDERS */}
      {activeTab === 'pending_dispatch' && (
        <div className="space-y-4">
          {pendingDispatchOrders.length === 0 ? (
            <div className="bg-white dark:bg-slate-900 p-12 text-center rounded-3xl border border-slate-200 dark:border-slate-800">
              <CheckCircle2 className="w-12 h-12 text-emerald-400 mx-auto mb-3" />
              <h3 className="font-bold text-slate-800 dark:text-slate-200 text-sm">هیچ داواکارییەکی چاوەڕوان نییە</h3>
              <p className="text-xs text-slate-500 mt-1">هەموو داواکارییەکان دراونەتە دەست شۆفێران یان تەواوکراون.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {pendingDispatchOrders.map(order => (
                <div
                  key={order.id}
                  className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-4"
                >
                  <div className="flex items-center justify-between">
                    <span className="font-black text-sm text-slate-900 dark:text-white font-latin">{order.orderNumber}</span>
                    <StatusBadge status={order.status} />
                  </div>

                  <div className="text-xs space-y-2">
                    <p className="font-bold text-slate-800 dark:text-slate-200">کڕیار: {order.customerName} ({order.customerPhone})</p>
                    <p className="text-slate-600 dark:text-slate-400 flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-orange-500 shrink-0" />
                      <span>{order.deliveryAddress}</span>
                    </p>
                    <p className="text-slate-900 dark:text-white font-bold font-latin">کۆی پارە: {order.total.toLocaleString()} د.ع</p>
                  </div>

                  {/* Assign to store drivers dropdown / chips */}
                  <div className="border-t border-slate-100 dark:border-slate-800 pt-3 space-y-2">
                    <label className="text-xs font-bold text-slate-700 dark:text-slate-300 block">
                      دیاریکردنی شۆفێری تایبەتی دوکان بۆ ئەم داواکارییە:
                    </label>
                    <div className="grid grid-cols-1 gap-2">
                      {storeDrivers.map(drv => (
                        <button
                          key={drv.id}
                          onClick={() => handleQuickAssignDriver(order.id, drv)}
                          className="w-full p-2.5 bg-orange-50 dark:bg-orange-950/40 hover:bg-orange-100 border border-orange-200 dark:border-orange-900/50 rounded-xl text-xs font-bold text-orange-900 dark:text-orange-200 flex items-center justify-between transition-colors cursor-pointer"
                        >
                          <div className="flex items-center gap-2">
                            <span>{drv.vehicleType === 'car' ? '🚗' : '🛵'}</span>
                            <span>{drv.name}</span>
                          </div>
                          <span className="text-[10px] bg-orange-200 dark:bg-orange-800 text-orange-900 dark:text-orange-100 px-2 py-0.5 rounded-md">
                            دانان بۆ گەیاندن
                          </span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* TAB 3: COMPLETED IN-HOUSE DELIVERIES */}
      {activeTab === 'completed' && (
        <div className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-black text-sm text-slate-900 dark:text-white">مێژووی داواکارییە گەیەندراوەکانی دوکان</h3>
            <span className="text-xs text-slate-500 font-bold">{completedDeliveries.length} داواکاری تەواوکراو</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 dark:bg-slate-800/60 text-slate-500 uppercase font-bold">
                <tr>
                  <th className="p-3">ژمارەی داواکاری</th>
                  <th className="p-3">کڕیار</th>
                  <th className="p-3">شۆفێری دوکان</th>
                  <th className="p-3">کرێی گەیاندن (١٠٠٪ بۆ دوکان)</th>
                  <th className="p-3">کۆی پارە</th>
                  <th className="p-3">بەروار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
                {completedDeliveries.map(order => (
                  <tr key={order.id} className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30">
                    <td className="p-3 font-bold font-latin">{order.orderNumber}</td>
                    <td className="p-3">{order.customerName}</td>
                    <td className="p-3 font-bold text-amber-600">{order.storeDriverName || order.driverName || 'شۆفێری دوکان'}</td>
                    <td className="p-3 font-bold text-emerald-600 font-latin">{(order.deliveryFee || 2000).toLocaleString()} د.ع</td>
                    <td className="p-3 font-bold font-latin">{order.total.toLocaleString()} د.ع</td>
                    <td className="p-3 text-slate-400 font-latin">{order.createdAt.split('T')[0]}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 4: STORE DRIVERS LIST */}
      {activeTab === 'drivers' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {storeDrivers.map(drv => (
              <div
                key={drv.id}
                className="bg-white dark:bg-slate-900 rounded-3xl border border-slate-200 dark:border-slate-800 p-6 shadow-xs space-y-3"
              >
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-orange-100 dark:bg-orange-950/60 text-orange-600 flex items-center justify-center font-bold text-xl">
                    {drv.vehicleType === 'car' ? '🚗' : '🛵'}
                  </div>
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                    drv.isActive ? 'bg-emerald-100 text-emerald-800' : 'bg-slate-100 text-slate-600'
                  }`}>
                    {drv.isActive ? 'چالاکە' : 'ناچالاکە'}
                  </span>
                </div>

                <div>
                  <h4 className="font-bold text-sm text-slate-900 dark:text-white">{drv.name}</h4>
                  <p className="text-xs text-slate-500 font-latin mt-0.5 flex items-center gap-1">
                    <Phone className="w-3.5 h-3.5 text-orange-500" />
                    <span>{drv.phone}</span>
                  </p>
                </div>

                <div className="bg-slate-50 dark:bg-slate-800/60 p-3 rounded-xl text-xs space-y-1">
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>جۆری هۆکاری گواستنەوە:</span>
                    <span className="font-bold text-slate-800 dark:text-slate-200">
                      {drv.vehicleType === 'motorcycle' ? 'ماتۆڕسکیل' : drv.vehicleType === 'car' ? 'ئۆتۆمبێل' : 'پاسکیل'}
                    </span>
                  </div>
                  {drv.plateNumber && (
                    <div className="flex justify-between text-slate-600 dark:text-slate-400 font-latin">
                      <span>ژمارەی تابلۆ:</span>
                      <span className="font-bold">{drv.plateNumber}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-slate-600 dark:text-slate-400">
                    <span>کۆی گەیاندنەکان:</span>
                    <span className="font-bold text-emerald-600 font-latin">{drv.totalDeliveries || 0}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

    </div>
  );
};
