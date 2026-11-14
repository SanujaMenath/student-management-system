-- 1. Classes (skipped if it already exists)
CREATE TABLE IF NOT EXISTS public.classes (
  id BIGSERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  room_number TEXT,
  capacity INTEGER NOT NULL DEFAULT 20,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Extra columns needed by the Classes page
ALTER TABLE public.classes
  ADD COLUMN IF NOT EXISTS age_group TEXT,
  ADD COLUMN IF NOT EXISTS schedule TEXT DEFAULT '8:00 AM – 12:00 PM',
  ADD COLUMN IF NOT EXISTS teacher_id TEXT REFERENCES public.staff(id) ON DELETE SET NULL;

-- 2. Students (skipped if it already exists)
CREATE TABLE IF NOT EXISTS public.students (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  admission_number TEXT UNIQUE NOT NULL,
  first_name TEXT NOT NULL,
  last_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  gender TEXT NOT NULL,
  blood_group TEXT,
  allergies TEXT,
  emergency_contact TEXT NOT NULL,
  class_id BIGINT REFERENCES public.classes(id) ON DELETE SET NULL,
  parent_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'Active',
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. Classes policies
ALTER TABLE public.classes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view classes" ON public.classes;
CREATE POLICY "Authenticated can view classes" ON public.classes
  FOR SELECT TO authenticated USING (true);

DROP POLICY IF EXISTS "Admin manage classes" ON public.classes;
CREATE POLICY "Admin manage classes" ON public.classes
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin')
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) = 'admin');

-- 4. Admissions: public website form may submit, but only as "Pending Review"
DROP POLICY IF EXISTS "Public can submit admissions" ON public.admissions;
CREATE POLICY "Public can submit admissions" ON public.admissions
  FOR INSERT TO anon, authenticated
  WITH CHECK (status = 'Pending Review');

-- 5. Students: staff keep full access, parents see only their own children
DROP POLICY IF EXISTS "Admin and staff manage students" ON public.students;
CREATE POLICY "Admin and staff manage students" ON public.students
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'staff'))
  WITH CHECK ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'staff'));

DROP POLICY IF EXISTS "Parents view own children" ON public.students;
CREATE POLICY "Parents view own children" ON public.students
  FOR SELECT TO authenticated USING (parent_id = auth.uid());