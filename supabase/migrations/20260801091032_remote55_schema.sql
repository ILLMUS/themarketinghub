-- 1. Add the avatar_url column if it doesn't exist
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS avatar_url text;

-- 2. Add location column if it doesn't exist either
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS location text;

-- 3. Force Supabase PostgREST schema cache to reload immediately
NOTIFY pgrst, 'reload schema';