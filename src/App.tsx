import React, { useState, useEffect } from 'react';
import { PROPERTIES } from './data/properties';
import { INITIAL_BOOKINGS, INITIAL_SUBMISSIONS, INITIAL_AGENTS } from './data/adminData';
import { Property, FilterState, InspectionBooking, PropertySubmission, AgentInfo, AuditStatus, BookingStatus } from './types';
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
import { Footer } from './components/Footer';
import { ToastContainer, ToastMessage } from './components/Toast';
import { AdminDashboard } from './components/admin/AdminDashboard';

export default function App() {
  const [properties, setProperties] = useState<Property[]>(() => {
    try {
      const stored = localStorage.getItem('smartbridge_properties');
      return stored ? JSON.parse(stored) : PROPERTIES;
    } catch {
      return PROPERTIES;
    }
  });

  const [bookings, setBookings] = useState<InspectionBooking[]>(() => {
    try {
      const stored = localStorage.getItem('smartbridge_bookings');
      return stored ? JSON.parse(stored) : INITIAL_BOOKINGS;
    } catch {
      return INITIAL_BOOKINGS;
    }
  });

  const [submissions, setSubmissions] = useState<PropertySubmission[]>(() => {
    try {
      const stored = localStorage.getItem('smartbridge_submissions');
      return stored ? JSON.parse(stored) : INITIAL_SUBMISSIONS;
    } catch {
      return INITIAL_SUBMISSIONS;
    }
  });

  const [agents, setAgents] = useState<AgentInfo[]>(INITIAL_AGENTS);

  const [activeScreen, setActiveScreen] = useState<string>('home');
  const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
  const [inspectionTargetProperty, setInspectionTargetProperty] = useState<Property | null>(null);
  const [isListPropertyOpen, setIsListPropertyOpen] = useState(false);
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

  // LocalStorage synchronizations
  useEffect(() => {
    try {
      localStorage.setItem('smartbridge_properties', JSON.stringify(properties));
    } catch (e) {
      console.error(e);
    }
  }, [properties]);

  useEffect(() => {
    try {
      localStorage.setItem('smartbridge_bookings', JSON.stringify(bookings));
    } catch (e) {
      console.error(e);
    }
  }, [bookings]);

  useEffect(() => {
    try {
      localStorage.setItem('smartbridge_submissions', JSON.stringify(submissions));
    } catch (e) {
      console.error(e);
    }
  }, [submissions]);

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
    } else if (screen === 'for-sale') {
      setFilterState((prev) => ({ ...prev, type: 'sale' }));
      setActiveScreen('properties');
    } else if (screen === 'properties') {
      setFilterState((prev) => ({ ...prev, type: 'all' }));
      setActiveScreen('properties');
    } else if (screen === 'about') {
      setIsAboutProcessOpen(true);
    } else {
      setActiveScreen(screen);
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
      `Viewing confirmed for ${booking.preferredDate} at ${booking.preferredTime}! Our PH specialist will call ${booking.phone}.`,
      'success'
    );
  };

  const handleListPropertySuccess = (data: PropertySubmission) => {
    setIsListPropertyOpen(false);
    const newSubmission: PropertySubmission = {
      ...data,
      id: `sub-${Date.now()}`,
      status: 'pending_audit',
      submittedAt: new Date().toISOString(),
      floodAssessment: 'Standard Drainage Network',
      structuralScore: 94,
    };
    setSubmissions((prev) => [newSubmission, ...prev]);
    addToast('Property listing submitted! Physical inspection audit queued at Operations Desk.', 'success');
  };

  // Admin Management Handlers
  const handleSaveProperty = (savedProp: Property) => {
    setProperties((prev) => {
      const existsIndex = prev.findIndex((p) => p.id === savedProp.id);
      if (existsIndex >= 0) {
        const updated = [...prev];
        updated[existsIndex] = savedProp;
        return updated;
      }
      return [savedProp, ...prev];
    });
    addToast(`Property "${savedProp.title}" published successfully!`, 'success');
  };

  const handleDeleteProperty = (propertyId: string) => {
    setProperties((prev) => prev.filter((p) => p.id !== propertyId));
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

  const handleUpdateSubmissionStatus = (submissionId: string, status: AuditStatus, notes?: string) => {
    setSubmissions((prev) =>
      prev.map((s) => {
        if (s.id === submissionId) {
          return { ...s, status, auditNotes: notes || s.auditNotes };
        }
        return s;
      })
    );
    addToast(`Submission status updated to ${status}.`, 'info');
  };

  const handleApproveAndPublishSubmission = (submission: PropertySubmission, auditScore: number) => {
    const assignedAgent = INITIAL_AGENTS[0];
    const priceNum = typeof submission.price === 'number' ? submission.price : parseInt(String(submission.price).replace(/[^0-9]/g, ''), 10) || 80000000;
    const formattedPrice = new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      maximumFractionDigits: 0,
    }).format(priceNum);

    const newLiveProperty: Property = {
      id: `prop-${Date.now()}`,
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
      bedrooms: Number(submission.bedrooms) || 4,
      bathrooms: Number(submission.bathrooms) || 4,
      parkingSpaces: 3,
      sizeSqFt: 3600,
      isVerified: true,
      isFeatured: false,
      status: 'active',
      images:
        submission.images && submission.images.length > 0
          ? submission.images
          : [
              'https://lh3.googleusercontent.com/aida-public/AB6AXuBnM3MYULmJ4ZEJl9XEr61oKVlBvSTqv3aqb1s6jID-b8Npnv_qcaRB9ko4FrkCv1DvYqNK1TyE6tdjPD0B4ZS2Gs8O2ZyAM8_YuCNHmV-_o2ax9ggP6AJ1o98KsYr6U4JVPQw4GklZnFyXZLRQVjSjIc8Ze_n3-etnAVPRqsgHJ4tFjqBkm0C2EOAVSYYwWoX6cRJk-evBjH86EWmjefI5olKsClrdgeLRQeVejHh_Z8nhO_EWtHOR',
              'https://lh3.googleusercontent.com/aida-public/AB6AXuCjrQosth7RHP5almX6ejQjrP7s9Tk8409-bH6taZWnmcCz4KXYefv3XMhSUvXBunHiE7wYxw4m_5BKrz6MCL7zuABKVgmCYeYAzoB3oga9ljul6yPpgfE9I--_n8ESfGy31QrW-mjtRDzKoDYHC9pov0fzyaYLXV-zXP_ZIH-YBK3NNbu8XzFkqUMeq1vTaz_1jsfmyKRu-WKr1_fRG43wPDhqE-ow8SzmCflhPcKhJBpYirHSK_rE',
            ],
      videos: submission.videos || (submission.videoUrl ? [submission.videoUrl] : []),
      videoUrl: submission.videoUrl || submission.videos?.[0],
      description: submission.description || `Exquisite verified property in ${submission.location}, Port Harcourt. Title: ${submission.titleDocType}.`,
      features: ['All Rooms Ensuite with Water Heaters', 'Fitted Kitchen with Heat Extractor', 'Dedicated Inverter Wiring', '24/7 Security Patrol'],
      amenities: ['CCTV Surveillance', 'Industrial Borehole Water Plant', 'Interlocked Access Road'],
      inspectionReport: {
        inspectedDate: 'Recent Physical Audit',
        inspectorName: submission.assignedInspector || 'Engr. Tamara Briggs, FNSE',
        inspectorId: 'SB-INSP-041',
        overallScore: auditScore,
        titleDocumentType: (submission.titleDocType as any) || 'C of O',
        titleVerified: true,
        floodRisk: 'Zero Risk (Elevated)',
        powerGridStability: 'Dedicated 33kVA Feeder Line + Backup',
        securityRating: 'Grade A+ (Gated Estate Patrol)',
        checklist: [
          { name: 'Certificate of Occupancy & Registry Search', status: 'passed', notes: 'Verified clean at Rivers State Ministry of Lands.' },
          { name: 'Structural Integrity & Concrete Strength', status: 'passed', notes: 'Structural engineering audit test passed with zero crack index.' },
          { name: 'Electrical Wiring & Surge Earthing', status: 'passed', notes: 'Copper surge arresters and earthing tests passed.' },
          { name: 'Topographical Elevation & Storm Drainage', status: 'passed', notes: 'Elevated plot with gravity stormwater drainage channel.' }
        ]
      },
      agent: {
        name: assignedAgent.name,
        role: assignedAgent.role,
        phone: assignedAgent.phone,
        whatsapp: assignedAgent.whatsapp,
        avatar: assignedAgent.avatar,
        badge: assignedAgent.badge,
      }
    };

    setProperties((prev) => [newLiveProperty, ...prev]);
    if (submission.id) {
      handleUpdateSubmissionStatus(submission.id, 'approved', 'Audit approved and published to public marketplace.');
    }
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
    return (
      <div className="min-h-screen bg-[#FCF9F2] text-[#1b1c1c]">
        <AdminDashboard
          properties={properties}
          bookings={bookings}
          submissions={submissions}
          agents={agents}
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
        onOpenAdmin={() => {
          setActiveScreen('admin');
          window.scrollTo({ top: 0, behavior: 'smooth' });
        }}
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
          isSaved={savedIds.includes(selectedProperty.id)}
          onToggleSave={handleToggleSave}
          onShare={handleShareProperty}
        />
      )}

      {inspectionTargetProperty && (
        <ScheduleInspectionModal
          property={inspectionTargetProperty}
          onClose={() => setInspectionTargetProperty(null)}
          onBookingConfirmed={handleInspectionBookingConfirmed}
        />
      )}

      {isListPropertyOpen && (
        <ListPropertyModal
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

