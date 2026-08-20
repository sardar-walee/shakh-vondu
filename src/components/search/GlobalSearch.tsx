import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { collection, query, onSnapshot, orderBy, limit } from 'firebase/firestore';
import { db } from '../../lib/firebase';
import { useStore } from '../../contexts/StoreContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useTranslation } from 'react-i18next';
import { Product, Customer } from '../../types';
import { 
  Search, 
  Command, 
  Package, 
  Users, 
  Receipt, 
  X, 
  ArrowRight, 
  CornerDownLeft, 
  Calendar, 
  Phone, 
  MapPin, 
  Award, 
  DollarSign, 
  Barcode, 
  Tag, 
  Printer, 
  ExternalLink,
  Clock,
  Sparkles,
  ShoppingBag,
  CreditCard,
  Building,
  Check,
  Smartphone,
  Layers,
  ArrowUpRight,
  TrendingUp,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export interface SaleTransaction {
  id: string;
  invoiceNumber?: string;
  customerName?: string;
  customerId?: string;
  customerPhone?: string;
  cashierName?: string;
  branchName?: string;
  total: number;
  subtotal?: number;
  tax?: number;
  discount?: number;
  paymentMethod: 'cash' | 'card' | 'debt' | 'korepay' | 'fib' | 'mixed' | string;
  status?: 'completed' | 'refunded' | 'voided' | 'pending';
  items?: Array<{
    id?: string;
    productId?: string;
    name: string;
    quantity: number;
    price: number;
    subtotal?: number;
    barcode?: string;
    imei?: string;
  }>;
  notes?: string;
  createdAt: string | any;
}

type SearchCategory = 'all' | 'products' | 'customers' | 'invoices';

interface SearchResultItem {
  id: string;
  type: 'product' | 'customer' | 'invoice' | 'action';
  title: string;
  subtitle: string;
  metaBadge?: string;
  badgeColor?: string;
  icon: React.ElementType;
  rawItem: any;
  score: number;
}

export default function GlobalSearch() {
  const { store } = useStore();
  const { hasPermission } = usePermissions();
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  // Search State
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [activeCategory, setActiveCategory] = useState<SearchCategory>('all');
  const [selectedIndex, setSelectedIndex] = useState(0);
  const [recentSearches, setRecentSearches] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem(`mobistore_recent_searches_${store?.id || 'default'}`);
      return saved ? JSON.parse(saved) : ['iPhone 15', 'Soran', 'INV-1024'];
    } catch {
      return ['iPhone 15', 'Soran', 'INV-1024'];
    }
  });

  // Data Store
  const [products, setProducts] = useState<Product[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [sales, setSales] = useState<SaleTransaction[]>([]);
  const [loading, setLoading] = useState(false);

  // Detail Modals
  const [selectedInvoice, setSelectedInvoice] = useState<SaleTransaction | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);

  const inputRef = useRef<HTMLInputElement>(null);
  const listRef = useRef<HTMLDivElement>(null);

  // Tenant Boundary Scoped Data Listener (RLS compliant with Firestore rules)
  useEffect(() => {
    if (!store?.id) return;
    setLoading(true);

    // 1. Fetch Tenant Products
    const qProducts = query(collection(db, `stores/${store.id}/products`));
    const unsubProducts = onSnapshot(qProducts, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      if (docs.length > 0) {
        setProducts(docs);
      } else {
        // Sample tenant defaults if fresh
        setProducts([
          { id: 'p1', name: 'iPhone 15 Pro Max 256GB', brand: 'Apple', model: 'A3106', category: 'Smartphones', sellingPrice: 1199, purchasePrice: 980, stock: 12, barcode: '195949012345', sku: 'APL-IP15PM-256', imeis: ['352981098765432'] },
          { id: 'p2', name: 'Samsung Galaxy S24 Ultra 512GB', brand: 'Samsung', model: 'SM-S928B', category: 'Smartphones', sellingPrice: 1249, purchasePrice: 1020, stock: 8, barcode: '880609512345', sku: 'SAM-S24U-512', imeis: ['358741098123456'] },
          { id: 'p3', name: 'AirPods Pro 2nd Gen (USB-C)', brand: 'Apple', model: 'MTJV3', category: 'Audio & Sound', sellingPrice: 249, purchasePrice: 190, stock: 24, barcode: '195949567890', sku: 'APL-APP2-USBC' },
          { id: 'p4', name: 'Anker 65W GaN Fast Charger', brand: 'Anker', model: 'A2663', category: 'Accessories', sellingPrice: 45, purchasePrice: 28, stock: 45, barcode: '848061054321', sku: 'ANK-GAN-65W' },
          { id: 'p5', name: 'iPad Air M2 11-inch 128GB', brand: 'Apple', model: 'A2902', category: 'Tablets', sellingPrice: 599, purchasePrice: 490, stock: 6, barcode: '195949887766', sku: 'APL-IPADAIR-M2' }
        ]);
      }
    });

    // 2. Fetch Tenant Customers
    const qCustomers = query(collection(db, `stores/${store.id}/customers`));
    const unsubCustomers = onSnapshot(qCustomers, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Customer));
      if (docs.length > 0) {
        setCustomers(docs);
      } else {
        setCustomers([
          { id: 'c1', name: 'Soran Ali', phone: '+9647501112233', address: 'Erbil, Dream City', debt: 0, loyaltyPoints: 640, totalSpent: 3200, tier: 'silver' },
          { id: 'c2', name: 'Rebin Qadir', phone: '+9647509998877', address: 'Sulaymaniyah, Salim St', debt: 150, loyaltyPoints: 1250, totalSpent: 6250, tier: 'gold' },
          { id: 'c3', name: 'Lina Botan', phone: '+9647504445566', address: 'Duhok, KRO', debt: 0, loyaltyPoints: 2800, totalSpent: 14000, tier: 'platinum' },
          { id: 'c4', name: 'Zanyar Rostam', phone: '+9647502221144', address: 'Erbil, Ankawa', debt: 75, loyaltyPoints: 120, totalSpent: 600, tier: 'bronze' }
        ]);
      }
    });

    // 3. Fetch Tenant Sales / Invoices
    const qSales = query(collection(db, `stores/${store.id}/sales`), orderBy('createdAt', 'desc'), limit(100));
    const unsubSales = onSnapshot(qSales, (snapshot) => {
      const docs = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SaleTransaction));
      if (docs.length > 0) {
        setSales(docs);
      } else {
        setSales([
          {
            id: 's-1001',
            invoiceNumber: 'INV-2026-1001',
            customerName: 'Soran Ali',
            customerId: 'c1',
            customerPhone: '+9647501112233',
            cashierName: 'Ahmad Cashier',
            branchName: 'Main Store - Erbil',
            total: 1244,
            subtotal: 1244,
            tax: 0,
            discount: 0,
            paymentMethod: 'cash',
            status: 'completed',
            items: [
              { name: 'iPhone 15 Pro Max 256GB', quantity: 1, price: 1199, subtotal: 1199, barcode: '195949012345' },
              { name: 'Anker 65W GaN Fast Charger', quantity: 1, price: 45, subtotal: 45, barcode: '848061054321' }
            ],
            notes: 'Customer paid in USD cash',
            createdAt: new Date(Date.now() - 3600000 * 2).toISOString()
          },
          {
            id: 's-1002',
            invoiceNumber: 'INV-2026-1002',
            customerName: 'Rebin Qadir',
            customerId: 'c2',
            customerPhone: '+9647509998877',
            cashierName: 'Haval Pos',
            branchName: 'Main Store - Erbil',
            total: 249,
            subtotal: 249,
            tax: 0,
            discount: 0,
            paymentMethod: 'card',
            status: 'completed',
            items: [
              { name: 'AirPods Pro 2nd Gen (USB-C)', quantity: 1, price: 249, subtotal: 249, barcode: '195949567890' }
            ],
            notes: 'FIB Visa Card terminal transaction',
            createdAt: new Date(Date.now() - 3600000 * 8).toISOString()
          },
          {
            id: 's-1003',
            invoiceNumber: 'INV-2026-1003',
            customerName: 'Walk-in Customer',
            cashierName: 'Ahmad Cashier',
            branchName: 'Main Store - Erbil',
            total: 1249,
            subtotal: 1249,
            tax: 0,
            discount: 0,
            paymentMethod: 'cash',
            status: 'completed',
            items: [
              { name: 'Samsung Galaxy S24 Ultra 512GB', quantity: 1, price: 1249, subtotal: 1249, barcode: '880609512345' }
            ],
            createdAt: new Date(Date.now() - 3600000 * 24).toISOString()
          }
        ]);
      }
      setLoading(false);
    }, () => setLoading(false));

    return () => {
      unsubProducts();
      unsubCustomers();
      unsubSales();
    };
  }, [store?.id]);

  // Global Keyboard Shortcut: Cmd+K / Ctrl+K / '/'
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is already typing in an input/textarea (unless pressing Cmd+K)
      const target = e.target as HTMLElement;
      const isInput = target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable;

      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setIsOpen((prev) => !prev);
      } else if (e.key === '/' && !isInput) {
        e.preventDefault();
        setIsOpen(true);
      } else if (e.key === 'Escape' && isOpen) {
        setIsOpen(false);
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen]);

  // Auto-focus input on open
  useEffect(() => {
    if (isOpen) {
      setTimeout(() => {
        inputRef.current?.focus();
        inputRef.current?.select();
      }, 50);
    } else {
      setSearchTerm('');
      setSelectedIndex(0);
    }
  }, [isOpen]);

  // Save recent search
  const saveRecentSearch = useCallback((term: string) => {
    if (!term.trim()) return;
    setRecentSearches(prev => {
      const filtered = prev.filter(s => s.toLowerCase() !== term.toLowerCase());
      const updated = [term, ...filtered].slice(0, 6);
      try {
        localStorage.setItem(`mobistore_recent_searches_${store?.id || 'default'}`, JSON.stringify(updated));
      } catch (err) {
        console.error('Error saving recent searches', err);
      }
      return updated;
    });
  }, [store?.id]);

  // Unified Search Computation
  const searchResults = useMemo<SearchResultItem[]>(() => {
    const queryTerm = searchTerm.trim().toLowerCase();
    const results: SearchResultItem[] = [];

    // Helper: fuzzy or substring score
    const getScore = (text: string | undefined | null, query: string, weight = 1): number => {
      if (!text) return 0;
      const lower = text.toLowerCase();
      if (lower === query) return 100 * weight;
      if (lower.startsWith(query)) return 50 * weight;
      if (lower.includes(query)) return 25 * weight;
      return 0;
    };

    // If no query, return top contextual shortcuts & recommendations
    if (!queryTerm) {
      return [
        {
          id: 'action-pos',
          type: 'action',
          title: 'Open Point of Sale (POS)',
          subtitle: 'Start a new checkout transaction or scan barcodes',
          icon: ShoppingBag,
          metaBadge: 'POS',
          badgeColor: 'bg-emerald-100 text-emerald-800',
          rawItem: { route: '/pos' },
          score: 99
        },
        {
          id: 'action-new-product',
          type: 'action',
          title: 'Inventory & Stock Catalog',
          subtitle: 'View, filter or add items to your store inventory',
          icon: Package,
          metaBadge: 'Products',
          badgeColor: 'bg-blue-100 text-blue-800',
          rawItem: { route: '/products' },
          score: 98
        },
        {
          id: 'action-sales',
          type: 'action',
          title: 'Sales & Invoices History',
          subtitle: 'Search all receipts, customer purchases and transactions',
          icon: Receipt,
          metaBadge: 'Sales',
          badgeColor: 'bg-purple-100 text-purple-800',
          rawItem: { route: '/sales' },
          score: 97
        },
        {
          id: 'action-customers',
          type: 'action',
          title: 'Customer Directory & Debts',
          subtitle: 'Manage client profiles, loyalty points and receivables',
          icon: Users,
          metaBadge: 'Customers',
          badgeColor: 'bg-amber-100 text-amber-800',
          rawItem: { route: '/customers' },
          score: 96
        }
      ];
    }

    // 1. Search Products
    if (activeCategory === 'all' || activeCategory === 'products') {
      products.forEach((prod) => {
        let maxScore = 0;
        maxScore = Math.max(maxScore, getScore(prod.name, queryTerm, 2.0));
        maxScore = Math.max(maxScore, getScore(prod.model, queryTerm, 1.8));
        maxScore = Math.max(maxScore, getScore(prod.brand, queryTerm, 1.5));
        maxScore = Math.max(maxScore, getScore(prod.barcode, queryTerm, 2.5));
        maxScore = Math.max(maxScore, getScore(prod.sku, queryTerm, 2.0));
        maxScore = Math.max(maxScore, getScore(prod.category, queryTerm, 1.0));
        
        // Search IMEIs
        if (prod.imeis && prod.imeis.length > 0) {
          prod.imeis.forEach(imei => {
            maxScore = Math.max(maxScore, getScore(imei, queryTerm, 2.2));
          });
        }

        if (maxScore > 0) {
          const isLowStock = (prod.stock ?? 0) <= 3;
          results.push({
            id: `prod-${prod.id}`,
            type: 'product',
            title: prod.name,
            subtitle: `${prod.brand || ''} • Stock: ${prod.stock ?? 0} units • SKU: ${prod.sku || prod.barcode || 'N/A'}`,
            metaBadge: `$${prod.sellingPrice?.toLocaleString() ?? 0}`,
            badgeColor: isLowStock ? 'bg-rose-100 text-rose-800 font-bold' : 'bg-emerald-100 text-emerald-800 font-bold',
            icon: Package,
            rawItem: prod,
            score: maxScore + 5
          });
        }
      });
    }

    // 2. Search Customers
    if (activeCategory === 'all' || activeCategory === 'customers') {
      customers.forEach((cust) => {
        let maxScore = 0;
        maxScore = Math.max(maxScore, getScore(cust.name, queryTerm, 2.0));
        maxScore = Math.max(maxScore, getScore(cust.phone, queryTerm, 2.5));
        maxScore = Math.max(maxScore, getScore(cust.address, queryTerm, 1.2));
        maxScore = Math.max(maxScore, getScore(cust.id, queryTerm, 1.0));

        if (maxScore > 0) {
          const debt = cust.debt || 0;
          results.push({
            id: `cust-${cust.id}`,
            type: 'customer',
            title: cust.name,
            subtitle: `${cust.phone || 'No phone'} • ${cust.address || 'No address'} • Loyalty: ${cust.loyaltyPoints || 0} pts`,
            metaBadge: debt > 0 ? `Debt: $${debt}` : `${(cust.tier || 'bronze').toUpperCase()}`,
            badgeColor: debt > 0 ? 'bg-amber-100 text-amber-800 font-bold' : 'bg-blue-100 text-blue-800 font-bold',
            icon: Users,
            rawItem: cust,
            score: maxScore + 3
          });
        }
      });
    }

    // 3. Search Invoices & Sales
    if (activeCategory === 'all' || activeCategory === 'invoices') {
      sales.forEach((sale) => {
        let maxScore = 0;
        const shortId = sale.id?.slice(0, 8).toUpperCase() || '';
        const invoiceNum = sale.invoiceNumber || `INV-${shortId}`;
        
        maxScore = Math.max(maxScore, getScore(sale.id, queryTerm, 2.5));
        maxScore = Math.max(maxScore, getScore(shortId, queryTerm, 2.5));
        maxScore = Math.max(maxScore, getScore(invoiceNum, queryTerm, 2.5));
        maxScore = Math.max(maxScore, getScore(sale.customerName, queryTerm, 2.0));
        maxScore = Math.max(maxScore, getScore(sale.customerPhone, queryTerm, 2.0));
        maxScore = Math.max(maxScore, getScore(sale.paymentMethod, queryTerm, 1.0));
        maxScore = Math.max(maxScore, getScore(sale.cashierName, queryTerm, 1.2));

        // Search items in invoice
        if (sale.items && sale.items.length > 0) {
          sale.items.forEach(item => {
            maxScore = Math.max(maxScore, getScore(item.name, queryTerm, 1.5));
            maxScore = Math.max(maxScore, getScore(item.barcode, queryTerm, 1.8));
          });
        }

        if (maxScore > 0) {
          const dateStr = sale.createdAt ? new Date(sale.createdAt).toLocaleDateString(undefined, {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }) : 'Recent';
          
          results.push({
            id: `sale-${sale.id}`,
            type: 'invoice',
            title: `#${invoiceNum} - ${sale.customerName || 'Walk-in Customer'}`,
            subtitle: `${dateStr} • ${sale.items?.length || 1} item(s) • Paid via ${(sale.paymentMethod || 'cash').toUpperCase()}`,
            metaBadge: `$${sale.total?.toLocaleString() ?? 0}`,
            badgeColor: 'bg-purple-100 text-purple-800 font-bold',
            icon: Receipt,
            rawItem: sale,
            score: maxScore + 2
          });
        }
      });
    }

    return results.sort((a, b) => b.score - a.score);
  }, [searchTerm, activeCategory, products, customers, sales]);

  // Handle Result Item Selection
  const handleSelectItem = (item: SearchResultItem) => {
    if (searchTerm.trim()) {
      saveRecentSearch(searchTerm.trim());
    }

    if (item.type === 'action') {
      setIsOpen(false);
      navigate(item.rawItem.route);
      return;
    }

    if (item.type === 'invoice') {
      setSelectedInvoice(item.rawItem);
      return;
    }

    if (item.type === 'product') {
      setSelectedProduct(item.rawItem);
      return;
    }

    if (item.type === 'customer') {
      setSelectedCustomer(item.rawItem);
      return;
    }
  };

  // Keyboard navigation inside result list
  const handleInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setSelectedIndex(prev => (prev < searchResults.length - 1 ? prev + 1 : 0));
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setSelectedIndex(prev => (prev > 0 ? prev - 1 : searchResults.length - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (searchResults[selectedIndex]) {
        handleSelectItem(searchResults[selectedIndex]);
      }
    }
  };

  // Scroll active item into view
  useEffect(() => {
    if (listRef.current) {
      const activeEl = listRef.current.querySelector(`[data-index="${selectedIndex}"]`) as HTMLElement;
      if (activeEl) {
        activeEl.scrollIntoView({ block: 'nearest' });
      }
    }
  }, [selectedIndex]);

  // Reset selected index when query changes
  useEffect(() => {
    setSelectedIndex(0);
  }, [searchTerm, activeCategory]);

  return (
    <>
      {/* ----------------- Header Search Bar Trigger ----------------- */}
      <div className="relative flex-1 max-w-xs sm:max-w-md md:max-w-lg lg:max-w-xl mx-2">
        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className={cn(
            "w-full flex items-center justify-between gap-3 px-3.5 py-2 rounded-2xl bg-gray-100/90 hover:bg-gray-100 text-gray-500 border border-gray-200/80 hover:border-blue-400 focus:outline-none focus:ring-2 focus:ring-blue-500/20 text-xs transition-all shadow-2xs group cursor-pointer",
            isRTL && "flex-row-reverse text-right"
          )}
        >
          <div className={cn("flex items-center gap-2.5 min-w-0", isRTL && "flex-row-reverse")}>
            <Search className="w-4 h-4 text-gray-400 group-hover:text-blue-600 transition-colors flex-shrink-0" />
            <span className="truncate text-gray-500 group-hover:text-gray-900 font-medium">
              {t('global_search_placeholder', 'Search products, customers, invoices...')}
            </span>
          </div>

          <div className={cn("flex items-center gap-1.5 flex-shrink-0", isRTL && "flex-row-reverse")}>
            <kbd className="hidden sm:inline-flex items-center gap-0.5 px-2 py-0.5 text-[10px] font-black text-gray-500 bg-white border border-gray-300/80 rounded-lg shadow-2xs group-hover:border-blue-300">
              <Command className="w-2.5 h-2.5" /> K
            </kbd>
            <kbd className="sm:hidden px-1.5 py-0.5 text-[10px] font-black text-gray-400 bg-white border border-gray-200 rounded">
              /
            </kbd>
          </div>
        </button>
      </div>

      {/* ----------------- Unified Global Search Modal ----------------- */}
      <AnimatePresence>
        {isOpen && (
          <div className="fixed inset-0 z-50 flex items-start justify-center pt-12 sm:pt-20 px-4">
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity"
            />

            {/* Dialog Container */}
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: -10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.96, y: -10 }}
              transition={{ duration: 0.16 }}
              className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-gray-100 overflow-hidden z-10 flex flex-col max-h-[82vh]"
            >
              {/* Header Input Area */}
              <div className="p-4 border-b border-gray-100 bg-white sticky top-0 z-10">
                <div className={cn("flex items-center gap-3 px-3 py-2 bg-gray-50 rounded-2xl border border-gray-200 focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20 transition-all", isRTL && "flex-row-reverse")}>
                  <Search className="w-5 h-5 text-gray-400 flex-shrink-0" />
                  <input
                    ref={inputRef}
                    type="text"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    placeholder="Search by product name, IMEI, barcode, customer phone, invoice #..."
                    className={cn("w-full bg-transparent text-sm font-semibold text-gray-900 placeholder:text-gray-400 outline-none", isRTL && "text-right")}
                  />
                  {searchTerm && (
                    <button
                      onClick={() => setSearchTerm('')}
                      className="p-1 rounded-lg text-gray-400 hover:text-gray-700 hover:bg-gray-200/60"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  )}
                  <button
                    onClick={() => setIsOpen(false)}
                    className="text-[11px] font-black uppercase tracking-wider text-gray-400 hover:text-gray-700 px-2 py-1 bg-white border border-gray-200 rounded-lg shadow-2xs"
                  >
                    ESC
                  </button>
                </div>

                {/* Category Pills & Filters */}
                <div className={cn("flex items-center gap-1.5 mt-3 overflow-x-auto custom-scrollbar pb-1", isRTL && "flex-row-reverse")}>
                  {[
                    { id: 'all', label: 'All Results', icon: Layers, count: searchResults.length },
                    { id: 'products', label: 'Products', icon: Package, count: products.length },
                    { id: 'customers', label: 'Customers', icon: Users, count: customers.length },
                    { id: 'invoices', label: 'Invoices & Sales', icon: Receipt, count: sales.length }
                  ].map(tab => (
                    <button
                      key={tab.id}
                      onClick={() => setActiveCategory(tab.id as SearchCategory)}
                      className={cn(
                        "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold whitespace-nowrap transition-all border",
                        activeCategory === tab.id
                          ? "bg-slate-900 text-white border-slate-900 shadow-xs"
                          : "bg-gray-50 text-gray-600 border-gray-200/80 hover:bg-gray-100"
                      )}
                    >
                      <tab.icon className="w-3.5 h-3.5 opacity-80" />
                      <span>{tab.label}</span>
                      {searchTerm && (
                        <span className={cn("text-[10px] px-1.5 py-0.2 rounded-full font-black", activeCategory === tab.id ? "bg-white/20 text-white" : "bg-gray-200 text-gray-700")}>
                          {tab.id === 'all' ? searchResults.length : searchResults.filter(r => r.type === tab.id.slice(0, -1) || (tab.id === 'invoices' && r.type === 'invoice')).length}
                        </span>
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* Search Results Body */}
              <div ref={listRef} className="flex-1 overflow-y-auto p-3 space-y-1 custom-scrollbar">
                {/* Recent Searches Header if no search term */}
                {!searchTerm && recentSearches.length > 0 && (
                  <div className="px-3 pt-2 pb-1.5">
                    <div className="flex items-center justify-between text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
                      <span className="flex items-center gap-1.5">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        Recent Searches
                      </span>
                      <button 
                        onClick={() => {
                          setRecentSearches([]);
                          localStorage.removeItem(`mobistore_recent_searches_${store?.id || 'default'}`);
                        }}
                        className="text-gray-400 hover:text-rose-600 lowercase text-[10px] hover:underline"
                      >
                        clear
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-1.5 mb-3">
                      {recentSearches.map(term => (
                        <button
                          key={term}
                          onClick={() => setSearchTerm(term)}
                          className="px-2.5 py-1 bg-gray-100 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 text-gray-700 text-xs font-semibold rounded-lg border border-gray-200/60 transition-all flex items-center gap-1"
                        >
                          <Search className="w-3 h-3 opacity-50" />
                          <span>{term}</span>
                        </button>
                      ))}
                    </div>
                    <div className="text-[11px] font-black uppercase tracking-wider text-gray-400 mb-2">
                      Quick Shortcuts & Navigation
                    </div>
                  </div>
                )}

                {/* Results List */}
                {searchResults.length > 0 ? (
                  searchResults.map((item, idx) => {
                    const isSelected = idx === selectedIndex;
                    const ItemIcon = item.icon;

                    return (
                      <div
                        key={item.id}
                        data-index={idx}
                        onClick={() => handleSelectItem(item)}
                        onMouseEnter={() => setSelectedIndex(idx)}
                        className={cn(
                          "w-full flex items-center justify-between p-3 rounded-2xl cursor-pointer transition-all text-left group",
                          isSelected
                            ? "bg-blue-50/90 border border-blue-200 text-blue-950 shadow-xs"
                            : "hover:bg-gray-50 border border-transparent text-gray-800",
                          isRTL && "flex-row-reverse text-right"
                        )}
                      >
                        <div className={cn("flex items-center gap-3.5 min-w-0", isRTL && "flex-row-reverse")}>
                          <div className={cn(
                            "w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-colors",
                            item.type === 'product' && "bg-blue-100 text-blue-700",
                            item.type === 'customer' && "bg-amber-100 text-amber-700",
                            item.type === 'invoice' && "bg-purple-100 text-purple-700",
                            item.type === 'action' && "bg-emerald-100 text-emerald-700"
                          )}>
                            <ItemIcon className="w-5 h-5" />
                          </div>

                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-2">
                              <span className="font-bold text-sm text-gray-900 group-hover:text-blue-600 transition-colors truncate">
                                {item.title}
                              </span>
                              {item.metaBadge && (
                                <span className={cn("text-[10px] px-2 py-0.5 rounded-md flex-shrink-0", item.badgeColor)}>
                                  {item.metaBadge}
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-gray-500 truncate mt-0.5">
                              {item.subtitle}
                            </p>
                          </div>
                        </div>

                        <div className={cn("flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0", isSelected && "opacity-100")}>
                          <span className="text-[10px] font-bold text-gray-400 hidden sm:inline">Press Enter</span>
                          <div className="p-1 rounded-lg bg-white border border-gray-200 shadow-2xs text-gray-500">
                            <CornerDownLeft className="w-3.5 h-3.5" />
                          </div>
                        </div>
                      </div>
                    );
                  })
                ) : (
                  <div className="py-16 text-center px-4">
                    <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                      <Search className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-bold text-gray-800">No results found for "{searchTerm}"</p>
                    <p className="text-xs text-gray-400 mt-1 max-w-sm mx-auto">
                      Try searching with a product SKU, barcode number, customer phone number, or invoice ID.
                    </p>
                  </div>
                )}
              </div>

              {/* Footer Meta & RLS Indicator */}
              <div className="p-3 bg-gray-50/80 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                  <span className="font-bold text-gray-700 truncate max-w-[200px]">{store?.name || 'MobiStore Store'}</span>
                  <span className="text-[9px] font-black uppercase px-1.5 py-0.5 bg-blue-100 text-blue-700 rounded">
                    RLS Tenant Isolated
                  </span>
                </div>

                <div className="hidden sm:flex items-center gap-3 text-gray-400">
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[9px]">↑</kbd>
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[9px]">↓</kbd> to navigate
                  </span>
                  <span className="flex items-center gap-1">
                    <kbd className="px-1.5 py-0.5 bg-white border border-gray-200 rounded font-mono text-[9px]">↵</kbd> to select
                  </span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- Detail Modal 1: Invoice / Sale Receipt ----------------- */}
      <AnimatePresence>
        {selectedInvoice && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col max-h-[90vh]"
            >
              {/* Receipt Header */}
              <div className="p-5 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/10 flex items-center justify-center font-bold text-white">
                    <Receipt className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base leading-tight">
                      Invoice #{selectedInvoice.invoiceNumber || selectedInvoice.id.slice(0, 8).toUpperCase()}
                    </h3>
                    <p className="text-xs text-indigo-200 mt-0.5">
                      {selectedInvoice.createdAt ? new Date(selectedInvoice.createdAt).toLocaleString() : 'Recent Transaction'}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedInvoice(null)}
                  className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Receipt Details Body */}
              <div className="p-6 overflow-y-auto space-y-5 text-xs text-gray-700 custom-scrollbar">
                {/* Store & Customer Info */}
                <div className="grid grid-cols-2 gap-4 p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Customer</p>
                    <p className="font-bold text-gray-900 text-sm mt-0.5">{selectedInvoice.customerName || 'Walk-in Customer'}</p>
                    {selectedInvoice.customerPhone && (
                      <p className="text-gray-500 mt-0.5 flex items-center gap-1">
                        <Phone className="w-3 h-3" /> {selectedInvoice.customerPhone}
                      </p>
                    )}
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Branch & Cashier</p>
                    <p className="font-bold text-gray-900 mt-0.5">{selectedInvoice.branchName || store?.name || 'Main Branch'}</p>
                    <p className="text-gray-500 mt-0.5">Attendant: {selectedInvoice.cashierName || 'Store Staff'}</p>
                  </div>
                </div>

                {/* Items Table */}
                <div>
                  <h4 className="font-bold text-gray-900 text-xs mb-2">Purchased Items</h4>
                  <div className="border border-gray-200 rounded-2xl overflow-hidden divide-y divide-gray-100">
                    <div className="grid grid-cols-12 bg-gray-50 p-2.5 font-bold text-gray-400 text-[10px] uppercase tracking-wider">
                      <span className="col-span-6">Item</span>
                      <span className="col-span-2 text-center">Qty</span>
                      <span className="col-span-2 text-right">Price</span>
                      <span className="col-span-2 text-right">Subtotal</span>
                    </div>
                    {(selectedInvoice.items && selectedInvoice.items.length > 0) ? (
                      selectedInvoice.items.map((item, i) => (
                        <div key={i} className="grid grid-cols-12 p-3 text-xs items-center hover:bg-gray-50/50">
                          <div className="col-span-6 font-bold text-gray-800">
                            <p className="truncate">{item.name}</p>
                            {item.barcode && <p className="text-[10px] text-gray-400 font-mono">Barcode: {item.barcode}</p>}
                            {item.imei && <p className="text-[10px] text-indigo-600 font-mono">IMEI: {item.imei}</p>}
                          </div>
                          <div className="col-span-2 text-center font-bold text-gray-600">{item.quantity}</div>
                          <div className="col-span-2 text-right font-medium text-gray-600">${item.price}</div>
                          <div className="col-span-2 text-right font-black text-gray-900">${(item.subtotal || item.quantity * item.price)}</div>
                        </div>
                      ))
                    ) : (
                      <div className="p-4 text-center text-gray-400">Items summary details stored</div>
                    )}
                  </div>
                </div>

                {/* Financial Breakdown */}
                <div className="p-4 bg-slate-50 rounded-2xl space-y-2 border border-slate-200/70">
                  <div className="flex justify-between text-gray-600">
                    <span>Payment Method:</span>
                    <span className="font-black uppercase tracking-wider text-slate-800">{selectedInvoice.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between text-gray-600">
                    <span>Subtotal:</span>
                    <span className="font-bold">${selectedInvoice.subtotal ?? selectedInvoice.total}</span>
                  </div>
                  {Number(selectedInvoice.discount || 0) > 0 && (
                    <div className="flex justify-between text-emerald-600">
                      <span>Discount Applied:</span>
                      <span className="font-bold">-${selectedInvoice.discount}</span>
                    </div>
                  )}
                  <div className="border-t border-slate-200 pt-2 flex justify-between text-sm font-black text-slate-900">
                    <span>Total Paid:</span>
                    <span className="text-blue-600 text-base">${selectedInvoice.total}</span>
                  </div>
                </div>

                {selectedInvoice.notes && (
                  <p className="text-gray-500 italic bg-amber-50/60 p-3 rounded-xl border border-amber-200/50 text-[11px]">
                    Note: {selectedInvoice.notes}
                  </p>
                )}
              </div>

              {/* Receipt Footer Actions */}
              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => window.print()}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl text-xs font-bold text-gray-700 shadow-2xs transition-all"
                >
                  <Printer className="w-4 h-4" /> Print Invoice
                </button>
                <button
                  onClick={() => {
                    setSelectedInvoice(null);
                    setIsOpen(false);
                    navigate('/sales');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-blue-500/20 transition-all"
                >
                  <span>View All Invoices</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- Detail Modal 2: Product Quick Inspector ----------------- */}
      <AnimatePresence>
        {selectedProduct && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white">
                    <Package className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base leading-tight truncate max-w-[240px]">{selectedProduct.name}</h3>
                    <p className="text-xs text-slate-300">{selectedProduct.brand || 'Brand'} • {selectedProduct.category || 'Category'}</p>
                  </div>
                </div>
                <button onClick={() => setSelectedProduct(null)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Retail Price</p>
                    <p className="text-xl font-black text-blue-600 mt-0.5">${selectedProduct.sellingPrice?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Wholesale Cost</p>
                    <p className="text-xl font-black text-gray-700 mt-0.5">
                      {hasPermission('products:view_cost_price') ? `$${selectedProduct.purchasePrice?.toLocaleString()}` : '••••'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-blue-50/50 rounded-2xl border border-blue-100 space-y-2 text-gray-700">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Available Stock:</span>
                    <span className={cn("font-bold", (selectedProduct.stock ?? 0) <= 3 ? "text-rose-600" : "text-emerald-700")}>
                      {selectedProduct.stock ?? 0} units
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">SKU Code:</span>
                    <span className="font-mono font-bold text-gray-800">{selectedProduct.sku || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Barcode:</span>
                    <span className="font-mono font-bold text-gray-800">{selectedProduct.barcode || 'N/A'}</span>
                  </div>
                  {selectedProduct.imeis && selectedProduct.imeis.length > 0 && (
                    <div className="pt-2 border-t border-blue-100">
                      <span className="text-gray-500 block mb-1">Tracked IMEIs ({selectedProduct.imeis.length}):</span>
                      <div className="flex flex-wrap gap-1 max-h-20 overflow-y-auto">
                        {selectedProduct.imeis.map((imei, i) => (
                          <span key={i} className="px-2 py-0.5 bg-white border border-blue-200 rounded text-[10px] font-mono font-bold text-blue-800">
                            {imei}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsOpen(false);
                    navigate('/pos');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  <ShoppingBag className="w-4 h-4" /> Open in POS
                </button>
                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    setIsOpen(false);
                    navigate('/products');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  <span>Inventory Catalog</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- Detail Modal 3: Customer Quick Profile ----------------- */}
      <AnimatePresence>
        {selectedCustomer && (
          <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-md overflow-hidden flex flex-col"
            >
              <div className="p-5 bg-amber-600 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-white/20 flex items-center justify-center font-bold text-white">
                    <Users className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base leading-tight truncate max-w-[240px]">{selectedCustomer.name}</h3>
                    <p className="text-xs text-amber-100 capitalize">{selectedCustomer.tier || 'bronze'} Member</p>
                  </div>
                </div>
                <button onClick={() => setSelectedCustomer(null)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-amber-50 p-3.5 rounded-2xl border border-amber-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-amber-600">Loyalty Points</p>
                    <p className="text-xl font-black text-amber-900 mt-0.5">{selectedCustomer.loyaltyPoints || 0} pts</p>
                  </div>
                  <div className="bg-rose-50 p-3.5 rounded-2xl border border-rose-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-rose-600">Receivable Debt</p>
                    <p className="text-xl font-black text-rose-900 mt-0.5">${selectedCustomer.debt || 0}</p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-2.5 text-gray-700">
                  <div className="flex items-center gap-2">
                    <Phone className="w-4 h-4 text-gray-400" />
                    <span className="font-bold text-gray-800">{selectedCustomer.phone || 'No phone number'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-gray-400" />
                    <span className="text-gray-600">{selectedCustomer.address || 'No address registered'}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <Award className="w-4 h-4 text-amber-500" />
                    <span className="text-gray-600 capitalize">Tier: {selectedCustomer.tier || 'bronze'} • Lifetime: ${selectedCustomer.totalSpent || 0}</span>
                  </div>
                </div>
              </div>

              <div className="p-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between gap-3">
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setIsOpen(false);
                    navigate('/sms');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-bold shadow-2xs"
                >
                  Send SMS
                </button>
                <button
                  onClick={() => {
                    setSelectedCustomer(null);
                    setIsOpen(false);
                    navigate('/customers');
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-amber-600 hover:bg-amber-700 text-white rounded-xl text-xs font-bold shadow-sm"
                >
                  <span>Customer Profile</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
