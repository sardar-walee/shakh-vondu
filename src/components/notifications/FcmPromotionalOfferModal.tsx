import React, { useState } from 'react';
import { X, Send, Megaphone, Tag, Link as LinkIcon, Image as ImageIcon, Sparkles, CheckCircle2, Users } from 'lucide-react';
import { broadcastFcmPromotionalOffer } from '../../lib/fcmService';
import { useAuth } from '../../context/AuthContext';
import { useNotification } from '../../context/NotificationContext';

interface FcmPromotionalOfferModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const FcmPromotionalOfferModal: React.FC<FcmPromotionalOfferModalProps> = ({ isOpen, onClose }) => {
  const { currentUser } = useAuth();
  const { addNotification } = useNotification();

  const [title, setTitle] = useState('🔥 ئۆفەری تایبەتی جەژن و بەهار!');
  const [body, setBody] = useState('داشکاندنی ٢٠٪ لەسەر هەموو بەروبوومی نوێ و جلوبەرگی کوردی بێ بەرامبەر لە شوێنی تۆ!');
  const [discountCode, setDiscountCode] = useState('SHAKH20');
  const [targetUrl, setTargetUrl] = useState('category');
  const [audience, setAudience] = useState<'all' | 'customers' | 'sellers' | 'captains'>('all');
  const [isSending, setIsSending] = useState(false);
  const [successMsg, setSuccessMsg] = useState('');

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !body.trim()) return;

    setIsSending(true);
    setSuccessMsg('');

    const res = await broadcastFcmPromotionalOffer({
      title,
      body,
      discountCode,
      targetUrl,
      senderId: currentUser?.id || 'admin-demo',
      senderName: currentUser?.fullName || 'ئادمیینی شاخ',
      audience,
      category: 'promotional_campaign'
    });

    setIsSending(false);

    if (res.success) {
      setSuccessMsg(`کەمپینی ئۆفەر بەسەرکەوتوویی نێردرا! (${res.sentCount} Push Message Broadcasted)`);
      
      // Store in Notification Center for all targets
      addNotification({
        userId: currentUser?.id || 'all',
        title: `🔥 ${title}`,
        message: body + (discountCode ? ` | کۆپۆن: ${discountCode}` : ''),
        type: 'system_alert',
        category: 'update',
        status: 'info',
        actionLabel: 'سەیرکردنی ئۆفەر',
        linkUrl: targetUrl
      });

      setTimeout(() => {
        onClose();
        setSuccessMsg('');
      }, 2000);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl w-full max-w-lg shadow-2xl overflow-hidden flex flex-col">
        {/* Modal Header */}
        <div className="bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 p-5 text-slate-950 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-slate-950/20 flex items-center justify-center text-slate-950 font-bold">
              <Megaphone className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-base font-black">ناردنی ئۆفەری تایبەت (FCM Promotional Push)</h3>
              <p className="text-xs text-slate-950/80 font-medium">بڵاوکردنەوەی ئۆفەر و داشکاندن بۆ بەکارهێنەران</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-slate-950/10 hover:bg-slate-950/20 text-slate-950 flex items-center justify-center transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Form */}
        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-sans">
          {successMsg && (
            <div className="bg-emerald-500/10 border border-emerald-500/30 text-emerald-700 dark:text-emerald-300 p-3 rounded-2xl flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-500 flex-shrink-0" />
              <span className="font-bold">{successMsg}</span>
            </div>
          )}

          {/* Title Input */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5 text-amber-500" />
              <span>سەردێڕی ئۆفەر (Notification Title)</span>
            </label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          {/* Body Input */}
          <div className="space-y-1">
            <label className="font-bold text-slate-700 dark:text-slate-300">دەقی ئۆفەر و ڕوونکردنەوە (Notification Body)</label>
            <textarea
              required
              rows={3}
              value={body}
              onChange={(e) => setBody(e.target.value)}
              className="w-full px-3.5 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-medium focus:ring-2 focus:ring-amber-500 outline-none"
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {/* Discount Code */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Tag className="w-3.5 h-3.5 text-amber-500" />
                <span>کۆدی کۆپۆنی داشکاندن</span>
              </label>
              <input
                type="text"
                value={discountCode}
                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                placeholder="نموونە: SHAKH20"
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-mono font-bold focus:ring-2 focus:ring-amber-500 outline-none uppercase"
              />
            </div>

            {/* Target Audience */}
            <div className="space-y-1">
              <label className="font-bold text-slate-700 dark:text-slate-300 flex items-center gap-1">
                <Users className="w-3.5 h-3.5 text-amber-500" />
                <span>بەکارهێنەرانی ئامانج</span>
              </label>
              <select
                value={audience}
                onChange={(e) => setAudience(e.target.value as any)}
                className="w-full px-3.5 py-2 rounded-xl border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800 text-slate-900 dark:text-slate-100 font-bold focus:ring-2 focus:ring-amber-500 outline-none"
              >
                <option value="all">هەموو بەکارهێنەران (All Users)</option>
                <option value="customers">تەنها کڕیاران (Customers Only)</option>
                <option value="sellers">تەنها فرۆشیاران (Sellers Only)</option>
                <option value="captains">تەنها کاپتنەکانی گەیاندن (Captains Only)</option>
              </select>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-2xl border border-slate-200 dark:border-slate-700 font-bold text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors cursor-pointer"
            >
              پاشگەزبوونەوە
            </button>
            <button
              type="submit"
              disabled={isSending}
              className="px-6 py-2.5 rounded-2xl bg-gradient-to-r from-amber-500 via-orange-500 to-amber-600 text-slate-950 font-black shadow-md hover:opacity-95 transition-all flex items-center gap-2 cursor-pointer"
            >
              <Send className="w-4 h-4 fill-current" />
              <span>{isSending ? 'لە بڵاوکردنەوەدایە...' : 'بڵاوکردنەوەی FCM Push'}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
