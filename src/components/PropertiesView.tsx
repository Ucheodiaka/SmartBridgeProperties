import React, { useState, useMemo, useEffect } from 'react';
import { Search, Filter, SlidersHorizontal, MapPin, CheckCircle2, RotateCcw, Building, Sparkles } from 'lucide-react';
import { Property, FilterState, ListingType, PropertyType } from '../types';
import { PropertyCard } from './PropertyCard';
import { PropertiesGridSkeleton } from './skeletons/PropertiesGridSkeleton';

interface PropertiesViewProps {
  properties: Property[];
  initialFilters: FilterState;
  onSelectProperty: (property: Property) => void;
  savedIds: string[];
  onToggleSave: (id: string) => void;
  showSavedOnly?: boolean;
}

export const PropertiesView: React.FC<PropertiesViewProps> = ({
  properties,
  initialFilters,
  onSelectProperty,
  savedIds,
  onToggleSave,
  showSavedOnly = false,
}) => {
  const [filters, setFilters] = useState<FilterState>(initialFilters);
  const [showFilterDrawer, setShowFilterDrawer] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  // Initial load skeleton simulation for seamless perceived performance
  useEffect(() => {
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 450);
    return () => clearTimeout(timer);
  }, []);

  // Filter change transition
  const handleFilterChange = (newFilters: FilterState) => {
    setIsLoading(true);
    setFilters(newFilters);
    setTimeout(() => {
      setIsLoading(false);
    }, 280);
  };

  // Filter & search logic
  const filteredProperties = useMemo(() => {
    return properties.filter((prop) => {
      // Saved-only filter
      if (showSavedOnly && !savedIds.includes(prop.id)) {
        return false;
      }

      // Rent / Sale type
      if (filters.type !== 'all' && prop.type !== filters.type) {
        return false;
      }

      // Location search
      if (filters.location.trim()) {
        const query = filters.location.toLowerCase();
        const matchesLoc =
          prop.location.toLowerCase().includes(query) ||
          prop.neighborhood.toLowerCase().includes(query) ||
          prop.address.toLowerCase().includes(query) ||
          prop.title.toLowerCase().includes(query);
        if (!matchesLoc) return false;
      }

      // General search query
      if (filters.searchQuery.trim()) {
        const query = filters.searchQuery.toLowerCase();
        const matchesText =
          prop.title.toLowerCase().includes(query) ||
          prop.description.toLowerCase().includes(query) ||
          prop.location.toLowerCase().includes(query);
        if (!matchesText) return false;
      }

      // Property Type
      if (filters.propertyType !== 'Any Type' && prop.propertyType !== filters.propertyType) {
        return false;
      }

      // Bedrooms
      if (filters.bedrooms !== 'Any') {
        const minBeds = parseInt(filters.bedrooms.replace('+', ''), 10);
        if (prop.bedrooms < minBeds) return false;
      }

      // Verified only
      if (filters.verifiedOnly && !prop.isVerified) {
        return false;
      }

      return true;
    }).sort((a, b) => {
      if (filters.sortBy === 'price-asc') return a.price - b.price;
      if (filters.sortBy === 'price-desc') return b.price - a.price;
      if (filters.sortBy === 'newest') return b.id.localeCompare(a.id);
      return (b.isFeatured ? 1 : 0) - (a.isFeatured ? 1 : 0);
    });
  }, [properties, filters, showSavedOnly, savedIds]);

  const resetFilters = () => {
    handleFilterChange({
      type: 'all',
      location: '',
      propertyType: 'Any Type',
      bedrooms: 'Any',
      minPrice: 0,
      maxPrice: 1000000000,
      verifiedOnly: false,
      searchQuery: '',
      sortBy: 'featured',
    });
  };

  return (
    <div className="min-h-screen py-10 md:py-16 px-4 md:px-12 lg:px-16 max-w-[1280px] mx-auto">
      {/* View Header */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
          <div>
            <div className="inline-flex items-center gap-1.5 text-xs font-bold text-[#735c00] uppercase tracking-wider mb-2">
              <Building className="w-3.5 h-3.5 text-[#003527]" />
              {showSavedOnly ? 'Your Saved Portfolio' : 'Verified Listings Directory'}
            </div>
            <h1 className="font-playfair text-3xl md:text-4xl font-bold text-[#1b1c1c] tracking-tight">
              {showSavedOnly
                ? 'Saved Properties'
                : filters.type === 'rent'
                ? 'Properties For Rent in Port Harcourt'
                : filters.type === 'sale'
                ? 'Properties For Sale in Port Harcourt'
                : 'All Port Harcourt Properties'}
            </h1>
            <p className="text-sm text-[#404944] mt-1.5">
              Showing {filteredProperties.length} verified{' '}
              {filteredProperties.length === 1 ? 'property' : 'properties'} inspected by our local PH team.
            </p>
          </div>

          {/* Quick Type Tabs (All / Rent / Sale) */}
          <div className="inline-flex p-1 bg-white rounded-xl border border-[#bfc9c3]/50 shadow-xs self-start md:self-auto">
            <button
              onClick={() => handleFilterChange({ ...filters, type: 'all' })}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                filters.type === 'all'
                  ? 'bg-[#003527] text-white shadow-xs'
                  : 'text-[#404944] hover:text-[#003527]'
              }`}
            >
              All
            </button>
            <button
              onClick={() => handleFilterChange({ ...filters, type: 'rent' })}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                filters.type === 'rent'
                  ? 'bg-[#003527] text-white shadow-xs'
                  : 'text-[#404944] hover:text-[#003527]'
              }`}
            >
              For Rent
            </button>
            <button
              onClick={() => handleFilterChange({ ...filters, type: 'sale' })}
              className={`px-4 py-2 rounded-lg text-xs md:text-sm font-semibold transition-all cursor-pointer ${
                filters.type === 'sale'
                  ? 'bg-[#003527] text-white shadow-xs'
                  : 'text-[#404944] hover:text-[#003527]'
              }`}
            >
              For Sale
            </button>
          </div>
        </div>
      </div>

      {/* Filter Bar */}
      <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#bfc9c3]/40 shadow-xs mb-10">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Location / Keyword Search */}
          <div className="relative">
            <label className="block text-[11px] font-bold text-[#1b1c1c] uppercase tracking-wider mb-1.5">
              Location / Area
            </label>
            <div className="relative">
              <MapPin className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707974]" />
              <input
                type="text"
                value={filters.location}
                onChange={(e) => setFilters({ ...filters, location: e.target.value })}
                placeholder="e.g. GRA, Odili, Woji..."
                className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#bfc9c3] bg-[#fbf9f8] text-xs md:text-sm text-[#1b1c1c] focus:bg-white focus:border-[#003527] focus:ring-1 focus:ring-[#003527] transition-all"
              />
            </div>
          </div>

          {/* Property Type Dropdown */}
          <div>
            <label className="block text-[11px] font-bold text-[#1b1c1c] uppercase tracking-wider mb-1.5">
              Property Type
            </label>
            <select
              value={filters.propertyType}
              onChange={(e) => handleFilterChange({ ...filters, propertyType: e.target.value as PropertyType | 'Any Type' })}
              className="w-full px-3 py-2.5 rounded-lg border border-[#bfc9c3] bg-[#fbf9f8] text-xs md:text-sm text-[#1b1c1c] focus:bg-white focus:border-[#003527] transition-all cursor-pointer"
            >
              <option value="Any Type">All Property Types</option>
              <option value="Apartment">Apartment</option>
              <option value="Duplex">Duplex</option>
              <option value="Terrace">Terrace</option>
              <option value="Penthouse">Penthouse</option>
              <option value="Mansion">Mansion</option>
            </select>
          </div>

          {/* Bedrooms Filter */}
          <div>
            <label className="block text-[11px] font-bold text-[#1b1c1c] uppercase tracking-wider mb-1.5">
              Bedrooms
            </label>
            <select
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange({ ...filters, bedrooms: e.target.value })}
              className="w-full px-3 py-2.5 rounded-lg border border-[#bfc9c3] bg-[#fbf9f8] text-xs md:text-sm text-[#1b1c1c] focus:bg-white focus:border-[#003527] transition-all cursor-pointer"
            >
              <option value="Any">Any Bedrooms</option>
              <option value="1+">1+ Bedroom</option>
              <option value="2+">2+ Bedrooms</option>
              <option value="3+">3+ Bedrooms</option>
              <option value="4+">4+ Bedrooms</option>
              <option value="5+">5+ Bedrooms</option>
            </select>
          </div>

          {/* Sort By */}
          <div>
            <label className="block text-[11px] font-bold text-[#1b1c1c] uppercase tracking-wider mb-1.5">
              Sort By
            </label>
            <select
              value={filters.sortBy}
              onChange={(e) => handleFilterChange({ ...filters, sortBy: e.target.value as any })}
              className="w-full px-3 py-2.5 rounded-lg border border-[#bfc9c3] bg-[#fbf9f8] text-xs md:text-sm text-[#1b1c1c] focus:bg-white focus:border-[#003527] transition-all cursor-pointer"
            >
              <option value="featured">Featured First</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
              <option value="newest">Recently Inspected</option>
            </select>
          </div>
        </div>

        {/* Secondary Filter Badges */}
        <div className="mt-4 pt-4 border-t border-[#bfc9c3]/30 flex flex-wrap items-center justify-between gap-3">
          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => handleFilterChange({ ...filters, verifiedOnly: !filters.verifiedOnly })}
              className={`px-3 py-1.5 rounded-full text-xs font-semibold flex items-center gap-1.5 transition-all cursor-pointer ${
                filters.verifiedOnly
                  ? 'bg-[#003527] text-white'
                  : 'bg-[#f0eded] text-[#404944] hover:bg-[#e4e2e1]'
              }`}
            >
              <CheckCircle2 className="w-3.5 h-3.5 text-[#fed65b]" />
              Verified Only (100% Inspected)
            </button>

            {['GRA Phase 2', 'Peter Odili Road', 'Woji', 'Old GRA'].map((loc) => (
              <button
                key={loc}
                onClick={() => handleFilterChange({ ...filters, location: filters.location === loc ? '' : loc })}
                className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  filters.location === loc
                    ? 'bg-[#fed65b] text-[#745c00] font-bold'
                    : 'bg-[#f0eded] text-[#404944] hover:bg-[#e4e2e1]'
                }`}
              >
                {loc}
              </button>
            ))}
          </div>

          <button
            onClick={resetFilters}
            className="text-xs font-semibold text-[#707974] hover:text-[#003527] flex items-center gap-1 cursor-pointer transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Reset Filters
          </button>
        </div>
      </div>

      {/* Property Cards Grid or Skeleton Loader */}
      {isLoading ? (
        <PropertiesGridSkeleton count={6} />
      ) : filteredProperties.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in duration-300">
          {filteredProperties.map((property) => (
            <PropertyCard
              key={property.id}
              property={property}
              onSelect={onSelectProperty}
              isSaved={savedIds.includes(property.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </div>
      ) : (
        /* Empty State */
        <div className="text-center py-20 bg-white rounded-2xl border border-[#bfc9c3]/30 p-8 shadow-xs max-w-lg mx-auto animate-in fade-in">
          <div className="w-16 h-16 rounded-full bg-[#fed65b]/20 text-[#745c00] flex items-center justify-center mx-auto mb-4">
            <Search className="w-8 h-8" />
          </div>
          <h3 className="font-playfair text-2xl font-bold text-[#1b1c1c] mb-2">
            No verified listings match your criteria
          </h3>
          <p className="text-sm text-[#404944] mb-6">
            Try loosening your search filters or resetting location to explore available properties across Port Harcourt.
          </p>
          <button
            onClick={resetFilters}
            className="bg-[#003527] text-white text-sm font-semibold px-6 py-3 rounded-[10px] hover:bg-[#064e3b] transition-all cursor-pointer inline-flex items-center gap-2"
          >
            <RotateCcw className="w-4 h-4" />
            Reset All Filters
          </button>
        </div>
      )}
    </div>
  );
};
