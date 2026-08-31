import React, { useState } from 'react';
import {
  X,
  Building2,
  ShieldCheck,
  CheckCircle2,
  User,
  Lock,
  Mail,
  Phone,
  Plus,
  Image as ImageIcon,
  Video,
  Eye,
  MessageSquare,
  Clock,
  Sparkles,
  ArrowRight,
  LogOut,
  AlertCircle,
  Check,
  Send,
  Calendar,
  DollarSign,
  ChevronRight,
  ExternalLink,
  Briefcase,
  ShieldAlert,
} from 'lucide-react';
import {
  OwnerAccount,
  Property,
  PropertySubmission,
  PropertyInquiry,
} from '../../types';
import { DEMO_OWNERS } from '../../data/ownerData';
import { signInWithGoogle, signInWithEmail, signUpWithEmail, isSupabaseConfigured } from '../../lib/supabase';
import { GoogleAccountPickerModal } from '../auth/GoogleAccountPickerModal';
import { OwnerProfileEditor } from './OwnerProfileEditor';

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

interface OwnerPortalModalProps {
  currentOwner: OwnerAccount | null;
  onLogin: (owner: OwnerAccount) => void;
  onLogout: () => void;
  onClose: () => void;
  properties: Property[];
  submissions: PropertySubmission[];
  inquiries: PropertyInquiry[];
  onOpenListProperty: () => void;
  onUpdateInquiryStatus: (inquiryId: string, status: PropertyInquiry['status']) => void;
}

export const OwnerPortalModal: React.FC<OwnerPortalModalProps> = ({
  currentOwner,
  onLogin,
  onLogout,
  onClose,
  properties,
  submissions,
  inquiries,
  onOpenListProperty,
  onUpdateInquiryStatus,
}) => {
  const [authMode, setAuthMode] = useState<'login' | 'register'>('login');
  const [emailInput, setEmailInput] = useState('');
  const [passwordInput, setPasswordInput] = useState('');
  const [nameInput, setNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');
  const [companyInput, setCompanyInput] = useState('');
  const [authError, setAuthError] = useState<string | null>(null);

  // Active Dashboard tab
  const [activeTab, setActiveTab] = useState<'properties' | 'inquiries' | 'audits' | 'profile'>('properties');
  const [selectedInquiry, setSelectedInquiry] = useState<PropertyInquiry | null>(null);

  // Filter properties and inquiries for current logged-in owner
  const ownerProperties = currentOwner
    ? properties.filter(
        (p) =>
          p.ownerEmail?.toLowerCase() === currentOwner.email.toLowerCase() ||
          p.ownerId === currentOwner.id
      )
    : [];

  const ownerSubmissions = currentOwner
    ? submissions.filter(
        (s) => s.ownerEmail?.toLowerCase() === currentOwner.email.toLowerCase()
      )
    : [];

  const ownerInquiries = currentOwner
    ? inquiries.filter(
        (inq) => inq.ownerEmail?.toLowerCase() === currentOwner.email.toLowerCase()
      )
    : [];

  const [isGoogleLoading, setIsGoogleLoading] = useState(false);
  const [isGooglePickerOpen, setIsGooglePickerOpen] = useState(false);

  const handleSelectGoogleAccount = async (account: { email: string; name: string; avatar?: string; companyName?: string }) => {
    setIsGoogleLoading(true);
    setAuthError(null);
    try {
      const res = await signInWithGoogle('lister', account);
      if (res.success && res.user) {
        const ownerProfile: OwnerAccount = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone || '+234 803 555 0192',
          companyName: account.companyName || res.user.companyName || 'Verified Property Lister',
          avatar: res.user.avatar || account.avatar,
          isVerifiedLandlord: true,
          joinedAt: new Date().toISOString().split('T')[0],
        };
        onLogin(ownerProfile);
      } else if (res.error) {
        setAuthError(res.error);
      }
    } catch (err: any) {
      setAuthError(err?.message || 'Google Sign-in encountered an error.');
    } finally {
      setIsGoogleLoading(false);
    }
  };

  const handleGoogleLogin = () => {
    setIsGooglePickerOpen(true);
  };

  const handleCustomLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    // Check if matches known demo account
    const matched = DEMO_OWNERS.find(
      (o) => o.email.toLowerCase() === emailInput.trim().toLowerCase()
    );

    if (matched) {
      onLogin(matched);
      return;
    }

    if (authMode === 'register') {
      const res = await signUpWithEmail(emailInput.trim(), passwordInput.trim(), {
        fullName: nameInput.trim() || emailInput.split('@')[0],
        phone: phoneInput.trim(),
        companyName: companyInput.trim() || 'Private Property Advertiser',
        role: 'landlord',
      });

      if (res.success && res.user) {
        const newOwner: OwnerAccount = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone || phoneInput.trim() || '+234 803 000 0000',
          companyName: res.user.companyName || companyInput.trim() || 'Private Property Advertiser',
          isVerifiedLandlord: true,
          joinedAt: new Date().toISOString().split('T')[0],
        };
        onLogin(newOwner);
      } else {
        setAuthError(res.error || 'Failed to create account.');
      }
    } else {
      const res = await signInWithEmail(emailInput.trim(), passwordInput.trim());
      if (res.success && res.user) {
        const loggedInOwner: OwnerAccount = {
          id: res.user.id,
          name: res.user.name,
          email: res.user.email,
          phone: res.user.phone || '+234 803 000 0000',
          companyName: res.user.companyName || 'Verified Property Lister',
          avatar: res.user.avatar,
          isVerifiedLandlord: true,
          joinedAt: new Date().toISOString().split('T')[0],
        };
        onLogin(loggedInOwner);
      } else {
        setAuthError(res.error || 'Invalid credentials.');
      }
    }
  };

  const handleQuickDemoLogin = (demoOwner: OwnerAccount) => {
    setEmailInput(demoOwner.email);
    setPasswordInput('password123');
    onLogin(demoOwner);
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-md flex items-center justify-center p-2 sm:p-4 md:p-6 animate-in fade-in duration-200">
      <div
        className="bg-[#FCF9F2] w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl border border-white/40 flex flex-col max-h-[95vh] relative"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Top Header */}
        <div className="sticky top-0 z-20 bg-[#003527] text-white px-5 sm:px-7 py-4 border-b border-white/10 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-[#fed65b] text-[#003527] flex items-center justify-center font-bold shadow-xs">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="font-playfair text-lg sm:text-xl font-bold tracking-tight">
                  Property Lister & Host Portal
                </h2>
                {currentOwner && (
                  <span className="bg-[#fed65b]/20 text-[#fed65b] border border-[#fed65b]/40 text-[10px] font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3" /> Verified Lister
                  </span>
                )}
              </div>
              <span className="text-[10px] text-white/70 uppercase tracking-wider block font-medium">
                Landlords, Developers & Agents • Sale & Rent Registry
              </span>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {currentOwner && (
              <button
                onClick={onLogout}
                className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-red-500/20 hover:text-red-300 text-xs font-semibold transition-colors cursor-pointer text-white/90"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span className="hidden sm:inline">Sign Out</span>
              </button>
            )}
            <button
              onClick={onClose}
              className="p-2 rounded-lg bg-white/10 hover:bg-white/20 text-white transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Content Body */}
        <div className="overflow-y-auto flex-1 p-4 sm:p-6 md:p-8">
          {!currentOwner ? (
            /* ============================================================ */
            /* 1. AUTHENTICATION GATE (LOGIN / REGISTER) */
            /* ============================================================ */
            <div className="max-w-xl mx-auto space-y-6 py-4">
              <div className="text-center space-y-2">
                <div className="w-14 h-14 rounded-2xl bg-[#003527] text-[#fed65b] flex items-center justify-center mx-auto shadow-md">
                  <Lock className="w-7 h-7" />
                </div>
                <h3 className="font-playfair text-2xl font-bold text-[#003527]">
                  {authMode === 'login' ? 'Property Lister & Host Workspace' : 'Register Lister / Host Account'}
                </h3>
                <p className="text-xs sm:text-sm text-[#404944] max-w-md mx-auto">
                  For landlords, property developers, and verified real estate agents managing sale and rental properties in Port Harcourt.
                </p>
              </div>

              {/* One-Click Google Authentication */}
              <div className="bg-white p-5 rounded-2xl border border-[#bfc9c3]/50 shadow-xs space-y-3">
                <button
                  type="button"
                  id="btn-lister-google-auth"
                  onClick={handleGoogleLogin}
                  disabled={isGoogleLoading}
                  className="w-full bg-white hover:bg-slate-50 text-[#1b1c1c] font-semibold text-sm py-3.5 px-4 rounded-xl border-2 border-[#bfc9c3]/80 hover:border-[#003527] transition-all cursor-pointer flex items-center justify-center gap-3 shadow-xs active:scale-[0.99] disabled:opacity-60"
                >
                  {isGoogleLoading ? (
                    <div className="w-5 h-5 border-2 border-[#003527] border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <GoogleIcon className="w-5 h-5 shrink-0" />
                  )}
                  <span>
                    {isGoogleLoading
                      ? 'Connecting Google Account...'
                      : authMode === 'login'
                      ? 'Continue with Google Account'
                      : 'Sign Up with Google Account'}
                  </span>
                </button>

                <div className="flex items-center justify-between text-[11px] text-[#707974] px-1">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" /> Instant one-tap device login
                  </span>
                  <span className="font-mono text-[10px] bg-[#f0ede6] px-2 py-0.5 rounded text-[#404944]">
                    {isSupabaseConfigured ? 'Supabase Auth Active' : 'Supabase Ready'}
                  </span>
                </div>
              </div>

              {/* Divider */}
              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-[#bfc9c3]/60"></div>
                <span className="flex-shrink mx-4 text-xs font-bold text-[#707974] uppercase tracking-wider">
                  Or continue with Email
                </span>
                <div className="flex-grow border-t border-[#bfc9c3]/60"></div>
              </div>

              {/* One-Click Demo Logins for Instant Testing */}
              <div className="bg-[#fbf9f8] p-4 rounded-xl border border-[#bfc9c3]/50 shadow-2xs space-y-2.5">
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-bold text-[#707974] uppercase tracking-wider flex items-center gap-1.5">
                    <Sparkles className="w-3.5 h-3.5 text-[#735c00]" />
                    Instant Demo Accounts
                  </span>
                  <span className="text-[10px] text-[#707974]">Click to test instantly</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {DEMO_OWNERS.map((demo) => (
                    <button
                      key={demo.id}
                      type="button"
                      onClick={() => handleQuickDemoLogin(demo)}
                      className="p-2.5 rounded-lg bg-white border border-[#bfc9c3]/60 hover:border-[#003527] hover:bg-[#003527]/5 text-left transition-all cursor-pointer group shadow-2xs"
                    >
                      <div className="flex items-center gap-2">
                        <img
                          src={demo.avatar}
                          alt={demo.name}
                          className="w-6 h-6 rounded-full object-cover border border-[#003527]/20 shrink-0"
                        />
                        <div className="overflow-hidden">
                          <p className="text-xs font-bold text-[#1b1c1c] group-hover:text-[#003527] truncate">
                            {demo.name}
                          </p>
                          <p className="text-[9px] text-[#707974] truncate">{demo.companyName}</p>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              </div>

              {authError && (
                <div className="bg-red-50 text-red-800 text-xs p-3.5 rounded-xl border border-red-200 flex items-center gap-2">
                  <AlertCircle className="w-4 h-4 shrink-0 text-red-600" />
                  <span>{authError}</span>
                </div>
              )}

              {/* Login / Register Form */}
              <form onSubmit={handleCustomLogin} className="space-y-4 bg-white p-6 rounded-2xl border border-[#bfc9c3]/40 shadow-xs">
                {authMode === 'register' && (
                  <>
                    <div>
                      <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                        Full Legal Name *
                      </label>
                      <input
                        required
                        type="text"
                        placeholder="e.g. Chief Boma Briggs"
                        value={nameInput}
                        onChange={(e) => setNameInput(e.target.value)}
                        className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                      />
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                          WhatsApp Phone *
                        </label>
                        <input
                          required
                          type="tel"
                          placeholder="+234 803 000 0000"
                          value={phoneInput}
                          onChange={(e) => setPhoneInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c]"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                          Company / Estate Alias
                        </label>
                        <input
                          type="text"
                          placeholder="e.g. Prime Realty Ltd"
                          value={companyInput}
                          onChange={(e) => setCompanyInput(e.target.value)}
                          className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c]"
                        />
                      </div>
                    </div>
                  </>
                )}

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Official Email Address *
                  </label>
                  <input
                    required
                    type="email"
                    placeholder="landlord@domain.com"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-[#1b1c1c] mb-1.5 uppercase">
                    Account Password *
                  </label>
                  <input
                    required
                    type="password"
                    placeholder="••••••••"
                    value={passwordInput}
                    onChange={(e) => setPasswordInput(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-sm text-[#1b1c1c] focus:border-[#003527]"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#003527] text-white font-semibold text-sm py-3.5 rounded-[10px] hover:bg-[#064e3b] transition-all cursor-pointer flex items-center justify-center gap-2 shadow-sm"
                >
                  <ArrowRight className="w-4 h-4 text-[#fed65b]" />
                  {authMode === 'login' ? 'Sign In to Landlord Dashboard' : 'Create Landlord Account'}
                </button>

                <div className="text-center pt-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode(authMode === 'login' ? 'register' : 'login')}
                    className="text-xs font-bold text-[#003527] hover:underline cursor-pointer"
                  >
                    {authMode === 'login'
                      ? "Don't have an account yet? Register as a Landlord"
                      : 'Already have an account? Sign In'}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            /* ============================================================ */
            /* 2. AUTHENTICATED LANDLORD DASHBOARD VIEW */
            /* ============================================================ */
            <div className="space-y-6">
              {/* Landlord Welcome Banner & Quick Stats */}
              <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#bfc9c3]/40 shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-5">
                <div className="flex items-center gap-4">
                  <img
                    src={currentOwner.avatar || 'https://lh3.googleusercontent.com/aida-public/AB6AXuDQGcdW5y2zUr_eaEadYzfhjB6pdaO60NHCzegoqQa-HS_PFU5m13SDde_-tN1r7rNFmxSr-bSZdAHkFIFAE4Z_MqjiEk3nev4rAGRTPxIwFJJ8j_8mmLYH6G4Bcxe4jpeshDtJSYqryTxIWcC6qnmakl3ugNTAIj_ZEWdcKKMU0VS30prKeAYRDc2RuV7PEAD40HgZ1qcbGPaSl8i7tBLwI5PRFR-XcK3QB2vcbw6nGDyL8O9pk_ui'}
                    alt={currentOwner.name}
                    className="w-14 h-14 rounded-2xl object-cover border-2 border-[#003527]/20 shadow-sm"
                  />
                  <div>
                    <div className="flex items-center gap-2">
                      <h3 className="font-playfair text-xl font-bold text-[#003527]">
                        {currentOwner.name}
                      </h3>
                      <span className="bg-[#003527]/10 text-[#003527] text-[10px] font-bold px-2 py-0.5 rounded-full">
                        {currentOwner.companyName || 'Verified Advertiser'}
                      </span>
                    </div>
                    <p className="text-xs text-[#707974] mt-0.5 flex items-center gap-3">
                      <span>{currentOwner.email}</span>
                      <span>•</span>
                      <span>{currentOwner.phone}</span>
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-3 self-start lg:self-auto">
                  <button
                    onClick={() => setActiveTab('profile')}
                    className="bg-white hover:bg-slate-50 text-[#003527] font-semibold text-xs sm:text-sm px-3.5 py-2.5 sm:py-3 rounded-lg border border-[#bfc9c3]/60 hover:border-[#003527] transition-all cursor-pointer flex items-center gap-1.5 shadow-2xs"
                  >
                    <User className="w-4 h-4 text-[#003527]" />
                    <span>Edit Profile</span>
                  </button>
                  <button
                    onClick={() => {
                      onClose();
                      onOpenListProperty();
                    }}
                    className="bg-[#003527] text-white font-semibold text-xs sm:text-sm px-4 sm:px-5 py-2.5 sm:py-3 rounded-lg hover:bg-[#064e3b] transition-all cursor-pointer flex items-center gap-2 shadow-xs"
                  >
                    <Plus className="w-4 h-4 text-[#fed65b]" />
                    Upload New Property (Photos & 4K Video)
                  </button>
                </div>
              </div>

              {/* Stats Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 sm:gap-4">
                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/40 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#707974] uppercase tracking-wider block">
                    My Total Listings
                  </span>
                  <p className="font-playfair text-2xl font-bold text-[#003527] mt-1">
                    {ownerProperties.length + ownerSubmissions.length}
                  </p>
                  <span className="text-[10px] text-[#707974]">Direct Port Harcourt Assets</span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/40 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#707974] uppercase tracking-wider block">
                    Live On Marketplace
                  </span>
                  <p className="font-playfair text-2xl font-bold text-emerald-700 mt-1">
                    {ownerProperties.length}
                  </p>
                  <span className="text-[10px] text-emerald-700 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> Fully Verified
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/40 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#707974] uppercase tracking-wider block">
                    In-Review Audit
                  </span>
                  <p className="font-playfair text-2xl font-bold text-amber-700 mt-1">
                    {ownerSubmissions.length}
                  </p>
                  <span className="text-[10px] text-amber-700 font-semibold flex items-center gap-1">
                    <Clock className="w-3 h-3" /> Under Physical Inspection
                  </span>
                </div>

                <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/40 shadow-2xs">
                  <span className="text-[10px] font-bold text-[#707974] uppercase tracking-wider block">
                    Buyer Inquiries
                  </span>
                  <p className="font-playfair text-2xl font-bold text-[#003527] mt-1">
                    {ownerInquiries.length}
                  </p>
                  <span className="text-[10px] text-[#003527] font-semibold flex items-center gap-1">
                    <MessageSquare className="w-3 h-3" /> Received Leads
                  </span>
                </div>
              </div>

              {/* Navigation Tabs */}
              <div className="flex border-b border-[#bfc9c3]/40 gap-4 sm:gap-6 overflow-x-auto">
                <button
                  onClick={() => setActiveTab('properties')}
                  className={`pb-3 text-xs sm:text-sm font-bold transition-colors relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'properties'
                      ? 'text-[#003527]'
                      : 'text-[#707974] hover:text-[#003527]'
                  }`}
                >
                  <Building2 className="w-4 h-4" />
                  My Properties ({ownerProperties.length + ownerSubmissions.length})
                  {activeTab === 'properties' && (
                    <span className="absolute bottom-[-1px] left-0 w-full h-[2.5px] bg-[#003527] rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('inquiries')}
                  className={`pb-3 text-xs sm:text-sm font-bold transition-colors relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'inquiries'
                      ? 'text-[#003527]'
                      : 'text-[#707974] hover:text-[#003527]'
                  }`}
                >
                  <MessageSquare className="w-4 h-4" />
                  Buyer Inquiries & Leads ({ownerInquiries.length})
                  {ownerInquiries.length > 0 && (
                    <span className="bg-[#003527] text-[#fed65b] text-[9px] font-bold px-1.5 py-0.2 rounded-full">
                      New
                    </span>
                  )}
                  {activeTab === 'inquiries' && (
                    <span className="absolute bottom-[-1px] left-0 w-full h-[2.5px] bg-[#003527] rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('audits')}
                  className={`pb-3 text-xs sm:text-sm font-bold transition-colors relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'audits'
                      ? 'text-[#003527]'
                      : 'text-[#707974] hover:text-[#003527]'
                  }`}
                >
                  <ShieldCheck className="w-4 h-4" />
                  Inspection & Title Audit Status
                  {activeTab === 'audits' && (
                    <span className="absolute bottom-[-1px] left-0 w-full h-[2.5px] bg-[#003527] rounded-full" />
                  )}
                </button>

                <button
                  onClick={() => setActiveTab('profile')}
                  className={`pb-3 text-xs sm:text-sm font-bold transition-colors relative cursor-pointer flex items-center gap-1.5 whitespace-nowrap ${
                    activeTab === 'profile'
                      ? 'text-[#003527]'
                      : 'text-[#707974] hover:text-[#003527]'
                  }`}
                >
                  <User className="w-4 h-4" />
                  Profile & Contact Settings
                  {activeTab === 'profile' && (
                    <span className="absolute bottom-[-1px] left-0 w-full h-[2.5px] bg-[#003527] rounded-full" />
                  )}
                </button>
              </div>

              {/* TAB 1: MY PROPERTIES */}
              {activeTab === 'properties' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#707974] uppercase tracking-wider">
                      Active Listings & Submitted Particulars
                    </h4>
                    <button
                      onClick={() => {
                        onClose();
                        onOpenListProperty();
                      }}
                      className="text-xs font-bold text-[#003527] hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> List Another Property
                    </button>
                  </div>

                  {ownerProperties.length === 0 && ownerSubmissions.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-8 text-center space-y-3">
                      <div className="w-12 h-12 rounded-full bg-[#003527]/10 text-[#003527] flex items-center justify-center mx-auto">
                        <Building2 className="w-6 h-6" />
                      </div>
                      <h4 className="font-playfair text-lg font-bold text-[#003527]">
                        No properties listed yet
                      </h4>
                      <p className="text-xs text-[#707974] max-w-sm mx-auto">
                        Upload your high-resolution photos and video walkthrough to begin the
                        SmartBridge verification audit.
                      </p>
                      <button
                        onClick={() => {
                          onClose();
                          onOpenListProperty();
                        }}
                        className="bg-[#003527] text-white font-semibold text-xs px-5 py-2.5 rounded-lg hover:bg-[#064e3b] transition-colors cursor-pointer"
                      >
                        List Your First Property
                      </button>
                    </div>
                  ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {/* Active Verified Properties */}
                      {ownerProperties.map((property) => (
                        <div
                          key={property.id}
                          className="bg-white rounded-2xl border border-[#bfc9c3]/40 overflow-hidden shadow-xs flex flex-col justify-between"
                        >
                          <div className="relative aspect-video">
                            <img
                              src={property.images[0]}
                              alt={property.title}
                              className="w-full h-full object-cover"
                            />
                            <div className="absolute top-2 left-2 flex gap-1.5">
                              <span className="bg-emerald-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm shadow-xs flex items-center gap-1">
                                <CheckCircle2 className="w-2.5 h-2.5" /> Published & Active
                              </span>
                              <span className="bg-[#003527]/80 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm">
                                {property.type === 'rent' ? 'For Rent' : 'For Sale'}
                              </span>
                            </div>
                            {property.videos && property.videos.length > 0 && (
                              <span className="absolute bottom-2 right-2 bg-black/70 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm flex items-center gap-1">
                                <Video className="w-2.5 h-2.5 text-[#fed65b]" /> 4K Tour
                              </span>
                            )}
                          </div>

                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-[#003527]">
                                {property.location}
                              </span>
                              <span className="text-xs font-bold text-[#1b1c1c]">
                                {property.priceDisplay}
                              </span>
                            </div>
                            <h4 className="font-playfair font-bold text-sm text-[#1b1c1c] line-clamp-1">
                              {property.title}
                            </h4>
                            <p className="text-[11px] text-[#707974] line-clamp-2">
                              {property.description}
                            </p>

                            <div className="pt-2 border-t border-[#bfc9c3]/30 flex items-center justify-between text-[11px]">
                              <span className="text-emerald-700 font-semibold flex items-center gap-1">
                                <ShieldCheck className="w-3 h-3" /> Audit Score: {property.inspectionReport.overallScore}/100
                              </span>
                              <span className="text-[#003527] font-bold">
                                {inquiries.filter((i) => i.propertyId === property.id).length} Inquiries Received
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}

                      {/* Pending In-Review Submissions */}
                      {ownerSubmissions.map((sub) => (
                        <div
                          key={sub.id || Math.random()}
                          className="bg-amber-50/50 rounded-2xl border border-amber-300/60 overflow-hidden shadow-xs flex flex-col justify-between"
                        >
                          <div className="relative aspect-video bg-black/10">
                            {sub.images && sub.images[0] ? (
                              <img
                                src={sub.images[0]}
                                alt={sub.title}
                                className="w-full h-full object-cover"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center text-amber-700">
                                <Building2 className="w-10 h-10 opacity-40" />
                              </div>
                            )}
                            <div className="absolute top-2 left-2 flex gap-1.5">
                              <span className="bg-amber-600 text-white text-[9px] font-bold px-2 py-0.5 rounded-sm shadow-xs flex items-center gap-1">
                                <Clock className="w-2.5 h-2.5" /> Under Admin Audit
                              </span>
                            </div>
                          </div>

                          <div className="p-4 space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-xs font-bold text-amber-800">
                                {sub.location}
                              </span>
                              <span className="text-xs font-bold text-[#1b1c1c]">
                                ₦{typeof sub.price === 'number' ? sub.price.toLocaleString() : sub.price}
                              </span>
                            </div>
                            <h4 className="font-playfair font-bold text-sm text-[#1b1c1c] line-clamp-1">
                              {sub.title}
                            </h4>
                            <p className="text-[11px] text-[#707974] line-clamp-2">
                              {sub.description}
                            </p>

                            <div className="pt-2 border-t border-amber-200/60 flex items-center justify-between text-[11px]">
                              <span className="text-amber-800 font-semibold">
                                Inspector: {sub.assignedInspector || 'Triage Dispatch'}
                              </span>
                              <span className="text-amber-900 font-bold">
                                Title: {sub.titleDocType}
                              </span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 2: INCOMING INQUIRIES & LEADS */}
              {activeTab === 'inquiries' && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <h4 className="text-xs font-bold text-[#707974] uppercase tracking-wider">
                      Buyer & Tenant Inquiries Received ({ownerInquiries.length})
                    </h4>
                    <span className="text-[11px] text-[#003527] font-semibold">
                      Protected by SmartBridge Concierge
                    </span>
                  </div>

                  {ownerInquiries.length === 0 ? (
                    <div className="bg-white rounded-2xl border border-[#bfc9c3]/40 p-8 text-center space-y-2">
                      <MessageSquare className="w-10 h-10 text-[#707974] mx-auto opacity-40" />
                      <h4 className="font-playfair text-base font-bold text-[#003527]">
                        No Inquiries Yet
                      </h4>
                      <p className="text-xs text-[#707974]">
                        When prospective buyers fill the inquiry form on your properties, their offers
                        will appear directly here.
                      </p>
                    </div>
                  ) : (
                    <div className="space-y-3">
                      {ownerInquiries.map((inq) => (
                        <div
                          key={inq.id}
                          className={`p-4 rounded-xl border transition-all ${
                            inq.status === 'new'
                              ? 'bg-emerald-50/40 border-emerald-300 shadow-xs'
                              : 'bg-white border-[#bfc9c3]/50'
                          }`}
                        >
                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-[#bfc9c3]/30">
                            <div>
                              <div className="flex items-center gap-2">
                                <h5 className="font-bold text-sm text-[#1b1c1c]">{inq.buyerName}</h5>
                                <span className="bg-[#003527]/10 text-[#003527] text-[10px] font-bold px-1.5 py-0.2 rounded-xs">
                                  {inq.inquiryType.toUpperCase()}
                                </span>
                                {inq.smartBridgeEscrowRequested && (
                                  <span className="bg-[#fed65b]/30 text-[#735c00] text-[9px] font-bold px-1.5 py-0.2 rounded-xs flex items-center gap-0.5">
                                    <ShieldCheck className="w-2.5 h-2.5" /> Escrow Protected
                                  </span>
                                )}
                              </div>
                              <p className="text-[11px] text-[#707974] mt-0.5">
                                Regarding: <strong>{inq.propertyTitle}</strong> ({inq.propertyLocation})
                              </p>
                            </div>

                            <div className="flex items-center gap-2">
                              {inq.offerAmount && (
                                <div className="text-right">
                                  <span className="text-[10px] text-[#707974] block">Offer Amount</span>
                                  <span className="text-xs font-bold text-[#003527]">
                                    {inq.offerAmount}
                                  </span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div className="py-3">
                            <p className="text-xs text-[#404944] italic bg-white/80 p-3 rounded-lg border border-[#bfc9c3]/20">
                              "{inq.message}"
                            </p>
                          </div>

                          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-2 text-xs">
                            <div className="flex items-center gap-3 text-[#707974]">
                              <span className="flex items-center gap-1">
                                <Phone className="w-3 h-3 text-[#003527]" /> {inq.buyerPhone}
                              </span>
                              <span className="flex items-center gap-1">
                                <Mail className="w-3 h-3 text-[#003527]" /> {inq.buyerEmail}
                              </span>
                            </div>

                            <div className="flex items-center gap-2">
                              <a
                                href={`https://wa.me/${inq.buyerPhone.replace(/[^0-9]/g, '')}?text=Hello%20${encodeURIComponent(inq.buyerName)},%20I%20am%20contacting%20you%20regarding%20your%20inquiry%20on%20SmartBridge%20for%20${encodeURIComponent(inq.propertyTitle)}`}
                                target="_blank"
                                rel="noreferrer"
                                className="bg-emerald-600 text-white font-semibold px-3 py-1.5 rounded-lg text-xs hover:bg-emerald-700 transition-colors flex items-center gap-1"
                              >
                                <Phone className="w-3 h-3" /> Reply on WhatsApp
                              </a>
                              {inq.status === 'new' && (
                                <button
                                  type="button"
                                  onClick={() => onUpdateInquiryStatus(inq.id, 'contacted')}
                                  className="bg-[#003527]/10 text-[#003527] font-bold px-3 py-1.5 rounded-lg text-xs hover:bg-[#003527]/20 transition-colors cursor-pointer"
                                >
                                  Mark as Contacted
                                </button>
                              )}
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}

              {/* TAB 3: INSPECTION & TITLE AUDIT STATUS */}
              {activeTab === 'audits' && (
                <div className="space-y-4">
                  <div className="bg-[#003527]/5 p-4 rounded-xl border border-[#003527]/20 flex items-start gap-3">
                    <ShieldCheck className="w-5 h-5 text-[#003527] shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-bold text-xs text-[#003527] uppercase">
                        The 5-Point Port Harcourt Physical Audit
                      </h4>
                      <p className="text-xs text-[#404944] mt-0.5 leading-relaxed">
                        To maintain buyer confidence, SmartBridge field inspection engineers verify
                        all foundations, power generators, drainage channels, and Ministry of Lands
                        title deeds before approving listings for the public registry.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/40 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#707974] uppercase">1. Legal Title Clearance</span>
                      <p className="text-xs font-semibold text-[#1b1c1c]">Rivers State Ministry of Lands Cadastral Search</p>
                      <span className="text-[10px] text-emerald-700 font-bold block">✓ Guaranteed Clean Title</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/40 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#707974] uppercase">2. Topography & Flood Index</span>
                      <p className="text-xs font-semibold text-[#1b1c1c]">Port Harcourt Wet-Season Runoff Elevation</p>
                      <span className="text-[10px] text-emerald-700 font-bold block">✓ Zero Flood Risk Certified</span>
                    </div>

                    <div className="bg-white p-4 rounded-xl border border-[#bfc9c3]/40 space-y-1.5">
                      <span className="text-[10px] font-bold text-[#707974] uppercase">3. Structural & Power Audit</span>
                      <p className="text-xs font-semibold text-[#1b1c1c]">Dedicated Transformers, Inverters, & Concrete Slabs</p>
                      <span className="text-[10px] text-emerald-700 font-bold block">✓ 100% Passed</span>
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: PROFILE & CREDENTIALS SETTINGS */}
              {activeTab === 'profile' && (
                <div className="space-y-4">
                  <OwnerProfileEditor
                    currentOwner={currentOwner}
                    onUpdateProfile={(updated) => {
                      onLogin(updated);
                    }}
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Google Account Selector Modal */}
      <GoogleAccountPickerModal
        isOpen={isGooglePickerOpen}
        onClose={() => setIsGooglePickerOpen(false)}
        intendedRole="lister"
        onSelectAccount={handleSelectGoogleAccount}
      />
    </div>
  );
};
