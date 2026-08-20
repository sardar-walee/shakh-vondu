import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useStore } from '../contexts/StoreContext';
import { useTranslation } from 'react-i18next';
import { 
  BarChart3, 
  Calendar, 
  Download, 
  Printer, 
  Filter, 
  ArrowUpDown, 
  TrendingUp, 
  DollarSign, 
  Package, 
  Users, 
  Store as StoreIcon, 
  Sparkles, 
  Search, 
  ChevronUp, 
  ChevronDown, 
  Check, 
  Eye, 
  Receipt,
  Tag,
  CreditCard,
  Building2,
  UserCheck,
  Database
} from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Sale, ReportFilter, ReportSort } from '../types';
import Pagination from '../components/common/Pagination';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

const SAMPLE_BRANCHES = ['All Branches', 'Erbil Main HQ', 'Sulaymaniyah Branch', 'Duhok Center', 'Online / Delivery'];
const SAMPLE_EMPLOYEES = ['All Staff', 'Ahmed K. (Cashier)', 'Sara M. (Sales Lead)', 'Karwan H. (Manager)', 'Diyar B. (Tech)'];
const SAMPLE_CATEGORIES = ['All Categories', 'Smartphones', 'Accessories', 'Tablets', 'Smartwatches', 'Audio & Sound', 'Repairs & Parts'];

export default function ReportsPage() {
  const navigate = useNavigate();
  const { t, i18n } = useTranslation();
  const { store } = useStore();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  const [sales, setSales] = useState<Sale[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<Sale | null>(null);

  // Filters State
  const [filter, setFilter] = useState<ReportFilter>({
    dateRange: 'month',
    startDate: '',
    endDate: '',
    branchId: 'All Branches',
    employeeId: 'All Staff',
    category: 'All Categories',
    paymentMethod: 'all',
    searchQuery: ''
  });

  // Sorting State
  const [sort, setSort] = useState<ReportSort>({
    field: 'createdAt',
    direction: 'desc'
  });

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Fetch Sales Data
  useEffect(() => {
    if (!store?.id) return;
    const q = query(collection(db, `stores/${store.id}/sales`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const docs = snapshot.docs.map(doc => {
        const data = doc.data();
        return {
          id: doc.id,
          customerId: data.customerId || '',
          customerName: data.customerName || 'Walk-in Customer',
          customerPhone: data.customerPhone || '',
          items: data.items || [],
          subtotal: data.subtotal || data.total || 0,
          discount: data.discount || 0,
          total: data.total || 0,
          cost: data.cost || Math.round((data.total || 0) * 0.78),
          profit: data.profit || Math.round((data.total || 0) * 0.22),
          paid: data.paid || data.total || 0,
          remaining: data.remaining || 0,
          paymentMethod: data.paymentMethod || 'cash',
          employeeId: data.employeeId || 'emp_1',
          employeeName: data.employeeName || 'Ahmed K.',
          branchId: data.branchId || 'branch_erbil',
          branchName: data.branchName || 'Erbil Main HQ',
          loyaltyPointsEarned: data.loyaltyPointsEarned || Math.floor((data.total || 0) / 10),
          loyaltyPointsRedeemed: data.loyaltyPointsRedeemed || 0,
          createdAt: data.createdAt || new Date().toISOString()
        } as Sale;
      });

      // If database is brand new, provide realistic mock starter sales so charts and filters are vibrant immediately
      if (docs.length === 0) {
        const seeded: Sale[] = [
          {
            id: 'sale_101',
            customerName: 'Soran Ali',
            customerPhone: '+9647501112233',
            items: [{ id: 'p1', name: 'iPhone 15 Pro Max 256GB', price: 1180, purchasePrice: 1020, quantity: 1, category: 'Smartphones' }],
            subtotal: 1180,
            discount: 30,
            total: 1150,
            cost: 1020,
            profit: 130,
            paid: 1150,
            paymentMethod: 'cash',
            employeeName: 'Ahmed K.',
            branchName: 'Erbil Main HQ',
            loyaltyPointsEarned: 115,
            createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString()
          },
          {
            id: 'sale_102',
            customerName: 'Shakar Mohammed',
            customerPhone: '+9647503334455',
            items: [
              { id: 'p2', name: 'Samsung Galaxy S24 Ultra', price: 1050, purchasePrice: 910, quantity: 1, category: 'Smartphones' },
              { id: 'p3', name: 'Anker 65W Fast Charger', price: 45, purchasePrice: 22, quantity: 1, category: 'Accessories' }
            ],
            subtotal: 1095,
            discount: 0,
            total: 1095,
            cost: 932,
            profit: 163,
            paid: 1095,
            paymentMethod: 'card',
            employeeName: 'Sara M.',
            branchName: 'Sulaymaniyah Branch',
            loyaltyPointsEarned: 110,
            createdAt: new Date(Date.now() - 26 * 3600 * 1000).toISOString()
          },
          {
            id: 'sale_103',
            customerName: 'Rebin Qadir',
            customerPhone: '+9647509998877',
            items: [{ id: 'p4', name: 'AirPods Pro 2 USB-C', price: 230, purchasePrice: 180, quantity: 2, category: 'Audio & Sound' }],
            subtotal: 460,
            discount: 20,
            total: 440,
            cost: 360,
            profit: 80,
            paid: 440,
            paymentMethod: 'cash',
            employeeName: 'Ahmed K.',
            branchName: 'Erbil Main HQ',
            loyaltyPointsEarned: 44,
            createdAt: new Date(Date.now() - 3 * 86400 * 1000).toISOString()
          },
          {
            id: 'sale_104',
            customerName: 'Lina Botan',
            customerPhone: '+9647504445566',
            items: [{ id: 'p5', name: 'Apple Watch Series 9 45mm', price: 420, purchasePrice: 340, quantity: 1, category: 'Smartwatches' }],
            subtotal: 420,
            discount: 0,
            total: 420,
            cost: 340,
            profit: 80,
            paid: 220,
            remaining: 200,
            paymentMethod: 'debt',
            employeeName: 'Karwan H.',
            branchName: 'Duhok Center',
            loyaltyPointsEarned: 42,
            createdAt: new Date(Date.now() - 6 * 86400 * 1000).toISOString()
          },
          {
            id: 'sale_105',
            customerName: 'Zanyar Rostam',
            customerPhone: '+9647502221144',
            items: [{ id: 'p6', name: 'iPad Air M2 128GB', price: 620, purchasePrice: 520, quantity: 1, category: 'Tablets' }],
            subtotal: 620,
            discount: 10,
            total: 610,
            cost: 520,
            profit: 90,
            paid: 610,
            paymentMethod: 'card',
            employeeName: 'Sara M.',
            branchName: 'Erbil Main HQ',
            loyaltyPointsEarned: 61,
            createdAt: new Date(Date.now() - 12 * 86400 * 1000).toISOString()
          }
        ];
        setSales(seeded);
      } else {
        setSales(docs);
      }
      setLoading(false);
    }, (err) => {
      console.error('Reports sales load error:', err);
      setLoading(false);
    });

    return () => unsubscribe();
  }, [store]);

  // Filtering Logic
  const filteredSales = useMemo(() => {
    return sales.filter((sale) => {
      const saleDate = new Date(sale.createdAt);
      const now = new Date();

      // 1. Date Range Filter
      if (filter.dateRange === 'today') {
        if (saleDate.toDateString() !== now.toDateString()) return false;
      } else if (filter.dateRange === 'yesterday') {
        const yesterday = new Date(now);
        yesterday.setDate(now.getDate() - 1);
        if (saleDate.toDateString() !== yesterday.toDateString()) return false;
      } else if (filter.dateRange === 'week') {
        const sevenDaysAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        if (saleDate < sevenDaysAgo) return false;
      } else if (filter.dateRange === 'month') {
        const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        if (saleDate < thirtyDaysAgo) return false;
      } else if (filter.dateRange === 'last_month') {
        const lastMonthStart = new Date(now.getFullYear(), now.getMonth() - 1, 1);
        const lastMonthEnd = new Date(now.getFullYear(), now.getMonth(), 0);
        if (saleDate < lastMonthStart || saleDate > lastMonthEnd) return false;
      } else if (filter.dateRange === 'year') {
        const yearStart = new Date(now.getFullYear(), 0, 1);
        if (saleDate < yearStart) return false;
      } else if (filter.dateRange === 'custom') {
        if (filter.startDate && new Date(filter.startDate) > saleDate) return false;
        if (filter.endDate && new Date(filter.endDate) < saleDate) return false;
      }

      // 2. Branch Filter
      if (filter.branchId && filter.branchId !== 'All Branches') {
        if (sale.branchName !== filter.branchId) return false;
      }

      // 3. Employee Filter
      if (filter.employeeId && filter.employeeId !== 'All Staff') {
        if (!sale.employeeName?.includes(filter.employeeId.split(' ')[0])) return false;
      }

      // 4. Product Category Filter
      if (filter.category && filter.category !== 'All Categories') {
        const hasCategory = sale.items.some(item => 
          item.category?.toLowerCase() === filter.category?.toLowerCase() ||
          item.name.toLowerCase().includes(filter.category?.toLowerCase() || '')
        );
        if (!hasCategory) return false;
      }

      // 5. Payment Method Filter
      if (filter.paymentMethod && filter.paymentMethod !== 'all') {
        if (sale.paymentMethod !== filter.paymentMethod) return false;
      }

      // 6. Free Search Query (Customer, Invoice, Product, IMEI)
      if (filter.searchQuery) {
        const query = filter.searchQuery.toLowerCase();
        const matchesCustomer = sale.customerName?.toLowerCase().includes(query) || sale.customerPhone?.includes(query);
        const matchesInvoice = sale.id.toLowerCase().includes(query);
        const matchesItems = sale.items.some(it => it.name.toLowerCase().includes(query) || it.imei?.includes(query));
        if (!matchesCustomer && !matchesInvoice && !matchesItems) return false;
      }

      return true;
    });
  }, [sales, filter]);

  // Sorting Logic
  const sortedSales = useMemo(() => {
    return [...filteredSales].sort((a, b) => {
      let aVal: any = a[sort.field];
      let bVal: any = b[sort.field];

      if (sort.field === 'itemsCount') {
        aVal = a.items.reduce((s, it) => s + it.quantity, 0);
        bVal = b.items.reduce((s, it) => s + it.quantity, 0);
      }

      if (typeof aVal === 'string') {
        return sort.direction === 'asc' 
          ? aVal.localeCompare(String(bVal)) 
          : String(bVal).localeCompare(aVal);
      }

      aVal = Number(aVal || 0);
      bVal = Number(bVal || 0);
      return sort.direction === 'asc' ? aVal - bVal : bVal - aVal;
    });
  }, [filteredSales, sort]);

  const handleSort = (field: ReportSort['field']) => {
    if (sort.field === field) {
      setSort({ field, direction: sort.direction === 'asc' ? 'desc' : 'asc' });
    } else {
      setSort({ field, direction: 'desc' });
    }
  };

  // Paginated Sales
  const totalPages = Math.ceil(sortedSales.length / pageSize) || 1;
  const paginatedSales = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return sortedSales.slice(start, start + pageSize);
  }, [sortedSales, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filter, sort, pageSize]);

  // Aggregated KPI Metrics
  const metrics = useMemo(() => {
    const totalRevenue = filteredSales.reduce((sum, s) => sum + s.total, 0);
    const totalCost = filteredSales.reduce((sum, s) => sum + (s.cost || 0), 0);
    const totalProfit = filteredSales.reduce((sum, s) => sum + (s.profit || 0), 0);
    const totalItems = filteredSales.reduce((sum, s) => sum + s.items.reduce((acc, it) => acc + it.quantity, 0), 0);
    const totalPointsEarned = filteredSales.reduce((sum, s) => sum + (s.loyaltyPointsEarned || 0), 0);
    const avgOrderValue = filteredSales.length > 0 ? (totalRevenue / filteredSales.length) : 0;
    const profitMargin = totalRevenue > 0 ? ((totalProfit / totalRevenue) * 100) : 0;

    return {
      totalRevenue,
      totalCost,
      totalProfit,
      totalItems,
      totalInvoices: filteredSales.length,
      avgOrderValue,
      profitMargin,
      totalPointsEarned
    };
  }, [filteredSales]);

  // Chart Data: Daily Revenue & Profit Trend
  const chartData = useMemo(() => {
    const dailyMap: Record<string, { date: string; sales: number; profit: number }> = {};

    filteredSales.forEach((sale) => {
      const dateStr = new Date(sale.createdAt).toLocaleDateString(undefined, { month: 'short', day: 'numeric' });
      if (!dailyMap[dateStr]) {
        dailyMap[dateStr] = { date: dateStr, sales: 0, profit: 0 };
      }
      dailyMap[dateStr].sales += sale.total;
      dailyMap[dateStr].profit += (sale.profit || 0);
    });

    return Object.values(dailyMap).slice(-14);
  }, [filteredSales]);

  // Chart Data: Category Breakdown
  const categoryData = useMemo(() => {
    const catMap: Record<string, number> = {};
    filteredSales.forEach((sale) => {
      sale.items.forEach((item) => {
        const cat = item.category || 'Accessories';
        catMap[cat] = (catMap[cat] || 0) + (item.price * item.quantity);
      });
    });
    return Object.entries(catMap).map(([name, value]) => ({ name, value }));
  }, [filteredSales]);

  // Chart Data: Branch Breakdown
  const branchData = useMemo(() => {
    const brMap: Record<string, number> = {};
    filteredSales.forEach((sale) => {
      const br = sale.branchName || 'Main HQ';
      brMap[br] = (brMap[br] || 0) + sale.total;
    });
    return Object.entries(brMap).map(([name, total]) => ({ name, total }));
  }, [filteredSales]);

  // Export to CSV
  const exportToCSV = () => {
    if (sortedSales.length === 0) return;
    const headers = ['Invoice ID', 'Date', 'Customer Name', 'Phone', 'Branch', 'Employee', 'Items Count', 'Payment Method', 'Discount', 'Total ($)', 'Profit ($)'];
    const rows = sortedSales.map(s => [
      `#${s.id.slice(0, 8).toUpperCase()}`,
      new Date(s.createdAt).toLocaleDateString(),
      `"${s.customerName || 'Walk-in'}"`,
      s.customerPhone || '',
      `"${s.branchName || ''}"`,
      `"${s.employeeName || ''}"`,
      s.items.reduce((a, b) => a + b.quantity, 0),
      s.paymentMethod,
      s.discount,
      s.total,
      s.profit || 0
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `mobistore_sales_report_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-8">
        
        {/* Header with Title & Quick Export */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-2.5 rounded-xl shadow-lg shadow-blue-200">
                <BarChart3 className="w-6 h-6 text-white" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('reports')}</h1>
                <p className="text-xs text-gray-500 font-medium">Multi-dimensional branch sales, profit margin, and performance analytics.</p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => navigate('/backups')}
              className="flex items-center gap-2 px-4 py-2.5 bg-indigo-50 border border-indigo-200 text-indigo-700 rounded-xl text-xs font-bold hover:bg-indigo-100 shadow-sm transition-all"
              title="Database Snapshots & CSV/JSON Backups"
            >
              <Database className="w-4 h-4 text-indigo-600" />
              <span>Full Store Backups</span>
            </button>
            <button 
              onClick={() => window.print()}
              className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all"
            >
              <Printer className="w-4 h-4 text-gray-500" />
              <span>Print Report</span>
            </button>
            <button 
              onClick={exportToCSV}
              className="flex items-center gap-2 px-5 py-2.5 bg-gray-900 text-white rounded-xl text-xs font-black uppercase tracking-wider hover:bg-gray-800 shadow-xl shadow-gray-200 transition-all active:scale-95"
            >
              <Download className="w-4 h-4 text-blue-400" />
              <span>{t('export_csv')}</span>
            </button>
          </div>
        </div>

        {/* Multi-Dimensional Filter Toolbar */}
        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-blue-600" />
              <span className="text-xs font-black uppercase tracking-wider text-gray-800">{t('filter_by')}</span>
            </div>
            <button 
              onClick={() => setFilter({
                dateRange: 'month',
                startDate: '',
                endDate: '',
                branchId: 'All Branches',
                employeeId: 'All Staff',
                category: 'All Categories',
                paymentMethod: 'all',
                searchQuery: ''
              })}
              className="text-[10px] font-bold text-red-500 hover:underline uppercase tracking-wider"
            >
              Reset Filters
            </button>
          </div>

          {/* Preset Date Range Buttons */}
          <div className="flex flex-wrap items-center gap-2">
            {[
              { id: 'today', label: 'Today' },
              { id: 'yesterday', label: 'Yesterday' },
              { id: 'week', label: 'Last 7 Days' },
              { id: 'month', label: 'Last 30 Days' },
              { id: 'last_month', label: 'Last Month' },
              { id: 'year', label: 'This Year' },
              { id: 'all', label: 'All Time' },
              { id: 'custom', label: 'Custom Range' },
            ].map((preset) => (
              <button
                key={preset.id}
                onClick={() => setFilter({ ...filter, dateRange: preset.id as any })}
                className={cn(
                  "px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all",
                  filter.dateRange === preset.id 
                    ? "bg-blue-600 text-white shadow-md shadow-blue-200" 
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                )}
              >
                {preset.label}
              </button>
            ))}
          </div>

          {/* Custom Date Pickers (if custom selected) */}
          {filter.dateRange === 'custom' && (
            <div className="flex items-center gap-4 bg-gray-50 p-3 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">From:</span>
                <input 
                  type="date" 
                  className="bg-white px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 outline-none"
                  value={filter.startDate}
                  onChange={(e) => setFilter({ ...filter, startDate: e.target.value })}
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold text-gray-500">To:</span>
                <input 
                  type="date" 
                  className="bg-white px-3 py-1.5 text-xs font-semibold rounded-lg border border-gray-300 outline-none"
                  value={filter.endDate}
                  onChange={(e) => setFilter({ ...filter, endDate: e.target.value })}
                />
              </div>
            </div>
          )}

          {/* Secondary Dropdown Filter Row */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3 pt-2">
            {/* Search Input */}
            <div className="relative">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <input 
                type="text"
                placeholder="Search customer, invoice, IMEI..."
                value={filter.searchQuery}
                onChange={(e) => setFilter({ ...filter, searchQuery: e.target.value })}
                className="w-full pl-10 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-blue-500 outline-none"
              />
            </div>

            {/* Branch Filter */}
            <div className="relative">
              <select
                value={filter.branchId}
                onChange={(e) => setFilter({ ...filter, branchId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
              >
                {SAMPLE_BRANCHES.map(br => <option key={br} value={br}>{br}</option>)}
              </select>
            </div>

            {/* Employee Filter */}
            <div className="relative">
              <select
                value={filter.employeeId}
                onChange={(e) => setFilter({ ...filter, employeeId: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
              >
                {SAMPLE_EMPLOYEES.map(emp => <option key={emp} value={emp}>{emp}</option>)}
              </select>
            </div>

            {/* Category Filter */}
            <div className="relative">
              <select
                value={filter.category}
                onChange={(e) => setFilter({ ...filter, category: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer"
              >
                {SAMPLE_CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
              </select>
            </div>

            {/* Payment Method Filter */}
            <div className="relative">
              <select
                value={filter.paymentMethod}
                onChange={(e) => setFilter({ ...filter, paymentMethod: e.target.value })}
                className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 outline-none cursor-pointer uppercase"
              >
                <option value="all">All Payments</option>
                <option value="cash">Cash</option>
                <option value="card">Credit Card</option>
                <option value="debt">Installment / Debt</option>
              </select>
            </div>
          </div>
        </div>

        {/* Aggregated KPI Summary Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Gross Revenue</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-blue-600">${metrics.totalRevenue.toLocaleString()}</span>
              <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{metrics.totalInvoices} sales</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Net Estimated Profit</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-green-600">${metrics.totalProfit.toLocaleString()}</span>
              <span className="text-[10px] font-black text-green-600 bg-green-50 px-2 py-0.5 rounded-full">{metrics.profitMargin.toFixed(1)}% margin</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Average Order Value</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-gray-900">${metrics.avgOrderValue.toFixed(2)}</span>
              <span className="text-[10px] font-bold text-gray-500">{metrics.totalItems} items sold</span>
            </div>
          </div>

          <div className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm">
            <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">Loyalty Points Issued</p>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-black text-purple-600">{metrics.totalPointsEarned.toLocaleString()} pts</span>
              <span className="text-[10px] font-bold text-purple-500 bg-purple-50 px-2 py-0.5 rounded-full">Reward Points</span>
            </div>
          </div>
        </div>

        {/* Interactive Analytics Charts */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Revenue vs Profit Time Trend */}
          <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide">Revenue & Profit Trajectory</h3>
                <p className="text-xs text-gray-400">Daily financial performance across the selected date range.</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-bold">
                <span className="flex items-center gap-1.5 text-blue-600"><div className="w-3 h-3 bg-blue-500 rounded-sm"></div> Revenue</span>
                <span className="flex items-center gap-1.5 text-green-600"><div className="w-3 h-3 bg-green-500 rounded-sm"></div> Profit</span>
              </div>
            </div>
            <div className="h-64 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                    <linearGradient id="colorProfit" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="date" axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fontSize: 10, fill: '#94a3b8', fontWeight: 'bold' }} />
                  <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.1)' }} />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" name="Revenue ($)" />
                  <Area type="monotone" dataKey="profit" stroke="#10b981" strokeWidth={3} fillOpacity={1} fill="url(#colorProfit)" name="Profit ($)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Branch & Category Distribution */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wide mb-4">Branch Breakdown</h3>
            <div className="space-y-4">
              {branchData.map((b, idx) => {
                const percentage = metrics.totalRevenue > 0 ? ((b.total / metrics.totalRevenue) * 100).toFixed(0) : '0';
                return (
                  <div key={b.name} className="space-y-1">
                    <div className="flex justify-between text-xs font-bold text-gray-700">
                      <span>{b.name}</span>
                      <span className="text-blue-600">${b.total.toLocaleString()} ({percentage}%)</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                      <div 
                        className="h-full bg-blue-500 rounded-full transition-all" 
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="pt-6 border-t border-gray-100 mt-6">
              <h4 className="text-xs font-black text-gray-400 uppercase tracking-widest mb-3">Top Product Categories</h4>
              <div className="flex flex-wrap gap-2">
                {categoryData.map((c, i) => (
                  <span key={c.name} className="px-2.5 py-1 bg-gray-50 border border-gray-200 rounded-lg text-[10px] font-bold text-gray-600">
                    {c.name}: <strong className="text-gray-900">${c.value}</strong>
                  </span>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Detailed Sales Report Table with Dynamic Column Sorting */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 bg-gray-50/40">
            <div>
              <h3 className="font-bold text-gray-900">Transaction Journal ({sortedSales.length} records)</h3>
              <p className="text-xs text-gray-400">Click any column header to sort by ascending/descending order.</p>
            </div>
            <span className="text-xs font-bold text-gray-500 bg-white px-3 py-1.5 rounded-xl border border-gray-200 shadow-sm">
              Sorted by: <strong className="text-blue-600 uppercase">{sort.field} ({sort.direction})</strong>
            </span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100 cursor-pointer select-none">
                  <th onClick={() => handleSort('id')} className="px-6 py-4 hover:text-blue-600 transition-colors">
                    <div className="flex items-center gap-1">
                      <span>Invoice ID</span>
                      {sort.field === 'id' && (sort.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('createdAt')} className="px-6 py-4 hover:text-blue-600 transition-colors">
                    <div className="flex items-center gap-1">
                      <span>Date & Time</span>
                      {sort.field === 'createdAt' && (sort.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('customerName')} className="px-6 py-4 hover:text-blue-600 transition-colors">
                    <div className="flex items-center gap-1">
                      <span>Customer</span>
                      {sort.field === 'customerName' && (sort.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('branchName')} className="px-6 py-4 hover:text-blue-600 transition-colors">
                    <div className="flex items-center gap-1">
                      <span>Branch</span>
                      {sort.field === 'branchName' && (sort.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('employeeName')} className="px-6 py-4 hover:text-blue-600 transition-colors">
                    <div className="flex items-center gap-1">
                      <span>Cashier</span>
                      {sort.field === 'employeeName' && (sort.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('itemsCount')} className="px-6 py-4 hover:text-blue-600 transition-colors">
                    <div className="flex items-center gap-1">
                      <span>Items</span>
                      {sort.field === 'itemsCount' && (sort.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('total')} className="px-6 py-4 hover:text-blue-600 transition-colors">
                    <div className="flex items-center gap-1">
                      <span>Total Amount</span>
                      {sort.field === 'total' && (sort.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                    </div>
                  </th>
                  <th onClick={() => handleSort('profit')} className="px-6 py-4 hover:text-blue-600 transition-colors">
                    <div className="flex items-center gap-1">
                      <span>Profit</span>
                      {sort.field === 'profit' && (sort.direction === 'asc' ? <ChevronUp className="w-3.5 h-3.5 text-blue-600" /> : <ChevronDown className="w-3.5 h-3.5 text-blue-600" />)}
                    </div>
                  </th>
                  <th className="px-6 py-4 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedSales.map((sale) => (
                  <tr key={sale.id} className="hover:bg-gray-50/60 transition-colors">
                    <td className="px-6 py-4 font-bold text-gray-900">
                      <div className="flex items-center gap-2">
                        <div className="bg-gray-100 p-2 rounded-xl text-gray-600">
                          <Receipt className="w-4 h-4" />
                        </div>
                        <span>#{sale.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-500">
                      {new Date(sale.createdAt).toLocaleDateString(undefined, { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' })}
                    </td>
                    <td className="px-6 py-4">
                      <p className="font-bold text-gray-900 text-xs">{sale.customerName}</p>
                      <p className="text-[10px] text-gray-400">{sale.customerPhone || 'Walk-in'}</p>
                    </td>
                    <td className="px-6 py-4">
                      <span className="px-2.5 py-1 bg-blue-50 text-blue-600 rounded-lg text-[10px] font-black uppercase tracking-wider border border-blue-100">
                        {sale.branchName || 'Erbil Main HQ'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs font-bold text-gray-600">
                      {sale.employeeName || 'Staff'}
                    </td>
                    <td className="px-6 py-4">
                      <span className="text-xs font-bold text-gray-700">
                        {sale.items.reduce((s, it) => s + it.quantity, 0)} Units
                      </span>
                    </td>
                    <td className="px-6 py-4 font-black text-gray-900 text-sm">
                      ${sale.total}
                      {sale.discount > 0 && <span className="text-[9px] text-red-500 block font-normal">(-${sale.discount} disc)</span>}
                    </td>
                    <td className="px-6 py-4 font-black text-green-600 text-sm">
                      +${sale.profit || 0}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <button 
                        onClick={() => setSelectedSale(sale)}
                        className="px-3 py-1.5 bg-gray-100 hover:bg-blue-600 hover:text-white rounded-xl text-xs font-bold text-gray-700 transition-all shadow-sm"
                      >
                        Inspect
                      </button>
                    </td>
                  </tr>
                ))}
                {sortedSales.length === 0 && (
                  <tr>
                    <td colSpan={9} className="px-6 py-20 text-center text-gray-400 font-bold uppercase tracking-widest text-xs">
                      No sales matching the selected filters.
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
            totalItems={sortedSales.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => setPageSize(s)}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>

        {/* Invoice Inspection Modal */}
        {selectedSale && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
            <div className="bg-white rounded-3xl p-8 max-w-lg w-full shadow-2xl space-y-6 animate-in fade-in zoom-in duration-200">
              <div className="flex justify-between items-start border-b border-gray-100 pb-4">
                <div>
                  <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Transaction Details</span>
                  <h3 className="text-xl font-black text-gray-900">Invoice #{selectedSale.id.slice(0, 8).toUpperCase()}</h3>
                </div>
                <button onClick={() => setSelectedSale(null)} className="p-2 text-gray-400 hover:text-gray-900 rounded-xl hover:bg-gray-100">
                  ✕
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 text-xs">
                <div>
                  <span className="text-gray-400 block font-bold">Customer</span>
                  <p className="font-black text-gray-800">{selectedSale.customerName}</p>
                  <p className="text-gray-500">{selectedSale.customerPhone || 'No Phone'}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold">Date & Time</span>
                  <p className="font-black text-gray-800">{new Date(selectedSale.createdAt).toLocaleString()}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold">Branch & Cashier</span>
                  <p className="font-black text-gray-800">{selectedSale.branchName} • {selectedSale.employeeName}</p>
                </div>
                <div>
                  <span className="text-gray-400 block font-bold">Payment Method</span>
                  <p className="font-black text-blue-600 uppercase">{selectedSale.paymentMethod}</p>
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <span className="text-xs font-black text-gray-400 uppercase tracking-widest">Purchased Items</span>
                <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                  {selectedSale.items.map((item, idx) => (
                    <div key={idx} className="flex justify-between items-center bg-gray-50 p-3 rounded-xl text-xs font-semibold">
                      <div>
                        <p className="text-gray-900 font-bold">{item.name}</p>
                        {item.imei && <p className="text-[10px] text-blue-600 font-mono">IMEI: {item.imei}</p>}
                        <p className="text-[10px] text-gray-400">Qty: {item.quantity} × ${item.price}</p>
                      </div>
                      <span className="font-black text-gray-900">${item.price * item.quantity}</span>
                    </div>
                  ))}
                </div>
              </div>

              <div className="border-t border-gray-100 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-gray-500 font-bold">
                  <span>Subtotal</span>
                  <span>${selectedSale.subtotal}</span>
                </div>
                {selectedSale.discount > 0 && (
                  <div className="flex justify-between text-red-500 font-bold">
                    <span>Discount</span>
                    <span>-${selectedSale.discount}</span>
                  </div>
                )}
                <div className="flex justify-between text-base font-black text-gray-900 pt-2 border-t border-gray-100">
                  <span>Total Paid</span>
                  <span>${selectedSale.total}</span>
                </div>
              </div>

              <button 
                onClick={() => setSelectedSale(null)} 
                className="w-full bg-gray-900 text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-800"
              >
                Close Details
              </button>
            </div>
          </div>
        )}

      </div>
    </DashboardLayout>
  );
}
