import React from 'react';
import { ArrowUpRight, Building2, Phone, Sparkles } from 'lucide-react';
import { BusinessPromotion } from '../types';

interface BusinessPromotionsSectionProps {
  promotions: BusinessPromotion[];
}

export const BusinessPromotionsSection: React.FC<BusinessPromotionsSectionProps> = ({ promotions }) => {
  if (promotions.length === 0) return null;

  const openPromotion = (promotion: BusinessPromotion) => {
    if (promotion.linkUrl) {
      window.open(promotion.linkUrl, '_blank', 'noopener,noreferrer');
    } else if (promotion.phone) {
      window.location.href = `tel:${promotion.phone.replace(/\s+/g, '')}`;
    }
  };

  return (
    <section className="px-4 sm:px-6 md:px-12 lg:px-16 max-w-[1280px] mx-auto py-10 sm:py-12">
      <div className="rounded-3xl bg-[#003527] px-5 py-7 sm:p-8 md:p-10 overflow-hidden relative">
        <div className="absolute -right-20 -top-24 w-64 h-64 rounded-full bg-[#fed65b]/10" />
        <div className="relative flex flex-col md:flex-row md:items-end md:justify-between gap-3 mb-7">
          <div>
            <span className="inline-flex items-center gap-2 text-[#fed65b] text-xs font-bold uppercase tracking-wider">
              <Sparkles className="w-4 h-4" /> Property Services & Partners
            </span>
            <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-white mt-2">
              More Than Property Listings
            </h2>
            <p className="text-sm sm:text-base text-white/70 mt-2 max-w-2xl">
              Discover trusted property management, consulting, valuation and professional real estate support.
            </p>
          </div>
        </div>

        <div className="relative grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {promotions.map((promotion) => (
            <article key={promotion.id} className="bg-white rounded-2xl p-5 flex flex-col min-h-[250px] shadow-lg">
              <div className="flex items-start gap-4">
                <div className="w-16 h-16 rounded-2xl bg-[#f4f1e9] border border-[#bfc9c3]/40 overflow-hidden shrink-0 flex items-center justify-center">
                  {promotion.imageUrl ? (
                    <img src={promotion.imageUrl} alt={`${promotion.businessName} logo`} className="w-full h-full object-cover" />
                  ) : (
                    <Building2 className="w-8 h-8 text-[#003527]" />
                  )}
                </div>
                <div className="min-w-0">
                  <span className="inline-block text-[10px] font-bold uppercase tracking-wide text-[#735c00] bg-[#fed65b]/30 rounded-full px-2 py-1">
                    {promotion.category}
                  </span>
                  <h3 className="font-playfair text-xl font-bold text-[#003527] mt-2 leading-tight">
                    {promotion.businessName}
                  </h3>
                </div>
              </div>

              <p className="text-sm text-[#58615c] leading-relaxed mt-4 line-clamp-4">
                {promotion.description}
              </p>

              {(promotion.linkUrl || promotion.phone) && (
                <button
                  type="button"
                  onClick={() => openPromotion(promotion)}
                  className="mt-auto pt-5 inline-flex items-center justify-between gap-3 text-sm font-bold text-[#003527] cursor-pointer hover:text-[#735c00]"
                >
                  <span className="inline-flex items-center gap-2">
                    {promotion.phone && !promotion.linkUrl ? <Phone className="w-4 h-4" /> : null}
                    {promotion.ctaLabel}
                  </span>
                  <ArrowUpRight className="w-4 h-4" />
                </button>
              )}
            </article>
          ))}
        </div>
      </div>
    </section>
  );
};
