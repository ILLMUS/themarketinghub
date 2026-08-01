CREATE TABLE public.subcategories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    category_id UUID NOT NULL
        REFERENCES public.categories(id)
        ON DELETE CASCADE,

    name TEXT NOT NULL,

    description TEXT,

    icon TEXT,

    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE public.subcategories
ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Subcategories viewable by everyone"
ON public.subcategories
FOR SELECT
USING (true);

CREATE POLICY "Admins can manage subcategories"
ON public.subcategories
FOR ALL
USING (public.has_role(auth.uid(), 'admin'));