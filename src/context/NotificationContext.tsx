import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem, NotificationType, NotificationStatus } from '../types';

interface NotificationContextType {
  notifications: NotificationItem[];
  userNotifications: NotificationItem[];
  unreadCount: number;
  activeToast: NotificationItem | null;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>) => NotificationItem;
  markAsRead: (id: string) => void;
  markAllAsRead: () => void;
  deleteNotification: (id: string) => void;
  clearNotifications: () => void;
  dismissToast: () => void;
  simulateNotification: (scenario:
    | 'order_accepted'
    | 'order_preparing'
    | 'order_out_for_delivery'
    | 'order_delivered'
    | 'order_cancelled'
    | 'payment_success'
    | 'payment_failed'
    | 'car_expiring_soon'
    | 'car_expired'
    | 'seller_new_order'
  ) => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

const SEED_NOTIFICATIONS: NotificationItem[] = [
  {
    id: 'notif-1',
    userId: 'all',
    title: 'بەخێربێیت بۆ پلاتفۆرمی شاخی',
    message: 'داواکارییەکانت لە ڕێگەی شاخی بە خێراترین کات دەگاتە دەستت بە باشترین نرخ.',
    type: 'system',
    status: 'info',
    isRead: true,
    createdAt: new Date(Date.now() - 86400000).toISOString()
  },
  {
    id: 'notif-2',
    userId: 'current',
    title: 'داواکاری گەیەندرا #SHK-8901',
    message: 'داواکارییەکەت لە چێشتخانەی دیلان بە سەرکەوتوویی گەیەندرا.',
    type: 'order',
    status: 'success',
    isRead: false,
    linkUrl: 'order-tracking',
    actionLabel: 'بینینی داواکاری',
    metadata: {
      orderId: 'ord-1001',
      orderNumber: 'SHK-8901',
      amount: 52500
    },
    createdAt: new Date(Date.now() - 7200000).toISOString()
  },
  {
    id: 'notif-3',
    userId: 'current',
    title: 'پارەدانی سەرکەوتوو (FIB)',
    message: 'بڕی ١٠,٠٠٠ د.ع بۆ پاکێجی VIP ئۆتۆمبێلی Toyota Camry 2023 وەرگیرا.',
    type: 'payment',
    status: 'success',
    isRead: false,
    linkUrl: 'car-marketplace',
    actionLabel: 'بینینی ڕیکلام',
    metadata: {
      carAdId: 'car-1',
      amount: 10000,
      paymentMethod: 'fib'
    },
    createdAt: new Date(Date.now() - 14400000).toISOString()
  },
  {
    id: 'notif-4',
    userId: 'current',
    title: 'ئاگاداری: ڕیکلامەکەت بەم زووانە بەسەردەچێت',
    message: 'ڕیکلامی ئۆتۆمبێلی Hyundai Tucson 2022 پاش ٢ ڕۆژی تر بەسەردەچێت. ئێستا نوێی بکەرەوە تا لە پێشەوە بمێنێتەوە.',
    type: 'car',
    status: 'warning',
    isRead: false,
    linkUrl: 'post-car-ad',
    actionLabel: 'نوێکردنەوەی پاکێج',
    metadata: {
      carAdId: 'car-2',
      daysLeft: 2
    },
    createdAt: new Date(Date.now() - 28800000).toISOString()
  },
  {
    id: 'notif-5',
    userId: 'store-rest-1',
    title: 'داواکارییەکی نوێ گەیشت! #SHK-9240',
    message: 'داواکاری نوێ لەلایەن کڕیار (ڕێبین ئەحمەد) بە بڕی ٤٢,٠٠٠ د.ع تۆمارکرا.',
    type: 'seller',
    status: 'info',
    isRead: false,
    linkUrl: 'seller-dashboard',
    actionLabel: 'پەسەندکردنی داواکاری',
    metadata: {
      orderId: 'ord-1002',
      orderNumber: 'SHK-9240',
      sellerId: 'store-rest-1',
      amount: 42000
    },
    createdAt: new Date(Date.now() - 3600000).toISOString()
  }
];

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('shakh_notifications');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed)) return parsed;
      } catch (e) {
        console.error('Error parsing notifications', e);
      }
    }
    return [];
  });

  const [activeToast, setActiveToast] = useState<NotificationItem | null>(null);

  useEffect(() => {
    localStorage.setItem('shakh_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Play audio chime for real-time alert
  const playChime = useCallback((status?: NotificationStatus) => {
    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (status === 'error') {
        // Double low buzz
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(300, ctx.currentTime);
        osc.frequency.setValueAtTime(220, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else if (status === 'warning') {
        // Double ding
        osc.type = 'sine';
        osc.frequency.setValueAtTime(523.25, ctx.currentTime); // C5
        osc.frequency.setValueAtTime(659.25, ctx.currentTime + 0.1); // E5
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.35);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.35);
      } else {
        // High upbeat bell (D5 -> A5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime); // D5
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15); // A5
        gain.gain.setValueAtTime(0.14, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.4);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.4);
      }
    } catch {
      // Audio playback silent fail
    }
  }, []);

  const dismissToast = useCallback(() => {
    setActiveToast(null);
  }, []);

  // Auto-dismiss active toast
  useEffect(() => {
    if (!activeToast) return;
    const timer = setTimeout(() => {
      setActiveToast(null);
    }, 6000);
    return () => clearTimeout(timer);
  }, [activeToast]);

  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'>): NotificationItem => {
    const newNotif: NotificationItem = {
      ...item,
      id: `notif-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      status: item.status || 'info',
      isRead: false,
      createdAt: new Date().toISOString()
    };

    setNotifications(prev => [newNotif, ...prev]);
    setActiveToast(newNotif);
    playChime(newNotif.status);

    return newNotif;
  }, [playChime]);

  const markAsRead = useCallback((id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
  }, []);

  const markAllAsRead = useCallback(() => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
  }, []);

  const deleteNotification = useCallback((id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Retrieve stored user id for filtering
  const getCurrentUserId = (): string => {
    try {
      const saved = localStorage.getItem('shakh_current_user');
      if (saved) {
        const u = JSON.parse(saved);
        return u.id || 'current';
      }
    } catch {
      // fallback
    }
    return 'current';
  };

  const currentUserId = getCurrentUserId();

  // Filter user specific notifications
  const userNotifications = notifications.filter(n => {
    if (n.userId === 'all' || n.userId === 'current') return true;
    if (n.userId === currentUserId) return true;
    // Also match role/store if user is store owner or admin
    return true; // Keep accessible for interactive demo and multi-role views
  });

  const unreadCount = userNotifications.filter(n => !n.isRead).length;

  // Real-time Event Simulator Helper
  const simulateNotification = useCallback((scenario:
    | 'order_accepted'
    | 'order_preparing'
    | 'order_out_for_delivery'
    | 'order_delivered'
    | 'order_cancelled'
    | 'payment_success'
    | 'payment_failed'
    | 'car_expiring_soon'
    | 'car_expired'
    | 'seller_new_order'
  ) => {
    const randomOrderNum = `SHK-${Math.floor(1000 + Math.random() * 9000)}`;

    switch (scenario) {
      case 'order_accepted':
        addNotification({
          userId: 'current',
          title: `داواکاری ${randomOrderNum} پەسەندکرا`,
          message: 'چێشتخانە/فرۆشگا داواکارییەکەی پەسەندکرد و ئامادەکاری دەستی پێکرد.',
          type: 'order',
          status: 'info',
          linkUrl: 'order-tracking',
          actionLabel: 'شوێنپێهەڵگرتن',
          metadata: { orderNumber: randomOrderNum }
        });
        break;

      case 'order_preparing':
        addNotification({
          userId: 'current',
          title: `داواکاری ${randomOrderNum} لە ئامادەکردندایە`,
          message: 'چێشتخانە سەرقاڵی ئامادەکردنی خواردن و بەستەبەندییە بە پاکوخاوێنی.',
          type: 'order',
          status: 'info',
          linkUrl: 'order-tracking',
          actionLabel: 'بینینی دۆخ',
          metadata: { orderNumber: randomOrderNum }
        });
        break;

      case 'order_out_for_delivery':
        addNotification({
          userId: 'current',
          title: `داواکاری ${randomOrderNum} لە ڕێگادایە بۆ لات! 🛵`,
          message: 'شۆفێری شاخی داواکارییەکەی لە فرۆشگا وەرگرت و بەرەو ناونیشانەکەت بەڕێکەوتووە.',
          type: 'order',
          status: 'warning',
          linkUrl: 'order-tracking',
          actionLabel: 'شوێنپێهەڵگرتنی شۆفێر',
          metadata: { orderNumber: randomOrderNum }
        });
        break;

      case 'order_delivered':
        addNotification({
          userId: 'current',
          title: `داواکاری ${randomOrderNum} بە سەرکەوتوویی گەیەندرا! 🎉`,
          message: 'سوپاس بۆ کڕین لە شاخی. دەتوانیت هەڵسەنگاندن بۆ کوالیتی و شۆفێر بنووسیت.',
          type: 'order',
          status: 'success',
          linkUrl: 'customer-orders',
          actionLabel: 'هەڵسەنگاندن بنووسە',
          metadata: { orderNumber: randomOrderNum }
        });
        break;

      case 'order_cancelled':
        addNotification({
          userId: 'current',
          title: `داواکاری ${randomOrderNum} هەڵوەشێنرایەوە ❌`,
          message: 'داواکارییەکە بەهۆی تەواوبوونی بڕی کاڵاکە یان لەسەر داوای کڕیار هەڵوەشێنرایەوە.',
          type: 'order',
          status: 'error',
          linkUrl: 'customer-orders',
          actionLabel: 'بینینی هۆکار',
          metadata: { orderNumber: randomOrderNum }
        });
        break;

      case 'payment_success':
        addNotification({
          userId: 'current',
          title: 'پارەدانی سەرکەوتوو 💳',
          message: 'بڕی ١٠,٠٠٠ د.ع بە سەرکەوتوویی لە ڕێگەی FastPay درا و ڕیکلامەکەت چالاک بوو.',
          type: 'payment',
          status: 'success',
          linkUrl: 'car-marketplace',
          actionLabel: 'بینینی پسوولە',
          metadata: { amount: 10000, paymentMethod: 'fastpay' }
        });
        break;

      case 'payment_failed':
        addNotification({
          userId: 'current',
          title: 'پارەدان سەرکەوتوو نەبوو! ⚠️',
          message: 'پرۆسەی پارەدان شکستی هێنا بەهۆی بەردەست نەبوونی باڵانسی پێویست یان کێشەی هێڵ.',
          type: 'payment',
          status: 'error',
          linkUrl: 'checkout',
          actionLabel: 'دووبارە پارەدان',
          metadata: { reason: 'insufficient_funds' }
        });
        break;

      case 'car_expiring_soon':
        addNotification({
          userId: 'current',
          title: 'ئاگاداری: ڕیکلامی ئۆتۆمبێل بەم زووانە بەسەردەچێت ⏳',
          message: 'ڕیکلامی ئۆتۆمبێلی (Mercedes-Benz C300 2023) پاش ٢ ڕۆژی تر لە پێشانگای سەرەکی لادەبرێت.',
          type: 'car',
          status: 'warning',
          linkUrl: 'post-car-ad',
          actionLabel: 'نوێکردنەوەی پاکێج',
          metadata: { daysLeft: 2 }
        });
        break;

      case 'car_expired':
        addNotification({
          userId: 'current',
          title: 'ڕیکلامی ئۆتۆمبێلەکەت بەسەرچوو 🚫',
          message: 'ماوەی پاکێجی ڕیکلامەکەت کۆتایی هات. دەتوانیت ئێستا نوێی بکەیتەوە بە پاکێجی نوێ.',
          type: 'car',
          status: 'error',
          linkUrl: 'post-car-ad',
          actionLabel: 'نوێکردنەوە ئێستا',
          metadata: { daysLeft: 0 }
        });
        break;

      case 'seller_new_order':
        addNotification({
          userId: 'store-rest-1',
          title: `داواکارییەکی نوێ گەیشت! 🔔 (${randomOrderNum})`,
          message: 'کڕیارێک داواکارییەکی نوێی بە بڕی ٣٨,٥٠٠ د.ع بۆ چێشتخانەکەت تۆمارکرد. تکایە پشکنینی بۆ بکە.',
          type: 'seller',
          status: 'info',
          linkUrl: 'seller-dashboard',
          actionLabel: 'بینینی لە داشبۆرد',
          metadata: { orderNumber: randomOrderNum, amount: 38500 }
        });
        break;
    }
  }, [addNotification]);

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        userNotifications,
        unreadCount,
        activeToast,
        addNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearNotifications,
        dismissToast,
        simulateNotification
      }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within a NotificationProvider');
  }
  return context;
};
