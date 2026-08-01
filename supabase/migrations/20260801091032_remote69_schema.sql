create table if not exists auth_popups (
  id uuid default gen_random_uuid() primary key,
  device_token text unique not null,
  seen_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table auth_popups enable row level security;

create policy "Allow public insert tracking" on auth_popups
  for insert with check (true);

create policy "Allow public select tracking" on auth_popups
  for select using (true);