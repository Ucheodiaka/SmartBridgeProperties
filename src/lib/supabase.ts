import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Property,
  PropertySubmission,
  PropertyInquiry,
  InspectionBooking,
  InquiryStatus,
  BookingStatus,
  AuditStatus,
} from '../types';

// Environment variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || '';
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || '';

export const isSupabaseConfigured = Boolean(
  supabaseUrl &&
  supabaseAnonKey &&
  supabaseUrl !== 'MY_SUPABASE_URL' &&
  !supabaseUrl.includes('placeholder')
);

// Initialize real Supabase client if configured
export const supabase: SupabaseClient | null = isSupabaseConfigured
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null;

// ==========================================
// Authentication Functions (Google & Email)
// ==========================================

export interface AuthUserProfile {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  role?: 'landlord' | 'agent' | 'developer' | 'admin' | 'buyer';
  companyName?: string;
  phone?: string;
  verified?: boolean;
}

/**
 * Sign in using Google OAuth Credentials.
 * Supports custom selected Google account or default authenticated user.
 */
export async function signInWithGoogle(
  intendedRole: 'lister' | 'admin' = 'lister',
  customAccount?: { email: string; name?: string; avatar?: string }
): Promise<{ success: boolean; user?: AuthUserProfile; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithOAuth({
        provider: 'google',
        options: {
          redirectTo: window.location.origin,
          queryParams: {
            access_type: 'offline',
            prompt: 'select_account',
          },
        },
      });

      if (error) throw error;
      return { success: true };
    } catch (err: any) {
      console.error('Supabase Google Auth Error:', err);
      return { success: false, error: err?.message || 'Google Sign-In failed.' };
    }
  }

  // Selected or Custom Google Profile
  const selectedEmail = customAccount?.email || (intendedRole === 'admin' ? 'uche.admin@smartbridge.ng' : 'ucheodiaka@gmail.com');
  const selectedName = customAccount?.name || (intendedRole === 'admin' ? 'Uche Odiaka (Lead Operations)' : 'Uche Odiaka');
  const selectedAvatar = customAccount?.avatar || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=200&q=80';

  const googleProfile: AuthUserProfile = {
    id: `g-${selectedEmail.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
    email: selectedEmail,
    name: selectedName,
    avatar: selectedAvatar,
    role: intendedRole === 'admin' ? 'admin' : 'landlord',
    companyName: intendedRole === 'admin' ? 'SmartBridge Nigeria Ltd' : 'Verified Property Lister',
    phone: '+234 803 555 0192',
    verified: true,
  };

  // Attempt to save to Supabase profiles table if table exists
  await supabaseDb.saveProfile(googleProfile);

  return { success: true, user: googleProfile };
}

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUserProfile; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;

      const authUser = data.user;
      const userProfile: AuthUserProfile = {
        id: authUser.id,
        email: authUser.email || email,
        name: authUser.user_metadata?.full_name || email.split('@')[0],
        avatar: authUser.user_metadata?.avatar_url,
        role: authUser.user_metadata?.role || 'landlord',
        companyName: authUser.user_metadata?.company_name,
        phone: authUser.user_metadata?.phone,
        verified: true,
      };

      // Persist profile record
      await supabaseDb.saveProfile(userProfile);

      return { success: true, user: userProfile };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Failed to sign in.' };
    }
  }

  // Local validation fallback
  const localProfile: AuthUserProfile = {
    id: `usr-${email.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
    email,
    name: email.split('@')[0],
    role: 'landlord',
    phone: '+234 803 000 0000',
    companyName: 'Private Property Advertiser',
    verified: true,
  };

  await supabaseDb.saveProfile(localProfile);

  return {
    success: true,
    user: localProfile,
  };
}

/**
 * Sign Up with Email, Password and Profile Metadata
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: { fullName: string; phone?: string; companyName?: string; role?: string; avatar?: string }
): Promise<{ success: boolean; user?: AuthUserProfile; error?: string }> {
  if (isSupabaseConfigured && supabase) {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: metadata.fullName,
            phone: metadata.phone,
            company_name: metadata.companyName,
            role: metadata.role || 'landlord',
            avatar_url: metadata.avatar,
          },
        },
      });

      if (error) throw error;
      const authUser = data.user;
      if (!authUser) throw new Error('Registration failed.');

      const userProfile: AuthUserProfile = {
        id: authUser.id,
        email: authUser.email || email,
        name: metadata.fullName,
        role: (metadata.role as any) || 'landlord',
        companyName: metadata.companyName,
        phone: metadata.phone,
        avatar: metadata.avatar,
        verified: true,
      };

      // Explicitly write new profile to Supabase database
      await supabaseDb.saveProfile(userProfile);

      return { success: true, user: userProfile };
    } catch (err: any) {
      return { success: false, error: err?.message || 'Registration failed.' };
    }
  }

  const newProfile: AuthUserProfile = {
    id: `usr-${email.replace(/[^a-zA-Z0-9]/g, '-').toLowerCase()}`,
    email,
    name: metadata.fullName,
    phone: metadata.phone || '+234 803 000 0000',
    companyName: metadata.companyName || 'Private Property Advertiser',
    role: (metadata.role as any) || 'landlord',
    avatar: metadata.avatar,
    verified: true,
  };

  await supabaseDb.saveProfile(newProfile);

  return {
    success: true,
    user: newProfile,
  };
}

/**
 * Sign out of current session
 */
export async function signOut(): Promise<void> {
  if (isSupabaseConfigured && supabase) {
    try {
      await supabase.auth.signOut();
    } catch (err) {
      console.error('Supabase signOut error:', err);
    }
  }
}

// ==========================================
// Database Synchronizers (Supabase PostgreSQL)
// ==========================================

export const supabaseDb = {
  // 1. PROPERTIES
  async fetchProperties(): Promise<Property[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('properties')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data.map((item) => ({
        id: item.id,
        title: item.title,
        slug: item.slug || item.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        location: item.location,
        neighborhood: item.neighborhood || 'GRA Phase 2',
        address: item.address || item.location,
        price: Number(item.price),
        priceDisplay: item.price_display || `₦${Number(item.price).toLocaleString()}`,
        pricePeriod: item.price_period,
        type: item.type || (item.for_rent ? 'rent' : 'sale'),
        propertyType: item.property_type || 'Apartment',
        bedrooms: item.bedrooms || 0,
        bathrooms: item.bathrooms || 0,
        parkingSpaces: item.parking_spaces || 2,
        sizeSqFt: item.size_sq_ft || 2800,
        isVerified: Boolean(item.is_verified ?? true),
        isFeatured: Boolean(item.is_featured ?? false),
        images: item.images || [],
        videos: item.videos || (item.video_url ? [item.video_url] : []),
        videoUrl: item.video_url,
        description: item.description || '',
        features: item.features || [],
        amenities: item.amenities || [],
        inspectionReport: item.inspection_report || {
          inspectedDate: 'Verified',
          inspectorName: 'Engr. Tonye Amadi',
          inspectorId: 'SB-01',
          overallScore: 92,
          titleDocumentType: 'C of O',
          titleVerified: true,
          floodRisk: 'Zero Risk (Elevated)',
          powerGridStability: 'Dedicated Feeder Line',
          securityRating: 'Grade A+',
          checklist: [],
        },
        agent: item.agent || {
          name: 'Engr. Tonye Amadi',
          role: 'Lead Verified Specialist',
          phone: '+234 803 123 4567',
          whatsapp: '+234 803 123 4567',
          avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?auto=format&fit=crop&w=200&q=80',
          badge: 'COREN Certified',
        },
        ownerId: item.owner_id,
        ownerName: item.owner_name,
        ownerEmail: item.owner_email,
        status: item.status || 'active',
      }));
    } catch (e) {
      console.warn('Supabase fetchProperties error:', e);
      return null;
    }
  },

  async saveProperty(property: Property): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const payload = {
        id: property.id,
        title: property.title,
        slug: property.slug,
        location: property.location,
        neighborhood: property.neighborhood,
        address: property.address,
        price: property.price,
        price_display: property.priceDisplay,
        price_period: property.pricePeriod,
        type: property.type,
        property_type: property.propertyType,
        bedrooms: property.bedrooms,
        bathrooms: property.bathrooms,
        parking_spaces: property.parkingSpaces,
        size_sq_ft: property.sizeSqFt,
        is_verified: property.isVerified,
        is_featured: property.isFeatured,
        description: property.description,
        images: property.images,
        videos: property.videos,
        video_url: property.videoUrl,
        features: property.features,
        amenities: property.amenities,
        inspection_report: property.inspectionReport,
        agent: property.agent,
        owner_id: property.ownerId,
        owner_name: property.ownerName,
        owner_email: property.ownerEmail,
        status: property.status || 'active',
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('properties').upsert(payload);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase saveProperty error:', e);
      return false;
    }
  },

  async deleteProperty(propertyId: string): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const { error } = await supabase.from('properties').delete().eq('id', propertyId);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase deleteProperty error:', e);
      return false;
    }
  },

  // 2. SUBMISSIONS
  async fetchSubmissions(): Promise<PropertySubmission[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('property_submissions')
        .select('*')
        .order('submitted_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data.map((item) => ({
        id: item.id,
        title: item.title,
        propertyType: item.property_type,
        listingType: item.listing_type || 'sale',
        location: item.location,
        address: item.address || item.location,
        price: item.price,
        bedrooms: item.bedrooms,
        bathrooms: item.bathrooms,
        ownerName: item.owner_name,
        ownerPhone: item.owner_phone,
        ownerEmail: item.owner_email,
        description: item.description || '',
        titleDocType: item.title_doc_type || 'C of O',
        images: item.images || [],
        videos: item.videos || [],
        videoUrl: item.video_url,
        status: item.status as AuditStatus,
        submittedAt: item.submitted_at,
        assignedInspector: item.assigned_inspector,
        auditNotes: item.audit_notes,
        floodAssessment: item.flood_assessment,
        structuralScore: item.structural_score,
      }));
    } catch (e) {
      console.warn('Supabase fetchSubmissions error:', e);
      return null;
    }
  },

  async saveSubmission(sub: PropertySubmission): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const payload = {
        id: sub.id,
        title: sub.title,
        property_type: sub.propertyType,
        listing_type: sub.listingType,
        location: sub.location,
        address: sub.address,
        price: sub.price,
        bedrooms: sub.bedrooms,
        bathrooms: sub.bathrooms,
        owner_name: sub.ownerName,
        owner_phone: sub.ownerPhone,
        owner_email: sub.ownerEmail,
        description: sub.description,
        title_doc_type: sub.titleDocType,
        images: sub.images,
        videos: sub.videos,
        video_url: sub.videoUrl,
        status: sub.status,
        submitted_at: sub.submittedAt,
        assigned_inspector: sub.assignedInspector,
        audit_notes: sub.auditNotes,
        flood_assessment: sub.floodAssessment,
        structural_score: sub.structuralScore,
      };

      const { error } = await supabase.from('property_submissions').upsert(payload);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase saveSubmission error:', e);
      return false;
    }
  },

  // 3. INQUIRIES
  async fetchInquiries(): Promise<PropertyInquiry[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('property_inquiries')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data.map((item) => ({
        id: item.id,
        propertyId: item.property_id,
        propertyTitle: item.property_title,
        propertyLocation: item.property_location,
        propertyPrice: item.property_price ? String(item.property_price) : undefined,
        ownerEmail: item.owner_email,
        ownerName: item.owner_name,
        buyerName: item.buyer_name,
        buyerEmail: item.buyer_email,
        buyerPhone: item.buyer_phone,
        inquiryType: item.inquiry_type || 'general',
        offerAmount: item.offer_amount,
        proposedMoveIn: item.proposed_move_in,
        message: item.message,
        status: item.status as InquiryStatus,
        createdAt: item.created_at,
        smartBridgeEscrowRequested: item.smart_bridge_escrow_requested,
      }));
    } catch (e) {
      console.warn('Supabase fetchInquiries error:', e);
      return null;
    }
  },

  async saveInquiry(inq: PropertyInquiry): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const payload = {
        id: inq.id,
        property_id: inq.propertyId,
        property_title: inq.propertyTitle,
        property_location: inq.propertyLocation,
        property_price: inq.propertyPrice,
        owner_email: inq.ownerEmail,
        owner_name: inq.ownerName,
        buyer_name: inq.buyerName,
        buyer_email: inq.buyerEmail,
        buyer_phone: inq.buyerPhone,
        inquiry_type: inq.inquiryType,
        offer_amount: inq.offerAmount,
        proposed_move_in: inq.proposedMoveIn,
        message: inq.message,
        status: inq.status,
        smart_bridge_escrow_requested: inq.smartBridgeEscrowRequested,
        created_at: inq.createdAt,
      };

      const { error } = await supabase.from('property_inquiries').upsert(payload);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase saveInquiry error:', e);
      return false;
    }
  },

  // 4. BOOKINGS
  async fetchBookings(): Promise<InspectionBooking[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('inspection_bookings')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data.map((item) => ({
        id: item.id,
        propertyId: item.property_id,
        propertyTitle: item.property_title,
        propertyLocation: item.property_location,
        propertyPrice: item.property_price,
        name: item.name || item.user_name || 'Client',
        email: item.email || item.user_email || '',
        phone: item.phone || item.user_phone || '',
        preferredDate: item.preferred_date,
        preferredTime: item.preferred_time,
        notes: item.notes,
        status: item.status as BookingStatus,
        assignedSpecialist: item.assigned_specialist,
        createdAt: item.created_at,
      }));
    } catch (e) {
      console.warn('Supabase fetchBookings error:', e);
      return null;
    }
  },

  async saveBooking(b: InspectionBooking): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const payload = {
        id: b.id,
        property_id: b.propertyId,
        property_title: b.propertyTitle,
        property_location: b.propertyLocation,
        property_price: b.propertyPrice,
        name: b.name,
        email: b.email,
        phone: b.phone,
        preferred_date: b.preferredDate,
        preferred_time: b.preferredTime,
        notes: b.notes,
        status: b.status,
        assigned_specialist: b.assignedSpecialist,
        created_at: b.createdAt,
      };

      const { error } = await supabase.from('inspection_bookings').upsert(payload);
      if (error) throw error;
      return true;
    } catch (e) {
      console.error('Supabase saveBooking error:', e);
      return false;
    }
  },

  // 5. USER PROFILES
  async fetchProfiles(): Promise<AuthUserProfile[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      if (!data || data.length === 0) return null;

      return data.map((item) => ({
        id: item.id,
        email: item.email,
        name: item.full_name,
        phone: item.phone,
        companyName: item.company_name,
        role: item.role,
        avatar: item.avatar_url,
        verified: item.verified,
      }));
    } catch (e) {
      console.warn('Supabase fetchProfiles error:', e);
      return null;
    }
  },

  async fetchProfile(userId: string): Promise<AuthUserProfile | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .maybeSingle();

      if (error) throw error;
      if (!data) return null;

      return {
        id: data.id,
        email: data.email,
        name: data.full_name,
        phone: data.phone,
        companyName: data.company_name,
        role: data.role,
        avatar: data.avatar_url,
        verified: data.verified,
      };
    } catch (e) {
      console.warn('Supabase fetchProfile error:', e);
      return null;
    }
  },

  async saveProfile(profile: Partial<AuthUserProfile> & { id: string; email: string }): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      // Local profile caching
      try {
        const stored = localStorage.getItem('smartbridge_local_profiles');
        const profilesMap = stored ? JSON.parse(stored) : {};
        profilesMap[profile.id] = {
          ...profile,
          updated_at: new Date().toISOString(),
        };
        localStorage.setItem('smartbridge_local_profiles', JSON.stringify(profilesMap));
      } catch (e) {
        // ignore
      }
      return true;
    }

    try {
      const payload = {
        id: profile.id,
        email: profile.email,
        full_name: profile.name || profile.email.split('@')[0],
        phone: profile.phone,
        company_name: profile.companyName,
        role: profile.role || 'landlord',
        avatar_url: profile.avatar,
        verified: profile.verified ?? true,
        updated_at: new Date().toISOString(),
      };

      const { error } = await supabase.from('profiles').upsert(payload, { onConflict: 'id' });
      if (error) {
        console.warn('Supabase saveProfile notice:', error.message);
        return false;
      }
      return true;
    } catch (e) {
      console.error('Supabase saveProfile error:', e);
      return false;
    }
  },
};
