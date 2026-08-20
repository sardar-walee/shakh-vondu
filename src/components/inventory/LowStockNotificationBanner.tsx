import React, { useState, useEffect } from 'react';
import { 
  AlertTriangle, 
  Bell, 
  X, 
  ShoppingCart, 
  ChevronRight, 
  Mail, 
  CheckCircle2, 
  Sliders
} from 'lucide-react';
import { Product } from '../../types';
import { checkLowStockThresholds, LowStockAlert } from '../../lib/inventoryService';
import { useNavigate } from 'react-router-dom';

interface LowStockNotificationBannerProps {
  products: Product[];
  customThreshold?: number;
  subscriberEmail?: string;
}

export const LowStockNotificationBanner: React.FC<LowStockNotificationBannerProps> = ({
  products,
  customThreshold,
  subscriberEmail = 'itlobbybardarash@gmail.com'
}) => {
  const navigate = useNavigate();
  const [alerts, setAlerts] = useState<LowStockAlert[]>([]);
  const [isDismissed, setIsDismissed] = useState<boolean>(false);
  const [emailAlertSent, setEmailAlertSent] = useState<boolean>(false);
  const [userThreshold, setUserThreshold] = useState<number>(customThreshold || 5);
  const [showConfig, setShowConfig] = useState<boolean>(false);

  useEffect(() => {
    const activeAlerts = checkLowStockThresholds(products, userThreshold);
    setAlerts(activeAlerts);
  }, [products, userThreshold]);

  if (isDismissed || alerts.length === 0) {
    return null;
  }

  const criticalCount = alerts.filter(a => a.severity === 'critical').length;

  const handleSendEmailAlert = async () => {
    setEmailAlertSent(true);
    try {
      await fetch('/api/backup/email-send', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          subscriberEmail,
          backupType: 'low_stock_alert',
          backupData: alerts
        })
      });
    } catch {
      // Ignore simulated error
    }
  };

  return (
    <div className="mb-6 bg-gradient-to-r from-amber-950/90 via-slate-900 to-rose-950/90 border border-amber-500/40 rounded-2xl p-4 shadow-xl backdrop-blur-md relative overflow-hidden animate-in fade-in slide-in-from-top-4 duration-300">
      {/* Decorative pulse */}
      <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-amber-400 to-rose-500" />

      <div className="flex flex-wrap items-center justify-between gap-4">
        {/* Left info */}
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-xl relative">
            <Bell className="w-5 h-5 animate-bounce" />
            <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[10px] font-black rounded-full flex items-center justify-center">
              {alerts.length}
            </span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <h4 className="text-sm font-bold text-slate-100">
                ئاگاداری کەمبوونەوەی کۆگا (Low Stock Alert)
              </h4>
              {criticalCount > 0 && (
                <span className="px-2 py-0.5 text-[10px] font-bold bg-rose-500/30 text-rose-300 border border-rose-500/40 rounded-full">
                  {criticalCount} کاڵای مەترسیدار
                </span>
              )}
            </div>

            <p className="text-xs text-slate-300 mt-0.5">
              {alerts.length} بەرهەم گەیشتوونەتە خوار ئاستی دیاریکراوی عەمبار ({userThreshold} دانە).
            </p>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex items-center gap-2">
          {/* Email Alert Button */}
          <button
            onClick={handleSendEmailAlert}
            disabled={emailAlertSent}
            className={`flex items-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-xl transition ${
              emailAlertSent
                ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 cursor-default'
                : 'bg-amber-500/20 hover:bg-amber-500/30 text-amber-300 border border-amber-500/30'
            }`}
          >
            {emailAlertSent ? (
              <>
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                ئاگاداری بۆ ئیمەیل نێردرا
              </>
            ) : (
              <>
                <Mail className="w-3.5 h-3.5" />
                ناردن بۆ ئیمەیلی خاوەن دوکان
              </>
            )}
          </button>

          {/* Threshold config toggle */}
          <button
            onClick={() => setShowConfig(!showConfig)}
            className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl border border-slate-700 transition"
            title="ڕێکخستنی ئاستی ئاگادارکردنەوە"
          >
            <Sliders className="w-4 h-4" />
          </button>

          {/* Navigate to products */}
          <button
            onClick={() => navigate('/products')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-gradient-to-r from-amber-500 to-rose-500 hover:from-amber-400 hover:to-rose-400 text-slate-950 font-bold text-xs rounded-xl shadow-lg transition"
          >
            بڕوانە لە کاڵاکان
            <ChevronRight className="w-3.5 h-3.5 rtl:rotate-180" />
          </button>

          {/* Dismiss */}
          <button
            onClick={() => setIsDismissed(true)}
            className="p-1.5 text-slate-400 hover:text-slate-200 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Threshold Config Slider Drawer */}
      {showConfig && (
        <div className="mt-3 pt-3 border-t border-amber-500/20 flex items-center justify-between text-xs text-slate-300">
          <span>ئاستی کەمترین عەمبار بۆ ئاگادارکردنەوە:</span>
          <div className="flex items-center gap-3">
            <input
              type="range"
              min="1"
              max="25"
              value={userThreshold}
              onChange={(e) => setUserThreshold(Number(e.target.value))}
              className="accent-amber-400 cursor-pointer"
            />
            <span className="font-bold text-amber-400">{userThreshold} دانە</span>
          </div>
        </div>
      )}
    </div>
  );
};
