import React from 'react';
import { ArrowUpRight, Building2, MapPin, Plus, TrendingUp } from 'lucide-react';
import { AdminTab, Property, PropertySubmission } from '../../types';

interface AdminOverviewProps {
  properties: Property[];
  submissions: PropertySubmission[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenCreateProperty: () => void;
  onViewProperty: (property: Property) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({ properties, submissions, onNavigateTab, onOpenCreateProperty, onViewProperty }) => {
  const saleCount = properties.filter((property) => property.type === 'sale').length;
  const rentCount = properties.filter((property) => property.type === 'rent').length;
  const featuredCount = properties.filter((property) => property.isFeatured).length;
  const approvedCount = submissions.filter((submission) => submission.status === 'approved').length;
  const recentProperties = properties.slice(0, 5);
  const totalSaleValue = properties.filter((property) => property.type === 'sale').reduce((total, property) => total + (property.price || 0), 0);
  const formatNaira = (value: number) => value >= 1_000_000_000 ? `₦${(value / 1_000_000_000).toFixed(2)} Billion` : `₦${(value / 1_000_000).toFixed(1)} Million`;
  const metrics = [
    { label: 'Total Properties', value: properties.length, detail: 'Registered listings' },
    { label: 'For Sale', value: saleCount, detail: formatNaira(totalSaleValue) },
    { label: 'For Rent', value: rentCount, detail: 'Active rental listings' },
    { label: 'Featured', value: featuredCount, detail: `${approvedCount} approved submissions` },
  ];

  return (
    <div className="space-y-8 animate-in fade-in">
      <section className="bg-[#003527] text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#fed65b]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fed65b]/20 text-[#fed65b] text-xs font-bold uppercase tracking-wider"><Building2 className="w-3.5 h-3.5" /> SmartBridge Operations • Port Harcourt</div>
            <h1 className="font-playfair text-2xl md:text-3xl font-bold mt-3">Property Operations Dashboard</h1>
            <p className="text-white/75 text-sm mt-2 max-w-2xl">Manage property listings, pricing, availability, and marketplace visibility from one place.</p>
          </div>
          <div className="flex flex-wrap gap-3">
            <button onClick={onOpenCreateProperty} className="bg-[#fed65b] text-[#003527] text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#ffe285] flex items-center gap-2 cursor-pointer"><Plus className="w-4 h-4" /> New Listing</button>
            <button onClick={() => onNavigateTab('properties')} className="bg-white/10 hover:bg-white/20 text-white text-sm font-semibold px-5 py-3 rounded-xl border border-white/20 flex items-center gap-2 cursor-pointer">Manage Properties <ArrowUpRight className="w-4 h-4" /></button>
          </div>
        </div>
      </section>

      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {metrics.map((metric) => <div key={metric.label} className="bg-white p-5 rounded-2xl border border-[#bfc9c3]/40 shadow-xs"><span className="text-xs font-bold uppercase tracking-wider text-[#707974]">{metric.label}</span><p className="font-playfair text-3xl font-bold text-[#003527] mt-3">{metric.value}</p><span className="text-xs text-[#707974] mt-2 block">{metric.detail}</span></div>)}
      </section>

      <section className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs">
        <div className="flex items-center justify-between mb-5"><div><h2 className="font-playfair text-lg font-bold text-[#003527]">Recent Properties</h2><p className="text-xs text-[#707974] mt-1">Latest listings in the marketplace registry</p></div><button onClick={() => onNavigateTab('properties')} className="text-xs font-bold text-[#003527] hover:underline cursor-pointer">View all</button></div>
        {recentProperties.length ? <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">{recentProperties.map((property) => <button key={property.id} onClick={() => onViewProperty(property)} className="text-left border border-[#bfc9c3]/40 rounded-xl overflow-hidden hover:border-[#003527]/40 transition-colors cursor-pointer"><img src={property.images[0]} alt={property.title} className="w-full h-36 object-cover bg-[#eef2ef]" /><div className="p-4"><div className="flex items-start justify-between gap-3"><h3 className="font-bold text-sm text-[#1b1c1c] line-clamp-1">{property.title}</h3><span className="font-bold text-xs text-[#003527] whitespace-nowrap">{property.priceDisplay}</span></div><p className="text-[11px] text-[#707974] flex items-center gap-1 mt-2"><MapPin className="w-3 h-3" /> {property.neighborhood}</p></div></button>)}</div> : <div className="py-12 text-center text-[#707974]"><TrendingUp className="w-9 h-9 mx-auto mb-2 text-[#bfc9c3]" />No properties have been added yet.</div>}
      </section>
    </div>
  );
};
