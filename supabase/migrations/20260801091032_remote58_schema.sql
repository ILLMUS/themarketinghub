create type ad_placement as enum ('hero_banner', 'in_between_sections', 'sidebar', 'footer_banner');

create table public.ad_banners (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  image_url text not null,
  link_url text,
  placement ad_placement not null default 'in_between_sections',
  is_active boolean default true,
  impressions_count integer default 0,
  clicks_count integer default 0,
  start_date timestamp with time zone default timezone('utc'::text, now()),
  end_date timestamp with time zone,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable RLS
alter table public.ad_banners enable row level security;

-- Public can view active banners
create policy "Active banners are viewable by everyone" on public.ad_banners
  for select using (is_active = true and (end_date is null or end_date >= now()));

-- Only admins can manage banners
create policy "Admins can manage banners" on public.ad_banners
  for all using (auth.role() = 'authenticated' and exists (
    select 1 from profiles where id = auth.uid() and is_admin = true
  ));