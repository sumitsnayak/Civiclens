-- CivicLens Supabase Schema & Security Migration
-- Version: 1.1.0
-- Description: Core tables, citizen queries storage, RLS policies, trigger-based profile creation, and demo data

-- 1. Create custom types if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 2. Profiles table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    display_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'citizen' CHECK (role IN ('citizen', 'admin')),
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 3. Reports table
CREATE TABLE IF NOT EXISTS public.reports (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    reference_code TEXT UNIQUE NOT NULL,
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    author_name TEXT DEFAULT 'Citizen Reporter',
    title TEXT NOT NULL,
    description TEXT NOT NULL,
    category TEXT NOT NULL CHECK (category IN ('pothole', 'garbage', 'streetlight', 'water_leakage', 'drainage', 'infrastructure', 'other')),
    severity TEXT NOT NULL CHECK (severity IN ('low', 'medium', 'high', 'critical')),
    status TEXT NOT NULL DEFAULT 'reported' CHECK (status IN ('reported', 'under_review', 'in_progress', 'resolved', 'rejected')),
    image_path TEXT NOT NULL,
    latitude DOUBLE PRECISION NOT NULL,
    longitude DOUBLE PRECISION NOT NULL,
    address TEXT,
    landmark TEXT,
    ai_category TEXT,
    ai_explanation TEXT,
    ai_confidence DOUBLE PRECISION,
    duplicate_of UUID REFERENCES public.reports(id) ON DELETE SET NULL,
    upvotes_count INTEGER NOT NULL DEFAULT 0,
    priority_score INTEGER NOT NULL DEFAULT 60,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

-- 4. Report Updates / Timeline table
CREATE TABLE IF NOT EXISTS public.report_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    actor_name TEXT,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    public_message TEXT,
    internal_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Citizen Queries / Inquiries Table
CREATE TABLE IF NOT EXISTS public.citizen_queries (
    id TEXT PRIMARY KEY,
    ticket_reference TEXT,
    author_name TEXT NOT NULL DEFAULT 'Citizen Inquirer',
    category TEXT NOT NULL DEFAULT 'general',
    question TEXT NOT NULL,
    details TEXT,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('answered', 'pending', 'escalated')),
    response TEXT,
    responder_name TEXT,
    upvotes INTEGER NOT NULL DEFAULT 1,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 6. Enable Row Level Security (RLS)
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.citizen_queries ENABLE ROW LEVEL SECURITY;

-- 7. Access Policies
CREATE POLICY "Public reports are viewable by everyone" ON public.reports FOR SELECT USING (true);
CREATE POLICY "Anyone can create reports" ON public.reports FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update reports" ON public.reports FOR UPDATE USING (true);

CREATE POLICY "Public updates are viewable by everyone" ON public.report_updates FOR SELECT USING (true);
CREATE POLICY "Anyone can create updates" ON public.report_updates FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view profiles" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Anyone can create profiles" ON public.profiles FOR INSERT WITH CHECK (true);

CREATE POLICY "Public can view queries" ON public.citizen_queries FOR SELECT USING (true);
CREATE POLICY "Anyone can insert queries" ON public.citizen_queries FOR INSERT WITH CHECK (true);
CREATE POLICY "Anyone can update queries" ON public.citizen_queries FOR UPDATE USING (true);

-- 8. Storage Bucket for Issue Photos
INSERT INTO storage.buckets (id, name, public) 
VALUES ('civic-reports', 'civic-reports', true)
ON CONFLICT (id) DO NOTHING;

CREATE POLICY "Public Access" ON storage.objects FOR SELECT USING (bucket_id = 'civic-reports');
CREATE POLICY "Public Uploads" ON storage.objects FOR INSERT WITH CHECK (bucket_id = 'civic-reports');

-- 9. Seed Initial Citizen Queries
INSERT INTO public.citizen_queries (id, ticket_reference, author_name, category, question, details, status, responder_name, response, upvotes)
VALUES 
(
  'qry-1',
  'CVL-2026-8812',
  'Elena Rostova',
  'pothole',
  'How long does a severe pothole work order take to be dispatched?',
  'I reported an 8-inch deep road cavity on Market Street that is damaging bicycle rims. When will the milling crew arrive?',
  'answered',
  'Director Sharma (Department of Public Works)',
  'Critical priority road cavities on arterial transit corridors are scheduled for initial cold-patch asphalt stabilization within 24 to 48 hours of municipal triage. Heavy milling equipment has been deployed for Market Street.',
  18
),
(
  'qry-2',
  'CVL-2026-3490',
  'David Chen',
  'garbage',
  'What is the procedure if a commercial garbage dumpster overflows repeatedly every weekend?',
  'Our local market dumpster overflows by Saturday afternoon attracting pests. Can municipal sanitation increase pickup frequency?',
  'answered',
  'Sanitation Bureau Dispatch',
  'Repeated commercial overflow reports are automatically forwarded to the Bureau of Code Enforcement. A commercial waste audit has been triggered for this sector to enforce larger bin capacity.',
  12
),
(
  'qry-3',
  'CVL-2026-9041',
  'Priya Patel',
  'streetlight',
  'Can I report multiple dark streetlights along a block under a single ticket?',
  'Five consecutive streetlights along 4th Avenue are dead, creating a 200-meter dark corridor.',
  'answered',
  'Public Infrastructure Triage',
  'Yes! When multiple adjacent streetlights fail simultaneously, it usually indicates an electrical circuit breaker or underground feeder cable fault rather than individual bulbs. Note "Corridor failure" in the description so electrical grid teams are assigned.',
  24
)
ON CONFLICT (id) DO NOTHING;
