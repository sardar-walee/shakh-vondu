import React from 'react';
import { usePermissions } from '../../contexts/PermissionsContext';
import { ShieldCheck, Eye, X, ArrowRight, UserCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

export default function RoleSimulationBanner() {
  const { isSimulating, simulatedRole, actualRole, setSimulatedRole } = usePermissions();

  if (!isSimulating || !simulatedRole) return null;

  return (
    <div className="bg-gradient-to-r from-amber-600 via-orange-600 to-amber-700 text-white px-4 py-2 text-xs font-medium shadow-md sticky top-0 z-50 flex items-center justify-between">
      <div className="flex items-center gap-2.5">
        <div className="w-6 h-6 rounded-lg bg-white/20 flex items-center justify-center font-bold">
          <Eye className="w-3.5 h-3.5 text-white" />
        </div>
        <div>
          <span className="font-black uppercase tracking-wider text-[11px] bg-white text-amber-900 px-2 py-0.5 rounded-full mr-2">
            Role Simulation Active
          </span>
          <span>
            You are previewing MobiStore as <strong className="font-black underline capitalize text-white">{simulatedRole.replace(/_/g, ' ')}</strong> (Actual: {actualRole}). UI navigation & buttons are restricted accordingly.
          </span>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={() => setSimulatedRole(null)}
          className="bg-white hover:bg-amber-50 text-amber-900 px-3 py-1 rounded-lg text-xs font-black uppercase tracking-wider transition-colors shadow-sm"
        >
          Exit Simulation
        </button>
      </div>
    </div>
  );
}
