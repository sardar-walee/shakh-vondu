import React, { useState, useEffect } from 'react';
import { db } from '../../lib/firebase';
import { collection, query, onSnapshot } from 'firebase/firestore';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import { 
  Supplier, 
  Product, 
  SupplierReturnItem, 
  ReturnReason, 
  ReturnSettlement, 
  ItemCondition 
} from '../../types';
import { 
  RETURN_REASONS, 
  SETTLEMENT_TYPES, 
  ITEM_CONDITIONS, 
  createSupplierReturn, 
  generateRMANumber 
} from '../../lib/supplierReturnService';
import { 
  X, 
  Plus, 
  Trash2, 
  Package, 
  Truck, 
  AlertTriangle, 
  CheckCircle, 
  Search, 
  ShieldAlert,
  Building2,
  DollarSign,
  Barcode,
  Info
} from 'lucide-react';
import { motion } from 'motion/react';

interface NewReturnModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (returnId: string) => void;
  preselectedProduct?: Product | null;
  suppliers: Supplier[];
}

export default function NewReturnModal({
  isOpen,
  onClose,
  onSuccess,
  preselectedProduct,
  suppliers
}: NewReturnModalProps) {
  const { store } = useStore();
  const { user, profile } = useAuth();

  const [products, setProducts] = useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form State
  const [returnNumber] = useState<string>(generateRMANumber());
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('');
  const [reason, setReason] = useState<ReturnReason>('damaged_on_arrival');
  const [reasonDetails, setReasonDetails] = useState<string>('');
  const [settlementType, setSettlementType] = useState<ReturnSettlement>('supplier_credit');
  const [trackingNumber, setTrackingNumber] = useState<string>('');
  const [courierName, setCourierName] = useState<string>('');
  const [autoInventoryDeducted, setAutoInventoryDeducted] = useState<boolean>(true);
  const [notes, setNotes] = useState<string>('');
  const [status, setStatus] = useState<'draft' | 'pending_approval' | 'shipped_to_supplier'>('pending_approval');

  // Items State
  const [items, setItems] = useState<SupplierReturnItem[]>([]);
  const [productSearch, setProductSearch] = useState('');
  const [selectedProductId, setSelectedProductId] = useState<string>('');

  // Fetch store products for selection
  useEffect(() => {
    if (!store?.id) return;
    const q = query(collection(db, `stores/${store.id}/products`));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const data = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
      setProducts(data);
      setLoadingProducts(false);
    });
    return () => unsubscribe();
  }, [store?.id]);

  // Set default supplier if available
  useEffect(() => {
    if (suppliers.length > 0 && !selectedSupplierId) {
      setSelectedSupplierId(suppliers[0].id);
    }
  }, [suppliers, selectedSupplierId]);

  // Prepopulate with preselectedProduct if passed from ProductsPage
  useEffect(() => {
    if (preselectedProduct && items.length === 0) {
      addItemFromProduct(preselectedProduct);
    }
  }, [preselectedProduct]);

  const addItemFromProduct = (prod: Product) => {
    // Check if already added
    if (items.some(it => it.productId === prod.id)) return;

    const newItem: SupplierReturnItem = {
      id: 'item_' + Math.random().toString(36).substring(2, 9),
      productId: prod.id,
      productName: prod.name,
      brand: prod.brand || 'Generic',
      category: prod.category || 'General',
      quantity: 1,
      unitCost: prod.purchasePrice || 0,
      totalCost: prod.purchasePrice || 0,
      condition: 'defective_hardware',
      faultDescription: '',
      imeis: prod.hasImei ? [''] : [],
      barcode: prod.barcode || ''
    };
    setItems(prev => [...prev, newItem]);
    setSelectedProductId('');
  };

  const handleUpdateItem = (itemId: string, updates: Partial<SupplierReturnItem>) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const updated = { ...item, ...updates };
      if (updates.quantity !== undefined || updates.unitCost !== undefined) {
        const qty = updates.quantity !== undefined ? updates.quantity : item.quantity;
        const cost = updates.unitCost !== undefined ? updates.unitCost : item.unitCost;
        updated.totalCost = qty * cost;
      }
      return updated;
    }));
  };

  const handleRemoveItem = (itemId: string) => {
    setItems(prev => prev.filter(item => item.id !== itemId));
  };

  const handleImeiChange = (itemId: string, index: number, value: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newImeis = [...(item.imeis || [])];
      newImeis[index] = value.trim();
      return { ...item, imeis: newImeis };
    }));
  };

  const handleAddImeiField = (itemId: string) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newImeis = [...(item.imeis || []), ''];
      return { 
        ...item, 
        imeis: newImeis,
        quantity: Math.max(item.quantity, newImeis.length)
      };
    }));
  };

  const handleRemoveImeiField = (itemId: string, index: number) => {
    setItems(prev => prev.map(item => {
      if (item.id !== itemId) return item;
      const newImeis = (item.imeis || []).filter((_, i) => i !== index);
      return { ...item, imeis: newImeis };
    }));
  };

  const totalReturnCost = items.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
  const totalUnitsCount = items.reduce((acc, curr) => acc + (curr.quantity || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;
    if (items.length === 0) {
      setError('Please add at least one product item to return.');
      return;
    }
    if (!selectedSupplierId) {
      setError('Please select a supplier.');
      return;
    }

    const supplier = suppliers.find(s => s.id === selectedSupplierId);
    if (!supplier) {
      setError('Selected supplier not found.');
      return;
    }

    setSubmitting(true);
    setError(null);

    try {
      const returnDocId = await createSupplierReturn(
        store.id,
        {
          returnNumber,
          supplierId: supplier.id,
          supplierName: supplier.name,
          supplierPhone: supplier.phone || '',
          supplierEmail: supplier.email || '',
          supplierAddress: supplier.address || '',
          reason,
          reasonDetails,
          items,
          totalCost: totalReturnCost,
          settlementType,
          status,
          trackingNumber: trackingNumber || undefined,
          courierName: courierName || undefined,
          autoInventoryDeducted,
          notes,
          createdBy: user?.uid || '',
          createdByName: profile?.displayName || user?.email || 'Store Staff',
          branchId: profile?.branchId,
          branchName: store.name,
        },
        {
          uid: user?.uid || '',
          displayName: profile?.displayName || user?.email || 'Store User',
          email: user?.email || '',
          role: profile?.role
        }
      );

      onSuccess(returnDocId);
    } catch (err: any) {
      console.error('Failed to create return:', err);
      setError(err.message || 'Failed to submit supplier return.');
    } finally {
      setSubmitting(false);
    }
  };

  if (!isOpen) return null;

  const filteredProducts = products.filter(p => 
    p.name.toLowerCase().includes(productSearch.toLowerCase()) ||
    (p.brand && p.brand.toLowerCase().includes(productSearch.toLowerCase())) ||
    (p.category && p.category.toLowerCase().includes(productSearch.toLowerCase()))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-4xl w-full max-h-[92vh] flex flex-col overflow-hidden my-4"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Truck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-black tracking-tight">Create Supplier Return (RMA)</h2>
                <span className="bg-indigo-500/30 text-indigo-200 border border-indigo-400/30 text-[10px] font-mono font-bold px-2 py-0.5 rounded-full">
                  {returnNumber}
                </span>
              </div>
              <p className="text-xs text-gray-300">Return damaged, defective, or excess stock to vendor with stock reconciliation</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6 space-y-6">
          {error && (
            <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-3 rounded-2xl text-xs flex items-center gap-2 font-medium">
              <AlertTriangle className="w-4 h-4 shrink-0 text-rose-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Supplier & Return Reason Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Supplier Selector */}
            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                Target Supplier / Vendor <span className="text-rose-500">*</span>
              </label>
              {suppliers.length === 0 ? (
                <p className="text-xs text-amber-600 bg-amber-50 p-2.5 rounded-xl border border-amber-200">
                  No suppliers found in directory. Default regional suppliers will be initialized automatically.
                </p>
              ) : (
                <select
                  value={selectedSupplierId}
                  onChange={(e) => setSelectedSupplierId(e.target.value)}
                  className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
                  required
                >
                  {suppliers.map(s => (
                    <option key={s.id} value={s.id}>
                      {s.name} {s.phone ? `(${s.phone})` : ''} - Credit: ${s.creditBalance || 0}
                    </option>
                  ))}
                </select>
              )}
              {selectedSupplierId && (
                <div className="text-[11px] text-gray-500 pt-1 flex items-center justify-between">
                  <span>{suppliers.find(s => s.id === selectedSupplierId)?.address || 'Standard Vendor terms apply'}</span>
                  <span className="font-bold text-indigo-600">
                    Active Bal: ${suppliers.find(s => s.id === selectedSupplierId)?.creditBalance?.toLocaleString() || 0}
                  </span>
                </div>
              )}
            </div>

            {/* Primary Return Reason */}
            <div className="bg-gray-50/80 p-4 rounded-2xl border border-gray-200/80 space-y-2">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                Primary Reason for Return <span className="text-rose-500">*</span>
              </label>
              <select
                value={reason}
                onChange={(e) => setReason(e.target.value as ReturnReason)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3.5 py-2.5 text-sm font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {RETURN_REASONS.map(r => (
                  <option key={r.id} value={r.id}>
                    {r.defaultLabel}
                  </option>
                ))}
              </select>
              <input 
                type="text"
                value={reasonDetails}
                onChange={(e) => setReasonDetails(e.target.value)}
                placeholder="Specific batch or defect notes (e.g. batch #441 DOA display touch failure)..."
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs text-gray-700 outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>
          </div>

          {/* Product Items Selection Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Package className="w-4 h-4 text-indigo-600" />
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">
                  Products to Return ({items.length})
                </h3>
              </div>
              <div className="text-xs text-gray-500 font-medium">
                Total Units: <span className="font-bold text-gray-900">{totalUnitsCount}</span> | Cost Value: <span className="font-black text-indigo-600">${totalReturnCost.toLocaleString()}</span>
              </div>
            </div>

            {/* Add Product Search Bar */}
            <div className="bg-indigo-50/50 p-3 rounded-2xl border border-indigo-100 flex flex-col md:flex-row gap-2">
              <div className="flex-1 relative">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                <input 
                  type="text"
                  placeholder="Search store inventory to add product (iPhone 15, S24 Ultra, Charger, etc.)..."
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-white border border-indigo-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                />
              </div>
              {productSearch && (
                <div className="max-h-48 overflow-y-auto bg-white border border-gray-200 rounded-xl shadow-lg divide-y divide-gray-100 absolute left-8 right-8 top-auto z-20">
                  {filteredProducts.length === 0 ? (
                    <div className="p-3 text-xs text-gray-400 text-center">No products matching search</div>
                  ) : (
                    filteredProducts.slice(0, 6).map(prod => (
                      <div 
                        key={prod.id}
                        onClick={() => {
                          addItemFromProduct(prod);
                          setProductSearch('');
                        }}
                        className="p-2.5 hover:bg-indigo-50 cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <p className="font-bold text-gray-900">{prod.name}</p>
                          <p className="text-[11px] text-gray-500">{prod.brand} • In Stock: {prod.stock || 0} units {prod.hasImei ? '• (IMEI Tracked)' : ''}</p>
                        </div>
                        <div className="text-right">
                          <span className="font-bold text-gray-900">${prod.purchasePrice || 0}</span>
                          <span className="text-[10px] text-indigo-600 ml-2 bg-indigo-50 px-2 py-0.5 rounded font-bold">+ Add</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            {/* Selected Items Table / Cards */}
            {items.length === 0 ? (
              <div className="text-center py-8 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                <Package className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                <p className="text-xs font-bold text-gray-600">No items added to this return yet</p>
                <p className="text-[11px] text-gray-400 mt-0.5">Use the search box above to add stock products to the RMA list</p>
              </div>
            ) : (
              <div className="space-y-3">
                {items.map((item, itemIdx) => (
                  <div 
                    key={item.id}
                    className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm space-y-3"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="w-5 h-5 rounded-full bg-gray-100 text-gray-700 text-[10px] font-black flex items-center justify-center">
                            {itemIdx + 1}
                          </span>
                          <h4 className="text-sm font-bold text-gray-900">{item.productName}</h4>
                          <span className="text-[10px] bg-gray-100 text-gray-600 px-2 py-0.5 rounded-md font-medium">
                            {item.brand}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-4">
                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Qty:</label>
                          <input 
                            type="number"
                            min="1"
                            value={item.quantity}
                            onChange={(e) => handleUpdateItem(item.id, { quantity: parseInt(e.target.value) || 1 })}
                            className="w-16 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-center outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="flex items-center gap-2">
                          <label className="text-[11px] font-bold text-gray-500 uppercase">Unit Cost $:</label>
                          <input 
                            type="number"
                            min="0"
                            step="0.1"
                            value={item.unitCost}
                            onChange={(e) => handleUpdateItem(item.id, { unitCost: parseFloat(e.target.value) || 0 })}
                            className="w-24 bg-gray-50 border border-gray-200 rounded-lg px-2 py-1 text-xs font-bold text-right outline-none focus:ring-1 focus:ring-indigo-500"
                          />
                        </div>

                        <div className="text-right min-w-[70px]">
                          <span className="text-[10px] text-gray-400 block uppercase font-bold">Total</span>
                          <span className="text-xs font-black text-indigo-700">${(item.totalCost || 0).toLocaleString()}</span>
                        </div>

                        <button 
                          type="button"
                          onClick={() => handleRemoveItem(item.id)}
                          className="text-gray-400 hover:text-rose-600 p-1.5 rounded-lg hover:bg-rose-50 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Condition and Fault Note Row */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Physical Condition</label>
                        <select
                          value={item.condition}
                          onChange={(e) => handleUpdateItem(item.id, { condition: e.target.value as ItemCondition })}
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-indigo-500 font-medium"
                        >
                          {ITEM_CONDITIONS.map(c => (
                            <option key={c.id} value={c.id}>{c.defaultLabel}</option>
                          ))}
                        </select>
                      </div>

                      <div>
                        <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Defect / Symptom Note</label>
                        <input 
                          type="text"
                          value={item.faultDescription || ''}
                          onChange={(e) => handleUpdateItem(item.id, { faultDescription: e.target.value })}
                          placeholder="e.g. Broken touch screen, won't charge, bootloop..."
                          className="w-full bg-gray-50 border border-gray-200 rounded-xl px-2.5 py-1.5 text-xs text-gray-800 outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                    </div>

                    {/* Serial Numbers / IMEIs Tracked */}
                    {item.imeis !== undefined && (
                      <div className="bg-gray-50/70 p-2.5 rounded-xl border border-gray-100 space-y-2">
                        <div className="flex items-center justify-between text-[11px]">
                          <span className="font-bold text-gray-700 flex items-center gap-1.5">
                            <Barcode className="w-3.5 h-3.5 text-indigo-600" />
                            IMEI / Serial Numbers ({item.imeis.length})
                          </span>
                          <button 
                            type="button"
                            onClick={() => handleAddImeiField(item.id)}
                            className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                          >
                            <Plus className="w-3 h-3" /> Add Serial
                          </button>
                        </div>
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          {item.imeis.map((imeiVal, imeiIdx) => (
                            <div key={imeiIdx} className="flex items-center gap-1.5">
                              <input 
                                type="text"
                                value={imeiVal}
                                onChange={(e) => handleImeiChange(item.id, imeiIdx, e.target.value)}
                                placeholder={`IMEI ${imeiIdx + 1} (15 digits)`}
                                className="flex-1 bg-white border border-gray-200 rounded-lg px-2.5 py-1 text-[11px] font-mono focus:ring-1 focus:ring-indigo-500 outline-none"
                              />
                              {item.imeis && item.imeis.length > 1 && (
                                <button 
                                  type="button" 
                                  onClick={() => handleRemoveImeiField(item.id, imeiIdx)}
                                  className="text-gray-400 hover:text-rose-500 p-1 text-xs"
                                >
                                  ×
                                </button>
                              )}
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Settlement, Logistics & Stock Control Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2 border-t border-gray-100">
            {/* Settlement Preference */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700">
                Settlement Preference
              </label>
              <select
                value={settlementType}
                onChange={(e) => setSettlementType(e.target.value as ReturnSettlement)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                {SETTLEMENT_TYPES.map(s => (
                  <option key={s.id} value={s.id}>{s.defaultLabel}</option>
                ))}
              </select>
            </div>

            {/* Workflow Initial Status */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700">
                Initial Status
              </label>
              <select
                value={status}
                onChange={(e) => setStatus(e.target.value as any)}
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs font-semibold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              >
                <option value="pending_approval">Pending Approval (Ready to Send)</option>
                <option value="draft">Draft (Hold in Store)</option>
                <option value="shipped_to_supplier">Already Shipped to Vendor</option>
              </select>
            </div>

            {/* Courier / Tracking */}
            <div className="space-y-1.5">
              <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700">
                Logistics / Tracking Code
              </label>
              <input 
                type="text"
                value={trackingNumber}
                onChange={(e) => setTrackingNumber(e.target.value)}
                placeholder="e.g. DHL / Erbil Cargo #8820"
                className="w-full bg-white border border-gray-300 rounded-xl px-3 py-2 text-xs text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>
          </div>

          {/* Automatic Inventory Deduction Switch */}
          <div className="bg-indigo-50/60 border border-indigo-200/70 p-4 rounded-2xl flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 rounded-xl bg-indigo-600 text-white flex items-center justify-center">
                <CheckCircle className="w-4 h-4" />
              </div>
              <div>
                <p className="text-xs font-black text-gray-900">Automatic Inventory Adjustment</p>
                <p className="text-[11px] text-gray-500">
                  Instantly deduct {totalUnitsCount} unit(s) from product stock counts upon creating this return.
                </p>
              </div>
            </div>
            <label className="relative inline-flex items-center cursor-pointer">
              <input 
                type="checkbox" 
                checked={autoInventoryDeducted} 
                onChange={(e) => setAutoInventoryDeducted(e.target.checked)}
                className="sr-only peer" 
              />
              <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
            </label>
          </div>

          {/* Additional Notes */}
          <div>
            <label className="block text-[11px] font-black uppercase tracking-wider text-gray-700 mb-1">
              General RMA Notes & Dispatch Instructions
            </label>
            <textarea
              rows={2}
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Provide courier handover notes, warehouse receiver name, or additional warranty details..."
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-3 text-xs text-gray-800 outline-none focus:ring-2 focus:ring-indigo-500"
            />
          </div>
        </form>

        {/* Modal Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3">
          <div className="text-xs text-gray-500">
            Total Valuation: <span className="text-base font-black text-gray-900">${totalReturnCost.toLocaleString()}</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            <button
              type="button"
              onClick={onClose}
              disabled={submitting}
              className="flex-1 sm:flex-none px-5 py-2.5 rounded-xl border border-gray-300 text-xs font-bold text-gray-700 hover:bg-gray-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="button"
              onClick={handleSubmit}
              disabled={submitting || items.length === 0}
              className="flex-1 sm:flex-none flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-lg shadow-indigo-200 transition-all"
            >
              {submitting ? (
                <>
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Processing...</span>
                </>
              ) : (
                <>
                  <Truck className="w-4 h-4" />
                  <span>Submit Supplier Return</span>
                </>
              )}
            </button>
          </div>
        </div>
      </motion.div>
    </div>
  );
}
