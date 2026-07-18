import React, { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Mail, Check, ArrowRight } from 'lucide-react';

export default function Newsletter() {
  const [email, setEmail] = useState('');
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (email) {
      setSubmitted(true);
      setTimeout(() => {
        setEmail('');
      }, 3000);
    }
  };

  return (
    <section className="py-24 bg-[#FAFAFA] border-b border-[#EAEAEA] relative overflow-hidden">
      {/* Subtle clean background ornament */}
      <div className="absolute inset-0 pointer-events-none opacity-20">
        <div className="absolute -bottom-24 -right-24 w-96 h-96 rounded-full border border-[#EAEAEA]" />
      </div>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10 text-center space-y-8">
        
        <div className="space-y-2.5">
          <span className="text-[10px] font-mono text-accent uppercase tracking-widest font-semibold block">
            Curation Logbook
          </span>
          <h2 className="font-sans text-3xl md:text-4xl tracking-tight text-[#111111] font-semibold">
            The Memory Bulletin
          </h2>
          <p className="text-sm text-[#666666] max-w-lg mx-auto leading-relaxed font-light">
            Subscribe to receive aesthetic layout releases, private design journals, and early previews of our bespoke interactive spaces.
          </p>
        </div>

        <div className="max-w-md mx-auto">
          <AnimatePresence mode="wait">
            {!submitted ? (
              <motion.form
                key="newsletter-form"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                onSubmit={handleSubmit}
                className="flex flex-col sm:flex-row items-stretch gap-2"
              >
                <div className="relative flex-1">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-neutral-400" />
                  <input
                    id="newsletter-email"
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Enter your email address"
                    className="w-full pl-11 pr-4 py-3.5 bg-white border border-[#EAEAEA] rounded-full text-xs text-[#111111] placeholder-[#A1A1A1] focus:outline-hidden focus:border-[#111111] transition-all font-sans"
                  />
                </div>
                <button
                  type="submit"
                  id="newsletter-submit-btn"
                  className="bg-[#2563EB] text-white text-xs font-semibold py-3.5 px-8 rounded-full hover:bg-blue-700 transition-colors flex items-center justify-center space-x-2 whitespace-nowrap uppercase tracking-wider"
                >
                  <span>Subscribe</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </motion.form>
            ) : (
              <motion.div
                key="newsletter-success"
                initial={{ opacity: 0, scale: 0.98 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className="bg-white border border-[#EAEAEA] rounded-xl p-6 text-center space-y-3 shadow-xs"
              >
                <div className="w-10 h-10 rounded-full bg-green-50 text-green-600 flex items-center justify-center mx-auto border border-green-100">
                  <Check className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-sans font-semibold text-sm text-[#111111]">Subscription Registered</h4>
                  <p className="text-xs text-[#666666] mt-1">You are now queued for early premium layout drops.</p>
                </div>
                <button
                  onClick={() => setSubmitted(false)}
                  className="text-[10px] font-mono text-accent uppercase tracking-widest hover:underline"
                >
                  Register another address
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="text-[10px] text-neutral-400 font-mono">
          We honor your privacy. Zero spam. Securely unregister at any time.
        </div>

      </div>
    </section>
  );
}
