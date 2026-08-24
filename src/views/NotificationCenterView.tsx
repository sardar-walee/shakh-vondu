import React, { useState, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { NotificationItem, NotificationType, OrderStatus } from '../types';
import {
  Bell,
  CheckCheck,
  Trash2,
  Search,
  ShoppingCart,
  CreditCard,
  Car,
  Store,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  ExternalLink,
  ChevronRight,
  ChevronLeft,
  MapPin,
  Phone,
  Truck,
  ShieldCheck,
  UserCheck,
  Flame,
  Check,
  X,
  Package,
  Layers,
  Sparkles,
  Award,
  Filter
} from 'lucide-react';

interface NotificationCenterViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({ onNavigate }) => {
  const {
    userNotifications,
    unreadCount,
    actionableCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    markActionDone
  } = useNotification();

  const {
    orders,
    updateOrderStatus,
    assignDriverToOrder,
    assignStoreDriverToOrder
  } = useMarketplace();

  const { currentUser, isSuperAdmin, isSeller, isDeliveryAgent, isStoreDriver, sellerProfile } = useAuth();
  const { dir, t } = useLanguage();
  const isRtl = dir === 'rtl';

  // 3 Clear Tabs
  const [activeTab, setActiveTab] = useState<'requests' | 'updates' | 'history'>('requests');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotificationId, setSelectedNotificationId] = useState<string | null>(null);
  const [isProcessingAction, setIsProcessingAction] = useState<string | null>(null);

  // Tab categorization
  const categorized = useMemo(() => {
    const requests: NotificationItem[] = [];
    const updates: NotificationItem[] = [];
    const history: NotificationItem[] = [];

    userNotifications.forEach(n => {
      if (n.actionRequired) {
        requests.push(n);
      } else if (n.category === 'request' || n.type === 'order' || n.type === 'delivery') {
        if (n.status === 'success' || n.metadata?.orderId && orders.find(o => o.id === n.metadata?.orderId)?.status === 'delivered') {
          history.push(n);
        } else {
          updates.push(n);
        }
      } else {
        history.push(n);
      }
    });

    return { requests, updates, history };
  }, [userNotifications, orders]);

  // Current tab items filtered by search
  const currentTabItems = useMemo(() => {
    const list = activeTab === 'requests'
      ? categorized.requests
      : activeTab === 'updates'
      ? categorized.updates
      : categorized.history;

    if (!searchQuery.trim()) return list;

    const q = searchQuery.toLowerCase();
    return list.filter(n => {
      return (
        n.title.toLowerCase().includes(q) ||
        n.message.toLowerCase().includes(q) ||
        n.metadata?.orderNumber?.toLowerCase().includes(q) ||
        n.metadata?.customerName?.toLowerCase().includes(q) ||
        n.metadata?.storeName?.toLowerCase().includes(q)
      );
    });
  }, [activeTab, categorized, searchQuery]);

  // Selected Notification
  const selectedItem = useMemo(() => {
    if (!selectedNotificationId && currentTabItems.length > 0) {
      return currentTabItems[0];
    }
    return userNotifications.find(n => n.id === selectedNotificationId) || currentTabItems[0] || null;
  }, [selectedNotificationId, userNotifications, currentTabItems]);

  // Associated Order if any
  const associatedOrder = useMemo(() => {
    if (!selectedItem?.orderId && !selectedItem?.metadata?.orderId) return null;
    const oId = selectedItem?.orderId || selectedItem?.metadata?.orderId;
    return orders.find(o => o.id === oId) || null;
  }, [selectedItem, orders]);

  // Time format helper
  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return t('ئێستا') || 'ئێستا';
      if (diff < 3600) return `${Math.floor(diff / 60)} ${t('خولەک پێش ئێستا') || 'خولەک پێش ئێستا'}`;
      if (diff < 86400) return `${Math.floor(diff / 3600)} ${t('کاتژمێر پێش ئێستا') || 'کاتژمێر پێش ئێستا'}`;
      const days = Math.floor(diff / 86400);
      if (days === 1) return t('دوێنێ') || 'دوێنێ';
      return `${days} ${t('ڕۆژ پێش ئێستا') || 'ڕۆژ پێش ئێستا'}`;
    } catch {
      return dateStr;
    }
  };

  // Icon Helper
  const getIcon = (type: NotificationType, actionRequired?: boolean) => {
    if (actionRequired) {
      return <Flame className="w-5 h-5 text-orange-500 animate-pulse" />;
    }
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-[#2563EB]" />;
      case 'delivery':
        return <Truck className="w-5 h-5 text-teal-600" />;
      case 'seller':
        return <Store className="w-5 h-5 text-purple-600" />;
      case 'car':
        return <Car className="w-5 h-5 text-amber-600" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'points':
        return <Award className="w-5 h-5 text-amber-500" />;
      default:
        return <Info className="w-5 h-5 text-[#2563EB]" />;
    }
  };

  // Actions Handlers
  const handleStoreAcceptOrder = async (orderId: string, notifId: string) => {
    setIsProcessingAction(orderId);
    try {
      await updateOrderStatus(orderId, 'accepted', 'پەسەندکرا لەلایەن فرۆشگا');
      await markActionDone(notifId);
    } finally {
      setIsProcessingAction(null);
    }
  };

  const handleStorePrepareOrder = async (orderId: string, notifId: string) => {
    setIsProcessingAction(orderId);
    try {
      await updateOrderStatus(orderId, 'preparing', 'لە ئامادەکردندایە');
      await markActionDone(notifId);
    } finally {
      setIsProcessingAction(null);
    }
  };

  const handleStoreMarkReady = async (orderId: string, notifId: string) => {
    setIsProcessingAction(orderId);
    try {
      await updateOrderStatus(orderId, 'ready', 'ئامادەیە بۆ گەیاندن');
      await markActionDone(notifId);
    } finally {
      setIsProcessingAction(null);
    }
  };

  const handleStoreRejectOrder = async (orderId: string, notifId: string) => {
    setIsProcessingAction(orderId);
    try {
      await updateOrderStatus(orderId, 'cancelled', 'فرۆشگا لە توانایدا نییە داواکارییەکە جێبەجێ بکات');
      await markActionDone(notifId);
    } finally {
      setIsProcessingAction(null);
    }
  };

  const handleCaptainAcceptDelivery = async (orderId: string, notifId: string) => {
    if (!currentUser) return;
    setIsProcessingAction(orderId);
    try {
      await assignDriverToOrder(
        orderId,
        currentUser.id,
        currentUser.fullName || 'کاپتنی شاخ',
        currentUser.phone || '07501234567'
      );
      await markActionDone(notifId);
    } finally {
      setIsProcessingAction(null);
    }
  };

  const handleCaptainMarkPickedUp = async (orderId: string, notifId: string) => {
    setIsProcessingAction(orderId);
    try {
      await updateOrderStatus(orderId, 'picked_up', 'لە فرۆشگا وەرگیرا');
      await markActionDone(notifId);
    } finally {
      setIsProcessingAction(null);
    }
  };

  const handleCaptainMarkDelivered = async (orderId: string, notifId: string) => {
    setIsProcessingAction(orderId);
    try {
      await updateOrderStatus(orderId, 'delivered', 'بە سەرکەوتوویی گەیەندرا');
      await markActionDone(notifId);
    } finally {
      setIsProcessingAction(null);
    }
  };

  // Get current user role display badge
  const getRoleLabel = () => {
    if (isSuperAdmin) return { title: 'بەڕێوەبەری گشتی (Super Admin)', bg: 'bg-rose-50 text-rose-700 border-rose-200' };
    if (isDeliveryAgent) return { title: 'کاپتنی فەرمی شاخ (Shakh Courier)', bg: 'bg-teal-50 text-teal-700 border-teal-200' };
    if (isStoreDriver) return { title: 'شۆفێری تایبەتی فرۆشگا (Store Driver)', bg: 'bg-amber-50 text-amber-700 border-amber-200' };
    if (isSeller) return { title: `خاوەن کار / فرۆشگا (${sellerProfile?.storeName || 'Merchant'})`, bg: 'bg-purple-50 text-purple-700 border-purple-200' };
    return { title: 'کڕیار (Customer)', bg: 'bg-blue-50 text-[#2563EB] border-blue-200' };
  };

  const roleInfo = getRoleLabel();

  return (
    <div className="space-y-6 pb-16">
      
      {/* Modern Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2 flex-wrap">
              <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${roleInfo.bg}`}>
                <ShieldCheck className="w-3.5 h-3.5" />
                <span>{roleInfo.title}</span>
              </span>

              {actionableCount > 0 && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-orange-500 text-white text-xs font-bold shadow-xs animate-bounce">
                  <Flame className="w-3 h-3" />
                  <span>{actionableCount} {t('داواکاری کارپێکراو')}</span>
                </span>
              )}
            </div>

            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              {t('ناوەندی بەڕێوەبردنی داواکاری و ئاگادارییەکان')}
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              {t('داواکارییە نوێیەکان، شوێنپێهەڵگرتنی دۆخی گەیاندن، و ئاگادارییە گرنگەکان بە کاتی ڕاستەقینە لێرە دەبینیت.')}
            </p>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-2.5 flex-wrap flex-shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-2xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <CheckCheck className="w-4 h-4" />
                <span>{t('هەمووی وەک خوێندراوە')} ({unreadCount})</span>
              </button>
            )}

            {userNotifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                title={t('سڕینەوەی هەمووی')}
              >
                <Trash2 className="w-4 h-4" />
                <span>{t('سڕینەوە')}</span>
              </button>
            )}
          </div>
        </div>

        {/* Search & Tabs Row */}
        <div className="mt-6 pt-6 border-t border-slate-100 flex flex-col md:flex-row md:items-center justify-between gap-4">
          
          {/* 3 Main Tabs */}
          <div className="flex items-center gap-2 p-1.5 bg-slate-100/80 rounded-2xl border border-slate-200/80 max-w-fit">
            
            {/* Tab 1: Requests */}
            <button
              onClick={() => { setActiveTab('requests'); setSelectedNotificationId(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'requests'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Flame className={`w-4 h-4 ${categorized.requests.length > 0 ? 'text-orange-500' : 'text-slate-400'}`} />
              <span>{t('داواکارییە کارپێکراوەکان')}</span>
              {categorized.requests.length > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-[#F97316] text-white text-[10px] font-bold">
                  {categorized.requests.length}
                </span>
              )}
            </button>

            {/* Tab 2: Updates */}
            <button
              onClick={() => { setActiveTab('updates'); setSelectedNotificationId(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'updates'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Clock className="w-4 h-4 text-[#2563EB]" />
              <span>{t('دۆخی داواکارییەکان')}</span>
              {categorized.updates.length > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-blue-100 text-[#2563EB] text-[10px] font-bold">
                  {categorized.updates.length}
                </span>
              )}
            </button>

            {/* Tab 3: History */}
            <button
              onClick={() => { setActiveTab('history'); setSelectedNotificationId(null); }}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-white text-slate-900 shadow-xs'
                  : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4 text-slate-400" />
              <span>{t('مێژووی داواکارییەکان')}</span>
              {categorized.history.length > 0 && (
                <span className="px-2 py-0.2 rounded-full bg-slate-200 text-slate-700 text-[10px] font-bold">
                  {categorized.history.length}
                </span>
              )}
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full md:w-72">
            <Search className="w-4 h-4 text-slate-400 absolute right-3.5 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder={t('گەڕان بەپێی ژمارەی داواکاری یان ناو...')}
              className="w-full pr-10 pl-4 py-2 rounded-2xl bg-slate-50 border border-slate-200 text-xs font-medium text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#2563EB]/20 focus:border-[#2563EB] transition-all"
            />
          </div>
        </div>
      </div>

      {/* Main Content Layout: Split Master-Detail on Large screens */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left List (Cards) */}
        <div className={`space-y-3 ${selectedItem ? 'lg:col-span-6' : 'lg:col-span-12'}`}>
          {currentTabItems.length === 0 ? (
            <div className="bg-white rounded-3xl p-12 border border-slate-200 text-center space-y-3">
              <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center mx-auto">
                <Bell className="w-8 h-8 opacity-40" />
              </div>
              <h3 className="text-base font-bold text-slate-800">
                {activeTab === 'requests' ? t('هیچ داواکارییەکی کارپێکراو لەم کاتەدا نییە') : t('هیچ ئاگادارییەک نەدۆزرایەوە')}
              </h3>
              <p className="text-xs text-slate-500 max-w-sm mx-auto">
                {activeTab === 'requests'
                  ? t('هەموو داواکارییەکان جێبەجێکراون و هیچ کارێکی چاوەڕوانکراوت نییە.')
                  : t('ئاگاداری و دۆخی نوێ لێرە بە شێوەی ڕاستەوخۆ دەردەکەوێت.')}
              </p>
            </div>
          ) : (
            currentTabItems.map(item => {
              const isSelected = selectedItem?.id === item.id;
              const ord = orders.find(o => o.id === (item.orderId || item.metadata?.orderId));

              return (
                <div
                  key={item.id}
                  onClick={() => {
                    setSelectedNotificationId(item.id);
                    if (!item.isRead) markAsRead(item.id);
                  }}
                  className={`p-4 sm:p-5 rounded-3xl border transition-all cursor-pointer relative overflow-hidden ${
                    isSelected
                      ? 'bg-blue-50/40 border-[#2563EB] shadow-md ring-2 ring-[#2563EB]/10'
                      : item.actionRequired
                      ? 'bg-orange-50/30 border-orange-200 hover:border-orange-300 shadow-xs'
                      : !item.isRead
                      ? 'bg-slate-50/80 border-slate-200 hover:border-slate-300'
                      : 'bg-white border-slate-200 hover:border-slate-300'
                  }`}
                >
                  {/* Actionable Ribbon */}
                  {item.actionRequired && (
                    <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-orange-500 to-amber-500" />
                  )}

                  <div className="flex items-start justify-between gap-3">
                    <div className="flex items-start gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center flex-shrink-0 ${
                        item.actionRequired ? 'bg-orange-100 text-orange-600' : 'bg-slate-100 text-slate-700'
                      }`}>
                        {getIcon(item.type, item.actionRequired)}
                      </div>

                      <div className="space-y-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          {item.metadata?.orderNumber && (
                            <span className="px-2 py-0.5 rounded-lg bg-blue-100 text-[#2563EB] text-[11px] font-black font-latin">
                              #{item.metadata.orderNumber}
                            </span>
                          )}

                          <span className="text-xs font-bold text-slate-900 line-clamp-1">
                            {item.title}
                          </span>

                          {!item.isRead && (
                            <span className="w-2 h-2 rounded-full bg-[#2563EB] flex-shrink-0" />
                          )}
                        </div>

                        <p className="text-xs text-slate-600 line-clamp-2 leading-relaxed">
                          {item.message}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-end gap-2 flex-shrink-0">
                      <span className="text-[10px] text-slate-400 font-latin whitespace-nowrap">
                        {formatTimeAgo(item.createdAt)}
                      </span>

                      {item.actionRequired && (
                        <span className="px-2 py-0.5 rounded-md bg-orange-100 text-orange-700 text-[10px] font-bold">
                          {t('پێویستی بە وەڵامە')}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Metadata Bar */}
                  {item.metadata && (
                    <div className="mt-3 pt-3 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-500">
                      <div className="flex items-center gap-3 flex-wrap">
                        {item.metadata.customerName && (
                          <span className="font-semibold text-slate-700">
                            👤 {item.metadata.customerName}
                          </span>
                        )}
                        {item.metadata.storeName && (
                          <span className="font-semibold text-slate-700">
                            🏪 {item.metadata.storeName}
                          </span>
                        )}
                        {item.metadata.amount && (
                          <span className="font-bold text-emerald-600 font-latin">
                            💰 {item.metadata.amount.toLocaleString()} د.ع
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-1 text-[#2563EB] font-bold text-[11px]">
                        <span>{t('وردەکاری')}</span>
                        {isRtl ? <ChevronLeft className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                      </div>
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Right Details & Action Panel (Interactive) */}
        {selectedItem && (
          <div className="lg:col-span-6 space-y-4 sticky top-24">
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-slate-200 shadow-sm space-y-6">
              
              {/* Header of Detail Panel */}
              <div className="flex items-start justify-between gap-4 pb-5 border-b border-slate-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    {selectedItem.metadata?.orderNumber && (
                      <span className="px-2.5 py-1 rounded-xl bg-blue-100 text-[#2563EB] text-xs font-black font-latin">
                        #{selectedItem.metadata.orderNumber}
                      </span>
                    )}
                    <span className="text-xs text-slate-400 font-latin">
                      {new Date(selectedItem.createdAt).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}
                    </span>
                  </div>

                  <h2 className="text-lg sm:text-xl font-black text-slate-900">
                    {selectedItem.title}
                  </h2>
                </div>

                <button
                  onClick={() => deleteNotification(selectedItem.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title={t('سڕینەوەی ئەم ئاگادارییە')}
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>

              {/* Message */}
              <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-xs sm:text-sm text-slate-700 leading-relaxed">
                {selectedItem.message}
              </div>

              {/* Order Information if associated */}
              {associatedOrder && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-bold text-slate-900 flex items-center gap-1.5">
                      <Package className="w-4 h-4 text-[#2563EB]" />
                      <span>{t('وردەکاری داواکاری')}</span>
                    </h3>
                    <button
                      onClick={() => onNavigate('order-tracking', associatedOrder.id)}
                      className="text-xs font-bold text-[#2563EB] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <span>{t('پەڕەی شوێنپێهەڵگرتن')}</span>
                      <ExternalLink className="w-3 h-3" />
                    </button>
                  </div>

                  {/* Summary Cards */}
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block mb-1">{t('کڕیار')}</span>
                      <p className="font-bold text-slate-800">{associatedOrder.customerName}</p>
                      <p className="text-[11px] text-slate-500 font-latin">{associatedOrder.customerPhone}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block mb-1">{t('فرۆشگا')}</span>
                      <p className="font-bold text-slate-800">{associatedOrder.sellerName}</p>
                      <p className="text-[11px] text-slate-500">{associatedOrder.sellerAddress || associatedOrder.deliveryCity}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block mb-1">{t('ناونیشانی گەیاندن')}</span>
                      <p className="font-bold text-slate-800">{associatedOrder.deliveryAddress}</p>
                      <p className="text-[11px] text-slate-500">{associatedOrder.deliveryCity}</p>
                    </div>

                    <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                      <span className="text-[10px] text-slate-400 block mb-1">{t('کۆی گشتی')}</span>
                      <p className="font-black text-emerald-600 text-sm font-latin">{associatedOrder.total.toLocaleString()} د.ع</p>
                      <p className="text-[10px] text-slate-400">{associatedOrder.paymentMethod === 'cash_on_delivery' ? t('پارەدان کاتی وەرگرتن') : t('پارەدانی ئەلیکترۆنی')}</p>
                    </div>
                  </div>

                  {/* Items List */}
                  <div className="space-y-1.5">
                    <span className="text-[11px] font-bold text-slate-500 block">{t('کاڵاکان')} ({associatedOrder.items.length}):</span>
                    <div className="max-h-36 overflow-y-auto space-y-1 pr-1">
                      {associatedOrder.items.map((it, idx) => (
                        <div key={idx} className="flex items-center justify-between p-2 rounded-xl bg-slate-50 text-xs">
                          <span className="font-medium text-slate-800">{it.productTitle} × {it.quantity}</span>
                          <span className="font-bold text-slate-700 font-latin">{(it.price * it.quantity).toLocaleString()} د.ع</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* ACTION BUTTONS: Real-Time Flow Controls */}
              {selectedItem.actionRequired && associatedOrder && (
                <div className="pt-4 border-t border-slate-100 space-y-3">
                  <span className="text-xs font-bold text-slate-900 block">
                    ⚡ {t('کرداری خێرا بۆ ئەم داواکارییە:')}
                  </span>

                  {/* 1. Store Owner Flow */}
                  {(isSeller || isSuperAdmin) && associatedOrder.status === 'pending' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStoreAcceptOrder(associatedOrder.id, selectedItem.id)}
                        disabled={Boolean(isProcessingAction)}
                        className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Check className="w-4 h-4" />
                        <span>{t('پەسەندکردنی داواکاری')}</span>
                      </button>

                      <button
                        onClick={() => handleStoreRejectOrder(associatedOrder.id, selectedItem.id)}
                        disabled={Boolean(isProcessingAction)}
                        className="py-3 px-4 rounded-2xl bg-rose-50 hover:bg-rose-100 text-rose-700 text-xs font-bold flex items-center justify-center gap-1.5 transition-all active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <X className="w-4 h-4" />
                        <span>{t('ڕەتکردنەوە')}</span>
                      </button>
                    </div>
                  )}

                  {(isSeller || isSuperAdmin) && associatedOrder.status === 'accepted' && (
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        onClick={() => handleStorePrepareOrder(associatedOrder.id, selectedItem.id)}
                        disabled={Boolean(isProcessingAction)}
                        className="py-3 px-4 rounded-2xl bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Package className="w-4 h-4" />
                        <span>{t('دەستپێکردنی ئامادەکردن')}</span>
                      </button>

                      <button
                        onClick={() => handleStoreMarkReady(associatedOrder.id, selectedItem.id)}
                        disabled={Boolean(isProcessingAction)}
                        className="py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <Truck className="w-4 h-4" />
                        <span>{t('ئامادەیە بۆ گەیاندن')}</span>
                      </button>
                    </div>
                  )}

                  {/* 2. Shakh Captain Flow */}
                  {(isDeliveryAgent || isSuperAdmin) && !associatedOrder.driverId && (associatedOrder.status === 'ready' || associatedOrder.status === 'accepted') && (
                    <button
                      onClick={() => handleCaptainAcceptDelivery(associatedOrder.id, selectedItem.id)}
                      disabled={Boolean(isProcessingAction)}
                      className="w-full py-3.5 px-4 rounded-2xl bg-[#F97316] hover:bg-orange-600 text-white text-xs font-black flex items-center justify-center gap-2 transition-all shadow-md active:scale-95 cursor-pointer disabled:opacity-50"
                    >
                      <Truck className="w-4 h-4" />
                      <span>{t('وەرگرتنی ئەم گەیاندنە (Accept Delivery)')}</span>
                    </button>
                  )}

                  {/* 3. Captain Pickup / Deliver Progression */}
                  {(isDeliveryAgent || isStoreDriver || isSuperAdmin) && associatedOrder.driverId && associatedOrder.status !== 'delivered' && (
                    <div className="grid grid-cols-2 gap-2">
                      {associatedOrder.status !== 'picked_up' && associatedOrder.status !== 'on_the_way' && (
                        <button
                          onClick={() => handleCaptainMarkPickedUp(associatedOrder.id, selectedItem.id)}
                          disabled={Boolean(isProcessingAction)}
                          className="py-3 px-4 rounded-2xl bg-teal-600 hover:bg-teal-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                        >
                          <Package className="w-4 h-4" />
                          <span>{t('وەرگیرا لە فرۆشگا')}</span>
                        </button>
                      )}

                      <button
                        onClick={() => handleCaptainMarkDelivered(associatedOrder.id, selectedItem.id)}
                        disabled={Boolean(isProcessingAction)}
                        className="py-3 px-4 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-xs active:scale-95 cursor-pointer disabled:opacity-50"
                      >
                        <CheckCircle2 className="w-4 h-4" />
                        <span>{t('گەیەندرا بە سەرکەوتوویی')}</span>
                      </button>
                    </div>
                  )}
                </div>
              )}

              {/* Navigation Action */}
              {selectedItem.linkUrl && (
                <div className="pt-4 border-t border-slate-100">
                  <button
                    onClick={() => {
                      const cleanUrl = selectedItem.linkUrl?.replace('/', '') || 'orders';
                      onNavigate(cleanUrl, selectedItem.metadata?.orderId || selectedItem.metadata?.carAdId);
                    }}
                    className="w-full py-3 rounded-2xl bg-slate-100 hover:bg-blue-50 hover:text-[#2563EB] text-slate-700 text-xs font-bold transition-all flex items-center justify-center gap-2 cursor-pointer shadow-xs"
                  >
                    <span>{selectedItem.actionLabel || t('بینینی پەڕەی پەیوەندیدار')}</span>
                    {isRtl ? <ArrowLeft className="w-4 h-4" /> : <ArrowRight className="w-4 h-4" />}
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
