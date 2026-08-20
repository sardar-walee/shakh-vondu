import React, { createContext, useContext, useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { doc, onSnapshot } from 'firebase/firestore';
import { useAuth } from './AuthContext';

interface StoreContextType {
  store: any | null;
  loading: boolean;
}

const StoreContext = createContext<StoreContextType | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { profile } = useAuth();
  const [store, setStore] = useState<any | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const storeIdToFetch = profile?.storeId || 'demo_store_01';
    
    if (storeIdToFetch) {
      const unsubscribe = onSnapshot(doc(db, 'stores', storeIdToFetch), (docSnap) => {
        if (docSnap.exists()) {
          setStore({ id: docSnap.id, ...docSnap.data() });
        } else {
          // Provide default demo store object
          setStore({
            id: storeIdToFetch,
            name: 'کۆگای شاخ ستۆر (ShakhStore HQ)',
            ownerId: profile?.uid || 'demo_owner',
            phone: '+964 750 123 4567',
            address: 'سەنتەری شاری هەولێر، بەرامبەر پارکی شانەدەر',
            subscriptionStatus: 'active',
            businessType: 'mobile',
            planId: 'pro',
            trialEndDate: new Date(Date.now() + 180 * 86400 * 1000).toISOString(),
            createdAt: new Date().toISOString()
          });
        }
        setLoading(false);
      }, (error) => {
        console.warn("Store fetch note (using active fallback store):", error);
        setStore({
          id: storeIdToFetch,
          name: 'کۆگای مۆبایلی هه‌ولێر (MobiStore HQ)',
          ownerId: profile?.uid || 'demo_owner',
          phone: '+964 750 123 4567',
          address: 'سەنتەری شاری هەولێر، بەرامبەر پارکی شانەدەر',
          subscriptionStatus: 'active',
          businessType: 'mobile',
          planId: 'pro',
          trialEndDate: new Date(Date.now() + 180 * 86400 * 1000).toISOString(),
          createdAt: new Date().toISOString()
        });
        setLoading(false);
      });
      return () => unsubscribe();
    } else {
      setStore({
        id: 'demo_store_01',
        name: 'کۆگای مۆبایلی هه‌ولێر (MobiStore HQ)',
        ownerId: 'demo_owner',
        phone: '+964 750 123 4567',
        address: 'سەنتەری شاری هەولێر، بەرامبەر پارکی شانەدەر',
        subscriptionStatus: 'active',
        businessType: 'mobile',
        planId: 'pro',
        trialEndDate: new Date(Date.now() + 180 * 86400 * 1000).toISOString(),
        createdAt: new Date().toISOString()
      });
      setLoading(false);
    }
  }, [profile]);

  return (
    <StoreContext.Provider value={{ store, loading }}>
      {children}
    </StoreContext.Provider>
  );
};

export const useStore = () => {
  const context = useContext(StoreContext);
  if (context === undefined) {
    throw new Error('useStore must be used within a StoreProvider');
  }
  return context;
};
