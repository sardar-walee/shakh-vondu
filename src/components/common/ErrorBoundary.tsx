import React, { Component, ReactNode, ErrorInfo } from 'react';
import { Bug, RefreshCw, Phone, Copy, ShieldAlert, Terminal, Sparkles } from 'lucide-react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
  errorInfo?: ErrorInfo;
  copiedInfo: boolean;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false,
    copiedInfo: false
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, copiedInfo: false };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error caught by ErrorBoundary:', error, errorInfo);
    this.setState({ errorInfo });
  }

  buildWhatsAppGlitchMsg = () => {
    const errorMsg = this.state.error?.message || 'Unknown Crash';
    const componentStack = this.state.errorInfo?.componentStack || '';
    const currentUrl = window.location.href;
    const userAgent = navigator.userAgent;
    const timeStr = new Date().toLocaleString('ku-IQ');

    return `💥 *ڕاپۆرتی گلیچ / ڕاوەستانی نەخوازرای سیستم (Shakh Crash Report)*

سڵاو سوپەر ئەدمین، ڕاوەستانێک لە بەکارهێنانی ئەپلیکەیشن دەستنیشانکراوە:

⚠️ *دەقی ئیرۆر:*
\`\`\`${errorMsg}\`\`\`

📱 *پەڕە و ناوچەی ڕوودانی کێشەکە:*
• *لینک:* ${currentUrl}
• *کات:* ${timeStr}
• *سیستم/ئامێر:* ${userAgent.substring(0, 90)}

🔍 *بەشی کۆد (Component Stack):*
\`\`\`${componentStack.substring(0, 400)}\`\`\`

💡 تکایە پێداچوونەوە بکە بۆ ڕاستکردنەوەی ئەم گلیچە بە زووترین کات.`;
  };

  sendToSuperAdminWhatsApp = () => {
    const msg = this.buildWhatsAppGlitchMsg();
    const adminPhone = '9647504796924';
    const url = `https://api.whatsapp.com/send?phone=${adminPhone}&text=${encodeURIComponent(msg)}`;
    window.open(url, '_blank');
  };

  copyErrorText = () => {
    const msg = this.buildWhatsAppGlitchMsg();
    navigator.clipboard.writeText(msg).then(() => {
      this.setState({ copiedInfo: true });
      setTimeout(() => this.setState({ copiedInfo: false }), 2000);
    });
  };

  handleResetAndReload = () => {
    try {
      localStorage.removeItem('shakh_current_user');
      sessionStorage.clear();
    } catch (e) {}
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      const errorMsg = this.state.error?.message || 'کێشەیەکی نەخوازراو لە کارکردنی شاشەکەدا ڕوویدا.';

      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-950 p-4 text-slate-100 font-sans" dir="rtl">
          <div className="max-w-lg w-full bg-slate-900 p-6 sm:p-8 rounded-3xl border border-slate-800 shadow-2xl space-y-6 text-center">
            
            {/* Header Icon */}
            <div className="w-16 h-16 bg-red-500/20 text-red-500 rounded-2xl flex items-center justify-center mx-auto border border-red-500/30 animate-pulse">
              <Bug className="w-8 h-8" />
            </div>

            {/* Title & Explanation */}
            <div className="space-y-2">
              <div className="inline-flex items-center gap-2 px-3 py-1 bg-red-500/10 border border-red-500/30 rounded-full text-red-400 text-xs font-black">
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>سیستەمی چاکسازی و ناردنی گلیچ (شاخ)</span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white">پلاتفۆرمی (شاخ)</h2>
              <p className="text-xs text-slate-400 leading-relaxed max-w-sm mx-auto">
                داوای لێبوردن دەکەین، کێشەیەکی نەخوازراو لە کارکردنی ئەم بەشەدا دەستنیشانکرا. دەتوانیت ڕاستەوخۆ ڕاپۆرتەکە بۆ سوپەر ئەدمین بنێریت تاوەکو چارەسەر بکارێت.
              </p>
            </div>

            {/* Error Message Box */}
            <div className="p-3.5 bg-slate-950 rounded-2xl border border-slate-800 text-right space-y-1">
              <div className="flex items-center gap-1.5 text-[11px] font-black text-amber-400">
                <Terminal className="w-3.5 h-3.5" />
                <span>دەقی گلیچ / Error Context:</span>
              </div>
              <p className="text-[11px] font-latin font-mono text-red-400 break-all line-clamp-4">
                {errorMsg}
              </p>
            </div>

            {/* Actions */}
            <div className="space-y-2.5 pt-2">
              <button
                type="button"
                onClick={this.sendToSuperAdminWhatsApp}
                className="w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-xs sm:text-sm rounded-2xl shadow-lg shadow-emerald-600/30 flex items-center justify-center gap-2.5 transition-transform active:scale-95 cursor-pointer"
              >
                <Phone className="w-4 h-4" />
                <span>ناردنی ڕاپۆرتی گلیچەکە 💬 بۆ واتسئەپی سوپەر ئەدمین</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={this.copyErrorText}
                  className="py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5 text-amber-400" />
                  <span>{this.state.copiedInfo ? 'کۆپی کرا! ✓' : 'کۆپیکردنی دەقی ئیرۆر'}</span>
                </button>

                <button
                  type="button"
                  onClick={this.handleResetAndReload}
                  className="py-3 bg-orange-600 hover:bg-orange-500 text-white text-xs font-bold rounded-xl flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/20 transition-transform active:scale-95 cursor-pointer"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>ڕیفڕێشی خێرای شاشە</span>
                </button>
              </div>
            </div>

            <p className="text-[10px] text-slate-500 font-latin">
              SHAKH Multi-Marketplace • Automated Glitch Protection Engine v3.2.0
            </p>

          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
