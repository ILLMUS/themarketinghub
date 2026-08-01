INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Building Materials','General materials','Hammer'),
('Steel','Steel products','Hammer'),
('Roofing','Roofing materials','Hammer'),
('Cement','Cement','Hammer'),
('Bricks','Bricks','Hammer'),
('Sand','Building sand','Hammer'),
('Paint','Paint products','Paintbrush'),
('Plumbing','Pipes and fittings','Wrench'),
('Electrical','Electrical supplies','Zap'),
('Power Tools','Power tools','Drill'),
('Hand Tools','Hand tools','Hammer'),
('Heavy Equipment','Construction machinery','Truck')
) AS x(name,description,icon)
WHERE categories.name='Construction';