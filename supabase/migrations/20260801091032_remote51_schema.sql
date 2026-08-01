CREATE POLICY "Admins delete banner images"

ON storage.objects

FOR DELETE

USING (
    bucket_id = 'banner-images'
    AND public.has_role(auth.uid(),'admin')
);