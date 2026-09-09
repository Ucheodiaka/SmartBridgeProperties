import React, { useState, useEffect } from 'react';
import { INITIAL_AGENTS } from './data/adminData';
import {
  Property,
  FilterState,
  InspectionBooking,
  PropertySubmission,
  AgentInfo,
  AuditStatus,
  BookingStatus,
  OwnerAccount,
  PropertyInquiry,
  InquiryStatus,
  AdminStaffAccount,
} from './types';
import { Navbar } from './components/Navbar';
import { Hero } from './components/Hero';
import { TrustStats } from './components/TrustStats';
import { FeaturedProperties } from './components/FeaturedProperties';
import { TrustVerificationSection } from './components/TrustVerificationSection';
import { NeighborhoodExplorer } from './components/NeighborhoodExplorer';
import { PropertiesView } from './components/PropertiesView';
import { PropertyDetailModal } from './components/PropertyDetailModal';
import { AboutProcessModal } from './components/AboutProcessModal';
import { ListPropertyModal } from './components/ListPropertyModal';
import { ScheduleInspectionModal } from './components/ScheduleInspectionModal';
import { PropertyInquiryModal } from './components/PropertyInquiryModal';
import { OwnerPortalModal } from './components/owner/OwnerPortalModal';
import { UnifiedPortalGateModal } from './components/auth/UnifiedPortalGateModal';
import { AdminLoginModal } from './components/auth/AdminLoginModal';
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AdminDashboard } from './components/admin/AdminDashboard';
import { supabase, isSupabaseConfigured, supabaseDb } from './lib/supabase';

export default function App() {
  // Supabase is the single source of truth for all operational data.
  const [properties, setProperties] = useState<Property[]>([]);
  const [bookings, setBookings] = useState<InspectionBooking[]>([]);
  const [submissions, setSubmissions] = useState<PropertySubmission[]>([]);
  const [inquiries, setInquiries] = useState<PropertyInquiry[]>([]);
  const [currentOwner, setCurrentOwner] = useState<OwnerAccount | null>(null);
  const [currentAdminStaff, setCurrentAdminStaff] = useState<AdminStaffAccount | null>(null);

  const [agents, setAgents] = useState<AgentInfo[]>(INITIAL_AGENTS);

  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [inspectionTargetProperty, setInspectionTargetProperty] = useState<Property | null>(null);
  const [inquiryTargetProperty, setInquiryTargetProperty] = useState<Property | null>(null);
  const [isListPropertyOpen, setIsListPropertyOpen] = useState(false);
  const [isOwnerPortalOpen, setIsOwnerPortalOpen] = useState(false);
  const [isPortalGateOpen, setIsPortalGateOpen] = useState(false);
  const [isAdminLoginOpen, setIsAdminLoginOpen] = useState(false);
  const [isAboutProcessOpen, setIsAboutProcessOpen] = useState(false);
  const [savedIds, setSavedIds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('smartbridge_saved');
      return saved ? JSON.parse(saved) : ['prop-1'];
    } catch {
      return ['prop-1'];
    }
  });

  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const [filterState, setFilterState] = useState<FilterState>({
    type: 'all',
    location: '',
    propertyType: 'Any Type',
    bedrooms: 'Any',
    minPrice: 0,
    maxPrice: 1000000000,
    verifiedOnly: false,
    searchQuery: '',
    sortBy: 'featured',
  });

  // Initial fetch from Supabase if configured
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    // Public visitors only receive approved properties from the safe view.
    supabaseDb.fetchProperties().then((cloudProps) => {
      setProperties(cloudProps);
    });

    const applySession = async (session: any) => {
      if (!session?.user) {
        setCurrentOwner(null);
        setCurrentAdminStaff(null);
        return;
      }

      const userMeta = session.user.user_metadata || {};
      const profile = await supabaseDb.fetchProfile(session.user.id);
      const role = profile?.role || userMeta.role;

      if (role === 'admin') {
        setCurrentOwner(null);
        setCurrentAdminStaff({
          id: session.user.id,
          name: profile?.name || userMeta.full_name || session.user.email?.split('@')[0] || 'Staff Admin',
          email: session.user.email || '',
          role: 'Operations Director',
          badge: 'Authorised Administrator',
          pin: '••••',
        });
      } else {
        setCurrentAdminStaff(null);
        setCurrentOwner({
          id: session.user.id,
          name: profile?.name || userMeta.full_name || session.user.email?.split('@')[0] || 'Property Lister',
          email: session.user.email || '',
          phone: profile?.phone || userMeta.phone || '',
          companyName: profile?.companyName || userMeta.company_name || '',
          avatar: profile?.avatar || userMeta.avatar_url,
          isVerifiedLandlord: Boolean(profile?.verified),
          joinedAt: profile ? undefined : new Date().toISOString().split('T')[0],
        });
      }
    };

    supabase.auth.getSession().then(({ data }) => applySession(data.session));

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      void applySession(session);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Load private operational data only after Supabase has identified the user.
  useEffect(() => {
    if (!isSupabaseConfigured || !supabase) return;

    if (currentAdminStaff) {
      void Promise.all([
        supabaseDb.fetchSubmissions(),
        supabaseDb.fetchInquiries(),
        supabaseDb.fetchBookings(),
        supabaseDb.fetchProperties(false),
      ]).then(([cloudSubs, cloudInqs, cloudBookings, cloudProps]) => {
        setSubmissions(cloudSubs);
        setInquiries(cloudInqs);
        setBookings(cloudBookings);
        setProperties(cloudProps);
      });
    } else if (currentOwner) {
      void supabaseDb.fetchSubmissions().then(setSubmissions);
      setInquiries([]);
      setBookings([]);
    } else {
      setSubmissions([]);
      setInquiries([]);
      setBookings([]);
      void supabaseDb.fetchProperties().then(setProperties);
    }
  }, [currentAdminStaff, currentOwner]);

  // Synchronize URL location with application view
  useEffect(() => {
    const handleUrlRoute = () => {
      const path = window.location.pathname;
      const hash = window.location.hash;

      if (path === '/admin/login' || hash === '#admin-login') {
        if (currentAdminStaff) {
          setActiveScreen('admin');
          window.history.replaceState(null, '', '/admin/dashboard');
        } else {
          setIsAdminLoginOpen(true);
        }
      } else if (path === '/admin/dashboard' || path === '/admin' || hash === '#admin') {
        if (currentAdminStaff) {
          setActiveScreen('admin');
        } else {
          setActiveScreen('home');
          setIsAdminLoginOpen(true);
        }
      }
    };

    handleUrlRoute();
    window.addEventListener('popstate', handleUrlRoute);
    return () => window.removeEventListener('popstate', handleUrlRoute);
  }, [currentAdminStaff]);

  useEffect(() => {
    try {
      localStorage.setItem('smartbridge_saved', JSON.stringify(savedIds));
    } catch (e) {
      console.error(e);
    }
  }, [savedIds]);

  const addToast = (message: string, type: 'success' | 'info' = 'success') => {
    const id = Date.now().toString();
    setToasts((prev) => [...prev, { id, type, message }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  };

  const handleToggleSave = (id: string) => {
    setSavedIds((prev) => {
      const exists = prev.includes(id);
      if (exists) {
        addToast('Removed from your saved portfolio.', 'info');
        return prev.filter((item) => item !== id);
      } else {
        addToast('Added to your saved portfolio!', 'success');
        return [...prev, id];
      }
    });
  };

  const handleHeroSearch = (filters: Partial<FilterState>) => {
    setFilterState((prev) => ({
      ...prev,
      ...filters,
    }));
    setActiveScreen('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleNavigate = (screen: string) => {
    if (screen === 'for-rent') {
      setFilterState((prev) => ({ ...prev, type: 'rent' }));
      setActiveScreen('properties');
      window.history.pushState(null, '', '/#for-rent');
    } else if (screen === 'for-sale') {
      setFilterState((prev) => ({ ...prev, type: 'sale' }));
      setActiveScreen('properties');
      window.history.pushState(null, '', '/#for-sale');
    } else if (screen === 'properties') {
      setFilterState((prev) => ({ ...prev, type: 'all' }));
      setActiveScreen('properties');
      window.history.pushState(null, '', '/#properties');
    } else if (screen === 'about') {
      setIsAboutProcessOpen(true);
    } else if (screen === 'admin' || screen === 'admin/login') {
      if (currentAdminStaff) {
        setActiveScreen('admin');
        window.history.pushState(null, '', '/admin/dashboard');
      } else {
        setIsAdminLoginOpen(true);
        window.history.pushState(null, '', '/admin/login');
      }
    } else {
      setActiveScreen(screen);
      window.history.pushState(null, '', `/#${screen}`);
    }
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleSelectNeighborhood = (nhName: string) => {
    setFilterState((prev) => ({ ...prev, location: nhName, type: 'all' }));
    setActiveScreen('properties');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleInspectionBookingConfirmed = (booking: InspectionBooking) => {
    setInspectionTargetProperty(null);
    setBookings((prev) => [booking, ...prev]);
    addToast(
      `Viewing confirmed for ${booking.preferredDate} at ${booking.preferredTime}! Our specialist will call ${booking.phone}.`,
      'success'
    );
  };

  // Buyer Inquiry Submission Handler
  const handleBuyerInquirySuccess = (newInquiry: PropertyInquiry) => {
    setInquiries((prev) => [newInquiry, ...prev]);
    setInquiryTargetProperty(null);
    addToast(
      `Inquiry dispatched to ${newInquiry.ownerName || 'Property Advertiser'}! SmartBridge anti-fraud tracking enabled.`,
      'success'
    );
  };

  const handleUpdateInquiryStatus = (inquiryId: string, status: InquiryStatus) => {
    setInquiries((prev) =>
      prev.map((i) => {
        if (i.id === inquiryId) {
          const updated = { ...i, status };
          supabaseDb.saveInquiry(updated);
          return updated;
        }
        return i;
      })
    );
    addToast(`Inquiry status updated to "${status}".`, 'info');
  };

  // Landlord Login / Logout
  const handleOwnerLogin = (owner: OwnerAccount) => {
    setCurrentOwner(owner);
    addToast(`Signed in as ${owner.name} (${owner.companyName || 'Property Lister'}).`, 'success');
  };

  const handleOwnerLogout = async () => {
    await supabase?.auth.signOut();
    setCurrentOwner(null);
    addToast('Signed out of Property Lister & Host Portal.', 'info');
  };

  // Admin Staff Login / Logout
  const handleAdminLogin = (staff: AdminStaffAccount) => {
    setCurrentAdminStaff(staff);
    setActiveScreen('admin');
    window.history.pushState(null, '', '/admin/dashboard');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast(`Authenticated as ${staff.name} (${staff.role}). Admin Operations Desk unlocked.`, 'success');
  };

  const handleAdminLogout = async () => {
    await supabase?.auth.signOut();
    setCurrentAdminStaff(null);
    setActiveScreen('home');
    window.history.pushState(null, '', '/');
    window.scrollTo({ top: 0, behavior: 'smooth' });
    addToast('Operations Desk locked. Admin signed out successfully.', 'info');
  };

  const handleListPropertySuccess = async (_data: PropertySubmission) => {
    setIsListPropertyOpen(false);
    setSubmissions(await supabaseDb.fetchSubmissions());
    addToast(
      'Property listing submitted for administrator review.',
      'success'
    );
  };

  // Admin Management Handlers
  const handleSaveProperty = async (savedProp: Property) => {
    const saved = await supabaseDb.saveProperty(savedProp);
    if (!saved) {
      addToast(`Property "${savedProp.title}" could not be saved.`, 'info');
      return;
    }
    setProperties(await supabaseDb.fetchProperties(false));
    addToast(`Property "${savedProp.title}" saved successfully.`, 'success');
  };

  const handleDeleteProperty = async (propertyId: string) => {
    const deleted = await supabaseDb.deleteProperty(propertyId);
    if (!deleted) {
      addToast('Property could not be removed.', 'info');
      return;
    }
    setProperties(await supabaseDb.fetchProperties(false));
    addToast('Property removed from catalog.', 'info');
  };

  const handleToggleVerified = (propertyId: string) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === propertyId) {
          const next = !p.isVerified;
          addToast(`Verification status updated to ${next ? 'Verified' : 'Unverified'}.`, 'info');
          return { ...p, isVerified: next };
        }
        return p;
      })
    );
  };

  const handleToggleFeatured = (propertyId: string) => {
    setProperties((prev) =>
      prev.map((p) => {
        if (p.id === propertyId) {
          const next = !p.isFeatured;
          addToast(`Featured status updated to ${next ? 'Featured on Home' : 'Standard'}.`, 'info');
          return { ...p, isFeatured: next };
        }
        return p;
      })
    );
  };

  const handleUpdateSubmissionStatus = async (submissionId: string, status: AuditStatus, notes?: string) => {
    const updated = await supabaseDb.updateSubmissionStatus(submissionId, status, notes);
    if (!updated) {
      addToast('Submission status could not be updated.', 'info');
      return;
    }
    setSubmissions(await supabaseDb.fetchSubmissions());
    addToast(`Submission status updated to ${status}.`, 'info');
  };

  const handleApproveAndPublishSubmission = async (submission: PropertySubmission, _auditScore: number) => {
    if (!submission.id) {
      addToast('This submission has no valid database ID.', 'info');
      return;
    }

    const promotedImages = (
      await Promise.all((submission.images || []).map((path) => supabaseDb.promoteSubmissionImage(path)))
    ).filter((url): url is string => Boolean(url));

    if (promotedImages.length === 0) {
      addToast('The submitted images could not be promoted for public display.', 'info');
      return;
    }

    const priceNum = typeof submission.price === 'number' ? submission.price : parseInt(String(submission.price).replace(/[^0-9]/g, ''), 10) || 80000000;
    const formattedPrice = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(priceNum);

    const newLiveProperty: Property = {
      id: crypto.randomUUID(),
      title: submission.title,
      slug: submission.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
      location: submission.location as any,
      neighborhood: (submission.location as any) || 'GRA Phase 2',
      address: submission.address,
      price: priceNum,
      priceDisplay: formattedPrice,
      pricePeriod: submission.listingType === 'rent' ? '/yr' : undefined,
      type: submission.listingType,
      propertyType: submission.propertyType,
      bedrooms: Number(submission.bedrooms) || 0,
      bathrooms: Number(submission.bathrooms) || 0,
      parkingSpaces: 0,
      sizeSqFt: 0,
      isVerified: true,
      isFeatured: false,
      status: 'approved',
      ownerId: submission.ownerId,
      ownerName: submission.ownerName,
      ownerEmail: submission.ownerEmail,
      images: promotedImages,
      videos: submission.videos || (submission.videoUrl ? [submission.videoUrl] : []),
      videoUrl: submission.videoUrl || submission.videos?.[0],
      description: submission.description || '',
      features: [],
      amenities: [],
      inspectionReport: undefined,
      agent: undefined,
    };

    const propertySaved = await supabaseDb.saveProperty(newLiveProperty);
    if (!propertySaved) {
      addToast('Approval failed because the public property could not be saved.', 'info');
      return;
    }

    const submissionUpdated = await supabaseDb.updateSubmissionStatus(
      submission.id,
      'approved',
      'Approved and published by an authorised administrator.',
      newLiveProperty.id
    );
    if (!submissionUpdated) {
      await supabaseDb.deleteProperty(newLiveProperty.id);
      addToast('Approval was rolled back because the submission status could not be updated.', 'info');
      return;
    }

    setProperties(await supabaseDb.fetchProperties(false));
    setSubmissions(await supabaseDb.fetchSubmissions());
    addToast(`Listing "${submission.title}" approved and published to live marketplace!`, 'success');
  };

  const handleUpdateBookingStatus = (bookingId: string, status: BookingStatus, specialist?: string) => {
    setBookings((prev) =>
      prev.map((b) => {
        if (b.id === bookingId) {
          return {
            ...b,
            status,
            assignedSpecialist: specialist || b.assignedSpecialist,
          };
        }
        return b;
      })
    );
    addToast(`Booking appointment status updated to ${status}.`, 'info');
  };

  const handleShareProperty = (property: Property) => {
    navigator.clipboard?.writeText(window.location.href);
    addToast(`Link to "${property.title}" copied to clipboard!`, 'info');
  };

  // If Admin Screen is active
  if (activeScreen === 'admin') {
    // If not authenticated as admin staff, redirect home and open admin login modal
    if (!currentAdminStaff) {
      setActiveScreen('home');
      setIsAdminLoginOpen(true);
      return null;
    }

    return (
      <div className="min-h-screen bg-[#FCF9F2] text-[#1b1c1c]">
        <AdminDashboard
          properties={properties}
          bookings={bookings}
          submissions={submissions}
          agents={agents}
          currentAdminStaff={currentAdminStaff}
          onAdminLogout={handleAdminLogout}
          onBackToMarketplace={() => {
            setActiveScreen('home');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          }}
          onSaveProperty={handleSaveProperty}
          onDeleteProperty={handleDeleteProperty}
          onToggleVerified={handleToggleVerified}
          onToggleFeatured={handleToggleFeatured}
          onUpdateSubmissionStatus={handleUpdateSubmissionStatus}
          onApproveAndPublishSubmission={handleApproveAndPublishSubmission}
          onUpdateBookingStatus={handleUpdateBookingStatus}
          onViewPropertyDetail={(prop) => setSelectedProperty(prop)}
        />

        {/* Global Modals while in admin preview */}
        {selectedProperty && (
          <PropertyDetailModal
            property={selectedProperty}
            onClose={() => setSelectedProperty(null)}
            onScheduleInspection={(prop) => {
              setSelectedProperty(null);
              setInspectionTargetProperty(prop);
            }}
            onOpenInquiry={(prop) => {
              setSelectedProperty(null);
              setInquiryTargetProperty(prop);
            }}
            isSaved={savedIds.includes(selectedProperty.id)}
            onToggleSave={handleToggleSave}
            onShare={handleShareProperty}
          />
        )}

        <ToastContainer
          toasts={toasts}
          onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
        />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#FCF9F2] text-[#1b1c1c] selection:bg-[#064e3b] selection:text-[#b0f0d6]">
      {/* Sticky Top Navigation */}
      <Navbar
        activeScreen={activeScreen}
        onNavigate={handleNavigate}
        onOpenListProperty={() => setIsListPropertyOpen(true)}
        onOpenAboutProcess={() => setIsAboutProcessOpen(true)}
        savedCount={savedIds.length}
        onOpenSaved={() => {
          setActiveScreen('saved');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
        onOpenPortalGate={() => setIsPortalGateOpen(true)}
        currentOwner={currentOwner}
        currentAdminStaff={currentAdminStaff}
      />

      {/* Main Screen Views */}
      <main className="flex-1">
        {activeScreen === 'home' && (
          <div>
            {/* 1. Hero Section with Background & Search Panel */}
            <Hero
              onSearch={handleHeroSearch}
              onOpenListProperty={() => setIsListPropertyOpen(true)}
              onBrowseAll={() => {
                setFilterState((prev) => ({ ...prev, type: 'all', location: '' }));
                setActiveScreen('properties');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
            />

            {/* 2. Trust Indicators (500+ Listings, Top Specialists, 100% Direct Inspection, 24/7) */}
            <TrustStats />

            {/* 3. Featured Properties */}
            <FeaturedProperties
              properties={properties}
              onSelectProperty={(prop) => setSelectedProperty(prop)}
              onViewAll={() => {
                setFilterState((prev) => ({ ...prev, type: 'all' }));
                setActiveScreen('properties');
                window.scrollTo({ top: 0, behavior: 'smooth' });
              }}
              savedIds={savedIds}
              onToggleSave={handleToggleSave}
            />

            {/* 4. Trust & Physical Verification Section */}
            <TrustVerificationSection
              onLearnMore={() => setIsAboutProcessOpen(true)}
            />

            {/* 5. Prime Port Harcourt Neighborhoods Explorer */}
            <NeighborhoodExplorer
              onSelectNeighborhood={handleSelectNeighborhood}
            />
          </div>
        )}

        {(activeScreen === 'properties' || activeScreen === 'saved') && (
          <PropertiesView
            properties={properties}
            initialFilters={filterState}
            onSelectProperty={(prop) => setSelectedProperty(prop)}
            savedIds={savedIds}
            onToggleSave={handleToggleSave}
            showSavedOnly={activeScreen === 'saved'}
          />
        )}
      </main>

      {/* Footer */}
      <Footer
        onNavigate={handleNavigate}
        onOpenListProperty={() => setIsListPropertyOpen(true)}
        onOpenAboutProcess={() => setIsAboutProcessOpen(true)}
      />

      {/* Modals & Overlays */}
      {selectedProperty && (
        <PropertyDetailModal
          property={selectedProperty}
          onClose={() => setSelectedProperty(null)}
          onScheduleInspection={(prop) => {
            setSelectedProperty(null);
            setInspectionTargetProperty(prop);
          }}
          onOpenInquiry={(prop) => {
            setSelectedProperty(null);
            setInquiryTargetProperty(prop);
          }}
          isSaved={savedIds.includes(selectedProperty.id)}
          onToggleSave={handleToggleSave}
          onShare={handleShareProperty}
        />
      )}

      {/* Buyer / Visitor Direct Inquiry & Offer Modal */}
      {inquiryTargetProperty && (
        <PropertyInquiryModal
          property={inquiryTargetProperty}
          onClose={() => setInquiryTargetProperty(null)}
          onSubmitSuccess={handleBuyerInquirySuccess}
        />
      )}

      {/* Buyer Inspection Viewing Scheduler */}
      {inspectionTargetProperty && (
        <ScheduleInspectionModal
          property={inspectionTargetProperty}
          onClose={() => setInspectionTargetProperty(null)}
          onBookingConfirmed={handleInspectionBookingConfirmed}
        />
      )}

      {/* Unified Portal Gateway Modal (Lister & Admin Access Gate) */}
      <UnifiedPortalGateModal
        isOpen={isPortalGateOpen}
        onClose={() => setIsPortalGateOpen(false)}
        currentOwner={currentOwner}
        currentAdminStaff={currentAdminStaff}
        onSelectListerPortal={() => setIsOwnerPortalOpen(true)}
        onSelectAdminPortal={() => {
          if (currentAdminStaff) {
            setActiveScreen('admin');
            window.history.pushState(null, '', '/admin/dashboard');
            window.scrollTo({ top: 0, behavior: 'smooth' });
          } else {
            setIsAdminLoginOpen(true);
            window.history.pushState(null, '', '/admin/login');
          }
        }}
      />

      {/* Admin Operations Desk Supabase Authentication Modal */}
      <AdminLoginModal
        isOpen={isAdminLoginOpen}
        onClose={() => {
          setIsAdminLoginOpen(false);
          if (window.location.pathname === '/admin/login') {
            window.history.pushState(null, '', '/');
          }
        }}
        onSuccessLogin={handleAdminLogin}
      />

      {/* Property Lister / Host Private Portal */}
      {isOwnerPortalOpen && (
        <OwnerPortalModal
          currentOwner={currentOwner}
          onLogin={handleOwnerLogin}
          onLogout={handleOwnerLogout}
          onClose={() => setIsOwnerPortalOpen(false)}
          properties={properties}
          submissions={submissions}
          inquiries={inquiries}
          onOpenListProperty={() => setIsListPropertyOpen(true)}
          onUpdateInquiryStatus={handleUpdateInquiryStatus}
          onUpdateOwner={(updated) => setCurrentOwner(updated)}
        />
      )}

      {/* Property Listing Media Wizard */}
      {isListPropertyOpen && (
        <ListPropertyModal
          currentOwner={currentOwner}
          onClose={() => setIsListPropertyOpen(false)}
          onSubmitSuccess={handleListPropertySuccess}
        />
      )}

      {isAboutProcessOpen && (
        <AboutProcessModal
          onClose={() => setIsAboutProcessOpen(false)}
          onBrowseProperties={() => {
            setIsAboutProcessOpen(false);
            setActiveScreen('properties');
          }}
          onListProperty={() => {
            setIsAboutProcessOpen(false);
            setIsListPropertyOpen(true);
          }}
        />
      )}

      {/* Toast Feedback */}
      <ToastContainer
        toasts={toasts}
        onDismiss={(id) => setToasts((prev) => prev.filter((t) => t.id !== id))}
      />
    </div>
  );
}
