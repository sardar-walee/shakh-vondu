import React, { useState } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  DollarSign,
  Store,
  Package,
  Car,
  Users,
  CheckCircle,
  XCircle,
  Edit,
  Trash2,
  Filter,
  CreditCard,
  Eye,
  Sliders,
  Award,
  Gift,
  Plus,
  MessageSquare,
  Star,
  Send,
  CheckCircle2,
  Search,
  Check,
  PackagePlus,
  Sparkles,
  Heart,
  Save,
  Image,
  RefreshCw,
  RotateCcw,
  Ban,
  EyeOff,
  Crown,
  Maximize2,
  Copy,
  ExternalLink,
  ShieldAlert,
  UserCheck,
  UserX,
  Layers,
  Languages,
  Clock
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, CategoryBadge, RoleBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { EmptyState } from '../components/common/EmptyState';
import { DynamicProductForm } from '../components/products/DynamicProductForm';
import { Product, ProductCategory, OrderStatus, CarPackageType, FeedbackStatus, OccasionBanner, OccasionType, OccasionThemeStyle, UserRole } from '../types';
import { OCCASION_PRESETS } from '../data/occasionPresets';
import { OccasionHeaderBanner } from '../components/common/OccasionHeaderBanner';
import { OccasionBannerAdminPanel } from '../components/common/OccasionBannerAdminPanel';
import { I18nAdminManager } from '../components/admin/I18nAdminManager';
import { CaptainManager } from '../components/delivery/CaptainManager';
import { AppUpdateManager } from '../components/admin/AppUpdateManager';

interface AdminDashboardViewProps {
  onNavigate: (view: string, param?: string) => void;
}

export const AdminDashboardView: React.FC<AdminDashboardViewProps> = ({ onNavigate }) => {
  const {
    products,
    sellers,
    orders,
    carAds,
    commissionTransactions,
    updateSellerCommission,
    respondToCommissionNegotiation,
    toggleSellerVerification,
    updateOrderStatus,
    updateCarAdStatus,
    pointsSettings,
    updatePointsSettings,
    calculateDiscountFromPoints,
    calculatePointsRequiredForDiscount,
    shakhAgreements,
    pointsTransactions,
    getSellerAgreement,
    updateSellerAgreement,
    userFeedbacks,
    updateFeedbackStatus,
    addProduct,
    updateProduct,
    deleteProduct,
    purgeAllDemoData,
    cleanTaggedDemoOnly,
    allUsers,
    adminUpdateUserRole,
    adminToggleBlockUser,
    adminDeleteUser,
    deleteCarAd,
    toggleCarAdHidden,
    deleteUserFeedback,
    toggleFeedbackHidden,
    toggleProductHidden,
    allPlatformCaptains,
    addStoreDriver,
    updateStoreDriver,
    deleteStoreDriver,
    approveCarAd,
    rejectCarAd
  } = useMarketplace();
  const { currentUser, isSuperAdmin } = useAuth();

  const [tab, setTab] = useState<'overview' | 'super_omni' | 'captains' | 'app_updates' | 'sellers' | 'orders' | 'products' | 'cars' | 'agreements' | 'feedback' | 'occasions' | 'finances' | 'i18n'>('super_omni');

  // Super Admin Omni Control State
  const [omniSection, setOmniSection] = useState<'users' | 'products' | 'cars' | 'posts'>('users');
  const [omniSearch, setOmniSearch] = useState('');
  const [omniRoleFilter, setOmniRoleFilter] = useState<string>('all');
  const [omniStatusFilter, setOmniStatusFilter] = useState<'all' | 'active' | 'blocked_hidden'>('all');
  const [omniImageFilter, setOmniImageFilter] = useState<'all' | 'with_image' | 'no_image'>('all');

  // Image Preview Modal State
  const [previewImageUrl, setPreviewImageUrl] = useState<string | null>(null);
  const [previewImageTitle, setPreviewImageTitle] = useState<string>('');

  // Car Ads Super Admin Moderation Filter & Reject Modal
  const [carFilterTab, setCarFilterTab] = useState<'all' | 'pending' | 'active' | 'sold' | 'rejected'>('pending');
  const [carSearchQuery, setCarSearchQuery] = useState('');
  const [rejectingCarId, setRejectingCarId] = useState<string | null>(null);
  const [rejectReasonText, setRejectReasonText] = useState('وەسڵی پارەدان ڕوون نییە یان بڕی پارەکە تەواو نییە');

  // Purge database state
  const [isPurgeModalOpen, setIsPurgeModalOpen] = useState(false);
  const [isPurging, setIsPurging] = useState(false);
  const [purgeResultMsg, setPurgeResultMsg] = useState<string | null>(null);
  const [purgeConfirmText, setPurgeConfirmText] = useState('');

  const isConfirmValid = purgeConfirmText.trim().toUpperCase() === 'RESET';

  const handlePurgeDatabase = async () => {
    if (!isSuperAdmin) {
      setPurgeResultMsg('⛔ تەنها سوپەر ئەدمین (Super Admin) دەسەڵاتی جێبەجێکردنی Factory Reset ی هەیە.');
      return;
    }
    if (!isConfirmValid) {
      setPurgeResultMsg('⚠️ تکایە دەستەواژەی "RESET" بە دروستی بنووسە بۆ پاشەکەوتکردن لە پەیوەستی هەڵە.');
      return;
    }

    setIsPurging(true);
    setPurgeResultMsg(null);
    const res = await purgeAllDemoData();
    setIsPurging(false);
    setPurgeResultMsg(res.message);
    if (res.success) {
      setTimeout(() => {
        setIsPurgeModalOpen(false);
        setPurgeResultMsg(null);
        setPurgeConfirmText('');
      }, 2500);
    }
  };

  const handleCleanTaggedDemoOnly = async () => {
    if (!isSuperAdmin) {
      setPurgeResultMsg('⛔ تەنها سوپەر ئەدمین (Super Admin) دەسەڵاتی جێبەجێکردنی پاککردنەوەی داتای دیمۆی هەیە.');
      return;
    }
    if (!isConfirmValid) {
      setPurgeResultMsg('⚠️ تکایە دەستەواژەی "RESET" بە دروستی بنووسە بۆ ڕێگری لە داگرتنی هەڵە.');
      return;
    }

    setIsPurging(true);
    setPurgeResultMsg(null);
    const res = await cleanTaggedDemoOnly();
    setIsPurging(false);
    setPurgeResultMsg(res.details);
    if (res.success) {
      setTimeout(() => {
        setIsPurgeModalOpen(false);
        setPurgeResultMsg(null);
        setPurgeConfirmText('');
      }, 3500);
    }
  };

  // Product Admin Management State
  const [productSearch, setProductSearch] = useState('');
  const [productCategoryFilter, setProductCategoryFilter] = useState<'all' | ProductCategory>('all');
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const handleSaveProduct = async (productData: Omit<Product, 'id' | 'createdAt'>) => {
    if (editingProduct) {
      await updateProduct(editingProduct.id, productData);
    } else {
      await addProduct(productData);
    }
    setIsProductModalOpen(false);
    setEditingProduct(null);
  };

  // Feedback admin reply state
  const [replyingFbId, setReplyingFbId] = useState<string | null>(null);
  const [adminReplyMsg, setAdminReplyMsg] = useState<string>('');

  const handleSaveAdminReply = async (fbId: string, nextStatus: FeedbackStatus) => {
    await updateFeedbackStatus(fbId, nextStatus, adminReplyMsg);
    setReplyingFbId(null);
    setAdminReplyMsg('');
  };

  // Agreement editing state
  const [editingAgSellerId, setEditingAgSellerId] = useState<string | null>(null);
  const [agTier, setAgTier] = useState<'Standard' | 'Silver' | 'Gold' | 'VIP_Custom'>('Standard');
  const [agCustPct, setAgCustPct] = useState<number>(2);
  const [agSellerPct, setAgSellerPct] = useState<number>(1.5);
  const [agDriverPts, setAgDriverPts] = useState<number>(10);
  const [agNotes, setAgNotes] = useState<string>('');

  const openAgreementEditor = (sId: string) => {
    const ag = getSellerAgreement(sId);
    setEditingAgSellerId(sId);
    setAgTier(ag.tier);
    setAgCustPct(ag.customerRewardPercent);
    setAgSellerPct(ag.sellerRewardPercent);
    setAgDriverPts(ag.driverBonusPoints);
    setAgNotes(ag.agreementNotes || '');
  };

  const handleSaveAgreement = (sId: string) => {
    updateSellerAgreement(sId, {
      tier: agTier,
      customerRewardPercent: Number(agCustPct),
      sellerRewardPercent: Number(agSellerPct),
      driverBonusPoints: Number(agDriverPts),
      agreementNotes: agNotes
    });
    setEditingAgSellerId(null);
  };

  // KPI Calculations
  const totalGmv = orders.reduce((sum, o) => sum + o.total, 0);
  const deliveredOrders = orders.filter(o => o.status === 'delivered');
  const totalCommissionRevenue = deliveredOrders.reduce((sum, o) => sum + (o.commissionAmount || 0), 0);
  const totalCarAdRevenue = carAds
    .filter(c => c.paymentStatus === 'paid')
    .reduce((sum, c) => sum + (c.packagePrice || 0), 0);
  const totalPlatformEarnings = totalCommissionRevenue + totalCarAdRevenue;

  // Editing seller modal / state
  const [editingSellerId, setEditingSellerId] = useState<string | null>(null);
  const [newCommissionRate, setNewCommissionRate] = useState(10);

  const handleSaveCommission = (sellerId: string) => {
    updateSellerCommission(sellerId, Number(newCommissionRate));
    setEditingSellerId(null);
  };

  const pendingCarsCount = carAds.filter(c => c.adStatus === 'pending_approval' || c.adStatus === 'pending_payment' || c.adminApprovalStatus === 'pending').length;

  return (
    <div className="space-y-8 pb-16">
      
      {/* Super Admin Top Banner */}
      <div className="bg-gradient-to-r from-red-950 via-slate-900 to-red-950 text-white p-6 sm:p-8 rounded-3xl border border-red-900/40 shadow-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-2xl bg-red-600 text-white flex items-center justify-center font-bold text-2xl shadow-lg shadow-red-600/30">
            <ShieldCheck className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl sm:text-2xl font-black">داشبۆردی سەرپەرشتیاری گشتی (Super Admin)</h1>
              <span className="bg-red-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-md">
                Master Control
              </span>
            </div>
            <p className="text-xs text-red-200 mt-1">
              پلاتفۆرمی (شاخ) (Shakh) • خاوەن موڵک: <span className="font-latin font-bold">shakh8002@gmail.com</span> • دۆمەین: <span className="font-latin">daim-post.online</span>
            </p>
          </div>
        </div>

        {/* Factory Reset / Purge Database Button */}
        <button
          type="button"
          onClick={() => setIsPurgeModalOpen(true)}
          className="px-4 py-2.5 bg-red-600 hover:bg-red-700 text-white font-black rounded-2xl text-xs flex items-center gap-2 transition-all cursor-pointer shrink-0 shadow-lg border border-red-400/30"
        >
          <RotateCcw className="w-4 h-4 text-white" />
          <span>ڕێکخستنەوەی کارگە (Factory Reset)</span>
        </button>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto border-b border-slate-200 pb-3 scrollbar-none">
        {[
          { id: 'super_omni', label: `⚡ بەشی سوپەر ئەدمین (کۆنترۆڵی سەرجەم بەکارهێنەر/کالا/پۆست)`, icon: <Crown className="w-4 h-4 text-amber-300" /> },
          { id: 'app_updates', label: 'ئەپدەیتی نوێ و وەشانەکان (Live Updates)', icon: <Sparkles className="w-4 h-4 text-orange-400" /> },
          { id: 'captains', label: `کاپتنەکانی گەیاندن (${allPlatformCaptains.length})`, icon: <UserCheck className="w-4 h-4 text-emerald-400" /> },
          { id: 'overview', label: 'پوختەی دارایی و گشتی', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'occasions', label: 'بۆنە و یادەکان (مەولود)', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
          { id: 'sellers', label: `فرۆشیاران (${sellers.length})`, icon: <Store className="w-4 h-4" /> },
          { id: 'agreements', label: 'ڕێککەوتنی پۆینتی شاخ و خاوەن کار', icon: <Award className="w-4 h-4 text-amber-500" /> },
          { id: 'feedback', label: `فیدباک و سەرنجەکان (${userFeedbacks.length})`, icon: <MessageSquare className="w-4 h-4 text-emerald-500" /> },
          { id: 'orders', label: `داواکارییەکان (${orders.length})`, icon: <Package className="w-4 h-4" /> },
          { id: 'products', label: `کاڵاکان (${products.length})`, icon: <Sliders className="w-4 h-4" /> },
          {
            id: 'cars',
            label: `ڕیکلامی ئۆتۆمبێل (${carAds.length})`,
            badge: pendingCarsCount > 0 ? `${pendingCarsCount} لە چاوەڕوانیدا` : undefined,
            icon: <Car className="w-4 h-4" />
          },
          { id: 'i18n', label: 'زمانەکان و وەرگێڕان (i18n)', icon: <Languages className="w-4 h-4 text-blue-500" /> },
          { id: 'finances', label: 'تۆماری کۆمسیۆن و داهات', icon: <DollarSign className="w-4 h-4" /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer relative ${
              tab === t.id
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
            {t.badge && (
              <span className="bg-amber-500 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md animate-pulse">
                {t.badge}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* Occasions & Mawlid Banner Tab */}
      {tab === 'occasions' && (
        <OccasionBannerAdminPanel isModal={false} />
      )}

      {/* Super Admin Omni Control Panel Tab */}
      {tab === 'super_omni' && (
        <div className="space-y-6">
          {!isSuperAdmin ? (
            <div className="p-8 bg-red-50 border border-red-200 rounded-3xl text-center space-y-3">
              <ShieldAlert className="w-12 h-12 text-red-600 mx-auto animate-pulse" />
              <h3 className="text-lg font-black text-red-900">تەنها بۆ سوپەر ئەدمین (Super Admin) ڕێگەپێدراوە</h3>
              <p className="text-xs text-red-700 max-w-md mx-auto">
                بۆ بەکارهێنانی ئەم بەشە و ئەنجامدانی کرداری سڕینەوە، بلۆککردن، بزرکردن و گۆڕینی ڕۆڵ پێویستە بە هەژماری سوپەر ئەدمین چوو بیتە ژوورەوە.
              </p>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Top Header Banner */}
              <div className="bg-gradient-to-br from-slate-950 via-slate-900 to-red-950 text-white p-6 rounded-3xl border border-red-900/40 shadow-xl space-y-5">
                <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-amber-500 to-orange-500 text-slate-950 flex items-center justify-center font-black text-xl shadow-lg shadow-amber-500/20 shrink-0">
                      <Crown className="w-7 h-7" />
                    </div>
                    <div>
                      <h2 className="text-xl font-black text-white flex items-center gap-2">
                        کۆنترۆڵی سەرانسەریی سوپەر ئەدمین
                        <span className="bg-amber-500 text-slate-950 font-black text-[10px] px-2.5 py-0.5 rounded-full font-latin">
                          SUPER ADMIN OMNI
                        </span>
                      </h2>
                      <p className="text-xs text-slate-300 mt-1">
                        بەڕێوەبردنی گشتگیری بەکارهێنەران، کالاکان، ئۆتۆمبێلەکان و پۆستەکان بە گەڕانی خێرا (ناو، ئایدی، ئیمەیڵ، وێنە)
                      </p>
                    </div>
                  </div>

                  {/* Counters Summary */}
                  <div className="flex items-center gap-2 flex-wrap">
                    <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl text-center border border-slate-700/60 shadow-xs">
                      <span className="block text-[10px] text-slate-400 font-bold">بەکارهێنەران</span>
                      <span className="text-base font-black text-amber-400 font-latin">{allUsers.length}</span>
                    </div>
                    <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl text-center border border-slate-700/60 shadow-xs">
                      <span className="block text-[10px] text-slate-400 font-bold">کالاکان</span>
                      <span className="text-base font-black text-cyan-400 font-latin">{products.length}</span>
                    </div>
                    <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl text-center border border-slate-700/60 shadow-xs">
                      <span className="block text-[10px] text-slate-400 font-bold">ئۆتۆمبێل</span>
                      <span className="text-base font-black text-orange-400 font-latin">{carAds.length}</span>
                    </div>
                    <div className="bg-slate-800/80 px-3.5 py-2 rounded-2xl text-center border border-slate-700/60 shadow-xs">
                      <span className="block text-[10px] text-slate-400 font-bold">پۆست و فیدباک</span>
                      <span className="text-base font-black text-emerald-400 font-latin">{userFeedbacks.length}</span>
                    </div>
                  </div>
                </div>

                {/* Sub Sections Navigation Bar */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 pt-3 border-t border-slate-800/80">
                  <button
                    type="button"
                    onClick={() => setOmniSection('users')}
                    className={`px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      omniSection === 'users'
                        ? 'bg-gradient-to-r from-amber-500 to-orange-500 text-slate-950 shadow-lg font-bold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                    }`}
                  >
                    <Users className="w-4 h-4" />
                    <span>👥 بەکارهێنەران و ڕۆڵەکان ({allUsers.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOmniSection('products')}
                    className={`px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      omniSection === 'products'
                        ? 'bg-gradient-to-r from-cyan-500 to-blue-500 text-slate-950 shadow-lg font-bold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                    }`}
                  >
                    <Package className="w-4 h-4" />
                    <span>📦 سەرجەم کالاکان ({products.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOmniSection('cars')}
                    className={`px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      omniSection === 'cars'
                        ? 'bg-gradient-to-r from-orange-500 to-red-500 text-slate-950 shadow-lg font-bold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                    }`}
                  >
                    <Car className="w-4 h-4" />
                    <span>🚗 ئۆتۆمبێلەکان ({carAds.length})</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => setOmniSection('posts')}
                    className={`px-4 py-3 rounded-2xl text-xs font-black flex items-center justify-center gap-2 transition-all cursor-pointer ${
                      omniSection === 'posts'
                        ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-slate-950 shadow-lg font-bold'
                        : 'bg-slate-800/80 text-slate-300 hover:bg-slate-700/80 border border-slate-700/50'
                    }`}
                  >
                    <MessageSquare className="w-4 h-4" />
                    <span>💬 پۆست و فیدباککان ({userFeedbacks.length})</span>
                  </button>
                </div>
              </div>

              {/* Universal Search & Multi-Filter Bar */}
              <div className="bg-white p-4 sm:p-5 rounded-3xl border border-slate-200 shadow-xs space-y-3">
                <div className="flex flex-col lg:flex-row items-center gap-3">
                  {/* Search input matching Name, ID, Email, Phone */}
                  <div className="relative flex-1 w-full">
                    <Search className="w-4 h-4 absolute right-4 top-3.5 text-slate-400" />
                    <input
                      type="text"
                      value={omniSearch}
                      onChange={(e) => setOmniSearch(e.target.value)}
                      placeholder="🔍 گەڕانی خێرا بە ناو، ئایدی (ID)، ئیمەیڵ، تەلەفۆن..."
                      className="w-full pr-11 pl-10 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-amber-500 transition-all"
                    />
                    {omniSearch && (
                      <button
                        type="button"
                        onClick={() => setOmniSearch('')}
                        className="absolute left-3 top-3 text-slate-400 hover:text-slate-600 text-xs font-bold cursor-pointer bg-slate-200 hover:bg-slate-300 px-2 py-0.5 rounded-lg"
                      >
                        سڕینەوە
                      </button>
                    )}
                  </div>

                  {/* Filter Dropdowns */}
                  <div className="flex items-center gap-2 w-full lg:w-auto overflow-x-auto pb-1 lg:pb-0 scrollbar-none">
                    {/* Role Filter (Only for Users tab) */}
                    {omniSection === 'users' && (
                      <select
                        value={omniRoleFilter}
                        onChange={(e) => setOmniRoleFilter(e.target.value)}
                        className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-amber-500"
                      >
                        <option value="all">👑 هەموو ڕۆڵەکان</option>
                        <option value="customer">👥 کڕیار (Customer)</option>
                        <option value="seller">🏪 فرۆشیار (Seller)</option>
                        <option value="delivery_agent">🚚 گەیاندنکار (Delivery Agent)</option>
                        <option value="store_driver">🛵 شۆفێری فرۆشگا (Store Driver)</option>
                        <option value="admin">🛡️ ئەدمین (Admin)</option>
                        <option value="super_admin">⚡ سوپەر ئەدمین (Super Admin)</option>
                      </select>
                    )}

                    {/* Status Filter */}
                    <select
                      value={omniStatusFilter}
                      onChange={(e) => setOmniStatusFilter(e.target.value as any)}
                      className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">🟢 هەموو باری بڵاوکردنەوە</option>
                      <option value="active">✅ چالاک / دیار (Active)</option>
                      <option value="blocked_hidden">⛔ بلۆککراو / بزرکراو (Blocked/Hidden)</option>
                    </select>

                    {/* Image Filter */}
                    <select
                      value={omniImageFilter}
                      onChange={(e) => setOmniImageFilter(e.target.value as any)}
                      className="px-3.5 py-3 bg-slate-50 border border-slate-200 rounded-2xl text-xs font-bold text-slate-700 outline-none cursor-pointer focus:ring-2 focus:ring-amber-500"
                    >
                      <option value="all">🖼️ هەموو فۆرماتەکان</option>
                      <option value="with_image">📷 تەنها وێنەدار (With Image)</option>
                      <option value="no_image">🚫 بێ وێنە (No Image)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* ==================== 1. USERS SECTION ==================== */}
              {omniSection === 'users' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Users className="w-4 h-4 text-amber-500" />
                      <span>بەڕێوەبردنی بەکارهێنەران و ڕۆڵەکان</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500 font-latin">
                      نیشاندانی {allUsers.filter(u => {
                        const q = omniSearch.toLowerCase().trim();
                        const matchesQuery = !q || ((u.fullName || '').toLowerCase().includes(q) || (u.id || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q));
                        const matchesRole = omniRoleFilter === 'all' || u.role === omniRoleFilter || (omniRoleFilter === 'seller' && (u.role as string).includes('seller'));
                        const matchesStatus = omniStatusFilter === 'all' || (omniStatusFilter === 'active' && !u.isBlocked) || (omniStatusFilter === 'blocked_hidden' && u.isBlocked);
                        const hasImg = Boolean(u.avatarUrl && u.avatarUrl.length > 5);
                        const matchesImg = omniImageFilter === 'all' || (omniImageFilter === 'with_image' && hasImg) || (omniImageFilter === 'no_image' && !hasImg);
                        return matchesQuery && matchesRole && matchesStatus && matchesImg;
                      }).length} بەکارهێنەر لە کۆی {allUsers.length}
                    </span>
                  </div>

                  {(() => {
                    const filteredOmniUsers = allUsers.filter(u => {
                      const q = omniSearch.toLowerCase().trim();
                      const matchesQuery = !q || ((u.fullName || '').toLowerCase().includes(q) || (u.id || '').toLowerCase().includes(q) || (u.email || '').toLowerCase().includes(q) || (u.phone || '').toLowerCase().includes(q));
                      const matchesRole = omniRoleFilter === 'all' || u.role === omniRoleFilter || (omniRoleFilter === 'seller' && (u.role as string).includes('seller'));
                      const matchesStatus = omniStatusFilter === 'all' || (omniStatusFilter === 'active' && !u.isBlocked) || (omniStatusFilter === 'blocked_hidden' && u.isBlocked);
                      const hasImg = Boolean(u.avatarUrl && u.avatarUrl.length > 5);
                      const matchesImg = omniImageFilter === 'all' || (omniImageFilter === 'with_image' && hasImg) || (omniImageFilter === 'no_image' && !hasImg);
                      return matchesQuery && matchesRole && matchesStatus && matchesImg;
                    });

                    if (filteredOmniUsers.length === 0) {
                      return (
                        <EmptyState
                          type="users"
                          title="هیچ بەکارهێنەرێک نەدۆزرایەوە"
                          description="هیچ بەکارهێنەرێک بەپێی گەڕان یان فلتەری هەڵبژێردراو بەردەست نییە."
                          actionLabel="پاککردنەوەی فلتەرەکان"
                          onAction={() => {
                            setOmniSearch('');
                            setOmniRoleFilter('all');
                            setOmniStatusFilter('all');
                            setOmniImageFilter('all');
                          }}
                        />
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOmniUsers.map(user => (
                          <div
                            key={user.id}
                          className={`p-4 rounded-3xl border transition-all space-y-3 relative ${
                            user.isBlocked
                              ? 'bg-red-50/50 border-red-200'
                              : 'bg-white border-slate-200 hover:shadow-md'
                          }`}
                        >
                          {/* User Header */}
                          <div className="flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                              {/* Avatar */}
                              <div
                                onClick={() => {
                                  if (user.avatarUrl) {
                                    setPreviewImageUrl(user.avatarUrl);
                                    setPreviewImageTitle(`وێنەی پرۆفایلی ${user.fullName}`);
                                  }
                                }}
                                className="relative w-12 h-12 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 cursor-pointer group"
                              >
                                {user.avatarUrl ? (
                                  <>
                                    <img src={user.avatarUrl} alt={user.fullName} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                    <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                      <Maximize2 className="w-4 h-4 text-white" />
                                    </div>
                                  </>
                                ) : (
                                  <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-500 font-bold text-lg">
                                    {user.fullName?.substring(0, 1) || 'U'}
                                  </div>
                                )}
                              </div>

                              <div>
                                <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                  <span>{user.fullName || 'بەکارهێنەر'}</span>
                                  {user.isBlocked && (
                                    <span className="bg-red-600 text-white text-[9px] font-black px-1.5 py-0.5 rounded-md">
                                      بلۆککراو
                                    </span>
                                  )}
                                </h4>
                                <p className="text-[11px] text-slate-500 font-latin truncate max-w-[160px]">
                                  {user.email || 'no-email@shakh.app'}
                                </p>
                                <p className="text-[10px] text-slate-400 font-latin">
                                  {user.phone || 'no-phone'}
                                </p>
                              </div>
                            </div>

                            {/* User ID Tag */}
                            <span className="bg-slate-100 text-slate-600 font-latin text-[10px] font-bold px-2 py-1 rounded-lg border border-slate-200 shrink-0">
                              ID: {user.id.substring(0, 8)}...
                            </span>
                          </div>

                          {/* Role Badge and Role Selector */}
                          <div className="p-2.5 bg-slate-50 rounded-2xl border border-slate-100 flex items-center justify-between gap-2">
                            <div className="flex items-center gap-1.5">
                              <RoleBadge role={user.role} />
                            </div>

                            {/* Role Dropdown */}
                            <select
                              value={user.role}
                              onChange={(e) => adminUpdateUserRole(user.id, e.target.value as UserRole)}
                              className="text-[11px] font-black bg-white border border-slate-200 rounded-xl px-2 py-1 text-slate-700 outline-none cursor-pointer hover:border-amber-500 transition-all"
                            >
                              <option value="customer">👤 کڕیار (Customer)</option>
                              <option value="seller">🏪 فرۆشیار (Seller)</option>
                              <option value="delivery_agent">🚚 گەیاندنکار (Delivery)</option>
                              <option value="store_driver">🛵 شۆفێری فرۆشگا (Store Driver)</option>
                              <option value="admin">🛡️ ئەدمین (Admin)</option>
                              <option value="super_admin">⚡ سوپەر ئەدمین (Super Admin)</option>
                            </select>
                          </div>

                          {/* Actions: Block / Unblock & Delete */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => adminToggleBlockUser(user.id, !user.isBlocked)}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                user.isBlocked
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                  : 'bg-amber-500 hover:bg-amber-600 text-slate-950 shadow-xs'
                              }`}
                            >
                              {user.isBlocked ? (
                                <>
                                  <UserCheck className="w-3.5 h-3.5" />
                                  <span>لادانی بلۆک</span>
                                </>
                              ) : (
                                <>
                                  <Ban className="w-3.5 h-3.5" />
                                  <span>بلۆککردن</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`دڵنیای لە سڕینەوەی بەکارهێنەری "${user.fullName}"؟ هەژمارەکە ڕاستەوخۆ دەسڕدرێتەوە.`)) {
                                  adminDeleteUser(user.id);
                                }
                              }}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                              title="سڕینەوەی بەکارهێنەر"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>سڕینەوە</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                  })()}
                </div>
              )}

              {/* ==================== 2. PRODUCTS SECTION ==================== */}
              {omniSection === 'products' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Package className="w-4 h-4 text-cyan-500" />
                      <span>بەڕێوەبردنی سەرجەم کالاکان و بەرهەمەکان</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500 font-latin">
                      نیشاندانی {products.filter(p => {
                        const q = omniSearch.toLowerCase().trim();
                        const matchesQuery = !q || ((p.title || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q) || (p.sellerId || '').toLowerCase().includes(q) || (p.sellerName || '').toLowerCase().includes(q));
                        const matchesStatus = omniStatusFilter === 'all' || (omniStatusFilter === 'active' && !p.isHidden && p.isAvailable) || (omniStatusFilter === 'blocked_hidden' && (p.isHidden || !p.isAvailable));
                        const hasImg = Boolean(p.images && p.images.length > 0);
                        const matchesImg = omniImageFilter === 'all' || (omniImageFilter === 'with_image' && hasImg) || (omniImageFilter === 'no_image' && !hasImg);
                        return matchesQuery && matchesStatus && matchesImg;
                      }).length} کالا لە کۆی {products.length}
                    </span>
                  </div>

                  {(() => {
                    const filteredOmniProducts = products.filter(p => {
                      const q = omniSearch.toLowerCase().trim();
                      const matchesQuery = !q || ((p.title || '').toLowerCase().includes(q) || (p.id || '').toLowerCase().includes(q) || (p.sellerId || '').toLowerCase().includes(q) || (p.sellerName || '').toLowerCase().includes(q));
                      const matchesStatus = omniStatusFilter === 'all' || (omniStatusFilter === 'active' && !p.isHidden && p.isAvailable) || (omniStatusFilter === 'blocked_hidden' && (p.isHidden || !p.isAvailable));
                      const hasImg = Boolean(p.images && p.images.length > 0);
                      const matchesImg = omniImageFilter === 'all' || (omniImageFilter === 'with_image' && hasImg) || (omniImageFilter === 'no_image' && !hasImg);
                      return matchesQuery && matchesStatus && matchesImg;
                    });

                    if (filteredOmniProducts.length === 0) {
                      return (
                        <EmptyState
                          type="products"
                          title="هیچ کاڵایەک نەدۆزرایەوە"
                          description="هیچ بەرهەمێک بەپێی ئەم گەڕانە یان فلتەرە لە داتابەیسدا نەدۆزرایەوە."
                          actionLabel="پاککردنەوەی فلتەرەکان"
                          onAction={() => {
                            setOmniSearch('');
                            setOmniStatusFilter('all');
                            setOmniImageFilter('all');
                          }}
                          secondaryActionLabel="+ زیادکردنی کاڵای نوێ"
                          onSecondaryAction={() => {
                            setEditingProduct(null);
                            setIsProductModalOpen(true);
                          }}
                        />
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOmniProducts.map(prod => (
                          <div
                            key={prod.id}
                          className={`p-4 rounded-3xl border transition-all space-y-3 relative ${
                            prod.isHidden || !prod.isAvailable
                              ? 'bg-slate-50 border-amber-300'
                              : 'bg-white border-slate-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Image Thumbnail */}
                            <div
                              onClick={() => {
                                if (prod.images && prod.images[0]) {
                                  setPreviewImageUrl(prod.images[0]);
                                  setPreviewImageTitle(prod.title);
                                }
                              }}
                              className="w-16 h-16 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 cursor-pointer relative group"
                            >
                              {prod.images && prod.images[0] ? (
                                <>
                                  <img src={prod.images[0]} alt={prod.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                    <Maximize2 className="w-4 h-4 text-white" />
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                  <Package className="w-6 h-6" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5">
                                <CategoryBadge category={prod.category} />
                                {prod.isHidden && (
                                  <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                                    بزرکراو (Hidden)
                                  </span>
                                )}
                              </div>
                              <h4 className="font-black text-slate-900 text-sm truncate mt-1">
                                {prod.title}
                              </h4>
                              <p className="text-xs font-black text-emerald-600 font-latin">
                                {prod.price.toLocaleString()} د.ع
                              </p>
                              <p className="text-[10px] text-slate-400 font-latin truncate">
                                فرۆشیار: {prod.sellerName || prod.sellerId}
                              </p>
                            </div>
                          </div>

                          {/* Product Controls: Hide/Unhide & Delete */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => toggleProductHidden(prod.id, !prod.isHidden)}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                prod.isHidden
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                  : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                              }`}
                            >
                              {prod.isHidden ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>دیاریکردنەوە (Show)</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>بزرکردن (Hide)</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setEditingProduct(prod);
                                setIsProductModalOpen(true);
                              }}
                              className="px-3 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>دەستکاری</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`دڵنیای لە سڕینەوەی کالای "${prod.title}"؟`)) {
                                  deleteProduct(prod.id);
                                }
                              }}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>سڕینەوە</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                  })()}
                </div>
              )}

              {/* ==================== 3. CARS SECTION ==================== */}
              {omniSection === 'cars' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <Car className="w-4 h-4 text-orange-500" />
                      <span>بەڕێوەبردنی ئۆتۆمبێلەکان و ڕیکلامەکان</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500 font-latin">
                      نیشاندانی {carAds.filter(c => {
                        const q = omniSearch.toLowerCase().trim();
                        const matchesQuery = !q || ((c.title || '').toLowerCase().includes(q) || (c.id || '').toLowerCase().includes(q) || (c.userId || '').toLowerCase().includes(q) || (c.userName || '').toLowerCase().includes(q) || (c.userPhone || '').toLowerCase().includes(q) || (c.brand || '').toLowerCase().includes(q));
                        const matchesStatus = omniStatusFilter === 'all' || (omniStatusFilter === 'active' && !c.isHidden && c.adStatus === 'active') || (omniStatusFilter === 'blocked_hidden' && (c.isHidden || c.adStatus === 'hidden' || c.adStatus === 'rejected'));
                        const hasImg = Boolean(c.images && c.images.length > 0);
                        const matchesImg = omniImageFilter === 'all' || (omniImageFilter === 'with_image' && hasImg) || (omniImageFilter === 'no_image' && !hasImg);
                        return matchesQuery && matchesStatus && matchesImg;
                      }).length} ئۆتۆمبێل لە کۆی {carAds.length}
                    </span>
                  </div>

                  {(() => {
                    const filteredOmniCars = carAds.filter(c => {
                      const q = omniSearch.toLowerCase().trim();
                      const matchesQuery = !q || ((c.title || '').toLowerCase().includes(q) || (c.id || '').toLowerCase().includes(q) || (c.userId || '').toLowerCase().includes(q) || (c.userName || '').toLowerCase().includes(q) || (c.userPhone || '').toLowerCase().includes(q) || (c.brand || '').toLowerCase().includes(q));
                      const matchesStatus = omniStatusFilter === 'all' || (omniStatusFilter === 'active' && !c.isHidden && c.adStatus === 'active') || (omniStatusFilter === 'blocked_hidden' && (c.isHidden || c.adStatus === 'hidden' || c.adStatus === 'rejected'));
                      const hasImg = Boolean(c.images && c.images.length > 0);
                      const matchesImg = omniImageFilter === 'all' || (omniImageFilter === 'with_image' && hasImg) || (omniImageFilter === 'no_image' && !hasImg);
                      return matchesQuery && matchesStatus && matchesImg;
                    });

                    if (filteredOmniCars.length === 0) {
                      return (
                        <EmptyState
                          type="cars"
                          title="هیچ ئۆتۆمبێلێک نەدۆزرایەوە"
                          description="هیچ ڕیکلامێکی ئۆتۆمبێل بەم فلتەرانە نییە."
                          actionLabel="پاککردنەوەی فلتەرەکان"
                          onAction={() => {
                            setOmniSearch('');
                            setOmniStatusFilter('all');
                            setOmniImageFilter('all');
                          }}
                        />
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOmniCars.map(car => (
                          <div
                            key={car.id}
                          className={`p-4 rounded-3xl border transition-all space-y-3 relative ${
                            car.isHidden || car.adStatus === 'hidden'
                              ? 'bg-slate-50 border-amber-300'
                              : 'bg-white border-slate-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            {/* Car Image */}
                            <div
                              onClick={() => {
                                if (car.images && car.images[0]) {
                                  setPreviewImageUrl(car.images[0]);
                                  setPreviewImageTitle(car.title);
                                }
                              }}
                              className="w-20 h-20 rounded-2xl bg-slate-100 overflow-hidden shrink-0 border border-slate-200 cursor-pointer relative group"
                            >
                              {car.images && car.images[0] ? (
                                <>
                                  <img src={car.images[0]} alt={car.title} className="w-full h-full object-cover group-hover:scale-105 transition-all" />
                                  <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                                    <Maximize2 className="w-4 h-4 text-white" />
                                  </div>
                                </>
                              ) : (
                                <div className="w-full h-full flex items-center justify-center bg-slate-200 text-slate-400">
                                  <Car className="w-8 h-8" />
                                </div>
                              )}
                            </div>

                            <div className="flex-1 min-w-0">
                              <div className="flex items-center gap-1.5 flex-wrap">
                                <span className="inline-flex items-center gap-1 font-bold text-[10px] px-2 py-0.5 rounded-full bg-slate-100 text-slate-700 border border-slate-200">
                                  {car.adStatus === 'active' ? '🟢 چالاک' : (car.adStatus === 'pending_approval' || car.adStatus === 'pending_payment' || car.adminApprovalStatus === 'pending') ? '⏳ چاوەڕوانی تەسدیق' : car.adStatus === 'sold' ? '🤝 فرۆشراو' : car.adStatus === 'rejected' ? '❌ ڕەتکراوە' : '👁️‍🗨️ بزرکراو'}
                                </span>
                                {car.isHidden && (
                                  <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                                    بزرکراو
                                  </span>
                                )}
                              </div>
                              <h4 className="font-black text-slate-900 text-sm truncate mt-1">
                                {car.title}
                              </h4>
                              <p className="text-xs font-black text-orange-600 font-latin">
                                {car.priceIqd?.toLocaleString()} د.ع {car.priceUsd ? `($${car.priceUsd.toLocaleString()})` : ''}
                              </p>
                              <p className="text-[10px] text-slate-500 font-latin truncate">
                                خاوەن: {car.userName} ({car.userPhone})
                              </p>
                            </div>
                          </div>

                          {/* Controls: Hide/Show, Delete, Change Status */}
                          <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
                            <button
                              type="button"
                              onClick={() => toggleCarAdHidden(car.id, !car.isHidden)}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                car.isHidden
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                  : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                              }`}
                            >
                              {car.isHidden ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>نیشاندانەوە</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>بزرکردن</span>
                                </>
                              )}
                            </button>

                            <select
                              value={car.adStatus}
                              onChange={(e) => updateCarAdStatus(car.id, e.target.value as any)}
                              className="text-xs font-bold bg-slate-50 border border-slate-200 rounded-xl px-2 py-2 text-slate-700 outline-none cursor-pointer"
                            >
                              <option value="active">🟢 چالاک (Active)</option>
                              <option value="pending_approval">⏳ چاوەڕوانی تەسدیق</option>
                              <option value="pending_payment">💳 چاوەڕوانی پارەدان</option>
                              <option value="sold">🤝 فرۆشراو (Sold)</option>
                              <option value="rejected">❌ ڕەتکراوە</option>
                              <option value="hidden">👁️‍🗨️ بزرکراو</option>
                            </select>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`دڵنیای لە سڕینەوەی ڕیکلامی ئۆتۆمبێلی "${car.title}"؟`)) {
                                  deleteCarAd(car.id);
                                }
                              }}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>سڕینەوە</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                  })()}
                </div>
              )}

              {/* ==================== 4. POSTS & FEEDBACKS SECTION ==================== */}
              {omniSection === 'posts' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between px-1">
                    <h3 className="text-sm font-black text-slate-900 flex items-center gap-2">
                      <MessageSquare className="w-4 h-4 text-emerald-500" />
                      <span>بەڕێوەبردنی سەرجەم پۆستەکان، بیروڕاکان و سەرنجەکان</span>
                    </h3>
                    <span className="text-xs font-bold text-slate-500 font-latin">
                      نیشاندانی {userFeedbacks.filter(f => {
                        const q = omniSearch.toLowerCase().trim();
                        const matchesQuery = !q || ((f.title || '').toLowerCase().includes(q) || (f.message || '').toLowerCase().includes(q) || (f.id || '').toLowerCase().includes(q) || (f.userName || '').toLowerCase().includes(q));
                        const matchesStatus = omniStatusFilter === 'all' || (omniStatusFilter === 'active' && !f.isHidden && f.status !== 'hidden') || (omniStatusFilter === 'blocked_hidden' && (f.isHidden || f.status === 'hidden'));
                        const hasImg = Boolean(f.message.includes('http') || (f as any).imageUrl || (f as any).attachmentUrl);
                        const matchesImg = omniImageFilter === 'all' || (omniImageFilter === 'with_image' && hasImg) || (omniImageFilter === 'no_image' && !hasImg);
                        return matchesQuery && matchesStatus && matchesImg;
                      }).length} پۆست لە کۆی {userFeedbacks.length}
                    </span>
                  </div>

                  {(() => {
                    const filteredOmniPosts = userFeedbacks.filter(f => {
                      const q = omniSearch.toLowerCase().trim();
                      const matchesQuery = !q || ((f.title || '').toLowerCase().includes(q) || (f.message || '').toLowerCase().includes(q) || (f.id || '').toLowerCase().includes(q) || (f.userName || '').toLowerCase().includes(q));
                      const matchesStatus = omniStatusFilter === 'all' || (omniStatusFilter === 'active' && !f.isHidden && f.status !== 'hidden') || (omniStatusFilter === 'blocked_hidden' && (f.isHidden || f.status === 'hidden'));
                      const hasImg = Boolean(f.message.includes('http') || (f as any).imageUrl || (f as any).attachmentUrl);
                      const matchesImg = omniImageFilter === 'all' || (omniImageFilter === 'with_image' && hasImg) || (omniImageFilter === 'no_image' && !hasImg);
                      return matchesQuery && matchesStatus && matchesImg;
                    });

                    if (filteredOmniPosts.length === 0) {
                      return (
                        <EmptyState
                          type="feedbacks"
                          title="هیچ فیدباک یان پۆستێک نەدۆزرایەوە"
                          description="هیچ پەیامێک لەگەڵ ئەم گەڕانە یان فلتەرەدا ناگونجێت."
                          actionLabel="پاککردنەوەی فلتەرەکان"
                          onAction={() => {
                            setOmniSearch('');
                            setOmniStatusFilter('all');
                            setOmniImageFilter('all');
                          }}
                        />
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {filteredOmniPosts.map(fb => (
                          <div
                            key={fb.id}
                          className={`p-4 rounded-3xl border transition-all space-y-3 relative ${
                            fb.isHidden || fb.status === 'hidden'
                              ? 'bg-slate-50 border-amber-300'
                              : 'bg-white border-slate-200 hover:shadow-md'
                          }`}
                        >
                          <div className="flex items-start justify-between gap-2">
                            <div>
                              <h4 className="font-black text-slate-900 text-sm flex items-center gap-1.5">
                                <span>{fb.title || 'پۆستی بەکارهێنەر'}</span>
                                {fb.isHidden && (
                                  <span className="bg-amber-500 text-slate-950 text-[9px] font-black px-1.5 py-0.5 rounded-md">
                                    بزرکراو
                                  </span>
                                )}
                              </h4>
                              <p className="text-[11px] text-slate-500 font-latin">
                                لەلایەن: {fb.userName} ({fb.userRole})
                              </p>
                            </div>
                            <span className="text-[10px] font-latin font-bold text-slate-400">
                              {new Date(fb.createdAt).toLocaleDateString('en-US')}
                            </span>
                          </div>

                          <p className="text-xs text-slate-700 leading-relaxed bg-slate-50 p-3 rounded-2xl border border-slate-100">
                            {fb.message}
                          </p>

                          {/* Action controls: Hide / Delete */}
                          <div className="flex items-center gap-2 pt-1">
                            <button
                              type="button"
                              onClick={() => toggleFeedbackHidden(fb.id, !fb.isHidden)}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black flex items-center justify-center gap-1.5 transition-all cursor-pointer ${
                                fb.isHidden
                                  ? 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-xs'
                                  : 'bg-slate-800 hover:bg-slate-900 text-white shadow-xs'
                              }`}
                            >
                              {fb.isHidden ? (
                                <>
                                  <Eye className="w-3.5 h-3.5" />
                                  <span>دیاریکردنەوە</span>
                                </>
                              ) : (
                                <>
                                  <EyeOff className="w-3.5 h-3.5" />
                                  <span>بزرکردنی پۆست</span>
                                </>
                              )}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`دڵنیای لە سڕینەوەی ئەم پۆستەی "${fb.userName}"؟`)) {
                                  deleteUserFeedback(fb.id);
                                }
                              }}
                              className="px-3 py-2 bg-red-100 hover:bg-red-200 text-red-700 rounded-xl text-xs font-black flex items-center justify-center gap-1 transition-all cursor-pointer"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>سڕینەوە</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                  })()}
                </div>
              )}
            </div>
          )}
        </div>
      )}

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Main Financial KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">کۆی داهاتی پلاتفۆرمی (شاخ)</span>
              <h3 className="text-2xl font-black text-emerald-600 font-latin">
                {totalPlatformEarnings.toLocaleString()} د.ع
              </h3>
              <p className="text-[11px] text-slate-400">کۆمسیۆن + ڕیکلامی ئۆتۆمبێل</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">کۆمسیۆنی داواکارییە گەیەندراوەکان</span>
              <h3 className="text-2xl font-black text-orange-600 font-latin">
                {totalCommissionRevenue.toLocaleString()} د.ع
              </h3>
              <p className="text-[11px] text-slate-400">{deliveredOrders.length} داواکاری تەواوکراو</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">داهاتی ڕیکلامی ئۆتۆمبێل</span>
              <h3 className="text-2xl font-black text-blue-600 font-latin">
                {totalCarAdRevenue.toLocaleString()} د.ع
              </h3>
              <p className="text-[11px] text-slate-400">پاکێجەکانی ٧، ١٥ و ٣٠ ڕۆژ</p>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">کۆی فرۆشی گشتی (GMV)</span>
              <h3 className="text-2xl font-black text-slate-900 font-latin">
                {totalGmv.toLocaleString()} د.ع
              </h3>
              <p className="text-[11px] text-slate-400">بەهای هەموو داواکارییەکان</p>
            </div>
          </div>

          {/* Quick Metrics */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold">فرۆشیارانی چالاک</span>
              <h4 className="text-xl font-black text-slate-900 font-latin mt-1">{sellers.length}</h4>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold">کاڵاکان</span>
              <h4 className="text-xl font-black text-slate-900 font-latin mt-1">{products.length}</h4>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold">ڕیکلامی ئۆتۆمبێل</span>
              <h4 className="text-xl font-black text-slate-900 font-latin mt-1">{carAds.length}</h4>
            </div>
            <div className="bg-white p-4 rounded-2xl border border-slate-200 text-center">
              <span className="text-xs text-slate-400 font-bold">کۆی داواکارییەکان</span>
              <h4 className="text-xl font-black text-slate-900 font-latin mt-1">{orders.length}</h4>
            </div>
          </div>
        </div>
      )}

      {/* Sellers Management Tab */}
      {tab === 'sellers' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-base font-black text-slate-900">بەڕێوەبردنی فرۆشیاران و ڕێژەی کۆمسیۆن</h3>
              <p className="text-xs text-slate-500">دەتوانیت ڕێژەی کۆمسیۆنی تایبەت بە هەر فرۆشیارێک (Commission %) دیاریبکەیت.</p>
            </div>
          </div>

          {sellers.length === 0 ? (
            <EmptyState
              type="sellers"
              title="هیچ فرۆشگایەک تۆمار نەکراوە"
              description="تۆمارەکانی Firestore بۆ فرۆشیاران لەم کاتەدا بەتاڵن."
              actionLabel="پوختەی گشتی"
              onAction={() => setTab('overview')}
            />
          ) : (
            <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">فرۆشگا</th>
                  <th className="p-3">بەش</th>
                  <th className="p-3">شار</th>
                  <th className="p-3">ڕێژەی کۆمسیۆن</th>
                  <th className="p-3">دۆخی ڕێککەوتنی کۆمسیۆن</th>
                  <th className="p-3">پشتڕاستکردنەوە</th>
                  <th className="p-3">کردار</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {sellers.map(s => (
                  <tr key={s.id} className="hover:bg-slate-50">
                    <td className="p-3">
                      <div className="flex items-center gap-2.5">
                        <img src={s.logoUrl} alt="" className="w-8 h-8 rounded-lg object-cover" />
                        <div>
                          <p className="font-bold text-slate-900">{s.storeName}</p>
                          <span className="text-[10px] text-slate-400 font-latin">{s.phone}</span>
                        </div>
                      </div>
                    </td>
                    <td className="p-3"><CategoryBadge category={s.category} /></td>
                    <td className="p-3 text-slate-700">{s.city}</td>
                    <td className="p-3">
                      {editingSellerId === s.id ? (
                        <div className="flex items-center gap-1.5">
                          <input
                            type="number"
                            value={newCommissionRate}
                            onChange={(e) => setNewCommissionRate(Number(e.target.value))}
                            className="w-16 p-1 border rounded text-xs font-latin"
                          />
                          <button
                            onClick={() => handleSaveCommission(s.id)}
                            className="px-2 py-1 bg-emerald-600 text-white rounded text-[10px] font-bold"
                          >
                            پاشەکەوت
                          </button>
                        </div>
                      ) : (
                        <span className="font-black text-orange-600 font-latin text-sm">
                          {s.commissionRate}%
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      {s.commissionAgreementStatus === 'requested_negotiation' ? (
                        <div className="flex flex-col gap-1 items-start">
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-amber-100 text-amber-800 text-[10px] font-bold">
                            💬 داوای {s.commissionNegotiationProposedRate}% dەکات
                          </span>
                          {s.commissionNegotiationProposedRate && (
                            <button
                              onClick={() => respondToCommissionNegotiation(s.id, s.commissionNegotiationProposedRate!)}
                              className="px-2 py-0.5 rounded bg-emerald-600 hover:bg-emerald-700 text-white text-[10px] font-bold cursor-pointer transition-all"
                            >
                              پەسەندکردنی {s.commissionNegotiationProposedRate}%
                            </button>
                          )}
                        </div>
                      ) : s.commissionAgreementStatus === 'agreed' ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 text-[10px] font-bold">
                          ✓ پەسەندکراوە
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-slate-500 text-[10px] font-bold">
                          چاوەڕوانی پەسەندکردن
                        </span>
                      )}
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => toggleSellerVerification(s.id)}
                        className={`px-2.5 py-1 rounded-full font-bold text-[10px] cursor-pointer ${
                          s.isVerified ? 'bg-emerald-50 text-emerald-700' : 'bg-slate-100 text-slate-500'
                        }`}
                      >
                        {s.isVerified ? 'پشتڕاستکراوە ✓' : 'پشتڕاستنەکراوە'}
                      </button>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          setEditingSellerId(s.id);
                          setNewCommissionRate(s.commissionRate);
                        }}
                        className="p-1 text-blue-600 hover:bg-blue-50 rounded"
                        title="دەستکاری کۆمسیۆن"
                      >
                        <Edit className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          )}
        </div>
      )}

      {/* Shakh & Seller Agreements Management Tab */}
      {tab === 'agreements' && (
        <div className="space-y-6">
          {/* Global Points System Conversion Rate Master Config */}
          <div className="bg-gradient-to-r from-amber-900 via-slate-900 to-amber-950 text-white p-6 sm:p-8 rounded-3xl border border-amber-500/30 shadow-xl space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-4">
              <div className="flex items-center gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-amber-500 text-slate-950 flex items-center justify-center font-black shadow-lg shadow-amber-500/20">
                  <Gift className="w-6 h-6" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="text-base sm:text-lg font-black text-white">ڕێکخستنی سیستەمی پۆینت و گۆڕینەوە (Points Settings)</h3>
                    <span className="text-[10px] bg-amber-500 text-slate-950 font-black px-2 py-0.5 rounded-full font-latin">
                      150 Pts = 1 IQD Rule
                    </span>
                  </div>
                  <p className="text-xs text-amber-200/80 mt-0.5">
                    یاسای سەرەکی: هەموو ١٥٠ پۆینت یەکسانە بە ١ دیناری عێراقی (discountIQD = points / 150)
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3">
                <div className="text-left bg-white/10 px-4 py-2 rounded-2xl border border-white/10">
                  <span className="text-[10px] text-amber-300 block font-bold">نرخی ئێستا:</span>
                  <span className="text-lg font-black text-amber-400 font-latin">
                    {pointsSettings.pointsPerIQD} Pts = 1 IQD
                  </span>
                </div>
              </div>
            </div>

            {/* Live Formula & Verification Demonstration Cards */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400 block text-[10px]">کەباب (Kebab Meal)</span>
                <span className="font-black text-amber-300 font-latin text-sm">300 pts = 2 IQD</span>
                <span className="text-[10px] text-slate-400 block font-latin">300 / {pointsSettings.pointsPerIQD} = {calculateDiscountFromPoints(300)} د.ع</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400 block text-[10px]">شاوەرمای مریشک (Chicken)</span>
                <span className="font-black text-amber-300 font-latin text-sm">100 pts = 0.666 IQD</span>
                <span className="text-[10px] text-slate-400 block font-latin">100 / {pointsSettings.pointsPerIQD} = {calculateDiscountFromPoints(100).toFixed(3)} د.ع</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400 block text-[10px]">کۆپۆنی ١,٥٠٠ پۆینت</span>
                <span className="font-black text-amber-300 font-latin text-sm">1,500 pts = 10 IQD</span>
                <span className="text-[10px] text-slate-400 block font-latin">1500 / {pointsSettings.pointsPerIQD} = {calculateDiscountFromPoints(1500)} د.ع</span>
              </div>
              <div className="p-3.5 rounded-2xl bg-white/5 border border-white/10 space-y-1">
                <span className="text-slate-400 block text-[10px]">کۆپۆنی ٣,٠٠٠ پۆینت</span>
                <span className="font-black text-amber-300 font-latin text-sm">3,000 pts = 20 IQD</span>
                <span className="text-[10px] text-slate-400 block font-latin">3000 / {pointsSettings.pointsPerIQD} = {calculateDiscountFromPoints(3000)} د.ع</span>
              </div>
            </div>

            {/* Config Form to adjust rate in Firebase/State */}
            <div className="pt-2 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-t border-white/10">
              <div className="flex items-center gap-3">
                <label className="text-xs font-bold text-slate-300">ڕێژەی پۆینت بۆ ١ دینار (pointsPerIQD):</label>
                <input
                  type="number"
                  min="1"
                  defaultValue={pointsSettings.pointsPerIQD}
                  id="adminPointsPerIQDInput"
                  className="w-24 px-3 py-1.5 rounded-xl bg-white text-slate-950 font-latin font-bold text-sm text-center"
                />
              </div>

              <button
                type="button"
                onClick={async () => {
                  const inputEl = document.getElementById('adminPointsPerIQDInput') as HTMLInputElement;
                  const val = Number(inputEl?.value || 150);
                  if (val > 0) {
                    await updatePointsSettings({ pointsPerIQD: val });
                    alert(`ڕێکخستنی سیستەمی پۆینت بۆ ${val} پۆینت = ١ د.ع پاشەکەوت کرا.`);
                  }
                }}
                className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-black rounded-xl text-xs flex items-center gap-2 cursor-pointer shadow-md transition-transform active:scale-95"
              >
                <Save className="w-4 h-4" />
                <span>پاشەکەوتکردنی ڕێژەی پۆینت</span>
              </button>
            </div>
          </div>

          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
              <div>
                <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                  <Award className="w-5 h-5 text-amber-500" />
                  <span>بەڕێوەبردنی ڕێککەوتنی پۆینتی شاخ و خاوەن کارەکان (Merchant Agreements)</span>
                </h3>
                <p className="text-xs text-slate-500 mt-1">
                  دیاریکردنی ئاستی ڕێککەوتن، ڕێژەی پۆینتی پاداشتی کڕیار، پۆینتی خاوەن کار و بۆنسی کاپتنی گەیاندن
                </p>
              </div>
            </div>

            {/* Agreements Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold">
                    <th className="p-3">خاوەن کار / فرۆشگا</th>
                    <th className="p-3">ئاستی ڕێککەوتن (Tier)</th>
                    <th className="p-3">پۆینتی کڕیار (Customer %)</th>
                    <th className="p-3">پۆینتی خاوەن کار (Merchant %)</th>
                    <th className="p-3">بۆنسی کاپتن (Driver Bonus)</th>
                    <th className="p-3">باری ڕێککەوتن</th>
                    <th className="p-3">کردارەکان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {sellers.map(s => {
                    const ag = getSellerAgreement(s.id);
                    const isEditing = editingAgSellerId === s.id;

                    return (
                      <tr key={s.id} className="hover:bg-slate-50">
                        <td className="p-3 font-bold text-slate-900">{s.storeName}</td>
                        <td className="p-3">
                          {isEditing ? (
                            <select
                              value={agTier}
                              onChange={(e) => setAgTier(e.target.value as any)}
                              className="p-1.5 border rounded-lg text-xs font-bold bg-white"
                            >
                              <option value="Standard">Standard (2% / 1.5%)</option>
                              <option value="Silver">Silver (2.5% / 2%)</option>
                              <option value="Gold">Gold (3.5% / 2.5%)</option>
                              <option value="VIP_Custom">VIP Custom (تایبەت)</option>
                            </select>
                          ) : (
                            <span className="font-latin font-bold text-amber-600 bg-amber-50 px-2.5 py-1 rounded-lg border border-amber-200">
                              {ag.tier}
                            </span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.5"
                              value={agCustPct}
                              onChange={(e) => setAgCustPct(Number(e.target.value))}
                              className="w-16 p-1 border rounded text-xs font-latin font-bold"
                            />
                          ) : (
                            <span className="font-latin font-bold text-slate-800">{ag.customerRewardPercent}%</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="number"
                              step="0.5"
                              value={agSellerPct}
                              onChange={(e) => setAgSellerPct(Number(e.target.value))}
                              className="w-16 p-1 border rounded text-xs font-latin font-bold"
                            />
                          ) : (
                            <span className="font-latin font-bold text-emerald-600">{ag.sellerRewardPercent}%</span>
                          )}
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <input
                              type="number"
                              value={agDriverPts}
                              onChange={(e) => setAgDriverPts(Number(e.target.value))}
                              className="w-16 p-1 border rounded text-xs font-latin font-bold"
                            />
                          ) : (
                            <span className="font-latin font-bold text-blue-600">+{ag.driverBonusPoints} pt</span>
                          )}
                        </td>
                        <td className="p-3">
                          <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800">
                            {ag.status === 'active' ? 'چالاککراوە' : 'لە پێداچوونەوەدا'}
                          </span>
                        </td>
                        <td className="p-3">
                          {isEditing ? (
                            <button
                              onClick={() => handleSaveAgreement(s.id)}
                              className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold shadow-xs cursor-pointer"
                            >
                              پاشەکەوتکردن
                            </button>
                          ) : (
                            <button
                              onClick={() => openAgreementEditor(s.id)}
                              className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg flex items-center gap-1 font-bold cursor-pointer"
                            >
                              <Edit className="w-3.5 h-3.5" />
                              <span>دەستکاری</span>
                            </button>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Points Ledger Global History */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-4">
            <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
              <Gift className="w-5 h-5 text-amber-500" />
              <span>تۆماری گشتی جوڵەی پۆینتەکان لە سیستەمی شاخ (Global Points Ledger)</span>
            </h3>

            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead>
                  <tr className="border-b border-slate-200 text-slate-400 font-bold">
                    <th className="p-3">ناوی وەرگر / ڕۆڵ</th>
                    <th className="p-3">بڕی پۆینت</th>
                    <th className="p-3">جۆری جوڵە</th>
                    <th className="p-3">کۆدی داواکاری</th>
                    <th className="p-3">وەسف و هۆکار</th>
                    <th className="p-3">کات</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pointsTransactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-slate-50">
                      <td className="p-3">
                        <span className="font-bold text-slate-900 block">{tx.userName || tx.userId}</span>
                        <RoleBadge role={tx.role} />
                      </td>
                      <td className="p-3">
                        <span className={`font-black font-latin text-sm ${tx.points > 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {tx.points > 0 ? `+${tx.points}` : tx.points}
                        </span>
                      </td>
                      <td className="p-3 font-bold text-slate-600">{tx.type}</td>
                      <td className="p-3 font-latin font-bold text-slate-800">{tx.orderNumber || '-'}</td>
                      <td className="p-3 text-slate-600">{tx.description}</td>
                      <td className="p-3 font-latin text-slate-400 text-[11px]">{new Date(tx.createdAt).toLocaleString()}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* User Feedbacks Management Tab */}
      {tab === 'feedback' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 pb-4">
            <div>
              <h3 className="text-base font-black text-slate-900 flex items-center gap-2">
                <MessageSquare className="w-5 h-5 text-emerald-600" />
                <span>فیدباک و سەرنجەکانی بەکارهێنەران ({userFeedbacks.length})</span>
              </h3>
              <p className="text-xs text-slate-500 mt-1">
                وەڵامدانەوەی پێشنیار، کێشە تەکنیکییەکان و هەڵسەنگاندنەکانی بەکارهێنەران
              </p>
            </div>
          </div>

          {userFeedbacks.length === 0 ? (
            <EmptyState
              type="feedbacks"
              title="هیچ فیدباکێک نییە"
              description="هێشتا هیچ بەکارهێنەرێک فیدباک یان پێشنیاری بۆ سیستەم نەناردووە."
              actionLabel="پوختەی گشتی"
              onAction={() => setTab('overview')}
            />
          ) : (
            <div className="space-y-4">
              {userFeedbacks.map(fb => (
                <div key={fb.id} className="p-5 rounded-2xl bg-slate-50 border border-slate-200/80 space-y-3">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-slate-200/60 pb-2">
                  <div className="flex items-center gap-2.5">
                    <span className="font-black text-slate-900 text-sm">{fb.userName}</span>
                    <RoleBadge role={fb.userRole} />
                    {fb.userPhone && (
                      <span className="text-xs font-latin text-slate-400">({fb.userPhone})</span>
                    )}
                  </div>

                  <div className="flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs font-bold text-amber-500 font-latin">
                      <Star className="w-4 h-4 fill-amber-400" />
                      <span>{fb.rating}/5</span>
                    </div>

                    <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      fb.status === 'implemented'
                        ? 'bg-emerald-100 text-emerald-800'
                        : fb.status === 'reviewed'
                        ? 'bg-blue-100 text-blue-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}>
                      {fb.status === 'implemented' ? 'جێبەجێکراوە' : fb.status === 'reviewed' ? 'پێداچوونەوە کراوە' : 'لە چاوەڕوانیدایە'}
                    </span>
                  </div>
                </div>

                <div className="space-y-1">
                  <h4 className="text-xs font-black text-slate-900">{fb.title}</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">{fb.message}</p>
                </div>

                {fb.adminResponse && replyingFbId !== fb.id && (
                  <div className="p-3 bg-blue-50 border border-blue-200 rounded-xl text-xs text-blue-900">
                    <span className="font-bold text-[#2563EB] block">وەڵامی پێشووی بەڕێوەبەر:</span>
                    {fb.adminResponse}
                  </div>
                )}

                {replyingFbId === fb.id ? (
                  <div className="p-3 bg-white border border-slate-300 rounded-xl space-y-2">
                    <textarea
                      rows={2}
                      value={adminReplyMsg}
                      onChange={(e) => setAdminReplyMsg(e.target.value)}
                      placeholder="نووسینی وەڵام یان ڕوونکردنەوەی بەڕێوەبەر بۆ بەکارهێنەر..."
                      className="w-full text-xs p-2.5 border border-slate-200 rounded-lg focus:outline-hidden focus:border-blue-500"
                    />
                    <div className="flex items-center justify-end gap-2">
                      <button
                        onClick={() => setReplyingFbId(null)}
                        className="px-3 py-1 bg-slate-200 text-slate-700 rounded-lg text-xs font-bold cursor-pointer"
                      >
                        پاشگەزبوونەوە
                      </button>
                      <button
                        onClick={() => handleSaveAdminReply(fb.id, 'reviewed')}
                        className="px-3 py-1 bg-blue-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        پێداچوونەوە کرا (Reviewed)
                      </button>
                      <button
                        onClick={() => handleSaveAdminReply(fb.id, 'implemented')}
                        className="px-3 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold cursor-pointer"
                      >
                        جێبەجێکرا (Implemented)
                      </button>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-center justify-between pt-2">
                    <span className="text-[10px] text-slate-400 font-latin">
                      تۆمارکراوە لە: {new Date(fb.createdAt).toLocaleString()}
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm(`دڵنیای لە سڕینەوەی ئەم فیدباکەی "${fb.userName}"؟`)) {
                            deleteUserFeedback(fb.id);
                          }
                        }}
                        className="px-3 py-1 bg-red-100 hover:bg-red-200 text-red-700 text-[11px] font-bold rounded-lg cursor-pointer transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>سڕینەوە</span>
                      </button>

                      <button
                        onClick={() => {
                          setReplyingFbId(fb.id);
                          setAdminReplyMsg(fb.adminResponse || '');
                        }}
                        className="px-3 py-1 bg-slate-900 hover:bg-slate-800 text-white text-[11px] font-bold rounded-lg cursor-pointer transition-colors"
                      >
                        {fb.adminResponse ? 'دەستکاری وەڵام' : 'وەڵامدانەوەی فیدباک'}
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
          )}
        </div>
      )}

      {/* Orders Management Tab */}
      {tab === 'orders' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="text-base font-black text-slate-900">سەرجەم داواکارییەکانی پلاتفۆرم</h3>

          {orders.length === 0 ? (
            <EmptyState
              type="orders"
              title="هیچ داواکارییەک لە سیستەمدا نییە"
              description="لە ئێستادا هیچ داواکارییەکی كڕین لە داتابەیسی Firestoreدا تۆمار نەکراوە."
              actionLabel="پوختەی گشتی"
              onAction={() => setTab('overview')}
            />
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-right text-xs">
                <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                  <tr>
                    <th className="p-3">کۆدی داواکاری</th>
                    <th className="p-3">فرۆشگا</th>
                    <th className="p-3">کۆی پارە</th>
                    <th className="p-3">کۆمسیۆنی (شاخ)</th>
                    <th className="p-3">دۆخی داواکاری</th>
                    <th className="p-3">شار</th>
                    <th className="p-3">کردار</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {orders.map(o => (
                    <tr key={o.id} className="hover:bg-slate-50">
                      <td className="p-3 font-bold font-latin">{o.orderNumber}</td>
                      <td className="p-3 text-slate-800">{o.sellerName}</td>
                      <td className="p-3 font-black font-latin">{o.total.toLocaleString()} د.ع</td>
                      <td className="p-3 font-black text-orange-600 font-latin">
                        {(o.commissionAmount || Math.round(o.subtotal * 0.1)).toLocaleString()} د.ع
                      </td>
                      <td className="p-3"><StatusBadge status={o.status} /></td>
                      <td className="p-3 text-slate-600">{o.deliveryCity}</td>
                      <td className="p-3">
                        <button
                          onClick={() => onNavigate('order-tracking', o.id)}
                          className="px-2.5 py-1 bg-slate-900 text-white rounded-lg text-[10px] font-bold"
                        >
                          وردەکاری
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Car Ads Moderation Tab with Payment Proof Verification */}
      {tab === 'cars' && (
        <div className="bg-white dark:bg-slate-800 p-6 sm:p-8 rounded-3xl border border-slate-200 dark:border-slate-700 space-y-6">
          
          {/* Header & Stats */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-100 dark:border-slate-700 pb-5">
            <div>
              <h3 className="text-base sm:text-lg font-black text-slate-900 dark:text-slate-100 flex items-center gap-2">
                <Car className="w-5 h-5 text-amber-500" />
                <span>داشبۆردی سەرپەرشتیاری (شاخ) ئۆتۆ (Car Ads & Payment Moderation)</span>
              </h3>
              <p className="text-xs font-bold text-slate-500 dark:text-slate-400 mt-1">
                پێداچوونەوە و تەسدیقکردنی وەسڵی پارەدان (FastPay, FIB, ZainCash, AsiaPay) پێش بڵاوبوونەوەی ڕیکلامەکان
              </p>
            </div>

            {/* Quick stats pills */}
            <div className="flex items-center gap-2 flex-wrap">
              <span className="px-3 py-1.5 rounded-xl bg-amber-50 dark:bg-amber-950/60 border border-amber-200 dark:border-amber-800 text-xs font-black text-amber-800 dark:text-amber-300 flex items-center gap-1.5">
                <span>⏳ چاوەڕوانی پارەدان:</span>
                <span className="font-latin text-amber-600 dark:text-amber-400">
                  {carAds.filter(c => c.adStatus === 'pending_approval' || c.adStatus === 'pending_payment' || c.adminApprovalStatus === 'pending').length}
                </span>
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 text-xs font-black text-emerald-800 dark:text-emerald-300 flex items-center gap-1.5">
                <span>🟢 چالاک:</span>
                <span className="font-latin">{carAds.filter(c => c.adStatus === 'active').length}</span>
              </span>

              <span className="px-3 py-1.5 rounded-xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-800 text-xs font-black text-rose-800 dark:text-rose-300 flex items-center gap-1.5">
                <span>🤝 فرۆشراو:</span>
                <span className="font-latin">{carAds.filter(c => c.adStatus === 'sold').length}</span>
              </span>
            </div>
          </div>

          {/* Sub-Filter Tabs & Search */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-3">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 w-full sm:w-auto">
              {[
                {
                  id: 'pending' as const,
                  label: 'چاوەڕوانی تەسدیقی وەسڵ',
                  count: carAds.filter(c => c.adStatus === 'pending_approval' || c.adStatus === 'pending_payment' || c.adminApprovalStatus === 'pending').length,
                  highlight: true
                },
                { id: 'all' as const, label: 'هەموو ڕیکلامەکان', count: carAds.length },
                { id: 'active' as const, label: 'چالاکەکان', count: carAds.filter(c => c.adStatus === 'active').length },
                { id: 'sold' as const, label: 'فرۆشراوەکان', count: carAds.filter(c => c.adStatus === 'sold').length },
                { id: 'rejected' as const, label: 'ڕەتکراوەکان', count: carAds.filter(c => c.adStatus === 'rejected' || c.adminApprovalStatus === 'rejected').length }
              ].map(f => {
                const isActive = carFilterTab === f.id;
                return (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => setCarFilterTab(f.id)}
                    className={`px-3.5 py-2 rounded-2xl text-xs font-black whitespace-nowrap transition-all cursor-pointer flex items-center gap-1.5 ${
                      isActive
                        ? f.highlight
                          ? 'bg-amber-500 text-white shadow-md'
                          : 'bg-slate-900 dark:bg-slate-100 text-white dark:text-slate-900 shadow-md'
                        : 'bg-slate-100 dark:bg-slate-700/70 text-slate-700 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-600'
                    }`}
                  >
                    <span>{f.label}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded-full bg-black/20 text-white font-latin">
                      {f.count}
                    </span>
                  </button>
                );
              })}
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3 pointer-events-none" />
              <input
                type="text"
                placeholder="گەڕان لە ڕیکلامەکان..."
                value={carSearchQuery}
                onChange={(e) => setCarSearchQuery(e.target.value)}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-2xl py-2 pr-9 pl-3 text-xs text-slate-900 dark:text-slate-100 placeholder-slate-400 font-bold focus:outline-none focus:border-amber-500"
              />
            </div>
          </div>

          {/* Filter logic */}
          {(() => {
            let filteredCars = carAds.filter(c => {
              if (carFilterTab === 'pending') {
                return c.adStatus === 'pending_approval' || c.adStatus === 'pending_payment' || c.adminApprovalStatus === 'pending';
              }
              if (carFilterTab === 'active') return c.adStatus === 'active';
              if (carFilterTab === 'sold') return c.adStatus === 'sold';
              if (carFilterTab === 'rejected') return c.adStatus === 'rejected' || c.adminApprovalStatus === 'rejected';
              return true;
            });

            if (carSearchQuery.trim()) {
              const q = carSearchQuery.toLowerCase().trim();
              filteredCars = filteredCars.filter(c =>
                c.title.toLowerCase().includes(q) ||
                c.brand.toLowerCase().includes(q) ||
                c.model.toLowerCase().includes(q) ||
                c.userName.toLowerCase().includes(q) ||
                c.userPhone.toLowerCase().includes(q) ||
                (c.paymentRef || '').toLowerCase().includes(q)
              );
            }

            if (filteredCars.length === 0) {
              return (
                <EmptyState
                  type="cars"
                  title="هیچ ڕیکلامێک بەم فلتەرە نییە"
                  description={
                    carFilterTab === 'pending'
                      ? 'هیچ ڕیکلامێکی نوێ لە چاوەڕوانی تەسدیقی وەسڵی پارەدان نییە. گشت ڕیکلامەکان پێداچوونەوەیان بۆ کراوە.'
                      : 'تکایە فلتەرەکان پاکبکەرەوە یان وشەی گەڕان بگۆڕە.'
                  }
                  actionLabel="نیشاندانی هەموو ڕیکلامەکان"
                  onAction={() => {
                    setCarFilterTab('all');
                    setCarSearchQuery('');
                  }}
                />
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {filteredCars.map(car => {
                  const isCarPending = car.adStatus === 'pending_approval' || car.adStatus === 'pending_payment' || car.adminApprovalStatus === 'pending';
                  const hasProof = Boolean(car.paymentProofUrl);

                  return (
                    <div
                      key={car.id}
                      className={`p-5 rounded-3xl border transition-all space-y-4 relative flex flex-col justify-between ${
                        isCarPending
                          ? 'bg-amber-50/40 dark:bg-amber-950/30 border-amber-300 dark:border-amber-800 shadow-md ring-2 ring-amber-500/20'
                          : car.adStatus === 'sold'
                          ? 'bg-rose-50/30 dark:bg-rose-950/20 border-rose-200 dark:border-rose-900'
                          : 'bg-white dark:bg-slate-900 border-slate-200 dark:border-slate-700'
                      }`}
                    >
                      <div className="space-y-3">
                        {/* Status Badge & Actions Header */}
                        <div className="flex items-center justify-between">
                          <span
                            className={`text-[11px] font-black px-2.5 py-1 rounded-xl flex items-center gap-1 ${
                              isCarPending
                                ? 'bg-amber-500 text-white shadow-sm'
                                : car.adStatus === 'active'
                                ? 'bg-emerald-600 text-white'
                                : car.adStatus === 'sold'
                                ? 'bg-rose-600 text-white'
                                : 'bg-slate-600 text-white'
                            }`}
                          >
                            {isCarPending && <Clock className="w-3 h-3 animate-pulse" />}
                            <span>
                              {isCarPending
                                ? '⏳ چاوەڕوانی تەسدیقی پارەدان'
                                : car.adStatus === 'active'
                                ? '🟢 چالاک (Active)'
                                : car.adStatus === 'sold'
                                ? '🤝 فرۆشراو (Sold)'
                                : '❌ ڕەتکراوە'}
                            </span>
                          </span>

                          <span className="text-[10px] font-black text-slate-500 dark:text-slate-400 bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded-lg font-latin">
                            {car.packageType || '1_month'}
                          </span>
                        </div>

                        {/* Car Image + Title + Price */}
                        <div className="flex items-start gap-3">
                          <div
                            onClick={() => {
                              if (car.images && car.images[0]) {
                                setPreviewImageUrl(car.images[0]);
                                setPreviewImageTitle(car.title);
                              }
                            }}
                            className="w-20 h-20 rounded-2xl bg-slate-100 dark:bg-slate-800 overflow-hidden shrink-0 border border-slate-200 dark:border-slate-700 cursor-pointer relative group"
                          >
                            <img
                              src={car.images[0] || 'https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=800'}
                              alt={car.title}
                              className="w-full h-full object-cover group-hover:scale-105 transition-all"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 flex items-center justify-center transition-all">
                              <Maximize2 className="w-4 h-4 text-white" />
                            </div>
                          </div>

                          <div className="flex-1 min-w-0">
                            <h4 className="font-black text-slate-900 dark:text-slate-100 text-xs sm:text-sm truncate">
                              {car.title}
                            </h4>
                            <p className="text-xs font-black text-amber-600 dark:text-amber-400 font-latin mt-0.5">
                              {car.priceIqd?.toLocaleString()} د.ع {car.priceUsd ? `($${car.priceUsd.toLocaleString()})` : ''}
                            </p>
                            <p className="text-[11px] font-bold text-slate-500 dark:text-slate-400 mt-1">
                              فرۆشیار: <span className="text-slate-800 dark:text-slate-200">{car.userName}</span>
                            </p>
                            <p className="text-[10px] font-latin text-slate-400 dark:text-slate-500" dir="ltr">
                              {car.userPhone}
                            </p>
                          </div>
                        </div>

                        {/* Payment Verification Proof Box */}
                        <div className="p-3.5 rounded-2xl bg-slate-50 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 space-y-2">
                          <div className="flex items-center justify-between text-xs font-black text-slate-800 dark:text-slate-200 border-b border-slate-200/60 dark:border-slate-700/60 pb-1.5">
                            <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400">
                              <CreditCard className="w-3.5 h-3.5" />
                              <span>زانیاری پارەدان و وەسڵ</span>
                            </span>
                            <span className="text-[11px] text-emerald-600 dark:text-emerald-400 font-latin">
                              بڕ: {(car.packagePrice || 10000).toLocaleString()} د.ع
                            </span>
                          </div>

                          <div className="grid grid-cols-2 gap-2 text-[11px]">
                            <div>
                              <span className="text-slate-400 block text-[10px]">ڕێگەی پارەدان:</span>
                              <span className="font-bold text-slate-800 dark:text-slate-200">
                                {car.paymentMethodUsed === 'fib'
                                  ? 'بانکی FIB'
                                  : car.paymentMethodUsed === 'zaincash'
                                  ? 'زەین کاش'
                                  : car.paymentMethodUsed === 'asiapay'
                                  ? 'ئاسیاپەی'
                                  : 'فاستپەی (FastPay)'}
                              </span>
                            </div>

                            <div>
                              <span className="text-slate-400 block text-[10px]">کۆدی وەسڵ / ژمارە:</span>
                              <span className="font-bold font-latin text-slate-800 dark:text-slate-200 truncate block">
                                {car.paymentRef || 'بێ کۆد'}
                              </span>
                            </div>
                          </div>

                          {/* Payment Receipt Image Thumbnail & Zoom */}
                          {hasProof ? (
                            <div className="pt-1.5 flex items-center justify-between">
                              <div
                                onClick={() => {
                                  if (car.paymentProofUrl) {
                                    setPreviewImageUrl(car.paymentProofUrl);
                                    setPreviewImageTitle(`بەڵگەی وەسڵی پارەدانی ڕیکلامی: ${car.title}`);
                                  }
                                }}
                                className="flex items-center gap-2 cursor-pointer p-1.5 bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-700 hover:border-amber-500 transition-colors w-full"
                              >
                                <img
                                  src={car.paymentProofUrl}
                                  alt="Receipt"
                                  className="w-10 h-10 rounded-lg object-cover border"
                                />
                                <div className="flex-1 min-w-0">
                                  <span className="text-[11px] font-black text-amber-600 dark:text-amber-400 flex items-center gap-1">
                                    <Maximize2 className="w-3 h-3" />
                                    <span>بینینی وەسڵی حەواڵە (Receipt)</span>
                                  </span>
                                  <span className="text-[10px] text-slate-400 block truncate">کرتە بکە بۆ گەورەکردن</span>
                                </div>
                              </div>
                            </div>
                          ) : (
                            <div className="p-2 rounded-xl bg-amber-100/50 dark:bg-amber-950/40 text-[10px] font-bold text-amber-800 dark:text-amber-300">
                              ⚠️ وێنەی وەسڵ بارنەکراوە، بەپێی کۆدی حەواڵە تەسدیق بکە.
                            </div>
                          )}
                        </div>
                      </div>

                      {/* Super Admin Action Buttons */}
                      <div className="pt-3 border-t border-slate-100 dark:border-slate-700/80 space-y-2">
                        {isCarPending ? (
                          <div className="grid grid-cols-2 gap-2">
                            <button
                              type="button"
                              onClick={async () => {
                                await approveCarAd(car.id);
                              }}
                              className="py-2.5 px-3 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white font-black text-xs flex items-center justify-center gap-1.5 shadow-md shadow-emerald-600/20 transition-all cursor-pointer active:scale-95"
                            >
                              <CheckCircle className="w-4 h-4" />
                              <span>پەسەندکردن و بڵاوکردنەوە</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                setRejectingCarId(car.id);
                              }}
                              className="py-2.5 px-3 rounded-2xl bg-rose-100 dark:bg-rose-950/60 hover:bg-rose-200 dark:hover:bg-rose-900 text-rose-700 dark:text-rose-300 font-black text-xs flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                            >
                              <XCircle className="w-4 h-4" />
                              <span>ڕەتکردنەوە</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center justify-between gap-2">
                            <button
                              type="button"
                              onClick={() => {
                                const next = car.adStatus === 'sold' ? 'active' : 'sold';
                                updateCarAdStatus(car.id, next);
                              }}
                              className={`flex-1 py-2 px-3 rounded-xl text-xs font-black transition-colors cursor-pointer ${
                                car.adStatus === 'sold'
                                  ? 'bg-blue-600 text-white'
                                  : 'bg-slate-100 dark:bg-slate-700 text-slate-800 dark:text-slate-200'
                              }`}
                            >
                              {car.adStatus === 'sold' ? 'چالاککردنەوە' : 'دیاریکردن وەک فرۆشراو'}
                            </button>

                            <button
                              type="button"
                              onClick={() => {
                                if (window.confirm(`دڵنیایت لە سڕینەوەی ڕیکلامی "${car.title}"؟`)) {
                                  deleteCarAd(car.id);
                                }
                              }}
                              className="p-2 rounded-xl bg-red-50 dark:bg-red-950/50 hover:bg-red-100 text-red-600 transition-colors cursor-pointer"
                              title="سڕینەوە"
                            >
                              <Trash2 className="w-4 h-4" />
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            );
          })()}

        </div>
      )}

      {/* Reject Car Ad Modal */}
      {rejectingCarId && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-xs z-50 flex items-center justify-center p-4">
          <div className="bg-white dark:bg-slate-800 max-w-md w-full rounded-3xl p-6 border border-slate-200 dark:border-slate-700 shadow-2xl space-y-4 text-right" dir="rtl">
            <div className="flex items-center gap-3">
              <div className="p-3 bg-rose-100 dark:bg-rose-900/50 text-rose-600 rounded-2xl">
                <XCircle className="w-6 h-6" />
              </div>
              <div>
                <h4 className="text-base font-black text-slate-900 dark:text-slate-100">ڕەتکردنەوەی وەسڵی پارەدان</h4>
                <p className="text-xs text-slate-500 dark:text-slate-400">هۆکاری ڕەتکردنەوە دیاریبکە:</p>
              </div>
            </div>

            <textarea
              value={rejectReasonText}
              onChange={(e) => setRejectReasonText(e.target.value)}
              rows={3}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-300 dark:border-slate-600 rounded-2xl p-3 text-xs font-bold text-slate-900 dark:text-slate-100 focus:outline-none focus:border-rose-500"
              placeholder="وەک: وەسڵی پارەدان ڕوون نییە، تکایە جارێکی تر وێنەی وەسڵ بنێرەوە..."
            />

            <div className="grid grid-cols-2 gap-2.5 pt-2">
              <button
                type="button"
                onClick={() => setRejectingCarId(null)}
                className="py-2.5 px-4 bg-slate-100 dark:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-black cursor-pointer"
              >
                پەشیمانبوونەوە
              </button>

              <button
                type="button"
                onClick={async () => {
                  if (rejectingCarId) {
                    await rejectCarAd(rejectingCarId, rejectReasonText);
                    setRejectingCarId(null);
                  }
                }}
                className="py-2.5 px-4 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-black cursor-pointer shadow-md"
              >
                تەئکیدکردنەوەی ڕەتکردنەوە
              </button>
            </div>
          </div>
        </div>
      )}


      {/* Products Management Tab */}
      {tab === 'products' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-black text-slate-900">بەڕێوەبردنی گشت کاڵاکان بە سیستەمی داینامیک ({products.length})</h3>
              <p className="text-xs text-slate-500 mt-1">
                زیادکردن و دەستکاریکردنی کاڵاکان بە خانەی تایبەت بە هەر بەشێک (قەبارە، ڕەنگ، ساڵ، کیلۆمەتر، براند، مۆدێل و هتد)
              </p>
            </div>
            <button
              onClick={() => {
                setEditingProduct(null);
                setIsProductModalOpen(true);
              }}
              className="px-4 py-2.5 bg-red-700 hover:bg-red-800 text-white rounded-xl text-xs font-bold shadow-md flex items-center gap-2 cursor-pointer self-start sm:self-auto transition-all"
            >
              <PackagePlus className="w-4 h-4" />
              <span>+ زیادکردنی کاڵای نوێ</span>
            </button>
          </div>

          {/* Search & Category Filter Bar */}
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <div className="relative flex-1">
              <Search className="w-4 h-4 text-slate-400 absolute right-3 top-3" />
              <input
                type="text"
                placeholder="گەڕان بەپێی ناوی کاڵا، براند، مۆدێل، یان ناوی فرۆشگا..."
                value={productSearch}
                onChange={(e) => setProductSearch(e.target.value)}
                className="w-full bg-slate-50 border border-slate-200 rounded-xl pr-9 pl-3 py-2 text-xs focus:bg-white focus:outline-hidden focus:ring-2 focus:ring-red-700/20"
              />
            </div>
            <select
              value={productCategoryFilter}
              onChange={(e) => setProductCategoryFilter(e.target.value as any)}
              className="bg-slate-50 border border-slate-200 rounded-xl px-3 py-2 text-xs font-bold text-slate-700 focus:bg-white"
            >
              <option value="all">گشت بەشەکان ({products.length})</option>
              <option value="food">خواردن</option>
              <option value="market">مارکێت</option>
              <option value="clothes">جلوبەرگ</option>
              <option value="electronics">ئەلیکترۆنیات</option>
              <option value="cars">ئۆتۆمبێل</option>
              <option value="fruits_vegetables">سەوزە و میوە</option>
              <option value="fresh_meat">گۆشت</option>
              <option value="dairy">شیرەمەنی</option>
              <option value="beauty">جوانی و تەندروستی</option>
            </select>
          </div>

          {/* Products List Grid */}
          {(() => {
            const filteredProducts = products.filter(p => {
              const matchesCat = productCategoryFilter === 'all' || p.category === productCategoryFilter;
              const matchesSearch = !productSearch.trim() ||
                p.title.toLowerCase().includes(productSearch.toLowerCase()) ||
                (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase())) ||
                (p.model && p.model.toLowerCase().includes(productSearch.toLowerCase())) ||
                (p.sellerName && p.sellerName.toLowerCase().includes(productSearch.toLowerCase()));
              return matchesCat && matchesSearch;
            });

            if (filteredProducts.length === 0) {
              return (
                <EmptyState
                  type="products"
                  title="هیچ کاڵایەک نەدۆزرایەوە"
                  description="هیچ کاڵایەک بەپێی بەشی دیاریکراو یان وشەی گەڕان لە داتابەیسدا بەردەست نییە."
                  actionLabel="سڕینەوەی فلتەرەکان"
                  onAction={() => {
                    setProductSearch('');
                    setProductCategoryFilter('all');
                  }}
                  secondaryActionLabel="+ زیادکردنی کاڵای نوێ"
                  onSecondaryAction={() => {
                    setEditingProduct(null);
                    setIsProductModalOpen(true);
                  }}
                />
              );
            }

            return (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {filteredProducts.map(p => (
                  <div key={p.id} className="bg-slate-50 border border-slate-200 rounded-2xl p-4 flex flex-col justify-between space-y-3 hover:border-slate-300 transition-colors">
                    <div className="space-y-2.5">
                      <div className="flex gap-3 items-start">
                        <img
                          src={p.images[0] || 'https://images.unsplash.com/photo-1544025162-d76694265947?w=300'}
                          alt={p.title}
                          className="w-16 h-16 rounded-xl object-cover border border-slate-200 flex-shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-1.5 flex-wrap mb-1">
                            <CategoryBadge category={p.category} />
                            {p.subcategory && (
                              <span className="text-[10px] bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">
                                {p.subcategory}
                              </span>
                            )}
                          </div>
                          <h4 className="text-xs font-bold text-slate-900 line-clamp-1">{p.title}</h4>
                          <p className="text-[11px] text-slate-500 line-clamp-1">{p.sellerName || 'فرۆشگای شاخ'}</p>
                          <div className="flex items-baseline gap-1.5 mt-0.5">
                            <span className="text-xs font-black text-orange-600 font-latin">
                              {(p.discountPrice || p.price).toLocaleString()} د.ع
                            </span>
                            {p.discountPrice && (
                              <span className="text-[10px] text-slate-400 line-through font-latin">
                                {p.price.toLocaleString()}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>

                      {/* Dynamic Meta Chips */}
                      <div className="pt-2 border-t border-slate-200/80 flex flex-wrap gap-1 text-[10px]">
                        {p.category === 'clothes' && (
                          <>
                            {p.sizes && p.sizes.length > 0 && (
                              <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                                قەبارەکان: {p.sizes.join(', ')}
                              </span>
                            )}
                            {p.colors && p.colors.length > 0 && (
                              <span className="bg-purple-100 text-purple-800 font-bold px-1.5 py-0.5 rounded">
                                {p.colors.length} ڕەنگ
                              </span>
                            )}
                            {p.brand && <span className="bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded font-latin">{p.brand}</span>}
                          </>
                        )}
                        {p.category === 'electronics' && (
                          <>
                            {p.brand && <span className="bg-blue-100 text-blue-800 font-bold px-1.5 py-0.5 rounded font-latin">{p.brand}</span>}
                            {p.model && <span className="bg-blue-50 text-blue-700 font-bold px-1.5 py-0.5 rounded font-latin">{p.model}</span>}
                            {p.warrantyMonths && <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">گارانتی {p.warrantyMonths} مانگ</span>}
                          </>
                        )}
                        {p.category === 'cars' && (
                          <>
                            {p.year && <span className="bg-amber-100 text-amber-900 font-bold px-1.5 py-0.5 rounded font-latin">مۆدێل {p.year}</span>}
                            {p.mileageKm !== undefined && <span className="bg-amber-50 text-amber-800 font-bold px-1.5 py-0.5 rounded font-latin">{p.mileageKm.toLocaleString()} کم</span>}
                            {p.transmission && <span className="bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">{p.transmission === 'automatic' ? 'ئۆتۆماتیک' : 'دەستی'}</span>}
                          </>
                        )}
                        {p.category === 'food' && (
                          <>
                            {p.prepTimeMinutes && <span className="bg-orange-100 text-orange-800 font-bold px-1.5 py-0.5 rounded font-latin">⏱ {p.prepTimeMinutes} خولەک</span>}
                            {p.isSpicy && <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">🔥 تیژ</span>}
                            {p.isVegetarian && <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">🥗 گیاخۆری</span>}
                          </>
                        )}
                        {p.category === 'fresh_meat' && (
                          <>
                            {p.meatType && <span className="bg-rose-50 text-rose-700 font-bold px-1.5 py-0.5 rounded">{p.meatType}</span>}
                            {p.cutType && <span className="bg-rose-100 text-rose-800 font-bold px-1.5 py-0.5 rounded">{p.cutType}</span>}
                          </>
                        )}
                        {p.category === 'fruits_vegetables' && (
                          <>
                            {p.isOrganic && <span className="bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">🌿 ئۆرگانیک</span>}
                            {p.origin && <span className="bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded">{p.origin}</span>}
                          </>
                        )}
                        {p.category === 'dairy' && (
                          <>
                            {p.expiryInfo && <span className="bg-cyan-100 text-cyan-800 font-bold px-1.5 py-0.5 rounded">بەسەرچوون: {p.expiryInfo}</span>}
                          </>
                        )}
                        {p.category === 'beauty' && (
                          <>
                            {p.brand && <span className="bg-pink-100 text-pink-800 font-bold px-1.5 py-0.5 rounded font-latin">{p.brand}</span>}
                            {p.volume && <span className="bg-slate-200 text-slate-700 font-bold px-1.5 py-0.5 rounded font-latin">{p.volume}</span>}
                          </>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                        p.stock > 0 ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
                      }`}>
                        کۆگا: {p.stock} {p.unit || 'دانە'}
                      </span>

                      <div className="flex items-center gap-1">
                        <button
                          onClick={() => {
                            setEditingProduct(p);
                            setIsProductModalOpen(true);
                          }}
                          className="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg cursor-pointer transition-colors"
                          title="دەستکاری کاڵا"
                        >
                          <Edit className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => {
                            if (confirm(`ئایا دڵنیایت لە سڕینەوەی کاڵای "${p.title}"؟`)) {
                              deleteProduct(p.id);
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
            );
          })()}
        </div>
      )}

      {/* Financial Commission Ledger */}
      {tab === 'finances' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="text-base font-black text-slate-900">تۆماری دارایی کۆمسیۆنە وەرگیراوەکان</h3>

          <div className="space-y-3">
            {commissionTransactions.map(tx => (
              <div key={tx.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 flex items-center justify-between gap-3 text-xs">
                <div>
                  <h4 className="font-bold text-slate-900">کۆمسیۆنی داواکاری {tx.orderId}</h4>
                  <p className="text-[11px] text-slate-500">
                    فرۆشگا: {tx.sellerName} • فرۆشی گشتی: {tx.orderTotal.toLocaleString()} د.ع ({tx.commissionRate}%)
                  </p>
                </div>
                <div className="text-left">
                  <span className="font-black text-emerald-600 font-latin text-sm block">
                    +{tx.commissionAmount.toLocaleString()} د.ع
                  </span>
                  <span className="text-[10px] text-slate-400">
                    {new Date(tx.createdAt).toLocaleDateString()}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {tab === 'i18n' && (
        <I18nAdminManager />
      )}

      {tab === 'app_updates' && (
        <AppUpdateManager />
      )}

      {tab === 'captains' && (
        <div className="space-y-6">
          <CaptainManager
            sellerId="platform-all"
            sellerName="سەکۆی (شاخ)"
            drivers={allPlatformCaptains}
            isPlatformAdmin={true}
            onAddDriver={async (d) => {
              // Assign to default seller or admin store
              const targetSeller = sellers[0]?.id || 'admin-store';
              return await addStoreDriver(targetSeller, d);
            }}
            onUpdateDriver={async (driverId, updates) => {
              const drv = allPlatformCaptains.find(c => c.id === driverId);
              const targetSeller = drv?.sellerId || sellers[0]?.id || 'admin-store';
              await updateStoreDriver(targetSeller, driverId, updates);
            }}
            onDeleteDriver={async (driverId) => {
              const drv = allPlatformCaptains.find(c => c.id === driverId);
              const targetSeller = drv?.sellerId || sellers[0]?.id || 'admin-store';
              await deleteStoreDriver(targetSeller, driverId);
            }}
          />
        </div>
      )}

      {/* Dynamic Product Modal for Super Admin */}
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
          isSuperAdmin={true}
          sellerName="بەڕێوەبەرایەتی شاخ"
          sellerId="admin-store"
          onSave={handleSaveProduct}
          onCancel={() => {
            setIsProductModalOpen(false);
            setEditingProduct(null);
          }}
        />
      </Modal>

      {/* Factory Reset & Demo Cleaner Confirmation Modal */}
      <Modal
        isOpen={isPurgeModalOpen}
        onClose={() => {
          if (!isPurging) setIsPurgeModalOpen(false);
        }}
        title="🏭 ڕێکخستنەوەی داتابەیس و پاكکردنەوەی داتای دیمۆ و تێست"
        maxWidth="lg"
      >
        <div className="space-y-4 py-2">
          <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed font-bold">
            یارمەتیدەر بۆ ئامادەکردنی ژینگەی بەرکارهێنان (<span className="font-latin">Production Environment</span>). هەڵبژێرە بەپێی ویستت:
          </p>

          {/* Confirmation Safeguard Input */}
          <div className="p-3.5 bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-2xl space-y-2">
            <label className="block text-xs font-bold text-slate-800 dark:text-slate-200">
              🔒 بۆ داگیرساندنی کرداری سڕینەوە، تکایە کلمەی <span className="text-rose-600 font-latin font-black">RESET</span> بنووسە:
            </label>
            <input
              type="text"
              value={purgeConfirmText}
              onChange={(e) => setPurgeConfirmText(e.target.value)}
              placeholder="RESET"
              className="w-full px-3 py-2 bg-white dark:bg-slate-800 border border-slate-300 dark:border-slate-700 rounded-xl text-xs font-bold font-latin focus:ring-2 focus:ring-red-500 outline-none uppercase"
            />
            {!isConfirmValid && (
              <p className="text-[10px] text-amber-600 dark:text-amber-400 font-bold">
                ⚠️ تا دەستەواژەی "RESET" نەنووسرێت دوگمەکانی سڕینەوە ناچالاک دەبن.
              </p>
            )}
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Option 1: Clean Tagged Demo Records Only */}
            <div className="p-3.5 bg-amber-500/10 border border-amber-500/30 rounded-2xl flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 font-black text-xs text-amber-800 dark:text-amber-300 mb-1">
                  <span>🧹 سڕینەوەی داتای نیشانەکراوی دیمۆ/تێست (Selective Cleaner)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                  تەنها ئەو دۆکیومێنتانەی هێمای <span className="font-latin font-bold">isDemo, isTest, tag: 'demo'</span> یان ناسنامەی دیمۆیان هەیە دەسڕێتەوە. <strong className="text-emerald-600 dark:text-emerald-400">بەکارهێنەران و داواکارییە ڕاستەقینەکان دەپارێزێت.</strong>
                </p>
              </div>
              <button
                type="button"
                disabled={isPurging || !isConfirmValid || !isSuperAdmin}
                onClick={handleCleanTaggedDemoOnly}
                className={`w-full mt-2 px-3 py-2 text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                  isConfirmValid && isSuperAdmin && !isPurging
                    ? 'bg-amber-500 hover:bg-amber-600 text-slate-950 cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isPurging ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Trash2 className="w-3.5 h-3.5" />
                )}
                <span>سڕینەوەی داتای دیمۆ/تێست تەنها</span>
              </button>
            </div>

            {/* Option 2: Full Factory Reset */}
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/30 rounded-2xl flex flex-col justify-between space-y-2">
              <div>
                <div className="flex items-center gap-1.5 font-black text-xs text-rose-800 dark:text-rose-300 mb-1">
                  <span>🏭 ڕێکخستنەوەی تەکامولی کارگە (Full Factory Reset)</span>
                </div>
                <p className="text-[11px] text-slate-600 dark:text-slate-300 leading-normal">
                  تەواوی داتای دیمۆی سەر بەرهەم و فرۆشیار و داواکارییەکان لە داتابەیس بەکۆمەڵ دەسڕێتەوە بۆ دەستپێکردنی کار بە بەرهەمی نوێ.
                </p>
              </div>
              <button
                type="button"
                disabled={isPurging || !isConfirmValid || !isSuperAdmin}
                onClick={handlePurgeDatabase}
                className={`w-full mt-2 px-3 py-2 text-xs font-black rounded-xl shadow-xs transition-all flex items-center justify-center gap-1.5 ${
                  isConfirmValid && isSuperAdmin && !isPurging
                    ? 'bg-rose-600 hover:bg-rose-700 text-white cursor-pointer'
                    : 'bg-slate-200 dark:bg-slate-800 text-slate-400 cursor-not-allowed'
                }`}
              >
                {isPurging ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <RotateCcw className="w-3.5 h-3.5" />
                )}
                <span>جێبەجێکردنی Factory Reset</span>
              </button>
            </div>
          </div>

          {purgeResultMsg && (
            <div className="p-3 bg-emerald-500/15 border border-emerald-500/40 text-emerald-700 dark:text-emerald-300 rounded-xl text-xs font-bold flex items-center gap-2">
              <CheckCircle className="w-4 h-4 text-emerald-500 shrink-0" />
              <span>{purgeResultMsg}</span>
            </div>
          )}

          <div className="flex items-center justify-end pt-2 border-t border-slate-100 dark:border-slate-800">
            <button
              type="button"
              disabled={isPurging}
              onClick={() => setIsPurgeModalOpen(false)}
              className="px-4 py-2 bg-slate-100 dark:bg-slate-800 text-slate-700 dark:text-slate-300 font-bold text-xs rounded-xl hover:bg-slate-200 cursor-pointer"
            >
              داخستن
            </button>
          </div>
        </div>
      </Modal>

      {/* Image Preview Modal */}
      {previewImageUrl && (
        <Modal
          isOpen={Boolean(previewImageUrl)}
          onClose={() => setPreviewImageUrl(null)}
          title={previewImageTitle || 'بینی وێنە'}
        >
          <div className="space-y-4 text-center">
            <div className="max-h-[70vh] overflow-hidden rounded-2xl border border-slate-200 bg-slate-950 flex items-center justify-center p-2">
              <img
                src={previewImageUrl}
                alt="Preview"
                className="max-h-[65vh] w-auto max-w-full object-contain rounded-xl shadow-2xl"
              />
            </div>
            <div className="flex items-center justify-between gap-3 pt-2">
              <span className="text-[10px] text-slate-400 font-latin truncate max-w-[280px]">
                {previewImageUrl}
              </span>
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => {
                    navigator.clipboard.writeText(previewImageUrl);
                    alert('لینکەکە کۆپیکرا!');
                  }}
                  className="px-3 py-1.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>کۆپی کردنی لینک</span>
                </button>
                <button
                  type="button"
                  onClick={() => setPreviewImageUrl(null)}
                  className="px-4 py-1.5 bg-amber-500 hover:bg-amber-600 text-slate-950 rounded-xl text-xs font-black cursor-pointer"
                >
                  داخستن
                </button>
              </div>
            </div>
          </div>
        </Modal>
      )}

    </div>
  );
};
