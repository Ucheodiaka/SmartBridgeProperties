import React, { useState } from 'react';
import { Building2, CheckCircle2, Clock3, MapPin, XCircle } from 'lucide-react';
import { AuditStatus, PropertySubmission } from '../../types';

interface AdminSubmissionsProps {
  submissions: PropertySubmission[];
  onApprove: (submission: PropertySubmission, score: number) => Promise<void>;
  onUpdateStatus: (submissionId: string, status: AuditStatus, notes?: string) => Promise<void>;
}

export const AdminSubmissions: React.FC<AdminSubmissionsProps> = ({
  submissions,
  onApprove,
  onUpdateStatus,
}) => {
  const [processingId, setProcessingId] = useState<string | null>(null);
  const pendingCount = submissions.filter((submission) => submission.status === 'pending').length;

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
                        {status}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-4 text-xs">
                      <div><span className="block text-[#707974]">Lister</span><strong>{submission.ownerName}</strong></div>
                      <div><span className="block text-[#707974]">Type</span><strong>{submission.propertyType}</strong></div>
                      <div><span className="block text-[#707974]">Listing</span><strong className="capitalize">{submission.listingType}</strong></div>
                      <div><span className="block text-[#707974]">Price</span><strong>₦{Number(submission.price).toLocaleString()}</strong></div>
                    </div>

                    {status === 'pending' && (
                      <div className="flex flex-wrap gap-3 mt-5">
                        <button
                          onClick={() => handleApprove(submission)}
                          disabled={Boolean(processingId)}
                          className="inline-flex items-center gap-2 bg-[#003527] text-white text-xs font-bold px-4 py-2.5 rounded-xl hover:bg-[#00513c] disabled:opacity-50 cursor-pointer"
                        >
                          <CheckCircle2 className="w-4 h-4" />
                          {isProcessing ? 'Processing…' : 'Approve and Publish'}
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
