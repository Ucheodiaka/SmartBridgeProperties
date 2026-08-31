import React, { useState } from 'react';
import { MapPin, Bed, Bath, ShieldCheck, Heart, ArrowUpRight } from 'lucide-react';
import { Property } from '../types';

interface PropertyCardProps {
  property: Property;
  onSelect: (property: Property) => void;
  isSaved?: boolean;
  onToggleSave?: (propertyId: string) => void;
}

export const PropertyCard: React.FC<PropertyCardProps> = ({
  property,
  onSelect,
  isSaved = false,
  onToggleSave,
}) => {
  const [imageLoaded, setImageLoaded] = useState(false);

  return (
    <div
      id={`property-card-${property.id}`}
      className="bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,53,39,0.08)] hover:shadow-[0_12px_28px_rgba(0,53,39,0.14)] transition-all duration-300 group flex flex-col border border-[#bfc9c3]/30"
    >
      {/* Property Thumbnail Image */}
      <div className="relative h-64 overflow-hidden bg-[#e4e2e1] cursor-pointer" onClick={() => onSelect(property)}>
        {/* Shimmer skeleton until image loads */}
        {!imageLoaded && (
          <div className="absolute inset-0 skeleton-shimmer-dark z-0" />
        )}

        <img
          src={property.images[0]}
          alt={property.title}
          onLoad={() => setImageLoaded(true)}
          className={`w-full h-full object-cover group-hover:scale-105 transition-all duration-500 relative z-1 ${
            imageLoaded ? 'opacity-100' : 'opacity-0'
          }`}
          loading="lazy"
        />

        {/* Floating Badges */}
        <div className="absolute top-4 left-4 flex flex-wrap gap-2 items-center z-10">
          {property.type === 'sale' ? (
            <span className="bg-[#fed65b] text-[#745c00] text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
              For Sale
            </span>
          ) : (
            <span className="bg-[#2b6954] text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm">
              For Rent
            </span>
          )}

          {property.isVerified && (
            <span className="bg-[#003527]/90 backdrop-blur-xs text-white text-[10px] font-bold px-2.5 py-1 rounded-md uppercase tracking-wider shadow-sm flex items-center gap-1">
              <ShieldCheck className="w-3 h-3 text-[#fed65b]" />
              Verified
            </span>
          )}
        </div>

        {/* Favorite Button */}
        {onToggleSave && (
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              onToggleSave(property.id);
            }}
            className="absolute top-4 right-4 w-9 h-9 rounded-full bg-white/90 backdrop-blur-xs hover:bg-white text-[#1b1c1c] flex items-center justify-center shadow-md transition-all hover:scale-110 cursor-pointer z-10"
            title={isSaved ? 'Remove from Saved' : 'Save Property'}
          >
            <Heart
              className={`w-4 h-4 transition-colors ${
                isSaved ? 'fill-[#ba1a1a] text-[#ba1a1a]' : 'text-[#404944]'
              }`}
            />
          </button>
        )}

        {/* Price tag watermark for quick visibility on hover */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-black/60 to-transparent p-4 flex justify-between items-end opacity-0 group-hover:opacity-100 transition-opacity">
          <span className="text-white text-xs font-semibold tracking-wide">
            {property.propertyType} • {property.sizeSqFt.toLocaleString()} sq ft
          </span>
          <span className="text-white text-xs font-semibold flex items-center gap-1">
            View Details <ArrowUpRight className="w-3.5 h-3.5" />
          </span>
        </div>
      </div>

      {/* Property Details Body */}
      <div className="p-6 flex-1 flex flex-col justify-between">
        <div>
          {/* Location link */}
          <div className="flex items-center gap-1.5 text-xs font-bold text-[#003527] uppercase tracking-wider mb-2">
            <MapPin className="w-3.5 h-3.5 text-[#003527]" />
            <span>{property.location}</span>
          </div>

          {/* Title */}
          <h3
            onClick={() => onSelect(property)}
            className="font-semibold text-lg text-[#1b1c1c] mb-3 line-clamp-1 group-hover:text-[#003527] transition-colors cursor-pointer"
            title={property.title}
          >
            {property.title}
          </h3>

          {/* Beds, Baths, Parking Stats */}
          <div className="flex items-center gap-4 mb-5 border-y border-[#bfc9c3]/30 py-3 text-xs font-semibold text-[#404944]">
            <div className="flex items-center gap-1.5">
              <Bed className="w-4 h-4 text-[#707974]" />
              <span>{property.bedrooms} Beds</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#bfc9c3]" />
            <div className="flex items-center gap-1.5">
              <Bath className="w-4 h-4 text-[#707974]" />
              <span>{property.bathrooms} Baths</span>
            </div>
            <div className="w-1 h-1 rounded-full bg-[#bfc9c3]" />
            <span className="text-[#707974]">{property.parkingSpaces} Cars</span>
          </div>
        </div>

        {/* Price & Details CTA */}
        <div className="flex justify-between items-center pt-1">
          <div>
            <span className="text-xs text-[#707974] block font-medium">Price</span>
            <p className="font-bold text-lg md:text-xl text-[#003527] tracking-tight">
              {property.priceDisplay}
              {property.pricePeriod && (
                <span className="text-xs font-normal text-[#404944]">
                  {property.pricePeriod}
                </span>
              )}
            </p>
          </div>

          <button
            type="button"
            id={`view-details-${property.id}`}
            onClick={() => onSelect(property)}
            className="text-xs font-bold text-[#735c00] hover:text-[#003527] hover:bg-[#fed65b]/20 px-3.5 py-2 rounded-lg transition-colors flex items-center gap-1 cursor-pointer"
          >
            Details
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </div>
  );
};
