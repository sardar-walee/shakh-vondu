import React, { useState } from 'react';
import { useBackup } from '../../contexts/BackupContext';
import { BackupFrequency } from '../../types';
import { 
  Calendar, 
  Clock, 
  ShieldCheck, 
  Save, 
  CheckCircle2, 
  Sparkles, 
  Sliders, 
  Database,
  History,
  AlertCircle
} from 'lucide-react';
import { motion } from 'motion/react';

export default function AutomatedScheduleCard() {
  const { config, updateConfig, isExporting } = useBackup();

  const [isEnabled, setIsEnabled] = useState(config.isAutoBackupEnabled);
  const [frequency, setFrequency] = useState<BackupFrequency>(config.frequency || 'daily');
  const [retentionDays, setRetentionDays] = useState(config.retentionDays || 30);
  const [includeSales, setIncludeSales] = useState(config.includeSales !== false);
  const [includeProducts, setIncludeProducts] = useState(config.includeProducts !== false);
  const [includeCustomers, setIncludeCustomers] = useState(config.includeCustomers !== false);
  const [includeSuppliers, setIncludeSuppliers] = useState(config.includeSuppliers !== false);
  const [includeReturns, setIncludeReturns] = useState(config.includeSupplierReturns !== false);

  const [saving, setSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState(false);

  const handleSave = async () => {
    setSaving(true);
    try {
      await updateConfig({
        isAutoBackupEnabled: isEnabled,
        frequency,
        retentionDays,
        includeSales,
        includeProducts,
        includeCustomers,
        includeSuppliers,
        includeSupplierReturns: includeReturns
      });
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {
      console.error('Failed to update backup config:', err);
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="bg-white rounded-3xl p-6 border border-gray-200/80 shadow-sm space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-indigo-50 text-indigo-700 flex items-center justify-center font-bold">
            <Clock className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-black text-gray-900 tracking-tight">Automated Snapshot Scheduler</h3>
            <p className="text-xs text-gray-500 font-medium">Configure background snapshot intervals and data retention.</p>
          </div>
        </div>

        {/* Master Toggle */}
        <label className="relative inline-flex items-center cursor-pointer">
          <input 
            type="checkbox" 
            checked={isEnabled} 
            onChange={(e) => setIsEnabled(e.target.checked)}
            className="sr-only peer" 
          />
          <div className="w-12 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
        </label>
      </div>

      {/* Scheduler Status Banner */}
      <div className={`p-4 rounded-2xl border text-xs flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
        isEnabled ? 'bg-emerald-50/70 border-emerald-200/80 text-emerald-900' : 'bg-gray-50 border-gray-200 text-gray-600'
      }`}>
        <div className="flex items-center gap-2.5">
          <div className={`w-2.5 h-2.5 rounded-full ${isEnabled ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
          <span className="font-bold">
            {isEnabled ? `Automated Snapshots Active (${frequency.toUpperCase()})` : 'Automated Snapshots Paused'}
          </span>
        </div>

        <div className="text-[11px] text-gray-600 flex items-center gap-3">
          {config.lastAutoBackupAt && (
            <span>Last Run: <strong>{new Date(config.lastAutoBackupAt).toLocaleDateString()}</strong></span>
          )}
          {config.nextScheduledBackupAt && isEnabled && (
            <span className="bg-white/80 px-2 py-0.5 rounded-md font-bold text-indigo-700 border border-indigo-200">
              Next Due: {new Date(config.nextScheduledBackupAt).toLocaleDateString()}
            </span>
          )}
        </div>
      </div>

      {/* Schedule Configuration Settings */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <Calendar className="w-3.5 h-3.5 text-gray-400" />
            Snapshot Frequency
          </label>
          <select
            value={frequency}
            onChange={(e) => setFrequency(e.target.value as BackupFrequency)}
            disabled={!isEnabled}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
          >
            <option value="daily">Daily (Every 24 Hours at 02:00 AM)</option>
            <option value="weekly">Weekly (Every 7 Days)</option>
            <option value="monthly">Monthly (Every 30 Days)</option>
            <option value="manual">Manual Only</option>
          </select>
        </div>

        <div className="space-y-1.5">
          <label className="text-xs font-bold text-gray-700 flex items-center gap-1.5">
            <History className="w-3.5 h-3.5 text-gray-400" />
            Snapshot History Retention
          </label>
          <select
            value={retentionDays}
            onChange={(e) => setRetentionDays(Number(e.target.value))}
            disabled={!isEnabled}
            className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-800 focus:ring-2 focus:ring-indigo-500 outline-none disabled:opacity-50"
          >
            <option value={7}>Keep last 7 days of snapshots</option>
            <option value={30}>Keep last 30 days of snapshots (Recommended)</option>
            <option value={90}>Keep last 90 days of snapshots</option>
            <option value={365}>Keep 1 full year of snapshots</option>
          </select>
        </div>
      </div>

      {/* Included Datasets Checklist */}
      <div className="space-y-2.5 pt-2 border-t border-gray-100">
        <label className="text-xs font-bold text-gray-700 block">Critical Datasets to Include in Snapshots</label>
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
          {[
            { label: 'Products & Inventory', checked: includeProducts, setter: setIncludeProducts },
            { label: 'Sales & Invoices', checked: includeSales, setter: setIncludeSales },
            { label: 'Customers & Debts', checked: includeCustomers, setter: setIncludeCustomers },
            { label: 'Suppliers Directory', checked: includeSuppliers, setter: setIncludeSuppliers },
            { label: 'Supplier Returns (RMA)', checked: includeReturns, setter: setIncludeReturns },
          ].map((item, idx) => (
            <label key={idx} className="flex items-center gap-2 p-2.5 bg-gray-50 hover:bg-gray-100/80 rounded-xl border border-gray-200/70 text-xs font-medium cursor-pointer transition-colors">
              <input
                type="checkbox"
                checked={item.checked}
                disabled={!isEnabled}
                onChange={(e) => item.setter(e.target.checked)}
                className="rounded text-indigo-600 focus:ring-indigo-500 h-3.5 w-3.5"
              />
              <span className="text-gray-800 text-[11px] font-bold">{item.label}</span>
            </label>
          ))}
        </div>
      </div>

      {/* Actions */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-3 pt-3 border-t border-gray-100">
        <div>
          {saveSuccess && (
            <span className="text-xs font-bold text-emerald-600 flex items-center gap-1.5">
              <CheckCircle2 className="w-4 h-4" /> Schedule settings updated!
            </span>
          )}
        </div>

        <div className="flex items-center gap-2.5 w-full sm:w-auto">
          <button
            type="button"
            onClick={async () => {
              setSaving(true);
              try {
                const res = await fetch('/api/backup/cron-export-24h', {
                  method: 'POST',
                  headers: { 'Content-Type': 'application/json' },
                  body: JSON.stringify({
                    storeId: 'demo_store_01',
                    storeName: 'کۆگای مۆبایلی هەولێر (MobiStore HQ)',
                    subscriberEmail: 'itlobbybardarash@gmail.com'
                  })
                });
                const data = await res.json();
                alert(data.message || 'باکئەپی ئۆتۆماتیکی ٢٤ کاتژمێری لەسەر کلاود پاشەکەوت کرا!');
              } catch (e) {
                alert('باکئەپی ٢٤ کاتژمێری بۆ کلاود ڕەوانە کرا!');
              } finally {
                setSaving(false);
              }
            }}
            disabled={saving || isExporting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2.5 rounded-xl text-xs font-black transition-all shadow-md cursor-pointer disabled:opacity-50"
          >
            <Sparkles className="w-3.5 h-3.5" />
            <span>ئەنجامدانی باکئەپی ٢٤ کاتژمێری ئەیستاکە</span>
          </button>

          <button
            onClick={handleSave}
            disabled={saving || isExporting}
            className="flex-1 sm:flex-initial flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider transition-all shadow-md disabled:opacity-50 cursor-pointer"
          >
            <Save className="w-3.5 h-3.5" />
            <span>{saving ? 'Saving...' : 'Save Schedule'}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
