import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import {
  Cake,
  Heart,
  Sparkles,
  Flame,
  Smile,
  Users,
  GraduationCap,
  Compass,
  ArrowRight,
  Loader2
} from 'lucide-react';
import { CATEGORIES, Category, ApiCategory, apiCategoryToCategory } from '../types';
import { apiGet } from '../lib/api';

const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
  Cake,
  Heart,
  Sparkles,
  Flame,
  Smile,
  Users,
  GraduationCap,
  Compass,
};

interface CategoriesProps {
  onSelectCategory: (catId: string) => void;
  setActiveTab: (tab: string) => void;
}

export default function Categories({ onSelectCategory, setActiveTab }: CategoriesProps) {
  const [categories, setCategories] = useState<Category[]>(CATEGORIES);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    async function fetchCategories() {
      try {
        setLoading(true);
        const data = await apiGet<ApiCategory[]>('/api/categories/');
        if (!cancelled && data && data.length > 0) {
          setCategories(data.map(apiCategoryToCategory));
          setError(null);
        }
      } catch (err) {
        console.error('[Categories] Failed to fetch from API:', err);
        if (!cancelled) {
          setError('Failed to load categories');
          // Keep CATEGORIES fallback already set as initial state
        }
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    fetchCategories();
    return () => { cancelled = true; };
  }, []);

  return (
    <section id="browse-categories" className="py-20 bg-[#FAFAFA] border-b border-[#EAEAEA]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Section Header */}
        <div className="flex flex-col md:flex-row md:items-end justify-between mb-12 space-y-4 md:space-y-0 text-left">
          <div className="space-y-2">
            <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-semibold block">
              Curated Occasions
            </span>
            <h2 className="font-sans text-3xl md:text-4xl tracking-tight text-[#111111] font-semibold">
              Browse by Celebration
            </h2>
            <p className="text-sm text-[#666666] max-w-lg leading-relaxed font-light">
              Explore meticulously organized memory vaults, invites, and timelines customized for every momentous milestone.
            </p>
          </div>
          
          <button
            id="all-templates-btn"
            onClick={() => {
              onSelectCategory('all');
              setActiveTab('templates');
            }}
            className="text-xs font-mono uppercase tracking-widest text-[#111111] font-semibold border-b border-[#111111] pb-0.5 hover:text-accent hover:border-accent transition-colors flex items-center space-x-1.5 self-start"
          >
            <span>View All Assets</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Loading State */}
        {loading && (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="w-6 h-6 text-neutral-400 animate-spin" />
          </div>
        )}

        {/* Error State */}
        {!loading && error && (
          <div className="text-center py-16 space-y-2">
            <p className="text-sm text-neutral-500 font-sans">{error}</p>
            <p className="text-xs text-neutral-400 font-mono">Showing cached data</p>
          </div>
        )}

        {/* Categories Grid */}
        {!loading && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {categories.map((cat, idx) => {
              const IconComponent = iconMap[cat.icon] || Sparkles;
              
              return (
                <motion.div
                  key={cat.id}
                  id={`category-card-${cat.id}`}
                  initial={{ opacity: 0, y: 15 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ duration: 0.5, delay: idx * 0.05 }}
                  whileHover={{ y: -4 }}
                  onClick={() => {
                    onSelectCategory(cat.id);
                    setActiveTab('templates');
                    // Smooth scroll to catalog
                    const catalogElem = document.getElementById('template-catalog-section');
                    if (catalogElem) {
                      catalogElem.scrollIntoView({ behavior: 'smooth' });
                    }
                  }}
                  className="cursor-pointer group bg-white rounded-xl border border-[#EAEAEA] p-6 flex flex-col justify-between h-56 transition-all shadow-xs hover:shadow-md hover:border-[#111111]"
                >
                  {/* Card Icon & Accent */}
                  <div className="flex items-start justify-between">
                    <div className={`w-11 h-11 rounded-lg ${cat.imageColor} border border-[#EAEAEA] flex items-center justify-center text-neutral-900 group-hover:bg-neutral-950 group-hover:text-white transition-all`}>
                      <IconComponent className="w-5 h-5" />
                    </div>
                    <span className="text-[10px] font-mono text-neutral-400 group-hover:text-accent transition-colors">
                      MC // 0{idx + 1}
                    </span>
                  </div>

                  {/* Card Text info */}
                  <div className="space-y-1.5 text-left pt-6">
                    <h3 className="font-sans font-semibold text-base text-[#111111] flex items-center space-x-1.5">
                      <span>{cat.name}</span>
                      <ArrowRight className="w-3.5 h-3.5 opacity-0 -translate-x-1 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-accent transition-all" />
                    </h3>
                    <p className="text-xs text-[#666666] font-sans leading-relaxed line-clamp-2">
                      {cat.description}
                    </p>
                  </div>
                </motion.div>
              );
            })}
          </div>
        )}

      </div>
    </section>
  );
}
