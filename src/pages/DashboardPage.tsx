import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { useStore } from '../contexts/StoreContext';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { LowStockNotificationBanner } from '../components/inventory/LowStockNotificationBanner';
import { SmartForecastingWidget } from '../components/dashboard/SmartForecastingWidget';
import { ProductVelocityCards } from '../components/dashboard/ProductVelocityCards';
import { DynamicBusinessWidgets } from '../components/dashboard/DynamicBusinessWidgets';
import { Product, Sale } from '../types';
import { 
  TrendingUp, 
  Package, 
  Users, 
  AlertTriangle, 
  Plus, 
  Scan, 
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Zap,
  Award,
  MessageSquare,
  BarChart3,
  ShoppingCart,
  Receipt,
  ChevronRight,
  ExternalLink,
  ShieldCheck,
  Truck,
  DollarSign
} from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer 
} from 'recharts';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const mockWeeklyData = [
  { name: 'Sat', sales: 4200, profit: 980 },
  { name: 'Sun', sales: 3800, profit: 890 },
  { name: 'Mon', sales: 5100, profit: 1240 },
  { name: 'Tue', sales: 4600, profit: 1050 },
  { name: 'Wed', sales: 5900, profit: 1420 },
  { name: 'Thu', sales: 6800, profit: 1680 },
  { name: 'Fri', sales: 7400, profit: 1850 },
];

const mockProductsList: Product[] = [
  { id: 'p1', name: 'Fast Charger 20W USB-C', brand: 'Anker', category: 'Chargers', purchasePrice: 8, sellingPrice: 18, stock: 2, minStock: 10 },
  { id: 'p2', name: 'iPhone 15 Pro Max Silicone Case', brand: 'Apple', category: 'Cases', purchasePrice: 5, sellingPrice: 15, stock: 4, minStock: 12 },
  { id: 'p3', name: 'AirPods Pro 2nd Gen', brand: 'Apple', category: 'Audio', purchasePrice: 180, sellingPrice: 240, stock: 3, minStock: 5 },
  { id: 'p4', name: '9H Tempered Glass Screen Protector', brand: 'Baseus', category: 'Accessories', purchasePrice: 1, sellingPrice: 6, stock: 1, minStock: 20 },
  { id: 'p5', name: 'PowerBank 20,000mAh PD', brand: 'Anker', category: 'Accessories', purchasePrice: 25, sellingPrice: 45, stock: 18, minStock: 5 }
];

const mockSalesList: Sale[] = [
  {
    id: 's1',
    customerName: 'Soran Ali',
    total: 36,
    subtotal: 36,
    discount: 0,
    paid: 36,
    paymentMethod: 'cash',
    createdAt: new Date().toISOString(),
    items: [
      { id: 'p1', name: 'Fast Charger 20W USB-C', price: 18, quantity: 2 }
    ]
  },
  {
    id: 's2',
    customerName: 'Rebin Qadir',
    total: 30,
    subtotal: 30,
    discount: 0,
    paid: 30,
    paymentMethod: 'card',
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    items: [
      { id: 'p2', name: 'iPhone 15 Pro Max Silicone Case', price: 15, quantity: 2 }
    ]
  }
];

export default function DashboardPage() {
  const { t, i18n } = useTranslation();
  const { store } = useStore();
  const navigate = useNavigate();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  const [recentSales, setRecentSales] = useState<any[]>([]);
  const [productsCount, setProductsCount] = useState(12);
  const [lowStockCount, setLowStockCount] = useState(3);
  const [realProducts, setRealProducts] = useState<Product[]>(mockProductsList);
  const [realSales, setRealSales] = useState<Sale[]>(mockSalesList);

  // Calculate trial remaining days
  const getTrialDays = () => {
    if (!store?.trialEndDate) return 0;
    const end = new Date(store.trialEndDate);
    const now = new Date();
    const diffTime = end.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const trialDays = getTrialDays();

  // Load Real Recent Sales & Stock
  useEffect(() => {
    if (!store?.id) return;

    // Recent Sales
    const salesQ = query(collection(db, `stores/${store.id}/sales`), orderBy('createdAt', 'desc'), limit(5));
    const unsubSales = onSnapshot(salesQ, (snapshot) => {
      if (!snapshot.empty) {
        setRecentSales(snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
      } else {
        setRecentSales([
          { id: 's-1001', customerName: 'Soran Ali', total: 1244, paymentMethod: 'cash', createdAt: new Date(Date.now() - 3600000).toISOString() },
          { id: 's-1002', customerName: 'Rebin Qadir', total: 249, paymentMethod: 'card', createdAt: new Date(Date.now() - 7200000).toISOString() },
          { id: 's-1003', customerName: 'Lina Botan', total: 1249, paymentMethod: 'korepay', createdAt: new Date(Date.now() - 14400000).toISOString() },
          { id: 's-1004', customerName: 'Zanyar Rostam', total: 599, paymentMethod: 'debt', createdAt: new Date(Date.now() - 86400000).toISOString() },
        ]);
      }
    });

    // Products Count & Low Stock
    const prodQ = query(collection(db, `stores/${store.id}/products`));
    const unsubProd = onSnapshot(prodQ, (snapshot) => {
      if (!snapshot.empty) {
        const items = snapshot.docs.map(d => d.data());
        setProductsCount(items.length);
        setLowStockCount(items.filter((p: any) => (p.stock || 0) <= 3).length);
      }
    });

    return () => {
      unsubSales();
      unsubProd();
    };
  }, [store?.id]);

  const stats = [
    { 
      label: t('today_sales'), 
      value: '$7,400', 
      icon: TrendingUp, 
      color: 'text-blue-600 bg-blue-50 border-blue-100', 
      trend: '+18.4%', 
      up: true,
      route: '/sales',
      desc: 'View all sales invoices'
    },
    { 
      label: t('today_profit'), 
      value: '$1,850', 
      icon: ArrowUpRight, 
      color: 'text-emerald-600 bg-emerald-50 border-emerald-100', 
      trend: '89% Margin', 
      up: true,
      route: '/reports',
      desc: 'View financial breakdown'
    },
    { 
      label: t('products'), 
      value: `${productsCount}`, 
      icon: Package, 
      color: 'text-purple-600 bg-purple-50 border-purple-100', 
      trend: 'In Catalog', 
      up: true,
      route: '/products',
      desc: 'Browse inventory'
    },
    { 
      label: t('low_stock'), 
      value: `0${lowStockCount}`, 
      icon: AlertTriangle, 
      color: 'text-rose-600 bg-rose-50 border-rose-100', 
      trend: 'Requires Restock', 
      up: false,
      route: '/products?filter=low_stock',
      desc: 'Filter low stock items'
    },
  ];

  return (
    <DashboardLayout>
      <div className="space-y-8">
        {/* Low Stock Threshold Alert Banner */}
        <LowStockNotificationBanner
          products={realProducts}
          subscriberEmail={store?.subscriberEmail || 'itlobbybardarash@gmail.com'}
        />

        {/* Trial Banner - Minimal Design */}
        {trialDays > 0 && trialDays <= 30 && (
          <div className="bg-white border-l-4 border-amber-500 p-5 rounded-2xl shadow-xs flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="flex items-center gap-4 text-gray-800">
              <div className="bg-amber-100 p-2.5 rounded-2xl">
                <Clock className="w-5 h-5 text-amber-600" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{t('trial_remaining', { days: trialDays })}</p>
                <p className="text-xs text-gray-500">Upgrade your MobiStore Pro plan for multi-branch sync & unlimited invoices.</p>
              </div>
            </div>
            <button 
              onClick={() => navigate('/subscription')}
              className="bg-slate-900 text-white px-5 py-2.5 rounded-xl text-xs font-bold hover:bg-slate-800 transition-all shadow-md shadow-slate-900/10 cursor-pointer whitespace-nowrap"
            >
              Upgrade Now
            </button>
          </div>
        )}

        {/* Stats Grid - Fully Clickable Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat, i) => {
            const Icon = stat.icon;
            return (
              <motion.div
                key={stat.label}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.08 }}
                onClick={() => navigate(stat.route)}
                className="bg-white p-5 rounded-3xl shadow-xs border border-gray-100 hover:shadow-md hover:border-blue-200 transition-all cursor-pointer group flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <div className={cn("p-2.5 rounded-2xl border flex items-center justify-center", stat.color)}>
                    <Icon className="w-5 h-5" />
                  </div>
                  <span className={cn(
                    "text-[10px] font-black px-2 py-0.5 rounded-full",
                    stat.up ? "text-emerald-700 bg-emerald-50 border border-emerald-100" : "text-rose-700 bg-rose-50 border border-rose-100"
                  )}>
                    {stat.trend}
                  </span>
                </div>

                <div className="mt-4">
                  <p className="text-[11px] text-gray-400 font-bold uppercase tracking-wider">{stat.label}</p>
                  <div className="flex items-center justify-between mt-1">
                    <p className={cn("text-2xl font-black text-gray-900 group-hover:text-blue-600 transition-colors", stat.label === t('low_stock') && "text-rose-600")}>
                      {stat.value}
                    </p>
                    <ChevronRight className="w-4 h-4 text-gray-300 group-hover:text-blue-600 group-hover:translate-x-1 transition-all" />
                  </div>
                  <p className="text-[10px] text-gray-400 mt-1 font-medium">{stat.desc}</p>
                </div>
              </motion.div>
            );
          })}
        </div>

        {/* Dynamic Business Widgets Grid (Pharmacy, Clothing, Supermarket, Mobile, Auto Parts) */}
        <DynamicBusinessWidgets
          businessType={store?.businessType || 'mobile_electronics'}
          products={realProducts}
          sales={realSales}
          currency={store?.currency || '$'}
        />

        {/* AI Smart Forecasting Widget */}
        <SmartForecastingWidget
          products={realProducts}
          sales={realSales}
          currency={store?.currency || '$'}
        />

        {/* Product Velocity Cards (Top Selling & Slow Moving Stock Alerts) */}
        <ProductVelocityCards
          products={realProducts}
          sales={realSales}
          currency={store?.currency || '$'}
        />

        {/* Charts & AI Hub */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Sales Chart */}
          <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden flex flex-col">
            <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
              <div>
                <h3 className="font-black text-gray-900 text-sm">Weekly Revenue Trajectory</h3>
                <p className="text-[11px] text-gray-400">Daily gross revenue & profit margins</p>
              </div>
              <button 
                onClick={() => navigate('/reports')}
                className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 cursor-pointer"
              >
                <span>Full Reports</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>

            <div className="p-6 h-[280px]">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={mockWeeklyData}>
                  <defs>
                    <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                  <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 11, fontWeight: 'bold'}} />
                  <Tooltip 
                    contentStyle={{borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)'}}
                    cursor={{stroke: '#3b82f6', strokeWidth: 2}}
                  />
                  <Area type="monotone" dataKey="sales" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* AI and Quick Actions */}
          <div className="space-y-4 flex flex-col">
            {/* AI Assistant Card */}
            <div className="bg-[#0F172A] rounded-3xl p-6 text-white shadow-xl flex flex-col justify-between relative overflow-hidden group">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[60px] opacity-20 transition-all group-hover:opacity-30" />
              <div className="relative z-10">
                <div className="flex items-center gap-3 mb-4">
                  <div className="bg-blue-600 p-2 rounded-xl">
                    <Zap className="w-5 h-5 text-white fill-white" />
                  </div>
                  <h3 className="font-bold text-base tracking-tight">MobiAI Analyst</h3>
                </div>
                <AIAssistant />
              </div>
            </div>

            {/* Quick Actions Hub */}
            <div className="bg-white rounded-3xl shadow-xs border border-gray-100 p-5 flex-1 flex flex-col justify-between">
              <h3 className="font-black text-gray-900 text-xs uppercase tracking-wider mb-3">Management Hub</h3>
              <div className="grid grid-cols-2 gap-2.5">
                <button 
                  onClick={() => navigate('/pos')}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100 hover:border-blue-200 cursor-pointer group"
                >
                  <ShoppingCart className="w-5 h-5 text-blue-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-tight">POS Terminal</span>
                </button>

                <button 
                  onClick={() => navigate('/products')}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100 hover:border-blue-200 cursor-pointer group"
                >
                  <Package className="w-5 h-5 text-purple-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-tight">Products</span>
                </button>

                <button 
                  onClick={() => navigate('/customers')}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100 hover:border-blue-200 cursor-pointer group"
                >
                  <Users className="w-5 h-5 text-emerald-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-tight">Customers</span>
                </button>

                <button 
                  onClick={() => navigate('/supplier-returns')}
                  className="flex flex-col items-center justify-center gap-2 p-3 bg-gray-50 rounded-2xl hover:bg-blue-50 hover:text-blue-600 transition-all border border-gray-100 hover:border-blue-200 cursor-pointer group"
                >
                  <Truck className="w-5 h-5 text-indigo-600 group-hover:scale-110 transition-transform" />
                  <span className="text-[11px] font-black uppercase tracking-tight">Supplier RMA</span>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Recent Transactions & Invoices Section */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
            <div>
              <h3 className="font-black text-gray-900 text-sm">Recent Transactions</h3>
              <p className="text-[11px] text-gray-400">Latest checkout receipts from branch registers</p>
            </div>
            <button
              onClick={() => navigate('/sales')}
              className="flex items-center gap-1 text-xs font-black text-blue-600 hover:text-blue-700 cursor-pointer"
            >
              <span>{isRTL ? 'هەموو وەسڵەکان ببینە' : 'View All Invoices'}</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3.5">Invoice #</th>
                  <th className="px-6 py-3.5">Customer</th>
                  <th className="px-6 py-3.5">Method</th>
                  <th className="px-6 py-3.5">Amount</th>
                  <th className="px-6 py-3.5 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-xs">
                {recentSales.map((sale) => (
                  <tr 
                    key={sale.id}
                    onClick={() => navigate('/sales')}
                    className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                  >
                    <td className="px-6 py-3.5 font-black text-gray-900">
                      <div className="flex items-center gap-2">
                        <Receipt className="w-4 h-4 text-purple-600 group-hover:scale-110 transition-transform" />
                        <span>#{sale.id.slice(0, 8).toUpperCase()}</span>
                      </div>
                    </td>
                    <td className="px-6 py-3.5 font-bold text-gray-700">
                      {sale.customerName || 'Walk-in Customer'}
                    </td>
                    <td className="px-6 py-3.5">
                      <span className="px-2 py-0.5 bg-gray-100 text-gray-700 rounded-md font-black uppercase text-[10px]">
                        {sale.paymentMethod || 'cash'}
                      </span>
                    </td>
                    <td className="px-6 py-3.5 font-black text-blue-600 text-sm">
                      ${sale.total?.toLocaleString()}
                    </td>
                    <td className="px-6 py-3.5 text-right">
                      <span className="text-xs font-bold text-blue-600 group-hover:underline flex items-center justify-end gap-1">
                        <span>Details</span>
                        <ChevronRight className="w-3.5 h-3.5" />
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}

function AIAssistant() {
  const { store } = useStore();
  const [analysis, setAnalysis] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const getAnalysis = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/ai/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          storeData: { name: store?.name, status: store?.subscriptionStatus },
          query: 'Provide a brief business recommendation for my mobile store.'
        })
      });
      const data = await res.json();
      setAnalysis(data.text);
    } catch (error) {
      console.error(error);
      setAnalysis("Error analyzing data.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-4">
      <div className="min-h-[50px]">
        {analysis ? (
          <div className="text-xs font-medium leading-relaxed bg-white/5 p-3 rounded-xl border border-white/10 italic text-blue-100 max-h-24 overflow-y-auto custom-scrollbar">
            "{analysis}"
          </div>
        ) : (
          <p className="text-xs text-blue-100 italic opacity-80 leading-relaxed">
            "Your sales increased by 18% in the Erbil Branch this month. Ready for smart recommendations?"
          </p>
        )}
      </div>
      <button 
        onClick={getAnalysis}
        disabled={loading}
        className="w-full bg-white/10 hover:bg-white/20 border border-white/20 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all disabled:opacity-50 cursor-pointer"
      >
        {loading ? 'Analyzing...' : 'Get AI Analysis'}
      </button>
    </div>
  );
}
