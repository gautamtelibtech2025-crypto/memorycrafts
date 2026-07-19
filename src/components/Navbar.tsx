import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Search,
  Heart,
  ShoppingBag,
  User,
  Menu,
  X,
  ChevronDown,
  Sparkles,
  Layers,
  HelpCircle,
  TrendingUp,
  Grid,
  LogOut,
  LayoutDashboard,
  UserCheck,
  Loader2,
  Package
} from 'lucide-react';
import { Category, CATEGORIES, UserProfile } from '../types';
import { API_BASE_URL } from '../lib/api';


interface NavbarProps {
  cartCount: number;
  wishlistCount: number;
  activeTab: string;
  setActiveTab: (tab: string) => void;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setLoginOpen: (open: boolean) => void;
  setBuilderOpen: (open: boolean) => void;
  searchQuery: string;
  setSearchQuery: (query: string) => void;
  user: UserProfile | null;
  authLoading: boolean;
  onLogout: () => Promise<void>;
}

export default function Navbar({
  cartCount,
  wishlistCount,
  activeTab,
  setActiveTab,
  setCartOpen,
  setWishlistOpen,
  setLoginOpen,
  setBuilderOpen,
  searchQuery,
  setSearchQuery,
  user,
  authLoading,
  onLogout,
}: NavbarProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isCategoriesDropdownOpen, setIsCategoriesDropdownOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Boutique' },
    { id: 'templates', label: 'Canva Templates' },
    { id: 'surprise_websites', label: 'Surprise Websites' },
    { id: 'how_it_works', label: 'How It Works' },
  ];

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };

  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    setIsMobileMenuOpen(false);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <header className="sticky top-0 z-40 w-full bg-white border-b border-[#EAEAEA] backdrop-blur-md bg-white/95">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16 md:h-20">
          
          {/* Logo Branding */}
          <div className="flex-shrink-0 flex items-center">
            <button
              id="brand-logo-btn"
              onClick={() => handleNavClick('home')}
              className="text-xl font-bold tracking-tight uppercase text-[#111111] hover:opacity-90 transition-opacity"
            >
              MemoryCraft
            </button>
          </div>

          {/* Search Bar - Center Desktop */}
          <div className="hidden md:flex flex-1 max-w-md mx-8 relative">
            <div className="relative w-full">
              <Search className={`absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors ${
                isSearchFocused ? 'text-accent' : 'text-neutral-400'
              }`} />
              <input
                id="search-input"
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                onFocus={() => setIsSearchFocused(true)}
                onBlur={() => setTimeout(() => setIsSearchFocused(false), 200)}
                placeholder="Search templates..."
                className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-full py-1.5 pl-9 pr-4 text-[13px] text-[#111111] placeholder-[#A1A1A1] focus:outline-hidden focus:border-[#111111] focus:bg-white transition-all font-sans"
              />
              <AnimatePresence>
                {isSearchFocused && (
                  <motion.div
                    id="search-suggest-box"
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 10 }}
                    className="absolute top-full left-0 right-0 mt-2 bg-white rounded-lg shadow-xl border border-[#EAEAEA] p-4 z-50 text-left"
                  >
                    <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block mb-2.5">Suggested Categories</span>
                    <div className="flex flex-wrap gap-1.5">
                      {CATEGORIES.slice(0, 4).map((cat) => (
                        <button
                          key={cat.id}
                          id={`search-suggest-${cat.id}`}
                          onClick={() => {
                            setSearchQuery(cat.name);
                            setActiveTab('templates');
                          }}
                          className="px-3 py-1 rounded-full bg-white border border-[#EAEAEA] text-[11px] text-[#666666] hover:border-[#111111] hover:text-[#111111] transition-all"
                        >
                          {cat.name}
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6">
            {/* Categories dropdown inside Nav */}
            <div className="relative">
              <button
                id="categories-dropdown-btn"
                onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
                onClick={() => setIsCategoriesDropdownOpen(!isCategoriesDropdownOpen)}
                className="flex items-center space-x-1 text-[13px] font-medium text-[#666666] hover:text-[#111111] transition-colors py-2"
              >
                <span>Categories</span>
                <ChevronDown className={`w-3.5 h-3.5 transition-transform duration-300 ${isCategoriesDropdownOpen ? 'rotate-180' : ''}`} />
              </button>

              <AnimatePresence>
                {isCategoriesDropdownOpen && (
                  <motion.div
                    id="categories-dropdown"
                    onMouseEnter={() => setIsCategoriesDropdownOpen(true)}
                    onMouseLeave={() => setIsCategoriesDropdownOpen(false)}
                    initial={{ opacity: 0, y: 5 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: 5 }}
                    className="absolute top-full left-0 w-64 bg-white shadow-xl border border-[#EAEAEA] py-3 rounded-lg z-50"
                  >
                    <div className="grid grid-cols-1 gap-0.5 px-2">
                      {CATEGORIES.map((cat) => (
                        <button
                          key={cat.id}
                          id={`nav-category-${cat.id}`}
                          onClick={() => {
                            setActiveTab('templates');
                            setIsCategoriesDropdownOpen(false);
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-md hover:bg-neutral-50 transition-colors group"
                        >
                          <div className="w-1.5 h-1.5 rounded-full bg-neutral-300 group-hover:bg-accent transition-colors" />
                          <div>
                            <span className="block text-xs font-semibold text-neutral-950 font-sans">{cat.name}</span>
                            <span className="block text-[9px] text-[#666666] font-sans line-clamp-1">{cat.description}</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {navItems.map((item) => (
              <button
                key={item.id}
                id={`nav-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`text-[13px] font-medium transition-colors py-2 relative ${
                  activeTab === item.id ? 'text-[#111111]' : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                <span>{item.label}</span>
                {activeTab === item.id && (
                  <motion.div
                    layoutId="activeNavLine"
                    className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#2563EB]"
                    transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                  />
                )}
              </button>
            ))}
          </nav>

          {/* Right Action Icons */}
          <div className="flex items-center space-x-4">
            {/* Surprise Custom Site Action CTA */}
            <button
              id="navbar-customize-site-btn"
              onClick={() => setBuilderOpen(true)}
              className="hidden sm:flex items-center space-x-1.5 text-[12px] font-semibold bg-[#111111] text-white hover:bg-neutral-800 px-5 py-2 rounded-full uppercase tracking-wider transition-colors"
            >
              <Sparkles className="w-3.5 h-3.5" />
              <span>Design Surprise Site</span>
            </button>

            {/* Wishlist Button */}
            <button
              id="navbar-wishlist-btn"
              onClick={() => setWishlistOpen(true)}
              className="p-1 text-[#666666] hover:text-[#111111] transition-colors relative"
              aria-label="Wishlist"
            >
              <Heart className="w-[20px] h-[20px]" strokeWidth={1.5} />
              {wishlistCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#2563EB] rounded-full"></span>
              )}
            </button>

            {/* Cart Button */}
            <button
              id="navbar-cart-btn"
              onClick={() => setCartOpen(true)}
              className="p-1 text-[#666666] hover:text-[#111111] transition-colors relative"
              aria-label="Cart"
            >
              <ShoppingBag className="w-[20px] h-[20px]" strokeWidth={1.5} />
              {cartCount > 0 && (
                <span className="absolute top-0 right-0 w-2 h-2 bg-[#2563EB] rounded-full"></span>
              )}
            </button>

            {authLoading ? (
              <div className="hidden md:flex items-center space-x-1.5 animate-pulse bg-[#FAFAFA] border border-[#EAEAEA] px-4 py-2 rounded-full">
                <Loader2 className="w-3.5 h-3.5 animate-spin text-neutral-400" />
                <span className="text-[11px] font-mono text-neutral-400 uppercase tracking-wider">Syncing...</span>
              </div>
            ) : user ? (
              <div className="relative">
                <button
                  id="navbar-profile-btn"
                  onClick={() => setIsProfileDropdownOpen(!isProfileDropdownOpen)}
                  onBlur={() => setTimeout(() => setIsProfileDropdownOpen(false), 200)}
                  className="flex items-center space-x-2 p-1 rounded-full hover:bg-[#FAFAFA] transition-colors focus:outline-hidden cursor-pointer"
                >
                  <img
                    src={
                      user.photoURL
                        ? user.photoURL.startsWith('/media/')
                          ? `${API_BASE_URL}${user.photoURL}`
                          : user.photoURL
                        : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
                    }
                    alt={user.displayName || 'Patron'}
                    referrerPolicy="no-referrer"
                    className="w-8 h-8 rounded-full object-cover border border-[#EAEAEA]"
                  />
                  <ChevronDown className="w-3.5 h-3.5 text-neutral-500 hidden md:block" />
                </button>

                <AnimatePresence>
                  {isProfileDropdownOpen && (
                    <motion.div
                      id="navbar-profile-dropdown"
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      transition={{ duration: 0.15 }}
                      className="absolute right-0 mt-2 w-56 bg-white shadow-xl border border-[#EAEAEA] rounded-xl py-2.5 z-50 text-left overflow-hidden"
                    >
                      {/* Dropdown Header */}
                      <div className="px-4 py-2 border-b border-[#EAEAEA] mb-1.5">
                        <span className="block text-xs font-semibold text-[#111111] truncate font-sans">{user.displayName}</span>
                        <span className="block text-[10px] text-neutral-400 truncate font-mono mt-0.5">{user.email}</span>
                      </div>

                      {/* Dropdown Actions */}
                      <div className="px-1.5 space-y-0.5">
                        <button
                          id="dropdown-profile-btn"
                          onClick={() => {
                            setActiveTab('profile');
                            setIsProfileDropdownOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-md text-xs font-semibold text-neutral-700 hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors font-sans cursor-pointer"
                        >
                          <User className="w-4 h-4 text-neutral-400" />
                          <span>My Profile</span>
                        </button>

                        <button
                          id="dropdown-dashboard-btn"
                          onClick={() => {
                            setActiveTab('dashboard');
                            setIsProfileDropdownOpen(false);
                            window.scrollTo({ top: 0, behavior: 'smooth' });
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-md text-xs font-semibold text-neutral-700 hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors font-sans cursor-pointer"
                        >
                          <Package className="w-4 h-4 text-neutral-400" />
                          <span>My Orders</span>
                        </button>

                        <button
                          id="dropdown-wishlist-btn"
                          onClick={() => {
                            setWishlistOpen(true);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-md text-xs font-semibold text-neutral-700 hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors font-sans cursor-pointer"
                        >
                          <Heart className="w-4 h-4 text-neutral-400" />
                          <span>Wishlist</span>
                        </button>

                        <button
                          id="dropdown-cart-btn"
                          onClick={() => {
                            setCartOpen(true);
                            setIsProfileDropdownOpen(false);
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-md text-xs font-semibold text-neutral-700 hover:text-[#111111] hover:bg-[#FAFAFA] transition-colors font-sans cursor-pointer"
                        >
                          <ShoppingBag className="w-4 h-4 text-neutral-400" />
                          <span>Cart</span>
                        </button>
                      </div>

                      {/* Dropdown Footer Logout */}
                      <div className="border-t border-[#EAEAEA] mt-1.5 pt-1.5 px-1.5">
                        <button
                          id="dropdown-logout-btn"
                          onClick={() => {
                            onLogout();
                            setIsProfileDropdownOpen(false);
                          }}
                          className="flex items-center space-x-3 w-full px-3 py-2 text-left rounded-md text-xs font-semibold text-red-600 hover:bg-red-50/50 transition-colors font-sans cursor-pointer"
                        >
                          <LogOut className="w-4 h-4 text-red-400" />
                          <span>Logout</span>
                        </button>
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            ) : (
              <button
                id="navbar-login-btn"
                onClick={() => setLoginOpen(true)}
                className="hidden md:flex px-5 py-2 bg-[#111111] text-white text-[12px] font-semibold rounded-full hover:bg-neutral-800 transition-colors uppercase tracking-wider cursor-pointer"
              >
                Login
              </button>
            )}

            {/* Mobile Menu Trigger */}
            <button
              id="mobile-menu-btn"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="lg:hidden p-1.5 rounded-full hover:bg-neutral-50 text-neutral-600 hover:text-neutral-950 transition-colors"
              aria-label="Toggle Menu"
            >
              {isMobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>

        </div>
      </div>

      {/* Mobile Menu Drawer */}
      <AnimatePresence>
        {isMobileMenuOpen && (
          <motion.div
            id="mobile-menu-drawer"
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="lg:hidden border-t border-neutral-100 bg-white overflow-hidden"
          >
            <div className="px-4 py-6 space-y-6">
              {/* Mobile Search */}
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                <input
                  id="mobile-search-input"
                  type="text"
                  value={searchQuery}
                  onChange={handleSearchChange}
                  placeholder="Search elegant memory templates..."
                  className="w-full pl-9 pr-4 py-2 bg-neutral-50 border border-neutral-200 rounded text-xs text-neutral-950"
                />
              </div>

              {/* Navigation Items */}
              <div className="flex flex-col space-y-4">
                {navItems.map((item) => (
                  <button
                    key={item.id}
                    id={`mobile-nav-${item.id}`}
                    onClick={() => handleNavClick(item.id)}
                    className={`text-left text-xs uppercase tracking-widest font-mono font-medium py-1.5 ${
                      activeTab === item.id ? 'text-accent' : 'text-neutral-600'
                    }`}
                  >
                    {item.label}
                  </button>
                ))}
              </div>

              {/* Occasion Quick Category List */}
              <div className="space-y-2">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Explore Occasions</span>
                <div className="grid grid-cols-2 gap-2">
                  {CATEGORIES.map((cat) => (
                    <button
                      key={cat.id}
                      id={`mobile-category-${cat.id}`}
                      onClick={() => {
                        setActiveTab('templates');
                        setIsMobileMenuOpen(false);
                      }}
                      className="p-2.5 rounded bg-neutral-50 text-left border border-neutral-200/50 text-xs font-sans text-neutral-700 hover:border-accent hover:text-accent transition-all"
                    >
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Site Creator Mobile CTA */}
              <button
                id="mobile-customize-site-btn"
                onClick={() => {
                  setBuilderOpen(true);
                  setIsMobileMenuOpen(false);
                }}
                className="w-full bg-accent text-white py-3 rounded text-xs font-mono uppercase tracking-widest flex items-center justify-center space-x-2"
              >
                <Sparkles className="w-4 h-4" />
                <span>Design Custom Surprise Site</span>
              </button>

              {/* Mobile Account status */}
              {authLoading ? (
                <div className="w-full border border-neutral-200 py-3 rounded text-xs font-mono uppercase tracking-widest text-neutral-400 flex items-center justify-center space-x-2 animate-pulse bg-neutral-50">
                  <Loader2 className="w-4 h-4 animate-spin text-neutral-400" />
                  <span>Syncing Auth Node...</span>
                </div>
              ) : user ? (
                <div className="space-y-3 pt-3 border-t border-neutral-100">
                  <div className="flex items-center space-x-3 px-1 py-1">
                    <img
                      src={
                        user.photoURL
                          ? user.photoURL.startsWith('/media/')
                            ? `${API_BASE_URL}${user.photoURL}`
                            : user.photoURL
                          : 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=120'
                      }
                      alt={user.displayName || 'Patron'}
                      referrerPolicy="no-referrer"
                      className="w-10 h-10 rounded-full object-cover border border-[#EAEAEA]"
                    />
                    <div className="text-left">
                      <span className="block text-xs font-bold text-[#111111] font-sans">{user.displayName}</span>
                      <span className="block text-[9px] text-neutral-400 font-mono">{user.email}</span>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <button
                      id="mobile-nav-profile-btn"
                      onClick={() => {
                        setActiveTab('profile');
                        setIsMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2.5 rounded bg-neutral-50 text-center border border-neutral-200/50 text-xs font-semibold text-neutral-700 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <User className="w-3.5 h-3.5 text-neutral-400" />
                      <span>My Profile</span>
                    </button>
                    <button
                      id="mobile-nav-dashboard-btn"
                      onClick={() => {
                        setActiveTab('dashboard');
                        setIsMobileMenuOpen(false);
                        window.scrollTo({ top: 0, behavior: 'smooth' });
                      }}
                      className="p-2.5 rounded bg-neutral-50 text-center border border-neutral-200/50 text-xs font-semibold text-neutral-700 flex items-center justify-center space-x-2 cursor-pointer"
                    >
                      <Package className="w-3.5 h-3.5 text-neutral-400" />
                      <span>My Orders</span>
                    </button>
                  </div>
                  <button
                    id="mobile-logout-btn"
                    onClick={() => {
                      onLogout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="w-full bg-red-50 text-red-600 border border-red-100 py-3 rounded text-xs font-mono uppercase tracking-widest hover:bg-red-100/50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                  >
                    <LogOut className="w-4 h-4 text-red-400" />
                    <span>Logout Account</span>
                  </button>
                </div>
              ) : (
                <button
                  id="mobile-login-btn"
                  onClick={() => {
                    setLoginOpen(true);
                    setIsMobileMenuOpen(false);
                  }}
                  className="w-full border border-neutral-200 py-3 rounded text-xs font-mono uppercase tracking-widest text-neutral-700 hover:bg-neutral-50 transition-colors flex items-center justify-center space-x-2 cursor-pointer"
                >
                  <User className="w-4 h-4" />
                  <span>Sign In / Create Account</span>
                </button>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  );
}
