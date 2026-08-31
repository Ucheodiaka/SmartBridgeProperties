import React from 'react';
import {
  TrendingUp,
  BarChart3,
  PieChart,
  ShieldCheck,
  Building2,
  DollarSign,
  MapPin,
  CheckCircle2,
  AlertTriangle,
  Award,
} from 'lucide-react';
import { Property, InspectionBooking } from '../../types';
import { NEIGHBORHOODS } from '../../data/properties';

interface AdminAnalyticsProps {
  properties: Property[];
  bookings: InspectionBooking[];
}

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ properties, bookings }) => {
  const totalSaleUnits = properties.filter((p) => p.type === 'sale').length;
  const totalRentUnits = properties.filter((p) => p.type === 'rent').length;

  const totalSaleVolume = properties
    .filter((p) => p.type === 'sale')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const totalAnnualRentVolume = properties
    .filter((p) => p.type === 'rent')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  // Group by property type
  const propertyTypesCount: { [key: string]: number } = {};
  properties.forEach((p) => {
    propertyTypesCount[p.propertyType] = (propertyTypesCount[p.propertyType] || 0) + 1;
  });

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/40 shadow-xs">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003527]/10 text-[#003527] text-xs font-bold uppercase tracking-wider mb-2">
          <TrendingUp className="w-3.5 h-3.5" />
          Port Harcourt Real Estate Market Intelligence
        </div>
        <h1 className="font-playfair text-2xl font-bold text-[#003527]">
          Market Dynamics & Pricing Analytics
        </h1>
        <p className="text-xs text-[#707974] mt-0.5">
          Real-time valuation metrics, neighborhood yields, and verification success rates across Rivers State luxury real estate.
        </p>
      </div>

      {/* High-Level Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c3]/40 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#707974]">
            Total Asset Portfolio
          </span>
          <p className="font-playfair text-2xl font-bold text-[#003527] mt-2">
            ₦{(totalSaleVolume / 1000000000).toFixed(2)} Billion
          </p>
          <span className="text-xs text-[#707974] mt-1 block">
            {totalSaleUnits} Prime For-Sale Properties
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c3]/40 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#707974]">
            Annual Rental Yield Pool
          </span>
          <p className="font-playfair text-2xl font-bold text-[#735c00] mt-2">
            ₦{(totalAnnualRentVolume / 1000000).toFixed(1)} Million/yr
          </p>
          <span className="text-xs text-[#707974] mt-1 block">
            {totalRentUnits} Serviced Rental Units
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c3]/40 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#707974]">
            Physical Audit Pass Rate
          </span>
          <p className="font-playfair text-2xl font-bold text-emerald-800 mt-2">
            96.4%
          </p>
          <span className="text-xs text-emerald-700 font-semibold mt-1 flex items-center gap-1">
            <CheckCircle2 className="w-3.5 h-3.5" /> High Trust Standard
          </span>
        </div>

        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c3]/40 shadow-xs">
          <span className="text-xs font-bold uppercase tracking-wider text-[#707974]">
            Client Inquiry Conversion
          </span>
          <p className="font-playfair text-2xl font-bold text-blue-900 mt-2">
            82.5%
          </p>
          <span className="text-xs text-blue-800 font-semibold mt-1 block">
            {bookings.length} Registered Viewings
          </span>
        </div>
      </div>

      {/* Neighborhood Price Benchmark Table */}
      <div className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="font-playfair text-lg font-bold text-[#003527]">
              Port Harcourt Neighborhood Benchmark Ranges (2026)
            </h2>
            <p className="text-xs text-[#707974] mt-0.5">
              Verified market pricing, security tiers, and flood safety classifications
            </p>
          </div>
          <span className="text-xs font-bold text-[#735c00] bg-[#fed65b]/20 px-3 py-1 rounded-full">
            Quarterly Index
          </span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="bg-[#003527]/5 border-b border-[#bfc9c3]/40 text-[#404944] font-bold uppercase text-[10px]">
                <th className="py-3 px-4">Neighborhood Axis</th>
                <th className="py-3 px-4">Avg Sale Price Range</th>
                <th className="py-3 px-4">Avg Annual Rent</th>
                <th className="py-3 px-4">Security Tier</th>
                <th className="py-3 px-4">Flood & Topography</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bfc9c3]/30">
              {NEIGHBORHOODS.map((nh) => (
                <tr key={nh.name} className="hover:bg-[#fbf9f8] transition-colors">
                  <td className="py-3.5 px-4 font-bold text-[#1b1c1c] flex items-center gap-2">
                    <MapPin className="w-3.5 h-3.5 text-[#003527]" />
                    {nh.name}
                  </td>
                  <td className="py-3.5 px-4 font-semibold text-[#003527]">{nh.avgSalePrice}</td>
                  <td className="py-3.5 px-4 font-semibold text-[#735c00]">{nh.avgRentPrice}</td>
                  <td className="py-3.5 px-4">
                    <span className="px-2 py-0.5 bg-emerald-50 text-emerald-800 font-bold rounded-md">
                      {nh.securityRating}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 text-[#404944]">{nh.floodRating}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Property Type Breakdown & Verification Standard */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Breakdown */}
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs space-y-4">
          <h3 className="font-playfair text-base font-bold text-[#003527]">
            Listing Distribution by Property Archetype
          </h3>
          <div className="space-y-3 pt-2">
            {Object.entries(propertyTypesCount).map(([type, count]) => {
              const pct = Math.round((count / properties.length) * 100);
              return (
                <div key={type} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#1b1c1c]">{type}</span>
                    <span className="text-[#707974]">{count} units ({pct}%)</span>
                  </div>
                  <div className="w-full bg-[#f0eded] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#003527] h-full rounded-full transition-all"
                      style={{ width: `${Math.max(pct, 8)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Verification Standards Compliance */}
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs space-y-4">
          <h3 className="font-playfair text-base font-bold text-[#003527]">
            Physical Audit Quality Metrics
          </h3>
          <div className="space-y-3 pt-1 text-xs">
            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
              <div>
                <strong className="text-emerald-900 block font-bold">100% Legal Title Search Verified</strong>
                <span className="text-emerald-700 text-[11px]">C of O & Governor's Consent checked at Ministry of Lands</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>

            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
              <div>
                <strong className="text-emerald-900 block font-bold">100% Zero Severe Flood Risk</strong>
                <span className="text-emerald-700 text-[11px]">Elevated topography & dedicated stormwater connectivity</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>

            <div className="p-3 rounded-xl border border-emerald-200 bg-emerald-50/50 flex items-center justify-between">
              <div>
                <strong className="text-emerald-900 block font-bold">98% Dedicated Power Infrastructure</strong>
                <span className="text-emerald-700 text-[11px]">Industrial feeder line, generator set, or solar hybrid</span>
              </div>
              <CheckCircle2 className="w-5 h-5 text-emerald-700" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
