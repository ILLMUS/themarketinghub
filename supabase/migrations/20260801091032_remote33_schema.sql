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