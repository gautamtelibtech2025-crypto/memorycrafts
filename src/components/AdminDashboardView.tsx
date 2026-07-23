import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  Users as UsersIcon,
  ShoppingBag,
  Plus,
  Search,
  SlidersHorizontal,
  Edit2,
  Trash2,
  Check,
  X,
  ExternalLink,
  RefreshCw,
  LogOut,
  ChevronRight,
  Menu,
  ShieldCheck,
  Sparkles,
  Cake,
  Heart,
  Flame,
  Smile,
  GraduationCap,
  Compass,
  AlertTriangle,
  Loader2,
  CheckCircle2,
  XCircle,
  Eye,
  ArrowUpRight,
  Bell,
  TrendingUp,
  BarChart3,
  PieChart,
  Settings as SettingsIcon,
  DollarSign,
  Calendar,
  ChevronDown,
  Layers,
  Store,
  Filter,
  UserCheck
} from 'lucide-react';
import { ApiCategory, ApiTemplate, AdminStats, UserProfile } from '../types';
import { apiGet, apiPost, apiPut, apiDelete } from '../lib/api';
import { getUserOrders, Order } from '../lib/orders';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cake,
  Heart,
  Sparkles,
  Flame,
  Smile,
  Users: UsersIcon,
  GraduationCap,
  Compass,
};

interface AdminDashboardViewProps {
  user: UserProfile | null;
  setActiveTab: (tab: string) => void;
  showToast: (message: string, type?: 'success' | 'error' | 'info') => void;
}

type AdminModule = 'dashboard' | 'templates' | 'categories' | 'customers' | 'orders' | 'analytics' | 'settings';

export default function AdminDashboardView({ user, setActiveTab, showToast }: AdminDashboardViewProps) {
  // Navigation State
  const [activeModule, setActiveModule] = useState<AdminModule>('dashboard');
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [timeRange, setTimeRange] = useState<'week' | 'month' | 'year'>('month');

  // Data States
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [categories, setCategories] = useState<ApiCategory[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  // Filters for Templates
  const [tmplSearch, setTmplSearch] = useState('');
  const [tmplCategory, setTmplCategory] = useState('all');
  const [tmplType, setTmplType] = useState('all');
  const [tmplStatus, setTmplStatus] = useState<'all' | 'active' | 'inactive'>('all');

  // Filters for Categories
  const [catSearch, setCatSearch] = useState('');

  // Modal States
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState<ApiTemplate | null>(null);
  const [deletingTemplate, setDeletingTemplate] = useState<ApiTemplate | null>(null);

  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [editingCategory, setEditingCategory] = useState<ApiCategory | null>(null);
  const [deletingCategory, setDeletingCategory] = useState<ApiCategory | null>(null);

  // Form States (Template)
  const [tmplForm, setTmplForm] = useState({
    title: '',
    slug: '',
    description: '',
    category: 0,
    price: '29.00',
    template_type: 'canva_template' as 'canva_template' | 'custom_website',
    thumbnail: '',
    preview_url: '',
    canva_url: '',
    ratio: 'A4 Layout • Canva Template',
    is_featured: false,
    is_active: true,
  });

  // Form States (Category)
  const [catForm, setCatForm] = useState({
    name: '',
    slug: '',
    description: '',
    image_color: 'bg-stone-50',
    icon: 'Sparkles',
    display_order: 1,
    is_active: true,
  });

  const [formSubmitting, setFormSubmitting] = useState(false);

  // Load Admin Data from Backend APIs
  const loadData = async (showRefreshToast = false) => {
    try {
      if (showRefreshToast) setRefreshing(true);
      else setLoading(true);

      // 1. Fetch Stats & Recent Data
      const statsData = await apiGet<AdminStats>('/api/admin/stats/');
      setStats(statsData);

      // 2. Fetch All Templates (including inactive)
      const allTemplates = await apiGet<ApiTemplate[]>('/api/templates/?admin=true');
      setTemplates(allTemplates || []);

      // 3. Fetch All Categories (including inactive)
      const allCategories = await apiGet<ApiCategory[]>('/api/categories/?admin=true');
      setCategories(allCategories || []);

      // 4. Fetch Real Orders from Firestore/Local storage if user available
      if (user?.uid) {
        const realOrders = await getUserOrders(user.uid);
        setOrders(realOrders || []);
      }

      if (showRefreshToast) {
        showToast('Admin dashboard refreshed with live data', 'success');
      }
    } catch (err: any) {
      console.error('[Admin] Error loading data:', err);
      showToast('Failed to load admin data: ' + (err.message || err), 'error');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    loadData();
  }, [user]);

  // Open Template Modal for Create or Edit
  const handleOpenTemplateModal = (tmpl?: ApiTemplate) => {
    if (tmpl) {
      setEditingTemplate(tmpl);
      setTmplForm({
        title: tmpl.title,
        slug: tmpl.slug,
        description: tmpl.description || '',
        category: tmpl.category,
        price: tmpl.price,
        template_type: tmpl.template_type,
        thumbnail: tmpl.thumbnail || '',
        preview_url: tmpl.preview_url || '',
        canva_url: tmpl.canva_url || '',
        ratio: tmpl.ratio || '',
        is_featured: tmpl.is_featured,
        is_active: tmpl.is_active !== false,
      });
    } else {
      setEditingTemplate(null);
      const defaultCategory = categories.length > 0 ? categories[0].id : 1;
      setTmplForm({
        title: '',
        slug: '',
        description: '',
        category: defaultCategory,
        price: '29.00',
        template_type: 'canva_template',
        thumbnail: '',
        preview_url: '',
        canva_url: '',
        ratio: 'A4 Layout • Canva Template',
        is_featured: false,
        is_active: true,
      });
    }
    setShowTemplateModal(true);
  };

  // Submit Template Form (Create or Edit)
  const handleSaveTemplate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!tmplForm.title || !tmplForm.category || !tmplForm.price) {
      showToast('Please fill in all required template fields', 'error');
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingTemplate) {
        await apiPut(`/api/templates/${editingTemplate.id}/`, tmplForm);
        showToast(`Template "${tmplForm.title}" updated successfully`, 'success');
      } else {
        await apiPost('/api/templates/', tmplForm);
        showToast(`Template "${tmplForm.title}" created successfully`, 'success');
      }
      setShowTemplateModal(false);
      loadData();
    } catch (err: any) {
      console.error('[Admin] Error saving template:', err);
      showToast('Failed to save template: ' + (err.message || err), 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm Delete Template
  const handleDeleteTemplate = async () => {
    if (!deletingTemplate) return;
    try {
      setFormSubmitting(true);
      await apiDelete(`/api/templates/${deletingTemplate.id}/`);
      showToast(`Template "${deletingTemplate.title}" deleted`, 'success');
      setDeletingTemplate(null);
      loadData();
    } catch (err: any) {
      console.error('[Admin] Error deleting template:', err);
      showToast('Failed to delete template: ' + (err.message || err), 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Open Category Modal for Create or Edit
  const handleOpenCategoryModal = (cat?: ApiCategory) => {
    if (cat) {
      setEditingCategory(cat);
      setCatForm({
        name: cat.name,
        slug: cat.slug,
        description: cat.description || '',
        image_color: cat.image_color || 'bg-stone-50',
        icon: cat.icon || 'Sparkles',
        display_order: cat.display_order || 1,
        is_active: cat.is_active !== false,
      });
    } else {
      setEditingCategory(null);
      setCatForm({
        name: '',
        slug: '',
        description: '',
        image_color: 'bg-stone-50',
        icon: 'Sparkles',
        display_order: categories.length + 1,
        is_active: true,
      });
    }
    setShowCategoryModal(true);
  };

  // Submit Category Form (Create or Edit)
  const handleSaveCategory = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catForm.name) {
      showToast('Category name is required', 'error');
      return;
    }

    try {
      setFormSubmitting(true);
      if (editingCategory) {
        await apiPut(`/api/categories/${editingCategory.id}/`, catForm);
        showToast(`Category "${catForm.name}" updated successfully`, 'success');
      } else {
        await apiPost('/api/categories/', catForm);
        showToast(`Category "${catForm.name}" created successfully`, 'success');
      }
      setShowCategoryModal(false);
      loadData();
    } catch (err: any) {
      console.error('[Admin] Error saving category:', err);
      showToast('Failed to save category: ' + (err.message || err), 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Confirm Delete Category
  const handleDeleteCategory = async () => {
    if (!deletingCategory) return;
    try {
      setFormSubmitting(true);
      await apiDelete(`/api/categories/${deletingCategory.id}/`);
      showToast(`Category "${deletingCategory.name}" deleted`, 'success');
      setDeletingCategory(null);
      loadData();
    } catch (err: any) {
      console.error('[Admin] Error deleting category:', err);
      showToast('Failed to delete category: ' + (err.message || err), 'error');
    } finally {
      setFormSubmitting(false);
    }
  };

  // Filtered Templates List
  const filteredTemplates = templates.filter((t) => {
    const matchesSearch =
      !tmplSearch ||
      t.title.toLowerCase().includes(tmplSearch.toLowerCase()) ||
      t.description.toLowerCase().includes(tmplSearch.toLowerCase());
    const matchesCategory = tmplCategory === 'all' || String(t.category) === tmplCategory || t.category_slug === tmplCategory;
    const matchesType = tmplType === 'all' || t.template_type === tmplType;
    const matchesStatus =
      tmplStatus === 'all' ||
      (tmplStatus === 'active' && t.is_active !== false) ||
      (tmplStatus === 'inactive' && t.is_active === false);

    return matchesSearch && matchesCategory && matchesType && matchesStatus;
  });

  // Filtered Categories List
  const filteredCategories = categories.filter((c) => {
    return (
      !catSearch ||
      c.name.toLowerCase().includes(catSearch.toLowerCase()) ||
      c.description.toLowerCase().includes(catSearch.toLowerCase())
    );
  });

  // Calculate Revenue from Real Orders
  const totalRevenue = orders.reduce((sum, ord) => sum + (ord.price || 0), 0);

  return (
    <div className="min-h-screen bg-[#F4F6F8] text-slate-800 font-sans flex antialiased selection:bg-blue-100">

      {/* COMPACT LEFT SIDEBAR / RAIL (SaaS Dashboard Aesthetic) */}
      <aside
        className={`fixed inset-y-0 left-0 z-40 bg-white border-r border-slate-200/80 w-64 md:w-20 lg:w-64 transform transition-all duration-200 ease-in-out md:translate-x-0 flex flex-col justify-between ${
          mobileMenuOpen ? 'translate-x-0 shadow-2xl' : '-translate-x-full md:translate-x-0'
        }`}
      >
        <div className="p-4 lg:p-6 space-y-6">
          {/* Logo Brand Header */}
          <div className="flex items-center space-x-3 text-left">
            <div className="w-10 h-10 rounded-xl bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md shadow-blue-500/20 flex-shrink-0">
              <Store className="w-5 h-5" />
            </div>
            <div className="hidden lg:block overflow-hidden">
              <h1 className="font-sans font-bold text-base text-slate-900 leading-tight truncate">MemoryCraft</h1>
              <span className="text-[10px] font-mono text-slate-400 block tracking-wider uppercase">Business Control</span>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-6 text-left">
            {/* OVERVIEW */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold px-3 hidden lg:block">
                Overview
              </span>
              <button
                onClick={() => { setActiveModule('dashboard'); setMobileMenuOpen(false); }}
                title="Dashboard"
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeModule === 'dashboard'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <LayoutDashboard className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Dashboard</span>
              </button>
            </div>

            {/* CATALOG */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold px-3 hidden lg:block">
                Catalog
              </span>
              <button
                onClick={() => { setActiveModule('templates'); setMobileMenuOpen(false); }}
                title="Templates"
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeModule === 'templates'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <Package className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline">Templates</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full hidden lg:inline-block ${
                  activeModule === 'templates' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {templates.length}
                </span>
              </button>

              <button
                onClick={() => { setActiveModule('categories'); setMobileMenuOpen(false); }}
                title="Categories"
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeModule === 'categories'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <FolderTree className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline">Categories</span>
                </div>
                <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full hidden lg:inline-block ${
                  activeModule === 'categories' ? 'bg-blue-700 text-white' : 'bg-slate-100 text-slate-600'
                }`}>
                  {categories.length}
                </span>
              </button>
            </div>

            {/* BUSINESS */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold px-3 hidden lg:block">
                Business
              </span>
              <button
                onClick={() => { setActiveModule('customers'); setMobileMenuOpen(false); }}
                title="Customers"
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeModule === 'customers'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <UsersIcon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Customers</span>
              </button>

              <button
                onClick={() => { setActiveModule('orders'); setMobileMenuOpen(false); }}
                title="Orders"
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeModule === 'orders'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <div className="flex items-center space-x-3">
                  <ShoppingBag className="w-4 h-4 flex-shrink-0" />
                  <span className="hidden lg:inline">Orders</span>
                </div>
                {orders.length > 0 && (
                  <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full hidden lg:inline-block ${
                    activeModule === 'orders' ? 'bg-blue-700 text-white' : 'bg-amber-100 text-amber-800'
                  }`}>
                    {orders.length}
                  </span>
                )}
              </button>
            </div>

            {/* MANAGEMENT */}
            <div className="space-y-1">
              <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-semibold px-3 hidden lg:block">
                Management
              </span>
              <button
                onClick={() => { setActiveModule('analytics'); setMobileMenuOpen(false); }}
                title="Analytics"
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeModule === 'analytics'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <BarChart3 className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Analytics</span>
              </button>

              <button
                onClick={() => { setActiveModule('settings'); setMobileMenuOpen(false); }}
                title="Settings"
                className={`w-full flex items-center space-x-3 px-3 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  activeModule === 'settings'
                    ? 'bg-blue-600 text-white shadow-md shadow-blue-500/20'
                    : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                }`}
              >
                <SettingsIcon className="w-4 h-4 flex-shrink-0" />
                <span className="hidden lg:inline">Settings</span>
              </button>
            </div>
          </nav>
        </div>

        {/* Sidebar Bottom Link */}
        <div className="p-4 border-t border-slate-200/80 space-y-2 text-left bg-slate-50/50">
          <button
            onClick={() => setActiveTab('home')}
            className="w-full flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-slate-600 hover:bg-white hover:text-slate-900 transition-all border border-transparent hover:border-slate-200"
          >
            <span className="flex items-center space-x-2">
              <ArrowUpRight className="w-3.5 h-3.5 text-blue-600" />
              <span className="hidden lg:inline">View Storefront</span>
            </span>
          </button>
        </div>
      </aside>

      {/* MAIN LAYOUT WRAPPER */}
      <div className="flex-1 min-w-0 flex flex-col min-h-screen pl-0 md:pl-20 lg:pl-64">

        {/* TOP HEADER (Matching Reference UI Header) */}
        <header className="bg-white border-b border-slate-200/80 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
          {/* Breadcrumb & Title */}
          <div className="flex items-center space-x-4 text-left">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 border border-slate-200"
            >
              <Menu className="w-5 h-5" />
            </button>
            <div>
              <div className="flex items-center space-x-2 text-[11px] font-mono text-slate-400">
                <span>MemoryCraft Admin</span>
                <ChevronRight className="w-3 h-3" />
                <span className="capitalize text-slate-700 font-semibold">{activeModule}</span>
              </div>
              <h2 className="text-xl font-bold font-sans text-slate-900 tracking-tight capitalize">
                {activeModule === 'dashboard' ? 'Business Overview' : `${activeModule}`}
              </h2>
            </div>
          </div>

          {/* Right Controls */}
          <div className="flex items-center space-x-3">
            {/* Time Filter Pill */}
            <div className="hidden sm:flex items-center space-x-1 bg-slate-100 p-1 rounded-xl text-xs font-medium border border-slate-200/60">
              <button
                onClick={() => setTimeRange('week')}
                className={`px-3 py-1 rounded-lg transition-all ${timeRange === 'week' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'}`}
              >
                This Week
              </button>
              <button
                onClick={() => setTimeRange('month')}
                className={`px-3 py-1 rounded-lg transition-all ${timeRange === 'month' ? 'bg-white text-slate-900 shadow-xs font-bold' : 'text-slate-500'}`}
              >
                This Month
              </button>
            </div>

            {/* Notification Bell */}
            <button className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200/80 relative transition-colors">
              <Bell className="w-4 h-4 text-slate-600" />
              <span className="w-2 h-2 rounded-full bg-blue-600 absolute top-2 right-2 border-2 border-white" />
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => loadData(true)}
              disabled={refreshing}
              className="p-2 rounded-xl text-slate-600 hover:bg-slate-100 border border-slate-200/80 transition-colors"
              title="Refresh Data"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            </button>

            {/* Admin Profile Dropdown Pill */}
            <div className="flex items-center space-x-3 border-l border-slate-200/80 pl-3">
              <div className="w-9 h-9 rounded-xl bg-slate-900 text-white flex items-center justify-center text-xs font-bold shadow-xs">
                {user?.displayName ? user.displayName.charAt(0) : 'A'}
              </div>
              <div className="text-left hidden lg:block">
                <span className="text-xs font-bold text-slate-900 block leading-tight">
                  {user?.displayName || 'Studio Admin'}
                </span>
                <span className="text-[10px] font-mono text-emerald-600 font-semibold block">
                  MemoryCraft Studio ▾
                </span>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN BODY CONTAINER */}
        <div className="p-6 space-y-8 flex-1">

          {/* ================= MODULE 1: DASHBOARD (REFERENCE DESIGN MATCH) ================= */}
          {activeModule === 'dashboard' && (
            <div className="space-y-6">

              {/* 1. TOP SUMMARY METRIC CARDS ROW (Exact match with reference cards) */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">
                
                {/* CARD 1: Revenue & Volume */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Total Sales</span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">This Month ▾</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold font-sans text-slate-900">
                        ${totalRevenue > 0 ? totalRevenue.toFixed(2) : '0.00'}
                      </span>
                      <span className="block text-[11px] font-mono text-slate-400 mt-0.5">Real order earnings</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        +15.80%
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-1">Volume: {orders.length}</span>
                    </div>
                  </div>
                </div>

                {/* CARD 2: Customers & Active */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">Customers</span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">This Month ▾</span>
                  </div>
                  <div className="flex items-baseline justify-between">
                    <div>
                      <span className="text-2xl font-bold font-sans text-slate-900">
                        {user ? 1 : 0}
                      </span>
                      <span className="block text-[11px] font-mono text-slate-400 mt-0.5">Authenticated patrons</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                        Active: {user ? 1 : 0}
                      </span>
                      <span className="block text-[10px] font-mono text-slate-400 mt-1">Verified Users</span>
                    </div>
                  </div>
                </div>

                {/* CARD 3: All Orders & Status */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-400">All Orders</span>
                    <span className="text-xs font-mono text-slate-400 bg-slate-100 px-2 py-0.5 rounded-md">This Month ▾</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-2xl font-bold font-sans text-slate-900">{orders.length}</span>
                      <span className="block text-[11px] font-mono text-slate-400 mt-0.5">Total orders</span>
                    </div>
                    <div className="flex space-x-3 text-right">
                      <div>
                        <span className="text-xs font-mono font-bold text-amber-600 block">
                          {orders.filter(o => o.status === 'Pending').length}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Pending</span>
                      </div>
                      <div>
                        <span className="text-xs font-mono font-bold text-emerald-600 block">
                          {orders.filter(o => o.status !== 'Pending').length}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">Completed</span>
                      </div>
                    </div>
                  </div>
                </div>

              </div>

              {/* 2. MIDDLE DASHBOARD GRID (ANALYTICS BREAKDOWN & RECENT ORDERS PANEL) */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 text-left">

                {/* LEFT COL: MARKETING BREAKDOWN & PRODUCTS HIGHLIGHT (8 Cols) */}
                <div className="lg:col-span-7 space-y-6">

                  {/* Donut Chart / Category Distribution Panel */}
                  <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                      <div>
                        <h3 className="font-sans font-bold text-sm text-slate-900">Catalog Taxonomy</h3>
                        <p className="text-xs text-slate-500 font-sans">Template asset distribution across categories</p>
                      </div>
                      <span className="text-xs font-mono text-slate-400">Categories ({categories.length})</span>
                    </div>

                    {/* Category Badges Pills */}
                    <div className="flex flex-wrap gap-2 pt-2">
                      {categories.map((cat) => (
                        <div key={cat.id} className="flex items-center space-x-1.5 px-3 py-1.5 rounded-xl bg-slate-50 border border-slate-200/60 text-xs font-medium text-slate-700">
                          <span className="w-2 h-2 rounded-full bg-blue-600" />
                          <span>{cat.name}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Featured Product Highlight Banner (Blue Accent Card from Reference) */}
                  <div className="bg-gradient-to-r from-blue-600 to-indigo-600 text-white p-6 rounded-2xl shadow-md space-y-3 flex items-center justify-between">
                    <div className="space-y-1">
                      <span className="text-[10px] font-mono uppercase tracking-widest text-blue-200 font-semibold block">Storefront Catalog</span>
                      <h4 className="font-sans font-bold text-lg text-white">
                        {templates.length} Total Templates Active
                      </h4>
                      <p className="text-xs text-blue-100 font-light">
                        {templates.filter(t => t.is_featured).length} Featured templates pinned on Boutique homepage
                      </p>
                    </div>
                    <button
                      onClick={() => handleOpenTemplateModal()}
                      className="bg-white text-blue-600 hover:bg-blue-50 px-4 py-2.5 rounded-xl text-xs font-bold transition-colors whitespace-nowrap shadow-xs"
                    >
                      + Add New Product
                    </button>
                  </div>

                </div>

                {/* RIGHT COL: RECENT ORDERS PANEL (Exact match with reference panel) */}
                <div className="lg:col-span-5 bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-sans font-bold text-sm text-slate-900">Recent Orders</h3>
                    <button
                      onClick={() => setActiveModule('orders')}
                      className="text-xs font-semibold text-blue-600 hover:text-blue-700"
                    >
                      View All →
                    </button>
                  </div>

                  {orders.length === 0 ? (
                    <div className="py-12 text-center space-y-2">
                      <ShoppingBag className="w-8 h-8 text-slate-300 mx-auto" />
                      <p className="text-xs text-slate-500 font-sans">No recent orders recorded.</p>
                      <p className="text-[11px] text-slate-400 font-mono">Orders placed on storefront will appear here instantly.</p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {orders.slice(0, 5).map((ord) => (
                        <div key={ord.id} className="flex items-center justify-between p-3 rounded-xl bg-slate-50/80 border border-slate-100">
                          <div className="flex items-center space-x-3">
                            <div className="w-9 h-9 rounded-lg bg-blue-50 text-blue-600 flex items-center justify-center border border-blue-100 font-bold text-xs">
                              MC
                            </div>
                            <div className="text-left">
                              <span className="font-semibold text-xs text-slate-900 block line-clamp-1">{ord.title}</span>
                              <span className="text-[10px] font-mono text-slate-400">${ord.price.toFixed(2)} × 1</span>
                            </div>
                          </div>
                          <div className="text-right space-y-1">
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold block ${
                              ord.status === 'Pending' ? 'bg-pink-50 text-pink-700 border border-pink-200' : 'bg-emerald-50 text-emerald-700 border border-emerald-200'
                            }`}>
                              {ord.status}
                            </span>
                            <span className="text-[9px] font-mono text-slate-400 block">{new Date(ord.createdAt).toLocaleDateString()}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

              </div>

              {/* 3. BOTTOM ROW GRID: RECENT CUSTOMERS & RECENT TEMPLATES TABLES */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 text-left">
                {/* Recent Customers Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-sans font-bold text-sm text-slate-900">Recent Customers</h3>
                    <button onClick={() => setActiveModule('customers')} className="text-xs font-semibold text-blue-600 hover:underline">
                      Manage Customers →
                    </button>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase">
                        <th className="pb-2 font-semibold">Name</th>
                        <th className="pb-2 font-semibold">Email</th>
                        <th className="pb-2 font-semibold text-right">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {user ? (
                        <tr>
                          <td className="py-2.5 font-semibold text-slate-900">{user.displayName || 'Bespoke Patron'}</td>
                          <td className="py-2.5 font-mono text-slate-600">{user.email}</td>
                          <td className="py-2.5 text-right">
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-mono bg-emerald-50 text-emerald-700 border border-emerald-200">
                              Active
                            </span>
                          </td>
                        </tr>
                      ) : (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-slate-400">No registered customers logged in.</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

                {/* Recent Templates Table */}
                <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                  <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                    <h3 className="font-sans font-bold text-sm text-slate-900">Recent Templates</h3>
                    <button onClick={() => setActiveModule('templates')} className="text-xs font-semibold text-blue-600 hover:underline">
                      Manage Catalog →
                    </button>
                  </div>

                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-slate-100 text-slate-400 font-mono text-[10px] uppercase">
                        <th className="pb-2 font-semibold">Template</th>
                        <th className="pb-2 font-semibold">Category</th>
                        <th className="pb-2 font-semibold text-right">Price</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {templates.length === 0 ? (
                        <tr>
                          <td colSpan={3} className="py-6 text-center text-slate-400">No templates added yet.</td>
                        </tr>
                      ) : (
                        templates.slice(0, 4).map((tmpl) => (
                          <tr key={tmpl.id}>
                            <td className="py-2.5 font-semibold text-slate-900">{tmpl.title}</td>
                            <td className="py-2.5 text-slate-600">{tmpl.category_name}</td>
                            <td className="py-2.5 text-right font-mono font-semibold text-slate-900">${parseFloat(tmpl.price).toFixed(2)}</td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* ================= MODULE 2: TEMPLATES MANAGEMENT ================= */}
          {activeModule === 'templates' && (
            <div className="space-y-6 text-left">
              {/* CONTROL BAR */}
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div className="flex flex-wrap items-center gap-3 flex-1">
                  <div className="relative flex-1 min-w-[200px]">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={tmplSearch}
                      onChange={(e) => setTmplSearch(e.target.value)}
                      placeholder="Search templates by title..."
                      className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden focus:border-blue-600 focus:bg-white transition-all"
                    />
                  </div>

                  <select
                    value={tmplCategory}
                    onChange={(e) => setTmplCategory(e.target.value)}
                    className="bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                  >
                    <option value="all">All Categories</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.slug}>{c.name}</option>
                    ))}
                  </select>

                  <select
                    value={tmplType}
                    onChange={(e) => setTmplType(e.target.value)}
                    className="bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                  >
                    <option value="all">All Types</option>
                    <option value="canva_template">Canva Templates</option>
                    <option value="custom_website">Custom Websites</option>
                  </select>

                  <select
                    value={tmplStatus}
                    onChange={(e) => setTmplStatus(e.target.value as any)}
                    className="bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-700 focus:outline-hidden"
                  >
                    <option value="all">All Status</option>
                    <option value="active">Active Only</option>
                    <option value="inactive">Inactive Only</option>
                  </select>
                </div>

                <button
                  onClick={() => handleOpenTemplateModal()}
                  className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-colors flex items-center space-x-1.5 shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Template</span>
                </button>
              </div>

              {/* TEMPLATES TABLE */}
              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                {loading ? (
                  <div className="py-20 text-center space-y-2">
                    <Loader2 className="w-6 h-6 text-blue-600 animate-spin mx-auto" />
                    <span className="text-xs text-slate-400 font-mono">Loading templates…</span>
                  </div>
                ) : filteredTemplates.length === 0 ? (
                  <div className="py-16 text-center space-y-3">
                    <Package className="w-8 h-8 text-slate-300 mx-auto" />
                    <h4 className="font-bold text-slate-800 text-sm">No templates found</h4>
                    <button
                      onClick={() => handleOpenTemplateModal()}
                      className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-xl"
                    >
                      + Add Template
                    </button>
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                          <th className="p-4 font-semibold">Template</th>
                          <th className="p-4 font-semibold">Category</th>
                          <th className="p-4 font-semibold">Price</th>
                          <th className="p-4 font-semibold">Type</th>
                          <th className="p-4 font-semibold">Ratio</th>
                          <th className="p-4 font-semibold">Status</th>
                          <th className="p-4 font-semibold text-right">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100">
                        {filteredTemplates.map((tmpl) => (
                          <tr key={tmpl.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-semibold text-slate-900">
                              <div className="flex items-center space-x-3">
                                {tmpl.thumbnail ? (
                                  <img src={tmpl.thumbnail} alt={tmpl.title} className="w-10 h-10 rounded-xl object-cover border border-slate-200" />
                                ) : (
                                  <div className="w-10 h-10 rounded-xl bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400">
                                    <Package className="w-4 h-4" />
                                  </div>
                                )}
                                <div>
                                  <span className="font-bold text-slate-900 block">{tmpl.title}</span>
                                  <span className="text-[10px] font-mono text-slate-400">Slug: {tmpl.slug}</span>
                                </div>
                              </div>
                            </td>
                            <td className="p-4 text-slate-600 font-medium">{tmpl.category_name}</td>
                            <td className="p-4 font-mono font-bold text-slate-900">${parseFloat(tmpl.price).toFixed(2)}</td>
                            <td className="p-4">
                              <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono uppercase tracking-wider ${
                                tmpl.template_type === 'custom_website' ? 'bg-blue-50 text-blue-700 border border-blue-200' : 'bg-slate-100 text-slate-600'
                              }`}>
                                {tmpl.template_type === 'custom_website' ? 'Custom Site' : 'Canva'}
                              </span>
                            </td>
                            <td className="p-4 text-slate-500 font-mono text-[10px]">{tmpl.ratio || '—'}</td>
                            <td className="p-4">
                              <div className="flex items-center space-x-2">
                                <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold ${
                                  tmpl.is_active !== false ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-slate-100 text-slate-500'
                                }`}>
                                  {tmpl.is_active !== false ? 'Active' : 'Inactive'}
                                </span>
                                {tmpl.is_featured && (
                                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-amber-50 text-amber-700 border border-amber-200">
                                    Featured
                                  </span>
                                )}
                              </div>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <button
                                  onClick={() => handleOpenTemplateModal(tmpl)}
                                  className="p-1.5 text-slate-600 hover:text-slate-900 hover:bg-slate-100 rounded-lg transition-colors"
                                >
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => setDeletingTemplate(tmpl)}
                                  className="p-1.5 text-red-500 hover:text-red-700 hover:bg-red-50 rounded-lg transition-colors"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* ================= MODULE 3: CATEGORIES MANAGEMENT ================= */}
          {activeModule === 'categories' && (
            <div className="space-y-6 text-left">
              <div className="bg-white p-4 rounded-2xl border border-slate-200/80 shadow-2xs flex items-center justify-between">
                <div className="relative flex-1 max-w-md">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={catSearch}
                    onChange={(e) => setCatSearch(e.target.value)}
                    placeholder="Search categories..."
                    className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl pl-9 pr-4 py-2 text-xs text-slate-900 placeholder-slate-400 focus:outline-hidden"
                  />
                </div>
                <button
                  onClick={() => handleOpenCategoryModal()}
                  className="bg-blue-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-blue-700 transition-colors flex items-center space-x-1.5"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add Category</span>
                </button>
              </div>

              <div className="bg-white rounded-2xl border border-slate-200/80 shadow-2xs overflow-hidden">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 text-slate-500 font-mono uppercase text-[10px] tracking-wider">
                        <th className="p-4 font-semibold">Category</th>
                        <th className="p-4 font-semibold">Slug</th>
                        <th className="p-4 font-semibold">Description</th>
                        <th className="p-4 font-semibold">Order</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold text-right">Actions</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {filteredCategories.map((cat) => {
                        const IconComponent = iconMap[cat.icon] || Sparkles;
                        return (
                          <tr key={cat.id} className="hover:bg-slate-50/80 transition-colors">
                            <td className="p-4 font-bold text-slate-900">
                              <div className="flex items-center space-x-3">
                                <div className={`w-9 h-9 rounded-xl ${cat.image_color || 'bg-stone-50'} border border-slate-200 flex items-center justify-center text-slate-900`}>
                                  <IconComponent className="w-4 h-4" />
                                </div>
                                <span>{cat.name}</span>
                              </div>
                            </td>
                            <td className="p-4 font-mono text-slate-500">{cat.slug}</td>
                            <td className="p-4 text-slate-600 max-w-xs truncate">{cat.description || '—'}</td>
                            <td className="p-4 font-mono font-bold text-slate-900">{cat.display_order}</td>
                            <td className="p-4">
                              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                                {cat.is_active !== false ? 'Active' : 'Inactive'}
                              </span>
                            </td>
                            <td className="p-4 text-right">
                              <div className="flex items-center justify-end space-x-1">
                                <button onClick={() => handleOpenCategoryModal(cat)} className="p-1.5 text-slate-600 hover:text-slate-900 rounded-lg">
                                  <Edit2 className="w-4 h-4" />
                                </button>
                                <button onClick={() => setDeletingCategory(cat)} className="p-1.5 text-red-500 hover:text-red-700 rounded-lg">
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODULE 4: CUSTOMERS ================= */}
          {activeModule === 'customers' && (
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <h3 className="font-sans font-bold text-base text-slate-900">Registered Customers</h3>
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase">
                      <th className="p-4 font-semibold">Customer</th>
                      <th className="p-4 font-semibold">Email</th>
                      <th className="p-4 font-semibold">Firebase UID</th>
                      <th className="p-4 font-semibold">Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {user ? (
                      <tr>
                        <td className="p-4 font-bold text-slate-900">{user.displayName || 'Bespoke Patron'}</td>
                        <td className="p-4 font-mono text-slate-600">{user.email}</td>
                        <td className="p-4 font-mono text-slate-400 text-[10px]">{user.uid}</td>
                        <td className="p-4">
                          <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-emerald-50 text-emerald-700 border border-emerald-200">
                            Verified
                          </span>
                        </td>
                      </tr>
                    ) : (
                      <tr>
                        <td colSpan={4} className="p-8 text-center text-slate-400">No customer logged in.</td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ================= MODULE 5: ORDERS ================= */}
          {activeModule === 'orders' && (
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-4">
                <h3 className="font-sans font-bold text-base text-slate-900">Active Milestone Orders</h3>
                {orders.length === 0 ? (
                  <div className="py-12 text-center text-slate-400">No orders recorded yet.</div>
                ) : (
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="bg-slate-50 border-b border-slate-200 font-mono text-[10px] text-slate-500 uppercase">
                        <th className="p-4 font-semibold">Order ID</th>
                        <th className="p-4 font-semibold">Title</th>
                        <th className="p-4 font-semibold">Price</th>
                        <th className="p-4 font-semibold">Status</th>
                        <th className="p-4 font-semibold">Date</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {orders.map((ord) => (
                        <tr key={ord.id}>
                          <td className="p-4 font-mono font-bold text-slate-900">{ord.id}</td>
                          <td className="p-4 font-semibold text-slate-900">{ord.title}</td>
                          <td className="p-4 font-mono font-bold">${ord.price.toFixed(2)}</td>
                          <td className="p-4">
                            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                              {ord.status}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-400 text-[10px]">{new Date(ord.createdAt).toLocaleDateString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                )}
              </div>
            </div>
          )}

          {/* ================= MODULE 6: ANALYTICS ================= */}
          {activeModule === 'analytics' && (
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                <div>
                  <h3 className="font-sans font-bold text-base text-slate-900">Business Analytics</h3>
                  <p className="text-xs text-slate-500">Live store performance and traffic insights</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                    <span className="text-xs font-mono font-semibold text-slate-400 uppercase">Conversion Rate</span>
                    <div className="text-2xl font-bold text-slate-900 font-sans">4.85%</div>
                    <span className="text-xs font-mono text-emerald-600 font-bold">+1.2% this month</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                    <span className="text-xs font-mono font-semibold text-slate-400 uppercase">Avg Order Value</span>
                    <div className="text-2xl font-bold text-slate-900 font-sans">$49.50</div>
                    <span className="text-xs font-mono text-emerald-600 font-bold">+5.4% YoY</span>
                  </div>
                  <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200/60 space-y-2">
                    <span className="text-xs font-mono font-semibold text-slate-400 uppercase">Total Catalog Assets</span>
                    <div className="text-2xl font-bold text-slate-900 font-sans">{templates.length + categories.length}</div>
                    <span className="text-xs font-mono text-blue-600 font-bold">100% Synced</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ================= MODULE 7: SETTINGS ================= */}
          {activeModule === 'settings' && (
            <div className="space-y-6 text-left">
              <div className="bg-white p-6 rounded-2xl border border-slate-200/80 shadow-2xs space-y-6">
                <div>
                  <h3 className="font-sans font-bold text-base text-slate-900">System Configuration</h3>
                  <p className="text-xs text-slate-500">MemoryCraft server and API node status</p>
                </div>

                <div className="space-y-4 text-xs font-mono">
                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <span className="font-bold text-slate-900 block">Django REST Framework API</span>
                      <span className="text-slate-400 text-[10px]">http://localhost:8000/api/</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      Connected
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <span className="font-bold text-slate-900 block">Firebase Admin Authentication</span>
                      <span className="text-slate-400 text-[10px]">Bearer Token Handshake Verification</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      Active
                    </span>
                  </div>

                  <div className="flex items-center justify-between p-4 rounded-xl bg-slate-50 border border-slate-200/60">
                    <div>
                      <span className="font-bold text-slate-900 block">SQLite Database File</span>
                      <span className="text-slate-400 text-[10px]">backend/db.sqlite3</span>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 font-bold">
                      0 Pending Drift
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* ================= MODAL: ADD / EDIT TEMPLATE ================= */}
      <AnimatePresence>
        {showTemplateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowTemplateModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white max-w-2xl w-full rounded-2xl shadow-2xl border border-slate-200 p-6 relative z-10 text-left max-h-[90vh] overflow-y-auto space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900">
                    {editingTemplate ? 'Edit Template' : 'Add New Template'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure template details in SQLite catalog</p>
                </div>
                <button
                  onClick={() => setShowTemplateModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveTemplate} className="space-y-6">
                <div className="space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block border-b border-slate-100 pb-1">
                    1. Basic Information
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Template Title *</label>
                      <input
                        type="text"
                        required
                        value={tmplForm.title}
                        onChange={(e) => setTmplForm({ ...tmplForm, title: e.target.value })}
                        placeholder="e.g. Editorial Invitation Bundle"
                        className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 font-sans"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Category *</label>
                      <select
                        required
                        value={tmplForm.category}
                        onChange={(e) => setTmplForm({ ...tmplForm, category: Number(e.target.value) })}
                        className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 font-sans"
                      >
                        {categories.map((c) => (
                          <option key={c.id} value={c.id}>{c.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Description</label>
                    <textarea
                      rows={3}
                      value={tmplForm.description}
                      onChange={(e) => setTmplForm({ ...tmplForm, description: e.target.value })}
                      placeholder="Product summary..."
                      className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden focus:border-blue-600 font-sans"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block border-b border-slate-100 pb-1">
                    2. Pricing & Type
                  </span>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Price ($ USD) *</label>
                      <input
                        type="text"
                        required
                        value={tmplForm.price}
                        onChange={(e) => setTmplForm({ ...tmplForm, price: e.target.value })}
                        className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                      />
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Template Type *</label>
                      <select
                        value={tmplForm.template_type}
                        onChange={(e) => setTmplForm({ ...tmplForm, template_type: e.target.value as any })}
                        className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      >
                        <option value="canva_template">Canva Template</option>
                        <option value="custom_website">Custom Website</option>
                      </select>
                    </div>

                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Layout Ratio</label>
                      <input
                        type="text"
                        value={tmplForm.ratio}
                        onChange={(e) => setTmplForm({ ...tmplForm, ratio: e.target.value })}
                        className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                      />
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block border-b border-slate-100 pb-1">
                    3. Content & Media Links
                  </span>

                  <div className="space-y-3">
                    <div className="space-y-1">
                      <label className="text-xs font-bold text-slate-700 block">Thumbnail Image URL</label>
                      <input
                        type="url"
                        value={tmplForm.thumbnail}
                        onChange={(e) => setTmplForm({ ...tmplForm, thumbnail: e.target.value })}
                        placeholder="https://images.unsplash.com/..."
                        className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Canva Link</label>
                        <input
                          type="url"
                          value={tmplForm.canva_url}
                          onChange={(e) => setTmplForm({ ...tmplForm, canva_url: e.target.value })}
                          className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-xs font-bold text-slate-700 block">Preview URL</label>
                        <input
                          type="url"
                          value={tmplForm.preview_url}
                          onChange={(e) => setTmplForm({ ...tmplForm, preview_url: e.target.value })}
                          className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs font-mono text-slate-900"
                        />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <span className="text-[10px] font-mono uppercase tracking-widest text-slate-400 font-bold block border-b border-slate-100 pb-1">
                    4. Settings
                  </span>

                  <div className="flex items-center space-x-6">
                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tmplForm.is_active}
                        onChange={(e) => setTmplForm({ ...tmplForm, is_active: e.target.checked })}
                        className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-600 border-slate-200"
                      />
                      <span className="text-xs font-bold text-slate-900">Active in Store</span>
                    </label>

                    <label className="flex items-center space-x-2 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={tmplForm.is_featured}
                        onChange={(e) => setTmplForm({ ...tmplForm, is_featured: e.target.checked })}
                        className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-600 border-slate-200"
                      />
                      <span className="text-xs font-bold text-slate-900">Show as Featured</span>
                    </label>
                  </div>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowTemplateModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center space-x-2 shadow-xs"
                  >
                    {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingTemplate ? 'Save Changes' : 'Create Template'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= MODAL: ADD / EDIT CATEGORY ================= */}
      <AnimatePresence>
        {showCategoryModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowCategoryModal(false)}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs"
            />

            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 10 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 10 }}
              className="bg-white max-w-lg w-full rounded-2xl shadow-2xl border border-slate-200 p-6 relative z-10 text-left space-y-6"
            >
              <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                <div>
                  <h3 className="font-sans font-bold text-lg text-slate-900">
                    {editingCategory ? 'Edit Category' : 'Add New Category'}
                  </h3>
                  <p className="text-xs text-slate-500">Configure occasion category</p>
                </div>
                <button
                  onClick={() => setShowCategoryModal(false)}
                  className="p-1 text-slate-400 hover:text-slate-900"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleSaveCategory} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Category Name *</label>
                  <input
                    type="text"
                    required
                    value={catForm.name}
                    onChange={(e) => setCatForm({ ...catForm, name: e.target.value })}
                    placeholder="e.g. Birthday"
                    className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-700 block">Description</label>
                  <textarea
                    rows={2}
                    value={catForm.description}
                    onChange={(e) => setCatForm({ ...catForm, description: e.target.value })}
                    className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 focus:outline-hidden"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Icon Name</label>
                    <select
                      value={catForm.icon}
                      onChange={(e) => setCatForm({ ...catForm, icon: e.target.value })}
                      className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900"
                    >
                      <option value="Cake">Cake</option>
                      <option value="Heart">Heart</option>
                      <option value="Sparkles">Sparkles</option>
                      <option value="Flame">Flame</option>
                      <option value="Smile">Smile</option>
                      <option value="Users">Users</option>
                      <option value="GraduationCap">GraduationCap</option>
                      <option value="Compass">Compass</option>
                    </select>
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-bold text-slate-700 block">Display Order</label>
                    <input
                      type="number"
                      value={catForm.display_order}
                      onChange={(e) => setCatForm({ ...catForm, display_order: Number(e.target.value) })}
                      className="w-full bg-[#F4F6F8] border border-slate-200 rounded-xl px-3 py-2 text-xs text-slate-900 font-mono"
                    />
                  </div>
                </div>

                <div className="pt-2">
                  <label className="flex items-center space-x-2 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={catForm.is_active}
                      onChange={(e) => setCatForm({ ...catForm, is_active: e.target.checked })}
                      className="w-4 h-4 rounded-md text-blue-600 focus:ring-blue-600 border-slate-200"
                    />
                    <span className="text-xs font-bold text-slate-900">Active Category</span>
                  </label>
                </div>

                <div className="flex items-center justify-end space-x-3 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowCategoryModal(false)}
                    className="px-4 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={formSubmitting}
                    className="bg-blue-600 hover:bg-blue-700 text-white text-xs font-bold px-5 py-2.5 rounded-xl transition-colors flex items-center space-x-2 shadow-xs"
                  >
                    {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                    <span>{editingCategory ? 'Save Changes' : 'Create Category'}</span>
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* ================= CONFIRM DELETE DIALOGS ================= */}
      <AnimatePresence>
        {deletingTemplate && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setDeletingTemplate(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-200 p-6 relative z-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Delete Template?</h4>
                <p className="text-xs text-slate-500">Are you sure you want to delete <strong className="text-slate-900">{deletingTemplate.title}</strong>?</p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button onClick={() => setDeletingTemplate(null)} className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200">Cancel</button>
                <button onClick={handleDeleteTemplate} disabled={formSubmitting} className="flex-1 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center space-x-1">
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      <AnimatePresence>
        {deletingCategory && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 0.4 }} exit={{ opacity: 0 }} onClick={() => setDeletingCategory(null)} className="fixed inset-0 bg-slate-900/60 backdrop-blur-xs" />
            <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }} className="bg-white max-w-sm w-full rounded-2xl shadow-2xl border border-slate-200 p-6 relative z-10 text-center space-y-4">
              <div className="w-12 h-12 rounded-full bg-red-50 text-red-600 flex items-center justify-center mx-auto border border-red-100">
                <AlertTriangle className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h4 className="font-bold text-slate-900 text-base">Delete Category?</h4>
                <p className="text-xs text-slate-500">Are you sure you want to delete category <strong className="text-slate-900">{deletingCategory.name}</strong>?</p>
              </div>
              <div className="flex items-center space-x-3 pt-2">
                <button onClick={() => setDeletingCategory(null)} className="flex-1 py-2 text-xs font-bold text-slate-600 hover:bg-slate-100 rounded-xl border border-slate-200">Cancel</button>
                <button onClick={handleDeleteCategory} disabled={formSubmitting} className="flex-1 py-2 text-xs font-bold bg-red-600 hover:bg-red-700 text-white rounded-xl flex items-center justify-center space-x-1">
                  {formSubmitting && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
                  <span>Delete</span>
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
}
