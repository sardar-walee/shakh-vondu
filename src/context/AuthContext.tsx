import React, { createContext, useContext, useState, useEffect } from 'react';
import { UserProfile, UserRole, ProductCategory, SellerProfile, GeoLocation } from '../types';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db, auth } from '../firebase';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from 'firebase/auth';

interface RegisterData {
  fullName: string;
  phone: string;
  email: string;
  password?: string;
  city: string;
  area: string;
  address: string;
  role: UserRole;
  storeName?: string;
  category?: ProductCategory;
  geoLocation?: GeoLocation;
}

interface AuthContextType {
  currentUser: UserProfile | null;
  sellerProfile?: SellerProfile | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; error?: string }>;
  register: (data: RegisterData) => Promise<{ success: boolean; error?: string }>;
  logout: () => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
  updateUserProfile: (data: Partial<UserProfile>) => Promise<void>;
  isSuperAdmin: boolean;
  isSeller: boolean;
  isDeliveryAgent: boolean;
  isStoreDriver: boolean;
  isCustomer: boolean;
  canManageCategory: (category: ProductCategory) => boolean;
  sellerCategory: ProductCategory | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentUser, setCurrentUser] = useState<UserProfile | null>(() => {
    const saved = localStorage.getItem('shakh_current_user');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        console.error('Error parsing stored user', e);
      }
    }
    return null;
  });

  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (currentUser) {
      localStorage.setItem('shakh_current_user', JSON.stringify(currentUser));
    } else {
      localStorage.removeItem('shakh_current_user');
    }
  }, [currentUser]);

  // Sync with Firebase Auth state
  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, async (firebaseUser) => {
      if (firebaseUser) {
        try {
          const userDocRef = doc(db, 'users', firebaseUser.uid);
          const docSnap = await getDoc(userDocRef);
          if (docSnap.exists()) {
            setCurrentUser(docSnap.data() as UserProfile);
          } else {
            // Create user doc if auth exists but no doc
            const newUser: UserProfile = {
              id: firebaseUser.uid,
              email: firebaseUser.email || '',
              fullName: firebaseUser.displayName || firebaseUser.email?.split('@')[0] || 'بەکارهێنەر',
              phone: firebaseUser.phoneNumber || '',
              city: 'Erbil (هەولێر)',
              area: 'Center',
              address: '',
              role: firebaseUser.email === 'shakh8002@gmail.com' ? 'admin' : 'customer',
              isVerified: true,
              createdAt: new Date().toISOString()
            };
            await setDoc(userDocRef, newUser);
            setCurrentUser(newUser);
          }
        } catch (e) {
          console.error('Firebase user doc fetch error:', e);
        }
      }
      setIsLoading(false);
    });

    return () => unsubscribe();
  }, []);

  // Handle Supabase Auth state if configured
  useEffect(() => {
    if (!isSupabaseConfigured) return;

    const checkSession = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              phone: profile.phone,
              avatarUrl: profile.avatar_url,
              city: profile.city,
              area: profile.area,
              address: profile.address,
              role: profile.role as UserRole,
              isVerified: profile.is_verified,
              isBlocked: profile.is_blocked,
              createdAt: profile.created_at
            });
          }
        }
      } catch (err) {
        console.error('Supabase auth session error:', err);
      }
    };

    checkSession();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user) {
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (profile) {
          setCurrentUser({
            id: profile.id,
            email: profile.email,
            fullName: profile.full_name,
            phone: profile.phone,
            avatarUrl: profile.avatar_url,
            city: profile.city,
            area: profile.area,
            address: profile.address,
            role: profile.role as UserRole,
            isVerified: profile.is_verified,
            isBlocked: profile.is_blocked,
            createdAt: profile.created_at
          });
        }
      } else if (event === 'SIGNED_OUT') {
        setCurrentUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  const login = async (email: string, password?: string): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      // 1. Try Firebase Auth if password provided
      if (password && password.length >= 6) {
        try {
          const cred = await signInWithEmailAndPassword(auth, email, password);
          if (cred.user) {
            const userDocRef = doc(db, 'users', cred.user.uid);
            const docSnap = await getDoc(userDocRef);
            if (docSnap.exists()) {
              const profile = docSnap.data() as UserProfile;
              setCurrentUser(profile);
              return { success: true };
            }
          }
        } catch (firebaseErr: any) {
          console.log('Firebase auth attempt:', firebaseErr.message);
        }
      }

      // 2. Try Supabase Auth
      if (isSupabaseConfigured && password) {
        const { data, error } = await supabase.auth.signInWithPassword({
          email,
          password
        });
        if (error) {
          return { success: false, error: error.message };
        }
        if (data.user) {
          const { data: profile } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', data.user.id)
            .single();

          if (profile) {
            setCurrentUser({
              id: profile.id,
              email: profile.email,
              fullName: profile.full_name,
              phone: profile.phone,
              avatarUrl: profile.avatar_url,
              city: profile.city,
              area: profile.area,
              address: profile.address,
              role: profile.role as UserRole,
              isVerified: profile.is_verified,
              isBlocked: profile.is_blocked,
              createdAt: profile.created_at
            });
            return { success: true };
          }
        }
      }

      // 3. Super Admin account check
      if (email.toLowerCase() === 'shakh8002@gmail.com') {
        const adminId = auth.currentUser?.uid || 'admin-shakh';
        const adminUser: UserProfile = {
          id: adminId,
          email: 'shakh8002@gmail.com',
          fullName: 'سووپەر ئەدمینی شاخی (Super Admin)',
          phone: '07504796924',
          city: 'Bardarash (بەردەڕەش)',
          area: 'ناو بازاڕ',
          address: 'بەردەڕەش ناو بازاڕ',
          role: 'admin',
          isVerified: true,
          createdAt: new Date().toISOString()
        };
        setCurrentUser(adminUser);
        try {
          await setDoc(doc(db, 'users', adminUser.id), adminUser, { merge: true });
        } catch (e) {}
        return { success: true };
      }

      return { success: false, error: 'ئیمەیڵ یان وشەی تێپەڕ هەڵەیە، تکایە سەرەتا خۆت تۆمار بکە.' };
    } catch (err: any) {
      return { success: false, error: err.message || 'هەڵەیەک لە چوونەژوورەوە ڕوویدا' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (data: RegisterData): Promise<{ success: boolean; error?: string }> => {
    setIsLoading(true);
    try {
      let registeredUserId = `user-${Date.now()}`;

      // Firebase Auth create
      if (data.password && data.password.length >= 6) {
        try {
          const cred = await createUserWithEmailAndPassword(auth, data.email, data.password);
          if (cred.user) {
            registeredUserId = cred.user.uid;
          }
        } catch (e: any) {
          console.log('Firebase signup notice:', e.message);
        }
      }

      // Supabase Auth create
      if (isSupabaseConfigured && data.password) {
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: data.email,
          password: data.password,
          options: {
            data: {
              full_name: data.fullName,
              phone: data.phone,
              role: data.role,
              city: data.city,
              area: data.area,
              address: data.address
            }
          }
        });

        if (authError) {
          return { success: false, error: authError.message };
        }

        if (authData.user) {
          registeredUserId = authData.user.id;
          await supabase.from('profiles').insert([
            {
              id: registeredUserId,
              email: data.email,
              full_name: data.fullName,
              phone: data.phone,
              city: data.city,
              area: data.area,
              address: data.address,
              role: data.role
            }
          ]);
        }
      }

      const profile: UserProfile = {
        id: registeredUserId,
        email: data.email,
        fullName: data.fullName,
        phone: data.phone,
        city: data.city,
        area: data.area,
        address: data.address,
        role: data.role,
        category: data.category,
        geoLocation: data.geoLocation,
        isVerified: true,
        createdAt: new Date().toISOString()
      };

      // Save to Firestore users collection
      try {
        await setDoc(doc(db, 'users', profile.id), profile);
      } catch (e) {
        console.log('Firestore user write error:', e);
      }

      setCurrentUser(profile);
      return { success: true };
    } catch (err: any) {
      return { success: false, error: err.message || 'تۆمارکردن سەرکەوتوو نەبوو' };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      await signOut(auth);
    } catch (err) {}
    if (isSupabaseConfigured) {
      try {
        await supabase.auth.signOut();
      } catch (err) {
        console.error('Sign out error', err);
      }
    }
    setCurrentUser(null);
    localStorage.removeItem('shakh_current_user');
  };

  const updateProfile = async (data: Partial<UserProfile>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);

    try {
      await updateDoc(doc(db, 'users', currentUser.id), data);
    } catch (e) {}

    if (isSupabaseConfigured) {
      await supabase.from('profiles').update({
        full_name: updated.fullName,
        phone: updated.phone,
        city: updated.city,
        area: updated.area,
        address: updated.address,
        avatar_url: updated.avatarUrl
      }).eq('id', currentUser.id);
    }
  };

  const updateUserProfile = updateProfile;

  const isSuperAdmin = currentUser?.role === 'admin' || currentUser?.email === 'shakh8002@gmail.com';
  
  const roleToCategoryMap: Partial<Record<UserRole, ProductCategory>> = {
    restaurant_owner: 'food',
    market_owner: 'market',
    clothes_seller: 'clothes',
    fruits_vegetables_seller: 'fruits_vegetables',
    fresh_meat_seller: 'fresh_meat',
    dairy_seller: 'dairy',
    electronics_seller: 'electronics',
    beauty_seller: 'beauty',
    car_seller: 'cars'
  };

  const sellerCategory = currentUser?.role ? roleToCategoryMap[currentUser.role] || null : null;
  const isSeller = Boolean(sellerCategory);

  const sellerProfile: SellerProfile | null = (currentUser && isSeller)
    ? {
        id: `store-${currentUser.id}`,
        userId: currentUser.id,
        storeName: currentUser.storeName || currentUser.fullName || 'فرۆشگا',
        slug: `store-${currentUser.id}`,
        category: sellerCategory!,
        description: 'فرۆشگای فەرمی لە شاخی',
        logoUrl: currentUser.avatarUrl || 'https://images.unsplash.com/photo-1577219491135-ce391730fb2c?w=150',
        coverUrl: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=800',
        rating: 5.0,
        totalReviews: 0,
        totalSales: 0,
        city: currentUser.city || 'Erbil (هەولێر)',
        address: currentUser.address || 'ناوبازاڕ',
        phone: currentUser.phone || '07501234567',
        isOpen: true,
        isVerified: currentUser.isVerified ?? true,
        commissionRate: 10,
        createdAt: currentUser.createdAt || new Date().toISOString()
      }
    : null;

  const canManageCategory = (category: ProductCategory): boolean => {
    if (isSuperAdmin) return true;
    if (!currentUser) return false;
    return sellerCategory === category;
  };

  const isDeliveryAgent = currentUser?.role === 'delivery_agent';
  const isStoreDriver = currentUser?.role === 'store_driver';
  const isCustomer = currentUser?.role === 'customer' || !currentUser;

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        sellerProfile,
        isAuthenticated: Boolean(currentUser),
        isLoading,
        login,
        register,
        logout,
        updateProfile,
        updateUserProfile,
        isSuperAdmin,
        isSeller,
        isDeliveryAgent,
        isStoreDriver,
        isCustomer,
        canManageCategory,
        sellerCategory
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};
