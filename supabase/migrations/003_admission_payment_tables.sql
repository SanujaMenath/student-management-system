CREATE TABLE IF NOT EXISTS public.admissions (
  id BIGSERIAL PRIMARY KEY,
  child_name TEXT NOT NULL,
  date_of_birth DATE NOT NULL,
  program TEXT NOT NULL,
  parent_name TEXT NOT NULL,
  parent_phone TEXT NOT NULL,
  parent_email TEXT,
  status TEXT NOT NULL DEFAULT 'Pending Review', -- 'Pending Review', 'Interview Scheduled', 'Approved', 'Rejected'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.fee_payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id UUID REFERENCES public.students(id) ON DELETE SET NULL,
  amount NUMERIC(10, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'paid', -- 'paid', 'pending', 'overdue'
  billing_month TEXT NOT NULL,         -- e.g., 'March 2025'
  payment_date TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS public.events (
  id BIGSERIAL PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  start_time TIME NOT NULL DEFAULT '09:00:00',
  location TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'Academic',
  created_at TIMESTAMPTZ DEFAULT NOW()
);


ALTER TABLE public.admissions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fee_payments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admin full access to admissions" ON public.admissions
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Admin full access to fee_payments" ON public.fee_payments
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'staff'));

CREATE POLICY "Admin full access to events" ON public.events
  FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'staff'));