create table public.advertisements (
  id uuid primary key default gen_random_uuid(),
  title text not null,
  price numeric not null,
  location text,
  -- PostGIS geography point (Longitude first, Latitude second)
  coordinates geography(POINT, 4326) 
);