SELECT
    s.name,
    COUNT(*)
FROM public.subcategories s
JOIN public.categories c
ON c.id = s.category_id
WHERE c.name = 'Electronics'
GROUP BY s.name
HAVING COUNT(*) > 1;