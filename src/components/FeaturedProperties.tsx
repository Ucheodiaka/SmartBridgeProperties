import React from 'react';
import { ArrowRight, Sparkles } from 'lucide-react';
import { Property } from '../types';
import { PropertyCard } from './PropertyCard';
import { PropertyCardSkeleton } from './skeletons/PropertyCardSkeleton';

interface FeaturedPropertiesProps {
  properties: Property[];
  onSelectProperty: (property: Property) => void;
  onViewAll: () => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  isLoading?: boolean;
}

export const FeaturedProperties: React.FC<FeaturedPropertiesProps> = ({
  properties,
  onSelectProperty,
  onViewAll,
  savedIds,
  onToggleSave,
  isLoading = false,
}) => {
  const featured = properties.filter((p) => p.isFeatured).slice(0, 3);

  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-28 px-4 sm:px-6 md:px-12 lg:px-16 max-w-[1280px] mx-auto">
      {/* Section Header */}
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div>
          <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#735c00] uppercase tracking-wider mb-1.5 sm:mb-2">
            <Sparkles className="w-4 h-4 text-[#d4af37]" />
            Handpicked Portfolio
          </div>
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#1b1c1c] tracking-tight">
            Featured Properties
          </h2>
          <p className="text-sm sm:text-base text-[#404944] mt-1 sm:mt-2 font-normal">
            Curated listings meeting The Port Harcourt Standard.
          </p>
        </div>

        <button
          id="featured-view-all-button"
          onClick={onViewAll}
          className="hidden md:inline-flex items-center gap-2 text-sm font-semibold text-[#735c00] hover:text-[#003527] px-4 py-2 rounded-lg transition-colors cursor-pointer group"
        >
          View All Properties
          <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
        </button>
      </div>

      {/* 3-Column Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
        {isLoading ? (
          <>
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
            <PropertyCardSkeleton />
          </>
        ) : (
          featured.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
              isSaved={savedIds.includes(property.id)}
              onToggleSave={onToggleSave}
            />
          ))
        )}
      </div>

      {/* Mobile View All CTA */}
      <div className="mt-10 text-center md:hidden">
        <button
          onClick={onViewAll}
          className="w-full border-[1.5px] border-[#003527] text-[#003527] font-semibold text-sm py-3.5 px-6 rounded-[10px] hover:bg-[#003527]/5 transition-colors cursor-pointer flex items-center justify-center gap-2"
        >
          View All Properties
          <ArrowRight className="w-4 h-4" />
        </button>
      </div>
    </section>
  );
};
