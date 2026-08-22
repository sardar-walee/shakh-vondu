import React, { useState, useEffect } from 'react';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import { AuthProvider } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';
import { MarketplaceProvider } from './context/MarketplaceContext';
import { CartProvider } from './context/CartContext';

import { Navbar } from './components/layout/Navbar';
import { CategoryNav } from './components/layout/CategoryNav';
import { OccasionHeaderBanner } from './components/common/OccasionHeaderBanner';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/cart/CartDrawer';
import { MobileBottomNav } from './components/layout/MobileBottomNav';
import { AppDownloadModal } from './components/common/AppDownloadModal';

import { HomeView } from './views/HomeView';
import { CategoryView } from './views/CategoryView';
import { ProductDetailView } from './views/ProductDetailView';
import { SellerStoreView } from './views/SellerStoreView';
import { CartCheckoutView } from './views/CartCheckoutView';
import { OrderTrackingView } from './views/OrderTrackingView';
import { CustomerOrdersView } from './views/CustomerOrdersView';
import { CarMarketplaceView } from './views/CarMarketplaceView';
import { CarDetailView } from './views/CarDetailView';
import { PostCarAdView } from './views/PostCarAdView';
import { SellerDashboardView } from './views/SellerDashboardView';
import { DeliveryDashboardView } from './views/DeliveryDashboardView';
import { AdminDashboardView } from './views/AdminDashboardView';
import { AuthView } from './views/AuthView';
import { FavoritesView } from './views/FavoritesView';
import { UserProfileView } from './views/UserProfileView';
import { NotificationCenterView } from './views/NotificationCenterView';
import { NotificationToast } from './components/notifications/NotificationToast';
import { ProductCategory } from './types';

const MainApp: React.FC = () => {
  const [currentView, setCurrentView] = useState<string>('home');
  const [viewParam, setViewParam] = useState<string>('');
  const [selectedCity, setSelectedCity] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<ProductCategory | 'all'>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [showAppDownloadModal, setShowAppDownloadModal] = useState<boolean>(false);

  // Scroll to top upon navigating
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [currentView, viewParam]);

  const handleNavigate = (view: string, param?: string) => {
    setCurrentView(view);
    if (param !== undefined) {
      setViewParam(param);
    }
  };

  const handleSelectCategory = (category: ProductCategory | 'all') => {
    setActiveCategory(category);
    if (category === 'all') {
      setCurrentView('home');
    } else if (category === 'cars') {
      setCurrentView('car-marketplace');
    } else {
      setCurrentView('category');
      setViewParam(category);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 dark:bg-[#0b0f19] transition-colors duration-300 flex flex-col font-sans text-slate-900 dark:text-slate-100 selection:bg-orange-500 selection:text-white pb-16 md:pb-0">
      {/* Sticky Top Navbar */}
      <Navbar
        currentView={currentView}
        onNavigate={handleNavigate}
        selectedCity={selectedCity}
        onSelectCity={setSelectedCity}
        searchQuery={searchQuery}
        onSearchChange={setSearchQuery}
      />

      {/* Category Pills Navigation with Left/Right smooth scroll controls */}
      <CategoryNav
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* Occasions & Mawlid Praise Banner (بن هێدەر) */}
      <OccasionHeaderBanner onOpenAdminManager={() => handleNavigate('admin')} />

      {/* Main App Body */}
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 pt-6">
        {currentView === 'home' && (
          <HomeView
            onNavigate={handleNavigate}
            onSelectCategory={(cat) => handleSelectCategory(cat)}
            selectedCity={selectedCity}
          />
        )}

        {currentView === 'category' && (
          <CategoryView
            category={(viewParam as ProductCategory) || 'food'}
            onNavigate={handleNavigate}
            selectedCity={selectedCity}
          />
        )}

        {currentView === 'product-detail' && (
          <ProductDetailView
            productId={viewParam}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'seller-store' && (
          <SellerStoreView
            sellerId={viewParam}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'checkout' && (
          <CartCheckoutView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'order-tracking' && (
          <OrderTrackingView
            orderId={viewParam}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'customer-orders' && (
          <CustomerOrdersView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'car-marketplace' && (
          <CarMarketplaceView
            onNavigate={handleNavigate}
            selectedCity={selectedCity}
          />
        )}

        {currentView === 'car-detail' && (
          <CarDetailView
            carId={viewParam}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'post-car-ad' && (
          <PostCarAdView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'seller-dashboard' && (
          <SellerDashboardView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'delivery-dashboard' && (
          <DeliveryDashboardView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'admin-dashboard' && (
          <AdminDashboardView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'auth' && (
          <AuthView
            initialMode={(viewParam as 'login' | 'register') || 'login'}
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'favorites' && (
          <FavoritesView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'user-profile' && (
          <UserProfileView
            onNavigate={handleNavigate}
          />
        )}

        {currentView === 'notifications' && (
          <NotificationCenterView
            onNavigate={handleNavigate}
          />
        )}
      </main>

      {/* Global Live Notification Toast */}
      <NotificationToast onNavigate={handleNavigate} />

      {/* Cart Slide-Over Drawer */}
      <CartDrawer onCheckout={() => setCurrentView('checkout')} />

      {/* Global Footer */}
      <Footer
        onNavigate={handleNavigate}
        onSelectCategory={(cat) => handleSelectCategory(cat)}
      />

      {/* Mobile Bottom Navigation Bar */}
      <MobileBottomNav
        currentView={currentView}
        onNavigate={handleNavigate}
        onOpenCategoriesDrawer={() => handleSelectCategory('food')}
        onOpenAppDownload={() => setShowAppDownloadModal(true)}
      />

      {/* App Download Modal */}
      <AppDownloadModal
        isOpen={showAppDownloadModal}
        onClose={() => setShowAppDownloadModal(false)}
      />
    </div>
  );
};

export function App() {
  return (
    <ThemeProvider>
      <LanguageProvider>
        <AuthProvider>
          <NotificationProvider>
            <MarketplaceProvider>
              <CartProvider>
                <MainApp />
              </CartProvider>
            </MarketplaceProvider>
          </NotificationProvider>
        </AuthProvider>
      </LanguageProvider>
    </ThemeProvider>
  );
}

export default App;
