-- Create Banners table
create table public.banners (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  image_url text not null,
  target_url text,
  is_active boolean default true,
  created_at timestamp with time zone default timezone('utc'::text, now())
);

-- Enable Row Level Security (RLS)
alter table public.banners enable row level security;

-- Allow anyone to read active banners
create policy "Allow public read active banners"
  on public.banners for select
  using (is_active = true);