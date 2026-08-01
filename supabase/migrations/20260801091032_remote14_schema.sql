INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT
    c.id,
    s.name,
    s.description,
    s.icon
FROM public.categories c
CROSS JOIN (
VALUES
('Mobile Phones','Smartphones and feature phones','Smartphone'),
('Phone Accessories','Cases, chargers, earphones and accessories','Smartphone'),
('Laptops','Laptops and notebooks','Laptop'),
('Desktop Computers','Desktop PCs and workstations','Monitor'),
('Tablets','Android and iPad tablets','Tablet'),
('Gaming Consoles','PlayStation, Xbox, Nintendo and more','Gamepad2'),
('Televisions','LED, OLED and Smart TVs','Tv'),
('Cameras','Digital and DSLR cameras','Camera'),
('Printers','Printers and scanners','Printer'),
('Networking','Routers, switches and Wi-Fi equipment','Router'),
('Audio Equipment','Speakers, amplifiers and sound systems','Speaker'),
('Computer Accessories','Keyboards, mice, monitors and storage','Mouse')
) AS s(name,description,icon)
WHERE c.name='Electronics';