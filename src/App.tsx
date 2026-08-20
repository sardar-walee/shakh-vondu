import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './contexts/AuthContext';
import { StoreProvider } from './contexts/StoreContext';
import { PermissionsProvider, usePermissions } from './contexts/PermissionsContext';
import { BackupProvider } from './contexts/BackupContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { NotificationProvider } from './contexts/NotificationContext';
import { ThemeProvider } from './contexts/ThemeContext';
import UnauthorizedAccessCard from './components/auth/UnauthorizedAccessCard';
import DashboardLayout from './components/layout/DashboardLayout';
import './lib/i18n';

// Pages
import LandingPage from './pages/LandingPage';
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import CustomerPortalPage from './pages/CustomerPortalPage';
import OnboardingPage from './pages/OnboardingPage';
import DashboardPage from './pages/DashboardPage';
import POSPage from './pages/POSPage';
import ProductsPage from './pages/ProductsPage';
import CustomersPage from './pages/CustomersPage';
import SalesPage from './pages/SalesPage';
import ReportsPage from './pages/ReportsPage';
import LoyaltyPage from './pages/LoyaltyPage';
import SMSPage from './pages/SMSPage';
import SettingsPage from './pages/SettingsPage';
import SubscriptionPage from './pages/SubscriptionPage';
import SupplierReturnsPage from './pages/SupplierReturnsPage';
import PermissionsPage from './pages/PermissionsPage';
import BackupsPage from './pages/BackupsPage';
import SuperAdminPage from './pages/SuperAdminPage';

const ProtectedRoute: React.FC<{ 
  children: React.ReactNode; 
  requiredRoute?: string; 
  requiredPermission?: string;
}> = ({ children, requiredRoute, requiredPermission }) => {
  const { user, profile, loading: authLoading } = useAuth();
  const { canAccessRoute, hasPermission, loading: permsLoading, currentRole } = usePermissions();
  const location = useLocation();

  if (authLoading || permsLoading) return (
    <div className="flex items-center justify-center h-screen bg-[#F3F4F6]">
      <div className="flex items-center gap-3 text-sm font-bold text-gray-600">
        <div className="w-4 h-4 rounded-full border-2 border-indigo-600 border-t-transparent animate-spin"></div>
        <span>Loading MobiStore SaaS...</span>
      </div>
    </div>
  );

  if (!user && !profile) return <Navigate to="/login" />;
  if (profile?.role === 'customer') return <Navigate to="/customer-portal" />;
  if (!profile || !profile.storeId) return <Navigate to="/onboarding" />;

  const targetPath = requiredRoute || location.pathname;
  const isAllowed = canAccessRoute(targetPath);

  if (!isAllowed) {
    return (
      <DashboardLayout>
        <UnauthorizedAccessCard 
          requiredPermission={requiredPermission || targetPath} 
          routeName={targetPath} 
        />
      </DashboardLayout>
    );
  }

  return <>{children}</>;
};

export default function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <StoreProvider>
        <PermissionsProvider>
          <BackupProvider>
            <OfflineProvider>
              <NotificationProvider>
                <Router>
                <Routes>
                  <Route path="/" element={<LandingPage />} />
                  <Route path="/login" element={<LoginPage />} />
                  <Route path="/register" element={<RegisterPage />} />
                  <Route path="/customer-portal" element={<CustomerPortalPage />} />
                  <Route path="/onboarding" element={<OnboardingPage />} />
                  
                  {/* Store RBAC Protected Routes */}
                  <Route path="/dashboard" element={<ProtectedRoute requiredRoute="/dashboard"><DashboardPage /></ProtectedRoute>} />
                  <Route path="/pos" element={<ProtectedRoute requiredRoute="/pos"><POSPage /></ProtectedRoute>} />
                  <Route path="/products" element={<ProtectedRoute requiredRoute="/products"><ProductsPage /></ProtectedRoute>} />
                  <Route path="/customers" element={<ProtectedRoute requiredRoute="/customers"><CustomersPage /></ProtectedRoute>} />
                  <Route path="/sales" element={<ProtectedRoute requiredRoute="/sales"><SalesPage /></ProtectedRoute>} />
                  <Route path="/reports" element={<ProtectedRoute requiredRoute="/reports"><ReportsPage /></ProtectedRoute>} />
                  <Route path="/loyalty" element={<ProtectedRoute requiredRoute="/loyalty"><LoyaltyPage /></ProtectedRoute>} />
                  <Route path="/sms" element={<ProtectedRoute requiredRoute="/sms"><SMSPage /></ProtectedRoute>} />
                  <Route path="/supplier-returns" element={<ProtectedRoute requiredRoute="/supplier-returns"><SupplierReturnsPage /></ProtectedRoute>} />
                  <Route path="/backups" element={<ProtectedRoute requiredRoute="/backups"><BackupsPage /></ProtectedRoute>} />
                  <Route path="/permissions" element={<ProtectedRoute requiredRoute="/settings"><PermissionsPage /></ProtectedRoute>} />
                  <Route path="/subscription" element={<ProtectedRoute requiredRoute="/subscription"><SubscriptionPage /></ProtectedRoute>} />
                  <Route path="/super-admin" element={<ProtectedRoute requiredRoute="/dashboard"><SuperAdminPage /></ProtectedRoute>} />
                  <Route path="/settings" element={<ProtectedRoute requiredRoute="/settings"><SettingsPage /></ProtectedRoute>} />

                  {/* Fallback */}
                  <Route path="*" element={<Navigate to="/" />} />
                </Routes>
              </Router>
            </NotificationProvider>
          </OfflineProvider>
        </BackupProvider>
      </PermissionsProvider>
    </StoreProvider>
  </AuthProvider>
</ThemeProvider>
);
}
