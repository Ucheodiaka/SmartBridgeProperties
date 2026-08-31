import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  UserCheck,
  Building2,
} from 'lucide-react';
import { AdminStaffAccount } from '../../types';
import { DEMO_ADMIN_STAFF, MASTER_ADMIN_PIN, MASTER_ADMIN_PASSWORD } from '../../data/adminStaffData';
import { signInWithGoogle, isSupabaseConfigured } from '../../lib/supabase';

// Reusable Google SVG Icon
const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
  <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
    <path
      fill="#4285F4"
      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
    />
    <path
      fill="#34A853"
      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
    />
    <path
      fill="#FBBC05"
      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
    />
    <path
      fill="#EA4335"
      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
    />
  </svg>
);

interface AdminLoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccessLogin: (staff: AdminStaffAccount) => void;
}

export const AdminLoginModal: React.FC<AdminLoginModalProps> = ({
  isOpen,
  onClose,
  onSuccessLogin,
}) => {
  const [selectedStaff, setSelectedStaff] = useState<AdminStaffAccount>(DEMO_ADMIN_STAFF[0]);
  const [pinInput, setPinInput] = useState('');
  const [customEmail, setCustomEmail] = useState('');
  const [customPassword, setCustomPassword] = useState('');
  const [useCustomCreds, setUseCustomCreds] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  if (!isOpen) return null;

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);

  const handleGoogleAdminLogin = async () => {
    setIsGoogleLoading(true);
    setErrorMessage(null);
    try {
      const res = await signInWithGoogle('admin');
      if (res.success && res.user) {
        const staffAccount: AdminStaffAccount = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          role: 'Operations Director',
          badge: 'Authorized Lead',
          pin: MASTER_ADMIN_PIN,
        };
        onSuccessLogin(staffAccount);
        onClose();
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || 'Google authentication failed.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleStaffPinSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (pinInput.trim() === selectedStaff.pin || pinInput.trim() === MASTER_ADMIN_PIN) {
      onSuccessLogin(selectedStaff);
      onClose();
    } else {
      setErrorMessage('Invalid Staff Security PIN. Please enter "1234" or select an authorized staff member.');
    }
  };

  const handleCustomAuthSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (
      customPassword.trim().toLowerCase() === MASTER_ADMIN_PASSWORD ||
      customPassword.trim() === MASTER_ADMIN_PIN
    ) {
      const customStaff: AdminStaffAccount = {
        id: `staff-${Date.now()}`,
        name: customEmail.split('@')[0] || 'SmartBridge Administrator',
        email: customEmail || 'admin@smartbridge.ng',
        role: 'Operations Director',
        badge: 'Authorized Staff',
        pin: MASTER_ADMIN_PIN,
      };
      onSuccessLogin(customStaff);
      onClose();
    } else {
      setErrorMessage('Invalid Admin Password. Enter "admin" or PIN "1234" to access the Operations Desk.');
    }
  };

  const handleQuickSelectStaff = (staff: AdminStaffAccount) => {
    setSelectedStaff(staff);
    setPinInput(staff.pin);
    setErrorMessage(null);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-[#FCF9F2] w-full max-w-lg rounded-2xl overflow-hidden shadow-2xl border border-white/40 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="bg-[#003527] text-white px-6 py-5 flex items-center justify-between border-b border-white/10">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fed65b] text-[#003527] flex items-center justify-center font-bold shadow-md">
              <Shield className="w-5 h-5 text-[#003527]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-playfair text-lg font-bold text-white leading-tight">
                  Admin & Operations Desk
                </h3>
                <span className="bg-red-500/20 text-red-300 text-[10px] font-bold px-2 py-0.5 rounded-full border border-red-500/30">
                  Protected
                </span>
              </div>
              <p className="text-xs text-[#fed65b]/80 mt-0.5">
                Physical Inspection & Title Verification Access
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 space-y-6">
          <div className="bg-[#f0ede6] p-3.5 rounded-xl border border-[#bfc9c3]/40 flex items-start gap-3">
            <Lock className="w-5 h-5 text-[#003527] shrink-0 mt-0.5" />
            <div className="text-xs text-[#404944] leading-relaxed">
              <span className="font-bold text-[#1b1c1c]">Restricted Internal System:</span> Enter your 4-digit Staff PIN or Master Password to approve listings, review title deeds, and manage property audits.
            </div>
          </div>

          {errorMessage && (
            <div className="bg-red-50 text-red-800 text-xs p-3 rounded-xl border border-red-200 flex items-center gap-2">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
              <span>{errorMessage}</span>
            </div>
          )}

          {/* One-Click Google Workspace Staff Login */}
          <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/60 shadow-xs space-y-2.5">
            <button
              type="button"
              id="btn-admin-google-auth"
              onClick={handleGoogleAdminLogin}
              disabled={isGoogleLoading}
              className="w-full bg-white hover:bg-slate-50 text-[#1b1c1c] font-semibold text-xs sm:text-sm py-3 px-4 rounded-xl border-2 border-[#bfc9c3]/80 hover:border-[#003527] transition-all cursor-pointer flex items-center justify-center gap-2.5 shadow-xs disabled:opacity-60"
            >
              {isGoogleLoading ? (
                <div className="w-4 h-4 border-2 border-[#003527] border-t-transparent rounded-full animate-spin" />
              ) : (
                <GoogleIcon className="w-4 h-4 shrink-0" />
              )}
              <span>{isGoogleLoading ? 'Connecting Google...' : 'Sign in with Google Workspace'}</span>
            </button>
            <div className="flex items-center justify-between text-[10px] text-[#707974] px-1">
              <span>Automatic staff credential verification</span>
              <span className="font-mono bg-[#f0ede6] px-1.5 py-0.5 rounded text-[#404944]">
                {isSupabaseConfigured ? 'Supabase Auth' : 'Supabase Ready'}
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="relative flex items-center">
            <div className="flex-grow border-t border-[#bfc9c3]/60"></div>
            <span className="flex-shrink mx-3 text-[10px] font-bold text-[#707974] uppercase tracking-wider">
              Or authenticate with Staff PIN / Password
            </span>
            <div className="flex-grow border-t border-[#bfc9c3]/60"></div>
          </div>

          {!useCustomCreds ? (
            /* Staff Quick Selector & PIN Form */
            <form onSubmit={handleStaffPinSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] uppercase tracking-wider mb-2">
                  Select Staff Member Profile
                </label>
                <div className="grid grid-cols-1 gap-2">
                  {DEMO_ADMIN_STAFF.map((staff) => {
                    const isSelected = selectedStaff.id === staff.id;
                    return (
                      <div
                        key={staff.id}
                        onClick={() => handleQuickSelectStaff(staff)}
                        className={`p-3 rounded-xl border transition-all cursor-pointer flex items-center justify-between ${
                          isSelected
                            ? 'bg-[#003527] text-white border-[#003527] shadow-sm'
                            : 'bg-white text-[#1b1c1c] border-[#bfc9c3]/50 hover:border-[#003527]/40'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          <div
                            className={`w-9 h-9 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isSelected
                                ? 'bg-[#fed65b] text-[#003527]'
                                : 'bg-[#e2dfd7] text-[#003527]'
                            }`}
                          >
                            {staff.name.charAt(0)}
                          </div>
                          <div>
                            <div className="text-xs font-bold">{staff.name}</div>
                            <div
                              className={`text-[11px] ${
                                isSelected ? 'text-[#fed65b]' : 'text-[#707974]'
                              }`}
                            >
                              {staff.role} • {staff.badge}
                            </div>
                          </div>
                        </div>

                        {isSelected && (
                          <CheckCircle2 className="w-4 h-4 text-[#fed65b] shrink-0" />
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] uppercase tracking-wider mb-1.5">
                  Staff Security PIN (Demo PIN: 1234)
                </label>
                <div className="relative">
                  <KeyRound className="w-4 h-4 text-[#707974] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="password"
                    maxLength={8}
                    value={pinInput}
                    onChange={(e) => setPinInput(e.target.value)}
                    placeholder="Enter PIN (e.g. 1234)"
                    className="w-full bg-white border border-[#bfc9c3] rounded-xl pl-10 pr-4 py-3 text-sm font-mono tracking-widest text-[#1b1c1c] focus:outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#003527] text-[#fed65b] font-bold text-sm py-3.5 rounded-xl hover:bg-[#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-[#fed65b]" />
                Unlock Admin & Verification Desk
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setUseCustomCreds(true)}
                  className="text-xs text-[#707974] hover:text-[#003527] font-semibold underline cursor-pointer"
                >
                  Or sign in with custom admin email & password
                </button>
              </div>
            </form>
          ) : (
            /* Custom Email & Password Form */
            <form onSubmit={handleCustomAuthSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <input
                  type="email"
                  value={customEmail}
                  onChange={(e) => setCustomEmail(e.target.value)}
                  placeholder="admin@smartbridge.ng"
                  className="w-full bg-white border border-[#bfc9c3] rounded-xl px-4 py-2.5 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
                  required
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] uppercase tracking-wider mb-1.5">
                  Password (Demo: "admin" or "1234")
                </label>
                <input
                  type="password"
                  value={customPassword}
                  onChange={(e) => setCustomPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-white border border-[#bfc9c3] rounded-xl px-4 py-2.5 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
                  required
                />
              </div>

              <button
                type="submit"
                className="w-full bg-[#003527] text-[#fed65b] font-bold text-sm py-3.5 rounded-xl hover:bg-[#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
              >
                <ShieldCheck className="w-4 h-4 text-[#fed65b]" />
                Sign In as Administrator
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => setUseCustomCreds(false)}
                  className="text-xs text-[#707974] hover:text-[#003527] font-semibold underline cursor-pointer"
                >
                  ← Back to Staff PIN selector
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
