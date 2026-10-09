-- Store ratings used by the "Rate my store" modal and the Store rating row.
-- Run once in the Supabase SQL editor.

create table if not exists public.store_ratings (
  id         uuid primary key default gen_random_uuid(),
  seller_id  uuid not null,
  rater_id   uuid not null default auth.uid(),
  rating     smallint not null check (rating between 1 and 5),
  created_at timestamptz not null default now(),
  unique (seller_id, rater_id)
);

alter table public.store_ratings enable row level security;

-- Everyone can see ratings
create policy "ratings are public"
  on public.store_ratings for select
  using (true);

-- Signed-in people can rate a store (never their own)
create policy "rate a store"
  on public.store_ratings for insert
  with check (auth.uid() = rater_id and rater_id <> seller_id);

-- People can change their own rating
create policy "update own rating"
  on public.store_ratings for update
  using (auth.uid() = rater_id)
  with check (auth.uid() = rater_id and rater_id <> seller_id);
