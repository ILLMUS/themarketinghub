INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Mobile Phones','Smartphones and feature phones','Smartphone'),
('Phone Accessories','Cases, chargers and accessories','Smartphone'),
('Laptops','Laptops and notebooks','Laptop'),
('Desktop Computers','Desktop PCs','Monitor'),
('Tablets','Android and iPad tablets','Tablet'),
('Gaming Consoles','PlayStation, Xbox and Nintendo','Gamepad2'),
('Televisions','LED, OLED and Smart TVs','Tv'),
('Cameras','Digital and DSLR cameras','Camera'),
('Printers','Printers and scanners','Printer'),
('Networking','Routers and networking equipment','Router'),
('Audio Equipment','Speakers and sound systems','Speaker'),
('Computer Accessories','Keyboards, mouse and storage','Mouse')
) AS x(name,description,icon)
WHERE categories.name='Electronics';