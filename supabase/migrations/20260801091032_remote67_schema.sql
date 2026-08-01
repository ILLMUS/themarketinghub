-- 1. Create the 'banners' table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.banners (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    title TEXT NOT NULL,
    image_url TEXT NOT NULL,
    target_url TEXT DEFAULT '#',
    position TEXT NOT NULL DEFAULT 'home_top',
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2. If the table already existed, ensure all missing columns are added
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS position TEXT NOT NULL DEFAULT 'home_top';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS target_url TEXT DEFAULT '#';
ALTER TABLE public.banners ADD COLUMN IF NOT EXISTS is_active BOOLEAN DEFAULT true;

-- 3. Enable Row-Level Security (RLS)
ALTER TABLE public.banners ENABLE ROW LEVEL SECURITY;

-- 4. Set RLS Policies so everyone can see banners, but authenticated users can create/delete them
DROP POLICY IF EXISTS "Public Read Banners" ON public.banners;
CREATE POLICY "Public Read Banners" ON public.banners FOR SELECT USING (true);

DROP POLICY IF EXISTS "Authenticated Manage Banners" ON public.banners;
CREATE POLICY "Authenticated Manage Banners" ON public.banners 
FOR ALL TO authenticated USING (true) WITH CHECK (true);

-- 5. Reload Schema Cache for Supabase API
NOTIFY pgrst, 'reload schema';