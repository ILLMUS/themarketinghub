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