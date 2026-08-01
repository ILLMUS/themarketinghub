INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Mens Perfumes','Fragrances for men','Sparkles'),
('Womens Perfumes','Fragrances for women','Sparkles'),
('Unisex Perfumes','Unisex fragrances','Sparkles'),
('Body Sprays','Body sprays','Sparkles'),
('Perfume Oils','Long-lasting oils','Sparkles'),
('Gift Sets','Perfume gift sets','Gift')
) AS x(name,description,icon)
WHERE categories.name='Perfumes';