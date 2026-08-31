import React from 'react';
import { PropertyCardSkeleton } from './PropertyCardSkeleton';

interface PropertiesGridSkeletonProps {
  count?: number;
  showFilterSkeleton?: boolean;
}

export const PropertiesGridSkeleton: React.FC<PropertiesGridSkeletonProps> = ({
  count = 6,
  showFilterSkeleton = false,
}) => {
  return (
    <div className="w-full space-y-8 animate-in fade-in duration-300">
      {showFilterSkeleton && (
        <div className="bg-white rounded-2xl p-5 md:p-6 border border-[#bfc9c3]/40 shadow-xs mb-8 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="space-y-1.5">
                <div className="w-20 h-3 rounded skeleton-shimmer" />
                <div className="w-full h-10 rounded-lg skeleton-shimmer" />
              </div>
            ))}
          </div>
          <div className="pt-4 border-t border-[#bfc9c3]/30 flex gap-2">
            <div className="w-28 h-7 rounded-full skeleton-shimmer" />
            <div className="w-24 h-7 rounded-full skeleton-shimmer" />
            <div className="w-24 h-7 rounded-full skeleton-shimmer" />
          </div>
        </div>
      )}

      {/* Grid of Skeleton Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {Array.from({ length: count }).map((_, idx) => (
          <PropertyCardSkeleton key={idx} />
        ))}
      </div>
    </div>
  );
};
