-- Check columns on the profiles table
select column_name, data_type 
from information_schema.columns 
where table_schema = 'public' 
  and table_name = 'profiles';

-- Check if you have a user_roles table or enum roles set up
select column_name, data_type 
from information_schema.columns 
where table_schema = 'public' 
  and table_name = 'user_roles';