import React from 'react';
import { motion } from 'motion/react';
import { Sliders, Layout, Laptop, Sparkles, Send, CheckCircle2, Bookmark } from 'lucide-react';

interface HowItWorksProps {
  setBuilderOpen: (open: boolean) => void;
  setActiveTab: (tab: string) => void;
}

export default function HowItWorksView({ setBuilderOpen, setActiveTab }: HowItWorksProps) {
  const steps = [
    {
      num: "01",
      icon: Layout,
      title: "Select Aesthetic or Custom Design",
      subtitle: "Canva Templates or Custom Interactive Spaces",
      description: "Browse our Curated Occasions. Acquire instant, highly customizable Canva layout bundles tailored with clean grid typography, or launch our interactive Studio Configurator to sketch a private, bespoke surprise website from scratch."
    },
    {
      num: "02",
      icon: Sliders,
      title: "Personalize with Private Materials",
      subtitle: "Your photos, letters, dates, and soundtrack",
      description: "Customize your assets easily. For Canva templates, edit text directly inside your native Canva browser suite. For surprise websites, specify milestones, write sealed digital letters, select a background vinyl soundtrack, and set security password gates."
    },
    {
      num: "03",
      icon: Send,
      title: "Deliver & Surprise Instantly",
      subtitle: "Secure immediate downloads or private domain hosting",
      description: "Begin the celebration. Secure immediate high-resolution downloads for Canva documents, or receive a live private domain link (e.g., memorycraft.site/olivia) featuring beautiful responsive entrances, ready to send to your special person."
    }
  ];

  return (
    <div className="bg-white min-h-screen text-left">
      {/* Editorial Header */}
      <section className="py-20 border-b border-[#EAEAEA] bg-[#FAFAFA] relative">
        <div className="absolute inset-0 pointer-events-none opacity-40">
          <div className="absolute top-12 left-12 w-64 h-64 rounded-full border border-[#EAEAEA]" />
        </div>

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 space-y-4">
          <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-semibold block">
            The Studio Framework
          </span>
          <h1 className="font-sans text-4xl md:text-5xl tracking-tight text-[#111111] font-semibold max-w-2xl">
            How MemoryCraft Works
          </h1>
          <p className="text-sm md:text-base text-[#666666] max-w-xl leading-relaxed font-light">
            Understand our seamless design, customization, and delivery process, engineered to provide high-end digital keepsakes with zero stress.
          </p>
        </div>
      </section>

      {/* Step Roadmap */}
      <section className="py-24 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="relative border-l border-[#EAEAEA] ml-4 md:ml-6 space-y-16">
          {steps.map((step, idx) => {
            const Icon = step.icon;
            return (
              <motion.div
                key={idx}
                id={`how-it-works-step-${step.num}`}
                initial={{ opacity: 0, x: -15 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: idx * 0.1 }}
                className="relative pl-10 md:pl-14 group"
              >
                {/* Step Circle Indicator */}
                <div className="absolute -left-5 md:-left-6 top-0 w-10 h-10 md:w-12 md:h-12 rounded-full bg-white border-2 border-[#EAEAEA] group-hover:border-[#111111] flex items-center justify-center transition-all z-10 shadow-xs">
                  <span className="font-sans text-xs md:text-sm font-semibold text-[#111111] group-hover:text-accent transition-colors">
                    {step.num}
                  </span>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                  
                  {/* Step Description */}
                  <div className="lg:col-span-8 space-y-3">
                    <div className="flex items-center space-x-2 text-accent">
                      <Icon className="w-4 h-4" />
                      <span className="text-[10px] font-mono uppercase tracking-widest font-semibold">{step.subtitle}</span>
                    </div>
                    <h3 className="font-sans text-xl md:text-2xl text-[#111111] font-semibold">
                      {step.title}
                    </h3>
                    <p className="text-xs md:text-sm text-[#666666] leading-relaxed font-sans font-light max-w-2xl">
                      {step.description}
                    </p>
                  </div>

                  {/* Step Micro visual Mock */}
                  <div className="lg:col-span-4 rounded-xl border border-[#EAEAEA] p-4 bg-[#FAFAFA] flex flex-col justify-center h-32 text-center relative overflow-hidden">
                    {step.num === "01" && (
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-mono text-neutral-400 block uppercase">Step 1 Preview</span>
                        <div className="flex justify-center space-x-1.5">
                          <span className="px-2 py-0.5 rounded-full bg-white border border-[#EAEAEA] text-[8px] font-mono text-[#666666]">Canva Pack</span>
                          <span className="px-2 py-0.5 rounded-full bg-neutral-950 text-white text-[8px] font-mono">Bespoke Site</span>
                        </div>
                      </div>
                    )}
                    {step.num === "02" && (
                      <div className="space-y-1.5">
                        <span className="text-[8px] font-mono text-neutral-400 block uppercase">Integrated Files</span>
                        <div className="w-2/3 h-2 bg-neutral-200 rounded mx-auto" />
                        <div className="w-1/2 h-2 bg-neutral-200 rounded mx-auto" />
                      </div>
                    )}
                    {step.num === "03" && (
                      <div className="space-y-1.5 flex flex-col items-center">
                        <CheckCircle2 className="w-5 h-5 text-accent animate-bounce" />
                        <span className="text-[8px] font-mono text-neutral-900 uppercase font-semibold">Ready to Deliver</span>
                      </div>
                    )}
                  </div>

                </div>
              </motion.div>
            );
          })}
        </div>
      </section>

      {/* Trust & Guarantee Banner */}
      <section className="py-20 bg-[#FAFAFA] border-t border-b border-[#EAEAEA]">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 grid grid-cols-1 md:grid-cols-3 gap-8 text-center md:text-left">
          
          <div className="space-y-2">
            <h4 className="font-sans font-semibold text-sm text-[#111111]">Zero Design Experience Needed</h4>
            <p className="text-xs text-[#666666] font-sans font-light leading-relaxed">
              Our Canva templates use highly structured native blocks. No coding or prior layout expertise required to make professional modifications.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-sans font-semibold text-sm text-[#111111]">Secure Encryption Hosting</h4>
            <p className="text-xs text-[#666666] font-sans font-light leading-relaxed">
              We encrypt all secret letters and private photo archives hosted on our custom surprise platforms. Your digital spaces remain private.
            </p>
          </div>

          <div className="space-y-2">
            <h4 className="font-sans font-semibold text-sm text-[#111111]">48-Hour Bespoke Turnaround</h4>
            <p className="text-xs text-[#666666] font-sans font-light leading-relaxed">
              Need custom layout drafting? Our team of digital designers delivers full-fidelity custom coded surprise spaces in under 48 hours.
            </p>
          </div>

        </div>
      </section>

      {/* Call to Action bottom */}
      <section className="py-24 text-center max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 space-y-6">
        <h2 className="font-sans text-3xl md:text-4xl tracking-tight text-[#111111] font-semibold">
          Ready to craft a lasting digital keepsake?
        </h2>
        <p className="text-sm text-[#666666] max-w-md mx-auto font-light">
          Begin by launching our interactive configurator or browsing our extensive catalog of editable Canva files.
        </p>
        <div className="flex justify-center space-x-3 pt-2">
          <button
            onClick={() => {
              setActiveTab('templates');
              window.scrollTo({ top: 400, behavior: 'smooth' });
            }}
            className="px-8 py-3.5 bg-[#2563EB] text-white text-sm font-medium rounded-full hover:bg-blue-700 transition-colors shadow-sm uppercase tracking-wider"
          >
            Browse Catalog
          </button>
          
          <button
            onClick={() => setBuilderOpen(true)}
            className="px-8 py-3.5 border border-[#EAEAEA] text-[#111111] bg-white text-sm font-medium rounded-full hover:bg-[#FAFAFA] transition-colors uppercase tracking-wider"
          >
            Design Custom Site
          </button>
        </div>
      </section>
    </div>
  );
}
