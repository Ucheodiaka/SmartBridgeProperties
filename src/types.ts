export type PropertyType = 'Apartment' | 'Duplex' | 'Terrace' | 'Penthouse' | 'Mansion' | 'Commercial';
export type ListingType = 'sale' | 'rent';

export interface InspectionCheckItem {
  name: string;
  status: 'passed' | 'warning' | 'pending';
  notes: string;
}

export interface InspectionReport {
  inspectedDate: string;
  inspectorName: string;
  inspectorId: string;
  overallScore: number; // 0-100
  titleDocumentType: 'C of O' | "Governor's Consent" | 'Deed of Conveyance' | 'Gazette';
  titleVerified: boolean;
  floodRisk: 'Low' | 'Moderate' | 'Zero Risk (Elevated)';
  powerGridStability: string;
  securityRating: string;
  checklist: InspectionCheckItem[];
}

export interface AgentInfo {
  id?: string;
  name: string;
  role: string;
  phone: string;
  whatsapp: string;
  avatar: string;
  badge: string;
  activeListings?: number;
  completedAudits?: number;
  rating?: number;
}

export interface Property {
  id: string;
  title: string;
  slug: string;
  location: string;
  neighborhood: 'GRA Phase 2' | 'Peter Odili Road' | 'Woji' | 'Old GRA' | 'Ada George' | 'Trans Amadi' | 'Golf Estate';
  address: string;
  price: number;
  priceDisplay: string;
  pricePeriod?: string; // e.g. "/yr"
  type: ListingType;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  sizeSqFt: number;
  isVerified: boolean;
  isFeatured: boolean;
  images: string[];
  videos?: string[];
  videoUrl?: string;
  description: string;
  features: string[];
  amenities: string[];
  inspectionReport: InspectionReport;
  agent: AgentInfo;
  coordinates?: {
    lat: number;
    lng: number;
  };
  createdAt?: string;
  ownerId?: string;
  ownerEmail?: string;
  ownerName?: string;
  status?: 'active' | 'pending_verification' | 'sold' | 'rented' | 'draft';
}

export interface FilterState {
  type: ListingType | 'all';
  location: string;
  propertyType: PropertyType | 'Any Type';
  bedrooms: string; // 'Any' | '1+' | '2+' | '3+' | '4+' | '5+'
  minPrice: number;
  maxPrice: number;
  verifiedOnly: boolean;
  searchQuery: string;
  sortBy: 'featured' | 'price-asc' | 'price-desc' | 'newest';
}

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled' | 'rescheduled';

export interface InspectionBooking {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation?: string;
  propertyPrice?: string;
  name: string;
  email: string;
  phone: string;
  preferredDate: string;
  preferredTime: string;
  notes?: string;
  status: BookingStatus;
  createdAt: string;
  assignedSpecialist?: string;
}

export type AuditStatus = 'pending_audit' | 'in_progress' | 'approved' | 'rejected';

export interface PropertySubmission {
  id?: string;
  title: string;
  propertyType: PropertyType;
  listingType: ListingType;
  location: string;
  address: string;
  price: number | string;
  bedrooms: number | string;
  bathrooms: number | string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  description: string;
  titleDocType: string;
  images?: string[];
  videos?: string[];
  videoUrl?: string;
  status?: AuditStatus;
  submittedAt?: string;
  assignedInspector?: string;
  auditNotes?: string;
  floodAssessment?: string;
  structuralScore?: number;
}

export type UserRole = 'landlord' | 'agent' | 'developer' | 'admin';

export interface OwnerAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  role?: 'landlord' | 'agent' | 'developer';
  companyName?: string;
  avatar?: string;
  isVerifiedLandlord: boolean;
  joinedAt: string;
  listerType?: 'Landlord / Property Owner' | 'Registered Real Estate Agent' | 'Property Developer';
  address?: string;
  bio?: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'tour_scheduled' | 'closed';

export interface PropertyInquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice?: string;
  ownerEmail: string;
  ownerName?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  inquiryType: 'buy' | 'rent' | 'offer' | 'general';
  offerAmount?: string;
  proposedMoveIn?: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  smartBridgeEscrowRequested?: boolean;
}

export type AdminTab = 'overview' | 'properties' | 'verification' | 'bookings' | 'analytics' | 'agents';

export interface AdminStaffAccount {
  id: string;
  name: string;
  email: string;
  role: 'Operations Director' | 'Lead Field Inspector' | 'Legal & Title Verifier' | 'Customer Support Desk';
  avatar?: string;
  pin: string;
  badge?: string;
}


