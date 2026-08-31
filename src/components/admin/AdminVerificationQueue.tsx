import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  XCircle,
  AlertCircle,
  FileCheck,
  Eye,
  UserCheck,
  Building,
  MapPin,
  Calendar,
  Send,
  Sparkles,
  Search,
  Image as ImageIcon,
  Video,
  Film,
} from 'lucide-react';
import { PropertySubmission, AuditStatus, Property } from '../../types';
import { INITIAL_AGENTS } from '../../data/adminData';

interface AdminVerificationQueueProps {
  submissions: PropertySubmission[];
  onUpdateSubmissionStatus: (submissionId: string, status: AuditStatus, notes?: string) => void;
  onApproveAndPublish: (submission: PropertySubmission, auditScore: number) => void;
}

export const AdminVerificationQueue: React.FC<AdminVerificationQueueProps> = ({
  submissions,
  onUpdateSubmissionStatus,
  onApproveAndPublish,
}) => {
  const [selectedSubId, setSelectedSubId] = useState<string | null>(submissions[0]?.id || null);
  const [activeTab, setActiveTab] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [auditScoreInput, setAuditScoreInput] = useState<number>(95);
  const [inspectorNotes, setInspectorNotes] = useState<string>('Title verified clean at Rivers State Ministry of Lands. Structural integrity test passed with 100% compliance.');
  const [selectedInspector, setSelectedInspector] = useState('Engr. Tamara Briggs, FNSE');

  // Checklist State for active audit
  const [checklist, setChecklist] = useState({
    titleSearch: true,
    structural: true,
    electrical: true,
    floodDrainage: true,
    plumbing: true,
  });

  const filteredSubmissions = submissions.filter((s) => {
    if (activeTab === 'pending') return s.status === 'pending_audit' || s.status === 'in_progress';
    if (activeTab === 'approved') return s.status === 'approved';
    if (activeTab === 'rejected') return s.status === 'rejected';
    return true;
  });

  const selectedSubmission = submissions.find((s) => s.id === selectedSubId) || filteredSubmissions[0];

  const handleApprove = () => {
    if (selectedSubmission) {
      onApproveAndPublish(selectedSubmission, auditScoreInput);
    }
  };

  const handleReject = () => {
    if (selectedSubmission && selectedSubmission.id) {
      onUpdateSubmissionStatus(selectedSubmission.id, 'rejected', 'Failed physical verification requirements or title search unverified.');
    }
  };

  return (
    <div className="space-y-6 animate-in fade-in">
      {/* Header */}
      <div className="bg-white p-6 rounded-2xl border border-[#bfc9c3]/40 shadow-xs flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#003527]/10 text-[#003527] text-xs font-bold uppercase tracking-wider mb-2">
            <ShieldCheck className="w-3.5 h-3.5" />
            Physical Verification Protocol
          </div>
          <h1 className="font-playfair text-2xl font-bold text-[#003527]">
            Physical Audit & Title Verification Station
          </h1>
          <p className="text-xs text-[#707974] mt-0.5">
            Review incoming property applications, perform Rivers State Ministry of Lands title searches, score structural engineering integrity, and publish verified badges.
          </p>
        </div>

        {/* Tab Filters */}
        <div className="flex items-center rounded-xl bg-[#fbf9f8] p-1 border border-[#bfc9c3]/40">
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'all' ? 'bg-[#003527] text-white shadow-xs' : 'text-[#707974]'
            }`}
          >
            All ({submissions.length})
          </button>
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'pending' ? 'bg-[#003527] text-white shadow-xs' : 'text-[#707974]'
            }`}
          >
            Pending Audit
          </button>
          <button
            onClick={() => setActiveTab('approved')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
              activeTab === 'approved' ? 'bg-[#003527] text-white shadow-xs' : 'text-[#707974]'
            }`}
          >
            Approved
          </button>
        </div>
      </div>

      {/* Main Split Interface */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Submissions List (5 cols) */}
        <div className="lg:col-span-5 space-y-3">
          {filteredSubmissions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-8 text-center text-[#707974]">
              <FileCheck className="w-10 h-10 mx-auto text-[#bfc9c3] mb-2" />
              <p className="text-sm font-semibold">No property submissions in this status.</p>
            </div>
          ) : (
            filteredSubmissions.map((sub) => {
              const isSelected = selectedSubmission?.id === sub.id;
              return (
                <div
                  key={sub.id || sub.title}
                  onClick={() => setSelectedSubId(sub.id || null)}
                  className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-white border-[#003527] shadow-md ring-2 ring-[#003527]/10'
                      : 'bg-white/80 border-[#bfc9c3]/40 hover:bg-white hover:border-[#003527]/40'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <span className="text-[10px] font-bold uppercase px-2 py-0.5 rounded-md bg-[#fed65b]/20 text-[#735c00]">
                      {sub.location} • {sub.propertyType}
                    </span>
                    <span
                      className={`text-[10px] font-extrabold uppercase px-2 py-0.5 rounded-full ${
                        sub.status === 'approved'
                          ? 'bg-emerald-100 text-emerald-800'
                          : sub.status === 'rejected'
                          ? 'bg-red-100 text-red-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}
                    >
                      {sub.status === 'approved'
                        ? 'Approved'
                        : sub.status === 'rejected'
                        ? 'Rejected'
                        : 'Audit Pending'}
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-[#1b1c1c] leading-snug line-clamp-2">
                    {sub.title}
                  </h3>

                  <div className="mt-3 pt-2.5 border-t border-[#bfc9c3]/20 flex items-center justify-between text-xs text-[#707974]">
                    <span>Owner: <strong className="text-[#1b1c1c]">{sub.ownerName}</strong></span>
                    <span className="font-bold text-[#003527]">{sub.listingType === 'rent' ? 'For Rent' : 'For Sale'}</span>
                  </div>
                </div>
              );
            })
          )}
        </div>

        {/* Right: Detailed Audit & Decision Station (7 cols) */}
        {selectedSubmission ? (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#bfc9c3]/40 p-6 shadow-xs space-y-6">
            {/* Header of selected */}
            <div className="border-b border-[#bfc9c3]/30 pb-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold uppercase tracking-wider text-[#735c00]">
                  Submission ID: {selectedSubmission.id || 'SUB-NEW'}
                </span>
                <span className="text-xs text-[#707974]">
                  Submitted on {selectedSubmission.submittedAt ? new Date(selectedSubmission.submittedAt).toLocaleDateString() : 'Recent'}
                </span>
              </div>
              <h2 className="font-playfair text-xl font-bold text-[#003527] mt-1">
                {selectedSubmission.title}
              </h2>
              <p className="text-xs text-[#707974] flex items-center gap-1 mt-1">
                <MapPin className="w-3.5 h-3.5 text-[#003527]" /> {selectedSubmission.address}
              </p>
            </div>

            {/* Owner & Property Specs */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-[#fbf9f8] p-4 rounded-xl border border-[#bfc9c3]/30 text-xs">
              <div>
                <span className="text-[#707974] block">Owner</span>
                <strong className="text-[#1b1c1c]">{selectedSubmission.ownerName}</strong>
              </div>
              <div>
                <span className="text-[#707974] block">Contact</span>
                <strong className="text-[#003527]">{selectedSubmission.ownerPhone}</strong>
              </div>
              <div>
                <span className="text-[#707974] block">Title Document</span>
                <strong className="text-[#735c00]">{selectedSubmission.titleDocType}</strong>
              </div>
              <div>
                <span className="text-[#707974] block">Asking Price</span>
                <strong className="text-[#003527]">
                  ₦{Number(selectedSubmission.price).toLocaleString()}
                </strong>
              </div>
            </div>

            {/* Submitted Photos & Video Walkthrough Review */}
            {((selectedSubmission.images && selectedSubmission.images.length > 0) ||
              (selectedSubmission.videos && selectedSubmission.videos.length > 0) ||
              selectedSubmission.videoUrl) && (
              <div className="space-y-3 p-4 bg-[#fbf9f8] rounded-xl border border-[#bfc9c3]/30">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-bold uppercase tracking-wider text-[#003527] flex items-center gap-1.5">
                    <ImageIcon className="w-3.5 h-3.5 text-[#003527]" />
                    Applicant Uploaded Media Audit
                  </h3>
                  <span className="text-[10px] text-[#707974] font-semibold">
                    {selectedSubmission.images?.length || 0} Photos •{' '}
                    {(selectedSubmission.videos?.length || (selectedSubmission.videoUrl ? 1 : 0))} Videos
                  </span>
                </div>

                {/* Photos Grid */}
                {selectedSubmission.images && selectedSubmission.images.length > 0 && (
                  <div>
                    <span className="text-[11px] font-bold text-[#404944] block mb-1.5">
                      Submitted High-Res Photos ({selectedSubmission.images.length})
                    </span>
                    <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                      {selectedSubmission.images.map((imgUrl, i) => (
                        <div
                          key={i}
                          className="aspect-[4/3] rounded-lg overflow-hidden border border-[#bfc9c3]/50 bg-black/5 relative group"
                        >
                          <img
                            src={imgUrl}
                            alt={`Audit Media ${i + 1}`}
                            className="w-full h-full object-cover"
                          />
                          {i === 0 && (
                            <span className="absolute top-1 left-1 bg-[#003527] text-[#fed65b] text-[8px] font-bold px-1 rounded-xs">
                              Cover
                            </span>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Video Tour Preview */}
                {(selectedSubmission.videos?.length || selectedSubmission.videoUrl) && (
                  <div className="pt-2 border-t border-[#bfc9c3]/30">
                    <span className="text-[11px] font-bold text-[#404944] flex items-center gap-1.5 mb-1.5">
                      <Video className="w-3.5 h-3.5 text-[#003527]" />
                      Uploaded Video Walkthrough / Tour
                    </span>
                    <div className="rounded-lg overflow-hidden bg-black border border-[#bfc9c3]/40 aspect-[16/9] max-h-[220px]">
                      <video
                        src={selectedSubmission.videos?.[0] || selectedSubmission.videoUrl}
                        controls
                        className="w-full h-full object-contain"
                      />
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* 5-Point Physical Inspection Checklist */}
            <div className="space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-[#404944] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#003527]" />
                SmartBridge 5-Point Physical Audit Checklist
              </h3>

              <div className="space-y-2">
                <label className="flex items-center justify-between p-3 rounded-xl border border-[#bfc9c3]/40 bg-white hover:bg-[#fbf9f8] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.titleSearch}
                      onChange={(e) => setChecklist({ ...checklist, titleSearch: e.target.checked })}
                      className="w-4 h-4 text-[#003527] rounded-sm focus:ring-[#003527]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1b1c1c] block">
                        1. Lands Registry Search (Rivers State Ministry of Lands)
                      </span>
                      <span className="text-[11px] text-[#707974]">
                        Confirmed unencumbered C of O / Registered Deed with survey coordinates.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">Passed</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-[#bfc9c3]/40 bg-white hover:bg-[#fbf9f8] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.structural}
                      onChange={(e) => setChecklist({ ...checklist, structural: e.target.checked })}
                      className="w-4 h-4 text-[#003527] rounded-sm focus:ring-[#003527]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1b1c1c] block">
                        2. Structural Integrity & Foundation Soundness
                      </span>
                      <span className="text-[11px] text-[#707974]">
                        Concrete rebound hammer test and structural column load checks.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">Passed</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-[#bfc9c3]/40 bg-white hover:bg-[#fbf9f8] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.floodDrainage}
                      onChange={(e) => setChecklist({ ...checklist, floodDrainage: e.target.checked })}
                      className="w-4 h-4 text-[#003527] rounded-sm focus:ring-[#003527]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1b1c1c] block">
                        3. Topography & Flood Resilience Assessment
                      </span>
                      <span className="text-[11px] text-[#707974]">
                        Elevation above rainfall flood-lines and perimeter drainage connection.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">Passed</span>
                </label>

                <label className="flex items-center justify-between p-3 rounded-xl border border-[#bfc9c3]/40 bg-white hover:bg-[#fbf9f8] cursor-pointer">
                  <div className="flex items-center gap-3">
                    <input
                      type="checkbox"
                      checked={checklist.electrical}
                      onChange={(e) => setChecklist({ ...checklist, electrical: e.target.checked })}
                      className="w-4 h-4 text-[#003527] rounded-sm focus:ring-[#003527]"
                    />
                    <div>
                      <span className="text-xs font-bold text-[#1b1c1c] block">
                        4. Electrical Conduit, Surge Arresters & Earthing
                      </span>
                      <span className="text-[11px] text-[#707974]">
                        Copper wiring test, generator auto-changeover, earthing below 5 ohms.
                      </span>
                    </div>
                  </div>
                  <span className="text-xs font-bold text-emerald-700">Passed</span>
                </label>
              </div>
            </div>

            {/* Score & Inspector Notes */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="bg-[#fbf9f8] p-4 rounded-xl border border-[#bfc9c3]/40 space-y-2">
                <label className="block text-xs font-bold text-[#404944]">
                  Assign Verification Audit Score
                </label>
                <div className="flex items-center gap-3">
                  <input
                    type="range"
                    min={70}
                    max={100}
                    value={auditScoreInput}
                    onChange={(e) => setAuditScoreInput(Number(e.target.value))}
                    className="flex-1 accent-[#003527]"
                  />
                  <span className="font-playfair text-xl font-bold text-[#003527] bg-[#fed65b]/30 px-2.5 py-0.5 rounded-lg">
                    {auditScoreInput}%
                  </span>
                </div>
              </div>

              <div className="bg-[#fbf9f8] p-4 rounded-xl border border-[#bfc9c3]/40 space-y-2">
                <label className="block text-xs font-bold text-[#404944]">
                  Lead Verification Inspector
                </label>
                <select
                  value={selectedInspector}
                  onChange={(e) => setSelectedInspector(e.target.value)}
                  className="w-full bg-white border border-[#bfc9c3] rounded-lg p-2 text-xs font-semibold"
                >
                  <option value="Engr. Tamara Briggs, FNSE">Engr. Tamara Briggs, FNSE</option>
                  <option value="Arch. Sotonye Douglas">Arch. Sotonye Douglas</option>
                  <option value="Ikechi Wosu, B.Eng">Ikechi Wosu, B.Eng</option>
                </select>
              </div>
            </div>

            {/* Inspector Notes */}
            <div>
              <label className="block text-xs font-bold uppercase tracking-wider text-[#404944] mb-1.5">
                Official Engineering Inspection Statement
              </label>
              <textarea
                rows={3}
                value={inspectorNotes}
                onChange={(e) => setInspectorNotes(e.target.value)}
                className="w-full bg-[#fbf9f8] border border-[#bfc9c3] rounded-xl p-3 text-xs text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
              />
            </div>

            {/* Action Buttons */}
            <div className="pt-3 border-t border-[#bfc9c3]/30 flex flex-wrap items-center justify-between gap-3">
              <button
                id="btn-reject-verification-audit"
                onClick={handleReject}
                className="px-4 py-2.5 rounded-xl border border-red-200 text-[#ba1a1a] hover:bg-red-50 text-xs font-bold transition-colors cursor-pointer"
              >
                Reject / Require Re-Audit
              </button>

              <button
                id="btn-approve-and-publish-listing"
                onClick={handleApprove}
                className="px-6 py-2.5 rounded-xl bg-[#003527] text-white hover:bg-[#064e3b] text-xs font-bold shadow-md hover:shadow-lg transition-all flex items-center gap-2 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4 text-[#fed65b]" />
                Approve & Publish to Marketplace
              </button>
            </div>
          </div>
        ) : (
          <div className="lg:col-span-7 bg-white rounded-2xl border border-[#bfc9c3]/40 p-12 text-center text-[#707974]">
            Select a property submission to start physical verification.
          </div>
        )}
      </div>
    </div>
  );
};
