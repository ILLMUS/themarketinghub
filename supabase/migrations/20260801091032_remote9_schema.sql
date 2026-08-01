CREATE POLICY "Subcategories viewable by everyone"
ON public.subcategories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage subcategories"
ON public.subcategories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));