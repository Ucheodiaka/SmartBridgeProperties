import React from 'react';
import { Building2, MessageCircle, MapPin, ShieldCheck, Mail, Phone } from 'lucide-react';

interface FooterProps {
  onNavigate: (screen: string) => void;
  onOpenListProperty: () => void;
  onOpenAboutProcess: () => void;
}

export const Footer: React.FC<FooterProps> = ({
  onNavigate,
  onOpenListProperty,
  onOpenAboutProcess,
}) => {
  const handleWhatsAppChat = () => {
    const text = encodeURIComponent(
      'Hello SmartBridge Properties, I would like to inquire about verified property listings in Port Harcourt.'
    );
    window.open(`https://wa.me/2348034567890?text=${text}`, '_blank');
  };

  return (
    <footer className="bg-[#002117] w-full border-t border-[#003527]/30 text-white">
      <div className="w-full py-16 md:py-20 px-4 md:px-12 lg:px-16 max-w-[1280px] mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-10 md:gap-12">
          {/* Brand Column */}
          <div className="col-span-1 md:col-span-2 space-y-6">
            <button
              onClick={() => onNavigate('home')}
              className="flex items-center gap-2.5 text-left cursor-pointer group"
            >
              <div className="w-10 h-10 rounded-lg bg-[#003527] border border-[#fed65b]/30 flex items-center justify-center">
                <Building2 className="w-6 h-6 text-[#fed65b]" />
              </div>
              <div>
                <span className="font-playfair text-2xl font-bold tracking-tight text-white block leading-none">
                  SmartBridge <span className="font-normal text-[#fed65b]">Properties</span>
                </span>
                <span className="text-[10px] tracking-wider uppercase font-semibold text-[#80bea6] block mt-0.5">
                  The Port Harcourt Standard
                </span>
              </div>
            </button>

            <p className="text-sm text-[#c9c6c0] max-w-md leading-relaxed font-normal">
              The premier standard for premium real estate in Port Harcourt. We connect discerning clients with verified, high-quality properties across Rivers State through strict physical engineering audits.
            </p>

            <div className="flex items-center gap-4">
              <button
                id="footer-whatsapp-button"
                onClick={handleWhatsAppChat}
                className="bg-[#fed65b] text-[#241a00] font-semibold text-xs md:text-sm px-5 py-3 rounded-[10px] hover:bg-[#ffe088] transition-all hover:shadow-lg inline-flex items-center gap-2 cursor-pointer"
              >
                <MessageCircle className="w-4 h-4 fill-current" />
                Chat on WhatsApp
              </button>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-xs font-bold mb-5 text-[#ffe088] uppercase tracking-wider">
              Quick Links
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button
                  onClick={() => onNavigate('for-rent')}
                  className="text-[#c9c6c0] hover:text-[#ffe088] transition-colors cursor-pointer"
                >
                  Properties For Rent
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('for-sale')}
                  className="text-[#c9c6c0] hover:text-[#ffe088] transition-colors cursor-pointer"
                >
                  Properties For Sale
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenListProperty}
                  className="text-[#c9c6c0] hover:text-[#ffe088] transition-colors cursor-pointer"
                >
                  List Your Property
                </button>
              </li>
              <li>
                <button
                  onClick={onOpenAboutProcess}
                  className="text-[#c9c6c0] hover:text-[#ffe088] transition-colors cursor-pointer"
                >
                  How Physical Verification Works
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('admin')}
                  className="text-[#fed65b] hover:underline font-semibold transition-colors cursor-pointer flex items-center gap-1.5"
                >
                  <ShieldCheck className="w-3.5 h-3.5" />
                  Admin Operations Desk
                </button>
              </li>
            </ul>
          </div>

          {/* Legal & Contact */}
          <div>
            <h4 className="text-xs font-bold mb-5 text-[#ffe088] uppercase tracking-wider">
              Legal & Contact
            </h4>
            <ul className="space-y-3.5 text-sm">
              <li>
                <button
                  onClick={onOpenAboutProcess}
                  className="text-[#c9c6c0] hover:text-[#ffe088] transition-colors cursor-pointer"
                >
                  Verification Protocol
                </button>
              </li>
              <li>
                <button
                  onClick={() => onNavigate('about')}
                  className="text-[#c9c6c0] hover:text-[#ffe088] transition-colors cursor-pointer"
                >
                  Privacy Policy & Escrow Terms
                </button>
              </li>
              <li className="flex items-start gap-2.5 text-[#c9c6c0] pt-2">
                <MapPin className="w-4 h-4 text-[#fed65b] shrink-0 mt-1" />
                <span className="text-xs leading-relaxed">
                  GRA Phase 2, Port Harcourt,<br />Rivers State, Nigeria.
                </span>
              </li>
              <li className="flex items-center gap-2.5 text-[#c9c6c0]">
                <Phone className="w-4 h-4 text-[#fed65b] shrink-0" />
                <span className="text-xs">+234 803 456 7890</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Copyright divider */}
        <div className="mt-14 pt-8 border-t border-[#003527]/80 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-[#80bea6]">
          <p>© {new Date().getFullYear()} SmartBridge Properties. The Port Harcourt Standard.</p>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#fed65b]" />
            <span>100% Physical Verification Guaranteed</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
