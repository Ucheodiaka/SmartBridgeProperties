import React, { useState } from 'react';
import { Building2, Menu, X, Heart, ShieldCheck, Shield, UserCheck, KeyRound, Lock, User } from 'lucide-react';
import { OwnerAccount, AdminStaffAccount } from '../types';

interface NavbarProps {
  activeScreen: string;
  onNavigate: (screen: string) => void;
  onOpenListProperty: () => void;
  onOpenAboutProcess: () => void;
  savedCount: number;
  onOpenSaved: () => void;
  onOpenPortalGate: () => void;
  currentOwner?: OwnerAccount | null;
  currentAdminStaff?: AdminStaffAccount | null;
}

export const Navbar: React.FC<NavbarProps> = ({
  activeScreen,
  onNavigate,
  onOpenListProperty,
  onOpenAboutProcess,
  savedCount,
  onOpenSaved,
  onOpenPortalGate,
  currentOwner,
  currentAdminStaff,
}) => {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const navItems = [
    { id: 'home', label: 'Home' },
    { id: 'properties', label: 'Properties' },
    { id: 'for-rent', label: 'For Rent' },
    { id: 'for-sale', label: 'For Sale' },
    { id: 'about', label: 'About Us' },
  ];

  const handleNavClick = (id: string) => {
    setMobileMenuOpen(false);
    if (id === 'about') {
      onOpenAboutProcess();
    } else {
      onNavigate(id);
    }
  };

  return (
    <header className="sticky top-0 z-40 bg-[#fbf9f8]/95 backdrop-blur-md border-b border-[#bfc9c3]/30 transition-all">
      <div className="w-full max-w-[1280px] mx-auto px-4 sm:px-6 lg:px-12 xl:px-16 h-18 sm:h-20 flex items-center justify-between gap-2 sm:gap-4">
        {/* Brand Logo */}
        <button
          id="nav-logo-button"
          onClick={() => handleNavClick('home')}
          className="flex items-center gap-2 sm:gap-2.5 text-left group cursor-pointer shrink-0"
        >
          <div className="w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-[#003527] text-white flex items-center justify-center shadow-xs group-hover:scale-105 transition-transform shrink-0">
            <Building2 className="w-5 h-5 sm:w-6 sm:h-6 text-[#fed65b]" />
          </div>
          <div>
            <span className="font-playfair text-lg sm:text-xl lg:text-2xl font-bold tracking-tight text-[#003527] block leading-none">
              SmartBridge <span className="font-normal text-[#735c00]">Properties</span>
            </span>
            <span className="text-[9px] sm:text-[10px] tracking-wider uppercase font-semibold text-[#707974] block mt-0.5">
              The Port Harcourt Standard
            </span>
          </div>
        </button>

        {/* Desktop / Large Screen Navigation Links (Clean, uncrowded on xl+) */}
        <nav className="hidden xl:flex items-center gap-6 2xl:gap-7 text-sm font-semibold tracking-wide">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`py-1 relative transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-[#003527] font-bold'
                    : 'text-[#404944] hover:text-[#003527]'
                }`}
              >
                {item.label}
                {isActive && (
                  <span className="absolute bottom-0 left-0 w-full h-[2px] bg-[#003527] rounded-full" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Medium-Desktop Navigation Links (1024px-1279px) */}
        <nav className="hidden lg:flex xl:hidden items-center gap-4 text-xs font-semibold tracking-wide">
          {navItems.map((item) => {
            const isActive = activeScreen === item.id;
            return (
              <button
                key={item.id}
                id={`nav-link-lg-${item.id}`}
                onClick={() => handleNavClick(item.id)}
                className={`py-1 transition-colors cursor-pointer whitespace-nowrap ${
                  isActive
                    ? 'text-[#003527] font-bold border-b-2 border-[#003527]'
                    : 'text-[#404944] hover:text-[#003527]'
                }`}
              >
                {item.label}
              </button>
            );
          })}
        </nav>

        {/* Desktop & Tablet Action Controls */}
        <div className="hidden md:flex items-center gap-2 lg:gap-2.5 xl:gap-3 shrink-0">
          {/* SINGLE UNIFIED PORTAL ENTRY BUTTON */}
          <button
            id="nav-unified-portal-button"
            onClick={onOpenPortalGate}
            className={`px-3 lg:px-3.5 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-2 border shadow-2xs whitespace-nowrap ${
              currentOwner || currentAdminStaff
                ? 'bg-[#003527] text-[#fed65b] border-[#003527]'
                : 'text-[#003527] bg-[#fed65b]/20 border-[#735c00]/30 hover:bg-[#fed65b]/35'
            }`}
            title="Access Lister, Host, or Admin Operations Desk"
          >
            {currentOwner ? (
              <>
                <UserCheck className="w-3.5 h-3.5 text-[#fed65b]" />
                <span>Portal: {currentOwner.name.split(' ')[0]} (Host)</span>
              </>
            ) : currentAdminStaff ? (
              <>
                <ShieldCheck className="w-3.5 h-3.5 text-[#fed65b]" />
                <span>Portal: {currentAdminStaff.name.split(' ')[0]} (Admin)</span>
              </>
            ) : (
              <>
                <KeyRound className="w-3.5 h-3.5 text-[#735c00]" />
                <span>Portal Access</span>
              </>
            )}
          </button>

          {/* Saved wishlist button */}
          <button
            id="nav-saved-button"
            onClick={onOpenSaved}
            className="p-2 lg:p-2.5 rounded-lg border border-[#bfc9c3]/50 text-[#404944] hover:text-[#003527] hover:border-[#003527] hover:bg-white transition-all relative cursor-pointer min-h-[38px] min-w-[38px] flex items-center justify-center shrink-0"
            title="Saved Properties"
          >
            <Heart className={`w-4 h-4 lg:w-5 lg:h-5 ${savedCount > 0 ? 'fill-[#ba1a1a] text-[#ba1a1a]' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#003527] text-white text-[10px] lg:text-[11px] font-bold w-4.5 h-4.5 lg:w-5 lg:h-5 rounded-full flex items-center justify-center border-2 border-[#FCF9F2]">
                {savedCount}
              </span>
            )}
          </button>

          {/* List Your Property CTA */}
          <button
            id="nav-list-property-button"
            onClick={onOpenListProperty}
            className="bg-[#003527] text-white text-xs lg:text-sm font-semibold px-3 lg:px-4 xl:px-5 py-2 lg:py-2.5 rounded-[10px] hover:bg-[#064e3b] transition-all hover:-translate-y-0.5 shadow-xs hover:shadow-md cursor-pointer flex items-center gap-1.5 lg:gap-2 whitespace-nowrap shrink-0 min-h-[38px]"
          >
            <ShieldCheck className="w-3.5 h-3.5 lg:w-4 lg:h-4 text-[#fed65b] shrink-0" />
            <span>List Property</span>
          </button>

          {/* Tablet Quick Menu toggle (visible on md to lg) */}
          <button
            id="nav-tablet-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 rounded-lg text-[#1b1c1c] border border-[#bfc9c3]/50 hover:bg-[#f0eded] transition-colors cursor-pointer min-h-[38px] min-w-[38px] flex lg:hidden items-center justify-center shrink-0 ml-0.5"
            aria-label="Toggle Tablet Navigation Menu"
            title="Navigation Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 text-[#003527]" /> : <Menu className="w-5 h-5 text-[#003527]" />}
          </button>
        </div>

        {/* Mobile Action Buttons (visible under 768px) */}
        <div className="flex items-center gap-1.5 sm:gap-2 md:hidden">
          {/* Mobile Portal Gate Button */}
          <button
            id="nav-mobile-portal-button"
            onClick={onOpenPortalGate}
            className="px-2.5 py-1.5 rounded-lg text-[#003527] bg-[#fed65b]/30 text-xs font-bold flex items-center gap-1 cursor-pointer min-h-[36px] border border-[#735c00]/30"
            title="Portal Access (Lister & Admin)"
          >
            <KeyRound className="w-3.5 h-3.5 text-[#735c00]" />
            <span>Portal</span>
          </button>

          <button
            id="nav-mobile-saved-button"
            onClick={onOpenSaved}
            className="p-1.5 sm:p-2 rounded-lg text-[#404944] hover:text-[#003527] relative cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
          >
            <Heart className={`w-5 h-5 ${savedCount > 0 ? 'fill-[#ba1a1a] text-[#ba1a1a]' : ''}`} />
            {savedCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-[#003527] text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {savedCount}
              </span>
            )}
          </button>

          <button
            id="nav-mobile-menu-toggle"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-1.5 sm:p-2 rounded-lg text-[#1b1c1c] hover:bg-[#f0eded] transition-colors cursor-pointer min-h-[36px] min-w-[36px] flex items-center justify-center"
            aria-label="Toggle Menu"
          >
            {mobileMenuOpen ? <X className="w-5 h-5 sm:w-6 sm:h-6" /> : <Menu className="w-5 h-5 sm:w-6 sm:h-6" />}
          </button>
        </div>
      </div>

      {/* Navigation Drawer (visible on mobile and tablet when menu is toggled) */}
      {mobileMenuOpen && (
        <div className="lg:hidden bg-[#fbf9f8] border-b border-[#bfc9c3]/30 px-5 sm:px-6 py-5 sm:py-6 shadow-xl animate-in slide-in-from-top-2">
          <div className="flex flex-col gap-2.5">
            {navItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNavClick(item.id)}
                className={`text-left py-2 px-3 rounded-lg text-sm sm:text-base font-semibold transition-colors ${
                  activeScreen === item.id
                    ? 'bg-[#003527]/10 text-[#003527] font-bold'
                    : 'text-[#404944] hover:bg-[#f0eded]'
                }`}
              >
                {item.label}
              </button>
            ))}

            <button
              onClick={() => {
                setMobileMenuOpen(false);
                onOpenPortalGate();
              }}
              className="text-left py-2.5 px-3.5 rounded-xl text-sm font-bold text-[#003527] bg-[#fed65b]/30 flex items-center justify-between border border-[#735c00]/30"
            >
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-[#735c00]" />
                <span>
                  {currentOwner
                    ? `Lister Portal (${currentOwner.name.split(' ')[0]})`
                    : currentAdminStaff
                    ? `Admin Desk (${currentAdminStaff.name.split(' ')[0]})`
                    : 'Portal Access (Lister & Admin)'}
                </span>
              </div>
              <span className="text-[10px] bg-[#003527] text-white px-2 py-0.5 rounded-full font-bold">
                Access
              </span>
            </button>

            <div className="pt-3 border-t border-[#bfc9c3]/30 flex flex-col gap-2.5">
              <button
                onClick={() => {
                  setMobileMenuOpen(false);
                  onOpenListProperty();
                }}
                className="w-full bg-[#003527] text-white font-semibold py-3 rounded-[10px] flex items-center justify-center gap-2 cursor-pointer shadow-xs min-h-[44px]"
              >
                <ShieldCheck className="w-4 h-4 text-[#fed65b]" />
                List Your Property
              </button>
            </div>
          </div>
        </div>
      )}
    </header>
  );
};


