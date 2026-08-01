-- 1. Add the missing is_admin column to profiles
alter table public.profiles 
add column if not exists is_admin boolean default false;

-- 2. Grant admin access to your specific account (replace with your user ID or email lookup)
update public.profiles 
set is_admin = true 
where id = 'YOUR_USER_UUID_HERE';