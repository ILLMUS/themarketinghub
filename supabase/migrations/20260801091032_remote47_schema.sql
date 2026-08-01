CREATE POLICY "Everyone can view ad positions"

ON public.ad_positions

FOR SELECT

USING (true);