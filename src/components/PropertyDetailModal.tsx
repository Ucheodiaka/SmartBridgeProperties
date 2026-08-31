import React, { useState, useEffect } from 'react';
import {
  X,
  MapPin,
  Bed,
  Bath,
  Car,
  Maximize2,
  ShieldCheck,
  CheckCircle2,
  Calendar,
  Phone,
  MessageCircle,
  Share2,
  Heart,
  ChevronLeft,
  ChevronRight,
  Droplet,
  Zap,
  Lock,
  FileText,
  Video,
  Film,
  Play,
  MessageSquare,
  Building2,
} from 'lucide-react';
import { Property } from '../types';
import { PropertyDetailSkeleton } from './skeletons/PropertyDetailSkeleton';

interface PropertyDetailModalProps {
  property: Property;
  onClose: () => void;
  onScheduleInspection: (property: Property) => void;
  onOpenInquiry?: (property: Property) => void;
  isSaved: boolean;
  onToggleSave: (id: string) => void;
  onShare: (property: Property) => void;
}

export const PropertyDetailModal: React.FC<PropertyDetailModalProps> = ({
  property,
  onClose,
  onScheduleInspection,
  onOpenInquiry,
  isSaved,
  onToggleSave,
  onShare,
}) => {
  const [isLoading, setIsLoading] = useState(true);
  const [activeImageIndex, setActiveImageIndex] = useState(0);
  const [activeTab, setActiveTab] = useState<'overview' | 'inspection' | 'video'>('overview');
  const [imageLoaded, setImageLoaded] = useState(false);

  useEffect(() => {
    // Brief smooth skeleton hydration
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 280);
    return () => clearTimeout(timer);
  }, [property.id]);

  const nextImage = () => {
    setImageLoaded(false);
    setActiveImageIndex((prev) => (prev + 1) % property.images.length);
  };

  const prevImage = () => {
    setImageLoaded(false);
    setActiveImageIndex((prev) => (prev - 1 + property.images.length) % property.images.length);
  };

  const handleWhatsAppChat = () => {
    const text = encodeURIComponent(
      `Hello ${property.agent.name}, I am interested in inspecting "${property.title}" (${property.priceDisplay}${property.pricePeriod || ''}) in ${property.location} on SmartBridge Properties.`
    );
    window.open(`https://wa.me/${property.agent.whatsapp}?text=${text}`, '_blank');
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
        <PropertyDetailSkeleton />
      </div>
    );
  }

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-[#FCF9F2] w-full max-w-5xl rounded-xl sm:rounded-2xl overflow-hidden shadow-2xl border border-white/40 flex flex-col max-h-[95vh] sm:max-h-[92vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Sticky Modal Header Bar */}
        <div className="sticky top-0 z-30 bg-[#fbf9f8]/95 backdrop-blur-md px-4 sm:px-6 py-3.5 sm:py-4 border-b border-[#bfc9c3]/30 flex items-center justify-between gap-2">
          <div className="flex flex-wrap items-center gap-1.5 sm:gap-2">
            <span
              className={`text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md uppercase tracking-wider ${
                property.type === 'sale'
                  ? 'bg-[#fed65b] text-[#745c00]'
                  : 'bg-[#2b6954] text-white'
              }`}
            >
              For {property.type === 'sale' ? 'Sale' : 'Rent'}
            </span>
            {property.isVerified && (
              <span className="bg-[#003527] text-white text-[10px] sm:text-xs font-bold px-2 sm:px-2.5 py-0.5 sm:py-1 rounded-md uppercase tracking-wider flex items-center gap-1">
                <ShieldCheck className="w-3 sm:w-3.5 h-3 sm:h-3.5 text-[#fed65b]" />
                <span className="hidden xs:inline">100% </span>Verified
              </span>
            )}
          </div>

          <div className="flex items-center gap-1.5 sm:gap-2">
            <button
              onClick={() => onToggleSave(property.id)}
              className="p-1.5 sm:p-2 rounded-lg bg-white border border-[#bfc9c3]/50 text-[#1b1c1c] hover:bg-[#f0eded] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title={isSaved ? 'Remove from Saved' : 'Save Property'}
            >
              <Heart
                className={`w-4 sm:w-5 h-4 sm:h-5 ${
                  isSaved ? 'fill-[#ba1a1a] text-[#ba1a1a]' : 'text-[#404944]'
                }`}
              />
            </button>
            <button
              onClick={() => onShare(property)}
              className="p-1.5 sm:p-2 rounded-lg bg-white border border-[#bfc9c3]/50 text-[#1b1c1c] hover:bg-[#f0eded] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Share Listing"
            >
              <Share2 className="w-4 sm:w-5 h-4 sm:h-5 text-[#404944]" />
            </button>
            <button
              onClick={onClose}
              className="p-1.5 sm:p-2 rounded-lg bg-[#003527] text-white hover:bg-[#064e3b] transition-colors cursor-pointer ml-0.5 min-h-[36px] min-w-[36px] flex items-center justify-center"
              title="Close"
            >
              <X className="w-4 sm:w-5 h-4 sm:h-5" />
            </button>
          </div>
        </div>

        {/* Modal Scrollable Body */}
        <div className="overflow-y-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {/* Main Gallery Carousel */}
          <div className="relative rounded-xl overflow-hidden bg-black aspect-[4/3] sm:aspect-[16/9] md:aspect-[21/9] max-h-[440px]">
            {!imageLoaded && (
              <div className="absolute inset-0 skeleton-shimmer-dark z-0" />
            )}
            <img
              src={property.images[activeImageIndex]}
              alt={property.title}
              onLoad={() => setImageLoaded(true)}
              className={`w-full h-full object-cover transition-opacity duration-300 relative z-1 ${
                imageLoaded ? 'opacity-100' : 'opacity-0'
              }`}
            />

            {/* Navigation Arrows */}
            {property.images.length > 1 && (
              <>
                <button
                  onClick={prevImage}
                  className="absolute left-2 sm:left-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer z-10"
                >
                  <ChevronLeft className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>
                <button
                  onClick={nextImage}
                  className="absolute right-2 sm:right-4 top-1/2 -translate-y-1/2 w-8 h-8 sm:w-10 sm:h-10 rounded-full bg-black/60 hover:bg-black/80 text-white flex items-center justify-center backdrop-blur-xs transition-all cursor-pointer z-10"
                >
                  <ChevronRight className="w-5 sm:w-6 h-5 sm:h-6" />
                </button>
              </>
            )}

            {/* Thumbnail dots preview */}
            <div className="absolute bottom-3 sm:bottom-4 left-1/2 -translate-x-1/2 flex items-center gap-1.5 sm:gap-2 bg-black/60 backdrop-blur-xs px-2.5 sm:px-3 py-1 sm:py-1.5 rounded-full z-10">
              {property.images.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImageIndex(idx)}
                  className={`w-2 sm:w-2.5 h-2 sm:h-2.5 rounded-full transition-all cursor-pointer ${
                    activeImageIndex === idx ? 'bg-[#fed65b] w-4 sm:w-6' : 'bg-white/60 hover:bg-white'
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Heading & Key Pricing Row */}
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sm:gap-6 pb-4 sm:pb-6 border-b border-[#bfc9c3]/30">
            <div>
              <div className="flex items-center gap-1.5 text-xs font-bold text-[#003527] uppercase tracking-wider mb-1.5 sm:mb-2">
                <MapPin className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#003527] shrink-0" />
                <span>{property.address}</span>
              </div>
              <h1 className="font-playfair text-xl sm:text-2xl md:text-3xl lg:text-4xl font-bold text-[#1b1c1c]">
                {property.title}
              </h1>
            </div>

            <div className="bg-white p-3.5 sm:p-4 rounded-xl border border-[#bfc9c3]/40 shadow-xs md:text-right shrink-0">
              <span className="text-xs text-[#707974] block font-medium">Verified Asking Price</span>
              <p className="font-bold text-xl sm:text-2xl md:text-3xl text-[#003527] tracking-tight">
                {property.priceDisplay}
                {property.pricePeriod && (
                  <span className="text-xs sm:text-sm font-normal text-[#404944]">
                    {property.pricePeriod}
                  </span>
                )}
              </p>
            </div>
          </div>

          {/* Quick Specs Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5 sm:gap-4">
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#bfc9c3]/30 text-center shadow-xs">
              <Bed className="w-4 sm:w-5 h-4 sm:h-5 text-[#003527] mx-auto mb-1" />
              <span className="block text-base sm:text-lg font-bold text-[#1b1c1c]">{property.bedrooms}</span>
              <span className="text-[10px] sm:text-xs text-[#707974] uppercase font-semibold">Bedrooms</span>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#bfc9c3]/30 text-center shadow-xs">
              <Bath className="w-4 sm:w-5 h-4 sm:h-5 text-[#003527] mx-auto mb-1" />
              <span className="block text-base sm:text-lg font-bold text-[#1b1c1c]">{property.bathrooms}</span>
              <span className="text-[10px] sm:text-xs text-[#707974] uppercase font-semibold">Bathrooms</span>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#bfc9c3]/30 text-center shadow-xs">
              <Car className="w-4 sm:w-5 h-4 sm:h-5 text-[#003527] mx-auto mb-1" />
              <span className="block text-base sm:text-lg font-bold text-[#1b1c1c]">{property.parkingSpaces}</span>
              <span className="text-[10px] sm:text-xs text-[#707974] uppercase font-semibold">Parking Bays</span>
            </div>
            <div className="bg-white p-3 sm:p-4 rounded-xl border border-[#bfc9c3]/30 text-center shadow-xs">
              <Maximize2 className="w-4 sm:w-5 h-4 sm:h-5 text-[#003527] mx-auto mb-1" />
              <span className="block text-base sm:text-lg font-bold text-[#1b1c1c]">
                {property.sizeSqFt.toLocaleString()}
              </span>
              <span className="text-[10px] sm:text-xs text-[#707974] uppercase font-semibold">Sq Feet</span>
            </div>
          </div>

          {/* Tabs Navigation (Overview / Inspection Report) */}
          <div className="flex border-b border-[#bfc9c3]/40 gap-4 sm:gap-8 overflow-x-auto no-scrollbar">
            <button
              onClick={() => setActiveTab('overview')}
              className={`pb-2.5 sm:pb-3 text-xs sm:text-sm md:text-base font-bold transition-colors relative cursor-pointer whitespace-nowrap ${
                activeTab === 'overview'
                  ? 'text-[#003527]'
                  : 'text-[#707974] hover:text-[#003527]'
              }`}
            >
              Property Overview
              {activeTab === 'overview' && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[2.5px] bg-[#003527] rounded-full" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('inspection')}
              className={`pb-2.5 sm:pb-3 text-xs sm:text-sm md:text-base font-bold transition-colors relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                activeTab === 'inspection'
                  ? 'text-[#003527]'
                  : 'text-[#707974] hover:text-[#003527]'
              }`}
            >
              <ShieldCheck className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#fed65b]" />
              Inspection Report ({property.inspectionReport.overallScore}/100)
              {activeTab === 'inspection' && (
                <span className="absolute bottom-[-1px] left-0 w-full h-[2.5px] bg-[#003527] rounded-full" />
              )}
            </button>
            {(property.videoUrl || (property.videos && property.videos.length > 0)) && (
              <button
                onClick={() => setActiveTab('video')}
                className={`pb-2.5 sm:pb-3 text-xs sm:text-sm md:text-base font-bold transition-colors relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                  activeTab === 'video'
                    ? 'text-[#003527]'
                    : 'text-[#707974] hover:text-[#003527]'
                }`}
              >
                <Film className="w-3.5 sm:w-4 h-3.5 sm:h-4 text-[#003527]" />
                Video Walkthrough
                <span className="bg-[#fed65b] text-[#735c00] text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                  HD
                </span>
                {activeTab === 'video' && (
                  <span className="absolute bottom-[-1px] left-0 w-full h-[2.5px] bg-[#003527] rounded-full" />
                )}
              </button>
            )}
          </div>

          {/* Tab Content */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* Description */}
              <div>
                <h3 className="text-lg font-bold text-[#1b1c1c] mb-3">About This Residence</h3>
                <p className="text-sm md:text-base text-[#404944] leading-relaxed">
                  {property.description}
                </p>
              </div>

              {/* Features & Amenities */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4">
                <div className="bg-white p-5 rounded-xl border border-[#bfc9c3]/30 shadow-xs">
                  <h4 className="text-sm font-bold text-[#003527] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-[#003527]" />
                    Key Interior & Structural Features
                  </h4>
                  <ul className="space-y-2.5">
                    {property.features.map((feat) => (
                      <li key={feat} className="text-xs md:text-sm text-[#404944] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#fed65b]" />
                        {feat}
                      </li>
                    ))}
                  </ul>
                </div>

                <div className="bg-white p-5 rounded-xl border border-[#bfc9c3]/30 shadow-xs">
                  <h4 className="text-sm font-bold text-[#003527] uppercase tracking-wider mb-4 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-[#003527]" />
                    Estate Amenities & Utilities
                  </h4>
                  <ul className="space-y-2.5">
                    {property.amenities.map((amen) => (
                      <li key={amen} className="text-xs md:text-sm text-[#404944] flex items-center gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-[#003527]" />
                        {amen}
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'inspection' && (
            <div className="space-y-6">
              {/* Inspection Audit Header Banner */}
              <div className="bg-[#003527] text-white p-6 rounded-xl shadow-md flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <div className="inline-flex items-center gap-1 text-xs font-bold text-[#fed65b] uppercase tracking-wider mb-1">
                    <ShieldCheck className="w-4 h-4 text-[#fed65b]" />
                    The Port Harcourt Standard Certified Audit
                  </div>
                  <h3 className="text-xl font-bold">
                    Physical Inspection Score: {property.inspectionReport.overallScore}%
                  </h3>
                  <p className="text-xs text-white/80 mt-1">
                    Audited on {property.inspectionReport.inspectedDate} by {property.inspectionReport.inspectorName} ({property.inspectionReport.inspectorId})
                  </p>
                </div>
                <div className="bg-[#fed65b] text-[#241a00] font-bold text-xs px-3.5 py-2 rounded-lg">
                  Title: {property.inspectionReport.titleDocumentType} (Verified)
                </div>
              </div>

              {/* Grid of Key Risk Indicators */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/30">
                  <span className="text-xs text-[#707974] flex items-center gap-1 mb-1 font-semibold uppercase">
                    <FileText className="w-3.5 h-3.5 text-[#003527]" /> Land Registry
                  </span>
                  <p className="text-sm font-bold text-[#003527]">
                    {property.inspectionReport.titleVerified ? 'Ministry Search Passed' : 'Under Review'}
                  </p>
                  <p className="text-xs text-[#404944] mt-0.5">Title Document: {property.inspectionReport.titleDocumentType}</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/30">
                  <span className="text-xs text-[#707974] flex items-center gap-1 mb-1 font-semibold uppercase">
                    <Droplet className="w-3.5 h-3.5 text-[#2b6954]" /> Flood Index
                  </span>
                  <p className="text-sm font-bold text-[#003527]">
                    {property.inspectionReport.floodRisk}
                  </p>
                  <p className="text-xs text-[#404944] mt-0.5">Topographical elevation test passed</p>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/30">
                  <span className="text-xs text-[#707974] flex items-center gap-1 mb-1 font-semibold uppercase">
                    <Zap className="w-3.5 h-3.5 text-[#fed65b]" /> Power & Security
                  </span>
                  <p className="text-sm font-bold text-[#003527]">
                    {property.inspectionReport.securityRating}
                  </p>
                  <p className="text-xs text-[#404944] mt-0.5">{property.inspectionReport.powerGridStability}</p>
                </div>
              </div>

              {/* Checklist Breakdown */}
              <div className="bg-white rounded-xl border border-[#bfc9c3]/30 p-5">
                <h4 className="text-sm font-bold text-[#1b1c1c] uppercase tracking-wider mb-4">
                  Detailed Checklist Breakdown
                </h4>
                <div className="space-y-3">
                  {property.inspectionReport.checklist.map((item, index) => (
                    <div
                      key={index}
                      className="p-3.5 rounded-lg bg-[#fbf9f8] border border-[#bfc9c3]/20 flex items-start gap-3"
                    >
                      <CheckCircle2 className="w-4 h-4 text-[#003527] shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-[#1b1c1c]">{item.name}</span>
                          <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-sm bg-[#003527]/10 text-[#003527]">
                            {item.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#404944] mt-1">{item.notes}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Video Walkthrough Tab Content */}
          {activeTab === 'video' && (
            <div className="space-y-4">
              <div className="bg-[#003527] text-white p-5 rounded-xl flex items-center justify-between">
                <div>
                  <h3 className="font-playfair text-lg font-bold flex items-center gap-2">
                    <Film className="w-5 h-5 text-[#fed65b]" />
                    High-Definition Virtual Video Walkthrough
                  </h3>
                  <p className="text-xs text-white/80 mt-0.5">
                    Stream the complete physical tour captured on-site in {property.location}.
                  </p>
                </div>
                <span className="bg-[#fed65b] text-[#745c00] text-xs font-bold px-3 py-1 rounded-md hidden sm:inline-block">
                  Verified Authentic Recording
                </span>
              </div>

              <div className="rounded-xl overflow-hidden bg-black border border-[#bfc9c3]/50 shadow-lg aspect-video max-h-[460px] flex items-center justify-center relative">
                {property.videoUrl?.startsWith('http') || (property.videos && property.videos.length > 0) ? (
                  <video
                    src={property.videoUrl || property.videos?.[0]}
                    controls
                    autoPlay
                    playsInline
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="p-8 text-center text-white/80">
                    <Video className="w-12 h-12 text-[#fed65b] mx-auto mb-2 opacity-80" />
                    <p className="text-sm">Video stream ready for viewing.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Owner / Advertiser Verification Banner */}
          <div className="bg-[#fbf9f8] p-4 sm:p-5 rounded-xl border border-[#bfc9c3]/50 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-[#003527] text-[#fed65b] flex items-center justify-center font-bold shrink-0">
                <Building2 className="w-5 h-5" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-bold text-[#1b1c1c]">
                    {property.ownerName || 'Verified Property Advertiser'}
                  </span>
                  <span className="bg-emerald-100 text-emerald-800 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-0.5">
                    <ShieldCheck className="w-3 h-3 text-emerald-700" /> Verified Landlord
                  </span>
                </div>
                <p className="text-[11px] text-[#707974] mt-0.5">
                  Direct listing with SmartBridge title verification & escrow protection.
                </p>
              </div>
            </div>

            {onOpenInquiry && (
              <button
                type="button"
                onClick={() => onOpenInquiry(property)}
                className="w-full sm:w-auto bg-[#003527] text-[#fed65b] font-semibold text-xs sm:text-sm px-4 py-2.5 rounded-lg hover:bg-[#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-2xs border border-[#fed65b]/40"
              >
                <MessageSquare className="w-4 h-4 text-[#fed65b]" />
                Inquire / Send Offer to Owner
              </button>
            )}
          </div>

          {/* Assigned Local Agent Section */}
          <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/30 shadow-xs flex flex-col sm:flex-row items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <img
                src={property.agent.avatar}
                alt={property.agent.name}
                className="w-14 h-14 rounded-full object-cover border-2 border-[#fed65b]"
              />
              <div>
                <div className="inline-flex items-center gap-1 text-[10px] font-bold text-[#745c00] bg-[#fed65b]/30 px-2 py-0.5 rounded-full mb-1">
                  {property.agent.badge}
                </div>
                <h4 className="font-bold text-base text-[#1b1c1c]">{property.agent.name}</h4>
                <p className="text-xs text-[#707974]">{property.agent.role}</p>
              </div>
            </div>

            <div className="flex flex-wrap items-center gap-3 w-full sm:w-auto">
              <button
                onClick={handleWhatsAppChat}
                className="flex-1 sm:flex-none bg-[#25D366] text-white font-semibold text-xs md:text-sm px-4 sm:px-5 py-3 rounded-[10px] hover:bg-[#20ba59] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <MessageCircle className="w-4 h-4" />
                Chat on WhatsApp
              </button>
              <button
                onClick={() => onScheduleInspection(property)}
                className="flex-1 sm:flex-none bg-[#003527] text-white font-semibold text-xs md:text-sm px-4 sm:px-5 py-3 rounded-[10px] hover:bg-[#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <Calendar className="w-4 h-4 text-[#fed65b]" />
                Schedule Physical Viewing
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
