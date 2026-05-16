CREATE TYPE public.ad_tier AS ENUM ('e250', 'e350', 'e500');

ALTER TABLE public.advertisements
  ADD COLUMN tier public.ad_tier NOT NULL DEFAULT 'e250';

CREATE INDEX idx_advertisements_tier_status ON public.advertisements(tier, status, created_at DESC);