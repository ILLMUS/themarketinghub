-- Create the ad_campaigns table if it doesn't exist
CREATE TABLE IF NOT EXISTS public.ad_campaigns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title TEXT NOT NULL,
  image_url TEXT NOT NULL,
  target_url TEXT,
  position TEXT DEFAULT 'homepage_banner',
  status TEXT DEFAULT 'active',
  start_date TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()),
  end_date TIMESTAMP WITH TIME ZONE,
  impressions INT DEFAULT 0,
  clicks INT DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
ALTER TABLE public.ad_campaigns ENABLE ROW LEVEL SECURITY;

-- Allow public read access (so visitors can view active banners)
CREATE POLICY "Allow public read access" 
  ON public.ad_campaigns 
  FOR SELECT 
  USING (true);

-- Allow authenticated users / admin to insert and update campaigns
CREATE POLICY "Allow write access for authenticated users" 
  ON public.ad_campaigns 
  FOR ALL 
  TO authenticated 
  USING (true);
  