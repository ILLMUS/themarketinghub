-- Create ad-banners storage bucket
INSERT INTO storage.buckets (id, name, public) 
VALUES ('ad-banners', 'ad-banners', true)
ON CONFLICT (id) DO NOTHING;

-- Allow public read access to uploaded images
CREATE POLICY "Public Read Access" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'ad-banners');

-- Allow anyone/authenticated to upload images
CREATE POLICY "Public Upload Access" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'ad-banners');