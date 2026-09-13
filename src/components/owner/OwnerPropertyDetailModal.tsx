import React, { useState } from 'react';
import { BedDouble, Building2, CheckCircle2, FileText, MapPin, Pencil, Tag, X } from 'lucide-react';
import { Property, PropertySubmission } from '../../types';

interface OwnerPropertyDetailModalProps {
  property?: Property;
  submission?: PropertySubmission;
  onClose: () => void;
  onEdit?: () => void;
}

export const OwnerPropertyDetailModal: React.FC<OwnerPropertyDetailModalProps> = ({
  property,
  submission,
  onClose,
  onEdit,
}) => {
  const images = submission?.images || property?.images || [];
  const [activeImage, setActiveImage] = useState(images[0] || '');
  const title = submission?.title || property?.title || 'Property listing';
  const location = submission?.location || property?.location || '';
  const address = submission?.address || property?.address || location;
  const price = Number(submission?.price ?? property?.price ?? 0);
  const listingType = submission?.listingType || property?.type || 'sale';
  const propertyType = submission?.propertyType || property?.propertyType || 'Property';
  const bedrooms = Number(submission?.bedrooms ?? property?.bedrooms ?? 0);
  const bathrooms = Number(submission?.bathrooms ?? property?.bathrooms ?? 0);
  const description = submission?.description || property?.description || 'No description has been provided.';
  const status = submission?.status || property?.status || 'approved';
  const isPendingUpdate = status === 'pending' && Boolean(submission?.approvedPropertyId);
  const statusLabel = isPendingUpdate
    ? 'Pending Update Approval'
    : status === 'approved'
      ? 'Approved'
      : status.charAt(0).toUpperCase() + status.slice(1);

  return (
    <div className="fixed inset-0 z-[70] bg-black/75 backdrop-blur-sm flex items-center justify-center p-2 sm:p-5">
      <section className="bg-[#FCF9F2] w-full max-w-4xl max-h-[94vh] rounded-2xl overflow-hidden shadow-2xl border border-white/40 flex flex-col">
        <header className="bg-[#003527] text-white px-4 sm:px-6 py-4 flex items-center justify-between gap-4">
          <div className="min-w-0">
            <p className="text-[10px] uppercase tracking-wider text-[#fed65b] font-bold">Your Property Listing</p>
            <h2 className="font-playfair text-xl sm:text-2xl font-bold truncate">{title}</h2>
          </div>
          <button type="button" onClick={onClose} className="p-2 rounded-lg bg-white/10 hover:bg-white/20 cursor-pointer" aria-label="Close property details">
            <X className="w-5 h-5" />
          </button>
        </header>

        <div className="overflow-y-auto p-4 sm:p-6 space-y-5">
          <div className="relative h-56 sm:h-80 rounded-2xl overflow-hidden bg-[#e7ece9]">
            {activeImage ? (
              <img src={activeImage} alt={title} className="w-full h-full object-cover" />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-[#738078]"><Building2 className="w-14 h-14" /></div>
            )}
            <span className={`absolute top-3 left-3 text-white text-[10px] font-bold px-3 py-1.5 rounded-full ${isPendingUpdate ? 'bg-amber-600' : status === 'approved' ? 'bg-emerald-700' : 'bg-slate-700'}`}>
              {statusLabel}
            </span>
          </div>

          {images.length > 1 && (
            <div className="flex gap-2 overflow-x-auto pb-1">
              {images.map((image, index) => (
                <button key={`${image}-${index}`} type="button" onClick={() => setActiveImage(image)} className={`w-20 h-16 shrink-0 rounded-lg overflow-hidden border-2 cursor-pointer ${activeImage === image ? 'border-[#003527]' : 'border-transparent'}`}>
                  <img src={image} alt={`${title} ${index + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-3">
            <div>
              <h3 className="font-playfair text-2xl font-bold text-[#003527]">{title}</h3>
              <p className="text-sm text-[#606963] flex items-center gap-1 mt-1"><MapPin className="w-4 h-4" />{address}</p>
            </div>
            <div className="sm:text-right">
              <p className="text-xl font-bold text-[#003527]">₦{price.toLocaleString()}</p>
              <p className="text-xs font-semibold text-[#707974] capitalize">For {listingType}</p>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-white border border-[#d9e0dc] rounded-xl p-3"><Building2 className="w-4 h-4 text-[#003527]" /><span className="block text-[10px] text-[#707974] mt-2">PROPERTY TYPE</span><strong className="text-sm">{propertyType}</strong></div>
            <div className="bg-white border border-[#d9e0dc] rounded-xl p-3"><BedDouble className="w-4 h-4 text-[#003527]" /><span className="block text-[10px] text-[#707974] mt-2">BEDROOMS</span><strong className="text-sm">{bedrooms}</strong></div>
            <div className="bg-white border border-[#d9e0dc] rounded-xl p-3"><CheckCircle2 className="w-4 h-4 text-[#003527]" /><span className="block text-[10px] text-[#707974] mt-2">BATHROOMS</span><strong className="text-sm">{bathrooms}</strong></div>
            <div className="bg-white border border-[#d9e0dc] rounded-xl p-3"><Tag className="w-4 h-4 text-[#003527]" /><span className="block text-[10px] text-[#707974] mt-2">LISTING</span><strong className="text-sm capitalize">{listingType}</strong></div>
          </div>

          <div className="bg-white border border-[#d9e0dc] rounded-xl p-4">
            <h4 className="font-bold text-[#003527] mb-2">Property Description</h4>
            <p className="text-sm text-[#505a54] leading-relaxed whitespace-pre-line">{description}</p>
          </div>

          {submission?.titleDocType && (
            <div className="flex items-center gap-2 text-sm text-[#505a54]"><FileText className="w-4 h-4 text-[#003527]" /><strong>Title document:</strong> {submission.titleDocType}</div>
          )}

          <div className="flex justify-end gap-3 pt-1">
            <button type="button" onClick={onClose} className="px-5 py-2.5 rounded-xl border border-[#bfc9c3] text-sm font-bold text-[#003527] hover:bg-white cursor-pointer">Close</button>
            {onEdit && status === 'approved' && (
              <button type="button" onClick={onEdit} className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#003527] text-[#fed65b] text-sm font-bold hover:bg-[#064e3b] cursor-pointer">
                <Pencil className="w-4 h-4" /> Edit Property
              </button>
            )}
          </div>
        </div>
      </section>
    </div>
  );
};
