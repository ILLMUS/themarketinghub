CREATE POLICY "Banner images are public"

ON storage.objects

FOR SELECT

USING (bucket_id = 'banner-images');