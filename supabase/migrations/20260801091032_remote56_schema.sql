-- 1. Create ad_positions table
CREATE TABLE IF NOT EXISTS public.ad_positions (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL,
  code TEXT UNIQUE NOT NULL,
  description TEXT,
  width INT,
  height INT,
  active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Insert your required placement positions
INSERT INTO public.ad_positions (name, code, description)
VALUES 
  ('Homepage - Below Categories', 'home_after_categories', 'Banner displayed directly below category chips on homepage'),
  ('Homepage - Before Featured', 'home_before_featured', 'Banner displayed right above featured listings'),
  ('Category Pages - Below Header', 'category_header', 'Banner displayed below the category page header')
ON CONFLICT (code) DO NOTHING;

-- 3. Update ad_campaigns table to align with AdvertisingService schema
ALTER TABLE public.ad_campaigns 
  ADD COLUMN IF NOT EXISTS company_name TEXT NOT NULL DEFAULT 'Advertiser',
  ADD COLUMN IF NOT EXISTS description TEXT,
  ADD COLUMN IF NOT EXISTS position_id UUID REFERENCES public.ad_positions(id) ON DELETE CASCADE,
  ADD COLUMN IF NOT EXISTS active BOOLEAN DEFAULT true,
  ADD COLUMN IF NOT EXISTS created_by UUID,
  ADD COLUMN IF NOT EXISTS approved_by UUID,
  ADD COLUMN IF NOT EXISTS updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- 4. Enable RLS on ad_positions
ALTER TABLE public.ad_positions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Public users can view active positions" 
ON public.ad_positions FOR SELECT 
USING (active = true);

CREATE POLICY "Admins full access ad_positions" 
ON public.ad_positions FOR ALL 
USING (true);