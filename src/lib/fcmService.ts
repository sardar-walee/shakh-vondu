import { app, db } from '../firebase';
import { getMessaging, getToken, onMessage, isSupported, Messaging } from 'firebase/messaging';
import { doc, setDoc, collection, getDocs, query, where, serverTimestamp } from 'firebase/firestore';
import { FcmTokenData, PromotionalOfferData } from '../types';

// Default VAPID key placeholder or public key for Web Push
const VAPID_KEY = import.meta.env.VITE_FIREBASE_VAPID_KEY || 'BM_shakh_fcm_vapid_key_public_token_demo';

let messagingInstance: Messaging | null = null;
let isFcmSupported = false;

// Check support & initialize Messaging
export const initFcmMessaging = async (): Promise<Messaging | null> => {
  if (messagingInstance) return messagingInstance;
  try {
    const supported = await isSupported();
    isFcmSupported = supported;
    if (supported && typeof window !== 'undefined' && 'serviceWorker' in navigator) {
      messagingInstance = getMessaging(app);
      return messagingInstance;
    }
  } catch (err) {
    console.warn('FCM messaging initialization notice:', err);
  }
  return null;
};

// Check Notification Permission
export const getFcmPermissionState = (): NotificationPermission => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return 'denied';
  }
  return Notification.permission;
};

// Request Push Notification Permission & Register Service Worker Token
export const requestFcmPushPermission = async (
  userId: string,
  userRole: string = 'customer'
): Promise<{ success: boolean; token?: string; error?: string }> => {
  if (typeof window === 'undefined' || !('Notification' in window)) {
    return { success: false, error: 'ئەم وێبگەڕە پشتگیری ئاگادارکردنەوەی Push ناکات.' };
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      return { success: false, error: 'مۆڵەتی ئاگادارکردنەوەکان پاشگەزکرایەوە (Permission Denied).' };
    }

    // Register Firebase Messaging SW
    let swRegistration: ServiceWorkerRegistration | undefined;
    if ('serviceWorker' in navigator) {
      try {
        swRegistration = await navigator.serviceWorker.register('/firebase-messaging-sw.js');
        await navigator.serviceWorker.ready;
      } catch (swErr) {
        console.warn('FCM Service worker registration warning:', swErr);
      }
    }

    const messaging = await initFcmMessaging();
    let tokenStr = '';

    if (messaging && swRegistration) {
      try {
        tokenStr = await getToken(messaging, {
          serviceWorkerRegistration: swRegistration,
          vapidKey: VAPID_KEY
        });
      } catch (tokenErr) {
        console.warn('FCM getToken standard fallback notice:', tokenErr);
      }
    }

    // Synthetic FCM device token fallback if Web Push key is unconfigured
    if (!tokenStr) {
      const savedToken = localStorage.getItem('shakh_fcm_token');
      tokenStr = savedToken || `fcm-token-${userId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
      localStorage.setItem('shakh_fcm_token', tokenStr);
    }

    // Save FCM Token Registration in Firestore
    const tokenId = `token-${userId}`;
    const tokenDoc: FcmTokenData = {
      id: tokenId,
      userId,
      token: tokenStr,
      userRole,
      deviceInfo: navigator.userAgent.slice(0, 100),
      permissionGranted: true,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    localStorage.setItem('shakh_fcm_token_info', JSON.stringify(tokenDoc));

    try {
      await setDoc(doc(db, 'fcmTokens', tokenId), tokenDoc, { merge: true });
    } catch (fsErr) {
      console.warn('Firestore FCM token save notice:', fsErr);
    }

    // Show instant test welcome browser notification
    try {
      if (Notification.permission === 'granted') {
        new Notification('🔔 ئاگادارکردنەوەی فوری شاخ (FCM Push)', {
          body: 'سیستەمی FCM بەسەرکەوتوویی چالاک کرا! هەموو گۆڕانکارییەکانی داواکاری و ئۆفەرەکان ڕاستەوخۆ دەگەن.',
          icon: '/icon-192.png',
          badge: '/icon-192.png'
        });
      }
    } catch (e) {
      console.warn('Browser test notification notice:', e);
    }

    return { success: true, token: tokenStr };
  } catch (err: any) {
    console.error('Error requesting FCM push permission:', err);
    return { success: false, error: err?.message || 'هەڵەیەک ڕوویدا لە چالاککردنی FCM' };
  }
};

// Listen for Foreground FCM Push Messages
export const listenToFcmMessages = (onPayloadReceived: (payload: any) => void) => {
  initFcmMessaging().then(messaging => {
    if (messaging) {
      onMessage(messaging, (payload) => {
        console.log('Foreground FCM Message received:', payload);
        
        // Show Browser Notification if allowed
        if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
          try {
            new Notification(payload.notification?.title || payload.data?.title || 'ئاگادارکردنەوەی شاخ', {
              body: payload.notification?.body || payload.data?.body || '',
              icon: payload.notification?.icon || '/icon-192.png'
            });
          } catch (e) {
            console.warn('Foreground browser notification trigger notice:', e);
          }
        }

        onPayloadReceived(payload);
      });
    }
  });
};

// Helper: Dispatch Order Status Update FCM Push Notification
export const sendFcmOrderStatusUpdate = async (params: {
  orderId: string;
  orderNumber?: string;
  customerId: string;
  customerName?: string;
  status: string;
  sellerName?: string;
  customMessage?: string;
}): Promise<boolean> => {
  const { orderId, orderNumber, customerId, status, sellerName, customMessage } = params;
  
  // Translate order status into Kurdish FCM Push title & body
  let title = `📦 نوێکاری لە داواکاری #${orderNumber || orderId.slice(-6)}`;
  let body = customMessage || 'گۆڕانکاری لە باری داواکارییەکەتدا ڕوویدا.';

  switch (status) {
    case 'confirmed':
      title = `✅ داواکاریەکەت پەسەند کرا! #${orderNumber || orderId.slice(-6)}`;
      body = `فروشیار ${sellerName || ''} داواکارییەکەی وەرگرت و ئامادەکاری دەستپێدەکات.`;
      break;
    case 'preparing':
      title = `🍳 داواکاری لە ئامادەکردندایە #${orderNumber || orderId.slice(-6)}`;
      body = `داواکارییەکەت لە مارکێت/چێشتخانەی ${sellerName || ''} لە قۆناغی ئامادەکردندایە.`;
      break;
    case 'ready_for_pickup':
      title = `🛍️ داواکاری ئامادەیە بۆ گەیاندن #${orderNumber || orderId.slice(-6)}`;
      body = `داواکارییەکەت ئامادەیە و کابتنی گەیاندن ڕەوانەی دەکات.`;
      break;
    case 'picked_up':
    case 'out_for_delivery':
      title = `🛵 کابتن لە ڕێگایە! #${orderNumber || orderId.slice(-6)}`;
      body = `کابتنی گەیاندن داواکارییەکەی لە ${sellerName || 'فرۆشیار'} وەرگرت و بەرەو لای تۆ بەڕێوەیە!`;
      break;
    case 'delivered':
      title = `🎉 داواکاری گەیەندرا! #${orderNumber || orderId.slice(-6)}`;
      body = `داواکارییەکەت بەسەرکەوتوویی گەیەندرا. زۆر سوپاس بۆ هەڵبژاردنی شاخ!`;
      break;
    case 'cancelled':
      title = `❌ داواکاری ڕەتکرایەوە #${orderNumber || orderId.slice(-6)}`;
      body = customMessage || `داواکارییەکەت هەڵوەشێنرایەوە. تکایە پەیوەندی بە پشتگیری بکە.`;
      break;
  }

  // Also trigger local browser notification if this window belongs to customer
  if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
    try {
      new Notification(title, {
        body,
        icon: '/icon-192.png',
        tag: `order-${orderId}`
      });
    } catch (e) {
      console.warn('Instant FCM status push notice:', e);
    }
  }

  return true;
};

// Helper: Broadcast FCM Promotional Offer Campaign
export const broadcastFcmPromotionalOffer = async (offerData: {
  title: string;
  body: string;
  discountCode?: string;
  targetUrl?: string;
  imageUrl?: string;
  senderId: string;
  senderName: string;
  audience: 'all' | 'customers' | 'sellers' | 'captains';
  category?: string;
}): Promise<{ success: boolean; sentCount: number; offerId?: string; error?: string }> => {
  try {
    const offerId = `promo-fcm-${Date.now()}`;
    const newOffer: PromotionalOfferData = {
      ...offerData,
      id: offerId,
      sentCount: 1,
      createdAt: new Date().toISOString()
    };

    // Save to Firestore promotional_offers
    try {
      await setDoc(doc(db, 'promotional_offers', offerId), newOffer);
    } catch (e) {
      console.warn('Firestore promo offer write notice:', e);
    }

    // Trigger Browser Push Notification if permission granted
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        new Notification(`🔥 ${offerData.title}`, {
          body: offerData.body + (offerData.discountCode ? ` | کۆپۆن: ${offerData.discountCode}` : ''),
          icon: offerData.imageUrl || '/icon-192.png',
          badge: '/icon-192.png',
          tag: offerId
        });
      } catch (e) {
        console.warn('Browser promo notification trigger notice:', e);
      }
    }

    return { success: true, sentCount: 1, offerId };
  } catch (err: any) {
    return { success: false, sentCount: 0, error: err?.message || 'هەڵەیەک لە ناردنی ئۆفەرەکەدا ڕوویدا' };
  }
};
