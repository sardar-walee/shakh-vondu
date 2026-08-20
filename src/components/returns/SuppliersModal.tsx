import React, { useState } from 'react';
import { db } from '../../lib/firebase';
import { collection, addDoc, doc, updateDoc, deleteDoc } from 'firebase/firestore';
import { useStore } from '../../contexts/StoreContext';
import { useAuth } from '../../contexts/AuthContext';
import { Supplier } from '../../types';
import { logAuditEvent } from '../../lib/auditService';
import { 
  X, 
  Plus, 
  Building2, 
  Phone, 
  Mail, 
  MapPin, 
  DollarSign, 
  Edit2, 
  Trash2, 
  Search,
  CheckCircle,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface SuppliersModalProps {
  isOpen: boolean;
  onClose: () => void;
  suppliers: Supplier[];
}

export default function SuppliersModal({
  isOpen,
  onClose,
  suppliers
}: SuppliersModalProps) {
  const { store } = useStore();
  const { user, profile } = useAuth();

  const [searchTerm, setSearchTerm] = useState('');
  const [isAddMode, setIsAddMode] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<Supplier | null>(null);

  // Form Fields
  const [name, setName] = useState('');
  const [contactPerson, setContactPerson] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [creditBalance, setCreditBalance] = useState<number>(0);
  const [notes, setNotes] = useState('');
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleOpenAdd = () => {
    setEditingSupplier(null);
    setName('');
    setContactPerson('');
    setPhone('');
    setEmail('');
    setAddress('');
    setCreditBalance(0);
    setNotes('');
    setFormError(null);
    setIsAddMode(true);
  };

  const handleOpenEdit = (sup: Supplier) => {
    setEditingSupplier(sup);
    setName(sup.name || '');
    setContactPerson(sup.contactPerson || '');
    setPhone(sup.phone || '');
    setEmail(sup.email || '');
    setAddress(sup.address || '');
    setCreditBalance(sup.creditBalance || 0);
    setNotes(sup.notes || '');
    setFormError(null);
    setIsAddMode(true);
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!store?.id) return;
    if (!name.trim()) {
      setFormError('Supplier / Company Name is required.');
      return;
    }
    if (!phone.trim()) {
      setFormError('Contact phone number is required.');
      return;
    }

    setSaving(true);
    setFormError(null);

    try {
      if (editingSupplier) {
        // Update existing
        const supRef = doc(db, `stores/${store.id}/suppliers/${editingSupplier.id}`);
        await updateDoc(supRef, {
          name,
          contactPerson,
          phone,
          email,
          address,
          creditBalance: Number(creditBalance) || 0,
          notes
        });

        await logAuditEvent(store.id, {
          entityType: 'supplier',
          entityId: editingSupplier.id,
          action: 'updated',
          title: `Updated Supplier "${name}"`,
          performedBy: user?.uid,
          performedByName: profile?.displayName || user?.email,
          role: profile?.role
        });
      } else {
        // Create new
        const docRef = await addDoc(collection(db, `stores/${store.id}/suppliers`), {
          name,
          contactPerson,
          phone,
          email,
          address,
          creditBalance: Number(creditBalance) || 0,
          totalReturnsCount: 0,
          notes,
          createdAt: new Date().toISOString()
        });

        await logAuditEvent(store.id, {
          entityType: 'supplier',
          entityId: docRef.id,
          action: 'created',
          title: `Added New Supplier "${name}"`,
          details: `Phone: ${phone}, Contact: ${contactPerson}`,
          performedBy: user?.uid,
          performedByName: profile?.displayName || user?.email,
          role: profile?.role
        });
      }

      setIsAddMode(false);
    } catch (err: any) {
      console.error('Failed to save supplier:', err);
      setFormError(err.message || 'Failed to save supplier.');
    } finally {
      setSaving(false);
    }
  };

  const filtered = suppliers.filter(s =>
    s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (s.contactPerson && s.contactPerson.toLowerCase().includes(searchTerm.toLowerCase())) ||
    (s.phone && s.phone.includes(searchTerm))
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm overflow-y-auto">
      <motion.div 
        initial={{ opacity: 0, scale: 0.96, y: 10 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.96, y: 10 }}
        className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-3xl w-full max-h-[90vh] flex flex-col overflow-hidden my-4"
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gradient-to-r from-gray-900 to-indigo-950 text-white">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 border border-indigo-400/30 flex items-center justify-center text-indigo-300">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-lg font-black tracking-tight">Suppliers & Vendor Directory</h2>
              <p className="text-xs text-gray-300">Manage wholesale distributors, contacts, and accrued credit balances</p>
            </div>
          </div>
          <button 
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-6 space-y-4">
          {!isAddMode ? (
            <>
              {/* Controls */}
              <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
                <div className="relative w-full sm:w-72">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                  <input 
                    type="text"
                    placeholder="Search by supplier name, contact, phone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-medium"
                  />
                </div>

                <button
                  onClick={handleOpenAdd}
                  className="w-full sm:w-auto flex items-center justify-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-sm transition-all"
                >
                  <Plus className="w-4 h-4" />
                  Add Supplier
                </button>
              </div>

              {/* Suppliers List */}
              {filtered.length === 0 ? (
                <div className="text-center py-10 border-2 border-dashed border-gray-200 rounded-2xl bg-gray-50/50">
                  <Building2 className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                  <p className="text-xs font-bold text-gray-600">No suppliers found</p>
                  <p className="text-[11px] text-gray-400 mt-0.5">Add a new supplier to start tracking RMA returns</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {filtered.map(s => (
                    <div key={s.id} className="bg-white border border-gray-200 rounded-2xl p-4 shadow-sm hover:shadow-md transition-shadow space-y-2 relative group">
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="font-bold text-sm text-gray-900">{s.name}</h4>
                          {s.contactPerson && (
                            <p className="text-xs text-gray-500 font-medium">{s.contactPerson}</p>
                          )}
                        </div>
                        <button
                          onClick={() => handleOpenEdit(s)}
                          className="text-gray-400 hover:text-indigo-600 p-1 rounded-lg hover:bg-indigo-50 transition-colors"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                      </div>

                      <div className="space-y-1 text-xs text-gray-600 pt-1">
                        {s.phone && (
                          <p className="flex items-center gap-1.5 font-mono text-[11px]">
                            <Phone className="w-3 h-3 text-gray-400" />
                            {s.phone}
                          </p>
                        )}
                        {s.email && (
                          <p className="flex items-center gap-1.5 text-[11px]">
                            <Mail className="w-3 h-3 text-gray-400" />
                            {s.email}
                          </p>
                        )}
                        {s.address && (
                          <p className="flex items-center gap-1.5 text-[11px] text-gray-500 line-clamp-1">
                            <MapPin className="w-3 h-3 text-gray-400 shrink-0" />
                            {s.address}
                          </p>
                        )}
                      </div>

                      <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-xs">
                        <span className="text-gray-400 text-[10px] uppercase font-bold">
                          Returns: <strong className="text-gray-700">{s.totalReturnsCount || 0}</strong>
                        </span>
                        <span className="font-black text-indigo-700 bg-indigo-50 border border-indigo-100 px-2 py-0.5 rounded-md text-[11px]">
                          Credit Bal: ${(s.creditBalance || 0).toLocaleString()}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            /* Add / Edit Form */
            <form onSubmit={handleSave} className="space-y-4">
              {formError && (
                <div className="bg-rose-50 border border-rose-200 text-rose-700 px-4 py-2.5 rounded-xl text-xs flex items-center gap-2 font-medium">
                  <AlertCircle className="w-4 h-4 text-rose-500" />
                  <span>{formError}</span>
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Company / Supplier Name <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dubai GSM Wholesale LLC"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-semibold outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Contact Person
                  </label>
                  <input 
                    type="text"
                    value={contactPerson}
                    onChange={(e) => setContactPerson(e.target.value)}
                    placeholder="e.g. Sardar Rostam"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Phone Number <span className="text-rose-500">*</span>
                  </label>
                  <input 
                    type="tel"
                    required
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    placeholder="e.g. +964 750 000 0000"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Email Address
                  </label>
                  <input 
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="e.g. rma@vendor.com"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Warehouse / Office Address
                  </label>
                  <input 
                    type="text"
                    value={address}
                    onChange={(e) => setAddress(e.target.value)}
                    placeholder="e.g. Sultan Muthafar St, Erbil, Iraq"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Accrued Store Credit Balance ($)
                  </label>
                  <input 
                    type="number"
                    step="0.01"
                    value={creditBalance}
                    onChange={(e) => setCreditBalance(parseFloat(e.target.value) || 0)}
                    placeholder="0.00"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs font-black outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-[10px] font-bold text-gray-700 uppercase mb-1">
                    Notes & Warranty Terms
                  </label>
                  <input 
                    type="text"
                    value={notes}
                    onChange={(e) => setNotes(e.target.value)}
                    placeholder="e.g. 48-hour RMA swap policy"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl p-2.5 text-xs outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>
              </div>

              <div className="flex justify-end gap-2 pt-3 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setIsAddMode(false)}
                  disabled={saving}
                  className="px-4 py-2 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={saving}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2 rounded-xl text-xs font-black uppercase tracking-wider shadow-md"
                >
                  {saving ? 'Saving...' : editingSupplier ? 'Update Supplier' : 'Save Supplier'}
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex items-center justify-between">
          <span className="text-xs text-gray-500">
            Total Suppliers: <strong className="text-gray-900 font-bold">{suppliers.length}</strong>
          </span>
          <button
            onClick={onClose}
            className="bg-gray-900 hover:bg-black text-white px-5 py-2 rounded-xl text-xs font-bold"
          >
            Close Directory
          </button>
        </div>
      </motion.div>
    </div>
  );
}
