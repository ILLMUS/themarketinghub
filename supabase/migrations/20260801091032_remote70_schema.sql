alter table public.banners 
add column category_id uuid references public.categories(id) on delete set null;