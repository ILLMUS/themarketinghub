INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Makeup','Cosmetics','Heart'),
('Skincare','Skin care','Heart'),
('Hair Products','Hair care','Scissors'),
('Hair Extensions','Extensions and wigs','Scissors'),
('Salon Equipment','Salon furniture','Scissors'),
('Barber Equipment','Barber supplies','Scissors'),
('Nail Supplies','Nail products','Heart'),
('Spa Equipment','Spa products','Heart'),
('Supplements','Health supplements','Heart'),
('Personal Care','Daily care products','Heart')
) AS x(name,description,icon)
WHERE categories.name='Health & Beauty';
