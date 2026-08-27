import React, { useState, useEffect } from 'react';
import { Bell, BellOff, CheckCircle2, AlertTriangle, Send, Sparkles, Copy, Smartphone, Zap } from 'lucide-react';
import { getFcmPermissionState, requestFcmPushPermission, sendFcmOrderStatusUpdate, broadcastFcmPromotionalOffer } from '../../lib/fcmService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface FcmPushNotificationBannerProps {
  compact?: boolean;
}

export const FcmPushNotificationBanner: React.FC<FcmPushNotificationBannerProps> = ({ compact = false }) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();

  const [permission, setPermission] = useState<NotificationPermission>('default');
  const [isActivating, setIsActivating] = useState(false);
  const [activeToken, setActiveToken] = useState<string>('');
  const [statusMessage, setStatusMessage] = useState<string>('');
  const [testSent, setTestSent] = useState(false);

  useEffect(() => {
    const currentPermission = getFcmPermissionState();
    setPermission(currentPermission);

    const savedInfo = localStorage.getItem('shakh_fcm_token_info');
    if (savedInfo) {
      try {
        const parsed = JSON.parse(savedInfo);
        if (parsed.token) setActiveToken(parsed.token);
      } catch (e) {}
    }
  }, []);

  const handleEnablePush = async () => {
    setIsActivating(true);
    setStatusMessage('');
    
    const userId = currentUser?.id || 'guest-user';
    const userRole = currentUser?.role || 'customer';

    const res = await requestFcmPushPermission(userId, userRole);
    setIsActivating(false);

    if (res.success && res.token) {
      setPermission('granted');
      setActiveToken(res.token);
      setStatusMessage('ئاگادارکردنەوەی فوری FCM بەسەرکەوتوویی چالاک کرا!');
      
      addNotification({
        userId: userId,
        title: '🔔 FCM Push Notifications Active',
        message: 'ئاگادارکردنەوەی فوری و ئۆفەرە تایبەتەکان ئێستا چالاکن لە وێبگەڕەکەتدا.',
        type: 'system',
        status: 'success'
      });
    } else {
      setPermission(getFcmPermissionState());
      setStatusMessage(res.error || 'چالاککردن سەرکەوتوو نەبوو.');
    }
  };

  const handleSendTestPush = async () => {
    setTestSent(true);
    setTimeout(() => setTestSent(false), 3000);

    // Trigger Order Status Update Test
    await sendFcmOrderStatusUpdate({
      orderId: 'ord-test-fcm-88',
      orderNumber: '8899',
      customerId: currentUser?.id || 'demo-cust',
      customerName: currentUser?.fullName || 'کڕیاری شاخ',
      status: 'out_for_delivery',
      sellerName: 'مارکێتی شاخ',
      customMessage: 'تێست: کابتنی گەیاندن بەرەو شوێنی تۆ بەڕێوەیە! (FCM Test Payload)'
    });

    addNotification({
      userId: currentUser?.id || 'demo-cust',
      title: '🛵 [FCM Test] کابتن لە ڕێگایە! #8899',
      message: 'تێستی ناردنی ئاگادارکردنەوەی فوری لەگەڵ سەرکەوتندا ئەنجام درا.',
      type: 'delivery',
      category: 'update',
      status: 'info'
    });
  };

  if (compact) {
    return (
      <div className="bg-gradient-to-r from-amber-500/10 via-orange-500/10 to-amber-500/10 border border-amber-500/30 rounded-2xl p-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-xl bg-amber-500/20 text-amber-600 dark:text-amber-400 flex items-center justify-center flex-shrink-0">
            <Bell className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-xs font-bold text-slate-900 dark:text-slate-100">ئاگادارکردنەوەی فوری Push</span>
              {permission === 'granted' ? (
                <span className="text-[10px] font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-500/30">
                  چالاکە (Active)
                </span>
              ) : (
                <span className="text-[10px] font-bold bg-amber-500/20 text-amber-700 dark:text-amber-300 px-2 py-0.5 rounded-full border border-amber-500/30">
                  ناچالاکە
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500 dark:text-slate-400">بۆ وەرگرتنی نوێکاری داواکاری و ئۆفەرەکان</p>
          </div>
        </div>

        {permission !== 'granted' ? (
          <button
            onClick={handleEnablePush}
            disabled={isActivating}
            className="px-3 py-1.5 text-xs font-bold bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 rounded-xl hover:opacity-90 transition-all shadow-xs flex items-center gap-1 cursor-pointer"
          >
            <Zap className="w-3.5 h-3.5 fill-current" />
            <span>{isActivating ? 'لە چالاککردندایە...' : 'چالاککردن'}</span>
          </button>
        ) : (
          <button
            onClick={handleSendTestPush}
            className="px-3 py-1.5 text-xs font-bold bg-white dark:bg-slate-800 text-slate-800 dark:text-slate-200 border border-slate-200 dark:border-slate-700 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-700 transition-all flex items-center gap-1 cursor-pointer"
          >
            <Send className="w-3 h-3 text-amber-500" />
            <span>{testSent ? 'نێردرا!' : 'تێست (Test)'}</span>
          </button>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-br from-amber-500/15 via-orange-500/10 to-amber-600/10 border border-amber-500/30 rounded-3xl p-5 shadow-sm space-y-4 relative overflow-hidden">
      {/* Background glowing sphere decoration */}
      <div className="absolute -top-12 -left-12 w-32 h-32 bg-amber-500/20 rounded-full blur-2xl pointer-events-none" />

      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center shadow-md">
            <Bell className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-slate-900 dark:text-slate-100">
                ئاگادارکردنەوەی فوری FCM (Firebase Push Notifications)
              </h3>
              {permission === 'granted' && (
                <span className="text-xs font-bold bg-emerald-500/20 text-emerald-700 dark:text-emerald-300 px-2.5 py-0.5 rounded-full border border-emerald-500/30 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  چالاکە
                </span>
              )}
            </div>
            <p className="text-xs text-slate-600 dark:text-slate-300 mt-1 leading-relaxed">
              نوێکارییە ڕاستەوخۆکانی باری داواکاری (Order Updates) و ئۆفەرە تایبەتەکان (Promotions) ڕاستەوخۆ لە وێبگەڕ یان مۆبایلەکەت وەرگرە.
            </p>
          </div>
        </div>

        {permission === 'granted' ? (
          <button
            onClick={handleSendTestPush}
            className="px-4 py-2.5 text-xs font-bold bg-white dark:bg-slate-800 text-slate-900 dark:text-slate-100 border border-amber-500/40 rounded-2xl hover:bg-amber-50 dark:hover:bg-slate-700 transition-all shadow-xs flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <Send className="w-4 h-4 text-amber-500" />
            <span>{testSent ? 'نێردرا!' : 'تاقیکردنەوەی Push'}</span>
          </button>
        ) : (
          <button
            onClick={handleEnablePush}
            disabled={isActivating}
            className="px-5 py-2.5 text-xs font-black bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 rounded-2xl hover:opacity-95 transition-all shadow-md flex items-center gap-2 flex-shrink-0 cursor-pointer"
          >
            <Zap className="w-4 h-4 fill-current" />
            <span>{isActivating ? 'لە چالاککردندایە...' : 'چالاککردنی FCM Push'}</span>
          </button>
        )}
      </div>

      {statusMessage && (
        <div className="text-xs font-bold text-amber-800 dark:text-amber-300 bg-amber-500/20 p-2.5 rounded-xl border border-amber-500/30">
          {statusMessage}
        </div>
      )}

      {/* FCM Device Token & Status Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-2 border-t border-amber-500/20 text-xs">
        <div className="flex items-center gap-2 text-slate-600 dark:text-slate-300">
          <Smartphone className="w-4 h-4 text-amber-500" />
          <span>باری مۆڵەت: </span>
          <strong className="font-latin text-slate-900 dark:text-slate-100 uppercase">{permission}</strong>
        </div>

        {activeToken && (
          <div className="flex items-center justify-between gap-2 bg-white/60 dark:bg-slate-900/60 p-2 rounded-xl border border-slate-200 dark:border-slate-800 font-mono text-[10px]">
            <span className="truncate text-slate-500">FCM Token: {activeToken.slice(0, 24)}...</span>
            <button
              onClick={() => {
                navigator.clipboard.writeText(activeToken);
                alert('FCM Device Token لەبیراوخۆ کۆپی کرا!');
              }}
              className="text-amber-600 hover:text-amber-700 dark:text-amber-400 font-sans text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Copy className="w-3 h-3" />
              <span>کۆپی</span>
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
