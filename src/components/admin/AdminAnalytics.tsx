import React from 'react';
import { BarChart3, Building2, MapPin, TrendingUp } from 'lucide-react';
import { Property } from '../../types';

interface AdminAnalyticsProps { properties: Property[]; }

export const AdminAnalytics: React.FC<AdminAnalyticsProps> = ({ properties }) => {
  const saleProperties = properties.filter((property) => property.type === 'sale');
  const rentProperties = properties.filter((property) => property.type === 'rent');
  const saleValue = saleProperties.reduce((total, property) => total + (property.price || 0), 0);
  const annualRentValue = rentProperties.reduce((total, property) => total + (property.price || 0), 0);
  const neighborhoodCounts: Record<string, number> = {};
  properties.forEach((property) => {
    neighborhoodCounts[property.neighborhood] = (neighborhoodCounts[property.neighborhood] || 0) + 1;
  });
  const neighborhoods: Array<[string, number]> = Object.entries(neighborhoodCounts).sort((a, b) => b[1] - a[1]);
  const propertyTypeCounts: Record<string, number> = {};
  properties.forEach((property) => {
    propertyTypeCounts[property.propertyType] = (propertyTypeCounts[property.propertyType] || 0) + 1;
  });
  const propertyTypes: Array<[string, number]> = Object.entries(propertyTypeCounts).sort((a, b) => b[1] - a[1]);
  const largestGroup = Math.max(...propertyTypes.map(([, count]) => count), 1);

  return (
    <div className="space-y-6 animate-in fade-in">
      <section className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/40 shadow-xs">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#003527]/10 text-[#003527] text-xs font-bold uppercase tracking-wider mb-2"><TrendingUp className="w-3.5 h-3.5" /> Port Harcourt Market Intelligence</div>
        <h1 className="font-playfair text-2xl font-bold text-[#003527]">Market Dynamics & Pricing Analytics</h1>
        <p className="text-xs text-[#707974] mt-1">Portfolio values, listing mix, and neighborhood coverage across the marketplace.</p>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <Metric label="Total Portfolio" value={properties.length.toString()} detail="Marketplace properties" />
        <Metric label="For-Sale Value" value={`₦${(saleValue / 1_000_000_000).toFixed(2)}B`} detail={`${saleProperties.length} sale listings`} />
        <Metric label="Annual Rent Value" value={`₦${(annualRentValue / 1_000_000).toFixed(1)}M`} detail={`${rentProperties.length} rental listings`} />
        <Metric label="Neighborhoods" value={neighborhoods.length.toString()} detail="Areas represented" />
      </section>

      <section className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs">
          <h2 className="font-playfair text-lg font-bold text-[#003527] flex items-center gap-2"><BarChart3 className="w-5 h-5" /> Property Type Mix</h2>
          <div className="space-y-4 mt-5">{propertyTypes.map(([type, count]) => <div key={type}><div className="flex justify-between text-xs mb-1"><span className="font-semibold">{type}</span><span>{count}</span></div><div className="h-2.5 rounded-full bg-[#eef2ef]"><div className="h-full rounded-full bg-[#003527]" style={{ width: `${(count / largestGroup) * 100}%` }} /></div></div>)}</div>
        </div>
        <div className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs">
          <h2 className="font-playfair text-lg font-bold text-[#003527] flex items-center gap-2"><MapPin className="w-5 h-5" /> Neighborhood Coverage</h2>
          <div className="divide-y divide-[#bfc9c3]/30 mt-4">{neighborhoods.map(([name, count]) => <div key={name} className="py-3 flex justify-between text-sm"><span>{name}</span><span className="font-bold text-[#003527]">{count}</span></div>)}</div>
        </div>
      </section>
    </div>
  );
};

const Metric: React.FC<{ label: string; value: string; detail: string }> = ({ label, value, detail }) => <div className="bg-white p-5 rounded-2xl border border-[#bfc9c3]/40 shadow-xs"><div className="flex items-center justify-between"><span className="text-xs font-bold uppercase tracking-wider text-[#707974]">{label}</span><Building2 className="w-5 h-5 text-[#003527]" /></div><p className="font-playfair text-2xl font-bold text-[#003527] mt-3">{value}</p><span className="text-xs text-[#707974] mt-1 block">{detail}</span></div>;
