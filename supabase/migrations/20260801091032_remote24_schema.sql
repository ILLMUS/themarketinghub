INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Living Room','Sofas and lounges','Sofa'),
('Bedroom','Beds and wardrobes','Bed'),
('Dining Room','Dining tables','Utensils'),
('Office Furniture','Office desks','Briefcase'),
('Kitchen Furniture','Kitchen cabinets','Home'),
('Outdoor Furniture','Garden furniture','TreePine'),
('TV Stands','Entertainment units','Tv'),
('Shelving','Storage shelves','Package'),
('Chairs','All chairs','Armchair'),
('Tables','Coffee and dining tables','Table')
) AS x(name,description,icon)
WHERE categories.name='Furniture';