INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Ladies Bales','Women''s bales','ShoppingBag'),
('Mens Bales','Men''s bales','ShoppingBag'),
('Kids Bales','Children''s bales','ShoppingBag'),
('Shoes','Imported shoes','Shirt'),
('Handbags','Imported handbags','ShoppingBag'),
('Blankets','Blankets','Package'),
('Jackets','Winter jackets','Shirt'),
('Mixed Bales','Mixed clothing','ShoppingBag')
) AS x(name,description,icon)
WHERE categories.name='Fashion Dopha/Bales';