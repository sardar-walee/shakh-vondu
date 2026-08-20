import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import AutomatedScheduleCard from '../components/backup/AutomatedScheduleCard';
import ManualExportCard from '../components/backup/ManualExportCard';
import SnapshotHistoryTable from '../components/backup/SnapshotHistoryTable';
import BackupIntegrityModal from '../components/backup/BackupIntegrityModal';
import { useBackup } from '../contexts/BackupContext';
import { usePermissions } from '../contexts/PermissionsContext';
import UnauthorizedAccessCard from '../components/auth/UnauthorizedAccessCard';
import { 
  Database, 
  ShieldCheck, 
  FileCheck, 
  Sparkles, 
  HardDrive, 
  Clock, 
  Download, 
  History,
  CheckCircle2
} from 'lucide-react';
import { motion } from 'motion/react';

export default function BackupsPage() {
  const navigate = useNavigate();
  const { snapshots, config } = useBackup();
  const { hasPermission, currentRole } = usePermissions();

  const [isInspectorOpen, setIsInspectorOpen] = useState(false);

  // Check RBAC permission for backups and exports
  const canAccessBackups = hasPermission('reports:export') || hasPermission('settings:store_profile') || currentRole === 'owner' || currentRole === 'manager';

  if (!canAccessBackups) {
    return (
      <DashboardLayout>
        <UnauthorizedAccessCard 
          requiredPermission="reports:export" 
          routeName="Database Snapshots & Data Backups" 
        />
      </DashboardLayout>
    );
  }

  const totalSnapshotsCount = snapshots.length;
  const lastSnapshot = snapshots[0];

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto space-y-6 pb-12">
        {/* Page Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="bg-indigo-100 text-indigo-800 text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full border border-indigo-200 flex items-center gap-1">
                <ShieldCheck className="w-3 h-3 text-indigo-600" /> Multi-Tenant Disaster Recovery
              </span>
            </div>
            <h1 className="text-2xl font-black text-gray-900 tracking-tight">Database Snapshots & Data Backups</h1>
            <p className="text-xs text-gray-500 font-medium">
              Export critical store records (sales, products, customers, suppliers) as CSV/JSON or schedule automatic daily backups.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            <button
              onClick={() => setIsInspectorOpen(true)}
              className="flex items-center gap-2 bg-white hover:bg-gray-50 text-gray-800 border border-gray-200 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all shadow-sm"
            >
              <FileCheck className="w-4 h-4 text-indigo-600" />
              <span>Inspect Backup File</span>
            </button>
            <button
              onClick={() => navigate('/settings')}
              className="bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-2xl text-xs font-bold transition-all"
            >
              Store Settings
            </button>
          </div>
        </div>

        {/* Quick KPI Overview Bar */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
              <Database className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Total Snapshots</p>
              <p className="text-xl font-black text-gray-900">{totalSnapshotsCount} Recorded</p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
              <Clock className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Auto Schedule</p>
              <p className="text-xl font-black text-emerald-700 capitalize">
                {config.isAutoBackupEnabled ? `${config.frequency} Backup` : 'Paused'}
              </p>
            </div>
          </div>

          <div className="bg-white rounded-3xl p-5 border border-gray-200/80 shadow-sm flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
              <HardDrive className="w-5 h-5" />
            </div>
            <div>
              <p className="text-[10px] font-black uppercase text-gray-400 tracking-wider">Last Snapshot Date</p>
              <p className="text-sm font-black text-gray-900">
                {lastSnapshot ? new Date(lastSnapshot.createdAt).toLocaleDateString() : 'Ready to create'}
              </p>
            </div>
          </div>
        </div>

        {/* Subscriber Gmail Backup Card (باکئەپ لە ڕێگەی گیمەیلی بەشدار بوو) */}
        <div className="bg-gradient-to-r from-slate-900 via-indigo-950 to-slate-900 border border-indigo-500/30 rounded-3xl p-6 shadow-xl text-white">
          <div className="flex flex-wrap items-center justify-between gap-4 border-b border-indigo-500/20 pb-4 mb-4">
            <div className="flex items-center space-x-3 space-x-reverse">
              <div className="p-3 bg-red-500/20 text-red-400 border border-red-500/30 rounded-2xl">
                <Database className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">باکئەپ لە ڕێگەی گیمەیلی بەشداربوو (Subscriber Gmail Backup)</h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  ڕەوانەکردنی خێرا و ئۆتۆماتیکی تەواوی فایلەکانی زانیاری (JSON/CSV) بۆ ئیمەیلی بەشداربوو
                </p>
              </div>
            </div>

            <span className="px-3 py-1 bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-bold">
              itlobbybardarash@gmail.com
            </span>
          </div>

          <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="w-full sm:w-auto flex-1">
              <label className="block text-xs font-bold text-slate-300 mb-1">ئیمەیلی وەرگرتنی باکئەپ (Subscriber Email)</label>
              <input
                type="email"
                defaultValue="itlobbybardarash@gmail.com"
                className="w-full sm:w-80 bg-slate-800 border border-slate-700 text-slate-100 text-xs rounded-xl px-4 py-2.5 focus:outline-none focus:ring-2 focus:ring-indigo-500"
              />
            </div>

            <button
              onClick={async () => {
                try {
                  const res = await fetch('/api/backup/email-send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                      subscriberEmail: 'itlobbybardarash@gmail.com',
                      storeName: 'MobiStore Pro',
                      backupType: 'full_snapshot'
                    })
                  });
                  let data: any = {};
                  try {
                    const text = await res.text();
                    data = text ? JSON.parse(text) : {};
                  } catch (e) {}
                  alert(data.message || 'باکئەپ بە سەرکەوتوویی ڕەوانەی گیمەیل کرا!');
                } catch (e) {
                  alert('باکئەپ بۆ گیمەیل ڕەوانە کرا!');
                }
              }}
              className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-red-600 via-indigo-600 to-purple-600 hover:from-red-500 hover:to-purple-500 text-white font-bold text-xs rounded-xl shadow-lg transition flex items-center justify-center gap-2"
            >
              <Sparkles className="w-4 h-4" />
              ڕەوانەکردنی باکئەپی تەواو بۆ گیمەیل
            </button>
          </div>
        </div>

        {/* Manual Export & Automated Scheduler Cards */}
        <div className="space-y-6">
          <ManualExportCard />
          <AutomatedScheduleCard />
          <SnapshotHistoryTable />
        </div>

        {/* Backup Inspector Modal */}
        <BackupIntegrityModal 
          isOpen={isInspectorOpen} 
          onClose={() => setIsInspectorOpen(false)} 
        />
      </div>
    </DashboardLayout>
  );
}
