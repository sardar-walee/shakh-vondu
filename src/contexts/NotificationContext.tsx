import React, { createContext, useContext, useState, useEffect } from 'react';
import { db, auth } from '../lib/firebase';
import { 
  collection, 
  query, 
  onSnapshot, 
  doc, 
  addDoc, 
  updateDoc, 
  deleteDoc, 
  writeBatch,
  getDocs
} from 'firebase/firestore';
import { useStore } from './StoreContext';
import { useAuth } from './AuthContext';
import { StoreNotification, NotificationType, NotificationSeverity, Product } from '../types';

export enum OperationType {
  CREATE = 'create',
  UPDATE = 'update',
  DELETE = 'delete',
  LIST = 'list',
  GET = 'get',
  WRITE = 'write',
}

export interface FirestoreErrorInfo {
  error: string;
  operationType: OperationType;
  path: string | null;
  authInfo: {
    userId?: string | null;
    email?: string | null;
    emailVerified?: boolean | null;
    isAnonymous?: boolean | null;
    tenantId?: string | null;
    providerInfo?: {
      providerId?: string | null;
      email?: string | null;
    }[];
  };
}

export function handleFirestoreError(error: unknown, operationType: OperationType, path: string | null) {
  const errInfo: FirestoreErrorInfo = {
    error: error instanceof Error ? error.message : String(error),
    authInfo: {
      userId: auth.currentUser?.uid,
      email: auth.currentUser?.email,
      emailVerified: auth.currentUser?.emailVerified,
      isAnonymous: auth.currentUser?.isAnonymous,
      tenantId: auth.currentUser?.tenantId,
      providerInfo: auth.currentUser?.providerData?.map(provider => ({
        providerId: provider.providerId,
        email: provider.email,
      })) || []
    },
    operationType,
    path
  };
  console.error('Firestore Error: ', JSON.stringify(errInfo));
  throw new Error(JSON.stringify(errInfo));
}

interface NotificationContextType {
  notifications: StoreNotification[];
  unreadCount: number;
  toastNotification: StoreNotification | null;
  dismissToast: () => void;
  markAsRead: (id: string) => Promise<void>;
  markAllAsRead: () => Promise<void>;
  deleteNotification: (id: string) => Promise<void>;
  clearAll: () => Promise<void>;
  createNotification: (data: Omit<StoreNotification, 'id' | 'createdAt' | 'read'>) => Promise<void>;
  broadcastSystemUpdate: (title: string, message: string, severity?: NotificationSeverity) => Promise<void>;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Web Audio synthesizer for subtle alert chime
function playNotificationChime(severity: NotificationSeverity = 'info') {
  try {
    const AudioContext = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContext) return;
    const ctx = new AudioContext();
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();

    osc.type = severity === 'urgent' ? 'sawtooth' : severity === 'warning' ? 'triangle' : 'sine';
    const startFreq = severity === 'urgent' ? 880 : severity === 'warning' ? 660 : 520;
    osc.frequency.setValueAtTime(startFreq, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(startFreq * 1.5, ctx.currentTime + 0.15);

    gain.gain.setValueAtTime(0.12, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.3);

    osc.connect(gain);
    gain.connect(ctx.destination);

    osc.start();
    osc.stop(ctx.currentTime + 0.3);
  } catch (_) {
    // Ignore audio permission/context restriction
  }
}

export function NotificationProvider({ children }: { children: React.ReactNode }) {
  const { store } = useStore();
  const { user } = useAuth();
  const [notifications, setNotifications] = useState<StoreNotification[]>([]);
  const [toastNotification, setToastNotification] = useState<StoreNotification | null>(null);
  const [initialLoaded, setInitialLoaded] = useState(false);

  // 1. Real-time Firestore Listener for store notifications
  useEffect(() => {
    if (!store?.id || !user) {
      setNotifications([]);
      return;
    }

    const path = `stores/${store.id}/notifications`;
    const q = query(collection(db, path));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const items: StoreNotification[] = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      } as StoreNotification));

      // Sort newest first
      items.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());

      // Detect if new urgent/warning notification arrived after initial load
      if (initialLoaded && snapshot.docChanges().length > 0) {
        snapshot.docChanges().forEach(change => {
          if (change.type === 'added') {
            const newNotif = { id: change.doc.id, ...change.doc.data() } as StoreNotification;
            if (!newNotif.read) {
              setToastNotification(newNotif);
              playNotificationChime(newNotif.severity);
            }
          }
        });
      }

      setNotifications(items);
      setInitialLoaded(true);
    }, (error) => {
      handleFirestoreError(error, OperationType.GET, path);
    });

    return () => unsubscribe();
  }, [store?.id, user, initialLoaded]);

  // 2. Real-time Listener for Products -> Auto-generate Low Inventory Alerts
  useEffect(() => {
    if (!store?.id || !user) return;

    const path = `stores/${store.id}/products`;
    const unsubscribe = onSnapshot(collection(db, path), async (snapshot) => {
      const products = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      
      for (const prod of products) {
        const minVal = prod.minStock ?? 5;
        const isLow = prod.stock <= minVal;

        // Check if an active low inventory alert already exists for this product
        const existing = notifications.find(n => 
          n.type === 'low_inventory' && n.metadata?.productId === prod.id
        );

        if (isLow && !existing) {
          // Auto create low inventory notification in Firestore
          try {
            await addDoc(collection(db, `stores/${store.id}/notifications`), {
              title: `⚠️ Low Stock Alert: ${prod.name}`,
              message: `Product "${prod.name}" (${prod.brand || 'Accessories'}) is down to ${prod.stock} units! Minimum threshold is ${minVal}.`,
              type: 'low_inventory',
              severity: prod.stock === 0 ? 'urgent' : 'warning',
              read: false,
              link: '/products',
              metadata: {
                productId: prod.id,
                productName: prod.name,
                stock: prod.stock,
                minStock: minVal
              },
              createdAt: new Date().toISOString(),
              createdBy: 'system_monitor'
            });
          } catch (_) {}
        } else if (!isLow && existing) {
          // Remove or clear alert if stock has been replenished!
          try {
            await deleteDoc(doc(db, `stores/${store.id}/notifications`, existing.id));
          } catch (_) {}
        }
      }
    }, (error) => {
      // Ignore background product scan permission error silently
    });

    return () => unsubscribe();
  }, [store?.id, user, notifications]);

  // 3. Real-time Listener for Store Subscription Status -> Auto-generate Renewal Alerts
  useEffect(() => {
    if (!store?.id || !user) return;

    const targetDateStr = store.subscriptionEndDate || store.trialEndDate;
    if (!targetDateStr) return;

    const expiryDate = new Date(targetDateStr);
    const now = new Date();
    const diffDays = Math.ceil((expiryDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));

    const existingSubNotif = notifications.find(n => n.type === 'subscription_renewal');

    if (diffDays <= 7 && !existingSubNotif) {
      const isExpired = diffDays <= 0;
      addDoc(collection(db, `stores/${store.id}/notifications`), {
        title: isExpired ? `🚨 SaaS Subscription Expired!` : `🔔 Subscription Renewal Notice`,
        message: isExpired 
          ? `Your store trial/plan has expired on ${expiryDate.toLocaleDateString()}. Please renew your plan to continue access.`
          : `Your SaaS subscription expires in ${diffDays} days on ${expiryDate.toLocaleDateString()}. Tap to extend your license.`,
        type: 'subscription_renewal',
        severity: isExpired ? 'urgent' : 'warning',
        read: false,
        link: '/subscription',
        metadata: {
          subscriptionEndDate: targetDateStr,
          planName: store.planId || 'Starter'
        },
        createdAt: new Date().toISOString(),
        createdBy: 'billing_system'
      }).catch(() => {});
    }
  }, [store?.id, store?.subscriptionEndDate, store?.trialEndDate, user, notifications]);

  const unreadCount = notifications.filter(n => !n.read).length;

  const dismissToast = () => setToastNotification(null);

  const markAsRead = async (id: string) => {
    if (!store?.id) return;
    const path = `stores/${store.id}/notifications/${id}`;
    try {
      await updateDoc(doc(db, path), { read: true });
    } catch (error) {
      handleFirestoreError(error, OperationType.UPDATE, path);
    }
  };

  const markAllAsRead = async () => {
    if (!store?.id) return;
    const path = `stores/${store.id}/notifications`;
    try {
      const unread = notifications.filter(n => !n.read);
      const batch = writeBatch(db);
      unread.forEach(n => {
        batch.update(doc(db, path, n.id), { read: true });
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.WRITE, path);
    }
  };

  const deleteNotification = async (id: string) => {
    if (!store?.id) return;
    const path = `stores/${store.id}/notifications/${id}`;
    try {
      await deleteDoc(doc(db, path));
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const clearAll = async () => {
    if (!store?.id) return;
    const path = `stores/${store.id}/notifications`;
    try {
      const batch = writeBatch(db);
      notifications.forEach(n => {
        batch.delete(doc(db, path, n.id));
      });
      await batch.commit();
    } catch (error) {
      handleFirestoreError(error, OperationType.DELETE, path);
    }
  };

  const createNotification = async (data: Omit<StoreNotification, 'id' | 'createdAt' | 'read'>) => {
    if (!store?.id) return;
    const path = `stores/${store.id}/notifications`;
    try {
      await addDoc(collection(db, path), {
        ...data,
        read: false,
        createdAt: new Date().toISOString(),
        createdBy: user?.email || 'system'
      });
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, path);
    }
  };

  const broadcastSystemUpdate = async (title: string, message: string, severity: NotificationSeverity = 'info') => {
    await createNotification({
      title,
      message,
      type: 'system_update',
      severity,
      link: '/dashboard',
      metadata: { updateVersion: 'v2.4.0', broadcastAt: new Date().toISOString() }
    });
  };

  return (
    <NotificationContext.Provider value={{
      notifications,
      unreadCount,
      toastNotification,
      dismissToast,
      markAsRead,
      markAllAsRead,
      deleteNotification,
      clearAll,
      createNotification,
      broadcastSystemUpdate
    }}>
      {children}
    </NotificationContext.Provider>
  );
}

export function useNotifications() {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotifications must be used within a NotificationProvider');
  }
  return context;
}
