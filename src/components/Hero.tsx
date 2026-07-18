import React from 'react';
import { motion } from 'motion/react';
import { Sparkles, Calendar, ArrowRight, Laptop, Heart, Music } from 'lucide-react';

interface HeroProps {
  setActiveTab: (tab: string) => void;
  setBuilderOpen: (open: boolean) => void;
}

export default function Hero({ setActiveTab, setBuilderOpen }: HeroProps) {
  return (
    <section className="relative overflow-hidden bg-[#FAFAFA] py-16 md:py-24 border-b border-[#EAEAEA]">
      {/* Decorative luxury abstract lines (Understated background) */}
      <div className="absolute inset-0 pointer-events-none opacity-30">
        <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[350px] bg-[radial-gradient(#eaeaea_1px,transparent_1px)] [background-size:24px_24px]" />
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-8 items-center">
          
          {/* Hero Left Content */}
          <div className="lg:col-span-7 space-y-8 text-left">
            
            {/* Tagline */}
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              className="inline-flex items-center space-x-2 bg-white border border-[#EAEAEA] px-3.5 py-1.5 rounded-full"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-accent animate-pulse" />
              <span className="text-[10px] font-mono uppercase tracking-widest text-[#666666] font-semibold">
                Private Digital Craftsmanship
              </span>
            </motion.div>

            {/* Main Header */}
            <div className="space-y-4">
              <motion.h1
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.1 }}
                className="font-sans text-4xl sm:text-5xl lg:text-6xl font-light leading-[1.1] tracking-tight text-[#111111]"
              >
                Crafting <span className="font-medium">Digital Memories</span> for life's finest moments.
              </motion.h1>
              <motion.p
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.2 }}
                className="font-sans text-[#666666] text-sm md:text-lg max-w-md font-light leading-relaxed"
              >
                Premium Canva templates and custom surprise websites designed for those who appreciate the details.
              </motion.p>
            </div>

            {/* Action Buttons */}
            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.3 }}
              className="flex flex-wrap gap-4 pt-2"
            >
              <button
                id="hero-templates-btn"
                onClick={() => setActiveTab('templates')}
                className="px-8 py-3.5 bg-[#2563EB] text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors shadow-sm flex items-center space-x-2 group"
              >
                <span>Browse Collection</span>
                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
              </button>
              
              <button
                id="hero-surprise-btn"
                onClick={() => setBuilderOpen(true)}
                className="px-8 py-3.5 border border-[#EAEAEA] text-[#111111] bg-white text-sm font-medium rounded-full hover:bg-[#FAFAFA] transition-colors flex items-center space-x-2"
              >
                <Sparkles className="w-4 h-4 text-accent" />
                <span>Custom Requests</span>
              </button>
            </motion.div>

            {/* Value Props */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.8, delay: 0.4 }}
              className="grid grid-cols-3 gap-6 pt-6 border-t border-[#EAEAEA]"
            >
              <div>
                <span className="block font-sans text-base font-semibold text-[#111111]">100% Editable</span>
                <span className="block text-xs text-[#666666] mt-0.5 font-sans">Canva friendly structures</span>
              </div>
              <div>
                <span className="block font-sans text-base font-semibold text-[#111111]">Bespoke Design</span>
                <span className="block text-xs text-[#666666] mt-0.5 font-sans">No boring templates</span>
              </div>
              <div>
                <span className="block font-sans text-base font-semibold text-[#111111]">Instant Access</span>
                <span className="block text-xs text-[#666666] mt-0.5 font-sans">Secure immediate download</span>
              </div>
            </motion.div>

          </div>

          {/* Hero Right Visuals: Premium Interactive Placeholder */}
          <div className="lg:col-span-5 relative">
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.8, delay: 0.2 }}
              className="relative w-full aspect-square max-w-[420px] mx-auto"
            >
              {/* Card 1: Custom Site Preview Mockup */}
              <motion.div
                whileHover={{ y: -6, rotate: -2 }}
                className="absolute inset-0 bg-white rounded-xl shadow-xl border border-[#EAEAEA] p-5 flex flex-col justify-between transition-shadow duration-300"
              >
                <div className="flex items-center justify-between border-b border-[#EAEAEA] pb-3">
                  <div className="flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-neutral-300" />
                    <span className="w-2 h-2 rounded-full bg-neutral-200" />
                    <span className="text-[10px] font-mono text-neutral-400 pl-1">memorycraft.site/proposal</span>
                  </div>
                  <Laptop className="w-4 h-4 text-accent" />
                </div>

                <div className="flex-1 flex flex-col justify-center text-center space-y-4 py-6">
                  <span className="text-[9px] font-mono text-accent uppercase tracking-widest font-semibold">The Ultimate Surprise</span>
                  <h3 className="font-sans text-2xl tracking-tight text-[#111111] font-semibold">
                    Will You Marry Me?
                  </h3>
                  <p className="text-[11px] text-[#666666] max-w-xs mx-auto leading-relaxed">
                    A tailored sensory chronicle of memories, letters, and custom soundtrack.
                  </p>

                  {/* Micro interactive mockup content */}
                  <div className="flex justify-center space-x-2 pt-2">
                    <div className="px-2.5 py-1 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] text-[9px] font-mono text-[#666666] flex items-center space-x-1">
                      <Music className="w-3 h-3 text-[#666666] animate-spin [animation-duration:6s]" />
                      <span>Our Song</span>
                    </div>
                    <div className="px-2.5 py-1 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] text-[9px] font-mono text-[#666666] flex items-center space-x-1">
                      <Calendar className="w-3 h-3 text-[#666666]" />
                      <span>Timeline</span>
                    </div>
                  </div>
                </div>

                <div className="border-t border-[#EAEAEA] pt-3 flex items-center justify-between text-[10px] font-mono text-[#666666]">
                  <span>Custom Digital Space</span>
                  <span className="text-[#111111] font-semibold">$149.00</span>
                </div>
              </motion.div>

              {/* Card 2: Canva Template Mockup (Stacked behind/above with offset) */}
              <motion.div
                initial={{ x: 30, y: 30, rotate: 3 }}
                whileHover={{ y: 20, x: 35, rotate: 5 }}
                transition={{ type: 'spring', damping: 20 }}
                className="absolute -right-4 -bottom-4 w-52 h-64 bg-white rounded-lg shadow-lg border border-[#EAEAEA] p-4 flex flex-col justify-between"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[8px] font-mono uppercase text-neutral-400">Editable Template</span>
                  <span className="text-[8px] font-mono bg-blue-50 text-accent px-1.5 py-0.5 rounded font-semibold">CANVA</span>
                </div>

                <div className="space-y-2 py-4">
                  <div className="w-10 h-10 rounded-full bg-[#FAFAFA] border border-[#EAEAEA] flex items-center justify-center mx-auto">
                    <Heart className="w-5 h-5 text-neutral-400" />
                  </div>
                  <div className="text-center">
                    <h4 className="font-sans font-semibold text-xs text-[#111111]">Minimalist Anniversary</h4>
                    <span className="text-[9px] text-[#666666] font-sans block mt-0.5">Editable Photobook Layout</span>
                  </div>
                </div>

                <div className="flex items-center justify-between text-[9px] font-mono text-[#666666] pt-2 border-t border-[#EAEAEA]">
                  <span>Standard Pack</span>
                  <span className="text-[#111111] font-semibold">$29.00</span>
                </div>
              </motion.div>

              {/* Decorative premium badge */}
              <div className="absolute -top-3 -left-3 bg-[#111111] text-white rounded-full w-14 h-14 flex flex-col items-center justify-center shadow-lg border border-neutral-800 animate-pulse">
                <span className="text-[8px] font-mono uppercase tracking-wider leading-none text-neutral-400">Pure</span>
                <span className="text-[10px] font-serif italic mt-0.5">Luxury</span>
              </div>

            </motion.div>
          </div>

        </div>
      </div>
    </section>
  );
}
