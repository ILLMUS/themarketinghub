drop function if exists get_nearby_listings(double precision, double precision, double precision);

create or replace function get_nearby_listings(
  user_lat double precision,
  user_lng double precision,
  max_distance_meters double precision default 50000
)
returns table (
  listing jsonb,
  distance_km double precision
)
language sql
security definer
as $$
  select 
    to_jsonb(l.*) as listing,
    round((st_distance(
      l.location, 
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography
    ) / 1000)::numeric, 1) as distance_km
  from listings l
  where l.location is not null
    and st_dwithin(
      l.location, 
      st_setsrid(st_makepoint(user_lng, user_lat), 4326)::geography, 
      max_distance_meters
    )
  order by distance_km asc;
$$;