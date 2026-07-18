import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { 
  ArrowLeft,
  Calendar, 
  ShoppingBag, 
  ShieldCheck, 
  ExternalLink, 
  CheckCircle2, 
  Clock, 
  Loader2, 
  MessageSquare,
  Compass,
  FileText,
  CreditCard,
  Download,
  Check,
  Sparkles,
  Link2,
  AlertCircle
} from 'lucide-react';
import { UserProfile } from '../types';
import { Order, getUserOrders } from '../lib/orders';

interface FutureDashboardViewProps {
  user: UserProfile;
  setActiveTab: (tab: string) => void;
  setBuilderOpen: (open: boolean) => void;
  showToast: (msg: string, type: 'success' | 'error' | 'info') => void;
}

export default function FutureDashboardView({ 
  user, 
  setActiveTab, 
  setBuilderOpen, 
  showToast 
}: FutureDashboardViewProps) {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedOrderId, setSelectedOrderId] = useState<string | null>(null);

  // Load user orders
  const loadOrders = async () => {
    try {
      setLoading(true);
      const fetched = await getUserOrders(user.uid);
      setOrders(fetched);
    } catch (err) {
      console.error('Failed to load orders:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadOrders();
  }, [user.uid]);

  const selectedOrder = orders.find(o => o.id === selectedOrderId);

  // Status mapping with color themes
  const statusConfig = {
    Pending: {
      label: 'Pending',
      bg: 'bg-stone-100 text-stone-700 border-stone-200',
      activeStep: 1,
      dotColor: 'bg-stone-400',
    },
    Confirmed: {
      label: 'Confirmed',
      bg: 'bg-blue-50 text-blue-700 border-blue-100',
      activeStep: 2,
      dotColor: 'bg-blue-500',
    },
    Processing: {
      label: 'Processing',
      bg: 'bg-amber-50 text-amber-700 border-amber-100',
      activeStep: 3,
      dotColor: 'bg-amber-500',
    },
    Ready: {
      label: 'Ready',
      bg: 'bg-indigo-50 text-indigo-700 border-indigo-100',
      activeStep: 4,
      dotColor: 'bg-indigo-500',
    },
    Delivered: {
      label: 'Delivered',
      bg: 'bg-green-50 text-green-700 border-green-100',
      activeStep: 5,
      dotColor: 'bg-green-500',
    },
  };

  const steps = [
    { id: 1, label: 'Order Placed', statusKey: 'Pending' },
    { id: 2, label: 'Confirmed', statusKey: 'Confirmed' },
    { id: 3, label: 'Processing', statusKey: 'Processing' },
    { id: 4, label: 'Ready for Delivery', statusKey: 'Ready' },
    { id: 5, label: 'Delivered', statusKey: 'Delivered' },
  ];

  // WhatsApp generator link
  const getWhatsAppLink = (orderId: string) => {
    const message = `Hi MemoryCraft, I want to discuss my order #${orderId}.`;
    return `https://wa.me/919999999999?text=${encodeURIComponent(message)}`;
  };

  // Simulation handler to allow users to interact and test UI
  const handleSimulateStatus = (status: 'Pending' | 'Confirmed' | 'Processing' | 'Ready' | 'Delivered') => {
    if (!selectedOrderId) return;
    const updatedOrders = orders.map(o => {
      if (o.id === selectedOrderId) {
        // Prepare mock links if transitioning to 'Ready' or 'Delivered'
        const canvaLink = status === 'Ready' || status === 'Delivered' 
          ? 'https://www.canva.com/design/play-template-demo' 
          : undefined;
        const siteUrl = status === 'Ready' || status === 'Delivered' 
          ? 'https://memorycraft.site/demo-surprise-keepsake' 
          : undefined;
        const downloadLink = status === 'Ready' || status === 'Delivered' 
          ? 'https://memorycraft.site/downloads/demo-asset-pack.zip' 
          : undefined;

        return { 
          ...o, 
          status,
          canvaLink: o.type === 'canva_template' ? (canvaLink || o.canvaLink) : undefined,
          siteUrl: o.type === 'custom_website' ? (siteUrl || o.siteUrl) : undefined,
          downloadLink: downloadLink || o.downloadLink
        };
      }
      return o;
    });
    setOrders(updatedOrders);
    
    // Save to local storage to persist the sandbox state
    localStorage.setItem(`memorycraft_orders_v1_${user.uid}`, JSON.stringify(updatedOrders));
    showToast(`Order status updated to "${status}" (Simulated)`, 'info');
  };

  const handleSimulateLinksToggle = (type: 'canva' | 'site' | 'download', hasLink: boolean) => {
    if (!selectedOrderId) return;
    const updatedOrders = orders.map(o => {
      if (o.id === selectedOrderId) {
        return {
          ...o,
          canvaLink: type === 'canva' 
            ? (hasLink ? 'https://www.canva.com/design/play-template-demo' : undefined) 
            : o.canvaLink,
          siteUrl: type === 'site' 
            ? (hasLink ? 'https://memorycraft.site/demo-surprise-keepsake' : undefined) 
            : o.siteUrl,
          downloadLink: type === 'download' 
            ? (hasLink ? 'https://memorycraft.site/downloads/demo-asset-pack.zip' : undefined) 
            : o.downloadLink,
        };
      }
      return o;
    });
    setOrders(updatedOrders);
    localStorage.setItem(`memorycraft_orders_v1_${user.uid}`, JSON.stringify(updatedOrders));
    showToast(`Keepsake deliverables updated (Simulated)`, 'info');
  };

  return (
    <div className="bg-white min-h-screen text-left font-sans selection:bg-neutral-100">
      
      {/* Visual Header */}
      <section className="py-12 md:py-16 border-b border-[#EAEAEA] bg-[#FAFAFA] relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-12 left-12 w-64 h-64 rounded-full border border-[#EAEAEA]" />
          <div className="absolute bottom-[-50px] right-24 w-96 h-96 rounded-full border border-[#EAEAEA]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-3">
          <div className="flex items-center space-x-2">
            <span className="text-[10px] font-mono bg-neutral-100 text-neutral-800 px-2.5 py-1 rounded-full border border-neutral-200 uppercase tracking-wider font-semibold">
              Patron Workspace
            </span>
          </div>
          <h1 className="font-sans text-3xl md:text-4xl tracking-tight text-[#111111] font-semibold">
            My Orders
          </h1>
          <p className="text-sm text-[#666666] max-w-xl leading-relaxed font-light">
            Review purchased design templates, monitor live surprise websites, and download premium assets securely.
          </p>
        </div>
      </section>

      {/* Main content stage */}
      <section className="py-12 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {loading ? (
          <div className="py-24 text-center space-y-4">
            <Loader2 className="w-8 h-8 text-neutral-900 animate-spin mx-auto" />
            <p className="text-xs text-neutral-400 font-mono uppercase tracking-widest">Verifying Identity Ledger...</p>
          </div>
        ) : orders.length === 0 ? (
          /* Beautiful Minimalist Empty State */
          <motion.div 
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            className="py-16 border border-[#EAEAEA] rounded-3xl text-center space-y-6 bg-[#FAFAFA] max-w-md mx-auto p-8 shadow-xs"
          >
            <div className="w-16 h-16 bg-white border border-[#EAEAEA] rounded-2xl flex items-center justify-center mx-auto shadow-xs">
              <ShoppingBag className="w-6 h-6 text-neutral-400" strokeWidth={1.5} />
            </div>
            <div className="space-y-2">
              <h3 className="text-lg font-medium text-[#111111]">You haven't placed any orders yet.</h3>
              <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed font-light">
                Explore our catalog of premium Canva layout packs and responsive surprise websites tailored to celebrate memory landmarks.
              </p>
            </div>
            <button
              id="browse-templates-empty-btn"
              onClick={() => {
                setActiveTab('templates');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              className="inline-flex items-center space-x-2 px-6 py-2.5 bg-neutral-900 text-white hover:bg-neutral-800 text-xs font-semibold rounded-full uppercase tracking-widest transition-all cursor-pointer"
            >
              <span>Browse Templates</span>
            </button>
          </motion.div>
        ) : (
          /* Active orders view */
          <div>
            <AnimatePresence mode="wait">
              {!selectedOrderId ? (
                /* 1. MY ORDERS PAGE LIST */
                <motion.div
                  key="list"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-6"
                >
                  <div className="flex justify-between items-center border-b border-[#EAEAEA] pb-4">
                    <h2 className="font-sans font-medium text-sm uppercase tracking-wider text-[#111111]">
                      Your Keepsakes ({orders.length})
                    </h2>
                    <span className="text-[10px] font-mono text-emerald-600 font-semibold bg-emerald-50 px-2.5 py-1 rounded-full border border-emerald-100">
                      Real-time Sync
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {orders.map((order) => {
                      const currentStatus = order.status || 'Pending';
                      const config = statusConfig[currentStatus] || statusConfig.Pending;
                      
                      return (
                        <motion.div
                          key={order.id}
                          id={`order-card-${order.id}`}
                          whileHover={{ y: -3, transition: { duration: 0.2 } }}
                          className="border border-[#EAEAEA] rounded-2xl bg-white overflow-hidden flex flex-col justify-between transition-shadow hover:shadow-md text-left cursor-pointer"
                          onClick={() => setSelectedOrderId(order.id)}
                        >
                          <div className="p-5 flex gap-4">
                            {/* Thumbnail */}
                            <div className="w-20 h-20 rounded-xl bg-neutral-100 overflow-hidden flex-shrink-0 border border-[#EAEAEA]">
                              <img 
                                src={order.imageUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=200'} 
                                alt={order.title} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover transition-transform duration-500 hover:scale-105"
                              />
                            </div>

                            {/* Details */}
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between gap-2">
                                <span className="text-[10px] font-mono text-[#666666] font-semibold bg-neutral-100 px-2 py-0.5 rounded">
                                  #{order.id}
                                </span>
                                <span className={`text-[9px] font-mono px-2.5 py-0.5 rounded-full border ${config.bg}`}>
                                  {config.label}
                                </span>
                              </div>

                              <h3 className="text-sm font-semibold text-[#111111] truncate">
                                {order.title}
                              </h3>

                              <p className="text-[11px] text-neutral-500 font-light truncate">
                                Plan: {order.purchasedPlan || (order.type === 'custom_website' ? 'Bespoke Surprise Site' : 'Premium Canva Template')}
                              </p>
                            </div>
                          </div>

                          {/* Footer Info */}
                          <div className="border-t border-[#EAEAEA] bg-[#FAFAFA] px-5 py-3 flex items-center justify-between text-xs text-[#666666]">
                            <div className="flex items-center space-x-1.5 font-light text-[11px]">
                              <Calendar className="w-3.5 h-3.5 text-neutral-400" />
                              <span>
                                {new Date(order.createdAt).toLocaleDateString(undefined, { 
                                  month: 'short', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>

                            <div className="flex items-center space-x-3">
                              <span className="text-[10px] font-mono uppercase font-semibold text-emerald-600 bg-emerald-50 border border-emerald-100 px-2 py-0.5 rounded">
                                {order.paymentStatus || 'Paid'}
                              </span>
                              <span className="font-mono font-bold text-neutral-900">
                                ${order.price.toFixed(2)}
                              </span>
                            </div>
                          </div>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              ) : (
                /* 2. ORDER DETAILS PAGE */
                <motion.div
                  key="details"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="space-y-8"
                >
                  {/* Back Navigation Bar */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 border-b border-[#EAEAEA] pb-4">
                    <button
                      id="back-to-orders-btn"
                      onClick={() => setSelectedOrderId(null)}
                      className="inline-flex items-center space-x-2 text-xs font-semibold text-neutral-600 hover:text-neutral-900 transition-colors uppercase tracking-wider cursor-pointer py-1"
                    >
                      <ArrowLeft className="w-4 h-4" />
                      <span>Back to My Orders</span>
                    </button>

                    <div className="flex items-center space-x-2 text-xs font-mono">
                      <span className="text-neutral-400">Viewing Order ID:</span>
                      <span className="font-semibold text-neutral-900 bg-neutral-100 px-2.5 py-1 rounded border border-neutral-200">
                        #{selectedOrder?.id}
                      </span>
                    </div>
                  </div>

                  {selectedOrder && (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                      
                      {/* LEFT COLUMN: Stepper Progress & WhatsApp (7 cols) */}
                      <div className="lg:col-span-7 space-y-6">
                        
                        {/* 2.1 VISUAL PROGRESS TRACKER */}
                        <div className="border border-[#EAEAEA] rounded-3xl bg-white p-6 md:p-8 space-y-6 shadow-xs text-left">
                          <div>
                            <h3 className="text-sm font-semibold text-[#111111] uppercase tracking-wider">
                              Order Status Timeline
                            </h3>
                            <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                              Real-time tracking of your keepsake design phases.
                            </p>
                          </div>

                          {/* Desktop Stepper */}
                          <div className="hidden sm:flex items-center justify-between relative pt-4 pb-2">
                            {/* Connector Line behind */}
                            <div className="absolute left-[30px] right-[30px] top-[40px] h-[2px] bg-neutral-100 -z-0" />
                            {/* Colored Active Progress Line */}
                            <div 
                              className="absolute left-[30px] top-[40px] h-[2px] bg-neutral-900 transition-all duration-500 -z-0"
                              style={{ 
                                width: `${((statusConfig[selectedOrder.status]?.activeStep - 1) / (steps.length - 1)) * 100}%` 
                              }}
                            />

                            {steps.map((step) => {
                              const activeStep = statusConfig[selectedOrder.status]?.activeStep || 1;
                              const isCompleted = activeStep >= step.id;
                              const isCurrent = activeStep === step.id;

                              return (
                                <div key={step.id} className="flex flex-col items-center relative z-10 w-16">
                                  <div className={`w-8 h-8 rounded-full border flex items-center justify-center transition-all ${
                                    isCompleted 
                                      ? 'bg-neutral-950 border-neutral-950 text-white' 
                                      : 'bg-white border-neutral-200 text-neutral-400'
                                  } ${isCurrent ? 'ring-4 ring-neutral-100 scale-110' : ''}`}>
                                    {isCompleted && activeStep > step.id ? (
                                      <Check className="w-4 h-4" />
                                    ) : (
                                      <span className="text-[10px] font-mono font-bold">{step.id}</span>
                                    )}
                                  </div>
                                  <span className={`text-[10px] text-center mt-3 font-medium leading-tight ${
                                    isCurrent ? 'text-neutral-950 font-semibold' : isCompleted ? 'text-neutral-700' : 'text-neutral-400 font-light'
                                  }`}>
                                    {step.label}
                                  </span>
                                </div>
                              );
                            })}
                          </div>

                          {/* Mobile Stepper (Vertical) */}
                          <div className="sm:hidden flex flex-col space-y-6 relative pl-4 text-left">
                            {/* Vertical Line */}
                            <div className="absolute left-[24px] top-4 bottom-4 w-[2px] bg-neutral-100" />
                            <div 
                              className="absolute left-[24px] top-4 w-[2px] bg-neutral-900 transition-all duration-500"
                              style={{ 
                                height: `${((statusConfig[selectedOrder.status]?.activeStep - 1) / (steps.length - 1)) * 100}%` 
                              }}
                            />

                            {steps.map((step) => {
                              const activeStep = statusConfig[selectedOrder.status]?.activeStep || 1;
                              const isCompleted = activeStep >= step.id;
                              const isCurrent = activeStep === step.id;

                              return (
                                <div key={step.id} className="flex items-center space-x-4 relative z-10">
                                  <div className={`w-7 h-7 rounded-full border flex items-center justify-center transition-all flex-shrink-0 ${
                                    isCompleted 
                                      ? 'bg-neutral-950 border-neutral-950 text-white' 
                                      : 'bg-white border-neutral-200 text-neutral-400'
                                  } ${isCurrent ? 'ring-4 ring-neutral-100 scale-105' : ''}`}>
                                    {isCompleted && activeStep > step.id ? (
                                      <Check className="w-3.5 h-3.5" />
                                    ) : (
                                      <span className="text-[9px] font-mono font-bold">{step.id}</span>
                                    )}
                                  </div>
                                  <div>
                                    <span className={`text-xs block font-semibold ${
                                      isCurrent ? 'text-neutral-950' : isCompleted ? 'text-neutral-700' : 'text-neutral-400 font-light'
                                    }`}>
                                      {step.label}
                                    </span>
                                  </div>
                                </div>
                              );
                            })}
                          </div>
                        </div>

                        {/* 3. WHATSAPP SUPPORT SECTION */}
                        <div className="border border-[#EAEAEA] rounded-3xl bg-neutral-50/50 p-6 md:p-8 space-y-5 shadow-xs text-left">
                          <div className="flex items-start gap-4">
                            <div className="w-10 h-10 bg-emerald-50 rounded-2xl border border-emerald-100 flex items-center justify-center flex-shrink-0">
                              <MessageSquare className="w-5 h-5 text-emerald-600" />
                            </div>
                            <div className="space-y-1">
                              <h3 className="text-sm font-semibold text-[#111111] uppercase tracking-wider">
                                Need custom modifications?
                              </h3>
                              <p className="text-xs text-[#666666] leading-relaxed font-light">
                                Share design preferences, request color adjustments, or provide custom soundtrack links directly with our artisan crew on WhatsApp.
                              </p>
                            </div>
                          </div>

                          <a
                            href={getWhatsAppLink(selectedOrder.id)}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-semibold rounded-full uppercase tracking-widest flex items-center justify-center space-x-2 transition-all cursor-pointer shadow-xs"
                          >
                            <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                              <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946C.06 5.348 5.397.01 12.008.01c3.202.001 6.212 1.246 8.477 3.514 2.266 2.268 3.507 5.28 3.505 8.484-.004 6.657-5.34 11.997-11.953 11.997-2.005-.001-3.973-.502-5.717-1.454L0 24zm6.59-4.846c1.6.95 3.197 1.451 4.869 1.452 5.534 0 10.036-4.502 10.04-10.04.002-2.683-1.04-5.203-2.935-7.1-1.894-1.895-4.414-2.937-7.097-2.938-5.538 0-10.04 4.502-10.044 10.041-.001 1.743.454 3.443 1.32 4.965l-.995 3.63 3.735-.98zM15.868 13.04c-.328-.164-1.94-.957-2.24-1.066-.3-.11-.518-.164-.737.164-.219.328-.847 1.066-1.039 1.284-.192.218-.384.246-.712.081-.328-.164-1.386-.51-2.64-1.627-.975-.87-1.633-1.946-1.825-2.274-.192-.329-.02-.507.143-.671.147-.146.328-.382.493-.574.164-.192.219-.328.328-.547.11-.219.055-.41-.027-.574-.082-.164-.737-1.777-1.01-2.433-.267-.641-.561-.555-.737-.564-.19-.01-.41-.012-.629-.012-.219 0-.575.082-.876.41-.301.328-1.15 1.12-1.15 2.73 0 1.61 1.177 3.167 1.341 3.385.164.219 2.314 3.535 5.607 4.953.783.337 1.396.539 1.874.69.787.25 1.503.215 2.069.13.63-.095 1.94-.793 2.213-1.558.272-.765.272-1.422.191-1.558-.081-.137-.299-.219-.627-.382z"/>
                            </svg>
                            <span>Chat with us on WhatsApp</span>
                          </a>
                        </div>

                      </div>

                      {/* RIGHT COLUMN: Summary Details & Delivery Section (5 cols) */}
                      <div className="lg:col-span-5 space-y-6">
                        
                        {/* 2.2 ORDER DETAILS CARD */}
                        <div className="border border-[#EAEAEA] rounded-3xl bg-white p-6 md:p-8 space-y-5 shadow-xs text-left">
                          <div>
                            <h3 className="text-sm font-semibold text-[#111111] uppercase tracking-wider">
                              Order Summary
                            </h3>
                          </div>

                          <div className="flex gap-4 border-b border-[#EAEAEA] pb-5">
                            <div className="w-16 h-16 rounded-xl bg-neutral-100 overflow-hidden border border-[#EAEAEA] flex-shrink-0">
                              <img 
                                src={selectedOrder.imageUrl || 'https://images.unsplash.com/photo-1518199266791-5375a83190b7?auto=format&fit=crop&q=80&w=200'} 
                                alt={selectedOrder.title} 
                                referrerPolicy="no-referrer"
                                className="w-full h-full object-cover"
                              />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-neutral-900 leading-snug line-clamp-2">
                                {selectedOrder.title}
                              </h4>
                              <p className="text-[10px] font-mono text-neutral-400 capitalize mt-1">
                                Category: {selectedOrder.category}
                              </p>
                            </div>
                          </div>

                          <div className="space-y-3.5 text-xs">
                            <div className="flex justify-between">
                              <span className="text-neutral-400 font-light">Purchased Plan</span>
                              <span className="font-medium text-neutral-800">{selectedOrder.purchasedPlan || 'Standard Package'}</span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-neutral-400 font-light">Order Date</span>
                              <span className="font-medium text-neutral-800">
                                {new Date(selectedOrder.createdAt).toLocaleDateString(undefined, { 
                                  month: 'long', 
                                  day: 'numeric', 
                                  year: 'numeric' 
                                })}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-neutral-400 font-light">Payment Status</span>
                              <span className="font-mono font-semibold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-100 text-[10px]">
                                {selectedOrder.paymentStatus || 'Paid'}
                              </span>
                            </div>

                            <div className="flex justify-between">
                              <span className="text-neutral-400 font-light">Order Status</span>
                              <span className={`font-mono px-2 py-0.5 rounded text-[10px] border ${statusConfig[selectedOrder.status]?.bg}`}>
                                {selectedOrder.status}
                              </span>
                            </div>

                            <div className="flex justify-between border-t border-[#EAEAEA] pt-4 text-sm font-semibold">
                              <span className="text-neutral-900">Total Paid</span>
                              <span className="font-mono text-[#111111]">${selectedOrder.price.toFixed(2)}</span>
                            </div>
                          </div>
                        </div>

                        {/* 4. DELIVERY SECTION */}
                        <div className="border border-[#EAEAEA] rounded-3xl bg-white p-6 md:p-8 space-y-5 shadow-xs text-left">
                          <div>
                            <h3 className="text-sm font-semibold text-[#111111] uppercase tracking-wider">
                              Keepsake Deliverables
                            </h3>
                            <p className="text-[11px] text-neutral-500 font-light mt-0.5">
                              Access assets once completed and released by the artisan.
                            </p>
                          </div>

                          {/* Determine if any link is ready */}
                          {selectedOrder.canvaLink || selectedOrder.siteUrl || selectedOrder.downloadLink ? (
                            <div className="space-y-3 pt-1">
                              
                              {/* Canva Template Link */}
                              {selectedOrder.type === 'canva_template' && selectedOrder.canvaLink && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Editable Canva Access</span>
                                  <a
                                    href={selectedOrder.canvaLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-between w-full p-3 border border-[#EAEAEA] rounded-xl hover:border-neutral-900 transition-colors text-xs font-semibold text-neutral-800 bg-[#FAFAFA]"
                                  >
                                    <span className="flex items-center space-x-2">
                                      <Link2 className="w-4 h-4 text-purple-500" />
                                      <span>Launch Canva Template</span>
                                    </span>
                                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                                  </a>
                                </div>
                              )}

                              {/* Website Surprise Link */}
                              {selectedOrder.type === 'custom_website' && selectedOrder.siteUrl && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Live Keepsake Portal</span>
                                  <a
                                    href={selectedOrder.siteUrl}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-between w-full p-3 border border-[#EAEAEA] rounded-xl hover:border-neutral-900 transition-colors text-xs font-semibold text-neutral-800 bg-[#FAFAFA]"
                                  >
                                    <span className="flex items-center space-x-2">
                                      <Compass className="w-4 h-4 text-blue-500" />
                                      <span>Visit Surprise Site</span>
                                    </span>
                                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                                  </a>
                                </div>
                              )}

                              {/* Download Link */}
                              {selectedOrder.downloadLink && (
                                <div className="space-y-1.5">
                                  <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider block">Download Assets Package</span>
                                  <a
                                    href={selectedOrder.downloadLink}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex items-center justify-between w-full p-3 border border-[#EAEAEA] rounded-xl hover:border-neutral-900 transition-colors text-xs font-semibold text-neutral-800 bg-[#FAFAFA]"
                                  >
                                    <span className="flex items-center space-x-2">
                                      <Download className="w-4 h-4 text-emerald-500" />
                                      <span>Download Keepsake ZIP</span>
                                    </span>
                                    <ExternalLink className="w-3.5 h-3.5 text-neutral-400" />
                                  </a>
                                </div>
                              )}

                            </div>
                          ) : (
                            /* Unreleased/Preparing links message */
                            <div className="border border-[#EAEAEA] bg-amber-50/20 rounded-2xl p-4 flex gap-3 text-left">
                              <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                              <div className="space-y-1">
                                <span className="text-xs font-semibold text-amber-800 block">Preparation phase active</span>
                                <p className="text-[11px] text-[#666666] leading-relaxed font-light">
                                  Your order is being prepared. We'll notify you when it's ready.
                                </p>
                              </div>
                            </div>
                          )}
                        </div>

                        {/* PROTOTYPE TESTING & SANDBOX CONTROLS */}
                        <div className="border border-neutral-200 rounded-3xl bg-neutral-50 p-5 space-y-4 text-left">
                          <div className="flex items-center space-x-2">
                            <Sparkles className="w-4 h-4 text-neutral-600" />
                            <span className="text-[10px] font-mono uppercase tracking-widest font-bold text-neutral-700">
                              Artisan Sandbox Controls
                            </span>
                          </div>
                          <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                            Use this simulation console to inspect different order states and watch how the progress stepper and keepsake links react in the customer UI.
                          </p>

                          <div className="space-y-3 pt-1">
                            <div>
                              <span className="text-[9px] font-mono text-neutral-400 uppercase block mb-1.5">Set Status Level</span>
                              <div className="flex flex-wrap gap-1.5">
                                {Object.keys(statusConfig).map((st) => (
                                  <button
                                    key={st}
                                    onClick={() => handleSimulateStatus(st as any)}
                                    className={`px-3 py-1.5 text-[10px] font-mono font-medium rounded-md border transition-all cursor-pointer ${
                                      selectedOrder.status === st 
                                        ? 'bg-neutral-900 text-white border-neutral-900' 
                                        : 'bg-white border-neutral-200 text-neutral-600 hover:border-neutral-400'
                                    }`}
                                  >
                                    {st}
                                  </button>
                                ))}
                              </div>
                            </div>

                            <div className="border-t border-neutral-200/60 pt-3">
                              <span className="text-[9px] font-mono text-neutral-400 uppercase block mb-1.5">Release Deliverables</span>
                              <div className="flex flex-wrap gap-2">
                                {selectedOrder.type === 'canva_template' && (
                                  <button
                                    onClick={() => handleSimulateLinksToggle('canva', !selectedOrder.canvaLink)}
                                    className={`px-3 py-1.5 text-[10px] font-mono rounded-md border transition-all cursor-pointer ${
                                      selectedOrder.canvaLink 
                                        ? 'bg-purple-100 text-purple-700 border-purple-200' 
                                        : 'bg-white text-neutral-500 border-neutral-200'
                                    }`}
                                  >
                                    {selectedOrder.canvaLink ? 'Canva released ✓' : 'Release Canva link'}
                                  </button>
                                )}

                                {selectedOrder.type === 'custom_website' && (
                                  <button
                                    onClick={() => handleSimulateLinksToggle('site', !selectedOrder.siteUrl)}
                                    className={`px-3 py-1.5 text-[10px] font-mono rounded-md border transition-all cursor-pointer ${
                                      selectedOrder.siteUrl 
                                        ? 'bg-blue-100 text-blue-700 border-blue-200' 
                                        : 'bg-white text-neutral-500 border-neutral-200'
                                    }`}
                                  >
                                    {selectedOrder.siteUrl ? 'Website released ✓' : 'Release website link'}
                                  </button>
                                )}

                                <button
                                  onClick={() => handleSimulateLinksToggle('download', !selectedOrder.downloadLink)}
                                  className={`px-3 py-1.5 text-[10px] font-mono rounded-md border transition-all cursor-pointer ${
                                    selectedOrder.downloadLink 
                                      ? 'bg-emerald-100 text-emerald-700 border-emerald-200' 
                                      : 'bg-white text-neutral-500 border-neutral-200'
                                  }`}
                                >
                                  {selectedOrder.downloadLink ? 'ZIP released ✓' : 'Release ZIP pack'}
                                </button>
                              </div>
                            </div>
                          </div>
                        </div>

                      </div>

                    </div>
                  )}
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        )}
      </section>

    </div>
  );
}
