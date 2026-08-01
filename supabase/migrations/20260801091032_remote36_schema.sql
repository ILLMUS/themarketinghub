SELECT
    c.name,
    COUNT(*)
FROM public.categories c
LEFT JOIN public.subcategories s
ON s.category_id = c.id
GROUP BY c.name
ORDER BY c.name;