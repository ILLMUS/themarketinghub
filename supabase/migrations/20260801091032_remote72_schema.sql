alter table public.ad_campaigns 
add column if not exists status text default 'active',
add column if not exists end_date timestamp with time zone;