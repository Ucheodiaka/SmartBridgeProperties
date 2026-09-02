-- ==============================================================================
-- SMARTBRIDGE PROPERTIES NIGERIA - SUPABASE DATABASE SCHEMA & ROW LEVEL SECURITY (RLS)
-- ==============================================================================
-- Run this SQL in your Supabase SQL Editor (https://app.supabase.com/project/_/sql)
-- Enforces strict role-based access control (RBAC):
-- 1. Public visitors can view active verified listings, submit enquiries, and book inspections.
-- 2. Property Listers (landlords/agents/developers) can submit and view their own listings/inquiries.
-- 3. ONLY SmartBridge Administrators (profiles.role = 'admin') can approve, reject, verify,
--    feature, unpublish, or delete properties, and view ALL enquiries and inspection requests.
-- ==============================================================================

-- 1. Create PROFILES Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  role TEXT NOT NULL DEFAULT 'landlord' CHECK (role IN ('admin', 'landlord', 'agent', 'developer', 'buyer')),
  avatar_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create PROPERTIES Table
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  location TEXT NOT NULL,
  neighborhood TEXT,
  address TEXT,
  price NUMERIC NOT NULL,
  price_display TEXT,
  price_period TEXT,
  type TEXT NOT NULL CHECK (type IN ('sale', 'rent')),
  property_type TEXT NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  parking_spaces INTEGER DEFAULT 0,
  size_sq_ft INTEGER,
  is_verified BOOLEAN NOT NULL DEFAULT true,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected', 'archived')),
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  video_url TEXT,
  description TEXT,
  features TEXT[] DEFAULT '{}',
  amenities TEXT[] DEFAULT '{}',
  inspection_report JSONB,
  agent JSONB,
  owner_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  owner_name TEXT,
  owner_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 3. Create PROPERTY SUBMISSIONS Table (Drafts & Verification Audits)
CREATE TABLE IF NOT EXISTS public.property_submissions (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  listing_type TEXT NOT NULL CHECK (listing_type IN ('sale', 'rent')),
  property_type TEXT NOT NULL,
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  price NUMERIC NOT NULL,
  bedrooms INTEGER DEFAULT 0,
  bathrooms INTEGER DEFAULT 0,
  title_doc_type TEXT,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  video_url TEXT,
  document_url TEXT,
  owner_name TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending_audit' CHECK (status IN ('pending_audit', 'inspection_scheduled', 'approved', 'rejected')),
  audit_notes TEXT,
  structural_score INTEGER DEFAULT 90,
  flood_assessment TEXT,
  assigned_inspector TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. Create PROPERTY INQUIRIES Table (Buyer Enquiries & Offers)
CREATE TABLE IF NOT EXISTS public.property_inquiries (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  property_title TEXT NOT NULL,
  property_location TEXT,
  property_price TEXT,
  owner_email TEXT NOT NULL,
  owner_name TEXT,
  buyer_name TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('general', 'schedule_viewing', 'make_offer', 'request_documents')),
  offer_amount TEXT,
  proposed_move_in TEXT,
  message TEXT NOT NULL,
  smartbridge_escrow_requested BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'negotiating', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. Create INSPECTION BOOKINGS Table (Physical Field Visits)
CREATE TABLE IF NOT EXISTS public.inspection_bookings (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  property_title TEXT NOT NULL,
  property_location TEXT,
  property_price TEXT,
  name TEXT NOT NULL,
  email TEXT NOT NULL,
  phone TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('confirmed', 'completed', 'rescheduled', 'cancelled')),
  assigned_specialist TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- ==============================================================================
-- ENABLE ROW LEVEL SECURITY (RLS) ON ALL TABLES
-- ==============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_bookings ENABLE ROW LEVEL SECURITY;

-- HELPER FUNCTION: Check if the current authenticated user has role = 'admin'
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.profiles
    WHERE id = auth.uid() AND role = 'admin'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ==============================================================================
-- RLS POLICIES: PROFILES
-- ==============================================================================
DROP POLICY IF EXISTS "Public can view basic profiles" ON public.profiles;
DROP POLICY IF EXISTS "Users can view own profile or admins view all" ON public.profiles;
CREATE POLICY "Users can view own profile or admins view all"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can update own profile or admins update any" ON public.profiles;
CREATE POLICY "Users can update own profile or admins update any"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id OR public.is_admin());

DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can insert own profile"
  ON public.profiles FOR INSERT
  WITH CHECK (auth.uid() = id OR public.is_admin());

-- ==============================================================================
-- RLS POLICIES: PROPERTIES (Marketplace Catalog)
-- ==============================================================================
-- Anyone (even unauthenticated visitors) can view active published properties
DROP POLICY IF EXISTS "Public can view active properties" ON public.properties;
CREATE POLICY "Public can view active properties"
  ON public.properties FOR SELECT
  USING (status = 'active' OR public.is_admin() OR (auth.uid() IS NOT NULL AND owner_id = auth.uid()));

-- Only verified Administrators can insert directly into live catalog or approve
DROP POLICY IF EXISTS "Only admins can insert live properties" ON public.properties;
CREATE POLICY "Only admins can insert live properties"
  ON public.properties FOR INSERT
  WITH CHECK (public.is_admin());

-- Only verified Administrators can approve, reject, verify, feature, unpublish properties
DROP POLICY IF EXISTS "Only admins can update properties" ON public.properties;
CREATE POLICY "Only admins can update properties"
  ON public.properties FOR UPDATE
  USING (public.is_admin());

-- Only verified Administrators can delete properties
DROP POLICY IF EXISTS "Only admins can delete properties" ON public.properties;
CREATE POLICY "Only admins can delete properties"
  ON public.properties FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- RLS POLICIES: PROPERTY SUBMISSIONS (Verification Queue)
-- ==============================================================================
-- Submitters can view their own submissions; Admins can view ALL submissions
DROP POLICY IF EXISTS "Submitters view own and admins view all submissions" ON public.property_submissions;
CREATE POLICY "Submitters view own and admins view all submissions"
  ON public.property_submissions FOR SELECT
  USING (public.is_admin() OR (auth.uid() IS NOT NULL AND owner_email = (SELECT email FROM auth.users WHERE id = auth.uid())));

-- Anyone (landlords, agents) can insert a new submission for verification
DROP POLICY IF EXISTS "Listers can insert submissions" ON public.property_submissions;
CREATE POLICY "Listers can insert submissions"
  ON public.property_submissions FOR INSERT
  WITH CHECK (true);

-- Only Administrators can update audit status, notes, inspector assignments
DROP POLICY IF EXISTS "Only admins can update submissions" ON public.property_submissions;
CREATE POLICY "Only admins can update submissions"
  ON public.property_submissions FOR UPDATE
  USING (public.is_admin());

-- Only Administrators can delete submissions
DROP POLICY IF EXISTS "Only admins can delete submissions" ON public.property_submissions;
CREATE POLICY "Only admins can delete submissions"
  ON public.property_submissions FOR DELETE
  USING (public.is_admin());

-- ==============================================================================
-- RLS POLICIES: PROPERTY INQUIRIES (Buyer Enquiries & Offers)
-- ==============================================================================
-- Public visitors can create enquiries without registering
DROP POLICY IF EXISTS "Public can insert inquiries" ON public.property_inquiries;
CREATE POLICY "Public can insert inquiries"
  ON public.property_inquiries FOR INSERT
  WITH CHECK (true);

-- Property lister can view enquiries for their property; Admins can view ALL enquiries
DROP POLICY IF EXISTS "Owners view own inquiries and admins view all" ON public.property_inquiries;
CREATE POLICY "Owners view own inquiries and admins view all"
  ON public.property_inquiries FOR SELECT
  USING (
    public.is_admin() OR 
    (auth.uid() IS NOT NULL AND owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Admins and property owners can update enquiry status
DROP POLICY IF EXISTS "Admins and owners can update inquiries" ON public.property_inquiries;
CREATE POLICY "Admins and owners can update inquiries"
  ON public.property_inquiries FOR UPDATE
  USING (
    public.is_admin() OR 
    (auth.uid() IS NOT NULL AND owner_email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- ==============================================================================
-- RLS POLICIES: INSPECTION BOOKINGS (Physical Site Viewings)
-- ==============================================================================
-- Public visitors can book physical inspections without registering
DROP POLICY IF EXISTS "Public can insert inspection bookings" ON public.inspection_bookings;
CREATE POLICY "Public can insert inspection bookings"
  ON public.inspection_bookings FOR INSERT
  WITH CHECK (true);

-- Only Administrators can view ALL inspection requests across Port Harcourt
DROP POLICY IF EXISTS "Only admins can view all inspection bookings" ON public.inspection_bookings;
CREATE POLICY "Only admins can view all inspection bookings"
  ON public.inspection_bookings FOR SELECT
  USING (
    public.is_admin() OR 
    (auth.uid() IS NOT NULL AND email = (SELECT email FROM auth.users WHERE id = auth.uid()))
  );

-- Only Administrators can update inspection status or assign field specialists
DROP POLICY IF EXISTS "Only admins can update inspection bookings" ON public.inspection_bookings;
CREATE POLICY "Only admins can update inspection bookings"
  ON public.inspection_bookings FOR UPDATE
  USING (public.is_admin());

-- ==============================================================================
-- PROVISIONING INSTRUCTIONS FOR ADMINISTRATORS:
-- ==============================================================================
-- Administrator accounts MUST be created privately through Supabase Auth Dashboard
-- (Authentication > Users > Add User) or via backend provisioning.
--
-- After creating the user in Supabase Auth, assign the admin role:
-- INSERT INTO public.profiles (id, email, full_name, role, company_name, verified)
-- VALUES (
--   '<AUTH_USER_UUID>',
--   'admin@smartbridge.ng',
--   'SmartBridge Operations Lead',
--   'admin',
--   'SmartBridge Properties Nigeria',
--   true
-- )
-- ON CONFLICT (id) DO UPDATE SET role = 'admin', verified = true;
-- ==============================================================================
