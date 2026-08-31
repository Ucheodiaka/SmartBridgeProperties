import React, { useState } from 'react';
import {
  LayoutDashboard,
  Building2,
  ShieldCheck,
  CalendarCheck,
  TrendingUp,
  Users,
  LogOut,
  Plus,
  ArrowLeft,
  Bell,
  Search,
  ExternalLink,
  ChevronRight,
  Shield,
  Sparkles,
} from 'lucide-react';
import { Property, InspectionBooking, PropertySubmission, AdminTab, AuditStatus, BookingStatus, AgentInfo } from '../../types';
import { AdminOverview } from './AdminOverview';
import { AdminPropertiesTable } from './AdminPropertiesTable';
import { AdminVerificationQueue } from './AdminVerificationQueue';
import { AdminBookingsManager } from './AdminBookingsManager';
import { AdminAnalytics } from './AdminAnalytics';
import { AdminAgentsManager } from './AdminAgentsManager';
import { AdminPropertyEditorModal } from './AdminPropertyEditorModal';

interface AdminDashboardProps {
  properties: Property[];
  bookings: InspectionBooking[];
  submissions: PropertySubmission[];
  agents: AgentInfo[];
  onBackToMarketplace: () => void;
  onSaveProperty: (property: Property) => void;
  onDeleteProperty: (propertyId: string) => void;
  onToggleVerified: (propertyId: string) => void;
  onToggleFeatured: (propertyId: string) => void;
  onUpdateSubmissionStatus: (submissionId: string, status: AuditStatus, notes?: string) => void;
  onApproveAndPublishSubmission: (submission: PropertySubmission, auditScore: number) => void;
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus, specialist?: string) => void;
  onViewPropertyDetail: (property: Property) => void;
}

export const AdminDashboard: React.FC<AdminDashboardProps> = ({
  properties,
  bookings,
  submissions,
  agents,
  onBackToMarketplace,
  onSaveProperty,
  onDeleteProperty,
  onToggleVerified,
  onToggleFeatured,
  onUpdateSubmissionStatus,
  onApproveAndPublishSubmission,
  onUpdateBookingStatus,
  onViewPropertyDetail,
}) => {
  const [activeTab, setActiveTab] = useState<AdminTab>('overview');
  const [editorModalOpen, setEditorModalOpen] = useState(false);
  const [editingProperty, setEditingProperty] = useState<Property | null>(null);

  const pendingSubmissionsCount = submissions.filter(
    (s) => s.status === 'pending_audit' || s.status === 'in_progress'
  ).length;

  const pendingBookingsCount = bookings.filter((b) => b.status === 'pending').length;

  const handleOpenCreate = () => {
    setEditingProperty(null);
    setEditorModalOpen(true);
  };

  const handleEditProperty = (prop: Property) => {
    setEditingProperty(prop);
    setEditorModalOpen(true);
  };

  const navTabs = [
    { id: 'overview' as AdminTab, label: 'Overview', icon: LayoutDashboard },
    {
      id: 'properties' as AdminTab,
      label: 'Properties Registry',
      icon: Building2,
      count: properties.length,
    },
    {
      id: 'verification' as AdminTab,
      label: 'Audit & Title Verification',
      icon: ShieldCheck,
      badge: pendingSubmissionsCount > 0 ? pendingSubmissionsCount : undefined,
    },
    {
      id: 'bookings' as AdminTab,
      label: 'Inspection Bookings',
      icon: CalendarCheck,
      badge: pendingBookingsCount > 0 ? pendingBookingsCount : undefined,
    },
    { id: 'analytics' as AdminTab, label: 'Market Analytics', icon: TrendingUp },
    { id: 'agents' as AdminTab, label: 'Advisors & Inspectors', icon: Users },
  ];

  return (
    <div className="min-h-screen bg-[#FCF9F2] text-[#1b1c1c] flex flex-col font-inter">
      {/* Admin Top Navigation Header */}
      <header className="sticky top-0 z-40 bg-[#003527] text-white border-b border-[#003527]/40 shadow-md">
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 h-20 flex items-center justify-between">
          {/* Logo & Admin Status */}
          <div className="flex items-center gap-4">
            <div className="w-10 h-10 rounded-xl bg-[#fed65b] text-[#003527] flex items-center justify-center shadow-md font-bold">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="font-playfair text-xl md:text-2xl font-bold tracking-tight text-white leading-none">
                  SmartBridge <span className="font-normal text-[#fed65b]">Admin</span>
                </span>
                <span className="bg-[#fed65b]/20 text-[#fed65b] text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full border border-[#fed65b]/30">
                  Operations Desk
                </span>
              </div>
              <span className="text-[11px] text-[#fed65b]/80 font-medium block mt-0.5">
                Port Harcourt Physical Verification & Asset Registry
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-3">
            <button
              id="btn-admin-add-listing-header"
              onClick={handleOpenCreate}
              className="hidden sm:flex items-center gap-2 bg-[#fed65b] text-[#003527] text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#ffe285] transition-all shadow-xs cursor-pointer"
            >
              <Plus className="w-4 h-4" /> New Listing
            </button>

            {/* Back to Client Marketplace */}
            <button
              id="btn-back-to-marketplace"
              onClick={onBackToMarketplace}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-4 py-2.5 rounded-xl border border-white/20 transition-all flex items-center gap-2 cursor-pointer"
            >
              <ArrowLeft className="w-4 h-4" />
              <span className="hidden sm:inline">Public Marketplace</span>
              <span className="sm:hidden">Exit</span>
            </button>
          </div>
        </div>

        {/* Tab Navigation Strip */}
        <div className="w-full max-w-[1400px] mx-auto px-4 md:px-8 flex items-center gap-1 overflow-x-auto no-scrollbar border-t border-white/10">
          {navTabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                id={`admin-tab-${tab.id}`}
                onClick={() => setActiveTab(tab.id)}
                className={`py-3 px-3.5 text-xs font-bold whitespace-nowrap flex items-center gap-2 border-b-2 transition-all cursor-pointer ${
                  isActive
                    ? 'border-[#fed65b] text-[#fed65b] bg-white/5'
                    : 'border-transparent text-white/70 hover:text-white hover:bg-white/5'
                }`}
              >
                <Icon className="w-4 h-4" />
                {tab.label}
                {tab.count !== undefined && (
                  <span className="text-[10px] bg-white/20 px-1.5 py-0.2 rounded-full font-semibold">
                    {tab.count}
                  </span>
                )}
                {tab.badge !== undefined && (
                  <span className="text-[10px] bg-[#fed65b] text-[#003527] px-1.5 py-0.2 rounded-full font-bold animate-pulse">
                    {tab.badge}
                  </span>
                )}
              </button>
            );
          })}
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 w-full max-w-[1400px] mx-auto px-4 md:px-8 py-8">
        {activeTab === 'overview' && (
          <AdminOverview
            properties={properties}
            bookings={bookings}
            submissions={submissions}
            onNavigateTab={setActiveTab}
            onOpenCreateProperty={handleOpenCreate}
            onViewProperty={onViewPropertyDetail}
          />
        )}

        {activeTab === 'properties' && (
          <AdminPropertiesTable
            properties={properties}
            onOpenCreate={handleOpenCreate}
            onEditProperty={handleEditProperty}
            onDeleteProperty={onDeleteProperty}
            onToggleVerified={onToggleVerified}
            onToggleFeatured={onToggleFeatured}
            onViewProperty={onViewPropertyDetail}
          />
        )}

        {activeTab === 'verification' && (
          <AdminVerificationQueue
            submissions={submissions}
            onUpdateSubmissionStatus={onUpdateSubmissionStatus}
            onApproveAndPublish={onApproveAndPublishSubmission}
          />
        )}

        {activeTab === 'bookings' && (
          <AdminBookingsManager
            bookings={bookings}
            onUpdateBookingStatus={onUpdateBookingStatus}
          />
        )}

        {activeTab === 'analytics' && (
          <AdminAnalytics
            properties={properties}
            bookings={bookings}
          />
        )}

        {activeTab === 'agents' && (
          <AdminAgentsManager
            agents={agents}
          />
        )}
      </main>

      {/* Property Editor Modal */}
      {editorModalOpen && (
        <AdminPropertyEditorModal
          isOpen={editorModalOpen}
          property={editingProperty}
          onClose={() => setEditorModalOpen(false)}
          onSave={onSaveProperty}
        />
      )}
    </div>
  );
};
