INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Seeds','Seeds','Leaf'),
('Fertilizers','Fertilizers','Leaf'),
('Farm Machinery','Farm machinery','Tractor'),
('Produce','Fresh produce','Apple'),
('Irrigation','Irrigation systems','Droplets'),
('Greenhouses','Greenhouses','Trees'),
('Garden Equipment','Garden tools','Shovel'),
('Farm Chemicals','Agricultural chemicals','FlaskConical')
) AS x(name,description,icon)
WHERE categories.name='Agriculture';