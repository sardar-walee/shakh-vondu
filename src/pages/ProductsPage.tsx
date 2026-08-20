import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useStore } from '../contexts/StoreContext';
import { usePermissions } from '../contexts/PermissionsContext';
import { useBackup } from '../contexts/BackupContext';
import PermissionGate from '../components/auth/PermissionGate';
import Pagination from '../components/common/Pagination';
import { useTranslation } from 'react-i18next';
import { 
  Plus, 
  Search, 
  Filter, 
  Smartphone, 
  MoreVertical, 
  Edit2, 
  Trash2, 
  Truck, 
  DollarSign, 
  Lock, 
  Download,
  Barcode,
  ShoppingBag,
  Eye,
  X,
  Check,
  AlertTriangle,
  Layers,
  Sparkles,
  ChevronRight,
  Hash
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { Product } from '../types';
import { exportProductsToCSV } from '../lib/dataMigration';
import ProductCsvImportModal from '../components/migration/ProductCsvImportModal';
import QrGeneratorModal from '../components/pos/QrGeneratorModal';
import { 
  SUPERMARKET_BRANDS, 
  CLOTHING_SIZES, 
  CLOTHING_COLORS, 
  CLOTHING_BRANDS, 
  PHARMACY_DOSAGES,
  PresetProductItem 
} from '../data/presetCatalogs';
import { QrCode } from 'lucide-react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

const CATEGORIES = ['All', 'Smartphones', 'Tablets', 'Audio & Sound', 'Accessories', 'Smartwatches', 'Repairs & Parts'];

export default function ProductsPage() {
  const { t, i18n } = useTranslation();
  const { store } = useStore();
  const { hasPermission } = usePermissions();
  const { exportCollection, isExporting } = useBackup();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [selectedBrand, setSelectedBrand] = useState('All');
  const [stockFilter, setStockFilter] = useState<'all' | 'low_stock' | 'out_of_stock' | 'in_stock'>('all');

  // Handle URL param (e.g. ?filter=low_stock)
  useEffect(() => {
    const filterParam = searchParams.get('filter');
    if (filterParam === 'low_stock') {
      setStockFilter('low_stock');
    }
  }, [searchParams]);

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modals
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [isImportModalOpen, setIsImportModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);
  const [deletingProduct, setDeletingProduct] = useState<Product | null>(null);
  const [previewProduct, setPreviewProduct] = useState<Product | null>(null);

  // Form State
  const [formData, setFormData] = useState({
    name: '',
    brand: '',
    model: '',
    category: 'General',
    sellingPrice: 0,
    purchasePrice: 0,
    stock: 0,
    barcode: '',
    sku: '',
    imeisInput: '',
    hasImei: true,
    clothingSize: '',
    clothingColor: '',
    weightOrSize: '',
    activeIngredient: ''
  });

  const [selectedBrandPreset, setSelectedBrandPreset] = useState<string>('all');
  const [qrModalProduct, setQrModalProduct] = useState<Product | null>(null);

  // Fetch Products from Firestore
  useEffect(() => {
    if (!store?.id) return;
    setLoading(true);

    const q = query(collection(db, `stores/${store.id}/products`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Product));
      if (data.length > 0) {
        setProducts(data);
      } else {
        // Sample baseline data for demo store
        const sampleProducts: Product[] = [
          { id: 'p1', name: 'iPhone 15 Pro Max 256GB Titanium', brand: 'Apple', model: 'A3106', category: 'Smartphones', sellingPrice: 1199, purchasePrice: 980, stock: 12, barcode: '195949012345', sku: 'APL-IP15PM-256', imeis: ['352981098765432', '352981098765433'] },
          { id: 'p2', name: 'Samsung Galaxy S24 Ultra 512GB', brand: 'Samsung', model: 'SM-S928B', category: 'Smartphones', sellingPrice: 1249, purchasePrice: 1020, stock: 3, barcode: '880609512345', sku: 'SAM-S24U-512', imeis: ['358741098123456'] },
          { id: 'p3', name: 'AirPods Pro 2nd Gen (USB-C)', brand: 'Apple', model: 'MTJV3', category: 'Audio & Sound', sellingPrice: 249, purchasePrice: 190, stock: 24, barcode: '195949567890', sku: 'APL-APP2-USBC' },
          { id: 'p4', name: 'Anker 65W GaN Fast Charger', brand: 'Anker', model: 'A2663', category: 'Accessories', sellingPrice: 45, purchasePrice: 28, stock: 45, barcode: '848061054321', sku: 'ANK-GAN-65W' },
          { id: 'p5', name: 'iPad Air M2 11-inch 128GB Wi-Fi', brand: 'Apple', model: 'A2902', category: 'Tablets', sellingPrice: 599, purchasePrice: 490, stock: 2, barcode: '195949887766', sku: 'APL-IPADAIR-M2' },
          { id: 'p6', name: 'Xiaomi 14 Ultra 512GB Photography Kit', brand: 'Xiaomi', model: '24030PN60G', category: 'Smartphones', sellingPrice: 1099, purchasePrice: 890, stock: 5, barcode: '694181275432', sku: 'XIA-14U-512' },
          { id: 'p7', name: 'Apple Watch Series 9 45mm Midnight', brand: 'Apple', model: 'MR993', category: 'Smartwatches', sellingPrice: 429, purchasePrice: 340, stock: 7, barcode: '195949112233', sku: 'APL-AW9-45' },
          { id: 'p8', name: 'Samsung Galaxy Buds2 Pro Graphite', brand: 'Samsung', model: 'SM-R510', category: 'Audio & Sound', sellingPrice: 179, purchasePrice: 130, stock: 15, barcode: '880609443322', sku: 'SAM-BUDS2P' },
          { id: 'p9', name: 'Original iPhone 15 OLED Screen Replacement', brand: 'Apple', model: 'SCR-IP15', category: 'Repairs & Parts', sellingPrice: 140, purchasePrice: 95, stock: 8, barcode: '772819283746', sku: 'REP-IP15-OLED' },
          { id: 'p10', name: 'MagSafe 15W Wireless Power Bank 10,000mAh', brand: 'Anker', model: 'A1611', category: 'Accessories', sellingPrice: 55, purchasePrice: 35, stock: 19, barcode: '848061099887', sku: 'ANK-MAG-10K' },
          { id: 'p11', name: 'Google Pixel 8 Pro 128GB Bay Blue', brand: 'Google', model: 'GC3VE', category: 'Smartphones', sellingPrice: 899, purchasePrice: 720, stock: 4, barcode: '842776109876', sku: 'GOO-PX8P-128' },
          { id: 'p12', name: 'Sony WH-1000XM5 Noise Canceling Headphones', brand: 'Sony', model: 'WH1000XM5', category: 'Audio & Sound', sellingPrice: 399, purchasePrice: 310, stock: 6, barcode: '454873613256', sku: 'SNY-XM5-BLK' }
        ];
        setProducts(sampleProducts);
      }
      setLoading(false);
    });

    return () => unsubscribe();
  }, [store?.id]);

  // Unique Brands
  const availableBrands = useMemo(() => {
    const brands = new Set<string>();
    products.forEach(p => { if (p.brand) brands.add(p.brand); });
    return ['All', ...Array.from(brands)];
  }, [products]);

  // Filtered Products
  const filteredProducts = useMemo(() => {
    return products.filter(p => {
      // 1. Search text
      const term = searchTerm.toLowerCase().trim();
      const matchSearch = !term || 
        p.name.toLowerCase().includes(term) ||
        p.brand?.toLowerCase().includes(term) ||
        p.model?.toLowerCase().includes(term) ||
        p.barcode?.toLowerCase().includes(term) ||
        p.sku?.toLowerCase().includes(term) ||
        (p.imeis && p.imeis.some(imei => imei.includes(term)));

      // 2. Category
      const matchCat = selectedCategory === 'All' || p.category?.toLowerCase() === selectedCategory.toLowerCase();

      // 3. Brand
      const matchBrand = selectedBrand === 'All' || p.brand?.toLowerCase() === selectedBrand.toLowerCase();

      // 4. Stock Level
      let matchStock = true;
      const st = p.stock ?? 0;
      if (stockFilter === 'low_stock') matchStock = st > 0 && st <= 3;
      else if (stockFilter === 'out_of_stock') matchStock = st === 0;
      else if (stockFilter === 'in_stock') matchStock = st > 0;

      return matchSearch && matchCat && matchBrand && matchStock;
    });
  }, [products, searchTerm, selectedCategory, selectedBrand, stockFilter]);

  // Paginated Slices
  const totalPages = Math.ceil(filteredProducts.length / pageSize) || 1;
  const paginatedProducts = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredProducts.slice(start, start + pageSize);
  }, [filteredProducts, currentPage, pageSize]);

  // Reset page when filters change
  useEffect(() => {
    setCurrentPage(1);
  }, [searchTerm, selectedCategory, selectedBrand, stockFilter, pageSize]);

  // Handle Save / Edit Product
  const handleSaveProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id || !formData.name) return;

    const imeisArr = formData.imeisInput
      ? formData.imeisInput.split(/[\n,]+/).map(s => s.trim()).filter(Boolean)
      : [];

    const productPayload = {
      name: formData.name,
      brand: formData.brand,
      model: formData.model,
      category: formData.category,
      sellingPrice: Number(formData.sellingPrice) || 0,
      purchasePrice: Number(formData.purchasePrice) || 0,
      stock: Number(formData.stock) || 0,
      barcode: formData.barcode,
      sku: formData.sku,
      imeis: imeisArr,
      hasImei: imeisArr.length > 0,
      updatedAt: new Date().toISOString()
    };

    try {
      if (editingProduct?.id && !editingProduct.id.startsWith('p')) {
        await updateDoc(doc(db, `stores/${store.id}/products`, editingProduct.id), productPayload);
      } else if (editingProduct?.id) {
        // Update in-memory if sample
        setProducts(prev => prev.map(p => p.id === editingProduct.id ? { ...p, ...productPayload } : p));
      } else {
        await addDoc(collection(db, `stores/${store.id}/products`), {
          ...productPayload,
          createdAt: new Date().toISOString()
        });
      }

      setIsAddModalOpen(false);
      setEditingProduct(null);
      setFormData({
        name: '',
        brand: '',
        model: '',
        category: 'Smartphones',
        sellingPrice: 0,
        purchasePrice: 0,
        stock: 0,
        barcode: '',
        sku: '',
        imeisInput: '',
        hasImei: true
      });
    } catch (error) {
      console.error("Failed to save product:", error);
    }
  };

  // Handle Delete Product
  const handleDeleteProduct = async () => {
    if (!store?.id || !deletingProduct) return;
    try {
      if (deletingProduct.id && !deletingProduct.id.startsWith('p')) {
        await deleteDoc(doc(db, `stores/${store.id}/products`, deletingProduct.id));
      } else {
        setProducts(prev => prev.filter(p => p.id !== deletingProduct.id));
      }
      setDeletingProduct(null);
      if (previewProduct?.id === deletingProduct.id) {
        setPreviewProduct(null);
      }
    } catch (err) {
      console.error("Failed to delete product:", err);
    }
  };

  // Open Edit Form
  const openEditModal = (product: Product, e?: React.MouseEvent) => {
    e?.stopPropagation();
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      brand: product.brand || '',
      model: product.model || '',
      category: product.category || 'Smartphones',
      sellingPrice: product.sellingPrice || 0,
      purchasePrice: product.purchasePrice || 0,
      stock: product.stock || 0,
      barcode: product.barcode || '',
      sku: product.sku || '',
      imeisInput: product.imeis?.join('\n') || '',
      hasImei: !!product.hasImei
    });
    setIsAddModalOpen(true);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Header Title & Actions */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('products')}</h1>
              <span className="px-2.5 py-0.5 bg-blue-100 text-blue-800 rounded-full text-xs font-black">
                {products.length} {isRTL ? 'بەرهەم' : 'Items'}
              </span>
            </div>
            <p className="text-xs text-gray-500 font-medium mt-0.5">
              Device catalog, IMEI tracking, inventory stock levels and wholesale cost margins.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <button 
              onClick={() => exportProductsToCSV(products, `${store?.name || 'store'}_products_${new Date().toISOString().split('T')[0]}.csv`)}
              className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold transition-all shadow-xs text-xs cursor-pointer"
              title="Export Product Catalog to CSV / Excel"
            >
              <Download className="w-4 h-4 text-emerald-600" />
              <span>Export CSV</span>
            </button>

            <PermissionGate permission="products:create">
              <button 
                onClick={() => setIsImportModalOpen(true)}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 hover:bg-gray-50 px-3.5 py-2.5 rounded-xl font-bold transition-all shadow-xs text-xs cursor-pointer"
                title="Import Product Catalog from CSV File"
              >
                <Layers className="w-4 h-4 text-blue-600" />
                <span>Import CSV</span>
              </button>
            </PermissionGate>

            <PermissionGate permission="returns:view">
              <button 
                onClick={() => navigate('/supplier-returns')}
                className="flex items-center gap-2 bg-white border border-gray-200 text-gray-800 px-3.5 py-2.5 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-xs text-xs"
              >
                <Truck className="w-4 h-4 text-indigo-600" />
                <span>{t('supplier_returns')}</span>
              </button>
            </PermissionGate>

            <PermissionGate permission="products:create">
              <button 
                onClick={() => {
                  setEditingProduct(null);
                  setFormData({
                    name: '',
                    brand: '',
                    model: '',
                    category: 'Smartphones',
                    sellingPrice: 0,
                    purchasePrice: 0,
                    stock: 0,
                    barcode: '',
                    sku: '',
                    imeisInput: '',
                    hasImei: true
                  });
                  setIsAddModalOpen(true);
                }}
                className="flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2.5 rounded-xl font-bold text-xs uppercase tracking-wider shadow-lg shadow-blue-500/20 transition-all cursor-pointer"
              >
                <Plus className="w-4 h-4" />
                <span>{t('add_product')}</span>
              </button>
            </PermissionGate>
          </div>
        </div>

        {/* Category Filter Pills */}
        <div className="flex items-center gap-2 overflow-x-auto custom-scrollbar pb-1">
          {CATEGORIES.map((cat) => {
            const count = cat === 'All' 
              ? products.length 
              : products.filter(p => p.category?.toLowerCase() === cat.toLowerCase()).length;
            const isSelected = selectedCategory === cat;
            return (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={cn(
                  "flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all border cursor-pointer",
                  isSelected
                    ? "bg-slate-900 text-white border-slate-900 shadow-sm"
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                <span>{cat}</span>
                <span className={cn(
                  "text-[10px] px-1.5 py-0.2 rounded-full font-black",
                  isSelected ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                )}>
                  {count}
                </span>
              </button>
            );
          })}
        </div>

        {/* Search & Filter Bar */}
        <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
          <div className="w-full md:flex-1 relative">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input 
              type="text" 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Search by device name, brand, model, SKU, barcode, or IMEI..." 
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
            {/* Brand Dropdown */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="font-bold text-gray-400 text-[10px] uppercase">Brand:</span>
              <select
                value={selectedBrand}
                onChange={(e) => setSelectedBrand(e.target.value)}
                className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer"
              >
                {availableBrands.map(b => (
                  <option key={b} value={b}>{b}</option>
                ))}
              </select>
            </div>

            {/* Stock Level Filter */}
            <div className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 px-3 py-1.5 rounded-xl text-xs">
              <span className="font-bold text-gray-400 text-[10px] uppercase">Stock:</span>
              <select
                value={stockFilter}
                onChange={(e) => setStockFilter(e.target.value as any)}
                className="bg-transparent font-bold text-gray-800 outline-none cursor-pointer"
              >
                <option value="all">All Levels</option>
                <option value="in_stock">In Stock (&gt;0)</option>
                <option value="low_stock">Low Stock (≤3)</option>
                <option value="out_of_stock">Out of Stock (0)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Products Table Card with Pagination */}
        <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
          <div className="px-6 py-4 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
            <div className="flex items-center gap-2">
              <h3 className="font-black text-gray-900 text-sm">Inventory Directory</h3>
              <span className="text-xs text-gray-500">
                ({filteredProducts.length} matched)
              </span>
            </div>
            
            <div className="flex items-center gap-2">
              <PermissionGate permission="reports:export">
                <button 
                  onClick={() => exportCollection('products', 'csv')}
                  disabled={isExporting}
                  className="flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-blue-600 rounded-xl text-xs font-bold hover:bg-blue-50 transition-all shadow-2xs cursor-pointer disabled:opacity-50"
                >
                  <Download className="w-3.5 h-3.5" />
                  <span>{isExporting ? 'Exporting...' : 'Export CSV'}</span>
                </button>
              </PermissionGate>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-black tracking-widest border-b border-gray-100">
                  <th className="px-6 py-3.5">Product / Device</th>
                  <th className="px-6 py-3.5">Category</th>
                  <th className="px-6 py-3.5">Retail Price</th>
                  <th className="px-6 py-3.5">Cost / Margin</th>
                  <th className="px-6 py-3.5">Stock Level</th>
                  <th className="px-6 py-3.5 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100 text-sm">
                {paginatedProducts.length > 0 ? (
                  paginatedProducts.map((product) => {
                    const costPrice = product.purchasePrice || (product.sellingPrice * 0.78);
                    const margin = product.sellingPrice - costPrice;
                    const isLowStock = (product.stock ?? 0) <= 3 && (product.stock ?? 0) > 0;
                    const isOutOfStock = (product.stock ?? 0) === 0;

                    return (
                      <tr 
                        key={product.id} 
                        onClick={() => setPreviewProduct(product)}
                        className="hover:bg-blue-50/40 cursor-pointer transition-colors group"
                      >
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3.5">
                            <div className="w-10 h-10 bg-blue-50 border border-blue-100 rounded-2xl flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-colors text-blue-600">
                              <Smartphone className="w-5 h-5" />
                            </div>
                            <div className="min-w-0">
                              <p className="font-bold text-gray-900 group-hover:text-blue-600 transition-colors truncate max-w-xs">
                                {product.name}
                              </p>
                              <div className="flex items-center gap-2 mt-0.5 text-[11px] text-gray-400">
                                <span className="font-bold uppercase tracking-wider text-gray-600">{product.brand}</span>
                                {product.sku && <span className="font-mono">SKU: {product.sku}</span>}
                                {product.barcode && <span className="font-mono">BC: {product.barcode}</span>}
                              </div>
                            </div>
                          </div>
                        </td>

                        <td className="px-6 py-4">
                          <span className="px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-[10px] font-black uppercase tracking-wider border border-slate-200">
                            {product.category || 'General'}
                          </span>
                        </td>

                        <td className="px-6 py-4 font-black text-gray-900 text-sm">
                          ${product.sellingPrice?.toLocaleString()}
                        </td>

                        <td className="px-6 py-4">
                          <PermissionGate 
                            permission="products:view_cost_price" 
                            fallback={<span className="text-gray-300 font-mono text-xs">••••••</span>}
                          >
                            <div className="flex items-center gap-1.5 text-xs">
                              <span className="font-mono font-semibold text-gray-500">${costPrice.toFixed(0)}</span>
                              <span className="text-[10px] font-black text-emerald-700 bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                                +${margin.toFixed(0)}
                              </span>
                            </div>
                          </PermissionGate>
                        </td>

                        <td className="px-6 py-4">
                          <div className="flex items-center gap-2">
                            <span className={cn(
                              "w-2 h-2 rounded-full",
                              isOutOfStock ? "bg-red-500 animate-pulse" : isLowStock ? "bg-amber-500" : "bg-emerald-500"
                            )} />
                            <span className={cn(
                              "font-black text-xs",
                              isOutOfStock ? "text-red-600" : isLowStock ? "text-amber-700" : "text-gray-800"
                            )}>
                              {product.stock ?? 0} {isRTL ? 'دانە' : 'Units'}
                            </span>
                            {isLowStock && (
                              <span className="text-[9px] font-black uppercase px-1.5 py-0.2 bg-amber-100 text-amber-800 rounded">
                                Low
                              </span>
                            )}
                          </div>
                        </td>

                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end gap-1" onClick={(e) => e.stopPropagation()}>
                            <button
                              onClick={() => {
                                navigate('/pos');
                              }}
                              className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all"
                              title="Sell in POS"
                            >
                              <ShoppingBag className="w-4 h-4" />
                            </button>

                            <button
                              onClick={() => setPreviewProduct(product)}
                              className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                              title="View Details"
                            >
                              <Eye className="w-4 h-4" />
                            </button>

                            <PermissionGate permission="products:edit">
                              <button 
                                onClick={(e) => openEditModal(product, e)}
                                className="p-2 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-xl transition-all" 
                                title="Edit Product"
                              >
                                <Edit2 className="w-4 h-4" />
                              </button>
                            </PermissionGate>

                            <PermissionGate permission="products:delete">
                              <button 
                                onClick={(e) => {
                                  e.stopPropagation();
                                  setDeletingProduct(product);
                                }}
                                className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition-all" 
                                title="Delete Product"
                              >
                                <Trash2 className="w-4 h-4" />
                              </button>
                            </PermissionGate>
                          </div>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan={6} className="px-6 py-16 text-center text-gray-400 font-medium">
                      <div className="w-12 h-12 rounded-2xl bg-gray-100 flex items-center justify-center mx-auto mb-3 text-gray-400">
                        <Smartphone className="w-6 h-6" />
                      </div>
                      <p className="text-sm font-bold text-gray-800">
                        {loading ? 'Fetching device inventory...' : 'No products matched your search or filters.'}
                      </p>
                      <p className="text-xs text-gray-400 mt-1">Try resetting the category filter or adding a new device.</p>
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
            totalItems={filteredProducts.length}
            pageSize={pageSize}
            onPageChange={(p) => setCurrentPage(p)}
            onPageSizeChange={(s) => setPageSize(s)}
            pageSizeOptions={[10, 25, 50]}
          />
        </div>
      </div>

      {/* ----------------- Product Preview Drawer ----------------- */}
      <AnimatePresence>
        {previewProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl border border-gray-100 w-full max-w-lg overflow-hidden flex flex-col"
            >
              <div className="p-5 bg-gradient-to-r from-slate-900 to-blue-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-600 flex items-center justify-center font-bold text-white">
                    <Smartphone className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="font-black text-base leading-tight truncate max-w-xs">{previewProduct.name}</h3>
                    <p className="text-xs text-blue-200">{previewProduct.brand} • {previewProduct.category}</p>
                  </div>
                </div>
                <button onClick={() => setPreviewProduct(null)} className="p-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white cursor-pointer">
                  <X className="w-4 h-4" />
                </button>
              </div>

              <div className="p-6 space-y-4 text-xs">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-blue-600">Retail Price</p>
                    <p className="text-2xl font-black text-blue-700 mt-1">${previewProduct.sellingPrice?.toLocaleString()}</p>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-2xl border border-gray-100">
                    <p className="text-[10px] font-black uppercase tracking-wider text-gray-400">Wholesale Cost</p>
                    <p className="text-2xl font-black text-gray-700 mt-1">
                      {hasPermission('products:view_cost_price') ? `$${(previewProduct.purchasePrice || (previewProduct.sellingPrice * 0.78)).toFixed(0)}` : '••••'}
                    </p>
                  </div>
                </div>

                <div className="p-4 bg-gray-50 rounded-2xl space-y-2.5 text-gray-700 border border-gray-100">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Stock Status:</span>
                    <span className={cn("font-bold", (previewProduct.stock ?? 0) <= 3 ? "text-amber-600" : "text-emerald-700")}>
                      {previewProduct.stock ?? 0} units available
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">SKU Number:</span>
                    <span className="font-mono font-bold text-gray-900">{previewProduct.sku || 'N/A'}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-medium">Barcode:</span>
                    <span className="font-mono font-bold text-gray-900">{previewProduct.barcode || 'N/A'}</span>
                  </div>
                  {previewProduct.model && (
                    <div className="flex justify-between">
                      <span className="text-gray-500 font-medium">Model / Hardware:</span>
                      <span className="font-bold text-gray-900">{previewProduct.model}</span>
                    </div>
                  )}

                  {previewProduct.imeis && previewProduct.imeis.length > 0 && (
                    <div className="pt-3 border-t border-gray-200">
                      <span className="text-gray-500 block mb-1.5 font-bold">Tracked Device IMEIs ({previewProduct.imeis.length}):</span>
                      <div className="flex flex-wrap gap-1.5 max-h-24 overflow-y-auto custom-scrollbar">
                        {previewProduct.imeis.map((imei, idx) => (
                          <span key={idx} className="px-2.5 py-1 bg-white border border-blue-200 rounded-lg text-[10px] font-mono font-bold text-blue-700 shadow-2xs">
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
                    setPreviewProduct(null);
                    openEditModal(previewProduct);
                  }}
                  className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 text-gray-700 hover:bg-gray-100 rounded-xl text-xs font-bold transition-all cursor-pointer"
                >
                  <Edit2 className="w-4 h-4 text-indigo-600" />
                  <span>Edit Product</span>
                </button>
                <button
                  onClick={() => {
                    setPreviewProduct(null);
                    navigate('/pos');
                  }}
                  className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-500/20 transition-all cursor-pointer"
                >
                  <ShoppingBag className="w-4 h-4" />
                  <span>Sell in POS</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- Add / Edit Product Modal ----------------- */}
      <AnimatePresence>
        {isAddModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl p-6 md:p-8 overflow-hidden max-h-[90vh] flex flex-col"
            >
              <div className="flex justify-between items-center pb-4 border-b border-gray-100">
                <h2 className="text-xl font-black text-gray-900">
                  {editingProduct ? 'Edit Product Details' : 'Add New Product'}
                </h2>
                <button onClick={() => setIsAddModalOpen(false)} className="p-1 rounded-lg text-gray-400 hover:text-gray-700 cursor-pointer">
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveProduct} className="space-y-4 overflow-y-auto custom-scrollbar py-4 text-xs" dir={isRTL ? 'rtl' : 'ltr'}>
                
                {/* Preset Brand Selector Panel for Supermarket, Clothing, Mobile */}
                <div className="bg-gradient-to-r from-blue-50/80 to-indigo-50/80 p-3.5 rounded-2xl border border-blue-200/80 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="font-black text-blue-900 text-[11px] flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-blue-600" />
                      کاتالۆگی ئامادەی براندە ناسراوەکان (Preset Catalog):
                    </span>
                    <span className="text-[10px] text-gray-500 font-bold">یان زیادکردنی دەستی</span>
                  </div>

                  {/* Supermarket Brand Pills */}
                  <div className="flex flex-wrap gap-1.5 pt-1">
                    {SUPERMARKET_BRANDS.map((brand) => (
                      <button
                        key={brand.id}
                        type="button"
                        onClick={() => {
                          setSelectedBrandPreset(brand.id);
                        }}
                        className={`px-2.5 py-1 rounded-xl text-[10px] font-bold transition flex items-center gap-1 border ${
                          selectedBrandPreset === brand.id
                            ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
                            : 'bg-white border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <span>{brand.logoEmoji}</span>
                        <span>{brand.name}</span>
                      </button>
                    ))}
                  </div>

                  {/* Preset Items Carousel when a Brand is selected */}
                  {selectedBrandPreset !== 'all' && (
                    <div className="pt-2 border-t border-blue-200/60 space-y-1.5">
                      <p className="text-[10px] font-bold text-blue-800">بەرهەمەکانی ئەسپی ڕەش/زێڕ/شەباب... (کلیک بکە بۆ پرکردنەوە):</p>
                      <div className="flex flex-wrap gap-1.5 max-h-28 overflow-y-auto custom-scrollbar">
                        {SUPERMARKET_BRANDS.find(b => b.id === selectedBrandPreset)?.items.map((item, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => {
                              setFormData(prev => ({
                                ...prev,
                                name: item.name,
                                brand: item.brand,
                                category: item.category,
                                sellingPrice: item.sellingPrice,
                                purchasePrice: item.purchasePrice,
                                barcode: item.barcode || prev.barcode,
                                weightOrSize: item.weightOrSize || ''
                              }));
                            }}
                            className="p-1.5 bg-white hover:bg-blue-100 border border-blue-200 rounded-lg text-[10px] font-bold text-gray-800 transition text-right"
                          >
                            <p className="font-black text-blue-700">{item.name}</p>
                            <p className="text-[9px] text-gray-500">{item.weightOrSize} • IQD {item.sellingPrice}</p>
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">ناوی بەرهەم (Product Name) *</label>
                  <input 
                    required
                    type="text" 
                    placeholder="نموونە: برنجی ئەسپی ڕەش 10کگم یان کراسی ڕەش"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-semibold"
                    value={formData.name}
                    onChange={(e) => setFormData({...formData, name: e.target.value})}
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">مارکە / بڕاند (Brand)</label>
                    <input 
                      type="text" 
                      placeholder="نموونە: ئەسپی ڕەش، زێڕ، مەحموود، Zara"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-semibold"
                      value={formData.brand}
                      onChange={(e) => setFormData({...formData, brand: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">جۆری بەرهەم (Category)</label>
                    <input 
                      type="text" 
                      placeholder="برنج، زەیت، پۆشاک، دەرمان..."
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-semibold"
                      value={formData.category}
                      onChange={(e) => setFormData({...formData, category: e.target.value})}
                    />
                  </div>
                </div>

                {/* Clothing Dynamic Attributes (Sizes & Colors) */}
                <div className="p-3 bg-purple-50/60 rounded-2xl border border-purple-100 space-y-2">
                  <span className="font-black text-purple-900 text-[10px] uppercase">تایبەتمەندی پۆشاک و جلوبەرگ (Clothing Attributes)</span>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">قەبارە (Size):</label>
                      <select
                        value={formData.clothingSize}
                        onChange={(e) => setFormData({ ...formData, clothingSize: e.target.value })}
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                      >
                        <option value="">دیاری نەکراو</option>
                        {CLOTHING_SIZES.map(s => <option key={s} value={s}>{s}</option>)}
                      </select>
                    </div>

                    <div>
                      <label className="text-[10px] font-bold text-gray-600 block mb-1">ڕەنگ (Color):</label>
                      <select
                        value={formData.clothingColor}
                        onChange={(e) => setFormData({ ...formData, clothingColor: e.target.value })}
                        className="w-full p-2 bg-white border border-gray-200 rounded-xl text-xs font-bold"
                      >
                        <option value="">دیاری نەکراو</option>
                        {CLOTHING_COLORS.map(c => <option key={c.nameKu} value={c.nameKu}>{c.nameKu}</option>)}
                      </select>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Selling Price ($)</label>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-black text-blue-600"
                      value={formData.sellingPrice || ''}
                      onChange={(e) => setFormData({...formData, sellingPrice: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Cost Price ($)</label>
                    <input 
                      type="number" 
                      step="any"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-semibold"
                      value={formData.purchasePrice || ''}
                      onChange={(e) => setFormData({...formData, purchasePrice: Number(e.target.value)})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Stock Qty</label>
                    <input 
                      type="number" 
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-black"
                      value={formData.stock || ''}
                      onChange={(e) => setFormData({...formData, stock: Number(e.target.value)})}
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">Barcode</label>
                    <input 
                      type="text" 
                      placeholder="e.g. 195949012345"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
                      value={formData.barcode}
                      onChange={(e) => setFormData({...formData, barcode: e.target.value})}
                    />
                  </div>

                  <div className="space-y-1.5">
                    <label className="font-bold text-gray-700">SKU Code</label>
                    <input 
                      type="text" 
                      placeholder="e.g. APL-IP15PM-256"
                      className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono"
                      value={formData.sku}
                      onChange={(e) => setFormData({...formData, sku: e.target.value})}
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="font-bold text-gray-700">Tracked IMEIs (Optional, 1 per line)</label>
                  <textarea 
                    rows={3}
                    placeholder="352981098765432&#10;352981098765433"
                    className="w-full px-3.5 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none text-xs font-mono custom-scrollbar"
                    value={formData.imeisInput}
                    onChange={(e) => setFormData({...formData, imeisInput: e.target.value})}
                  />
                </div>

                <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-100">
                  <button 
                    type="button" 
                    onClick={() => setIsAddModalOpen(false)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl font-bold text-gray-600 hover:bg-gray-50 cursor-pointer"
                  >
                    Cancel
                  </button>
                  <button 
                    type="submit" 
                    className="px-6 py-2.5 bg-blue-600 text-white rounded-xl font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-500/20 cursor-pointer"
                  >
                    {editingProduct ? 'Update Product' : 'Save Product'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ----------------- Delete Confirmation Modal ----------------- */}
      <AnimatePresence>
        {deletingProduct && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl shadow-2xl p-6 w-full max-w-sm text-center"
            >
              <div className="w-12 h-12 bg-rose-100 text-rose-600 rounded-2xl flex items-center justify-center mx-auto mb-4">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <h3 className="text-lg font-black text-gray-900 mb-1">Delete Product?</h3>
              <p className="text-xs text-gray-500 mb-6">
                Are you sure you want to delete <strong className="text-gray-800">{deletingProduct.name}</strong>? This action cannot be undone.
              </p>
              <div className="flex items-center justify-center gap-3">
                <button
                  onClick={() => setDeletingProduct(null)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 rounded-xl text-xs font-bold text-gray-700 cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  onClick={handleDeleteProduct}
                  className="px-5 py-2.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold shadow-md shadow-rose-500/20 cursor-pointer"
                >
                  Confirm Delete
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
      {/* CSV Import Modal */}
      <ProductCsvImportModal
        isOpen={isImportModalOpen}
        onClose={() => setIsImportModalOpen(false)}
        storeId={store?.id || ''}
        onSuccess={() => {
          setIsImportModalOpen(false);
        }}
      />

      {/* QR Code Badge Modal */}
      <QrGeneratorModal
        product={qrModalProduct}
        onClose={() => setQrModalProduct(null)}
        isRTL={isRTL}
      />
    </DashboardLayout>
  );
}
