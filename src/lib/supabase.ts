import { createClient, SupabaseClient } from '@supabase/supabase-js';
import {
  Property,
  PropertySubmission,
  PropertyInquiry,
  InspectionBooking,
  InquiryStatus,
  BookingStatus,
  AuditStatus,
  PropertyStatus,
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
  role?: 'landlord' | 'agent' | 'developer' | 'admin';
  companyName?: string;
  phone?: string;
  verified?: boolean;
}

/**
 * Sign in using Google OAuth Credentials.
 */
export async function signInWithGoogle(
  _intendedRole?: string
): Promise<{ success: boolean; user?: AuthUserProfile; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Please contact the site administrator.',
    };
  }

  try {
    const { error } = await supabase.auth.signInWithOAuth({
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

/**
 * Sign in with Email and Password
 */
export async function signInWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUserProfile; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Please contact the site administrator.',
    };
  }

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });
    if (error) throw error;

    const authUser = data.user;
    if (!authUser) throw new Error('Authentication failed.');

    // Fetch the existing database profile without overwriting during login
    const profile = await supabaseDb.fetchProfile(authUser.id);

    const userProfile: AuthUserProfile = {
      id: authUser.id,
      email: authUser.email || email,
      name: profile?.name || authUser.user_metadata?.full_name || email.split('@')[0],
      avatar: profile?.avatar || authUser.user_metadata?.avatar_url,
      role: profile?.role || 'landlord',
      companyName: profile?.companyName || authUser.user_metadata?.company_name,
      phone: profile?.phone || authUser.user_metadata?.phone,
      verified: profile?.verified ?? false,
    };

    return { success: true, user: userProfile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Failed to sign in.' };
  }
}

/**
 * Sign in for SmartBridge Administrators only.
 * 1. Authenticates credentials with Supabase.
 * 2. Fetches profile from Supabase `profiles` table.
 * 3. Confirms role is strictly 'admin'.
 * 4. Refuses access if role is not admin with: "You are not authorised to access the administrator portal."
 */
export async function signInAdminWithEmail(
  email: string,
  password: string
): Promise<{ success: boolean; user?: AuthUserProfile; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Please contact the site administrator.',
    };
  }

  const cleanEmail = email.trim().toLowerCase();

  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email: cleanEmail,
      password,
    });
    if (error) throw error;

    const authUser = data.user;
    if (!authUser) throw new Error('Authentication failed.');

    // Fetch the authenticated user’s record from profiles
    const profile = await supabaseDb.fetchProfile(authUser.id);

    // Confirm that profile.role === 'admin'
    if (profile?.role !== 'admin') {
      // Sign the user out if the role is not admin
      await supabase.auth.signOut();
      return {
        success: false,
        error: 'You are not authorised to access the administrator portal.',
      };
    }

    const adminProfile: AuthUserProfile = {
      id: authUser.id,
      email: authUser.email || cleanEmail,
      name: profile?.name || authUser.user_metadata?.full_name || 'SmartBridge Administrator',
      role: 'admin',
      avatar: profile?.avatar || authUser.user_metadata?.avatar_url,
      phone: profile?.phone,
      companyName: profile?.companyName || 'SmartBridge Properties Nigeria',
      verified: profile?.verified ?? false,
    };

    return { success: true, user: adminProfile };
  } catch (err: any) {
    const message = err?.message || 'Invalid administrator credentials.';
    return { success: false, error: message };
  }
}

/**
 * Send password reset email for an administrator
 */
export async function resetAdminPassword(
  email: string
): Promise<{ success: boolean; message: string; error?: string }> {
  const cleanEmail = email.trim().toLowerCase();
  if (!cleanEmail || !cleanEmail.includes('@')) {
    return { success: false, message: '', error: 'Please provide a valid official email address.' };
  }

  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      message: '',
      error: 'Supabase is not configured. Please contact the site administrator.',
    };
  }

  try {
    const { error } = await supabase.auth.resetPasswordForEmail(cleanEmail, {
      redirectTo: `${window.location.origin}/admin/login`,
    });
    if (error) throw error;
    return {
      success: true,
      message: `Password reset instructions have been sent to ${cleanEmail}. Please check your inbox.`,
    };
  } catch (err: any) {
    return {
      success: false,
      message: '',
      error: err?.message || 'Unable to send password reset email.',
    };
  }
}

/**
 * Sign Up with Email, Password and Profile Metadata
 */
export async function signUpWithEmail(
  email: string,
  password: string,
  metadata: { fullName: string; phone?: string; companyName?: string; role?: string; avatar?: string }
): Promise<{ success: boolean; user?: AuthUserProfile; error?: string }> {
  if (!isSupabaseConfigured || !supabase) {
    return {
      success: false,
      error: 'Supabase is not configured. Please contact the site administrator.',
    };
  }

  // Registration strictly allows only: landlord, agent, developer
  const allowedRoles: Array<'landlord' | 'agent' | 'developer'> = ['landlord', 'agent', 'developer'];
  const assignedRole: 'landlord' | 'agent' | 'developer' =
    metadata.role && allowedRoles.includes(metadata.role as any)
      ? (metadata.role as 'landlord' | 'agent' | 'developer')
      : 'landlord';

  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          full_name: metadata.fullName,
          phone: metadata.phone,
          company_name: metadata.companyName,
          role: assignedRole,
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
      role: assignedRole,
      companyName: metadata.companyName,
      phone: metadata.phone,
      avatar: metadata.avatar,
      verified: false,
    };

    // Allow database handle_new_user trigger to create the profile.
    // Do not immediately perform a competing profile upsert after registration.
    return { success: true, user: userProfile };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Registration failed.' };
  }
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

// Helpers for SQL compliance
function isUUID(str?: string): boolean {
  if (!str) return false;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(str);
}

function formatTimeForSQL(timeStr?: string): string {
  if (!timeStr) return '10:00:00';
  if (/^\d{2}:\d{2}:\d{2}$/.test(timeStr)) return timeStr;
  if (/^\d{2}:\d{2}$/.test(timeStr)) return `${timeStr}:00`;
  const match = timeStr.match(/(\d{1,2}):(\d{2})\s*(AM|PM)?/i);
  if (match) {
    let hours = parseInt(match[1], 10);
    const mins = match[2];
    const ampm = match[3]?.toUpperCase();
    if (ampm === 'PM' && hours < 12) hours += 12;
    if (ampm === 'AM' && hours === 12) hours = 0;
    return `${String(hours).padStart(2, '0')}:${mins}:00`;
  }
  return '10:00:00';
}

function formatDateForSQL(dateStr?: string): string {
  if (!dateStr) return new Date().toISOString().split('T')[0];
  if (/^\d{4}-\d{2}-\d{2}$/.test(dateStr)) return dateStr;
  const d = new Date(dateStr);
  if (!isNaN(d.getTime())) return d.toISOString().split('T')[0];
  return new Date().toISOString().split('T')[0];
}

// ==========================================
// Database Synchronizers (Supabase PostgreSQL)
// ==========================================

export const supabaseDb = {
  // 1. PROPERTIES (reads from public_properties view for safe visitor access)
  async fetchProperties(asPublic = true): Promise<Property[] | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      // Direct safe public view query for visitors; base table only for authenticated dashboard operations
      const targetTable = asPublic ? 'public_properties' : 'properties';
      const { data, error } = await supabase
        .from(targetTable)
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
        isVerified: Boolean(item.is_verified ?? false),
        isFeatured: Boolean(item.is_featured ?? false),
        images: item.images || [],
        videos: item.videos || (item.video_url ? [item.video_url] : []),
        videoUrl: item.video_url,
        description: item.description || '',
        features: item.features || [],
        amenities: item.amenities || [],
        inspectionReport: item.inspection_report || undefined,
        agent: item.agent || undefined,
        ownerId: item.owner_id,
        ownerName: item.owner_name,
        ownerEmail: item.owner_email,
        status: item.status || 'approved',
      }));
    } catch (e) {
      console.warn('Supabase fetchProperties error:', e);
      return null;
    }
  },

  async saveProperty(property: Property): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const payload: Record<string, any> = {
        title: property.title,
        slug: property.slug || property.title.toLowerCase().replace(/[^a-z0-9]+/g, '-'),
        location: property.location,
        neighborhood: property.neighborhood || 'GRA Phase 2',
        address: property.address || property.location,
        price: Number(property.price) || 0,
        price_display: property.priceDisplay,
        price_period: property.pricePeriod || null,
        type: property.type || 'sale',
        property_type: property.propertyType || 'Apartment',
        bedrooms: property.bedrooms || 0,
        bathrooms: property.bathrooms || 0,
        parking_spaces: property.parkingSpaces || 0,
        size_sq_ft: property.sizeSqFt || 0,
        is_verified: property.isVerified ?? false,
        is_featured: property.isFeatured ?? false,
        status: property.status || 'pending',
        images: property.images || [],
        videos: property.videos || [],
        video_url: property.videoUrl || null,
        description: property.description || '',
        features: property.features || [],
        amenities: property.amenities || [],
        inspection_report: property.inspectionReport || null,
        agent: property.agent || null,
        owner_name: property.ownerName || null,
        owner_email: property.ownerEmail || null,
        updated_at: new Date().toISOString(),
      };

      if (property.ownerId && isUUID(property.ownerId)) {
        payload.owner_id = property.ownerId;
      }

      if (property.id && isUUID(property.id)) {
        payload.id = property.id;
      }

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

  // 2. SUBMISSIONS (requires owner_id referencing auth.users)
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
        ownerId: item.owner_id,
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
        status: (item.status as PropertyStatus) || 'pending',
        submittedAt: item.submitted_at,
        assignedInspector: item.assigned_inspector,
        auditNotes: item.audit_notes,
        floodAssessment: item.flood_assessment,
        structuralScore: item.structural_score ?? undefined,
      }));
    } catch (e) {
      console.warn('Supabase fetchSubmissions error:', e);
      return null;
    }
  },

  async saveSubmission(sub: PropertySubmission): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      // Strictly derive owner_id from authenticated user session
      const { data: authData, error: authError } =
        await supabase.auth.getUser();
      if (authError || !authData.user) {
  console.error(
    'Cannot save submission: a signed-in property lister is required.'
  );
  return false;
}

const currentUserId = authData.user.id;
      if (!currentUserId) {
        console.error('Cannot save submission: authenticated owner_id is required.');
        return false;
      }

      // Safeguard: Listers cannot self-approve; default to pending or draft
      const allowedListerStatuses: PropertyStatus[] = ['draft', 'pending', 'rejected'];
      const statusToSave = allowedListerStatuses.includes(sub.status) ? sub.status : 'pending';

      const payload: Record<string, any> = {
        owner_id: currentUserId,
        title: sub.title,
        property_type: sub.propertyType,
        listing_type: sub.listingType,
        location: sub.location,
        address: sub.address || sub.location,
        price: Number(sub.price) || 0,
        bedrooms: Number(sub.bedrooms) || 0,
        bathrooms: Number(sub.bathrooms) || 0,
        owner_name: sub.ownerName,
        owner_phone: sub.ownerPhone,
        owner_email: sub.ownerEmail,
        description: sub.description || '',
        title_doc_type: sub.titleDocType || 'C of O',
        images: sub.images || [],
        videos: sub.videos || [],
        video_url: sub.videoUrl || null,
        status: statusToSave,
        submitted_at: sub.submittedAt || new Date().toISOString(),
        
      };

      if (sub.id && isUUID(sub.id)) {
        payload.id = sub.id;
      }

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
      }));
    } catch (e) {
      console.warn('Supabase fetchInquiries error:', e);
      return null;
    }
  },

  async saveInquiry(inq: PropertyInquiry): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) return false;
    try {
      const payload: Record<string, any> = {
        property_title: inq.propertyTitle,
        property_location: inq.propertyLocation,
        property_price: inq.propertyPrice || null,
        buyer_name: (inq.buyerName || '').trim(),
        buyer_email: inq.buyerEmail || null,
        buyer_phone: (inq.buyerPhone || '').trim(),
        inquiry_type: inq.inquiryType || 'general',
        offer_amount: inq.offerAmount || null,
        proposed_move_in: inq.proposedMoveIn || null,
        message: (inq.message || '').trim(),
        status: 'new', // Enforce server-side default; visitors cannot choose administrative status
        created_at: new Date().toISOString(),
      };

      if (inq.propertyId) {
        payload.property_id = inq.propertyId;
      }

      if (inq.id && isUUID(inq.id)) {
        payload.id = inq.id;
      }

      const { error } = await supabase.from('property_inquiries').insert(payload);
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
      const payload: Record<string, any> = {
        property_title: b.propertyTitle,
        property_location: b.propertyLocation || null,
        property_price: b.propertyPrice || null,
        name: (b.name || '').trim(),
        email: b.email || null,
        phone: (b.phone || '').trim(),
        preferred_date: formatDateForSQL(b.preferredDate),
        preferred_time: formatTimeForSQL(b.preferredTime),
        notes: b.notes || null,
        status: 'pending', // Enforce server-side default; visitors cannot choose administrative status
        assigned_specialist: null, // Visitors cannot assign a specialist
        created_at: new Date().toISOString(),
      };

      if (b.propertyId) {
        payload.property_id = b.propertyId;
      }

      if (b.id && isUUID(b.id)) {
        payload.id = b.id;
      }

      const { error } = await supabase.from('inspection_bookings').insert(payload);
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

  async saveProfile(profile: Partial<AuthUserProfile> & { id: string }): Promise<boolean> {
    if (!isSupabaseConfigured || !supabase) {
      return false;
    }

    try {
      const payload: Record<string, any> = {
        updated_at: new Date().toISOString(),
      };

      if (profile.email !== undefined) payload.email = profile.email;
      if (profile.name !== undefined) payload.full_name = profile.name;
      if (profile.phone !== undefined) payload.phone = profile.phone || null;
      if (profile.companyName !== undefined) payload.company_name = profile.companyName || null;
      if (profile.avatar !== undefined) payload.avatar_url = profile.avatar || null;

      // Note: The frontend must never send or update 'role' or 'verified' through saveProfile()
      const { error } = await supabase
        .from('profiles')
        .update(payload)
        .eq('id', profile.id);

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

  // 6. STORAGE (Separated Private Submissions & Public Approved Buckets)
  // Listers upload unapproved media to the private 'property-submissions' bucket under their user folder
  async uploadSubmissionImage(file: File, userId: string): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `${userId}/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('property-submissions')
        .upload(fileName, file, { cacheControl: '3600', upsert: false });

      if (error) throw error;

     // Store the permanent private-bucket path.
    // Generate a temporary signed URL only when an authorised user views it.
    return data.path;
    } catch (e) {
      console.warn('Supabase uploadSubmissionImage error:', e);
      return null;
    }
  },

  // Admins promote or upload verified images directly to the public 'property-images' bucket
  async uploadApprovedPropertyImage(file: File, adminId: string): Promise<string | null> {
    if (!isSupabaseConfigured || !supabase) return null;
    try {
      const fileExt = file.name.split('.').pop() || 'jpg';
      const fileName = `approved/${Date.now()}-${Math.random().toString(36).substring(2, 9)}.${fileExt}`;
      const { data, error } = await supabase.storage
        .from('property-images')
        .upload(fileName, file, { cacheControl: '31536000', upsert: false });

      if (error) throw error;
      const { data: publicUrlData } = supabase.storage
        .from('property-images')
        .getPublicUrl(data.path);

      return publicUrlData.publicUrl;
    } catch (e) {
      console.warn('Supabase uploadApprovedPropertyImage error:', e);
      return null;
    }
  },

  // Backward compatibility alias for property media uploads
  async uploadPropertyImage(file: File, userId: string): Promise<string | null> {
    return this.uploadSubmissionImage(file, userId);
  },
};
