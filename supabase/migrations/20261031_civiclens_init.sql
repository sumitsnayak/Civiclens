-- CivicLens Supabase Schema & Security Migration
-- Version: 1.0.0
-- Description: Core tables, RLS policies, trigger-based profile creation, and demo data for CivicLens

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
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    resolved_at TIMESTAMPTZ
);

-- 4. Report Updates / Timeline table
CREATE TABLE IF NOT EXISTS public.report_updates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    actor_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    previous_status TEXT,
    new_status TEXT NOT NULL,
    public_message TEXT,
    internal_note TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now())
);

-- 5. Report Upvotes / Confirmations
CREATE TABLE IF NOT EXISTS public.report_upvotes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    report_id UUID NOT NULL REFERENCES public.reports(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT timezone('utc'::text, now()),
    UNIQUE(report_id, user_id)
);

-- 6. Indexes for high performance
CREATE INDEX IF NOT EXISTS idx_reports_category ON public.reports(category);
CREATE INDEX IF NOT EXISTS idx_reports_status ON public.reports(status);
CREATE INDEX IF NOT EXISTS idx_reports_severity ON public.reports(severity);
CREATE INDEX IF NOT EXISTS idx_reports_created_at ON public.reports(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_reports_user_id ON public.reports(user_id);
CREATE INDEX IF NOT EXISTS idx_reports_coordinates ON public.reports(latitude, longitude);
CREATE INDEX IF NOT EXISTS idx_report_updates_report_id ON public.report_updates(report_id);
CREATE INDEX IF NOT EXISTS idx_report_upvotes_user_id ON public.report_upvotes(user_id);

-- 7. Trigger to automatically handle profile creation on auth.users sign-up
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, display_name, role)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'display_name', split_part(NEW.email, '@', 1)),
        'citizen' -- Always default to citizen; role elevation must be performed via admin authority
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- 8. Row Level Security (RLS)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_updates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.report_upvotes ENABLE ROW LEVEL SECURITY;

-- Helper function to check if current user is admin
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS BOOLEAN AS $$
BEGIN
    RETURN EXISTS (
        SELECT 1 FROM public.profiles
        WHERE id = auth.uid() AND role = 'admin'
    );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Profiles Policies
CREATE POLICY "Public profiles are viewable by everyone"
    ON public.profiles FOR SELECT
    USING (true);

CREATE POLICY "Users can update their own profile"
    ON public.profiles FOR UPDATE
    USING (auth.uid() = id)
    WITH CHECK (auth.uid() = id AND role = (SELECT role FROM public.profiles WHERE id = auth.uid())); -- Prevent self role elevation

-- Reports Policies
CREATE POLICY "Public reports are viewable by all users"
    ON public.reports FOR SELECT
    USING (true);

CREATE POLICY "Citizens can insert their own reports"
    ON public.reports FOR INSERT
    WITH CHECK (auth.uid() = user_id OR auth.uid() IS NULL);

CREATE POLICY "Citizens can update their own pending reports"
    ON public.reports FOR UPDATE
    USING (auth.uid() = user_id AND status = 'reported')
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Admins have full update access to reports"
    ON public.reports FOR ALL
    USING (public.is_admin());

-- Report Updates Policies
CREATE POLICY "Public can view updates with public messages"
    ON public.report_updates FOR SELECT
    USING (public_message IS NOT NULL OR public.is_admin());

CREATE POLICY "Admins can insert and manage report updates"
    ON public.report_updates FOR ALL
    USING (public.is_admin());

-- Upvotes Policies
CREATE POLICY "Anyone can view upvote counts"
    ON public.report_upvotes FOR SELECT
    USING (true);

CREATE POLICY "Authenticated users can toggle their own upvotes"
    ON public.report_upvotes FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upvotes"
    ON public.report_upvotes FOR DELETE
    USING (auth.uid() = user_id);

-- Storage bucket configuration instructions:
-- Bucket name: report-images (Public)
-- Max file size: 5MB
-- Allowed MIME types: image/jpeg, image/png, image/webp
