import React, { Component, ReactNode, ErrorInfo } from 'react';

interface Props {
  children: ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = {
    hasError: false
  };

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('App error caught by ErrorBoundary:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50 p-6 text-center" dir="rtl">
          <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-xl border border-slate-100">
            <div className="w-16 h-16 bg-orange-100 text-[#F97316] rounded-2xl flex items-center justify-center mx-auto mb-4 font-black text-2xl">
              شاخ
            </div>
            <h2 className="text-xl font-black text-slate-900 mb-2">پلاتفۆرمی شاخ</h2>
            <p className="text-xs text-slate-500 mb-6">
              بۆ دەستپێکردنەوەی خێرا و بارکردنەوەی پڕۆژەکە، کرتە لەسەر دوگمەی خوارەوە بکە:
            </p>
            <button
              onClick={() => {
                localStorage.removeItem('shakh_current_user');
                window.location.reload();
              }}
              className="w-full py-3 px-6 bg-[#F97316] hover:bg-orange-600 text-white font-bold rounded-2xl shadow-lg transition-all active:scale-95 cursor-pointer"
            >
              نوێکردنەوەی پەڕە (Reload)
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
