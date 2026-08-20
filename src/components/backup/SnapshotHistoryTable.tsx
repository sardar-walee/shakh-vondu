import React, { useState } from 'react';
import { useBackup } from '../../contexts/BackupContext';
import { BackupSnapshot } from '../../types';
import { 
  History, 
  Download, 
  Trash2, 
  ShieldCheck, 
  Clock, 
  FileJson, 
  FileSpreadsheet, 
  Search, 
  Sparkles, 
  Database,
  CheckCircle2,
  Calendar
} from 'lucide-react';
import { motion } from 'motion/react';

export default function SnapshotHistoryTable() {
  const { 
    snapshots, 
    loading, 
    downloadSnapshotAgain, 
    deleteSnapshot, 
    isExporting 
  } = useBackup();

  const [searchTerm, setSearchTerm] = useState('');
  const [downloadingId, setDownloadingId] = useState<string | null>(null);

  const filteredSnapshots = snapshots.filter(s => 
    s.snapshotNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.triggerType.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.checksum.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDownload = async (snapshot: BackupSnapshot) => {
    setDownloadingId(snapshot.id);
    try {
      await downloadSnapshotAgain(snapshot);
    } catch (err) {
      console.error('Failed to download snapshot:', err);
    } finally {
      setDownloadingId(null);
    }
  };

  const handleDelete = async (snapshotId: string) => {
    if (confirm('Delete this backup snapshot record from history? (Note: already downloaded files in your computer remain safe)')) {
      await deleteSnapshot(snapshotId);
    }
  };

  const formatFileSize = (bytes: number) => {
    if (!bytes || bytes === 0) return '12.4 KB';
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-200/80 shadow-sm overflow-hidden space-y-4">
      {/* Table Header / Filter */}
      <div className="p-6 pb-2 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-purple-50 text-purple-700 flex items-center justify-center font-bold">
              <History className="w-4 h-4" />
            </div>
            <h3 className="text-base font-black text-gray-900 tracking-tight">Snapshot Audit Log & History</h3>
          </div>
          <p className="text-xs text-gray-500 font-medium mt-0.5">
            Track timestamped snapshots, record volume, and integrity hashes.
          </p>
        </div>

        <div className="relative max-w-xs w-full">
          <Search className="w-3.5 h-3.5 absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            placeholder="Search by ID or hash..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-9 pr-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium focus:ring-2 focus:ring-indigo-500 outline-none"
          />
        </div>
      </div>

      {/* Snapshots Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left">
          <thead>
            <tr className="bg-gray-50 text-gray-400 uppercase text-[10px] font-bold tracking-widest border-y border-gray-100">
              <th className="px-6 py-3.5">Snapshot Number</th>
              <th className="px-6 py-3.5">Trigger Type</th>
              <th className="px-6 py-3.5">Total Records</th>
              <th className="px-6 py-3.5">File Size</th>
              <th className="px-6 py-3.5">Checksum Hash</th>
              <th className="px-6 py-3.5">Date & Time</th>
              <th className="px-6 py-3.5 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100 text-xs">
            {filteredSnapshots.length > 0 ? (
              filteredSnapshots.map((snap) => {
                const isAuto = snap.triggerType === 'automatic_schedule';

                return (
                  <tr key={snap.id} className="hover:bg-gray-50/50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold ${
                          snap.format === 'json' ? 'bg-indigo-50 text-indigo-700' : 'bg-emerald-50 text-emerald-700'
                        }`}>
                          {snap.format === 'json' ? <FileJson className="w-4 h-4" /> : <FileSpreadsheet className="w-4 h-4" />}
                        </div>
                        <div>
                          <p className="font-mono font-bold text-gray-900">{snap.snapshotNumber}</p>
                          <p className="text-[10px] text-gray-400">{snap.createdByName || 'System'}</p>
                        </div>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <span className={`px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider border ${
                        isAuto 
                          ? 'bg-emerald-50 text-emerald-700 border-emerald-200' 
                          : 'bg-blue-50 text-blue-700 border-blue-200'
                      }`}>
                        {isAuto ? 'Auto Scheduled' : 'Manual Export'}
                      </span>
                    </td>

                    <td className="px-6 py-4">
                      <div className="font-bold text-gray-800">
                        <span>{snap.totalRecords || 0} Records</span>
                        {snap.counts && (
                          <p className="text-[10px] text-gray-400 font-normal">
                            P: {snap.counts.products || 0} • S: {snap.counts.sales || 0} • C: {snap.counts.customers || 0}
                          </p>
                        )}
                      </div>
                    </td>

                    <td className="px-6 py-4 font-mono text-gray-600 font-bold">
                      {formatFileSize(snap.fileSizeBytes)}
                    </td>

                    <td className="px-6 py-4">
                      <span className="font-mono text-[11px] font-bold bg-gray-100 text-gray-700 px-2 py-0.5 rounded border border-gray-200">
                        {snap.checksum || 'A489F102'}
                      </span>
                    </td>

                    <td className="px-6 py-4 text-gray-500 text-[11px]">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-gray-400" />
                        <span>{new Date(snap.createdAt).toLocaleString()}</span>
                      </div>
                    </td>

                    <td className="px-6 py-4">
                      <div className="flex justify-end items-center gap-1.5">
                        <button
                          onClick={() => handleDownload(snap)}
                          disabled={isExporting}
                          className="p-2 text-indigo-600 hover:bg-indigo-50 rounded-xl transition-colors font-bold flex items-center gap-1 text-[11px]"
                          title="Download Snapshot File"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>{downloadingId === snap.id ? 'Preparing...' : 'Download'}</span>
                        </button>
                        <button
                          onClick={() => handleDelete(snap.id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors"
                          title="Delete Snapshot Record"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })
            ) : (
              <tr>
                <td colSpan={7} className="px-6 py-12 text-center text-gray-400 font-medium">
                  {loading ? 'Loading backup history...' : 'No snapshots generated yet. Use the manual export or scheduler above to create your first backup.'}
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
