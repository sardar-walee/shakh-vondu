import React, { createContext, useContext, useEffect, useState } from 'react';
import { auth, db } from '../lib/firebase';
import { onAuthStateChanged, User, signInAnonymously } from 'firebase/auth';
import { doc, onSnapshot } from 'firebase/firestore';

interface AuthContextType {
  user: User | null;
  profile: any | null;
  loading: boolean;
  signOut: () => Promise<void>;
  updateProfileState: (newProfile: any) => void;
  ensureAuthUser: () => Promise<User | null>;
  loginWithDemo: (role: 'superadmin' | 'owner' | 'customer' | 'employee', customEmail?: string) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<any | null>(() => {
    try {
      const stored = localStorage.getItem('mobistore_user_profile');
      return stored ? JSON.parse(stored) : null;
    } catch (e) {
      return null;
    }
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let unsubProfile: (() => void) | null = null;

    const unsubscribe = onAuthStateChanged(auth, (authUser) => {
      setUser(authUser);
      if (authUser) {
        const docRef = doc(db, 'users', authUser.uid);
        unsubProfile = onSnapshot(docRef, (docSnap) => {
          if (docSnap.exists()) {
            const data = docSnap.data();
            if (authUser.email?.toLowerCase() === 'shakh8002@gmail.com' || data.email?.toLowerCase() === 'shakh8002@gmail.com') {
              data.role = 'superadmin';
            }
            setProfile(data);
            localStorage.setItem('mobistore_user_profile', JSON.stringify(data));
          } else {
            // Check local fallback
            const stored = localStorage.getItem('mobistore_user_profile');
            if (stored) {
              try { 
                const parsed = JSON.parse(stored);
                if (authUser.email?.toLowerCase() === 'shakh8002@gmail.com' || parsed.email?.toLowerCase() === 'shakh8002@gmail.com') {
                  parsed.role = 'superadmin';
                }
                setProfile(parsed);
              } catch (e) { setProfile(null); }
            }
          }
          setLoading(false);
        }, (error) => {
          console.warn("Profile snapshot error:", error);
          setLoading(false);
        });
      } else {
        if (unsubProfile) unsubProfile();
        const stored = localStorage.getItem('mobistore_user_profile');
        if (stored) {
          try { 
            const parsed = JSON.parse(stored);
            if (parsed.email?.toLowerCase() === 'shakh8002@gmail.com') {
              parsed.role = 'superadmin';
            }
            setProfile(parsed);
          } catch (e) { setProfile(null); }
        }
        setLoading(false);
      }
    });

    return () => {
      unsubscribe();
      if (unsubProfile) unsubProfile();
    };
  }, []);

  const updateProfileState = (newProfile: any) => {
    if (newProfile && (newProfile.email?.toLowerCase() === 'shakh8002@gmail.com' || auth.currentUser?.email?.toLowerCase() === 'shakh8002@gmail.com')) {
      newProfile.role = 'superadmin';
    }
    setProfile(newProfile);
    localStorage.setItem('mobistore_user_profile', JSON.stringify(newProfile));
  };

  const ensureAuthUser = async (): Promise<User | null> => {
    if (auth.currentUser) return auth.currentUser;
    try {
      const cred = await signInAnonymously(auth);
      return cred.user;
    } catch (e) {
      console.warn("Could not sign in anonymously:", e);
      return null;
    }
  };

  const loginWithDemo = async (role: 'superadmin' | 'owner' | 'customer' | 'employee', customEmail?: string) => {
    let authUser = auth.currentUser;
    if (!authUser) {
      authUser = await ensureAuthUser();
    }

    const emailToUse = customEmail || (
      role === 'superadmin' ? 'shakh8002@gmail.com' :
      role === 'owner' ? 'owner@mobistore.com' :
      role === 'customer' ? 'customer@mobistore.com' : 'employee@mobistore.com'
    );

    const newProfile = {
      uid: authUser?.uid || `demo_${Date.now()}`,
      email: emailToUse,
      displayName: role === 'superadmin' ? 'Super Admin (Shakho)' :
                   role === 'owner' ? 'Store Owner' :
                   role === 'customer' ? 'Rbin Ahmed' : 'Store Employee',
      role: emailToUse.toLowerCase() === 'shakh8002@gmail.com' ? 'superadmin' : role,
      storeId: role === 'customer' ? '' : 'demo_store_01',
      createdAt: new Date().toISOString()
    };

    updateProfileState(newProfile);
    return newProfile;
  };

  const signOut = async () => {
    localStorage.removeItem('mobistore_user_profile');
    setProfile(null);
    await auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ user, profile, loading, signOut, updateProfileState, ensureAuthUser, loginWithDemo }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
