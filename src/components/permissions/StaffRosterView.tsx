import React, { useState } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useStore } from '../../contexts/StoreContext';
import { StaffMember, UserRole, PermissionKey } from '../../types';
import { PERMISSION_DEFINITIONS } from '../../lib/permissions';
import { 
  UserPlus, 
  Users, 
  Shield, 
  Mail, 
  Phone, 
  MapPin, 
  Edit3, 
  Trash2, 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  Check, 
  X,
  Search,
  KeyRound
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function StaffRosterView() {
  const { staffList, saveStaffMember, deleteStaffMember, setSimulatedRole } = usePermissions();
  const { store } = useStore();

  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingStaff, setEditingStaff] = useState<Partial<StaffMember> | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [selectedCustomPerms, setSelectedCustomPerms] = useState<PermissionKey[]>([]);

  // Demo initial staff members if list is empty
  const displayStaff = staffList.length > 0 ? staffList : [
    {
      id: 'staff-1',
      displayName: 'Ahmed Barzani',
      email: 'ahmed@mobistore.com',
      phone: '+964 750 443 1290',
      role: 'manager' as UserRole,
      branchName: 'Erbil Downtown Branch',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'staff-2',
      displayName: 'Soran Ali',
      email: 'soran.pos@mobistore.com',
      phone: '+964 770 128 9012',
      role: 'cashier' as UserRole,
      branchName: 'Erbil Downtown Branch',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'staff-3',
      displayName: 'Zana Mustafa',
      email: 'zana.tech@mobistore.com',
      phone: '+964 750 882 1100',
      role: 'technician' as UserRole,
      branchName: 'Repair & Lab HQ',
      isActive: true,
      createdAt: new Date().toISOString()
    },
    {
      id: 'staff-4',
      displayName: 'Rebwar Karim',
      email: 'rebwar.stock@mobistore.com',
      phone: '+964 750 991 3322',
      role: 'inventory_clerk' as UserRole,
      branchName: 'Central Warehouse',
      isActive: true,
      createdAt: new Date().toISOString()
    }
  ];

  const filteredStaff = displayStaff.filter(s => 
    s.displayName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.role.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleOpenAdd = () => {
    setEditingStaff({
      displayName: '',
      email: '',
      phone: '',
      role: 'cashier',
      branchName: store?.name || 'Main Branch',
      isActive: true,
      customPermissions: []
    });
    setSelectedCustomPerms([]);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (staff: StaffMember) => {
    setEditingStaff(staff);
    setSelectedCustomPerms(staff.customPermissions || []);
    setIsModalOpen(true);
  };

  const handleSaveStaff = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingStaff?.displayName || !editingStaff?.email) return;

    setSubmitting(true);
    try {
      await saveStaffMember({
        ...editingStaff,
        customPermissions: selectedCustomPerms
      });
      setIsModalOpen(false);
      setEditingStaff(null);
    } catch (err) {
      console.error('Failed to save staff:', err);
    } finally {
      setSubmitting(false);
    }
  };

  const handleDelete = async (staffId: string) => {
    if (confirm('Are you sure you want to deactivate this staff member?')) {
      await deleteStaffMember(staffId);
    }
  };

  return (
    <div className="space-y-6">
      {/* Top Action Bar */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div className="relative flex-1 max-w-sm w-full">
          <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search staff by name, email, or role..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-2xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none shadow-sm"
          />
        </div>

        <button
          onClick={handleOpenAdd}
          className="flex items-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-5 py-2.5 rounded-2xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-100"
        >
          <UserPlus className="w-4 h-4" />
          Add Staff Member
        </button>
      </div>

      {/* Staff Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredStaff.map((staff) => {
          const roleBadgeColor = 
            staff.role === 'owner' ? 'bg-amber-100 text-amber-800 border-amber-200' :
            staff.role === 'manager' ? 'bg-indigo-100 text-indigo-800 border-indigo-200' :
            staff.role === 'cashier' ? 'bg-emerald-100 text-emerald-800 border-emerald-200' :
            staff.role === 'technician' ? 'bg-purple-100 text-purple-800 border-purple-200' :
            'bg-blue-100 text-blue-800 border-blue-200';

          return (
            <div 
              key={staff.id} 
              className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-gray-900 to-gray-700 text-white flex items-center justify-center font-black text-sm shadow-md">
                    {staff.displayName.slice(0, 2).toUpperCase()}
                  </div>
                  <div>
                    <h4 className="font-black text-sm text-gray-900 leading-tight">{staff.displayName}</h4>
                    <p className="text-[11px] text-gray-400 font-medium">{staff.email}</p>
                    {staff.phone && (
                      <p className="text-[10px] text-gray-500 font-mono mt-0.5">{staff.phone}</p>
                    )}
                  </div>
                </div>

                <div className="flex flex-col items-end gap-1.5">
                  <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${roleBadgeColor}`}>
                    {staff.role.replace(/_/g, ' ')}
                  </span>
                  {staff.isActive ? (
                    <span className="text-[9px] font-bold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span> Active
                    </span>
                  ) : (
                    <span className="text-[9px] font-bold text-rose-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-500"></span> Inactive
                    </span>
                  )}
                </div>
              </div>

              {/* Branch and Capabilities */}
              <div className="bg-gray-50 p-3 rounded-2xl border border-gray-100 flex items-center justify-between text-xs">
                <div className="flex items-center gap-1.5 text-gray-600">
                  <MapPin className="w-3.5 h-3.5 text-gray-400" />
                  <span className="font-medium text-[11px]">{staff.branchName || 'HQ Store'}</span>
                </div>
                <button
                  onClick={() => setSimulatedRole(staff.role)}
                  className="text-[10px] font-black uppercase tracking-wider text-indigo-600 hover:underline"
                >
                  Simulate Role &rarr;
                </button>
              </div>

              {/* Card Actions */}
              <div className="pt-2 border-t border-gray-100 flex items-center justify-between">
                <span className="text-[10px] text-gray-400">
                  Registered: {new Date(staff.createdAt).toLocaleDateString()}
                </span>

                <div className="flex items-center gap-1.5">
                  <button
                    onClick={() => handleOpenEdit(staff as StaffMember)}
                    className="p-2 rounded-xl text-gray-500 hover:text-indigo-600 hover:bg-indigo-50 transition-colors"
                    title="Edit Staff Member"
                  >
                    <Edit3 className="w-4 h-4" />
                  </button>
                  {staff.role !== 'owner' && (
                    <button
                      onClick={() => handleDelete(staff.id)}
                      className="p-2 rounded-xl text-gray-500 hover:text-rose-600 hover:bg-rose-50 transition-colors"
                      title="Deactivate Staff"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Add / Edit Staff Modal */}
      <AnimatePresence>
        {isModalOpen && editingStaff && (
          <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl border border-gray-100 flex flex-col max-h-[90vh]"
            >
              <div className="px-6 py-4 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center">
                    <UserPlus className="w-4 h-4" />
                  </div>
                  <h3 className="font-black text-sm text-gray-900">
                    {editingStaff.id ? 'Edit Staff Member' : 'Register New Staff Member'}
                  </h3>
                </div>
                <button
                  onClick={() => setIsModalOpen(false)}
                  className="p-1.5 text-gray-400 hover:text-gray-600 rounded-xl hover:bg-gray-100"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              <form onSubmit={handleSaveStaff} className="p-6 space-y-4 overflow-y-auto">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-gray-700">Full Name *</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Karwan Jamal"
                    value={editingStaff.displayName || ''}
                    onChange={(e) => setEditingStaff(prev => ({ ...prev, displayName: e.target.value }))}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Email Address *</label>
                    <input
                      type="email"
                      required
                      placeholder="staff@mobistore.com"
                      value={editingStaff.email || ''}
                      onChange={(e) => setEditingStaff(prev => ({ ...prev, email: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Phone Number</label>
                    <input
                      type="text"
                      placeholder="+964 750 ..."
                      value={editingStaff.phone || ''}
                      onChange={(e) => setEditingStaff(prev => ({ ...prev, phone: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Role & Access Level *</label>
                    <select
                      value={editingStaff.role || 'cashier'}
                      onChange={(e) => setEditingStaff(prev => ({ ...prev, role: e.target.value as UserRole }))}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold focus:ring-2 focus:ring-indigo-500 outline-none"
                    >
                      <option value="cashier">Cashier (POS & Sales)</option>
                      <option value="manager">Store Manager (Operations)</option>
                      <option value="technician">Technician (Repairs & RMA)</option>
                      <option value="inventory_clerk">Inventory Clerk (Stock)</option>
                      <option value="owner">Co-Owner (Master Access)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Assigned Branch</label>
                    <input
                      type="text"
                      placeholder="e.g. Erbil Downtown"
                      value={editingStaff.branchName || ''}
                      onChange={(e) => setEditingStaff(prev => ({ ...prev, branchName: e.target.value }))}
                      className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
                    />
                  </div>
                </div>

                {/* Additional Individual Override Permissions */}
                <div className="pt-2 space-y-2">
                  <label className="text-xs font-bold text-gray-700 flex items-center justify-between">
                    <span>Individual Permission Overrides</span>
                    <span className="text-[10px] text-gray-400 font-normal">Optional specific grants</span>
                  </label>
                  <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 max-h-36 overflow-y-auto space-y-2 text-xs">
                    {PERMISSION_DEFINITIONS.map(p => (
                      <label key={p.key} className="flex items-center gap-2 cursor-pointer text-gray-700 hover:text-indigo-600">
                        <input
                          type="checkbox"
                          checked={selectedCustomPerms.includes(p.key)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setSelectedCustomPerms(prev => [...prev, p.key]);
                            } else {
                              setSelectedCustomPerms(prev => prev.filter(k => k !== p.key));
                            }
                          }}
                          className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
                        />
                        <span className="font-medium text-[11px]">{p.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setIsModalOpen(false)}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-600 hover:bg-gray-50"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={submitting}
                    className="bg-indigo-600 hover:bg-indigo-700 text-white px-6 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-100"
                  >
                    {submitting ? 'Saving...' : editingStaff.id ? 'Update Staff' : 'Add Staff'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
