
-- 1. Classes Table
CREATE TABLE IF NOT EXISTS public.classes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,                      -- e.g., 'Toddler Joy', 'Playgroup Sun'
  room_number TEXT,
  capacity INTEGER NOT NULL DEFAULT 20,
  age_group TEXT,
  schedule TEXT DEFAULT '8:00 AM – 12:00 PM',
  teacher_id TEXT REFERENCES public.staff(id) ON DELETE SET NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);


ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS age_group TEXT,
  ADD COLUMN IF NOT EXISTS schedule TEXT DEFAULT '8:00 AM – 12:00 PM';

-- Ensure teacher_id uses TEXT referencing public.staff(id) rather than legacy UUID
DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'classes'
      AND column_name = 'teacher_id'
      AND data_type = 'uuid'
  ) THEN
    ALTER TABLE public.classes DROP COLUMN teacher_id;
  END IF;
END$$;

ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS teacher_id TEXT REFERENCES public.staff(id) ON DELETE SET NULL;

-- 2. Students Table
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_number TEXT UNIQUE NOT NULL,   -- e.g., 'HDH-2026-001'
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,                    -- 'Male', 'Female'
  blood_group TEXT,
  allergies TEXT,
  emergency_contact TEXT NOT NULL,
  class_id BIGINT REFERENCES public.classes(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Active',   -- 'Active', 'Inactive', 'Graduated'
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Enable Row Level Security (RLS)
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.students ENABLE ROW LEVEL SECURITY;

-- 4. Clean Up Legacy / Duplicate Policies
DROP POLICY IF EXISTS "Admins and Staff have full access to classes" ON public.classes;
DROP POLICY IF EXISTS "Admins and Staff have full access to students" ON public.students;

-- 5. Classes Policies
DROP POLICY IF EXISTS "Authenticated can view classes" ON public.classes;
CREATE POLICY "Authenticated can view classes"
  ON public.classes FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admin manage classes" ON public.classes;
CREATE POLICY "Admin manage classes"
  ON public.classes FOR ALL
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 6. Admissions Policies (Public website form submission)
DROP POLICY IF EXISTS "Public can submit admissions" ON public.admissions;
CREATE POLICY "Public can submit admissions"
  ON public.admissions FOR INSERT
  TO anon, authenticated
  WITH CHECK (status = 'Pending Review');

-- 7. Students Policies
DROP POLICY IF EXISTS "Admin and staff manage students" ON public.students;
CREATE POLICY "Admin and staff manage students"
  ON public.students FOR ALL
  TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'staff'))
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Parents view own children" ON public.students;
CREATE POLICY "Parents view own children"
  ON public.students FOR SELECT
  TO authenticated
  USING (parent_id = auth.uid());