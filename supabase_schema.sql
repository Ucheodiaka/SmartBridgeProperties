-- SmartBridge Port Harcourt Real Estate Database Schema (Supabase / PostgreSQL)

-- 1. Profiles Table (For Property Listers, Landlords, Agents, and Admin Staff)
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT NOT NULL,
  phone TEXT,
  company_name TEXT,
  role TEXT NOT NULL DEFAULT 'lister', -- 'lister', 'landlord', 'agent', 'admin'
  avatar_url TEXT,
  verified BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. Properties Table (Active Marketplace Listings)
CREATE TABLE IF NOT EXISTS properties (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  period TEXT, -- 'year', 'month', 'total'
  for_rent BOOLEAN DEFAULT FALSE,
  location TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  area TEXT,
  property_type TEXT NOT NULL,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  features TEXT[] DEFAULT '{}',
  
  -- SmartBridge Port Harcourt Audit & Verification Fields
  title_document_type TEXT NOT NULL DEFAULT 'Certificate of Occupancy (C of O)',
  survey_plan_number TEXT,
  deed_registration_number TEXT,
  flood_risk_rating TEXT NOT NULL DEFAULT 'Very Low',
  elevation_meters NUMERIC DEFAULT 12,
  drainage_infrastructure_score INT DEFAULT 90,
  structural_integrity_score INT DEFAULT 92,
  road_accessibility_score INT DEFAULT 88,
  verified_status TEXT NOT NULL DEFAULT 'Verified',
  verification_date TIMESTAMPTZ DEFAULT NOW(),
  lead_inspector_name TEXT DEFAULT 'Engr. Tonye Amadi',
  inspector_license_number TEXT DEFAULT 'COREN/RIV/2018/4491',
  legal_counsel_sign_off TEXT DEFAULT 'Barrister Chioma Okon (Rivers State Bar #10928)',
  
  -- Owner / Lister info
  owner_id TEXT,
  owner_name TEXT,
  owner_email TEXT,
  owner_phone TEXT,
  owner_role TEXT DEFAULT 'landlord',
  
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Property Submissions (Pending Verification Queue from Listers)
CREATE TABLE IF NOT EXISTS property_submissions (
  id TEXT PRIMARY KEY,
  owner_id TEXT NOT NULL,
  owner_name TEXT NOT NULL,
  owner_email TEXT NOT NULL,
  owner_phone TEXT NOT NULL,
  owner_role TEXT NOT NULL DEFAULT 'landlord',
  company_name TEXT,
  
  title TEXT NOT NULL,
  price NUMERIC NOT NULL,
  for_rent BOOLEAN DEFAULT FALSE,
  location TEXT NOT NULL,
  neighborhood TEXT NOT NULL,
  property_type TEXT NOT NULL,
  bedrooms INT DEFAULT 0,
  bathrooms INT DEFAULT 0,
  description TEXT,
  images TEXT[] DEFAULT '{}',
  video_url TEXT,
  
  title_document_type TEXT NOT NULL,
  survey_plan_number TEXT,
  deed_registration_number TEXT,
  
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'under_review', 'approved', 'rejected'
  submitted_at TIMESTAMPTZ DEFAULT NOW(),
  inspected_at TIMESTAMPTZ,
  admin_notes TEXT,
  flood_assessment TEXT,
  structural_score INT,
  approved_property_id TEXT
);

-- 4. Property Inquiries & Direct Offers (Buyer Leads for Listers)
CREATE TABLE IF NOT EXISTS property_inquiries (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  property_title TEXT NOT NULL,
  property_location TEXT NOT NULL,
  property_price NUMERIC NOT NULL,
  owner_id TEXT,
  owner_email TEXT,
  
  buyer_name TEXT NOT NULL,
  buyer_email TEXT NOT NULL,
  buyer_phone TEXT NOT NULL,
  inquiry_type TEXT NOT NULL DEFAULT 'general_inquiry', -- 'offer', 'viewing_request', 'price_negotiation', 'general_inquiry'
  offered_price NUMERIC,
  payment_method TEXT, -- 'cash_ready', 'bank_mortgage', 'installment_plan'
  timeline TEXT, -- 'immediate', 'within_1_month', '1_to_3_months', 'exploring'
  message TEXT NOT NULL,
  
  status TEXT NOT NULL DEFAULT 'new', -- 'new', 'contacted', 'negotiating', 'closed'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. Inspection Bookings (Physical Viewing Appointments)
CREATE TABLE IF NOT EXISTS inspection_bookings (
  id TEXT PRIMARY KEY,
  property_id TEXT NOT NULL,
  property_title TEXT NOT NULL,
  property_location TEXT NOT NULL,
  property_price NUMERIC NOT NULL,
  
  user_name TEXT NOT NULL,
  user_email TEXT NOT NULL,
  user_phone TEXT NOT NULL,
  preferred_date TEXT NOT NULL,
  preferred_time TEXT NOT NULL,
  notes TEXT,
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'confirmed', 'completed', 'cancelled'
  assigned_agent_id TEXT,
  assigned_agent_name TEXT,
  assigned_agent_phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security (RLS)
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE properties ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_submissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE property_inquiries ENABLE ROW LEVEL SECURITY;
ALTER TABLE inspection_bookings ENABLE ROW LEVEL SECURITY;

-- Public read access for active properties
CREATE POLICY "Public read for verified properties" ON properties FOR SELECT USING (true);

-- Allow authenticated and anon reads/writes for marketplace flow (or customize with strict Auth IDs)
CREATE POLICY "Enable all access for development" ON properties FOR ALL USING (true);
CREATE POLICY "Enable all access for submissions" ON property_submissions FOR ALL USING (true);
CREATE POLICY "Enable all access for inquiries" ON property_inquiries FOR ALL USING (true);
CREATE POLICY "Enable all access for bookings" ON inspection_bookings FOR ALL USING (true);
