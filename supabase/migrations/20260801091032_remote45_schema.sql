CREATE POLICY "Admins manage campaigns"

ON public.ad_campaigns

FOR ALL

USING (
    public.has_role(auth.uid(), 'admin')
)

WITH CHECK (
    public.has_role(auth.uid(), 'admin')
);