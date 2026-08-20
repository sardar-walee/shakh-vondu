import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Sale } from '../types';

interface OfflineContextType {
  isOnline: boolean;
  pendingOfflineSales: Sale[];
  queueOfflineSale: (sale: Sale) => void;
  syncOfflineData: () => Promise<void>;
  clearOfflineQueue: () => void;
  lastSyncedAt: string | null;
}

const OfflineContext = createContext<OfflineContextType | undefined>(undefined);

const OFFLINE_QUEUE_KEY = 'mobistore_offline_sales_queue';
const LAST_SYNC_KEY = 'mobistore_last_sync_timestamp';

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isOnline, setIsOnline] = useState<boolean>(navigator.onLine);
  const [pendingOfflineSales, setPendingOfflineSales] = useState<Sale[]>(() => {
    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [lastSyncedAt, setLastSyncedAt] = useState<string | null>(() => {
    return localStorage.getItem(LAST_SYNC_KEY) || new Date().toISOString();
  });

  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      // Auto sync when coming back online
      syncOfflineData();
    };

    const handleOffline = () => {
      setIsOnline(false);
    };

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Save pending sales queue to LocalStorage
  useEffect(() => {
    try {
      localStorage.setItem(OFFLINE_QUEUE_KEY, JSON.stringify(pendingOfflineSales));
    } catch (e) {
      console.error('Failed to save offline sales queue:', e);
    }
  }, [pendingOfflineSales]);

  const queueOfflineSale = (sale: Sale) => {
    const offlineSale = {
      ...sale,
      id: sale.id || `offline_sale_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`,
      isOffline: true,
      createdAt: sale.createdAt || new Date().toISOString()
    };

    setPendingOfflineSales((prev) => [...prev, offlineSale]);
  };

  const syncOfflineData = async () => {
    if (!navigator.onLine) return;

    try {
      const stored = localStorage.getItem(OFFLINE_QUEUE_KEY);
      const queue: Sale[] = stored ? JSON.parse(stored) : [];

      if (queue.length === 0) return;

      console.log(`[Offline Sync] Syncing ${queue.length} offline transactions to cloud database...`);

      // Simulated background sync payload dispatch
      await new Promise((resolve) => setTimeout(resolve, 1200));

      setPendingOfflineSales([]);
      localStorage.removeItem(OFFLINE_QUEUE_KEY);

      const now = new Date().toISOString();
      setLastSyncedAt(now);
      localStorage.setItem(LAST_SYNC_KEY, now);

      console.log('[Offline Sync] Synchronization completed successfully.');
    } catch (err) {
      console.error('[Offline Sync] Sync failed:', err);
    }
  };

  const clearOfflineQueue = () => {
    setPendingOfflineSales([]);
    localStorage.removeItem(OFFLINE_QUEUE_KEY);
  };

  return (
    <OfflineContext.Provider
      value={{
        isOnline,
        pendingOfflineSales,
        queueOfflineSale,
        syncOfflineData,
        clearOfflineQueue,
        lastSyncedAt
      }}
    >
      {children}
    </OfflineContext.Provider>
  );
};

export const useOffline = () => {
  const context = useContext(OfflineContext);
  if (!context) {
    throw new Error('useOffline must be used within an OfflineProvider');
  }
  return context;
};
