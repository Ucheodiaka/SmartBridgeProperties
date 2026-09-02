import React from 'react';
import {
  X,
  Building2,
  Shield,
  ShieldCheck,
  UserCheck,
  Lock,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';
import { OwnerAccount, AdminStaffAccount } from '../../types';

interface UnifiedPortalGateModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentOwner: OwnerAccount | null;
  currentAdminStaff: AdminStaffAccount | null;
  onSelectListerPortal: () => void;
  onSelectAdminPortal: () => void;
}

export const UnifiedPortalGateModal: React.FC<UnifiedPortalGateModalProps> = ({
  isOpen,
  onClose,
  currentOwner,
  currentAdminStaff,
  onSelectListerPortal,
  onSelectAdminPortal,
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-[#FCF9F2] w-full max-w-3xl rounded-3xl overflow-hidden shadow-2xl border border-white/40 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#003527] text-white px-6 sm:px-8 py-6 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-[#fed65b] text-[#003527] flex items-center justify-center font-bold shadow-md">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-playfair text-xl sm:text-2xl font-bold tracking-tight text-white">
                  Portal Access
                </h2>
                <span className="bg-[#fed65b]/20 text-[#fed65b] text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full border border-[#fed65b]/30">
                  SmartBridge
                </span>
              </div>
              <p className="text-xs text-[#fed65b]/80 mt-0.5">
                Select your portal to manage properties or administrative operations
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Dual Portal Selection Body */}
        <div className="p-6 sm:p-8 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 sm:gap-6">
            {/* OPTION 1: PROPERTY LISTER */}
            <div
              onClick={() => {
                onClose();
                onSelectListerPortal();
              }}
              className="bg-white rounded-2xl p-6 border-2 border-[#bfc9c3]/60 hover:border-[#003527] transition-all hover:shadow-lg cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#003527]/5 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#003527]/10 text-[#003527] flex items-center justify-center group-hover:bg-[#003527] group-hover:text-[#fed65b] transition-all">
                    <Building2 className="w-6 h-6" />
                  </div>
                  {currentOwner ? (
                    <span className="bg-emerald-100 text-emerald-800 text-[11px] font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
                      <UserCheck className="w-3.5 h-3.5" /> Signed In
                    </span>
                  ) : (
                    <span className="bg-[#f0ede6] text-[#707974] text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full">
                      Property Lister
                    </span>
                  )}
                </div>

                <span className="text-[11px] font-bold text-[#707974] uppercase tracking-wider block mb-1">
                  Option 1
                </span>
                <h4 className="font-playfair text-xl font-bold text-[#1b1c1c] group-hover:text-[#003527] transition-colors leading-tight">
                  Landlord, Agent or Property Developer
                </h4>
                <p className="text-xs sm:text-sm text-[#404944] mt-2.5 leading-relaxed">
                  For people and organisations submitting properties for rent or sale.
                </p>

                <div className="my-4 pt-4 border-t border-[#bfc9c3]/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#404944]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>List residential & commercial properties</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#404944]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Track physical inspection and Title verification</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#404944]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                    <span>Manage buyer inquiries and viewing bookings</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="w-full bg-[#003527] text-[#fed65b] font-bold text-xs sm:text-sm py-3.5 rounded-xl group-hover:bg-[#064e3b] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <span>Access Property Lister Portal</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </div>
            </div>

            {/* OPTION 2: SMARTBRIDGE ADMINISTRATOR */}
            <div
              onClick={() => {
                onClose();
                onSelectAdminPortal();
              }}
              className="bg-white rounded-2xl p-6 border-2 border-[#bfc9c3]/60 hover:border-[#003527] transition-all hover:shadow-lg cursor-pointer flex flex-col justify-between group relative overflow-hidden"
            >
              <div className="absolute top-0 right-0 w-24 h-24 bg-[#fed65b]/15 rounded-bl-full pointer-events-none -mr-4 -mt-4 transition-transform group-hover:scale-110" />

              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="w-12 h-12 rounded-xl bg-[#fed65b]/30 text-[#735c00] flex items-center justify-center group-hover:bg-[#003527] group-hover:text-[#fed65b] transition-all">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <span className="bg-amber-100 text-amber-900 border border-amber-300 text-[10px] font-bold uppercase tracking-wider px-2.5 py-1 rounded-full flex items-center gap-1">
                    <Lock className="w-3 h-3 text-amber-800" /> Authorised Staff Only
                  </span>
                </div>

                <span className="text-[11px] font-bold text-[#707974] uppercase tracking-wider block mb-1">
                  Option 2
                </span>
                <h4 className="font-playfair text-xl font-bold text-[#1b1c1c] group-hover:text-[#003527] transition-colors leading-tight">
                  SmartBridge Administrator
                </h4>
                <p className="text-xs sm:text-sm text-[#404944] mt-2.5 leading-relaxed">
                  For authorised SmartBridge staff only.
                </p>

                <div className="my-4 pt-4 border-t border-[#bfc9c3]/40 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-[#404944]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#003527] shrink-0" />
                    <span>Audit submissions & assign field inspectors</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#404944]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#003527] shrink-0" />
                    <span>Approve, verify, feature, or publish listings</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-[#404944]">
                    <CheckCircle2 className="w-3.5 h-3.5 text-[#003527] shrink-0" />
                    <span>Review platform inspection requests & enquiries</span>
                  </div>
                </div>
              </div>

              <div className="pt-2">
                <button
                  type="button"
                  className="w-full bg-[#fed65b] text-[#003527] font-bold text-xs sm:text-sm py-3.5 rounded-xl group-hover:bg-[#ffe285] transition-all flex items-center justify-center gap-2 shadow-xs cursor-pointer"
                >
                  <Lock className="w-4 h-4" />
                  <span>Administrator Sign In</span>
                </button>
              </div>
            </div>
          </div>

          <div className="bg-[#f0ede6] p-3.5 rounded-xl text-center text-xs text-[#707974] flex items-center justify-center gap-2">
            <Shield className="w-4 h-4 text-[#003527] shrink-0" />
            <span>
              SmartBridge Properties safeguards all property audits, legal verifications, and user credentials.
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

