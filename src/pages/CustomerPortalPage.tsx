import React, { useState } from 'react';
import { 
  User, 
  Receipt, 
  ShieldCheck, 
  Award, 
  CreditCard, 
  Phone, 
  Search, 
  Store as StoreIcon, 
  LogOut, 
  Package, 
  Sparkles,
  Calendar,
  CheckCircle2
} from 'lucide-react';
import { useTranslation } from 'react-i18next';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

interface CustomerInvoice {
  id: string;
  invoiceNumber: string;
  date: string;
  total: number;
  itemsCount: number;
  status: 'paid' | 'partial' | 'debt';
  paidAmount: number;
  remainingDebt: number;
  warranties?: { productName: string; months: number; expiresAt: string }[];
}

export default function CustomerPortalPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const { profile, signOut } = useAuth();
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  // Profile data
  const customerPhone = profile?.phone || '0750 123 4567';
  const customerName = profile?.displayName || 'ڕێبین ئەحمەد (Rbin Ahmed)';
  const [loyaltyPoints, setLoyaltyPoints] = useState(380);
  const [tier, setTier] = useState('Gold VIP');
  const [totalDebt, setTotalDebt] = useState(45);

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const [searchQuery, setSearchQuery] = useState('');

  const [invoices] = useState<CustomerInvoice[]>([
    {
      id: 'inv_101',
      invoiceNumber: 'INV-2026-0891',
      date: '2026-08-15',
      total: 820,
      itemsCount: 2,
      status: 'paid',
      paidAmount: 820,
      remainingDebt: 0,
      warranties: [
        { productName: 'iPhone 15 Pro Max 256GB', months: 12, expiresAt: '2027-08-15' }
      ]
    },
    {
      id: 'inv_102',
      invoiceNumber: 'INV-2026-0744',
      date: '2026-07-28',
      total: 145,
      itemsCount: 3,
      status: 'debt',
      paidAmount: 100,
      remainingDebt: 45,
      warranties: [
        { productName: 'Anker PowerBank 20,000mAh', months: 6, expiresAt: '2027-01-28' }
      ]
    }
  ]);

  const filteredInvoices = invoices.filter(
    (inv) =>
      inv.invoiceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
      inv.date.includes(searchQuery)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-8" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Top Bar */}
      <div className="max-w-6xl mx-auto flex flex-wrap items-center justify-between gap-4 mb-8 bg-slate-900 border border-slate-800 p-4 rounded-2xl shadow-xl">
        <div className="flex items-center space-x-3 space-x-reverse">
          <div className="p-3 bg-gradient-to-tr from-blue-600 to-indigo-600 rounded-xl text-white shadow-lg">
            <User className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-lg font-bold text-slate-100">{customerName}</h1>
            <p className="text-xs text-slate-400 flex items-center gap-2">
              <Phone className="w-3.5 h-3.5" />
              {customerPhone}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSignOut}
            className="flex items-center gap-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-semibold border border-slate-700 transition cursor-pointer"
          >
            <LogOut className="w-4 h-4" />
            چوونە دەرەوە
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Metric Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Points */}
          <div className="bg-gradient-to-tr from-amber-950/80 via-slate-900 to-slate-900 border border-amber-500/30 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-amber-400 font-bold">خاڵەکانی وەفاداری (Loyalty Points)</span>
              <Award className="w-5 h-5 text-amber-400" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-100">{loyaltyPoints}</span>
              <span className="text-xs text-slate-400 mr-2 rtl:ml-2">خاڵ</span>
            </div>
            <p className="text-xs text-amber-300 mt-2 flex items-center gap-1">
              <Sparkles className="w-3.5 h-3.5" />
              پلەی ئەندامێتی: <strong className="text-amber-400">{tier}</strong>
            </p>
          </div>

          {/* Debt */}
          <div className="bg-gradient-to-tr from-rose-950/80 via-slate-900 to-slate-900 border border-rose-500/30 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-rose-400 font-bold">بڕی قەرز (Remaining Balance)</span>
              <CreditCard className="w-5 h-5 text-rose-400" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-100">${totalDebt}</span>
            </div>
            <p className="text-xs text-slate-400 mt-2">
              تکایە لە کاتی سەردانیکردنی دوکان قەرزەکانت بپڕوێنەوە.
            </p>
          </div>

          {/* Invoices */}
          <div className="bg-gradient-to-tr from-blue-950/80 via-slate-900 to-slate-900 border border-blue-500/30 rounded-2xl p-5 shadow-lg">
            <div className="flex items-center justify-between">
              <span className="text-xs text-blue-400 font-bold">کۆی وەسڵەکان (Total Invoices)</span>
              <Receipt className="w-5 h-5 text-blue-400" />
            </div>
            <div className="mt-3">
              <span className="text-3xl font-black text-slate-100">{invoices.length}</span>
              <span className="text-xs text-slate-400 mr-2 rtl:ml-2">وەسڵ</span>
            </div>
            <p className="text-xs text-blue-300 mt-2">
              هەموو کڕینەکانی ڕابردووت لێرەدا دەپارێزرێن.
            </p>
          </div>
        </div>

        {/* Invoices & Warranty Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Receipt className="w-5 h-5 text-blue-400" />
                مێژووی وەسڵەکان و گرێنتی (Invoices & Warranties)
              </h2>
              <p className="text-xs text-slate-400 mt-1">
                سەیری وەسڵەکانی کڕین و ماوەی گرێنتی ئامێرەکانت بکە
              </p>
            </div>

            <div className="relative w-full sm:w-64">
              <Search className="w-4 h-4 absolute left-3 rtl:right-3 top-3 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="گەڕان بەپێی ژمارەی وەسڵ..."
                className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-xs rounded-xl pl-9 rtl:pr-9 pr-3 rtl:pl-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          <div className="space-y-4">
            {filteredInvoices.map((inv) => (
              <div
                key={inv.id}
                className="bg-slate-800/60 border border-slate-700/60 rounded-xl p-4 transition hover:border-slate-600"
              >
                <div className="flex flex-wrap items-center justify-between gap-3 border-b border-slate-700/40 pb-3 mb-3">
                  <div className="flex items-center gap-3">
                    <span className="px-2.5 py-1 bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono text-xs font-bold rounded-lg">
                      {inv.invoiceNumber}
                    </span>
                    <span className="text-xs text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {inv.date}
                    </span>
                  </div>

                  <div className="flex items-center gap-3">
                    <span className="text-xs font-bold text-slate-200">
                      کۆی گشتی: ${inv.total}
                    </span>
                    {inv.status === 'paid' ? (
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-full flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" />
                        دراوە
                      </span>
                    ) : (
                      <span className="px-2.5 py-0.5 text-xs font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30 rounded-full">
                        قەرز: ${inv.remainingDebt}
                      </span>
                    )}
                  </div>
                </div>

                {/* Warranties */}
                {inv.warranties && inv.warranties.length > 0 && (
                  <div className="bg-slate-900/60 p-3 rounded-lg border border-slate-700/40 text-xs text-slate-300 space-y-1">
                    <span className="font-bold text-amber-400 flex items-center gap-1">
                      <ShieldCheck className="w-4 h-4" />
                      مۆڵەت و گرێنتی کاراکراو (Active Warranty):
                    </span>
                    {inv.warranties.map((w, idx) => (
                      <div key={idx} className="flex items-center justify-between text-[11px] text-slate-400 pt-1">
                        <span>• {w.productName} ({w.months} مانگ)</span>
                        <span className="text-emerald-400 font-semibold">بەسەرژچوون: {w.expiresAt}</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
