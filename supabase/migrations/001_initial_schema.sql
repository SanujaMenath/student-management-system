-- Role Enum (safe if already exists)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'user_role') THEN
    CREATE TYPE public.user_role AS ENUM ('admin', 'staff', 'parent');
  END IF;
END$$;

-- User Profiles Table
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  role public.user_role NOT NULL DEFAULT 'parent',
  full_name TEXT NOT NULL DEFAULT 'New User',
  email TEXT NOT NULL UNIQUE,
  phone TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- RLS Policies for Profiles
DROP POLICY IF EXISTS "Public profiles are viewable by authenticated users" ON public.profiles;
CREATE POLICY "Public profiles are viewable by authenticated users"
  ON public.profiles FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Users can update their own profile" ON public.profiles;
CREATE POLICY "Users can update their own profile"
  ON public.profiles FOR UPDATE
  TO authenticated
  USING (auth.uid() = id);

-- Trigger Function with explicit search_path and conflict handling
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger 
LANGUAGE plpgsql 
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, full_name, email, role)
  VALUES (
    new.id,
    COALESCE(new.raw_user_meta_data->>'full_name', 'New User'),
    new.email,
    COALESCE((new.raw_user_meta_data->>'role')::public.user_role, 'parent'::public.user_role)
  )
  ON CONFLICT (id) DO NOTHING;
  RETURN new;
EXCEPTION
  WHEN others THEN
    RAISE LOG 'Error in handle_new_user: %', SQLERRM;
    RETURN new;
END;
$$;

-- Re-attach trigger safely
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE PROCEDURE public.handle_new_user();