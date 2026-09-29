export type PropertyType = 'Apartment' | 'Duplex' | 'Terrace' | 'Penthouse' | 'Mansion' | 'Commercial';
export type ListingType = 'sale' | 'rent' | 'lease';

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
  neighborhood: string;
  address: string;
  price: number;
  priceDisplay: string;
  pricePeriod?: string; // e.g. "/yr"
  isNegotiable?: boolean;
  leaseTermYears?: number;
  agencyFeePercentage?: number;
  cautionFee?: number;
  serviceCharge?: number;
  legalFeePercentage?: number;
  otherCharges?: number;
  otherChargesDescription?: string;
  type: ListingType;
  propertyType: PropertyType;
  bedrooms: number;
  bathrooms: number;
  parkingSpaces: number;
  sizeSqFt: number;
  totalUnits?: number;
  availableUnits?: number;
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
  ownerPhone?: string;
  ownerCompanyName?: string;
  ownerBusinessAddress?: string;
  ownerBusinessDescription?: string;
  ownerListerType?: string;
  ownerLogoUrl?: string;
  status?: 'draft' | 'pending' | 'approved' | 'rejected' | 'unpublished' | 'sold' | 'rented';
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
  listerId?: string;
  confirmedDate?: string;
  confirmedTime?: string;
  listerResponse?: string;
  respondedAt?: string;
}

export interface ViewingRequestUpdate {
  status: Exclude<BookingStatus, 'pending'>;
  confirmedDate?: string;
  confirmedTime?: string;
  listerResponse?: string;
}

export type PropertyStatus = 'draft' | 'pending' | 'approved' | 'rejected' | 'unpublished' | 'sold' | 'rented';
export type AuditStatus = PropertyStatus;

export interface PropertySubmission {
  id?: string;
  ownerId?: string;
  title: string;
  propertyType: PropertyType;
  listingType: ListingType;
  location: string;
  address: string;
  price: number | string;
  isNegotiable?: boolean;
  leaseTermYears?: number | string;
  agencyFeePercentage?: number | string;
  cautionFee?: number | string;
  serviceCharge?: number | string;
  legalFeePercentage?: number | string;
  otherCharges?: number | string;
  otherChargesDescription?: string;
  bedrooms: number | string;
  bathrooms: number | string;
  totalUnits?: number | string;
  availableUnits?: number | string;
  ownerName: string;
  ownerPhone: string;
  ownerEmail: string;
  description: string;
  titleDocType: string;
  images?: string[];
  videos?: string[];
  videoUrl?: string;
  status?: PropertyStatus;
  submittedAt?: string;
  assignedInspector?: string;
  auditNotes?: string;
  floodAssessment?: string;
  structuralScore?: number;
  approvedPropertyId?: string;
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
  avatarPath?: string;
  publicLogoUrl?: string;
  isVerifiedLandlord: boolean;
  joinedAt: string;
  listerType?: 'Landlord / Property Owner' | 'Registered Real Estate Agent' | 'Property Developer' | 'Short-let Host';
  address?: string;
  bio?: string;
}

export type InquiryStatus = 'new' | 'contacted' | 'tour_scheduled' | 'closed';

export interface LeadFollowUpUpdate {
  adminNotes?: string;
  assignedStaffId?: string | null;
  assignedStaffName?: string | null;
  followUpAt?: string | null;
  contactAttempts?: number;
  lastContactedAt?: string | null;
}

export interface PropertyInquiry {
  id: string;
  propertyId: string;
  propertyTitle: string;
  propertyLocation: string;
  propertyPrice?: string;
  ownerEmail: string;
  ownerName?: string;
  listerId?: string;
  buyerName: string;
  buyerPhone: string;
  buyerEmail: string;
  inquiryType: 'buy' | 'rent' | 'offer' | 'general';
  offerAmount?: string;
  proposedMoveIn?: string;
  message: string;
  status: InquiryStatus;
  createdAt: string;
  adminNotes?: string;
  assignedStaffId?: string;
  assignedStaffName?: string;
  followUpAt?: string;
  contactAttempts?: number;
  lastContactedAt?: string;
}

export type PromotionCategory =
  | 'Property Management'
  | 'Property Consulting'
  | 'Property Valuation'
  | 'Verified Partner'
  | 'Other Service';

export interface BusinessPromotion {
  id: string;
  businessName: string;
  category: PromotionCategory;
  description: string;
  imageUrl?: string;
  linkUrl?: string;
  phone?: string;
  ctaLabel: string;
  isActive: boolean;
  displayOrder: number;
  createdAt?: string;
  updatedAt?: string;
}

export type AdminTab = 'overview' | 'properties' | 'submissions' | 'leads' | 'promotions' | 'verification' | 'bookings' | 'analytics' | 'agents';

export interface AdminStaffAccount {
  id: string;
  name: string;
  email: string;
  role: 'Operations Director' | 'Lead Field Inspector' | 'Legal & Title Verifier' | 'Customer Support Desk';
  avatar?: string;
  pin: string;
  badge?: string;
}
