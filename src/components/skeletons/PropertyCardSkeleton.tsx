import React from 'react';

interface PropertyCardSkeletonProps {
  count?: number;
}

export const PropertyCardSkeleton: React.FC = () => {
  return (
    <div className="bg-white rounded-xl overflow-hidden shadow-[0_4px_12px_rgba(0,53,39,0.08)] border border-[#bfc9c3]/30 flex flex-col animate-pulse">
      {/* Thumbnail Skeleton */}
      <div className="relative h-64 skeleton-shimmer-dark overflow-hidden">
        {/* Floating badge placeholders */}
        <div className="absolute top-4 left-4 flex gap-2">
          <div className="w-16 h-5 rounded-md skeleton-shimmer" />
          <div className="w-20 h-5 rounded-md skeleton-shimmer" />
        </div>

        {/* Favorite circle button placeholder */}
        <div className="absolute top-4 right-4 w-9 h-9 rounded-full skeleton-shimmer" />

        {/* Bottom subtle bar placeholder */}
        <div className="absolute bottom-3 left-4 right-4 flex justify-between items-center">
          <div className="w-28 h-3.5 rounded skeleton-shimmer" />
          <div className="w-16 h-3.5 rounded skeleton-shimmer" />
        </div>
      </div>

      {/* Body Skeleton */}
      <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
        <div className="space-y-3">
          {/* Location tag placeholder */}
          <div className="flex items-center gap-2">
            <div className="w-3.5 h-3.5 rounded-full skeleton-shimmer" />
            <div className="w-24 h-3 rounded skeleton-shimmer" />
          </div>

          {/* Title placeholders */}
          <div className="space-y-1.5">
            <div className="w-11/12 h-5 rounded skeleton-shimmer" />
            <div className="w-3/4 h-5 rounded skeleton-shimmer" />
          </div>

          {/* Bed / Bath / Car Divider */}
          <div className="flex items-center justify-between border-y border-[#bfc9c3]/30 py-3 mt-2">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded skeleton-shimmer" />
              <div className="w-12 h-3 rounded skeleton-shimmer" />
            </div>
            <div className="w-1 h-1 rounded-full bg-[#bfc9c3]" />
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 rounded skeleton-shimmer" />
              <div className="w-12 h-3 rounded skeleton-shimmer" />
            </div>
            <div className="w-1 h-1 rounded-full bg-[#bfc9c3]" />
            <div className="w-12 h-3 rounded skeleton-shimmer" />
          </div>
        </div>

        {/* Price & CTA Button Placeholder */}
        <div className="flex justify-between items-end pt-2">
          <div className="space-y-1">
            <div className="w-8 h-2.5 rounded skeleton-shimmer" />
            <div className="w-28 h-6 rounded skeleton-shimmer" />
          </div>
          <div className="w-20 h-8 rounded-lg skeleton-shimmer" />
        </div>
      </div>
    </div>
  );
};
