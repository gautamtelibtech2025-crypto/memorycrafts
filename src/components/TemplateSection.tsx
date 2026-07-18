import React, { useState } from 'react';
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
  MousePointerClick
} from 'lucide-react';
import { CATEGORIES, Category } from '../types';

interface TemplateSectionProps {
  selectedCategory: string;
  setSelectedCategory: (catId: string) => void;
  setBuilderOpen: (open: boolean) => void;
}

export default function TemplateSection({
  selectedCategory,
  setSelectedCategory,
  setBuilderOpen,
}: TemplateSectionProps) {
  const [activeAssetType, setActiveAssetType] = useState<'all' | 'canva' | 'web'>('all');
  const [notifyEmail, setNotifyEmail] = useState('');
  const [notifySuccess, setNotifySuccess] = useState(false);
  const [showNotifyModal, setShowNotifyModal] = useState(false);
  const [selectedMockupRatio, setSelectedMockupRatio] = useState('');

  // Mock categories list with "All" prefixed
  const filterCategories = [{ id: 'all', name: 'All Milestones' }, ...CATEGORIES];

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

  const placeholderTemplates = [
    { id: 'f1', title: 'Editorial Invitation Bundle', ratio: 'A4 Layout • Canva Template', type: 'canva', section: 'featured' },
    { id: 'f2', title: 'Nostalgic Photo Timeline Deck', ratio: '16:9 Landscape • Canva Template', type: 'canva', section: 'featured' },
    { id: 'f3', title: 'Minimal Proposal Countdown Site', ratio: 'Interactive Space • Custom Code', type: 'web', section: 'featured' },
    { id: 'l1', title: 'Milestone Memory Album', ratio: '1:1 Square • Canva Template', type: 'canva', section: 'latest' },
    { id: 'l2', title: 'Private Anniversary Registry', ratio: 'Custom Layout • Web Space', type: 'web', section: 'latest' },
    { id: 'l3', title: 'Teacher Farewell Logbook', ratio: 'A4 Portrait • Canva Template', type: 'canva', section: 'latest' },
  ];

  // Filter based on selected occasion and asset type
  const filteredFeatured = placeholderTemplates
    .filter((t) => t.section === 'featured')
    .filter((t) => activeAssetType === 'all' || t.type === activeAssetType);

  const filteredLatest = placeholderTemplates
    .filter((t) => t.section === 'latest')
    .filter((t) => activeAssetType === 'all' || t.type === activeAssetType);

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

        {/* SECTION 1: FEATURED TEMPLATES */}
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
            {filteredFeatured.map((item) => (
              <motion.div
                key={item.id}
                id={`featured-card-${item.id}`}
                whileHover={{ y: -5 }}
                className="group relative bg-white rounded-xl border border-dashed border-[#EAEAEA] p-8 flex flex-col justify-between h-[380px] overflow-hidden transition-all hover:border-[#111111] hover:bg-[#FAFAFA]/50"
              >
                {/* Structural Grid lines representing blueprint */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#fafafa_1px,transparent_1px),linear-gradient(to_bottom,#fafafa_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 group-hover:opacity-60 transition-opacity" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#666666]">
                    {item.ratio}
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EAEAEA] group-hover:bg-[#2563EB] transition-colors" />
                </div>

                <div className="relative z-10 space-y-4 py-12 text-center flex-1 flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center mx-auto group-hover:border-[#111111]/40 group-hover:bg-blue-50/20 transition-all">
                    <Layout className="w-5 h-5 text-neutral-400 group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-sans font-medium text-sm text-[#666666] group-hover:text-[#111111] transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-xs text-[#A1A1A1] uppercase tracking-widest block mt-2">
                      Templates will appear here
                    </span>
                  </div>
                </div>

                <div className="relative z-10 border-t border-[#EAEAEA] pt-4 flex items-center justify-between">
                  <button
                    id={`notify-btn-${item.id}`}
                    onClick={() => {
                      setSelectedMockupRatio(item.title);
                      setShowNotifyModal(true);
                    }}
                    className="text-[10px] font-mono uppercase tracking-widest text-[#666666] hover:text-accent transition-colors flex items-center space-x-1"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notify on Launch</span>
                  </button>
                  <span className="text-[10px] font-mono text-neutral-400">
                    [ PRE-RELEASE ]
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

        {/* SECTION 2: LATEST TEMPLATES */}
        <div className="space-y-8 text-left">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-accent" />
              <h3 className="font-sans text-lg font-semibold text-[#111111]">Latest Templates</h3>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {filteredLatest.map((item) => (
              <motion.div
                key={item.id}
                id={`latest-card-${item.id}`}
                whileHover={{ y: -5 }}
                className="group relative bg-white rounded-xl border border-dashed border-[#EAEAEA] p-8 flex flex-col justify-between h-[380px] overflow-hidden transition-all hover:border-[#111111] hover:bg-[#FAFAFA]/50"
              >
                {/* Structural Grid lines representing blueprint */}
                <div className="absolute inset-0 bg-[linear-gradient(to_right,#fafafa_1px,transparent_1px),linear-gradient(to_bottom,#fafafa_1px,transparent_1px)] bg-[size:24px_24px] opacity-40 group-hover:opacity-60 transition-opacity" />

                <div className="relative z-10 flex items-center justify-between">
                  <span className="text-[9px] font-mono uppercase tracking-widest text-[#666666]">
                    {item.ratio}
                  </span>
                  <div className="w-2.5 h-2.5 rounded-full bg-[#EAEAEA] group-hover:bg-[#2563EB] transition-colors" />
                </div>

                <div className="relative z-10 space-y-4 py-12 text-center flex-1 flex flex-col justify-center">
                  <div className="w-12 h-12 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center mx-auto group-hover:border-[#111111]/40 group-hover:bg-blue-50/20 transition-all">
                    <Layout className="w-5 h-5 text-neutral-400 group-hover:text-accent transition-colors" />
                  </div>
                  <div>
                    <h4 className="font-sans font-medium text-sm text-[#666666] group-hover:text-[#111111] transition-colors">
                      {item.title}
                    </h4>
                    <span className="text-xs text-[#A1A1A1] uppercase tracking-widest block mt-2">
                      Templates will appear here
                    </span>
                  </div>
                </div>

                <div className="relative z-10 border-t border-[#EAEAEA] pt-4 flex items-center justify-between">
                  <button
                    id={`notify-btn-${item.id}`}
                    onClick={() => {
                      setSelectedMockupRatio(item.title);
                      setShowNotifyModal(true);
                    }}
                    className="text-[10px] font-mono uppercase tracking-widest text-[#666666] hover:text-accent transition-colors flex items-center space-x-1"
                  >
                    <Bell className="w-3.5 h-3.5" />
                    <span>Notify on Launch</span>
                  </button>
                  <span className="text-[10px] font-mono text-neutral-400">
                    [ COMING SOON ]
                  </span>
                </div>
              </motion.div>
            ))}
          </div>
        </div>

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
