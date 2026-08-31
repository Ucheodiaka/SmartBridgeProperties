import React from 'react';
import { CheckCircle2, ShieldCheck, FileCheck, Landmark, ArrowRight } from 'lucide-react';

interface TrustVerificationSectionProps {
  onLearnMore: () => void;
}

export const TrustVerificationSection: React.FC<TrustVerificationSectionProps> = ({
  onLearnMore,
}) => {
  const pillars = [
    {
      title: 'Physical Verification',
      description: 'We visit every property in person to audit structural integrity, plumbing, and flood risk before it goes live.',
      icon: ShieldCheck,
    },
    {
      title: 'Transparent Pricing',
      description: 'No hidden agency markups, unverified inspection fees, or unexpected closing surprises.',
      icon: Landmark,
    },
    {
      title: 'Secure Documentation',
      description: 'We independently verify titles, C of O, and Deeds with the Rivers State Ministry of Lands & Survey.',
      icon: FileCheck,
    },
  ];

  return (
    <section className="bg-[#f6f3f2] py-12 sm:py-16 md:py-24 lg:py-28 border-y border-[#bfc9c3]/20">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 flex flex-col lg:flex-row items-center gap-10 md:gap-16">
        {/* Left Side: Image with Badge */}
        <div className="w-full lg:w-1/2 relative">
          {/* Subtle decorative rotated backdrop */}
          <div className="absolute -inset-4 bg-[#b0f0d6]/30 rounded-2xl transform -rotate-2 hidden sm:block pointer-events-none" />

          {/* Photo */}
          <div className="relative rounded-2xl overflow-hidden shadow-2xl border border-white/60 bg-[#e4e2e1]">
            <img
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuDQGcdW5y2zUr_eaEadYzfhjB6pdaO60NHCzegoqQa-HS_PFU5m13SDde_-tN1r7rNFmxSr-bSZdAHkFIFAE4Z_MqjiEk3nev4rAGRTPxIwFJJ8j_8mmLYH6G4Bcxe4jpeshDtJSYqryTxIWcC6qnmakl3ugNTAIj_ZEWdcKKMU0VS30prKeAYRDc2RuV7PEAD40HgZ1qcbGPaSl8i7tBLwI5PRFR-XcK3QB2vcbw6nGDyL8O9pk_ui"
              alt="SmartBridge local Port Harcourt inspectors verifying property with client"
              className="w-full object-cover aspect-[1.45] hover:scale-102 transition-transform duration-700"
            />
          </div>

          {/* Floating 100% Verified Badge */}
          <div className="absolute bottom-2 right-2 sm:-bottom-6 sm:-right-4 md:-right-6 bg-white p-3.5 sm:p-5 md:p-6 rounded-xl sm:rounded-2xl shadow-[0_8px_24px_rgba(0,53,39,0.14)] border border-[#bfc9c3]/30 flex items-center gap-3 sm:gap-4 z-20">
            <div className="bg-[#fed65b] text-[#745c00] p-2.5 sm:p-3 rounded-lg sm:rounded-xl shadow-xs">
              <ShieldCheck className="w-5 h-5 sm:w-6 sm:h-6" />
            </div>
            <div>
              <p className="font-bold text-xs sm:text-sm md:text-base text-[#1b1c1c] leading-tight">
                100% Verified
              </p>
              <p className="text-[10px] sm:text-xs text-[#707974] font-medium">
                Local Port Harcourt Experts
              </p>
            </div>
          </div>
        </div>

        {/* Right Side: Verification Value Proposition */}
        <div className="w-full lg:w-1/2 pt-4 sm:pt-6 lg:pt-0">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003527]/10 text-xs font-bold text-[#003527] uppercase tracking-wider mb-3 sm:mb-4">
            <ShieldCheck className="w-3.5 h-3.5 text-[#003527]" />
            The Port Harcourt Standard
          </div>

          <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl lg:text-[40px] font-bold text-[#1b1c1c] mb-4 sm:mb-6 leading-[1.2] tracking-tight">
            Property search should feel clear—not risky.
          </h2>

          <p className="text-sm sm:text-base md:text-lg text-[#404944] mb-6 sm:mb-8 font-normal leading-relaxed">
            We understand the nuances of the Port Harcourt market. Every listing on SmartBridge Properties undergoes a rigorous physical inspection by our local team to ensure what you see online matches reality.
          </p>

          <ul className="space-y-4 sm:space-y-5 mb-8 sm:mb-10">
            {pillars.map((pillar) => {
              const Icon = pillar.icon;
              return (
                <li key={pillar.title} className="flex items-start gap-3 sm:gap-4">
                  <div className="w-5 h-5 sm:w-6 sm:h-6 rounded-full bg-[#003527]/10 text-[#003527] flex items-center justify-center shrink-0 mt-0.5">
                    <CheckCircle2 className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-[#003527]" />
                  </div>
                  <div>
                    <p className="text-sm md:text-base font-bold text-[#1b1c1c]">
                      {pillar.title}
                    </p>
                    <p className="text-xs md:text-sm text-[#404944] mt-0.5 leading-normal">
                      {pillar.description}
                    </p>
                  </div>
                </li>
              );
            })}
          </ul>

          <div className="flex flex-wrap items-center gap-4">
            <button
              id="trust-learn-more-button"
              onClick={onLearnMore}
              className="w-full sm:w-auto bg-[#003527] text-white font-semibold text-sm md:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-[10px] hover:bg-[#064e3b] transition-all duration-200 hover:-translate-y-0.5 hover:shadow-lg cursor-pointer inline-flex items-center justify-center gap-2 min-h-[44px]"
            >
              Learn About Our Process
              <ArrowRight className="w-4 h-4 text-[#fed65b]" />
            </button>
          </div>
        </div>
      </div>
    </section>
  );
};
