import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { db } from '../lib/firebase';
import { 
  collection, 
  doc, 
  onSnapshot, 
  query, 
  orderBy, 
  setDoc, 
  deleteDoc,
  limit 
} from 'firebase/firestore';
import { useAuth } from './AuthContext';
import { useStore } from './StoreContext';
import { 
  BackupConfig, 
  BackupSnapshot, 
  FullStoreBackupData, 
  ExportFilterOptions, 
  Product, 
  Sale, 
  Customer, 
  Supplier, 
  SupplierReturn 
} from '../types';
import { 
  DEFAULT_BACKUP_CONFIG, 
  calculateNextBackupDate, 
  createAndSaveSnapshot, 
  fetchFullStoreData, 
  convertProductsToCSV, 
  convertSalesToCSV, 
  convertCustomersToCSV, 
  convertSuppliersToCSV, 
  convertSupplierReturnsToCSV, 
  triggerBrowserDownload, 
  validateBackupJSON 
} from '../lib/backupService';
import { handleFirestoreError, OperationType } from '../lib/auditService';

interface BackupContextType {
  config: BackupConfig;
  snapshots: BackupSnapshot[];
  loading: boolean;
  isExporting: boolean;
  exportProgress: string | null;
  updateConfig: (newConfig: Partial<BackupConfig>) => Promise<void>;
  createManualSnapshot: (format?: 'json' | 'csv_bundle', notes?: string) => Promise<BackupSnapshot>;
  exportFullBackup: (format: 'json' | 'csv_bundle') => Promise<void>;
  exportCollection: (collectionName: 'products' | 'sales' | 'customers' | 'suppliers' | 'supplierReturns', format: 'csv' | 'json', dateRange?: string) => Promise<void>;
  deleteSnapshot: (snapshotId: string) => Promise<void>;
  downloadSnapshotAgain: (snapshot: BackupSnapshot) => Promise<void>;
}

const BackupContext = createContext<BackupContextType | undefined>(undefined);

export const BackupProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, profile } = useAuth();
  const { store } = useStore();

  const [config, setConfig] = useState<BackupConfig>(DEFAULT_BACKUP_CONFIG);
  const [snapshots, setSnapshots] = useState<BackupSnapshot[]>([]);
  const [loading, setLoading] = useState(true);
  const [isExporting, setIsExporting] = useState(false);
  const [exportProgress, setExportProgress] = useState<string | null>(null);

  // Subscribe to Backup Config and Snapshot list
  useEffect(() => {
    if (!store?.id) {
      setLoading(false);
      return;
    }

    const configDocRef = doc(db, `stores/${store.id}/backup_config/current`);
    const unsubConfig = onSnapshot(configDocRef, (snap) => {
      if (snap.exists()) {
        setConfig({ ...DEFAULT_BACKUP_CONFIG, ...(snap.data() as BackupConfig) });
      } else {
        // Initialize default config in DB, filtering out any undefined fields
        const safeInitConfig: Record<string, any> = {};
        Object.entries(DEFAULT_BACKUP_CONFIG).forEach(([k, v]) => {
          if (v !== undefined) safeInitConfig[k] = v;
        });
        setDoc(configDocRef, safeInitConfig).catch(err => {
          console.warn('Could not initialize backup config:', err);
        });
      }
    });

    const snapshotsQuery = query(
      collection(db, `stores/${store.id}/backup_snapshots`),
      orderBy('createdAt', 'desc'),
      limit(50)
    );

    const unsubSnapshots = onSnapshot(snapshotsQuery, (snap) => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() } as BackupSnapshot));
      setSnapshots(list);
      setLoading(false);
    }, (err) => {
      console.warn('Snapshots query failed:', err);
      setLoading(false);
    });

    return () => {
      unsubConfig();
      unsubSnapshots();
    };
  }, [store?.id]);

  // Automated background scheduled backup trigger check
  useEffect(() => {
    if (!store?.id || loading || !config.isAutoBackupEnabled) return;

    const checkAndRunAutoBackup = async () => {
      const now = new Date().toISOString();
      const nextDue = config.nextScheduledBackupAt;

      // If scheduled time has arrived or was never set
      if (!nextDue || nextDue <= now) {
        try {
          console.log('[AutoBackup] Triggering automated background snapshot...');
          await createAndSaveSnapshot(store.id, 'automatic_schedule', {
            storeName: store.name,
            userId: user?.uid || 'system_cron',
            userName: 'System Auto-Scheduler',
            format: 'json',
            notes: `Automated scheduled backup (${config.frequency.toUpperCase()})`
          });
        } catch (err) {
          console.error('[AutoBackup] Failed to run automated snapshot:', err);
        }
      }
    };

    // Run check once on app mount/store load
    checkAndRunAutoBackup();
  }, [store?.id, config.isAutoBackupEnabled, config.nextScheduledBackupAt, loading]);

  const updateConfig = async (newConfig: Partial<BackupConfig>) => {
    if (!store?.id) return;
    const configDocRef = doc(db, `stores/${store.id}/backup_config/current`);
    const updated: BackupConfig = {
      ...config,
      ...newConfig,
      updatedAt: new Date().toISOString()
    };

    if (newConfig.frequency && newConfig.frequency !== config.frequency) {
      updated.nextScheduledBackupAt = calculateNextBackupDate(newConfig.frequency);
    }

    try {
      const safeUpdated: Record<string, any> = {};
      Object.entries(updated).forEach(([k, v]) => {
        if (v !== undefined) safeUpdated[k] = v;
      });
      await setDoc(configDocRef, safeUpdated, { merge: true });
      setConfig(updated);
    } catch (err) {
      handleFirestoreError(err, OperationType.WRITE, `stores/${store.id}/backup_config/current`);
      throw err;
    }
  };

  const createManualSnapshot = async (format: 'json' | 'csv_bundle' = 'json', notes?: string): Promise<BackupSnapshot> => {
    if (!store?.id) throw new Error('Store not loaded');
    setIsExporting(true);
    setExportProgress('Compiling snapshot data from database...');

    try {
      const { snapshot, backupData } = await createAndSaveSnapshot(store.id, 'manual_full', {
        storeName: store.name,
        userId: user?.uid,
        userName: profile?.displayName || user?.email || 'Store Owner',
        format,
        notes: notes || 'Manual store snapshot triggered from dashboard'
      });

      // Automatically trigger file download for user convenience
      setExportProgress('Generating backup file...');
      const dateTag = new Date().toISOString().slice(0, 10);
      const safeStoreName = (store.name || 'mobistore').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

      if (format === 'json') {
        const jsonContent = JSON.stringify(backupData, null, 2);
        triggerBrowserDownload(
          jsonContent, 
          `${safeStoreName}_full_backup_${dateTag}.json`, 
          'application/json;charset=utf-8;'
        );
      } else {
        // CSV bundle export
        const csvContent = [
          `# MOBISTORE DATABASE BACKUP: ${store.name.toUpperCase()}`,
          `# Version: 1.0.0 | Date: ${new Date().toISOString()} | Checksum: ${backupData.checksum}`,
          `\n--- PRODUCTS CATALOG (${backupData.data.products.length} Records) ---`,
          convertProductsToCSV(backupData.data.products),
          `\n--- SALES TRANSACTIONS (${backupData.data.sales.length} Records) ---`,
          convertSalesToCSV(backupData.data.sales),
          `\n--- CUSTOMERS DIRECTORY (${backupData.data.customers.length} Records) ---`,
          convertCustomersToCSV(backupData.data.customers),
          `\n--- SUPPLIERS DIRECTORY (${backupData.data.suppliers.length} Records) ---`,
          convertSuppliersToCSV(backupData.data.suppliers),
          `\n--- SUPPLIER RETURNS RMA (${backupData.data.supplierReturns.length} Records) ---`,
          convertSupplierReturnsToCSV(backupData.data.supplierReturns),
        ].join('\r\n\r\n');

        triggerBrowserDownload(
          csvContent, 
          `${safeStoreName}_full_bundle_${dateTag}.csv`, 
          'text/csv;charset=utf-8;'
        );
      }

      return snapshot;
    } catch (err) {
      console.error('Snapshot failed:', err);
      throw err;
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const exportFullBackup = async (format: 'json' | 'csv_bundle') => {
    await createManualSnapshot(format);
  };

  const exportCollection = async (
    collectionName: 'products' | 'sales' | 'customers' | 'suppliers' | 'supplierReturns',
    format: 'csv' | 'json',
    dateRange?: string
  ) => {
    if (!store?.id) return;
    setIsExporting(true);
    setExportProgress(`Exporting ${collectionName} records...`);

    try {
      const fullData = await fetchFullStoreData(store.id, store.name, user?.email || 'admin');
      const dateTag = new Date().toISOString().slice(0, 10);
      const safeStoreName = (store.name || 'mobistore').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

      let content = '';
      let filename = `${safeStoreName}_${collectionName}_${dateTag}.${format}`;
      let mimeType = format === 'json' ? 'application/json;charset=utf-8;' : 'text/csv;charset=utf-8;';

      if (format === 'json') {
        const payload = {
          collection: collectionName,
          storeId: store.id,
          storeName: store.name,
          exportedAt: new Date().toISOString(),
          recordCount: (fullData.data as any)[collectionName]?.length || 0,
          records: (fullData.data as any)[collectionName] || []
        };
        content = JSON.stringify(payload, null, 2);
      } else {
        // CSV Format
        if (collectionName === 'products') {
          content = convertProductsToCSV(fullData.data.products);
        } else if (collectionName === 'sales') {
          content = convertSalesToCSV(fullData.data.sales);
        } else if (collectionName === 'customers') {
          content = convertCustomersToCSV(fullData.data.customers);
        } else if (collectionName === 'suppliers') {
          content = convertSuppliersToCSV(fullData.data.suppliers);
        } else if (collectionName === 'supplierReturns') {
          content = convertSupplierReturnsToCSV(fullData.data.supplierReturns);
        }
      }

      triggerBrowserDownload(content, filename, mimeType);
    } catch (err) {
      console.error('Failed to export collection:', err);
      throw err;
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const downloadSnapshotAgain = async (snapshot: BackupSnapshot) => {
    if (!store?.id) return;
    setIsExporting(true);
    setExportProgress('Regenerating snapshot file...');
    try {
      const fullData = await fetchFullStoreData(store.id, store.name, user?.email || 'admin');
      const dateTag = new Date(snapshot.createdAt).toISOString().slice(0, 10);
      const safeStoreName = (store.name || 'mobistore').replace(/[^a-zA-Z0-9_-]/g, '_').toLowerCase();

      if (snapshot.format === 'json') {
        const jsonContent = JSON.stringify(fullData, null, 2);
        triggerBrowserDownload(
          jsonContent, 
          `${safeStoreName}_snapshot_${snapshot.snapshotNumber}_${dateTag}.json`, 
          'application/json;charset=utf-8;'
        );
      } else {
        const csvContent = [
          `# MOBISTORE SNAPSHOT: ${snapshot.snapshotNumber}`,
          `# Checksum: ${snapshot.checksum} | Records: ${snapshot.totalRecords}`,
          `\n--- PRODUCTS ---`,
          convertProductsToCSV(fullData.data.products),
          `\n--- SALES ---`,
          convertSalesToCSV(fullData.data.sales),
          `\n--- CUSTOMERS ---`,
          convertCustomersToCSV(fullData.data.customers),
        ].join('\r\n\r\n');

        triggerBrowserDownload(
          csvContent, 
          `${safeStoreName}_snapshot_${snapshot.snapshotNumber}_${dateTag}.csv`, 
          'text/csv;charset=utf-8;'
        );
      }
    } finally {
      setIsExporting(false);
      setExportProgress(null);
    }
  };

  const deleteSnapshot = async (snapshotId: string) => {
    if (!store?.id) return;
    const docRef = doc(db, `stores/${store.id}/backup_snapshots/${snapshotId}`);
    try {
      await deleteDoc(docRef);
    } catch (err) {
      handleFirestoreError(err, OperationType.DELETE, `stores/${store.id}/backup_snapshots/${snapshotId}`);
    }
  };

  return (
    <BackupContext.Provider value={{
      config,
      snapshots,
      loading,
      isExporting,
      exportProgress,
      updateConfig,
      createManualSnapshot,
      exportFullBackup,
      exportCollection,
      deleteSnapshot,
      downloadSnapshotAgain
    }}>
      {children}
    </BackupContext.Provider>
  );
};

export const useBackup = () => {
  const context = useContext(BackupContext);
  if (!context) {
    throw new Error('useBackup must be used within a BackupProvider');
  }
  return context;
};
