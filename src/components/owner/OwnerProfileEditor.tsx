import React, { useState } from 'react';
import {
  User,
  Mail,
  Phone,
  Building2,
  MapPin,
  Camera,
  Upload,
  CheckCircle2,
  ShieldCheck,
  Save,
  RotateCcw,
  Sparkles,
} from 'lucide-react';
import { OwnerAccount } from '../../types';
import { supabaseDb } from '../../lib/supabase';

interface OwnerProfileEditorProps {
  currentOwner: OwnerAccount;
  onUpdateProfile: (updated: OwnerAccount) => void;
  onClose?: () => void;
}

export const OwnerProfileEditor: React.FC<OwnerProfileEditorProps> = ({
  currentOwner,
  onUpdateProfile,
}) => {
  const [name, setName] = useState(currentOwner.name);
  const [email, setEmail] = useState(currentOwner.email);
  const [phone, setPhone] = useState(currentOwner.phone);
  const [companyName, setCompanyName] = useState(currentOwner.companyName || '');
  const [listerType, setListerType] = useState<OwnerAccount['listerType']>(
    currentOwner.listerType || 'Landlord / Property Owner'
  );
  const [address, setAddress] = useState(currentOwner.address || 'Port Harcourt, Rivers State');
  const [bio, setBio] = useState(
    currentOwner.bio ||
      'Verified property advertiser managing verified residential and commercial assets across Port Harcourt.'
  );
  const [avatar, setAvatar] = useState(currentOwner.avatar || '');
  const [avatarPath, setAvatarPath] = useState(currentOwner.avatarPath || '');
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [photoError, setPhotoError] = useState<string | null>(null);
  const [isSaving, setIsSaving] = useState(false);
  const [savedSuccess, setSavedSuccess] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSaving(true);
    setSavedSuccess(false);

    const updatedAccount: OwnerAccount = {
      ...currentOwner,
      name: name.trim(),
      email: email.trim(),
      phone: phone.trim(),
      companyName: companyName.trim(),
      listerType,
      address: address.trim(),
      bio: bio.trim(),
      avatar,
      avatarPath,
      isVerifiedLandlord: true,
    };

    try {
      // 1. Save to Supabase Cloud Database
      const saved = await supabaseDb.saveProfile({
        id: updatedAccount.id,
        email: updatedAccount.email,
        name: updatedAccount.name,
        phone: updatedAccount.phone,
        companyName: updatedAccount.companyName,
        avatarPath: updatedAccount.avatarPath,
      });
      if (!saved) throw new Error('Profile changes could not be saved.');

      // 2. Update local state
      onUpdateProfile(updatedAccount);
      setSavedSuccess(true);
      setTimeout(() => setSavedSuccess(false), 4000);
    } catch (err) {
      console.error('Failed to sync profile to database:', err);
    } finally {
      setIsSaving(false);
    }
  };

  const handlePhotoUpload = async (file?: File) => {
    if (!file) return;

    const allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
      setPhotoError('Please choose a JPG, PNG, or WebP image.');
      return;
    }
    if (file.size > 5 * 1024 * 1024) {
      setPhotoError('The profile photo must be 5 MB or smaller.');
      return;
    }

    setIsUploadingPhoto(true);
    setPhotoError(null);
    const uploaded = await supabaseDb.uploadProfileAvatar(file, currentOwner.id);
    if (!uploaded) {
      setPhotoError('The photo could not be uploaded. Please try again.');
      setIsUploadingPhoto(false);
      return;
    }

    setAvatar(uploaded.signedUrl);
    setAvatarPath(uploaded.path);
    setIsUploadingPhoto(false);
  };

  return (
    <div className="space-y-6">
      {/* Profile heading */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-[#bfc9c3]/40 shadow-xs">
        <h3 className="font-playfair text-lg sm:text-xl font-bold text-[#003527]">
          Lister & Host Profile Settings
        </h3>
        <p className="text-xs text-[#707974] mt-1">
          Manage your official contact details and private profile photo.
        </p>
      </div>

      {savedSuccess && (
        <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-xl flex items-center gap-3 animate-in fade-in">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <div className="text-xs sm:text-sm">
            <p className="font-bold">Profile updated and synced successfully!</p>
            <p className="text-emerald-700/90 text-xs">
              Your details are updated in your active session and stored in the database.
            </p>
          </div>
        </div>
      )}

      {/* Main Form & Preview Grid */}
      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Columns: Editable Inputs */}
        <div className="lg:col-span-2 space-y-5 bg-white p-5 sm:p-6 rounded-2xl border border-[#bfc9c3]/40 shadow-xs">
          {/* Private profile photo */}
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-[#707974] mb-2 flex items-center gap-1.5">
              <Camera className="w-3.5 h-3.5 text-[#003527]" />
              Private Profile Photo
            </label>
            <div className="flex flex-col sm:flex-row sm:items-center gap-4">
              {avatar ? (
                <img
                  src={avatar}
                  alt="Current profile"
                  className="w-20 h-20 rounded-2xl object-cover border-2 border-[#003527]/20 shadow-xs"
                />
              ) : (
                <div className="w-20 h-20 rounded-2xl bg-[#003527]/10 text-[#003527] flex items-center justify-center border-2 border-[#003527]/20">
                  <User className="w-8 h-8" />
                </div>
              )}
              <div className="space-y-2">
                <label className="inline-flex items-center gap-2 bg-[#003527] hover:bg-[#064e3b] text-white font-semibold text-xs px-4 py-2.5 rounded-xl cursor-pointer">
                  <Upload className="w-4 h-4 text-[#fed65b]" />
                  {isUploadingPhoto ? 'Uploading Photo...' : 'Upload Profile Photo'}
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp"
                    className="sr-only"
                    disabled={isUploadingPhoto}
                    onChange={(event) => {
                      void handlePhotoUpload(event.target.files?.[0]);
                      event.currentTarget.value = '';
                    }}
                  />
                </label>
                <p className="text-[11px] text-[#707974]">
                  JPG, PNG, or WebP. Maximum size: 5 MB. Your photo remains private.
                </p>
                {photoError && <p className="text-xs text-red-600 font-semibold">{photoError}</p>}
              </div>
            </div>
          </div>

          <div className="border-t border-[#bfc9c3]/30 pt-4 grid grid-cols-1 sm:grid-cols-2 gap-4">
            {/* Full Name */}
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1 flex items-center gap-1.5">
                <User className="w-3.5 h-3.5 text-[#003527]" />
                Full Name / Representative Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Chief Emeka Briggs"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs sm:text-sm text-[#1b1c1c] focus:outline-hidden focus:border-[#003527]"
              />
            </div>

            {/* Lister Role Type */}
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#003527]" />
                Lister Classification <span className="text-red-500">*</span>
              </label>
              <select
                value={listerType}
                onChange={(e) => setListerType(e.target.value as any)}
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs sm:text-sm text-[#1b1c1c] focus:outline-hidden focus:border-[#003527]"
              >
                <option value="Landlord / Property Owner">Landlord / Property Owner</option>
                <option value="Registered Real Estate Agent">Registered Real Estate Agent</option>
                <option value="Property Developer">Property Developer</option>
                <option value="Short-let Host">Short-let Host</option>
              </select>
            </div>

            {/* Email */}
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1 flex items-center gap-1.5">
                <Mail className="w-3.5 h-3.5 text-[#003527]" />
                Email Address <span className="text-red-500">*</span>
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="e.g. owner@gmail.com"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs sm:text-sm text-[#1b1c1c] focus:outline-hidden focus:border-[#003527]"
              />
            </div>

            {/* Phone */}
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1 flex items-center gap-1.5">
                <Phone className="w-3.5 h-3.5 text-[#003527]" />
                Phone Number (WhatsApp Direct) <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="e.g. +234 803 555 0192"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs sm:text-sm text-[#1b1c1c] focus:outline-hidden focus:border-[#003527]"
              />
            </div>

            {/* Company Name */}
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1 flex items-center gap-1.5">
                <Building2 className="w-3.5 h-3.5 text-[#003527]" />
                Company / Agency / Brand Name
              </label>
              <input
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                placeholder="e.g. Odiaka Real Estate Holdings"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs sm:text-sm text-[#1b1c1c] focus:outline-hidden focus:border-[#003527]"
              />
            </div>

            {/* Physical Location */}
            <div>
              <label className="block text-xs font-semibold text-[#1b1c1c] mb-1 flex items-center gap-1.5">
                <MapPin className="w-3.5 h-3.5 text-[#003527]" />
                Operational City / District
              </label>
              <input
                type="text"
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                placeholder="e.g. GRA Phase 2, Port Harcourt"
                className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs sm:text-sm text-[#1b1c1c] focus:outline-hidden focus:border-[#003527]"
              />
            </div>
          </div>

          {/* Bio / Description */}
          <div>
            <label className="block text-xs font-semibold text-[#1b1c1c] mb-1">
              Advertiser Bio & Verification Overview
            </label>
            <textarea
              rows={3}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell buyers and tenants about your portfolio..."
              className="w-full px-3.5 py-2.5 rounded-lg border border-[#bfc9c3] bg-white text-xs sm:text-sm text-[#1b1c1c] focus:outline-hidden focus:border-[#003527]"
            />
          </div>

          {/* Actions */}
          <div className="pt-3 flex items-center justify-between border-t border-[#bfc9c3]/30">
            <button
              type="button"
              onClick={() => {
                setName(currentOwner.name);
                setEmail(currentOwner.email);
                setPhone(currentOwner.phone);
                setCompanyName(currentOwner.companyName || '');
                setAvatar(currentOwner.avatar || '');
                setAvatarPath(currentOwner.avatarPath || '');
                setPhotoError(null);
              }}
              className="inline-flex items-center gap-1.5 text-xs text-[#707974] hover:text-[#1b1c1c] font-semibold transition-colors cursor-pointer"
            >
              <RotateCcw className="w-3.5 h-3.5" />
              Reset Form
            </button>

            <button
              type="submit"
              disabled={isSaving}
              className="bg-[#003527] hover:bg-[#064e3b] text-white font-semibold text-xs sm:text-sm px-6 py-3 rounded-xl transition-all cursor-pointer flex items-center gap-2 shadow-sm disabled:opacity-60"
            >
              {isSaving ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <Save className="w-4 h-4 text-[#fed65b]" />
              )}
              <span>{isSaving ? 'Saving to Database...' : 'Save Profile Changes'}</span>
            </button>
          </div>
        </div>

        {/* Right 1 Column: Live Public Profile Card Preview */}
        <div className="space-y-4">
          <div className="bg-[#f0ede6] p-4 rounded-xl border border-[#bfc9c3]/60">
            <span className="text-[11px] font-bold text-[#707974] uppercase tracking-wider block mb-2">
              Public Lister Badge Preview
            </span>
            <p className="text-xs text-[#404944] leading-relaxed">
              This is how your verified profile appears to prospective buyers, tenants, and inspection teams across SmartBridge.
            </p>
          </div>

          <div className="bg-white p-5 rounded-2xl border-2 border-[#003527]/20 shadow-md relative overflow-hidden">
            <div className="absolute top-0 right-0 bg-[#003527] text-[#fed65b] text-[10px] font-bold px-3 py-1 rounded-bl-xl flex items-center gap-1">
              <ShieldCheck className="w-3 h-3" /> Verified
            </div>

            <div className="flex items-center gap-4 mt-2">
              {avatar ? (
                <img
                  src={avatar}
                  alt={name || 'Lister'}
                  className="w-16 h-16 rounded-2xl object-cover border-2 border-[#003527]/20 shadow-xs"
                />
              ) : (
                <div className="w-16 h-16 rounded-2xl bg-[#003527]/10 text-[#003527] flex items-center justify-center border-2 border-[#003527]/20 shadow-xs">
                  <User className="w-7 h-7" />
                </div>
              )}
              <div className="min-w-0">
                <h4 className="font-playfair font-bold text-base text-[#003527] truncate">
                  {name || 'Your Full Name'}
                </h4>
                <p className="text-xs font-semibold text-[#707974] truncate">
                  {companyName || 'Private Property Advertiser'}
                </p>
                <span className="inline-block mt-1 bg-[#003527]/10 text-[#003527] text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {listerType}
                </span>
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-[#bfc9c3]/30 space-y-2 text-xs text-[#404944]">
              <div className="flex items-center gap-2">
                <Mail className="w-3.5 h-3.5 text-[#003527] shrink-0" />
                <span className="font-mono text-[11px] truncate">{email || 'email@example.com'}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-3.5 h-3.5 text-[#003527] shrink-0" />
                <span className="font-mono text-[11px]">{phone || '+234 803 000 0000'}</span>
              </div>
              <div className="flex items-center gap-2">
                <MapPin className="w-3.5 h-3.5 text-[#003527] shrink-0" />
                <span className="text-[11px] truncate">{address}</span>
              </div>
            </div>

            <p className="mt-3 text-[11px] text-[#707974] italic line-clamp-2 bg-[#FCF9F2] p-2 rounded-lg border border-[#bfc9c3]/30">
              "{bio}"
            </p>
          </div>
        </div>
      </form>
    </div>
  );
};
