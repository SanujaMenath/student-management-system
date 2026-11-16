-- Create payment status and payment method types
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_status') THEN
    CREATE TYPE public.payment_status AS ENUM ('pending', 'paid', 'failed', 'refunded');
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'payment_method') THEN
    CREATE TYPE public.payment_method AS ENUM ('card', 'bank_transfer', 'cash', 'online_gateway');
  END IF;
END$$;

-- Fee Payments Table
CREATE TABLE IF NOT EXISTS public.fee_invoices (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  invoice_number TEXT UNIQUE NOT NULL, -- e.g. INV-2026-1001
  student_id UUID NOT NULL REFERENCES public.students(id) ON DELETE CASCADE,
  term TEXT NOT NULL,                  -- 'Term 1', 'Term 2', 'Term 3'
  billing_month TEXT NOT NULL,         -- 'March 2026'
  amount NUMERIC(10, 2) NOT NULL,
  amount_paid NUMERIC(10, 2) NOT NULL DEFAULT 0.00,
  due_date DATE NOT NULL,
  status public.payment_status NOT NULL DEFAULT 'pending',
  payment_method public.payment_method,
  reference_no TEXT,                   -- Bank receipt 
  paid_at TIMESTAMPTZ,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.fee_invoices ENABLE ROW LEVEL SECURITY;

--  Policies
DROP POLICY IF EXISTS "Admins and Staff full access to fee_invoices" ON public.fee_invoices;
CREATE POLICY "Admins and Staff full access to fee_invoices"
  ON public.fee_invoices FOR ALL TO authenticated
  USING ((SELECT role FROM public.profiles WHERE id = auth.uid()) IN ('admin', 'staff'));

-- Parents can view only invoices for their children
DROP POLICY IF EXISTS "Parents can view own child invoices" ON public.fee_invoices;
CREATE POLICY "Parents can view own child invoices"
  ON public.fee_invoices FOR SELECT TO authenticated
  USING (
    student_id IN (
      SELECT id FROM public.students WHERE parent_id = auth.uid()
    )
  );


DROP POLICY IF EXISTS "Public can read invoice for direct payment" ON public.fee_invoices;
CREATE POLICY "Public can read invoice for direct payment"
  ON public.fee_invoices FOR SELECT TO anon
  USING (true);


