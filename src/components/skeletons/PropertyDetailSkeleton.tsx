import React from 'react';

export const PropertyDetailSkeleton: React.FC = () => {
  return (
    <div className="bg-[#FCF9F2] w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-white/40 flex flex-col max-h-[92vh] animate-pulse">
      {/* Sticky Header Skeleton */}
      <div className="bg-[#fbf9f8]/95 px-6 py-4 border-b border-[#bfc9c3]/30 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-20 h-6 rounded-md skeleton-shimmer" />
          <div className="w-32 h-6 rounded-md skeleton-shimmer" />
        </div>
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg skeleton-shimmer" />
          <div className="w-9 h-9 rounded-lg skeleton-shimmer" />
          <div className="w-9 h-9 rounded-lg skeleton-shimmer" />
        </div>
      </div>

      {/* Scrollable Body Skeleton */}
      <div className="overflow-y-auto p-6 md:p-8 space-y-8">
        {/* Main Gallery Hero Skeleton */}
        <div className="space-y-3">
          <div className="relative rounded-xl overflow-hidden skeleton-shimmer-dark aspect-[16/9] md:aspect-[21/9] max-h-[440px]" />
          
          {/* Thumbnails row */}
          <div className="flex gap-2">
            {[1, 2, 3, 4].map((i) => (
              <div key={i} className="w-20 h-14 rounded-lg skeleton-shimmer shrink-0" />
            ))}
          </div>
        </div>

        {/* Title, Location & Price Header */}
        <div className="flex flex-col md:flex-row md:items-start justify-between gap-6 pb-6 border-b border-[#bfc9c3]/30">
          <div className="space-y-2 flex-1">
            <div className="w-32 h-4 rounded skeleton-shimmer" />
            <div className="w-4/5 h-8 rounded skeleton-shimmer" />
            <div className="w-2/3 h-4 rounded skeleton-shimmer mt-2" />
          </div>

          <div className="md:text-right space-y-1.5 shrink-0">
            <div className="w-16 h-3 rounded skeleton-shimmer md:ml-auto" />
            <div className="w-40 h-9 rounded skeleton-shimmer md:ml-auto" />
          </div>
        </div>

        {/* 4-Stat Metric Cards Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="bg-white p-4 rounded-xl border border-[#bfc9c3]/30 space-y-2">
              <div className="w-5 h-5 rounded skeleton-shimmer" />
              <div className="w-16 h-3 rounded skeleton-shimmer" />
              <div className="w-20 h-5 rounded skeleton-shimmer" />
            </div>
          ))}
        </div>

        {/* Tabs Bar Placeholder */}
        <div className="flex gap-3 border-b border-[#bfc9c3]/30 pb-3">
          <div className="w-28 h-9 rounded-lg skeleton-shimmer" />
          <div className="w-36 h-9 rounded-lg skeleton-shimmer" />
          <div className="w-28 h-9 rounded-lg skeleton-shimmer" />
        </div>

        {/* Content Section Skeleton: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left 2 Cols: Description & Audit Report */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/30 space-y-3">
              <div className="w-40 h-5 rounded skeleton-shimmer" />
              <div className="space-y-2 pt-2">
                <div className="w-full h-3.5 rounded skeleton-shimmer" />
                <div className="w-full h-3.5 rounded skeleton-shimmer" />
                <div className="w-5/6 h-3.5 rounded skeleton-shimmer" />
                <div className="w-3/4 h-3.5 rounded skeleton-shimmer" />
              </div>
            </div>

            {/* Inspection Checklist Box */}
            <div className="bg-[#003527]/5 p-6 rounded-2xl border border-[#003527]/10 space-y-4">
              <div className="flex items-center justify-between">
                <div className="w-48 h-5 rounded skeleton-shimmer" />
                <div className="w-16 h-8 rounded-full skeleton-shimmer" />
              </div>
              <div className="space-y-3 pt-2">
                {[1, 2, 3].map((item) => (
                  <div key={item} className="bg-white p-3.5 rounded-xl border border-[#bfc9c3]/20 flex items-center justify-between">
                    <div className="space-y-1.5 flex-1">
                      <div className="w-48 h-4 rounded skeleton-shimmer" />
                      <div className="w-64 h-3 rounded skeleton-shimmer" />
                    </div>
                    <div className="w-6 h-6 rounded-full skeleton-shimmer ml-4" />
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Col: Advisor Card */}
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/30 space-y-5">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-full skeleton-shimmer shrink-0" />
                <div className="space-y-2 flex-1">
                  <div className="w-20 h-3 rounded skeleton-shimmer" />
                  <div className="w-28 h-4 rounded skeleton-shimmer" />
                  <div className="w-24 h-3 rounded skeleton-shimmer" />
                </div>
              </div>

              <div className="space-y-3 pt-2">
                <div className="w-full h-11 rounded-xl skeleton-shimmer" />
                <div className="w-full h-11 rounded-xl skeleton-shimmer" />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
