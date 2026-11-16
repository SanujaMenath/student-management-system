-- 1. Create Announcements Table
CREATE TABLE IF NOT EXISTS public.announcements (
  id TEXT PRIMARY KEY, -- e.g. ANN-001
  title TEXT NOT NULL,
  category TEXT NOT NULL DEFAULT 'General', -- e.g. 'Event reminder', 'Academic', 'Holiday'
  content TEXT NOT NULL,
  target_class TEXT DEFAULT 'All Classes',
  published_by TEXT DEFAULT 'Administration',
  published_at TIMESTAMPTZ DEFAULT NOW(),
  is_important BOOLEAN DEFAULT false
);

-- 2. Enable Row Level Security (RLS)
ALTER TABLE public.announcements ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
DROP POLICY IF EXISTS "Authenticated users can view announcements" ON public.announcements;
CREATE POLICY "Authenticated users can view announcements"
  ON public.announcements FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can manage announcements" ON public.announcements;
CREATE POLICY "Admins can manage announcements"
  ON public.announcements FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- 4. Seed Initial Data
INSERT INTO public.announcements (id, title, category, content, target_class, published_at, is_important)
VALUES
  ('ANN-001', 'Little Artists'' Day — Materials Checklist', 'Event reminder', 'Please send your child with an apron and a small water bottle for Saturday''s Little Artists'' Day activities at the Activity Hall.', 'Bright Beginners', NOW() - INTERVAL '1 day', true),
  ('ANN-002', 'Term 1 Fee Payment Reminder', 'Finance', 'Kindly note that Term 1 fee balances are due by 28 March. Receipts can be uploaded via the Fees & payments section.', 'All Classes', NOW() - INTERVAL '3 days', false),
  ('ANN-003', 'New Tracing Worksheets Available', 'Learning update', 'Letters A–D tracing sheets have been uploaded to the Learning Management portal for home practice.', 'Bright Beginners', NOW() - INTERVAL '5 days', false)
ON CONFLICT (id) DO NOTHING;