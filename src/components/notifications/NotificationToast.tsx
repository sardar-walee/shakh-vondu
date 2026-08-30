import React from 'react';
import { useNotification } from '../../context/NotificationContext';
import {
  Bell,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Info,
  X,
  ArrowLeft,
  ArrowRight,
  Clock,
  Car,
  ShoppingCart,
  CreditCard,
  Store
} from 'lucide-react';
import { useLanguage } from '../../context/LanguageContext';

interface NotificationToastProps {
  onNavigate: (view: string, param?: string) => void;
}

export const NotificationToast: React.FC<NotificationToastProps> = ({ onNavigate }) => {
  const { activeToast, dismissToast, markAsRead } = useNotification();
  const { dir } = useLanguage();

  if (!activeToast) return null;

  const isRtl = dir === 'rtl';

  const getIcon = () => {
    switch (activeToast.type) {
      case 'order':
        return <ShoppingCart className="w-5 h-5 text-blue-600" />;
      case 'payment':
        return <CreditCard className="w-5 h-5 text-emerald-600" />;
      case 'car':
        return <Car className="w-5 h-5 text-amber-600" />;
      case 'seller':
        return <Store className="w-5 h-5 text-purple-600" />;
      default:
        if (activeToast.status === 'success') return <CheckCircle className="w-5 h-5 text-emerald-600" />;
        if (activeToast.status === 'error') return <XCircle className="w-5 h-5 text-rose-600" />;
        if (activeToast.status === 'warning') return <AlertTriangle className="w-5 h-5 text-amber-600" />;
        return <Info className="w-5 h-5 text-blue-600" />;
    }
  };

  const getBorderColor = () => {
    switch (activeToast.status) {
      case 'success':
        return 'border-emerald-200 bg-emerald-50/95';
      case 'error':
        return 'border-rose-200 bg-rose-50/95';
      case 'warning':
        return 'border-amber-200 bg-amber-50/95';
      default:
        return 'border-blue-200 bg-white/95';
    }
  };

  const handleAction = () => {
    markAsRead(activeToast.id);
    dismissToast();
    if (activeToast.metadata?.productId) {
      onNavigate('product-detail', activeToast.metadata.productId);
      return;
    }
    if (activeToast.metadata?.carAdId) {
      onNavigate('car-detail', activeToast.metadata.carAdId);
      return;
    }
    if (activeToast.metadata?.orderId) {
      onNavigate('order-tracking', activeToast.metadata.orderId);
      return;
    }
    if (activeToast.linkUrl) {
      let cleanUrl = activeToast.linkUrl.replace('/', '');
      if (cleanUrl === 'product' || cleanUrl === 'product-detail' || cleanUrl === 'products') {
        onNavigate('product-detail', activeToast.metadata?.productId);
        return;
      }
      onNavigate(cleanUrl, activeToast.metadata?.orderId || activeToast.metadata?.carAdId);
    }
  };

  return (
    <div
      className={`fixed top-5 z-50 transition-all duration-300 transform translate-y-0 max-w-md w-[calc(100%-2rem)] sm:w-96 shadow-2xl rounded-2xl border backdrop-blur-md p-4 animate-in fade-in slide-in-from-top-4 ${getBorderColor()} ${
        isRtl ? 'left-4 sm:left-6' : 'right-4 sm:right-6'
      }`}
    >
      <div className="flex items-start gap-3">
        <div className="p-2 rounded-xl bg-white shadow-xs flex-shrink-0">
          {getIcon()}
        </div>

        <div className="flex-1 min-w-0 text-start">
          <div className="flex items-center justify-between gap-1 mb-0.5">
            <h4 className="text-xs sm:text-sm font-bold text-slate-900 line-clamp-1">
              {activeToast.title}
            </h4>
            <span className="text-[10px] font-semibold text-slate-400 font-latin whitespace-nowrap">
              ئێستا
            </span>
          </div>

          <p className="text-xs text-slate-600 leading-relaxed line-clamp-2">
            {activeToast.message}
          </p>

          <div className="mt-2.5 pt-2 border-t border-slate-200/60 flex items-center justify-between gap-2">
            {activeToast.linkUrl ? (
              <button
                onClick={handleAction}
                className="inline-flex items-center gap-1 text-xs font-bold text-[#2563EB] hover:text-blue-700 transition-colors cursor-pointer"
              >
                <span>{activeToast.actionLabel || 'بینینی وردەکاری'}</span>
                {isRtl ? <ArrowLeft className="w-3.5 h-3.5" /> : <ArrowRight className="w-3.5 h-3.5" />}
              </button>
            ) : (
              <span className="text-[10px] text-slate-400 font-medium">ئاگاداری سیستەم</span>
            )}

            <button
              onClick={() => {
                markAsRead(activeToast.id);
                dismissToast();
              }}
              className="text-[11px] font-semibold text-slate-400 hover:text-slate-700 transition-colors cursor-pointer"
            >
              خوێندراوە
            </button>
          </div>
        </div>

        <button
          onClick={dismissToast}
          className="p-1 rounded-lg text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors flex-shrink-0 cursor-pointer"
          aria-label="Close notification"
        >
          <X className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};
