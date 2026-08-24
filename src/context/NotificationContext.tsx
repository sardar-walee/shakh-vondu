import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { NotificationItem, NotificationType, NotificationStatus, RequestCategory, RequestActionType } from '../types';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot
} from 'firebase/firestore';

interface NotificationContextType {
  notifications: NotificationItem[];
  userNotifications: NotificationItem[];
  unreadCount: number;
  actionableCount: number;
  activeToast: NotificationItem | null;
  addNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'> & { id?: string }) => NotificationItem;
  sendNotification: (notification: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'> & { id?: string }) => Promise<NotificationItem>;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearNotifications: () => Promise<void>;
  dismissToast: () => void;
  markActionDone: (id: string) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [notifications, setNotifications] = useState<NotificationItem[]>(() => {
    const saved = localStorage.getItem('shakh_realtime_notifications');
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

  // Sync with Local Storage as resilient client cache
  useEffect(() => {
    localStorage.setItem('shakh_realtime_notifications', JSON.stringify(notifications));
  }, [notifications]);

  // Firebase Firestore Real-Time Listener
  useEffect(() => {
    let unsubNotifications: () => void;

    try {
      const notifCol = collection(db, 'notifications');
      unsubNotifications = onSnapshot(
        notifCol,
        (snapshot) => {
          const remoteList: NotificationItem[] = [];
          snapshot.forEach((docSnap) => {
            const data = docSnap.data() as NotificationItem;
            remoteList.push({
              ...data,
              id: data.id || docSnap.id
            });
          });

          // Sort by creation date descending
          remoteList.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());

          // Merge deduplicated
          setNotifications(prev => {
            const map = new Map<string, NotificationItem>();
            // Remote items first
            remoteList.forEach(item => map.set(item.id, item));
            // Add local-only items if not yet in Firestore
            prev.forEach(item => {
              if (!map.has(item.id)) {
                map.set(item.id, item);
              }
            });
            const merged = Array.from(map.values());
            merged.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
            return merged;
          });
        },
        (err) => {
          console.warn('Notifications onSnapshot notice:', err);
        }
      );
    } catch (e) {
      console.warn('Firestore notifications listener init notice:', e);
    }

    return () => {
      if (unsubNotifications) unsubNotifications();
    };
  }, []);

  // Subtle clean chime sound ONLY for actionable high-priority requests
  const playChime = useCallback((status?: NotificationStatus, actionRequired?: boolean) => {
    // Only play chime if action is required or status is critical
    if (!actionRequired && status !== 'warning' && status !== 'error') return;

    try {
      const AudioCtx = window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext;
      if (!AudioCtx) return;
      const ctx = new AudioCtx();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();

      if (status === 'error') {
        osc.type = 'sawtooth';
        osc.frequency.setValueAtTime(260, ctx.currentTime);
        osc.frequency.setValueAtTime(200, ctx.currentTime + 0.12);
        gain.gain.setValueAtTime(0.1, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.3);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.3);
      } else {
        // High pleasant priority alert (D5 -> A5)
        osc.type = 'sine';
        osc.frequency.setValueAtTime(587.33, ctx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(880, ctx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.12, ctx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, ctx.currentTime + 0.38);
        osc.connect(gain);
        gain.connect(ctx.destination);
        osc.start();
        osc.stop(ctx.currentTime + 0.38);
      }
    } catch {
      // Audio playback silent fallback
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

  // Core Add Notification with Deduplication
  const addNotification = useCallback((item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'> & { id?: string }): NotificationItem => {
    const deterministicId = item.id || `notif-${item.orderId || Date.now()}-${item.recipientId || item.userId}-${item.status || 'info'}-${item.actionType || 'none'}`;
    const now = new Date().toISOString();

    const newNotif: NotificationItem = {
      ...item,
      id: deterministicId,
      userId: item.userId || item.recipientId || 'current',
      recipientId: item.recipientId || item.userId,
      category: item.category || (item.actionRequired ? 'request' : 'update'),
      status: item.status || 'info',
      actionRequired: item.actionRequired ?? false,
      isRead: false,
      createdAt: now,
      updatedAt: now
    };

    setNotifications(prev => {
      // Avoid duplicate cards
      const existsIndex = prev.findIndex(n => n.id === deterministicId);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = { ...updated[existsIndex], ...newNotif };
        return updated;
      }
      return [newNotif, ...prev];
    });

    if (newNotif.actionRequired || newNotif.status === 'warning') {
      setActiveToast(newNotif);
      playChime(newNotif.status, newNotif.actionRequired);
    }

    // Persist to Firebase Firestore
    try {
      setDoc(doc(db, 'notifications', deterministicId), newNotif).catch(e => {
        console.warn('Firestore setDoc notification notice:', e);
      });
    } catch (e) {
      console.warn('Firestore notification write notice:', e);
    }

    return newNotif;
  }, [playChime]);

  const sendNotification = useCallback(async (item: Omit<NotificationItem, 'id' | 'createdAt' | 'isRead'> & { id?: string }): Promise<NotificationItem> => {
    return addNotification(item);
  }, [addNotification]);

  const markAsRead = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, isRead: true } : n));
    try {
      await updateDoc(doc(db, 'notifications', id), { isRead: true });
    } catch (e) {}
  }, []);

  const markAllAsRead = useCallback(async () => {
    setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    try {
      // Background batch update can be handled per doc
    } catch (e) {}
  }, []);

  const markActionDone = useCallback(async (id: string) => {
    setNotifications(prev => prev.map(n => n.id === id ? { ...n, actionRequired: false, isRead: true, updatedAt: new Date().toISOString() } : n));
    try {
      await updateDoc(doc(db, 'notifications', id), { actionRequired: false, isRead: true, updatedAt: new Date().toISOString() });
    } catch (e) {}
  }, []);

  const deleteNotification = useCallback(async (id: string) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
    try {
      await deleteDoc(doc(db, 'notifications', id));
    } catch (e) {}
  }, []);

  const clearNotifications = useCallback(async () => {
    setNotifications([]);
  }, []);

  // Retrieve current user details safely
  const getCurrentUser = () => {
    try {
      const saved = localStorage.getItem('shakh_current_user');
      if (saved) return JSON.parse(saved);
    } catch {
      return null;
    }
    return null;
  };

  const currentUser = getCurrentUser();
  const currentUserId = currentUser?.id || 'guest';
  const currentUserRole = currentUser?.role || 'customer';
  const isSuperAdmin = currentUserRole === 'admin' || currentUser?.email === 'shakh8002@gmail.com';
  const isDeliveryAgent = currentUserRole === 'delivery_agent';
  const isStoreDriver = currentUserRole === 'store_driver';

  // Filter role-targeted notifications
  const userNotifications = notifications.filter(n => {
    // 1. Explicit recipient ID matches current user
    if (n.userId === currentUserId || n.recipientId === currentUserId) return true;
    if (n.userId === 'current' || n.userId === 'all') return true;

    // 2. Super Admin sees all admin notifications and store approval requests
    if (isSuperAdmin) {
      if (n.recipientRole === 'all_admins' || n.recipientId === 'all_admins' || n.type === 'admin' || n.type === 'store_approval') {
        return true;
      }
    }

    // 3. Shakh Captain sees broadcast Shakh delivery requests
    if (isDeliveryAgent) {
      if (n.recipientRole === 'all_shakh_captains' || n.recipientId === 'all_shakh_captains') {
        return true;
      }
    }

    // 4. Store Owner matching store ID or store role
    if (currentUser?.storeName || currentUserRole.includes('seller') || currentUserRole.includes('owner')) {
      const storeId = `store-${currentUserId}`;
      if (n.recipientId === storeId || n.userId === storeId || n.metadata?.sellerId === storeId || n.metadata?.sellerId === currentUserId) {
        return true;
      }
    }

    // 5. Store Driver matching their store ID
    if (isStoreDriver) {
      if (n.recipientId === currentUserId || n.metadata?.captainPhone === currentUser?.phone) {
        return true;
      }
    }

    return false;
  });

  const unreadCount = userNotifications.filter(n => !n.isRead).length;
  const actionableCount = userNotifications.filter(n => n.actionRequired).length;

  return (
    <NotificationContext.Provider
      value={{
        notifications,
        userNotifications,
        unreadCount,
        actionableCount,
        activeToast,
        addNotification,
        sendNotification,
        markAsRead,
        markAllAsRead,
        deleteNotification,
        clearNotifications,
        dismissToast,
        markActionDone
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
