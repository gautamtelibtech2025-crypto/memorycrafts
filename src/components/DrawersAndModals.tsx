import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  X,
  Plus,
  Minus,
  Trash2,
  Heart,
  ShoppingBag,
  ArrowRight,
  Check,
  Music,
  Image as ImageIcon,
  Sparkles,
  Calendar,
  Gift,
  Mail,
  Lock,
  Laptop,
  CheckSquare,
  Loader2
} from 'lucide-react';
import { CartItem, WishlistItem, CATEGORIES, UserProfile } from '../types';
import { loginWithEmail, registerWithEmail, sendPasswordReset, checkEmailVerifiedStatus, sendVerificationEmail, logoutUser } from '../lib/firebase';

interface DrawersAndModalsProps {
  cart: CartItem[];
  wishlist: WishlistItem[];
  isCartOpen: boolean;
  isWishlistOpen: boolean;
  isLoginOpen: boolean;
  isBuilderOpen: boolean;
  setCartOpen: (open: boolean) => void;
  setWishlistOpen: (open: boolean) => void;
  setLoginOpen: (open: boolean) => void;
  setBuilderOpen: (open: boolean) => void;
  removeFromCart: (id: string) => void;
  updateCartQty: (id: string, qty: number) => void;
  removeFromWishlist: (id: string) => void;
  addToCart: (item: Omit<CartItem, 'quantity'>) => void;
  onGoogleLogin: () => Promise<void>;
  onCheckout: () => Promise<void>;
  user: UserProfile | null;
  isEmailVerified: boolean;
  setIsEmailVerified: (verified: boolean) => void;
}


export default function DrawersAndModals({
  cart,
  wishlist,
  isCartOpen,
  isWishlistOpen,
  isLoginOpen,
  isBuilderOpen,
  setCartOpen,
  setWishlistOpen,
  setLoginOpen,
  setBuilderOpen,
  removeFromCart,
  updateCartQty,
  removeFromWishlist,
  addToCart,
  onGoogleLogin,
  onCheckout,
  user,
  isEmailVerified,
  setIsEmailVerified,
}: DrawersAndModalsProps) {

  // Login modal internal state
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);

  // Email/Password login internal state
  const [authMode, setAuthMode] = useState<'login' | 'signup' | 'forgot' | 'verify'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);
  const [authSuccessMessage, setAuthSuccessMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Verification states
  const [isCheckingVerification, setIsCheckingVerification] = useState(false);
  const [isSendingVerification, setIsSendingVerification] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  // Sync authMode when unverified user is loaded
  React.useEffect(() => {
    if (user && !isEmailVerified) {
      setAuthMode('verify');
    }
  }, [user, isEmailVerified]);

  // Cooldown timer logic
  React.useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setTimeout(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [resendCooldown]);

  const handleVerifyEmailCheck = async () => {
    setAuthError(null);
    setAuthSuccessMessage(null);
    setIsCheckingVerification(true);
    try {
      const verified = await checkEmailVerifiedStatus();
      if (verified) {
        setIsEmailVerified(true);
        setAuthSuccessMessage("Email verified successfully! Accessing MemoryCraft...");
        setTimeout(() => {
          setLoginOpen(false);
          setAuthSuccessMessage(null);
        }, 1500);
      } else {
        setAuthError("Email not verified yet. Please click the confirmation link sent to your inbox first.");
      }
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Failed to check email verification status.");
    } finally {
      setIsCheckingVerification(false);
    }
  };

  const handleResendVerification = async () => {
    if (resendCooldown > 0) return;
    setAuthError(null);
    setAuthSuccessMessage(null);
    setIsSendingVerification(true);
    try {
      await sendVerificationEmail();
      setAuthSuccessMessage("Verification email resent! Please check your inbox/spam folder.");
      setResendCooldown(60); // 60s cooldown
    } catch (err: any) {
      console.error(err);
      setAuthError(err.message || "Failed to resend verification email.");
    } finally {
      setIsSendingVerification(false);
    }
  };

  const handleBackToLogin = async () => {
    setAuthError(null);
    setAuthSuccessMessage(null);
    try {
      await logoutUser();
      setIsEmailVerified(true);
      setAuthMode('login');
      setLoginOpen(true);
    } catch (err: any) {
      console.error(err);
    }
  };


  // Clear modal inputs on close
  React.useEffect(() => {
    if (!isLoginOpen) {
      setAuthMode('login');
      setEmail('');
      setPassword('');
      setDisplayName('');
      setAuthError(null);
      setAuthSuccessMessage(null);
      setIsSubmitting(false);
    }
  }, [isLoginOpen]);

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email.trim() || !password) {
      setAuthError('Email and Password are required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await loginWithEmail(email.trim(), password);
      setLoginOpen(false);
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to login. Please try again.';
      if (err.code === 'auth/wrong-password' || err.code === 'auth/user-not-found' || err.code === 'auth/invalid-credential') {
        errMsg = 'Incorrect email or password.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Invalid email address format.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEmailRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!email.trim() || !password || !displayName.trim()) {
      setAuthError('All fields are required.');
      return;
    }
    if (password.length < 6) {
      setAuthError('Password must be at least 6 characters long.');
      return;
    }
    setIsSubmitting(true);
    try {
      await registerWithEmail(email.trim(), password, displayName.trim());
      setLoginOpen(false);
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to register account.';
      if (err.code === 'auth/email-already-in-use') {
        errMsg = 'An account already exists with this email address.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Invalid email address format.';
      } else if (err.code === 'auth/weak-password') {
        errMsg = 'Password must be at least 6 characters long.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handlePasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    setAuthSuccessMessage(null);
    if (!email.trim()) {
      setAuthError('Email address is required.');
      return;
    }
    setIsSubmitting(true);
    try {
      await sendPasswordReset(email.trim());
      setAuthSuccessMessage('Password reset link sent! Check your inbox.');
    } catch (err: any) {
      console.error(err);
      let errMsg = 'Failed to send password reset email.';
      if (err.code === 'auth/user-not-found') {
        errMsg = 'No registered user found with this email.';
      } else if (err.code === 'auth/invalid-email') {
        errMsg = 'Invalid email address format.';
      } else if (err.message) {
        errMsg = err.message;
      }
      setAuthError(errMsg);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Builder modal internal state
  const [builderStep, setBuilderStep] = useState(1);
  const [recipientName, setRecipientName] = useState('');
  const [selectedOccasion, setSelectedOccasion] = useState('birthday');
  const [selectedAesthetic, setSelectedAesthetic] = useState('serif');
  const [selectedFeatures, setSelectedFeatures] = useState<string[]>([
    'timeline',
    'letter',
    'music',
  ]);
  const [websiteConfigured, setWebsiteConfigured] = useState(false);
  
  // Custom non-blocking alert states
  const [checkoutNotice, setCheckoutNotice] = useState(false);
  const [recipientWarning, setRecipientWarning] = useState(false);

  const toggleFeature = (feat: string) => {
    if (selectedFeatures.includes(feat)) {
      setSelectedFeatures(selectedFeatures.filter((f) => f !== feat));
    } else {
      setSelectedFeatures([...selectedFeatures, feat]);
    }
  };

  const handleAddCustomSiteToCart = () => {
    const siteTitle = `${recipientName || 'Surprise'}'s Bespoke ${
      selectedOccasion.charAt(0).toUpperCase() + selectedOccasion.slice(1)
    } Space`;

    addToCart({
      id: `custom-site-${Date.now()}`,
      title: siteTitle,
      price: 149.0, // Luxury premium price for custom website
      type: 'custom_website',
      category: selectedOccasion,
    });

    setWebsiteConfigured(true);
    setTimeout(() => {
      setWebsiteConfigured(false);
      setBuilderOpen(false);
      setBuilderStep(1);
      setRecipientName('');
      setSelectedOccasion('birthday');
      setSelectedAesthetic('serif');
      setSelectedFeatures(['timeline', 'letter', 'music']);
      setCartOpen(true); // Open cart to show item added
    }, 1800);
  };

  const cartTotal = cart.reduce((acc, item) => acc + item.price * item.quantity, 0);

  return (
    <>
      <AnimatePresence>
        {/* Backdrop for side drawers */}
        {(isCartOpen || isWishlistOpen) && (
          <motion.div
            id="backdrop-drawers"
            initial={{ opacity: 0 }}
            animate={{ opacity: 0.4 }}
            exit={{ opacity: 0 }}
            onClick={() => {
              setCartOpen(false);
              setWishlistOpen(false);
            }}
            className="fixed inset-0 z-50 bg-black/50 backdrop-blur-xs"
          />
        )}
      </AnimatePresence>

      {/* Cart Slide-over */}
      <AnimatePresence>
        {isCartOpen && (
          <motion.div
            id="cart-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-neutral-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <ShoppingBag className="w-5 h-5 text-neutral-950" />
                <h2 className="font-display text-lg font-medium tracking-tight text-neutral-950">Shopping Bag</h2>
                <span className="text-xs font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                  {cart.length}
                </span>
              </div>
              <button
                id="close-cart-btn"
                onClick={() => setCartOpen(false)}
                className="p-1 text-neutral-500 hover:text-neutral-950 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {cart.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                    <ShoppingBag className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-neutral-900 tracking-tight">Your bag is empty</h3>
                    <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">
                      Explore our premium editable Canva templates and custom surprise spaces to begin crafting memories.
                    </p>
                  </div>
                  <button
                    id="cart-continue-shopping-btn"
                    onClick={() => setCartOpen(false)}
                    className="mt-2 text-xs font-mono uppercase tracking-widest text-accent font-semibold border-b border-accent pb-0.5 hover:text-accent/80 hover:border-accent/80 transition-colors"
                  >
                    Continue Browsing
                  </button>
                </div>
              ) : (
                <div className="space-y-4">
                  {cart.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className="flex items-start space-x-4 p-4 rounded-lg bg-neutral-50/50 border border-neutral-100 transition-all hover:bg-neutral-50"
                    >
                      <div className="w-16 h-16 rounded bg-neutral-100 flex-shrink-0 flex items-center justify-center text-xs font-mono text-neutral-400 border border-neutral-100">
                        {item.type === 'custom_website' ? (
                          <Laptop className="w-6 h-6 text-accent" />
                        ) : (
                          <span className="text-neutral-500 font-semibold">CANVA</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-neutral-950 truncate pr-2">
                            {item.title}
                          </h4>
                          <button
                            id={`remove-cart-item-${item.id}`}
                            onClick={() => removeFromCart(item.id)}
                            className="p-1 text-neutral-400 hover:text-red-500 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-500 bg-neutral-100 px-1.5 py-0.5 rounded">
                          {item.type === 'custom_website' ? 'Surprise Site' : 'Template'}
                        </span>
                        <div className="flex items-center justify-between mt-3">
                          <div className="flex items-center space-x-1.5 border border-neutral-200 rounded bg-white">
                            <button
                              id={`decrease-qty-${item.id}`}
                              onClick={() => updateCartQty(item.id, item.quantity - 1)}
                              className="p-1 text-neutral-500 hover:text-neutral-950 transition-colors"
                            >
                              <Minus className="w-3 h-3" />
                            </button>
                            <span className="text-xs font-mono w-6 text-center text-neutral-950">
                              {item.quantity}
                            </span>
                            <button
                              id={`increase-qty-${item.id}`}
                              onClick={() => updateCartQty(item.id, item.quantity + 1)}
                              className="p-1 text-neutral-500 hover:text-neutral-950 transition-colors"
                            >
                              <Plus className="w-3 h-3" />
                            </button>
                          </div>
                          <span className="text-sm font-mono font-medium text-neutral-950">
                            ${(item.price * item.quantity).toFixed(2)}
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>

            {/* Footer summary */}
            {cart.length > 0 && (
              <div className="p-6 border-t border-neutral-100 bg-neutral-50/50 space-y-4">
                <div className="space-y-1.5 text-sm">
                  <div className="flex justify-between text-neutral-500">
                    <span>Subtotal</span>
                    <span className="font-mono text-neutral-900">${cartTotal.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-neutral-500">
                    <span>Tax & Delivery</span>
                    <span className="font-mono text-neutral-900">$0.00</span>
                  </div>
                  <div className="flex justify-between text-base font-semibold pt-1.5 border-t border-[#EAEAEA] text-[#111111]">
                    <span className="font-sans">Total</span>
                    <span className="font-mono">${cartTotal.toFixed(2)}</span>
                  </div>
                </div>

                {checkoutNotice && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="p-3 bg-blue-50/70 border border-blue-200 rounded-lg text-xs text-[#2563EB] font-sans leading-relaxed text-left"
                  >
                    🚀 <strong>Secure Purchase flow successfully validated.</strong> Checkout integrations (Razorpay, Stripe) represent Phase 2 execution. In this frontend phase, the entire catalog and cart state operate with real local persistence.
                  </motion.div>
                )}

                <button
                  id="checkout-btn"
                  disabled={isCheckingOut}
                  className="w-full bg-[#2563EB] hover:bg-blue-700 disabled:bg-blue-400 text-white text-xs font-semibold uppercase tracking-wider py-3.5 px-4 rounded-full transition-colors flex items-center justify-center space-x-2 shadow-sm group cursor-pointer"
                  onClick={async () => {
                    setIsCheckingOut(true);
                    setCheckoutNotice(true);
                    try {
                      await onCheckout();
                    } catch (err) {
                      // Handled by App
                    } finally {
                      setIsCheckingOut(false);
                    }
                  }}
                >
                  {isCheckingOut ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin" />
                      <span>Processing Order...</span>
                    </>
                  ) : (
                    <>
                      <span>Proceed to Checkout</span>
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </button>
                <p className="text-[10px] text-center text-[#666666]">
                  Secure Digital Delivery. Customizable & downloadable format.
                </p>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Wishlist Slide-over */}
      <AnimatePresence>
        {isWishlistOpen && (
          <motion.div
            id="wishlist-drawer"
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed inset-y-0 right-0 z-50 w-full max-w-md bg-white shadow-2xl flex flex-col border-l border-neutral-100"
          >
            {/* Header */}
            <div className="p-6 border-b border-neutral-100 flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Heart className="w-5 h-5 text-neutral-950 fill-neutral-950" />
                <h2 className="font-display text-lg font-medium tracking-tight text-neutral-950">Saved Memories</h2>
                <span className="text-xs font-mono bg-neutral-100 px-2 py-0.5 rounded text-neutral-600">
                  {wishlist.length}
                </span>
              </div>
              <button
                id="close-wishlist-btn"
                onClick={() => setWishlistOpen(false)}
                className="p-1 text-neutral-500 hover:text-neutral-950 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              {wishlist.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 py-12">
                  <div className="w-12 h-12 rounded-full bg-neutral-50 flex items-center justify-center border border-neutral-100">
                    <Heart className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div>
                    <h3 className="font-display font-medium text-neutral-900 tracking-tight">Your Wishlist is empty</h3>
                    <p className="text-sm text-neutral-500 mt-1 max-w-xs mx-auto">
                      Tap the heart icon on any Canva templates or Surprise Website mockups to store your favorites.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  {wishlist.map((item) => (
                    <motion.div
                      key={item.id}
                      layout
                      className="flex items-start space-x-4 p-4 rounded-lg bg-neutral-50/50 border border-neutral-100 transition-all hover:bg-neutral-50"
                    >
                      <div className="w-16 h-16 rounded bg-neutral-100 flex-shrink-0 flex items-center justify-center text-xs font-mono text-neutral-400 border border-neutral-100">
                        {item.type === 'custom_website' ? (
                          <Laptop className="w-6 h-6 text-accent" />
                        ) : (
                          <span className="text-neutral-500 font-semibold">CANVA</span>
                        )}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-start justify-between">
                          <h4 className="text-sm font-medium text-neutral-950 truncate pr-2">
                            {item.title}
                          </h4>
                          <button
                            id={`remove-wish-item-${item.id}`}
                            onClick={() => removeFromWishlist(item.id)}
                            className="p-1 text-neutral-400 hover:text-neutral-600 transition-colors"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                        <div className="flex items-center justify-between mt-4">
                          <span className="text-sm font-mono font-medium text-neutral-950">
                            ${item.price.toFixed(2)}
                          </span>
                          <button
                            id={`wish-add-to-cart-${item.id}`}
                            onClick={() => {
                              addToCart(item);
                              removeFromWishlist(item.id);
                            }}
                            className="bg-neutral-950 text-white text-[10px] font-mono uppercase tracking-wider py-1.5 px-3 rounded hover:bg-accent transition-colors flex items-center space-x-1"
                          >
                            <span>Add to Bag</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Login Modal */}
      <AnimatePresence>
        {isLoginOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              id="login-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => {
                if (authMode !== 'verify') setLoginOpen(false);
              }}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              id="login-modal-box"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white max-w-md w-full rounded-lg shadow-2xl border border-neutral-100 overflow-hidden relative z-10"
            >
              {authMode !== 'verify' && (
                <button
                  id="close-login-btn"
                  onClick={() => setLoginOpen(false)}
                  className="absolute top-4 right-4 p-1 text-neutral-500 hover:text-neutral-950 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}


              <div className="p-8">
                {isSigningIn || isSubmitting || isCheckingVerification || isSendingVerification ? (
                  <div className="text-center py-12 space-y-4">
                    <Loader2 className="w-10 h-10 text-[#2563EB] animate-spin mx-auto" />
                    <div>
                      <h3 className="font-sans font-semibold text-base text-[#111111]">
                        {isCheckingVerification 
                          ? "Verifying Email Link" 
                          : isSendingVerification 
                          ? "Sending Verification Link" 
                          : "Decrypting Identity Vault"}
                      </h3>
                      <p className="text-xs text-[#666666] mt-1 font-light">
                        {isCheckingVerification
                          ? "Reloading profile state and checking verification flag..."
                          : isSendingVerification
                          ? "Requesting a fresh verification coordinates payload..."
                          : isSigningIn
                          ? "Authenticating credentials securely with Google Auth..."
                          : "Authenticating credentials securely with Identity Vault..."}
                      </p>
                    </div>
                  </div>

                ) : (
                  <div className="space-y-6 text-left">
                    <div className="text-center space-y-2">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold block bg-stone-50 py-1 px-3 rounded-full w-max mx-auto border border-[#EAEAEA]">
                        Secure Identity Node
                      </span>
                      <h3 className="font-sans font-semibold text-2xl tracking-tight text-[#111111] text-center">
                        {authMode === 'login' && 'Access MemoryCraft'}
                        {authMode === 'signup' && 'Create Account'}
                        {authMode === 'forgot' && 'Reset Password'}
                        {authMode === 'verify' && 'Verify Your Email'}
                      </h3>
                      <p className="text-xs text-[#666666] font-light leading-relaxed text-center">
                        {authMode === 'login' && 'To protect milestone integrity and persistent custom surprise vaults, access your patron space.'}
                        {authMode === 'signup' && 'Register your coordinates to start designing templates and custom surprise keepsakes.'}
                        {authMode === 'forgot' && 'Provide your email coordinates to receive a decryption password recovery link.'}
                        {authMode === 'verify' && `We've sent a verification link to ${(user && user.email) || 'your email'}. Please check your inbox and verify your email.`}
                      </p>

                    </div>

                    {authError && (
                      <div className="space-y-3">
                        <div className="bg-red-50 border border-red-100 rounded-xl p-3.5 text-xs text-red-600 font-sans">
                          ⚠️ {authError}
                        </div>
                        {authError.toLowerCase().includes('unauthorized-domain') && (
                          <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 text-xs text-amber-900 font-sans space-y-3 text-left">
                            <div className="font-semibold text-amber-950 flex items-center space-x-1">
                              <span>🔒 Domain Authorization Required</span>
                            </div>
                            <p className="text-amber-800 leading-relaxed">
                              This preview domain needs to be allowlisted in your Firebase project so that Google Sign-In can verify the connection.
                            </p>
                            
                            <div className="bg-white/80 border border-amber-100 rounded-lg p-2.5 font-mono text-[11px] text-amber-950 flex items-center justify-between select-all">
                              <span>{window.location.hostname}</span>
                              <button
                                type="button"
                                onClick={() => {
                                  navigator.clipboard.writeText(window.location.hostname);
                                }}
                                className="text-[10px] font-sans font-semibold uppercase tracking-wider text-amber-700 hover:text-amber-900 ml-2"
                              >
                                Copy
                              </button>
                            </div>

                            <div className="space-y-1.5 text-amber-800 pt-1">
                              <p className="font-semibold text-amber-900">How to authorize:</p>
                              <ol className="list-decimal pl-4 space-y-1">
                                <li>Open the <a href="https://console.firebase.google.com" target="_blank" rel="noopener noreferrer" className="underline font-medium text-amber-950 hover:text-amber-900">Firebase Console</a></li>
                                <li>Navigate to <strong>Authentication</strong> &rarr; <strong>Settings</strong> tab &rarr; <strong>Authorized domains</strong></li>
                                <li>Click <strong>Add domain</strong>, paste the copied hostname above, and save.</li>
                              </ol>
                            </div>
                          </div>
                        )}

                        {(authError.toLowerCase().includes('popup-closed-by-user') || 
                          authError.toLowerCase().includes('popup-blocked') || 
                          authError.toLowerCase().includes('cancelled-by-user')) && (
                          <div className="bg-blue-50 border border-blue-200 rounded-xl p-4 text-xs text-blue-900 font-sans space-y-3 text-left">
                            <div className="font-semibold text-blue-950 flex items-center space-x-1">
                              <span>🌐 Iframe / Popup Issue Detected</span>
                            </div>
                            <p className="text-blue-800 leading-relaxed">
                              Because the application is running inside the AI Studio editor preview panel (iframe), browsers block Google Sign-In popups for security.
                            </p>
                            
                            <div className="pt-1 text-center">
                              <a
                                href={window.location.href}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-block bg-blue-600 hover:bg-blue-700 text-white font-semibold px-4 py-2 rounded-full transition-all shadow-xs"
                              >
                                🔗 Open App in New Tab to Log In
                              </a>
                            </div>
                          </div>
                        )}
                      </div>
                    )}

                    {authSuccessMessage && (
                      <div className="bg-emerald-50 border border-emerald-100 rounded-xl p-3.5 text-xs text-emerald-600 font-sans">
                        ✓ {authSuccessMessage}
                      </div>
                    )}

                    {/* Google Login is always displayed for Login/Signup */}
                    {authMode !== 'forgot' && authMode !== 'verify' && (
                      <>
                        <button
                          id="google-login-btn"
                          onClick={async () => {
                            setIsSigningIn(true);
                            setAuthError(null);
                            try {
                              await onGoogleLogin();
                            } catch (err: any) {
                              setAuthError(err.message || 'Google Auth Cancelled.');
                            } finally {
                              setIsSigningIn(false);
                            }
                          }}
                          className="w-full border border-[#EAEAEA] text-[#111111] text-xs font-semibold py-3.5 rounded-full hover:bg-[#FAFAFA] hover:border-neutral-300 transition-all flex items-center justify-center space-x-3 shadow-xs cursor-pointer"
                        >
                          <svg className="w-4 h-4" viewBox="0 0 24 24">
                            <path
                              fill="currentColor"
                              d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                            />
                            <path
                              fill="currentColor"
                              d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                            />
                            <path
                              fill="currentColor"
                              d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                            />
                          </svg>
                          <span className="font-semibold uppercase tracking-wider text-[11px]">Continue with Google</span>
                        </button>

                        <div className="flex items-center my-4">
                          <div className="flex-1 border-t border-[#EAEAEA]"></div>
                          <span className="px-3 text-[10px] font-mono uppercase text-neutral-400">or</span>
                          <div className="flex-1 border-t border-[#EAEAEA]"></div>
                        </div>
                      </>
                    )}

                    {/* Email/Password Forms or Email Verification Screen */}
                    {authMode === 'verify' ? (
                      <div className="space-y-4">
                        <div className="bg-stone-50 border border-[#EAEAEA] rounded-2xl p-6 text-center space-y-4">
                          <div className="w-12 h-12 bg-blue-50 text-[#2563EB] rounded-full flex items-center justify-center mx-auto border border-blue-100">
                            <svg className="w-6 h-6 animate-pulse" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M3 19v-8.93a2 2 0 01.89-1.664l8-5.333a2 2 0 012.22 0l8 5.333A2 2 0 0121 10.07V19M3 19a2 2 0 002 2h14a2 2 0 002-2M3 19l6.75-4.5M21 19l-6.75-4.5M3 10l6.75 4.5M21 10l-6.75 4.5m0 0l-2.25-1.5a2 2 0 00-2.22 0l-2.25 1.5" />
                            </svg>
                          </div>
                          
                          <div className="space-y-1">
                            <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400 block">Waiting for Verification</span>
                            <p className="text-xs text-neutral-600 font-light leading-relaxed">
                              Please check your inbox at <strong className="font-semibold text-neutral-900">{(user && user.email) || email}</strong> and click the verification link to proceed.
                            </p>
                          </div>
                        </div>

                        {/* Action buttons */}
                        <div className="flex flex-col space-y-2 pt-2">
                          <button
                            type="button"
                            onClick={handleVerifyEmailCheck}
                            className="w-full bg-[#2563EB] hover:bg-[#1D4ED8] text-white text-xs font-semibold py-3.5 rounded-full transition-all uppercase tracking-wider flex items-center justify-center space-x-2 cursor-pointer animate-pulse"
                          >
                            <span>I've Verified My Email</span>
                          </button>
                          
                          <button
                            type="button"
                            disabled={resendCooldown > 0}
                            onClick={handleResendVerification}
                            className="w-full border border-[#EAEAEA] hover:bg-[#FAFAFA] text-neutral-800 text-xs font-semibold py-3.5 rounded-full transition-all uppercase tracking-wider disabled:opacity-50 disabled:hover:bg-white flex items-center justify-center space-x-2 cursor-pointer"
                          >
                            <span>
                              {resendCooldown > 0 ? `Resend Verification (${resendCooldown}s)` : "Resend Verification Email"}
                            </span>
                          </button>
                          
                          <button
                            type="button"
                            onClick={handleBackToLogin}
                            className="w-full border border-dashed border-neutral-200 hover:border-neutral-400 text-neutral-500 hover:text-neutral-950 text-[10px] font-mono uppercase tracking-wider py-3.5 rounded-full transition-all text-center cursor-pointer"
                          >
                            Change Email / Back to Login
                          </button>
                        </div>
                      </div>
                    ) : (
                      <form
                        onSubmit={
                          authMode === 'login'
                            ? handleEmailLogin
                            : authMode === 'signup'
                            ? handleEmailRegister
                            : handlePasswordReset
                        }
                        className="space-y-4"
                      >
                        {authMode === 'signup' && (
                          <div className="space-y-1">
                            <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                              Full Name
                            </label>
                            <input
                              type="text"
                              required
                              value={displayName}
                              onChange={(e) => setDisplayName(e.target.value)}
                              placeholder="e.g. Olivia Vance"
                              className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-sm text-[#111111] focus:outline-hidden focus:border-[#2563EB] focus:bg-white transition-all font-sans"
                            />
                          </div>
                        )}

                        <div className="space-y-1">
                          <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                            Email Address
                          </label>
                          <input
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="e.g. patron@memorycraft.site"
                            className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-sm text-[#111111] focus:outline-hidden focus:border-[#2563EB] focus:bg-white transition-all font-sans"
                          />
                        </div>

                        {authMode !== 'forgot' && (
                          <div className="space-y-1">
                            <div className="flex justify-between items-center">
                              <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                                Password
                              </label>
                              {authMode === 'login' && (
                                <button
                                  type="button"
                                  onClick={() => {
                                    setAuthMode('forgot');
                                    setAuthError(null);
                                    setAuthSuccessMessage(null);
                                  }}
                                  className="text-[10px] font-mono text-neutral-500 hover:text-neutral-900 transition-colors uppercase tracking-wider"
                                >
                                  Forgot Password?
                                </button>
                              )}
                            </div>
                            <input
                              type="password"
                              required
                              value={password}
                              onChange={(e) => setPassword(e.target.value)}
                              placeholder="Min. 6 characters"
                              className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-sm text-[#111111] focus:outline-hidden focus:border-[#2563EB] focus:bg-white transition-all font-sans"
                            />
                          </div>
                        )}

                        <button
                          type="submit"
                          className="w-full bg-neutral-950 text-white text-xs font-semibold py-3.5 rounded-full hover:bg-neutral-800 transition-all uppercase tracking-wider mt-2 cursor-pointer"
                        >
                          {authMode === 'login' && 'Log In'}
                          {authMode === 'signup' && 'Create Account'}
                          {authMode === 'forgot' && 'Send Reset Link'}
                        </button>
                      </form>
                    )}

                    {/* Footer toggles */}
                    {authMode !== 'verify' && (
                      <div className="text-center pt-2">
                        {authMode === 'login' && (
                          <p className="text-xs text-neutral-500 font-sans">
                            Don't have an account?{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode('signup');
                                setAuthError(null);
                                setAuthSuccessMessage(null);
                              }}
                              className="font-semibold text-neutral-950 hover:underline"
                            >
                              Sign Up
                            </button>
                          </p>
                        )}
                        {authMode === 'signup' && (
                          <p className="text-xs text-neutral-500 font-sans">
                            Already have an account?{' '}
                            <button
                              type="button"
                              onClick={() => {
                                setAuthMode('login');
                                setAuthError(null);
                                setAuthSuccessMessage(null);
                              }}
                              className="font-semibold text-neutral-950 hover:underline"
                            >
                              Log In
                            </button>
                          </p>
                        )}
                        {authMode === 'forgot' && (
                          <button
                            type="button"
                            onClick={() => {
                              setAuthMode('login');
                              setAuthError(null);
                              setAuthSuccessMessage(null);
                            }}
                            className="text-xs font-semibold text-neutral-950 hover:underline block mx-auto"
                          >
                            Back to Log In
                          </button>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>



      {/* Custom Surprise Website Configurator Modal */}
      <AnimatePresence>
        {isBuilderOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
            <motion.div
              id="builder-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setBuilderOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              id="builder-modal-box"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white max-w-4xl w-full rounded-xl shadow-2xl border border-neutral-100 overflow-hidden relative z-10 flex flex-col md:flex-row h-[90vh] md:h-[650px]"
            >
              <button
                id="close-builder-btn"
                onClick={() => setBuilderOpen(false)}
                className="absolute top-4 right-4 p-1.5 text-neutral-500 hover:text-neutral-950 transition-colors z-20 bg-white/80 rounded-full border border-neutral-100"
              >
                <X className="w-4 h-4" />
              </button>

              {/* Sidebar Left: Form & Choices */}
              <div className="w-full md:w-1/2 p-8 overflow-y-auto flex flex-col justify-between border-b md:border-b-0 md:border-r border-neutral-100">
                <div className="space-y-6">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-widest text-accent font-semibold flex items-center space-x-1.5">
                      <Sparkles className="w-3.5 h-3.5" />
                      <span>Surprise Space Creator</span>
                    </span>
                    <h3 className="font-display font-medium text-xl tracking-tight text-neutral-950 mt-1">
                      Design Custom Surprise Website
                    </h3>
                    <p className="text-xs text-neutral-500 mt-1">
                      Construct a bespoke private digital space to surprise a loved one.
                    </p>
                  </div>

                  {/* Progress Indicators */}
                  <div className="flex items-center space-x-2">
                    {[1, 2, 3].map((step) => (
                      <div key={step} className="flex-1 flex items-center space-x-1">
                        <div
                          className={`h-1.5 rounded-full flex-1 transition-colors ${
                            step <= builderStep ? 'bg-accent' : 'bg-neutral-100'
                          }`}
                        />
                      </div>
                    ))}
                  </div>

                  {/* STEP 1: Basic Details */}
                  {builderStep === 1 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4 animate-fade-in"
                    >
                      <h4 className="font-sans font-semibold text-sm text-[#111111]">Step 1: Recipient & Event</h4>
                      
                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                          Recipient's First Name
                        </label>
                        <input
                          type="text"
                          required
                          value={recipientName}
                          onChange={(e) => {
                            setRecipientName(e.target.value);
                            if (e.target.value.trim()) setRecipientWarning(false);
                          }}
                          placeholder="e.g. Olivia"
                          className="w-full px-4 py-2.5 bg-[#FAFAFA] border border-[#EAEAEA] rounded-full text-sm text-[#111111] focus:outline-hidden focus:border-[#2563EB] focus:bg-white transition-all font-sans"
                        />
                        {recipientWarning && (
                          <motion.p
                            initial={{ opacity: 0, y: -2 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="text-[10px] text-red-500 font-sans font-medium mt-1 pl-1"
                          >
                            ⚠️ Please enter a recipient's name to proceed.
                          </motion.p>
                        )}
                      </div>

                      <div className="space-y-1">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                          The Celebratory Occasion
                        </label>
                        <div className="grid grid-cols-2 gap-2">
                          {CATEGORIES.map((cat) => (
                            <button
                              key={cat.id}
                              type="button"
                              onClick={() => setSelectedOccasion(cat.id)}
                              className={`px-3 py-2 rounded text-left border text-xs font-sans transition-all flex items-center space-x-2 ${
                                selectedOccasion === cat.id
                                  ? 'border-accent bg-blue-50/20 text-neutral-950 font-medium'
                                  : 'border-neutral-200 bg-white text-neutral-600 hover:bg-neutral-50'
                              }`}
                            >
                              <div className={`w-2 h-2 rounded-full ${selectedOccasion === cat.id ? 'bg-accent' : 'bg-neutral-300'}`} />
                              <span>{cat.name}</span>
                            </button>
                          ))}
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 2: Aesthetic Design */}
                  {builderStep === 2 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h4 className="font-display font-medium text-sm text-neutral-950">Step 2: Aesthetic & Fonts</h4>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                          Design Atmosphere
                        </label>
                        
                        <div className="space-y-2">
                          <button
                            type="button"
                            onClick={() => setSelectedAesthetic('serif')}
                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                              selectedAesthetic === 'serif'
                                ? 'border-accent bg-blue-50/20'
                                : 'border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            <span className="block text-xs font-display font-semibold text-neutral-900">Modern Editorial (Serif)</span>
                            <span className="block text-[11px] text-neutral-500 font-serif mt-0.5">Elegant Playfair Display paired with wide luxury track margins.</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedAesthetic('sans')}
                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                              selectedAesthetic === 'sans'
                                ? 'border-accent bg-blue-50/20'
                                : 'border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            <span className="block text-xs font-display font-semibold text-neutral-900">Minimal Swiss (Sans-Serif)</span>
                            <span className="block text-[11px] text-neutral-500 font-sans mt-0.5">Understated Inter font, ample white space, razor-sharp outlines.</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => setSelectedAesthetic('mono')}
                            className={`w-full p-3 rounded-lg border text-left transition-all ${
                              selectedAesthetic === 'mono'
                                ? 'border-accent bg-blue-50/20'
                                : 'border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            <span className="block text-xs font-display font-semibold text-neutral-900">Tech Brutalist (Mono)</span>
                            <span className="block text-[11px] text-neutral-500 font-mono mt-0.5">Chic JetBrains Mono, structural lines, perfect for coordinates & logs.</span>
                          </button>
                        </div>
                      </div>
                    </motion.div>
                  )}

                  {/* STEP 3: Widget Integration */}
                  {builderStep === 3 && (
                    <motion.div
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0 }}
                      className="space-y-4"
                    >
                      <h4 className="font-display font-medium text-sm text-neutral-950">Step 3: Interactive Features</h4>
                      
                      <div className="space-y-2">
                        <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                          Select Interactive Components
                        </label>

                        <div className="space-y-2">
                          <div
                            onClick={() => toggleFeature('timeline')}
                            className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                              selectedFeatures.includes('timeline') ? 'border-accent bg-blue-50/20' : 'border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <Calendar className="w-4 h-4 text-neutral-900" />
                              <div>
                                <span className="block text-xs font-medium text-neutral-950">Memory Timeline</span>
                                <span className="block text-[10px] text-neutral-500">Milestone log with date, custom text, & photos.</span>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedFeatures.includes('timeline') ? 'border-accent bg-accent text-white' : 'border-neutral-300'}`}>
                              {selectedFeatures.includes('timeline') && <Check className="w-2.5 h-2.5" />}
                            </div>
                          </div>

                          <div
                            onClick={() => toggleFeature('letter')}
                            className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                              selectedFeatures.includes('letter') ? 'border-accent bg-blue-50/20' : 'border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <Gift className="w-4 h-4 text-neutral-900" />
                              <div>
                                <span className="block text-xs font-medium text-neutral-950">Nostalgia Message Portal</span>
                                <span className="block text-[10px] text-neutral-500">Sleek flip-cards or sealed virtual letters.</span>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedFeatures.includes('letter') ? 'border-accent bg-accent text-white' : 'border-neutral-300'}`}>
                              {selectedFeatures.includes('letter') && <Check className="w-2.5 h-2.5" />}
                            </div>
                          </div>

                          <div
                            onClick={() => toggleFeature('music')}
                            className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                              selectedFeatures.includes('music') ? 'border-accent bg-blue-50/20' : 'border-neutral-200 hover:bg-neutral-50'
                            }`}
                          >
                            <div className="flex items-center space-x-2.5">
                              <Music className="w-4 h-4 text-neutral-900" />
                              <div>
                                <span className="block text-xs font-medium text-neutral-950">Custom Sound Track</span>
                                <span className="block text-[10px] text-neutral-500">Embedded premium soundtrack with beautiful vinyl disk.</span>
                              </div>
                            </div>
                            <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${selectedFeatures.includes('music') ? 'border-accent bg-accent text-white' : 'border-neutral-300'}`}>
                              {selectedFeatures.includes('music') && <Check className="w-2.5 h-2.5" />}
                            </div>
                          </div>
                        </div>
                      </div>
                    </motion.div>
                  )}
                </div>

                {/* Footer Controls */}
                <div className="flex items-center justify-between pt-6 border-t border-neutral-100 mt-6 bg-white z-10">
                  {builderStep > 1 ? (
                    <button
                      type="button"
                      onClick={() => setBuilderStep(builderStep - 1)}
                      className="text-xs font-mono uppercase text-neutral-500 hover:text-neutral-950 transition-colors"
                    >
                      Back
                    </button>
                  ) : (
                    <div />
                  )}

                  {builderStep < 3 ? (
                    <button
                      type="button"
                      onClick={() => {
                        if (builderStep === 1 && !recipientName.trim()) {
                          setRecipientWarning(true);
                          return;
                        }
                        setRecipientWarning(false);
                        setBuilderStep(builderStep + 1);
                      }}
                      className="bg-[#2563EB] text-white text-xs font-semibold py-2.5 px-6 rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-2 uppercase tracking-wider"
                    >
                      <span>Continue</span>
                      <ArrowRight className="w-3.5 h-3.5" />
                    </button>
                  ) : (
                    <button
                      type="button"
                      onClick={handleAddCustomSiteToCart}
                      disabled={websiteConfigured}
                      className="bg-[#2563EB] text-white text-xs font-semibold py-2.5 px-6 rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-2 uppercase tracking-wider"
                    >
                      {websiteConfigured ? (
                        <>
                          <Check className="w-3.5 h-3.5" />
                          <span>Added to Bag</span>
                        </>
                      ) : (
                        <>
                          <span>Add Bespoke Space</span>
                          <ArrowRight className="w-3.5 h-3.5" />
                        </>
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Sidebar Right: Live Web Mockup Preview */}
              <div className="hidden md:flex w-1/2 bg-neutral-50 p-8 flex-col justify-between relative overflow-hidden">
                {/* Visual grid background */}
                <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-60" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-wider text-neutral-400">Live Mockup Preview</span>
                  <div className="flex space-x-1">
                    <span className="w-2 h-2 rounded-full bg-red-400" />
                    <span className="w-2 h-2 rounded-full bg-yellow-400" />
                    <span className="w-2 h-2 rounded-full bg-green-400" />
                  </div>
                </div>

                {/* Inner Browser Container */}
                <div className="relative z-10 flex-1 my-6 bg-white rounded-lg border border-neutral-200/60 shadow-lg flex flex-col overflow-hidden">
                  <div className="bg-neutral-50 px-4 py-2 border-b border-neutral-100 flex items-center space-x-2">
                    <div className="w-2/3 h-3.5 bg-neutral-200/60 rounded text-[9px] font-mono text-neutral-400 px-2 flex items-center overflow-hidden">
                      memorycraft.site/{recipientName.toLowerCase() || 'olivia'}
                    </div>
                  </div>

                  {/* Browser content */}
                  <div className="p-6 flex-1 flex flex-col justify-center text-center space-y-4">
                    <div
                      className={`transition-all duration-300 ${
                        selectedAesthetic === 'serif'
                          ? 'font-serif text-neutral-950'
                          : selectedAesthetic === 'mono'
                          ? 'font-mono text-neutral-900'
                          : 'font-sans text-neutral-950'
                      }`}
                    >
                      <span className="text-[10px] uppercase tracking-widest text-accent font-semibold block">
                        {selectedOccasion.toUpperCase()}
                      </span>
                      <h5 className="text-xl font-medium tracking-tight mt-1">
                        For My {recipientName || 'Olivia'}
                      </h5>
                      <p className="text-[10px] text-neutral-400 max-w-xs mx-auto mt-1.5">
                        {selectedAesthetic === 'serif' && '“A collection of sacred records preserved in time.”'}
                        {selectedAesthetic === 'sans' && 'A curated timeline representing our shared pathways.'}
                        {selectedAesthetic === 'mono' && 'LOG_ID_0918 // AD_INIT_09822'}
                      </p>
                    </div>

                    {/* Integrated Widgets Preview */}
                    <div className="grid grid-cols-3 gap-2 pt-2">
                      {selectedFeatures.includes('timeline') && (
                        <div className="p-1.5 bg-neutral-50 rounded border border-neutral-100 flex flex-col items-center justify-center space-y-1">
                          <Calendar className="w-4 h-4 text-accent" />
                          <span className="text-[8px] font-mono text-neutral-500 leading-none">Timeline</span>
                        </div>
                      )}
                      {selectedFeatures.includes('letter') && (
                        <div className="p-1.5 bg-neutral-50 rounded border border-neutral-100 flex flex-col items-center justify-center space-y-1">
                          <Gift className="w-4 h-4 text-accent" />
                          <span className="text-[8px] font-mono text-neutral-500 leading-none">Letter</span>
                        </div>
                      )}
                      {selectedFeatures.includes('music') && (
                        <div className="p-1.5 bg-neutral-50 rounded border border-neutral-100 flex flex-col items-center justify-center space-y-1 animate-spin [animation-duration:8s]">
                          <Music className="w-4 h-4 text-accent" />
                          <span className="text-[8px] font-mono text-neutral-500 leading-none">Soundtrack</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                <div className="relative z-10 text-[10px] text-neutral-400 font-mono text-center flex items-center justify-center space-x-1.5">
                  <span>Premium Surprise Pack</span>
                  <span>•</span>
                  <span>$149.00 USD</span>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
