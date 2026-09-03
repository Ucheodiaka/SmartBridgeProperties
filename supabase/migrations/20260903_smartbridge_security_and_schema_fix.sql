-- ==============================================================================
-- SMARTBRIDGE PROPERTIES: REVISED PRODUCTION SUPABASE SQL MIGRATION
-- File: /supabase/migrations/20260903_smartbridge_security_and_schema_fix.sql
-- ==============================================================================

BEGIN;

-- Safely align existing singular table names with the application
DO $$
BEGIN
  IF to_regclass('public.property_submissions') IS NULL
     AND to_regclass('public.property_submission') IS NOT NULL THEN
    ALTER TABLE public.property_submission
      RENAME TO property_submissions;
  END IF;

  IF to_regclass('public.inspection_bookings') IS NULL
     AND to_regclass('public.inspection_booking') IS NOT NULL THEN
    ALTER TABLE public.inspection_booking
      RENAME TO inspection_bookings;
  END IF;
END
$$;

-- ==============================================================================
-- 1. EXTENSIONS
-- ==============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ==============================================================================
-- 2. DROP OBSOLETE & INSECURE POLICIES
-- ==============================================================================
-- Profiles
DROP POLICY IF EXISTS "Enable all access for profiles" ON public.profiles;
DROP POLICY IF EXISTS "profiles_select_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_insert_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_update_own" ON public.profiles;
DROP POLICY IF EXISTS "profiles_admin_all" ON public.profiles;

-- Properties
DROP POLICY IF EXISTS "properties_public_view_active" ON public.properties;
DROP POLICY IF EXISTS "properties_owner_view_own" ON public.properties;
DROP POLICY IF EXISTS "properties_select_approved" ON public.properties;
DROP POLICY IF EXISTS "properties_select_owner" ON public.properties;
DROP POLICY IF EXISTS "properties_admin_all" ON public.properties;

-- Submissions
DROP POLICY IF EXISTS "submissions_public_submit" ON public.property_submissions;
DROP POLICY IF EXISTS "submissions_insert_lister" ON public.property_submissions;
DROP POLICY IF EXISTS "submissions_select_owner" ON public.property_submissions;
DROP POLICY IF EXISTS "submissions_update_owner" ON public.property_submissions;
DROP POLICY IF EXISTS "submissions_delete_owner" ON public.property_submissions;
DROP POLICY IF EXISTS "submissions_admin_all" ON public.property_submissions;

-- Inquiries
DROP POLICY IF EXISTS "inquiries_insert_public" ON public.property_inquiries;
DROP POLICY IF EXISTS "inquiries_admin_all" ON public.property_inquiries;

-- Bookings
DROP POLICY IF EXISTS "bookings_insert_public" ON public.inspection_bookings;
DROP POLICY IF EXISTS "bookings_admin_all" ON public.inspection_bookings;

-- Storage
DROP POLICY IF EXISTS "storage_property_images_public_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_images_lister_upload" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_images_lister_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_images_lister_delete" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_images_admin_all" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_submissions_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_submissions_upload" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_submissions_update" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_submissions_delete" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_submissions_admin_all" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_docs_owner_admin_select" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_docs_owner_upload" ON storage.objects;
DROP POLICY IF EXISTS "storage_property_docs_admin_all" ON storage.objects;

-- ==============================================================================
-- 3. PROFILES TABLE & SECURITY DEFINER PRIVILEGE HELPERS
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  company_name TEXT,
  role TEXT NOT NULL DEFAULT 'landlord',
  avatar_url TEXT,
  verified BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS email TEXT,
  ADD COLUMN IF NOT EXISTS full_name TEXT,
  ADD COLUMN IF NOT EXISTS phone TEXT,
  ADD COLUMN IF NOT EXISTS company_name TEXT,
  ADD COLUMN IF NOT EXISTS role TEXT DEFAULT 'landlord',
  ADD COLUMN IF NOT EXISTS avatar_url TEXT,
  ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS created_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now()),
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Backfill legacy nulls before constraint enforcement
UPDATE public.profiles SET email = 'unspecified@smartbridge.ng' WHERE email IS NULL;
UPDATE public.profiles SET role = 'landlord' WHERE role IS NULL OR role NOT IN ('landlord', 'agent', 'developer', 'admin');
UPDATE public.profiles SET verified = false WHERE verified IS NULL;

ALTER TABLE public.profiles ALTER COLUMN email SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN role SET DEFAULT 'landlord';
ALTER TABLE public.profiles ALTER COLUMN role SET NOT NULL;
ALTER TABLE public.profiles ALTER COLUMN verified SET DEFAULT false;
ALTER TABLE public.profiles ALTER COLUMN verified SET NOT NULL;

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('landlord', 'agent', 'developer', 'admin'));

-- Convert legacy profile IDs to Supabase Auth UUIDs
ALTER TABLE public.profiles
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.profiles
  ALTER COLUMN id TYPE UUID
  USING NULLIF(trim(id), '')::UUID;

ALTER TABLE public.profiles
  DROP CONSTRAINT IF EXISTS profiles_id_fkey;

ALTER TABLE public.profiles
  ADD CONSTRAINT profiles_id_fkey
  FOREIGN KEY (id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- Hardened Security-Definer Helpers (No RLS recursion, returns false if auth.uid() is NULL)
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    ELSE COALESCE((
      SELECT (role = 'admin')
      FROM public.profiles
      WHERE id = auth.uid()
    ), false)
  END;
$$;

REVOKE ALL ON FUNCTION public.is_admin() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_admin() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_admin() TO authenticated;

CREATE OR REPLACE FUNCTION public.is_lister()
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT CASE
    WHEN auth.uid() IS NULL THEN false
    ELSE COALESCE((
      SELECT (role IN ('landlord', 'agent', 'developer', 'admin'))
      FROM public.profiles
      WHERE id = auth.uid()
    ), false)
  END;
$$;

REVOKE ALL ON FUNCTION public.is_lister() FROM PUBLIC;
REVOKE ALL ON FUNCTION public.is_lister() FROM anon;
GRANT EXECUTE ON FUNCTION public.is_lister() TO authenticated;

REVOKE SELECT ON public.properties FROM anon;

-- ==============================================================================
-- 4. BASE PROPERTIES REPOSITORY
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  slug TEXT,
  location TEXT NOT NULL,
  neighborhood TEXT NOT NULL DEFAULT 'GRA Phase 2',
  address TEXT,
  price NUMERIC NOT NULL DEFAULT 0,
  price_display TEXT,
  price_period TEXT,
  type TEXT NOT NULL DEFAULT 'sale',
  property_type TEXT NOT NULL DEFAULT 'Apartment',
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  parking_spaces INTEGER NOT NULL DEFAULT 0,
  size_sq_ft INTEGER NOT NULL DEFAULT 0,
  is_verified BOOLEAN NOT NULL DEFAULT false,
  is_featured BOOLEAN NOT NULL DEFAULT false,
  status TEXT NOT NULL DEFAULT 'pending',
  images TEXT[] NOT NULL DEFAULT '{}',
  videos TEXT[] NOT NULL DEFAULT '{}',
  video_url TEXT,
  description TEXT,
  features TEXT[] NOT NULL DEFAULT '{}',
  amenities TEXT[] NOT NULL DEFAULT '{}',
  inspection_report JSONB,
  agent JSONB,
  owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  owner_name TEXT,
  owner_email TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

ALTER TABLE public.properties
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS neighborhood TEXT DEFAULT 'GRA Phase 2',
  ADD COLUMN IF NOT EXISTS address TEXT,
  ADD COLUMN IF NOT EXISTS price NUMERIC DEFAULT 0,
  ADD COLUMN IF NOT EXISTS price_display TEXT,
  ADD COLUMN IF NOT EXISTS price_period TEXT,
  ADD COLUMN IF NOT EXISTS type TEXT DEFAULT 'sale',
  ADD COLUMN IF NOT EXISTS property_type TEXT DEFAULT 'Apartment',
  ADD COLUMN IF NOT EXISTS bedrooms INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS bathrooms INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS parking_spaces INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS size_sq_ft INTEGER DEFAULT 0,
  ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS is_featured BOOLEAN DEFAULT false,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS videos TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS video_url TEXT,
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS features TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS amenities TEXT[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS inspection_report JSONB,
  ADD COLUMN IF NOT EXISTS agent JSONB,
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  ADD COLUMN IF NOT EXISTS owner_name TEXT,
  ADD COLUMN IF NOT EXISTS owner_email TEXT,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());


-- CONVERT LEGACY ACTIVE/NULL LISTINGS TO 'pending' (DO NOT AUTO-APPROVE)
UPDATE public.properties
SET status = 'pending'
WHERE status = 'active' OR status IS NULL;

UPDATE public.properties SET is_verified = false WHERE is_verified IS NULL;
UPDATE public.properties SET is_featured = false WHERE is_featured IS NULL;

ALTER TABLE public.properties ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.properties ALTER COLUMN status SET NOT NULL;
ALTER TABLE public.properties ALTER COLUMN is_verified SET DEFAULT false;
ALTER TABLE public.properties ALTER COLUMN is_verified SET NOT NULL;
ALTER TABLE public.properties ALTER COLUMN is_featured SET DEFAULT false;
ALTER TABLE public.properties ALTER COLUMN is_featured SET NOT NULL;

ALTER TABLE public.properties DROP CONSTRAINT IF EXISTS properties_status_check;
ALTER TABLE public.properties ADD CONSTRAINT properties_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'unpublished', 'sold', 'rented'));

ALTER TABLE public.properties ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.properties
  ALTER COLUMN id SET DEFAULT gen_random_uuid()::text;

-- REVOKE DIRECT ANONYMOUS ACCESS TO BASE PROPERTIES TABLE
REVOKE SELECT ON public.properties FROM anon;

-- ==============================================================================
-- 5. PROPERTY SUBMISSIONS (LISTER PROPOSALS & REJECTED RE-SUBMISSION WORKFLOW)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.property_submissions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  owner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  property_type TEXT NOT NULL,
  listing_type TEXT NOT NULL DEFAULT 'sale',
  location TEXT NOT NULL,
  address TEXT NOT NULL,
  price NUMERIC NOT NULL DEFAULT 0,
  bedrooms INTEGER NOT NULL DEFAULT 0,
  bathrooms INTEGER NOT NULL DEFAULT 0,
  owner_name TEXT,
  owner_phone TEXT,
  owner_email TEXT,
  title_doc_type TEXT DEFAULT 'Certificate of Occupancy (C of O)',
  description TEXT,
  images TEXT[] DEFAULT '{}',
  videos TEXT[] DEFAULT '{}',
  video_url TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  submitted_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  assigned_inspector TEXT,
  audit_notes TEXT,
  flood_assessment TEXT,
  structural_score INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Convert legacy submission IDs to automatically generated UUIDs
ALTER TABLE public.property_submissions
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.property_submissions
  ALTER COLUMN id TYPE UUID
  USING NULLIF(trim(id), '')::UUID;

ALTER TABLE public.property_submissions
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.property_submissions
  ALTER COLUMN id SET NOT NULL;

ALTER TABLE public.property_submissions
  ADD COLUMN IF NOT EXISTS owner_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS status TEXT DEFAULT 'pending',
  ADD COLUMN IF NOT EXISTS assigned_inspector TEXT,
  ADD COLUMN IF NOT EXISTS audit_notes TEXT,
  ADD COLUMN IF NOT EXISTS flood_assessment TEXT,
  ADD COLUMN IF NOT EXISTS structural_score INTEGER,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMPTZ DEFAULT timezone('utc'::text, now());

-- Convert legacy property owner IDs to Supabase Auth UUIDs
ALTER TABLE public.properties
  ALTER COLUMN owner_id DROP DEFAULT;

ALTER TABLE public.properties
  ALTER COLUMN owner_id TYPE UUID
  USING NULLIF(trim(owner_id), '')::UUID;

ALTER TABLE public.properties
  DROP CONSTRAINT IF EXISTS properties_owner_id_fkey;

ALTER TABLE public.properties
  ADD CONSTRAINT properties_owner_id_fkey
  FOREIGN KEY (owner_id)
  REFERENCES auth.users(id)
  ON DELETE SET NULL;

-- Convert legacy owner_id to UUID and connect it to Supabase Auth
ALTER TABLE public.property_submissions
  ALTER COLUMN owner_id DROP DEFAULT;

ALTER TABLE public.property_submissions
  ALTER COLUMN owner_id TYPE UUID
  USING NULLIF(trim(owner_id), '')::UUID;

ALTER TABLE public.property_submissions
  DROP CONSTRAINT IF EXISTS property_submissions_owner_id_fkey;

ALTER TABLE public.property_submissions
  ADD CONSTRAINT property_submissions_owner_id_fkey
  FOREIGN KEY (owner_id)
  REFERENCES auth.users(id)
  ON DELETE CASCADE;

ALTER TABLE public.property_submissions
  ALTER COLUMN owner_id SET NOT NULL;

-- Backfill legacy statuses
UPDATE public.property_submissions
SET status = 'pending'
WHERE status IN ('pending_audit', 'in_progress') OR status IS NULL;

ALTER TABLE public.property_submissions ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.property_submissions ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.property_submissions DROP CONSTRAINT IF EXISTS property_submissions_status_check;
ALTER TABLE public.property_submissions ADD CONSTRAINT property_submissions_status_check
  CHECK (status IN ('draft', 'pending', 'approved', 'rejected', 'unpublished', 'sold', 'rented'));

ALTER TABLE public.property_submissions ENABLE ROW LEVEL SECURITY;

-- Resubmission Workflow Trigger:
-- Ensures non-admin owners cannot set approved/sold/rented/unpublished,
-- cannot change owner_id, and resubmissions of rejected proposals automatically return to pending.
CREATE OR REPLACE FUNCTION public.handle_submission_status_transition()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Administrators can manage any status transition freely
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  -- Non-admin owners cannot change ownership
  IF NEW.owner_id <> OLD.owner_id THEN
    RAISE EXCEPTION 'Cannot transfer property submission ownership.';
  END IF;

  -- Non-admin owners are strictly forbidden from self-approving or publishing
  IF NEW.status IN ('approved', 'sold', 'rented', 'unpublished') THEN
    RAISE EXCEPTION 'Only SmartBridge administrators can transition submission status to %', NEW.status;
  END IF;

  -- When a rejected submission is edited and resubmitted, automatically reset to 'pending'
  IF OLD.status = 'rejected' THEN
    IF NEW.status = 'draft' THEN
      NEW.status := 'draft';
    ELSE
      NEW.status := 'pending';
    END IF;
  END IF;

  -- Non-admin owners can only maintain draft or pending
  IF NEW.status NOT IN ('draft', 'pending') THEN
    NEW.status := 'pending';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_submission_status_transition() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_submission_status_transition ON public.property_submissions;
CREATE TRIGGER on_submission_status_transition
  BEFORE UPDATE ON public.property_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_submission_status_transition();

-- ==============================================================================
-- 6. VISITOR ENQUIRIES & INSPECTION BOOKINGS (WITH FOREIGN KEYS & CHECK CONSTRAINTS)
-- ==============================================================================
CREATE TABLE IF NOT EXISTS public.property_inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT,
  property_title TEXT NOT NULL,
  property_location TEXT,
  property_price TEXT,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  buyer_phone TEXT NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'general',
  offer_amount TEXT,
  proposed_move_in TEXT,
  message TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'new',
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Convert legacy inquiry IDs to automatically generated UUIDs
ALTER TABLE public.property_inquiries
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.property_inquiries
  ALTER COLUMN id TYPE UUID
  USING NULLIF(trim(id), '')::UUID;

ALTER TABLE public.property_inquiries
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

ALTER TABLE public.property_inquiries DROP COLUMN IF EXISTS smart_bridge_escrow_requested;

-- Backfill invalid inquiry statuses
UPDATE public.property_inquiries
SET status = 'new'
WHERE status IS NULL OR status NOT IN ('new', 'contacted', 'tour_scheduled', 'closed', 'archived');

ALTER TABLE public.property_inquiries ALTER COLUMN status SET DEFAULT 'new';
ALTER TABLE public.property_inquiries ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.property_inquiries DROP CONSTRAINT IF EXISTS property_inquiries_status_check;
ALTER TABLE public.property_inquiries ADD CONSTRAINT property_inquiries_status_check
  CHECK (status IN ('new', 'contacted', 'tour_scheduled', 'closed', 'archived'));

-- Clean up any orphan inquiries before adding foreign key constraint
UPDATE public.property_inquiries
SET property_id = NULL
WHERE property_id IS NOT NULL AND property_id NOT IN (SELECT id FROM public.properties);

ALTER TABLE public.property_inquiries DROP CONSTRAINT IF EXISTS property_inquiries_property_id_fkey;
ALTER TABLE public.property_inquiries
  ADD CONSTRAINT property_inquiries_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL;

ALTER TABLE public.property_inquiries ENABLE ROW LEVEL SECURITY;

-- INSPECTION BOOKINGS TABLE
CREATE TABLE IF NOT EXISTS public.inspection_bookings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  property_id TEXT,
  property_title TEXT NOT NULL,
  property_location TEXT,
  property_price TEXT,
  name TEXT NOT NULL,
  email TEXT,
  phone TEXT NOT NULL,
  preferred_date DATE NOT NULL DEFAULT CURRENT_DATE,
  preferred_time TIME NOT NULL DEFAULT '10:00:00',
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending',
  assigned_specialist TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- Align legacy inspection booking column names with the application
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'inspection_bookings'
      AND column_name = 'user_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'inspection_bookings'
      AND column_name = 'name'
  ) THEN
    ALTER TABLE public.inspection_bookings
      RENAME COLUMN user_name TO name;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'inspection_bookings'
      AND column_name = 'user_email'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'inspection_bookings'
      AND column_name = 'email'
  ) THEN
    ALTER TABLE public.inspection_bookings
      RENAME COLUMN user_email TO email;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'inspection_bookings'
      AND column_name = 'user_phone'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'inspection_bookings'
      AND column_name = 'phone'
  ) THEN
    ALTER TABLE public.inspection_bookings
      RENAME COLUMN user_phone TO phone;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'inspection_bookings'
      AND column_name = 'note'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'inspection_bookings'
      AND column_name = 'notes'
  ) THEN
    ALTER TABLE public.inspection_bookings
      RENAME COLUMN note TO notes;
  END IF;

  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'inspection_bookings'
      AND column_name = 'assigned_agent_name'
  ) AND NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'inspection_bookings'
      AND column_name = 'assigned_specialist'
  ) THEN
    ALTER TABLE public.inspection_bookings
      RENAME COLUMN assigned_agent_name TO assigned_specialist;
  END IF;
END
$$;

-- Convert legacy inspection booking IDs to automatically generated UUIDs
ALTER TABLE public.inspection_bookings
  ALTER COLUMN id DROP DEFAULT;

ALTER TABLE public.inspection_bookings
  ALTER COLUMN id TYPE UUID
  USING NULLIF(trim(id), '')::UUID;

ALTER TABLE public.inspection_bookings
  ALTER COLUMN id SET DEFAULT gen_random_uuid();

-- Backfill invalid booking statuses
UPDATE public.inspection_bookings
SET status = 'pending'
WHERE status IS NULL OR status NOT IN ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled');

ALTER TABLE public.inspection_bookings ALTER COLUMN status SET DEFAULT 'pending';
ALTER TABLE public.inspection_bookings ALTER COLUMN status SET NOT NULL;

ALTER TABLE public.inspection_bookings DROP CONSTRAINT IF EXISTS inspection_bookings_status_check;
ALTER TABLE public.inspection_bookings ADD CONSTRAINT inspection_bookings_status_check
  CHECK (status IN ('pending', 'confirmed', 'rescheduled', 'completed', 'cancelled'));

-- Clean up orphan bookings before adding foreign key constraint
UPDATE public.inspection_bookings
SET property_id = NULL
WHERE property_id IS NOT NULL AND property_id NOT IN (SELECT id FROM public.properties);

ALTER TABLE public.inspection_bookings DROP CONSTRAINT IF EXISTS inspection_bookings_property_id_fkey;
ALTER TABLE public.inspection_bookings
  ADD CONSTRAINT inspection_bookings_property_id_fkey
  FOREIGN KEY (property_id) REFERENCES public.properties(id) ON DELETE SET NULL;

-- Convert legacy booking date and time columns to proper PostgreSQL types
ALTER TABLE public.inspection_bookings
  ALTER COLUMN preferred_date DROP DEFAULT,
  ALTER COLUMN preferred_time DROP DEFAULT;

ALTER TABLE public.inspection_bookings
  ALTER COLUMN preferred_date TYPE DATE
    USING NULLIF(trim(preferred_date), '')::DATE,
  ALTER COLUMN preferred_time TYPE TIME
    USING NULLIF(trim(preferred_time), '')::TIME;

ALTER TABLE public.inspection_bookings
  ALTER COLUMN preferred_date SET DEFAULT CURRENT_DATE,
  ALTER COLUMN preferred_time SET DEFAULT '10:00:00'::TIME;

ALTER TABLE public.inspection_bookings ENABLE ROW LEVEL SECURITY;

-- ==============================================================================
-- 7. SAFE PUBLIC VIEW (APPROVED PROPERTIES ONLY)
-- Strict privacy: excludes address, agent, owner identity, docs, & internal inspection report.
-- ==============================================================================
DROP VIEW IF EXISTS public.public_properties;
CREATE VIEW public.public_properties AS
SELECT
  p.id,
  p.title,
  p.slug,
  p.location,
  p.neighborhood,
  p.price,
  p.price_display,
  p.price_period,
  p.type,
  p.property_type,
  p.bedrooms,
  p.bathrooms,
  p.parking_spaces,
  p.size_sq_ft,
  p.is_verified,
  p.is_featured,
  p.status,
  p.images,
  p.videos,
  p.video_url,
  p.description,
  p.features,
  p.amenities,
  p.created_at,
  p.updated_at
FROM public.properties p
WHERE p.status = 'approved';

GRANT SELECT ON public.public_properties TO anon, authenticated;

-- Prevent non-admin users from changing security-sensitive profile fields
CREATE OR REPLACE FUNCTION public.protect_profile_security_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.id IS DISTINCT FROM OLD.id THEN
    RAISE EXCEPTION 'A profile ID cannot be changed.';
  END IF;

  IF NEW.role IS DISTINCT FROM OLD.role THEN
    RAISE EXCEPTION 'Only an administrator can change an account role.';
  END IF;

  IF NEW.verified IS DISTINCT FROM OLD.verified THEN
    RAISE EXCEPTION 'Only an administrator can change verification status.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_profile_security_fields()
  FROM PUBLIC;

DROP TRIGGER IF EXISTS protect_profile_security_fields
  ON public.profiles;

CREATE TRIGGER protect_profile_security_fields
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_profile_security_fields();

-- Prevent property listers from editing administrator-only submission fields
CREATE OR REPLACE FUNCTION public.protect_submission_admin_fields()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = ''
AS $$
BEGIN
  IF public.is_admin() THEN
    RETURN NEW;
  END IF;

  IF NEW.owner_id IS DISTINCT FROM OLD.owner_id THEN
    RAISE EXCEPTION 'Property submission ownership cannot be changed.';
  END IF;

  IF NEW.assigned_inspector IS DISTINCT FROM OLD.assigned_inspector
     OR NEW.audit_notes IS DISTINCT FROM OLD.audit_notes
     OR NEW.flood_assessment IS DISTINCT FROM OLD.flood_assessment
     OR NEW.structural_score IS DISTINCT FROM OLD.structural_score THEN
    RAISE EXCEPTION
      'Only an administrator can update inspection and audit information.';
  END IF;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.protect_submission_admin_fields()
  FROM PUBLIC;

DROP TRIGGER IF EXISTS protect_submission_admin_fields
  ON public.property_submissions;

CREATE TRIGGER protect_submission_admin_fields
  BEFORE UPDATE ON public.property_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.protect_submission_admin_fields();

-- ==============================================================================
-- 8. TIMESTAMPS: AUTOMATED UPDATED_AT TRIGGERS
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = timezone('utc'::text, now());
  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_updated_at() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_profiles_updated_at ON public.profiles;
CREATE TRIGGER on_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_properties_updated_at ON public.properties;
CREATE TRIGGER on_properties_updated_at
  BEFORE UPDATE ON public.properties
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

DROP TRIGGER IF EXISTS on_property_submissions_updated_at ON public.property_submissions;
CREATE TRIGGER on_property_submissions_updated_at
  BEFORE UPDATE ON public.property_submissions
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();

-- Check that a property is approved without exposing the base table
CREATE OR REPLACE FUNCTION public.is_approved_property(p_property_id TEXT)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = ''
AS $$
  SELECT
    p_property_id IS NOT NULL
    AND EXISTS (
      SELECT 1
      FROM public.properties AS p
      WHERE p.id = p_property_id
        AND p.status = 'approved'
    );
$$;
REVOKE ALL ON FUNCTION public.is_approved_property(TEXT) FROM PUBLIC;

GRANT EXECUTE ON FUNCTION public.is_approved_property(TEXT)
  TO anon, authenticated;

-- ==============================================================================
-- 9. ROW LEVEL SECURITY POLICIES
-- ==============================================================================

-- A. PROFILES (Non-recursive check, no self-promotion to admin)
CREATE POLICY "profiles_select_own"
ON public.profiles FOR SELECT TO authenticated
USING (id = auth.uid());

CREATE POLICY "profiles_insert_own"
ON public.profiles FOR INSERT TO authenticated
WITH CHECK (
  id = auth.uid()
  AND role IN ('landlord', 'agent', 'developer')
);

CREATE POLICY "profiles_update_own"
ON public.profiles FOR UPDATE TO authenticated
USING (id = auth.uid())
WITH CHECK (
  id = auth.uid()
  AND role IN ('landlord', 'agent', 'developer')
);

CREATE POLICY "profiles_admin_all"
ON public.profiles FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- B. PROPERTIES (Base table protected from anon; listers see own, admins see all)
CREATE POLICY "properties_select_owner"
ON public.properties FOR SELECT TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "properties_admin_all"
ON public.properties FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- C. PROPERTY SUBMISSIONS (Owners can read rejected; owners can edit draft/pending/rejected)
CREATE POLICY "submissions_insert_lister"
ON public.property_submissions FOR INSERT TO authenticated
WITH CHECK (
  owner_id = auth.uid()
  AND public.is_lister()
  AND status IN ('draft', 'pending')
);

CREATE POLICY "submissions_select_owner"
ON public.property_submissions FOR SELECT TO authenticated
USING (owner_id = auth.uid());

CREATE POLICY "submissions_update_owner"
ON public.property_submissions FOR UPDATE TO authenticated
USING (
  owner_id = auth.uid()
  AND status IN ('draft', 'pending', 'rejected')
)
WITH CHECK (
  owner_id = auth.uid()
  AND status IN ('draft', 'pending', 'rejected')
);

CREATE POLICY "submissions_delete_owner"
ON public.property_submissions FOR DELETE TO authenticated
USING (
  owner_id = auth.uid()
  AND status IN ('draft', 'pending')
);

CREATE POLICY "submissions_admin_all"
ON public.property_submissions FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- D. PROPERTY INQUIRIES (Validated Anonymous & Authenticated Visitor Inserts)
CREATE POLICY "inquiries_insert_public"
ON public.property_inquiries FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'new'
  AND property_id IS NOT NULL
  AND trim(buyer_name) <> ''
  AND trim(buyer_phone) <> ''
  AND trim(message) <> ''
  AND public.is_approved_property(property_inquiries.property_id)
);

CREATE POLICY "inquiries_admin_all"
ON public.property_inquiries FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- E. INSPECTION BOOKINGS (Validated Anonymous & Authenticated Visitor Inserts)
CREATE POLICY "bookings_insert_public"
ON public.inspection_bookings FOR INSERT TO anon, authenticated
WITH CHECK (
  status = 'pending'
  AND preferred_date >= CURRENT_DATE
  AND property_id IS NOT NULL
  AND trim(name) <> ''
  AND trim(phone) <> ''
  AND assigned_specialist IS NULL
  AND public.is_approved_property(inspection_bookings.property_id)
);

CREATE POLICY "bookings_admin_all"
ON public.inspection_bookings FOR ALL TO authenticated
USING (public.is_admin())
WITH CHECK (public.is_admin());

-- ==============================================================================
-- 10. STORAGE BUCKETS & POLICIES
-- Separated:
--  - 'property-submissions': PRIVATE pre-approval uploads for listers
--  - 'property-images': PUBLIC administrator-approved properties
--  - 'property-documents': PRIVATE confidential title documentation
-- ==============================================================================

-- 1. Private submission bucket for listers
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-submissions',
  'property-submissions',
  false,
  15728640,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 2. Public bucket for approved properties only
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-images',
  'property-images',
  true,
  15728640,
  ARRAY['image/jpeg', 'image/png', 'image/webp', 'image/avif', 'video/mp4']
)
ON CONFLICT (id) DO UPDATE SET
  public = true,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- 3. Private bucket for confidential property documents
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'property-documents',
  'property-documents',
  false,
  26214400,
  ARRAY['application/pdf', 'image/jpeg', 'image/png']
)
ON CONFLICT (id) DO UPDATE SET
  public = false,
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- POLICIES FOR 'property-submissions' (PRIVATE)
CREATE POLICY "storage_property_submissions_select"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'property-submissions'
  AND (
    (auth.uid()::text = (storage.foldername(name))[1])
    OR public.is_admin()
  )
);

CREATE POLICY "storage_property_submissions_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'property-submissions'
  AND public.is_lister()
  AND (auth.uid()::text = (storage.foldername(name))[1])
);

CREATE POLICY "storage_property_submissions_update"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'property-submissions'
  AND (
    (auth.uid()::text = (storage.foldername(name))[1])
    OR public.is_admin()
  )
)
WITH CHECK (
  bucket_id = 'property-submissions'
  AND (
    (auth.uid()::text = (storage.foldername(name))[1])
    OR public.is_admin()
  )
);

CREATE POLICY "storage_property_submissions_delete"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'property-submissions'
  AND (
    (auth.uid()::text = (storage.foldername(name))[1])
    OR public.is_admin()
  )
);

CREATE POLICY "storage_property_submissions_admin_all"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'property-submissions' AND public.is_admin())
WITH CHECK (bucket_id = 'property-submissions' AND public.is_admin());

-- POLICIES FOR 'property-images' (PUBLIC SELECT; ONLY ADMINS CAN INSERT/UPDATE/DELETE)
CREATE POLICY "storage_property_images_public_select"
ON storage.objects FOR SELECT TO anon, authenticated
USING (bucket_id = 'property-images');

CREATE POLICY "storage_property_images_admin_all"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'property-images' AND public.is_admin())
WITH CHECK (bucket_id = 'property-images' AND public.is_admin());

-- POLICIES FOR 'property-documents' (PRIVATE)
CREATE POLICY "storage_property_docs_owner_admin_select"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'property-documents'
  AND (
    (auth.uid()::text = (storage.foldername(name))[1])
    OR public.is_admin()
  )
);

CREATE POLICY "storage_property_docs_owner_upload"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'property-documents'
  AND (auth.uid()::text = (storage.foldername(name))[1])
  AND public.is_lister()
);

CREATE POLICY "storage_property_docs_admin_all"
ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'property-documents' AND public.is_admin())
WITH CHECK (bucket_id = 'property-documents' AND public.is_admin());

-- ==============================================================================
-- 11. REGISTRATION TRIGGER (ROLE ESCALATION SAFEGUARD)
-- ==============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_role text;
BEGIN
  v_role := COALESCE(NEW.raw_user_meta_data->>'role', 'landlord');
  -- Strictly forbid auto-registration into 'admin'
  IF v_role NOT IN ('landlord', 'agent', 'developer') THEN
    v_role := 'landlord';
  END IF;

  INSERT INTO public.profiles (
    id, email, full_name, phone, company_name, role, verified
  ) VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', split_part(NEW.email, '@', 1)),
    NEW.raw_user_meta_data->>'phone',
    NEW.raw_user_meta_data->>'company_name',
    v_role,
    false
  )
  ON CONFLICT (id) DO NOTHING;

  RETURN NEW;
END;
$$;

REVOKE ALL ON FUNCTION public.handle_new_user() FROM PUBLIC;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

COMMIT;
