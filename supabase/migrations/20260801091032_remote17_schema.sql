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