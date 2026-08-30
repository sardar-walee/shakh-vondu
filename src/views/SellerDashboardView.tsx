import React, { useState } from 'react';
import {
  Store,
  Package,
  ShoppingBag,
  DollarSign,
  TrendingUp,
  Plus,
  Edit,
  Trash2,
  CheckCircle,
  Clock,
  Truck,
  Eye,
  AlertCircle,
  Settings,
  Image as ImageIcon,
  MapPin,
  Navigation,
  Info,
  Sliders,
  Check,
  Compass,
  Sparkles,
  X,
  Award,
  Gift,
  FileText,
  Star,
  MessageSquare,
  Send,
  User,
  UserCheck,
  Save,
  Phone
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { useLanguage } from '../context/LanguageContext';
import { Product, Order, ProductCategory, DeliveryZoneSettings, SellerProfile, StoreDriver, DeliveryMode } from '../types';
import { StatusBadge, CategoryBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { ImageUpload } from '../components/common/ImageUpload';
import { DynamicProductForm } from '../components/products/DynamicProductForm';
import { CommissionAgreementCard } from '../components/seller/CommissionAgreementCard';
import { getDefaultDeliveryZone, calculateDeliveryFee, CITY_NEIGHBORHOOD_DISTANCES } from '../utils/deliveryUtils';
import { CaptainManager } from '../components/delivery/CaptainManager';
import { getCategoryPostButtonLabel } from '../utils/categoryFields';
import { SubscriptionManagementPanel } from '../components/subscription/SubscriptionManagementPanel';

interface SellerDashboardViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, sellerProfile, canManageCategory, isSeller } = useAuth();
  const { currentLanguage } = useLanguage();
  const {
    products,
    orders,
    sellers,
    updateOrderStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    updateSellerDeliveryZone,
    updateStoreDeliverySettings,
    addStoreDriver,
    updateStoreDriver,
    deleteStoreDriver,
    assignStoreDriverToOrder,
    assignDriverToOrder,
    getSellerAgreement,
    getUserPointsWallet,
    redeemPoints,
    getSellerReviews,
    replyToReview
  } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'reviews' | 'captains' | 'subscriptions' | 'agreement' | 'wallet' | 'delivery' | 'settings'>('overview');
  const [deliverySection, setDeliverySection] = useState<'shakh_express' | 'store_inhouse' | 'drivers_team'>('shakh_express');
  const [replyingReviewId, setReplyingReviewId] = useState<string | null>(null);
  const [replyText, setReplyText] = useState<string>('');

  // Dispatch Modal State for Orders
  const [dispatchOrderModal, setDispatchOrderModal] = useState<Order | null>(null);
  const [selectedDriverForDispatch, setSelectedDriverForDispatch] = useState<string>('');

  // Filter products and orders belonging to this seller
  const sellerId = sellerProfile?.id || (products[0]?.sellerId ?? 'store-rest-1');
  const activeSeller = sellers.find(s => s.id === sellerId) || sellerProfile || sellers[0];
  const myProducts = products.filter(p => p.sellerId === sellerId);
  const myOrders = orders.filter(o => o.sellerId === sellerId);

  // Store In-House Delivery State
  const [deliveryMode, setDeliveryMode] = useState<DeliveryMode>(sellerProfile?.deliveryMode || 'hybrid');
  const [storeDeliveryFee, setStoreDeliveryFee] = useState<number>(sellerProfile?.storeDeliveryFee || 2000);
  const [storeFreeDeliveryOver, setStoreFreeDeliveryOver] = useState<number>(sellerProfile?.storeFreeDeliveryOver || 30000);
  const [storeEstimatedMins, setStoreEstimatedMins] = useState<number>(sellerProfile?.storeDeliveryTimeMin || 25);
  const [storeDriversList, setStoreDriversList] = useState<StoreDriver[]>(sellerProfile?.ownDrivers || [
    {
      id: 'drv-1',
      sellerId: sellerId,
      name: 'هێمن ئەحمەد',
      phone: '0750 444 8899',
      vehicleType: 'motorcycle',
      plateNumber: 'هەولێر 4321 B',
      isActive: true,
      totalDeliveries: 42,
      rating: 4.9
    },
    {
      id: 'drv-2',
      sellerId: sellerId,
      name: 'سەردار مەحموود',
      phone: '0770 123 9988',
      vehicleType: 'car',
      plateNumber: 'هەولێر 8877 A',
      isActive: true,
      totalDeliveries: 28,
      rating: 4.8
    }
  ]);

  // Add Driver Form State
  const [showAddDriverModal, setShowAddDriverModal] = useState(false);
  const [newDriverName, setNewDriverName] = useState('');
  const [newDriverPhone, setNewDriverPhone] = useState('');
  const [newDriverVehicle, setNewDriverVehicle] = useState<'motorcycle' | 'car' | 'bicycle' | 'van'>('motorcycle');
  const [newDriverPlate, setNewDriverPlate] = useState('');

  // Delivery Zone State (Shakh Express)
  const defaultCategory = (sellerProfile?.category || currentUser?.category || 'food') as ProductCategory;
  const initialDeliveryZone: DeliveryZoneSettings = sellerProfile?.deliveryZone || getDefaultDeliveryZone(defaultCategory);

  const [minDist, setMinDist] = useState<number>(initialDeliveryZone.minDistanceKm || 0);
  const [maxDist, setMaxDist] = useState<number>(initialDeliveryZone.maxDistanceKm || 15);
  const [baseFee, setBaseFee] = useState<number>(initialDeliveryZone.baseFee || 3000);
  const [baseThresholdKm, setBaseThresholdKm] = useState<number>(initialDeliveryZone.baseDistanceThresholdKm || 3);
  const [perKmFee, setPerKmFee] = useState<number>(initialDeliveryZone.perKmExtraFee || 250);
  const [freeDeliveryOver, setFreeDeliveryOver] = useState<number>(initialDeliveryZone.freeDeliveryThreshold || 0);
  const [isStrict, setIsStrict] = useState<boolean>(initialDeliveryZone.isStrictRadius !== false);
  const [baseMins, setBaseMins] = useState<number>(initialDeliveryZone.estimatedMinutesBase || 25);
  const [perKmMins, setPerKmMins] = useState<number>(initialDeliveryZone.estimatedMinutesPerKm || 2.0);
  const [neighborhoods, setNeighborhoods] = useState<string[]>(initialDeliveryZone.coveredNeighborhoods || []);
  const [newNeighborhoodInput, setNewNeighborhoodInput] = useState('');
  const [deliveryNote, setDeliveryNote] = useState(initialDeliveryZone.deliveryAvailabilityNote || '');
  const [isSavingDelivery, setIsSavingDelivery] = useState(false);
  const [deliverySaveSuccess, setDeliverySaveSuccess] = useState(false);

  // Test Simulator State for Live Calculator inside Seller Dashboard
  const [testSimDistance, setTestSimDistance] = useState<number>(5.5);
  const [testSimSubtotal, setTestSimSubtotal] = useState<number>(25000);

  // Financial calculations
  const totalGrossSales = myOrders.reduce((sum, o) => sum + o.subtotal, 0);
  const totalCommissionDeducted = myOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
  const netDeliveredEarnings = myOrders
    .filter(o => o.status === 'delivered')
    .reduce((sum, o) => sum + (o.sellerEarnings || (o.subtotal - (o.commissionAmount || 0))), 0);
  const pendingEarnings = myOrders
    .filter(o => o.status !== 'delivered' && o.status !== 'cancelled')
    .reduce((sum, o) => sum + o.subtotal, 0);

  // Modal State for Add / Edit Product
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const openAddModal = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  const handleSaveDeliveryZone = async () => {
    setIsSavingDelivery(true);
    await updateSellerDeliveryZone(sellerId, {
      minDistanceKm: minDist,
      maxDistanceKm: maxDist,
      baseFee,
      baseDistanceThresholdKm: baseThresholdKm,
      perKmExtraFee: perKmFee,
      freeDeliveryThreshold: freeDeliveryOver,
      isStrictRadius: isStrict,
      estimatedMinutesBase: baseMins,
      estimatedMinutesPerKm: perKmMins,
      coveredNeighborhoods: neighborhoods,
      deliveryAvailabilityNote: deliveryNote
    });
    setIsSavingDelivery(false);
    setDeliverySaveSuccess(true);
    setTimeout(() => setDeliverySaveSuccess(false), 3000);
  };

  const handleSaveStoreDeliverySettings = async () => {
    setIsSavingDelivery(true);
    await updateStoreDeliverySettings(sellerId, {
      deliveryMode,
      storeDeliveryFee,
      storeFreeDeliveryOver,
      storeDeliveryTimeMin: storeEstimatedMins
    });
    setIsSavingDelivery(false);
    setDeliverySaveSuccess(true);
    setTimeout(() => setDeliverySaveSuccess(false), 3000);
  };

  const handleAddStoreDriver = async () => {
    if (!newDriverName.trim() || !newDriverPhone.trim()) return;
    const newDriver: Omit<StoreDriver, 'id'> = {
      sellerId,
      name: newDriverName.trim(),
      phone: newDriverPhone.trim(),
      vehicleType: newDriverVehicle,
      plateNumber: newDriverPlate.trim(),
      isActive: true,
      totalDeliveries: 0,
      rating: 5.0
    };
    const res = await addStoreDriver(sellerId, newDriver);
    if (res.success) {
      const createdDriver: StoreDriver = {
        ...newDriver,
        id: res.driverId || `drv-${Date.now()}`
      };
      setStoreDriversList(prev => [...prev, createdDriver]);
      setNewDriverName('');
      setNewDriverPhone('');
      setNewDriverPlate('');
      setShowAddDriverModal(false);
    }
  };

  const handleDeleteStoreDriver = async (driverId: string) => {
    await deleteStoreDriver(sellerId, driverId);
    setStoreDriversList(prev => prev.filter(d => d.id !== driverId));
  };

  const handleToggleStoreDriver = async (driver: StoreDriver) => {
    const updated = { ...driver, isActive: !driver.isActive };
    await updateStoreDriver(sellerId, driver.id, { isActive: !driver.isActive });
    setStoreDriversList(prev => prev.map(d => d.id === driver.id ? updated : d));
  };

  const handleDispatchOrderToShakh = async (orderId: string) => {
    await updateOrderStatus(orderId, 'ready', 'ڕەوانەکرا بۆ تۆڕی کاپتنانی خێرای شاخ');
    setDispatchOrderModal(null);
  };

  const handleDispatchOrderToStoreDriver = async (orderId: string, driverId: string) => {
    const drv = storeDriversList.find(d => d.id === driverId);
    if (!drv) return;
    await assignStoreDriverToOrder(orderId, drv.id, drv.name, drv.phone, drv.vehicleType);
    setDispatchOrderModal(null);
  };

  return (
    <div className="space-y-8 pb-16">
      
      {/* Dashboard Top Header */}
      <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-orange-500 text-white flex items-center justify-center font-bold text-2xl shadow-md">
            <Store className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black text-slate-900">
                {sellerProfile?.storeName || 'داشبۆردی بەڕێوەبردنی فرۆشگا'}
              </h1>
              <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2.5 py-0.5 rounded-full">
                چالاکە
              </span>
            </div>
            <p className="text-xs text-slate-500 mt-1">
              بەش: <span className="font-bold text-slate-800">{defaultCategory}</span> • ڕێژەی کۆمسیۆنی (شاخ): <span className="font-bold text-orange-600 font-latin">{sellerProfile?.commissionRate || 10}%</span>
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>{getCategoryPostButtonLabel(defaultCategory, currentLanguage)}</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3 scrollbar-none">
        {[
          { id: 'overview', label: 'پوختەی گشتی', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'orders', label: `داواکارییەکان (${myOrders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'products', label: `لیستی کاڵاکان (${myProducts.length})`, icon: <Package className="w-4 h-4" /> },
          { id: 'reviews', label: `ڕا و هەڵسەنگاندن (${getSellerReviews(sellerId).length})`, icon: <Star className="w-4 h-4 text-amber-500" /> },
          { id: 'captains', label: `کاپتنەکانی گەیاندن (${storeDriversList.length})`, icon: <UserCheck className="w-4 h-4 text-emerald-500" /> },
          { id: 'subscriptions', label: '👑 ئابوونەی فرۆشگا و داشکاندنی نیسبە', icon: <Award className="w-4 h-4 text-amber-500" /> },
          { id: 'agreement', label: 'ڕێککەوتنی پۆینتی شاخ و خاوەن کار', icon: <Award className="w-4 h-4 text-amber-500" /> },
          { id: 'delivery', label: 'ناوچە و دوری گەیاندن (Delivery Radius)', icon: <MapPin className="w-4 h-4 text-orange-500" /> },
          { id: 'wallet', label: 'جزدان و قازانج', icon: <DollarSign className="w-4 h-4" /> },
          { id: 'settings', label: 'ڕێکخستنی فرۆشگا', icon: <Settings className="w-4 h-4" /> }
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as any)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              activeTab === tab.id
                ? 'bg-slate-900 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {tab.icon}
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Subscription Plans & Commission Discounts Tab */}
      {activeTab === 'subscriptions' && (
        <SubscriptionManagementPanel defaultRole="seller" onNavigate={onNavigate} />
      )}

      {/* Shakh & Business Owner Agreement Tab */}
      {activeTab === 'agreement' && (() => {
        const agreement = getSellerAgreement(sellerId);
        const merchantWallet = getUserPointsWallet(sellerId, 'seller');

        return (
          <div className="space-y-6">
            
            {/* Interactive Commission Rate & Agreement Card */}
            {activeSeller && (
              <CommissionAgreementCard seller={activeSeller} />
            )}
            
            {/* Main Agreement Banner */}
            <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white p-6 sm:p-8 rounded-3xl shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-6">
              <div className="space-y-2">
                <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-black">
                  <Award className="w-4 h-4 text-amber-200" />
                  <span>ڕێککەوتنی شەریکایەتی و پۆینتی شاخ (Shakh Partnership)</span>
                </div>
                <h2 className="text-2xl font-black">{agreement.sellerName}</h2>
                <p className="text-xs text-amber-100/90 max-w-xl leading-relaxed">
                  سیستەمی پۆینتی شاخ و خاوەن کار ڕێککەوتنێکی دوولایەنەیە بۆ پاداشتکردنی کڕیاران، خاوەن کاران، و شۆفێرانی گەیاندن لەسەر هەر فرۆشێک.
                </p>
              </div>

              <div className="bg-white/10 backdrop-blur-md p-4 rounded-2xl border border-white/20 text-center min-w-[180px]">
                <span className="text-xs text-amber-100 font-bold block">ئاستی ڕێککەوتنی چالاك:</span>
                <span className="text-2xl font-black font-latin text-amber-300 block my-1">
                  {agreement.tier} Tier
                </span>
                <span className="text-[10px] text-emerald-300 font-bold bg-emerald-950/40 px-2.5 py-0.5 rounded-full border border-emerald-400/30">
                  {agreement.status === 'active' ? 'چالاککراوە ✓' : 'لە چاوەڕوانیدایە'}
                </span>
              </div>
            </div>

            {/* Agreement Terms Breakdown Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              
              {/* Customer Points Rate */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>پاداشتی کڕیاران (Customer Reward)</span>
                  <Gift className="w-5 h-5 text-amber-500" />
                </div>
                <h3 className="text-2xl font-black text-slate-900 font-latin">
                  {agreement.customerRewardPercent}٪ <span className="text-xs font-sans text-slate-500">لە بڕی داواکاری</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  کڕیار لەسەر هەر داواکارییەکی {agreement.sellerName} {agreement.customerRewardPercent}٪ی بڕەکە بە پۆینتی شڕینی بەدەستدەهێنێت.
                </p>
              </div>

              {/* Merchant Growth Points Rate */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>پۆینتی گەشەی خاوەن کار (Merchant Growth)</span>
                  <TrendingUp className="w-5 h-5 text-emerald-500" />
                </div>
                <h3 className="text-2xl font-black text-emerald-600 font-latin">
                  {agreement.sellerRewardPercent}٪ <span className="text-xs font-sans text-slate-500">لە کۆی فرۆش</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  تۆ وەک خاوەن کار {agreement.sellerRewardPercent}٪ لە بڕی فرۆشەکەت بە پۆینت وەردەگریت بۆ داشکاندنی کۆمسیۆن یان ڕیکلام.
                </p>
              </div>

              {/* Driver Bonus Points */}
              <div className="bg-white p-5 rounded-3xl border border-slate-200 shadow-xs space-y-2">
                <div className="flex items-center justify-between text-xs font-bold text-slate-500">
                  <span>بۆنسی کاپتنی گەیاندن (Driver Bonus)</span>
                  <Truck className="w-5 h-5 text-blue-500" />
                </div>
                <h3 className="text-2xl font-black text-blue-600 font-latin">
                  +{agreement.driverBonusPoints} <span className="text-xs font-sans text-slate-500">پۆینت بۆ هەر گەیاندنێک</span>
                </h3>
                <p className="text-[11px] text-slate-500 leading-relaxed">
                  پۆینتی هاندەر بۆ شۆفێرانی گەیاندن تا داواکارییەکانی فرۆشگاکەت خێراتر بگەیەنن.
                </p>
              </div>

            </div>

            {/* Merchant Wallet & Points Redemption */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900">پۆینتە کۆکراوەکانی خاوەن کار</h3>
                  <p className="text-xs text-slate-500 mt-0.5">پۆینتەکان بەپێی ڕێککەوتنی شاخ لەسەر هەر فرۆشێک زیاد دەبن</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-xs text-slate-500 font-bold">کۆی پۆینتی بەردەست:</span>
                  <span className="text-2xl font-black text-amber-600 font-latin bg-amber-50 px-4 py-1.5 rounded-2xl border border-amber-200">
                    {merchantWallet.totalPoints.toLocaleString()} پۆینت
                  </span>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                
                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">داشکاندنی ٠.٥٪ لە کۆمسیۆنی شاخ</span>
                    <span className="text-xs font-bold text-amber-600 font-latin">500 پۆینت</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    بەکارهێنانی ٥٠٠ پۆینتی خاوەن کار بۆ کەمکردنەوەی ڕێژەی کۆمسیۆنی شاخ بە ڕێژەی ٠.٥٪ لەسەر ٢٠ داواکاری دواتر.
                  </p>
                  <button
                    onClick={() => {
                      const res = redeemPoints(sellerId, 500, 'داشکاندنی ٠.٥٪ لە کۆمسیۆنی شاخ بۆ ۲۰ داواکاری', 'seller');
                      alert(res.message);
                    }}
                    disabled={merchantWallet.totalPoints < 500}
                    className={`w-full py-2.5 text-xs font-bold rounded-xl cursor-pointer ${
                      merchantWallet.totalPoints >= 500
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    داواکردنی داشکاندنی کۆمسیۆن
                  </button>
                </div>

                <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-black text-slate-900">نیشانی "فرۆشگای تایبەت" (Featured Store)</span>
                    <span className="text-xs font-bold text-amber-600 font-latin">1,000 پۆینت</span>
                  </div>
                  <p className="text-xs text-slate-500">
                    پیشاندانی فرۆشگاکەت لە سێرچ و سەرپەڕەی سەرەکی شاخ وەک فرۆشگای پێشنیارکراو بۆ ماوەی ٧ ڕۆژ.
                  </p>
                  <button
                    onClick={() => {
                      const res = redeemPoints(sellerId, 1000, 'نیشانی فرۆشگای تایبەت لە پەڕەی سەرەکی شاخ (٧ ڕۆژ)', 'seller');
                      alert(res.message);
                    }}
                    disabled={merchantWallet.totalPoints < 1000}
                    className={`w-full py-2.5 text-xs font-bold rounded-xl cursor-pointer ${
                      merchantWallet.totalPoints >= 1000
                        ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-xs'
                        : 'bg-slate-200 text-slate-400 cursor-not-allowed'
                    }`}
                  >
                    داواکردنی نیشانی فرۆشگای تایبەت
                  </button>
                </div>

              </div>
            </div>

            {/* Agreement Notes */}
            {agreement.agreementNotes && (
              <div className="p-4 bg-amber-50 border border-amber-200 rounded-2xl text-xs text-amber-900 space-y-1">
                <span className="font-bold block">تێبینیەکانی ڕێککەوتنی شاخ و خاوەن کار:</span>
                <p className="text-amber-800 leading-relaxed">{agreement.agreementNotes}</p>
              </div>
            )}

          </div>
        );
      })()}

      {/* Overview Tab */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-400 font-bold">کۆی فرۆش (Gross Sales)</span>
              <h3 className="text-xl font-black text-slate-900 font-latin">{totalGrossSales.toLocaleString()} د.ع</h3>
              <p className="text-[11px] text-emerald-600 font-semibold">تەواوی داواکارییەکان</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-400 font-bold">قازانجی پاکی گەیشتوو (Net)</span>
              <h3 className="text-xl font-black text-emerald-600 font-latin">{netDeliveredEarnings.toLocaleString()} د.ع</h3>
              <p className="text-[11px] text-slate-400">داواکارییە گەیەندراوەکان</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-400 font-bold">کۆمسیۆنی (شاخ) (Shakh Fee)</span>
              <h3 className="text-xl font-black text-orange-600 font-latin">{totalCommissionDeducted.toLocaleString()} د.ع</h3>
              <p className="text-[11px] text-slate-400">لێبڕینی ئۆتۆماتیک لە کاتی گەیاندن</p>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs text-slate-400 font-bold">لە پرۆسەی گەیاندندا (Pending)</span>
              <h3 className="text-xl font-black text-blue-600 font-latin">{pendingEarnings.toLocaleString()} د.ع</h3>
              <p className="text-[11px] text-slate-400">دوای گەیاندن دەچێتە جزدان</p>
            </div>
          </div>

          {/* Recent Orders in Overview */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-sm font-black text-slate-900">نوێترین داواکارییەکان</h3>
            <div className="divide-y divide-slate-100">
              {myOrders.slice(0, 5).map(order => (
                <div key={order.id} className="py-3 flex items-center justify-between gap-3 text-xs">
                  <div className="flex items-center gap-3">
                    <div className="w-9 h-9 rounded-xl bg-orange-50 text-orange-600 flex items-center justify-center font-bold">
                      <ShoppingBag className="w-4 h-4" />
                    </div>
                    <div>
                      <span className="font-bold text-slate-900 font-latin">{order.orderNumber}</span>
                      <p className="text-[10px] text-slate-400">{order.deliveryCity} • {order.items.length} کاڵا</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <StatusBadge status={order.status} />
                    <span className="font-black text-slate-900 font-latin">{order.total.toLocaleString()} د.ع</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Orders Tab */}
      {activeTab === 'orders' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="text-sm font-black text-slate-900">بەڕێوەبردنی داواکارییەکان</h3>

          {myOrders.length === 0 ? (
            <EmptyState
              type="orders"
              title="هیچ داواکارییەکت نییە"
              description="هێشتا هیچ داواکارییەک بۆ فرۆشگاکەت لەلایەن کڕیارانەوە تۆمار نەکراوە."
              actionLabel="ڕێکخستنەکانی ناوچەی گەیاندن"
              onAction={() => setActiveTab('delivery')}
            />
          ) : (
            <div className="space-y-4">
              {myOrders.map(order => (
                <div key={order.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className="font-bold text-slate-900 font-latin">{order.orderNumber}</span>
                        <StatusBadge status={order.status} />
                        {order.isStoreDelivery || order.deliveryMode === 'store_delivery' ? (
                          <span className="px-2 py-0.5 bg-orange-100 text-orange-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                            <Store className="w-3 h-3" />
                            دلیڤەری تایبەتی دوکان
                          </span>
                        ) : (
                          <span className="px-2 py-0.5 bg-teal-100 text-teal-800 text-[10px] font-bold rounded-md flex items-center gap-1">
                            <Truck className="w-3 h-3" />
                            کاپتنی خێرای شاخ
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">کڕیار: {order.customerName || order.customerId} ({order.customerPhone || '0750...'}) • ناونیشان: {order.deliveryAddress}</p>
                    </div>

                    <div className="flex items-center gap-2 flex-wrap">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'accepted')}
                          className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700 cursor-pointer"
                        >
                          پەسەندکردن
                        </button>
                      )}
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="px-3.5 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600 cursor-pointer"
                        >
                          دەستپێکردنی ئامادەکردن
                        </button>
                      )}
                      {['accepted', 'preparing'].includes(order.status) && (
                        <button
                          onClick={() => setDispatchOrderModal(order)}
                          className="px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700 flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Navigation className="w-3.5 h-3.5" />
                          <span>دیاریکردنی گەیاندن (Dispatch)</span>
                        </button>
                      )}
                      {order.status === 'ready' && !order.driverId && !order.storeDriverId && (
                        <button
                          onClick={() => setDispatchOrderModal(order)}
                          className="px-3.5 py-1.5 bg-emerald-600 text-white rounded-xl text-xs font-bold hover:bg-emerald-700 flex items-center gap-1 cursor-pointer shadow-xs"
                        >
                          <Truck className="w-3.5 h-3.5" />
                          <span>ناردن بۆ شۆفێر / کاپتن</span>
                        </button>
                      )}
                      {order.storeDriverName && (
                        <span className="text-[11px] font-bold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                          شۆفێری دوکان: {order.storeDriverName}
                        </span>
                      )}
                      {order.driverName && !order.storeDriverName && (
                        <span className="text-[11px] font-bold text-teal-700 bg-teal-50 px-2.5 py-1 rounded-lg border border-teal-200">
                          کاپتنی شاخ: {order.driverName}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Items */}
                  <div className="space-y-1.5">
                    {order.items.map((item, idx) => (
                      <div key={idx} className="flex justify-between text-xs text-slate-700">
                        <span>{item.quantity}x {item.productTitle}</span>
                        <span className="font-bold font-latin">{item.total.toLocaleString()} د.ع</span>
                      </div>
                    ))}
                  </div>

                  <div className="pt-2 border-t border-slate-200 flex justify-between text-xs font-black text-slate-900">
                    <span>کۆی گشتی:</span>
                    <span className="text-orange-600 font-latin">{order.total.toLocaleString()} د.ع</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {/* Products Tab */}
      {activeTab === 'products' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div>
              <h3 className="text-sm font-black text-slate-900">کاڵاکانی ئەم فرۆشگایە ({myProducts.length})</h3>
              <p className="text-xs text-slate-500 mt-0.5">بەڕێوەبردنی تەواوی کاڵاکان بەپێی بەش و تایبەتمەندییە داینامیکییەکان</p>
            </div>
            <button
              onClick={openAddModal}
              className="px-4 py-2.5 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-1.5 cursor-pointer self-start sm:self-auto"
            >
              <Plus className="w-4 h-4" />
              <span>{getCategoryPostButtonLabel(defaultCategory, currentLanguage)}</span>
            </button>
          </div>

          {myProducts.length === 0 ? (
            <EmptyState
              type="products"
              title="هیچ کاڵایەک لە فرۆشگاکەتدا نییە"
              description="سەرجەم کاڵاکانت لێرە بەڕێوەدەبرێن. یەکەم کاڵای خۆت ئێستا زیاد بکە."
              actionLabel="+ زیادکردنی کاڵای نوێ"
              onAction={openAddModal}
            />
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {myProducts.map(prod => (
              <div key={prod.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3 hover:border-orange-300 transition-colors">
                <div className="space-y-2.5">
                  <div className="flex gap-3 items-start">
                    <img src={prod.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0" />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap mb-1">
                        <CategoryBadge category={prod.category} />
                        {prod.subcategory && (
                          <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                            {prod.subcategory}
                          </span>
                        )}
                      </div>
                      <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{prod.title}</h4>
                      <div className="flex items-baseline gap-2 mt-0.5">
                        <span className="text-xs font-black text-orange-600 font-latin">
                          {(prod.discountPrice || prod.price).toLocaleString()} د.ع
                        </span>
                        {prod.discountPrice && (
                          <span className="text-[10px] text-slate-400 line-through font-latin">
                            {prod.price.toLocaleString()}
                          </span>
                        )}
                      </div>
                      <p className="text-[10px] text-slate-500 mt-0.5">کۆگا: {prod.stock} {prod.unit || 'دانە'}</p>
                    </div>
                  </div>

                  {/* Dynamic Category Specific Meta Badges */}
                  <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-1 text-[10px]">
                    {prod.category === 'clothes' && (
                      <>
                        {prod.sizes && prod.sizes.length > 0 && (
                          <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                            قەبارە: {prod.sizes.join(', ')}
                          </span>
                        )}
                        {prod.colors && prod.colors.length > 0 && (
                          <span className="bg-purple-100 text-purple-800 font-bold px-2 py-0.5 rounded">
                            {prod.colors.length} ڕەنگ
                          </span>
                        )}
                        {prod.brand && (
                          <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded font-latin">
                            {prod.brand}
                          </span>
                        )}
                      </>
                    )}

                    {prod.category === 'electronics' && (
                      <>
                        {prod.brand && (
                          <span className="bg-blue-100 text-blue-800 font-bold px-2 py-0.5 rounded font-latin">
                            {prod.brand}
                          </span>
                        )}
                        {prod.model && (
                          <span className="bg-blue-50 text-blue-700 font-bold px-2 py-0.5 rounded font-latin">
                            {prod.model}
                          </span>
                        )}
                        {prod.warrantyMonths && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            گارانتی {prod.warrantyMonths} مانگ
                          </span>
                        )}
                      </>
                    )}

                    {prod.category === 'cars' && (
                      <>
                        {prod.year && (
                          <span className="bg-amber-100 text-amber-900 font-bold px-2 py-0.5 rounded font-latin">
                            مۆدێل {prod.year}
                          </span>
                        )}
                        {prod.mileageKm !== undefined && (
                          <span className="bg-amber-50 text-amber-800 font-bold px-2 py-0.5 rounded font-latin">
                            {prod.mileageKm.toLocaleString()} کم
                          </span>
                        )}
                        {prod.transmission && (
                          <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                            {prod.transmission === 'automatic' ? 'ئۆتۆماتیک' : 'عادی'}
                          </span>
                        )}
                      </>
                    )}

                    {prod.category === 'food' && (
                      <>
                        {prod.prepTimeMinutes && (
                          <span className="bg-orange-100 text-orange-800 font-bold px-2 py-0.5 rounded font-latin">
                            ⏱ {prod.prepTimeMinutes} خولەک
                          </span>
                        )}
                        {prod.isSpicy && (
                          <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                            🔥 تیژ
                          </span>
                        )}
                        {prod.isVegetarian && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            🥗 گیاخۆری
                          </span>
                        )}
                      </>
                    )}

                    {prod.category === 'fresh_meat' && (
                      <>
                        {prod.cutType && (
                          <span className="bg-rose-100 text-rose-800 font-bold px-2 py-0.5 rounded">
                            {prod.cutType}
                          </span>
                        )}
                        {prod.meatType && (
                          <span className="bg-rose-50 text-rose-700 font-bold px-2 py-0.5 rounded">
                            {prod.meatType}
                          </span>
                        )}
                      </>
                    )}

                    {prod.category === 'fruits_vegetables' && (
                      <>
                        {prod.isOrganic && (
                          <span className="bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded">
                            🌿 ئۆرگانیک
                          </span>
                        )}
                        {prod.origin && (
                          <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded">
                            {prod.origin}
                          </span>
                        )}
                      </>
                    )}

                    {prod.category === 'dairy' && (
                      <>
                        {prod.expiryInfo && (
                          <span className="bg-cyan-100 text-cyan-800 font-bold px-2 py-0.5 rounded">
                            بەسەرچوون: {prod.expiryInfo}
                          </span>
                        )}
                      </>
                    )}

                    {prod.category === 'beauty' && (
                      <>
                        {prod.brand && (
                          <span className="bg-pink-100 text-pink-800 font-bold px-2 py-0.5 rounded font-latin">
                            {prod.brand}
                          </span>
                        )}
                        {prod.volume && (
                          <span className="bg-slate-200 text-slate-700 font-bold px-2 py-0.5 rounded font-latin">
                            {prod.volume}
                          </span>
                        )}
                      </>
                    )}
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    prod.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {prod.stock > 0 ? 'بەردەستە' : 'تەواو بووە'}
                  </span>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEditModal(prod)}
                      className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                      title="دەستکاری کاڵا"
                    >
                      <Edit className="w-4 h-4" />
                    </button>
                    <button
                      onClick={() => {
                        if (confirm(`ئایا دڵنیایت لە سڕینەوەی کاڵای "${prod.title}"؟`)) {
                          deleteProduct(prod.id);
                        }
                      }}
                      className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg cursor-pointer transition-colors"
                      title="سڕینەوە"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Customer Reviews & Ratings Tab */}
      {activeTab === 'reviews' && (() => {
        const sellerReviews = getSellerReviews(sellerId);
        const totalReviews = sellerReviews.length;
        const avgRating = totalReviews > 0
          ? Number((sellerReviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews).toFixed(1))
          : (sellerProfile?.rating || 4.9);

        const handleSendSellerReply = async (reviewId: string) => {
          if (!replyText.trim()) return;
          await replyToReview(reviewId, replyText.trim(), 'seller');
          setReplyingReviewId(null);
          setReplyText('');
        };

        return (
          <div className="space-y-6">
            {/* Reviews Score Card */}
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
              <div className="md:col-span-4 text-center md:border-l md:border-slate-100 md:pl-6 space-y-2">
                <span className="text-xs font-bold text-slate-400">تێکڕای هەڵسەنگاندنی فرۆشگاکەت</span>
                <div className="flex items-center justify-center gap-2">
                  <span className="text-5xl font-black font-latin text-slate-900">{avgRating}</span>
                  <div className="text-right">
                    <div className="flex text-amber-400">
                      {[1, 2, 3, 4, 5].map(s => (
                        <Star key={s} className="w-4 h-4 fill-amber-400" />
                      ))}
                    </div>
                    <span className="text-xs text-slate-400 font-latin">{totalReviews} هەڵسەنگاندنی ڕاستەقینە</span>
                  </div>
                </div>
                <p className="text-xs text-emerald-600 font-bold bg-emerald-50 py-1 px-3 rounded-full inline-block">
                  ڕەزامەندی باڵای کڕیاران لە کوالیتی بەرهەمەکانت ⭐
                </p>
              </div>

              {/* Stars Breakdown */}
              <div className="md:col-span-8 space-y-2">
                {[5, 4, 3, 2, 1].map(starsCount => {
                  const count = sellerReviews.filter(r => r.rating === starsCount).length;
                  const percent = totalReviews > 0 ? (count / totalReviews) * 100 : starsCount === 5 ? 100 : 0;
                  return (
                    <div key={starsCount} className="flex items-center gap-3 text-xs">
                      <span className="w-12 text-slate-500 font-latin font-bold flex items-center gap-1">
                        <span>{starsCount}</span>
                        <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                      </span>
                      <div className="flex-1 bg-slate-100 rounded-full h-2.5 overflow-hidden">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all"
                          style={{ width: `${percent}%` }}
                        ></div>
                      </div>
                      <span className="w-8 text-slate-400 font-latin text-left">{count}</span>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Reviews List */}
            <div className="space-y-4">
              <h3 className="text-base font-black text-slate-900">
                ڕا و سەرنجی کڕیارانی فرۆشگاکەت ({totalReviews})
              </h3>

              {totalReviews === 0 ? (
                <EmptyState
                  type="feedbacks"
                  title="هێشتا هیچ هەڵسەنگاندنێک تۆمار نەکراوە"
                  description="دوای تەواوبوونی داواکارییەکان، کڕیاران ڕا و هەڵسەنگاندنی خۆیان بۆ فرۆشگاکەت دەنوسن."
                  actionLabel="بینینی کاڵاکان"
                  onAction={() => setActiveTab('products')}
                />
              ) : (
                <div className="grid grid-cols-1 gap-4">
                  {sellerReviews.map(rev => (
                    <div
                      key={rev.id}
                      className="bg-white p-5 rounded-3xl border border-slate-200 space-y-4 hover:border-orange-300 transition-colors shadow-2xs"
                    >
                      {/* Header */}
                      <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-100 pb-3">
                        <div className="flex items-center gap-3">
                          <img
                            src={rev.userAvatar || 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150'}
                            alt=""
                            className="w-10 h-10 rounded-full object-cover border border-slate-200"
                          />
                          <div>
                            <h4 className="text-xs sm:text-sm font-black text-slate-900">{rev.userName}</h4>
                            <p className="text-[11px] text-slate-400">
                              {rev.orderNumber && <span className="font-latin font-bold text-orange-600 ml-2">داواکاری: {rev.orderNumber}</span>}
                              <span>{new Date(rev.createdAt).toLocaleDateString()}</span>
                            </p>
                          </div>
                        </div>

                        {/* Stars */}
                        <div className="flex items-center gap-1 bg-amber-50 px-3 py-1 rounded-xl border border-amber-200">
                          {[1, 2, 3, 4, 5].map(s => (
                            <Star
                              key={s}
                              className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-slate-200'}`}
                            />
                          ))}
                          <span className="text-xs font-black font-latin text-amber-900 mr-1">{rev.rating}.0</span>
                        </div>
                      </div>

                      {/* Tags */}
                      {rev.tags && rev.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5">
                          {rev.tags.map((tag, i) => (
                            <span
                              key={i}
                              className="px-2.5 py-0.5 rounded-lg bg-orange-50 text-orange-800 text-[11px] font-bold border border-orange-100"
                            >
                              {tag}
                            </span>
                          ))}
                        </div>
                      )}

                      {/* Comment Body */}
                      <p className="text-xs text-slate-700 leading-relaxed bg-slate-50/70 p-3 rounded-2xl border border-slate-100">
                        "{rev.comment}"
                      </p>

                      {/* Seller Reply Section */}
                      {rev.sellerReply ? (
                        <div className="p-3 bg-orange-50/90 border border-orange-200 rounded-2xl space-y-1 mr-4">
                          <div className="flex items-center justify-between text-[11px] font-black text-orange-900">
                            <span>وەڵامی فرۆشگا ({sellerProfile?.storeName || 'خاوەن کار'}):</span>
                            <span className="text-[10px] text-orange-600 font-normal">
                              {new Date(rev.sellerReply.createdAt).toLocaleDateString()}
                            </span>
                          </div>
                          <p className="text-xs text-orange-800">{rev.sellerReply.comment}</p>
                        </div>
                      ) : (
                        <div>
                          {replyingReviewId === rev.id ? (
                            <div className="space-y-2 pt-2 border-t border-slate-100">
                              <textarea
                                value={replyText}
                                onChange={(e) => setReplyText(e.target.value)}
                                placeholder="وەڵامی کڕیار بدەرەوە و سوپاسی بکە..."
                                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:outline-hidden"
                                rows={2}
                              />
                              <div className="flex justify-end gap-2">
                                <button
                                  onClick={() => setReplyingReviewId(null)}
                                  className="px-3 py-1.5 text-xs text-slate-500 font-bold"
                                >
                                  پاشگەزبوونەوە
                                </button>
                                <button
                                  onClick={() => handleSendSellerReply(rev.id)}
                                  className="px-4 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold shadow-xs cursor-pointer flex items-center gap-1.5"
                                >
                                  <Send className="w-3.5 h-3.5" />
                                  <span>ناردنی وەڵام</span>
                                </button>
                              </div>
                            </div>
                          ) : (
                            <button
                              onClick={() => {
                                setReplyingReviewId(rev.id);
                                setReplyText('');
                              }}
                              className="text-xs font-bold text-orange-600 hover:text-orange-700 flex items-center gap-1.5 cursor-pointer pt-1"
                            >
                              <MessageSquare className="w-3.5 h-3.5" />
                              <span>وەڵامدانەوە بە کڕیار</span>
                            </button>
                          )}
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="space-y-6">
          {activeSeller && (
            <CommissionAgreementCard seller={activeSeller} />
          )}

          <div className="bg-white dark:bg-slate-900 p-6 rounded-3xl border border-slate-200 dark:border-slate-800 space-y-6">
            <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">جزدانی دارایی و مێژووی کۆمسیۆنەکان</h3>
            
            <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 to-slate-800 text-white flex flex-col sm:flex-row items-center justify-between gap-4">
              <div>
                <span className="text-xs text-slate-400">باڵانسی ئامادە بۆ ڕاکێشان</span>
                <h2 className="text-3xl font-black text-orange-400 font-latin">{netDeliveredEarnings.toLocaleString()} د.ع</h2>
                <p className="text-[11px] text-slate-300 mt-1">ئۆتۆماتیک لە کاتی گەیاندن هەژمار دەکرێت.</p>
              </div>
              <button
                onClick={() => alert('داواکاری ڕاکێشانی پارە بۆ ئەدمین نێردرا.')}
                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
              >
                داواکردنی ڕاکێشانی پارە (Payout)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delivery Radius & Zone Settings Tab */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-l from-orange-600 to-amber-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
                <Compass className="w-4 h-4 text-amber-200" />
                <span>سیستەمی دوولایەنەی گەیاندن: شاخ ئێکسپرێس و دلیڤەری تایبەتی دوکان</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                بەڕێوەبردنی دلیڤەری شاخ و دلیڤەری دوکان بەجیا
              </h2>
              <p className="text-xs text-orange-100 leading-relaxed">
                دەتوانیت بە ئارەزووی خۆت دیاری بکەیت کە کاڵاکانت لەلایەن تۆڕی کاپتنانی فەرمی شاخ بگەیەنرێن، یان لەلایەن شۆفێرە تایبەتەکانی دوکانەکەت خۆت (١٠٠٪ کرێی گەیاندن بۆ دوکان).
              </p>
            </div>

            <div className="flex items-center gap-2 flex-wrap z-10">
              <button
                type="button"
                onClick={() => onNavigate('store-delivery')}
                className="px-4 py-2.5 bg-white text-orange-900 hover:bg-orange-50 rounded-xl font-bold text-xs flex items-center gap-2 shadow-md transition-all cursor-pointer"
              >
                <Store className="w-4 h-4 text-orange-600" />
                <span>داشبۆردی شۆفێرانی دوکان</span>
              </button>
            </div>
          </div>

          {deliverySaveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>ڕێکخستنەکان بە سەرکەوتوویی پاشەکەوت کران!</span>
            </div>
          )}

          {/* Sub-channel Switcher Tabs */}
          <div className="flex items-center gap-2 border-b border-slate-200 pb-3 flex-wrap">
            <button
              type="button"
              onClick={() => setDeliverySection('shakh_express')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                deliverySection === 'shakh_express'
                  ? 'bg-teal-700 text-white shadow-md shadow-teal-700/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Truck className="w-4 h-4" />
              <span>١. دلیڤەری خێرای شاخ (Shakh Express)</span>
            </button>

            <button
              type="button"
              onClick={() => setDeliverySection('store_inhouse')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                deliverySection === 'store_inhouse'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <Store className="w-4 h-4" />
              <span>٢. دلیڤەری تایبەتی دوکان (Store In-House Delivery)</span>
            </button>

            <button
              type="button"
              onClick={() => setDeliverySection('drivers_team')}
              className={`px-5 py-2.5 rounded-2xl font-bold text-xs flex items-center gap-2 transition-all cursor-pointer ${
                deliverySection === 'drivers_team'
                  ? 'bg-orange-500 text-white shadow-md shadow-orange-500/20'
                  : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
              }`}
            >
              <UserCheck className="w-4 h-4" />
              <span>٣. شۆفێرە تایبەتەکانی دوکان ({storeDriversList.length})</span>
            </button>
          </div>

          {deliverySection === 'shakh_express' && (
            <div className="space-y-6">
          {/* Quick Presets for Category */}
          <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-orange-500" />
                <span>پێشنیارە ئامادەکراوەکان بەپێی جۆری فرۆشگا (Presets)</span>
              </h3>
              <span className="text-[11px] text-slate-400">یەک کلیک بۆ دانانی ڕێکخستنی نموونەیی</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
              {[
                { label: 'چێشتخانە و فاستفوود', range: '٠ - ١٢ کم', maxKm: 12, base: 2500, thres: 3, perKm: 250, cat: 'food' },
                { label: 'سوپەرمارکێت و بەقاڵی', range: '٠ - ١٥ کم', maxKm: 15, base: 3000, thres: 4, perKm: 200, cat: 'market' },
                { label: 'گۆشت و شیرەمەنی', range: '٠ - ١٨ کم', maxKm: 18, base: 3000, thres: 3, perKm: 250, cat: 'fresh_meat' },
                { label: 'سەوزە و میوەی تازە', range: '٠ - ٢٠ کم', maxKm: 20, base: 2500, thres: 3, perKm: 200, cat: 'fruits_vegetables' },
                { label: 'جلوبەرگ و فاشیۆن', range: '٠ - ٣٥ کم', maxKm: 35, base: 3500, thres: 5, perKm: 150, cat: 'clothes' },
                { label: 'ئەلیکترۆنیات و مۆبایل', range: '٠ - ٥٠ کم', maxKm: 50, base: 4000, thres: 5, perKm: 150, cat: 'electronics' },
                { label: 'بۆن و جوانکاری', range: '٠ - ٣٠ کم', maxKm: 30, base: 3000, thres: 4, perKm: 200, cat: 'beauty' },
                { label: 'سنوری ناوخۆیی خێرا', range: '٠ - ٨ کم', maxKm: 8, base: 2000, thres: 2, perKm: 300, cat: 'custom' },
              ].map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => {
                    setMinDist(0);
                    setMaxDist(p.maxKm);
                    setBaseFee(p.base);
                    setBaseThresholdKm(p.thres);
                    setPerKmFee(p.perKm);
                    setDeliveryNote(`گەیاندنی خێرا لە ٠ کم تا ${p.maxKm} کم بە نرخی گونجاو`);
                  }}
                  className={`p-3 rounded-2xl border text-right transition-all cursor-pointer ${
                    maxDist === p.maxKm
                      ? 'border-orange-500 bg-orange-50 text-orange-950 font-bold shadow-xs'
                      : 'border-slate-200 hover:border-slate-300 bg-slate-50/50 text-slate-700'
                  }`}
                >
                  <span className="block text-xs font-bold">{p.label}</span>
                  <span className="block text-[11px] text-orange-600 font-latin mt-0.5">{p.range}</span>
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* Delivery Settings Form (7 cols) */}
            <div className="lg:col-span-7 bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2 border-b border-slate-100 pb-3">
                <Sliders className="w-5 h-5 text-orange-500" />
                <span>ڕێکخستنی دوری و خەرجی گەیاندن</span>
              </h3>

              {/* Range Distance Slider */}
              <div className="space-y-3 bg-slate-50 dark:bg-slate-900 p-4 rounded-2xl border border-slate-200 dark:border-slate-700">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    سنوری دوری گەیاندن لە شوێنی فرۆشگا:
                  </label>
                  <span className="text-sm font-black text-orange-600 dark:text-orange-400 font-latin bg-white dark:bg-slate-800 px-3 py-1 rounded-xl border border-orange-200 dark:border-orange-800 shadow-2xs">
                    لە {minDist} کم هەتا {maxDist} کم
                  </span>
                </div>

                <input
                  type="range"
                  min={2}
                  max={60}
                  step={1}
                  value={maxDist}
                  onChange={(e) => setMaxDist(Number(e.target.value))}
                  className="w-full h-2.5 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />

                <div className="flex justify-between text-[11px] text-slate-400 dark:text-slate-400 font-latin">
                  <span>٠ کم (لەبەردەم فرۆشگا)</span>
                  <span>١٥ کم (ناوەندی شار)</span>
                  <span>٣٠ کم (دەوروبەر)</span>
                  <span>٦٠ کم (هەموو ناوچەکە)</span>
                </div>
              </div>

              {/* Base Fee & Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    نرخی بنەڕەتی گەیاندن (دینار) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={250}
                      value={baseFee}
                      onChange={(e) => setBaseFee(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-latin font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400">د.ع</span>
                  </div>
                  <p className="text-[10px] text-slate-400">نرخی بنەڕەت بۆ دوری سەرەتایی</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    دوری بنەڕەتی لەناو نرخدا (کم) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={0.5}
                      min={1}
                      max={20}
                      value={baseThresholdKm}
                      onChange={(e) => setBaseThresholdKm(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-latin font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400">کم</span>
                  </div>
                  <p className="text-[10px] text-slate-400">تا ئەم دوراییە تەنها نرخی بنەڕەت دەسەپێت</p>
                </div>
              </div>

              {/* Per Km Extra Fee & Free Delivery Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    زیادەی هەر کم دوای دوری بنەڕەت (دینار) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={50}
                      value={perKmFee}
                      onChange={(e) => setPerKmFee(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-latin font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400">د.ع / کم</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    گەیاندنی بێبەرامبەر سەرووی (دینار)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={5000}
                      value={freeDeliveryOver}
                      onChange={(e) => setFreeDeliveryOver(Number(e.target.value))}
                      placeholder="0 ئەگەر ناچالاک بێت"
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-latin font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400">د.ع</span>
                  </div>
                  <p className="text-[10px] text-slate-400">ئەگەر کڕین لەم بڕە زیاتر بوو، گەیاندن بەخۆڕاییە</p>
                </div>
              </div>

              {/* Strict Radius Toggle */}
              <div className="p-4 rounded-2xl bg-amber-50/70 dark:bg-amber-950/40 border border-amber-200/80 dark:border-amber-800/60 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-900 dark:text-amber-200">
                    ڕێسای توندی سنوری گەیاندن (Strict Delivery Boundary)
                  </h4>
                  <p className="text-[11px] text-amber-700 dark:text-amber-300 mt-0.5 leading-relaxed">
                    ئەگەر چالاک بێت، کڕیار ناتوانێت داواکاری بنێرێت ئەگەر دوری ناونیشانەکەی لە {maxDist} کم زیاتر بێت.
                  </p>
                </div>
                <label className="relative inline-flex items-center cursor-pointer flex-shrink-0 mt-1">
                  <input
                    type="checkbox"
                    checked={isStrict}
                    onChange={(e) => setIsStrict(e.target.checked)}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-300 dark:bg-slate-700 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {/* Delivery Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                  ڕوونکردنەوەی گەیاندن بۆ کڕیار
                </label>
                <input
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder={`وەک: گەیاندنی خێرا لە ٠ کم تا ${maxDist} کم لە هەولێر`}
                  className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs text-slate-900 dark:text-slate-100 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Neighborhoods Manager */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100 dark:border-slate-700">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  گەڕەکە سەرەکییە داپۆشراوەکان ({neighborhoods.length} گەڕەک دیاریکراوە):
                </label>

                <div className="flex gap-2">
                  <input
                    type="text"
                    value={newNeighborhoodInput}
                    onChange={(e) => setNewNeighborhoodInput(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === 'Enter' && newNeighborhoodInput.trim()) {
                        e.preventDefault();
                        if (!neighborhoods.includes(newNeighborhoodInput.trim())) {
                          setNeighborhoods([...neighborhoods, newNeighborhoodInput.trim()]);
                        }
                        setNewNeighborhoodInput('');
                      }
                    }}
                    placeholder="ناوی گەڕەک بنووسە و ئینتەر دابگرە..."
                    className="flex-1 bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white focus:outline-hidden focus:border-orange-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (newNeighborhoodInput.trim() && !neighborhoods.includes(newNeighborhoodInput.trim())) {
                        setNeighborhoods([...neighborhoods, newNeighborhoodInput.trim()]);
                        setNewNeighborhoodInput('');
                      }
                    }}
                    className="px-4 py-2.5 bg-slate-800 hover:bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                  >
                    زیادکردن
                  </button>
                </div>

                <div className="flex flex-wrap gap-1.5 pt-1">
                  {neighborhoods.map((n, i) => (
                    <span
                      key={i}
                      className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 border border-orange-200 text-orange-900 rounded-lg text-xs font-semibold"
                    >
                      <span>{n}</span>
                      <button
                        type="button"
                        onClick={() => setNeighborhoods(neighborhoods.filter((_, idx) => idx !== i))}
                        className="text-orange-500 hover:text-rose-600 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
              </div>

              {/* Save Button */}
              <div className="pt-4 border-t border-slate-100 flex items-center justify-between">
                <button
                  type="button"
                  disabled={isSavingDelivery}
                  onClick={async () => {
                    setIsSavingDelivery(true);
                    await updateSellerDeliveryZone(sellerId, {
                      minDistanceKm: minDist,
                      maxDistanceKm: maxDist,
                      baseFee,
                      baseDistanceThresholdKm: baseThresholdKm,
                      perKmExtraFee: perKmFee,
                      freeDeliveryThreshold: freeDeliveryOver > 0 ? freeDeliveryOver : undefined,
                      isStrictRadius: isStrict,
                      estimatedMinutesBase: baseMins,
                      estimatedMinutesPerKm: perKmMins,
                      coveredNeighborhoods: neighborhoods,
                      deliveryAvailabilityNote: deliveryNote || `گەیاندن لە ٠ کم تا ${maxDist} کم`
                    });
                    setIsSavingDelivery(false);
                    setDeliverySaveSuccess(true);
                    setTimeout(() => setDeliverySaveSuccess(false), 4000);
                  }}
                  className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white font-bold text-xs rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
                >
                  <Check className="w-4 h-4" />
                  <span>{isSavingDelivery ? 'خەریکی پاشەکەوتکردن...' : 'پاشەکەوتکردنی ڕێکخستنەکانی گەیاندن'}</span>
                </button>
              </div>
            </div>

            {/* Live Interactive Distance Simulator (5 cols) */}
            <div className="lg:col-span-5 space-y-6">
              
              {/* Simulator Card */}
              <div className="bg-slate-900 text-white p-6 rounded-3xl shadow-xl space-y-5 border border-slate-800">
                <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                  <div className="flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                    <h4 className="text-sm font-black text-white">تاقیکەرەوەی ڕاستەوخۆ (Live Simulator)</h4>
                  </div>
                  <span className="text-[10px] text-slate-400 bg-white/10 px-2 py-0.5 rounded-md">پێشبینی کڕیار</span>
                </div>

                {/* Distance Slider */}
                <div className="space-y-2">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400 font-bold">دوری تاقیکردنەوە:</span>
                    <span className="text-orange-400 font-black font-latin text-sm">{testSimDistance} کم</span>
                  </div>
                  <input
                    type="range"
                    min={0.5}
                    max={Math.max(40, maxDist + 10)}
                    step={0.5}
                    value={testSimDistance}
                    onChange={(e) => setTestSimDistance(Number(e.target.value))}
                    className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-orange-400"
                  />
                  <div className="flex justify-between text-[10px] text-slate-500 font-latin">
                    <span>٠.٥ کم</span>
                    <span>{baseThresholdKm} کم (بنەڕەت)</span>
                    <span>{maxDist} کم (سنور)</span>
                    <span>{maxDist + 10} کم</span>
                  </div>
                </div>

                {/* Subtotal Simulator */}
                <div className="space-y-1.5">
                  <label className="text-xs text-slate-400 font-bold block">بڕی کڕینی سەبەتە (بۆ پشکنینی بێبەرامبەر):</label>
                  <div className="flex gap-2">
                    {[15000, 35000, 55000, 85000].map(amt => (
                      <button
                        key={amt}
                        type="button"
                        onClick={() => setTestSimSubtotal(amt)}
                        className={`px-2.5 py-1 rounded-lg text-[11px] font-latin font-bold transition-all cursor-pointer ${
                          testSimSubtotal === amt
                            ? 'bg-orange-500 text-white'
                            : 'bg-white/10 text-slate-300 hover:bg-white/15'
                        }`}
                      >
                        {(amt / 1000)}k د.ع
                      </button>
                    ))}
                  </div>
                </div>

                {/* Live Output Box */}
                {(() => {
                  const dummySeller: SellerProfile = {
                    ...(sellerProfile || {} as any),
                    category: defaultCategory,
                    deliveryZone: {
                      minDistanceKm: minDist,
                      maxDistanceKm: maxDist,
                      baseFee,
                      baseDistanceThresholdKm: baseThresholdKm,
                      perKmExtraFee: perKmFee,
                      freeDeliveryThreshold: freeDeliveryOver,
                      isStrictRadius: isStrict,
                      estimatedMinutesBase: baseMins,
                      estimatedMinutesPerKm: perKmMins,
                      coveredNeighborhoods: neighborhoods
                    }
                  };
                  const res = calculateDeliveryFee({
                    seller: dummySeller,
                    distanceKm: testSimDistance,
                    subtotal: testSimSubtotal
                  });

                  return (
                    <div className="bg-white/5 border border-white/10 p-4 rounded-2xl space-y-3">
                      {/* Status indicator */}
                      <div className={`p-2.5 rounded-xl text-xs font-bold flex items-center gap-2 ${
                        res.statusType === 'in_range'
                          ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                          : res.statusType === 'warning'
                          ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}>
                        {res.statusType === 'in_range' && <CheckCircle className="w-4 h-4 flex-shrink-0" />}
                        {res.statusType === 'warning' && <AlertCircle className="w-4 h-4 flex-shrink-0" />}
                        {res.statusType === 'out_of_range' && <X className="w-4 h-4 flex-shrink-0" />}
                        <span>{res.statusText}</span>
                      </div>

                      {/* Fee & Time Details */}
                      <div className="grid grid-cols-2 gap-2 pt-1 text-xs">
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-slate-400 block text-[11px]">کرێی گەیاندن:</span>
                          <span className="text-base font-black text-amber-400 font-latin">
                            {res.isFreeDelivery ? 'بەخۆڕایی (Free)' : `${res.deliveryFee.toLocaleString()} د.ع`}
                          </span>
                        </div>
                        <div className="bg-white/5 p-3 rounded-xl">
                          <span className="text-slate-400 block text-[11px]">کاتی خەمڵێنراو:</span>
                          <span className="text-base font-black text-white font-latin">
                            ~{res.estimatedMinutes} خولەک
                          </span>
                        </div>
                      </div>

                      {/* Breakdown */}
                      <div className="text-[11px] text-slate-400 space-y-1 border-t border-white/10 pt-2 font-latin">
                        <div className="flex justify-between">
                          <span>نرخی بنەڕەت (تا {baseThresholdKm} کم):</span>
                          <span>{baseFee.toLocaleString()} د.ع</span>
                        </div>
                        {res.feeBreakdown.extraFee > 0 && (
                          <div className="flex justify-between text-orange-300">
                            <span>زیادەی دوری (+{(testSimDistance - baseThresholdKm).toFixed(1)} کم):</span>
                            <span>+{res.feeBreakdown.extraFee.toLocaleString()} د.ع</span>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })()}

              </div>

              {/* Visual Radius Radar Map Graphic */}
              <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-4">
                <h4 className="text-xs font-black text-slate-800 flex items-center gap-2">
                  <Navigation className="w-4 h-4 text-orange-500" />
                  <span>دیاگرامی بازنەیی گەیاندن (Coverage Circles)</span>
                </h4>

                <div className="relative h-44 bg-slate-950 rounded-2xl flex items-center justify-center overflow-hidden border border-slate-900">
                  {/* Outer Limit circle */}
                  <div className="absolute w-36 h-36 rounded-full border border-dashed border-orange-500/40 animate-spin" style={{ animationDuration: '30s' }} />
                  <div className="absolute w-36 h-36 rounded-full bg-orange-500/5" />
                  
                  {/* Mid threshold circle */}
                  <div className="absolute w-24 h-24 rounded-full border border-amber-400/50 bg-amber-500/10" />

                  {/* Inner base circle */}
                  <div className="absolute w-12 h-12 rounded-full border border-emerald-400 bg-emerald-500/20 flex items-center justify-center shadow-lg">
                    <Store className="w-5 h-5 text-white" />
                  </div>

                  {/* Radar sweep */}
                  <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-orange-500/10 to-transparent pointer-events-none" />

                  {/* Legend badges */}
                  <div className="absolute bottom-2 left-2 right-2 flex items-center justify-between text-[10px] font-bold text-white px-2">
                    <span className="text-emerald-400">٠ کم (فرۆشگا)</span>
                    <span className="text-amber-300">{baseThresholdKm} کم (بنەڕەت)</span>
                    <span className="text-orange-400">{maxDist} کم (سنور)</span>
                  </div>
                </div>
              </div>

            </div>

          </div>
          </div>
          )}

          {/* SECTION 2: STORE IN-HOUSE DELIVERY SETTINGS */}
          {deliverySection === 'store_inhouse' && (
            <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 shadow-xs space-y-6">
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                    <Store className="w-5 h-5 text-orange-500" />
                    <span>ڕێکخستنەکانی دلیڤەری تایبەتی دوکان (In-House Delivery)</span>
                  </h3>
                  <p className="text-xs text-slate-500 mt-1">
                    لێرە دیاری بکە کە ئایا دەتەوێت خۆت کاڵاکانت بە شۆفێری خۆت بگەیەنیت بە کڕیار، لەگەڵ دیاریکردنی کرێی گەیاندن.
                  </p>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 text-xs font-black rounded-full border border-emerald-300">
                  ١٠٠٪ کرێی گەیاندن بۆ تۆیە
                </span>
              </div>

              {/* Delivery Mode Choice */}
              <div className="space-y-3">
                <label className="text-xs font-bold text-slate-800 dark:text-slate-200 block">
                  شێوازی گەیاندنی فرۆشگاکەت لە ئەپڵیکەیشن:
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {[
                    { id: 'hybrid', title: 'دوولایەنە (Hybrid)', desc: 'کڕیار دەتوانێت لە نێوان دلیڤەری شاخ یان دلیڤەری دوکان هەڵبژێرێت', icon: '⚡' },
                    { id: 'store_delivery', title: 'تەنها دلیڤەری دوکان', desc: 'تەواوی داواکارییەکان لەلایەن شۆفێرانی خۆت دەگەیەنرێن', icon: '🏪' },
                    { id: 'shakh_delivery', title: 'تەنها دلیڤەری شاخ', desc: 'تەنها کاپتنانی خێرای شاخ داواکارییەکان دەگەیەنن', icon: '🛵' },
                  ].map(m => (
                    <button
                      key={m.id}
                      type="button"
                      onClick={() => setDeliveryMode(m.id as DeliveryMode)}
                      className={`p-4 rounded-2xl border text-right transition-all cursor-pointer space-y-1.5 ${
                        deliveryMode === m.id
                          ? 'border-orange-500 bg-orange-50/70 dark:bg-orange-950/40 text-orange-950 dark:text-orange-200 shadow-xs'
                          : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 dark:hover:border-slate-600 bg-white dark:bg-slate-800 text-slate-700 dark:text-slate-200'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-black text-xs">{m.title}</span>
                        <span className="text-lg">{m.icon}</span>
                      </div>
                      <p className="text-[11px] text-slate-500 dark:text-slate-400 leading-relaxed">{m.desc}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Store Delivery Pricing */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4 border-t border-slate-100 dark:border-slate-700">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    کرێی دیاریکراوی دلیڤەری دوکان (دینار) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={250}
                      value={storeDeliveryFee}
                      onChange={(e) => setStoreDeliveryFee(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-latin font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400">د.ع</span>
                  </div>
                  <p className="text-[10px] text-slate-400">ئەم بڕە ڕاستەوخۆ دەچێتە سەر باڵانسی فرۆشگا</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    گەیاندنی بەخۆڕایی لە کڕینی سەرووی (دینار)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={5000}
                      value={storeFreeDeliveryOver}
                      onChange={(e) => setStoreFreeDeliveryOver(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-latin font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400">د.ع</span>
                  </div>
                  <p className="text-[10px] text-slate-400">بۆ هاندانی کڕیار بۆ کڕینی زیاتر</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-800 dark:text-slate-200">
                    کاتی خەمڵێنراوی گەیاندن (خولەک) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={5}
                      value={storeEstimatedMins}
                      onChange={(e) => setStoreEstimatedMins(Number(e.target.value))}
                      className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-xl p-3 text-xs font-latin font-bold text-slate-800 dark:text-slate-200 focus:bg-white dark:focus:bg-slate-900 focus:outline-hidden focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400">خولەک</span>
                  </div>
                  <p className="text-[10px] text-slate-400">وەک: ٢٠ بۆ ٣٠ خولەک</p>
                </div>
              </div>

              {/* Save In-House Settings */}
              <button
                type="button"
                onClick={handleSaveStoreDeliverySettings}
                disabled={isSavingDelivery}
                className="px-8 py-3.5 bg-orange-500 hover:bg-orange-600 text-white rounded-2xl font-bold text-xs shadow-md shadow-orange-500/20 flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-50"
              >
                <Save className="w-4 h-4" />
                <span>{isSavingDelivery ? 'پاشەکەوت دەکرێت...' : 'پاشەکەوتکردنی ڕێکخستنەکانی دلیڤەری دوکان'}</span>
              </button>
            </div>
          )}

          {/* SECTION 3: STORE DRIVERS TEAM MANAGEMENT */}
          {deliverySection === 'drivers_team' && (
            <CaptainManager
              sellerId={sellerId}
              sellerName={sellerProfile?.storeName}
              drivers={storeDriversList}
              onAddDriver={async (d) => {
                const res = await addStoreDriver(sellerId, d);
                if (res.success) {
                  const created: StoreDriver = { ...d, id: res.driverId || `sdrv-${Date.now()}` };
                  setStoreDriversList(prev => [...prev, created]);
                }
                return res;
              }}
              onUpdateDriver={async (driverId, updates) => {
                await updateStoreDriver(sellerId, driverId, updates);
                setStoreDriversList(prev => prev.map(drv => drv.id === driverId ? { ...drv, ...updates } : drv));
              }}
              onDeleteDriver={async (driverId) => {
                await deleteStoreDriver(sellerId, driverId);
                setStoreDriversList(prev => prev.filter(drv => drv.id !== driverId));
              }}
            />
          )}

        </div>
      )}

      {/* Captains Top-Level Tab */}
      {activeTab === 'captains' && (
        <CaptainManager
          sellerId={sellerId}
          sellerName={sellerProfile?.storeName}
          drivers={storeDriversList}
          onAddDriver={async (d) => {
            const res = await addStoreDriver(sellerId, d);
            if (res.success) {
              const created: StoreDriver = { ...d, id: res.driverId || `sdrv-${Date.now()}` };
              setStoreDriversList(prev => [...prev, created]);
            }
            return res;
          }}
          onUpdateDriver={async (driverId, updates) => {
            await updateStoreDriver(sellerId, driverId, updates);
            setStoreDriversList(prev => prev.map(drv => drv.id === driverId ? { ...drv, ...updates } : drv));
          }}
          onDeleteDriver={async (driverId) => {
            await deleteStoreDriver(sellerId, driverId);
            setStoreDriversList(prev => prev.filter(drv => drv.id !== driverId));
          }}
        />
      )}

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white dark:bg-slate-800 p-6 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-4 max-w-xl">
          <h3 className="text-sm font-black text-slate-900 dark:text-slate-100">ڕێکخستنەکانی فرۆشگا</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">ناوی فرۆشگا:</label>
              <input type="text" defaultValue={sellerProfile?.storeName} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5" />
            </div>
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">ژمارەی تەلەفۆن:</label>
              <input type="text" defaultValue={sellerProfile?.phone} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5 font-latin" />
            </div>
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">کاتەکانی کارکردن:</label>
              <input type="text" defaultValue={sellerProfile?.openingHours} className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-2.5" />
            </div>
            <button
              type="button"
              onClick={() => alert('ڕێکخستنەکان پاشەکەوت کران!')}
              className="mt-2 px-6 py-2.5 bg-slate-900 dark:bg-orange-500 text-white rounded-xl font-bold cursor-pointer hover:bg-slate-800 dark:hover:bg-orange-600"
            >
              پاشەکەوتکردن
            </button>
          </div>
        </div>
      )}

      {/* Add Store Driver Modal */}
      <Modal
        isOpen={showAddDriverModal}
        onClose={() => setShowAddDriverModal(false)}
        title="زیادکردنی شۆفێری نوێ بۆ دلیڤەری دوکان"
        maxWidth="md"
      >
        <div className="space-y-4 text-xs">
          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">ناوی شۆفێر *</label>
            <input
              type="text"
              value={newDriverName}
              onChange={(e) => setNewDriverName(e.target.value)}
              placeholder="وەک: ئارام کەریم"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-3"
            />
          </div>

          <div>
            <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">ژمارەی مۆبایل *</label>
            <input
              type="tel"
              value={newDriverPhone}
              onChange={(e) => setNewDriverPhone(e.target.value)}
              placeholder="0750 123 4567"
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-3 font-latin"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">هۆکاری گواستنەوە</label>
              <select
                value={newDriverVehicle}
                onChange={(e) => setNewDriverVehicle(e.target.value as any)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-3"
              >
                <option value="motorcycle">ماتۆڕسکیل 🛵</option>
                <option value="car">ئۆتۆمبێل 🚗</option>
                <option value="van">پیکاب / ڤان 🚐</option>
                <option value="bicycle">پاسکیل 🚲</option>
              </select>
            </div>

            <div>
              <label className="font-bold text-slate-800 dark:text-slate-200 block mb-1">ژمارەی تابلۆ (ئارەزوومەندانە)</label>
              <input
                type="text"
                value={newDriverPlate}
                onChange={(e) => setNewDriverPlate(e.target.value)}
                placeholder="هەولێر 1234 A"
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 text-slate-900 dark:text-slate-100 rounded-xl p-3 font-latin"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-slate-100 flex justify-end gap-2">
            <button
              type="button"
              onClick={() => setShowAddDriverModal(false)}
              className="px-4 py-2.5 text-slate-600 font-bold hover:bg-slate-100 rounded-xl cursor-pointer"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="button"
              onClick={handleAddStoreDriver}
              disabled={!newDriverName.trim() || !newDriverPhone.trim()}
              className="px-5 py-2.5 bg-orange-500 hover:bg-orange-600 text-white font-bold rounded-xl disabled:opacity-50 cursor-pointer"
            >
              تۆمارکردنی شۆفێر
            </button>
          </div>
        </div>
      </Modal>

      {/* Dispatch Order Modal */}
      <Modal
        isOpen={Boolean(dispatchOrderModal)}
        onClose={() => setDispatchOrderModal(null)}
        title={`دیاریکردنی شێوازی گەیاندن بۆ داواکاری ${dispatchOrderModal?.orderNumber || ''}`}
        maxWidth="lg"
      >
        {dispatchOrderModal && (
          <div className="space-y-5 text-xs">
            <div className="bg-slate-50 p-4 rounded-2xl space-y-1">
              <p className="font-bold text-slate-800">کڕیار: {dispatchOrderModal.customerName} ({dispatchOrderModal.customerPhone})</p>
              <p className="text-slate-500">ناونیشان: {dispatchOrderModal.deliveryAddress}</p>
              <p className="text-slate-900 font-bold font-latin">کۆی داواکاری: {dispatchOrderModal.total.toLocaleString()} د.ع</p>
            </div>

            <div className="space-y-3">
              <label className="text-xs font-bold text-slate-800 block">
                هەڵبژاردنی کەناڵی گەیاندن:
              </label>

              {/* Option A: Shakh Express */}
              <div className="p-4 rounded-2xl border border-teal-200 bg-teal-50/60 flex items-center justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold">
                    <Truck className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900">ناردن بۆ تۆڕی کاپتنانی خێرای شاخ (Shakh Express)</h4>
                    <p className="text-[11px] text-slate-500">کاپتنی نزیکترین لە فرۆشگاکەت داواکارییەکە وەردەگرێت.</p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => handleDispatchOrderToShakh(dispatchOrderModal.id)}
                  className="px-4 py-2 bg-teal-700 hover:bg-teal-800 text-white font-bold rounded-xl shrink-0 cursor-pointer shadow-xs"
                >
                  داواکردنی کاپتن
                </button>
              </div>

              {/* Option B: Store In-House Drivers */}
              <div className="p-4 rounded-2xl border border-orange-200 bg-orange-50/60 space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-orange-500 text-white flex items-center justify-center font-bold">
                      <Store className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-slate-900">ناردن بە شۆفێری تایبەتی دوکان (Store Driver)</h4>
                      <p className="text-[11px] text-slate-500">١٠٠٪ کرێی گەیاندن بۆ دوکان دەمێنێتەوە.</p>
                    </div>
                  </div>
                </div>

                {storeDriversList.length === 0 ? (
                  <p className="text-[11px] text-amber-700 bg-amber-100/70 p-2.5 rounded-xl font-bold">
                    تکایە پێشتر شۆفێر لە بەشی دلیڤەری دوکان زیاد بکە.
                  </p>
                ) : (
                  <div className="grid grid-cols-1 gap-2 pt-1">
                    {storeDriversList.map(d => (
                      <button
                        key={d.id}
                        type="button"
                        onClick={() => handleDispatchOrderToStoreDriver(dispatchOrderModal.id, d.id)}
                        className="p-3 bg-white hover:bg-orange-100/50 border border-orange-200 rounded-xl font-bold text-xs flex items-center justify-between transition-colors cursor-pointer"
                      >
                        <div className="flex items-center gap-2">
                          <span>{d.vehicleType === 'car' ? '🚗' : '🛵'}</span>
                          <span className="text-slate-800">{d.name}</span>
                          <span className="text-slate-400 font-latin text-[11px]">({d.phone})</span>
                        </div>
                        <span className="px-2.5 py-1 bg-orange-500 text-white rounded-lg text-[10px]">
                          دانان بۆ ئەم شۆفێرە
                        </span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}
      </Modal>

      {/* Add / Edit Product Modal with Dynamic Category Fields */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => {
          setIsProductModalOpen(false);
          setEditingProduct(null);
        }}
        title={editingProduct ? 'دەستکاری کاڵا (سیستەمی داینامیک)' : 'زیادکردنی کاڵای نوێ (سیستەمی داینامیک)'}
        maxWidth="2xl"
      >
        <DynamicProductForm
          initialData={editingProduct}
          allowedCategory={sellerProfile?.category || currentUser?.category}
          isSuperAdmin={currentUser?.role === 'admin'}
          sellerName={sellerProfile?.storeName || 'فرۆشگای من'}
          sellerId={sellerId}
          onSave={handleSaveProduct}
          onCancel={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>

    </div>
  );
};
