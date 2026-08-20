import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useTranslation } from 'react-i18next';
import { useAuth } from '../../contexts/AuthContext';
import { useStore } from '../../contexts/StoreContext';
import { usePermissions } from '../../contexts/PermissionsContext';
import { useOffline } from '../../contexts/OfflineContext';
import { useTheme } from '../../contexts/ThemeContext';
import RoleSimulationBanner from '../permissions/RoleSimulationBanner';
import GlobalSearch from '../search/GlobalSearch';
import NotificationCenter from '../notifications/NotificationCenter';
import { UserRole } from '../../types';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  Package, 
  Users, 
  History, 
  BarChart3,
  Award,
  MessageSquare,
  Truck,
  Database,
  CreditCard,
  Settings, 
  LogOut, 
  Menu, 
  X, 
  Globe,
  Bell,
  Smartphone,
  Crown,
  ShieldCheck,
  ShieldAlert,
  Eye,
  ChevronDown,
  UserCheck,
  Wifi,
  WifiOff,
  RefreshCw,
  Sun,
  Moon
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';
import { AnimatePresence, motion } from 'motion/react';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

function OfflineStatusBadge() {
  const { isOnline, pendingOfflineSales, syncOfflineData } = useOffline();
  const [isSyncing, setIsSyncing] = useState(false);

  const handleSync = async () => {
    setIsSyncing(true);
    await syncOfflineData();
    setIsSyncing(false);
  };

  return (
    <div className="flex items-center gap-1.5">
      {isOnline ? (
        <span className="px-2.5 py-1 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-[11px] font-bold flex items-center gap-1.5 shadow-2xs">
          <Wifi className="w-3 h-3 text-emerald-600" />
          <span className="hidden md:inline">ئۆنلاین</span>
        </span>
      ) : (
        <span className="px-2.5 py-1 bg-amber-50 text-amber-800 border border-amber-300 rounded-full text-[11px] font-bold flex items-center gap-1.5 animate-pulse shadow-2xs">
          <WifiOff className="w-3 h-3 text-amber-600" />
          <span>ئوفلاین</span>
          {pendingOfflineSales.length > 0 && (
            <span className="bg-amber-600 text-white px-1.5 py-0.2 rounded-full text-[10px]">
              {pendingOfflineSales.length}
            </span>
          )}
        </span>
      )}

      {pendingOfflineSales.length > 0 && isOnline && (
        <button
          onClick={handleSync}
          disabled={isSyncing}
          className="p-1.5 bg-blue-50 hover:bg-blue-100 text-blue-700 border border-blue-200 rounded-xl text-xs font-bold transition flex items-center gap-1"
          title="سینککردنی تۆمارە ئوفلاینەکان"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin' : ''}`} />
          <span className="hidden lg:inline text-[10px]">سینک</span>
        </button>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const { t, i18n } = useTranslation();
  const { signOut, profile } = useAuth();
  const { store } = useStore();
  const { theme, toggleTheme } = useTheme();
  const { 
    currentRole, 
    actualRole, 
    simulatedRole,
    isSimulating, 
    setSimulatedRole, 
    canAccessRoute 
  } = usePermissions();

  const navigate = useNavigate();
  const location = useLocation();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isRoleMenuOpen, setIsRoleMenuOpen] = useState(false);

  const isRTL = ['ku', 'ar', 'fa'].includes(i18n.language);

  const allNavItems = [
    { to: '/dashboard', icon: LayoutDashboard, label: t('dashboard') },
    { to: '/pos', icon: ShoppingCart, label: t('pos') },
    { to: '/products', icon: Package, label: t('products') },
    { to: '/customers', icon: Users, label: t('customers') },
    { to: '/sales', icon: History, label: t('sales') },
    { to: '/reports', icon: BarChart3, label: t('reports') },
    { to: '/loyalty', icon: Award, label: t('loyalty') },
    { to: '/sms', icon: MessageSquare, label: t('sms_alerts') },
    { to: '/supplier-returns', icon: Truck, label: t('supplier_returns') },
    { to: '/backups', icon: Database, label: t('database_backups', 'Backups & Export') },
    { to: '/subscription', icon: CreditCard, label: t('subscription') },
    { to: '/settings', icon: Settings, label: t('settings') },
  ];

  // Filter navigation items by RBAC permissions
  const navItems = allNavItems.filter(item => canAccessRoute(item.to));

  const handleSignOut = async () => {
    await signOut();
    navigate('/login');
  };

  const getPageTitle = () => {
    const path = location.pathname;
    if (path.includes('dashboard')) return t('dashboard');
    if (path.includes('pos')) return t('pos');
    if (path.includes('products')) return t('products');
    if (path.includes('customers')) return t('customers');
    if (path.includes('sales')) return t('sales');
    if (path.includes('reports')) return t('reports');
    if (path.includes('loyalty')) return t('loyalty');
    if (path.includes('sms')) return t('sms_alerts');
    if (path.includes('supplier-returns')) return t('supplier_returns');
    if (path.includes('backups')) return 'Database Snapshots & Backups';
    if (path.includes('permissions')) return 'Permissions & Roles';
    if (path.includes('subscription')) return t('subscription_management');
    if (path.includes('settings')) return t('settings');
    return 'Store Manager';
  };

  const isOwnerOrAdmin = actualRole === 'owner' || actualRole === 'superadmin';

  return (
    <div className="min-h-screen flex flex-col font-sans">
      {/* Simulation Banner when previewing another role */}
      <RoleSimulationBanner />

      <div className={cn("flex-1 bg-[#F3F4F6] text-[#111827] flex", isRTL ? "flex-row-reverse text-right" : "flex-row")}>
        {/* Sidebar Desktop */}
        <aside className={cn(
          "hidden md:flex flex-col w-64 bg-[#0F172A] text-white h-screen sticky top-0 shadow-2xl transition-all z-30 flex-shrink-0",
          isRTL ? "border-l border-white/5" : "border-r border-white/5"
        )}>
          <div className="p-5 flex items-center justify-between border-b border-white/5">
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center font-black text-xl text-white shadow-lg shadow-blue-500/30">
                S
              </div>
              <div className="flex flex-col overflow-hidden">
                <span className="text-sm font-black tracking-tight truncate text-white">{store?.name || 'ShakhStore Pro'}</span>
                <span className="text-[9px] text-blue-400 uppercase tracking-widest font-black flex items-center gap-1">
                  <ShieldCheck className="w-2.5 h-2.5" /> Multi-Tenant
                </span>
              </div>
            </div>
          </div>

          {/* Active Role Card */}
          <div className="px-3 pt-3">
            <div className="bg-slate-800/80 border border-slate-700/60 p-2.5 rounded-2xl flex items-center justify-between">
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></div>
                <div>
                  <p className="text-[9px] text-slate-400 uppercase font-black tracking-wider leading-none">Active Role</p>
                  <p className="text-xs font-black text-white capitalize leading-tight mt-0.5">
                    {currentRole.replace(/_/g, ' ')}
                  </p>
                </div>
              </div>
              {isSimulating && (
                <span className="text-[9px] font-black uppercase bg-amber-500/20 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded">
                  Simulated
                </span>
              )}
            </div>
          </div>

          <nav className="flex-1 px-3 py-3 space-y-1 overflow-y-auto custom-scrollbar">
            <div className="space-y-1">
              {(profile?.role === 'superadmin' || profile?.email?.toLowerCase() === 'shakh8002@gmail.com') && (
                <NavLink
                  to="/super-admin"
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-black bg-gradient-to-r from-amber-500/20 via-yellow-500/20 to-amber-500/10 text-amber-300 border border-amber-500/30 hover:border-amber-400 mb-2 shadow-sm",
                    isActive && "bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-black border-amber-400 shadow-md shadow-amber-500/30",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <Crown className="w-4 h-4 text-amber-400 fill-amber-400" />
                  <span className="truncate">سەرپەرشتیاری گشتی (Super Admin)</span>
                </NavLink>
              )}

              {navItems.map((item) => (
                <NavLink
                  key={item.to}
                  to={item.to}
                  className={({ isActive }) => cn(
                    "flex items-center gap-3 px-3.5 py-2.5 rounded-xl transition-all text-xs font-bold",
                    isActive 
                      ? "bg-blue-600 text-white shadow-lg shadow-blue-900/40" 
                      : "text-slate-400 hover:bg-white/5 hover:text-white",
                    isRTL && "flex-row-reverse"
                  )}
                >
                  <item.icon className="w-4 h-4" />
                  <span className="truncate">{item.label}</span>
                </NavLink>
              ))}
            </div>
          </nav>

          <div className="p-4 mt-auto">
            {/* Trial / Subscription Status Card */}
            {canAccessRoute('/subscription') && (
              <div 
                onClick={() => navigate('/subscription')}
                className="bg-gradient-to-br from-indigo-600 to-purple-700 hover:from-indigo-500 hover:to-purple-600 cursor-pointer rounded-2xl p-3.5 text-center text-white mb-3 shadow-lg shadow-indigo-950/50 transition-all group"
              >
                <div className="flex items-center justify-between text-[9px] uppercase font-black tracking-wider text-indigo-200 mb-0.5">
                  <span>SaaS Status</span>
                  <span className="text-white group-hover:translate-x-0.5 transition-transform">→</span>
                </div>
                <p className="text-sm font-black leading-tight">
                  {store?.subscriptionStatus === 'active' 
                    ? (store?.planId === 'pro' ? 'Pro Plan Active' : store?.planId === 'enterprise' ? 'Enterprise Suite' : 'Starter Plan') 
                    : '6 Months Free Trial'}
                </p>
                <p className="text-[9px] text-indigo-200 mt-0.5 font-medium">Click to Manage Billing & Plans</p>
              </div>
            )}

            <button
              onClick={handleSignOut}
              className={cn(
                "w-full flex items-center gap-2.5 px-3.5 py-2.5 rounded-xl text-red-400 hover:bg-red-500/10 transition-all font-bold text-xs",
                isRTL && "flex-row-reverse"
              )}
            >
              <LogOut className="w-4 h-4" />
              <span>{t('logout')}</span>
            </button>
          </div>
        </aside>

        {/* Main Content Area */}
        <div className="flex-1 flex flex-col h-screen overflow-hidden">
          {/* Header */}
          <header className="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 px-4 sm:px-6 lg:px-8 flex items-center justify-between gap-3 shadow-xs flex-shrink-0 z-20">
            <div className="flex items-center gap-3 min-w-0">
              <button className="md:hidden p-2 text-gray-500 hover:text-gray-900 dark:text-slate-400 dark:hover:text-white rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800" onClick={() => setIsSidebarOpen(true)}>
                <Menu className="w-5 h-5" />
              </button>
              <h1 className="text-base sm:text-lg font-black text-gray-900 dark:text-white tracking-tight truncate hidden sm:block">
                {getPageTitle()}
              </h1>
            </div>

            {/* Unified Global Search Bar */}
            <GlobalSearch />

            <div className={cn("flex items-center gap-2 sm:gap-3 flex-shrink-0", isRTL && "flex-row-reverse")}>
              {/* Online / Offline Status Indicator Pill */}
              <OfflineStatusBadge />

              {/* Role Simulation Switcher for Owner / Admin */}
              {isOwnerOrAdmin && (
                <div className="relative">
                  <button
                    onClick={() => setIsRoleMenuOpen(!isRoleMenuOpen)}
                    className={cn(
                      "flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-bold transition-all border",
                      isSimulating 
                        ? "bg-amber-500 text-white border-amber-600 shadow-sm" 
                        : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
                    )}
                  >
                    <Eye className="w-3.5 h-3.5" />
                    <span className="capitalize">{isSimulating ? `Role: ${currentRole}` : 'Preview Role'}</span>
                    <ChevronDown className="w-3 h-3 opacity-70" />
                  </button>

                  {isRoleMenuOpen && (
                    <div className="absolute right-0 mt-2 w-52 bg-white rounded-2xl shadow-xl border border-gray-200 p-2 z-50 text-xs space-y-1">
                      <div className="px-3 py-1 text-[10px] font-black uppercase tracking-wider text-gray-400">
                        Select Preview Role
                      </div>
                      <button
                        onClick={() => { setSimulatedRole(null); setIsRoleMenuOpen(false); }}
                        className={`w-full text-left px-3 py-2 rounded-xl font-bold flex items-center justify-between ${
                          !isSimulating ? 'bg-indigo-50 text-indigo-700' : 'hover:bg-gray-50 text-gray-700'
                        }`}
                      >
                        <span>Owner (Full Access)</span>
                        {!isSimulating && <span className="text-[10px] font-bold">Active</span>}
                      </button>
                      {(['cashier', 'manager', 'technician', 'inventory_clerk'] as UserRole[]).map(role => (
                        <button
                          key={role}
                          onClick={() => { setSimulatedRole(role); setIsRoleMenuOpen(false); }}
                          className={`w-full text-left px-3 py-2 rounded-xl font-bold capitalize flex items-center justify-between ${
                            simulatedRole === role ? 'bg-amber-50 text-amber-800 font-black' : 'hover:bg-gray-50 text-gray-700'
                          }`}
                        >
                          <span>{role.replace(/_/g, ' ')}</span>
                          {simulatedRole === role && <span className="text-[10px] text-amber-700 font-black">Simulating</span>}
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* Theme Toggle Button (Light / Dark Mode) */}
              <button
                onClick={toggleTheme}
                className="p-2 border border-gray-200 dark:border-slate-700 rounded-xl text-gray-700 dark:text-slate-200 bg-gray-50/50 dark:bg-slate-800 hover:bg-gray-100 dark:hover:bg-slate-700 transition-all cursor-pointer flex items-center gap-1.5"
                title={theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
              >
                {theme === 'dark' ? (
                  <Sun className="w-4 h-4 text-amber-400" />
                ) : (
                  <Moon className="w-4 h-4 text-slate-600" />
                )}
                <span className="hidden xl:inline text-[11px] font-bold">
                  {theme === 'dark' ? 'ڕووناک' : 'تاریک'}
                </span>
              </button>

              {/* Language Selector */}
              <div className="flex items-center gap-1.5 border border-gray-200 px-2.5 py-1.5 rounded-xl text-xs font-bold text-gray-700 bg-gray-50/50 hover:bg-gray-100 transition-all">
                <Globe className="w-3.5 h-3.5 text-gray-500" />
                <select 
                  className="bg-transparent outline-none cursor-pointer uppercase tracking-wider text-[11px] font-black"
                  value={i18n.language}
                  onChange={(e) => i18n.changeLanguage(e.target.value)}
                >
                  <option value="ku">KU</option>
                  <option value="ar">AR</option>
                  <option value="en">EN</option>
                  <option value="tr">TR</option>
                  <option value="fa">FA</option>
                </select>
              </div>

              {/* Real-time Notification Bell Center */}
              <NotificationCenter />
              
              {/* SMS Quick Link if allowed */}
              {canAccessRoute('/sms') && (
                <NavLink 
                  to="/sms"
                  className="p-2 text-gray-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-xl transition-all relative"
                  title="SMS Alerts & Notifications"
                >
                  <MessageSquare className="w-4 h-4" />
                  <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-emerald-500 rounded-full border-2 border-white"></span>
                </NavLink>
              )}

              {/* Loyalty Quick Link if allowed */}
              {canAccessRoute('/loyalty') && (
                <NavLink 
                  to="/loyalty"
                  className="p-2 text-gray-400 hover:text-purple-600 hover:bg-purple-50 rounded-xl transition-all"
                  title="Loyalty Rewards"
                >
                  <Award className="w-4 h-4" />
                </NavLink>
              )}

              {/* Store Avatar Badge */}
              <div className="w-8 h-8 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black text-xs shadow-md shadow-blue-200">
                {store?.name?.substring(0, 2).toUpperCase() || 'MS'}
              </div>
            </div>
          </header>

          {/* Page Main Scroll Area */}
          <main className="flex-1 overflow-y-auto p-4 sm:p-8 bg-[#F3F4F6] dark:bg-slate-950 dark:text-slate-100 custom-scrollbar">
            <div className="max-w-7xl mx-auto">
              {children}
            </div>
          </main>

          <footer className="h-10 bg-white dark:bg-slate-900 border-t border-gray-200 dark:border-slate-800 px-6 sm:px-8 flex items-center justify-between text-[9px] text-gray-400 dark:text-slate-500 font-bold uppercase tracking-widest flex-shrink-0">
            <span>© 2026 MobiStore Manager SaaS • Multi-Tenant RBAC Guard</span>
            <span>Role: <span className="text-indigo-600 dark:text-indigo-400 font-black capitalize">{currentRole.replace(/_/g, ' ')}</span> • Active</span>
          </footer>
        </div>

        {/* Mobile Drawer */}
        <AnimatePresence>
          {isSidebarOpen && (
            <>
              <motion.div 
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                onClick={() => setIsSidebarOpen(false)}
                className="fixed inset-0 bg-black/60 z-40 md:hidden backdrop-blur-xs"
              />
              <motion.aside 
                initial={{ x: isRTL ? 300 : -300 }}
                animate={{ x: 0 }}
                exit={{ x: isRTL ? 300 : -300 }}
                className={cn(
                  "fixed inset-y-0 w-72 bg-[#0F172A] text-white z-50 md:hidden flex flex-col shadow-2xl",
                  isRTL ? "right-0" : "left-0"
                )}
              >
                <div className="p-5 flex items-center justify-between border-b border-white/10">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center font-black text-white">M</div>
                    <span className="font-black text-base">{store?.name || 'MobiStore'}</span>
                  </div>
                  <button onClick={() => setIsSidebarOpen(false)} className="text-gray-400 hover:text-white">
                    <X className="w-5 h-5" />
                  </button>
                </div>
                <nav className="flex-1 p-3 space-y-1 overflow-y-auto">
                  {navItems.map((item) => (
                    <NavLink
                      key={item.to}
                      to={item.to}
                      onClick={() => setIsSidebarOpen(false)}
                      className={({ isActive }) => cn(
                        "flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-bold text-xs",
                        isActive ? "bg-blue-600 text-white" : "text-gray-400 hover:bg-white/5 hover:text-white",
                        isRTL && "flex-row-reverse"
                      )}
                    >
                      <item.icon className="w-5 h-5" />
                      <span>{item.label}</span>
                    </NavLink>
                  ))}
                </nav>
              </motion.aside>
            </>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
