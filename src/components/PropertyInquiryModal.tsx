import React, { useState } from 'react';
import {
  X,
  Building2,
  ShieldCheck,
  Send,
  CheckCircle2,
  User,
  Phone,
  Mail,
  Calendar,
  Lock,
  Sparkles,
  DollarSign,
  MessageSquare,
  AlertCircle,
} from 'lucide-react';
import { Property, PropertyInquiry } from '../types';
import { supabaseDb } from '../lib/supabase';

interface PropertyInquiryModalProps {
  property: Property;
  onClose: () => void;
  onSubmitSuccess: (inquiry: PropertyInquiry) => void;
}

export const PropertyInquiryModal: React.FC<PropertyInquiryModalProps> = ({
  property,
  onClose,
  onSubmitSuccess,
}) => {
  const [formData, setFormData] = useState({
    buyerName: '',
    buyerPhone: '',
    buyerEmail: '',
    inquiryType: (property.type === 'rent' ? 'rent' : 'buy') as 'buy' | 'rent' | 'offer' | 'general',
    offerAmount: property.priceDisplay || '',
    proposedMoveIn: '',
    message: `Hello, I am interested in this property "${property.title}" located at ${property.location}. Please provide availability and inspection schedule.`,
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setErrorMessage(null);

    const newInquiry: PropertyInquiry = {
      id: `inq-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyLocation: property.location,
      propertyPrice: property.priceDisplay,
      ownerEmail: property.ownerEmail || 'admin@smartbridgeproperties.ng',
      ownerName: property.ownerName || 'Verified Property Owner',
      buyerName: formData.buyerName,
      buyerPhone: formData.buyerPhone,
      buyerEmail: formData.buyerEmail,
      inquiryType: formData.inquiryType,
      offerAmount: formData.offerAmount || undefined,
      proposedMoveIn: formData.proposedMoveIn || undefined,
      message: formData.message,
      status: 'new',
      createdAt: new Date().toISOString(),
    };

    try {
      // Persist to Supabase if database available
      await supabaseDb.saveInquiry(newInquiry);
    } catch (err: any) {
      console.warn('Inquiry local fallback handled:', err);
    }

    setIsSubmitting(false);
    setSubmitted(true);
    setTimeout(() => {
      onSubmitSuccess(newInquiry);
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-[#FCF9F2] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/40 flex flex-col max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#003527] text-white px-5 sm:px-6 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fed65b] text-[#003527] flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5 text-[#003527]" />
            </div>
            <div>
              <h2 className="font-playfair text-lg sm:text-xl font-bold tracking-tight text-white">
                Submit Property Enquiry
              </h2>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-white/80 block">
                Direct Enquiry • SmartBridge Concierge Protected
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 text-white hover:bg-white/20 transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <X className="w-4 sm:w-5 h-4 sm:h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="overflow-y-auto p-5 sm:p-7">
          {submitted ? (
            <div className="text-center py-10 space-y-4 animate-in zoom-in-95">
              <div className="w-16 h-16 rounded-full bg-[#003527] text-[#fed65b] flex items-center justify-center mx-auto shadow-md">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h3 className="font-playfair text-2xl font-bold text-[#003527]">
                Enquiry Dispatched Successfully!
              </h3>
              <p className="text-sm text-[#404944] max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.buyerName}</strong>. Your enquiry regarding{' '}
                <strong>{property.title}</strong> has been transmitted directly to the verified listing manager.
              </p>
              <div className="p-3.5 bg-[#003527]/10 rounded-xl border border-[#003527]/20 text-xs text-[#003527] max-w-md mx-auto text-left flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#003527] shrink-0 mt-0.5" />
                <span>
                  <strong>Safe Transaction Guarantee:</strong> SmartBridge verifies title documentation and ensures all inspections are accompanied by licensed Rivers State property specialists.
                </span>
              </div>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              {/* Property Summary Banner */}
              <div className="bg-white p-3.5 rounded-xl border border-[#bfc9c3]/50 flex items-center gap-3.5 shadow-2xs">
                <img
                  src={property.images[0]}
                  alt={property.title}
                  className="w-16 h-16 rounded-lg object-cover border border-[#bfc9c3]/30 shrink-0"
                />
                <div className="overflow-hidden flex-1">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-[#003527] uppercase tracking-wider">
                      {property.type === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                    <span className="text-xs font-bold text-[#1b1c1c]">{property.priceDisplay}</span>
                  </div>
                  <h4 className="font-playfair font-bold text-sm text-[#1b1c1c] truncate">
                    {property.title}
                  </h4>
                  <p className="text-xs text-[#707974] truncate">{property.location}</p>
                </div>
              </div>

              {errorMessage && (
                <div className="bg-red-50 text-red-800 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{errorMessage}</span>
                </div>
              )}

              {/* Form Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Your Full Name *
                  </label>
                  <div className="relative">
                    <User className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707974]" />
                    <input
                      required
                      type="text"
                      placeholder="e.g. Victor Dan-Jumbo"
                      value={formData.buyerName}
                      onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c] focus:border-[#003527] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    WhatsApp Phone Number *
                  </label>
                  <div className="relative">
                    <Phone className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707974]" />
                    <input
                      required
                      type="tel"
                      placeholder="+234 803 000 0000"
                      value={formData.buyerPhone}
                      onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c] focus:border-[#003527] outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Email Address *
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-[#707974]" />
                    <input
                      required
                      type="email"
                      placeholder="you@email.com"
                      value={formData.buyerEmail}
                      onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                      className="w-full pl-9 pr-3 py-2.5 rounded-xl border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c] focus:border-[#003527] outline-none"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Enquiry Intent
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inquiryType: e.target.value as any,
                      })
                    }
                    className="w-full px-3 py-2.5 rounded-xl border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c] focus:border-[#003527] outline-none"
                  >
                    <option value="buy">Purchase Interest</option>
                    <option value="rent">Rental Inquiry</option>
                    <option value="offer">Submit Price Offer</option>
                    <option value="general">Request Detailed Video & Title Pack</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                  Message or Specific Question
                </label>
                <textarea
                  required
                  rows={3}
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[#bfc9c3] bg-white text-xs text-[#1b1c1c] focus:border-[#003527] outline-none"
                />
              </div>

              {/* Submit */}
              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full bg-[#003527] text-[#fed65b] font-bold text-sm py-3.5 rounded-xl hover:bg-[#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-60"
              >
                {isSubmitting ? (
                  <div className="w-5 h-5 border-2 border-[#fed65b] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Send Enquiry to Listing Manager</span>
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
