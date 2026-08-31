import React, { useState } from 'react';
import { Search, MapPin, Home, BedDouble, ArrowRight } from 'lucide-react';
import { FilterState, ListingType, PropertyType } from '../types';

interface HeroProps {
  onSearch: (filters: Partial<FilterState>) => void;
  onOpenListProperty: () => void;
  onBrowseAll: () => void;
}

export const Hero: React.FC<HeroProps> = ({ onSearch, onOpenListProperty, onBrowseAll }) => {
  const [activeTab, setActiveTab] = useState<ListingType>('rent');
  const [location, setLocation] = useState('');
  const [propertyType, setPropertyType] = useState<PropertyType | 'Any Type'>('Any Type');
  const [bedrooms, setBedrooms] = useState('Any');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch({
      type: activeTab,
      location: location.trim(),
      propertyType: propertyType,
      bedrooms: bedrooms,
    });
  };

  const handleQuickLocation = (locName: string) => {
    setLocation(locName);
    onSearch({
      type: activeTab,
      location: locName,
      propertyType: propertyType,
      bedrooms: bedrooms,
    });
  };

  return (
    <section className="relative min-h-[85vh] lg:min-h-[90vh] flex items-center pt-12 pb-20 sm:pt-16 sm:pb-24 md:py-28 overflow-hidden">
      {/* Background Image with Heritage Green Overlay */}
      <div className="absolute inset-0 z-0">
        <div className="absolute inset-0 bg-[#003527]/75 mix-blend-multiply z-10" />
        <img
          src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnM3MYULmJ4ZEJl9XEr61oKVlBvSTqv3aqb1s6jID-b8Npnv_qcaRB9ko4FrkCv1DvYqNK1TyE6tdjPD0B4ZS2Gs8O2ZyAM8_YuCNHmV-_o2ax9ggP6AJ1o98KsYr6U4JVPQw4GklZnFyXZLRQVjSjIc8Ze_n3-etnAVPRqsgHJ4tFjqBkm0C2EOAVSYYwWoX6cRJk-evBjH86EWmjefI5olKsClrdgeLRQeVejHh_Z8nhO_EWtHOR"
          alt="River Villa luxury estate background in Port Harcourt"
          className="w-full h-full object-cover object-center scale-105 transition-transform duration-1000"
        />
        {/* Subtle bottom gradient to blend smoothly */}
        <div className="absolute bottom-0 inset-x-0 h-24 bg-gradient-to-t from-[#002117]/80 to-transparent z-15 pointer-events-none" />
      </div>

      <div className="relative z-20 w-full max-w-[1280px] mx-auto px-4 sm:px-6 md:px-12 lg:px-16 flex flex-col lg:flex-row gap-8 sm:gap-12 lg:gap-16 items-center">
        {/* Hero Left Content */}
        <div className="w-full lg:w-1/2 text-white">
          <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-white/15 backdrop-blur-md border border-white/20 text-[11px] sm:text-xs md:text-sm font-semibold mb-4 sm:mb-6 uppercase tracking-wider text-[#ffe088] shadow-sm max-w-full">
            <span className="w-2 h-2 rounded-full bg-[#fed65b] animate-pulse shrink-0" />
            <span className="truncate">PORT HARCOURT’S TRUSTED PROPERTY MARKETPLACE</span>
          </div>

          <h1 className="font-playfair text-3xl sm:text-4xl md:text-5xl lg:text-[54px] font-bold text-white mb-4 sm:mb-6 leading-[1.15] tracking-tight">
            Find a property that feels like home.
          </h1>

          <p className="text-sm sm:text-base md:text-lg text-white/90 mb-6 sm:mb-10 max-w-xl font-normal leading-relaxed">
            Discover meticulously reviewed homes across Port Harcourt. We bring transparency and premium service to your real estate journey.
          </p>

          <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 items-stretch sm:items-center">
            <button
              id="hero-browse-button"
              onClick={onBrowseAll}
              className="w-full sm:w-auto bg-[#fed65b] text-[#241a00] font-semibold text-sm md:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-[10px] transition-all duration-200 hover:-translate-y-1 hover:shadow-lg hover:bg-[#ffe088] cursor-pointer inline-flex items-center justify-center gap-2 min-h-[44px]"
            >
              Browse Properties
              <ArrowRight className="w-4 h-4" />
            </button>
            <button
              id="hero-list-property-button"
              onClick={onOpenListProperty}
              className="w-full sm:w-auto border-[1.5px] border-white/90 text-white font-semibold text-sm md:text-base px-6 sm:px-8 py-3.5 sm:py-4 rounded-[10px] transition-all duration-200 hover:bg-white/15 hover:border-white cursor-pointer inline-flex items-center justify-center gap-2 min-h-[44px]"
            >
              List Your Property
            </button>
          </div>

          {/* Quick neighborhood search hints */}
          <div className="mt-8 sm:mt-10 pt-4 sm:pt-6 border-t border-white/20 flex flex-wrap items-center gap-1.5 sm:gap-2 text-xs text-white/80">
            <span className="font-medium text-white/60 w-full sm:w-auto">Popular in PH:</span>
            {['GRA Phase 2', 'Peter Odili Road', 'Woji', 'Old GRA', 'Golf Estate'].map((loc) => (
              <button
                key={loc}
                onClick={() => handleQuickLocation(loc)}
                className="px-2.5 py-1 rounded-md bg-white/10 hover:bg-white/25 text-white/90 hover:text-white transition-colors cursor-pointer text-xs min-h-[32px] flex items-center"
              >
                {loc}
              </button>
            ))}
          </div>
        </div>

        {/* Hero Right: Glass Search Panel */}
        <div className="w-full lg:w-1/2">
          <div className="glass-panel p-4 sm:p-6 md:p-8 rounded-2xl shadow-2xl relative border border-white/40">
            {/* Rent / Buy Toggle Tabs */}
            <div className="flex gap-6 mb-4 sm:mb-6 border-b border-[#bfc9c3]/40 pb-2.5 sm:pb-3">
              <button
                type="button"
                id="search-tab-rent"
                onClick={() => setActiveTab('rent')}
                className={`text-sm md:text-base font-bold pb-2 px-1 relative transition-all cursor-pointer ${
                  activeTab === 'rent'
                    ? 'text-[#003527]'
                    : 'text-[#404944] hover:text-[#003527]'
                }`}
              >
                Rent
                {activeTab === 'rent' && (
                  <span className="absolute bottom-[-1px] left-0 w-full h-[2.5px] bg-[#003527] rounded-full" />
                )}
              </button>
              <button
                type="button"
                id="search-tab-buy"
                onClick={() => setActiveTab('sale')}
                className={`text-sm md:text-base font-bold pb-2 px-1 relative transition-all cursor-pointer ${
                  activeTab === 'sale'
                    ? 'text-[#003527]'
                    : 'text-[#404944] hover:text-[#003527]'
                }`}
              >
                Buy
                {activeTab === 'sale' && (
                  <span className="absolute bottom-[-1px] left-0 w-full h-[2.5px] bg-[#003527] rounded-full" />
                )}
              </button>
            </div>

            {/* Search Form */}
            <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
              {/* Location Input */}
              <div className="col-span-1 md:col-span-2">
                <label className="block text-xs font-bold text-[#1b1c1c] mb-2 uppercase tracking-wider">
                  Location in Port Harcourt
                </label>
                <div className="relative">
                  <MapPin className="w-5 h-5 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707974]" />
                  <input
                    id="search-location-input"
                    type="text"
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    placeholder="e.g. GRA Phase 2, Peter Odili Road, Woji"
                    className="w-full pl-11 pr-4 py-3.5 rounded-lg border border-[#bfc9c3] bg-white/80 focus:bg-white focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20 transition-all text-[#1b1c1c] placeholder:text-[#707974] text-sm font-medium"
                  />
                </div>
              </div>

              {/* Property Type Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-2 uppercase tracking-wider">
                  Property Type
                </label>
                <div className="relative">
                  <Home className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707974] pointer-events-none" />
                  <select
                    id="search-property-type-select"
                    value={propertyType}
                    onChange={(e) => setPropertyType(e.target.value as PropertyType | 'Any Type')}
                    className="w-full pl-10 pr-4 py-3.5 rounded-lg border border-[#bfc9c3] bg-white/80 focus:bg-white focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20 transition-all text-[#1b1c1c] text-sm font-medium cursor-pointer"
                  >
                    <option value="Any Type">Any Type</option>
                    <option value="Apartment">Apartment</option>
                    <option value="Duplex">Duplex</option>
                    <option value="Terrace">Terrace</option>
                    <option value="Penthouse">Penthouse</option>
                    <option value="Mansion">Mansion</option>
                  </select>
                </div>
              </div>

              {/* Bedrooms Dropdown */}
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-2 uppercase tracking-wider">
                  Bedrooms
                </label>
                <div className="relative">
                  <BedDouble className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-[#707974] pointer-events-none" />
                  <select
                    id="search-bedrooms-select"
                    value={bedrooms}
                    onChange={(e) => setBedrooms(e.target.value)}
                    className="w-full pl-10 pr-4 py-3.5 rounded-lg border border-[#bfc9c3] bg-white/80 focus:bg-white focus:border-[#003527] focus:ring-2 focus:ring-[#003527]/20 transition-all text-[#1b1c1c] text-sm font-medium cursor-pointer"
                  >
                    <option value="Any">Any Bedrooms</option>
                    <option value="1+">1+ Bed</option>
                    <option value="2+">2+ Beds</option>
                    <option value="3+">3+ Beds</option>
                    <option value="4+">4+ Beds</option>
                    <option value="5+">5+ Beds</option>
                  </select>
                </div>
              </div>

              {/* Search Action Button */}
              <div className="col-span-1 md:col-span-2 mt-2">
                <button
                  id="search-submit-button"
                  type="submit"
                  className="w-full bg-[#003527] text-white font-semibold text-base py-4 px-6 rounded-[10px] hover:bg-[#064e3b] transition-all duration-200 hover:shadow-lg flex items-center justify-center gap-2 cursor-pointer"
                >
                  <Search className="w-5 h-5 text-[#fed65b]" />
                  Search Properties
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </section>
  );
};
