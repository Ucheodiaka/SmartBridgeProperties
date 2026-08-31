import React from 'react';
import { ShieldCheck, Award, Eye, Clock } from 'lucide-react';

export const TrustStats: React.FC = () => {
  const stats = [
    {
      number: '500+',
      label: 'Listings Reviewed',
      subtext: 'Rigorous title & condition audits',
      icon: ShieldCheck,
    },
    {
      number: 'Top',
      label: 'PH Specialists',
      subtext: 'Local Port Harcourt engineers',
      icon: Award,
    },
    {
      number: '100%',
      label: 'Direct Inspection',
      subtext: 'Every home visited in-person',
      icon: Eye,
    },
    {
      number: '24/7',
      label: 'Local Support',
      subtext: 'Direct on-ground assistance',
      icon: Clock,
    },
  ];

  return (
    <section className="bg-[#fbf9f8] border-y border-[#bfc9c3]/30 py-8 sm:py-12 md:py-16">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6 md:gap-8">
          {stats.map((stat) => {
            const Icon = stat.icon;
            return (
              <div
                key={stat.label}
                className="flex flex-col items-center text-center p-3 sm:p-4 rounded-xl bg-white/60 sm:bg-transparent border border-[#bfc9c3]/30 sm:border-0"
              >
                <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-full bg-[#003527]/5 text-[#003527] flex items-center justify-center mb-2 sm:mb-3">
                  <Icon className="w-4 h-4 sm:w-5 sm:h-5 text-[#003527]" />
                </div>
                <p className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#003527] mb-1 tracking-tight">
                  {stat.number}
                </p>
                <p className="text-[11px] sm:text-xs md:text-sm font-bold text-[#404944] uppercase tracking-wider mb-0.5">
                  {stat.label}
                </p>
                <p className="text-[11px] sm:text-xs text-[#707974] hidden sm:block">
                  {stat.subtext}
                </p>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
};
