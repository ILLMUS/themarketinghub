CREATE POLICY "Admins update banner images"

ON storage.objects

FOR UPDATE

USING (
    bucket_id = 'banner-images'
    AND public.has_role(auth.uid(),'admin')
);