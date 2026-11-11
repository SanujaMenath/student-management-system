-- 1. Create Enums for Staff Status and Role
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'staff_status') THEN
    CREATE TYPE public.staff_status AS ENUM ('Active', 'On leave', 'Inactive');
  END IF;
END$$;

-- 2. Create Staff Table
CREATE TABLE IF NOT EXISTS public.staff (
  id TEXT PRIMARY KEY, -- e.g. STF-018
  full_name TEXT NOT NULL,
  role TEXT NOT NULL,
  assigned_class TEXT,
  contact TEXT NOT NULL,
  status public.staff_status NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.staff ENABLE ROW LEVEL SECURITY;

-- 4. RLS Policies
DROP POLICY IF EXISTS "Authenticated users can view staff" ON public.staff;
CREATE POLICY "Authenticated users can view staff"
  ON public.staff FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can modify staff" ON public.staff;
CREATE POLICY "Admins can modify staff"
  ON public.staff FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 5. Seed Initial Data (Matching Figma UI)
INSERT INTO public.staff (id, full_name, role, assigned_class, contact, status)
VALUES
  ('STF-018', 'Dilani Fernando', 'Class Teacher', 'Bright Beginners', '077 234 5678', 'Active'),
  ('STF-014', 'Madhavi Silva', 'Class Teacher', 'Little Explorers', '071 455 8920', 'Active'),
  ('STF-011', 'Sachini Perera', 'Teaching Assistant', 'School Ready', '076 381 4421', 'Active'),
  ('STF-006', 'Ruwan Jayasena', 'Administrator', '—', '075 229 1840', 'On leave')
ON CONFLICT (id) DO NOTHING;