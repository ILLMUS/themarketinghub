create or replace function get_nearby_listings(
  user_lat double precision,
  user_lng double precision,
  max_distance_meters double precision default 50000
)
returns table (
  id uuid,
  title text,
  category_id text,
  latitude double precision,
  longitude double precision,
  distance_km double precision
)
language sql
security definer
as $$
  select 
    id,
    title,
    category_id,
    latitude,
    longitude,
    round((st_distance(
      location, 
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography
    ) / 1000)::numeric, 1) as distance_km
  from listings
  where location is not null
    and st_dwithin(
      location, 
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography, 
      max_distance_meters
    )
  order by distance_km asc;
$$;