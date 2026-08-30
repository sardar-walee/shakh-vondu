import React, { useState } from 'react';
import {
  Bug,
  Send,
  X,
  Phone,
  Copy,
  CheckCircle2,
  AlertTriangle,
  Sparkles,
  Smartphone,
  ShieldAlert,
  Terminal,
  RefreshCw
} from 'lucide-react';
import { useMarketplace } from '../../context/MarketplaceContext';
import { useAuth } from '../../context/AuthContext';
import { useLanguage } from '../../context/LanguageContext';

interface GlitchReportModalProps {
  isOpen: boolean;
  onClose: () => void;
  initialError?: string;
}

export const GlitchReportModal: React.FC<GlitchReportModalProps> = ({
  isOpen,
  onClose,
  initialError
}) => {
  const { appVersion } = useMarketplace();
  const { currentUser } = useAuth();
  const { t } = useLanguage();

  const [description, setDescription] = useState('');
  const [copied, setCopied] = useState(false);
  const [glitchCategory, setGlitchCategory] = useState<'ui' | 'network' | 'payment' | 'order' | 'crash' | 'other'>('ui');

  if (!isOpen) return null;

  const userRoleText = currentUser?.role ? {
    customer: 'کڕیار (Customer)',
    restaurant_owner: 'چێشتخانە (Seller)',
    market_owner: 'مارکێت (Seller)',
    clothes_seller: 'جلوبەرگ (Seller)',
    fruits_vegetables_seller: 'سەوزە و میوە (Seller)',
    fresh_meat_seller: 'گۆشت (Seller)',
    dairy_seller: 'شیرەمەنی (Seller)',
    electronics_seller: 'ئەلیکترۆنیات (Seller)',
    beauty_seller: 'جوانی (Seller)',
    car_seller: 'ئۆتۆمبێل (Seller)',
    delivery_agent: 'کاپتنی گەیاندن (Captain)',
    admin: 'سوپەر ئەدمین (Super Admin)'
  }[currentUser.role] || currentUser.role : 'میوان (Guest / Unauthenticated)';

  const categoryLabels = {
    ui: 'شاشە و دیزاین (UI / Screen Glitch)',
    network: 'هێڵ و هێواشی بەستنەوە (Network / Slow)',
    payment: 'پارەدان و وەسڵ (Payment Issue)',
    order: 'داواکاری و گەیاندن (Order / Delivery Issue)',
    crash: 'داخستنی لەپڕ / راوەستان (Crash / Freeze)',
    other: 'کێشەی دیکە (Other)'
  };

  const buildWhatsAppMessage = () => {
    const timeStr = new Date().toLocaleString('ku-IQ');
    const currentUrl = window.location.href;
    const userAgent = navigator.userAgent.substring(0, 90);

    return `⚠️ *ڕاپۆرتی گلیچ و کێشەی تەکنیکی (Shakh Multi-Marketplace)*

 سڵاو سوپەر ئەدمین، کێشەیەکی تەکنیکی / گلیچ دەستنیشانکراوە:

📋 *زانیاری کێشەکە:*
• *جۆری کێشە:* ${categoryLabels[glitchCategory]}
• *تێبینی/ڕوونکردنەوە:* ${description.trim() || 'هیچ تێبینییەک نەنوسراوە'}
${initialError ? `• *دەقی ئیرۆر (Console Error):*\n\`\`\`${initialError.substring(0, 300)}\`\`\`` : ''}

👤 *زانیاری بەکارهێنەر:*
• *ناو:* ${currentUser?.fullName || 'نەنۆسراو'}
• *ژمارەی مۆبایل:* ${currentUser?.phone || 'نەنۆسراو'}
• *ڕۆڵ لە سیستم:* ${userRoleText}

📱 *زانیاری ئامێر و سیستم:*
• *وەشانی ئەپ:* v${appVersion.version} (Build: ${appVersion.buildNumber || 250})
• *کات:* ${timeStr}
• *لینک/پەڕەی کارا:* ${currentUrl}
• *ئامێر:* ${userAgent}

💡 *داواکاری:* تکایە زانیارییەکان بپشکنە بۆ چارەسەرکردنی خێرای ئەم گلیچە.`;
  };

  const sendToWhatsApp = () => {
    const msg = buildWhatsAppMessage();
    const adminPhone = '9647504796924';
    const url = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  const copyReportText = () => {
    const msg = buildWhatsAppMessage();
    navigator.clipboard.writeText(msg).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4 animate-in fade-in duration-200" dir="rtl">
      <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-3xl max-w-lg w-full overflow-hidden shadow-2xl space-y-0 text-slate-900 dark:text-white">
        
        {/* Header */}
        <div className="bg-gradient-to-r from-red-600 via-rose-600 to-amber-600 p-5 text-white flex items-center justify-between relative overflow-hidden">
          <div className="flex items-center gap-3 relative z-10">
            <div className="p-2.5 bg-white/20 backdrop-blur-md rounded-2xl">
              <Bug className="w-6 h-6 text-amber-200 animate-pulse" />
            </div>
            <div>
              <h2 className="text-lg font-black">ڕاپۆرتکردنی گلیچ و کێشەی تەکنیکی</h2>
              <p className="text-xs text-white/90">ناردنی دەستبەجێ بۆ واتسئەپی سوپەر ئەدمین</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 bg-white/20 hover:bg-white/30 rounded-full text-white cursor-pointer transition-colors relative z-10"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <div className="p-6 space-y-4">

          {/* Initial Error Box if present */}
          {initialError && (
            <div className="p-3 bg-red-50 dark:bg-red-950/50 border border-red-200 dark:border-red-900/60 rounded-2xl space-y-1">
              <span className="text-[11px] font-black text-red-700 dark:text-red-300 flex items-center gap-1.5">
                <Terminal className="w-3.5 h-3.5" /> دەقی ئیرۆری تۆمارکراو لە سیستم:
              </span>
              <p className="text-[11px] font-latin font-mono text-red-900 dark:text-red-200 break-all line-clamp-3">
                {initialError}
              </p>
            </div>
          )}

          {/* Glitch Category Selector */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300">
              جۆری کێشە / گلیچەکە دیاری بکە:
            </label>
            <select
              value={glitchCategory}
              onChange={(e) => setGlitchCategory(e.target.value as any)}
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-bold text-slate-900 dark:text-white"
            >
              <option value="ui">🖥️ شاشە و دیزاین (UI / Screen Glitch)</option>
              <option value="network">🌐 هێڵ و هێواشی بەستنەوە (Network / Connection)</option>
              <option value="payment">💳 پارەدان و وەسڵ (Payment / Receipt Issue)</option>
              <option value="order">📦 داواکاری و گەیاندن (Order / Delivery Issue)</option>
              <option value="crash">💥 داخستنی لەپڕ / راوەستان (Crash / Freeze)</option>
              <option value="other">📝 کێشەی دیکە (Other Issue)</option>
            </select>
          </div>

          {/* Description Textarea */}
          <div className="space-y-1.5">
            <label className="text-xs font-black text-slate-700 dark:text-slate-300">
              ڕوونکردنەوە لەسەر کێشەکە (چی ڕوویدا؟):
            </label>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="وەک: لە کاتی بەسەرکردنەوەی بەشەکان شاشەکە نەدەکرایەوە، یان دوگمەکە کاری نەدەکرد..."
              className="w-full p-3 bg-slate-50 dark:bg-slate-800 rounded-xl border border-slate-200 dark:border-slate-700 text-xs font-medium text-slate-900 dark:text-white resize-none"
            />
          </div>

          {/* Diagnostic Auto Context Info */}
          <div className="p-3 bg-slate-50 dark:bg-slate-800/60 rounded-2xl border border-slate-200 dark:border-slate-700/60 space-y-1 text-[11px] text-slate-600 dark:text-slate-300">
            <div className="flex items-center justify-between font-bold">
              <span>وەشانی ئەپ: <strong className="font-latin text-orange-600">v{appVersion.version}</strong></span>
              <span>ڕۆڵ: <strong className="text-slate-900 dark:text-white">{userRoleText}</strong></span>
            </div>
            <p className="text-[10px] text-slate-400 dark:text-slate-500 font-latin truncate">
              {window.location.href}
            </p>
          </div>

          {/* Action Buttons */}
          <div className="space-y-2 pt-2">
            <button
              type="button"
              onClick={sendToWhatsApp}
              className="w-full py-3.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-2xl text-xs font-black flex items-center justify-center gap-2 shadow-lg shadow-emerald-600/30 transition-transform active:scale-95 cursor-pointer"
            >
              <Phone className="w-4 h-4" />
              <span>ناردنی ڕاپۆرتی گلیچ 💬 بۆ واتسئەپی سوپەر ئەدمین</span>
            </button>

            <button
              type="button"
              onClick={copyReportText}
              className="w-full py-2.5 bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 rounded-xl text-xs font-bold transition-colors flex items-center justify-center gap-2 cursor-pointer"
            >
              <Copy className="w-3.5 h-3.5" />
              <span>{copied ? 'دەقی ڕاپۆرتەکە کۆپی کرا! ✓' : 'کۆپیکردنی دەقی ڕاپۆرتی کێشەکە'}</span>
            </button>
          </div>

        </div>

      </div>
    </div>
  );
};
