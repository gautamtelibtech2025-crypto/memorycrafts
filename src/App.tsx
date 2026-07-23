/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar';
import Hero from './components/Hero';
import Categories from './components/Categories';
import TemplateSection from './components/TemplateSection';
import Footer from './components/Footer';
import DrawersAndModals from './components/DrawersAndModals';

import AdminDashboardView from './components/AdminDashboardView';
import SurpriseWebsitesView from './components/SurpriseWebsitesView';
import HowItWorksView from './components/HowItWorksView';
import UserProfileView from './components/UserProfileView';
import FutureDashboardView from './components/FutureDashboardView';
import Toast, { ToastMessage } from './components/Toast';
import { subscribeToAuthState, signInWithGoogle, logoutUser, isUserEmailVerified, sendVerificationEmail, checkEmailVerifiedStatus } from './lib/firebase';
import { createOrder } from './lib/orders';
import { CartItem, WishlistItem, UserProfile } from './types';

export default function App() {
  // Navigation & Filter States
  const [activeTab, setActiveTab] = useState<string>('home');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Cart & Wishlist States
  const [cart, setCart] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<WishlistItem[]>([]);

  // Toast State
  const [toasts, setToasts] = useState<ToastMessage[]>([]);
  const showToast = (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, message, type }]);
  };
  const removeToast = (id: string) => {
    setToasts((prev) => prev.filter((t) => t.id !== id));
  };

  // Toast Auto-dismiss
  useEffect(() => {
    if (toasts.length > 0) {
      const timer = setTimeout(() => {
        removeToast(toasts[0].id);
      }, 4000);
      return () => clearTimeout(timer);
    }
  }, [toasts]);

  // Auth State
  const [user, setUser] = useState<UserProfile | null>(null);
  const [isEmailVerified, setIsEmailVerified] = useState(true);
  const [authLoading, setAuthLoading] = useState(true);

  // Subscribe to Auth changes
  useEffect(() => {
    const unsubscribe = subscribeToAuthState((profile) => {
      setUser(profile);
      setIsEmailVerified(isUserEmailVerified());
      setAuthLoading(false);
    });

    return () => {
      if (typeof unsubscribe === 'function') {
        unsubscribe();
      }
    };
  }, []);

  // Secure Navigation Protection
  useEffect(() => {
    if (!authLoading && !user && (activeTab === 'profile' || activeTab === 'dashboard')) {
      setActiveTab('home');
      setLoginOpen(true);
      showToast("Access Restricted. Please connect your account to view this space.", "error");
    }
  }, [activeTab, user, authLoading]);

  // Auth Handlers
  const handleGoogleLogin = async () => {
    try {
      const profile = await signInWithGoogle();
      setUser(profile);
      showToast(`Welcome back, ${profile.displayName || 'Patron'}!`, 'success');
      setLoginOpen(false);
    } catch (err: any) {
      console.error(err);
      if (err.code === 'auth/popup-closed-by-user') {
        showToast('Login Cancelled.', 'error');
      } else {
        showToast(err.message || 'Authentication error occurred.', 'error');
      }
      throw err;
    }
  };

  const handleLogout = async () => {
    try {
      await logoutUser();
      setUser(null);
      setActiveTab('home');
      showToast('Successfully disconnected from MemoryCraft.', 'success');
    } catch (err: any) {
      console.error(err);
      showToast('Logout failure: ' + (err.message || 'Unknown error'), 'error');
    }
  };

  // Modal / Drawer Open States
  const [isCartOpen, setCartOpen] = useState(false);
  const [isWishlistOpen, setWishlistOpen] = useState(false);
  const [isLoginOpen, setLoginOpen] = useState(false);
  const [isBuilderOpen, setBuilderOpen] = useState(false);

  // Helper for auth-protected operations
  const requireAuth = (action: () => void) => {
    if (!user) {
      setLoginOpen(true);
      showToast("Identity check required. Please connect your account to proceed.", "error");
    } else {
      action();
    }
  };

  const handleSetCartOpen = (open: boolean) => {
    if (open) {
      requireAuth(() => setCartOpen(true));
    } else {
      setCartOpen(false);
    }
  };

  const handleSetWishlistOpen = (open: boolean) => {
    if (open) {
      requireAuth(() => setWishlistOpen(true));
    } else {
      setWishlistOpen(false);
    }
  };

  // Cart Operations
  const addToCart = (newItem: Omit<CartItem, 'quantity'>) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === newItem.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === newItem.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prevCart, { ...newItem, quantity: 1 }];
    });
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const updateCartQty = (id: string, qty: number) => {
    if (qty <= 0) {
      removeFromCart(id);
      return;
    }
    setCart((prevCart) =>
      prevCart.map((item) => (item.id === id ? { ...item, quantity: qty } : item))
    );
  };

  // Wishlist Operations
  const removeFromWishlist = (id: string) => {
    setWishlist((prevWishlist) => prevWishlist.filter((item) => item.id !== id));
  };

  // Checkout Processing
  const handleCheckout = async () => {
    if (!user) {
      setLoginOpen(true);
      showToast("Identity verification required to process checkout.", "error");
      return;
    }
    if (cart.length === 0) return;

    try {
      // Create orders for all cart items
      for (const item of cart) {
        await createOrder(user.uid, item.title, item.price, item.type, item.category);
      }
      setCart([]); // Clear cart
      setCartOpen(false); // Close cart drawer
      setActiveTab('dashboard'); // Switch to "My Orders" tab
      window.scrollTo({ top: 0, behavior: 'smooth' });
      showToast("Milestone configured successfully! Order active.", "success");
    } catch (err: any) {
      console.error(err);
      showToast("Handshake error configuring order: " + (err.message || err), "error");
    }
  };

  const cartCount = cart.reduce((acc, item) => acc + item.quantity, 0);

  // Standalone Admin Dashboard View
  if (activeTab === 'admin') {
    return (
      <div className="min-h-screen bg-[#F8FAFC]">
        <AdminDashboardView
          user={user}
          setActiveTab={setActiveTab}
          showToast={showToast}
        />
        <Toast toasts={toasts} removeToast={removeToast} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-neutral-950 flex flex-col font-sans antialiased selection:bg-neutral-100 selection:text-neutral-900">
      
      {/* Sticky Premium Header */}
      <Navbar
        cartCount={cartCount}
        wishlistCount={wishlist.length}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        setCartOpen={handleSetCartOpen}
        setWishlistOpen={handleSetWishlistOpen}
        setLoginOpen={setLoginOpen}
        setBuilderOpen={setBuilderOpen}
        searchQuery={searchQuery}
        setSearchQuery={setSearchQuery}
        user={user}
        authLoading={authLoading}
        onLogout={handleLogout}
      />

      {/* Main Page Layout Wrapper */}
      <main className="flex-1">
        {activeTab === 'home' && (
          <>
            {/* 1. Hero Section */}
            <Hero setActiveTab={setActiveTab} setBuilderOpen={setBuilderOpen} />

            {/* 2. Browse Categories Section */}
            <Categories onSelectCategory={setSelectedCategory} setActiveTab={setActiveTab} />

            {/* 3 & 4. Featured & Latest Templates */}
            <TemplateSection
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setBuilderOpen={setBuilderOpen}
              searchQuery={searchQuery}
            />
          </>
        )}

        {activeTab === 'templates' && (
          <>
            {/* Filtered Templates view */}
            <TemplateSection
              selectedCategory={selectedCategory}
              setSelectedCategory={setSelectedCategory}
              setBuilderOpen={setBuilderOpen}
              searchQuery={searchQuery}
            />
          </>
        )}

        {activeTab === 'surprise_websites' && (
          <>
            {/* Detailed Surprise Website page */}
            <SurpriseWebsitesView setBuilderOpen={setBuilderOpen} />
          </>
        )}

        {activeTab === 'how_it_works' && (
          <>
            {/* Detailed Roadmap */}
            <HowItWorksView setBuilderOpen={setBuilderOpen} setActiveTab={setActiveTab} />
          </>
        )}
        {activeTab === 'profile' && user && (
          <UserProfileView user={user} onUpdateUser={(updated) => setUser(updated)} showToast={showToast} />
        )}

        {activeTab === 'dashboard' && user && (
          <FutureDashboardView user={user} setActiveTab={setActiveTab} setBuilderOpen={setBuilderOpen} showToast={showToast} />
        )}
      </main>

      {/* 6. Footer */}
      <Footer setActiveTab={setActiveTab} setBuilderOpen={setBuilderOpen} />

      {/* Modals, Slide-overs, & Configurator */}
      <DrawersAndModals
        cart={cart}
        wishlist={wishlist}
        isCartOpen={isCartOpen}
        isWishlistOpen={isWishlistOpen}
        isLoginOpen={isLoginOpen || (user !== null && !isEmailVerified)}
        isBuilderOpen={isBuilderOpen}
        setCartOpen={handleSetCartOpen}
        setWishlistOpen={handleSetWishlistOpen}
        setLoginOpen={setLoginOpen}
        setBuilderOpen={setBuilderOpen}
        removeFromCart={removeFromCart}
        updateCartQty={updateCartQty}
        removeFromWishlist={removeFromWishlist}
        addToCart={addToCart}
        onGoogleLogin={handleGoogleLogin}
        onCheckout={handleCheckout}
        user={user}
        isEmailVerified={isEmailVerified}
        setIsEmailVerified={setIsEmailVerified}
      />


      {/* Premium Toast Notifications */}
      <Toast toasts={toasts} removeToast={removeToast} />

    </div>
  );
}
