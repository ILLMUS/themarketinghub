-- 1. Enable the PostGIS extension if not already enabled
create extension if not exists postgis;

-- 2. Add latitude and longitude columns to your listings table
alter table listings 
add column if not exists latitude double precision,
add column if not exists longitude double precision,
add column if not exists location geography(Point, 4326);

-- 3. Create an automatic trigger function to sync lat/lng into the PostGIS geography point
create or replace function update_listing_location()
returns trigger as $$
begin
  if new.latitude is not null and new.longitude is not null then
    new.location := st_setsrid(st_makepoint(new.longitude, new.latitude), 4326)::geography;
  end if;
  return new;
end;
$$ language plpgsql;

-- 4. Attach the trigger to your listings table
drop trigger if exists tr_update_listing_location on listings;
create trigger tr_update_listing_location
  before insert or update of latitude, longitude on listings
  for each row
  execute function update_listing_location();