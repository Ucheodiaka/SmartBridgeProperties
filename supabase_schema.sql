-- ==============================================================================
-- SMARTBRIDGE PROPERTIES NIGERIA - PRODUCTION SUPABASE SQL MIGRATION
-- ==============================================================================
-- Target: Supabase PostgreSQL (Run via Supabase SQL Editor)
-- Compatibility: Safe for existing databases (preserves records and users)
-- ==============================================================================

-- 1. PROFILES TABLE & ROLE CHECK
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL UNIQUE,
  full_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  role TEXT NOT NULL DEFAULT 'landlord',
  avatar_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check 
  CHECK (role IN ('landlord', 'agent', 'developer', 'admin'));

-- 2. PROPERTIES TABLE (Live Marketplace Catalog)
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
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'pending', 'rejected', 'archived', 'pending_verification', 'sold', 'rented', 'draft')),
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

-- 3. PROPERTY SUBMISSIONS TABLE (Audit & Title Verification Queue)
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
  status TEXT NOT NULL DEFAULT 'pending_audit' CHECK (status IN ('pending_audit', 'in_progress', 'inspection_scheduled', 'approved', 'rejected')),
  audit_notes TEXT,
  structural_score INTEGER DEFAULT 90,
  flood_assessment TEXT,
  assigned_inspector TEXT,
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 4. PROPERTY INQUIRIES TABLE (Buyer Enquiries & Offers)
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
  inquiry_type TEXT NOT NULL CHECK (inquiry_type IN ('general', 'schedule_viewing', 'make_offer', 'request_documents', 'buy', 'rent', 'offer')),
  offer_amount TEXT,
  proposed_move_in TEXT,
  message TEXT NOT NULL,
  smart_bridge_escrow_requested BOOLEAN DEFAULT true,
  status TEXT NOT NULL DEFAULT 'new' CHECK (status IN ('new', 'contacted', 'tour_scheduled', 'negotiating', 'closed')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 5. INSPECTION BOOKINGS TABLE (Physical Field Visits)
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
  status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'completed', 'rescheduled', 'cancelled')),
  assigned_specialist TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 6. ENABLE ROW LEVEL SECURITY
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inspection_bookings ENABLE ROW LEVEL SECURITY;

-- 7. RECURSION-SAFE ADMIN CHECK FUNCTION
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
DECLARE
  v_role TEXT;
BEGIN
  IF auth.uid() IS NULL THEN
    RETURN FALSE;
  END IF;

  SELECT role INTO v_role
  FROM public.profiles
  WHERE id = auth.uid();

  RETURN (v_role = 'admin');
END;
$$;

GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated, anon;

-- 8. TRIGGER DEFENSE: BLOCK UNAUTHORIZED ADMIN CREATION VIA PUBLIC REGISTRATION
CREATE OR REPLACE FUNCTION public.protect_admin_role()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.role = 'admin' AND (OLD IS NULL OR OLD.role <> 'admin') THEN
    IF auth.role() <> 'service_role' AND NOT public.is_admin() THEN
      RAISE EXCEPTION 'Access denied: Administrator accounts must be provisioned privately in Supabase.';
    END IF;
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS tr_protect_admin_role ON public.profiles;
CREATE TRIGGER tr_protect_admin_role
  BEFORE INSERT OR UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_admin_role();

-- 9. SAFELY REMOVE ALL EXISTING POLICIES (PREVENTS DUPLICATES)
DO $$
DECLARE
  pol RECORD;
BEGIN
  FOR pol IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
      AND tablename IN ('profiles', 'properties', 'property_submissions', 'property_inquiries', 'inspection_bookings')
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I', pol.policyname, pol.schemaname, pol.tablename);
  END LOOP;
END $$;

-- 10. NEW POLICIES: PROFILES TABLE
CREATE POLICY "profiles_admin_all"
  ON public.profiles FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "profiles_read_own"
  ON public.profiles FOR SELECT TO authenticated
  USING (auth.uid() = id);

CREATE POLICY "profiles_insert_registration"
  ON public.profiles FOR INSERT TO authenticated
  WITH CHECK (auth.uid() = id AND role IN ('landlord', 'agent', 'developer'));

CREATE POLICY "profiles_update_own"
  ON public.profiles FOR UPDATE TO authenticated
  USING (auth.uid() = id)
  WITH CHECK (auth.uid() = id AND role IN ('landlord', 'agent', 'developer'));

-- 11. NEW POLICIES: PROPERTIES TABLE
CREATE POLICY "properties_admin_all"
  ON public.properties FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "properties_public_view_active"
  ON public.properties FOR SELECT TO anon, authenticated
  USING (status = 'active');

CREATE POLICY "properties_owner_view_own"
  ON public.properties FOR SELECT TO authenticated
  USING (owner_id = auth.uid() OR (owner_email IS NOT NULL AND lower(owner_email) = lower(auth.jwt()->>'email')));

-- 12. NEW POLICIES: PROPERTY SUBMISSIONS TABLE
CREATE POLICY "submissions_admin_all"
  ON public.property_submissions FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "submissions_owner_view_own"
  ON public.property_submissions FOR SELECT TO authenticated
  USING (lower(owner_email) = lower(auth.jwt()->>'email'));

CREATE POLICY "submissions_public_submit"
  ON public.property_submissions FOR INSERT TO anon, authenticated
  WITH CHECK (true);

-- 13. NEW POLICIES: PROPERTY INQUIRIES TABLE
CREATE POLICY "inquiries_admin_all"
  ON public.property_inquiries FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "inquiries_public_submit"
  ON public.property_inquiries FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "inquiries_involved_view"
  ON public.property_inquiries FOR SELECT TO authenticated
  USING (lower(owner_email) = lower(auth.jwt()->>'email') OR lower(buyer_email) = lower(auth.jwt()->>'email'));

CREATE POLICY "inquiries_owner_update"
  ON public.property_inquiries FOR UPDATE TO authenticated
  USING (lower(owner_email) = lower(auth.jwt()->>'email'))
  WITH CHECK (lower(owner_email) = lower(auth.jwt()->>'email'));

-- 14. NEW POLICIES: INSPECTION BOOKINGS TABLE
CREATE POLICY "bookings_admin_all"
  ON public.inspection_bookings FOR ALL TO authenticated
  USING (public.is_admin()) WITH CHECK (public.is_admin());

CREATE POLICY "bookings_public_submit"
  ON public.inspection_bookings FOR INSERT TO anon, authenticated
  WITH CHECK (true);

CREATE POLICY "bookings_client_view_own"
  ON public.inspection_bookings FOR SELECT TO authenticated
  USING (lower(email) = lower(auth.jwt()->>'email'));
