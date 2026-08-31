import React, { useState, useMemo } from 'react';
import {
  Search,
  Filter,
  Plus,
  Edit2,
  Trash2,
  Eye,
  ShieldCheck,
  Star,
  CheckCircle2,
  XCircle,
  Download,
  MoreVertical,
  Building2,
  DollarSign,
  MapPin,
  Sparkles,
} from 'lucide-react';
import { Property, ListingType, PropertyType } from '../../types';

interface AdminPropertiesTableProps {
  properties: Property[];
  onOpenCreate: () => void;
  onEditProperty: (property: Property) => void;
  onDeleteProperty: (propertyId: string) => void;
  onToggleVerified: (propertyId: string) => void;
  onToggleFeatured: (propertyId: string) => void;
  onViewProperty: (property: Property) => void;
}

export const AdminPropertiesTable: React.FC<AdminPropertiesTableProps> = ({
  properties,
  onOpenCreate,
  onEditProperty,
  onDeleteProperty,
  onToggleVerified,
  onToggleFeatured,
  onViewProperty,
}) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [listingTypeFilter, setListingTypeFilter] = useState<'all' | ListingType>('all');
  const [neighborhoodFilter, setNeighborhoodFilter] = useState<string>('all');
  const [verifiedFilter, setVerifiedFilter] = useState<'all' | 'verified' | 'unverified'>('all');
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Filtered Properties
  const filteredProperties = useMemo(() => {
    return properties.filter((p) => {
      // Search term
      if (searchTerm.trim()) {
        const query = searchTerm.toLowerCase();
        const matchesTitle = p.title.toLowerCase().includes(query);
        const matchesAddress = p.address.toLowerCase().includes(query);
        const matchesNeighborhood = p.neighborhood.toLowerCase().includes(query);
        const matchesAgent = p.agent?.name?.toLowerCase().includes(query);
        if (!matchesTitle && !matchesAddress && !matchesNeighborhood && !matchesAgent) {
          return false;
        }
      }

      // Listing Type
      if (listingTypeFilter !== 'all' && p.type !== listingTypeFilter) {
        return false;
      }

      // Neighborhood
      if (neighborhoodFilter !== 'all' && p.neighborhood !== neighborhoodFilter) {
        return false;
      }

      // Verified
      if (verifiedFilter === 'verified' && !p.isVerified) return false;
      if (verifiedFilter === 'unverified' && p.isVerified) return false;

      return true;
    });
  }, [properties, searchTerm, listingTypeFilter, neighborhoodFilter, verifiedFilter]);

  const handleExportCSV = () => {
    const headers = [
      'ID',
      'Title',
      'Listing Type',
      'Property Type',
      'Neighborhood',
      'Address',
      'Price (NGN)',
      'Bedrooms',
      'Bathrooms',
      'Verified',
      'Audit Score',
      'Agent',
    ];
    const rows = filteredProperties.map((p) => [
      p.id,
      `"${p.title.replace(/"/g, '""')}"`,
      p.type,
      p.propertyType,
      p.neighborhood,
      `"${p.address.replace(/"/g, '""')}"`,
      p.price,
      p.bedrooms,
      p.bathrooms,
      p.isVerified ? 'YES' : 'NO',
      p.inspectionReport?.overallScore || 0,
      `"${p.agent?.name || ''}"`,
    ]);

    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `smartbridge_properties_${new Date().toISOString().slice(0, 10)}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header & Main Controls */}
      <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/40 shadow-xs space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#003527]">
              Property Inventory Registry
            </h1>
            <p className="text-xs text-[#707974] mt-0.5">
              Manage listings, inspection audit scores, title records, and pricing across Port Harcourt
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button
              id="btn-export-properties-csv"
              onClick={handleExportCSV}
              className="px-4 py-2.5 rounded-xl border border-[#bfc9c3] text-[#404944] hover:bg-[#fbf9f8] text-xs font-bold transition-all flex items-center gap-2 cursor-pointer"
            >
              <Download className="w-4 h-4" /> Export CSV
            </button>
            <button
              id="btn-add-new-property"
              onClick={onOpenCreate}
              className="px-5 py-2.5 rounded-xl bg-[#003527] text-white hover:bg-[#064e3b] text-xs font-bold transition-all shadow-md hover:shadow-lg flex items-center gap-2 cursor-pointer"
            >
              <Plus className="w-4 h-4 text-[#fed65b]" /> Add New Property
            </button>
          </div>
        </div>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2 border-t border-[#bfc9c3]/30">
          {/* Search Box */}
          <div className="relative">
            <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#707974]" />
            <input
              id="input-admin-search-properties"
              type="text"
              placeholder="Search title, address, agent..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-[#fbf9f8] border border-[#bfc9c3] rounded-xl pl-9 pr-4 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
            />
          </div>

          {/* Listing Type Filter */}
          <select
            value={listingTypeFilter}
            onChange={(e) => setListingTypeFilter(e.target.value as any)}
            className="bg-[#fbf9f8] border border-[#bfc9c3] rounded-xl px-3 py-2 text-xs text-[#1b1c1c] font-medium focus:outline-none focus:border-[#003527]"
          >
            <option value="all">All Types (Sale & Rent)</option>
            <option value="sale">For Sale</option>
            <option value="rent">For Rent</option>
          </select>

          {/* Neighborhood Filter */}
          <select
            value={neighborhoodFilter}
            onChange={(e) => setNeighborhoodFilter(e.target.value)}
            className="bg-[#fbf9f8] border border-[#bfc9c3] rounded-xl px-3 py-2 text-xs text-[#1b1c1c] font-medium focus:outline-none focus:border-[#003527]"
          >
            <option value="all">All Neighborhoods</option>
            <option value="GRA Phase 2">GRA Phase 2</option>
            <option value="Peter Odili Road">Peter Odili Road</option>
            <option value="Woji">Woji</option>
            <option value="Old GRA">Old GRA</option>
            <option value="Golf Estate">Golf Estate</option>
            <option value="Ada George">Ada George</option>
          </select>

          {/* Verification Status Filter */}
          <select
            value={verifiedFilter}
            onChange={(e) => setVerifiedFilter(e.target.value as any)}
            className="bg-[#fbf9f8] border border-[#bfc9c3] rounded-xl px-3 py-2 text-xs text-[#1b1c1c] font-medium focus:outline-none focus:border-[#003527]"
          >
            <option value="all">All Verification Statuses</option>
            <option value="verified">Verified Only</option>
            <option value="unverified">Pending Audit</option>
          </select>
        </div>
      </div>

      {/* Properties Table */}
      <div className="bg-white rounded-2xl border border-[#bfc9c3]/40 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#003527]/5 border-b border-[#bfc9c3]/40 text-[11px] font-bold uppercase tracking-wider text-[#404944]">
                <th className="py-3.5 px-4">Property</th>
                <th className="py-3.5 px-4">Type & Area</th>
                <th className="py-3.5 px-4">Price</th>
                <th className="py-3.5 px-4">Audit Score</th>
                <th className="py-3.5 px-4">Badges</th>
                <th className="py-3.5 px-4">Assigned Agent</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#bfc9c3]/30 text-xs">
              {filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-[#707974]">
                    <Building2 className="w-10 h-10 mx-auto text-[#bfc9c3] mb-2" />
                    No properties match your filter criteria.
                  </td>
                </tr>
              ) : (
                filteredProperties.map((property) => (
                  <tr
                    key={property.id}
                    className="hover:bg-[#fbf9f8] transition-colors group"
                  >
                    {/* Property Main Details */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-3">
                        <img
                          src={property.images[0]}
                          alt={property.title}
                          className="w-12 h-12 rounded-lg object-cover border border-[#bfc9c3]/50 shrink-0"
                        />
                        <div className="min-w-0 max-w-xs">
                          <h4
                            onClick={() => onViewProperty(property)}
                            className="font-bold text-[#1b1c1c] hover:text-[#003527] cursor-pointer truncate"
                            title={property.title}
                          >
                            {property.title}
                          </h4>
                          <span className="text-[11px] text-[#707974] flex items-center gap-1 truncate">
                            <MapPin className="w-3 h-3 text-[#735c00] shrink-0" />
                            {property.address}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Type & Area */}
                    <td className="py-3.5 px-4">
                      <div>
                        <span className="font-semibold text-[#1b1c1c] block">
                          {property.propertyType}
                        </span>
                        <span className="text-[11px] font-bold text-[#735c00] uppercase">
                          {property.neighborhood}
                        </span>
                        <span className="text-[10px] text-[#707974] block">
                          {property.bedrooms} Bed • {property.bathrooms} Bath • {property.sizeSqFt} sqft
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-3.5 px-4 font-bold text-[#003527]">
                      <div>
                        <span>{property.priceDisplay}</span>
                        {property.pricePeriod && (
                          <span className="text-[10px] text-[#707974] font-normal block">
                            {property.pricePeriod}
                          </span>
                        )}
                        <span
                          className={`inline-block mt-0.5 text-[9px] uppercase font-extrabold px-1.5 py-0.2 rounded-xs ${
                            property.type === 'sale'
                              ? 'bg-blue-50 text-blue-700'
                              : 'bg-emerald-50 text-emerald-700'
                          }`}
                        >
                          {property.type === 'sale' ? 'For Sale' : 'For Rent'}
                        </span>
                      </div>
                    </td>

                    {/* Audit Score & Title */}
                    <td className="py-3.5 px-4">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-[#003527] text-[#fed65b] font-playfair font-bold text-xs flex items-center justify-center shadow-xs">
                          {property.inspectionReport?.overallScore || 90}
                        </div>
                        <div>
                          <span className="text-[11px] font-semibold text-[#1b1c1c] block">
                            {property.inspectionReport?.titleDocumentType || 'C of O'}
                          </span>
                          <span className="text-[10px] text-emerald-700 font-bold flex items-center gap-0.5">
                            <CheckCircle2 className="w-2.5 h-2.5" /> Registry Verified
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Badges / Toggles */}
                    <td className="py-3.5 px-4">
                      <div className="flex flex-col gap-1.5">
                        <button
                          type="button"
                          onClick={() => onToggleVerified(property.id)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                            property.isVerified
                              ? 'bg-[#003527] text-[#fed65b]'
                              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                          }`}
                          title="Click to toggle Verified status"
                        >
                          <ShieldCheck className="w-3 h-3" />
                          {property.isVerified ? 'Verified' : 'Unverified'}
                        </button>
                        <button
                          type="button"
                          onClick={() => onToggleFeatured(property.id)}
                          className={`inline-flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-md cursor-pointer transition-all ${
                            property.isFeatured
                              ? 'bg-amber-100 text-amber-900 font-extrabold'
                              : 'bg-neutral-100 text-neutral-500 hover:bg-neutral-200'
                          }`}
                          title="Click to toggle Featured on Home"
                        >
                          <Star className={`w-3 h-3 ${property.isFeatured ? 'fill-amber-500 text-amber-500' : ''}`} />
                          {property.isFeatured ? 'Featured' : 'Standard'}
                        </button>
                      </div>
                    </td>

                    {/* Assigned Agent */}
                    <td className="py-3.5 px-4 text-[#404944]">
                      <div className="flex items-center gap-2">
                        <img
                          src={property.agent?.avatar}
                          alt={property.agent?.name}
                          className="w-6 h-6 rounded-full object-cover"
                        />
                        <span className="text-xs font-medium text-[#1b1c1c] truncate max-w-[100px]">
                          {property.agent?.name?.split(' ')[0]}
                        </span>
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="py-3.5 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => onViewProperty(property)}
                          className="p-1.5 rounded-lg text-[#707974] hover:text-[#003527] hover:bg-[#003527]/10 transition-colors cursor-pointer"
                          title="Preview Public Listing"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => onEditProperty(property)}
                          className="p-1.5 rounded-lg text-[#003527] hover:bg-[#003527]/10 transition-colors cursor-pointer font-bold"
                          title="Edit Listing"
                        >
                          <Edit2 className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteConfirmId(property.id)}
                          className="p-1.5 rounded-lg text-[#ba1a1a] hover:bg-[#ba1a1a]/10 transition-colors cursor-pointer"
                          title="Delete Listing"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Table Footer */}
        <div className="px-6 py-4 bg-[#003527]/5 border-t border-[#bfc9c3]/30 flex items-center justify-between text-xs text-[#707974]">
          <span>
            Showing <strong className="text-[#003527]">{filteredProperties.length}</strong> of{' '}
            <strong className="text-[#003527]">{properties.length}</strong> registered listings
          </span>
          <span className="text-[11px] font-medium text-[#707974]">
            SmartBridge Verified • Rivers State Physical Verification Standards
          </span>
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      {deleteConfirmId && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-6 max-w-md w-full shadow-2xl border border-[#bfc9c3] space-y-4">
            <h3 className="font-playfair text-lg font-bold text-[#ba1a1a]">
              Confirm Deletion
            </h3>
            <p className="text-sm text-[#404944]">
              Are you sure you want to remove this property listing from the public registry? This action will immediately unlist it from SmartBridge search.
            </p>
            <div className="flex items-center justify-end gap-3 pt-2">
              <button
                onClick={() => setDeleteConfirmId(null)}
                className="px-4 py-2 rounded-lg border border-[#bfc9c3] text-xs font-semibold cursor-pointer"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  onDeleteProperty(deleteConfirmId);
                  setDeleteConfirmId(null);
                }}
                className="px-4 py-2 rounded-lg bg-[#ba1a1a] text-white text-xs font-bold hover:bg-red-700 cursor-pointer"
              >
                Yes, Delete Listing
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
