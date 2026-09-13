import React, { useMemo } from 'react';
import { ArrowRight, Building2, Home, MapPin } from 'lucide-react';
import { Property } from '../types';

interface NeighborhoodExplorerProps {
  properties: Property[];
  onSelectNeighborhood: (name: string) => void;
}

export const NeighborhoodExplorer: React.FC<NeighborhoodExplorerProps> = ({
  properties,
  onSelectNeighborhood,
}) => {
  const neighborhoods = useMemo(() => {
    const grouped = new Map<string, Property[]>();

    properties.forEach((property) => {
      // The submitted location is the authoritative public area for each
      // listing; older records may contain a generic neighbourhood fallback.
      const name = property.location?.trim() || property.neighborhood?.trim();
      if (!name) return;
      grouped.set(name, [...(grouped.get(name) || []), property]);
    });

    return Array.from(grouped.entries())
      .map(([name, listings]) => ({
        name,
        listings,
        image: listings.find((listing) => listing.images?.[0])?.images[0] || '',
        saleCount: listings.filter((listing) => listing.type === 'sale').length,
        rentCount: listings.filter((listing) => listing.type === 'rent').length,
      }))
      .sort((a, b) => b.listings.length - a.listings.length || a.name.localeCompare(b.name));
  }, [properties]);

  if (neighborhoods.length === 0) return null;

  return (
    <section className="pt-6 pb-12 sm:pt-8 sm:pb-16 md:pt-10 md:pb-20 px-4 sm:px-6 md:px-12 lg:px-16 max-w-[1280px] mx-auto">
      <div className="mb-7 sm:mb-9">
        <span className="text-xs font-bold text-[#735c00] uppercase tracking-wider block mb-1.5">
          Browse by Location
        </span>
        <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#1b1c1c] tracking-tight">
          Explore Properties by Neighbourhood
        </h2>
        <p className="text-sm sm:text-base text-[#404944] mt-2 max-w-2xl">
          These neighbourhoods are generated from properties currently available on SmartBridge.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {neighborhoods.map((neighborhood) => (
          <button
            type="button"
            key={neighborhood.name}
            onClick={() => onSelectNeighborhood(neighborhood.name)}
            className="group bg-white rounded-xl overflow-hidden border border-[#bfc9c3]/30 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer text-left"
          >
            <div className="relative h-44 overflow-hidden bg-[#e4e2e1]">
              {neighborhood.image ? (
                <img
                  src={neighborhood.image}
                  alt={`${neighborhood.name} property`}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center text-[#607067]">
                  <Building2 className="w-12 h-12" />
                </div>
              )}
              <div className="absolute inset-0 bg-gradient-to-t from-[#003527]/90 via-[#003527]/25 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-playfair text-xl font-bold">{neighborhood.name}</h3>
              </div>
            </div>

            <div className="p-5 w-full flex-1 flex flex-col">
              <p className="text-sm font-bold text-[#003527]">
                {neighborhood.listings.length} {neighborhood.listings.length === 1 ? 'property' : 'properties'} available
              </p>

              <div className="mt-4 pt-3 border-t border-[#bfc9c3]/30 text-xs space-y-2">
                <div className="flex justify-between items-center">
                  <span className="text-[#707974] flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> Location</span>
                  <span className="font-bold text-[#003527]">Port Harcourt</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#707974] flex items-center gap-1"><Home className="w-3.5 h-3.5" /> Listings</span>
                  <span className="font-semibold text-[#404944]">{neighborhood.saleCount} sale · {neighborhood.rentCount} rent</span>
                </div>
              </div>

              <div className="mt-auto pt-4 flex items-center justify-between text-xs font-bold text-[#003527] group-hover:text-[#064e3b]">
                <span>View Properties</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </button>
        ))}
      </div>
    </section>
  );
};
