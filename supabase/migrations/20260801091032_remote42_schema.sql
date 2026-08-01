CREATE POLICY "Public can view campaigns"

ON public.ad_campaigns

FOR SELECT

USING (active = true);