-- 1. Add the geography column if it doesn't exist
alter table public.advertisements 
add column if not exists coordinates geography(POINT, 4326);

-- 2. Populate it using your existing lat and lng columns (assuming they are numeric/float)
update public.advertisements 
set coordinates = st_point(lng, lat)::geography 
where lat is not null and lng is not null;

-- 3. Create the RPC function
create or replace function get_nearby_ads(buyer_lat float, buyer_lng float)
returns table (
  id uuid,
  title text,
  price numeric,
  location text,
  distance_km float
)
language sql
as $$
  select 
    id,
    title,
    price,
    location,
    (st_distance(coordinates, st_point(buyer_lng, buyer_lat)::geography) / 1000) as distance_km
  from public.advertisements
  where coordinates is not null
  order by coordinates <-> st_point(buyer_lng, buyer_lat)::geography;
$$;