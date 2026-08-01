CREATE TABLE public.ad_campaigns (

    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),

    company_name TEXT NOT NULL,

    title TEXT NOT NULL,

    description TEXT,

    banner_image TEXT NOT NULL,

    destination_url TEXT,

    whatsapp TEXT,

    position_id UUID
        REFERENCES public.ad_positions(id),

    start_date TIMESTAMPTZ NOT NULL,

    end_date TIMESTAMPTZ NOT NULL,

    active BOOLEAN DEFAULT true,

    created_by UUID
        REFERENCES auth.users(id),

    approved_by UUID
        REFERENCES auth.users(id),

    created_at TIMESTAMPTZ DEFAULT now(),

    updated_at TIMESTAMPTZ DEFAULT now()
);