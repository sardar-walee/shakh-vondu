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
  X
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useMarketplace } from '../context/MarketplaceContext';
import { Product, Order, ProductCategory, DeliveryZoneSettings, SellerProfile } from '../types';
import { StatusBadge, CategoryBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { ImageUpload } from '../components/common/ImageUpload';
import { getDefaultDeliveryZone, calculateDeliveryFee, CITY_NEIGHBORHOOD_DISTANCES } from '../utils/deliveryUtils';

interface SellerDashboardViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const SellerDashboardView: React.FC<SellerDashboardViewProps> = ({ onNavigate }) => {
  const { currentUser, sellerProfile, canManageCategory, isSeller } = useAuth();
  const { products, orders, updateOrderStatus, addProduct, updateProduct, deleteProduct, updateSellerDeliveryZone } = useMarketplace();

  const [activeTab, setActiveTab] = useState<'overview' | 'products' | 'orders' | 'wallet' | 'delivery' | 'settings'>('overview');

  // Filter products and orders belonging to this seller
  const sellerId = sellerProfile?.id || (products[0]?.sellerId ?? 'store-rest-1');
  const myProducts = products.filter(p => p.sellerId === sellerId);
  const myOrders = orders.filter(o => o.sellerId === sellerId);

  // Delivery Zone State
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

  // Product Form State
  const [pTitle, setPTitle] = useState('');
  const [pDescription, setPDescription] = useState('');
  const [pPrice, setPPrice] = useState(10000);
  const [pDiscountPrice, setPDiscountPrice] = useState<number | undefined>(undefined);
  const [pCategory, setPCategory] = useState<ProductCategory>(defaultCategory);
  const [pSubcategory, setPSubcategory] = useState('');
  const [pStock, setPStock] = useState(50);
  const [pUnit, setPUnit] = useState('دانە');
  const [pPrepTime, setPPrepTime] = useState<number | undefined>(20);
  const [pImages, setPImages] = useState<string[]>(['https://images.unsplash.com/photo-1544025162-d76694265947?w=600']);

  const openAddModal = () => {
    setEditingProduct(null);
    setPTitle('');
    setPDescription('');
    setPPrice(10000);
    setPDiscountPrice(undefined);
    setPCategory(defaultCategory);
    setPSubcategory('');
    setPStock(50);
    setPUnit('دانە');
    setPPrepTime(20);
    setPImages(['https://images.unsplash.com/photo-1544025162-d76694265947?w=600']);
    setIsProductModalOpen(true);
  };

  const openEditModal = (p: Product) => {
    setEditingProduct(p);
    setPTitle(p.title);
    setPDescription(p.description);
    setPPrice(p.price);
    setPDiscountPrice(p.discountPrice);
    setPCategory(p.category);
    setPSubcategory(p.subcategory || '');
    setPStock(p.stock);
    setPUnit(p.unit || 'دانە');
    setPPrepTime(p.prepTimeMinutes);
    setPImages(p.images);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!pTitle.trim() || pPrice <= 0) return;

    if (editingProduct) {
      await updateProduct(editingProduct.id, {
        title: pTitle,
        description: pDescription,
        price: Number(pPrice),
        discountPrice: pDiscountPrice ? Number(pDiscountPrice) : undefined,
        category: pCategory,
        subcategory: pSubcategory,
        stock: Number(pStock),
        unit: pUnit,
        prepTimeMinutes: pPrepTime ? Number(pPrepTime) : undefined,
        images: pImages
      });
    } else {
      await addProduct({
        sellerId: sellerId,
        sellerName: sellerProfile?.storeName || 'فرۆشگای من',
        title: pTitle,
        description: pDescription,
        price: Number(pPrice),
        discountPrice: pDiscountPrice ? Number(pDiscountPrice) : undefined,
        category: pCategory,
        subcategory: pSubcategory,
        stock: Number(pStock),
        unit: pUnit,
        prepTimeMinutes: pPrepTime ? Number(pPrepTime) : undefined,
        images: pImages,
        isAvailable: true
      });
    }

    setIsProductModalOpen(false);
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
              بەش: <span className="font-bold text-slate-800">{defaultCategory}</span> • ڕێژەی کۆمسیۆنی شاخی: <span className="font-bold text-orange-600 font-latin">{sellerProfile?.commissionRate || 10}%</span>
            </p>
          </div>
        </div>

        <button
          onClick={openAddModal}
          className="px-5 py-3 bg-orange-500 hover:bg-orange-600 text-white text-xs font-bold rounded-xl shadow-md shadow-orange-500/20 flex items-center gap-2 transition-transform active:scale-95 cursor-pointer"
        >
          <Plus className="w-4 h-4" />
          <span>زیادکردنی کاڵای نوێ</span>
        </button>
      </div>

      {/* Tabs Switcher */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3 scrollbar-none">
        {[
          { id: 'overview', label: 'پوختەی گشتی', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'orders', label: `داواکارییەکان (${myOrders.length})`, icon: <ShoppingBag className="w-4 h-4" /> },
          { id: 'products', label: `لیستی کاڵاکان (${myProducts.length})`, icon: <Package className="w-4 h-4" /> },
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
              <span className="text-xs text-slate-400 font-bold">کۆمسیۆنی شاخی (Shakh Fee)</span>
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
            <p className="text-xs text-slate-400 py-8 text-center">هیچ داواکارییەک نییە.</p>
          ) : (
            <div className="space-y-4">
              {myOrders.map(order => (
                <div key={order.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                  <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 pb-3">
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-slate-900 font-latin">{order.orderNumber}</span>
                        <StatusBadge status={order.status} />
                      </div>
                      <p className="text-xs text-slate-500 mt-0.5">کڕیار: {order.customerId} • ناونیشان: {order.deliveryAddress}</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {order.status === 'pending' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'accepted')}
                          className="px-3.5 py-1.5 bg-blue-600 text-white rounded-xl text-xs font-bold hover:bg-blue-700"
                        >
                          پەسەندکردن
                        </button>
                      )}
                      {order.status === 'accepted' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'preparing')}
                          className="px-3.5 py-1.5 bg-orange-500 text-white rounded-xl text-xs font-bold hover:bg-orange-600"
                        >
                          دەستپێکردنی ئامادەکردن
                        </button>
                      )}
                      {order.status === 'preparing' && (
                        <button
                          onClick={() => updateOrderStatus(order.id, 'ready')}
                          className="px-3.5 py-1.5 bg-purple-600 text-white rounded-xl text-xs font-bold hover:bg-purple-700"
                        >
                          ئامادەیە بۆ شۆفێر
                        </button>
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
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-black text-slate-900">کاڵاکانی ئەم فرۆشگایە ({myProducts.length})</h3>
            <button
              onClick={openAddModal}
              className="px-4 py-2 bg-orange-500 text-white text-xs font-bold rounded-xl shadow cursor-pointer"
            >
              + کاڵای نوێ
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {myProducts.map(prod => (
              <div key={prod.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex flex-col justify-between space-y-3">
                <div className="flex gap-3">
                  <img src={prod.images[0]} alt="" className="w-16 h-16 rounded-xl object-cover" />
                  <div className="flex-1">
                    <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{prod.title}</h4>
                    <span className="text-xs font-black text-orange-600 font-latin">
                      {prod.price.toLocaleString()} د.ع
                    </span>
                    <p className="text-[10px] text-slate-400">کۆگا: {prod.stock} {prod.unit || 'دانە'}</p>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-200">
                  <button
                    onClick={() => openEditModal(prod)}
                    className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg"
                  >
                    <Edit className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteProduct(prod.id)}
                    className="p-1.5 text-red-600 hover:bg-red-50 rounded-lg"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Wallet Tab */}
      {activeTab === 'wallet' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="text-sm font-black text-slate-900">جزدانی دارایی و مێژووی کۆمسیۆنەکان</h3>
          
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
      )}

      {/* Delivery Radius & Zone Settings Tab */}
      {activeTab === 'delivery' && (
        <div className="space-y-6">
          
          {/* Header Banner */}
          <div className="bg-gradient-to-l from-orange-600 to-amber-600 text-white p-6 sm:p-8 rounded-3xl shadow-lg relative overflow-hidden">
            <div className="relative z-10 max-w-2xl space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-white/20 backdrop-blur-md rounded-full text-xs font-bold">
                <Compass className="w-4 h-4 text-amber-200" />
                <span>دیاریکردنی سنوری جوگرافی و دوری گەیاندن</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black">
                سنوری دوری گەیاندن (لە ٠ کم تا {maxDist} کم)
              </h2>
              <p className="text-xs text-orange-100 leading-relaxed">
                بەپێی جۆری فرۆشگاکەت (چێشتخانە، مارکێت، جلوبەرگ، سەوزە، گۆشت و هتد) سنوری دوری گەیاندن لە ٠ کیلۆمەترەوە هەتا ئەو دوراییەی دەتەوێت دیاری بکە، لەگەڵ نرخی بنەڕەتی و زیادەی هەر کیلۆمەترێک.
              </p>
            </div>
            <div className="absolute -left-6 -bottom-10 opacity-15 pointer-events-none">
              <MapPin className="w-56 h-56" />
            </div>
          </div>

          {deliverySaveSuccess && (
            <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-800 text-xs font-bold flex items-center gap-2 animate-fadeIn">
              <Check className="w-5 h-5 text-emerald-600 flex-shrink-0" />
              <span>ڕێکخستنەکانی سنوری گەیاندن و نرخ بە سەرکەوتوویی پاشەکەوت کران!</span>
            </div>
          )}

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
              <div className="space-y-3 bg-slate-50 p-4 rounded-2xl border border-slate-200">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-800">
                    سنوری دوری گەیاندن لە شوێنی فرۆشگا:
                  </label>
                  <span className="text-sm font-black text-orange-600 font-latin bg-white px-3 py-1 rounded-xl border border-orange-200 shadow-2xs">
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
                  className="w-full h-2.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                />

                <div className="flex justify-between text-[11px] text-slate-400 font-latin">
                  <span>٠ کم (لەبەردەم فرۆشگا)</span>
                  <span>١٥ کم (ناوەندی شار)</span>
                  <span>٣٠ کم (دەوروبەر)</span>
                  <span>٦٠ کم (هەموو ناوچەکە)</span>
                </div>
              </div>

              {/* Base Fee & Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    نرخی بنەڕەتی گەیاندن (دینار) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={250}
                      value={baseFee}
                      onChange={(e) => setBaseFee(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400">د.ع</span>
                  </div>
                  <p className="text-[10px] text-slate-400">نرخی بنەڕەت بۆ دوری سەرەتایی</p>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
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
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400">کم</span>
                  </div>
                  <p className="text-[10px] text-slate-400">تا ئەم دوراییە تەنها نرخی بنەڕەت دەسەپێت</p>
                </div>
              </div>

              {/* Per Km Extra Fee & Free Delivery Threshold */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    زیادەی هەر کم دوای دوری بنەڕەت (دینار) *
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={50}
                      value={perKmFee}
                      onChange={(e) => setPerKmFee(Number(e.target.value))}
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400">د.ع / کم</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700">
                    گەیاندنی بێبەرامبەر سەرووی (دینار)
                  </label>
                  <div className="relative">
                    <input
                      type="number"
                      step={5000}
                      value={freeDeliveryOver}
                      onChange={(e) => setFreeDeliveryOver(Number(e.target.value))}
                      placeholder="0 ئەگەر ناچالاک بێت"
                      className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs font-latin font-bold text-slate-800 focus:bg-white focus:outline-hidden focus:border-orange-500"
                    />
                    <span className="absolute left-3 top-3 text-xs text-slate-400">د.ع</span>
                  </div>
                  <p className="text-[10px] text-slate-400">ئەگەر کڕین لەم بڕە زیاتر بوو، گەیاندن بەخۆڕاییە</p>
                </div>
              </div>

              {/* Strict Radius Toggle */}
              <div className="p-4 rounded-2xl bg-amber-50/70 border border-amber-200/80 flex items-start justify-between gap-4">
                <div>
                  <h4 className="text-xs font-black text-amber-900">
                    ڕێسای توندی سنوری گەیاندن (Strict Delivery Boundary)
                  </h4>
                  <p className="text-[11px] text-amber-700 mt-0.5 leading-relaxed">
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
                  <div className="w-11 h-6 bg-slate-300 peer-focus:outline-hidden rounded-full peer peer-checked:after:translate-x-full rtl:peer-checked:after:-translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:start-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-orange-500"></div>
                </label>
              </div>

              {/* Delivery Note */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700">
                  ڕوونکردنەوەی گەیاندن بۆ کڕیار
                </label>
                <input
                  type="text"
                  value={deliveryNote}
                  onChange={(e) => setDeliveryNote(e.target.value)}
                  placeholder={`وەک: گەیاندنی خێرا لە ٠ کم تا ${maxDist} کم لە هەولێر`}
                  className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs focus:bg-white focus:outline-hidden focus:border-orange-500"
                />
              </div>

              {/* Neighborhoods Manager */}
              <div className="space-y-2.5 pt-2 border-t border-slate-100">
                <label className="text-xs font-bold text-slate-800 block">
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

      {/* Settings Tab */}
      {activeTab === 'settings' && (
        <div className="bg-white p-6 rounded-3xl border border-slate-200 space-y-4 max-w-xl">
          <h3 className="text-sm font-black text-slate-900">ڕێکخستنەکانی فرۆشگا</h3>
          <div className="space-y-3 text-xs">
            <div>
              <label className="font-bold text-slate-700 block mb-1">ناوی فرۆشگا:</label>
              <input type="text" defaultValue={sellerProfile?.storeName} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">ژمارەی تەلەفۆن:</label>
              <input type="text" defaultValue={sellerProfile?.phone} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 font-latin" />
            </div>
            <div>
              <label className="font-bold text-slate-700 block mb-1">کاتەکانی کارکردن:</label>
              <input type="text" defaultValue={sellerProfile?.openingHours} className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5" />
            </div>
            <button
              type="button"
              onClick={() => alert('ڕێکخستنەکان پاشەکەوت کران!')}
              className="mt-2 px-6 py-2.5 bg-slate-900 text-white rounded-xl font-bold cursor-pointer"
            >
              پاشەکەوتکردن
            </button>
          </div>
        </div>
      )}

      {/* Add / Edit Product Modal */}
      <Modal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        title={editingProduct ? 'دەستکاری کاڵا' : 'زیادکردنی کاڵای نوێ'}
        maxWidth="lg"
      >
        <form onSubmit={handleSaveProduct} className="space-y-4 text-right">
          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ناوی کاڵا *</label>
            <input
              type="text"
              value={pTitle}
              onChange={(e) => setPTitle(e.target.value)}
              required
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs focus:bg-white"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">نرخ بە دینار (IQD) *</label>
              <input
                type="number"
                value={pPrice}
                onChange={(e) => setPPrice(Number(e.target.value))}
                required
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-latin"
              />
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">نرخی داشکاندن (ئارەزوومەندانە)</label>
              <input
                type="number"
                value={pDiscountPrice || ''}
                onChange={(e) => setPDiscountPrice(e.target.value ? Number(e.target.value) : undefined)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs font-latin"
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">بەش *</label>
              <select
                value={pCategory}
                onChange={(e) => setPCategory(e.target.value as any)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
              >
                <option value="food">خواردن</option>
                <option value="market">مارکێت</option>
                <option value="clothes">جلوبەرگ</option>
                <option value="fruits_vegetables">سەوزە و میوە</option>
                <option value="fresh_meat">گۆشت</option>
                <option value="dairy">شیرەمەنی</option>
                <option value="electronics">ئەلیکترۆنیات</option>
                <option value="beauty">جوانی</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-slate-700">پۆلی لاوەکی (Subcategory)</label>
              <input
                type="text"
                value={pSubcategory}
                onChange={(e) => setPSubcategory(e.target.value)}
                placeholder="وەک: پیتزا، کەباب، شەربەت..."
                className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-xs font-bold text-slate-700">ڕوونکردنەوە</label>
            <textarea
              value={pDescription}
              onChange={(e) => setPDescription(e.target.value)}
              rows={2}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-2.5 text-xs"
            />
          </div>

          <ImageUpload
            images={pImages}
            onChange={setPImages}
            maxImages={4}
            label="وێنەی کاڵا باربکە:"
          />

          <div className="flex justify-end gap-2 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={() => setIsProductModalOpen(false)}
              className="px-4 py-2 text-xs font-bold text-slate-600"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              className="px-5 py-2 bg-orange-500 text-white rounded-xl text-xs font-bold shadow"
            >
              پاشەکەوتکردن
            </button>
          </div>
        </form>
      </Modal>

    </div>
  );
};
