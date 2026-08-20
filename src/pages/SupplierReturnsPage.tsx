import React, { useState, useEffect, useMemo } from 'react';
import DashboardLayout from '../components/layout/DashboardLayout';
import { db } from '../lib/firebase';
import { collection, query, onSnapshot, orderBy } from 'firebase/firestore';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { useTranslation } from 'react-i18next';
import { 
  SupplierReturn, 
  Supplier, 
  Product, 
  ReturnStatus, 
  ReturnReason 
} from '../types';
import { 
  seedSampleSuppliersIfEmpty, 
  RETURN_REASONS, 
  RETURN_STATUSES, 
  SETTLEMENT_TYPES 
} from '../lib/supplierReturnService';
import NewReturnModal from '../components/returns/NewReturnModal';
import ReturnDetailsModal from '../components/returns/ReturnDetailsModal';
import DebitNotePrintModal from '../components/returns/DebitNotePrintModal';
import SuppliersModal from '../components/returns/SuppliersModal';
import Pagination from '../components/common/Pagination';
import { 
  Truck, 
  Plus, 
  Search, 
  Filter, 
  Download, 
  Printer, 
  Building2, 
  AlertTriangle, 
  CheckCircle2, 
  Clock, 
  Package, 
  RotateCcw, 
  ChevronRight, 
  DollarSign, 
  Barcode,
  Layers,
  Sparkles,
  ArrowUpRight
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function SupplierReturnsPage() {
  const { t, i18n } = useTranslation();
  const { store } = useStore();
  const { user, profile } = useAuth();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  // Data states
  const [returns, setReturns] = useState<SupplierReturn[]>([]);
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [loading, setLoading] = useState(true);

  // Filters and UI states
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'resolved' | 'suppliers'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');
  const [selectedReason, setSelectedReason] = useState<string>('all');
  const [selectedSupplierId, setSelectedSupplierId] = useState<string>('all');

  // Pagination State
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);

  // Modal states
  const [isNewModalOpen, setIsNewModalOpen] = useState(false);
  const [isSuppliersModalOpen, setIsSuppliersModalOpen] = useState(false);
  const [selectedReturnForDetails, setSelectedReturnForDetails] = useState<SupplierReturn | null>(null);
  const [selectedReturnForPrint, setSelectedReturnForPrint] = useState<SupplierReturn | null>(null);

  // Load suppliers and returns from Firestore
  useEffect(() => {
    if (!store?.id) return;

    // Seed default suppliers if none exist
    seedSampleSuppliersIfEmpty(store.id);

    // Fetch suppliers
    const supQuery = query(collection(db, `stores/${store.id}/suppliers`));
    const unsubSuppliers = onSnapshot(supQuery, (snapshot) => {
      const supData = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as Supplier));
      setSuppliers(supData);
    });

    // Fetch supplier returns
    const returnsQuery = query(collection(db, `stores/${store.id}/supplier_returns`));
    const unsubReturns = onSnapshot(returnsQuery, (snapshot) => {
      const data = snapshot.docs.map(d => ({ id: d.id, ...d.data() } as SupplierReturn));
      data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      setReturns(data);
      setLoading(false);
    });

    return () => {
      unsubSuppliers();
      unsubReturns();
    };
  }, [store?.id]);

  // Filtered returns calculation
  const filteredReturns = useMemo(() => {
    return returns.filter(item => {
      // Tab filter
      if (activeTab === 'pending') {
        if (!['draft', 'pending_approval', 'shipped_to_supplier', 'received_by_supplier'].includes(item.status)) return false;
      } else if (activeTab === 'resolved') {
        if (!['resolved_credit', 'resolved_refund', 'resolved_replacement'].includes(item.status)) return false;
      }

      // Status dropdown filter
      if (selectedStatus !== 'all' && item.status !== selectedStatus) return false;

      // Reason dropdown filter
      if (selectedReason !== 'all' && item.reason !== selectedReason) return false;

      // Supplier dropdown filter
      if (selectedSupplierId !== 'all' && item.supplierId !== selectedSupplierId) return false;

      // Search Query
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesRMA = item.returnNumber.toLowerCase().includes(q);
        const matchesSupplier = item.supplierName.toLowerCase().includes(q);
        const matchesItem = item.items?.some(it => 
          it.productName.toLowerCase().includes(q) || 
          it.brand.toLowerCase().includes(q) ||
          (it.imeis && it.imeis.some(im => im.toLowerCase().includes(q)))
        );
        const matchesTracking = item.trackingNumber?.toLowerCase().includes(q);
        if (!matchesRMA && !matchesSupplier && !matchesItem && !matchesTracking) return false;
      }

      return true;
    });
  }, [returns, activeTab, selectedStatus, selectedReason, selectedSupplierId, searchQuery]);

  // Paginated Returns Slice
  const totalPages = Math.ceil(filteredReturns.length / pageSize) || 1;
  const paginatedReturns = useMemo(() => {
    const start = (currentPage - 1) * pageSize;
    return filteredReturns.slice(start, start + pageSize);
  }, [filteredReturns, currentPage, pageSize]);

  useEffect(() => {
    setCurrentPage(1);
  }, [activeTab, selectedStatus, selectedReason, selectedSupplierId, searchQuery, pageSize]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalValuation = returns.reduce((acc, curr) => acc + (curr.totalCost || 0), 0);
    const pendingCount = returns.filter(r => ['draft', 'pending_approval', 'shipped_to_supplier', 'received_by_supplier'].includes(r.status)).length;
    const resolvedValuation = returns
      .filter(r => ['resolved_credit', 'resolved_refund', 'resolved_replacement'].includes(r.status))
      .reduce((acc, curr) => acc + (curr.settlementAmount || curr.totalCost || 0), 0);
    const totalSupplierCredit = suppliers.reduce((acc, s) => acc + (s.creditBalance || 0), 0);
    const totalItemsCount = returns.reduce((acc, curr) => acc + curr.items.reduce((sAcc, i) => sAcc + (i.quantity || 0), 0), 0);

    return {
      totalValuation,
      pendingCount,
      resolvedValuation,
      totalSupplierCredit,
      totalItemsCount
    };
  }, [returns, suppliers]);

  // CSV Export
  const handleExportCSV = () => {
    if (filteredReturns.length === 0) return;

    const headers = [
      'RMA Number',
      'Supplier',
      'Status',
      'Reason',
      'Settlement Type',
      'Total Value ($)',
      'Units Count',
      'Tracking Code',
      'Created By',
      'Created Date'
    ];

    const rows = filteredReturns.map(r => [
      `"${r.returnNumber}"`,
      `"${r.supplierName}"`,
      `"${r.status}"`,
      `"${r.reason}"`,
      `"${r.settlementType}"`,
      r.totalCost,
      r.items.reduce((acc, i) => acc + i.quantity, 0),
      `"${r.trackingNumber || ''}"`,
      `"${r.createdByName}"`,
      `"${new Date(r.createdAt).toLocaleDateString()}"`
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `Supplier_Returns_${new Date().toISOString().slice(0,10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <DashboardLayout>
      <div className="space-y-6">
        {/* Top Header Banner */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2.5">
              <div className="w-10 h-10 rounded-2xl bg-indigo-600 text-white flex items-center justify-center shadow-lg shadow-indigo-200">
                <Truck className="w-5 h-5" />
              </div>
              <div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('supplier_returns')}</h1>
                <p className="text-xs text-gray-500 font-medium">
                  Return damaged, defective, or excess stock to wholesale vendors with automatic inventory deduction & audit logging
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5 flex-wrap">
            <button
              onClick={() => setIsSuppliersModalOpen(true)}
              className="flex items-center gap-2 bg-white border border-gray-300 hover:bg-gray-50 text-gray-800 px-4 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
            >
              <Building2 className="w-4 h-4 text-gray-500" />
              {t('suppliers')} ({suppliers.length})
            </button>
            <button
              onClick={() => setIsNewModalOpen(true)}
              className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-lg shadow-indigo-200"
            >
              <Plus className="w-4 h-4" />
              {t('new_return')}
            </button>
          </div>
        </div>

        {/* Metric KPI Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Total Return Claims</span>
              <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                <DollarSign className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-gray-900 mt-2">${metrics.totalValuation.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">
              {metrics.totalItemsCount} total unit(s) across {returns.length} claim(s)
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Pending & In-Transit</span>
              <div className="w-8 h-8 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center">
                <Clock className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-amber-600 mt-2">{metrics.pendingCount}</p>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">
              Awaiting supplier inspection or dispatch
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Settled RMA Value</span>
              <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-emerald-700 mt-2">${metrics.resolvedValuation.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">
              Successfully credited, refunded, or swapped
            </p>
          </div>

          <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden group">
            <div className="flex items-center justify-between">
              <span className="text-xs font-black uppercase tracking-wider text-gray-400">Supplier Credit Balance</span>
              <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-600 flex items-center justify-center">
                <Building2 className="w-4 h-4" />
              </div>
            </div>
            <p className="text-2xl font-black text-purple-700 mt-2">${metrics.totalSupplierCredit.toLocaleString()}</p>
            <p className="text-[11px] text-gray-500 mt-1 font-medium">
              Store credits available for future purchases
            </p>
          </div>
        </div>

        {/* Tab Selection */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-1 overflow-x-auto">
          {[
            { id: 'all', label: 'All Returns', count: returns.length },
            { id: 'pending', label: 'Pending & In-Transit', count: metrics.pendingCount },
            { id: 'resolved', label: 'Settled & Replaced', count: returns.length - metrics.pendingCount },
            { id: 'suppliers', label: 'Suppliers Directory', count: suppliers.length },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-4 py-2 text-xs font-black uppercase tracking-wider rounded-xl transition-all flex items-center gap-2 whitespace-nowrap ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              <span>{tab.label}</span>
              <span className={`text-[10px] px-1.5 py-0.5 rounded-full ${
                activeTab === tab.id ? 'bg-white/20 text-white' : 'bg-gray-200 text-gray-700'
              }`}>
                {tab.count}
              </span>
            </button>
          ))}
        </div>

        {/* Search & Filters Bar */}
        {activeTab !== 'suppliers' && (
          <div className="bg-white p-4 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row gap-3 items-center justify-between">
            <div className="flex-1 relative w-full">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by RMA #, Product, Brand, Serial/IMEI, Supplier..."
                className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
              />
            </div>

            <div className="flex flex-wrap gap-2 w-full md:w-auto items-center">
              {/* Status Filter */}
              <select
                value={selectedStatus}
                onChange={(e) => setSelectedStatus(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Statuses</option>
                {RETURN_STATUSES.map(s => (
                  <option key={s.id} value={s.id}>{s.defaultLabel}</option>
                ))}
              </select>

              {/* Reason Filter */}
              <select
                value={selectedReason}
                onChange={(e) => setSelectedReason(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500"
              >
                <option value="all">All Reasons</option>
                {RETURN_REASONS.map(r => (
                  <option key={r.id} value={r.id}>{r.defaultLabel}</option>
                ))}
              </select>

              {/* Supplier Filter */}
              <select
                value={selectedSupplierId}
                onChange={(e) => setSelectedSupplierId(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-2xl px-3 py-2 text-xs font-bold text-gray-700 outline-none focus:ring-2 focus:ring-indigo-500 max-w-[150px]"
              >
                <option value="all">All Suppliers</option>
                {suppliers.map(s => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>

              {/* CSV Export Button */}
              <button
                onClick={handleExportCSV}
                title="Export CSV"
                className="p-2.5 bg-gray-50 hover:bg-gray-100 text-gray-600 rounded-2xl border border-gray-200 transition-colors"
              >
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* Tab Content: Returns Table / Suppliers View */}
        {activeTab === 'suppliers' ? (
          /* Inline Suppliers View */
          <div className="space-y-4">
            <div className="flex justify-between items-center bg-white p-4 rounded-3xl border border-gray-100 shadow-sm">
              <div>
                <h3 className="text-sm font-black uppercase tracking-wider text-gray-900">Registered Wholesale Suppliers</h3>
                <p className="text-xs text-gray-500">Contact information, RMA return history, and store credit balance with vendors</p>
              </div>
              <button
                onClick={() => setIsSuppliersModalOpen(true)}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-2xl text-xs font-black uppercase tracking-wider shadow-sm transition-all"
              >
                <Plus className="w-4 h-4" />
                Add New Supplier
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {suppliers.map(sup => (
                <div key={sup.id} className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-sm space-y-3">
                  <div className="flex items-start justify-between">
                    <div>
                      <h4 className="font-bold text-base text-gray-900">{sup.name}</h4>
                      {sup.contactPerson && <p className="text-xs text-gray-500 font-medium">{sup.contactPerson}</p>}
                    </div>
                    <span className="text-[10px] font-black uppercase bg-indigo-50 text-indigo-700 border border-indigo-100 px-2 py-0.5 rounded-full">
                      Credit: ${sup.creditBalance || 0}
                    </span>
                  </div>

                  <div className="text-xs text-gray-600 space-y-1 pt-1">
                    <p className="font-mono text-[11px]">📞 {sup.phone}</p>
                    {sup.email && <p className="text-[11px] truncate">✉️ {sup.email}</p>}
                    {sup.address && <p className="text-[11px] text-gray-500 truncate">📍 {sup.address}</p>}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex items-center justify-between text-xs">
                    <span className="text-gray-400 text-[10px] uppercase font-bold">
                      Returns: <strong className="text-gray-800">{sup.totalReturnsCount || 0}</strong>
                    </span>
                    <button
                      onClick={() => {
                        setSelectedSupplierId(sup.id);
                        setActiveTab('all');
                      }}
                      className="text-indigo-600 hover:text-indigo-800 font-bold text-xs flex items-center gap-1"
                    >
                      View RMA History →
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ) : (
          /* Returns List View */
          <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            {loading ? (
              <div className="p-12 text-center text-xs text-gray-400">Loading supplier returns...</div>
            ) : filteredReturns.length === 0 ? (
              <div className="p-12 text-center space-y-3">
                <Truck className="w-10 h-10 text-gray-300 mx-auto" />
                <h3 className="text-base font-bold text-gray-800">No Supplier Returns Found</h3>
                <p className="text-xs text-gray-500 max-w-md mx-auto">
                  No return claims match the selected criteria. Create a new RMA claim to return damaged or excess stock to vendors.
                </p>
                <button
                  onClick={() => setIsNewModalOpen(true)}
                  className="inline-flex items-center gap-2 bg-indigo-600 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider hover:bg-indigo-700 transition-all shadow-md"
                >
                  <Plus className="w-4 h-4" />
                  Create First Return
                </button>
              </div>
            ) : (
              <>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs border-collapse">
                  <thead>
                    <tr className="bg-gray-50/80 border-b border-gray-100 text-[11px] font-black uppercase text-gray-400">
                      <th className="py-3.5 px-4">RMA Number</th>
                      <th className="py-3.5 px-4">Supplier / Vendor</th>
                      <th className="py-3.5 px-4">Reason & Defect</th>
                      <th className="py-3.5 px-4">Items / Qty</th>
                      <th className="py-3.5 px-4">Claim Total</th>
                      <th className="py-3.5 px-4">Status</th>
                      <th className="py-3.5 px-4">Settlement</th>
                      <th className="py-3.5 px-4 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-100 font-medium">
                    {paginatedReturns.map((ret) => {
                      const statusObj = RETURN_STATUSES.find(s => s.id === ret.status) || RETURN_STATUSES[0];
                      const reasonObj = RETURN_REASONS.find(r => r.id === ret.reason);
                      const settlementObj = SETTLEMENT_TYPES.find(s => s.id === ret.settlementType);
                      const totalUnits = ret.items.reduce((acc, i) => acc + (i.quantity || 0), 0);

                      return (
                        <tr 
                          key={ret.id}
                          className="hover:bg-indigo-50/40 cursor-pointer transition-colors group"
                          onClick={() => setSelectedReturnForDetails(ret)}
                        >
                          <td className="py-4 px-4">
                            <span className="font-mono font-bold text-gray-900 block group-hover:text-indigo-600 transition-colors">
                              {ret.returnNumber}
                            </span>
                            <span className="text-[10px] text-gray-400 font-normal">
                              {new Date(ret.createdAt).toLocaleDateString()}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <p className="font-bold text-gray-900">{ret.supplierName}</p>
                            {ret.supplierPhone && (
                              <p className="text-[10px] text-gray-400 font-mono">{ret.supplierPhone}</p>
                            )}
                          </td>

                          <td className="py-4 px-4 max-w-xs">
                            <p className="text-gray-800 font-bold">{reasonObj?.defaultLabel || ret.reason}</p>
                            {ret.reasonDetails && (
                              <p className="text-[10px] text-gray-500 truncate">{ret.reasonDetails}</p>
                            )}
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-bold text-gray-900">{totalUnits} units</span>
                            <span className="text-[10px] text-gray-400 block">
                              ({ret.items.length} sku{ret.items.length > 1 ? 's' : ''})
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="font-black text-gray-900 text-sm">
                              ${ret.totalCost.toLocaleString()}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className={`inline-block text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${statusObj.bg} ${statusObj.text} ${statusObj.border}`}>
                              {statusObj.defaultLabel}
                            </span>
                          </td>

                          <td className="py-4 px-4">
                            <span className="text-gray-700 text-[11px] block">{settlementObj?.defaultLabel || ret.settlementType}</span>
                            {ret.trackingNumber && (
                              <span className="text-[10px] font-mono text-indigo-600 bg-indigo-50 px-1.5 py-0.5 rounded">
                                Trk: {ret.trackingNumber}
                              </span>
                            )}
                          </td>

                          <td className="py-4 px-4 text-right" onClick={(e) => e.stopPropagation()}>
                            <div className="flex items-center justify-end gap-1.5">
                              <button
                                onClick={() => setSelectedReturnForPrint(ret)}
                                title="Print Voucher"
                                className="p-1.5 text-gray-400 hover:text-indigo-600 hover:bg-indigo-50 rounded-lg transition-colors"
                              >
                                <Printer className="w-4 h-4" />
                              </button>
                              <button
                                onClick={() => setSelectedReturnForDetails(ret)}
                                className="p-1.5 text-gray-400 hover:text-gray-900 hover:bg-gray-100 rounded-lg transition-colors"
                              >
                                <ChevronRight className="w-4 h-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              {/* Interactive Pagination ("لاپەڕەی دواتر" / "Next Page") */}
              <Pagination
                currentPage={currentPage}
                totalPages={totalPages}
                totalItems={filteredReturns.length}
                pageSize={pageSize}
                onPageChange={(p) => setCurrentPage(p)}
                onPageSizeChange={(s) => setPageSize(s)}
                pageSizeOptions={[10, 25, 50]}
              />
            </>
          )}
          </div>
        )}
      </div>

      {/* New Return Modal */}
      <NewReturnModal
        isOpen={isNewModalOpen}
        onClose={() => setIsNewModalOpen(false)}
        onSuccess={(returnId) => {
          setIsNewModalOpen(false);
          const found = returns.find(r => r.id === returnId);
          if (found) setSelectedReturnForDetails(found);
        }}
        suppliers={suppliers}
      />

      {/* Suppliers Management Modal */}
      <SuppliersModal
        isOpen={isSuppliersModalOpen}
        onClose={() => setIsSuppliersModalOpen(false)}
        suppliers={suppliers}
      />

      {/* Return Details & Audit Timeline Modal */}
      <ReturnDetailsModal
        isOpen={!!selectedReturnForDetails}
        onClose={() => setSelectedReturnForDetails(null)}
        returnDoc={selectedReturnForDetails}
        onReturnUpdated={() => {
          // Trigger refresh if needed
        }}
      />

      {/* Print Debit Note Modal */}
      {selectedReturnForPrint && (
        <DebitNotePrintModal
          isOpen={!!selectedReturnForPrint}
          onClose={() => setSelectedReturnForPrint(null)}
          returnDoc={selectedReturnForPrint}
          store={store}
        />
      )}
    </DashboardLayout>
  );
}
