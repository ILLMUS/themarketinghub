-- 1. Create the 'banners' storage bucket (Public)
INSERT INTO storage.buckets (id, name, public)
VALUES ('banners', 'banners', true)
ON CONFLICT (id) DO NOTHING;

-- 2. Allow public access to view banner images
CREATE POLICY "Public Banner Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'banners');

-- 3. Allow authenticated users/admins to upload banner images
CREATE POLICY "Authenticated Banner Upload"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (bucket_id = 'banners');

-- 4. Allow authenticated users/admins to delete banner images
CREATE POLICY "Authenticated Banner Delete"
ON storage.objects FOR DELETE
TO authenticated
USING (bucket_id = 'banners');