import React, { useMemo, useState } from 'react';
import {
  Search,
  MessageSquare,
  Phone,
  Mail,
  MapPin,
  Building2,
  Clock,
  ExternalLink,
  Users,
  CalendarDays,
  UserCheck,
  Save,
  CheckCircle2,
} from 'lucide-react';
import {
  AdminStaffAccount,
  InquiryStatus,
  LeadFollowUpUpdate,
  PropertyInquiry,
} from '../../types';

interface AdminLeadsProps {
  inquiries: PropertyInquiry[];
  currentAdminStaff?: AdminStaffAccount | null;
  onUpdateStatus: (inquiryId: string, status: InquiryStatus) => void;
  onUpdateFollowUp: (inquiryId: string, updates: LeadFollowUpUpdate) => Promise<boolean>;
}

const statusOptions: Array<{ value: InquiryStatus; label: string }> = [
  { value: 'new', label: 'New' },
  { value: 'contacted', label: 'Contacted' },
  { value: 'tour_scheduled', label: 'Viewing Scheduled' },
  { value: 'closed', label: 'Closed' },
];

const statusStyles: Record<InquiryStatus, string> = {
  new: 'bg-amber-100 text-amber-800 border-amber-200',
  contacted: 'bg-blue-100 text-blue-800 border-blue-200',
  tour_scheduled: 'bg-purple-100 text-purple-800 border-purple-200',
  closed: 'bg-emerald-100 text-emerald-800 border-emerald-200',
};

const formatMoney = (value?: string) => {
  const amount = Number(value);
  if (!Number.isFinite(amount) || amount <= 0) return value || 'Not provided';
  return new Intl.NumberFormat('en-NG', {
    style: 'currency',
    currency: 'NGN',
    maximumFractionDigits: 0,
  }).format(amount);
};

const formatDateTime = (value?: string) => {
  if (!value) return 'Not recorded';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('en-NG', {
    dateStyle: 'medium',
    timeStyle: 'short',
  }).format(date);
};

const formatFollowUpDate = (value?: string) => {
  if (!value) return 'Not scheduled';
  const dateOnly = value.slice(0, 10);
  const date = new Date(`${dateOnly}T12:00:00`);
  if (Number.isNaN(date.getTime())) return dateOnly;
  return new Intl.DateTimeFormat('en-NG', { dateStyle: 'medium' }).format(date);
};

export const AdminLeads: React.FC<AdminLeadsProps> = ({
  inquiries,
  currentAdminStaff,
  onUpdateStatus,
  onUpdateFollowUp,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'all' | 'due_today' | InquiryStatus>('all');
  const [noteDrafts, setNoteDrafts] = useState<Record<string, string>>({});
  const [followUpDrafts, setFollowUpDrafts] = useState<Record<string, string>>({});
  const [savingId, setSavingId] = useState<string | null>(null);
  const today = new Date().toISOString().slice(0, 10);

  const filteredInquiries = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    return inquiries.filter((inquiry) => {
      const isDue =
        Boolean(inquiry.followUpAt) &&
        inquiry.followUpAt!.slice(0, 10) <= today &&
        inquiry.status !== 'closed';
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === 'due_today' ? isDue : inquiry.status === statusFilter);
      const matchesQuery =
        !query ||
        [
          inquiry.buyerName,
          inquiry.buyerEmail,
          inquiry.buyerPhone,
          inquiry.propertyTitle,
          inquiry.propertyLocation,
          inquiry.ownerName,
          inquiry.ownerEmail,
          inquiry.assignedStaffName,
        ]
          .filter(Boolean)
          .some((value) => String(value).toLowerCase().includes(query));

      return matchesStatus && matchesQuery;
    });
  }, [inquiries, searchQuery, statusFilter, today]);

  const newCount = inquiries.filter((inquiry) => inquiry.status === 'new').length;
  const activeCount = inquiries.filter((inquiry) =>
    ['contacted', 'tour_scheduled'].includes(inquiry.status)
  ).length;
  const dueCount = inquiries.filter(
    (inquiry) =>
      inquiry.followUpAt &&
      inquiry.followUpAt.slice(0, 10) <= today &&
      inquiry.status !== 'closed'
  ).length;

  const saveFollowUp = async (inquiryId: string, updates: LeadFollowUpUpdate) => {
    setSavingId(inquiryId);
    await onUpdateFollowUp(inquiryId, updates);
    setSavingId(null);
  };

  return (
    <section className="space-y-6">
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
        <div>
          <span className="text-xs font-bold uppercase tracking-[0.18em] text-[#707974]">
            Property seeker pipeline
          </span>
          <h2 className="font-playfair text-2xl md:text-3xl font-bold text-[#003527] mt-1">
            Leads & Follow-Up
          </h2>
          <p className="text-sm text-[#707974] mt-1">
            Record contact attempts, private notes, ownership, and the next action for every lead.
          </p>
        </div>

        <div className="grid grid-cols-3 gap-2 min-w-full sm:min-w-[420px] lg:min-w-[480px]">
          {[
            { label: 'New', value: newCount, className: 'text-amber-700' },
            { label: 'In progress', value: activeCount, className: 'text-blue-700' },
            { label: 'Due today', value: dueCount, className: 'text-red-700' },
          ].map((item) => (
            <div key={item.label} className="bg-white border border-[#bfc9c3]/40 rounded-xl p-3 text-center">
              <div className={`text-xl font-bold ${item.className}`}>{item.value}</div>
              <div className="text-[10px] uppercase tracking-wider font-bold text-[#707974]">
                {item.label}
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-[#bfc9c3]/40 rounded-2xl p-4 flex flex-col md:flex-row gap-3">
        <label className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#707974]" />
          <input
            type="search"
            value={searchQuery}
            onChange={(event) => setSearchQuery(event.target.value)}
            placeholder="Search buyer, property, phone, vendor or staff"
            className="w-full pl-10 pr-4 py-3 rounded-xl border border-[#bfc9c3]/60 bg-[#FCF9F2] text-sm outline-none focus:ring-2 focus:ring-[#003527]/20"
          />
        </label>
        <select
          value={statusFilter}
          onChange={(event) => setStatusFilter(event.target.value as 'all' | 'due_today' | InquiryStatus)}
          className="px-4 py-3 rounded-xl border border-[#bfc9c3]/60 bg-[#FCF9F2] text-sm font-semibold text-[#003527] outline-none"
        >
          <option value="all">All leads</option>
          <option value="due_today">Due today or overdue</option>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>{option.label}</option>
          ))}
        </select>
      </div>

      {filteredInquiries.length === 0 ? (
        <div className="bg-white border border-[#bfc9c3]/40 rounded-2xl p-10 text-center">
          <MessageSquare className="w-11 h-11 text-[#707974]/40 mx-auto mb-3" />
          <h3 className="font-playfair text-lg font-bold text-[#003527]">No matching leads</h3>
          <p className="text-sm text-[#707974] mt-1">New property enquiries will appear here automatically.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredInquiries.map((inquiry) => {
            const whatsappNumber = inquiry.buyerPhone.replace(/[^0-9]/g, '');
            const whatsappMessage = encodeURIComponent(
              `Hello ${inquiry.buyerName}, this is SmartBridge Properties regarding your enquiry for ${inquiry.propertyTitle}.`
            );
            const noteValue = noteDrafts[inquiry.id] ?? inquiry.adminNotes ?? '';
            const followUpValue = followUpDrafts[inquiry.id] ?? inquiry.followUpAt?.slice(0, 10) ?? '';
            const isSaving = savingId === inquiry.id;

            return (
              <article key={inquiry.id} className="bg-white border border-[#bfc9c3]/40 rounded-2xl overflow-hidden shadow-xs">
                <div className="p-4 md:p-5 space-y-5">
                  <div className="flex flex-col xl:flex-row xl:items-start justify-between gap-4">
                    <div className="space-y-4 min-w-0 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <h3 className="font-bold text-base text-[#1b1c1c]">{inquiry.buyerName}</h3>
                        <span className={`text-[10px] uppercase font-bold px-2 py-1 rounded-full border ${statusStyles[inquiry.status]}`}>
                          {statusOptions.find((option) => option.value === inquiry.status)?.label || inquiry.status}
                        </span>
                        <span className="text-[10px] uppercase font-bold text-[#003527] bg-[#003527]/10 px-2 py-1 rounded-full">
                          {inquiry.inquiryType}
                        </span>
                      </div>

                      <div className="grid sm:grid-cols-2 gap-3 text-xs text-[#404944]">
                        <div className="flex items-start gap-2">
                          <Building2 className="w-4 h-4 text-[#003527] shrink-0" />
                          <div>
                            <div className="font-bold text-[#1b1c1c]">{inquiry.propertyTitle}</div>
                            <div className="flex items-center gap-1 text-[#707974] mt-0.5">
                              <MapPin className="w-3 h-3" /> {inquiry.propertyLocation}
                            </div>
                            <div className="font-semibold text-[#003527] mt-1">
                              Listed price: {formatMoney(inquiry.propertyPrice)}
                            </div>
                          </div>
                        </div>
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2"><Phone className="w-3.5 h-3.5 text-[#003527]" /> {inquiry.buyerPhone}</div>
                          <div className="flex items-center gap-2 break-all"><Mail className="w-3.5 h-3.5 text-[#003527]" /> {inquiry.buyerEmail}</div>
                          <div className="flex items-center gap-2"><Clock className="w-3.5 h-3.5 text-[#003527]" /> Received {formatDateTime(inquiry.createdAt)}</div>
                        </div>
                      </div>

                      <div className="bg-[#FCF9F2] border border-[#bfc9c3]/30 rounded-xl p-3 text-sm text-[#404944]">
                        {inquiry.message}
                      </div>

                      <div className="flex flex-wrap gap-x-6 gap-y-2 text-xs">
                        {inquiry.offerAmount && <span><strong>Offer:</strong> {formatMoney(inquiry.offerAmount)}</span>}
                        {inquiry.proposedMoveIn && <span><strong>Timeline:</strong> {inquiry.proposedMoveIn}</span>}
                        <span><strong>Vendor:</strong> {inquiry.ownerName || inquiry.ownerEmail || 'Check property record'}</span>
                      </div>
                    </div>

                    <div className="w-full xl:w-60 space-y-3">
                      <label className="block text-[10px] uppercase tracking-wider font-bold text-[#707974]">Lead status</label>
                      <select
                        value={inquiry.status}
                        onChange={(event) => onUpdateStatus(inquiry.id, event.target.value as InquiryStatus)}
                        className="w-full px-3 py-2.5 rounded-xl border border-[#bfc9c3]/60 bg-[#FCF9F2] text-xs font-bold text-[#003527] outline-none"
                      >
                        {statusOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
                      </select>

                      <a
                        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
                        target="_blank"
                        rel="noreferrer"
                        className="w-full bg-[#003527] text-[#fed65b] font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-[#064e3b] transition-colors"
                      >
                        <Phone className="w-4 h-4" /> Contact seeker <ExternalLink className="w-3 h-3" />
                      </a>
                      <a
                        href={`mailto:${inquiry.buyerEmail}?subject=${encodeURIComponent(`SmartBridge enquiry: ${inquiry.propertyTitle}`)}`}
                        className="w-full bg-white text-[#003527] border border-[#003527]/20 font-bold px-4 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 hover:bg-[#003527]/5 transition-colors"
                      >
                        <Mail className="w-4 h-4" /> Send email
                      </a>
                    </div>
                  </div>

                  <div className="border-t border-[#bfc9c3]/30 pt-5 grid lg:grid-cols-3 gap-4">
                    <div className="bg-[#FCF9F2] border border-[#bfc9c3]/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#003527]">
                          <UserCheck className="w-4 h-4" /> Lead owner
                        </div>
                        <span className="text-[10px] text-[#707974]">{inquiry.assignedStaffName || 'Unassigned'}</span>
                      </div>
                      <button
                        type="button"
                        disabled={!currentAdminStaff || isSaving}
                        onClick={() => currentAdminStaff && saveFollowUp(inquiry.id, {
                          assignedStaffId: currentAdminStaff.id,
                          assignedStaffName: currentAdminStaff.name,
                        })}
                        className="w-full bg-white border border-[#003527]/20 text-[#003527] rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50"
                      >
                        Assign to me
                      </button>
                    </div>

                    <div className="bg-[#FCF9F2] border border-[#bfc9c3]/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center gap-2 text-xs font-bold text-[#003527]">
                        <CalendarDays className="w-4 h-4" /> Next follow-up
                      </div>
                      <input
                        type="date"
                        value={followUpValue}
                        onChange={(event) => setFollowUpDrafts((prev) => ({ ...prev, [inquiry.id]: event.target.value }))}
                        className="w-full bg-white border border-[#bfc9c3]/60 rounded-lg px-3 py-2 text-xs"
                      />
                      <div className="text-[10px] text-[#707974]">Saved: {formatFollowUpDate(inquiry.followUpAt)}</div>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => saveFollowUp(inquiry.id, {
                          followUpAt: followUpValue ? `${followUpValue}T09:00:00+01:00` : null,
                        })}
                        className="w-full bg-[#003527] text-[#fed65b] rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50"
                      >
                        Save follow-up date
                      </button>
                    </div>

                    <div className="bg-[#FCF9F2] border border-[#bfc9c3]/30 rounded-xl p-4 space-y-3">
                      <div className="flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 text-xs font-bold text-[#003527]">
                          <CheckCircle2 className="w-4 h-4" /> Contact attempts
                        </div>
                        <span className="text-lg font-bold text-[#003527]">{inquiry.contactAttempts || 0}</span>
                      </div>
                      <div className="text-[10px] text-[#707974]">Last contact: {formatDateTime(inquiry.lastContactedAt)}</div>
                      <button
                        type="button"
                        disabled={isSaving}
                        onClick={() => saveFollowUp(inquiry.id, {
                          contactAttempts: (inquiry.contactAttempts || 0) + 1,
                          lastContactedAt: new Date().toISOString(),
                        })}
                        className="w-full bg-white border border-[#003527]/20 text-[#003527] rounded-lg px-3 py-2 text-xs font-bold disabled:opacity-50"
                      >
                        Log contact attempt
                      </button>
                    </div>
                  </div>

                  <div className="bg-[#FCF9F2] border border-[#bfc9c3]/30 rounded-xl p-4 space-y-3">
                    <label className="flex items-center gap-2 text-xs font-bold text-[#003527]">
                      <MessageSquare className="w-4 h-4" /> Private admin note
                    </label>
                    <textarea
                      value={noteValue}
                      onChange={(event) => setNoteDrafts((prev) => ({ ...prev, [inquiry.id]: event.target.value }))}
                      placeholder="Record what was discussed, vendor feedback, or the next action..."
                      rows={3}
                      className="w-full bg-white border border-[#bfc9c3]/60 rounded-lg px-3 py-2 text-xs resize-y outline-none focus:ring-2 focus:ring-[#003527]/20"
                    />
                    <button
                      type="button"
                      disabled={isSaving}
                      onClick={() => saveFollowUp(inquiry.id, { adminNotes: noteValue })}
                      className="inline-flex items-center gap-2 bg-[#003527] text-[#fed65b] rounded-lg px-4 py-2 text-xs font-bold disabled:opacity-50"
                    >
                      <Save className="w-3.5 h-3.5" /> {isSaving ? 'Saving...' : 'Save private note'}
                    </button>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      )}

      <div className="bg-[#003527]/5 border border-[#003527]/15 rounded-xl p-4 flex items-start gap-3">
        <Users className="w-5 h-5 text-[#003527] shrink-0 mt-0.5" />
        <p className="text-xs text-[#404944] leading-relaxed">
          Follow-up notes and staff assignments are restricted to verified SmartBridge administrators. Property seekers and vendors cannot view this information.
        </p>
      </div>
    </section>
  );
};
