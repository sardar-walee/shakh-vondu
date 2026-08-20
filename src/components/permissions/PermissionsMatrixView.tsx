import React, { useState, useEffect } from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useAuth } from '../../contexts/AuthContext';
import { UserRole, PermissionKey } from '../../types';
import { 
  PERMISSION_CATEGORIES, 
  PERMISSION_DEFINITIONS, 
  DEFAULT_ROLE_PERMISSIONS 
} from '../../lib/permissions';
import { 
  Shield, 
  Check, 
  RotateCcw, 
  Save, 
  Eye, 
  AlertTriangle, 
  Users, 
  Sparkles, 
  CheckCircle2, 
  Sliders, 
  ShieldCheck,
  Lock,
  Unlock,
  Info
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

const ROLE_INFO: Record<UserRole, { title: string; subtitle: string; iconBg: string; badgeColor: string; description: string }> = {
  owner: {
    title: 'Store Owner',
    subtitle: 'Full Master Access',
    iconBg: 'bg-amber-100 text-amber-800',
    badgeColor: 'bg-amber-50 text-amber-700 border-amber-200',
    description: 'Unrestricted master access to all stores, financial ledgers, subscription billing, staff management, and system rules.'
  },
  manager: {
    title: 'Store Manager',
    subtitle: 'Operations & Management',
    iconBg: 'bg-indigo-100 text-indigo-800',
    badgeColor: 'bg-indigo-50 text-indigo-700 border-indigo-200',
    description: 'Authorized to oversee daily operations, void sales, manage inventory, view reports, and handle customer credit.'
  },
  cashier: {
    title: 'Cashier / Front-Desk',
    subtitle: 'POS Register & Checkout',
    iconBg: 'bg-emerald-100 text-emerald-800',
    badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200',
    description: 'Focused on POS sales transactions, customer lookup, barcode scanning, and loyalty point redemption.'
  },
  technician: {
    title: 'Device & RMA Technician',
    subtitle: 'Repairs & Quality Control',
    iconBg: 'bg-purple-100 text-purple-800',
    badgeColor: 'bg-purple-50 text-purple-700 border-purple-200',
    description: 'Inspects defective stock, tracks serial/IMEI hardware issues, tests devices, and logs supplier returns.'
  },
  inventory_clerk: {
    title: 'Inventory & Stock Clerk',
    subtitle: 'Warehouse & Receiving',
    iconBg: 'bg-blue-100 text-blue-800',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Manages incoming stock shipments, logs purchase costs, updates stock quantities, and handles vendor returns.'
  },
  superadmin: {
    title: 'Super Administrator',
    subtitle: 'SaaS Platform Admin',
    iconBg: 'bg-rose-100 text-rose-800',
    badgeColor: 'bg-rose-50 text-rose-700 border-rose-200',
    description: 'Global SaaS multi-tenant administrator.'
  },
  customer: {
    title: 'Customer Member',
    subtitle: 'Self-Service Portal Access',
    iconBg: 'bg-blue-100 text-blue-800',
    badgeColor: 'bg-blue-50 text-blue-700 border-blue-200',
    description: 'Self-service customer account to view personal invoices, active warranties, and loyalty points.'
  }
};

export default function PermissionsMatrixView() {
  const { customMatrix, updateRolePermissions, resetRoleToDefault, setSimulatedRole } = usePermissions();

  const [selectedRole, setSelectedRole] = useState<UserRole>('cashier');
  const [activePermissions, setActivePermissions] = useState<PermissionKey[]>([]);
  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Sync state whenever selectedRole or customMatrix changes
  useEffect(() => {
    const currentList = customMatrix[selectedRole] || DEFAULT_ROLE_PERMISSIONS[selectedRole] || [];
    setActivePermissions(currentList);
    setHasUnsavedChanges(false);
    setSaveSuccess(false);
  }, [selectedRole, customMatrix]);

  const handleTogglePermission = (key: PermissionKey) => {
    if (selectedRole === 'owner' || selectedRole === 'superadmin') return; // Owner has all permissions

    setActivePermissions(prev => {
      const exists = prev.includes(key);
      const next = exists ? prev.filter(k => k !== key) : [...prev, key];
      setHasUnsavedChanges(true);
      setSaveSuccess(false);
      return next;
    });
  };

  const handleSelectAllCategory = (catId: string, select: boolean) => {
    if (selectedRole === 'owner' || selectedRole === 'superadmin') return;

    const catKeys = PERMISSION_DEFINITIONS.filter(p => p.category === catId).map(p => p.key);
    setActivePermissions(prev => {
      let next = [...prev];
      if (select) {
        catKeys.forEach(k => {
          if (!next.includes(k)) next.push(k);
        });
      } else {
        next = next.filter(k => !catKeys.includes(k));
      }
      setHasUnsavedChanges(true);
      setSaveSuccess(false);
      return next;
    });
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateRolePermissions(selectedRole, activePermissions);
      setHasUnsavedChanges(false);
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update role permissions:', err);
    } finally {
      setSaving(false);
    }
  };

  const handleReset = async () => {
    if (confirm(`Reset permissions for ${selectedRole.toUpperCase()} to standard default configuration?`)) {
      setSaving(true);
      try {
        await resetRoleToDefault(selectedRole);
        setActivePermissions(DEFAULT_ROLE_PERMISSIONS[selectedRole] || []);
        setHasUnsavedChanges(false);
      } finally {
        setSaving(false);
      }
    }
  };

  const currentRoleInfo = ROLE_INFO[selectedRole];

  return (
    <div className="space-y-6">
      {/* Role Picker Tabs */}
      <div className="flex items-center gap-2 overflow-x-auto pb-1">
        {(['cashier', 'manager', 'technician', 'inventory_clerk', 'owner'] as UserRole[]).map((r) => {
          const info = ROLE_INFO[r];
          const isSelected = selectedRole === r;
          const assignedCount = (customMatrix[r] || DEFAULT_ROLE_PERMISSIONS[r] || []).length;

          return (
            <button
              key={r}
              onClick={() => setSelectedRole(r)}
              className={`flex items-center gap-2.5 px-4 py-3 rounded-2xl text-xs font-bold transition-all whitespace-nowrap border ${
                isSelected
                  ? 'bg-gray-900 text-white border-gray-900 shadow-md'
                  : 'bg-white text-gray-700 border-gray-200 hover:bg-gray-50'
              }`}
            >
              <div className={`w-2.5 h-2.5 rounded-full ${isSelected ? 'bg-indigo-400' : 'bg-gray-400'}`} />
              <div className="text-left">
                <p className="leading-tight">{info.title}</p>
                <p className={`text-[10px] font-normal ${isSelected ? 'text-gray-300' : 'text-gray-400'}`}>
                  {r === 'owner' ? 'All (24)' : `${assignedCount} Granted`}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Role Summary & Simulation Launcher Card */}
      <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center gap-3.5">
          <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black ${currentRoleInfo.iconBg}`}>
            <ShieldCheck className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-black text-gray-900">{currentRoleInfo.title}</h3>
              <span className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border ${currentRoleInfo.badgeColor}`}>
                {currentRoleInfo.subtitle}
              </span>
            </div>
            <p className="text-xs text-gray-500 max-w-xl mt-0.5">{currentRoleInfo.description}</p>
          </div>
        </div>

        <div className="flex items-center gap-2.5 flex-wrap">
          {selectedRole !== 'owner' && (
            <button
              onClick={() => setSimulatedRole(selectedRole)}
              className="flex items-center gap-1.5 bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 px-3.5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-sm"
              title="Test UI restrictions as this role"
            >
              <Eye className="w-3.5 h-3.5 text-amber-700" />
              Preview UI as {currentRoleInfo.title}
            </button>
          )}

          {selectedRole !== 'owner' && (
            <>
              <button
                onClick={handleReset}
                disabled={saving}
                className="flex items-center gap-1.5 bg-gray-50 hover:bg-gray-100 text-gray-700 border border-gray-200 px-3.5 py-2 rounded-xl text-xs font-bold transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5" />
                Defaults
              </button>
              <button
                onClick={handleSave}
                disabled={saving || !hasUnsavedChanges}
                className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-50 text-white px-5 py-2 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md shadow-indigo-100"
              >
                {saving ? (
                  <>
                    <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Saving...</span>
                  </>
                ) : (
                  <>
                    <Save className="w-3.5 h-3.5" />
                    <span>Save {hasUnsavedChanges ? 'Changes' : 'Matrix'}</span>
                  </>
                )}
              </button>
            </>
          )}
        </div>
      </div>

      {saveSuccess && (
        <motion.div 
          initial={{ opacity: 0, y: -5 }}
          animate={{ opacity: 1, y: 0 }}
          className="bg-emerald-50 border border-emerald-200 text-emerald-800 px-4 py-2.5 rounded-2xl text-xs flex items-center gap-2 font-bold shadow-sm"
        >
          <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
          <span>Permissions matrix for {currentRoleInfo.title} successfully updated in database and logged to audit trail.</span>
        </motion.div>
      )}

      {selectedRole === 'owner' && (
        <div className="bg-amber-50/70 border border-amber-200/80 p-4 rounded-2xl flex items-center gap-3 text-xs text-amber-900">
          <Info className="w-5 h-5 text-amber-600 shrink-0" />
          <p>
            The <strong>Store Owner</strong> role retains permanent, non-revocable master access across all modules, settings, financial ledgers, and database collections.
          </p>
        </div>
      )}

      {/* Categorized Permissions Grid */}
      <div className="space-y-4">
        {PERMISSION_CATEGORIES.map(category => {
          const categoryPermissions = PERMISSION_DEFINITIONS.filter(p => p.category === category.id);
          const activeInCat = categoryPermissions.filter(p => activePermissions.includes(p.key)).length;
          const allSelected = activeInCat === categoryPermissions.length;

          return (
            <div 
              key={category.id}
              className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden"
            >
              {/* Category Header */}
              <div className="px-6 py-3.5 bg-gray-50/80 border-b border-gray-100 flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <h4 className="text-xs font-black uppercase tracking-wider text-gray-900">
                    {category.label}
                  </h4>
                  <span className="text-[10px] font-mono font-bold bg-white text-gray-600 px-2 py-0.5 rounded-md border border-gray-200">
                    {activeInCat} / {categoryPermissions.length} Enabled
                  </span>
                </div>

                {selectedRole !== 'owner' && (
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => handleSelectAllCategory(category.id, !allSelected)}
                      className="text-[11px] font-bold text-indigo-600 hover:text-indigo-800 transition-colors"
                    >
                      {allSelected ? 'Disable All' : 'Enable All'}
                    </button>
                  </div>
                )}
              </div>

              {/* Items List */}
              <div className="divide-y divide-gray-100">
                {categoryPermissions.map((perm) => {
                  const isGranted = selectedRole === 'owner' || activePermissions.includes(perm.key);

                  return (
                    <div 
                      key={perm.key}
                      onClick={() => selectedRole !== 'owner' && handleTogglePermission(perm.key)}
                      className={`p-4 flex items-center justify-between gap-4 transition-colors ${
                        selectedRole !== 'owner' ? 'cursor-pointer hover:bg-indigo-50/30' : ''
                      } ${isGranted ? 'bg-white' : 'bg-gray-50/30 opacity-75'}`}
                    >
                      <div className="space-y-0.5 flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className={`text-xs font-bold ${isGranted ? 'text-gray-900' : 'text-gray-500'}`}>
                            {perm.label}
                          </span>
                          <span className="text-[10px] font-mono text-gray-400">({perm.key})</span>
                          {perm.dangerLevel === 'high' && (
                            <span className="text-[9px] font-black uppercase bg-rose-50 text-rose-700 border border-rose-200 px-1.5 py-0.2 rounded">
                              High Privilege
                            </span>
                          )}
                          {perm.dangerLevel === 'medium' && (
                            <span className="text-[9px] font-black uppercase bg-amber-50 text-amber-700 border border-amber-200 px-1.5 py-0.2 rounded">
                              Elevated
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-gray-500 leading-normal">{perm.description}</p>
                      </div>

                      {/* Toggle Switch */}
                      <div className="shrink-0">
                        <label className={`relative inline-flex items-center ${selectedRole === 'owner' ? 'cursor-not-allowed' : 'cursor-pointer'}`}>
                          <input 
                            type="checkbox" 
                            checked={isGranted} 
                            disabled={selectedRole === 'owner'}
                            onChange={() => handleTogglePermission(perm.key)}
                            className="sr-only peer" 
                          />
                          <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                        </label>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
