import React, { useState } from 'react';
import {
  X,
  Shield,
  ShieldCheck,
  Lock,
  Mail,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  Building2,
  ArrowLeft,
  KeyRound,
} from 'lucide-react';
import { AdminStaffAccount } from '../../types';
import { signInAdminWithEmail, resetAdminPassword } from '../../lib/supabase';

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
  const [adminEmail, setAdminEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Forgot Password modal state
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);
  const [resetEmail, setResetEmail] = useState('');
  const [resetStatus, setResetStatus] = useState<{ loading: boolean; message?: string; error?: string } | null>(null);

  if (!isOpen) return null;

  const handleAdminSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);
    setIsLoading(true);

    try {
      const result = await signInAdminWithEmail(adminEmail, password);

      if (result.success && result.user) {
        if (result.user.role !== 'admin') {
          setErrorMessage('You are not authorised to access the administrator portal.');
          return;
        }

        const staffAccount: AdminStaffAccount = {
          id: result.user.id,
          name: result.user.name || 'SmartBridge Administrator',
          email: result.user.email,
          role: 'Operations Director',
          badge: 'Verified Staff Admin',
          pin: '••••',
        };

        onSuccessLogin(staffAccount);
        onClose();
      } else {
        setErrorMessage(
          result.error || 'You are not authorised to access the administrator portal.'
        );
      }
    } catch (err: any) {
      setErrorMessage(
        err?.message || 'You are not authorised to access the administrator portal.'
      );
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendPasswordReset = async (e: React.FormEvent) => {
    e.preventDefault();
    setResetStatus({ loading: true });
    try {
      const res = await resetAdminPassword(resetEmail || adminEmail);
      if (res.success) {
        setResetStatus({ loading: false, message: res.message });
      } else {
        setResetStatus({ loading: false, error: res.error || 'Failed to send reset link.' });
      }
    } catch (err: any) {
      setResetStatus({ loading: false, error: err?.message || 'Error occurred.' });
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-3 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-[#FCF9F2] w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-white/40 flex flex-col relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with SmartBridge Brand */}
        <div className="bg-[#003527] text-white px-6 py-5 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fed65b] text-[#003527] flex items-center justify-center font-bold shadow-md shrink-0">
              <Building2 className="w-5 h-5 text-[#003527]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-playfair text-lg font-bold text-white leading-tight">
                  SmartBridge Administrator
                </h3>
              </div>
              <p className="text-[11px] text-[#fed65b]/90 font-medium mt-0.5">
                Authorised Staff Only • Operations Desk
              </p>
            </div>
          </div>

          <button
            onClick={onClose}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer"
            aria-label="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 space-y-5">
          {/* Security Status Banner */}
          <div className="bg-[#f0ede6] p-3.5 rounded-xl border border-[#bfc9c3]/50 flex items-start gap-3">
            <ShieldCheck className="w-5 h-5 text-[#003527] shrink-0 mt-0.5" />
            <div className="text-xs text-[#404944] leading-relaxed">
              <span className="font-bold text-[#1b1c1c] block mb-0.5">Restricted Administrator Access</span>
              Sign in with your official staff credentials. Accounts must be provisioned privately by database administration.
            </div>
          </div>

          {/* Error Message Box */}
          {errorMessage && (
            <div className="bg-red-50 text-red-800 text-xs p-3.5 rounded-xl border border-red-200 flex items-start gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0 text-red-600 mt-0.5" />
              <div className="font-medium leading-relaxed">{errorMessage}</div>
            </div>
          )}

          {!isForgotPasswordOpen ? (
            /* Primary Supabase Email & Password Login Form */
            <form onSubmit={handleAdminSignIn} className="space-y-4">
              {/* Admin Email */}
              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] uppercase tracking-wider mb-1.5">
                  Admin Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#707974] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    id="admin-email-input"
                    value={adminEmail}
                    onChange={(e) => {
                      setAdminEmail(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="official.staff@smartbridge.ng"
                    className="w-full bg-white border border-[#bfc9c3] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] shadow-2xs"
                    required
                    autoComplete="username"
                  />
                </div>
              </div>

              {/* Password with Show Password Toggle */}
              <div>
                <div className="flex items-center justify-between mb-1.5">
                  <label className="block text-xs font-bold text-[#1b1c1c] uppercase tracking-wider">
                    Password
                  </label>
                  <button
                    type="button"
                    onClick={() => {
                      setResetEmail(adminEmail);
                      setIsForgotPasswordOpen(true);
                      setErrorMessage(null);
                    }}
                    className="text-xs text-[#003527] hover:underline font-semibold cursor-pointer"
                  >
                    Forgot Password?
                  </button>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-[#707974] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    id="admin-password-input"
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      if (errorMessage) setErrorMessage(null);
                    }}
                    placeholder="••••••••••••"
                    className="w-full bg-white border border-[#bfc9c3] rounded-xl pl-10 pr-11 py-3 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#003527] focus:ring-1 focus:ring-[#003527] shadow-2xs"
                    required
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    id="btn-toggle-show-password"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#707974] hover:text-[#003527] transition-colors p-1 cursor-pointer"
                    title={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                id="btn-admin-submit"
                disabled={isLoading}
                className="w-full bg-[#003527] text-[#fed65b] font-bold text-sm py-3.5 px-4 rounded-xl hover:bg-[#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm disabled:opacity-70 mt-2"
              >
                {isLoading ? (
                  <div className="w-5 h-5 border-2 border-[#fed65b] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <ShieldCheck className="w-4 h-4 text-[#fed65b]" />
                )}
                <span>{isLoading ? 'Verifying Authorization...' : 'Sign In as Administrator'}</span>
              </button>

              {/* Private creation notice */}
              <p className="text-[11px] text-[#707974] text-center leading-relaxed pt-1">
                Administrator accounts are created privately through Supabase and cannot be registered through public signup.
              </p>

              {/* Return to Homepage */}
              <div className="pt-2 text-center border-t border-[#bfc9c3]/40">
                <button
                  type="button"
                  onClick={onClose}
                  className="text-xs text-[#404944] hover:text-[#003527] font-semibold inline-flex items-center gap-1.5 cursor-pointer"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Return to Marketplace / Homepage</span>
                </button>
              </div>
            </form>
          ) : (
            /* Forgot Password Request Form */
            <form onSubmit={handleSendPasswordReset} className="space-y-4 animate-in fade-in">
              <div className="flex items-center gap-2 text-[#003527]">
                <KeyRound className="w-4 h-4 text-[#003527]" />
                <h4 className="font-playfair text-base font-bold text-[#1b1c1c]">
                  Reset Administrator Password
                </h4>
              </div>

              <p className="text-xs text-[#404944] leading-relaxed">
                Enter your official staff email address. We will verify your admin role and send a secure password reset link.
              </p>

              {resetStatus?.message && (
                <div className="bg-emerald-50 text-emerald-900 text-xs p-3.5 rounded-xl border border-emerald-200 flex items-start gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                  <span>{resetStatus.message}</span>
                </div>
              )}

              {resetStatus?.error && (
                <div className="bg-red-50 text-red-800 text-xs p-3.5 rounded-xl border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                  <span>{resetStatus.error}</span>
                </div>
              )}

              <div>
                <label className="block text-xs font-bold text-[#1b1c1c] uppercase tracking-wider mb-1.5">
                  Official Staff Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-[#707974] absolute left-3.5 top-1/2 -translate-y-1/2" />
                  <input
                    type="email"
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="official.staff@smartbridge.ng"
                    className="w-full bg-white border border-[#bfc9c3] rounded-xl pl-10 pr-4 py-3 text-sm text-[#1b1c1c] focus:outline-none focus:border-[#003527]"
                    required
                  />
                </div>
              </div>

              <button
                type="submit"
                disabled={resetStatus?.loading}
                className="w-full bg-[#003527] text-[#fed65b] font-bold text-xs sm:text-sm py-3 px-4 rounded-xl hover:bg-[#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs disabled:opacity-70"
              >
                {resetStatus?.loading ? (
                  <div className="w-4 h-4 border-2 border-[#fed65b] border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Mail className="w-4 h-4 text-[#fed65b]" />
                )}
                <span>{resetStatus?.loading ? 'Sending Instructions...' : 'Send Password Reset Link'}</span>
              </button>

              <div className="pt-2 text-center">
                <button
                  type="button"
                  onClick={() => {
                    setIsForgotPasswordOpen(false);
                    setResetStatus(null);
                  }}
                  className="text-xs text-[#707974] hover:text-[#003527] font-semibold underline cursor-pointer"
                >
                  ← Back to Administrator Sign In
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
};
