// Firebase Cloud Messaging Service Worker for Shakh Marketplace
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.23.0/firebase-messaging-compat.js');

// Initialize the Firebase app in the service worker
firebase.initializeApp({
  apiKey: "AIzaSyAM1oKqAJHZXYLlgeGNHK1NXqKag0hgU50",
  authDomain: "gen-lang-client-0699985988.firebaseapp.com",
  projectId: "gen-lang-client-0699985988",
  storageBucket: "gen-lang-client-0699985988.firebasestorage.app",
  messagingSenderId: "73507269081",
  appId: "1:73507269081:web:182369061924139e4991c8"
});

const messaging = firebase.messaging();

// Background message handler
messaging.onBackgroundMessage((payload) => {
  console.log('[firebase-messaging-sw.js] Received background message:', payload);
  
  const notificationTitle = payload.notification?.title || payload.data?.title || 'ئاگادارکردنەوەی نوێی شاخ (Shakh Push)';
  const notificationOptions = {
    body: payload.notification?.body || payload.data?.body || 'گۆڕانکاری لە داواکاری یان ئۆفەری نوێ هەیە.',
    icon: payload.notification?.icon || payload.data?.icon || '/icon-192.png',
    badge: '/icon-192.png',
    tag: payload.data?.orderId || payload.data?.offerId || 'shakh-fcm-notification',
    data: {
      url: payload.data?.url || payload.fcmOptions?.link || '/',
      orderId: payload.data?.orderId,
      offerId: payload.data?.offerId
    },
    actions: [
      { action: 'open', title: 'پیشاندان' },
      { action: 'close', title: 'داخستن' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Notification click event
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  const targetUrl = event.notification.data?.url || '/';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((clientList) => {
      for (const client of clientList) {
        if (client.url && 'focus' in client) {
          client.navigate(targetUrl);
          return client.focus();
        }
      }
      if (clients.openWindow) {
        return clients.openWindow(targetUrl);
      }
    })
  );
});
