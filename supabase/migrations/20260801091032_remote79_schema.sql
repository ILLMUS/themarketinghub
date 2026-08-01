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
  order bty coordinates <-> st_point(buyer_lng, buyer_lat)::geography;
$$;