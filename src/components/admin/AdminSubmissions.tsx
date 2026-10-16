import React, { useState } from 'react';
import { Building2, CheckCircle2, Clock3, MapPin, Video, XCircle } from 'lucide-react';
import { AuditStatus, Property, PropertySubmission } from '../../types';

interface AdminSubmissionsProps {
  submissions: PropertySubmission[];
  properties: Property[];
  onApprove: (submission: PropertySubmission, score: number) => Promise<void>;
  onUpdateStatus: (submissionId: string, status: AuditStatus, notes?: string) => Promise<void>;
}

export const AdminSubmissions: React.FC<AdminSubmissionsProps> = ({
  submissions,
  properties,
  onApprove,
  onUpdateStatus,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const pendingCount = submissions.filter((submission) => submission.status === 'pending').length;

  const formatMoney = (value: number | string | undefined) =>
    `₦${Number(value || 0).toLocaleString()}`;
  const formatList = (value: string[] | undefined) =>
    value?.length ? [...value].sort().join(', ') : 'None supplied';
  const formatYesNo = (value: boolean | undefined) => value ? 'Yes' : 'No';

  const getPropertyChanges = (submission: PropertySubmission, current?: Property) => {
    if (!current) return [];

    const candidates = [
      ['Title', current.title, submission.title],
      ['Property category', current.propertyType, submission.propertyType],
      ['Listing purpose', current.type, submission.listingType],
      ['Location', current.location, submission.location],
      ['Full address', current.address, submission.address],
      ['Price', formatMoney(current.price), formatMoney(submission.price)],
      ['Negotiable', formatYesNo(current.isNegotiable), formatYesNo(submission.isNegotiable)],
      ['Distress sale', formatYesNo(current.isDistressSale), formatYesNo(submission.isDistressSale)],
      ['Lease duration', current.leaseTermYears ? `${current.leaseTermYears} years` : 'Not applicable', submission.leaseTermYears ? `${submission.leaseTermYears} years` : 'Not applicable'],
      ['Bedrooms', String(current.bedrooms ?? 0), String(submission.bedrooms ?? 0)],
      ['Bathrooms', String(current.bathrooms ?? 0), String(submission.bathrooms ?? 0)],
      ['Parking bays', String(current.parkingSpaces ?? 0), String(submission.parkingSpaces ?? 0)],
      ['Property size', `${Number(current.sizeSqFt || 0).toLocaleString()} sq ft`, `${Number(submission.sizeSqFt || 0).toLocaleString()} sq ft`],
      ['Total similar units', String(current.totalUnits ?? 1), String(submission.totalUnits ?? 1)],
      ['Units available', String(current.availableUnits ?? 1), String(submission.availableUnits ?? 1)],
      ['Interior & structural features', formatList(current.features), formatList(submission.features)],
      ['Amenities & utilities', formatList(current.amenities), formatList(submission.amenities)],
      ['Description', current.description || 'None supplied', submission.description || 'None supplied'],
      ['Agency fee', `${Number(current.agencyFeePercentage || 0)}%`, `${Number(submission.agencyFeePercentage || 0)}%`],
      ['Caution fee', formatMoney(current.cautionFee), formatMoney(submission.cautionFee)],
      ['Service charge', formatMoney(current.serviceCharge), formatMoney(submission.serviceCharge)],
      ['Legal fee', `${Number(current.legalFeePercentage || 0)}%`, `${Number(submission.legalFeePercentage || 0)}%`],
      ['Other charges', formatMoney(current.otherCharges), formatMoney(submission.otherCharges)],
      ['Other charge description', current.otherChargesDescription || 'None', submission.otherChargesDescription || 'None'],
      ['Property photos', `${current.images?.length || 0} photo(s)`, `${submission.images?.length || 0} photo(s)`],
      ['Walkthrough video', current.videos?.[0] || current.videoUrl ? 'Provided' : 'Not provided', submission.videos?.[0] || submission.videoUrl ? 'Provided' : 'Not provided'],
    ] as const;

    return candidates
      .filter(([, before, after]) => before !== after)
      .map(([label, before, after]) => ({ label, before, after }));
  };

  const handleApprove = async (submission: PropertySubmission) => {
    if (!submission.id || processingId) return;
    setProcessingId(submission.id);
    try {
      await onApprove(submission, 100);
    } finally {
      setProcessingId(null);
    }
  };

  const handleReject = async (submission: PropertySubmission) => {
    if (!submission.id || processingId) return;
    setProcessingId(submission.id);
    try {
      await onUpdateStatus(
        submission.id,
        'rejected',
        'Listing requires correction before it can be published.'
      );
    } finally {
      setProcessingId(null);
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      <section className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <h1 className="font-playfair text-2xl font-bold text-[#003527]">
              Property Submissions
            </h1>
            <p className="text-sm text-[#707974] mt-1">
              Review listings submitted by landlords, agents, and developers.
            </p>
          </div>
          <span className="inline-flex items-center gap-2 self-start bg-[#fed65b]/25 text-[#003527] text-xs font-bold px-3 py-2 rounded-full">
            <Clock3 className="w-4 h-4" />
            {pendingCount} Pending
          </span>
        </div>
      </section>

      {submissions.length === 0 ? (
        <section className="bg-white rounded-2xl border border-[#bfc9c3]/40 py-16 text-center">
          <Building2 className="w-10 h-10 mx-auto text-[#bfc9c3]" />
          <p className="text-sm text-[#707974] mt-3">No property submissions yet.</p>
        </section>
      ) : (
        <section className="grid grid-cols-1 gap-4">
          {submissions.map((submission) => {
            const isProcessing = processingId === submission.id;
            const status = submission.status || 'pending';
            const isPropertyUpdate = status === 'pending' && Boolean(submission.approvedPropertyId);
            const currentProperty = isPropertyUpdate
              ? properties.find((property) => property.id === submission.approvedPropertyId)
              : undefined;
            const propertyChanges = isPropertyUpdate
              ? getPropertyChanges(submission, currentProperty)
              : [];
            return (
              <article
                key={submission.id || submission.title}
                className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-5 shadow-xs"
              >
                <div className="flex flex-col lg:flex-row gap-5">
                  <div className="w-full lg:w-40 h-32 rounded-xl overflow-hidden bg-[#eef2ef] shrink-0">
                    {submission.images?.[0] ? (
                      <img
                        src={submission.images[0]}
                        alt={submission.title}
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center">
                        <Building2 className="w-8 h-8 text-[#9aa6a0]" />
                      </div>
                    )}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-start justify-between gap-3">
                      <div>
                        <h2 className="font-playfair text-xl font-bold text-[#003527]">
                          {submission.title}
                        </h2>
                        <p className="text-xs text-[#707974] flex items-center gap-1 mt-1">
                          <MapPin className="w-3.5 h-3.5" />
                          {submission.address || submission.location}
                        </p>
                      </div>
                      <span className={`text-[11px] uppercase font-bold px-3 py-1.5 rounded-full ${
                        status === 'approved'
                          ? 'bg-green-100 text-green-800'
                          : status === 'rejected'
                            ? 'bg-red-100 text-red-700'
                            : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isPropertyUpdate ? 'pending update' : status}
                      </span>
                      {submission.listingType === 'sale' && submission.isDistressSale && (
                        <span className="text-[11px] uppercase font-extrabold px-3 py-1.5 rounded-full bg-red-600 text-white">
                          Distress Sale
                        </span>
                      )}
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
                      <div><span className="block text-[#707974]">Lister</span><strong>{submission.ownerName}</strong></div>
                      <div><span className="block text-[#707974]">Type</span><strong>{submission.propertyType}</strong></div>
                      <div><span className="block text-[#707974]">Listing</span><strong className="capitalize">{submission.listingType}</strong></div>
                      <div><span className="block text-[#707974]">Price</span><strong>₦{Number(submission.price).toLocaleString()}</strong></div>
                    </div>

                    <div className="mt-3 rounded-xl bg-[#fbf9f8] border border-[#bfc9c3]/30 p-3 text-xs">
                      <strong className="block text-[#003527] mb-2">Lease & charge details</strong>
                      <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-[#404944]">
                        {submission.listingType === 'lease' && <span>Term: <b>{submission.leaseTermYears} years</b></span>}
                        <span>Agency: <b>{Number(submission.agencyFeePercentage || 0)}% (₦{((Number(submission.price) * Number(submission.agencyFeePercentage || 0)) / 100).toLocaleString()})</b></span>
                        <span>Caution: <b>₦{Number(submission.cautionFee || 0).toLocaleString()}</b></span>
                        <span>Service: <b>₦{Number(submission.serviceCharge || 0).toLocaleString()}</b></span>
                        <span>Legal: <b>{Number(submission.legalFeePercentage || 0)}% (₦{((Number(submission.price) * Number(submission.legalFeePercentage || 0)) / 100).toLocaleString()})</b></span>
                        <span>{submission.otherChargesDescription || 'Other'}: <b>₦{Number(submission.otherCharges || 0).toLocaleString()}</b></span>
                      </div>
                    </div>

                    {isPropertyUpdate && (
                      <div className="mt-3 overflow-hidden rounded-xl border border-amber-300 bg-amber-50/60">
                        <div className="border-b border-amber-200 bg-amber-100/80 px-3 py-2.5">
                          <strong className="text-sm text-amber-950">What Changed — Current vs Submitted</strong>
                          <p className="mt-0.5 text-[11px] text-amber-800">Review every changed field before approving this marketplace update.</p>
                        </div>
                        {!currentProperty ? (
                          <p className="p-3 text-xs font-medium text-red-700">The currently published property could not be loaded. Do not approve until it is available for comparison.</p>
                        ) : propertyChanges.length === 0 ? (
                          <p className="p-3 text-xs text-[#404944]">No changed values were detected.</p>
                        ) : (
                          <div className="divide-y divide-amber-200/70">
                            {propertyChanges.map((change) => (
                              <div key={change.label} className="grid gap-2 p-3 text-xs md:grid-cols-[minmax(120px,0.7fr)_1fr_1fr]">
                                <strong className="text-[#003527]">{change.label}</strong>
                                <div className="min-w-0 rounded-lg bg-white/80 p-2 text-[#707974] break-words">
                                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-red-700">Current</span>
                                  {change.before}
                                </div>
                                <div className="min-w-0 rounded-lg border border-emerald-200 bg-emerald-50 p-2 text-[#1b1c1c] break-words">
                                  <span className="mb-1 block text-[10px] font-bold uppercase tracking-wide text-emerald-700">Submitted</span>
                                  {change.after}
                                </div>
                              </div>
                            ))}
                          </div>
                        )}
                      </div>
                    )}

                    {(submission.videos?.[0] || submission.videoUrl) && (
                      <div className="mt-3 rounded-xl border border-[#bfc9c3]/40 overflow-hidden bg-[#101513]">
                        <div className="flex items-center gap-2 bg-[#003527] px-3 py-2 text-white">
                          <Video className="w-4 h-4 text-[#fed65b]" />
                          <strong className="text-xs">Review walkthrough video before approval</strong>
                        </div>
                        <video
                          src={submission.videos?.[0] || submission.videoUrl}
                          controls
                          playsInline
                          preload="metadata"
                          className="w-full max-h-80 object-contain bg-black"
                        >
                          Your browser does not support video playback.
                        </video>
                      </div>
                    )}

                    {status === 'pending' && (
                      <div className="flex flex-wrap gap-3 mt-5">
                        <button
                          onClick={() => handleApprove(submission)}
                          disabled={Boolean(processingId)}
                          className="inline-flex items-center gap-2 bg-[#003527] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#00513c] disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {isProcessing ? 'Processing…' : isPropertyUpdate ? 'Approve Property Update' : 'Approve and Publish'}
                        </button>
                        <button
                          onClick={() => handleReject(submission)}
                          disabled={Boolean(processingId)}
                          className="inline-flex items-center gap-2 border border-red-200 text-red-700 text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-red-50 disabled:opacity-50 cursor-pointer"
                        >
                          <XCircle className="w-4 h-4" />
                          Reject
                        </button>
                      </div>
                    )}
                  </div>
                </div>
              </article>
            );
          })}
        </section>
      )}
    </div>
  );
};
