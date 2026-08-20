import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import DashboardLayout from '../components/layout/DashboardLayout';
import { useTranslation } from 'react-i18next';
import { useStore } from '../contexts/StoreContext';
import { useAuth } from '../contexts/AuthContext';
import { useTheme } from '../contexts/ThemeContext';
import { 
  User, 
  Store, 
  CreditCard, 
  Globe, 
  Shield, 
  LogOut,
  ChevronRight,
  CheckCircle2,
  Award,
  MessageSquare,
  Server,
  Sparkles,
  Database,
  Sun,
  Moon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export default function SettingsPage() {
  const { t, i18n } = useTranslation();
  const { store } = useStore();
  const { profile, signOut } = useAuth();
  const { theme, setTheme } = useTheme();
  const navigate = useNavigate();

  const [activeTab, setActiveTab] = useState<'profile' | 'subscription' | 'loyalty_link' | 'sms_link'>('profile');
  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">{t('settings')}</h1>
          <p className="text-xs text-gray-500 font-medium">Manage your store configuration, multi-tenant billing, loyalty rules, and SMS gateway.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Sidebar Navigation */}
          <div className="space-y-2">
            {[
              { id: 'profile', label: 'Store Profile', icon: Store },
              { id: 'permissions', label: 'Roles & Staff Permissions', icon: Shield, isLink: true, route: '/permissions' },
              { id: 'backups', label: 'Database Backups & Snapshots', icon: Database, isLink: true, route: '/backups' },
              { id: 'subscription', label: 'Subscription & Plan', icon: CreditCard, isLink: true, route: '/subscription' },
              { id: 'loyalty_link', label: 'Loyalty Program Rules', icon: Award, isLink: true, route: '/loyalty' },
              { id: 'sms_link', label: 'SMS Gateway & Triggers', icon: MessageSquare, isLink: true, route: '/sms' },
            ].map((item) => (
              <button
                key={item.id}
                onClick={() => {
                  if (item.isLink && item.route) {
                    navigate(item.route);
                  } else {
                    setActiveTab(item.id as any);
                  }
                }}
                className={cn(
                  "w-full flex items-center justify-between px-4 py-3 rounded-2xl font-bold text-xs transition-all",
                  activeTab === item.id 
                    ? "bg-blue-600 text-white shadow-lg shadow-blue-200" 
                    : "text-gray-600 bg-white hover:bg-gray-100 border border-gray-100",
                  isRTL && "flex-row-reverse"
                )}
              >
                <div className="flex items-center gap-3">
                  <item.icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.isLink && <ChevronRight className="w-3.5 h-3.5 opacity-60" />}
              </button>
            ))}
          </div>

          {/* Content Area */}
          <div className="md:col-span-2 space-y-6">
            {activeTab === 'profile' && (
              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <h3 className="font-bold text-base text-gray-900">Store Profile</h3>
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Store Name</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold"
                        value={store?.name || 'MobiStore HQ'}
                        readOnly
                      />
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-gray-700">Manager Phone</label>
                      <input 
                        type="text" 
                        className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono font-bold"
                        value={store?.phone || '+9647501234567'}
                        readOnly
                      />
                    </div>
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-gray-700">Address / City</label>
                    <textarea 
                      className="w-full px-4 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-medium h-20"
                      value={store?.address || 'Erbil, Kurdistan Region'}
                      readOnly
                    />
                  </div>

                  {/* Theme Selector */}
                  <div className="pt-4 border-t border-gray-100">
                    <label className="text-xs font-bold text-gray-700 block mb-2">Display Theme (تیمای سیستەم)</label>
                    <div className="grid grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setTheme('light')}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                          theme === 'light'
                            ? 'bg-blue-50/80 border-blue-500 text-blue-900 font-bold shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Sun className="w-4 h-4 text-amber-500" />
                          <span className="text-xs font-bold">ڕووناک (Light Mode)</span>
                        </div>
                        {theme === 'light' && <CheckCircle2 className="w-4 h-4 text-blue-600" />}
                      </button>

                      <button
                        type="button"
                        onClick={() => setTheme('dark')}
                        className={`p-3.5 rounded-2xl border flex items-center justify-between transition cursor-pointer ${
                          theme === 'dark'
                            ? 'bg-slate-900 border-indigo-500 text-white font-bold shadow-xs'
                            : 'bg-gray-50 border-gray-200 text-gray-700 hover:bg-gray-100'
                        }`}
                      >
                        <div className="flex items-center gap-2">
                          <Moon className="w-4 h-4 text-indigo-400" />
                          <span className="text-xs font-bold">تاریک (Dark Mode)</span>
                        </div>
                        {theme === 'dark' && <CheckCircle2 className="w-4 h-4 text-indigo-400" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Subscription Card */}
            <div className="bg-gradient-to-br from-gray-900 to-gray-800 p-8 rounded-3xl text-white shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500 rounded-full blur-[80px] opacity-20" />
              <div className="relative z-10">
                <div className="flex justify-between items-start mb-6">
                  <div>
                    <p className="text-gray-400 text-[10px] font-bold uppercase tracking-widest mb-1">Current Plan</p>
                    <h4 className="text-2xl font-black capitalize">{store?.subscriptionStatus || 'trial'} Free Period</h4>
                  </div>
                  <div className="bg-white/10 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-white/20">
                    Active
                  </div>
                </div>
                <div className="flex items-center gap-2 mb-6 text-blue-400">
                  <CheckCircle2 className="w-4 h-4" />
                  <span className="font-bold text-xs">Full Premium Multi-Tenant Suite Enabled</span>
                </div>
                <div className="flex items-center justify-between pt-6 border-t border-white/10">
                  <div>
                    <p className="text-gray-400 text-[10px] uppercase font-bold mb-0.5">Trial ends on</p>
                    <p className="font-black text-sm">{new Date(store?.trialEndDate || Date.now() + 180 * 86400 * 1000).toLocaleDateString()}</p>
                  </div>
                  <button 
                    onClick={() => navigate('/subscription')}
                    className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-black text-xs uppercase tracking-wider transition-all shadow-lg shadow-blue-900/20"
                  >
                    Manage & Upgrade Plan
                  </button>
                </div>
              </div>
            </div>

            {/* Feature Modules Quick Links */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <button 
                onClick={() => navigate('/backups')}
                className="bg-white p-5 rounded-3xl border border-gray-100 hover:border-blue-200 hover:shadow-md transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center font-black">
                    <Database className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-xs">Backups & Export</p>
                    <p className="text-[10px] text-gray-400">CSV & JSON Archives</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-blue-600" />
              </button>

              <button 
                onClick={() => navigate('/loyalty')}
                className="bg-white p-5 rounded-3xl border border-gray-100 hover:border-purple-200 hover:shadow-md transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-purple-50 text-purple-600 flex items-center justify-center font-black">
                    <Award className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-xs">Loyalty Program</p>
                    <p className="text-[10px] text-gray-400">Earn rate & rewards</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-purple-600" />
              </button>

              <button 
                onClick={() => navigate('/sms')}
                className="bg-white p-5 rounded-3xl border border-gray-100 hover:border-emerald-200 hover:shadow-md transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center font-black">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900 text-xs">SMS Gateway</p>
                    <p className="text-[10px] text-gray-400">Triggers & logs</p>
                  </div>
                </div>
                <ChevronRight className="w-4 h-4 text-gray-400 group-hover:text-emerald-600" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
