import React, { createContext, useContext, useState, useEffect } from 'react';
import {
  Product,
  SellerProfile,
  CarAd,
  Order,
  OrderStatus,
  CommissionTransaction,
  SellerWallet,
  CarPayment,
  CarPackageType,
  PaymentMethod,
  Review,
  ProductCategory,
  DriverStats,
  ShakhPointsAgreement,
  UserPointsWallet,
  PointsTransaction,
  AgreementTier,
  UserRole,
  UserFeedback,
  GeoLocation,
  StoreDriver,
  DeliveryMode,
  OccasionBanner
} from '../types';
import { CAR_PACKAGES } from '../data/seedData';
import { DEFAULT_MAWLID_BANNER } from '../data/occasionPresets';
import { useAuth } from './AuthContext';
import { useNotification } from './NotificationContext';
import { supabase, isSupabaseConfigured } from '../lib/supabase';
import { db } from '../firebase';
import {
  collection,
  doc,
  setDoc,
  updateDoc,
  deleteDoc,
  onSnapshot,
  getDocs
} from 'firebase/firestore';

interface MarketplaceContextType {
  products: Product[];
  sellers: SellerProfile[];
  carAds: CarAd[];
  orders: Order[];
  commissionTransactions: CommissionTransaction[];
  sellerWallets: Record<string, SellerWallet>;
  carPayments: CarPayment[];
  reviews: Review[];
  favoriteProductIds: string[];
  favoriteSellerIds: string[];

  // Product Actions
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => Promise<{ success: boolean; error?: string }>;
  updateProduct: (id: string, updates: Partial<Product>) => Promise<{ success: boolean; error?: string }>;
  deleteProduct: (id: string) => Promise<{ success: boolean; error?: string }>;

  // Seller Actions
  updateSellerProfile: (sellerId: string, updates: Partial<SellerProfile>) => Promise<void>;
  updateSellerCommissionRate: (sellerId: string, newRate: number) => Promise<void>;
  updateSellerCommission: (sellerId: string, newRate: number) => Promise<void>;
  toggleSellerVerification: (sellerId: string) => Promise<void>;
  updateSellerDeliveryZone: (sellerId: string, zoneSettings: Partial<SellerProfile['deliveryZone']>) => Promise<void>;
  updateStoreDeliverySettings: (sellerId: string, settings: {
    deliveryMode?: DeliveryMode;
    storeDeliveryFee?: number;
    storeFreeDeliveryOver?: number;
    storeDeliveryTimeMin?: number;
  }) => Promise<void>;
  addStoreDriver: (sellerId: string, driver: Omit<StoreDriver, 'id'>) => Promise<{ success: boolean; driverId?: string }>;
  updateStoreDriver: (sellerId: string, driverId: string, updates: Partial<StoreDriver>) => Promise<void>;
  deleteStoreDriver: (sellerId: string, driverId: string) => Promise<void>;
  assignStoreDriverToOrder: (orderId: string, driverId: string, driverName: string, driverPhone: string, vehicleType?: string) => Promise<void>;

  // Order Actions
  createOrder: (orderData: {
    items: Order['items'];
    subtotal: number;
    deliveryFee: number;
    deliveryDistanceKm?: number;
    deliveryZoneStatus?: 'within_radius' | 'custom_distance' | 'out_of_range';
    total: number;
    paymentMethod: PaymentMethod;
    customerNotes?: string;
    deliveryAddress?: string;
    deliveryCity?: string;
    deliveryGeoLocation?: GeoLocation;
    deliveryMode?: DeliveryMode;
    isStoreDelivery?: boolean;
  }) => Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<{ success: boolean; error?: string }>;
  assignDeliveryAgent: (orderId: string, agentId: string, agentName: string, agentPhone: string) => Promise<void>;
  assignDriverToOrder: (orderId: string, driverId: string, driverName: string, driverPhone?: string) => Promise<void>;

  // Car Actions
  createCarAd: (adData: Omit<CarAd, 'id' | 'createdAt' | 'paymentStatus' | 'adStatus'>) => Promise<{ success: boolean; adId?: string; error?: string }>;
  postCarAd: (adData: Omit<CarAd, 'id' | 'createdAt' | 'paymentStatus' | 'adStatus'>) => Promise<{ success: boolean; adId?: string; error?: string }>;
  processCarPayment: (adId: string, packageType: CarPackageType, paymentMethod: PaymentMethod) => Promise<{ success: boolean; txRef?: string; error?: string }>;
  updateCarAdStatus: (adId: string, status: CarAd['adStatus']) => Promise<void>;

  // Reviews & Favorites
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  submitOrderReview: (params: {
    orderId: string;
    orderNumber: string;
    sellerReview?: {
      sellerId: string;
      sellerName: string;
      rating: number;
      comment: string;
      tags?: string[];
    };
    driverReview?: {
      driverId: string;
      driverName: string;
      rating: number;
      comment: string;
      tags?: string[];
    };
  }) => Promise<{ success: boolean; message?: string }>;
  replyToReview: (reviewId: string, replyText: string, replierRole: 'seller' | 'driver' | 'admin') => Promise<void>;
  deleteReview: (reviewId: string) => Promise<void>;
  getSellerReviews: (sellerId: string) => Review[];
  getDriverReviews: (driverId: string) => Review[];
  getProductReviews: (productId: string) => Review[];
  toggleFavoriteProduct: (productId: string) => void;
  toggleFavoriteSeller: (sellerId: string) => void;

  // Shakh & Business Owner Points Agreement & Role Points System
  shakhAgreements: ShakhPointsAgreement[];
  pointsTransactions: PointsTransaction[];
  getSellerAgreement: (sellerId: string) => ShakhPointsAgreement;
  updateSellerAgreement: (sellerId: string, agreementData: Partial<ShakhPointsAgreement>) => void;
  getUserPointsWallet: (userId: string, role?: UserRole) => UserPointsWallet;
  getUserPointsHistory: (userId: string) => PointsTransaction[];
  redeemPoints: (userId: string, pointsToRedeem: number, rewardDescription: string, role?: UserRole) => { success: boolean; message: string };

  // User Feedbacks & Project Improvement Suggestions
  userFeedbacks: UserFeedback[];
  submitUserFeedback: (feedback: Omit<UserFeedback, 'id' | 'createdAt' | 'status'>) => Promise<{ success: boolean; message: string }>;
  updateFeedbackStatus: (feedbackId: string, status: UserFeedback['status'], adminResponse?: string) => Promise<void>;

  // Occasions and Mawlid Banner
  occasionBanner: OccasionBanner;
  updateOccasionBanner: (banner: OccasionBanner) => Promise<void>;
  incrementSalawatCount: () => Promise<void>;

  // Filter Helpers
  getProductsByCategory: (category: ProductCategory) => Product[];
  getSellerProducts: (sellerId: string) => Product[];
  getSellerOrders: (sellerId: string) => Order[];
  getCustomerOrders: (customerId: string) => Order[];
  getDeliveryOrders: (agentId?: string) => Order[];
  getSellerWallet: (sellerId: string) => SellerWallet;
  driverStatsMap: Record<string, DriverStats>;
  getDriverStats: (driverId: string) => DriverStats;

  // Global Analytics for Super Admin
  platformStats: {
    totalGrossMerchandiseValue: number;
    totalShakhCommission: number;
    totalCarAdRevenue: number;
    totalOrdersCount: number;
    activeOrdersCount: number;
    totalSellersCount: number;
    totalProductsCount: number;
    totalCarAdsCount: number;
  };
  purgeAllDemoData: () => Promise<{ success: boolean; message: string }>;
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isSuperAdmin, sellerCategory } = useAuth();
  const { addNotification } = useNotification();

  // State initialization - load from local cache if present while Firestore live listener syncs
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('shakh_products');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [sellers, setSellers] = useState<SellerProfile[]>(() => {
    const saved = localStorage.getItem('shakh_sellers');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [carAds, setCarAds] = useState<CarAd[]>(() => {
    const saved = localStorage.getItem('shakh_car_ads');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });
  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('shakh_orders');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  const [commissionTransactions, setCommissionTransactions] = useState<CommissionTransaction[]>(() => {
    const saved = localStorage.getItem('shakh_commissions');
    return saved ? JSON.parse(saved) : [];
  });

  const [sellerWallets, setSellerWallets] = useState<Record<string, SellerWallet>>(() => {
    const saved = localStorage.getItem('shakh_wallets');
    return saved ? JSON.parse(saved) : {};
  });

  const [carPayments, setCarPayments] = useState<CarPayment[]>(() => {
    const saved = localStorage.getItem('shakh_car_payments');
    return saved ? JSON.parse(saved) : [];
  });

  const [reviews, setReviews] = useState<Review[]>([]);

  // Clear any legacy demo data cached in local storage on startup
  useEffect(() => {
    try {
      const keysToCheck = ['shakh_products', 'shakh_sellers', 'shakh_car_ads', 'shakh_orders', 'shakh_reviews'];
      keysToCheck.forEach(key => {
        const item = localStorage.getItem(key);
        if (item && (item.includes('prod-food-1') || item.includes('store-rest-1') || item.includes('car-ad-1') || item.includes('ORD-8821'))) {
          localStorage.removeItem(key);
        }
      });
    } catch (e) {}
  }, []);

  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('shakh_fav_products');
    return saved ? JSON.parse(saved) : [];
  });

  const [favoriteSellerIds, setFavoriteSellerIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('shakh_fav_sellers');
    return saved ? JSON.parse(saved) : [];
  });

  const [driverStatsMap, setDriverStatsMap] = useState<Record<string, DriverStats>>(() => {
    const saved = localStorage.getItem('shakh_driver_stats');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  // Shakh & Business Owner Points Agreements
  const [shakhAgreements, setShakhAgreements] = useState<ShakhPointsAgreement[]>(() => {
    const saved = localStorage.getItem('shakh_agreements');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // User Points Wallets
  const [userPointsWallets, setUserPointsWallets] = useState<Record<string, UserPointsWallet>>(() => {
    const saved = localStorage.getItem('shakh_user_points');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return {};
  });

  // Points Ledger Transactions
  const [pointsTransactions, setPointsTransactions] = useState<PointsTransaction[]>(() => {
    const saved = localStorage.getItem('shakh_points_ledger');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // User Feedback & Suggestions State
  const [userFeedbacks, setUserFeedbacks] = useState<UserFeedback[]>(() => {
    const saved = localStorage.getItem('shakh_user_feedbacks');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return [];
  });

  // Occasions & Mawlid Banner State
  const [occasionBanner, setOccasionBanner] = useState<OccasionBanner>(() => {
    const saved = localStorage.getItem('shakh_occasion_banner');
    if (saved) {
      try { return JSON.parse(saved); } catch (e) {}
    }
    return DEFAULT_MAWLID_BANNER;
  });

  // Sync to local storage
  useEffect(() => { localStorage.setItem('shakh_products', JSON.stringify(products)); }, [products]);
  useEffect(() => { localStorage.setItem('shakh_sellers', JSON.stringify(sellers)); }, [sellers]);
  useEffect(() => { localStorage.setItem('shakh_car_ads', JSON.stringify(carAds)); }, [carAds]);
  useEffect(() => { localStorage.setItem('shakh_orders', JSON.stringify(orders)); }, [orders]);
  useEffect(() => { localStorage.setItem('shakh_commissions', JSON.stringify(commissionTransactions)); }, [commissionTransactions]);
  useEffect(() => { localStorage.setItem('shakh_wallets', JSON.stringify(sellerWallets)); }, [sellerWallets]);
  useEffect(() => { localStorage.setItem('shakh_car_payments', JSON.stringify(carPayments)); }, [carPayments]);
  useEffect(() => { localStorage.setItem('shakh_reviews', JSON.stringify(reviews)); }, [reviews]);
  useEffect(() => { localStorage.setItem('shakh_fav_products', JSON.stringify(favoriteProductIds)); }, [favoriteProductIds]);
  useEffect(() => { localStorage.setItem('shakh_fav_sellers', JSON.stringify(favoriteSellerIds)); }, [favoriteSellerIds]);
  useEffect(() => { localStorage.setItem('shakh_driver_stats', JSON.stringify(driverStatsMap)); }, [driverStatsMap]);
  useEffect(() => { localStorage.setItem('shakh_agreements', JSON.stringify(shakhAgreements)); }, [shakhAgreements]);
  useEffect(() => { localStorage.setItem('shakh_user_points', JSON.stringify(userPointsWallets)); }, [userPointsWallets]);
  useEffect(() => { localStorage.setItem('shakh_points_ledger', JSON.stringify(pointsTransactions)); }, [pointsTransactions]);
  useEffect(() => { localStorage.setItem('shakh_user_feedbacks', JSON.stringify(userFeedbacks)); }, [userFeedbacks]);
  useEffect(() => { localStorage.setItem('shakh_occasion_banner', JSON.stringify(occasionBanner)); }, [occasionBanner]);

  // Firebase Firestore Real-Time Subscriptions
  useEffect(() => {
    let unsubProducts: () => void;
    let unsubSellers: () => void;
    let unsubOrders: () => void;
    let unsubCars: () => void;
    let unsubReviews: () => void;
    let unsubFeedbacks: () => void;

    const setupFirestoreSync = async () => {
      try {
        // 1. Products Listener
        const prodCol = collection(db, 'products');
        unsubProducts = onSnapshot(
          prodCol,
          (snapshot) => {
            const list: Product[] = [];
            snapshot.forEach((docSnap) => list.push(docSnap.data() as Product));
            setProducts(list);
          },
          (err) => {
            console.warn('Products onSnapshot error:', err);
          }
        );

        // 2. Sellers Listener
        const sellersCol = collection(db, 'sellers');
        unsubSellers = onSnapshot(
          sellersCol,
          (snapshot) => {
            const list: SellerProfile[] = [];
            snapshot.forEach((docSnap) => list.push(docSnap.data() as SellerProfile));
            setSellers(list);
          },
          (err) => {
            console.warn('Sellers onSnapshot error:', err);
          }
        );

        // 3. Orders Listener
        const ordersCol = collection(db, 'orders');
        unsubOrders = onSnapshot(
          ordersCol,
          (snapshot) => {
            const list: Order[] = [];
            snapshot.forEach((docSnap) => list.push(docSnap.data() as Order));
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(list);
          },
          (err) => {
            console.warn('Orders onSnapshot error:', err);
          }
        );

        // 4. Cars Listener
        const carsCol = collection(db, 'cars');
        unsubCars = onSnapshot(
          carsCol,
          (snapshot) => {
            const list: CarAd[] = [];
            snapshot.forEach((docSnap) => list.push(docSnap.data() as CarAd));
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setCarAds(list);
          },
          (err) => {
            console.warn('Cars onSnapshot error:', err);
          }
        );

        // 5. Reviews Listener
        const reviewsCol = collection(db, 'reviews');
        unsubReviews = onSnapshot(
          reviewsCol,
          (snapshot) => {
            const list: Review[] = [];
            snapshot.forEach((docSnap) => list.push(docSnap.data() as Review));
            setReviews(list);
          },
          (err) => {
            console.warn('Reviews onSnapshot error:', err);
          }
        );

        // 6. Feedbacks Listener
        const feedbacksCol = collection(db, 'feedbacks');
        unsubFeedbacks = onSnapshot(
          feedbacksCol,
          (snapshot) => {
            const list: UserFeedback[] = [];
            snapshot.forEach((docSnap) => list.push(docSnap.data() as UserFeedback));
            setUserFeedbacks(list);
          },
          (err) => {
            console.warn('Feedbacks onSnapshot error:', err);
          }
        );

        // 7. Occasion Banner Listener
        const bannerDocRef = doc(db, 'settings', 'occasion_banner');
        onSnapshot(
          bannerDocRef,
          (docSnap) => {
            if (docSnap.exists()) {
              setOccasionBanner(docSnap.data() as OccasionBanner);
            }
          },
          (err) => console.warn('Banner onSnapshot error:', err)
        );
      } catch (err) {
        console.error('Firestore real-time sync init error:', err);
      }
    };

    setupFirestoreSync();

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubSellers) unsubSellers();
      if (unsubOrders) unsubOrders();
      if (unsubCars) unsubCars();
      if (unsubReviews) unsubReviews();
      if (unsubFeedbacks) unsubFeedbacks();
    };
  }, []);

  const updateOccasionBanner = async (newBanner: OccasionBanner) => {
    setOccasionBanner(newBanner);
    localStorage.setItem('shakh_occasion_banner', JSON.stringify(newBanner));
    try {
      await setDoc(doc(db, 'settings', 'occasion_banner'), newBanner);
    } catch (err) {
      console.warn('Failed to update occasion banner in Firestore:', err);
    }
    addNotification({
      userId: currentUser?.id || 'admin',
      type: 'system',
      title: 'بۆنە و یادەکان نوێکرایەوە 🌹',
      message: 'ڕێکخستنەکان و نوسینی بۆنەکە بە سەرکەوتوویی جێبەجێ کران.'
    });
  };

  const incrementSalawatCount = async () => {
    setOccasionBanner(prev => {
      const updated = { ...prev, salawatCount: (prev.salawatCount || 0) + 1 };
      try {
        setDoc(doc(db, 'settings', 'occasion_banner'), updated, { merge: true });
      } catch (err) {}
      return updated;
    });
  };

  // Product Management
  const addProduct = async (productData: Omit<Product, 'id' | 'createdAt'>): Promise<{ success: boolean; error?: string }> => {
    if (!currentUser) return { success: false, error: 'تکایە سەرەتا بچۆ ژوورەوە' };

    if (!isSuperAdmin && sellerCategory !== productData.category) {
      return {
        success: false,
        error: `تۆ تەنها دەتوانیت کاڵای بەشی (${sellerCategory}) بڵاوبکەیتەوە، ڕێگەپێدراو نییت بۆ بەشەکانی تر.`
      };
    }

    const newProduct: Product = {
      ...productData,
      id: `prod-${Date.now()}-${Math.random().toString(36).substr(2, 4)}`,
      createdAt: new Date().toISOString()
    };

    setProducts(prev => [newProduct, ...prev]);

    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct);
    } catch (e) {
      console.log('Firestore addProduct notice:', e);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('products').insert([{
          id: newProduct.id,
          seller_id: newProduct.sellerId,
          seller_name: newProduct.sellerName,
          title: newProduct.title,
          description: newProduct.description,
          category: newProduct.category,
          subcategory: newProduct.subcategory,
          price: newProduct.price,
          discount_price: newProduct.discountPrice,
          stock: newProduct.stock,
          images: newProduct.images
        }]);
      } catch (e) {}
    }

    addNotification({
      userId: currentUser.id,
      title: 'کاڵای نوێ زیادکرا',
      message: `کاڵای (${newProduct.title}) بە سەرکەوتوویی خرایە بازاڕەوە.`,
      type: 'system'
    });

    return { success: true };
  };

  const updateProduct = async (id: string, updates: Partial<Product>): Promise<{ success: boolean; error?: string }> => {
    const existing = products.find(p => p.id === id);
    if (!existing) return { success: false, error: 'کاڵاکە نەدۆزرایەوە' };

    if (!isSuperAdmin && sellerCategory && existing.category !== sellerCategory) {
      return { success: false, error: 'تۆ ناتوانیت کاڵای ئەم بەشە دەستکاری بکەیت' };
    }

    setProducts(prev => prev.map(p => (p.id === id ? { ...p, ...updates, updatedAt: new Date().toISOString() } : p)));

    try {
      await updateDoc(doc(db, 'products', id), updates);
    } catch (e) {}

    return { success: true };
  };

  const deleteProduct = async (id: string): Promise<{ success: boolean; error?: string }> => {
    const existing = products.find(p => p.id === id);
    if (!existing) return { success: false, error: 'کاڵاکە نەدۆزرایەوە' };

    if (!isSuperAdmin && sellerCategory && existing.category !== sellerCategory) {
      return { success: false, error: 'تۆ ناتوانیت کاڵای ئەم بەشە بسڕیتەوە' };
    }

    setProducts(prev => prev.filter(p => p.id !== id));

    try {
      await deleteDoc(doc(db, 'products', id));
    } catch (e) {}

    return { success: true };
  };

  // Seller Management
  const updateSellerProfile = async (sellerId: string, updates: Partial<SellerProfile>) => {
    setSellers(prev => prev.map(s => (s.id === sellerId ? { ...s, ...updates } : s)));
    try {
      await updateDoc(doc(db, 'sellers', sellerId), updates);
    } catch (e) {}
  };

  const updateSellerDeliveryZone = async (sellerId: string, zoneUpdates: Partial<SellerProfile['deliveryZone']>) => {
    let updatedZone: any = null;
    setSellers(prev => prev.map(s => {
      if (s.id === sellerId) {
        const currentZone = s.deliveryZone || {
          minDistanceKm: 0,
          maxDistanceKm: 15,
          baseFee: 3000,
          baseDistanceThresholdKm: 3,
          perKmExtraFee: 200,
          isStrictRadius: true,
          estimatedMinutesBase: 25,
          estimatedMinutesPerKm: 2,
          coveredNeighborhoods: []
        };
        updatedZone = {
          ...currentZone,
          ...zoneUpdates
        };
        return {
          ...s,
          deliveryZone: updatedZone
        } as any;
      }
      return s;
    }));

    if (updatedZone) {
      try {
        await updateDoc(doc(db, 'sellers', sellerId), { deliveryZone: updatedZone });
      } catch (e) {}
    }

    addNotification({
      userId: sellerId,
      title: 'ناوچە و دوری گەیاندن نوێکرایەوە',
      message: 'ڕێکخستنەکانی سنوری گەیاندن و نرخ بە سەرکەوتوویی پاشەکەوت کران.',
      type: 'seller'
    });
  };

  const updateStoreDeliverySettings = async (sellerId: string, settings: {
    deliveryMode?: DeliveryMode;
    storeDeliveryFee?: number;
    storeFreeDeliveryOver?: number;
    storeDeliveryTimeMin?: number;
  }) => {
    setSellers(prev => prev.map(s => {
      if (s.id === sellerId) {
        return {
          ...s,
          ...settings
        };
      }
      return s;
    }));

    try {
      await updateDoc(doc(db, 'sellers', sellerId), settings);
    } catch (e) {}

    addNotification({
      userId: sellerId,
      title: 'ڕێکخستنی دلیڤەری فرۆشگا نوێکرایەوە',
      message: 'شێوازی گەیاندن و تێچووی دلیڤەری تایبەتی فرۆشگا پاشەکەوت کرا.',
      type: 'seller'
    });
  };

  const addStoreDriver = async (sellerId: string, driverData: Omit<StoreDriver, 'id'>): Promise<{ success: boolean; driverId?: string }> => {
    const newDriverId = `sdrv-${Date.now()}`;
    const newDriver: StoreDriver = {
      ...driverData,
      id: newDriverId,
      sellerId,
      totalDeliveries: 0,
      rating: 5.0,
      createdAt: new Date().toISOString()
    };

    let updatedDrivers: StoreDriver[] = [];

    setSellers(prev => prev.map(s => {
      if (s.id === sellerId) {
        updatedDrivers = [...(s.ownDrivers || []), newDriver];
        return {
          ...s,
          ownDrivers: updatedDrivers
        };
      }
      return s;
    }));

    try {
      await updateDoc(doc(db, 'sellers', sellerId), { ownDrivers: updatedDrivers });
    } catch (e) {}

    addNotification({
      userId: sellerId,
      title: 'شۆفێری نوێ بۆ دوکان زیادکرا',
      message: `شۆفێر ${driverData.name} بۆ تیمی دلیڤەری تایبەتی دوکانەکەت زیادکرا.`,
      type: 'seller'
    });

    return { success: true, driverId: newDriverId };
  };

  const updateStoreDriver = async (sellerId: string, driverId: string, updates: Partial<StoreDriver>) => {
    let updatedDrivers: StoreDriver[] = [];

    setSellers(prev => prev.map(s => {
      if (s.id === sellerId) {
        updatedDrivers = (s.ownDrivers || []).map(d => d.id === driverId ? { ...d, ...updates } : d);
        return {
          ...s,
          ownDrivers: updatedDrivers
        };
      }
      return s;
    }));

    try {
      await updateDoc(doc(db, 'sellers', sellerId), { ownDrivers: updatedDrivers });
    } catch (e) {}
  };

  const deleteStoreDriver = async (sellerId: string, driverId: string) => {
    let updatedDrivers: StoreDriver[] = [];

    setSellers(prev => prev.map(s => {
      if (s.id === sellerId) {
        updatedDrivers = (s.ownDrivers || []).filter(d => d.id !== driverId);
        return {
          ...s,
          ownDrivers: updatedDrivers
        };
      }
      return s;
    }));

    try {
      await updateDoc(doc(db, 'sellers', sellerId), { ownDrivers: updatedDrivers });
    } catch (e) {}
  };

  const assignStoreDriverToOrder = async (
    orderId: string,
    driverId: string,
    driverName: string,
    driverPhone: string,
    vehicleType: string = 'motorcycle'
  ) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? {
      ...o,
      deliveryMode: 'store_delivery' as DeliveryMode,
      isStoreDelivery: true,
      storeDriverId: driverId,
      storeDriverName: driverName,
      storeDriverPhone: driverPhone,
      storeDriverVehicle: vehicleType,
      driverId: driverId,
      driverName: driverName,
      driverPhone: driverPhone,
      status: 'picked_up'
    } : o)));

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        deliveryMode: 'store_delivery',
        isStoreDelivery: true,
        storeDriverId: driverId,
        storeDriverName: driverName,
        storeDriverPhone: driverPhone,
        storeDriverVehicle: vehicleType,
        driverId: driverId,
        driverName: driverName,
        driverPhone: driverPhone,
        status: 'picked_up'
      });
    } catch (e) {}

    addNotification({
      userId: driverId,
      title: 'داواکاری گەیاندنی فرۆشگا بۆت دیاریکرا 🛵',
      message: `تۆ وەک شۆفێری تایبەتی فرۆشگا بۆ گەیاندنی ئەم داواکارییە دانرایت.`,
      type: 'delivery'
    });
  };

  const updateSellerCommissionRate = async (sellerId: string, newRate: number) => {
    if (!isSuperAdmin) {
      console.error('Only Super Admin can change commission rates.');
      return;
    }
    setSellers(prev => prev.map(s => (s.id === sellerId ? { ...s, commissionRate: newRate } : s)));
    try {
      await updateDoc(doc(db, 'sellers', sellerId), { commissionRate: newRate });
    } catch (e) {}

    addNotification({
      userId: sellerId,
      title: 'گۆڕانکاری لە ڕێژەی کۆمسیۆن',
      message: `ڕێژەی کۆمسیۆنی شاخ بۆ فرۆشگاکەت گۆڕدرا بۆ ${newRate}%.`,
      type: 'commission'
    });
  };

  const updateSellerCommission = updateSellerCommissionRate;

  const toggleSellerVerification = async (sellerId: string) => {
    const seller = sellers.find(s => s.id === sellerId);
    if (!seller) return;
    const newStatus = !seller.isVerified;
    setSellers(prev => prev.map(s => (s.id === sellerId ? { ...s, isVerified: newStatus } : s)));
    try {
      await updateDoc(doc(db, 'sellers', sellerId), { isVerified: newStatus });
    } catch (e) {}
  };

  // Orders
  const createOrder = async (orderData: {
    items: Order['items'];
    subtotal: number;
    deliveryFee: number;
    deliveryDistanceKm?: number;
    deliveryZoneStatus?: 'within_radius' | 'custom_distance' | 'out_of_range';
    total: number;
    paymentMethod: PaymentMethod;
    customerNotes?: string;
    deliveryAddress?: string;
    deliveryCity?: string;
    deliveryGeoLocation?: GeoLocation;
    deliveryMode?: DeliveryMode;
    isStoreDelivery?: boolean;
  }): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'تکایە بۆ داواکردن بچۆ ژوورەوە' };
    if (!orderData.items || orderData.items.length === 0) {
      return { success: false, error: 'سەبەتەکەت بەتاڵە' };
    }

    const firstProduct = products.find(p => p.id === orderData.items[0].productId);
    const seller = sellers.find(s => s.id === (firstProduct?.sellerId || 'store-rest-1')) || sellers[0];

    const isStoreDel = Boolean(orderData.isStoreDelivery || orderData.deliveryMode === 'store_delivery');
    const deliveryMode: DeliveryMode = isStoreDel ? 'store_delivery' : 'shakh_delivery';

    const orderNumber = `SHK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderId = `ord-${Date.now()}`;
    const calculatedCommissionAmount = Math.round((orderData.subtotal * seller.commissionRate) / 100);
    const calculatedSellerAmount = Math.round(orderData.subtotal - calculatedCommissionAmount);

    const newOrder: Order = {
      id: newOrderId,
      orderNumber,
      customerId: currentUser.id,
      customerName: currentUser.fullName || 'کڕیار',
      customerPhone: currentUser.phone || '07501234567',
      customerCity: orderData.deliveryCity || currentUser.city || 'Erbil (هەولێر)',
      customerAddress: orderData.deliveryAddress || currentUser.address || 'ناوبازاڕ',
      deliveryCity: orderData.deliveryCity || currentUser.city || 'Erbil (هەولێر)',
      deliveryAddress: orderData.deliveryAddress || currentUser.address || 'ناوبازاڕ',
      deliveryGeoLocation: orderData.deliveryGeoLocation || currentUser.geoLocation,
      customerNotes: orderData.customerNotes,
      sellerId: seller.id,
      sellerName: seller.storeName,
      sellerPhone: seller.phone,
      sellerAddress: seller.address,
      category: seller.category || 'food',
      items: orderData.items,
      subtotal: orderData.subtotal,
      deliveryFee: orderData.deliveryFee,
      deliveryDistanceKm: orderData.deliveryDistanceKm,
      deliveryZoneStatus: orderData.deliveryZoneStatus || 'within_radius',
      deliveryMode,
      isStoreDelivery: isStoreDel,
      total: orderData.total,
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      isPaid: orderData.paymentMethod !== 'cash_on_delivery',
      commissionCalculated: true,
      commissionRate: seller.commissionRate,
      commissionAmount: calculatedCommissionAmount,
      sellerAmount: calculatedSellerAmount,
      sellerEarnings: calculatedSellerAmount,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusTimeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: isStoreDel
            ? 'داواکاری تۆمارکرا (گەیاندن بە شێوازی دلیڤەری تایبەتی فرۆشگا)'
            : 'داواکاری تۆمارکرا (گەیاندن لەلایەن کاپتنی خێرای شاخ)'
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);

    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (e) {
      console.log('Firestore createOrder notice:', e);
    }

    if (isSupabaseConfigured) {
      try {
        await supabase.from('orders').insert([{
          id: newOrder.id,
          order_number: newOrder.orderNumber,
          customer_id: newOrder.customerId,
          customer_name: newOrder.customerName,
          customer_phone: newOrder.customerPhone,
          seller_id: newOrder.sellerId,
          seller_name: newOrder.sellerName,
          items: newOrder.items,
          subtotal: newOrder.subtotal,
          delivery_fee: newOrder.deliveryFee,
          total: newOrder.total,
          status: newOrder.status,
          payment_method: newOrder.paymentMethod,
          delivery_address: newOrder.customerAddress,
          delivery_city: newOrder.customerCity
        }]);
      } catch (e) {}
    }

    addNotification({
      userId: currentUser.id,
      title: 'داواکاری نوێ تۆمارکرا',
      message: `داواکاری ژمارە ${newOrder.orderNumber} بە سەرکەوتوویی تۆمارکرا.`,
      type: 'order',
      linkUrl: `/order/${newOrder.id}`
    });

    addNotification({
      userId: seller.id,
      title: 'داواکارییەکی نوێت بۆ هات!',
      message: `کڕیار ${newOrder.customerName} داواکارییەکی نوێی بە بڕی ${newOrder.total.toLocaleString()} د.ع نارد.`,
      type: 'order'
    });

    return { success: true, orderId: newOrder.id, orderNumber: newOrder.orderNumber };
  };

  const updateOrderStatus = async (orderId: string, status: OrderStatus, note?: string): Promise<{ success: boolean; error?: string }> => {
    const order = orders.find(o => o.id === orderId);
    if (!order) return { success: false, error: 'داواکاری نەدۆزرایەوە' };

    setOrders(prev => prev.map(o => (o.id === orderId ? { ...o, status, updatedAt: new Date().toISOString() } : o)));

    try {
      await updateDoc(doc(db, 'orders', orderId), { status, updatedAt: new Date().toISOString() });
    } catch (e) {}

    if (status === 'delivered') {
      const commTx: CommissionTransaction = {
        id: `comm-${Date.now()}`,
        orderId: order.id,
        orderNumber: order.orderNumber,
        sellerId: order.sellerId,
        sellerName: order.sellerName,
        orderTotal: order.subtotal,
        commissionRate: order.commissionRate,
        commissionAmount: order.commissionAmount,
        sellerAmount: order.sellerAmount || (order.subtotal - order.commissionAmount),
        status: 'finalized',
        createdAt: new Date().toISOString()
      };
      setCommissionTransactions(prev => [commTx, ...prev]);

      // Delivery fee allocation: 100% to Store if Store-Delivery, or 80/20 Shakh Captain split if Shakh-Delivery
      const isStoreDel = Boolean(order.isStoreDelivery || order.deliveryMode === 'store_delivery');
      const delFee = order.deliveryFee && order.deliveryFee > 0 ? order.deliveryFee : 3000;

      setSellerWallets(prev => {
        const curr = prev[order.sellerId] || {
          sellerId: order.sellerId,
          totalGrossSales: 0,
          totalCommissionPaid: 0,
          totalNetEarnings: 0,
          availableBalance: 0,
          pendingBalance: 0
        };
        // If store delivery, the seller also collects the delivery fee directly
        const earned = (order.sellerAmount || (order.subtotal - order.commissionAmount)) + (isStoreDel ? delFee : 0);
        return {
          ...prev,
          [order.sellerId]: {
            ...curr,
            totalGrossSales: curr.totalGrossSales + order.subtotal + (isStoreDel ? delFee : 0),
            totalCommissionPaid: curr.totalCommissionPaid + order.commissionAmount,
            totalNetEarnings: curr.totalNetEarnings + earned,
            availableBalance: curr.availableBalance + earned,
            lastPayoutDate: new Date().toISOString()
          }
        };
      });

      // Shakh & Business Owner Points Agreement Processing
      const sellerAgreement = shakhAgreements.find(a => a.sellerId === order.sellerId) || {
        id: `ag-${order.sellerId}`,
        sellerId: order.sellerId,
        sellerName: order.sellerName,
        tier: 'Standard' as AgreementTier,
        customerRewardPercent: 2,
        sellerRewardPercent: 1.5,
        driverBonusPoints: 10,
        shakhCommissionDiscount: 0.5,
        agreementDate: new Date().toISOString().split('T')[0],
        status: 'active' as const
      };

      // 1. Calculate points per role according to Shakh & Merchant agreement
      const customerPointsEarned = Math.max(10, Math.round((order.subtotal * sellerAgreement.customerRewardPercent) / 100));
      const sellerPointsEarned = Math.max(10, Math.round((order.subtotal * sellerAgreement.sellerRewardPercent) / 100));

      // 2. If Shakh Captain Delivery, apply 20% Shakh Platform Cut & Driver Points
      const dId = order.driverId || order.deliveryAgentId || currentUser?.id || 'rebaz-driver';
      const shakhDeliveryCut = isStoreDel ? 0 : Math.round(delFee * 0.20); // 20% cut for Shakh platform
      const driverNetEarnings = isStoreDel ? delFee : Math.round(delFee * 0.80);  // 80% net for Shakh driver
      const driverPointsEarned = isStoreDel ? 10 : (25 + Math.round(delFee / 500) + (sellerAgreement.driverBonusPoints || 10));

      // Update Driver Stats
      if (!isStoreDel) {
        setDriverStatsMap(prev => {
          const curr = prev[dId] || {
            driverId: dId,
            totalDeliveries: 0,
            totalDeliveryFees: 0,
            totalShakhCommission: 0,
            totalNetEarnings: 0,
            points: 0
          };
          return {
            ...prev,
            [dId]: {
              ...curr,
              totalDeliveries: curr.totalDeliveries + 1,
              totalDeliveryFees: curr.totalDeliveryFees + delFee,
              totalShakhCommission: curr.totalShakhCommission + shakhDeliveryCut,
              totalNetEarnings: curr.totalNetEarnings + driverNetEarnings,
              points: curr.points + driverPointsEarned,
              lastUpdated: new Date().toISOString()
            }
          };
        });
      }

      // Update User Points Wallets for all 3 roles
      const now = new Date().toISOString();
      setUserPointsWallets(prev => {
        const cWallet = prev[order.customerId] || { userId: order.customerId, role: 'customer' as UserRole, totalPoints: 0, lifetimeEarnedPoints: 0, lifetimeRedeemedPoints: 0 };
        const sWallet = prev[order.sellerId] || { userId: order.sellerId, role: 'seller' as UserRole, totalPoints: 0, lifetimeEarnedPoints: 0, lifetimeRedeemedPoints: 0 };
        const dWallet = prev[dId] || { userId: dId, role: 'delivery_agent' as UserRole, totalPoints: 0, lifetimeEarnedPoints: 0, lifetimeRedeemedPoints: 0 };

        return {
          ...prev,
          [order.customerId]: {
            ...cWallet,
            totalPoints: cWallet.totalPoints + customerPointsEarned,
            lifetimeEarnedPoints: cWallet.lifetimeEarnedPoints + customerPointsEarned,
            lastUpdated: now
          },
          [order.sellerId]: {
            ...sWallet,
            totalPoints: sWallet.totalPoints + sellerPointsEarned,
            lifetimeEarnedPoints: sWallet.lifetimeEarnedPoints + sellerPointsEarned,
            lastUpdated: now
          },
          [dId]: {
            ...dWallet,
            totalPoints: dWallet.totalPoints + driverPointsEarned,
            lifetimeEarnedPoints: dWallet.lifetimeEarnedPoints + driverPointsEarned,
            lastUpdated: now
          }
        };
      });

      // Ledger Transactions for all 3 roles
      const txCustomer: PointsTransaction = {
        id: `pt-c-${Date.now()}`,
        userId: order.customerId,
        userName: order.customerName,
        role: 'customer',
        points: customerPointsEarned,
        type: 'order_reward',
        orderId: order.id,
        orderNumber: order.orderNumber,
        sellerId: order.sellerId,
        sellerName: order.sellerName,
        description: `پۆینتی شڕینی بەپێی ڕێککەوتنی شاخ و ${order.sellerName} (${sellerAgreement.customerRewardPercent}٪)`,
        createdAt: now
      };

      const txSeller: PointsTransaction = {
        id: `pt-s-${Date.now()}`,
        userId: order.sellerId,
        userName: order.sellerName,
        role: 'seller',
        points: sellerPointsEarned,
        type: 'seller_agreement_bonus',
        orderId: order.id,
        orderNumber: order.orderNumber,
        sellerId: order.sellerId,
        sellerName: order.sellerName,
        description: `پۆینتی گەشەی خاوەن کار بەپێی ڕێککەوتنی ئاستی ${sellerAgreement.tier}ی شاخ (${sellerAgreement.sellerRewardPercent}٪)`,
        createdAt: now
      };

      const txDriver: PointsTransaction = {
        id: `pt-d-${Date.now()}`,
        userId: dId,
        role: 'delivery_agent',
        points: driverPointsEarned,
        type: 'driver_delivery',
        orderId: order.id,
        orderNumber: order.orderNumber,
        sellerId: order.sellerId,
        sellerName: order.sellerName,
        description: `پۆینتی گەیاندنی کاپتن بەپێی ڕێککەوتنی شاخ (+${sellerAgreement.driverBonusPoints} پۆینتی بۆنس)`,
        createdAt: now
      };

      setPointsTransactions(prev => [txCustomer, txSeller, txDriver, ...prev]);

      // Notifications for all roles
      addNotification({
        userId: order.customerId,
        title: 'پۆینتی پاداشتی شاخ و خاوەن کار! 🎁',
        message: `پیرۆزە! +${customerPointsEarned} پۆینت بۆ هەژمارەکەت زیادکرا لەسەر کڕینی داواکاری ${order.orderNumber} لە ${order.sellerName} (بەپێی ڕێککەوتنی شاخ).`,
        type: 'points'
      });

      addNotification({
        userId: order.sellerId,
        title: 'پۆینتی گەشەی خاوەن کار! 📈',
        message: `+${sellerPointsEarned} پۆینت بۆ هەژماری فرۆشیارەکەت زیادکرا بەپێی ڕێککەوتنی شاخ و خاوەن کار (ئاستی ${sellerAgreement.tier}).`,
        type: 'points'
      });

      addNotification({
        userId: dId,
        title: 'پۆینتی کاپتن زیادکرا! 🛵',
        message: `داواکاری ${order.orderNumber} بە سەرکەوتوویی گەیەندرا. +${driverPointsEarned} پۆینتی شاخ بەدەستهات (قازانجی خاوێن: ${driverNetEarnings.toLocaleString()} د.ع).`,
        type: 'delivery'
      });
    }

    addNotification({
      userId: order.customerId,
      title: 'گۆڕانکاری لە دۆخی داواکاری',
      message: `دۆخی داواکاری ژمارە ${order.orderNumber} گۆڕدرا بۆ: ${status}`,
      type: 'order'
    });

    return { success: true };
  };

  const assignDeliveryAgent = async (orderId: string, agentId: string, agentName: string, agentPhone: string) => {
    setOrders(prev => prev.map(o => (o.id === orderId ? {
      ...o,
      deliveryAgentId: agentId,
      deliveryAgentName: agentName,
      deliveryAgentPhone: agentPhone,
      driverId: agentId,
      driverName: agentName,
      driverPhone: agentPhone,
      status: 'picked_up'
    } : o)));

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        deliveryAgentId: agentId,
        deliveryAgentName: agentName,
        deliveryAgentPhone: agentPhone,
        driverId: agentId,
        driverName: agentName,
        driverPhone: agentPhone,
        status: 'picked_up'
      });
    } catch (e) {}

    addNotification({
      userId: agentId,
      title: 'داواکاری نوێت بۆ گەیاندن دیاریکرا',
      message: `تۆ وەک شۆفێری گەیاندن بۆ داواکاری دیاریکرایت.`,
      type: 'delivery'
    });
  };

  const assignDriverToOrder = async (orderId: string, driverId: string, driverName: string, driverPhone?: string) => {
    return assignDeliveryAgent(orderId, driverId, driverName, driverPhone || '');
  };

  // Car Actions
  const createCarAd = async (adData: Omit<CarAd, 'id' | 'createdAt' | 'paymentStatus' | 'adStatus'>): Promise<{ success: boolean; adId?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'تکایە سەرەتا بچۆ ژوورەوە' };

    const durationDays = adData.packageType === '1_month' ? 30 : adData.packageType === '15_days' ? 15 : 7;
    const now = Date.now();
    const startDate = new Date(now).toISOString();
    const expirationDate = new Date(now + durationDays * 24 * 60 * 60 * 1000).toISOString();

    const newAd: CarAd = {
      ...adData,
      id: `car-${now}`,
      adStatus: 'active',
      paymentStatus: 'paid',
      startDate,
      expirationDate,
      viewsCount: 1,
      likesCount: 0,
      sharesCount: 0,
      createdAt: startDate
    };

    setCarAds(prev => [newAd, ...prev]);

    try {
      await setDoc(doc(db, 'cars', newAd.id), newAd);
    } catch (e) {}

    if (isSupabaseConfigured) {
      try {
        await supabase.from('cars').insert([{
          id: newAd.id,
          user_id: newAd.userId,
          user_name: newAd.userName,
          user_phone: newAd.userPhone,
          title: newAd.title,
          brand: newAd.brand,
          model: newAd.model,
          year: newAd.year,
          price_usd: newAd.priceUsd,
          mileage_km: newAd.mileageKm,
          city: newAd.city,
          images: newAd.images,
          description: newAd.description,
          status: newAd.adStatus
        }]);
      } catch (e) {}
    }

    addNotification({
      userId: currentUser.id,
      title: 'ڕیکلامی ئۆتۆمبێل بڵاوکرایەوە',
      message: `ڕیکلامی (${newAd.title}) بە سەرکەوتوویی لە بەشی ئۆتۆمبێلەکان بڵاوکرایەوە.`,
      type: 'car'
    });

    return { success: true, adId: newAd.id };
  };

  const postCarAd = createCarAd;

  const processCarPayment = async (adId: string, packageType: CarPackageType, paymentMethod: PaymentMethod): Promise<{ success: boolean; txRef?: string; error?: string }> => {
    const pkg = CAR_PACKAGES.find(p => p.id === packageType) || CAR_PACKAGES[0];
    const ad = carAds.find(a => a.id === adId);
    if (!ad) return { success: false, error: 'ڕیکلام نەدۆزرایەوە' };

    const txRef = `CAR-TX-${Math.floor(100000 + Math.random() * 900000)}`;
    const newPayment: CarPayment = {
      id: `pay-${Date.now()}`,
      userId: currentUser?.id || 'guest',
      carAdId: adId,
      carTitle: ad.title,
      packageType,
      amountIqd: pkg.priceIqd,
      currency: 'IQD',
      status: 'paid',
      paymentMethod,
      transactionReference: txRef,
      createdAt: new Date().toISOString()
    };

    setCarPayments(prev => [newPayment, ...prev]);
    setCarAds(prev => prev.map(a => (a.id === adId ? { ...a, paymentStatus: 'paid', adStatus: 'active', packageType } : a)));

    try {
      await updateDoc(doc(db, 'cars', adId), { paymentStatus: 'paid', adStatus: 'active', packageType });
    } catch (e) {}

    addNotification({
      userId: currentUser?.id || 'guest',
      title: 'پارەدانی ڕیکلامی ئۆتۆمبێل سەرکەوتوو بوو',
      message: `بڕی ${pkg.priceIqd.toLocaleString()} د.ع بە سەرکەوتوویی لە ڕێگەی ${paymentMethod.toUpperCase()} درا.`,
      type: 'car'
    });

    return { success: true, txRef };
  };

  const updateCarAdStatus = async (adId: string, status: CarAd['adStatus']) => {
    setCarAds(prev => prev.map(a => (a.id === adId ? { ...a, adStatus: status } : a)));
    try {
      await updateDoc(doc(db, 'cars', adId), { adStatus: status });
    } catch (e) {}
  };

  // Reviews & Favorites
  const addReview = async (reviewData: Omit<Review, 'id' | 'createdAt'>) => {
    const newReview: Review = {
      ...reviewData,
      id: `rev-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);
    try {
      await setDoc(doc(db, 'reviews', newReview.id), newReview);
    } catch (e) {}
  };

  const submitOrderReview = async (params: {
    orderId: string;
    orderNumber: string;
    sellerReview?: {
      sellerId: string;
      sellerName: string;
      rating: number;
      comment: string;
      tags?: string[];
    };
    driverReview?: {
      driverId: string;
      driverName: string;
      rating: number;
      comment: string;
      tags?: string[];
    };
  }): Promise<{ success: boolean; message?: string }> => {
    const now = new Date().toISOString();
    const newReviewsToAdd: Review[] = [];

    // 1. Process Seller Review
    if (params.sellerReview) {
      const sRev: Review = {
        id: `rev-s-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        userId: currentUser?.id || 'customer-1',
        userName: currentUser?.fullName || 'کڕیاری شاخ',
        userAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        targetId: params.sellerReview.sellerId,
        targetType: 'seller',
        targetName: params.sellerReview.sellerName,
        rating: params.sellerReview.rating,
        comment: params.sellerReview.comment,
        tags: params.sellerReview.tags || [],
        createdAt: now
      };
      newReviewsToAdd.push(sRev);

      // Notify seller
      addNotification({
        userId: params.sellerReview.sellerId,
        title: 'هەڵسەنگاندنی نوێ لە کڕیارەوە ⭐',
        message: `کڕیارێک بۆ داواکاری ${params.orderNumber} هەڵسەنگاندنی ${params.sellerReview.rating} ئەستێرەی پێداویت: "${params.sellerReview.comment.slice(0, 45)}..."`,
        type: 'order'
      });
    }

    // 2. Process Driver Review
    if (params.driverReview) {
      const dRev: Review = {
        id: `rev-d-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        userId: currentUser?.id || 'customer-1',
        userName: currentUser?.fullName || 'کڕیاری شاخ',
        userAvatar: currentUser?.avatarUrl || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150',
        targetId: params.driverReview.driverId,
        targetType: 'driver',
        targetName: params.driverReview.driverName,
        rating: params.driverReview.rating,
        comment: params.driverReview.comment,
        tags: params.driverReview.tags || [],
        createdAt: now
      };
      newReviewsToAdd.push(dRev);

      // Notify driver
      addNotification({
        userId: params.driverReview.driverId,
        title: 'پێداچوونەوەی گەیاندن 🛵',
        message: `کڕیار ڕای خۆی لەسەر گەیاندنی داواکاری ${params.orderNumber} تۆمارکرد (${params.driverReview.rating} ئەستێرە).`,
        type: 'delivery'
      });
    }

    // Update Reviews state & Firestore
    if (newReviewsToAdd.length > 0) {
      setReviews(prev => [...newReviewsToAdd, ...prev]);
      for (const rev of newReviewsToAdd) {
        try {
          await setDoc(doc(db, 'reviews', rev.id), rev);
        } catch (e) {}
      }
    }

    // 3. Mark Order as Reviewed
    setOrders(prev => prev.map(o => {
      if (o.id === params.orderId) {
        return {
          ...o,
          isReviewedSeller: params.sellerReview ? true : o.isReviewedSeller,
          isReviewedDriver: params.driverReview ? true : o.isReviewedDriver,
          sellerRating: params.sellerReview ? params.sellerReview.rating : o.sellerRating,
          driverRating: params.driverReview ? params.driverReview.rating : o.driverRating,
          sellerReviewComment: params.sellerReview ? params.sellerReview.comment : o.sellerReviewComment,
          driverReviewComment: params.driverReview ? params.driverReview.comment : o.driverReviewComment,
          updatedAt: now
        };
      }
      return o;
    }));

    try {
      await updateDoc(doc(db, 'orders', params.orderId), {
        isReviewedSeller: true,
        isReviewedDriver: true,
        sellerRating: params.sellerReview?.rating || 5,
        driverRating: params.driverReview?.rating || 5,
        sellerReviewComment: params.sellerReview?.comment || '',
        driverReviewComment: params.driverReview?.comment || '',
        updatedAt: now
      });
    } catch (e) {}

    // 4. Award bonus +15 loyalty points to customer for reviewing
    if (currentUser) {
      setUserPointsWallets(prev => {
        const curr = prev[currentUser.id] || {
          userId: currentUser.id,
          role: 'customer' as UserRole,
          totalPoints: 0,
          lifetimeEarnedPoints: 0,
          lifetimeRedeemedPoints: 0
        };
        return {
          ...prev,
          [currentUser.id]: {
            ...curr,
            totalPoints: curr.totalPoints + 15,
            lifetimeEarnedPoints: curr.lifetimeEarnedPoints + 15,
            lastUpdated: now
          }
        };
      });

      const bonusTx: PointsTransaction = {
        id: `pt-rev-${Date.now()}`,
        userId: currentUser.id,
        userName: currentUser.fullName,
        role: 'customer',
        points: 15,
        type: 'order_reward',
        orderId: params.orderId,
        orderNumber: params.orderNumber,
        description: `پاداشتی هەڵسەنگاندنی داواکاری ${params.orderNumber} (دیاری شاخ)`,
        createdAt: now
      };
      setPointsTransactions(prev => [bonusTx, ...prev]);

      addNotification({
        userId: currentUser.id,
        title: 'پاداشتی هەڵسەنگاندن وەرگیرا! 🎁',
        message: `سوپاس بۆ نووسینی ڕا و هەڵسەنگاندنەکەت. +١٥ پۆینتی دیاری شاخ بۆ هەژمارەکەت زیادکرا!`,
        type: 'points'
      });
    }

    return { success: true, message: 'هەڵسەنگاندنەکەت بە سەرکەوتوویی تۆمارکرا.' };
  };

  const replyToReview = async (reviewId: string, replyText: string, replierRole: 'seller' | 'driver' | 'admin') => {
    const now = new Date().toISOString();
    setReviews(prev => prev.map(r => {
      if (r.id === reviewId) {
        if (replierRole === 'seller') {
          return {
            ...r,
            sellerReply: { comment: replyText, createdAt: now }
          };
        } else if (replierRole === 'driver') {
          return {
            ...r,
            driverReply: { comment: replyText, createdAt: now }
          };
        }
      }
      return r;
    }));

    try {
      const updateData = replierRole === 'seller' 
        ? { sellerReply: { comment: replyText, createdAt: now } }
        : { driverReply: { comment: replyText, createdAt: now } };
      await updateDoc(doc(db, 'reviews', reviewId), updateData);
    } catch (e) {}
  };

  const deleteReview = async (reviewId: string) => {
    setReviews(prev => prev.filter(r => r.id !== reviewId));
    try {
      await deleteDoc(doc(db, 'reviews', reviewId));
    } catch (e) {}
  };

  const getSellerReviews = (sId: string): Review[] => {
    return reviews.filter(r => r.targetId === sId && r.targetType === 'seller');
  };

  const getDriverReviews = (dId: string): Review[] => {
    return reviews.filter(r => (r.targetType === 'driver' || r.targetType === 'delivery_partner') && (r.targetId === dId || dId.includes('rebaz') || r.targetId.includes('rebaz') || r.targetId === 'delivery-1'));
  };

  const getProductReviews = (productId: string): Review[] => {
    return reviews.filter(r => r.targetId === productId && r.targetType === 'product');
  };

  const toggleFavoriteProduct = (productId: string) => {
    setFavoriteProductIds(prev =>
      prev.includes(productId) ? prev.filter(id => id !== productId) : [...prev, productId]
    );
  };

  const toggleFavoriteSeller = (sellerId: string) => {
    setFavoriteSellerIds(prev =>
      prev.includes(sellerId) ? prev.filter(id => id !== sellerId) : [...prev, sellerId]
    );
  };

  // Filter Helpers
  const getProductsByCategory = (cat: ProductCategory) => products.filter(p => p.category === cat);
  const getSellerProducts = (sId: string) => products.filter(p => p.sellerId === sId);
  const getSellerOrders = (sId: string) => orders.filter(o => o.sellerId === sId);
  const getCustomerOrders = (cId: string) => orders.filter(o => o.customerId === cId);
  const getDeliveryOrders = (agentId?: string) => {
    if (agentId) return orders.filter(o => o.deliveryAgentId === agentId || o.driverId === agentId);
    return orders.filter(o => ['ready', 'ready_for_pickup', 'picked_up', 'on_the_way'].includes(o.status));
  };
  const getSellerWallet = (sId: string): SellerWallet => {
    return sellerWallets[sId] || {
      sellerId: sId,
      totalGrossSales: 0,
      totalCommissionPaid: 0,
      totalNetEarnings: 0,
      availableBalance: 0,
      pendingBalance: 0
    };
  };

  const getDriverStats = (dId: string): DriverStats => {
    const completedOrders = orders.filter(o => o.status === 'delivered' && (o.driverId === dId || o.deliveryAgentId === dId || dId.includes('rebaz')));
    const totalDeliveries = Math.max(completedOrders.length, 1);
    const totalDeliveryFees = completedOrders.reduce((sum, o) => sum + (o.deliveryFee || 3000), 3000);
    const totalShakhCommission = Math.round(totalDeliveryFees * 0.20);
    const totalNetEarnings = Math.round(totalDeliveryFees * 0.80);
    const points = (totalDeliveries * 25) + Math.round(totalDeliveryFees / 500);

    const driverReviewsList = getDriverReviews(dId);
    const totalReviews = driverReviewsList.length;
    const avgRating = totalReviews > 0
      ? Number((driverReviewsList.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
      : 4.9;

    if (driverStatsMap[dId]) {
      return {
        ...driverStatsMap[dId],
        rating: avgRating,
        totalReviews
      };
    }

    return {
      driverId: dId,
      totalDeliveries,
      totalDeliveryFees,
      totalShakhCommission,
      totalNetEarnings,
      points,
      rating: avgRating,
      totalReviews
    };
  };

  // Agreement & Points Helper Methods
  const getSellerAgreement = (sId: string): ShakhPointsAgreement => {
    const found = shakhAgreements.find(a => a.sellerId === sId);
    if (found) return found;
    const seller = sellers.find(s => s.id === sId);
    return {
      id: `ag-${sId}`,
      sellerId: sId,
      sellerName: seller?.storeName || 'خاوەن کار',
      tier: 'Standard',
      customerRewardPercent: 2,
      sellerRewardPercent: 1.5,
      driverBonusPoints: 10,
      shakhCommissionDiscount: 0.5,
      agreementDate: new Date().toISOString().split('T')[0],
      status: 'active',
      agreementNotes: 'ڕێککەوتنی گشتی پێوەندیداری شاخ و خاوەن کار'
    };
  };

  const updateSellerAgreement = (sId: string, agreementData: Partial<ShakhPointsAgreement>) => {
    setShakhAgreements(prev => {
      const existingIdx = prev.findIndex(a => a.sellerId === sId);
      if (existingIdx >= 0) {
        const updated = [...prev];
        updated[existingIdx] = {
          ...updated[existingIdx],
          ...agreementData,
          updatedAt: new Date().toISOString()
        };
        return updated;
      } else {
        const seller = sellers.find(s => s.id === sId);
        const newAg: ShakhPointsAgreement = {
          id: `ag-${sId}`,
          sellerId: sId,
          sellerName: seller?.storeName || 'خاوەن کار',
          tier: agreementData.tier || 'Standard',
          customerRewardPercent: agreementData.customerRewardPercent ?? 2,
          sellerRewardPercent: agreementData.sellerRewardPercent ?? 1.5,
          driverBonusPoints: agreementData.driverBonusPoints ?? 10,
          shakhCommissionDiscount: agreementData.shakhCommissionDiscount ?? 0.5,
          agreementDate: new Date().toISOString().split('T')[0],
          status: agreementData.status || 'active',
          agreementNotes: agreementData.agreementNotes || 'ڕێککەوتنی باری تایبەتی شاخ و خاوەن کار',
          updatedAt: new Date().toISOString()
        };
        return [newAg, ...prev];
      }
    });

    addNotification({
      userId: sId,
      title: 'نوێکردنەوەی ڕێککەوتنی پۆینتی شاخ',
      message: `ڕێککەوتنی پۆینت و ئاستی خاوەن کار نوێکرایەوە.`,
      type: 'points'
    });
  };

  const getUserPointsWallet = (uId: string, role: UserRole = 'customer'): UserPointsWallet => {
    if (userPointsWallets[uId]) {
      return userPointsWallets[uId];
    }
    return {
      userId: uId,
      role,
      totalPoints: 0,
      lifetimeEarnedPoints: 0,
      lifetimeRedeemedPoints: 0
    };
  };

  const getUserPointsHistory = (uId: string): PointsTransaction[] => {
    return pointsTransactions.filter(t => t.userId === uId);
  };

  const redeemPoints = (uId: string, pointsToRedeem: number, rewardDescription: string, role: UserRole = 'customer') => {
    const wallet = getUserPointsWallet(uId, role);
    if (wallet.totalPoints < pointsToRedeem) {
      return { success: false, message: 'پۆینتی تەواوت نییە بۆ بەکارهێنان.' };
    }

    const now = new Date().toISOString();

    setUserPointsWallets(prev => {
      const curr = prev[uId] || wallet;
      return {
        ...prev,
        [uId]: {
          ...curr,
          totalPoints: curr.totalPoints - pointsToRedeem,
          lifetimeRedeemedPoints: curr.lifetimeRedeemedPoints + pointsToRedeem,
          lastUpdated: now
        }
      };
    });

    const txRedeem: PointsTransaction = {
      id: `pt-red-${Date.now()}`,
      userId: uId,
      role,
      points: -pointsToRedeem,
      type: 'redemption',
      description: `بەکاربهێنانی پۆینت: ${rewardDescription}`,
      createdAt: now
    };

    setPointsTransactions(prev => [txRedeem, ...prev]);

    addNotification({
      userId: uId,
      title: 'پۆینت بەکارهێنرا! 🎉',
      message: `${pointsToRedeem} پۆینت بەکارهێنرا بۆ: ${rewardDescription}.`,
      type: 'points'
    });

    return { success: true, message: 'پۆینتەکان بە سەرکەوتوویی بۆ دیاری بەکارهێنران.' };
  };

  // User Feedback Actions
  const submitUserFeedback = async (feedbackData: Omit<UserFeedback, 'id' | 'createdAt' | 'status'>): Promise<{ success: boolean; message: string }> => {
    const newFeedback: UserFeedback = {
      ...feedbackData,
      id: `fb-${Date.now()}`,
      status: 'pending',
      createdAt: new Date().toISOString()
    };

    setUserFeedbacks(prev => [newFeedback, ...prev]);

    try {
      await setDoc(doc(db, 'feedbacks', newFeedback.id), newFeedback);
    } catch (e) {}

    addNotification({
      userId: feedbackData.userId,
      title: 'فیدباک و سەرنجەکەت گەیەندرا 📩',
      message: 'سوپاس بۆ بەشداریکردنت لە بەرەوپێشبردنی پڕۆژەی شاخ! سەرنجەکەت لە لایەن تیمی بەڕێوەبەری پێداچوونەوەی بۆ دەکرێت.',
      type: 'system'
    });

    return { success: true, message: 'فیدباکەکەت بە سەرکەوتوویی تۆمارکرا. سوپاس بۆ سەرنج و ڕاگۆڕینەوەکەت!' };
  };

  const updateFeedbackStatus = async (feedbackId: string, status: UserFeedback['status'], adminResponse?: string) => {
    setUserFeedbacks(prev => prev.map(f => (f.id === feedbackId ? {
      ...f,
      status,
      adminResponse: adminResponse !== undefined ? adminResponse : f.adminResponse
    } : f)));

    try {
      await updateDoc(doc(db, 'feedbacks', feedbackId), { status, adminResponse });
    } catch (e) {}
  };

  const purgeAllDemoData = async (): Promise<{ success: boolean; message: string }> => {
    try {
      // 1. Reset react state
      setProducts([]);
      setSellers([]);
      setCarAds([]);
      setOrders([]);
      setReviews([]);

      // 2. Clear LocalStorage cache
      const keysToRemove = [
        'shakh_products', 'shakh_sellers', 'shakh_car_ads', 'shakh_orders',
        'shakh_reviews', 'shakh_commissions', 'shakh_wallets', 'shakh_car_payments',
        'shakh_fav_products', 'shakh_fav_sellers', 'shakh_driver_stats'
      ];
      keysToRemove.forEach(k => {
        try { localStorage.removeItem(k); } catch (e) {}
      });

      // 3. Delete documents from Firestore
      const collectionsToPurge = ['products', 'sellers', 'cars', 'orders', 'reviews'];
      for (const colName of collectionsToPurge) {
        try {
          const colRef = collection(db, colName);
          const snapshot = await getDocs(colRef);
          const deletePromises = snapshot.docs.map(d => deleteDoc(doc(db, colName, d.id)));
          await Promise.all(deletePromises);
        } catch (e) {
          console.warn(`Error purging collection ${colName}:`, e);
        }
      }

      // 4. If Supabase configured, attempt cleanup as well
      if (supabase && isSupabaseConfigured) {
        try {
          await supabase.from('products').delete().neq('id', '00000000-0000-0000-0000-000000000000');
          await supabase.from('sellers').delete().neq('id', '00000000-0000-0000-0000-000000000000');
        } catch (e) {}
      }

      return { success: true, message: 'تەواوی کاڵا و دیمۆ کۆنەکان لە فایەربەیس و میمۆری بە سەرکەوتوویی سڕانەوە.' };
    } catch (e: any) {
      return { success: false, message: e.message || 'هەڵەیەک ڕوویدا لە کاتی پاککردنەوەدا' };
    }
  };

  // Super Admin Platform Statistics
  const totalGrossMerchandiseValue = orders.reduce((sum, o) => sum + (o.subtotal || 0), 0);
  const totalShakhCommission = commissionTransactions.reduce((sum, c) => sum + (c.commissionAmount || 0), 0);
  const totalCarAdRevenue = carPayments.filter(p => p.status === 'paid').reduce((sum, p) => sum + p.amountIqd, 0);
  const activeOrdersCount = orders.filter(o => !['delivered', 'cancelled'].includes(o.status)).length;

  const platformStats = {
    totalGrossMerchandiseValue,
    totalShakhCommission,
    totalCarAdRevenue,
    totalOrdersCount: orders.length,
    activeOrdersCount,
    totalSellersCount: sellers.length,
    totalProductsCount: products.length,
    totalCarAdsCount: carAds.length
  };

  return (
    <MarketplaceContext.Provider
      value={{
        products,
        sellers,
        carAds,
        orders,
        commissionTransactions,
        sellerWallets,
        carPayments,
        reviews,
        favoriteProductIds,
        favoriteSellerIds,
        addProduct,
        updateProduct,
        deleteProduct,
        updateSellerProfile,
        updateSellerCommissionRate,
        updateSellerCommission,
        toggleSellerVerification,
        updateSellerDeliveryZone,
        updateStoreDeliverySettings,
        addStoreDriver,
        updateStoreDriver,
        deleteStoreDriver,
        assignStoreDriverToOrder,
        createOrder,
        updateOrderStatus,
        assignDeliveryAgent,
        assignDriverToOrder,
        createCarAd,
        postCarAd,
        processCarPayment,
        updateCarAdStatus,
        addReview,
        submitOrderReview,
        replyToReview,
        deleteReview,
        getSellerReviews,
        getDriverReviews,
        getProductReviews,
        toggleFavoriteProduct,
        toggleFavoriteSeller,
        shakhAgreements,
        pointsTransactions,
        getSellerAgreement,
        updateSellerAgreement,
        getUserPointsWallet,
        getUserPointsHistory,
        redeemPoints,
        userFeedbacks,
        submitUserFeedback,
        updateFeedbackStatus,
        occasionBanner,
        updateOccasionBanner,
        incrementSalawatCount,
        getProductsByCategory,
        getSellerProducts,
        getSellerOrders,
        getCustomerOrders,
        getDeliveryOrders,
        getSellerWallet,
        driverStatsMap,
        getDriverStats,
        platformStats,
        purgeAllDemoData
      }}
    >
      {children}
    </MarketplaceContext.Provider>
  );
};

export const useMarketplace = () => {
  const context = useContext(MarketplaceContext);
  if (!context) {
    throw new Error('useMarketplace must be used within a MarketplaceProvider');
  }
  return context;
};
