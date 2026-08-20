import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useStore } from '../contexts/StoreContext';
import { useTranslation } from 'react-i18next';
import { 
  Users, 
  Search, 
  UserPlus, 
  MessageSquare, 
  Award, 
  DollarSign, 
  Phone, 
  MapPin, 
  ChevronRight,
  Sparkles,
  Send,
  History,
  TrendingUp,
  X,
  Edit2,
  Trash2,
  Receipt,
  CreditCard,
  CheckCircle2,
  Download,
  FileSpreadsheet
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { Customer, LoyaltyTier } from '../types';
import { determineCustomerTier, adjustCustomerPointsManual } from '../lib/loyaltyService';
import { sendSMS, renderTemplate, DEFAULT_SMS_TEMPLATES } from '../lib/smsService';
import Pagination from '../components/common/Pagination';
import { exportCustomersToCSV } from '../lib/dataMigration';
import CustomerCsvImportModal from '../components/migration/CustomerCsvImportModal';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function CustomersPage() {
  const { t, i18n } = useTranslation();
  const { store } = useStore();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [tierFilter, setTierFilter] = useState<string>('all');
  const [debtFilter, setDebtFilter] = useState<'all' | 'has_debt' | 'no_debt'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals & Drawers
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [selectedCustomerProfile, setSelectedCustomerProfile] = useState<Customer | null>(null);
  const [editingCustomer, setEditingCustomer] = useState<Customer | null>(null);
  const [isSMSModalOpen, setIsSMSModalOpen] = useState(false);
  const [isPointsModalOpen, setIsPointsModalOpen] = useState(false);
  const [isDebtModalOpen, setIsDebtModalOpen] = useState(false);
  const [targetCustomer, setTargetCustomer] = useState<Customer | null>(null);

  // SMS Form
  const [smsText, setSmsText] = useState('');
  const [sendingSMS, setSendingSMS] = useState(false);

  // Points adjustment form
  const [pointsDelta, setPointsDelta] = useState<number>(50);
  const [pointsReason, setPointsReason] = useState('Manual staff adjustment');

  // Debt payment form
  const [debtPaymentAmount, setDebtPaymentAmount] = useState<number>(0);

  // Form State
  const [newCustomer, setNewCustomer] = useState({
    name: '',
    phone: '',
    address: '',
    debt: 0,
    loyaltyPoints: 0
  });

  useEffect(() => {
    if (!store?.id) return;
    setLoading(true);

    const q = query(collection(db, `stores/${store.id}/customers`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Customer));
      if (docs.length === 0) {
        // Seed default sample customers for demo
        const seeded: Customer[] = [
          { id: 'c1', name: 'Soran Ali', phone: '+9647501112233', address: 'Erbil - Dream City', debt: 0, loyaltyPoints: 850, tier: 'gold' },
          { id: 'c2', name: 'Rebin Qadir', phone: '+9647509998877', address: 'Sulaymaniyah - Salim St.', debt: 150, loyaltyPoints: 240, tier: 'silver' },
          { id: 'c3', name: 'Lina Botan', phone: '+9647504445566', address: 'Duhok - KRO', debt: 0, loyaltyPoints: 1450, tier: 'platinum' },
          { id: 'c4', name: 'Zanyar Rostam', phone: '+9647502221144', address: 'Erbil - Ankawa', debt: 320, loyaltyPoints: 95, tier: 'bronze' },
          { id: 'c5', name: 'Hawkar Nouri', phone: '+9647503334455', address: 'Kirkuk - Shoraw', debt: 0, loyaltyPoints: 400, tier: 'silver' },
          { id: 'c6', name: 'Dana Salih', phone: '+9647507776655', address: 'Erbil - 100M St.', debt: 75, loyaltyPoints: 120, tier: 'bronze' },
          { id: 'c7', name: 'Tara Hama', phone: '+9647508881122', address: 'Sulaymaniyah - Bakrajo', debt: 0, loyaltyPoints: 620, tier: 'silver' },
          { id: 'c8', name: 'Bnar Karim', phone: '+9647506669988', address: 'Erbil - Italian City', debt: 0, loyaltyPoints: 1890, tier: 'platinum' }
        ];
        setCustomers(seeded);
      } else {
        setCustomers(docs);
      }
      setLoading(false);
    });
    return () => unsubscribe();
  }, [store?.id]);

  // Handle Add / Edit Customer
  const handleSaveCustomer = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id || !newCustomer.name || !newCustomer.phone) return;

    const payload = {
      ...newCustomer,
      tier: determineCustomerTier(newCustomer.loyaltyPoints || 0, store.loyaltyConfig),
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingCustomer?.id && !editingCustomer.id.startsWith('c')) {
        await updateDoc(doc(db, `stores/${store.id}/customers`, editingCustomer.id), payload);
      } else if (editingCustomer?.id) {
        setCustomers(prev => prev.map(c => c.id === editingCustomer.id ? { ...c, ...payload } : c));
      } else {
        await addDoc(collection(db, `stores/${store.id}/customers`), {
          ...payload,
          createdAt: new Date().toISOString()
        });
      }

      setIsAddModalOpen(false);
      setEditingCustomer(null);
      setNewCustomer({ name: '', phone: '', address: '', debt: 0, loyaltyPoints: 0 });
    } catch (err) {
      console.error(err);
    }
  };

  const handleSendDirectSMS = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id || !targetCustomer || !smsText) return;
    setSendingSMS(true);
    try {
      await sendSMS(
        store.id,
        targetCustomer.phone,
        smsText,
        'custom',
        targetCustomer.name,
        store.smsConfig
      );
      alert(`SMS successfully dispatched to ${targetCustomer.name}!`);
      setIsSMSModalOpen(false);
      setSmsText('');
      setTargetCustomer(null);
    } catch (err) {
      console.error(err);
      alert('Failed to send SMS');
    } finally {
      setSendingSMS(false);
    }
  };

  const handleConfirmPointsAdjust = async () => {
    if (!store?.id || !targetCustomer) return;
    try {
      await adjustCustomerPointsManual(
        store.id,
        targetCustomer.id,
        targetCustomer.name,
        pointsDelta,
        pointsReason,
        store.loyaltyConfig
      );
      alert('Customer points updated!');
      setIsPointsModalOpen(false);
      setTargetCustomer(null);
    } catch (err) {
      console.error(err);
    }
  };

  const handlePayDebt = async () => {
    if (!store?.id || !targetCustomer || debtPaymentAmount <= 0) return;
    try {
      const newDebt = Math.max(0, (targetCustomer.debt || 0) - debtPaymentAmount);
      if (!targetCustomer.id.startsWith('c')) {
        await updateDoc(doc(db, `stores/${store.id}/customers`, targetCustomer.id), {
          debt: newDebt
        });
      } else {
        setCustomers(prev => prev.map(c => c.id === targetCustomer.id ? { ...c, debt: newDebt } : c));
      }
      setIsDebtModalOpen(false);
      setTargetCustomer(null);
      setDebtPaymentAmount(0);
      alert('Debt payment recorded successfully!');
    } catch (err) {
      console.error(err);
    }
  };

  // Filtered List
  const filtered = useMemo(() => {
    return customers.filter(c => {
      const matchSearch = c.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
        c.phone.includes(searchTerm) || 
        (c.address && c.address.toLowerCase().includes(searchTerm.toLowerCase()));

      const tier = c.tier || determineCustomerTier(c.loyaltyPoints || 0, store?.loyaltyConfig);
      const matchTier = tierFilter === 'all' || tier === tierFilter;

      let matchDebt = true;
      if (debtFilter === 'has_debt') matchDebt = (c.debt || 0) > 0;
      else if (debtFilter === 'no_debt') matchDebt = (c.debt || 0) === 0;

      return matchSearch && matchTier && matchDebt;
    });
  }, [customers, searchTerm, tierFilter, debtFilter, store?.loyaltyConfig]);

  // Pagination Slice
  const totalPages = Math.ceil(filtered.length / pageSize) || 1;
  const paginatedCustomers = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filtered.slice(start, start + pageSize);
  }, [filtered, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, tierFilter, debtFilter, pageSize]);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('customers')}</h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-black">
                {customers.length} {isRTL ? 'کڕیار' : 'Customers'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Customer database, loyalty tier levels, points balance, and direct SMS communication.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => exportCustomersToCSV(customers, `${store?.name || 'store'}_customers_${new Date().toISOString().split('T')[0]}.csv`)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold transition-all shadow-xs text-xs cursor-pointer"
              title="Export Customer Directory to CSV / Excel"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <button 
              onClick={() => setIsImportModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold transition-all shadow-xs text-xs cursor-pointer"
              title="Import Customer Directory from CSV File"
            >
              <FileSpreadsheet className="w-4 h-4 text-indigo-600" />
              <span>Import CSV</span>
            </button>

            <button 
              onClick={() => {
                setEditingCustomer(null);
                setNewCustomer({ name: '', phone: '', address: '', debt: 0, loyaltyPoints: 0 });
                setIsAddModalOpen(true);
              }}
              className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <UserPlus className="w-4 h-4" />
              <span>Add Customer</span>
            </button>
          </div>
        </div>

        {/* Filter & Search Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              placeholder="Search customers by name, phone, or address..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white text-xs font-semibold"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button onClick={() => setSearchTerm('')} className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400">
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 w-full md:w-auto flex-wrap sm:flex-nowrap">
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Tier:</span>
              <select
                value={tierFilter}
                onChange={(e) => setTierFilter(e.target.value)}
                className="bg-transparent font-bold text-gray-700 outline-none uppercase cursor-pointer"
              >
                <option value="all">All Tiers</option>
                <option value="bronze">Bronze</option>
                <option value="silver">Silver</option>
                <option value="gold">Gold</option>
                <option value="platinum">Platinum</option>
              </select>
            </div>

            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="text-[10px] font-bold text-gray-400 uppercase">Debt:</span>
              <select
                value={debtFilter}
                onChange={(e) => setDebtFilter(e.target.value as any)}
                className="bg-transparent font-bold text-gray-700 outline-none cursor-pointer"
              >
                <option value="all">All Balances</option>
                <option value="has_debt">Has Debt (&gt;0)</option>
                <option value="no_debt">Clear ($0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Customer Directory Table */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-gray-900 text-sm">Customer Directory</h3>
            <span className="text-xs text-gray-500 font-medium">Click any customer to inspect profile & invoices</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Contact</th>
                  <th className="px-6 py-3.5">Loyalty Tier & Balance</th>
                  <th className="px-6 py-3.5">Current Debt</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((customer) => {
                    const points = customer.loyaltyPoints || 0;
                    const tier: LoyaltyTier = customer.tier || determineCustomerTier(points, store?.loyaltyConfig);

                    return (
                      <tr 
                        key={customer.id} 
                        onClick={() => setSelectedCustomerProfile(customer)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center text-blue-600 font-black text-xs uppercase group-hover:bg-blue-600 group-hover:text-white transition-colors">
                              {customer.name.charAt(0)}
                            </div>
                            <div>
                              <span className="font-bold text-gray-900 text-sm block group-hover:text-blue-600 transition-colors">
                                {customer.name}
                              </span>
                              {customer.address && (
                                <span className="text-[10px] text-gray-400 flex items-center gap-1">
                                  <MapPin className="w-3 h-3" /> {customer.address}
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2 text-xs font-bold text-gray-600 font-mono">
                            <Phone className="w-3.5 h-3.5 text-gray-400" /> {customer.phone}
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider border",
                              tier === 'platinum' ? "bg-purple-50 text-purple-700 border-purple-200" :
                              tier === 'gold' ? "bg-amber-50 text-amber-700 border-amber-200" :
                              tier === 'silver' ? "bg-slate-100 text-slate-700 border-slate-200" :
                              "bg-orange-50 text-orange-700 border-orange-200"
                            )}>
                              ★ {tier}
                            </span>
                            <span className="font-black text-gray-900 text-xs">{points.toLocaleString()} pts</span>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className={cn(
                            "px-2.5 py-1 rounded-lg text-xs font-black uppercase tracking-widest border",
                            customer.debt > 0 ? "bg-red-50 text-red-600 border-red-100" : "bg-green-50 text-green-600 border-green-100"
                          )}>
                            ${customer.debt || 0}
                          </span>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1.5" onClick={(e) => e.stopPropagation()}>
                            {customer.debt > 0 && (
                              <button
                                onClick={() => {
                                  setTargetCustomer(customer);
                                  setDebtPaymentAmount(customer.debt);
                                  setIsDebtModalOpen(true);
                                }}
                                className="px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-red-700 border border-red-200 rounded-xl text-xs font-bold transition-all"
                                title="Settle Debt"
                              >
                                Settle
                              </button>
                            )}

                            <button
                              onClick={() => {
                                setTargetCustomer(customer);
                                setSmsText(`Hello ${customer.name}, thank you for choosing ${store?.name || 'MobiStore'}!`);
                                setIsSMSModalOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Send SMS"
                            >
                              <MessageSquare className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setTargetCustomer(customer);
                                setPointsDelta(50);
                                setIsPointsModalOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                              title="Adjust Loyalty Points"
                            >
                              <Award className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => {
                                setEditingCustomer(customer);
                                setNewCustomer({
                                  name: customer.name,
                                  phone: customer.phone,
                                  address: customer.address || '',
                                  debt: customer.debt || 0,
                                  loyaltyPoints: customer.loyaltyPoints || 0
                                });
                                setIsAddModalOpen(true);
                              }}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              title="Edit Customer"
                            >
                              <Edit2 className="w-4 h-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={5} className="px-6 py-16 text-center text-gray-400 font-medium">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <Users className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-800">
                        {loading ? 'Loading customer accounts...' : 'No customers matched your filter.'}
                      </p>
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Interactive Pagination ("لاپەڕەی دواتر" / "Next Page") */}
          <Pagination
            currentPage={currentPage}
            totalPages={totalPages}
            totalItems={filtered.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => setPageSize(s)}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      </div>

      {/* ----------------- Customer Profile & Purchase Modal ----------------- */}
      <AnimatePresence>
        {selectedCustomerProfile && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-6 bg-gradient-to-r from-blue-900 to-indigo-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center text-xl font-black">
                    {selectedCustomerProfile.name.charAt(0)}
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-tight">{selectedCustomerProfile.name}</h3>
                    <p className="text-xs text-blue-200 mt-0.5">{selectedCustomerProfile.phone} • {selectedCustomerProfile.address || 'Erbil'}</p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedCustomerProfile(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-purple-600">Loyalty Balance</p>
                    <p className="text-2xl font-black text-purple-700 mt-1">{(selectedCustomerProfile.loyaltyPoints || 0).toLocaleString()} pts</p>
                    <span className="inline-block mt-1 px-2 py-0.5 bg-purple-200/60 text-purple-800 rounded-md font-bold text-[10px] uppercase">
                      Tier: {selectedCustomerProfile.tier || 'Silver'}
                    </span>
                  </div>

                  <div className="bg-red-50 p-4 rounded-2xl border border-red-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-red-600">Current Debt</p>
                    <p className="text-2xl font-black text-red-700 mt-1">${selectedCustomerProfile.debt || 0}</p>
                    <span className="inline-block mt-1 text-gray-500 font-medium text-[10px]">
                      {selectedCustomerProfile.debt > 0 ? 'Pending repayment' : 'Account fully paid'}
                    </span>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2">
                  <h4 className="font-black text-gray-900 text-xs mb-2">Quick Communications</h4>
                  <div className="flex gap-2">
                    <button
                      onClick={() => {
                        setTargetCustomer(selectedCustomerProfile);
                        setSmsText(`Hello ${selectedCustomerProfile.name}, you have ${(selectedCustomerProfile.loyaltyPoints || 0)} loyalty points ready to redeem!`);
                        setIsSMSModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                    >
                      <MessageSquare className="w-4 h-4" />
                      <span>Send Promo SMS</span>
                    </button>

                    <button
                      onClick={() => {
                        setTargetCustomer(selectedCustomerProfile);
                        setPointsDelta(100);
                        setIsPointsModalOpen(true);
                      }}
                      className="flex-1 flex items-center justify-center gap-2 py-2.5 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs cursor-pointer"
                    >
                      <Award className="w-4 h-4" />
                      <span>Reward Points</span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-end">
                <button
                  onClick={() => setSelectedCustomerProfile(null)}
                  className="px-6 py-2.5 bg-slate-900 text-white rounded-xl text-xs font-bold cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- Settle Debt Modal ----------------- */}
      <AnimatePresence>
        {isDebtModalOpen && targetCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm"
            >
              <div className="w-12 h-12 bg-red-100 text-red-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <DollarSign className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900 text-center mb-1">Settle Customer Debt</h3>
              <p className="text-xs text-gray-500 text-center mb-4">
                Customer: <strong className="text-gray-800">{targetCustomer.name}</strong> (Outstanding: ${targetCustomer.debt})
              </p>

              <div className="space-y-3 mb-6">
                <label className="text-xs font-bold text-gray-700">Payment Amount Received ($)</label>
                <input
                  type="number"
                  max={targetCustomer.debt}
                  value={debtPaymentAmount || ''}
                  onChange={(e) => setDebtPaymentAmount(Number(e.target.value))}
                  className="w-full px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500/20 focus:border-red-500 text-base font-black text-red-600 outline-none"
                />
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setIsDebtModalOpen(false)}
                  className="flex-1 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handlePayDebt}
                  className="flex-1 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-md shadow-emerald-500/20 cursor-pointer"
                >
                  Confirm Payment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- Send SMS Modal ----------------- */}
      <AnimatePresence>
        {isSMSModalOpen && targetCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-black text-gray-900">Send Direct SMS to {targetCustomer.name}</h3>
                <button onClick={() => setIsSMSModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSendDirectSMS} className="space-y-4 text-xs">
                <div>
                  <label className="font-bold text-gray-700">Recipient Phone</label>
                  <input
                    disabled
                    value={targetCustomer.phone}
                    className="w-full mt-1 px-3 py-2 bg-gray-100 border border-gray-200 rounded-xl font-mono text-gray-600"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">SMS Message Body</label>
                  <textarea
                    rows={4}
                    value={smsText}
                    onChange={(e) => setSmsText(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none custom-scrollbar"
                  />
                </div>

                <div className="flex justify-end gap-2 pt-2">
                  <button
                    type="button"
                    onClick={() => setIsSMSModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={sendingSMS}
                    className="px-5 py-2 bg-emerald-600 text-white rounded-xl font-bold hover:bg-emerald-700 flex items-center gap-2"
                  >
                    <Send className="w-4 h-4" />
                    <span>{sendingSMS ? 'Dispatching...' : 'Send SMS'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- Adjust Loyalty Points Modal ----------------- */}
      <AnimatePresence>
        {isPointsModalOpen && targetCustomer && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm"
            >
              <h3 className="text-base font-black text-gray-900 mb-1">Adjust Loyalty Points</h3>
              <p className="text-xs text-gray-500 mb-4">Customer: {targetCustomer.name} (Current: {targetCustomer.loyaltyPoints || 0} pts)</p>

              <div className="space-y-3 mb-6 text-xs">
                <div>
                  <label className="font-bold text-gray-700">Points to Add (+) / Deduct (-)</label>
                  <input
                    type="number"
                    value={pointsDelta}
                    onChange={(e) => setPointsDelta(Number(e.target.value))}
                    className="w-full mt-1 px-3.5 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-purple-500/20 font-black text-purple-600"
                  />
                </div>
                <div>
                  <label className="font-bold text-gray-700">Adjustment Reason</label>
                  <input
                    type="text"
                    value={pointsReason}
                    onChange={(e) => setPointsReason(e.target.value)}
                    className="w-full mt-1 px-3.5 py-2 border border-gray-200 rounded-xl"
                  />
                </div>
              </div>

              <div className="flex gap-2">
                <button onClick={() => setIsPointsModalOpen(false)} className="flex-1 py-2 bg-gray-100 rounded-xl font-bold text-xs text-gray-700">
                  Cancel
                </button>
                <button onClick={handleConfirmPointsAdjust} className="flex-1 py-2 bg-purple-600 hover:bg-purple-700 text-white rounded-xl font-bold text-xs">
                  Apply Adjustment
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- Add / Edit Customer Modal ----------------- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-md"
            >
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-base font-black text-gray-900">
                  {editingCustomer ? 'Edit Customer' : 'Add New Customer'}
                </h3>
                <button onClick={() => setIsAddModalOpen(false)} className="text-gray-400 hover:text-gray-600">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCustomer} className="space-y-3.5 text-xs">
                <div>
                  <label className="font-bold text-gray-700">Customer Full Name *</label>
                  <input
                    required
                    type="text"
                    value={newCustomer.name}
                    onChange={(e) => setNewCustomer({ ...newCustomer, name: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">Phone Number *</label>
                  <input
                    required
                    type="text"
                    placeholder="+964750XXXXXXX"
                    value={newCustomer.phone}
                    onChange={(e) => setNewCustomer({ ...newCustomer, phone: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none font-mono"
                  />
                </div>

                <div>
                  <label className="font-bold text-gray-700">City / Address</label>
                  <input
                    type="text"
                    placeholder="e.g. Erbil - Ankawa"
                    value={newCustomer.address}
                    onChange={(e) => setNewCustomer({ ...newCustomer, address: e.target.value })}
                    className="w-full mt-1 px-3.5 py-2 border border-gray-200 rounded-xl"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="font-bold text-gray-700">Initial Debt ($)</label>
                    <input
                      type="number"
                      value={newCustomer.debt || ''}
                      onChange={(e) => setNewCustomer({ ...newCustomer, debt: Number(e.target.value) })}
                      className="w-full mt-1 px-3.5 py-2 border border-gray-200 rounded-xl text-red-600 font-bold"
                    />
                  </div>

                  <div>
                    <label className="font-bold text-gray-700">Initial Points</label>
                    <input
                      type="number"
                      value={newCustomer.loyaltyPoints || ''}
                      onChange={(e) => setNewCustomer({ ...newCustomer, loyaltyPoints: Number(e.target.value) })}
                      className="w-full mt-1 px-3.5 py-2 border border-gray-200 rounded-xl text-purple-600 font-bold"
                    />
                  </div>
                </div>

                <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2 border border-gray-200 rounded-xl font-bold text-gray-600"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-5 py-2 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700"
                  >
                    {editingCustomer ? 'Update Customer' : 'Create Customer'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* Customer CSV Import Modal */}
      <CustomerCsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        storeId={store?.id || ''}
        onSuccess={() => {
          setIsImportModalOpen(false);
        }}
      />
    </DashboardLayout>
  );
}
