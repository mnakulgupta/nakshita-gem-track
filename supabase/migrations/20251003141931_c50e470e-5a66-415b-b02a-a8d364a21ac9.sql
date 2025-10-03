-- Create enum for user roles
CREATE TYPE public.app_role AS ENUM ('admin', 'sales', 'production_manager', 'designer', 'workshop');

-- Create enum for inquiry status
CREATE TYPE public.inquiry_status AS ENUM ('pending', 'in_review', 'continued', 'cancelled', 'in_design', 'production_ready', 'in_production', 'completed');

-- Create enum for product categories
CREATE TYPE public.product_category AS ENUM ('kundan', 'diamond', 'gold', 'silver', 'platinum', 'custom');

-- Create profiles table
CREATE TABLE public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create user_roles table
CREATE TABLE public.user_roles (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  role app_role NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (user_id, role)
);

-- Create product_categories_config table
CREATE TABLE public.product_categories_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category product_category NOT NULL UNIQUE,
  display_name TEXT NOT NULL,
  default_stages TEXT[] DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Create inquiries table with image support
CREATE TABLE public.inquiries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  inquiry_id TEXT NOT NULL UNIQUE,
  client_name TEXT NOT NULL,
  client_email TEXT,
  client_phone TEXT,
  reference_image_url TEXT,
  product_category product_category,
  quantity INTEGER NOT NULL DEFAULT 1,
  metal_details TEXT,
  polish_color TEXT,
  due_date DATE,
  special_instructions TEXT,
  sales_person_id UUID REFERENCES auth.users(id),
  pm_review_status inquiry_status NOT NULL DEFAULT 'pending',
  cancellation_reason TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_roles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.product_categories_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.inquiries ENABLE ROW LEVEL SECURITY;

-- Create security definer function for role checking
CREATE OR REPLACE FUNCTION public.has_role(_user_id UUID, _role app_role)
RETURNS BOOLEAN
LANGUAGE SQL
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.user_roles
    WHERE user_id = _user_id AND role = _role
  )
$$;

-- RLS Policies for profiles
CREATE POLICY "Users can view their own profile"
  ON public.profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  USING (auth.uid() = id);

-- RLS Policies for user_roles
CREATE POLICY "Users can view their own roles"
  ON public.user_roles FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Admins can manage all roles"
  ON public.user_roles FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for product_categories_config
CREATE POLICY "Everyone can view categories"
  ON public.product_categories_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage categories"
  ON public.product_categories_config FOR ALL
  USING (public.has_role(auth.uid(), 'admin'));

-- RLS Policies for inquiries
CREATE POLICY "Sales can view all inquiries"
  ON public.inquiries FOR SELECT
  USING (public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'production_manager'));

CREATE POLICY "Sales can create inquiries"
  ON public.inquiries FOR INSERT
  WITH CHECK (public.has_role(auth.uid(), 'sales') OR public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Production managers can update inquiries"
  ON public.inquiries FOR UPDATE
  USING (public.has_role(auth.uid(), 'production_manager') OR public.has_role(auth.uid(), 'admin'));

-- Create trigger function for updated_at
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for updated_at
CREATE TRIGGER update_profiles_updated_at
  BEFORE UPDATE ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_inquiries_updated_at
  BEFORE UPDATE ON public.inquiries
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create trigger for new user profiles
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, full_name)
  VALUES (
    NEW.id,
    NEW.email,
    COALESCE(NEW.raw_user_meta_data->>'full_name', '')
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user();

-- Insert default product categories
INSERT INTO public.product_categories_config (category, display_name, default_stages) VALUES
  ('kundan', 'Kundan', ARRAY['design', 'wax_modeling', 'casting', 'kundan_setting', 'meenakari', 'polishing', 'quality_check']),
  ('diamond', 'Diamond', ARRAY['design', 'wax_modeling', 'casting', 'stone_setting', 'polishing', 'rhodium', 'quality_check']),
  ('gold', 'Gold', ARRAY['design', 'casting', 'polishing', 'hallmarking', 'quality_check']),
  ('silver', 'Silver', ARRAY['design', 'casting', 'polishing', 'oxidation', 'quality_check']),
  ('platinum', 'Platinum', ARRAY['design', 'casting', 'stone_setting', 'polishing', 'quality_check']),
  ('custom', 'Custom', ARRAY['design', 'production', 'quality_check']);

-- Create storage bucket for inquiry images
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'inquiry-images',
  'inquiry-images',
  true,
  20971520, -- 20MB
  ARRAY['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif']
);

-- Storage policies for inquiry images
CREATE POLICY "Authenticated users can upload inquiry images"
  ON storage.objects FOR INSERT
  WITH CHECK (
    bucket_id = 'inquiry-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Everyone can view inquiry images"
  ON storage.objects FOR SELECT
  USING (bucket_id = 'inquiry-images');

CREATE POLICY "Users can update their own inquiry images"
  ON storage.objects FOR UPDATE
  USING (
    bucket_id = 'inquiry-images' AND
    auth.role() = 'authenticated'
  );

CREATE POLICY "Admins can delete inquiry images"
  ON storage.objects FOR DELETE
  USING (
    bucket_id = 'inquiry-images' AND
    (public.has_role(auth.uid(), 'admin') OR public.has_role(auth.uid(), 'production_manager'))
  );