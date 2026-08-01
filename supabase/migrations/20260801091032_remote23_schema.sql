INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('CCTV Cameras','Surveillance cameras','Camera'),
('Alarm Systems','Home and business alarms','Shield'),
('Electric Fence','Electric fencing','Shield'),
('Gate Motors','Automatic gates','Cog'),
('Intercom Systems','Audio and video intercoms','Phone'),
('Access Control','Access control systems','Key'),
('Biometric Systems','Fingerprint and facial access','Fingerprint'),
('Fire Equipment','Fire extinguishers','Flame'),
('Security Lighting','Flood lights','Lightbulb'),
('Security Services','Private security','Shield')
) AS x(name,description,icon)
WHERE categories.name='Security Equipment';