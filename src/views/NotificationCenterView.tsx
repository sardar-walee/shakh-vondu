import React, { useState, useMemo } from 'react';
import { useNotification } from '../context/NotificationContext';
import { useLanguage } from '../context/LanguageContext';
import { NotificationType, NotificationStatus } from '../types';
import {
  Bell,
  CheckCheck,
  Trash2,
  Filter,
  Search,
  ShoppingCart,
  CreditCard,
  Car,
  Store,
  Sparkles,
  ArrowLeft,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  Info,
  Clock,
  ExternalLink,
  ChevronDown,
  RotateCcw,
  Zap
} from 'lucide-react';

interface NotificationCenterViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const NotificationCenterView: React.FC<NotificationCenterViewProps> = ({ onNavigate }) => {
  const {
    userNotifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearNotifications,
    simulateNotification
  } = useNotification();

  const { dir, t } = useLanguage();
  const isRtl = dir === 'rtl';

  const [activeTab, setActiveTab] = useState<NotificationType | 'all'>('all');
  const [statusFilter, setStatusFilter] = useState<'all' | 'unread' | 'read'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [showSimulator, setShowSimulator] = useState(true);

  // Tab counts
  const tabCounts = useMemo(() => {
    return {
      all: userNotifications.length,
      order: userNotifications.filter(n => n.type === 'order').length,
      payment: userNotifications.filter(n => n.type === 'payment').length,
      car: userNotifications.filter(n => n.type === 'car').length,
      seller: userNotifications.filter(n => n.type === 'seller').length,
      system: userNotifications.filter(n => n.type === 'system' || n.type === 'commission').length
    };
  }, [userNotifications]);

  // Filtered list
  const filteredNotifications = useMemo(() => {
    return userNotifications.filter(n => {
      // Type Tab filter
      if (activeTab !== 'all') {
        if (activeTab === 'system') {
          if (n.type !== 'system' && n.type !== 'commission') return false;
        } else if (n.type !== activeTab) {
          return false;
        }
      }

      // Read status filter
      if (statusFilter === 'unread' && n.isRead) return false;
      if (statusFilter === 'read' && !n.isRead) return false;

      // Search Query
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        const matchTitle = n.title.toLowerCase().includes(query);
        const matchMsg = n.message.toLowerCase().includes(query);
        const matchOrder = n.metadata?.orderNumber?.toLowerCase().includes(query);
        if (!matchTitle && !matchMsg && !matchOrder) return false;
      }

      return true;
    });
  }, [userNotifications, activeTab, statusFilter, searchQuery]);

  const formatTimeAgo = (dateStr: string) => {
    try {
      const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
      if (diff < 60) return 'ئێستا';
      if (diff < 3600) return `پێش ${Math.floor(diff / 60)} خولەک`;
      if (diff < 86400) return `پێش ${Math.floor(diff / 3600)} کاتژمێر`;
      const days = Math.floor(diff / 86400);
      if (days === 1) return 'دوێنێ';
      return `پێش ${days} ڕۆژ`;
    } catch {
      return dateStr;
    }
  };

  const getTypeIcon = (type: NotificationType, status?: NotificationStatus) => {
    switch (type) {
      case 'order':
        return <ShoppingCart className="w-4 h-4 text-[#2563EB]" />;
      case 'payment':
        return <CreditCard className="w-4 h-4 text-emerald-600" />;
      case 'car':
        return <Car className="w-4 h-4 text-[#F97316]" />;
      case 'seller':
        return <Store className="w-4 h-4 text-purple-600" />;
      default:
        if (status === 'success') return <CheckCircle2 className="w-4 h-4 text-emerald-600" />;
        if (status === 'error') return <XCircle className="w-4 h-4 text-rose-600" />;
        if (status === 'warning') return <AlertTriangle className="w-4 h-4 text-amber-500" />;
        return <Info className="w-4 h-4 text-[#2563EB]" />;
    }
  };

  const getStatusBadge = (status?: NotificationStatus, type?: NotificationType) => {
    switch (status) {
      case 'success':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">سەرکەوتوو</span>;
      case 'error':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-rose-50 text-rose-700 border border-rose-200">هەڵوەشێنراوە / شکست</span>;
      case 'warning':
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-amber-50 text-amber-700 border border-amber-200">ئاگاداری / لە ڕێگادایە</span>;
      default:
        return <span className="text-[10px] font-bold px-2 py-0.5 rounded-md bg-blue-50 text-blue-700 border border-blue-200">زانیاری</span>;
    }
  };

  const handleCardClick = (notification: typeof userNotifications[0]) => {
    if (!notification.isRead) {
      markAsRead(notification.id);
    }
    if (notification.linkUrl) {
      const cleanUrl = notification.linkUrl.replace('/', '');
      onNavigate(cleanUrl, notification.metadata?.orderId || notification.metadata?.carAdId);
    }
  };

  return (
    <div className="space-y-6 pb-16">
      {/* Top Header Card */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-slate-200 shadow-xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-orange-100/40 via-blue-50/20 to-transparent rounded-full blur-3xl -z-0 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#F97316] text-xs font-bold">
              <Bell className="w-3.5 h-3.5" />
              <span>ناوەندی ئاگادارییە ڕاستەوخۆکان (Real-Time Notifications)</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
              ئاگاداری و پەیامەکان
            </h1>
            <p className="text-xs sm:text-sm text-slate-600 max-w-2xl leading-relaxed">
              ئاگادارییەکانی گۆڕانی دۆخی داواکاری، سەرکەوتنی پارەدان، هۆشداری بەسەرچوونی ڕیکلامی ئۆتۆمبێل، و داواکارییە نوێیەکانی فرۆشیار بە کاتی ڕاستەقینە لێرە دەبینیت.
            </p>
          </div>

          {/* Header Action Buttons */}
          <div className="flex flex-wrap items-center gap-2 sm:gap-3 flex-shrink-0">
            {unreadCount > 0 && (
              <button
                onClick={markAllAsRead}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-all active:scale-95 cursor-pointer shadow-xs"
              >
                <CheckCheck className="w-4 h-4" />
                <span>هەمووی وەک خوێندراوە ({unreadCount})</span>
              </button>
            )}

            {userNotifications.length > 0 && (
              <button
                onClick={clearNotifications}
                className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-xl bg-slate-100 hover:bg-rose-50 hover:text-rose-600 text-slate-600 text-xs font-bold transition-colors cursor-pointer"
                title="سڕینەوەی هەموو ئاگادارییەکان"
              >
                <Trash2 className="w-4 h-4" />
                <span>سڕینەوەی هەمووی</span>
              </button>
            )}

            <button
              onClick={() => setShowSimulator(!showSimulator)}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#F97316] hover:bg-orange-600 text-white text-xs font-bold shadow-xs transition-all active:scale-95 cursor-pointer"
            >
              <Zap className="w-4 h-4" />
              <span>{showSimulator ? 'شاردنەوەی تاقیکەرەوە' : 'تاقیکردنەوەی خێرای ئاگاداری'}</span>
            </button>
          </div>
        </div>

        {/* Live Simulator Panel */}
        {showSimulator && (
          <div className="mt-6 pt-6 border-t border-slate-100 relative z-10">
            <div className="flex items-center justify-between gap-2 mb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#F97316]" />
                <h3 className="text-xs sm:text-sm font-bold text-slate-900">
                  تاقیکردنەوەی ڕاستەوخۆی ڕووداوەکان (Interactive Live Simulator)
                </h3>
              </div>
              <span className="text-[11px] text-slate-400">
                کلیک بکە بۆ ناردنی ئاگاداری دەستبەجێ بە دەنگ و شاشە
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
              {/* 1. Accepted */}
              <button
                onClick={() => simulateNotification('order_accepted')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-right transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-blue-500 flex-shrink-0" />
                <span className="truncate">📦 پەسەندکرا</span>
              </button>

              {/* 2. Preparing */}
              <button
                onClick={() => simulateNotification('order_preparing')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-right transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="truncate">🍳 ئامادەکردن</span>
              </button>

              {/* 3. Out for delivery */}
              <button
                onClick={() => simulateNotification('order_out_for_delivery')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-blue-50 border border-slate-200/80 hover:border-blue-300 text-right transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-orange-500 flex-shrink-0" />
                <span className="truncate">🛵 لە ڕێگادایە</span>
              </button>

              {/* 4. Delivered */}
              <button
                onClick={() => simulateNotification('order_delivered')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-right transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="truncate">🎉 گەیەندرا</span>
              </button>

              {/* 5. Cancelled */}
              <button
                onClick={() => simulateNotification('order_cancelled')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-300 text-right transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                <span className="truncate">❌ هەڵوەشێنرا</span>
              </button>

              {/* 6. Payment Success */}
              <button
                onClick={() => simulateNotification('payment_success')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-emerald-50 border border-slate-200/80 hover:border-emerald-300 text-right transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-emerald-500 flex-shrink-0" />
                <span className="truncate">💳 پارەدانی سەرکەوتوو</span>
              </button>

              {/* 7. Payment Failed */}
              <button
                onClick={() => simulateNotification('payment_failed')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-300 text-right transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-rose-500 flex-shrink-0" />
                <span className="truncate">⚠️ شکستی پارەدان</span>
              </button>

              {/* 8. Car Expiring */}
              <button
                onClick={() => simulateNotification('car_expiring_soon')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-amber-50 border border-slate-200/80 hover:border-amber-300 text-right transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-amber-500 flex-shrink-0" />
                <span className="truncate">⏳ هۆشداری ئۆتۆمبێل</span>
              </button>

              {/* 9. Car Expired */}
              <button
                onClick={() => simulateNotification('car_expired')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-slate-50 hover:bg-rose-50 border border-slate-200/80 hover:border-rose-300 text-right transition-all text-xs font-semibold text-slate-800 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-rose-600 flex-shrink-0" />
                <span className="truncate">🚫 ڕیکلام بەسەرچوو</span>
              </button>

              {/* 10. Seller New Order */}
              <button
                onClick={() => simulateNotification('seller_new_order')}
                className="flex items-center gap-2 p-2.5 rounded-xl bg-purple-50/80 hover:bg-purple-100 border border-purple-200 text-right transition-all text-xs font-semibold text-purple-900 cursor-pointer"
              >
                <span className="w-2 h-2 rounded-full bg-purple-600 flex-shrink-0" />
                <span className="truncate">🔔 داواکاری فرۆشیار</span>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Filter Tabs & Search Bar */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        {/* Category Tabs */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full scrollbar-none">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'all'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            هەمووی ({tabCounts.all})
          </button>

          <button
            onClick={() => setActiveTab('order')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'order'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            داواکارییەکان ({tabCounts.order})
          </button>

          <button
            onClick={() => setActiveTab('payment')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'payment'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            پارەدان ({tabCounts.payment})
          </button>

          <button
            onClick={() => setActiveTab('car')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'car'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            ڕیکلامی ئۆتۆمبێل ({tabCounts.car})
          </button>

          <button
            onClick={() => setActiveTab('seller')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'seller'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            فرۆشیاران ({tabCounts.seller})
          </button>

          <button
            onClick={() => setActiveTab('system')}
            className={`px-3.5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === 'system'
                ? 'bg-[#2563EB] text-white shadow-xs'
                : 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-50'
            }`}
          >
            سیستەم ({tabCounts.system})
          </button>
        </div>

        {/* Search & Read Status Filter */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <div className="relative flex-1 sm:w-64">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="گەڕان لە پەیامەکان..."
              className="w-full pl-9 pr-3 py-2 rounded-xl bg-white border border-slate-200 text-xs focus:outline-hidden focus:border-[#2563EB] transition-colors"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-2.5" />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value as 'all' | 'unread' | 'read')}
            className="py-2 px-3 rounded-xl bg-white border border-slate-200 text-xs font-bold text-slate-700 focus:outline-hidden focus:border-[#2563EB] cursor-pointer"
          >
            <option value="all">هەموو دۆخەکان</option>
            <option value="unread">تەنها نەخوێندراوە</option>
            <option value="read">خوێندراوەکان</option>
          </select>
        </div>
      </div>

      {/* Notifications List */}
      <div className="space-y-3">
        {filteredNotifications.length === 0 ? (
          <div className="bg-white rounded-3xl p-12 text-center border border-slate-200">
            <div className="w-16 h-16 rounded-full bg-slate-100 text-slate-400 flex items-center justify-center mx-auto mb-4">
              <Bell className="w-8 h-8" />
            </div>
            <h3 className="text-base font-bold text-slate-800 mb-1">هیچ ئاگادارییەک نەدۆزرایەوە</h3>
            <p className="text-xs text-slate-500 max-w-sm mx-auto mb-6">
              لەگەڵ هەر داواکارییەکی نوێ، گۆڕانی دۆخی گەیاندن یان پارەدان، ئاگادارییەکان لێرە بە کاتی ڕاستەقینە نوێ دەبنەوە.
            </p>
            <button
              onClick={() => simulateNotification('order_accepted')}
              className="px-4 py-2 rounded-xl bg-[#2563EB] text-white text-xs font-bold hover:bg-blue-700 transition-colors cursor-pointer"
            >
              ناردنی نموونەیەک ئاگاداری
            </button>
          </div>
        ) : (
          filteredNotifications.map((n) => (
            <div
              key={n.id}
              onClick={() => handleCardClick(n)}
              className={`group bg-white rounded-2xl border transition-all duration-200 p-4 sm:p-5 flex flex-col sm:flex-row items-start justify-between gap-4 cursor-pointer ${
                n.isRead
                  ? 'border-slate-200/80 hover:border-blue-300 hover:shadow-sm'
                  : 'border-blue-200 bg-blue-50/20 hover:border-[#2563EB] shadow-xs'
              }`}
            >
              <div className="flex items-start gap-3.5 flex-1 min-w-0">
                {/* Icon Circle */}
                <div
                  className={`p-2.5 rounded-2xl flex-shrink-0 shadow-2xs ${
                    n.type === 'order'
                      ? 'bg-blue-50 text-[#2563EB]'
                      : n.type === 'payment'
                      ? 'bg-emerald-50 text-emerald-600'
                      : n.type === 'car'
                      ? 'bg-orange-50 text-[#F97316]'
                      : n.type === 'seller'
                      ? 'bg-purple-50 text-purple-600'
                      : 'bg-slate-100 text-slate-600'
                  }`}
                >
                  {getTypeIcon(n.type, n.status)}
                </div>

                {/* Info and text */}
                <div className="space-y-1.5 flex-1 min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <h3 className="text-xs sm:text-sm font-bold text-slate-900 leading-snug group-hover:text-[#2563EB] transition-colors">
                      {n.title}
                    </h3>
                    {!n.isRead && (
                      <span className="w-2 h-2 rounded-full bg-[#2563EB] flex-shrink-0 animate-pulse" />
                    )}
                    {getStatusBadge(n.status, n.type)}
                  </div>

                  <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
                    {n.message}
                  </p>

                  {/* Metadata Chips if available */}
                  <div className="flex flex-wrap items-center gap-3 pt-1 text-[11px] text-slate-400">
                    <span className="flex items-center gap-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      <span>{formatTimeAgo(n.createdAt)}</span>
                    </span>

                    {n.metadata?.orderNumber && (
                      <span className="font-latin font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded-md">
                        #{n.metadata.orderNumber}
                      </span>
                    )}

                    {n.metadata?.amount && (
                      <span className="font-latin font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
                        {n.metadata.amount.toLocaleString()} د.ع
                      </span>
                    )}

                    {n.metadata?.daysLeft !== undefined && (
                      <span className="font-bold text-amber-600 bg-amber-50 px-2 py-0.5 rounded-md">
                        {n.metadata.daysLeft === 0 ? 'بەسەرچوو' : `${n.metadata.daysLeft} ڕۆژ ماوە`}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div
                className="flex items-center justify-end gap-2 w-full sm:w-auto pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100 flex-shrink-0"
                onClick={(e) => e.stopPropagation()}
              >
                {n.linkUrl && (
                  <button
                    onClick={() => handleCardClick(n)}
                    className="inline-flex items-center gap-1 px-3 py-1.5 rounded-xl bg-blue-50 hover:bg-blue-100 text-[#2563EB] text-xs font-bold transition-colors cursor-pointer"
                  >
                    <span>{n.actionLabel || 'بینین'}</span>
                    {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
                  </button>
                )}

                <button
                  onClick={() => markAsRead(n.id)}
                  className={`p-2 rounded-xl text-xs font-bold transition-colors cursor-pointer ${
                    n.isRead
                      ? 'text-slate-400 hover:bg-slate-100'
                      : 'text-[#2563EB] hover:bg-blue-50 bg-white'
                  }`}
                  title={n.isRead ? 'خوێندراوەتەوە' : 'مارککردن وەک خوێندراوە'}
                >
                  <CheckCheck className="w-4 h-4" />
                </button>

                <button
                  onClick={() => deleteNotification(n.id)}
                  className="p-2 rounded-xl text-slate-400 hover:text-rose-600 hover:bg-rose-50 transition-colors cursor-pointer"
                  title="سڕینەوە"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
