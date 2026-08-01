INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Full-Time Jobs','Permanent employment','Briefcase'),
('Part-Time Jobs','Part-time employment','Clock'),
('Remote Jobs','Work from home opportunities','Laptop'),
('Internships','Internship opportunities','GraduationCap'),
('Freelance','Freelance projects','User'),
('Government Jobs','Public sector employment','Building'),
('Hospitality Jobs','Hotels and restaurants','Utensils'),
('Construction Jobs','Construction employment','Hammer'),
('Driver Jobs','Driving opportunities','Truck'),
('Domestic Jobs','Housekeeping and caregiving','Home')
) AS x(name,description,icon)
WHERE categories.name='Jobs';