import React, { useState } from 'react';
import {
  CalendarCheck,
  Phone,
  Mail,
  MessageSquare,
  CheckCircle2,
  Clock,
  XCircle,
  Search,
  User,
  MapPin,
  Calendar,
  AlertCircle,
} from 'lucide-react';
import { InspectionBooking, BookingStatus } from '../../types';
import { INITIAL_AGENTS } from '../../data/adminData';

interface AdminBookingsManagerProps {
  bookings: InspectionBooking[];
  onUpdateBookingStatus: (bookingId: string, status: BookingStatus, specialist?: string) => void;
}

export const AdminBookingsManager: React.FC<AdminBookingsManagerProps> = ({
  bookings,
  onUpdateBookingStatus,
}) => {
  const [statusFilter, setStatusFilter] = useState<'all' | BookingStatus>('all');
  const [searchTerm, setSearchTerm] = useState('');

  const filteredBookings = bookings.filter((b) => {
    if (statusFilter !== 'all' && b.status !== statusFilter) return false;
    if (searchTerm.trim()) {
      const q = searchTerm.toLowerCase();
      return (
        b.name.toLowerCase().includes(q) ||
        b.propertyTitle.toLowerCase().includes(q) ||
        b.phone.toLowerCase().includes(q) ||
        b.email.toLowerCase().includes(q)
      );
    }
    return true;
  });

  const getWhatsAppLink = (booking: InspectionBooking) => {
    const rawNumber = booking.phone.replace(/[^0-9]/g, '');
    const text = encodeURIComponent(
      `Hello ${booking.name}, this is SmartBridge Properties regarding your scheduled inspection for "${booking.propertyTitle}" on ${booking.preferredDate} at ${booking.preferredTime}. We are pleased to confirm your appointment.`
    );
    return `https://wa.me/${rawNumber}?text=${text}`;
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-800 text-xs font-bold uppercase tracking-wider mb-2">
            <CalendarCheck className="w-3.5 h-3.5" />
            Client Viewings & Physical Inspections
          </div>
          <h1 className="font-playfair text-2xl font-bold text-[#003527]">
            Inspection Appointments Desk
          </h1>
          <p className="text-xs text-[#707974] mt-0.5">
            Coordinate buyer and tenant site viewings, assign luxury portfolio advisors, and confirm client arrival times.
          </p>
        </div>

        {/* Filter Badges */}
        <div className="flex flex-wrap items-center rounded-xl bg-[#fbf9f8] p-1 border border-[#bfc9c3]/40 gap-1">
          {(['all', 'pending', 'confirmed', 'completed', 'cancelled'] as const).map((st) => (
            <button
              key={st}
              onClick={() => setStatusFilter(st)}
              className={`px-3 py-1.5 rounded-lg text-xs font-bold capitalize transition-all cursor-pointer ${
                statusFilter === st ? 'bg-[#003527] text-white shadow-xs' : 'text-[#707974]'
              }`}
            >
              {st} ({bookings.filter((b) => (st === 'all' ? true : b.status === st)).length})
            </button>
          ))}
        </div>
      </div>

      {/* Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/40 shadow-xs">
        <div className="relative">
          <Search className="w-4 h-4 absolute left-3.5 top-3 text-[#707974]" />
          <input
            type="text"
            placeholder="Search client name, property, email, phone number..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-[#fbf9f8] border border-[#bfc9c3] rounded-lg pl-9 pr-4 py-2 text-xs text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
          />
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {filteredBookings.length === 0 ? (
          <div className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-12 text-center text-[#707974]">
            <CalendarCheck className="w-12 h-12 mx-auto text-[#bfc9c3] mb-3" />
            <h3 className="font-playfair text-lg font-bold text-[#1b1c1c]">No Appointments Found</h3>
            <p className="text-xs text-[#707974] mt-1">
              No inspection bookings match the selected status or search keywords.
            </p>
          </div>
        ) : (
          filteredBookings.map((booking) => (
            <div
              key={booking.id}
              className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-5 shadow-xs hover:border-[#003527]/40 transition-all space-y-4"
            >
              <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-3 border-b border-[#bfc9c3]/20">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full ${
                        booking.status === 'confirmed'
                          ? 'bg-emerald-100 text-emerald-800'
                          : booking.status === 'completed'
                          ? 'bg-neutral-200 text-neutral-800'
                          : booking.status === 'cancelled'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {booking.status}
                    </span>
                    <span className="text-xs font-bold text-[#003527]">
                      Booking Ref: {booking.id}
                    </span>
                  </div>
                  <h3 className="font-playfair text-lg font-bold text-[#1b1c1c]">
                    {booking.propertyTitle}
                  </h3>
                  {booking.propertyLocation && (
                    <p className="text-xs text-[#707974] flex items-center gap-1">
                      <MapPin className="w-3.5 h-3.5 text-[#735c00]" /> {booking.propertyLocation}
                    </p>
                  )}
                </div>

                {/* Date & Time Badge */}
                <div className="bg-[#003527]/5 border border-[#003527]/15 rounded-xl p-3 flex items-center gap-4 text-xs self-start lg:self-auto">
                  <div className="flex items-center gap-2">
                    <Calendar className="w-4 h-4 text-[#003527]" />
                    <span className="font-bold text-[#1b1c1c]">{booking.preferredDate}</span>
                  </div>
                  <div className="flex items-center gap-2 border-l border-[#bfc9c3]/50 pl-4">
                    <Clock className="w-4 h-4 text-[#735c00]" />
                    <span className="font-bold text-[#1b1c1c]">{booking.preferredTime}</span>
                  </div>
                </div>
              </div>

              {/* Client Info & Assigned Specialist */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* Client Contact */}
                <div className="bg-[#fbf9f8] p-3.5 rounded-xl border border-[#bfc9c3]/30 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#707974] block">
                    Prospective Client
                  </span>
                  <p className="font-bold text-sm text-[#1b1c1c]">{booking.name}</p>
                  <div className="flex items-center gap-2 text-[#404944]">
                    <Phone className="w-3.5 h-3.5 text-[#003527]" />
                    <a href={`tel:${booking.phone}`} className="hover:underline font-semibold">
                      {booking.phone}
                    </a>
                  </div>
                  <div className="flex items-center gap-2 text-[#404944]">
                    <Mail className="w-3.5 h-3.5 text-[#707974]" />
                    <a href={`mailto:${booking.email}`} className="hover:underline truncate">
                      {booking.email}
                    </a>
                  </div>
                </div>

                {/* Client Notes */}
                <div className="bg-[#fbf9f8] p-3.5 rounded-xl border border-[#bfc9c3]/30 space-y-1.5">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#707974] block">
                    Client Specific Notes
                  </span>
                  <p className="text-xs text-[#404944] italic">
                    "{booking.notes || 'No special requirements noted during booking.'}"
                  </p>
                </div>

                {/* Assigned Specialist Agent */}
                <div className="bg-[#fbf9f8] p-3.5 rounded-xl border border-[#bfc9c3]/30 space-y-2">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-[#707974] block">
                    Assigned Portfolio Advisor
                  </span>
                  <select
                    value={booking.assignedSpecialist || INITIAL_AGENTS[0].name}
                    onChange={(e) =>
                      onUpdateBookingStatus(booking.id, booking.status, e.target.value)
                    }
                    className="w-full bg-white border border-[#bfc9c3] rounded-lg p-2 text-xs font-semibold text-[#003527]"
                  >
                    {INITIAL_AGENTS.map((ag) => (
                      <option key={ag.id} value={ag.name}>
                        {ag.name} ({ag.role.split('-')[0]})
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Action Controls */}
              <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                <div className="flex items-center gap-2">
                  <a
                    href={getWhatsAppLink(booking)}
                    target="_blank"
                    rel="noreferrer"
                    className="px-3 py-1.5 rounded-lg bg-[#25D366]/15 hover:bg-[#25D366]/25 text-[#128C7E] font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <MessageSquare className="w-3.5 h-3.5" /> WhatsApp Client
                  </a>
                  <a
                    href={`tel:${booking.phone}`}
                    className="px-3 py-1.5 rounded-lg bg-neutral-100 hover:bg-neutral-200 text-[#1b1c1c] font-bold text-xs flex items-center gap-1.5 transition-colors"
                  >
                    <Phone className="w-3.5 h-3.5" /> Call Lead
                  </a>
                </div>

                {/* Status Switcher Buttons */}
                <div className="flex items-center gap-2">
                  {booking.status !== 'confirmed' && (
                    <button
                      onClick={() => onUpdateBookingStatus(booking.id, 'confirmed')}
                      className="px-3.5 py-1.5 rounded-lg bg-[#003527] text-white text-xs font-bold hover:bg-[#064e3b] transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5 text-[#fed65b]" /> Confirm Viewing
                    </button>
                  )}
                  {booking.status === 'confirmed' && (
                    <button
                      onClick={() => onUpdateBookingStatus(booking.id, 'completed')}
                      className="px-3.5 py-1.5 rounded-lg bg-emerald-700 text-white text-xs font-bold hover:bg-emerald-800 transition-all cursor-pointer flex items-center gap-1"
                    >
                      <CheckCircle2 className="w-3.5 h-3.5" /> Mark Completed
                    </button>
                  )}
                  {booking.status !== 'cancelled' && (
                    <button
                      onClick={() => onUpdateBookingStatus(booking.id, 'cancelled')}
                      className="px-3 py-1.5 rounded-lg border border-red-200 text-[#ba1a1a] text-xs font-semibold hover:bg-red-50 transition-colors cursor-pointer"
                    >
                      Cancel
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
