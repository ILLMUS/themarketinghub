-- 1. Remove open public upload access policy
DROP POLICY IF EXISTS "Public Upload Access" ON storage.objects;

-- 2. Allow ONLY authenticated admins to upload images to 'ad-banners'
CREATE POLICY "Admin Upload Access"
ON storage.objects FOR INSERT
TO authenticated
WITH CHECK (
  bucket_id = 'ad-banners' AND
  (auth.jwt() -> 'app_metadata' ->> 'role') = 'admin'
  -- Note: Adjust the check above if your app tracks admins differently 
  -- (e.g. via raw_user_meta_data or a public.profiles table lookup)
);

-- 3. Ensure anyone can still VIEW banners on the site
CREATE POLICY "Public Read Access"
ON storage.objects FOR SELECT
USING (bucket_id = 'ad-banners');