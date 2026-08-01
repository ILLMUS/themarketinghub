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