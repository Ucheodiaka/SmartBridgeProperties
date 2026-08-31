import React from 'react';
import { X, ShieldCheck, FileCheck, SearchCheck, CheckCircle2, Award, Landmark, MapPin, ArrowRight } from 'lucide-react';

interface AboutProcessModalProps {
  onClose: () => void;
  onBrowseProperties: () => void;
  onListProperty: () => void;
}

export const AboutProcessModal: React.FC<AboutProcessModalProps> = ({
  onClose,
  onBrowseProperties,
  onListProperty,
}) => {
  const steps = [
    {
      step: '01',
      title: 'Title & Land Registry Search',
      description: 'Our legal partners conduct searches directly with the Rivers State Ministry of Lands & Survey to confirm C of O, Governor’s Consent, or registered Deeds of Conveyance before listing.',
      icon: Landmark,
    },
    {
      step: '02',
      title: 'Physical Structural & Topography Inspection',
      description: 'Our licensed Port Harcourt engineers visit the site to test structural concrete integrity, roof water-proofing, earthing systems, and elevation relative to arterial drainage.',
      icon: SearchCheck,
    },
    {
      step: '03',
      title: 'Utility & Infrastructure Stress Test',
      description: 'We evaluate power transformer feeder stability, generator load capacity, borehole filtration assays, and estate gate security protocols.',
      icon: ShieldCheck,
    },
    {
      step: '04',
      title: 'Transparent Pricing & Agency Fees',
      description: 'No inflated middleman prices or unexpected hidden inspection fees. Direct, standardized pricing signed off by property owners.',
      icon: FileCheck,
    },
    {
      step: '05',
      title: 'Guaranteed Physical Viewings & Handover',
      description: 'You are accompanied by a certified SmartBridge Port Harcourt specialist who knows the neighborhood history, access routes, and title documentation inside out.',
      icon: Award,
    },
  ];

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-[#FCF9F2] w-full max-w-4xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/40 flex flex-col max-h-[95vh] sm:max-h-[90vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="sticky top-0 z-20 bg-[#fbf9f8]/95 backdrop-blur-md px-4 sm:px-6 py-4 sm:py-5 border-b border-[#bfc9c3]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 sm:w-6 h-5 sm:h-6 text-[#003527]" />
            <h2 className="font-playfair text-lg sm:text-xl md:text-2xl font-bold text-[#003527]">
              The Port Harcourt Standard
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-[#003527] text-white hover:bg-[#064e3b] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>

        {/* Scrollable Content */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* Mission Hero Banner */}
          <div className="bg-[#003527] text-white p-5 sm:p-8 rounded-xl sm:rounded-2xl relative overflow-hidden">
            <div className="relative z-10 max-w-2xl">
              <span className="text-[10px] sm:text-xs font-bold text-[#fed65b] uppercase tracking-wider block mb-1.5 sm:mb-2">
                Our Guarantee to You
              </span>
              <h3 className="font-playfair text-xl sm:text-2xl md:text-3xl font-bold mb-2.5 sm:mb-4">
                Redefining real estate trust across Port Harcourt.
              </h3>
              <p className="text-xs sm:text-sm md:text-base text-white/90 leading-relaxed font-normal">
                Real estate in Port Harcourt shouldn’t be a gamble. SmartBridge Properties was founded to solve false listings, unverified ownership claims, and hidden property defects through strict physical engineering verification.
              </p>
            </div>
            <div className="absolute right-0 bottom-0 opacity-10 pointer-events-none translate-x-12 translate-y-12">
              <ShieldCheck className="w-72 h-72 text-white" />
            </div>
          </div>

          {/* 5-Step Protocol */}
          <div>
            <h4 className="text-base font-bold text-[#1b1c1c] uppercase tracking-wider mb-6">
              Our 5-Step Physical Verification Protocol
            </h4>
            <div className="space-y-4">
              {steps.map((s) => {
                const Icon = s.icon;
                return (
                  <div
                    key={s.step}
                    className="p-5 rounded-xl bg-white border border-[#bfc9c3]/30 shadow-xs flex items-start gap-4"
                  >
                    <div className="w-10 h-10 rounded-lg bg-[#003527]/10 text-[#003527] flex items-center justify-center font-bold text-sm shrink-0">
                      {s.step}
                    </div>
                    <div>
                      <h5 className="font-bold text-base text-[#1b1c1c] mb-1 flex items-center gap-2">
                        {s.title}
                      </h5>
                      <p className="text-xs md:text-sm text-[#404944] leading-relaxed">
                        {s.description}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Local Office Presence */}
          <div className="bg-[#f0eded] p-6 rounded-xl border border-[#bfc9c3]/30 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-[#003527] text-white flex items-center justify-center shrink-0">
                <MapPin className="w-5 h-5 text-[#fed65b]" />
              </div>
              <div>
                <p className="text-xs text-[#707974] font-semibold uppercase">Head Office</p>
                <p className="text-sm font-bold text-[#1b1c1c]">
                  GRA Phase 2, Port Harcourt, Rivers State, Nigeria.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  onClose();
                  onBrowseProperties();
                }}
                className="bg-[#003527] text-white text-xs md:text-sm font-semibold px-5 py-3 rounded-lg hover:bg-[#064e3b] transition-all cursor-pointer"
              >
                Browse Verified Properties
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
