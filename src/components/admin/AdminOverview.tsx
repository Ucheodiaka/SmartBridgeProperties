import React from 'react';
import {
  Building2,
  ShieldCheck,
  CalendarCheck,
  Clock,
  TrendingUp,
  Award,
  ChevronRight,
  Plus,
  MapPin,
  CheckCircle2,
  AlertCircle,
  FileText,
  Eye,
  ArrowUpRight,
  Sparkles,
} from 'lucide-react';
import { Property, InspectionBooking, PropertySubmission, AdminTab } from '../../types';

interface AdminOverviewProps {
  properties: Property[];
  bookings: InspectionBooking[];
  submissions: PropertySubmission[];
  onNavigateTab: (tab: AdminTab) => void;
  onOpenCreateProperty: () => void;
  onViewProperty: (prop: Property) => void;
}

export const AdminOverview: React.FC<AdminOverviewProps> = ({
  properties,
  bookings,
  submissions,
  onNavigateTab,
  onOpenCreateProperty,
  onViewProperty,
}) => {
  // Calculations
  const verifiedCount = properties.filter((p) => p.isVerified).length;
  const pendingSubmissions = submissions.filter((s) => s.status === 'pending_audit' || s.status === 'in_progress').length;
  const pendingBookings = bookings.filter((b) => b.status === 'pending').length;
  const confirmedBookings = bookings.filter((b) => b.status === 'confirmed').length;

  const totalSaleValue = properties
    .filter((p) => p.type === 'sale')
    .reduce((acc, curr) => acc + (curr.price || 0), 0);

  const avgAuditScore = Math.round(
    properties.reduce((acc, curr) => acc + (curr.inspectionReport?.overallScore || 90), 0) /
      (properties.length || 1)
  );

  // Group properties by neighborhood
  const neighborhoodCounts: { [key: string]: number } = {};
  properties.forEach((p) => {
    neighborhoodCounts[p.neighborhood] = (neighborhoodCounts[p.neighborhood] || 0) + 1;
  });

  const formatNaira = (val: number) => {
    if (val >= 1000000000) {
      return `₦${(val / 1000000000).toFixed(2)} Billion`;
    }
    return `₦${(val / 1000000).toFixed(1)} Million`;
  };

  return (
    <div className="space-y-8 animate-in fade-in">
      {/* Top Banner / Welcome with Quick Actions */}
      <div className="bg-[#003527] text-white rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#fed65b]/10 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-[#fed65b]/20 text-[#fed65b] text-xs font-bold uppercase tracking-wider">
              <ShieldCheck className="w-3.5 h-3.5" />
              SmartBridge Command Center • Port Harcourt
            </div>
            <h1 className="font-playfair text-2xl md:text-3xl font-bold tracking-tight">
              Real Estate Asset & Verification Ops
            </h1>
            <p className="text-[#fed65b]/90 text-sm max-w-2xl">
              Live supervision of verified luxury residential assets across GRA Phase 2, Old GRA, Peter Odili Road, Woji, and Golf Estate.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              id="admin-btn-quick-new-listing"
              onClick={onOpenCreateProperty}
              className="bg-[#fed65b] text-[#003527] text-xs md:text-sm font-bold px-5 py-3 rounded-xl hover:bg-[#ffe285] transition-all hover:shadow-lg flex items-center gap-2 cursor-pointer shadow-md"
            >
              <Plus className="w-4 h-4" />
              New Verified Listing
            </button>
            <button
              id="admin-btn-quick-audit-queue"
              onClick={() => onNavigateTab('verification')}
              className="bg-white/10 hover:bg-white/20 text-white text-xs md:text-sm font-semibold px-4 py-3 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ShieldCheck className="w-4 h-4 text-[#fed65b]" />
              Audit Queue ({pendingSubmissions})
            </button>
          </div>
        </div>
      </div>

      {/* KPI Stats Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1 */}
        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c3]/40 shadow-xs hover:border-[#003527]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#707974]">
              Portfolio Sale Value
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#003527]/10 flex items-center justify-center text-[#003527]">
              <TrendingUp className="w-5 h-5" />
            </div>
          </div>
          <p className="font-playfair text-2xl font-bold text-[#003527] mt-3">
            {formatNaira(totalSaleValue)}
          </p>
          <div className="flex items-center justify-between text-xs mt-2 text-[#707974]">
            <span>{properties.length} Total Registered Units</span>
            <span className="text-[#003527] font-semibold">Port Harcourt Prime</span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c3]/40 shadow-xs hover:border-[#003527]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#707974]">
              Verified Physical Audits
            </span>
            <div className="w-9 h-9 rounded-xl bg-[#fed65b]/20 flex items-center justify-center text-[#735c00]">
              <ShieldCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="font-playfair text-2xl font-bold text-[#003527]">{verifiedCount}</p>
            <span className="text-xs text-[#707974]">/ {properties.length} active listings</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-2 text-[#707974]">
            <span className="flex items-center gap-1 text-[#003527] font-semibold">
              <CheckCircle2 className="w-3.5 h-3.5 text-[#003527]" /> 100% C of O / Deeds
            </span>
            <span className="font-bold text-[#735c00]">Avg: {avgAuditScore}%</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c3]/40 shadow-xs hover:border-[#003527]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#707974]">
              Viewing & Inspections
            </span>
            <div className="w-9 h-9 rounded-xl bg-blue-50 flex items-center justify-center text-blue-800">
              <CalendarCheck className="w-5 h-5" />
            </div>
          </div>
          <div className="flex items-baseline gap-2 mt-3">
            <p className="font-playfair text-2xl font-bold text-[#003527]">{confirmedBookings}</p>
            <span className="text-xs text-[#707974]">Confirmed Appointments</span>
          </div>
          <div className="flex items-center justify-between text-xs mt-2 text-[#707974]">
            <span className="text-amber-700 font-semibold">{pendingBookings} awaiting confirmation</span>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-[#003527] hover:underline font-bold text-[11px] cursor-pointer"
            >
              View →
            </button>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-white p-5 rounded-2xl border border-[#bfc9c3]/40 shadow-xs hover:border-[#003527]/40 transition-all">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-[#707974]">
              Verification Submissions
            </span>
            <div className="w-9 h-9 rounded-xl bg-amber-50 flex items-center justify-center text-amber-800">
              <Clock className="w-5 h-5" />
            </div>
          </div>
          <p className="font-playfair text-2xl font-bold text-[#003527] mt-3">
            {pendingSubmissions}
          </p>
          <div className="flex items-center justify-between text-xs mt-2 text-[#707974]">
            <span>Awaiting Field Engineer</span>
            <button
              onClick={() => onNavigateTab('verification')}
              className="text-[#003527] hover:underline font-bold text-[11px] cursor-pointer"
            >
              Review →
            </button>
          </div>
        </div>
      </div>

      {/* Two Column Grid: Verification Queue + Upcoming Bookings */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Physical Verification Queue (7 cols) */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-playfair text-lg font-bold text-[#003527] flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-[#fed65b]" />
                Physical Audit & Verification Queue
              </h2>
              <p className="text-xs text-[#707974] mt-0.5">
                Homeowner and developer listing requests undergoing Rivers State Ministry of Lands checks
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('verification')}
              className="text-xs font-bold text-[#003527] hover:underline flex items-center gap-1 cursor-pointer"
            >
              All Submissions <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {submissions.slice(0, 3).map((sub) => (
              <div
                key={sub.id || sub.title}
                className="p-4 rounded-xl border border-[#bfc9c3]/40 hover:border-[#003527]/50 hover:bg-[#fbf9f8] transition-all flex flex-col sm:flex-row sm:items-center justify-between gap-4"
              >
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-[#003527]/10 text-[#003527]">
                      {sub.location}
                    </span>
                    <span
                      className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-full ${
                        sub.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'in_progress'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sub.status === 'approved'
                        ? 'Approved'
                        : sub.status === 'in_progress'
                        ? 'In Audit'
                        : 'Pending Audit'}
                    </span>
                  </div>
                  <h3 className="text-sm font-bold text-[#1b1c1c] leading-snug">{sub.title}</h3>
                  <div className="flex items-center gap-3 text-xs text-[#707974]">
                    <span>Owner: {sub.ownerName}</span>
                    <span>•</span>
                    <span className="font-semibold text-[#003527]">{sub.titleDocType}</span>
                  </div>
                </div>

                <div className="flex items-center gap-2 self-end sm:self-center">
                  <button
                    onClick={() => onNavigateTab('verification')}
                    className="px-3.5 py-1.5 rounded-lg bg-[#003527] text-white text-xs font-bold hover:bg-[#064e3b] transition-colors cursor-pointer"
                  >
                    Audit Report
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Column: Scheduled Inspections (5 cols) */}
        <div className="lg:col-span-5 bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs space-y-5">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="font-playfair text-lg font-bold text-[#003527] flex items-center gap-2">
                <CalendarCheck className="w-5 h-5 text-[#003527]" />
                Scheduled Client Viewings
              </h2>
              <p className="text-xs text-[#707974] mt-0.5">
                Prospective buyer and tenant appointments
              </p>
            </div>
            <button
              onClick={() => onNavigateTab('bookings')}
              className="text-xs font-bold text-[#003527] hover:underline flex items-center gap-1 cursor-pointer"
            >
              View All <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="space-y-3">
            {bookings.slice(0, 3).map((booking) => (
              <div
                key={booking.id}
                className="p-3.5 rounded-xl border border-[#bfc9c3]/40 bg-[#FCF9F2]/50 hover:bg-[#FCF9F2] transition-colors space-y-2"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-[#1b1c1c]">{booking.name}</span>
                  <span
                    className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded-md ${
                      booking.status === 'confirmed'
                        ? 'bg-emerald-100 text-emerald-800'
                        : booking.status === 'completed'
                        ? 'bg-neutral-200 text-neutral-800'
                        : 'bg-amber-100 text-amber-800'
                    }`}
                  >
                    {booking.status}
                  </span>
                </div>
                <p className="text-xs font-medium text-[#404944] truncate">{booking.propertyTitle}</p>
                <div className="flex items-center justify-between text-[11px] text-[#707974]">
                  <span>📅 {booking.preferredDate} at {booking.preferredTime}</span>
                  <span className="font-semibold text-[#003527]">{booking.assignedSpecialist}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Neighborhood Inventory Distribution & Quick Property Cards */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Neighborhood Distribution (4 cols) */}
        <div className="lg:col-span-4 bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs space-y-4">
          <h2 className="font-playfair text-lg font-bold text-[#003527]">
            Port Harcourt Inventory
          </h2>
          <p className="text-xs text-[#707974]">
            Distribution of luxury residential inventory across key high-yield corridors:
          </p>

          <div className="space-y-3 pt-2">
            {Object.entries(neighborhoodCounts).map(([neighborhood, count]) => {
              const percentage = Math.round((count / properties.length) * 100);
              return (
                <div key={neighborhood} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-semibold">
                    <span className="text-[#1b1c1c]">{neighborhood}</span>
                    <span className="text-[#707974]">{count} units ({percentage}%)</span>
                  </div>
                  <div className="w-full bg-[#f0eded] h-2 rounded-full overflow-hidden">
                    <div
                      className="bg-[#003527] h-full rounded-full transition-all duration-500"
                      style={{ width: `${Math.max(percentage, 10)}%` }}
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </div>

        {/* Recent Registered Properties (8 cols) */}
        <div className="lg:col-span-8 bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="font-playfair text-lg font-bold text-[#003527]">
              Featured Property Portfolio
            </h2>
            <button
              onClick={() => onNavigateTab('properties')}
              className="text-xs font-bold text-[#003527] hover:underline flex items-center gap-1 cursor-pointer"
            >
              Full Inventory Table <ChevronRight className="w-4 h-4" />
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {properties.slice(0, 4).map((prop) => (
              <div
                key={prop.id}
                onClick={() => onViewProperty(prop)}
                className="group border border-[#bfc9c3]/40 rounded-xl p-3 hover:border-[#003527] hover:shadow-md transition-all flex gap-3 cursor-pointer bg-white"
              >
                <div className="w-24 h-24 rounded-lg overflow-hidden shrink-0 relative">
                  <img
                    src={prop.images[0]}
                    alt={prop.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                  />
                  {prop.isVerified && (
                    <span className="absolute top-1 left-1 bg-[#003527] text-[#fed65b] p-1 rounded-sm">
                      <ShieldCheck className="w-3 h-3" />
                    </span>
                  )}
                </div>
                <div className="flex-1 min-w-0 flex flex-col justify-between py-0.5">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-[#735c00]">
                      {prop.neighborhood}
                    </span>
                    <h4 className="text-xs font-bold text-[#1b1c1c] truncate group-hover:text-[#003527]">
                      {prop.title}
                    </h4>
                    <p className="text-xs font-extrabold text-[#003527] mt-1">
                      {prop.priceDisplay} {prop.pricePeriod || ''}
                    </p>
                  </div>
                  <div className="flex items-center justify-between text-[11px] text-[#707974] pt-1 border-t border-[#bfc9c3]/20">
                    <span>{prop.bedrooms} Beds • {prop.bathrooms} Baths</span>
                    <span className="text-[#003527] font-semibold">Audit: {prop.inspectionReport?.overallScore}%</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
