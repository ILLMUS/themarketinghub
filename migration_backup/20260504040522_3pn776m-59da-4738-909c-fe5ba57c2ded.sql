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


INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Cars','Sedans and hatchbacks','Car'),
('SUVs','Sport utility vehicles','Car'),
('Bakkies','Pickup trucks','Truck'),
('Vans','Passenger and cargo vans','Truck'),
('Trucks','Heavy trucks','Truck'),
('Motorcycles','Motorbikes','Bike'),
('Tractors','Agricultural tractors','Tractor'),
('Trailers','Utility and cargo trailers','Trailer'),
('Vehicle Parts','Spare parts','Settings'),
('Tyres','Tyres','Circle'),
('Rims','Alloy and steel rims','Circle'),
('Car Audio','Speakers and radios','Speaker'),
('Vehicle Accessories','Accessories','Package')
) AS x(name,description,icon)
WHERE categories.name='Vehicles';


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


INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Cattle','Beef and dairy cattle','Beef'),
('Goats','Goats for farming','Beef'),
('Sheep','Sheep and lambs','Beef'),
('Pigs','Pigs and piglets','Beef'),
('Chickens','Layers and broilers','Bird'),
('Ducks','Domestic ducks','Bird'),
('Rabbits','Rabbits','Rabbit'),
('Horses','Horses and ponies','Horse'),
('Animal Feed','Livestock feed','Package'),
('Veterinary Supplies','Animal health products','Heart')
) AS x(name,description,icon)
WHERE categories.name='Livestock';


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


INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Living Room','Sofas and lounges','Sofa'),
('Bedroom','Beds and wardrobes','Bed'),
('Dining Room','Dining tables','Utensils'),
('Office Furniture','Office desks','Briefcase'),
('Kitchen Furniture','Kitchen cabinets','Home'),
('Outdoor Furniture','Garden furniture','TreePine'),
('TV Stands','Entertainment units','Tv'),
('Shelving','Storage shelves','Package'),
('Chairs','All chairs','Armchair'),
('Tables','Coffee and dining tables','Table')
) AS x(name,description,icon)
WHERE categories.name='Furniture';



INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Mens Clothing','Men''s fashion','Shirt'),
('Womens Clothing','Women''s fashion','Shirt'),
('Kids Clothing','Children''s clothing','Shirt'),
('Shoes','All footwear','Shirt'),
('Handbags','Ladies handbags','ShoppingBag'),
('Watches','Fashion watches','Watch'),
('Jewellery','Jewellery','Gem'),
('Hats & Caps','Headwear','Hat'),
('Sportswear','Athletic clothing','Shirt'),
('Traditional Wear','Cultural clothing','Shirt')
) AS x(name,description,icon)
WHERE categories.name='Clothing';



INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Ladies Bales','Women''s bales','ShoppingBag'),
('Mens Bales','Men''s bales','ShoppingBag'),
('Kids Bales','Children''s bales','ShoppingBag'),
('Shoes','Imported shoes','Shirt'),
('Handbags','Imported handbags','ShoppingBag'),
('Blankets','Blankets','Package'),
('Jackets','Winter jackets','Shirt'),
('Mixed Bales','Mixed clothing','ShoppingBag')
) AS x(name,description,icon)
WHERE categories.name='Fashion Dopha/Bales';



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



INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Cleaning Services','Home and office cleaning','Sparkles'),
('IT Services','Computer and technology services','Laptop'),
('Marketing','Advertising and digital marketing','Megaphone'),
('Printing','Printing and branding services','Printer'),
('Legal Services','Lawyers and legal consultants','Scale'),
('Accounting','Bookkeeping and accounting','Calculator'),
('Consulting','Business consulting','Briefcase'),
('Repair Services','General repairs and maintenance','Wrench'),
('Transport Services','Passenger and delivery services','Truck'),
('Education & Training','Tutoring and professional training','GraduationCap')
) AS x(name,description,icon)
WHERE categories.name='Services';



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




INSERT INTO public.subcategories (category_id, name, description, icon)
SELECT id, x.name, x.description, x.icon
FROM public.categories,
(
VALUES
('Personal Loans','Personal loan providers','Wallet'),
('Business Loans','Business financing','Briefcase'),
('Microfinance','Microfinance institutions','Coins'),
('Vehicle Finance','Car financing','Car'),
('Home Loans','Mortgage providers','Home'),
('Insurance','Insurance products','Shield'),
('Investment Services','Investment opportunities','TrendingUp'),
('Savings & Credit','Savings groups and SACCOs','PiggyBank'),
('Financial Advisors','Financial planning experts','Calculator'),
('Grants','Business and personal grants','BadgeDollarSign')
) AS x(name,description,icon)
WHERE categories.name='Loans & Financing';



