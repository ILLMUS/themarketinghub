INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Houses for Sale','Residential homes','Home'),
('Houses for Rent','Rental homes','Home'),
('Apartments','Apartments and flats','Building'),
('Commercial Property','Commercial buildings','Building2'),
('Land','Residential and commercial land','Map'),
('Farms','Agricultural farms','Trees'),
('Warehouses','Industrial storage','Warehouse'),
('Office Space','Office rentals','Building')
) AS x(name,description,icon)
WHERE categories.name='Real Estate';