DELETE FROM public.subcategories a
USING public.subcategories b
WHERE a.id > b.id
AND a.category_id = b.category_id
AND a.name = b.name;