INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Mens Clothing','Men''s fashion','Shirt'),
('Womens Clothing','Women''s fashion','Shirt'),
('Kids Clothing','Children''s clothing','Shirt'),
('Shoes','All footwear','Shirt'),
('Handbags','Ladies handbags','ShoppingBag'),
('Watches','Fashion watches','Watch'),
('Jewellery','Jewellery','Gem'),
('Hats & Caps','Headwear','Hat'),
('Sportswear','Athletic clothing','Shirt'),
('Traditional Wear','Cultural clothing','Shirt')
) AS x(name,description,icon)
WHERE categories.name='Clothing';