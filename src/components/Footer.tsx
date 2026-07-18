import React from 'react';
import { Mail, Phone, MapPin, Heart, ExternalLink } from 'lucide-react';
import { CATEGORIES } from '../types';

interface FooterProps {
  setActiveTab: (tab: string) => void;
  setBuilderOpen: (open: boolean) => void;
}

export default function Footer({ setActiveTab, setBuilderOpen }: FooterProps) {
  const handleNavClick = (tabId: string) => {
    setActiveTab(tabId);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <footer className="bg-white text-[#111111] pt-20 pb-12 border-t border-[#EAEAEA] relative">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Footer Links Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-10 border-b border-[#EAEAEA] pb-16">
          
          {/* Column 1: Brand details */}
          <div className="lg:col-span-4 space-y-6 text-left">
            <div className="flex items-center">
              <span className="text-xl font-bold tracking-tight uppercase text-[#111111]">
                MemoryCraft
              </span>
            </div>
            <p className="text-xs text-[#666666] leading-relaxed font-sans max-w-sm font-light">
              We design and draft high-end private digital experiences, editable Canva templates, and custom surprise platforms to preserve and cherish life's most sacred milestones.
            </p>
            <div className="space-y-2 pt-2">
              <div className="flex items-center space-x-2.5 text-xs text-[#666666] font-mono">
                <Mail className="w-3.5 h-3.5 text-neutral-400" />
                <a href="mailto:studio@memorycraft.site" className="hover:text-[#2563EB] transition-colors">studio@memorycraft.site</a>
              </div>
              <div className="flex items-center space-x-2.5 text-xs text-[#666666] font-mono">
                <MapPin className="w-3.5 h-3.5 text-neutral-400" />
                <span>Bespoke Design Lab, NY // BLR</span>
              </div>
            </div>
          </div>

          {/* Column 2: Quick Links */}
          <div className="lg:col-span-2 space-y-4 text-left">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
              Boutique Directory
            </h4>
            <ul className="space-y-2.5 text-xs">
              <li>
                <button onClick={() => handleNavClick('home')} className="text-[#666666] hover:text-[#111111] transition-colors font-medium">
                  Home Boutique
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('templates')} className="text-[#666666] hover:text-[#111111] transition-colors font-medium">
                  Canva Templates
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('surprise_websites')} className="text-[#666666] hover:text-[#111111] transition-colors font-medium">
                  Surprise Websites
                </button>
              </li>
              <li>
                <button onClick={() => handleNavClick('how_it_works')} className="text-[#666666] hover:text-[#111111] transition-colors font-medium">
                  How It Works
                </button>
              </li>
              <li>
                <button onClick={() => setBuilderOpen(true)} className="text-[#666666] hover:text-[#2563EB] transition-colors font-medium flex items-center space-x-1">
                  <span>Custom Configurator</span>
                  <ExternalLink className="w-3 h-3" />
                </button>
              </li>
            </ul>
          </div>

          {/* Column 3: Categories */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
              Occasions Catalog
            </h4>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2.5 text-xs">
              {CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => {
                    setActiveTab('templates');
                    window.scrollTo({ top: 500, behavior: 'smooth' });
                  }}
                  className="text-[#666666] hover:text-[#111111] transition-colors text-left font-medium"
                >
                  {cat.name}
                </button>
              ))}
            </div>
          </div>

          {/* Column 4: Support / Legal */}
          <div className="lg:col-span-3 space-y-4 text-left">
            <h4 className="font-mono text-[10px] uppercase tracking-widest text-neutral-400 font-semibold">
              Client Concierge
            </h4>
            <ul className="space-y-2.5 text-xs text-[#666666]">
              <li>
                <a href="#help" onClick={(e) => { e.preventDefault(); console.log("Help desk is part of Phase 2 client integration."); }} className="hover:text-[#111111] transition-colors font-medium">
                  FAQ & Support Desk
                </a>
              </li>
              <li>
                <a href="#licensing" onClick={(e) => { e.preventDefault(); console.log("MemoryCraft Licensing permits 1-to-1 editing inside personal Canva suites."); }} className="hover:text-[#111111] transition-colors font-medium">
                  Canva Licensing Terms
                </a>
              </li>
              <li>
                <a href="#privacy" onClick={(e) => { e.preventDefault(); console.log("Privacy terms: All photos, letters, and custom soundtrack credentials uploaded reside purely in encrypted slots."); }} className="hover:text-[#111111] transition-colors font-medium">
                  Privacy Encryption
                </a>
              </li>
              <li>
                <a href="#terms" onClick={(e) => { e.preventDefault(); }} className="hover:text-[#111111] transition-colors font-medium">
                  Service Terms
                </a>
              </li>
            </ul>
          </div>

        </div>

        {/* Bottom copyright and social handles */}
        <div className="pt-8 flex flex-col md:flex-row items-center justify-between text-[11px] font-mono text-neutral-400">
          <div>
            <span>&copy; {new Date().getFullYear()} MemoryCraft Studio. All rights preserved.</span>
          </div>

          <div className="flex space-x-6 mt-4 md:mt-0">
            <a href="#instagram" onClick={(e) => e.preventDefault()} className="hover:text-[#2563EB] transition-colors uppercase tracking-widest">Instagram</a>
            <a href="#pinterest" onClick={(e) => e.preventDefault()} className="hover:text-[#2563EB] transition-colors uppercase tracking-widest">Pinterest</a>
            <a href="#twitter" onClick={(e) => e.preventDefault()} className="hover:text-[#2563EB] transition-colors uppercase tracking-widest">Twitter</a>
            <a href="#dribbble" onClick={(e) => e.preventDefault()} className="hover:text-[#2563EB] transition-colors uppercase tracking-widest">Dribbble</a>
          </div>
        </div>

      </div>
    </footer>
  );
}
