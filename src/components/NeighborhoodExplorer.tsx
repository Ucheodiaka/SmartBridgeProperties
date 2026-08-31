import React from 'react';
import { MapPin, Shield, Droplet, ArrowRight } from 'lucide-react';
import { NEIGHBORHOODS } from '../data/properties';

interface NeighborhoodExplorerProps {
  onSelectNeighborhood: (name: string) => void;
}

export const NeighborhoodExplorer: React.FC<NeighborhoodExplorerProps> = ({
  onSelectNeighborhood,
}) => {
  return (
    <section className="py-12 sm:py-16 md:py-24 lg:py-28 px-4 sm:px-6 md:px-12 lg:px-16 max-w-[1280px] mx-auto">
      <div className="flex flex-col md:flex-row justify-between md:items-end gap-3 sm:gap-4 mb-8 sm:mb-12">
        <div>
          <span className="text-xs font-bold text-[#735c00] uppercase tracking-wider block mb-1.5 sm:mb-2">
            Prime Residential Enclaves
          </span>
          <h2 className="font-playfair text-2xl sm:text-3xl md:text-4xl font-bold text-[#1b1c1c] tracking-tight">
            Explore Port Harcourt Neighborhoods
          </h2>
          <p className="text-sm sm:text-base text-[#404944] mt-1 sm:mt-2 max-w-2xl">
            Detailed security ratings, infrastructure metrics, and average property valuations across Rivers State.
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
        {NEIGHBORHOODS.map((nh) => (
          <div
            key={nh.name}
            onClick={() => onSelectNeighborhood(nh.name)}
            className="group bg-white rounded-xl overflow-hidden border border-[#bfc9c3]/30 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col cursor-pointer"
          >
            {/* Image Header */}
            <div className="relative h-44 overflow-hidden bg-[#e4e2e1]">
              <img
                src={nh.image}
                alt={nh.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#003527]/90 via-[#003527]/30 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3 text-white">
                <h3 className="font-playfair text-xl font-bold">{nh.name}</h3>
              </div>
            </div>

            {/* Content & Metrics */}
            <div className="p-5 flex-1 flex flex-col justify-between">
              <p className="text-xs text-[#404944] line-clamp-2 mb-4 leading-relaxed">
                {nh.description}
              </p>

              <div className="space-y-2.5 pt-3 border-t border-[#bfc9c3]/30 text-xs">
                <div className="flex justify-between items-center">
                  <span className="text-[#707974] flex items-center gap-1">
                    <Shield className="w-3.5 h-3.5 text-[#003527]" /> Security
                  </span>
                  <span className="font-bold text-[#003527]">{nh.securityRating}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[#707974] flex items-center gap-1">
                    <Droplet className="w-3.5 h-3.5 text-[#2b6954]" /> Flood Index
                  </span>
                  <span className="font-semibold text-[#1b1c1c]">{nh.floodRating}</span>
                </div>
                <div className="flex justify-between items-center pt-1">
                  <span className="text-[#707974]">Avg. Rent:</span>
                  <span className="font-bold text-[#745c00]">{nh.avgRentPrice}</span>
                </div>
              </div>

              <div className="mt-4 pt-3 flex items-center justify-between text-xs font-bold text-[#003527] group-hover:text-[#064e3b]">
                <span>View Listings</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
};
