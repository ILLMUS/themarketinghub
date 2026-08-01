-- 1. Add the slug column as nullable first to prevent errors
ALTER TABLE categories ADD COLUMN IF NOT EXISTS slug TEXT UNIQUE;

-- 2. Cleanly populate existing categories with URL-friendly slugs
UPDATE categories 
SET slug = CASE 
  WHEN name = 'Real Estate' THEN 'property'
  WHEN name = 'Livestock' THEN 'pets'
  WHEN name = 'Vehicles' THEN 'vehicles'
  WHEN name = 'Jobs' THEN 'jobs'
  WHEN name = 'Services' THEN 'services'
  ELSE LOWER(REGEXP_REPLACE(name, '[^a-zA-Z0-9]+', '-', 'g')) -- Automates slugging for any others!
END;

-- 3. Make the column NOT NULL so all future categories must have a slug
ALTER TABLE categories ALTER COLUMN slug SET NOT NULL;