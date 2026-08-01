CREATE POLICY "Admins upload banner images"

ON storage.objects

FOR INSERT

WITH CHECK (
    bucket_id = 'banner-images'
    AND public.has_role(auth.uid(),'admin')
);