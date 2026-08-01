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