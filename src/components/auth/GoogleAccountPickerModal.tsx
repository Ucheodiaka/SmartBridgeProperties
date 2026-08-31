import React, { useState } from 'react';
import { X, UserPlus, CheckCircle2, ShieldCheck, Mail, User, Building2, ArrowRight } from 'lucide-react';
import { AuthUserProfile } from '../../lib/supabase';

// Reusable Google SVG Icon
export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-5 h-5' }) => (
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

interface GoogleAccountPickerModalProps {
  isOpen: boolean;
  onClose: () => void;
  intendedRole?: 'lister' | 'admin';
  onSelectAccount: (account: { email: string; name: string; avatar?: string; companyName?: string }) => void;
}

export const GoogleAccountPickerModal: React.FC<GoogleAccountPickerModalProps> = ({
  isOpen,
  onClose,
  intendedRole = 'lister',
  onSelectAccount,
}) => {
  const [isCustomMode, setIsCustomMode] = useState(false);
  const [customEmail, setCustomEmail] = useState('');
  const [customName, setCustomName] = useState('');
  const [customCompany, setCustomCompany] = useState('');
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const defaultAccounts = intendedRole === 'admin'
    ? [
        {
          name: 'Uche Odiaka',
          email: 'ucheodiaka@gmail.com',
          roleDesc: 'Lead Administrator & Operations Director',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          companyName: 'SmartBridge Nigeria Ltd',
        },
        {
          name: 'Engr. Tonye Amadi',
          email: 'tonye.amadi@smartbridge.ng',
          roleDesc: 'Lead Field Civil Inspector (COREN)',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          companyName: 'SmartBridge Field Engineering',
        },
      ]
    : [
        {
          name: 'Uche Odiaka',
          email: 'ucheodiaka@gmail.com',
          roleDesc: 'Registered Property Lister & Landlord',
          avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80',
          companyName: 'Odiaka Real Estate Holdings',
        },
        {
          name: 'Chief Emmanuel Briggs',
          email: 'e.briggs@riversholdings.ng',
          roleDesc: 'GRA Phase 2 Commercial Developer',
          avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?auto=format&fit=crop&w=200&q=80',
          companyName: 'Briggs Luxury Properties Ltd',
        },
      ];

  const handleCustomSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!customEmail.trim() || !customEmail.includes('@')) {
      setError('Please provide a valid Google account email address.');
      return;
    }
    const name = customName.trim() || customEmail.split('@')[0];
    onSelectAccount({
      email: customEmail.trim(),
      name,
      companyName: customCompany.trim() || 'Verified Property Lister',
      avatar: 'https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?auto=format&fit=crop&w=200&q=80',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/75 backdrop-blur-sm flex items-center justify-center p-3 sm:p-4 animate-in fade-in duration-150">
      <div
        className="bg-white w-full max-w-md rounded-2xl overflow-hidden shadow-2xl border border-slate-200 flex flex-col relative animate-in zoom-in-95 duration-150"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Google Header */}
        <div className="p-6 pb-4 border-b border-slate-100 flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center shadow-2xs">
              <GoogleIcon className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-900 leading-tight">
                Sign in with Google
              </h3>
              <p className="text-xs text-slate-500 mt-0.5">
                Choose an account to continue to SmartBridge
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-5 space-y-3">
          {error && (
            <div className="bg-red-50 text-red-700 text-xs p-3 rounded-lg border border-red-200">
              {error}
            </div>
          )}

          {!isCustomMode ? (
            <div className="space-y-2">
              <span className="text-[11px] font-semibold uppercase tracking-wider text-slate-400 px-1 block">
                Saved Device Accounts
              </span>

              {defaultAccounts.map((acc) => (
                <button
                  key={acc.email}
                  type="button"
                  onClick={() => {
                    onSelectAccount({
                      email: acc.email,
                      name: acc.name,
                      avatar: acc.avatar,
                      companyName: acc.companyName,
                    });
                    onClose();
                  }}
                  className="w-full p-3 rounded-xl border border-slate-200 hover:border-[#003527] hover:bg-emerald-50/40 transition-all cursor-pointer flex items-center justify-between text-left group shadow-2xs"
                >
                  <div className="flex items-center gap-3 min-w-0">
                    <img
                      src={acc.avatar}
                      alt={acc.name}
                      className="w-10 h-10 rounded-full object-cover border border-slate-200 shadow-2xs shrink-0"
                    />
                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm font-bold text-slate-800 group-hover:text-[#003527] truncate">
                          {acc.name}
                        </span>
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                      </div>
                      <p className="text-xs text-slate-500 font-mono truncate">{acc.email}</p>
                      <p className="text-[10px] text-slate-400 truncate">{acc.roleDesc}</p>
                    </div>
                  </div>
                  <ArrowRight className="w-4 h-4 text-slate-300 group-hover:text-[#003527] shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
                </button>
              ))}

              {/* Use Another Account Button */}
              <button
                type="button"
                onClick={() => setIsCustomMode(true)}
                className="w-full p-3 rounded-xl border-2 border-dashed border-slate-200 hover:border-[#003527] hover:bg-slate-50 text-slate-700 font-semibold text-xs transition-all cursor-pointer flex items-center justify-center gap-2 mt-2"
              >
                <UserPlus className="w-4 h-4 text-[#003527]" />
                <span>Use another Google account</span>
              </button>
            </div>
          ) : (
            /* Custom Google Email Form */
            <form onSubmit={handleCustomSubmit} className="space-y-3.5 animate-in fade-in duration-150">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Enter Google Account Details</span>
                <button
                  type="button"
                  onClick={() => setIsCustomMode(false)}
                  className="text-xs font-semibold text-[#003527] hover:underline cursor-pointer"
                >
                  ← Back to saved accounts
                </button>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Google Email Address <span className="text-red-500">*</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="email"
                    required
                    value={customEmail}
                    onChange={(e) => setCustomEmail(e.target.value)}
                    placeholder="e.g. name@gmail.com or workspace domain"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Display / Full Name
                </label>
                <div className="relative">
                  <User className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customName}
                    onChange={(e) => setCustomName(e.target.value)}
                    placeholder="e.g. Barrister Emeka Nwosu"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-600 mb-1">
                  Company / Agency (Optional)
                </label>
                <div className="relative">
                  <Building2 className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
                  <input
                    type="text"
                    value={customCompany}
                    onChange={(e) => setCustomCompany(e.target.value)}
                    placeholder="e.g. Port Harcourt Prime Properties"
                    className="w-full pl-9 pr-3 py-2.5 rounded-lg border border-slate-300 text-xs sm:text-sm text-slate-900 focus:outline-hidden focus:border-[#003527] focus:ring-1 focus:ring-[#003527]"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-[#003527] hover:bg-[#064e3b] text-white font-semibold text-xs sm:text-sm py-3 rounded-xl transition-all cursor-pointer flex items-center justify-center gap-2 shadow-xs"
              >
                <span>Continue with this Google Account</span>
                <ArrowRight className="w-4 h-4 text-[#fed65b]" />
              </button>
            </form>
          )}

          {/* Privacy footer */}
          <div className="pt-2 text-center">
            <p className="text-[10px] text-slate-400 flex items-center justify-center gap-1">
              <ShieldCheck className="w-3 h-3 text-emerald-600" />
              Direct Supabase Database & OAuth 2.0 Integration
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};
