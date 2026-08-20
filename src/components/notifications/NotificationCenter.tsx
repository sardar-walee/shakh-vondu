import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useNotifications } from '../../contexts/NotificationContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { 
  Bell, 
  AlertTriangle, 
  RefreshCw, 
  Info, 
  CheckCircle2, 
  Radio, 
  Trash2, 
  CheckCheck, 
  ExternalLink, 
  X, 
  Sparkles, 
  Send,
  Package,
  CreditCard,
  ShieldAlert,
  Clock
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { NotificationType, NotificationSeverity } from '../../types';

export default function NotificationCenter() {
  const navigate = useNavigate();
  const { 
    notifications, 
    unreadCount, 
    toastNotification, 
    dismissToast, 
    markAsRead, 
    markAllAsRead, 
    deleteNotification, 
    clearAll,
    broadcastSystemUpdate
  } = useNotifications();

  const { currentRole } = usePermissions();

  const [isOpen, setIsOpen] = useState(false);
  const [filter, setFilter] = useState<'all' | 'unread' | 'low_inventory' | 'subscription_renewal' | 'system_update'>('all');
  const [isBroadcastModalOpen, setIsBroadcastModalOpen] = useState(false);
  const [broadcastTitle, setBroadcastTitle] = useState('');
  const [broadcastMessage, setBroadcastMessage] = useState('');
  const [broadcastSeverity, setBroadcastSeverity] = useState<NotificationSeverity>('urgent');
  const [broadcasting, setBroadcasting] = useState(false);

  const filteredNotifications = notifications.filter(n => {
    if (filter === 'unread') return !n.read;
    if (filter === 'low_inventory') return n.type === 'low_inventory';
    if (filter === 'subscription_renewal') return n.type === 'subscription_renewal';
    if (filter === 'system_update') return n.type === 'system_update';
    return true;
  });

  const getSeverityBadge = (severity: NotificationSeverity) => {
    switch (severity) {
      case 'urgent':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-red-100 text-red-700 border border-red-200 flex items-center gap-1"><ShieldAlert className="w-3 h-3 text-red-600" /> Urgent</span>;
      case 'warning':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-100 text-amber-800 border border-amber-200 flex items-center gap-1"><AlertTriangle className="w-3 h-3 text-amber-600" /> Warning</span>;
      case 'success':
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-emerald-100 text-emerald-800 border border-emerald-200 flex items-center gap-1"><CheckCircle2 className="w-3 h-3 text-emerald-600" /> Success</span>;
      default:
        return <span className="px-2 py-0.5 rounded-full text-[10px] font-black uppercase bg-blue-100 text-blue-800 border border-blue-200 flex items-center gap-1"><Info className="w-3 h-3 text-blue-600" /> Info</span>;
    }
  };

  const getTypeIcon = (type: NotificationType) => {
    switch (type) {
      case 'low_inventory':
        return <Package className="w-4 h-4 text-amber-600" />;
      case 'subscription_renewal':
        return <CreditCard className="w-4 h-4 text-indigo-600" />;
      case 'system_update':
        return <Radio className="w-4 h-4 text-rose-600" />;
      default:
        return <Bell className="w-4 h-4 text-blue-600" />;
    }
  };

  const handleBroadcast = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!broadcastTitle || !broadcastMessage) return;
    setBroadcasting(true);
    try {
      await broadcastSystemUpdate(broadcastTitle, broadcastMessage, broadcastSeverity);
      setIsBroadcastModalOpen(false);
      setBroadcastTitle('');
      setBroadcastMessage('');
    } catch (err) {
      console.error(err);
    } finally {
      setBroadcasting(false);
    }
  };

  return (
    <div className="relative">
      {/* Bell Button Header Icon */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="p-2 text-gray-500 hover:text-gray-900 hover:bg-gray-100 rounded-xl transition-all relative flex items-center justify-center focus:outline-none"
        title="Real-time Store Alerts & System Updates"
      >
        <Bell className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 bg-red-600 text-white font-black text-[10px] w-5 h-5 rounded-full flex items-center justify-center shadow-md animate-pulse border-2 border-white">
            {unreadCount > 9 ? '9+' : unreadCount}
          </span>
        )}
      </button>

      {/* Real-Time Dropdown Panel */}
      <AnimatePresence>
        {isOpen && (
          <>
            {/* Backdrop */}
            <div 
              className="fixed inset-0 z-40" 
              onClick={() => setIsOpen(false)} 
            />

            <motion.div
              initial={{ opacity: 0, y: -10, scale: 0.95 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              exit={{ opacity: 0, y: -10, scale: 0.95 }}
              className="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-3xl shadow-2xl border border-gray-200 z-50 overflow-hidden flex flex-col max-h-[85vh]"
            >
              {/* Header */}
              <div className="p-4 bg-gradient-to-r from-slate-900 to-indigo-950 text-white flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="p-2 bg-blue-500/20 border border-blue-400/30 rounded-xl">
                    <Radio className="w-4 h-4 text-blue-400 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-white">Real-Time Store Alerts</h3>
                    <p className="text-[10px] text-slate-400 font-medium flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                      Firestore Listener Active ({notifications.length})
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-1">
                  {(currentRole === 'owner' || currentRole === 'manager' || currentRole === 'superadmin') && (
                    <button
                      onClick={() => setIsBroadcastModalOpen(true)}
                      className="p-1.5 bg-indigo-500/30 hover:bg-indigo-500/50 text-indigo-200 rounded-lg text-xs font-bold transition flex items-center gap-1"
                      title="Send Urgent Broadcast"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-amber-300" />
                    </button>
                  )}
                  <button 
                    onClick={() => setIsOpen(false)}
                    className="p-1.5 text-slate-400 hover:text-white rounded-lg"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Filter Tabs */}
              <div className="flex items-center gap-1 p-2 bg-gray-50 border-b border-gray-100 overflow-x-auto custom-scrollbar">
                {[
                  { id: 'all', label: 'All' },
                  { id: 'unread', label: `Unread (${unreadCount})` },
                  { id: 'low_inventory', label: 'Low Stock' },
                  { id: 'subscription_renewal', label: 'SaaS Plan' },
                  { id: 'system_update', label: 'Updates' },
                ].map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setFilter(tab.id as any)}
                    className={`px-3 py-1 rounded-xl text-[10px] font-bold whitespace-nowrap transition-all ${
                      filter === tab.id 
                        ? 'bg-indigo-600 text-white shadow-xs' 
                        : 'text-gray-500 hover:bg-gray-200'
                    }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>

              {/* Notification List Scroll Area */}
              <div className="flex-1 overflow-y-auto p-3 space-y-2.5 custom-scrollbar max-h-96">
                {filteredNotifications.map((notif) => (
                  <div
                    key={notif.id}
                    className={`p-3.5 rounded-2xl border transition-all space-y-2 ${
                      notif.read 
                        ? 'bg-white border-gray-100 text-gray-600' 
                        : 'bg-indigo-50/40 border-indigo-200 text-gray-900 font-medium shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <div className="p-1.5 rounded-lg bg-gray-100">
                          {getTypeIcon(notif.type)}
                        </div>
                        <div>
                          <h4 className="text-xs font-black text-gray-900 leading-snug">{notif.title}</h4>
                          <span className="text-[9px] text-gray-400 font-mono flex items-center gap-1 mt-0.5">
                            <Clock className="w-2.5 h-2.5" />
                            {new Date(notif.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} • {new Date(notif.createdAt).toLocaleDateString()}
                          </span>
                        </div>
                      </div>

                      {getSeverityBadge(notif.severity)}
                    </div>

                    <p className="text-xs text-gray-600 leading-relaxed pl-1">
                      {notif.message}
                    </p>

                    {/* Metadata Context Badge */}
                    {notif.metadata?.productName && (
                      <div className="bg-amber-50 border border-amber-200 px-2.5 py-1 rounded-xl text-[10px] font-bold text-amber-800 flex items-center justify-between">
                        <span>Current Stock: {notif.metadata.stock} / Min: {notif.metadata.minStock}</span>
                        <span className="uppercase text-[9px] font-black text-amber-900">Restock Needed</span>
                      </div>
                    )}

                    <div className="flex items-center justify-between pt-1 border-t border-gray-100 text-[10px]">
                      {notif.link ? (
                        <button
                          onClick={() => {
                            navigate(notif.link!);
                            setIsOpen(false);
                          }}
                          className="text-indigo-600 hover:text-indigo-800 font-bold flex items-center gap-1"
                        >
                          <span>Open Section</span>
                          <ExternalLink className="w-3 h-3" />
                        </button>
                      ) : <span />}

                      <div className="flex items-center gap-2">
                        {!notif.read && (
                          <button
                            onClick={() => markAsRead(notif.id)}
                            className="text-gray-400 hover:text-emerald-600 font-bold flex items-center gap-1"
                            title="Mark as Read"
                          >
                            <CheckCheck className="w-3.5 h-3.5" />
                            <span>Read</span>
                          </button>
                        )}
                        <button
                          onClick={() => deleteNotification(notif.id)}
                          className="text-gray-400 hover:text-red-600"
                          title="Delete Alert"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))}

                {filteredNotifications.length === 0 && (
                  <div className="py-12 text-center text-gray-400 space-y-2">
                    <Bell className="w-8 h-8 mx-auto text-gray-300 stroke-1" />
                    <p className="text-xs font-bold uppercase tracking-wider">No notifications found</p>
                    <p className="text-[10px]">All inventory and system monitors are operating normally.</p>
                  </div>
                )}
              </div>

              {/* Footer Actions */}
              {notifications.length > 0 && (
                <div className="p-3 bg-gray-50 border-t border-gray-100 flex items-center justify-between text-xs">
                  <button
                    onClick={markAllAsRead}
                    className="text-indigo-600 hover:underline font-bold flex items-center gap-1"
                  >
                    <CheckCheck className="w-3.5 h-3.5" />
                    <span>Mark all as read</span>
                  </button>
                  <button
                    onClick={clearAll}
                    className="text-red-500 hover:underline font-bold flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Clear all</span>
                  </button>
                </div>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>

      {/* Floating Toast Notification for Real-Time Incoming Urgent Alerts */}
      <AnimatePresence>
        {toastNotification && (
          <motion.div
            initial={{ opacity: 0, y: 50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.9 }}
            className="fixed bottom-6 right-6 z-50 max-w-sm bg-slate-900 text-white rounded-2xl p-4 shadow-2xl border border-indigo-500/40 flex items-start gap-3"
          >
            <div className="p-2 bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-xl">
              <ShieldAlert className="w-5 h-5" />
            </div>
            <div className="flex-1 space-y-1">
              <div className="flex items-center justify-between">
                <h4 className="font-black text-xs text-white">{toastNotification.title}</h4>
                <button onClick={dismissToast} className="text-slate-400 hover:text-white">
                  <X className="w-3.5 h-3.5" />
                </button>
              </div>
              <p className="text-xs text-slate-300">{toastNotification.message}</p>
              {toastNotification.link && (
                <button
                  onClick={() => {
                    navigate(toastNotification.link!);
                    dismissToast();
                  }}
                  className="mt-2 text-xs font-bold text-indigo-400 hover:text-indigo-300 underline flex items-center gap-1"
                >
                  <span>Take Action Now</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Broadcast System Update Modal */}
      {isBroadcastModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4">
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-600" />
                <h3 className="text-base font-black text-gray-900">Broadcast System Alert</h3>
              </div>
              <button onClick={() => setIsBroadcastModalOpen(false)} className="text-gray-400 hover:text-gray-800">✕</button>
            </div>

            <form onSubmit={handleBroadcast} className="space-y-3">
              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Alert Title</label>
                <input 
                  type="text" 
                  required
                  placeholder="e.g. Critical System Maintenance or Price Update"
                  value={broadcastTitle}
                  onChange={(e) => setBroadcastTitle(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                />
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Severity Level</label>
                <select
                  value={broadcastSeverity}
                  onChange={(e) => setBroadcastSeverity(e.target.value as any)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                >
                  <option value="urgent">Urgent (Red Alert)</option>
                  <option value="warning">Warning (Amber Alert)</option>
                  <option value="info">Info (Blue Notice)</option>
                  <option value="success">Success (Green Notice)</option>
                </select>
              </div>

              <div>
                <label className="text-xs font-bold text-gray-700 block mb-1">Alert Details / Instructions</label>
                <textarea 
                  required
                  placeholder="Describe the update for all store managers..."
                  value={broadcastMessage}
                  onChange={(e) => setBroadcastMessage(e.target.value)}
                  className="w-full p-3 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium h-24"
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={broadcasting}
                  className="flex-1 bg-indigo-600 text-white py-3 rounded-xl font-black text-xs uppercase tracking-wider hover:bg-indigo-700 transition flex items-center justify-center gap-2"
                >
                  <Send className="w-4 h-4" />
                  <span>{broadcasting ? 'Broadcasting...' : 'Dispatch Alert Now'}</span>
                </button>
                <button
                  type="button"
                  onClick={() => setIsBroadcastModalOpen(false)}
                  className="px-5 bg-gray-100 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-200"
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
}
