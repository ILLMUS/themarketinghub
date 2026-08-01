SELECT
c.name,
COUNT(s.id)
FROM categories c
LEFT JOIN subcategories s
ON c.id=s.category_id
GROUP BY c.name
ORDER BY c.name;