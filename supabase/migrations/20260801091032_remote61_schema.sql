-- 1. Create Enum for placement options
create type ad_placement as enum ('hero_banner', 'in_between_sections', 'sidebar', 'footer_banner');

-- 2. Create the ad_banners table
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

-- 3. Enable Row Level Security (RLS)
alter table public.ad_banners enable row level security;

-- 4. Public Policy: Anyone can read active banners
create policy "Active banners are viewable by everyone" 
  on public.ad_banners
  for select 
  using (
    is_active = true 
    and (end_date is null or end_date >= now())
  );

-- 5. Admin Policy: Matches your user_roles schema
create policy "Admins can manage banners" 
  on public.ad_banners
  for all 
  using (
    auth.role() = 'authenticated' 
    and exists (
      select 1 from public.user_roles 
      where user_roles.user_id = auth.uid() 
        and user_roles.role::text = 'admin'
    )
  );
  