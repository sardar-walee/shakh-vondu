import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import PermissionsMatrixView from '../components/permissions/PermissionsMatrixView';
import StaffRosterView from '../components/permissions/StaffRosterView';
import { usePermissions } from '../contexts/PermissionsContext';
import { useTranslation } from 'react-i18next';
import { 
  ShieldCheck, 
  Users, 
  Key, 
  History, 
  Sliders, 
  Eye, 
  Sparkles,
  Lock,
  ArrowRight,
  ShieldAlert
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import PermissionGate from '../components/auth/PermissionGate';
import UnauthorizedAccessCard from '../components/auth/UnauthorizedAccessCard';

export default function PermissionsPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { currentRole, actualRole, isSimulating, setSimulatedRole, hasPermission } = usePermissions();

  const [activeTab, setActiveTab] = useState<'matrix' | 'staff' | 'audit'>('matrix');

  if (!hasPermission('settings:permissions') && !hasPermission('settings:store_profile')) {
    return (
      <DashboardLayout>
        <UnauthorizedAccessCard 
          requiredPermission="settings:permissions" 
          routeName="Role Permissions & Staff Access" 
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-indigo-200">
                Security & RBAC Controls
              </span>
              {isSimulating && (
                <span className="bg-amber-100 text-amber-900 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-amber-200 animate-pulse">
                  Simulation Mode Active
                </span>
              )}
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Permissions & Role Access</h1>
            <p className="text-xs text-gray-500 font-medium">
              Map system roles (Manager, Cashier, Technician, Clerk) to granular feature capabilities and enforce zero-trust route guards.
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate('/settings')}
              className="bg-white hover:bg-gray-50 text-gray-700 border border-gray-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              Back to Settings
            </button>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-gray-200 pb-2">
          {[
            { id: 'matrix', label: 'Role Permissions Matrix', icon: Sliders },
            { id: 'staff', label: 'Staff Roster & Assignments', icon: Users },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-5 py-2.5 rounded-2xl text-xs font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-md shadow-indigo-100'
                  : 'text-gray-600 bg-white hover:bg-gray-100 border border-gray-200'
              }`}
            >
              <tab.icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div>
          {activeTab === 'matrix' && <PermissionsMatrixView />}
          {activeTab === 'staff' && <StaffRosterView />}
        </div>
      </div>
    </DashboardLayout>
  );
}
