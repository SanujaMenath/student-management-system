-- Drop the old conflicting events table
DROP TABLE IF EXISTS public.events CASCADE;

-- Create Enum for Event Statuses if not already present
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_type WHERE typname = 'event_status') THEN
    CREATE TYPE public.event_status AS ENUM (
      'Parents notified',
      'Scheduled',
      'Draft',
      'Planning'
    );
  END IF;
END$$;

-- Create Events Table with the full schema
CREATE TABLE public.events (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  event_date DATE NOT NULL,
  event_time TEXT NOT NULL DEFAULT '9:00 AM',
  location TEXT NOT NULL,
  status public.event_status NOT NULL DEFAULT 'Draft',
  description TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE public.events ENABLE ROW LEVEL SECURITY;

-- Set RLS Policies
DROP POLICY IF EXISTS "Authenticated users can view events" ON public.events;
CREATE POLICY "Authenticated users can view events"
  ON public.events FOR SELECT
  TO authenticated
  USING (true);

DROP POLICY IF EXISTS "Admins can modify events" ON public.events;
CREATE POLICY "Admins can modify events"
  ON public.events FOR ALL
  TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE profiles.id = auth.uid() AND profiles.role = 'admin'
    )
  );

-- Insert Seed Data
INSERT INTO public.events (id, title, event_date, event_time, location, status)
VALUES
  ('EVT-032', 'Little Artists'' Day', '2025-03-22', '9:00 AM', 'Activity hall', 'Parents notified'),
  ('EVT-033', 'Family Sports Morning', '2025-04-05', '8:30 AM', 'Community grounds', 'Scheduled'),
  ('EVT-034', 'New Parent Orientation', '2025-04-19', '10:00 AM', 'Main classroom', 'Draft'),
  ('EVT-035', 'Vesak Creative Day', '2025-05-09', '9:00 AM', 'Institute grounds', 'Planning')
ON CONFLICT (id) DO NOTHING;