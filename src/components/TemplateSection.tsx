import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import {
  Sparkles,
  Layout,
  SlidersHorizontal,
  Mail,
  Check,
  Cpu,
  Bookmark,
  Bell,
  HelpCircle,
  FileText,
  Image as ImageIcon,
  MousePointerClick,
  Loader2,
  AlertCircle
} from 'lucide-react';
import { CATEGORIES, Category, ApiCategory, ApiTemplate, apiCategoryToCategory } from '../types';
import { apiGet } from '../lib/api';

interface TemplateSectionProps {
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  setBuilderOpen: (open: boolean) => void;
  searchQuery?: string;
}

export default function TemplateSection({
  selectedCategory,
  setSelectedCategory,
  setBuilderOpen,
  searchQuery = '',
}: TemplateSectionProps) {
  const [activeAssetType, setActiveAssetType] = useState<'all' | 'canva' | 'web'>('all');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedMockupRatio, setSelectedMockupRatio] = useState('');

  // API state
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [templates, setTemplates] = useState<ApiTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Fetch categories from API
  useEffect(() => {
    let cancelled = false;
    async function fetchCategories() {
      try {
        const data = await apiGet<ApiCategory[]>('/api/categories/');
        if (!cancelled && data && data.length > 0) {
          setCategories(data.map(apiCategoryToCategory));
        }
      } catch (err) {
        console.error('[TemplateSection] Failed to fetch categories:', err);
        // Keep CATEGORIES fallback
      }
    }
    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  // Fetch templates from API with filters
  useEffect(() => {
    let cancelled = false;
    async function fetchTemplates() {
      try {
        setLoading(true);
        setError(null);

        const params = new URLSearchParams();
        if (selectedCategory && selectedCategory !== 'all') {
          params.append('category', selectedCategory);
        }
        if (searchQuery) {
          params.append('search', searchQuery);
        }
        // Map asset type filter to API type param
        if (activeAssetType === 'canva') {
          params.append('type', 'canva_template');
        } else if (activeAssetType === 'web') {
          params.append('type', 'custom_website');
        }

        const queryString = params.toString();
        const url = `/api/templates/${queryString ? `?${queryString}` : ''}`;
        const data = await apiGet<ApiTemplate[]>(url);

        if (!cancelled) {
          setTemplates(data || []);
        }
      } catch (err) {
        console.error('[TemplateSection] Failed to fetch templates:', err);
        if (!cancelled) {
          setError('Failed to load templates. Please try again.');
          setTemplates([]);
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchTemplates();
    return () => { cancelled = true; };
  }, [selectedCategory, searchQuery, activeAssetType]);

  // Categories list with "All" prefixed
  const filterCategories = [{ id: 'all', name: 'All Milestones' }, ...categories];

  // Split templates into featured and latest
  const featuredTemplates = templates.filter((t) => t.is_featured);
  const latestTemplates = templates.filter((t) => !t.is_featured);

  const handleNotifySubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (notifyEmail) {
      setNotifySuccess(true);
      setTimeout(() => {
        setNotifySuccess(false);
        setNotifyEmail('');
        setShowNotifyModal(false);
      }, 1600);
    }
  };

  // Render a template card (shared between featured and latest)
  const renderTemplateCard = (item: ApiTemplate, section: 'featured' | 'latest') => (
    <motion.div
      key={item.id}
      id={`${section}-card-${item.id}`}
      whileHover={{ y: -5 }}
      className="group relative bg-white rounded-xl border border-[#EAEAEA] overflow-hidden transition-all hover:border-[#111111] hover:shadow-lg"
    >
      {/* Thumbnail image or placeholder */}
      {item.thumbnail ? (
        <div className="relative h-48 overflow-hidden">
          <img
            src={item.thumbnail}
            alt={item.title}
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
            onError={(e) => {
              // Fallback to placeholder on image error
              (e.target as HTMLImageElement).style.display = 'none';
              (e.target as HTMLImageElement).nextElementSibling?.classList.remove('hidden');
            }}
          />
          <div className="hidden absolute inset-0 bg-[#FAFAFA] flex items-center justify-center">
            <Layout className="w-8 h-8 text-neutral-300" />
          </div>
          {/* Type badge */}
          <div className="absolute top-3 left-3">
            <span className={`text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full ${
              item.template_type === 'custom_website'
                ? 'bg-blue-50 text-blue-600 border border-blue-100'
                : 'bg-neutral-50 text-neutral-600 border border-neutral-200'
            }`}>
              {item.template_type === 'custom_website' ? 'Custom Site' : 'Canva'}
            </span>
          </div>
          {/* Featured badge */}
          {item.is_featured && (
            <div className="absolute top-3 right-3">
              <span className="text-[9px] font-mono uppercase tracking-widest px-2.5 py-1 rounded-full bg-amber-50 text-amber-600 border border-amber-100">
                Featured
              </span>
            </div>
          )}
        </div>
      ) : (
        <div className="relative h-48 bg-[linear-gradient(to_right,#fafafa_1px,transparent_1px),linear-gradient(to_bottom,#fafafa_1px,transparent_1px)] bg-[size:24px_24px] flex items-center justify-center">
          <Layout className="w-10 h-10 text-neutral-200" />
        </div>
      )}

      {/* Card body */}
      <div className="p-5 space-y-3">
        <div className="space-y-1">
          <span className="text-[9px] font-mono uppercase tracking-widest text-neutral-400">
            {item.ratio || item.category_name}
          </span>
          <h4 className="font-sans font-semibold text-sm text-[#111111] group-hover:text-accent transition-colors line-clamp-1">
            {item.title}
          </h4>
          {item.description && (
            <p className="text-xs text-[#666666] font-light leading-relaxed line-clamp-2">
              {item.description}
            </p>
          )}
        </div>

        <div className="flex items-center justify-between pt-2 border-t border-[#EAEAEA]">
          <span className="font-sans font-semibold text-sm text-[#111111]">
            ${parseFloat(item.price).toFixed(2)}
          </span>
          <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">
            {item.category_name}
          </span>
        </div>
      </div>
    </motion.div>
  );

  return (
    <section id="template-catalog-section" className="py-24 bg-white border-b border-[#EAEAEA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Catalog Control Header */}
        <div className="border-b border-[#EAEAEA] pb-8 mb-12">
          <div className="flex flex-col lg:flex-row lg:items-end lg:justify-between space-y-6 lg:space-y-0 text-left">
            <div className="space-y-2">
              <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-semibold block">
                Digital Archives
              </span>
              <h2 className="font-sans text-3xl md:text-4xl tracking-tight text-[#111111] font-semibold">
                The Memory Registry
              </h2>
              <p className="text-sm text-[#666666] max-w-lg leading-relaxed font-light">
                Filter and explore high-fidelity Canva templates and interactive custom websites curated by occasion.
              </p>
            </div>

            {/* Asset Type Filters */}
            <div className="flex items-center space-x-1.5 border border-[#EAEAEA] p-1 rounded-full bg-[#FAFAFA] self-start">
              <button
                id="filter-asset-all"
                onClick={() => setActiveAssetType('all')}
                className={`px-4 py-1.5 rounded-full text-xs font-sans transition-colors ${
                  activeAssetType === 'all' ? 'bg-white text-[#111111] shadow-xs font-semibold' : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                All Assets
              </button>
              <button
                id="filter-asset-canva"
                onClick={() => setActiveAssetType('canva')}
                className={`px-4 py-1.5 rounded-full text-xs font-sans transition-colors ${
                  activeAssetType === 'canva' ? 'bg-white text-[#111111] shadow-xs font-semibold' : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                Canva Templates
              </button>
              <button
                id="filter-asset-web"
                onClick={() => setActiveAssetType('web')}
                className={`px-4 py-1.5 rounded-full text-xs font-sans transition-colors ${
                  activeAssetType === 'web' ? 'bg-white text-[#111111] shadow-xs font-semibold' : 'text-[#666666] hover:text-[#111111]'
                }`}
              >
                Surprise Sites
              </button>
            </div>
          </div>

          {/* Occasion Filters */}
          <div className="flex items-center space-x-2 overflow-x-auto pt-8 pb-1 scrollbar-none no-scrollbar">
            <SlidersHorizontal className="w-4 h-4 text-neutral-400 flex-shrink-0" />
            <div className="flex space-x-1.5">
              {filterCategories.map((cat) => (
                <button
                  key={cat.id}
                  id={`filter-category-${cat.id}`}
                  onClick={() => setSelectedCategory(cat.id)}
                  className={`px-4 py-1.5 rounded-full text-xs font-sans border transition-all whitespace-nowrap ${
                    selectedCategory === cat.id
                      ? 'border-[#111111] bg-[#111111] text-white font-medium'
                      : 'border-[#EAEAEA] text-[#666666] bg-white hover:border-[#111111]'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
            <span className="text-xs font-mono text-neutral-400 uppercase tracking-widest">Loading templates…</span>
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="flex flex-col items-center justify-center py-20 space-y-3">
            <AlertCircle className="w-8 h-8 text-neutral-300" />
            <p className="text-sm text-neutral-500 font-sans">{error}</p>
          </div>
        )}

        {/* Templates Content */}
        {!loading && !error && (
          <>
            {/* SECTION 1: FEATURED TEMPLATES */}
            {featuredTemplates.length > 0 && (
              <div className="space-y-8 mb-20 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Bookmark className="w-4 h-4 text-accent" />
                    <h3 className="font-sans text-lg font-semibold text-[#111111]">Featured Templates</h3>
                  </div>
                  {selectedCategory !== 'all' && (
                    <span className="text-xs font-mono text-neutral-400">
                      Filtering: {selectedCategory.toUpperCase()}
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {featuredTemplates.map((item) => renderTemplateCard(item, 'featured'))}
                </div>
              </div>
            )}

            {/* SECTION 2: LATEST TEMPLATES */}
            {latestTemplates.length > 0 && (
              <div className="space-y-8 text-left">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-accent" />
                    <h3 className="font-sans text-lg font-semibold text-[#111111]">Latest Templates</h3>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {latestTemplates.map((item) => renderTemplateCard(item, 'latest'))}
                </div>
              </div>
            )}

            {/* Empty State */}
            {templates.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 space-y-4">
                <div className="w-16 h-16 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center">
                  <Layout className="w-7 h-7 text-neutral-300" />
                </div>
                <div className="text-center space-y-1">
                  <h4 className="font-sans font-medium text-neutral-600">No templates found</h4>
                  <p className="text-xs text-neutral-400 font-sans">
                    {searchQuery
                      ? `No results for "${searchQuery}". Try a different search.`
                      : 'Try selecting a different category or filter.'}
                  </p>
                </div>
                {selectedCategory !== 'all' && (
                  <button
                    onClick={() => setSelectedCategory('all')}
                    className="text-xs font-mono uppercase tracking-widest text-accent hover:underline"
                  >
                    Clear Filters
                  </button>
                )}
              </div>
            )}
          </>
        )}

        {/* Interactive Custom Template Request Banner */}
        <div className="mt-20 p-8 md:p-12 bg-[#FAFAFA] rounded-2xl border border-[#EAEAEA] flex flex-col md:flex-row items-center justify-between gap-8 text-left">
          <div className="space-y-2 max-w-xl">
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-semibold block">Tailored Commission Service</span>
            <h3 className="font-sans text-2xl tracking-tight text-[#111111] font-semibold">Need a bespoke memory template layout immediately?</h3>
            <p className="text-xs text-[#666666] leading-relaxed font-sans font-light">
              Collaborate directly with our design studio to draft custom layouts or bespoke web templates matching your exact thematic requirements. Delivery in 48 hours.
            </p>
          </div>
          
          <button
            id="commission-request-btn"
            onClick={() => setBuilderOpen(true)}
            className="w-full md:w-auto bg-[#111111] text-white text-xs font-semibold py-3.5 px-8 rounded-full hover:bg-neutral-800 transition-colors whitespace-nowrap self-stretch md:self-center uppercase tracking-wider"
          >
            Request Custom Mockup
          </button>
        </div>

      </div>

      {/* Notify Me Modal */}
      <AnimatePresence>
        {showNotifyModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              id="notify-modal-backdrop"
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.4 }}
              exit={{ opacity: 0 }}
              onClick={() => setShowNotifyModal(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-xs"
            />

            <motion.div
              id="notify-modal-box"
              initial={{ opacity: 0, scale: 0.95, y: 15 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 15 }}
              className="bg-white max-w-sm w-full rounded-xl shadow-2xl border border-[#EAEAEA] p-8 relative z-10 text-center"
            >
              <button
                id="close-notify-btn"
                onClick={() => setShowNotifyModal(false)}
                className="absolute top-4 right-4 p-1 text-neutral-500 hover:text-neutral-950 transition-colors"
              >
                <HelpCircle className="w-4 h-4 text-neutral-400 hover:text-neutral-900" />
              </button>

              {notifySuccess ? (
                <div className="space-y-4 py-4">
                  <div className="w-11 h-11 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-100">
                    <Check className="w-5 h-5" />
                  </div>
                  <div>
                    <h4 className="font-sans font-semibold text-[#111111]">Successfully Registered</h4>
                    <p className="text-xs text-[#666666] mt-1">We will message you immediately on layout release.</p>
                  </div>
                </div>
              ) : (
                <div className="space-y-5">
                  <div className="space-y-1">
                    <span className="text-[9px] font-mono text-accent uppercase tracking-widest font-semibold block">Asset Priority Queue</span>
                    <h4 className="font-sans font-semibold text-[#111111] text-base">Launch Notifications</h4>
                    <p className="text-xs text-[#666666]">Subscribe for early-access availability of: <strong className="text-[#111111] block mt-1">{selectedMockupRatio}</strong></p>
                  </div>

                  <form onSubmit={handleNotifySubmit} className="space-y-3">
                    <input
                      type="email"
                      required
                      value={notifyEmail}
                      onChange={(e) => setNotifyEmail(e.target.value)}
                      placeholder="name@domain.com"
                      className="w-full bg-[#FAFAFA] border border-[#EAEAEA] rounded-full py-2 px-4 text-xs text-[#111111] placeholder-[#A1A1A1] focus:outline-hidden focus:border-[#111111] focus:bg-white transition-all font-sans"
                    />
                    <button
                      type="submit"
                      className="w-full bg-[#111111] text-white text-[11px] font-semibold uppercase tracking-wider py-2.5 rounded-full hover:bg-neutral-800 transition-colors"
                    >
                      Prioritize Me
                    </button>
                  </form>
                </div>
              )}
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </section>
  );
}
