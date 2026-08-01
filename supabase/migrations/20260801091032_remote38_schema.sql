CREATE TABLE public.ad_positions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    name TEXT NOT NULL,

    code TEXT NOT NULL UNIQUE,

    description TEXT,

    width INTEGER,

    height INTEGER,

    active BOOLEAN DEFAULT true,

    created_at TIMESTAMPTZ DEFAULT now()
);