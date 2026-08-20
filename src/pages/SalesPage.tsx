import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useStore } from '../contexts/StoreContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { useBackup } from '../contexts/BackupContext';
import PermissionGate from '../components/auth/PermissionGate';
import Pagination from '../components/common/Pagination';
import { useTranslation } from 'react-i18next';
import { 
  Receipt, 
  Calendar, 
  CreditCard, 
  ChevronRight, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  User, 
  Phone, 
  Clock, 
  ShoppingBag, 
  X, 
  Check, 
  DollarSign, 
  Sparkles,
  Layers,
  ArrowRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

interface SaleItem {
  id?: string;
  name: string;
  quantity: number;
  price: number;
  purchasePrice?: number;
  barcode?: string;
  imei?: string;
  subtotal?: number;
}

interface SaleTransaction {
  id: string;
  invoiceNumber?: string;
  customerName?: string;
  customerId?: string;
  customerPhone?: string;
  cashierName?: string;
  employeeName?: string;
  branchName?: string;
  total: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  cost?: number;
  profit?: number;
  paymentMethod: string;
  status?: string;
  items?: SaleItem[];
  notes?: string;
  loyaltyPointsEarned?: number;
  loyaltyPointsRedeemed?: number;
  smsSent?: boolean;
  createdAt: string;
}

export default function SalesPage() {
  const { t, i18n } = useTranslation();
  const { store } = useStore();
  const { hasPermission } = usePermissions();
  const { exportCollection, isExporting } = useBackup();
  const navigate = useNavigate();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [paymentFilter, setPaymentFilter] = useState('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'week' | 'month'>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Detail Modal
  const [selectedSale, setSelectedSale] = useState<SaleTransaction | null>(null);

  useEffect(() => {
    if (!store?.id) return;
    setLoading(true);

    const q = query(collection(db, `stores/${store.id}/sales`), orderBy('createdAt', 'desc'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as SaleTransaction));
      if (data.length > 0) {
        setSales(data);
      } else {
        // Seed default sample sales
        const sampleSales: SaleTransaction[] = [
          {
            id: 's-1001',
            invoiceNumber: 'INV-2026-1001',
            customerName: 'Soran Ali',
            customerId: 'c1',
            customerPhone: '+9647501112233',
            cashierName: 'Ahmad Cashier',
            employeeName: 'Ahmad Cashier',
            branchName: 'Main Store - Erbil',
            total: 1244,
            subtotal: 1244,
            discount: 0,
            cost: 1008,
            profit: 236,
            paymentMethod: 'cash',
            status: 'completed',
            items: [
              { name: 'iPhone 15 Pro Max 256GB Titanium', quantity: 1, price: 1199, subtotal: 1199, barcode: '195949012345', imei: '352981098765432' },
              { name: 'Anker 65W GaN Fast Charger', quantity: 1, price: 45, subtotal: 45, barcode: '848061054321' }
            ],
            loyaltyPointsEarned: 248,
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
          },
          {
            id: 's-1002',
            invoiceNumber: 'INV-2026-1002',
            customerName: 'Rebin Qadir',
            customerId: 'c2',
            customerPhone: '+9647509998877',
            cashierName: 'Haval Pos',
            employeeName: 'Haval Pos',
            branchName: 'Main Store - Erbil',
            total: 249,
            subtotal: 249,
            discount: 0,
            cost: 190,
            profit: 59,
            paymentMethod: 'card',
            status: 'completed',
            items: [
              { name: 'AirPods Pro 2nd Gen (USB-C)', quantity: 1, price: 249, subtotal: 249, barcode: '195949567890' }
            ],
            loyaltyPointsEarned: 49,
            createdAt: new Date(Date.now() - 3600000 * 5).toISOString()
          },
          {
            id: 's-1003',
            invoiceNumber: 'INV-2026-1003',
            customerName: 'Lina Botan',
            customerId: 'c3',
            customerPhone: '+9647504445566',
            cashierName: 'Ahmad Cashier',
            employeeName: 'Ahmad Cashier',
            branchName: 'Main Store - Erbil',
            total: 1249,
            subtotal: 1249,
            discount: 0,
            cost: 1020,
            profit: 229,
            paymentMethod: 'korepay',
            status: 'completed',
            items: [
              { name: 'Samsung Galaxy S24 Ultra 512GB', quantity: 1, price: 1249, subtotal: 1249, barcode: '880609512345', imei: '358741098123456' }
            ],
            loyaltyPointsEarned: 249,
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
          },
          {
            id: 's-1004',
            invoiceNumber: 'INV-2026-1004',
            customerName: 'Zanyar Rostam',
            customerId: 'c4',
            customerPhone: '+9647502221144',
            cashierName: 'Haval Pos',
            employeeName: 'Haval Pos',
            branchName: 'Main Store - Erbil',
            total: 599,
            subtotal: 649,
            discount: 50,
            cost: 490,
            profit: 109,
            paymentMethod: 'debt',
            status: 'completed',
            items: [
              { name: 'iPad Air M2 11-inch 128GB Wi-Fi', quantity: 1, price: 599, subtotal: 599, barcode: '195949887766' }
            ],
            loyaltyPointsEarned: 119,
            createdAt: new Date(Date.now() - 3600000 * 48).toISOString()
          },
          {
            id: 's-1005',
            invoiceNumber: 'INV-2026-1005',
            customerName: 'Walk-in Customer',
            cashierName: 'Ahmad Cashier',
            employeeName: 'Ahmad Cashier',
            branchName: 'Main Store - Erbil',
            total: 140,
            subtotal: 140,
            discount: 0,
            cost: 95,
            profit: 45,
            paymentMethod: 'cash',
            status: 'completed',
            items: [
              { name: 'Original iPhone 15 OLED Screen Replacement', quantity: 1, price: 140, subtotal: 140, barcode: '772819283746' }
            ],
            createdAt: new Date(Date.now() - 3600000 * 72).toISOString()
          }
        ];
        setSales(sampleSales);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [store?.id]);

  // Filtered Sales
  const filteredSales = useMemo(() => {
    return sales.filter(s => {
      // Search
      const term = searchTerm.toLowerCase().trim();
      const invoiceNo = (s.invoiceNumber || s.id.slice(0, 8)).toLowerCase();
      const custName = (s.customerName || '').toLowerCase();
      const custPhone = (s.customerPhone || '').toLowerCase();
      const cashier = (s.cashierName || s.employeeName || '').toLowerCase();
      const itemsMatch = s.items?.some(i => i.name.toLowerCase().includes(term) || (i.imei && i.imei.includes(term)));

      const matchSearch = !term || invoiceNo.includes(term) || custName.includes(term) || custPhone.includes(term) || cashier.includes(term) || itemsMatch;

      // Payment method
      const matchPayment = paymentFilter === 'all' || s.paymentMethod?.toLowerCase() === paymentFilter.toLowerCase();

      // Date
      let matchDate = true;
      if (dateFilter !== 'all' && s.createdAt) {
        const saleTime = new Date(s.createdAt).getTime();
        const now = Date.now();
        if (dateFilter === 'today') matchDate = (now - saleTime) <= 86400000;
        else if (dateFilter === 'week') matchDate = (now - saleTime) <= 86400000 * 7;
        else if (dateFilter === 'month') matchDate = (now - saleTime) <= 86400000 * 30;
      }

      return matchSearch && matchPayment && matchDate;
    });
  }, [sales, searchTerm, paymentFilter, dateFilter]);

  // Pagination Slice
  const totalPages = Math.ceil(filteredSales.length / pageSize) || 1;
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredSales.slice(start, start + pageSize);
  }, [filteredSales, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, paymentFilter, dateFilter, pageSize]);

  // Total Sales & Profit Aggregates
  const totalRevenue = filteredSales.reduce((acc, s) => acc + (s.total || 0), 0);
  const totalProfit = filteredSales.reduce((acc, s) => acc + (s.profit || 0), 0);

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('sales')}</h1>
              <span className="px-2.5 py-0.5 bg-purple-100 text-purple-800 rounded-full text-xs font-black">
                {sales.length} {isRTL ? 'وەسڵ' : 'Invoices'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Complete history of branch checkout transactions, receipts, and revenue streams.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => navigate('/pos')}
              className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
            >
              <ShoppingBag className="w-4 h-4" />
              <span>{t('pos')}</span>
            </button>

            <PermissionGate permission="reports:export">
              <button 
                onClick={() => exportCollection('sales', 'csv')}
                disabled={isExporting}
                className="flex items-center gap-1.5 px-3.5 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-50 rounded-xl text-xs font-bold shadow-2xs transition-all cursor-pointer disabled:opacity-50"
              >
                <Download className="w-3.5 h-3.5 text-blue-600" />
                <span>{isExporting ? 'Exporting...' : 'Export Sales'}</span>
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Stats Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Filtered Sales</p>
            <p className="text-xl font-black text-gray-900 mt-1">${totalRevenue.toLocaleString()}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Total Net Profit</p>
            <p className="text-xl font-black text-emerald-600 mt-1">
              {hasPermission('reports:view_financial') ? `$${totalProfit.toLocaleString()}` : '••••••'}
            </p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Transactions Count</p>
            <p className="text-xl font-black text-purple-600 mt-1">{filteredSales.length}</p>
          </div>

          <div className="bg-white p-4 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Average Ticket</p>
            <p className="text-xl font-black text-blue-600 mt-1">
              ${filteredSales.length ? Math.round(totalRevenue / filteredSales.length) : 0}
            </p>
          </div>
        </div>

        {/* Search & Filter Controls */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by invoice #, customer name, phone, item name, or cashier..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 focus:bg-white outline-none text-xs font-semibold"
            />
            {searchTerm && (
              <button 
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <div className="w-full md:w-auto flex items-center gap-2 flex-wrap sm:flex-nowrap">
            {/* Payment Method Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="font-bold text-gray-400 text-[10px] uppercase">Payment:</span>
              <select
                value={paymentFilter}
                onChange={(e) => setPaymentFilter(e.target.value)}
                className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer uppercase"
              >
                <option value="all">All Methods</option>
                <option value="cash">Cash</option>
                <option value="card">Card (Visa/Master)</option>
                <option value="debt">Debt (Receivable)</option>
                <option value="korepay">KorekPay / FastPay</option>
                <option value="fib">First Iraqi Bank (FIB)</option>
              </select>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="font-bold text-gray-400 text-[10px] uppercase">Period:</span>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value as any)}
                className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer"
              >
                <option value="all">All Time</option>
                <option value="today">Today</option>
                <option value="week">Past 7 Days</option>
                <option value="month">Past 30 Days</option>
              </select>
            </div>
          </div>
        </div>

        {/* Sales Table Card with Pagination */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <h3 className="font-black text-gray-900 text-sm">Transaction Ledger</h3>
            <span className="text-xs text-gray-500 font-medium">
              Click any invoice row to view receipt details
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3.5">Invoice / Receipt</th>
                  <th className="px-6 py-3.5">Date & Time</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Payment Method</th>
                  <th className="px-6 py-3.5">Total Amount</th>
                  <th className="px-6 py-3.5 text-right">Status / Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {paginatedSales.length > 0 ? (
                  paginatedSales.map((sale) => {
                    const invoiceNum = sale.invoiceNumber || `INV-${sale.id.slice(0, 8).toUpperCase()}`;
                    const dateObj = new Date(sale.createdAt);

                    return (
                      <tr 
                        key={sale.id} 
                        onClick={() => setSelectedSale(sale)}
                        className="hover:bg-blue-50/40 group cursor-pointer transition-colors"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="bg-purple-50 text-purple-600 p-2.5 rounded-xl border border-purple-100 group-hover:bg-blue-600 group-hover:text-white group-hover:border-blue-600 transition-all">
                              <Receipt className="w-4 h-4" />
                            </div>
                            <div>
                              <span className="font-black text-gray-900 text-sm block group-hover:text-blue-600 transition-colors">
                                #{invoiceNum}
                              </span>
                              <span className="text-[10px] text-gray-400 font-medium">
                                {sale.items?.length || 1} items • {sale.cashierName || 'Staff'}
                              </span>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs font-bold text-gray-600">
                          <div className="flex items-center gap-1.5">
                            <Calendar className="w-3.5 h-3.5 text-gray-400" />
                            <span>{dateObj.toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                            <span className="text-[10px] text-gray-400 font-normal ml-1">
                              {dateObj.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 text-xs">
                          <div className="font-bold text-gray-900">{sale.customerName || 'Walk-in Customer'}</div>
                          {sale.customerPhone && (
                            <div className="text-[10px] text-gray-400 flex items-center gap-1 font-mono">
                              <Phone className="w-2.5 h-2.5" /> {sale.customerPhone}
                            </div>
                          )}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-1.5">
                            <span className={cn(
                              "px-2.5 py-0.5 rounded-lg text-[10px] font-black uppercase tracking-wider border",
                              sale.paymentMethod === 'debt' ? "bg-red-50 text-red-700 border-red-200" :
                              sale.paymentMethod === 'card' ? "bg-blue-50 text-blue-700 border-blue-200" :
                              sale.paymentMethod === 'korepay' || sale.paymentMethod === 'fib' ? "bg-emerald-50 text-emerald-700 border-emerald-200" :
                              "bg-slate-100 text-slate-700 border-slate-200"
                            )}>
                              {sale.paymentMethod}
                            </span>
                          </div>
                        </td>

                        <td className="px-6 py-4 font-black text-blue-600 text-sm">
                          ${sale.total?.toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <span className="px-2 py-0.5 bg-green-50 text-green-700 border border-green-200 rounded-md text-[9px] font-black uppercase tracking-wider">
                              Completed
                            </span>
                            <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-500 transition-all group-hover:translate-x-1" />
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-400 font-medium">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <Receipt className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-800">
                        {loading ? 'Fetching sales transactions...' : 'No invoices matched your filters.'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Try resetting the search terms or date filter.</p>
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
            totalItems={filteredSales.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => setPageSize(s)}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      </div>

      {/* ----------------- Full Detailed Invoice / Receipt Modal ----------------- */}
      <AnimatePresence>
        {selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-xl overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Header */}
              <div className="p-6 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-white shadow-inner">
                    <Receipt className="w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-lg leading-tight">
                      Invoice #{selectedSale.invoiceNumber || selectedSale.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      {new Date(selectedSale.createdAt).toLocaleString()}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Receipt Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-700 custom-scrollbar">
                {/* Store & Customer details */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Customer Details</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedSale.customerName || 'Walk-in Customer'}</p>
                    {selectedSale.customerPhone && (
                      <p className="text-gray-500 mt-0.5 flex items-center gap-1 font-mono">
                        <Phone className="w-3 h-3" /> {selectedSale.customerPhone}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Cashier & Branch</p>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedSale.branchName || store?.name || 'Main Branch'}</p>
                    <p className="text-gray-500 mt-0.5">Operator: {selectedSale.cashierName || selectedSale.employeeName || 'Staff'}</p>
                  </div>
                </div>

                {/* Items Purchased Table */}
                <div>
                  <h4 className="font-black text-gray-900 text-xs mb-2">Purchased Inventory Items</h4>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                    <div className="grid grid-cols-12 bg-gray-50 p-3 font-bold text-gray-400 text-[10px] uppercase tracking-wider">
                      <span className="col-span-6">Item / Device</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-2 text-right">Price</span>
                      <span className="col-span-2 text-right">Subtotal</span>
                    </div>
                    {selectedSale.items && selectedSale.items.length > 0 ? (
                      selectedSale.items.map((item, idx) => (
                        <div key={idx} className="grid grid-cols-12 p-3 text-xs items-center hover:bg-gray-50/50">
                          <div className="col-span-6 font-bold text-gray-900">
                            <p className="truncate">{item.name}</p>
                            {item.barcode && <p className="text-[10px] text-gray-400 font-mono">Barcode: {item.barcode}</p>}
                            {item.imei && <p className="text-[10px] text-indigo-600 font-mono">IMEI: {item.imei}</p>}
                          </div>
                          <div className="col-span-2 text-center font-bold text-gray-700">{item.quantity}</div>
                          <div className="col-span-2 text-right font-medium text-gray-600">${item.price}</div>
                          <div className="col-span-2 text-right font-black text-gray-900">${(item.subtotal || item.quantity * item.price)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">Single checkout package transaction</div>
                    )}
                  </div>
                </div>

                {/* Financial Summary */}
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-200/80">
                  <div className="flex justify-between text-gray-600">
                    <span>Payment Method:</span>
                    <span className="font-black uppercase tracking-wider text-slate-900">{selectedSale.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Gross Subtotal:</span>
                    <span className="font-bold">${selectedSale.subtotal ?? selectedSale.total}</span>
                  </div>
                  {Number(selectedSale.discount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount / Coupon Applied:</span>
                      <span className="font-bold">-${selectedSale.discount}</span>
                    </div>
                  )}
                  {Number(selectedSale.loyaltyPointsEarned || 0) > 0 && (
                    <div className="flex justify-between text-purple-600">
                      <span>Loyalty Points Rewarded:</span>
                      <span className="font-bold">+{selectedSale.loyaltyPointsEarned} pts</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                    <span>Total Net Amount:</span>
                    <span className="text-blue-600 text-lg font-black">${selectedSale.total}</span>
                  </div>
                </div>

                {selectedSale.notes && (
                  <p className="text-gray-500 italic bg-amber-50/60 p-3 rounded-xl border border-amber-200/50 text-[11px]">
                    Note: {selectedSale.notes}
                  </p>
                )}
              </div>

              {/* Actions Footer */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 shadow-2xs transition-all cursor-pointer"
                >
                  <Printer className="w-4 h-4" />
                  <span>Print Receipt</span>
                </button>
                <button
                  onClick={() => setSelectedSale(null)}
                  className="px-6 py-2.5 bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  Close
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </DashboardLayout>
  );
}
