import React, { useState } from 'react';
import { X, Check, Copy, MessageCircle, Send, Share2, Facebook } from 'lucide-react';

interface ShareModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  url?: string;
  description?: string;
  image?: string;
}

export const ShareModal: React.FC<ShareModalProps> = ({
  isOpen,
  onClose,
  title,
  url = window.location.href,
  description = 'لە پلاتفۆرمی شاخ (Shakh)',
  image
}) => {
  const [copied, setCopied] = useState(false);

  if (!isOpen) return null;

  const cleanUrl = url || window.location.href;
  const shareText = `${title}\n${description}\n${cleanUrl}`;
  const encodedText = encodeURIComponent(shareText);
  const encodedUrl = encodeURIComponent(cleanUrl);

  const handleCopyLink = async () => {
    try {
      if (navigator.clipboard) {
        await navigator.clipboard.writeText(cleanUrl);
      } else {
        const input = document.createElement('input');
        input.value = cleanUrl;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        document.body.removeChild(input);
      }
      setCopied(true);
      setTimeout(() => setCopied(false), 3000);
    } catch (err) {
      console.error('Failed to copy link', err);
    }
  };

  const handleNativeShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title,
          text: description,
          url: cleanUrl
        });
        onClose();
      } catch (err) {
        console.log('Share canceled or failed', err);
      }
    } else {
      handleCopyLink();
    }
  };

  const shareChannels = [
    {
      name: 'واتسئەپ (WhatsApp)',
      icon: <MessageCircle className="w-5 h-5 text-emerald-500" />,
      action: () => window.open(`https://api.whatsapp.com/send?text=${encodedText}`, '_blank'),
      bg: 'hover:bg-emerald-50 text-emerald-700'
    },
    {
      name: 'تێلیگرام (Telegram)',
      icon: <Send className="w-5 h-5 text-sky-500" />,
      action: () => window.open(`https://t.me/share/url?url=${encodedUrl}&text=${encodeURIComponent(title)}`, '_blank'),
      bg: 'hover:bg-sky-50 text-sky-700'
    },
    {
      name: 'فەیسبووک (Facebook)',
      icon: <Facebook className="w-5 h-5 text-blue-600" />,
      action: () => window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`, '_blank'),
      bg: 'hover:bg-blue-50 text-blue-700'
    },
    {
      name: 'ڤایبەر (Viber)',
      icon: <MessageCircle className="w-5 h-5 text-purple-600" />,
      action: () => window.open(`viber://forward?text=${encodedText}`, '_blank'),
      bg: 'hover:bg-purple-50 text-purple-700'
    }
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn" dir="rtl">
      <div className="bg-white rounded-3xl max-w-md w-full p-6 shadow-2xl border border-slate-100 space-y-5 animate-scaleUp">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-100 pb-3">
          <div className="flex items-center gap-2">
            <div className="w-9 h-9 rounded-xl bg-orange-100 text-[#F97316] flex items-center justify-center">
              <Share2 className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-900 text-sm sm:text-base">هاوبەشکردن (Share)</h3>
              <p className="text-[11px] text-slate-500 line-clamp-1">{title}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Share Options Grid */}
        <div className="grid grid-cols-2 gap-2.5">
          {shareChannels.map((ch, idx) => (
            <button
              key={idx}
              onClick={() => {
                ch.action();
                onClose();
              }}
              className={`flex items-center gap-3 p-3 rounded-2xl border border-slate-200 transition-all font-bold text-xs ${ch.bg} cursor-pointer`}
            >
              {ch.icon}
              <span className="truncate">{ch.name}</span>
            </button>
          ))}
        </div>

        {/* Copy Link Field */}
        <div className="space-y-1.5 pt-2">
          <label className="text-xs font-bold text-slate-700">بەستەری ڕاستەوخۆ (Direct Link):</label>
          <div className="flex items-center gap-2 bg-slate-50 p-2 rounded-2xl border border-slate-200">
            <input
              type="text"
              readOnly
              value={cleanUrl}
              className="bg-transparent text-xs text-slate-600 w-full outline-none px-2 font-latin text-left"
            />
            <button
              onClick={handleCopyLink}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold text-white transition-all cursor-pointer flex-shrink-0 ${
                copied ? 'bg-emerald-600' : 'bg-[#F97316] hover:bg-orange-600'
              }`}
            >
              {copied ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>کۆپیکرا!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>کۆپیکردن</span>
                </>
              )}
            </button>
          </div>
        </div>

        {/* Mobile native share button if available */}
        {typeof navigator !== 'undefined' && 'share' in navigator && (
          <button
            onClick={handleNativeShare}
            className="w-full py-2.5 rounded-xl bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold flex items-center justify-center gap-2 transition-colors cursor-pointer"
          >
            <Share2 className="w-4 h-4 text-orange-400" />
            <span>هاوبەشکردنی زیاتر لە مۆبایل</span>
          </button>
        )}

      </div>
    </div>
  );
};
