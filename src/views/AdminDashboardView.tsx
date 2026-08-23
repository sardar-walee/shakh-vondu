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
  RotateCcw
} from 'lucide-react';
import { useMarketplace } from '../context/MarketplaceContext';
import { useAuth } from '../context/AuthContext';
import { StatusBadge, CategoryBadge, RoleBadge } from '../components/common/Badge';
import { Modal } from '../components/common/Modal';
import { DynamicProductForm } from '../components/products/DynamicProductForm';
import { Product, ProductCategory, OrderStatus, CarPackageType, FeedbackStatus, OccasionBanner, OccasionType, OccasionThemeStyle } from '../types';
import { OCCASION_PRESETS } from '../data/occasionPresets';
import { OccasionHeaderBanner } from '../components/common/OccasionHeaderBanner';
import { OccasionBannerAdminPanel } from '../components/common/OccasionBannerAdminPanel';

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
    toggleSellerVerification,
    updateOrderStatus,
    updateCarAdStatus,
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
    cleanTaggedDemoOnly
  } = useMarketplace();
  const { currentUser, isSuperAdmin } = useAuth();

  const [tab, setTab] = useState<'overview' | 'sellers' | 'orders' | 'products' | 'cars' | 'agreements' | 'feedback' | 'occasions' | 'finances'>('overview');

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
              پلاتفۆرمی شاخی (Shakh) • خاوەن موڵک: <span className="font-latin font-bold">shakh8002@gmail.com</span> • دۆمەین: <span className="font-latin">daim-post.online</span>
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
          { id: 'overview', label: 'پوختەی دارایی و گشتی', icon: <TrendingUp className="w-4 h-4" /> },
          { id: 'occasions', label: 'بۆنە و یادەکان (مەولود)', icon: <Sparkles className="w-4 h-4 text-amber-500" /> },
          { id: 'sellers', label: `فرۆشیاران (${sellers.length})`, icon: <Store className="w-4 h-4" /> },
          { id: 'agreements', label: 'ڕێککەوتنی پۆینتی شاخ و خاوەن کار', icon: <Award className="w-4 h-4 text-amber-500" /> },
          { id: 'feedback', label: `فیدباک و سەرنجەکان (${userFeedbacks.length})`, icon: <MessageSquare className="w-4 h-4 text-emerald-500" /> },
          { id: 'orders', label: `داواکارییەکان (${orders.length})`, icon: <Package className="w-4 h-4" /> },
          { id: 'products', label: `کاڵاکان (${products.length})`, icon: <Sliders className="w-4 h-4" /> },
          { id: 'cars', label: `ڕیکلامی ئۆتۆمبێل (${carAds.length})`, icon: <Car className="w-4 h-4" /> },
          { id: 'finances', label: 'تۆماری کۆمسیۆن و داهات', icon: <DollarSign className="w-4 h-4" /> }
        ].map(t => (
          <button
            key={t.id}
            onClick={() => setTab(t.id as any)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all cursor-pointer ${
              tab === t.id
                ? 'bg-red-700 text-white shadow-xs'
                : 'bg-white text-slate-600 hover:bg-slate-100 border border-slate-200'
            }`}
          >
            {t.icon}
            <span>{t.label}</span>
          </button>
        ))}
      </div>

      {/* Occasions & Mawlid Banner Tab */}
      {tab === 'occasions' && (
        <OccasionBannerAdminPanel isModal={false} />
      )}

      {/* Overview Tab */}
      {tab === 'overview' && (
        <div className="space-y-6">
          {/* Main Financial KPI Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-6 rounded-3xl border border-slate-200 shadow-xs space-y-1">
              <span className="text-xs font-bold text-slate-400">کۆی داهاتی پلاتفۆرمی شاخی</span>
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

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">فرۆشگا</th>
                  <th className="p-3">بەش</th>
                  <th className="p-3">شار</th>
                  <th className="p-3">ڕێژەی کۆمسیۆن</th>
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
        </div>
      )}

      {/* Shakh & Seller Agreements Management Tab */}
      {tab === 'agreements' && (
        <div className="space-y-6">
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
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Orders Management Tab */}
      {tab === 'orders' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="text-base font-black text-slate-900">سەرجەم داواکارییەکانی پلاتفۆرم</h3>

          <div className="overflow-x-auto">
            <table className="w-full text-right text-xs">
              <thead className="bg-slate-50 border-b border-slate-200 text-slate-500 font-bold">
                <tr>
                  <th className="p-3">کۆدی داواکاری</th>
                  <th className="p-3">فرۆشگا</th>
                  <th className="p-3">کۆی پارە</th>
                  <th className="p-3">کۆمسیۆنی شاخی</th>
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
        </div>
      )}

      {/* Car Ads Moderation Tab */}
      {tab === 'cars' && (
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200 space-y-6">
          <h3 className="text-base font-black text-slate-900">بەڕێوەبردنی ڕیکلامەکانی ئۆتۆمبێل</h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {carAds.map(car => (
              <div key={car.id} className="p-4 rounded-2xl bg-slate-50 border border-slate-200 space-y-3">
                <img src={car.images[0]} alt="" className="w-full h-32 rounded-xl object-cover" />
                <div>
                  <h4 className="text-xs font-bold text-slate-900">{car.title}</h4>
                  <p className="text-xs font-black text-blue-700 font-latin mt-0.5">{car.priceIqd.toLocaleString()} د.ع</p>
                  <p className="text-[10px] text-slate-400">پاکێج: {car.packageType} • خاوەن: {car.userName}</p>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-200">
                  <span className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    car.adStatus === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {car.adStatus}
                  </span>

                  <button
                    onClick={() => updateCarAdStatus(car.id, car.adStatus === 'active' ? 'expired' : 'active')}
                    className="px-3 py-1 bg-slate-200 hover:bg-slate-300 text-slate-800 text-[10px] font-bold rounded-lg"
                  >
                    گۆڕینی دۆخ
                  </button>
                </div>
              </div>
            ))}
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
                <div className="text-center py-12 bg-slate-50 rounded-2xl border border-dashed border-slate-200">
                  <Package className="w-10 h-10 text-slate-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-slate-600">هیچ کاڵایەک نەدۆزرایەوە بەپێی ئەم فلتەرە</p>
                </div>
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

    </div>
  );
};
