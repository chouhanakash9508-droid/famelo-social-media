import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AnimatePresence } from 'framer-motion';
import { AuthProvider, useAuth } from './context/AuthContext';
import { WebSocketProvider } from './context/WebSocketContext';
import { ThemeProvider } from './context/ThemeContext';
import SplashScreen from './components/SplashScreen';
import PageTransition from './components/PageTransition';
import MainLayout from './layouts/MainLayout';
import Login from './pages/Login';
import Signup from './pages/Signup';
import ForgotPassword from './pages/ForgotPassword';
import Home from './pages/Home';
import Search from './pages/Search';
import CreatePost from './pages/CreatePost';
import Reels from './pages/Reels';
import Profile from './pages/Profile';
import Activity from './pages/Activity';
import Messages from './pages/Messages';
import InstagramHelp from './pages/InstagramHelp';
import InstagramHelpDetail from './pages/InstagramHelpDetail';
import InstagramHelpResult from './pages/InstagramHelpResult';
import Advertise from './pages/Advertise';
import BusinessDashboard from './pages/BusinessDashboard';
import CreateCampaign from './pages/CreateCampaign';
import CampaignDetail from './pages/CampaignDetail';
import AdminAds from './pages/AdminAds';
import AdminPromoReels from './pages/AdminPromoReels';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Orders from './pages/Orders';
import OrderDetail from './pages/OrderDetail';
import SellerDashboard from './pages/SellerDashboard';
import SellerProducts from './pages/SellerProducts';
import SellerOrders from './pages/SellerOrders';
import CreateProduct from './pages/CreateProduct';
import AdminCommerce from './pages/AdminCommerce';
import PrivacyPolicy from './pages/PrivacyPolicy';
import TermsOfService from './pages/TermsOfService';
import './App.css';

function ProtectedRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return user ? children : <Navigate to="/login" />;
}

function PublicRoute({ children }) {
  const { user, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-white"></div>
      </div>
    );
  }
  
  return user ? <Navigate to="/" /> : children;
}

function AnimatedRoutes() {
  const location = useLocation();
  
  return (
    <AnimatePresence mode="wait">
      <Routes location={location} key={location.pathname}>
        <Route path="/login" element={
          <PublicRoute>
            <PageTransition>
              <Login />
            </PageTransition>
          </PublicRoute>
        } />
        <Route path="/signup" element={
          <PublicRoute>
            <PageTransition>
              <Signup />
            </PageTransition>
          </PublicRoute>
        } />
        <Route path="/forgot-password" element={
          <PublicRoute>
            <PageTransition>
              <ForgotPassword />
            </PageTransition>
          </PublicRoute>
        } />
        <Route path="/create" element={
          <ProtectedRoute>
            <PageTransition>
              <CreatePost />
            </PageTransition>
          </ProtectedRoute>
        } />
        <Route path="/" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <Home />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/search" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <Search />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/reels" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <Reels />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/profile/:username?" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <Profile />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/activity" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <Activity />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/messages/:chatId?" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <Messages />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/instagram-help" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <InstagramHelp />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/instagram-help/:problemId" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <InstagramHelpDetail />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/instagram-help/:problemId/result" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <InstagramHelpResult />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/advertise" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <Advertise />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/business-dashboard" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <BusinessDashboard />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/create-campaign" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <CreateCampaign />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/campaigns/:campaignId" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <CampaignDetail />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/ads" element={
          <ProtectedRoute>
            <AdminAds />
          </ProtectedRoute>
        } />
        <Route path="/admin/promo-reels" element={
          <ProtectedRoute>
            <AdminPromoReels />
          </ProtectedRoute>
        } />
        <Route path="/product/:productId" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <ProductDetail />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/cart" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <Cart />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/checkout" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <Checkout />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/orders" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <Orders />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/orders/:orderId" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <OrderDetail />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/seller-dashboard" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <SellerDashboard />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/seller-products" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <SellerProducts />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/seller-orders" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <SellerOrders />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/create-product" element={
          <ProtectedRoute>
            <MainLayout>
              <PageTransition>
                <CreateProduct />
              </PageTransition>
            </MainLayout>
          </ProtectedRoute>
        } />
        <Route path="/admin/commerce" element={
          <ProtectedRoute>
            <AdminCommerce />
          </ProtectedRoute>
        } />
        <Route path="/privacy" element={
          <PageTransition>
            <PrivacyPolicy />
          </PageTransition>
        } />
        <Route path="/terms" element={
          <PageTransition>
            <TermsOfService />
          </PageTransition>
        } />
      </Routes>
    </AnimatePresence>
  );
}

function AppContent() {
  const [showSplash, setShowSplash] = useState(true);
  const { initializing } = useAuth();

  useEffect(() => {
    if (!initializing) {
      const timer = setTimeout(() => {
        setShowSplash(false);
      }, 2500);
      return () => clearTimeout(timer);
    }
  }, [initializing]);

  if (showSplash || initializing) {
    return <SplashScreen onComplete={() => setShowSplash(false)} />;
  }

  return (
    <WebSocketProvider>
      <AnimatedRoutes />
    </WebSocketProvider>
  );
}

function App() {
  return (
    <ThemeProvider>
      <AuthProvider>
        <Router>
          <div className="App min-h-screen transition-colors duration-300">
            <AppContent />
            <Toaster 
              position="top-center"
              toastOptions={{
                duration: 3000,
                className: 'dark:bg-gray-800 dark:text-white bg-white text-black',
                style: {
                  borderRadius: '12px',
                  fontSize: '14px',
                  fontWeight: '500'
                },
                success: {
                  iconTheme: {
                    primary: '#10B981',
                    secondary: '#fff',
                  },
                },
                error: {
                  iconTheme: {
                    primary: '#EF4444',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;