INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Event Planning','Professional event planners','Calendar'),
('Wedding Services','Wedding planning and supplies','Heart'),
('Photography','Photography and videography','Camera'),
('Music & DJs','DJs, bands and music services','Music'),
('Party Supplies','Decorations and party items','Gift'),
('Venues','Event venues and halls','Building'),
('Sound & Lighting','PA systems and lighting','Speaker'),
('Catering','Food and catering services','Utensils'),
('Equipment Hire','Tables, tents and equipment rental','Package'),
('Entertainment','MCs, comedians and performers','Star')
) AS x(name,description,icon)
WHERE categories.name='Entertainment/Events';