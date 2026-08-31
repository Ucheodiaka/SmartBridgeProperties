import React, { useState } from 'react';
import { X, Calendar, Clock, MapPin, CheckCircle2, ShieldCheck, User, Phone, Mail } from 'lucide-react';
import { Property, InspectionBooking } from '../types';

interface ScheduleInspectionModalProps {
  property: Property;
  onClose: () => void;
  onBookingConfirmed: (booking: InspectionBooking) => void;
}

export const ScheduleInspectionModal: React.FC<ScheduleInspectionModalProps> = ({
  property,
  onClose,
  onBookingConfirmed,
}) => {
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    preferredDate: new Date(Date.now() + 86400000).toISOString().split('T')[0],
    preferredTime: '10:00 AM',
    notes: '',
  });

  const [isSuccess, setIsSuccess] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSuccess(true);
    setTimeout(() => {
      onBookingConfirmed({
        propertyId: property.id,
        propertyTitle: property.title,
        ...formData,
      });
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-[#FCF9F2] w-full max-w-lg rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/40 flex flex-col relative max-h-[95vh] sm:max-h-[90vh]"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header Bar */}
        <div className="bg-[#fbf9f8] px-4 sm:px-6 py-4 sm:py-5 border-b border-[#bfc9c3]/30 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#003527]" />
            <h2 className="font-playfair text-lg sm:text-xl font-bold text-[#003527]">
              Schedule Physical Viewing
            </h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-lg bg-[#003527] text-white hover:bg-[#064e3b] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-4 sm:p-6 md:p-8 overflow-y-auto">
          {isSuccess ? (
            <div className="text-center py-8 space-y-4">
              <div className="w-14 h-14 rounded-full bg-[#003527] text-[#fed65b] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-8 h-8" />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-[#003527]">
                Inspection Booked!
              </h3>
              <p className="text-xs md:text-sm text-[#404944] leading-relaxed">
                Your physical inspection of <strong>{property.title}</strong> is booked for <strong>{formData.preferredDate} at {formData.preferredTime}</strong>.
              </p>
              <p className="text-xs text-[#707974]">
                Assigned Specialist: <strong>{property.agent.name}</strong> ({property.agent.phone})
              </p>
              <div className="pt-2">
                <button
                  onClick={onClose}
                  className="bg-[#003527] text-white font-semibold px-6 py-2.5 rounded-lg text-xs cursor-pointer"
                >
                  Done
                </button>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Property Summary Pill */}
              <div className="p-3.5 rounded-xl bg-white border border-[#bfc9c3]/30 flex items-center gap-3">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-12 h-12 rounded-lg object-cover"
                />
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-[#1b1c1c] truncate">{property.title}</h4>
                  <p className="text-[11px] text-[#003527] font-semibold flex items-center gap-1">
                    <MapPin className="w-3 h-3" /> {property.location} • {property.priceDisplay}
                  </p>
                </div>
              </div>

              {/* Input Fields */}
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1 uppercase">
                  Full Name *
                </label>
                <div className="relative">
                  <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707974]" />
                  <input
                    required
                    type="text"
                    placeholder="e.g. Dr. Emeka Nwankwo"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1 uppercase">
                    Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707974]" />
                    <input
                      required
                      type="tel"
                      placeholder="+234..."
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1 uppercase">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707974]" />
                    <input
                      type="email"
                      placeholder="name@email.com"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c]"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1 uppercase">
                    Preferred Date *
                  </label>
                  <input
                    required
                    type="date"
                    value={formData.preferredDate}
                    onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1 uppercase">
                    Preferred Time
                  </label>
                  <select
                    value={formData.preferredTime}
                    onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                    className="w-full px-3 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c]"
                  >
                    <option value="09:00 AM">09:00 AM (Morning)</option>
                    <option value="11:00 AM">11:00 AM (Mid-Day)</option>
                    <option value="02:00 PM">02:00 PM (Afternoon)</option>
                    <option value="04:30 PM">04:30 PM (Golden Hour)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1 uppercase">
                  Special Notes or Requirements
                </label>
                <textarea
                  rows={2}
                  placeholder="e.g. Inquiring about generator servicing and parking capacity"
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c]"
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#003527] text-white font-semibold text-xs py-3.5 rounded-[10px] hover:bg-[#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs mt-2"
              >
                <Calendar className="w-4 h-4 text-[#fed65b]" />
                Confirm Inspection Appointment
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
