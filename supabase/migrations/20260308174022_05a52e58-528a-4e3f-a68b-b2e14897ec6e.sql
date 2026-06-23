
-- Create app_role enum
CREATE TYPE public.app_role AS ENUM ('admin', 'user');

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  role app_role NOT NULL,
  UNIQUE (user_id, role)
);
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;

-- Security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.user_roles WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS for user_roles
CREATE POLICY "Users can view their own roles" ON public.user_roles
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Admins can manage roles" ON public.user_roles
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL UNIQUE,
  name TEXT NOT NULL,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Profiles viewable by everyone" ON public.profiles FOR SELECT USING (true);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Create categories table
CREATE TABLE public.categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  description TEXT,
  icon TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.categories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Categories viewable by everyone" ON public.categories FOR SELECT USING (true);
CREATE POLICY "Admins can manage categories" ON public.categories
  FOR ALL USING (public.has_role(auth.uid(), 'admin'));

-- Create ad_status enum
CREATE TYPE public.ad_status AS ENUM ('pending_payment', 'pending_approval', 'approved', 'rejected');

-- Create advertisements table
CREATE TABLE public.advertisements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  price NUMERIC(12,2) NOT NULL,
  category_id UUID REFERENCES public.categories(id) NOT NULL,
  location TEXT NOT NULL,
  seller_name TEXT NOT NULL,
  phone TEXT NOT NULL,
  email TEXT NOT NULL,
  images TEXT[] DEFAULT '{}',
  status ad_status NOT NULL DEFAULT 'pending_payment',
  is_featured BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);
ALTER TABLE public.advertisements ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Approved ads viewable by everyone" ON public.advertisements
  FOR SELECT USING (status = 'approved' OR auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Users can insert own ads" ON public.advertisements
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own ads" ON public.advertisements
  FOR UPDATE USING (auth.uid() = user_id OR public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins can delete ads" ON public.advertisements
  FOR DELETE USING (public.has_role(auth.uid(), 'admin'));

-- Timestamp trigger function
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();
CREATE TRIGGER update_advertisements_updated_at BEFORE UPDATE ON public.advertisements
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (user_id, name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'name', NEW.email));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- Storage bucket for ad images
INSERT INTO storage.buckets (id, name, public) VALUES ('ad-images', 'ad-images', true);

CREATE POLICY "Ad images publicly accessible" ON storage.objects
  FOR SELECT USING (bucket_id = 'ad-images');
CREATE POLICY "Authenticated users can upload ad images" ON storage.objects
  FOR INSERT WITH CHECK (bucket_id = 'ad-images' AND auth.role() = 'authenticated');
CREATE POLICY "Users can update own ad images" ON storage.objects
  FOR UPDATE USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);
CREATE POLICY "Users can delete own ad images" ON storage.objects
  FOR DELETE USING (bucket_id = 'ad-images' AND auth.uid()::text = (storage.foldername(name))[1]);

-- Seed default categories
INSERT INTO public.categories (name, description, icon) VALUES
  ('Electronics', 'Phones, computers, gadgets and more', 'Smartphone'),
  ('Vehicles', 'Cars, trucks, motorcycles and parts', 'Car'),
  ('Property', 'Houses, apartments, land and commercial property', 'Home'),
  ('Construction', 'Building materials, tools and equipment', 'Hammer'),
  ('Security Equipment', 'CCTV, alarms, access control', 'Shield'),
  ('Furniture', 'Home and office furniture', 'Sofa'),
  ('Clothing', 'Fashion, shoes and accessories', 'Shirt'),
  ('Services', 'Professional and personal services', 'Briefcase'),
  ('Jobs', 'Employment opportunities and listings', 'Users');
