import React from 'react';
import { useNavigate } from 'react-router-dom';
import { usePermissions } from '../../contexts/PermissionsContext';
import { ShieldAlert, ArrowLeft, ShoppingCart, LayoutDashboard } from 'lucide-react';
import { motion } from 'motion/react';
import { getDefaultFallbackRoute } from '../../lib/permissions';

interface UnauthorizedAccessCardProps {
  requiredPermission?: string;
  routeName?: string;
}

export default function UnauthorizedAccessCard({
  requiredPermission,
  routeName = 'this page'
}: UnauthorizedAccessCardProps) {
  const navigate = useNavigate();
  const { currentRole, isSimulating, setSimulatedRole } = usePermissions();

  const fallbackRoute = getDefaultFallbackRoute(currentRole);

  return (
    <div className="min-h-[70vh] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        className="bg-white rounded-3xl p-8 max-w-md w-full text-center shadow-xl border border-gray-100 space-y-5"
      >
        <div className="w-16 h-16 rounded-3xl bg-rose-50 text-rose-600 mx-auto flex items-center justify-center border border-rose-100 shadow-inner">
          <ShieldAlert className="w-8 h-8" />
        </div>

        <div className="space-y-1.5">
          <h2 className="text-xl font-black text-gray-900 tracking-tight">Access Restricted</h2>
          <p className="text-xs text-gray-500 leading-relaxed">
            Your current role (<strong className="capitalize text-gray-800">{currentRole.replace(/_/g, ' ')}</strong>) does not have permission to access {routeName}.
          </p>
        </div>

        {requiredPermission && (
          <div className="bg-gray-50 p-3 rounded-2xl border border-gray-200 text-left">
            <span className="text-[10px] font-bold text-gray-400 uppercase block">Required Capability</span>
            <code className="text-xs font-mono font-bold text-indigo-700">{requiredPermission}</code>
          </div>
        )}

        {isSimulating && (
          <div className="bg-amber-50 border border-amber-200 p-3 rounded-2xl text-xs text-amber-800 space-y-2">
            <p className="font-bold">You are currently in Role Preview Mode</p>
            <button
              onClick={() => setSimulatedRole(null)}
              className="w-full bg-amber-600 hover:bg-amber-700 text-white py-1.5 px-3 rounded-xl font-black text-[11px] uppercase tracking-wider transition-colors"
            >
              Exit Role Simulation
            </button>
          </div>
        )}

        <div className="pt-2 flex flex-col sm:flex-row gap-2.5 justify-center">
          <button
            onClick={() => navigate(-1)}
            className="flex-1 px-4 py-2.5 rounded-xl border border-gray-200 text-xs font-bold text-gray-700 hover:bg-gray-50 flex items-center justify-center gap-1.5"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            Go Back
          </button>
          <button
            onClick={() => navigate(fallbackRoute)}
            className="flex-1 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider shadow-md shadow-indigo-100 flex items-center justify-center gap-1.5"
          >
            {currentRole === 'cashier' ? <ShoppingCart className="w-3.5 h-3.5" /> : <LayoutDashboard className="w-3.5 h-3.5" />}
            Go to {currentRole === 'cashier' ? 'POS' : 'Dashboard'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}
