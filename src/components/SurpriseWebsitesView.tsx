import React, { useState } from 'react';
import { motion } from 'motion/react';
import { Sparkles, Laptop, Calendar, Music, Gift, Heart, ArrowRight, ShieldCheck, Mail, CheckCircle2 } from 'lucide-react';

interface SurpriseWebsitesProps {
  setBuilderOpen: (open: boolean) => void;
}

export default function SurpriseWebsitesView({ setBuilderOpen }: SurpriseWebsitesProps) {
  const [previewStarted, setPreviewStarted] = useState(false);

  const customFeatures = [
    {
      icon: Calendar,
      title: "Interactive Nostalgia Timelines",
      description: "Map your unique relational journey step-by-step. Upload childhood memories, landmark moments, and secret logs, elegantly presented."
    },
    {
      icon: Music,
      title: "Embedded Soundtrack Vinyl",
      description: "Curate a bespoke musical atmosphere. Embed a digital spinning vinyl player loaded with their favorite track, playing ambiently upon opening."
    },
    {
      icon: Gift,
      title: "Virtual Sealed Letters",
      description: "Write warm digital letters hidden behind beautiful luxury envelopes. Fully reactive scratch cards reveal secret congratulations notes."
    },
    {
      icon: ShieldCheck,
      title: "Private Password Protected Slots",
      description: "Secure your digital space. Ensure only your recipient can enter by implementing an optional elegant lock screen."
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
            Custom Digital Creations
          </span>
          <h1 className="font-sans text-4xl md:text-5xl tracking-tight text-[#111111] font-semibold max-w-2xl">
            Bespoke Surprise Websites
          </h1>
          <p className="text-sm md:text-base text-[#666666] max-w-xl leading-relaxed font-light">
            Move beyond physical paper. Send a private, custom-coded interactive universe filled with memories, reactive soundtrack players, and warm digital secrets.
          </p>
          <div className="pt-2">
            <button
              onClick={() => setBuilderOpen(true)}
              className="bg-[#2563EB] text-white text-xs font-semibold py-3.5 px-8 rounded-full hover:bg-blue-700 transition-colors flex items-center space-x-2 uppercase tracking-wider shadow-sm"
            >
              <Sparkles className="w-4 h-4 text-white animate-pulse" />
              <span>Launch Studio Configurator</span>
            </button>
          </div>
        </div>
      </section>

      {/* Feature Showcase Grid */}
      <section className="py-24 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          <div className="lg:col-span-5 space-y-8">
            <div className="space-y-2">
              <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest block">Standard Features</span>
              <h2 className="font-sans text-3xl tracking-tight text-[#111111] font-semibold">Digital components engineered to evoke emotions.</h2>
              <p className="text-xs text-[#666666] leading-relaxed font-sans font-light">
                Every custom-built surprise space undergoes professional curation, ensuring typography spacing, responsive mobile fluid layouts, and lightweight load speeds match real luxury brand experiences.
              </p>
            </div>

            <div className="space-y-4">
              {customFeatures.map((feat, idx) => {
                const Icon = feat.icon;
                return (
                  <div key={idx} className="flex items-start space-x-3.5 p-4 rounded-lg bg-[#FAFAFA] border border-[#EAEAEA]">
                    <div className="w-8 h-8 rounded bg-white border border-[#EAEAEA] flex items-center justify-center text-accent flex-shrink-0">
                      <Icon className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-semibold text-[#111111] font-sans">{feat.title}</h4>
                      <p className="text-[11px] text-[#666666] mt-0.5 font-light leading-relaxed">{feat.description}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Interactive Live Website Mockup Box */}
          <div className="lg:col-span-7 relative">
            <div className="absolute inset-0 bg-[#FAFAFA] rounded-2xl border border-[#EAEAEA] p-8 flex flex-col justify-between h-[520px] shadow-sm relative overflow-hidden">
              {/* background aesthetic grid */}
              <div className="absolute inset-0 bg-[radial-gradient(#e5e7eb_1px,transparent_1px)] [background-size:16px_16px] opacity-40" />

              <div className="relative z-10 flex items-center justify-between border-b border-[#EAEAEA] pb-4">
                <span className="text-[9px] font-mono uppercase text-neutral-400">Recipient Portal Mockup</span>
                <div className="flex space-x-1">
                  <span className="w-2 h-2 rounded-full bg-neutral-200" />
                  <span className="w-2 h-2 rounded-full bg-neutral-300" />
                </div>
              </div>

              {/* Inner live simulated preview */}
              <div className="relative z-10 bg-white rounded-xl border border-[#EAEAEA] shadow-xl flex-1 my-6 flex flex-col overflow-hidden">
                <div className="bg-[#FAFAFA] px-4 py-2 border-b border-[#EAEAEA] flex items-center space-x-2">
                  <div className="w-1/2 h-3.5 bg-neutral-200/60 rounded text-[8px] font-mono text-neutral-400 px-2 flex items-center overflow-hidden">
                    memorycraft.site/anniversary
                  </div>
                </div>

                <div className="flex-1 p-8 text-center flex flex-col justify-center space-y-4 font-sans">
                  <div className="w-14 h-14 rounded-full bg-pink-50/50 border border-pink-100 flex items-center justify-center mx-auto text-pink-500 animate-pulse">
                    <Heart className="w-6 h-6 fill-pink-500" />
                  </div>
                  <h3 className="text-2xl text-[#111111] font-semibold">To My Sacred Partner</h3>
                  
                  {!previewStarted ? (
                    <>
                      <p className="text-xs text-[#666666] max-w-sm mx-auto leading-relaxed font-light">
                        “Ten years of shared laughter, quiet evenings, and pathways crafted hand-in-hand. Tap below to begin our timeline journey.”
                      </p>
                      <div className="pt-2">
                        <button
                          onClick={() => setPreviewStarted(true)}
                          className="bg-[#2563EB] text-white text-[10px] font-semibold uppercase tracking-wider py-2.5 px-6 rounded-full hover:bg-blue-700 transition-colors"
                        >
                          Begin Chronicle
                        </button>
                      </div>
                    </>
                  ) : (
                    <motion.div 
                      initial={{ opacity: 0, scale: 0.95 }}
                      animate={{ opacity: 1, scale: 1 }}
                      className="space-y-2"
                    >
                      <p className="text-xs text-green-600 font-medium">
                        ✨ Soundtrack Vinyl starts playing & timeline fades in beautifully!
                      </p>
                      <p className="text-[11px] text-[#666666] leading-relaxed max-w-xs mx-auto font-light">
                        The password screen unlocks, setting off slow ambient background transitions. This client-side custom layout flow is fully ready.
                      </p>
                      <button
                        onClick={() => setPreviewStarted(false)}
                        className="text-[10px] font-mono text-accent uppercase tracking-widest hover:underline pt-1 block mx-auto"
                      >
                        Reset Mockup view
                      </button>
                    </motion.div>
                  )}
                </div>
              </div>

              <div className="relative z-10 text-[10px] text-neutral-400 font-mono text-center">
                Fully Responsive • High-Fidelity Custom Domain Hosting Included
              </div>
            </div>
          </div>

        </div>
      </section>

      {/* Pricing packages (UI only) */}
      <section className="py-20 bg-[#FAFAFA] border-t border-b border-[#EAEAEA]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center space-y-12">
          <div className="space-y-2">
            <span className="text-[9px] font-mono text-accent uppercase tracking-widest font-semibold block">Boutique Packages</span>
            <h2 className="font-sans text-3xl tracking-tight text-[#111111] font-semibold">Understated Premium Subscriptions</h2>
            <p className="text-sm text-[#666666] max-w-lg mx-auto font-sans font-light leading-relaxed">
              Choose between complete DIY Canva packages or hand-off your materials to our layout engineers for a custom interactive launch.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 max-w-3xl mx-auto text-left">
            {/* Standard Tier */}
            <div className="bg-white rounded-xl border border-[#EAEAEA] p-8 flex flex-col justify-between h-[420px] transition-all hover:border-[#111111] hover:shadow-lg">
              <div className="space-y-4">
                <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest block">Standard Release</span>
                <h3 className="font-sans text-2xl text-[#111111] font-semibold">Editable Template</h3>
                <p className="text-xs text-[#666666] font-sans font-light leading-relaxed">
                  Acquire instant access to high-fidelity Canva templates. Perfect for independent builders wanting elegant pre-designed grids.
                </p>
                <div className="space-y-2 pt-2 text-xs text-[#666666] font-sans font-light">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>100% Canva Editable formats</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Detailed typography guide</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Free permanent digital assets</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EAEAEA] pt-6 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-mono text-neutral-400 leading-none">Standard Price</span>
                  <span className="font-mono text-xl text-[#111111] font-semibold mt-1 block">$29.00 USD</span>
                </div>
                <button
                  onClick={() => setBuilderOpen(true)}
                  className="bg-[#2563EB] text-white text-[10px] font-semibold uppercase tracking-wider py-2.5 px-6 rounded-full hover:bg-blue-700 transition-colors"
                >
                  Configure layout
                </button>
              </div>
            </div>

            {/* Premium Custom Custom Tier */}
            <div className="bg-white rounded-xl border border-[#EAEAEA] p-8 flex flex-col justify-between h-[420px] transition-all hover:border-[#111111] hover:shadow-lg relative overflow-hidden">
              <div className="absolute top-0 right-0 bg-[#2563EB] text-white font-mono text-[8px] uppercase tracking-widest px-3 py-1 font-semibold rounded-bl-lg">
                Exclusive
              </div>

              <div className="space-y-4">
                <span className="text-[10px] font-mono text-accent uppercase tracking-widest block font-semibold">Bespoke Release</span>
                <h3 className="font-sans text-2xl text-[#111111] font-semibold">Bespoke Space</h3>
                <p className="text-xs text-[#666666] font-sans font-light leading-relaxed">
                  Collaborate directly with our engineers. Hand off your logs, letters, and custom soundtrack choices. We compile and host the private domain for you.
                </p>
                <div className="space-y-2 pt-2 text-xs text-[#666666] font-sans font-light">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Private custom domains (12 months)</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Tailored music soundtracks</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-[#2563EB]" />
                    <span>Encrypted privacy lock gate</span>
                  </div>
                </div>
              </div>

              <div className="border-t border-[#EAEAEA] pt-6 flex items-center justify-between">
                <div>
                  <span className="block text-[10px] font-mono text-neutral-400 leading-none">Bespoke Price</span>
                  <span className="font-mono text-xl text-[#111111] font-semibold mt-1 block">$149.00 USD</span>
                </div>
                <button
                  onClick={() => setBuilderOpen(true)}
                  className="bg-[#111111] text-white text-[10px] font-semibold uppercase tracking-wider py-2.5 px-6 rounded-full hover:bg-[#2563EB] transition-colors"
                >
                  Custom build
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
