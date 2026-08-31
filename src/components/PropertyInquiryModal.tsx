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
} from 'lucide-react';
import { Property, PropertyInquiry } from '../types';

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
    message: `Hello, I am interested in this property "${property.title}" located at ${property.location}. Please provide availability and title verification clearance.`,
    smartBridgeEscrowRequested: true,
  });

  const [submitted, setSubmitted] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    const newInquiry: PropertyInquiry = {
      id: `inq-${Date.now()}`,
      propertyId: property.id,
      propertyTitle: property.title,
      propertyLocation: property.location,
      propertyPrice: property.priceDisplay,
      ownerEmail: property.ownerEmail || 'boma.briggs@oilserv-group.com',
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
      smartBridgeEscrowRequested: formData.smartBridgeEscrowRequested,
    };

    setTimeout(() => {
      setIsSubmitting(false);
      setSubmitted(true);
      setTimeout(() => {
        onSubmitSuccess(newInquiry);
      }, 1500);
    }, 600);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-[#FCF9F2] w-full max-w-2xl rounded-2xl overflow-hidden shadow-2xl border border-white/40 flex flex-col max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="sticky top-0 z-10 bg-[#fbf9f8]/95 backdrop-blur-md px-5 sm:px-6 py-4 border-b border-[#bfc9c3]/30 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#003527] text-white flex items-center justify-center shadow-xs">
              <MessageSquare className="w-5 h-5 text-[#fed65b]" />
            </div>
            <div>
              <h2 className="font-playfair text-lg sm:text-xl font-bold text-[#003527]">
                Contact Property Owner / Advertiser
              </h2>
              <span className="text-[10px] uppercase tracking-wider font-semibold text-[#707974] block">
                Direct Inquiry • SmartBridge Escrow Protected
              </span>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-[#003527] text-white hover:bg-[#064e3b] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
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
                Inquiry Dispatched to Advertiser!
              </h3>
              <p className="text-sm text-[#404944] max-w-md mx-auto leading-relaxed">
                Thank you, <strong>{formData.buyerName}</strong>. Your inquiry and offer for{' '}
                <strong>{property.title}</strong> have been routed directly to the verified owner's
                portal inbox.
              </p>
              <div className="p-3.5 bg-[#003527]/10 rounded-xl border border-[#003527]/20 text-xs text-[#003527] max-w-md mx-auto text-left flex items-start gap-2.5">
                <ShieldCheck className="w-4 h-4 text-[#003527] shrink-0 mt-0.5" />
                <span>
                  <strong>Anti-Fraud Shield:</strong> SmartBridge verifies ownership and protects all
                  in-person viewings and title transfers. You will also receive a copy via WhatsApp.
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
                      {property.location}
                    </span>
                    <span className="text-[10px] bg-[#fed65b]/30 text-[#735c00] font-bold px-1.5 py-0.2 rounded-xs">
                      {property.type === 'rent' ? 'For Rent' : 'For Sale'}
                    </span>
                  </div>
                  <h4 className="font-playfair font-bold text-sm text-[#1b1c1c] truncate">
                    {property.title}
                  </h4>
                  <p className="text-xs font-bold text-[#003527] mt-0.5">
                    {property.priceDisplay}
                    {property.pricePeriod && (
                      <span className="text-[10px] font-normal text-[#707974]">
                        {property.pricePeriod}
                      </span>
                    )}
                  </p>
                </div>
              </div>

              {/* Inquiry Type & Offer */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Inquiry Intent *
                  </label>
                  <select
                    value={formData.inquiryType}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        inquiryType: e.target.value as 'buy' | 'rent' | 'offer' | 'general',
                      })
                    }
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                  >
                    <option value="buy">Direct Purchase Inquiry</option>
                    <option value="rent">Annual Rental Lease</option>
                    <option value="offer">Submit Price Offer / Bid</option>
                    <option value="general">General Questions / Title Search</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Proposed Offer / Budget (₦)
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. 240,000,000"
                    value={formData.offerAmount}
                    onChange={(e) => setFormData({ ...formData, offerAmount: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                  />
                </div>
              </div>

              {/* Buyer Contact Details */}
              <div className="space-y-4 pt-2">
                <h4 className="text-xs font-bold text-[#707974] uppercase tracking-wider flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-[#003527]" />
                  Your Contact Particulars
                </h4>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Full Legal Name *
                  </label>
                  <input
                    required
                    type="text"
                    placeholder="e.g. Engr. Dapo Alabi"
                    value={formData.buyerName}
                    onChange={(e) => setFormData({ ...formData, buyerName: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                      Phone Number (WhatsApp Active) *
                    </label>
                    <input
                      required
                      type="tel"
                      placeholder="+234 803 000 0000"
                      value={formData.buyerPhone}
                      onChange={(e) => setFormData({ ...formData, buyerPhone: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                      Official Email Address *
                    </label>
                    <input
                      required
                      type="email"
                      placeholder="dapo.alabi@company.com"
                      value={formData.buyerEmail}
                      onChange={(e) => setFormData({ ...formData, buyerEmail: e.target.value })}
                      className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Message to Property Advertiser / Owner *
                  </label>
                  <textarea
                    required
                    rows={3}
                    value={formData.message}
                    onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                  />
                </div>

                {/* Safe Escrow Checkbox */}
                <div className="bg-[#003527]/5 p-3.5 rounded-xl border border-[#003527]/15 flex items-start gap-3 cursor-pointer">
                  <input
                    type="checkbox"
                    id="escrow_check"
                    checked={formData.smartBridgeEscrowRequested}
                    onChange={(e) =>
                      setFormData({ ...formData, smartBridgeEscrowRequested: e.target.checked })
                    }
                    className="mt-1 rounded text-[#003527] focus:ring-[#003527] cursor-pointer"
                  />
                  <label htmlFor="escrow_check" className="text-xs text-[#003527] cursor-pointer leading-relaxed">
                    <strong>Enable SmartBridge Anti-Fraud Protection:</strong> Route payment inquiries
                    through SmartBridge Escrow & verify all C of O / Governor's Consent documents
                    with the Rivers State Ministry of Lands prior to fund release.
                  </label>
                </div>
              </div>

              {/* Submit CTA */}
              <div className="pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full bg-[#003527] text-white font-semibold text-sm py-3.5 rounded-[10px] hover:bg-[#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-50"
                >
                  <Send className="w-4 h-4 text-[#fed65b]" />
                  {isSubmitting ? 'Transmitting to Owner...' : 'Send Inquiry to Property Advertiser'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
