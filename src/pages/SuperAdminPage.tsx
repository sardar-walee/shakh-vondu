import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { db } from '../lib/firebase';
import { collection, onSnapshot, query, doc, updateDoc } from 'firebase/firestore';
import { useAuth } from '../contexts/AuthContext';
import { usePermissions } from '../contexts/PermissionsContext';
import UnauthorizedAccessCard from '../components/auth/UnauthorizedAccessCard';
import { Store, BusinessType } from '../types';
import { 
  ShieldAlert, 
  Crown, 
  Store as StoreIcon, 
  Search, 
  Clock, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  PlusCircle, 
  Calendar, 
  Building2, 
  Phone, 
  Mail, 
  TrendingUp, 
  Layers, 
  Users, 
  AlertTriangle,
  RefreshCw,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const BUSINESS_TYPE_LABELS: Record<string, { labelKu: string; icon: string; color: string }> = {
  mobile_electronics: { labelKu: 'مۆبایل و ئەلیکترۆنیات', icon: '📱', color: 'bg-blue-100 text-blue-800' },
  pharmacy_medical: { labelKu: 'دەرمانساز / دەرمانخانە', icon: '💊', color: 'bg-emerald-100 text-emerald-800' },
  clothing_fashion: { labelKu: 'جل و بەرگ', icon: '👗', color: 'bg-purple-100 text-purple-800' },
  supermarket_grocery: { labelKu: 'مارکێت و سوپەرمارکێت', icon: '🛒', color: 'bg-amber-100 text-amber-800' },
  cosmetics_perfumes: { labelKu: 'جوانکاری و گوڵاو', icon: '💄', color: 'bg-pink-100 text-pink-800' },
  auto_parts: { labelKu: 'کەلوپەلی بیناسازی/ئۆتۆمبێل', icon: '🔧', color: 'bg-orange-100 text-orange-800' },
  general_retail: { labelKu: 'گشتی (دوکانی جۆراوجۆر)', icon: '📦', color: 'bg-gray-100 text-gray-800' }
};

export default function SuperAdminPage() {
  const { profile } = useAuth();
  const { actualRole } = usePermissions();

  const [stores, setStores] = useState<Store[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  // Selected store for subscription modification modal
  const [selectedStore, setSelectedStore] = useState<Store | null>(null);
  const [extensionMonths, setExtensionMonths] = useState<number>(3);
  const [isUpdating, setIsUpdating] = useState(false);

  const isSuperAdmin = profile?.role === 'superadmin' || profile?.email?.toLowerCase() === 'shakh8002@gmail.com' || actualRole === 'superadmin';

  // Live Firestore listener for all store subscribers
  useEffect(() => {
    if (!isSuperAdmin) return;

    const q = query(collection(db, 'stores'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const list: Store[] = [];
      snapshot.forEach(d => {
        list.push({ id: d.id, ...d.data() } as Store);
      });
      setStores(list);
      setLoading(false);
    }, (err) => {
      console.warn("Could not load subscriber stores:", err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [isSuperAdmin]);

  // KPI Calculations
  const stats = useMemo(() => {
    const total = stores.length;
    const trials = stores.filter(s => s.subscriptionStatus === 'trial').length;
    const activePaid = stores.filter(s => s.subscriptionStatus === 'active').length;
    const suspended = stores.filter(s => s.subscriptionStatus === 'suspended' || s.subscriptionStatus === 'expired').length;

    return { total, trials, activePaid, suspended };
  }, [stores]);

  // Filtered Subscribers
  const filteredStores = useMemo(() => {
    return stores.filter(s => {
      const matchesSearch = 
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.phone?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.subscriberEmail?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ownerId.toLowerCase().includes(searchTerm.toLowerCase());

      const matchesCategory = categoryFilter === 'all' || s.businessType === categoryFilter;
      const matchesStatus = statusFilter === 'all' || s.subscriptionStatus === statusFilter;

      return matchesSearch && matchesCategory && matchesStatus;
    });
  }, [stores, searchTerm, categoryFilter, statusFilter]);

  if (!isSuperAdmin) {
    return (
      <DashboardLayout>
        <UnauthorizedAccessCard 
          requiredPermission="superadmin:manage" 
          routeName="Super Admin Global Management Panel" 
        />
      </DashboardLayout>
    );
  }

  // Extend Subscription Handler
  const handleExtendSubscription = async (months: number) => {
    if (!selectedStore) return;
    setIsUpdating(true);

    try {
      const storeRef = doc(db, 'stores', selectedStore.id);
      const currentExpiry = selectedStore.subscriptionEndDate || selectedStore.trialEndDate || new Date().toISOString();
      const startDate = new Date(currentExpiry) > new Date() ? new Date(currentExpiry) : new Date();

      const newExpiry = new Date(startDate);
      newExpiry.setMonth(newExpiry.getMonth() + months);

      const planIdMap: Record<number, string> = {
        3: 'starter',
        6: 'pro',
        12: 'enterprise'
      };

      await updateDoc(storeRef, {
        subscriptionStatus: 'active',
        subscriptionEndDate: newExpiry.toISOString(),
        planId: planIdMap[months] || 'pro',
        updatedAt: new Date().toISOString()
      });

      alert(`بەسەرکەوتوویی نوێکردنەوەی ${months} مانگ بۆ فرۆشگای "${selectedStore.name}" ئەنجامدرا!`);
      setSelectedStore(null);
    } catch (err) {
      console.error("Failed to extend subscription:", err);
      alert("خەتایەک ڕوویدا لە کاتی درێژکردنەوەی ئابوونە.");
    } finally {
      setIsUpdating(false);
    }
  };

  // Toggle Store Active / Suspended
  const handleToggleStoreStatus = async (s: Store) => {
    const nextStatus = s.subscriptionStatus === 'suspended' ? 'active' : 'suspended';
    if (!confirm(`ئایا دڵنیایت لە ${nextStatus === 'suspended' ? 'ڕاگرتنی' : 'چالاککردنەوەی'} فرۆشگای "${s.name}"؟`)) return;

    try {
      await updateDoc(doc(db, 'stores', s.id), {
        subscriptionStatus: nextStatus,
        updatedAt: new Date().toISOString()
      });
    } catch (e) {
      console.error("Status update error:", e);
    }
  };

  return (
    <DashboardLayout>
      <div className="space-y-6 max-w-7xl mx-auto pb-12">
        {/* Page Header */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 sm:p-8 text-white shadow-2xl border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-gradient-to-r from-amber-400 to-yellow-500 text-slate-950 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full flex items-center gap-1 shadow-md">
                <Crown className="w-3.5 h-3.5" /> Super Admin Global Control
              </span>
              <span className="text-xs text-indigo-300 font-mono">shakh8002@gmail.com</span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-white">
              سەرپەرشتیاری گشتی بەشداربووان (Super Admin Panel)
            </h1>
            <p className="text-xs text-slate-300 mt-1 max-w-2xl leading-relaxed">
              بەڕێوەبردنی تەواوی فرۆشگا و بەشداربووان لە سەرتاسەری هەرێمی کوردستان و عێراق. پشتگیری مۆبایل، دەرمانخانە، جلوبەرگ، مارکێت و جوانکاری.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <div className="p-3 bg-white/10 rounded-2xl backdrop-blur-md border border-white/20 text-amber-400">
              <ShieldCheck className="w-8 h-8" />
            </div>
          </div>
        </div>

        {/* Global Overview KPI Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <StoreIcon className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">سەرجەم بەشداربووان</p>
              <p className="text-2xl font-black text-gray-900">{stats.total} <span className="text-xs font-normal text-gray-400">دوکان</span></p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Clock className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">تاقیکردنەوەی ۳ مانگ (Trial)</p>
              <p className="text-2xl font-black text-emerald-600">{stats.trials} <span className="text-xs font-normal text-emerald-500">چالاک</span></p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <Sparkles className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">ئابوونەی نوێکراوە</p>
              <p className="text-2xl font-black text-purple-600">{stats.activePaid} <span className="text-xs font-normal text-purple-400">پاداشت</span></p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-600 flex items-center justify-center font-black">
              <XCircle className="w-6 h-6" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">ڕاگیراو / بەسەرچوو</p>
              <p className="text-2xl font-black text-rose-600">{stats.suspended} <span className="text-xs font-normal text-rose-400">دوکان</span></p>
            </div>
          </div>
        </div>

        {/* Filter and Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col md:flex-row items-center justify-between gap-3">
          {/* Search Box */}
          <div className="w-full md:flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text"
              placeholder="گەڕان بەپێی ناوی فرۆشگا، ژمارەی تەلەفۆن، یان ئیمەیلی خاوەن دوکان..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none focus:ring-2 focus:ring-blue-500 text-xs font-bold"
            />
          </div>

          {/* Business Type Category Filter */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-xs font-bold text-gray-700"
          >
            <option value="all">هەموو جۆرەکانی دوکان (All Categories)</option>
            <option value="mobile_electronics">📱 مۆبایل و ئەلیکترۆنیات</option>
            <option value="pharmacy_medical">💊 دەرمانساز / دەرمانخانە</option>
            <option value="clothing_fashion">👗 جل و بەرگ</option>
            <option value="supermarket_grocery">🛒 مارکێت و سوپەرمارکێت</option>
            <option value="cosmetics_perfumes">💄 جوانکاری و گوڵاو</option>
            <option value="auto_parts">🔧 کەلوپەلی بیناسازی/ئۆتۆمبێل</option>
            <option value="general_retail">📦 گشتی</option>
          </select>

          {/* Subscription Status Filter */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full md:w-auto px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl outline-none text-xs font-bold text-gray-700"
          >
            <option value="all">هەموو باری ئابوونەکان</option>
            <option value="trial">تاقیکردنەوە (Trial - 3 Months Free)</option>
            <option value="active">نوێکراوە و چالاک (Active Paid)</option>
            <option value="suspended">ڕاگیراو (Suspended)</option>
          </select>
        </div>

        {/* Subscriber Stores Roster Table */}
        <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
          <div className="p-5 border-b border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-indigo-600" />
              <h3 className="font-black text-base text-gray-900">لیستی بەشداربووان (Subscriber Registry)</h3>
              <span className="px-2.5 py-0.5 bg-indigo-50 text-indigo-700 font-bold text-xs rounded-full">
                {filteredStores.length} فرۆشگا
              </span>
            </div>
          </div>

          {loading ? (
            <div className="p-12 text-center text-xs font-bold text-gray-400 flex items-center justify-center gap-2">
              <RefreshCw className="w-4 h-4 animate-spin text-blue-600" />
              <span>بارکردنی زانیاری بەشداربووان...</span>
            </div>
          ) : filteredStores.length === 0 ? (
            <div className="p-12 text-center text-xs text-gray-400 font-bold">
              هیچ بەشداربوویەک نەدۆزرایەوە!
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-right">
                <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 uppercase text-[10px] font-black">
                  <tr>
                    <th className="py-3.5 px-4 text-right">ناوی فرۆشگا</th>
                    <th className="py-3.5 px-4 text-right">جۆری دوکان</th>
                    <th className="py-3.5 px-4 text-right">پەیوەندی & خاوەن کار</th>
                    <th className="py-3.5 px-4 text-center">باری ئابوونە</th>
                    <th className="py-3.5 px-4 text-center">کاتی بەسەرچوون</th>
                    <th className="py-3.5 px-4 text-center">کردارەکان</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 text-gray-800 font-medium">
                  {filteredStores.map((s) => {
                    const catInfo = BUSINESS_TYPE_LABELS[s.businessType || 'mobile_electronics'] || BUSINESS_TYPE_LABELS.general_retail;
                    const expiryDate = s.subscriptionEndDate || s.trialEndDate;
                    const daysRemaining = expiryDate ? Math.max(0, Math.ceil((new Date(expiryDate).getTime() - new Date().getTime()) / (1000 * 60 * 60 * 24))) : 0;

                    return (
                      <tr key={s.id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="py-4 px-4">
                          <div className="flex items-center gap-3">
                            <div className="w-9 h-9 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-black">
                              <Building2 className="w-4.5 h-4.5" />
                            </div>
                            <div>
                              <p className="font-black text-gray-900 text-xs">{s.name}</p>
                              <p className="text-[10px] text-gray-400">{s.address || 'Erbil, Iraq'}</p>
                            </div>
                          </div>
                        </td>

                        <td className="py-4 px-4">
                          <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-xl text-[10px] font-bold ${catInfo.color}`}>
                            <span>{catInfo.icon}</span>
                            <span>{catInfo.labelKu}</span>
                          </span>
                        </td>

                        <td className="py-4 px-4">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold text-gray-800 flex items-center gap-1">
                              <Phone className="w-3 h-3 text-gray-400" />
                              <span>{s.phone || '0750XXXXXXX'}</span>
                            </p>
                            <p className="text-[10px] text-gray-500 font-mono flex items-center gap-1">
                              <Mail className="w-3 h-3 text-gray-400" />
                              <span>{s.subscriberEmail || s.ownerId}</span>
                            </p>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          {s.subscriptionStatus === 'trial' ? (
                            <span className="bg-emerald-50 text-emerald-700 border border-emerald-200 px-2.5 py-1 rounded-full text-[10px] font-black">
                              تاقیکردنەوەی ۳ مانگ (Free Trial)
                            </span>
                          ) : s.subscriptionStatus === 'active' ? (
                            <span className="bg-purple-50 text-purple-700 border border-purple-200 px-2.5 py-1 rounded-full text-[10px] font-black">
                              نوێکراوەی چالاک (Active)
                            </span>
                          ) : (
                            <span className="bg-rose-50 text-rose-700 border border-rose-200 px-2.5 py-1 rounded-full text-[10px] font-black">
                              ڕاگیراو / بەسەرچوو
                            </span>
                          )}
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="space-y-0.5">
                            <p className="text-xs font-bold font-mono text-gray-900">
                              {expiryDate ? new Date(expiryDate).toLocaleDateString() : 'N/A'}
                            </p>
                            <p className="text-[10px] font-bold text-blue-600">
                              ماوە: {daysRemaining} ڕۆژ
                            </p>
                          </div>
                        </td>

                        <td className="py-4 px-4 text-center">
                          <div className="flex items-center justify-center gap-2">
                            <button
                              onClick={() => setSelectedStore(s)}
                              className="bg-indigo-600 hover:bg-indigo-700 text-white px-3 py-1.5 rounded-xl font-bold text-[11px] shadow-xs flex items-center gap-1 transition-all"
                              title="نوێکردنەوە یان درێژکردنەوەی ئابوونە"
                            >
                              <PlusCircle className="w-3.5 h-3.5" />
                              <span>نوێکردنەوە</span>
                            </button>

                            <button
                              onClick={() => handleToggleStoreStatus(s)}
                              className={`px-3 py-1.5 rounded-xl font-bold text-[11px] transition-all ${
                                s.subscriptionStatus === 'suspended'
                                  ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200'
                                  : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
                              }`}
                            >
                              {s.subscriptionStatus === 'suspended' ? 'چالاککردن' : 'ڕاگرتن'}
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>

        {/* Subscription Renewal Modal for Super Admin */}
        <AnimatePresence>
          {selectedStore && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-white rounded-3xl shadow-2xl p-6 sm:p-8 w-full max-w-lg space-y-6 text-right"
                dir="rtl"
              >
                <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                  <div className="flex items-center gap-2.5">
                    <div className="p-2.5 bg-indigo-50 text-indigo-600 rounded-2xl font-bold">
                      <Sparkles className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="font-black text-lg text-gray-900">نوێکردنەوەی ئابوونەی فرۆشگا</h3>
                      <p className="text-xs text-gray-500 font-medium">{selectedStore.name}</p>
                    </div>
                  </div>
                  <button onClick={() => setSelectedStore(null)} className="text-gray-400 hover:text-gray-600 text-sm font-bold">✕</button>
                </div>

                <div className="space-y-4">
                  <label className="text-xs font-black text-gray-800 block">ماوەی نوێکردنەوە هەڵبژێرە:</label>
                  
                  <div className="grid grid-cols-3 gap-3">
                    {[
                      { months: 3, label: '۳ مانگ', price: '25,000 د.ع', desc: 'نوێکردنەوەی سێ مانگە' },
                      { months: 6, label: '٦ مانگ', price: '45,000 د.ع', desc: 'نوێکردنەوەی شەش مانگە' },
                      { months: 12, label: '۱ ساڵ', price: '60,000 د.ع', desc: 'نوێکردنەوەی ساڵانە' }
                    ].map((plan) => (
                      <button
                        key={plan.months}
                        type="button"
                        onClick={() => setExtensionMonths(plan.months)}
                        className={`p-3.5 rounded-2xl border text-center transition-all ${
                          extensionMonths === plan.months
                            ? 'bg-indigo-600 text-white border-indigo-600 shadow-lg shadow-indigo-500/30'
                            : 'bg-gray-50 border-gray-200 text-gray-800 hover:bg-gray-100'
                        }`}
                      >
                        <p className="text-sm font-black">{plan.label}</p>
                        <p className={`text-xs font-bold mt-1 ${extensionMonths === plan.months ? 'text-indigo-100' : 'text-indigo-600'}`}>{plan.price}</p>
                      </button>
                    ))}
                  </div>

                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-200 space-y-2 text-xs">
                    <p className="font-bold text-gray-800">پوختەی نوێکردنەوە:</p>
                    <div className="flex justify-between text-gray-600">
                      <span>ناوی دوکان:</span>
                      <span className="font-bold text-gray-900">{selectedStore.name}</span>
                    </div>
                    <div className="flex justify-between text-gray-600">
                      <span>بڕی پارە:</span>
                      <span className="font-black text-emerald-600">
                        {extensionMonths === 3 ? '25,000 IQD' : extensionMonths === 6 ? '45,000 IQD' : '60,000 IQD'}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    onClick={() => setSelectedStore(null)}
                    className="px-5 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700"
                  >
                    پاشگەزبوونەوە
                  </button>
                  <button
                    onClick={() => handleExtendSubscription(extensionMonths)}
                    disabled={isUpdating}
                    className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-xs font-black shadow-md shadow-indigo-500/20"
                  >
                    {isUpdating ? 'تەواوکردن...' : 'پەسەندکردنی نوێکردنەوە'}
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </div>
    </DashboardLayout>
  );
}
