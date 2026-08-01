-- 1. Clean up potential duplicate text id vs uuid entries safely
DELETE FROM categories 
WHERE id IN ('property', 'sale', 'pets') 
   OR LOWER(name) IN ('property', 'for sale', 'pets & livestock');

-- 2. Inject clean rows that match your marketplaceCategories.ts strings exactly
INSERT INTO categories (id, name) VALUES
('property', 'Property'),
('sale', 'For Sale'),
('pets', 'Pets & Livestock');