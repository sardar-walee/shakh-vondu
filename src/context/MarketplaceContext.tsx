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
  ProductCategory
} from '../types';
import {
  INITIAL_PRODUCTS,
  INITIAL_SELLERS,
  INITIAL_CAR_ADS,
  INITIAL_ORDERS,
  INITIAL_REVIEWS,
  CAR_PACKAGES
} from '../data/seedData';
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
  updateSellerDeliveryZone: (sellerId: string, zoneSettings: Partial<SellerProfile['deliveryZone']>) => Promise<void>;

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
  }) => Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }>;
  updateOrderStatus: (orderId: string, status: OrderStatus, note?: string) => Promise<{ success: boolean; error?: string }>;
  assignDeliveryAgent: (orderId: string, agentId: string, agentName: string, agentPhone: string) => Promise<void>;

  // Car Actions
  createCarAd: (adData: Omit<CarAd, 'id' | 'createdAt' | 'paymentStatus' | 'adStatus'>) => Promise<{ success: boolean; adId?: string; error?: string }>;
  processCarPayment: (adId: string, packageType: CarPackageType, paymentMethod: PaymentMethod) => Promise<{ success: boolean; txRef?: string; error?: string }>;
  updateCarAdStatus: (adId: string, status: CarAd['adStatus']) => Promise<void>;

  // Reviews & Favorites
  addReview: (review: Omit<Review, 'id' | 'createdAt'>) => Promise<void>;
  toggleFavoriteProduct: (productId: string) => void;
  toggleFavoriteSeller: (sellerId: string) => void;

  // Filter Helpers
  getProductsByCategory: (category: ProductCategory) => Product[];
  getSellerProducts: (sellerId: string) => Product[];
  getSellerOrders: (sellerId: string) => Order[];
  getCustomerOrders: (customerId: string) => Order[];
  getDeliveryOrders: (agentId?: string) => Order[];
  getSellerWallet: (sellerId: string) => SellerWallet;

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
}

const MarketplaceContext = createContext<MarketplaceContextType | undefined>(undefined);

export const MarketplaceProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { currentUser, isSuperAdmin, sellerCategory } = useAuth();
  const { addNotification } = useNotification();

  // State initialization
  const [products, setProducts] = useState<Product[]>(() => {
    const saved = localStorage.getItem('shakh_products');
    return saved ? JSON.parse(saved) : INITIAL_PRODUCTS;
  });

  const [sellers, setSellers] = useState<SellerProfile[]>(() => {
    const saved = localStorage.getItem('shakh_sellers');
    return saved ? JSON.parse(saved) : INITIAL_SELLERS;
  });

  const [carAds, setCarAds] = useState<CarAd[]>(() => {
    const saved = localStorage.getItem('shakh_car_ads');
    return saved ? JSON.parse(saved) : INITIAL_CAR_ADS;
  });

  const [orders, setOrders] = useState<Order[]>(() => {
    const saved = localStorage.getItem('shakh_orders');
    return saved ? JSON.parse(saved) : INITIAL_ORDERS;
  });

  const [commissionTransactions, setCommissionTransactions] = useState<CommissionTransaction[]>(() => {
    const saved = localStorage.getItem('shakh_commissions');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'comm-1',
        orderId: 'ord-1001',
        orderNumber: 'SHK-8901',
        sellerId: 'store-rest-1',
        sellerName: 'چێشتخانەی دیلان و کەباب',
        orderTotal: 52500,
        commissionRate: 10,
        commissionAmount: 5250,
        sellerAmount: 47250,
        status: 'finalized',
        createdAt: '2026-02-18T13:45:00Z'
      }
    ];
  });

  const [sellerWallets, setSellerWallets] = useState<Record<string, SellerWallet>>(() => {
    const saved = localStorage.getItem('shakh_wallets');
    if (saved) return JSON.parse(saved);
    return {
      'store-rest-1': {
        sellerId: 'store-rest-1',
        totalGrossSales: 52500,
        totalCommissionPaid: 5250,
        totalNetEarnings: 47250,
        availableBalance: 47250,
        pendingBalance: 0,
        lastPayoutDate: '2026-02-18T13:45:00Z'
      }
    };
  });

  const [carPayments, setCarPayments] = useState<CarPayment[]>(() => {
    const saved = localStorage.getItem('shakh_car_payments');
    if (saved) return JSON.parse(saved);
    return [
      {
        id: 'pay-1',
        userId: 'customer-1',
        carAdId: 'car-ad-1',
        carTitle: 'تۆیۆتا لاندکرۆزەر VXR مۆدێل ٢٠٢٤ بەسفر',
        packageType: '1_month',
        amountIqd: 10000,
        currency: 'IQD',
        status: 'paid',
        paymentMethod: 'fib',
        transactionReference: 'FIB-TX-984321',
        createdAt: '2026-02-01T00:00:00Z'
      }
    ];
  });

  const [reviews, setReviews] = useState<Review[]>(() => {
    const saved = localStorage.getItem('shakh_reviews');
    return saved ? JSON.parse(saved) : INITIAL_REVIEWS;
  });

  const [favoriteProductIds, setFavoriteProductIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('shakh_fav_products');
    return saved ? JSON.parse(saved) : ['prod-food-1', 'prod-electro-1'];
  });

  const [favoriteSellerIds, setFavoriteSellerIds] = useState<string[]>(() => {
    const saved = localStorage.getItem('shakh_fav_sellers');
    return saved ? JSON.parse(saved) : ['store-rest-1'];
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

  // Firebase Firestore Real-Time Subscriptions & Auto-Seeding
  useEffect(() => {
    let unsubProducts: () => void;
    let unsubSellers: () => void;
    let unsubOrders: () => void;
    let unsubCars: () => void;

    const setupFirestoreSync = async () => {
      try {
        // 1. Products Listener
        const prodCol = collection(db, 'products');
        const prodSnap = await getDocs(prodCol);
        if (prodSnap.empty) {
          // Auto-seed initial products to cloud
          INITIAL_PRODUCTS.forEach(async (p) => {
            await setDoc(doc(db, 'products', p.id), p);
          });
        }

        unsubProducts = onSnapshot(prodCol, (snapshot) => {
          if (!snapshot.empty) {
            const list: Product[] = [];
            snapshot.forEach(docSnap => list.push(docSnap.data() as Product));
            setProducts(list);
          }
        });

        // 2. Sellers Listener
        const sellersCol = collection(db, 'sellers');
        const sellersSnap = await getDocs(sellersCol);
        if (sellersSnap.empty) {
          INITIAL_SELLERS.forEach(async (s) => {
            await setDoc(doc(db, 'sellers', s.id), s);
          });
        }

        unsubSellers = onSnapshot(sellersCol, (snapshot) => {
          if (!snapshot.empty) {
            const list: SellerProfile[] = [];
            snapshot.forEach(docSnap => list.push(docSnap.data() as SellerProfile));
            setSellers(list);
          }
        });

        // 3. Orders Listener
        const ordersCol = collection(db, 'orders');
        unsubOrders = onSnapshot(ordersCol, (snapshot) => {
          if (!snapshot.empty) {
            const list: Order[] = [];
            snapshot.forEach(docSnap => list.push(docSnap.data() as Order));
            // sort descending
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setOrders(list);
          }
        });

        // 4. Cars Listener
        const carsCol = collection(db, 'cars');
        const carsSnap = await getDocs(carsCol);
        if (carsSnap.empty) {
          INITIAL_CAR_ADS.forEach(async (c) => {
            await setDoc(doc(db, 'cars', c.id), c);
          });
        }

        unsubCars = onSnapshot(carsCol, (snapshot) => {
          if (!snapshot.empty) {
            const list: CarAd[] = [];
            snapshot.forEach(docSnap => list.push(docSnap.data() as CarAd));
            list.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
            setCarAds(list);
          }
        });
      } catch (err) {
        console.log('Firestore real-time sync initializing fallback:', err);
      }
    };

    setupFirestoreSync();

    return () => {
      if (unsubProducts) unsubProducts();
      if (unsubSellers) unsubSellers();
      if (unsubOrders) unsubOrders();
      if (unsubCars) unsubCars();
    };
  }, []);

  // Product Management with Category Enforcement & Cloud Sync
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

    // Firestore Cloud Save
    try {
      await setDoc(doc(db, 'products', newProduct.id), newProduct);
    } catch (e) {
      console.log('Firestore addProduct notice:', e);
    }

    // Supabase Cloud Save
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

  // Seller Management & Cloud Sync
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
      message: `ڕێژەی کۆمسیۆنی شاخی بۆ فرۆشگاکەت گۆڕدرا بۆ ${newRate}%.`,
      type: 'commission'
    });
  };

  // Orders & Cloud Persistence
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
  }): Promise<{ success: boolean; orderId?: string; orderNumber?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'تکایە بۆ داواکردن بچۆ ژوورەوە' };
    if (!orderData.items || orderData.items.length === 0) {
      return { success: false, error: 'سەبەتەکەت بەتاڵە' };
    }

    const firstProduct = products.find(p => p.id === orderData.items[0].productId);
    const seller = sellers.find(s => s.id === (firstProduct?.sellerId || 'store-rest-1')) || sellers[0];

    const orderNumber = `SHK-${Math.floor(1000 + Math.random() * 9000)}`;
    const newOrderId = `ord-${Date.now()}`;

    const newOrder: Order = {
      id: newOrderId,
      orderNumber,
      customerId: currentUser.id,
      customerName: currentUser.fullName || 'کڕیار',
      customerPhone: currentUser.phone || '07501234567',
      customerCity: orderData.deliveryCity || currentUser.city || 'Erbil (هەولێر)',
      customerAddress: orderData.deliveryAddress || currentUser.address || 'ناوبازاڕ',
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
      total: orderData.total,
      status: 'pending',
      paymentMethod: orderData.paymentMethod,
      isPaid: orderData.paymentMethod !== 'cash_on_delivery',
      commissionCalculated: true,
      commissionRate: seller.commissionRate,
      commissionAmount: Math.round((orderData.subtotal * seller.commissionRate) / 100),
      sellerAmount: Math.round(orderData.subtotal - ((orderData.subtotal * seller.commissionRate) / 100)),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      statusTimeline: [
        {
          status: 'pending',
          timestamp: new Date().toISOString(),
          note: 'داواکاری لە لایەن کڕیارەوە تۆمارکرا'
        }
      ]
    };

    setOrders(prev => [newOrder, ...prev]);

    // Save to Firestore Orders collection
    try {
      await setDoc(doc(db, 'orders', newOrder.id), newOrder);
    } catch (e) {
      console.log('Firestore createOrder notice:', e);
    }

    // Save to Supabase if configured
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

    // Send notifications
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

    // When status changes to delivered, finalize commission & wallet
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
        sellerAmount: order.sellerEarnings,
        status: 'finalized',
        createdAt: new Date().toISOString()
      };
      setCommissionTransactions(prev => [commTx, ...prev]);

      setSellerWallets(prev => {
        const curr = prev[order.sellerId] || {
          sellerId: order.sellerId,
          totalGrossSales: 0,
          totalCommissionPaid: 0,
          totalNetEarnings: 0,
          availableBalance: 0,
          pendingBalance: 0
        };
        return {
          ...prev,
          [order.sellerId]: {
            ...curr,
            totalGrossSales: curr.totalGrossSales + order.subtotal,
            totalCommissionPaid: curr.totalCommissionPaid + order.commissionAmount,
            totalNetEarnings: curr.totalNetEarnings + order.sellerEarnings,
            availableBalance: curr.availableBalance + order.sellerEarnings,
            lastPayoutDate: new Date().toISOString()
          }
        };
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
      status: 'picked_up'
    } : o)));

    try {
      await updateDoc(doc(db, 'orders', orderId), {
        deliveryAgentId: agentId,
        deliveryAgentName: agentName,
        deliveryAgentPhone: agentPhone,
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

  // Car Actions & Cloud Persistence
  const createCarAd = async (adData: Omit<CarAd, 'id' | 'createdAt' | 'paymentStatus' | 'adStatus'>): Promise<{ success: boolean; adId?: string; error?: string }> => {
    if (!currentUser) return { success: false, error: 'تکایە سەرەتا بچۆ ژوورەوە' };

    const newAd: CarAd = {
      ...adData,
      id: `car-${Date.now()}`,
      adStatus: 'active',
      paymentStatus: 'paid',
      createdAt: new Date().toISOString()
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
      id: `rev-${Date.now()}`,
      createdAt: new Date().toISOString()
    };
    setReviews(prev => [newReview, ...prev]);
    try {
      await setDoc(doc(db, 'reviews', newReview.id), newReview);
    } catch (e) {}
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
    if (agentId) return orders.filter(o => o.deliveryAgentId === agentId);
    return orders.filter(o => ['ready_for_pickup', 'picked_up', 'out_for_delivery'].includes(o.status));
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
        updateSellerDeliveryZone,
        createOrder,
        updateOrderStatus,
        assignDeliveryAgent,
        createCarAd,
        processCarPayment,
        updateCarAdStatus,
        addReview,
        toggleFavoriteProduct,
        toggleFavoriteSeller,
        getProductsByCategory,
        getSellerProducts,
        getSellerOrders,
        getCustomerOrders,
        getDeliveryOrders,
        getSellerWallet,
        platformStats
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
